require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const SOBagianData = require("../models/SOBagianData");
const Member = require("../models/Member");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/hr-digital";

async function findMemberByNoPNK(noPNK) {
  const m = await Member.findOne({ noPNK: noPNK.trim() });
  if (!m) console.warn(`⚠️  Member dengan noPNK "${noPNK}" tidak ditemukan di database!`);
  return m ? m._id : null;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Terhubung ke MongoDB");

  const boxes = [];

  // ---- SECTION HEAD: box container "HRGA & IT" ----
  boxes.push({
    id: "sec-hrga-it",
    code: "HRD1.0",
    title: "HRGA & IT",
    column: "SECTION HEAD",
    parentId: null,
    order: 0,
    isGroupHeader: true,
  });
  boxes.push({
    id: "emp-hrd1.0",
    code: "HRD1.0",
    title: "HRGA & IT",
    name: "DIKI WAHYUDI *",
    empId: "23060056",
    column: "SECTION HEAD",
    parentId: "sec-hrga-it",
    order: 0,
    isGroupHeader: false,
    member: await findMemberByNoPNK("23060056"),
  });
  boxes.push({
    id: "emp-hrd2.0",
    code: "HRD2.0",
    title: "HRGA & IT",
    name: "VERONICA HANI M. **",
    empId: "23240206",
    column: "SECTION HEAD",
    parentId: "sec-hrga-it",
    order: 1,
    isGroupHeader: false,
    member: await findMemberByNoPNK("23240206"),
  });

  // ---- STAFF LEVEL: box container "HRD" ----
  boxes.push({
    id: "staff-hrd",
    code: "",
    title: "HRD",
    column: "STAFF LEVEL",
    parentId: null,
    order: 0,
    isGroupHeader: true,
  });
  boxes.push({
    id: "emp-hrd1.1",
    code: "HRD1.1",
    title: "HRD",
    name: "THARISA ARRAHMA R.",
    empId: "23230072",
    column: "STAFF LEVEL",
    parentId: "staff-hrd",
    order: 0,
    isGroupHeader: false,
    member: await findMemberByNoPNK("23230072"),
  });

  // ---- STAFF LEVEL: box container "GENERAL AFFAIR & IND. RELATIONS" ----
  boxes.push({
    id: "staff-ga",
    code: "",
    title: "GENERAL AFFAIR & IND. RELATIONS",
    column: "STAFF LEVEL",
    parentId: null,
    order: 1,
    isGroupHeader: true,
  });
  boxes.push({
    id: "emp-ga1.1",
    code: "GA1.1",
    title: "GENERAL AFFAIR & IND. RELATIONS",
    name: "SUPRIADI",
    empId: "23120131",
    column: "STAFF LEVEL",
    parentId: "staff-ga",
    order: 0,
    isGroupHeader: false,
    member: await findMemberByNoPNK("23120131"),
  });
  boxes.push({
    id: "emp-ga1.2",
    code: "GA1.2",
    title: "GENERAL AFFAIR & IND. RELATIONS",
    name: "PARTINI LUPI",
    empId: "23110116",
    column: "STAFF LEVEL",
    parentId: "staff-ga",
    order: 1,
    isGroupHeader: false,
    member: await findMemberByNoPNK("23110116"),
  });
  boxes.push({
    id: "emp-ga1.3",
    code: "GA1.3",
    title: "GENERAL AFFAIR & IND. RELATIONS",
    name: "MIMBARYANTO",
    empId: "23120158",
    column: "STAFF LEVEL",
    parentId: "staff-ga",
    order: 2,
    isGroupHeader: false,
    member: await findMemberByNoPNK("23120158"),
  });

  // ---- STAFF LEVEL: box container "INFORMATION TECHNOLOGY" ----
  boxes.push({
    id: "staff-it",
    code: "",
    title: "INFORMATION TECHNOLOGY",
    column: "STAFF LEVEL",
    parentId: null,
    order: 2,
    isGroupHeader: true,
  });
  boxes.push({
    id: "emp-it1.1",
    code: "IT1.1",
    title: "INFORMATION TECHNOLOGY",
    name: "ROZIQIN",
    empId: "23070074",
    column: "STAFF LEVEL",
    parentId: "staff-it",
    order: 0,
    isGroupHeader: false,
    member: await findMemberByNoPNK("23070074"),
  });
  boxes.push({
    id: "emp-it1.2",
    code: "IT1.2",
    title: "INFORMATION TECHNOLOGY",
    name: "FARHANSYAH A.L",
    empId: "23220040",
    column: "STAFF LEVEL",
    parentId: "staff-it",
    order: 1,
    isGroupHeader: false,
    member: await findMemberByNoPNK("23220040"),
  });

  const result = await SOBagianData.findOneAndUpdate(
    { bagianId: "hrga-it" },
    {
      bagianId: "hrga-it",
      bagianName: "HRGA & IT",
      columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF LEVEL"],
      header: {
        effectiveDate: "16 Maret 2026",
        signatures: {
          preparedBy: { name: "DIKI WAHYUDI*", role: "SECTION HEAD" },
          checkedBy: { name: "BAMBANG WURYANTO", role: "DIRECTOR" },
          approvedBy: { name: "EKO MARYANTO", role: "PRESIDENT DIRECTOR" },
        },
      },
      boxes,
    },
    { upsert: true, new: true }
  );

  console.log(`✅ Seed selesai. Total boxes: ${result.boxes.length}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error seeding:", err);
  process.exit(1);
});
