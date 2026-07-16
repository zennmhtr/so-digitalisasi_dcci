// fix-mi-she-duplicates.js
// Jalankan SEKALI dari folder backend: node fix-mi-she-duplicates.js

const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const record = await SOBagianData.findOne({ bagianId: "mi-she" });
  if (!record) {
    console.log("Record mi-she tidak ditemukan.");
    process.exit(1);
  }

  console.log("Box sebelum fix:");
  record.boxes.forEach((b) => console.log(`  ${b.id} | ${b.code} | ${b.name}`));

  // 1. Hapus box format lama (id huruf kecil)
  const oldIds = ["mio1-1", "mio1-2-a", "mio1-2-b", "mio1-2-c"];
  record.boxes = record.boxes.filter((b) => !oldIds.includes(b.id));

  // 2. Pastikan MIO1.1 (format baru, BOBI SAPUTRA) ada
  const hasNewMio11 = record.boxes.some((b) => b.id === "MIO1.1");
  if (!hasNewMio11) {
    record.boxes.push({
      id: "MIO1.1",
      code: "MIO1.1",
      title: "MI",
      name: "BOBI SAPUTRA*",
      empId: "23240175",
      column: "STAFF LEVEL",
      parentId: "MI",
      order: 1,
    });
    console.log("  + MIO1.1 (BOBI SAPUTRA*) ditambahkan ulang dengan format baru");
  }

  await record.save();

  console.log("\nBox setelah fix:");
  record.boxes.forEach((b) => console.log(`  ${b.id} | ${b.code} | ${b.name}`));

  await mongoose.disconnect();
  console.log("\nBERES.");
}

fix().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});