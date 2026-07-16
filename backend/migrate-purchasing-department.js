// migrate-purchasing-department.js
// Jalankan SEKALI dari folder backend: node migrate-purchasing-department.js

const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const existing = await SOBagianData.findOne({ bagianId: "purchasing" });
  const existingIds = new Set((existing?.boxes || []).map((b) => b.id));

  const boxes = [
    { id: "PCH1.0", code: "PCH1.0", title: "PROCUREMENT & PURCHASING", name: "DIKI WAHYUDI* / FAKHDARENI*", empId: "23060056 / 23060055", column: "SECTION HEAD", parentId: "PURCHASING DEPARTMENT", order: 1 },
    { id: "PCH1.1", code: "PCH1.1", title: "CONTROLCABLE", name: "RIFQI FATHAH", empId: "23230017", column: "STAFF LEVEL", parentId: "CONTROLCABLE", order: 1 },
    { id: "PCH1.2", code: "PCH1.2", title: "BATTERY", name: "MARCHELINO DWI PUTRANTO", empId: "23250234", column: "STAFF LEVEL", parentId: "BATTERY", order: 1 },
    { id: "PCH1.3", code: "PCH1.3", title: "GENERAL & LEGAL", name: "SYIFA NUR MULYANI", empId: "23220060", column: "STAFF LEVEL", parentId: "GENERAL & LEGAL", order: 1 },
    { id: "PCH1.4", code: "PCH1.4", title: "SUBCONT", name: "ELITRI SULISTIYO", empId: "23110112", column: "STAFF LEVEL", parentId: "SUBCONT", order: 1 },
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
    { bagianId: "purchasing" },
    {
      bagianId: "purchasing",
      bagianName: "Purchasing",
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