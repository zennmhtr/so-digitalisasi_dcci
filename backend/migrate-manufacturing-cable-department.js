const mongoose = require("mongoose");
require("dotenv").config();
const SOBagianData = require("./models/SOBagianData");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  const boxes = [
    { id: "PRD1.0", code: "PRD1.0", title: "CONTROLCABLE MANUFACTURE", name: "KARNA SATIA SALIM*", empId: "23230114", column: "SECTION HEAD", parentId: "MANUFACTURING CABLE DEPARTMENT", order: 1 },

    { id: "PRD1.1", code: "PRD1.1", title: "MANUFACTURING UNIT", name: "DADI ROSADI", empId: "23060049", column: "STAFF / UNIT HEAD", parentId: "MANUFACTURING UNIT", order: 1 },
    { id: "PRD1.2", code: "PRD1.2", title: "ASSEMBLING UNIT", name: "M. SUGIARTO", empId: "23050024", column: "STAFF / UNIT HEAD", parentId: "ASSEMBLING UNIT", order: 1 },
    { id: "PRD1.0.1", code: "PRD1.0.1", title: "PRODUCTION ENGINEERING", name: "CHOIRUL AMIN", empId: "23110109", column: "STAFF / UNIT HEAD", parentId: "PRODUCTION ENGINEERING (UNIT HEAD)", order: 1 },

    { id: "PRD1.1.1-1", code: "PRD1.1.1", title: "GROUP CO&CI", name: "AGUS PURWANTORO", empId: "23120139", column: "GROUP HEAD", parentId: "GROUP CO & CI", order: 1 },
    { id: "PRD1.1.1-2", code: "PRD1.1.1", title: "GROUP CO&CI", name: "AJI BABAN", empId: "23120156", column: "GROUP HEAD", parentId: "GROUP CO & CI", order: 2 },
    { id: "PRD1.1.2-1", code: "PRD1.1.2", title: "GROUP PO", name: "MAYAR SANTOSO", empId: "23090089", column: "GROUP HEAD", parentId: "GROUP PO", order: 1 },
    { id: "PRD1.1.2-2", code: "PRD1.1.2", title: "GROUP PO", name: "IWAN SUPRIYADI", empId: "23110114", column: "GROUP HEAD", parentId: "GROUP PO", order: 2 },
    { id: "PRD1.2.1-1", code: "PRD1.2.1", title: "GROUP ASSEMBLING", name: "PIKI TAOFIK", empId: "23110117", column: "GROUP HEAD", parentId: "GROUP ASSEMBLING", order: 1 },
    { id: "PRD1.2.1-2", code: "PRD1.2.1", title: "GROUP ASSEMBLING", name: "DEDY IRWANSYAH", empId: "23120132", column: "GROUP HEAD", parentId: "GROUP ASSEMBLING", order: 2 },
    { id: "PRD1.2.1-3", code: "PRD1.2.1", title: "GROUP ASSEMBLING", name: "AGUNG BASUKI", empId: "23070072", column: "GROUP HEAD", parentId: "GROUP ASSEMBLING", order: 3 },
    { id: "PRD1.2.1-4", code: "PRD1.2.1", title: "GROUP ASSEMBLING", name: "YULIANTO", empId: "23110122", column: "GROUP HEAD", parentId: "GROUP ASSEMBLING", order: 4 },
    { id: "PRD1.2.1-5", code: "PRD1.2.1", title: "GROUP ASSEMBLING", name: "SOPAN", empId: "23110118", column: "GROUP HEAD", parentId: "GROUP ASSEMBLING", order: 5 },
    { id: "PRD1.2.1-6", code: "PRD1.2.1", title: "GROUP ASSEMBLING", name: "MUJIATI", empId: "23120164", column: "GROUP HEAD", parentId: "GROUP ASSEMBLING", order: 6 },
    { id: "PRD1.2.1-7", code: "PRD1.2.1", title: "GROUP ASSEMBLING", name: "HIDAYATUL", empId: "23120165", column: "GROUP HEAD", parentId: "GROUP ASSEMBLING", order: 7 },

    { id: "PRD1.1.3", code: "PRD1.1.3", title: "COMPONENT OUTER & COMPONENT INNER", name: "TEAM MEMBER", empId: "-", column: "TEAM MEMBER/ADMIN", parentId: "COMPONENT OUTER & COMPONENT INNER", order: 1 },
    { id: "PRD1.1.4", code: "PRD1.1.4", title: "PROSES OUTER", name: "TEAM MEMBER", empId: "-", column: "TEAM MEMBER/ADMIN", parentId: "PROSES OUTER", order: 1 },
    { id: "PRD1.1.5", code: "PRD1.1.5", title: "MAINTENANCE", name: "TRI YULIYANTO", empId: "23110120", column: "TEAM MEMBER/ADMIN", parentId: "MAINTENANCE", order: 1 },
    { id: "PRD1.1.6", code: "PRD1.1.6", title: "MAINTENANCE", name: "AHMAD DAYU ZAINI", empId: "23180703", column: "TEAM MEMBER/ADMIN", parentId: "MAINTENANCE", order: 2 },
    { id: "PRD1.1.7", code: "PRD1.1.7", title: "PRODUCTION ENGINEERING", name: "HANA OKTA", empId: "23120155", column: "TEAM MEMBER/ADMIN", parentId: "PRODUCTION ENGINEERING (STAFF)", order: 1 },
    { id: "PRD1.2.2", code: "PRD1.2.2", title: "ASSEMBLING", name: "TEAM MEMBER", empId: "-", column: "TEAM MEMBER/ADMIN", parentId: "ASSEMBLING", order: 1 },

    { id: "PRD1.2.3", code: "PRD1.2.3", title: "QUALITY CONTROL PROCESS", name: "SUGIHARTO (COORD)", empId: "23120137", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL PROCESS", order: 1 },
    { id: "PRD1.2.4-1", code: "PRD1.2.4", title: "QUALITY CONTROL PROCESS", name: "CIPTO RAHMAD SASONO", empId: "23060047", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL PROCESS", order: 2 },
    { id: "PRD1.2.4-2", code: "PRD1.2.4", title: "QUALITY CONTROL PROCESS", name: "DENDI SETYAWAN", empId: "23120146", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL PROCESS", order: 3 },
    { id: "PRD1.2.4-3", code: "PRD1.2.4", title: "QUALITY CONTROL PROCESS", name: "HERI MOHAMMAD AFANDI", empId: "23120138", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL PROCESS", order: 4 },
    { id: "PRD1.2.4-4", code: "PRD1.2.4", title: "QUALITY CONTROL PROCESS", name: "INDRI NOVITA SARI", empId: "23110113", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL PROCESS", order: 5 },
    { id: "PRD1.2.4-5", code: "PRD1.2.4", title: "QUALITY CONTROL PROCESS", name: "PARTO", empId: "23120140", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL PROCESS", order: 6 },
    { id: "PRD1.2.4-6", code: "PRD1.2.4", title: "QUALITY CONTROL PROCESS", name: "SUPANTO", empId: "23090091", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL PROCESS", order: 7 },
    { id: "PRD1.2.4-7", code: "PRD1.2.4", title: "QUALITY CONTROL PROCESS", name: "WANTO", empId: "23110121", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL PROCESS", order: 8 },
    { id: "PRD1.2.4-8", code: "PRD1.2.4", title: "QUALITY CONTROL PROCESS", name: "JUPRI SAHALA", empId: "23120154", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL PROCESS", order: 9 },
    { id: "PRD1.2.4-9", code: "PRD1.2.4", title: "QUALITY CONTROL PROCESS", name: "ARIYANTO", empId: "23120219", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL PROCESS", order: 10 },
    { id: "PRD1.2.4-10", code: "PRD1.2.4", title: "QUALITY CONTROL PROCESS", name: "TEAM MEMBER", empId: "-", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL PROCESS", order: 11 },

    { id: "PRD1.0.2", code: "PRD1.0.2", title: "QUALITY CONTROL INCOMING", name: "MAULANA MALIK IBRAHIM", empId: "23220078", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL INCOMING", order: 1 },
    { id: "PRD1.0.3", code: "PRD1.0.3", title: "QUALITY CONTROL INCOMING", name: "MOH. NURHIDAYAT", empId: "23120181", column: "TEAM MEMBER/ADMIN", parentId: "QUALITY CONTROL INCOMING", order: 2 },

    { id: "PRD1.0.4", code: "PRD1.0.4", title: "ADMINISTRATION", name: "DWI WIDYASTUTI", empId: "23120191", column: "TEAM MEMBER/ADMIN", parentId: "ADMINISTRATION", order: 1 },
    { id: "PRD1.0.5", code: "PRD1.0.5", title: "ADMINISTRATION", name: "MELINDA SURYANI HASIBUAN", empId: "23230008", column: "TEAM MEMBER/ADMIN", parentId: "ADMINISTRATION", order: 2 },
    { id: "PRD1.0.6", code: "PRD1.0.6", title: "ADMINISTRATION", name: "RIRIN ERLINA", empId: "23120217", column: "TEAM MEMBER/ADMIN", parentId: "ADMINISTRATION", order: 3 },
    { id: "PRD1.0.7", code: "PRD1.0.7", title: "ADMINISTRATION", name: "ANDI PUTRA MALBA SYAGGAF", empId: "23230027", column: "TEAM MEMBER/ADMIN", parentId: "ADMINISTRATION", order: 4 },
  ];

  const existing = await SOBagianData.findOne({ bagianId: "manufacturing-cable" });
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
    { bagianId: "manufacturing-cable" },
    {
      bagianId: "manufacturing-cable",
      bagianName: "Manufacturing Cable",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF / UNIT HEAD", "GROUP HEAD", "TEAM MEMBER/ADMIN"],
      header: { effectiveDate: "", signatures: {} },
      boxes: finalBoxes,
    },
    { upsert: true, new: true }
  );

  console.log(`\nBERHASIL. ${addedCount} box baru ditambahkan. Total sekarang: ${record.boxes.length} box.`);
  await mongoose.disconnect();
}

migrate().catch((err) => { console.error("ERROR:", err); process.exit(1); });