const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const startMarker = 'if (selectedDepartment.id === "manufactur-battery")';
const endMarker = 'if (selectedDepartment.id === "purchasing")';
const startPos = content.indexOf(startMarker);
const endPos = content.indexOf(endMarker);

const before = content.slice(0, startPos);
let block = content.slice(startPos, endPos);
const after = content.slice(endPos);

let allOk = true;

// PATCH 2: sebelum penutup manbat-col3-senior (ada baris kosong sebelum komentar Kolom 4)
const old2 = "              </DraggableStack>\n\n              {/* Kolom 4 - Engineer */}";
const new2 = "                {renderCustomBoxesInColumn(\"SENIOR ENGINEER\")}\n              </DraggableStack>\n\n              {/* Kolom 4 - Engineer */}";
const count2 = block.split(old2).length - 1;
console.log(`[Patch 2: SENIOR ENGINEER] ditemukan: ${count2}`);
if (count2 !== 1) allOk = false;

// PATCH 3: sebelum penutup manbat-col4-engineer (ada baris kosong sebelum komentar Kolom 5)
const old3 = "              </DraggableStack>\n\n              {/* Kolom 5 - Team Member/Technician */}";
const new3 = "                {renderCustomBoxesInColumn(\"ENGINEER\")}\n              </DraggableStack>\n\n              {/* Kolom 5 - Team Member/Technician */}";
const count3 = block.split(old3).length - 1;
console.log(`[Patch 3: ENGINEER] ditemukan: ${count3}`);
if (count3 !== 1) allOk = false;

// PATCH 4: sebelum penutup manbat-col5-team (pola beda: </DraggableStack> lalu </div> lalu baris kosong lalu Notes Section)
const old4 = "              </DraggableStack>\n            </div>\n\n            {/* Notes Section */}";
const new4 = "                {renderCustomBoxesInColumn(\"TEAM MEMBER/TECHNICIAN\")}\n              </DraggableStack>\n            </div>\n\n            {/* Notes Section */}";
const count4 = block.split(old4).length - 1;
console.log(`[Patch 4: TEAM MEMBER/TECHNICIAN] ditemukan: ${count4}`);
if (count4 !== 1) allOk = false;

if (!allOk) {
  console.log("\n=== ADA CHECK YANG GAGAL. TIDAK ADA PERUBAHAN DITERAPKAN. ===");
  process.exit(1);
}

console.log("\n=== SEMUA CHECK OK ===");

if (!APPLY) {
  console.log("Ini baru DRY-RUN. Jalankan lagi dengan --apply untuk menerapkan.");
  process.exit(0);
}

block = block.split(old2).join(new2);
block = block.split(old3).join(new3);
block = block.split(old4).join(new4);

content = before + block + after;
fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
