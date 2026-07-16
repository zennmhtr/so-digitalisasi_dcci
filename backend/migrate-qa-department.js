const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const boxes = [
    { id: "QAC1.0", code: "QAC1.0", title: "QA DEPARTMENT", name: "M. BAGUS SANTOSO", empId: "23220025", column: "DEPARTMENT HEAD", parentId: "QA DEPARTMENT", order: 1 },

    { id: "QAC1.1.1", code: "QAC1.1.1", title: "QUALITY ASSURANCE PROCESS", name: "DWI PURWANTO", empId: "23050023", column: "UNIT/STAFF LEVEL", parentId: "QUALITY ASSURANCE PROCESS (UNIT)", order: 1 },

    { id: "QAC1.1.2", code: "QAC1.1.2", title: "QUALITY ASSURANCE PROCESS", name: "SUCI PURWANTO", empId: "23120149", column: "OPERATOR/ADMIN", parentId: "QUALITY ASSURANCE PROCESS", order: 1 },
    { id: "QAC1.1.3", code: "QAC1.1.3", title: "LAB & KALIBRASI", name: "NURDIANTO", empId: "23160477", column: "OPERATOR/ADMIN", parentId: "LAB & KALIBRASI", order: 1 },
    { id: "QAC1.1.4", code: "QAC1.1.4", title: "VENDOR MANAGEMENT", name: "SUCI PURWANTO*", empId: "23120149", column: "OPERATOR/ADMIN", parentId: "VENDOR MANAGEMENT", order: 1 },
    { id: "QAC1.1.5", code: "QAC1.1.5", title: "CLAIM & COMPLAIN", name: "CANDRA MAULANA", empId: "23230082", column: "OPERATOR/ADMIN", parentId: "CLAIM & COMPLAIN", order: 1 },
  ];

  const existing = await SOBagianData.findOne({ bagianId: "qa" });
  const existingIds = new Set((existing?.boxes || []).map((b) => b.id));
  const finalBoxes = [...(existing?.boxes || [])];
  let addedCount = 0;

  boxes.forEach((b) => {
    if (!existingIds.has(b.id)) {
      finalBoxes.push(b);
      addedCount++;
      console.log(`  + Ditambahkan: ${b.code} / ${b.name}`);
    } else {
      console.log(`  - Dilewati (sudah ada): ${b.id}`);
    }
  });

  const record = await SOBagianData.findOneAndUpdate(
    { bagianId: "qa" },
    {
      bagianId: "qa",
      bagianName: "QA (Quality Assurance)",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "UNIT/STAFF LEVEL", "GROUP HEAD", "OPERATOR/ADMIN"],
      header: { effectiveDate: "", signatures: {} },
      boxes: finalBoxes,
    },
    { upsert: true, new: true }
  );

  console.log(`\nBERHASIL. ${addedCount} box baru ditambahkan. Total sekarang: ${record.boxes.length} box.`);
  await mongoose.disconnect();
}

migrate().catch((err) => { console.error("ERROR:", err); process.exit(1); });