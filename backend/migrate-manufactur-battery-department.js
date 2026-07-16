const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const boxes = [
    { id: "PRD2.0", code: "PRD2.0", title: "BATTERY PRODUCTION & PME", name: "DIONISIUS AUGUSTO**", empId: "23220105", column: "SENIOR ENGINEER", parentId: "MANUFACTURING BATTERY DEPARTMENT", order: 1 },

    { id: "PRD2.1", code: "PRD2.1", title: "BATTERY PRODUCTION", name: "YEREMIA SOTYA", empId: "23230135", column: "ENGINEER", parentId: "BATTERY PRODUCTION", order: 1 },
    { id: "PRD2.2", code: "PRD2.2", title: "BATTERY PRODUCTION", name: "ASEP AGUNG WIGUNA", empId: "23190805", column: "ENGINEER", parentId: "BATTERY PRODUCTION", order: 2 },
    { id: "PRD2.3", code: "PRD2.3", title: "QUALITY ASSURANCE", name: "ADHITYA SATIAWA SURYADATA", empId: "23230091", column: "ENGINEER", parentId: "QUALITY ASSURANCE", order: 1 },
    { id: "PRD3.0", code: "PRD3.0", title: "BATTERY PME", name: "TBR", empId: "-", column: "ENGINEER", parentId: "BATTERY PME", order: 1 },

    { id: "PRD2.1.1-1", code: "PRD2.1.1", title: "AUXILIARY BATTERY PRODUCT", name: "RIZAL GUNAWAN", empId: "23230055", column: "TEAM MEMBER/TECHNICIAN", parentId: "AUXILIARY BATTERY PRODUCT", order: 1 },
    { id: "PRD2.1.1-2", code: "PRD2.1.1", title: "AUXILIARY BATTERY PRODUCT", name: "MUH. NANDER", empId: "23120193", column: "TEAM MEMBER/TECHNICIAN", parentId: "AUXILIARY BATTERY PRODUCT", order: 2 },
    { id: "PRD2.1.1-3", code: "PRD2.1.1", title: "AUXILIARY BATTERY PRODUCT", name: "GANTIANTO", empId: "23120145", column: "TEAM MEMBER/TECHNICIAN", parentId: "AUXILIARY BATTERY PRODUCT", order: 3 },
    { id: "PRD2.1.1-4", code: "PRD2.1.1", title: "AUXILIARY BATTERY PRODUCT", name: "TARMUDIN", empId: "23120184", column: "TEAM MEMBER/TECHNICIAN", parentId: "AUXILIARY BATTERY PRODUCT", order: 4 },
    { id: "PRD2.1.1-5", code: "PRD2.1.1", title: "AUXILIARY BATTERY PRODUCT", name: "DEDI SUKMA", empId: "23110110", column: "TEAM MEMBER/TECHNICIAN", parentId: "AUXILIARY BATTERY PRODUCT", order: 5 },

    { id: "PRD2.1.2-1", code: "PRD2.1.2", title: "BESS PRODUCT", name: "EKO DAMAR WAHYUDI", empId: "23230115", column: "TEAM MEMBER/TECHNICIAN", parentId: "BESS PRODUCT", order: 1 },
    { id: "PRD2.1.2-2", code: "PRD2.1.2", title: "BESS PRODUCT", name: "WIDODO", empId: "23120197", column: "TEAM MEMBER/TECHNICIAN", parentId: "BESS PRODUCT", order: 2 },
    { id: "PRD2.1.2-3", code: "PRD2.1.2", title: "BESS PRODUCT", name: "SUPRIYONO", empId: "23110119", column: "TEAM MEMBER/TECHNICIAN", parentId: "BESS PRODUCT", order: 3 },
    { id: "PRD2.1.2-4", code: "PRD2.1.2", title: "BESS PRODUCT", name: "PUTRI LESTARI", empId: "23240229", column: "TEAM MEMBER/TECHNICIAN", parentId: "BESS PRODUCT", order: 4 },

    { id: "PRD2.1.3-1", code: "PRD2.1.3", title: "BEV PRODUCT", name: "RIZIQ RIDWAN", empId: "23210079", column: "TEAM MEMBER/TECHNICIAN", parentId: "BEV PRODUCT", order: 1 },
    { id: "PRD2.1.3-2", code: "PRD2.1.3", title: "BEV PRODUCT", name: "AINA WAKHORIDAH", empId: "23230053", column: "TEAM MEMBER/TECHNICIAN", parentId: "BEV PRODUCT", order: 2 },
    { id: "PRD2.1.3-3", code: "PRD2.1.3", title: "BEV PRODUCT", name: "DENDI SETIAWAN", empId: "23230054", column: "TEAM MEMBER/TECHNICIAN", parentId: "BEV PRODUCT", order: 3 },
    { id: "PRD2.1.3-4", code: "PRD2.1.3", title: "BEV PRODUCT", name: "GALIH SOMAT", empId: "23230116", column: "TEAM MEMBER/TECHNICIAN", parentId: "BEV PRODUCT", order: 4 },
    { id: "PRD2.1.3-5", code: "PRD2.1.3", title: "BEV PRODUCT", name: "M. YUNUS ARIFAI", empId: "23120192", column: "TEAM MEMBER/TECHNICIAN", parentId: "BEV PRODUCT", order: 5 },
    { id: "PRD2.1.3-6", code: "PRD2.1.3", title: "BEV PRODUCT", name: "DODIK", empId: "23120161", column: "TEAM MEMBER/TECHNICIAN", parentId: "BEV PRODUCT", order: 6 },
    { id: "PRD2.1.3-7", code: "PRD2.1.3", title: "BEV PRODUCT", name: "NACA RODIANA HENDRAYANA", empId: "23120199", column: "TEAM MEMBER/TECHNICIAN", parentId: "BEV PRODUCT", order: 7 },

    { id: "PRD2.3.1", code: "PRD2.3.1", title: "QUALITY CHECK", name: "TBR", empId: "-", column: "TEAM MEMBER/TECHNICIAN", parentId: "QUALITY CHECK", order: 1 },
  ];

  const existing = await SOBagianData.findOne({ bagianId: "manufactur-battery" });
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
    { bagianId: "manufactur-battery" },
    {
      bagianId: "manufactur-battery",
      bagianName: "Manufacturing Battery",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SENIOR ENGINEER", "ENGINEER", "TEAM MEMBER/TECHNICIAN"],
      header: { effectiveDate: "", signatures: {} },
      boxes: finalBoxes,
    },
    { upsert: true, new: true }
  );

  console.log(`\nBERHASIL. ${addedCount} box baru ditambahkan. Total sekarang: ${record.boxes.length} box.`);
  await mongoose.disconnect();
}

migrate().catch((err) => { console.error("ERROR:", err); process.exit(1); });