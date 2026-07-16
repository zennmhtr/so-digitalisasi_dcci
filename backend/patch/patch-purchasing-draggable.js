const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const startMarker = 'if (selectedDepartment.id === "purchasing")';
const endMarker = 'if (selectedDepartment.id === "mi-she")';
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

const dsOpen = (colKey, minH) => `<DraggableStack
                deptId={selectedDepartment.id}
                columnKey="${colKey}"
                boxPositions={boxPositions}
                setPositionsForDept={setPositionsForDept}
                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                isEditMode={isEditMode}
                minHeight={${minH}}
              >`;

// Opening tags (4 kolom)
const opens = [
  { comment: "Kolom 1 - Board of Director", colKey: "purch-col1-bod", minH: 280 },
  { comment: "Kolom 2 - Department Head", colKey: "purch-col2-depthead", minH: 160 },
  { comment: "Kolom 3 - Section Head", colKey: "purch-col3-section", minH: 200 },
  { comment: "Kolom 4 - Staff Level", colKey: "purch-col4-staff", minH: 500 },
];

opens.forEach((o) => {
  const old = `{/* ${o.comment} */}\n              <div className="space-y-4 flex flex-col items-center">`;
  const newStr = `{/* ${o.comment} */}\n              ${dsOpen(o.colKey, o.minH)}`;
  if (!check(block, old, `Open: ${o.comment}`)) allOk = false;
  block = block.split(old).join(newStr);
});

// Closing tags: antar kolom (ditandai comment kolom BERIKUTNYA)
const closesBetween = [
  "Kolom 2 - Department Head",
  "Kolom 3 - Section Head",
  "Kolom 4 - Staff Level",
];
closesBetween.forEach((nextComment) => {
  const old = `</div>\n              {/* ${nextComment} */}`;
  const newStr = `</DraggableStack>\n              {/* ${nextComment} */}`;
  if (!check(block, old, `Close before: ${nextComment}`)) allOk = false;
  block = block.split(old).join(newStr);
});

// Closing tag kolom terakhir (sebelum Notes Section)
const oldLast = `              </div>\n            </div>\n            {/* Notes Section */}`;
const newLast = `              </DraggableStack>\n            </div>\n            {/* Notes Section */}`;
if (!check(block, oldLast, "Close: Kolom 4 (terakhir)")) allOk = false;

if (!allOk) {
  console.log("\n=== ADA CHECK YANG GAGAL. TIDAK ADA PERUBAHAN DITERAPKAN. ===");
  process.exit(1);
}

console.log("\n=== SEMUA CHECK OK ===");

if (!APPLY) {
  console.log("Ini baru DRY-RUN. Jalankan lagi dengan --apply untuk menerapkan.");
  process.exit(0);
}

block = block.split(oldLast).join(newLast);

content = before + block + after;
fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
