const mongoose = require("mongoose");
require("dotenv").config({ path: "/var/www/so-digitalisasi_dcci/backend/.env" });

const SOBagianData = require("/var/www/so-digitalisasi_dcci/backend/models/SOBagianData");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected");
  await SOBagianData.deleteMany({ bagianId: "hrga-it" });

  await SOBagianData.create({
    bagianId: "hrga-it",
    bagianName: "HRGA & IT",
    columns: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF LEVEL"],
    header: {
      effectiveDate: "16 Maret 2026",
      signatures: {
        preparedBy: { name: "DIKI WAHYUDI*", role: "SECTION HEAD" },
        checkedBy: { name: "BAMBANG WURYANTO", role: "DIRECTOR" },
        approvedBy: { name: "EKO MARYANTO", role: "PRESIDENT DIRECTOR" },
      }
    },
    boxes: [
      { id: "BOD1.0", code: "BOD1.0", title: "PRESIDENT DIRECTOR", name: "EKO MARYANTO", empId: "23200235", column: "BOARD OF DIRECTOR", parentId: null, order: 1 },
      { id: "BOD1.1", code: "BOD1.1", title: "DIRECTOR", name: "BAMBANG WURYANTO", empId: "23200038", column: "BOARD OF DIRECTOR", parentId: null, order: 2 },
      { id: "HRD1.0", code: "HRD1.0", title: "HRGA & IT", name: "DIKI WAHYUDI *", empId: "23060056", column: "SECTION HEAD", parentId: "BOD1.0", order: 1 },
      { id: "HRD2.0", code: "HRD2.0", title: "HRGA & IT", name: "VERONICA HANI M. **", empId: "23240206", column: "SECTION HEAD", parentId: "BOD1.0", order: 2 },
      { id: "HRD1.1", code: "HRD1.1", title: "HRD", name: "THARISA ARRAHMA R.", empId: "23230072", column: "STAFF LEVEL", parentId: "HRD1.0", order: 1 },
      { id: "GA1.1", code: "GA1.1", title: "GENERAL AFFAIR & IND. RELATIONS", name: "SUPRIADI", empId: "23120131", column: "STAFF LEVEL", parentId: "HRD1.0", order: 2 },
      { id: "IT1.1", code: "IT1.1", title: "IT", name: "DIKI WAHYUDI *", empId: "23060056", column: "STAFF LEVEL", parentId: "HRD1.0", order: 3 },
    ]
  });

  console.log("✅ Data HRGA-IT berhasil disimpan ke MongoDB");
  await mongoose.disconnect();
}

seed().catch(err => { console.error("❌ Error:", err); process.exit(1); });
