const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const startMarker = 'if (selectedDepartment.id === "manufactur-battery")';
const endMarker = 'if (selectedDepartment.id === "purchasing")';
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

function insertBeforeDraggableClose(block, nextCommentText, renderCall, label) {
  const old = `              </DraggableStack>\n              {/* ${nextCommentText} */}`;
  const insert = `                {${renderCall}}\n              </DraggableStack>\n              {/* ${nextCommentText} */}`;
  const count = block.split(old).length - 1;
  console.log(`[${label}] ditemukan: ${count}`);
  if (count !== 1) return { block, ok: false };
  return { block: block.split(old).join(insert), ok: true };
}

let r = insertBeforeDraggableClose(block, "Kolom 4 - Engineer", 'renderCustomBoxesInColumn("SENIOR ENGINEER")', "Patch 2: SENIOR ENGINEER");
block = r.block;
if (!r.ok) allOk = false;

r = insertBeforeDraggableClose(block, "Kolom 5 - Team Member/Technician", 'renderCustomBoxesInColumn("ENGINEER")', "Patch 3: ENGINEER");
block = r.block;
if (!r.ok) allOk = false;

// Patch 4 (kolom terakhir) — beda pola, diikuti </div> lalu Notes Section, bukan komentar kolom lain
const old4 = `              </DraggableStack>\n            </div>\n            {/* Notes Section */}`;
const new4 = `                {renderCustomBoxesInColumn("TEAM MEMBER/TECHNICIAN")}\n              </DraggableStack>\n            </div>\n            {/* Notes Section */}`;
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

block = block.split(old4).join(new4);

content = before + block + after;
fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
