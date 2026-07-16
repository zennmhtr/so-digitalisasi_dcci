const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const missingKeys = [
  "mancable-col1-bod", "mancable-col3-section", "mancable-col4-staff", "mancable-col5-group", "mancable-col6-team",
  "finance-col1-bod", "finance-col3-section", "finance-col4-staff",
  "mkteng-col1-bod", "mkteng-col2-depthead", "mkteng-col3-section", "mkteng-col4-staff",
  "ppic-col1-bod", "ppic-col2-depthead", "ppic-col4-unitstaff", "ppic-col5-grouphead", "ppic-col6-member",
  "qa-col1-bod", "qa-col2-depthead", "qa-col3-unitstaff", "qa-col4-grouphead", "qa-col5-operator",
];

let allOk = true;
let totalApplied = 0;
const results = [];

missingKeys.forEach((key) => {
  const old = `columnKey="${key}"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                isEditMode={isEditMode}`;
  const newStr = `columnKey="${key}"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}\n                isEditMode={isEditMode}`;
  const count = content.split(old).length - 1;
  results.push(`${key}: ditemukan ${count}`);
  if (count !== 1) allOk = false;
  else content = content.split(old).join(newStr);
});

console.log(results.join("\n"));

if (!allOk) {
  console.log("\n=== ADA YANG GAGAL (bukan persis 1). CEK SATU-SATU DULU. ===");
  process.exit(1);
}

console.log(`\n=== SEMUA ${missingKeys.length} COCOK ===`);

if (!APPLY) {
  console.log("Ini baru DRY-RUN (tidak ada perubahan tersimpan karena mode simulasi). Jalankan dengan --apply untuk menerapkan.");
  process.exit(0);
}

fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: semua onDirty diterapkan.");
