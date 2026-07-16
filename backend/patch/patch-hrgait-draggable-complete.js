const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const startMarker = 'if (selectedDepartment.id === "hrga-it")';
const endMarker = 'if (selectedDepartment.id === "management-development")';
const startPos = content.indexOf(startMarker);
const endPos = content.indexOf(endMarker);

if (startPos === -1 || endPos === -1) {
  console.log("GAGAL: marker department tidak ditemukan.");
  process.exit(1);
}

const before = content.slice(0, startPos);
let block = content.slice(startPos, endPos);
const after = content.slice(endPos);

let allOk = true;
function check(block, old, label) {
  const count = block.split(old).length - 1;
  console.log(`[${label}] ditemukan: ${count}`);
  return count === 1;
}

// PATCH A: bungkus Kolom 2 (Department Head)
const oldA = '              {/* Kolom 2 - Department Head */}\n              <div className="space-y-4 flex flex-col items-center">\n                {renderCustomBoxesInColumn("DEPARTMENT HEAD")}\n              </div>';
const newA = '              {/* Kolom 2 - Department Head */}\n              <DraggableStack\n                deptId={selectedDepartment.id}\n                columnKey="hrga-it-col2-depthead"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}\n                isEditMode={isEditMode}\n                minHeight={160}\n              >\n                {renderCustomBoxesInColumn("DEPARTMENT HEAD")}\n              </DraggableStack>';
if (!check(block, oldA, "A: Bungkus Kolom 2")) allOk = false;

// PATCH B: tambah onDirty di hrga-it-col3-section
const oldB = '                columnKey="hrga-it-col3-section"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                isEditMode={isEditMode}';
const newB = '                columnKey="hrga-it-col3-section"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}\n                isEditMode={isEditMode}';
if (!check(block, oldB, "B: onDirty Kolom 3")) allOk = false;

// PATCH C: tambah onDirty di hrga-it-col4-staff
const oldC = '                columnKey="hrga-it-col4-staff"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                isEditMode={isEditMode}';
const newC = '                columnKey="hrga-it-col4-staff"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}\n                isEditMode={isEditMode}';
if (!check(block, oldC, "C: onDirty Kolom 4")) allOk = false;

if (!allOk) {
  console.log("\n=== ADA CHECK YANG GAGAL. TIDAK ADA PERUBAHAN DITERAPKAN. ===");
  process.exit(1);
}

console.log("\n=== SEMUA CHECK OK ===");

if (!APPLY) {
  console.log("Ini baru DRY-RUN. Jalankan lagi dengan --apply untuk menerapkan.");
  process.exit(0);
}

block = block.split(oldA).join(newA);
block = block.split(oldB).join(newB);
block = block.split(oldC).join(newC);

content = before + block + after;
fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
