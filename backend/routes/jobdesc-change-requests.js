const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const JobDescChangeRequest = require("../models/JobDescChangeRequest");
const JobDescription = require("../models/JobDescription");
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
    PPIC: "SO Bagian PPIC Approval",
    Purchasing: "SO Bagian Purchasing Approval",
    "QA Department": "SO Bagian QA Approval",
  };
  return mapping[departmentName] || null;
};

const isUserManager = (userPermissions) => {
  return userPermissions.some(
    (perm) => perm.startsWith("SO Bagian") && perm.endsWith("Approval")
  );
};

const applyJobDescChanges = async (request) => {
  try {
    console.log("🔄 Applying Job Desc changes to database...");

    const proposedData = request.proposedData;
    if (!proposedData || !proposedData.jobDescData) {
      console.error("❌ No jobDescData found in proposedData");
      return false;
    }

    const jobDescData = proposedData.jobDescData;
    const memberInfo = proposedData.memberInfo;

    console.log("📦 Job Desc Data:", jobDescData);
    console.log("👤 Member Info:", memberInfo);
    console.log("🔄 Change Type:", request.changeType);

    if (request.changeType === "update" && jobDescData._id) {
      console.log("📝 Updating existing Job Description:", jobDescData._id);

      const existingJobDesc = await JobDescription.findById(jobDescData._id);

      if (!existingJobDesc) {
        console.error(
          "❌ Job Description not found for update:",
          jobDescData._id
        );
        return false;
      }

      existingJobDesc.tanggal = jobDescData.tanggal || existingJobDesc.tanggal;
      existingJobDesc.revisi = jobDescData.revisi || existingJobDesc.revisi;
      existingJobDesc.division =
        jobDescData.division || existingJobDesc.division;
      existingJobDesc.positionTitle =
        jobDescData.positionTitle || existingJobDesc.positionTitle;
      existingJobDesc.reportsTo =
        jobDescData.reportsTo || existingJobDesc.reportsTo;
      existingJobDesc.responsibilities =
        jobDescData.responsibilities || existingJobDesc.responsibilities;
      existingJobDesc.accountabilities =
        jobDescData.accountabilities || existingJobDesc.accountabilities;
      existingJobDesc.interactions =
        jobDescData.interactions || existingJobDesc.interactions;
      existingJobDesc.competence =
        jobDescData.competence || existingJobDesc.competence;
      existingJobDesc.jobSpecification =
        jobDescData.jobSpecification || existingJobDesc.jobSpecification;
      existingJobDesc.status = "approved";
      existingJobDesc.approvedBy = request.approvedBy;
      existingJobDesc.approvedAt = new Date();

      await existingJobDesc.save();
      console.log("✅ Job Description updated successfully in database");

      return true;
    }
    else {
      console.log("➕ Creating new Job Description");

      const newJobDesc = new JobDescription({
        member: jobDescData.member || null,
        user: jobDescData.user || null,
        memberName: jobDescData.memberName,
        memberNoPNK: jobDescData.memberNoPNK,
        memberEmail: jobDescData.memberEmail,
        memberPosition: jobDescData.memberPosition,
        department: jobDescData.department,
        tanggal: jobDescData.tanggal || new Date(),
        revisi: jobDescData.revisi || "0",
        division: jobDescData.division,
        positionTitle: jobDescData.positionTitle,
        reportsTo: jobDescData.reportsTo,
        responsibilities: jobDescData.responsibilities || [],
        accountabilities: jobDescData.accountabilities || [],
        interactions: jobDescData.interactions || {
          internal: [],
          external: [],
        },
        competence: jobDescData.competence || {
          managerial: [],
          technical: [],
          behavioral: [],
          skill: [],
        },
        jobSpecification: jobDescData.jobSpecification || {},
        status: "approved",
        createdBy: request.requestedBy,
        approvedBy: request.approvedBy,
        approvedAt: new Date(),
      });

      await newJobDesc.save();
      console.log("✅ Job Description created successfully in database");

      return true;
    }
  } catch (error) {
    console.error("❌ Error applying job desc changes:", error);
    return false;
  }
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
    const hasJobDescRequest = userPermissions.includes("Job Desc Request");

    console.log("🔍 JobDesc Request Filter Debug:", {
      userId: req.user.id,
      username: req.user.username,
      canSeeAllRequests,
      hasDirectorApproval,
      hasAnyApprovalPermission,
      hasJobDescRequest,
    });

    if (canSeeAllRequests) {
      console.log("👑 Super Admin - sees all requests");
    } 
    else if (hasDirectorApproval) {
      console.log("🎯 Director - sees director approval + own requests");
      filter.$or = [
        { requestedBy: req.user.id }, 
        { status: { $in: ["pending", "waiting_director_approval"] } },
        { firstApprovedBy: req.user.id },
        { secondApprovedBy: req.user.id },
        { approvedBy: req.user.id },
        { reviewedBy: req.user.id },
      ];
    } 
    else if (hasAnyApprovalPermission) {
      console.log("👔 Manager - sees department requests + own requests");
      
      const approvalDepartments = departmentApprovalPermissions
        .map((perm) => {
          const match = perm.match(/SO Bagian (.+) Approval/);
          if (match) {
            const deptName = match[1];
            const deptMapping = {
              Finance: "Finance Department",
              "HRGA & IT": "HRGA & IT Department",
              "Management Development": "Management Development",
              "Management Representative": "Management Representative",
              "Manufacturing Battery": "Manufacturing Battery",
              "Manufacturing Cable": "Manufacturing Cable",
              "Marketing Battery": "Marketing Battery Department",
              "Marketing Engineering": "Marketing Engineering",
              "MI & SHE": "MI & SHE",
              PPIC: "PPIC",
              Purchasing: "Purchasing",
              QA: "QA Department",
            };
            return deptMapping[deptName] || deptName;
          }
          return null;
        })
        .filter(Boolean);

      filter.$or = [
        { requestedBy: req.user.id },
        { 
          department: { $in: approvalDepartments },
          status: { $in: ["pending", "waiting_director_approval", "approved", "rejected", "revisi"] }
        }, 
        { firstApprovedBy: req.user.id },
        { secondApprovedBy: req.user.id },
        { approvedBy: req.user.id },
        { reviewedBy: req.user.id },
      ];
    } 
    else if (hasJobDescRequest) {
      console.log("👤 Employee - sees ONLY own requests");
      filter.requestedBy = req.user.id;
    }
    else {
      console.log("🚫 No permission - sees nothing");
      filter._id = null;
    }

    console.log("🔍 Final filter:", JSON.stringify(filter));

    const requests = await JobDescChangeRequest.find(filter)
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

    console.log(`📊 Found ${requests.length} requests for user ${req.user.username}`);

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching Job Desc change requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const request = await JobDescChangeRequest.findById(req.params.id)
      .populate("requestedBy", "name email department")
      .populate("reviewedBy", "name email")
      .populate("firstApprovedBy", "name email")
      .populate("secondApprovedBy", "name email")
      .populate("approvedBy", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        Message: "Job Desc Change request not found",
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
    console.error("Error fetching Job Desc change requests:", error);
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
      const hasJobDescRequest = userPermissions.includes("Job Desc Request");
      const hasDepartmentApproval = userPermissions.some(
        (perm) => perm.startsWith("SO Bagian") && perm.endsWith("Approval")
      );

      if (!hasJobDescRequest && !hasDepartmentApproval) {
        return res.status(403).json({
          success: false,
          message: "You dont have permission to submit Job Desc change",
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

      const changeRequest = new JobDescChangeRequest({
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

      const populatedRequest = await JobDescChangeRequest.findById(
        changeRequest._id
      ).populate("requestedBy", "name email department");

      res.status(201).json({
        success: true,
        message: "Job Desc change request submitted successfully",
        data: populatedRequest,
      });
    } catch (error) {
      console.error("Error creating Job Desc change request:", error);
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

      const request = await JobDescChangeRequest.findById(
        req.params.id
      ).populate({
        path: "requestedBy",
        select: "name email department role",
        populate: {
          path: "role",
          select: "name permissions",
        },
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Job Desc change request not found",
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
          message: `You do not have permission to approve Job Desc changes for ${request.department}. required Permission: ${requiredPermission} or SO Changes First Approval`,
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
          } catch (error) {
            console.error("Warning: failed to inject approval date:", error);
          }

          request.markModified("proposedData");
          await request.save();

          const applied = await applyJobDescChanges(request);
          if (!applied) {
            console.error("⚠️ Failed to apply job desc changes to database");
          }

          const populated = await JobDescChangeRequest.findById(request._id)
            .populate("requestedBy", "name email department")
            .populate("firstApprovedBy", "name email")
            .populate("approvedBy", "name email");

          console.log("✅ Manager request approved directly by Director");

          return res.json({
            success: true,
            message: applied
              ? "Manager request approved and applied successfully"
              : "Manager request approved but failed to apply changes",
            data: populated,
          });
        }

        if (request.status === "waiting_director_approval") {
          return res.status(400).json({
            success: false,
            message:
              "Invalid status: Manager requests should not reach waiting_director_approval",
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

          const populated = await JobDescChangeRequest.findById(request._id)
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

          if (request.firstApprovedBy.toString() === req.user.id) {
            return res.status(400).json({
              success: false,
              message: "You already approved this request as first approver",
            });
          }

          console.log(
            "✅ Director approving employee request (Stage 2 - Final)"
          );

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

          const applied = await applyJobDescChanges(request);
          if (!applied) {
            console.error("⚠️ Failed to apply job desc changes to database");
          }

          const populated = await JobDescChangeRequest.findById(request._id)
            .populate("requestedBy", "name email department")
            .populate("firstApprovedBy", "name email")
            .populate("secondApprovedBy", "name email")
            .populate("approvedBy", "name email")
            .populate("reviewedBy", "name email");

          console.log("✅ Employee request fully approved by Director");

          return res.json({
            success: true,
            message: "Job Desc change request approved successfully",
            data: populated,
          });
        }
      }

      return res.status(400).json({
        success: false,
        message: "Invalid approval flow",
      });
    } catch (error) {
      console.error("Error approving Job Desc change request", error);
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
      const request = await JobDescChangeRequest.findById(
        req.params.id
      ).populate({
        path: "requestedBy",
        select: "name email department role",
        populate: {
          path: "role",
          select: "name permissions",
        },
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Job Desc request not found",
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
          message: `You do not have permission to reject Job Desc changes for ${request.department}`,
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
              message:
                "Only Department Manager can reject employee request at pending stage",
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
              message:
                "Only Director can reject employee request at director approval stage",
            });
          }
          console.log(
            "✅ Director rejecting employee request at director approval stage"
          );

          request.secondApprovedBy = req.user.id;
          request.secondApprovedAt = now;
          request.status = "rejected";
          request.reviewedBy = req.user.id;
          request.reviewedAt = now;
          request.reviewComments =
            (request.reviewComments ? request.reviewComments + "\n" : "") +
            "Director rejection: " +
            req.body.reviewComments;
        }
      } else {
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
            message:
              "Invalid status: Manager requests should not reach waiting_director_approval",
          });
        }
      }
      await request.save();
      const populatedRequest = await JobDescChangeRequest.findById(request._id)
        .populate("requestedBy", "name email department")
        .populate("reviewedBy", "name email")
        .populate("firstApprovedBy", "name email")
        .populate("secondApprovedBy", "name email")
        .populate("approvedBy", "name email");

      console.log("✅ Request rejected successfully");

      res.json({
        success: true,
        message: "Job Desc change request rejected",
        data: populatedRequest,
      });
    } catch (error) {
      console.error("❌ Error rejecting Job Desc change request:", error);
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
      const request = await JobDescChangeRequest.findById(req.params.id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Job Desc Change request not found",
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
          message: `You do not have permission to revisi Job Desc Changes for ${request.department}`,
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

      const populatedRequest = await JobDescChangeRequest.findById(request._id)
        .populate("requestedBy", "name email department")
        .populate("reviewedBy", "name email")
        .populate("firstApprovedBy", "name email")
        .populate("secondApprovedBy", "name email")
        .populate("approvedBy", "name email");

      res.json({
        success: true,
        message: "Job Desc change request marked as revisi",
        data: populatedRequest,
      });
    } catch (error) {
      console.error("Error revising Job Desc change request:", error);
      res.status(500).json({
        success: false,
        message: "server error during revision process",
      });
    }
  }
);

router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const request = await JobDescChangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Job Desc change request not found",
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

    const populatedRequest = await JobDescChangeRequest.findById(request._id)
      .populate("requestedBy", "name email department")
      .populate("reviewedBy", "name email")
      .populate("firstApprovedBy", "name email")
      .populate("secondApprovedBy", "name email")
      .populate("approvedBy", "name email");

    res.json({
      success: true,
      message: "Job Desc change request cancelled",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Error cancelling Job Desc change request:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const request = await JobDescChangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Job Desc change request not found",
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

    await JobDescChangeRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Job Desc change request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Job Desc change request:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
