const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

const APPLY = process.argv.includes("--apply");

const boxes = [
  { id: "mio1-1", code: "MIO1.1", title: "MI", name: "BOBI SAPUTRA*", empId: "23240175", column: "STAFF LEVEL", parentId: "MI", order: 1 },
  { id: "mio1-2-a", code: "MIO1.2", title: "SHE(5R-SMK3-ISO 14001)", name: "AFKA FIKRI AIMAN (COORD)", empId: "23230122", column: "STAFF LEVEL", parentId: "SHE(5R-SMK3-ISO 14001)", order: 2 },
  { id: "mio1-2-b", code: "MIO1.2", title: "SHE(5R-SMK3-ISO 14001)", name: "TARJO", empId: "23090096", column: "STAFF LEVEL", parentId: "SHE(5R-SMK3-ISO 14001)", order: 3 },
  { id: "mio1-2-c", code: "MIO1.2", title: "SHE(5R-SMK3-ISO 14001)", name: "ZEL UWEYS A.A.A.A.S.A", empId: "23120171", column: "STAFF LEVEL", parentId: "SHE(5R-SMK3-ISO 14001)", order: 4 },
];

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const existing = await SOBagianData.findOne({ bagianId: "mi-she" });
  const existingIds = new Set((existing?.boxes || []).map((b) => b.id));

  console.log(`Record saat ini: ${existing ? existing.boxes.length : 0} box.`);
  const toAdd = boxes.filter((b) => !existingIds.has(b.id));
  toAdd.forEach((b) => console.log(`  + ${b.code} / ${b.name}`));
  boxes.filter((b) => existingIds.has(b.id)).forEach((b) => console.log(`  - dilewati: ${b.id}`));

  if (!APPLY) {
    console.log("\nIni baru DRY-RUN. Jalankan dengan --apply untuk menerapkan.");
    await mongoose.disconnect();
    return;
  }

  const allBoxes = [...(existing?.boxes || []), ...toAdd];

  await SOBagianData.findOneAndUpdate(
    { bagianId: "mi-she" },
    {
      bagianId: "mi-she",
      bagianName: "MI & SHE",
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
