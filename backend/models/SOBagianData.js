const mongoose = require("mongoose");

const boxSchema = new mongoose.Schema({
  id: { type: String, required: true },
  code: { type: String, default: "" },
  title: { type: String, default: "" },
  name: { type: String, default: "" },
  empId: { type: String, default: "" },
  column: { type: String, required: true },
  parentId: { type: String, default: null },
  order: { type: Number, default: 0 },
  clickable: { type: Boolean, default: false },
  route: { type: String, default: "" },
  isGroupHeader: { type: Boolean, default: false },
  member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", default: null },
});

const soBagianDataSchema = new mongoose.Schema({
  bagianId: { type: String, required: true, unique: true },
  bagianName: { type: String, required: true },
  columns: [{ type: String }],
  header: { type: mongoose.Schema.Types.Mixed, default: {} },
  boxes: [boxSchema],
  positions: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model("SOBagianData", soBagianDataSchema);
