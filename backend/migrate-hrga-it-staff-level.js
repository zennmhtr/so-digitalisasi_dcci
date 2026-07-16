// migrate-hrga-it-staff-level.js
// Jalankan SEKALI SAJA dari folder backend: node migrate-hrga-it-staff-level.js
//
// Tujuan:
// - Memindahkan posisi STAFF LEVEL hrga-it yang selama ini hardcoded
//   (THARISA, SUPRIADI, PARTINI, MIMBARYANTO, ROZIQIN, FARHANSYAH)
//   ke MongoDB, digabung dengan custom box yang sudah ada (SAHLAN, ZENN)
//   ke dalam SATU record bagianId: "hrga-it".
// - Menghapus record lama bagianId: "hrga-it__custom" (isinya sudah dipindah).
// - Tidak menyentuh Board of Director / Section Head sama sekali.

const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  // 1. Ambil custom boxes yang sudah ada (SAHLAN, ZENN) dari record lama
  const oldCustom = await SOBagianData.findOne({ bagianId: "hrga-it__custom" });
  const existingCustomBoxes = (oldCustom?.boxes || [])
    .filter((b) => b.column === "STAFF LEVEL")
    .sort((a, b) => a.order - b.order);

  console.log(`Ditemukan ${existingCustomBoxes.length} custom box existing (STAFF LEVEL):`);
  existingCustomBoxes.forEach((b) => console.log(`  - ${b.code} / ${b.name}`));

  // 2. Definisikan posisi asli yang selama ini hardcoded di frontend
  const originalBoxes = [
    { id: "HRD1.1", code: "HRD1.1", title: "HRD", name: "THARISA ARRAHMA R.", empId: "23230072", column: "STAFF LEVEL", parentId: "HRD", order: 1 },
    { id: "GA1.1", code: "GA1.1", title: "GENERAL AFFAIR & IND. RELATIONS", name: "SUPRIADI", empId: "23120131", column: "STAFF LEVEL", parentId: "GENERAL AFFAIR & IND. RELATIONS", order: 1 },
    { id: "GA1.2", code: "GA1.2", title: "GENERAL AFFAIR & IND. RELATIONS", name: "PARTINI LUPI", empId: "23110116", column: "STAFF LEVEL", parentId: "GENERAL AFFAIR & IND. RELATIONS", order: 2 },
    { id: "GA1.3", code: "GA1.3", title: "GENERAL AFFAIR & IND. RELATIONS", name: "MIMBARYANTO", empId: "23120158", column: "STAFF LEVEL", parentId: "GENERAL AFFAIR & IND. RELATIONS", order: 3 },
    { id: "IT1.1", code: "IT1.1", title: "INFORMATION TECHNOLOGY", name: "ROZIQIN", empId: "23070074", column: "STAFF LEVEL", parentId: "INFORMATION TECHNOLOGY", order: 1 },
    { id: "IT1.2", code: "IT1.2", title: "INFORMATION TECHNOLOGY", name: "FARHANSYAH A.L", empId: "23220040", column: "STAFF LEVEL", parentId: "INFORMATION TECHNOLOGY", order: 2 },
  ];

  // 3. Renumber ulang existing custom boxes per grup, supaya order lanjut dari originalBoxes
  //    (misal IT1.1=1, IT1.2=2, lalu SAHLAN=3, ZENN=4 dst — per grup masing-masing)
  const orderCounter = {};
  originalBoxes.forEach((b) => {
    orderCounter[b.parentId] = Math.max(orderCounter[b.parentId] || 0, b.order);
  });

  const renumberedCustomBoxes = existingCustomBoxes.map((b) => {
    const group = b.parentId;
    orderCounter[group] = (orderCounter[group] || 0) + 1;
    return {
      id: b.id,
      code: b.code,
      title: b.title,
      name: b.name,
      empId: b.empId,
      column: b.column,
      parentId: b.parentId,
      order: orderCounter[group],
    };
  });

  console.log("Custom box setelah renumber:");
  renumberedCustomBoxes.forEach((b) => console.log(`  - ${b.code} / ${b.name} -> order ${b.order} (group: ${b.parentId})`));

  const allBoxes = [...originalBoxes, ...renumberedCustomBoxes];

  // 4. Upsert ke record final bagianId: "hrga-it"
  const finalRecord = await SOBagianData.findOneAndUpdate(
    { bagianId: "hrga-it" },
    {
      bagianId: "hrga-it",
      bagianName: "HRGA & IT",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF LEVEL"],
      header: { effectiveDate: "", signatures: {} },
      boxes: allBoxes,
    },
    { upsert: true, new: true }
  );

  console.log(`\nBERHASIL. Record "hrga-it" sekarang punya ${finalRecord.boxes.length} box.`);

  // 5. Hapus record lama hrga-it__custom (isinya sudah pindah)
  if (oldCustom) {
    await SOBagianData.deleteOne({ bagianId: "hrga-it__custom" });
    console.log('Record lama "hrga-it__custom" sudah dihapus.');
  }

  // 6. Hapus juga record lama bagianId "hrga-it" versi percobaan sebelumnya jika strukturnya beda
  //    (sudah otomatis ditimpa oleh upsert di atas, tidak perlu langkah tambahan)

  await mongoose.disconnect();
  console.log("\nSelesai. Silakan cek hasilnya di database sebelum lanjut ke patch frontend.");
}

migrate().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
