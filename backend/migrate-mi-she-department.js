// migrate-mi-she-department.js
// Jalankan SEKALI dari folder backend: node migrate-mi-she-department.js

const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const existing = await SOBagianData.findOne({ bagianId: "mi-she" });
  const existingIds = new Set((existing?.boxes || []).map((b) => b.id));

  const boxes = [
    { id: "MIO1.0", code: "MIO1.0", title: "MI & SHE (5R-SMK3-ISO 14001)", name: "ELIATA DUMAR GINTING", empId: "23190806", column: "SECTION HEAD", parentId: "MI & SHE DEPARTMENT", order: 1 },
    { id: "MIO1.1", code: "MIO1.1", title: "MI", name: "BOBI SAPUTRA*", empId: "23240175", column: "STAFF LEVEL", parentId: "MI", order: 1 },
    { id: "MIO1.2-1", code: "MIO1.2", title: "SHE(5R-SMK3-ISO 14001)", name: "AFKA FIKRI AIMAN (COORD)", empId: "23230122", column: "STAFF LEVEL", parentId: "SHE (5R-SMK3-ISO 14001)", order: 1 },
    { id: "MIO1.2-2", code: "MIO1.2", title: "SHE(5R-SMK3-ISO 14001)", name: "TARJO", empId: "23090096", column: "STAFF LEVEL", parentId: "SHE (5R-SMK3-ISO 14001)", order: 2 },
    { id: "MIO1.2-3", code: "MIO1.2", title: "SHE(5R-SMK3-ISO 14001)", name: "ZEL UWEYS A.A.A.A.S.A", empId: "23120171", column: "STAFF LEVEL", parentId: "SHE (5R-SMK3-ISO 14001)", order: 3 },
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
    { bagianId: "mi-she" },
    {
      bagianId: "mi-she",
      bagianName: "MI & SHE",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF LEVEL"],
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