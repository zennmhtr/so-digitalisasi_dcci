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

router.get("/", auth, async (req, res) => {
  try {
    const { status } = req.query;
    const userPermissions = req.user.role?.permissions || [];

    const filter = {};
    if (status) filter.status = status;

    const departmentApprovalPermissions = userPermissions.filter(p =>
      p.startsWith("SO Bagian") && p.endsWith("Approval")
    );

    const canSeeAllRequests = userPermissions.includes("Manage Users");
    const hasAnyApprovalPermission = departmentApprovalPermissions.length > 0;

    if (!canSeeAllRequests) {
      if (hasAnyApprovalPermission) {
        const approvalDepartments = departmentApprovalPermissions.map(perm => {
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
        }).filter(Boolean);
        filter.$or = [
          {requestedBy: req.user.id},
          {department: { $in: approvalDepartments}}
        ];
      } else {
        filter.requestedBy = req.user.id;
      }
    }

    const request = await SOBagianChangeRequest.find(filter)
      .populate("requestedBy", "name email department")
      .populate("reviewedBy", "name email")
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
      .populate("approvedBy", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "SO Bagian Change request not found",
      });
    }

    const userPermissions = req.user.role?.permissions || [];
    const canViewAllRequests = userPermissions.includes("Manage Users");

    const requiredPermission = getDepartmentApprovalPermission(request.department);
    const canApproveThisDept = requiredPermission && userPermissions.includes(requiredPermission);
    if (
      request.requestedBy._id.toString() !== req.user.id &&
      !canViewAllRequests && !canApproveThisDept
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
      if (!userPermissions.includes("SO Bagian Request")) {
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

      res.status(201).
        json({
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
      const request = await SOBagianChangeRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "SO Bagian change request not found",
        });
      }

      const requiredPermission = getDepartmentApprovalPermission(request.department);
      const canApproveThisDept = requiredPermission && userPermissions.includes(requiredPermission);
      const canApproveAll = userPermissions.includes("Manage Users");

      if (!canApproveThisDept && !canApproveAll) {
        return res.status(403).json({
          success: false,
          mesaage: `You do not have permission to approve SO Bagian changes for ${request.department}. Required Permission: ${requiredPermission}`,
        })
      }

      if (!["pending"].includes(request.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot approve request with status: ${request.status}`,
        });
      }

      if (request.requestedBy.toString() === req.user.id) {
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

      request.approvedBy = req.user.id;
      request.approvedAt = isoTs;
      request.reviewedBy = req.user.id;
      request.reviewedAt = isoTs; 
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

        // Set Effective Date sesuai tanggal approve
        if (!request.proposedData.organizationData.header) {
          request.proposedData.organizationData.header = {};
        }
        request.proposedData.organizationData.header.effectiveDate = humanDate;
        request.proposedData.organizationData.header._effectiveDateTs =
          isoTs.toISOString();
      } catch (err) {
        console.error(
          "Warning: failed to inject approvedBy.date into proposedData:",
          err
        );
      }

      await request.save();

      const populated = await SOBagianChangeRequest.findById(request._id)
        .populate("requestedBy", "name email department")
        .populate("reviewedBy", "name email")
        .populate("approvedBy", "name email"); 

      return res.json({
        success: true,
        message: "SO Bagian change request approved successfully",
        data: populated,
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
    try{
      const userPermissions = req.user.role?.permissions || [];
      const request = await SOBagianChangeRequest.findById(req.params.id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "SO Bagian request not found",
        });
      }

      const requiredPermission = getDepartmentApprovalPermission(request.department);
      const canRejectThisDept = requiredPermission && userPermissions.includes(requiredPermission);
      const canRejectAll = userPermissions.includes("Manage Users");

      if (!canRejectThisDept && !canRejectAll) {
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

      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `Cannot reject request with status: ${request.status}`,
        });
      }

      request.status = "rejected";
      request.reviewedBy = req.user.id;
      request.reviewedAt = new Date();
      request.reviewComments = req.body.reviewComments;

      await request.save();

      const populatedRequest = await SOBagianChangeRequest.findById(request._id)
      .populate("requestedBy", "name email")
      .populate("reviewedBy", "name email")
      .populate("approvedBy", "name email");;

      res.json({
        success: true,
        message: "SO Bagian change request rejected",
        data: populatedRequest,
      });
    } catch (error) {
      console.error("Error rejecting SO Bagian change request:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      })
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
          message:"SO Bagian Change request not found",
        });
      }

      const requiredPermission = getDepartmentApprovalPermission(request.department);
      const canRevisiThisDept = requiredPermission && userPermissions.includes(requiredPermission);
      const canRevisiAll = userPermissions.includes("Manage Users");

      if (!canRevisiThisDept && !canRevisiAll) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to revisi SO Bagian Changes for ${request.department}`,
        })
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      if (!["pending"].includes(request.status)) {
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
      .populate("approvedBy", "name email");;

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
    console.error("Error deleteing SO Bagian change request:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
