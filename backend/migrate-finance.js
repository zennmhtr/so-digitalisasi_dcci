const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

const APPLY = process.argv.includes("--apply");

const boxes = [
  { id: "fin-1", code: "FIN1.1", title: "FINANCE & ACCOUNTING", name: "FAKHDARENI", empId: "23060055", column: "STAFF", parentId: null, order: 1 },
  { id: "fin-2", code: "FIN1.2", title: "FINANCE & ACCOUNTING", name: "KHOIRUNNISA", empId: "23170572", column: "STAFF", parentId: null, order: 2 },
  { id: "fin-3", code: "FIN1.3", title: "FINANCE & ACCOUNTING", name: "SITI ROKHAYATI", empId: "23120177", column: "STAFF", parentId: null, order: 3 },
  { id: "fin-4", code: "FIN1.4", title: "FINANCE & ACCOUNTING", name: "ANNISA NUR HANDAYANI", empId: "23120198", column: "STAFF", parentId: null, order: 4 },
];

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const existing = await SOBagianData.findOne({ bagianId: "finance" });
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
    { bagianId: "finance" },
    {
      bagianId: "finance",
      bagianName: "Finance",
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
