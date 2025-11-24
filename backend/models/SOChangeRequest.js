const mongoose = require("mongoose");

const soChangeRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    changeType: {
      type: String,
      enum: ["update", "add", "delete"],
      required: true,
    },

    proposedData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    currentData: {
      type: mongoose.Schema.Types.Mixed,
    },

    affectedSection: {
      type: String,
      enum: [
        "bod",
        "management",
        "divisions",
        "departments",
        "sections",
        "header",
        "signatures",
        "commissioners",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "waiting_second_approval",
        "approved",
        "rejected",
        "cancelled",
        "revisi",
      ],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewComments: {
      type: String,
    },

    firstApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    firstApprovedAt: {
      type: Date,
    },
    secondApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    secondApprovedAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

soChangeRequestSchema.index({ requestedBy: 1, status: 1 });
soChangeRequestSchema.index({ status: 1, createdAt: -1 });
soChangeRequestSchema.index({ affectedSection: 1 });

module.exports = mongoose.model("SOChangeRequest", soChangeRequestSchema);
