const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const boxes = [
    { id: "MKT1.0", code: "MKT1.0", title: "MARKETING ENGINEERING", name: "ANDREAS AGUNG S.", empId: "23040119", column: "DEPARTMENT HEAD", parentId: "MARKETING ENGINEERING DEPARTMENT", order: 1 },

    { id: "MKT1.1", code: "MKT1.1", title: "SALES & MARKETING CONTROLCABLE", name: "SAVITRI OCTAVIANI", empId: "23130254", column: "SECTION HEAD", parentId: "SALES & MARKETING CONTROLCABLE (SECTION)", order: 1 },
    { id: "ENG1.0", code: "ENG1.0", title: "ENGINEERING CONTROLCABLE", name: "SUGIYARTO", empId: "23060041", column: "SECTION HEAD", parentId: "ENGINEERING CONTROLCABLE", order: 1 },

    { id: "MKT1.1.1", code: "MKT1.1.1", title: "SALES & MARKETING CONTROLCABLE", name: "RIKA TRI HARMELIA", empId: "23110101", column: "STAFF", parentId: "SALES & MARKETING CONTROLCABLE", order: 1 },
    { id: "MKT1.1.2", code: "MKT1.1.2", title: "SALES & MARKETING CONTROLCABLE", name: "KHANSA Z.H", empId: "23230110", column: "STAFF", parentId: "SALES & MARKETING CONTROLCABLE", order: 2 },
    { id: "MKT1.1.3", code: "MKT1.1.3", title: "CUSTOMER REPRESENTATIVE", name: "SUMIYARTO", empId: "23030015", column: "STAFF", parentId: "CUSTOMER REPRESENTATIVE", order: 1 },

    { id: "ENG1.1-1", code: "ENG1.1", title: "PRODUCT & QUALITY ENGINEERING CABLE", name: "NUR DWI WAHYONO", empId: "23120160", column: "STAFF", parentId: "PRODUCT & QUALITY ENGINEERING CABLE", order: 1 },
    { id: "ENG1.1-2", code: "ENG1.1", title: "PRODUCT & QUALITY ENGINEERING CABLE", name: "ALIF PRIATNA", empId: "23190773", column: "STAFF", parentId: "PRODUCT & QUALITY ENGINEERING CABLE", order: 2 },
    { id: "ENG1.1-3", code: "ENG1.1", title: "PRODUCT & QUALITY ENGINEERING CABLE", name: "ANNISA SEPTIYANING CHOIR*", empId: "23240228", column: "STAFF", parentId: "PRODUCT & QUALITY ENGINEERING CABLE", order: 3 },

    { id: "ENG1.2-1", code: "ENG1.2", title: "PROCESS ENGINEERING CABLE", name: "MUHAMMAD SYARIFUDIN", empId: "23190727", column: "STAFF", parentId: "PROCESS ENGINEERING CABLE", order: 1 },
    { id: "ENG1.2-2", code: "ENG1.2", title: "PROCESS ENGINEERING CABLE", name: "AHMAD JAELANI SIDIK*", empId: "23240227", column: "STAFF", parentId: "PROCESS ENGINEERING CABLE", order: 2 },
    { id: "ENG1.2-3", code: "ENG1.2", title: "PROCESS ENGINEERING CABLE", name: "DEDI SETIADI", empId: "23120143", column: "STAFF", parentId: "PROCESS ENGINEERING CABLE", order: 3 },

    { id: "ENG1.3-1", code: "ENG1.3", title: "NEW BUSINESS DEVELOPMENT", name: "ANNISA SETIYANING CHOIR*", empId: "23240228", column: "STAFF", parentId: "NEW BUSINESS DEVELOPMENT", order: 1 },
    { id: "ENG1.3-2", code: "ENG1.3", title: "NEW BUSINESS DEVELOPMENT", name: "AHMAD JAELANI SIDIK*", empId: "23240227", column: "STAFF", parentId: "NEW BUSINESS DEVELOPMENT", order: 2 },
  ];

  const existing = await SOBagianData.findOne({ bagianId: "marketing-engineering" });
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
    { bagianId: "marketing-engineering" },
    {
      bagianId: "marketing-engineering",
      bagianName: "Marketing Engineering",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF"],
      header: { effectiveDate: "", signatures: {} },
      boxes: finalBoxes,
    },
    { upsert: true, new: true }
  );

  console.log(`\nBERHASIL. ${addedCount} box baru ditambahkan. Total sekarang: ${record.boxes.length} box.`);
  await mongoose.disconnect();
}

migrate().catch((err) => { console.error("ERROR:", err); process.exit(1); });