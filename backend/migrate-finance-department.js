// migrate-finance-department.js
// Jalankan SEKALI dari folder backend: node migrate-finance-department.js
//
// Tujuan: memindahkan posisi Finance yang selama ini hardcoded di frontend
// (YULIUS PERMATA sebagai dept head, FAKHDARENI/KHOIRUNNISA/SITI/ANNISA sebagai staff)
// ke MongoDB (bagianId: "finance"), supaya bisa dihapus/diedit lewat SO Bagian Editor
// dengan alur approval, sama seperti HRGA & IT.

const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const existing = await SOBagianData.findOne({ bagianId: "finance" });
  const existingIds = new Set((existing?.boxes || []).map((b) => b.id));

  const boxes = [
    // Department Head (tampil di kolom "SECTION HEAD" secara visual, sama seperti pola HRGA & IT)
    { id: "FIN1.0", code: "FIN1.0", title: "FINANCE & ACCOUNTING", name: "YULIUS PERMATA", empId: "23220017", column: "SECTION HEAD", parentId: "FINANCE DEPARTMENT", order: 1 },
    // Staff
    { id: "FIN1.1", code: "FIN1.1", title: "FINANCE & ACCOUNTING", name: "FAKHDARENI", empId: "23060055", column: "STAFF", parentId: "FINANCE & ACCOUNTING", order: 1 },
    { id: "FIN1.2", code: "FIN1.2", title: "FINANCE & ACCOUNTING", name: "KHOIRUNNISA", empId: "23170572", column: "STAFF", parentId: "FINANCE & ACCOUNTING", order: 2 },
    { id: "FIN1.3", code: "FIN1.3", title: "FINANCE & ACCOUNTING", name: "SITI ROKHAYATI", empId: "23120177", column: "STAFF", parentId: "FINANCE & ACCOUNTING", order: 3 },
    { id: "FIN1.4", code: "FIN1.4", title: "FINANCE & ACCOUNTING", name: "ANNISA NUR HANDAYANI", empId: "23120198", column: "STAFF", parentId: "FINANCE & ACCOUNTING", order: 4 },
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
    { bagianId: "finance" },
    {
      bagianId: "finance",
      bagianName: "Finance",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF"],
      header: { effectiveDate: "", signatures: {} },
      boxes: finalBoxes,
    },
    { upsert: true, new: true }
  );

  console.log(`\nBERHASIL. ${addedCount} box baru ditambahkan. Total sekarang: ${record.boxes.length} box.`);

  await mongoose.disconnect();
  console.log("\nSelesai. Cek dulu di database sebelum lanjut patch frontend.");
}

migrate().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});