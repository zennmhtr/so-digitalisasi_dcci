// migrate-hrga-it-section-head.js
// Jalankan SEKALI dari folder backend: node migrate-hrga-it-section-head.js
// Aman dijalankan berkali-kali (skip box yang id-nya sudah ada).

const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const record = await SOBagianData.findOne({ bagianId: "hrga-it" });
  if (!record) {
    console.log("ERROR: record hrga-it tidak ditemukan. Jalankan migrate-hrga-it-staff-level.js dulu.");
    process.exit(1);
  }

  console.log(`Record hrga-it ditemukan, saat ini punya ${record.boxes.length} box.`);

  const existingIds = new Set(record.boxes.map((b) => b.id));
  const newBoxes = [
    { id: "HRD1.0", code: "HRD1.0", title: "HRGA & IT", name: "DIKI WAHYUDI *", empId: "23060056", column: "SECTION HEAD", parentId: "HRGA & IT DEPARTMENT", order: 1 },
    { id: "HRD2.0", code: "HRD2.0", title: "HRGA & IT", name: "VERONICA HANI M. **", empId: "23240206", column: "SECTION HEAD", parentId: "HRGA & IT DEPARTMENT", order: 2 },
  ];

  let addedCount = 0;
  newBoxes.forEach((b) => {
    if (!existingIds.has(b.id)) {
      record.boxes.push(b);
      addedCount++;
      console.log(`  + Ditambahkan: ${b.code} / ${b.name}`);
    } else {
      console.log(`  - Dilewati (sudah ada): ${b.id}`);
    }
  });

  await record.save();
  console.log(`\nBERHASIL. ${addedCount} box baru ditambahkan. Total sekarang: ${record.boxes.length} box.`);

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
