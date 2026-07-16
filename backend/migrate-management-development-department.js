// migrate-management-development-department.js
// Jalankan SEKALI dari folder backend: node migrate-management-development-department.js

const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const existing = await SOBagianData.findOne({ bagianId: "management-development" });
  const existingIds = new Set((existing?.boxes || []).map((b) => b.id));

  const boxes = [
    { id: "MDO1.0", code: "MDO1.0", title: "MANAGEMENT DEVELOPEMENT/PDCA", name: "KARNA SATIA SALIM*", empId: "23230114", column: "STAFF", parentId: "MANAGEMENT DEVELOPEMENT/PDCA", order: 1 },
    { id: "MDO2.0", code: "MDO2.0", title: "MANAGEMENT DEVELOPEMENT/PDCA", name: "WAHYU KARTIKO ADI", empId: "23240005", column: "STAFF", parentId: "MANAGEMENT DEVELOPEMENT/PDCA", order: 2 },
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
    { bagianId: "management-development" },
    {
      bagianId: "management-development",
      bagianName: "Management Development",
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