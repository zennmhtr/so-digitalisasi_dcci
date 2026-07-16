// migrate-management-representative-department.js
// Jalankan SEKALI dari folder backend: node migrate-management-representative-department.js

const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const existing = await SOBagianData.findOne({ bagianId: "management-representative" });
  const existingIds = new Set((existing?.boxes || []).map((b) => b.id));

  const boxes = [
    { id: "MRO1.0", code: "MRO1.0", title: "MANAGEMENT REPRESENTATIVE", name: "SUGIYARTO*", empId: "23600041", column: "SECTION HEAD", parentId: "MANAGEMENT REPRESENTATIVE DEPARTMENT", order: 1 },
    { id: "MRO1.1", code: "MRO1.1", title: "MANAGEMENT REPRESENTATIVE", name: "BOBI SAPUTRA", empId: "23240175", column: "STAFF", parentId: "MANAGEMENT REPRESENTATIVE", order: 1 },
  ];

  let addedCount = 0;
  const finalBoxes = [...(existing?.boxes || [])];
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
    { bagianId: "management-representative" },
    {
      bagianId: "management-representative",
      bagianName: "Management Representative",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF"],
      header: { effectiveDate: "", signatures: {} },
      boxes: finalBoxes,
    },
    { upsert: true, new: true }
  );

  console.log(`\nBERHASIL. ${addedCount} box baru ditambahkan. Total sekarang: ${record.boxes.length} box.`);

  await mongoose.disconnect();
  console.log("\nSelesai.");
}

migrate().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});