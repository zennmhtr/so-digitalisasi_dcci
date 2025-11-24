const mongoose = require("mongoose");

const soBagianChangeRequestSchema = new mongoose.Schema(
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

    department: {
      type: String,
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

soBagianChangeRequestSchema.index({ requestedBy: 1, status: 1 });
soBagianChangeRequestSchema.index({ status: 1, createdAt: -1 });
soBagianChangeRequestSchema.index(({department: 1, status: 1}));

module.exports = mongoose.model("soBagianChangeRequest", soBagianChangeRequestSchema);