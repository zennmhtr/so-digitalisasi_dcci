const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const startMarker = 'if (selectedDepartment.id === "marketing-battery")';
const endMarker = 'if (selectedDepartment.id === "marketing-engineering")';
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

// PATCH A: bungkus Kolom 1 BOD
const oldA = '              <div className="space-y-4 flex flex-col items-center">\n                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">\n                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">\n                    <p className="text-sm font-bold">BOD1.0</p>';
const newA = '              <DraggableStack\n                deptId={selectedDepartment.id}\n                columnKey="mktbat-col1-bod"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}\n                isEditMode={isEditMode}\n                minHeight={280}\n              >\n                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">\n                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">\n                    <p className="text-sm font-bold">BOD1.0</p>';
if (!check(block, oldA, "A: Buka Kolom 1 BOD")) allOk = false;

// PATCH B: tutup Kolom 1 (sebelum Kolom 2)
const oldB = '                    <p className="text-sm leading-tight">(23200038)</p>\n                  </div>\n                </div>\n              </div>\n\n              {/* Kolom 2 - Department Head */}';
const newB = '                    <p className="text-sm leading-tight">(23200038)</p>\n                  </div>\n                </div>\n              </DraggableStack>\n\n              {/* Kolom 2 - Department Head */}';
if (!check(block, oldB, "B: Tutup Kolom 1")) allOk = false;

// PATCH C: tambah onDirty di DraggableStack Kolom 2 (mktbat-col2-depthead)
const oldC = '                columnKey="mktbat-col2-depthead"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                isEditMode={isEditMode}';
const newC = '                columnKey="mktbat-col2-depthead"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}\n                isEditMode={isEditMode}';
if (!check(block, oldC, "C: onDirty Kolom 2")) allOk = false;

// PATCH D: tambah onDirty di DraggableStack Kolom 3 (mktbat-col3-staff)
const oldD = '                columnKey="mktbat-col3-staff"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                isEditMode={isEditMode}';
const newD = '                columnKey="mktbat-col3-staff"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}\n                isEditMode={isEditMode}';
if (!check(block, oldD, "D: onDirty Kolom 3")) allOk = false;

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
block = block.split(oldD).join(newD);

content = before + block + after;
fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
