// migrate-marketing-battery-department.js
// Jalankan SEKALI dari folder backend: node migrate-marketing-battery-department.js

const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const existing = await SOBagianData.findOne({ bagianId: "marketing-battery" });
  const existingIds = new Set((existing?.boxes || []).map((b) => b.id));

  const boxes = [
    { id: "MKT2.0", code: "MKT2.0", title: "MARKETING", name: "RENDRA PRAMONO", empId: "23200067", column: "DEPARTMENT HEAD", parentId: "MARKETING BATTERY DEPARTMENT", order: 1 },
    { id: "MKT2.1", code: "MKT2.1", title: "AUX & POWER BATTERY MARKETING", name: "CHRYSNA YULIAWAN**", empId: "23240177", column: "STAFF/SPECIALIST", parentId: "AUX & POWER BATTERY MARKETING", order: 1 },
    { id: "MKT2.2", code: "MKT2.2", title: "ESS MARKETING", name: "FERDINAND STEVANUS A**", empId: "23220049", column: "STAFF/SPECIALIST", parentId: "ESS MARKETING", order: 1 },
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
    { bagianId: "marketing-battery" },
    {
      bagianId: "marketing-battery",
      bagianName: "Marketing Battery",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF/SPECIALIST"],
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