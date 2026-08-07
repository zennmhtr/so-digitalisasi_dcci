const mongoose = require("mongoose");

const matriksSkillDepartmentSchema = new mongoose.Schema(
  {
    bagianId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: "bg-slate-500",
    },
    borderColor: {
      type: String,
      default: "#64748b",
    },
    iconColor: {
      type: String,
      default: "#64748b",
    },
    order: {
      type: Number,
      default: 0,
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MatriksSkillDepartment", matriksSkillDepartmentSchema);