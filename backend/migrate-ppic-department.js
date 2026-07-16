const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const boxes = [
    { id: "PPIC1.0", code: "PPIC1.0", title: "PPIC", name: "DIKI WAHYUDI*", empId: "23060056", column: "DEPARTMENT HEAD", parentId: "PPIC DEPARTMENT", order: 1 },

    { id: "PPIC1.1", code: "PPIC1.1", title: "PPC CONTROLCABLE", name: "ADE AKHMAD FAUZI*", empId: "23090093", column: "UNIT HEAD/STAFF", parentId: "PPC CONTROLCABLE", order: 1 },
    { id: "PPIC1.2", code: "PPIC1.2", title: "BATTERY & AHM OES", name: "BUCHORI**", empId: "23120159", column: "UNIT HEAD/STAFF", parentId: "BATTERY & AHM OES", order: 1 },
    { id: "PPIC1.3", code: "PPIC1.3", title: "WHS CONTROLCABLE", name: "ANANG SUTAMTOMO**", empId: "23080082", column: "UNIT HEAD/STAFF", parentId: "WHS CONTROLCABLE", order: 1 },

    { id: "PPIC1.3.1", code: "PPIC1.3.1", title: "CONTROLCABLE", name: "SETIYONO", empId: "23090090", column: "GROUP HEAD", parentId: "CONTROLCABLE", order: 1 },

    { id: "PPIC1.1.1", code: "PPIC1.1.1", title: "PROD PLAN", name: "ERLI SULIANTO", empId: "23070073", column: "MEMBER", parentId: "PROD PLAN", order: 1 },
    { id: "PPIC1.1.2", code: "PPIC1.1.2", title: "DN/MANIFEST", name: "EFRAIN TAMBUNAN", empId: "23110111", column: "MEMBER", parentId: "DN/MANIFEST", order: 1 },
    { id: "PPIC1.1.3", code: "PPIC1.1.3", title: "DELIVERY", name: "SUDARMANTO", empId: "23120151", column: "MEMBER", parentId: "DELIVERY", order: 1 },
    { id: "PPIC1.1.4", code: "PPIC1.1.4", title: "DELIVERY", name: "OPERATOR", empId: "-", column: "MEMBER", parentId: "DELIVERY", order: 2 },
    { id: "PPIC1.2.1", code: "PPIC1.2.1", title: "BATTERY", name: "SRI NATIN", empId: "231202130", column: "MEMBER", parentId: "BATTERY", order: 1 },
    { id: "PPIC1.2.2", code: "PPIC1.2.2", title: "BATTERY STAFF", name: "M. HAMAM MUCHLISIN", empId: "23120174", column: "MEMBER", parentId: "BATTERY", order: 2 },
    { id: "PPIC1.3.2", code: "PPIC1.3.2", title: "SUPPLIER CONTROL", name: "SULASTRI", empId: "23120190", column: "MEMBER", parentId: "SUPPLIER CONTROL", order: 1 },
    { id: "PPIC1.3.3", code: "PPIC1.3.3", title: "MRP", name: "LAILA FITRIYAH", empId: "23120196", column: "MEMBER", parentId: "MRP", order: 1 },
    { id: "PPIC1.3.4", code: "PPIC1.3.4", title: "RM & OHP", name: "SUPRIYANTO", empId: "23120153", column: "MEMBER", parentId: "RM & OHP", order: 1 },
    { id: "PPIC1.3.5", code: "PPIC1.3.5", title: "HASIL PRODUKGAS", name: "RAGIL PAMUNGKAS", empId: "23120134", column: "MEMBER", parentId: "RM & OHP", order: 2 },
    { id: "PPIC1.3.6", code: "PPIC1.3.6", title: "SUPPLY", name: "OPERATOR (2)", empId: "-", column: "MEMBER", parentId: "SUPPLY", order: 1 },
  ];

  const existing = await SOBagianData.findOne({ bagianId: "ppic" });
  const existingIds = new Set((existing?.boxes || []).map((b) => b.id));
  const finalBoxes = [...(existing?.boxes || [])];
  let addedCount = 0;

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
    { bagianId: "ppic" },
    {
      bagianId: "ppic",
      bagianName: "PPIC",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "UNIT HEAD/STAFF", "GROUP HEAD", "MEMBER"],
      header: { effectiveDate: "", signatures: {} },
      boxes: finalBoxes,
    },
    { upsert: true, new: true }
  );

  console.log(`\nBERHASIL. ${addedCount} box baru ditambahkan. Total sekarang: ${record.boxes.length} box.`);
  await mongoose.disconnect();
}

migrate().catch((err) => { console.error("ERROR:", err); process.exit(1); });