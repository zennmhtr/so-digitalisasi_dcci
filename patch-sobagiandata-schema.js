const fs = require("fs");
const path = require("path");

const modelPath = path.join(__dirname, "backend/models/SOBagianData.js");
let src = fs.readFileSync(modelPath, "utf8");

const oldSchema = `const boxSchema = new mongoose.Schema({
  id:       { type: String, required: true },
  code:     { type: String, required: true },
  title:    { type: String, required: true },
  name:     { type: String, default: "" },
  empId:    { type: String, default: "" },
  column:   { type: String, required: true },
  parentId: { type: String, default: null },
  order:    { type: Number, default: 0 },
  clickable:{ type: Boolean, default: false },
  route:    { type: String, default: "" },
});`;

const newSchema = `const boxSchema = new mongoose.Schema({
  id:            { type: String, required: true },
  code:          { type: String, default: "" },
  title:         { type: String, default: "" },
  name:          { type: String, default: "" },
  empId:         { type: String, default: "" },
  column:        { type: String, required: true },
  parentId:      { type: String, default: null },
  order:         { type: Number, default: 0 },
  clickable:     { type: Boolean, default: false },
  route:         { type: String, default: "" },
  isGroupHeader: { type: Boolean, default: false },
  member:        { type: mongoose.Schema.Types.ObjectId, ref: "Member", default: null },
});`;

if (src.includes("isGroupHeader")) {
  console.log("⏭️  Schema sudah dipatch sebelumnya, skip.");
} else if (!src.includes(oldSchema)) {
  throw new Error("Schema lama tidak cocok persis — perlu dicek manual.");
} else {
  src = src.replace(oldSchema, newSchema);
  fs.writeFileSync(modelPath, src);
  console.log("✅ Schema SOBagianData.js dipatch (tambah isGroupHeader + member).");
  console.log("⚠️  Catatan: field 'code' dan 'title' diubah dari required jadi optional, supaya box container tanpa code tetap valid.");
}
