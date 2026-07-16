const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const startMarker = 'if (selectedDepartment.id === "manufacturing-cable")';
const endMarker = 'if (selectedDepartment.id === "finance")';
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

function checkAndReplace(block, old, newStr, label) {
  const count = block.split(old).length - 1;
  console.log(`[${label}] ditemukan: ${count}`);
  return { count, ok: count === 1 };
}

// PATCH 1: KOLOM 2 - Department Head (kosong -> render)
const old1 = `              {/* KOLOM 2 - DEPARTMENT HEAD (kosong) */}
              <div className="space-y-4 flex flex-col items-center"></div>`;
const new1 = `              {/* KOLOM 2 - DEPARTMENT HEAD */}
              <div className="space-y-4 flex flex-col items-center">{renderCustomBoxesInColumn("DEPARTMENT HEAD")}</div>`;
let r1 = checkAndReplace(block, old1, new1, "Patch 1: DEPARTMENT HEAD");
if (!r1.ok) allOk = false;

// PATCH 2: sebelum penutup mancable-col3-section
const old2 = "              </DraggableStack>\n\n              {/* KOLOM 4 - STAFF / UNIT HEAD */}";
const new2 = "                {renderCustomBoxesInColumn(\"SECTION HEAD\")}\n              </DraggableStack>\n\n              {/* KOLOM 4 - STAFF / UNIT HEAD */}";
let r2 = checkAndReplace(block, old2, new2, "Patch 2: SECTION HEAD");
if (!r2.ok) allOk = false;

// PATCH 3: sebelum penutup mancable-col4-staff
const old3 = "              </DraggableStack>\n\n              {/* KOLOM 5 - GROUP HEAD */}";
const new3 = "                {renderCustomBoxesInColumn(\"STAFF / UNIT HEAD\")}\n              </DraggableStack>\n\n              {/* KOLOM 5 - GROUP HEAD */}";
let r3 = checkAndReplace(block, old3, new3, "Patch 3: STAFF / UNIT HEAD");
if (!r3.ok) allOk = false;

// PATCH 4: sebelum penutup mancable-col5-group
const old4 = "              </DraggableStack>\n\n              {/* KOLOM 6 - TEAM MEMBER / ADMIN */}";
const new4 = "                {renderCustomBoxesInColumn(\"GROUP HEAD\")}\n              </DraggableStack>\n\n              {/* KOLOM 6 - TEAM MEMBER / ADMIN */}";
let r4 = checkAndReplace(block, old4, new4, "Patch 4: GROUP HEAD");
if (!r4.ok) allOk = false;

// PATCH 5: sebelum penutup mancable-col6-team
const old5 = "              </DraggableStack>\n            </div>\n\n            <div className=\"mt-8 border-2 border-black p-3 inline-block\">";
const new5 = "                {renderCustomBoxesInColumn(\"TEAM MEMBER/ADMIN\")}\n              </DraggableStack>\n            </div>\n\n            <div className=\"mt-8 border-2 border-black p-3 inline-block\">";
let r5 = checkAndReplace(block, old5, new5, "Patch 5: TEAM MEMBER/ADMIN");
if (!r5.ok) allOk = false;

if (!allOk) {
  console.log("\n=== ADA CHECK YANG GAGAL. TIDAK ADA PERUBAHAN DITERAPKAN. ===");
  process.exit(1);
}

console.log("\n=== SEMUA CHECK OK ===");

if (!APPLY) {
  console.log("Ini baru DRY-RUN. Jalankan lagi dengan --apply untuk menerapkan.");
  process.exit(0);
}

block = block.split(old1).join(new1);
block = block.split(old2).join(new2);
block = block.split(old3).join(new3);
block = block.split(old4).join(new4);
block = block.split(old5).join(new5);

content = before + block + after;
fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
