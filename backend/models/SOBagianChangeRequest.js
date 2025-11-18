const mongoose = require("mongoose");

const soBagianChangeRequestSchema = new mongoose.Schema(
  {
    // Request Information
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    // Requested By
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // SO Data Changes
    changeType: {
      type: String,
      enum: ["update", "add", "delete"],
      required: true,
    },

    // Store the new SO data that is being requested
    proposedData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Store the current/old SO data for comparison
    currentData: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Status
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "revisi",
      ],
      default: "pending",
    },

    // Approval Information
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

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },

    // Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Metadata
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
soBagianChangeRequestSchema.index({ requestedBy: 1, status: 1 });
soBagianChangeRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("soBagianChangeRequest", soBagianChangeRequestSchema);