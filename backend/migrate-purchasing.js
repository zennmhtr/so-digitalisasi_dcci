// migrate-purchasing.js
// node migrate-purchasing.js       -> dry-run (tampilkan saja)
// node migrate-purchasing.js --apply  -> terapkan ke database

const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

const APPLY = process.argv.includes("--apply");

const boxes = [
  { id: "pch1-1", code: "PCH1.1", title: "CONTROLCABLE", name: "RIFQI FATHAH", empId: "23230017", column: "STAFF LEVEL", parentId: null, order: 1 },
  { id: "pch1-2", code: "PCH1.2", title: "BATTERY", name: "MARCHELINO DWI PUTRANTO", empId: "23250234", column: "STAFF LEVEL", parentId: null, order: 2 },
  { id: "pch1-3", code: "PCH1.3", title: "GENERAL & LEGAL", name: "SYIFA NUR MULYANI", empId: "23220060", column: "STAFF LEVEL", parentId: null, order: 3 },
  { id: "pch1-4", code: "PCH1.4", title: "SUBCONT", name: "ELITRI SULISTIYO", empId: "23110112", column: "STAFF LEVEL", parentId: null, order: 4 },
];

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const existing = await SOBagianData.findOne({ bagianId: "purchasing" });
  const existingIds = new Set((existing?.boxes || []).map((b) => b.id));

  console.log(`Record "purchasing" saat ini: ${existing ? existing.boxes.length : 0} box.`);
  console.log("Akan ditambahkan:");
  const toAdd = boxes.filter((b) => !existingIds.has(b.id));
  toAdd.forEach((b) => console.log(`  + ${b.code} / ${b.name}`));
  const skipped = boxes.filter((b) => existingIds.has(b.id));
  skipped.forEach((b) => console.log(`  - dilewati (sudah ada): ${b.id}`));

  if (!APPLY) {
    console.log("\nIni baru DRY-RUN. Jalankan dengan --apply untuk menerapkan.");
    await mongoose.disconnect();
    return;
  }

  const allBoxes = [...(existing?.boxes || []), ...toAdd];

  await SOBagianData.findOneAndUpdate(
    { bagianId: "purchasing" },
    {
      bagianId: "purchasing",
      bagianName: "Purchasing",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF LEVEL"],
      header: { effectiveDate: existing?.header?.effectiveDate || "", signatures: existing?.header?.signatures || {} },
      boxes: allBoxes,
    },
    { upsert: true, new: true }
  );

  console.log(`\nBERHASIL. Total box sekarang: ${allBoxes.length}`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
