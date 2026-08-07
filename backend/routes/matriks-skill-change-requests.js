const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const MatriksSkillChangeRequest = require("../models/MatriksSkillChangeRequest");
const MatriksSkillDepartment = require("../models/MatriksSkillDepartment");
const router = express.Router();

async function applyApprovedMatriksDepartmentChanges(request) {
    try {
        const deptChange = request.proposedData?.departmentData;
        if (!deptChange || !deptChange.action) return;

        if (deptChange.action === "add") {
            const existing = await MatriksSkillDepartment.findOne({ bagianId: deptChange.bagianId });

            if (existing && existing.deletedAt) {
                existing.deletedAt = null;
                existing.name = deptChange.name;
                existing.color = deptChange.color || "bg-slate-500";
                existing.borderColor = deptChange.borderColor || "#64748b";
                existing.iconColor = deptChange.iconColor || "#64748b";
                await existing.save();
                console.log(`✅ Matriks Skill Department "${deptChange.name}" di-restore dari soft-delete`);
            } else if (!existing) {
                const count = await MatriksSkillDepartment.countDocuments();
                await MatriksSkillDepartment.create({
                    bagianId: deptChange.bagianId,
                    name: deptChange.name,
                    color: deptChange.color || "bg-slate-500",
                    borderColor: deptChange.borderColor || "#64748b",
                    iconColor: deptChange.iconColor || "#64748b",
                    order: count + 1,
                    isCustom: true,
                });
                console.log(`✅ Matriks Skill Department "${deptChange.name}" ditambahkan permanen`);
            } else {
                console.log(`ℹ️ Matriks Skill Department "${deptChange.bagianId}" sudah ada dan aktif, dilewati`);
            }
        } else if (deptChange.action === "rename") {
            await MatriksSkillDepartment.findOneAndUpdate(
                { bagianId: deptChange.bagianId },
                { $set: { name: deptChange.newName } }
            );
            console.log(`✅ Matriks Skill Department "${deptChange.bagianId}" di-rename jadi "${deptChange.newName}"`);
        } else if (deptChange.action === "delete") {
            await MatriksSkillDepartment.findOneAndUpdate(
                { bagianId: deptChange.bagianId },
                { $set: { deletedAt: new Date() } }
            );
            console.log(`✅ Matriks Skill Department "${deptChange.bagianId}" dihapus (soft-delete)`);
        }
    } catch (err) {
        console.error("⚠️ Failed to apply Matriks Skill department changes:", err);
    }
}

const getDepartmentApprovalPermission = (departmentName) => {
    const mapping = {
        "Finance": "Manager Finance Approval",
        "Finance Department": "Manager Finance Approval",
        "HRGA & IT": "Manager HRGA & IT Approval",
        "HRGA & IT Department": "Manager HRGA & IT Approval",
        "Management Development": "Manager Management Development Approval",
        "Management Representative": "Manager Management Representative Approval",
        "Manufacturing Battery": "Manager Manufacturing Battery Approval",
        "Manufacturing Cable": "Manager Manufacturing Cable Approval",
        "Marketing Battery": "Manager Marketing Battery Approval",
        "Marketing Battery Department": "Manager Marketing Battery Approval",
        "Marketing Engineering": "Manager Marketing Engineering Approval",
        "MI & SHE": "Manager MI & SHE Approval",
        "PPIC": "Manager PPIC Approval",
        "Purchasing": "Manager Purchasing Approval",
        "Quality Assurance": "Manager QA Approval",
        "QA Department": "Manager QA Approval",
    };
    return mapping[departmentName] || null;
};

const isUserManager = (userPermissions) => {
    return userPermissions.some(
        (perm) => perm.startsWith("Manager") && perm.endsWith("Approval")
    );
};

router.get("/approved-data", auth, async (req, res) => {
    try {
        const approvedRequests = await MatriksSkillChangeRequest.find(
            { status: "approved" },
            { department: 1, proposedData: 1, approvedAt: 1 }
        ).sort({ approvedAt: -1 });
        const latestPerDept = {};
        for (const req of approvedRequests) {
            const deptId = req.proposedData?.deptId;
            if (deptId && !latestPerDept[deptId]) {
                latestPerDept[deptId] = {
                    deptId,
                    department: req.department,
                    matriksData: req.proposedData.matriksData,
                    approvedAt: req.approvedAt,
                };
            }
        }

        res.json({ success: true, data: Object.values(latestPerDept) });
    } catch (error) {
        console.error("Error fetching approved matriks data:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

router.get("/", auth, async (req, res) => {
    try {
        const { status } = req.query;
        const userPermissions = req.user.role?.permissions || [];

        const filter = {};
        if (status) filter.status = status;

        const departmentApprovalPermissions = userPermissions.filter(
            (p) => p.startsWith("Manager") && p.endsWith("Approval")
        );

        const canSeeAllRequests = userPermissions.includes("Manage Users");
        const hasDirectorApproval = userPermissions.includes("SO Changes Director Approval");
        const hasAnyApprovalPermission = departmentApprovalPermissions.length > 0;

        if (!canSeeAllRequests) {
            if (hasDirectorApproval) {
                filter.$or = [
                    { requestedBy: req.user.id },
                    { status: { $in: ["pending", "waiting_director_approval"] } },
                    { firstApprovedBy: req.user.id },
                    { secondApprovedBy: req.user.id },
                    { approvedBy: req.user.id },
                    { reviewedBy: req.user.id },
                ];
            } else if (hasAnyApprovalPermission) {
                const approvalDepartments = departmentApprovalPermissions
                    .map((perm) => {
                        const match = perm.match(/Manager (.+) Approval/);
                        if (match) {
                            const deptName = match[1];
                            const deptMapping = {
                                "Finance": "Finance",
                                "HRGA & IT": "HRGA & IT",
                                "Management Development": "Management Development",
                                "Management Representative": "Management Representative",
                                "Manufacturing Battery": "Manufacturing Battery",
                                "Manufacturing Cable": "Manufacturing Cable",
                                "Marketing Battery": "Marketing Battery",
                                "Marketing Engineering": "Marketing Engineering",
                                "MI & SHE": "MI & SHE",
                                "PPIC": "PPIC",
                                "Purchasing": "Purchasing",
                                "QA": "Quality Assurance",
                            };
                            return deptMapping[deptName] || deptName;
                        }
                        return null;
                    })
                    .filter(Boolean);
                filter.$or = [
                    { requestedBy: req.user.id },
                    { department: { $in: approvalDepartments } },
                    { firstApprovedBy: req.user.id },
                    { secondApprovedBy: req.user.id },
                    { approvedBy: req.user.id },
                    { reviewedBy: req.user.id },
                ];
            } else {
                filter.requestedBy = req.user.id;
            }
        }

        const requests = await MatriksSkillChangeRequest.find(filter)
            .populate({
                path: "requestedBy",
                select: "name email department role",
                populate: {
                    path: "role",
                    select: "name permissions",
                },
            })
            .populate("reviewedBy", "name email")
            .populate("firstApprovedBy", "name email")
            .populate("secondApprovedBy", "name email")
            .populate("approvedBy", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error("Error fetching Matriks Skill change requests:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// GET single request by ID
router.get("/:id", auth, async (req, res) => {
    try {
        const request = await MatriksSkillChangeRequest.findById(req.params.id)
            .populate({
                path: "requestedBy",
                select: "name email department role",
                populate: { path: "role", select: "name permissions" },
            })
            .populate("reviewedBy", "name email")
            .populate("firstApprovedBy", "name email")
            .populate("secondApprovedBy", "name email")
            .populate("approvedBy", "name email");

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        const userPermissions = req.user.role?.permissions || [];
        const canViewAll = userPermissions.includes("Manage Users");
        const hasDirectorApproval = userPermissions.includes("SO Changes Director Approval");
        const requiredPermission = getDepartmentApprovalPermission(request.department);
        const canApproveThisDept = requiredPermission && userPermissions.includes(requiredPermission);

        if (
            request.requestedBy._id.toString() !== req.user.id &&
            !canViewAll &&
            !canApproveThisDept &&
            !hasDirectorApproval
        ) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        res.json({ success: true, data: request });
    } catch (error) {
        console.error("Error fetching Matriks Skill change request:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// POST create new request
router.post(
    "/",
    [
        auth,
        body("title").notEmpty().withMessage("Title is required"),
        body("description").notEmpty().withMessage("Description is required"),
        body("changeType")
            .isIn(["update", "add", "delete", "department-add", "department-rename", "department-delete"])
            .withMessage("Invalid change type"),
        body("proposedData").notEmpty().withMessage("Proposed data is required"),
        body("department").notEmpty().withMessage("Department is required"),
    ],
    async (req, res) => {
        try {
            const userPermissions = req.user.role?.permissions || [];
            const hasMatriksRequest = userPermissions.includes("Matriks Skill Editor");
            const hasDepartmentApproval = userPermissions.some(
                (perm) => perm.startsWith("Manager") && perm.endsWith("Approval")
            );
            const canManageUsers = userPermissions.includes("Manage Users");

            if (!hasMatriksRequest && !hasDepartmentApproval && !canManageUsers) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to submit Matriks Skill changes",
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: "Validation errors", errors: errors.array() });
            }

            const { title, description, changeType, proposedData, currentData, priority, department } = req.body;

            const changeRequest = new MatriksSkillChangeRequest({
                title,
                description,
                changeType,
                proposedData,
                currentData: currentData || null,
                priority: priority || "medium",
                requestedBy: req.user.id,
                department,
            });

            await changeRequest.save();

            const populatedRequest = await MatriksSkillChangeRequest.findById(changeRequest._id).populate(
                "requestedBy",
                "name email department"
            );

            res.status(201).json({
                success: true,
                message: "Matriks Skill change request submitted successfully",
                data: populatedRequest,
            });
        } catch (error) {
            console.error("Error creating Matriks Skill change request:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }
);

// PUT approve
router.put("/:id/approve", auth, async (req, res) => {
    try {
        const userPermissions = req.user.role?.permissions || [];
        const request = await MatriksSkillChangeRequest.findById(req.params.id).populate({
            path: "requestedBy",
            select: "name email department role",
            populate: { path: "role", select: "name permissions" },
        });

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (!["pending", "waiting_director_approval"].includes(request.status)) {
            return res.status(400).json({ success: false, message: `Cannot approve request with status: ${request.status}` });
        }

        if (request.requestedBy._id.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: "You cannot approve your own request" });
        }

        const requiredPermission = getDepartmentApprovalPermission(request.department);
        const isManagerApprover = requiredPermission && userPermissions.includes(requiredPermission);
        const isDirectorApprover = userPermissions.includes("SO Changes Director Approval");
        const canApproveAll = userPermissions.includes("Manage Users");

        if (!isManagerApprover && !isDirectorApprover && !canApproveAll) {
            return res.status(403).json({
                success: false,
                message: `You do not have permission to approve Matriks Skill changes for ${request.department}`,
            });
        }

        const now = new Date();
        const requesterPermissions = request.requestedBy?.role?.permissions || [];
        const isRequesterManager = requesterPermissions.some(
            (perm) => perm.startsWith("Manager") && perm.endsWith("Approval")
        );

        if (!isRequesterManager) {
            // Regular employee request
            if (request.status === "pending") {
                if (isManagerApprover || canApproveAll) {
                    // Manager approves → move to waiting_director_approval
                    request.firstApprovedBy = req.user.id;
                    request.firstApprovedAt = now;
                    request.status = "waiting_director_approval";
                    request.reviewComments = req.body.reviewComments || "";
                } else if (isDirectorApprover) {
                    return res.status(403).json({
                        success: false,
                        message: "Director cannot approve at pending stage for employee requests. Manager must approve first.",
                    });
                }
            } else if (request.status === "waiting_director_approval") {
                if (isDirectorApprover || canApproveAll) {
                    // Director gives final approval
                    request.secondApprovedBy = req.user.id;
                    request.secondApprovedAt = now;
                    request.status = "approved";
                    request.approvedBy = req.user.id;
                    request.approvedAt = now;
                    request.reviewComments = req.body.reviewComments || request.reviewComments || "";
                } else {
                    return res.status(403).json({
                        success: false,
                        message: "Only Director can give final approval",
                    });
                }
            }
        } else {
            // Manager's own request → requires direct Director approval
            if (request.status === "pending") {
                if (isDirectorApprover || canApproveAll) {
                    request.firstApprovedBy = req.user.id;
                    request.firstApprovedAt = now;
                    request.secondApprovedBy = req.user.id;
                    request.secondApprovedAt = now;
                    request.status = "approved";
                    request.approvedBy = req.user.id;
                    request.approvedAt = now;
                    request.reviewComments = req.body.reviewComments || "";
                } else {
                    return res.status(403).json({
                        success: false,
                        message: "Only Director can approve Manager's request",
                    });
                }
            }
        }

        await request.save();

        if (request.status === "approved") {
            await applyApprovedMatriksDepartmentChanges(request);
        }

        const populatedRequest = await MatriksSkillChangeRequest.findById(request._id)
            .populate({ path: "requestedBy", select: "name email department role", populate: { path: "role", select: "name permissions" } })
            .populate("reviewedBy", "name email")
            .populate("firstApprovedBy", "name email")
            .populate("secondApprovedBy", "name email")
            .populate("approvedBy", "name email");

        res.json({
            success: true,
            message: request.status === "approved" ? "Matriks Skill change request approved and data updated" : "First approval recorded. Waiting for Director approval.",
            data: populatedRequest,
        });
    } catch (error) {
        console.error("Error approving Matriks Skill change request:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// PUT reject
router.put(
    "/:id/reject",
    [auth, body("reviewComments").notEmpty().withMessage("Review comments are required for rejection")],
    async (req, res) => {
        try {
            const userPermissions = req.user.role?.permissions || [];
            const request = await MatriksSkillChangeRequest.findById(req.params.id).populate({
                path: "requestedBy",
                select: "name email department role",
                populate: { path: "role", select: "name permissions" },
            });

            if (!request) {
                return res.status(404).json({ success: false, message: "Request not found" });
            }

            if (!["pending", "waiting_director_approval"].includes(request.status)) {
                return res.status(400).json({ success: false, message: `Cannot reject request with status: ${request.status}` });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: "Validation errors", errors: errors.array() });
            }

            const requiredPermission = getDepartmentApprovalPermission(request.department);
            const isManagerApprover = requiredPermission && userPermissions.includes(requiredPermission);
            const isDirectorApprover = userPermissions.includes("SO Changes Director Approval");
            const canRejectAll = userPermissions.includes("Manage Users");

            if (!isManagerApprover && !isDirectorApprover && !canRejectAll) {
                return res.status(403).json({
                    success: false,
                    message: `You do not have permission to reject Matriks Skill changes for ${request.department}`,
                });
            }

            const now = new Date();
            const requesterPermissions = request.requestedBy?.role?.permissions || [];
            const isRequesterManager = requesterPermissions.some(
                (perm) => perm.startsWith("Manager") && perm.endsWith("Approval")
            );

            if (!isRequesterManager) {
                if (request.status === "pending") {
                    if (!isManagerApprover && !canRejectAll && !isDirectorApprover) {
                        return res.status(403).json({ success: false, message: "No permission to reject" });
                    }
                    request.firstApprovedBy = req.user.id;
                    request.firstApprovedAt = now;
                    request.status = "rejected";
                    request.reviewedBy = req.user.id;
                    request.reviewedAt = now;
                    request.reviewComments = req.body.reviewComments;
                } else if (request.status === "waiting_director_approval") {
                    if (!isDirectorApprover && !canRejectAll) {
                        return res.status(403).json({ success: false, message: "Only Director can reject at this stage" });
                    }
                    request.secondApprovedBy = req.user.id;
                    request.secondApprovedAt = now;
                    request.status = "rejected";
                    request.reviewedBy = req.user.id;
                    request.reviewedAt = now;
                    request.reviewComments = (request.reviewComments ? request.reviewComments + "\n" : "") + "Director rejection: " + req.body.reviewComments;
                }
            } else {
                if (request.status === "pending") {
                    if (!isDirectorApprover && !canRejectAll) {
                        return res.status(403).json({ success: false, message: "Only Director can reject Manager's request" });
                    }
                    request.firstApprovedBy = req.user.id;
                    request.firstApprovedAt = now;
                    request.status = "rejected";
                    request.reviewedBy = req.user.id;
                    request.reviewedAt = now;
                    request.reviewComments = req.body.reviewComments;
                }
            }

            await request.save();

            const populatedRequest = await MatriksSkillChangeRequest.findById(request._id)
                .populate({ path: "requestedBy", select: "name email department role", populate: { path: "role", select: "name permissions" } })
                .populate("reviewedBy", "name email")
                .populate("firstApprovedBy", "name email")
                .populate("secondApprovedBy", "name email")
                .populate("approvedBy", "name email");

            res.json({ success: true, message: "Matriks Skill change request rejected", data: populatedRequest });
        } catch (error) {
            console.error("Error rejecting Matriks Skill change request:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }
);

// PUT revisi
router.put(
    "/:id/revisi",
    [auth, body("reviewComments").notEmpty().withMessage("Review comments are required for revision")],
    async (req, res) => {
        try {
            const userPermissions = req.user.role?.permissions || [];
            const request = await MatriksSkillChangeRequest.findById(req.params.id);

            if (!request) {
                return res.status(404).json({ success: false, message: "Request not found" });
            }

            const requiredPermission = getDepartmentApprovalPermission(request.department);
            const isManagerApprover = requiredPermission && userPermissions.includes(requiredPermission);
            const isDirectorApprover = userPermissions.includes("SO Changes Director Approval");
            const canRevisiAll = userPermissions.includes("Manage Users");

            if (!isManagerApprover && !isDirectorApprover && !canRevisiAll) {
                return res.status(403).json({
                    success: false,
                    message: `You do not have permission to revisi Matriks Skill changes for ${request.department}`,
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: "Validation errors", errors: errors.array() });
            }

            if (!["pending", "waiting_director_approval"].includes(request.status)) {
                return res.status(400).json({ success: false, message: `Cannot revisi request with status: ${request.status}` });
            }

            if (request.requestedBy.toString() === req.user.id) {
                return res.status(400).json({ success: false, message: "You cannot revisi your own request" });
            }

            const now = new Date();
            request.status = "revisi";
            request.reviewedBy = req.user.id;
            request.reviewedAt = now;
            request.reviewComments = req.body.reviewComments;

            await request.save();

            const populatedRequest = await MatriksSkillChangeRequest.findById(request._id)
                .populate({ path: "requestedBy", select: "name email department role", populate: { path: "role", select: "name permissions" } })
                .populate("reviewedBy", "name email")
                .populate("firstApprovedBy", "name email")
                .populate("secondApprovedBy", "name email")
                .populate("approvedBy", "name email");

            res.json({ success: true, message: "Matriks Skill change request marked as revisi", data: populatedRequest });
        } catch (error) {
            console.error("Error revising Matriks Skill change request:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }
);

// PUT cancel
router.put("/:id/cancel", auth, async (req, res) => {
    try {
        const request = await MatriksSkillChangeRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.requestedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "You can only cancel your own request" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ success: false, message: `Cannot cancel request with status: ${request.status}` });
        }

        request.status = "cancelled";
        await request.save();

        const populatedRequest = await MatriksSkillChangeRequest.findById(request._id)
            .populate("requestedBy", "name email department")
            .populate("reviewedBy", "name email")
            .populate("firstApprovedBy", "name email")
            .populate("secondApprovedBy", "name email")
            .populate("approvedBy", "name email");

        res.json({ success: true, message: "Matriks Skill change request cancelled", data: populatedRequest });
    } catch (error) {
        console.error("Error cancelling Matriks Skill change request:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
    try {
        const request = await MatriksSkillChangeRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        const userPermissions = req.user.role?.permissions || [];

        if (request.requestedBy.toString() !== req.user.id && !userPermissions.includes("Manage Users")) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        await MatriksSkillChangeRequest.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: "Matriks Skill change request deleted successfully" });
    } catch (error) {
        console.error("Error deleting Matriks Skill change request:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;