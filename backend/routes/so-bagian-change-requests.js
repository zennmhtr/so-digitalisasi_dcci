const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const SOBagianChangeRequest = require("../models/SOBagianChangeRequest");
const router = express.Router();

const getDepartmentApprovalPermission = (departmentName) => {
  const mapping = {
    "Finance Department": "SO Bagian Finance Approval",
    "HRGA & IT Department": "SO Bagian HRGA & IT Approval",
    "Management Development": "SO Bagian Management Development Approval",
    "Management Representative": "SO Bagian Management Representative Approval",
    "Manufacturing Battery": "SO Bagian Manufacturing Battery Approval",
    "Manufacturing Cable": "SO Bagian Manufacturing Cable Approval",
    "Marketing Battery Department": "SO Bagian Marketing Battery Approval",
    "Marketing Engineering": "SO Bagian Marketing Engineering Approval",
    "MI & SHE": "SO Bagian MI & SHE Approval",
    "PPIC": "SO Bagian PPIC Approval",
    "Purchasing": "SO Bagian Purchasing Approval",
    "QA Department": "SO Bagian QA Approval",
  };
  return mapping[departmentName] || null;
};

const isUserManager = (userPermissions) => {
  return userPermissions.some(
    (perm) => perm.startsWith("SO Bagian") && perm.endsWith("Approval")
  );
};

router.get("/", auth, async (req, res) => {
  try {
    const { status } = req.query;
    const userPermissions = req.user.role?.permissions || [];

    const filter = {};
    if (status) filter.status = status;

    const departmentApprovalPermissions = userPermissions.filter(
      (p) => p.startsWith("SO Bagian") && p.endsWith("Approval")
    );

    const canSeeAllRequests = userPermissions.includes("Manage Users");
    const hasDirectorApproval = userPermissions.includes(
      "SO Changes First Approval"
    );
    const hasAnyApprovalPermission = departmentApprovalPermissions.length > 0;

    if (!canSeeAllRequests) {
      if (hasDirectorApproval) {
        filter.$or = [
          { requestedBy: req.user.id },
          { status: { $in: ["pending", "waiting_director_approval"]} },
          { firstApprovedBy: req.user.id },
          { secondApprovedBy: req.user.id },
          { approvedBy: req.user.id },
          { reviewedBy: req.user.id },
        ];
      } else if (hasAnyApprovalPermission) {
        const approvalDepartments = departmentApprovalPermissions
          .map((perm) => {
            const match = perm.match(/SO Bagian (.+) Approval/);
            if (match) {
              const deptName = match[1];
              const deptMapping = {
                "Finance": "Finance Department",
                "HRGA & IT": "HRGA & IT Department",
                "Management Development": "Management Development",
                "Management Representative": "Management Representative",
                "Manufacturing Battery": "Manufacturing Battery",
                "Manufacturing Cable": "Manufacturing Cable",
                "Marketing Battery": "Marketing Battery Department",
                "Marketing Engineering": "Marketing Engineering",
                "MI & SHE": "MI & SHE",
                "PPIC": "PPIC",
                "Purchasing": "Purchasing",
                "QA": "QA Department",
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

    const request = await SOBagianChangeRequest.find(filter)
      .populate({
        path: "requestedBy",
        select: "name email department role",
        populate: {
          path: "role",
          select: "name permissions"
        }
      })
      .populate("reviewedBy", "name email")
      .populate("firstApprovedBy", "name email")
      .populate("secondApprovedBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Error fetching SO bagian change requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const request = await SOBagianChangeRequest.findById(req.params.id)
      .populate("requestedBy", "name email department")
      .populate("reviewedBy", "name email")
      .populate("firstApprovedBy", "name email")
      .populate("secondApprovedBy", "name email")
      .populate("approvedBy", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "SO Bagian Change request not found",
      });
    }

    const userPermissions = req.user.role?.permissions || [];
    const canViewAllRequests = userPermissions.includes("Manage Users");
    const hasDirectorApproval = userPermissions.includes(
      "SO Changes First Approval"
    );

    const requiredPermission = getDepartmentApprovalPermission(
      request.department
    );
    const canApproveThisDept =
      requiredPermission && userPermissions.includes(requiredPermission);
    if (
      request.requestedBy._id.toString() !== req.user.id &&
      !canViewAllRequests &&
      !canApproveThisDept &&
      !hasDirectorApproval
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Error fetching SO Bagian change request:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.post(
  "/",
  [
    auth,
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("changeType")
      .isIn(["update", "add", "delete"])
      .withMessage("Invalid change type"),
    body("proposedData").notEmpty().withMessage("Proposed data is required"),
    body("department").notEmpty().withMessage("Department is Required"),
  ],
  async (req, res) => {
    try {
      const userPermissions = req.user.role?.permissions || [];
      const hasSoBagianRequest = userPermissions.includes("SO Bagian Request");
      const hasDepartmentApproval = userPermissions.some(
        (perm) => perm.startsWith("SO Bagian") && perm.endsWith("Approval")
      );

      if (!hasSoBagianRequest && !hasDepartmentApproval) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to submit SO Bagian changes",
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "validation errors",
          errors: errors.array(),
        });
      }

      const {
        title,
        description,
        changeType,
        proposedData,
        currentData,
        priority,
        department,
      } = req.body;

      console.log("📥 Received currentData:", currentData ? "YES" : "NO");
      console.log("📥 CurrentData structure:", JSON.stringify(currentData, null, 2));

      const changeRequest = new SOBagianChangeRequest({
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

      const populatedRequest = await SOBagianChangeRequest.findById(
        changeRequest._id
      ).populate("requestedBy", "name email department");

      console.log("✅ Saved currentData:", populatedRequest.currentData ? "YES" : "NO");

      res.status(201).json({
        success: true,
        message: "SO Bagian change request submitted successfully",
        data: populatedRequest,
      });
    } catch (error) {
      console.error("Error creating SO Bagian change request:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

router.put(
  "/:id/approve",
  [auth, body("reviewComments").optional()],
  async (req, res) => {
    try {
      const userPermissions = req.user.role?.permissions || [];
      
      const request = await SOBagianChangeRequest.findById(req.params.id)
        .populate({
          path: 'requestedBy',
          select: 'name email department role',
          populate: {
            path: 'role',
            select: 'name permissions'
          }
        });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "SO Bagian change request not found",
        });
      }

      const requiredPermission = getDepartmentApprovalPermission(
        request.department
      );
      const isManagerApprover =
        requiredPermission && userPermissions.includes(requiredPermission);
      const isDirectorApprover = userPermissions.includes(
        "SO Changes First Approval"
      );
      const canApproveAll = userPermissions.includes("Manage Users");

      const requesterPermissions = request.requestedBy.role?.permissions || [];
      const isRequesterManager = isUserManager(requesterPermissions);

      console.log("🔍 Approval Debug:", {
        requestId: request._id,
        status: request.status,
        requester: request.requestedBy.name,
        isRequesterManager,
        requesterPermissions,
        approver: req.user.username,
        isManagerApprover,
        isDirectorApprover,
        canApproveAll,
      });

      if (!isManagerApprover && !isDirectorApprover && !canApproveAll) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to approve SO Bagian changes for ${request.department}. Required Permission: ${requiredPermission} or SO Changes First Approval`,
        });
      }

      if (!["pending", "waiting_director_approval"].includes(request.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot approve request with status: ${request.status}`,
        });
      }

      if (
        request.requestedBy._id &&
        request.requestedBy._id.toString() === req.user.id
      ) {
        return res.status(400).json({
          success: false,
          message: "You cannot approve your own request",
        });
      }

      const now = new Date();
      const isoTs = now;
      const humanDate = now.toLocaleDateString("en-GB");

      if (!request.proposedData) request.proposedData = {};
      if (!request.proposedData.organizationData)
        request.proposedData.organizationData = {};

      if (isRequesterManager) {
        console.log("✅ Manager Request Flow - Requester is Manager");
        
        if (request.status === "pending") {
          if (!isDirectorApprover && !canApproveAll) {
            return res.status(403).json({
              success: false,
              message: "Only Director can approve Manager's request",
            });
          }
          
          console.log("✅ Director approving Manager's request directly");
          
          request.firstApprovedBy = req.user.id;
          request.firstApprovedAt = now;
          request.approvedBy = req.user.id;
          request.approvedAt = now;
          request.reviewedBy = req.user.id;
          request.reviewedAt = now;
          request.reviewComments = req.body.reviewComments || "";
          request.status = "approved";

          try {
            if (!request.proposedData.organizationData.signatures) {
              request.proposedData.organizationData.signatures = {};
            }
            if (!request.proposedData.organizationData.signatures.approvedBy) {
              request.proposedData.organizationData.signatures.approvedBy = {};
            }

            request.proposedData.organizationData.signatures.approvedBy.date =
              humanDate;
            request.proposedData.organizationData.signatures.approvedBy._ts =
              isoTs.toISOString();

            if (
              !request.proposedData.organizationData.signatures.preparedBy ||
              !request.proposedData.organizationData.signatures.preparedBy.date
            ) {
              request.proposedData.organizationData.signatures.preparedBy = {
                date: request.submittedAt
                  ? new Date(request.submittedAt).toLocaleDateString("en-GB")
                  : humanDate,
                _ts: request.submittedAt
                  ? new Date(request.submittedAt).toISOString()
                  : isoTs.toISOString(),
              };
            }

            if (!request.proposedData.organizationData.header) {
              request.proposedData.organizationData.header = {};
            }
            request.proposedData.organizationData.header.effectiveDate =
              humanDate;
            request.proposedData.organizationData.header._effectiveDateTs =
              isoTs.toISOString();
          } catch (err) {
            console.error("Warning: failed to inject approval data:", err);
          }

          request.markModified("proposedData");
          await request.save();

          const populated = await SOBagianChangeRequest.findById(request._id)
            .populate("requestedBy", "name email department")
            .populate("firstApprovedBy", "name email")
            .populate("approvedBy", "name email");

          console.log("✅ Manager request approved directly by Director");

          return res.json({
            success: true,
            message: "Manager request approved successfully by Director",
            data: populated,
          });
        }
        
        if (request.status === "waiting_director_approval") {
          return res.status(400).json({
            success: false,
            message: "Invalid status: Manager requests should not reach waiting_director_approval",
          });
        }
      }

      if (!isRequesterManager) {
        console.log("✅ Employee Request Flow - Requester is Employee");
        
        if (request.status === "pending") {
          if (!isManagerApprover && !canApproveAll) {
            return res.status(403).json({
              success: false,
              message: "Only Department Manager can approve this stage",
            });
          }

          console.log("✅ Manager approving employee request (Stage 1)");

          request.firstApprovedBy = req.user.id;
          request.firstApprovedAt = now;
          request.reviewedBy = req.user.id;
          request.reviewedAt = now;
          request.reviewComments = req.body.reviewComments || "";
          request.status = "waiting_director_approval";

          request.markModified("proposedData");
          await request.save();

          const populated = await SOBagianChangeRequest.findById(request._id)
            .populate("requestedBy", "name email department")
            .populate("firstApprovedBy", "name email")
            .populate("reviewedBy", "name email");

          console.log("✅ Employee request moved to waiting_director_approval");

          return res.json({
            success: true,
            message: "Approved by Manager - Waiting for Director approval",
            data: populated,
          });
        }

        if (request.status === "waiting_director_approval") {
          if (!isDirectorApprover && !canApproveAll) {
            return res.status(403).json({
              success: false,
              message: "Only Director can approve this stage",
            });
          }

          if (request.firstApprovedBy?.toString() === req.user.id) {
            return res.status(400).json({
              success: false,
              message: "You already approved this request as first approver",
            });
          }

          console.log("✅ Director approving employee request (Stage 2 - Final)");

          request.secondApprovedBy = req.user.id;
          request.secondApprovedAt = now;
          request.approvedBy = req.user.id;
          request.approvedAt = now;
          request.reviewedBy = req.user.id;
          request.reviewedAt = now;
          request.reviewComments =
            (request.reviewComments ? request.reviewComments + "\n" : "") +
            "Director approval: " +
            (req.body.reviewComments || "");
          request.status = "approved";

          try {
            if (!request.proposedData.organizationData.signatures) {
              request.proposedData.organizationData.signatures = {};
            }
            if (!request.proposedData.organizationData.signatures.approvedBy) {
              request.proposedData.organizationData.signatures.approvedBy = {};
            }

            request.proposedData.organizationData.signatures.approvedBy.date =
              humanDate;
            request.proposedData.organizationData.signatures.approvedBy._ts =
              isoTs.toISOString();

            if (
              !request.proposedData.organizationData.signatures.preparedBy ||
              !request.proposedData.organizationData.signatures.preparedBy.date
            ) {
              request.proposedData.organizationData.signatures.preparedBy = {
                date: request.submittedAt
                  ? new Date(request.submittedAt).toLocaleDateString("en-GB")
                  : humanDate,
                _ts: request.submittedAt
                  ? new Date(request.submittedAt).toISOString()
                  : isoTs.toISOString(),
              };
            }

            if (!request.proposedData.organizationData.header) {
              request.proposedData.organizationData.header = {};
            }
            request.proposedData.organizationData.header.effectiveDate =
              humanDate;
            request.proposedData.organizationData.header._effectiveDateTs =
              isoTs.toISOString();
          } catch (err) {
            console.error(
              "Warning: failed to inject approvedBy.date into proposedData:",
              err
            );
          }

          request.markModified("proposedData");
          await request.save();

          const populated = await SOBagianChangeRequest.findById(request._id)
            .populate("requestedBy", "name email department")
            .populate("firstApprovedBy", "name email")
            .populate("secondApprovedBy", "name email")
            .populate("approvedBy", "name email")
            .populate("reviewedBy", "name email");

          console.log("✅ Employee request fully approved by Director");

          return res.json({
            success: true,
            message: "SO Bagian change request approved successfully",
            data: populated,
          });
        }
      }

      return res.status(400).json({
        success: false,
        message: "Invalid approval flow",
      });
    } catch (error) {
      console.error("Error approving SO Bagian change request:", error);
      res.status(500).json({
        success: false,
        message: "Server error during approval process",
      });
    }
  }
);

router.put(
  "/:id/reject",
  [
    auth,
    body("reviewComments")
      .notEmpty()
      .withMessage("Review comments are required for rejection"),
  ],
  async (req, res) => {
    try {
      const userPermissions = req.user.role?.permissions || [];
      const request = await SOBagianChangeRequest.findById(req.params.id)
        .populate({
          path: 'requestedBy',
          select: 'name email department role',
          populate: {
            path: 'role',
            select: 'name permissions'
          }
        });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "SO Bagian request not found",
        });
      }

      const requiredPermission = getDepartmentApprovalPermission(
        request.department
      );
      const isManagerApprover =
        requiredPermission && userPermissions.includes(requiredPermission);
      const isDirectorApprover = userPermissions.includes(
        "SO Changes First Approval"
      );
      const canRejectAll = userPermissions.includes("Manage Users");

      if (!isManagerApprover && !isDirectorApprover && !canRejectAll) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to reject SO Bagian changes for ${request.department}`,
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      if (!["pending", "waiting_director_approval"].includes(request.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot reject request with status: ${request.status}`,
        });
      }

      const requesterPermissions = request.requestedBy.role?.permissions || [];
      const isRequesterManager = isUserManager(requesterPermissions);

      const now = new Date();

      console.log("🔍 Reject Debug:", {
        requestId: request._id,
        status: request.status,
        requester: request.requestedBy.name,
        isRequesterManager,
        rejecter: req.user.username,
        isManagerApprover,
        isDirectorApprover,
        canRejectAll,
      });

      if (!isRequesterManager) {
        if (request.status === "pending") {
          if (!isManagerApprover && !canRejectAll) {
            return res.status(403).json({
              success: false,
              message: "Only Department Manager can reject employee request at pending stage",
            });
          }

          console.log("✅ Manager rejecting employee request at pending stage");
          
          request.firstApprovedBy = req.user.id;
          request.firstApprovedAt = now;
          request.status = "rejected";
          request.reviewedBy = req.user.id;
          request.reviewedAt = now;
          request.reviewComments = req.body.reviewComments;

        } else if (request.status === "waiting_director_approval") {
          if (!isDirectorApprover && !canRejectAll) {
            return res.status(403).json({
              success: false,
              message: "Only Director can reject employee request at director approval stage",
            });
          }

          console.log("✅ Director rejecting employee request at director approval stage");

          request.secondApprovedBy = req.user.id;
          request.secondApprovedAt = now;
          request.status = "rejected";
          request.reviewedBy = req.user.id;
          request.reviewedAt = now;
          request.reviewComments = 
            (request.reviewComments ? request.reviewComments + "\n" : "") +
            "Director rejection: " + req.body.reviewComments;
        }
      } 
      else {
        if (request.status === "pending") {
          if (!isDirectorApprover && !canRejectAll) {
            return res.status(403).json({
              success: false,
              message: "Only Director can reject Manager's request",
            });
          }

          console.log("✅ Director rejecting Manager's request");

          request.firstApprovedBy = req.user.id;
          request.firstApprovedAt = now;
          request.status = "rejected";
          request.reviewedBy = req.user.id;
          request.reviewedAt = now;
          request.reviewComments = req.body.reviewComments;

        } else if (request.status === "waiting_director_approval") {
          return res.status(400).json({
            success: false,
            message: "Invalid status: Manager requests should not reach waiting_director_approval",
          });
        }
      }

      await request.save();

      const populatedRequest = await SOBagianChangeRequest.findById(request._id)
        .populate("requestedBy", "name email department")
        .populate("reviewedBy", "name email")
        .populate("firstApprovedBy", "name email")
        .populate("secondApprovedBy", "name email")
        .populate("approvedBy", "name email");

      console.log("✅ Request rejected successfully");

      res.json({
        success: true,
        message: "SO Bagian change request rejected",
        data: populatedRequest,
      });
    } catch (error) {
      console.error("❌ Error rejecting SO Bagian change request:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

router.put(
  "/:id/revisi",
  [
    auth,
    body("reviewComments")
      .notEmpty()
      .withMessage("Review comments are required for revision"),
  ],
  async (req, res) => {
    try {
      const userPermissions = req.user.role?.permissions || [];
      const request = await SOBagianChangeRequest.findById(req.params.id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "SO Bagian Change request not found",
        });
      }

      const requiredPermission = getDepartmentApprovalPermission(
        request.department
      );
      const isManagerApprover =
        requiredPermission && userPermissions.includes(requiredPermission);
      const isDirectorApprover = userPermissions.includes(
        "SO Changes First Approval"
      );
      const canRevisiAll = userPermissions.includes("Manage Users");

      if (!isManagerApprover && !isDirectorApprover && !canRevisiAll) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to revisi SO Bagian Changes for ${request.department}`,
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      if (!["pending", "waiting_director_approval"].includes(request.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot revisi request with status: ${request.status}`,
        });
      }

      const now = new Date();

      if (request.requestedBy.toString() === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "You cannot revisi your own request",
        });
      }

      request.status = "revisi";
      request.reviewedBy = req.user.id;
      request.reviewedAt = now;
      request.reviewComments = req.body.reviewComments;

      await request.save();

      const populatedRequest = await SOBagianChangeRequest.findById(request._id)
        .populate("requestedBy", "name email department")
        .populate("reviewedBy", "name email")
        .populate("firstApprovedBy", "name email")
        .populate("secondApprovedBy", "name email")
        .populate("approvedBy", "name email");

      res.json({
        success: true,
        message: "SO Bagian change request marked as revisi",
        data: populatedRequest,
      });
    } catch (error) {
      console.error("Error revising SO Bagian change request:", error);
      res.status(500).json({
        success: false,
        message: "Server error during revision process",
      });
    }
  }
);

router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const request = await SOBagianChangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "SO Bagian change request not found",
      });
    }

    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel request with status: ${request.status}`,
      });
    }

    request.status = "cancelled";
    await request.save();

    const populatedRequest = await SOBagianChangeRequest.findById(request._id)
      .populate("requestedBy", "name email department")
      .populate("reviewedBy", "name email")
      .populate("firstApprovedBy", "name email")
      .populate("secondApprovedBy", "name email")
      .populate("approvedBy", "name email");

    res.json({
      success: true,
      message: "SO Bagian change request cancelled",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Error cancelling SO Bagian change request:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const request = await SOBagianChangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "SO Bagian change request not found",
      });
    }

    const userPermissions = req.user.role?.permissions || [];

    if (
      request.requestedBy.toString() !== req.user.id &&
      !userPermissions.includes("Manage Users")
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await SOBagianChangeRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "SO Bagian change request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting SO Bagian change request:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;