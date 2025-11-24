const express = require("express");
const { body, validationResult } = require("express-validator");
const SOChangeRequest = require("../models/SOChangeRequest");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const { status, affectedSection } = req.query;
    const userPermissions = req.user.role?.permissions || [];

    const filter = {};
    if (status) filter.status = status;
    if (affectedSection) filter.affectedSection = affectedSection;

    const canSeeAllRequests =
      userPermissions.includes("SO Changes First Approval") ||
      userPermissions.includes("SO Changes Final Approval");

    if (!canSeeAllRequests) {
      filter.requestedBy = req.user.id;
    }

    const requests = await SOChangeRequest.find(filter)
      .populate("requestedBy", "name email department")
      .populate("reviewedBy", "name email")
      .populate("firstApprovedBy", "name email")
      .populate("secondApprovedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching SO change requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const request = await SOChangeRequest.findById(req.params.id)
      .populate("requestedBy", "name email department")
      .populate("reviewedBy", "name email")
      .populate("firstApprovedBy", "name email")
      .populate("secondApprovedBy", "name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "SO change request not found",
      });
    }

    const userPermissions = req.user.role?.permissions || [];
    const canViewAllRequests =
      userPermissions.includes("SO Changes First Approval") ||
      userPermissions.includes("SO Changes Final Approval");

    if (
      request.requestedBy._id.toString() !== req.user.id &&
      !canViewAllRequests
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
    console.error("Error fetching SO change request:", error);
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
    body("affectedSection")
      .notEmpty()
      .withMessage("Affected section is required"),
    body("proposedData").notEmpty().withMessage("Proposed data is required"),
  ],
  async (req, res) => {
    try {
      const userPermissions = req.user.role?.permissions || [];
      if (!userPermissions.includes("SO DCI Editor")) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to submit SO changes",
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

      const {
        title,
        description,
        changeType,
        affectedSection,
        proposedData,
        currentData,
        priority,
      } = req.body;

      const changeRequest = new SOChangeRequest({
        title,
        description,
        changeType,
        affectedSection,
        proposedData,
        currentData: currentData || null,
        priority: priority || "medium",
        requestedBy: req.user.id,
      });

      await changeRequest.save();

      const populatedRequest = await SOChangeRequest.findById(
        changeRequest._id
      ).populate("requestedBy", "name email department");

      res.status(201).json({
        success: true,
        message: "SO change request submitted successfully",
        data: populatedRequest,
      });
    } catch (error) {
      console.error("Error creating SO change request:", error);
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
      const isFirstApprover = userPermissions.includes(
        "SO Changes First Approval"
      );
      const isFinalApprover = userPermissions.includes(
        "SO Changes Final Approval"
      );

      if (!isFirstApprover && !isFinalApprover) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to approve SO changes for any level",
        });
      }

      const request = await SOChangeRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "SO change request not found",
        });
      }

      if (!["pending", "waiting_second_approval"].includes(request.status)) {
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
      const humanDate = now.toLocaleDateString("en-GB");

      console.log("🔥 APPROVAL DEBUG:", {
        status: request.status,
        humanDate,
        isFirstApprover,
        isFinalApprover,
      });

      if (!request.proposedData) request.proposedData = {};
      if (!request.proposedData.organizationData) {
        request.proposedData.organizationData = {};
      }
      if (!request.proposedData.organizationData.signatures) {
        request.proposedData.organizationData.signatures = {};
      }
      if (!request.proposedData.organizationData.header) {
        request.proposedData.organizationData.header = {};
      }

      if (
        !request.proposedData.organizationData.signatures.preparedBy ||
        !request.proposedData.organizationData.signatures.preparedBy.date
      ) {
        const prepDate = request.createdAt || now;
        request.proposedData.organizationData.signatures.preparedBy = {
          name: "Diki Wahyudi",
          date: new Date(prepDate).toLocaleDateString("en-GB"),
          _ts: new Date(prepDate).toISOString(),
        };
        console.log(
          "✅ Set preparedBy.date:",
          request.proposedData.organizationData.signatures.preparedBy.date
        );
      }

      if (request.status === "pending") {
        if (!isFirstApprover) {
          return res.status(403).json({
            success: false,
            message: "Only first approver (Director) can approve this stage",
          });
        }

        request.firstApprovedBy = req.user.id;
        request.firstApprovedAt = now;
        request.reviewComments = req.body.reviewComments || "";
        request.status = "waiting_second_approval";

        request.proposedData.organizationData.signatures.middleBy = {
          title: "Director",
          name: "Bambang Wuryanto",
          date: humanDate,
          _ts: now.toISOString(),
        };

        console.log("✅ SET middleBy.date:", humanDate);

        request.markModified("proposedData");
        await request.save();

        const populated = await SOChangeRequest.findById(request._id)
          .populate("requestedBy", "name email department")
          .populate("firstApprovedBy", "name email");

        console.log(
          "✅ SAVED - middleBy:",
          populated.proposedData?.organizationData?.signatures?.middleBy
        );

        return res.json({
          success: true,
          message: "Approved by first approver – waiting for second approval",
          data: populated,
        });
      }

      if (request.status === "waiting_second_approval") {
        if (!isFinalApprover) {
          return res.status(403).json({
            success: false,
            message:
              "Only final approver (President Director) can approve this stage",
          });
        }

        if (request.firstApprovedBy?.toString() === req.user.id) {
          return res.status(400).json({
            success: false,
            message: "You already approved this as first approver",
          });
        }

        request.secondApprovedBy = req.user.id;
        request.secondApprovedAt = now;
        request.reviewComments =
          (request.reviewComments ? request.reviewComments + "\n" : "") +
          "Final approval: " +
          (req.body.reviewComments || "");
        request.status = "approved";

        request.proposedData.organizationData.signatures.approvedBy = {
          name: "Eko Maryanto",
          date: humanDate,
          _ts: now.toISOString(),
        };

        request.proposedData.organizationData.header.effectiveDate = humanDate;
        request.proposedData.organizationData.header._effectiveDateTs =
          now.toISOString();

        console.log("✅ SET approvedBy.date:", humanDate);
        console.log("✅ SET effectiveDate:", humanDate);

        request.markModified("proposedData");
        await request.save();

        const populated = await SOChangeRequest.findById(request._id)
          .populate("requestedBy", "name email department")
          .populate("firstApprovedBy", "name email")
          .populate("secondApprovedBy", "name email");

        console.log(
          "✅ SAVED - approvedBy:",
          populated.proposedData?.organizationData?.signatures?.approvedBy
        );
        console.log(
          "✅ SAVED - effectiveDate:",
          populated.proposedData?.organizationData?.header?.effectiveDate
        );

        return res.json({
          success: true,
          message: "Fully approved – both approvers have confirmed",
          data: populated,
        });
      }
    } catch (error) {
      console.error("❌ Error approving SO change request:", error);
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
      const isFirstApprover = userPermissions.includes(
        "SO Changes First Approval"
      );
      const isFinalApprover = userPermissions.includes(
        "SO Changes Final Approval"
      );

      if (!isFirstApprover && !isFinalApprover) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to reject SO changes",
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

      const request = await SOChangeRequest.findById(req.params.id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "SO change request not found",
        });
      }

      if (!["pending", "waiting_second_approval"].includes(request.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot reject request with status: ${request.status}`,
        });
      }

      const now = new Date();

      if (request.status === "pending" && isFirstApprover) {
        request.firstApprovedBy = req.user.id;
        request.firstApprovedAt = now;
      } else if (
        request.status === "waiting_second_approval" &&
        isFinalApprover
      ) {
        request.secondApprovedBy = req.user.id;
        request.secondApprovedAt = now;
      } else {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to reject this stage",
        });
      }

      request.status = "rejected";
      request.reviewedBy = req.user.id;
      request.reviewedAt = now;
      request.reviewComments = req.body.reviewComments;

      await request.save();

      const populatedRequest = await SOChangeRequest.findById(request._id)
        .populate("requestedBy", "name email department")
        .populate("reviewedBy", "name email")
        .populate("firstApprovedBy", "name email")
        .populate("secondApprovedBy", "name email");

      res.json({
        success: true,
        message: "SO change request rejected successfully",
        data: populatedRequest,
      });
    } catch (error) {
      console.error("Error rejecting SO change request:", error);
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
      const isFirstApprover = userPermissions.includes(
        "SO Changes First Approval"
      );
      const isFinalApprover = userPermissions.includes(
        "SO Changes Final Approval"
      );

      if (!isFirstApprover && !isFinalApprover) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to revisi SO changes",
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

      const request = await SOChangeRequest.findById(req.params.id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "SO change request not found",
        });
      }

      if (!["pending", "waiting_second_approval"].includes(request.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot revisi request with status: ${request.status}`,
        });
      }

      const now = new Date();

      if (request.status === "pending" && isFirstApprover) {
        request.firstApprovedBy = req.user.id;
        request.firstApprovedAt = now;
      } else if (
        request.status === "waiting_second_approval" &&
        isFinalApprover
      ) {
        request.secondApprovedBy = req.user.id;
        request.secondApprovedAt = now;
      } else {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to revisi this stage",
        });
      }

      request.status = "revisi";
      request.reviewedBy = req.user.id;
      request.reviewedAt = now;
      request.reviewComments = req.body.reviewComments;

      await request.save();

      const populatedRequest = await SOChangeRequest.findById(request._id)
        .populate("requestedBy", "name email department")
        .populate("reviewedBy", "name email")
        .populate("firstApprovedBy", "name email")
        .populate("secondApprovedBy", "name email");

      res.json({
        success: true,
        message: "SO change request marked as revisi",
        data: populatedRequest,
      });
    } catch (error) {
      console.error("Error revising SO change request:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const request = await SOChangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "SO change request not found",
      });
    }

    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own requests",
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

    const populatedRequest = await SOChangeRequest.findById(request._id)
      .populate("requestedBy", "name email department")
      .populate("reviewedBy", "name email");

    res.json({
      success: true,
      message: "SO change request cancelled",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Error cancelling SO change request:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const request = await SOChangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "SO change request not found",
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

    await SOChangeRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "SO change request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting SO change request:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
