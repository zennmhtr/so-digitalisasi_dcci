const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

const APPLY = process.argv.includes("--apply");

const boxes = [
  { id: "mro1-1", code: "MRO1.1", title: "MANAGEMENT REPRESENTATIVE", name: "BOBI SAPUTRA", empId: "23240175", column: "STAFF", parentId: null, order: 1 },
];

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const existing = await SOBagianData.findOne({ bagianId: "management-representative" });
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
    { bagianId: "management-representative" },
    {
      bagianId: "management-representative",
      bagianName: "Management Representative",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF"],
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
