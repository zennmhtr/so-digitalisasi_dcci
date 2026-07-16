const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const startMarker = 'if (selectedDepartment.id === "mi-she")';
const endMarker = 'if (selectedDepartment.id === "manufacturing-cable")';
const startPos = content.indexOf(startMarker);
const endPos = content.indexOf(endMarker);

const before = content.slice(0, startPos);
let block = content.slice(startPos, endPos);
const after = content.slice(endPos);

function check(block, old, label) {
  const count = block.split(old).length - 1;
  console.log(`[${label}] ditemukan: ${count}`);
  return count === 1;
}

const oldD = '              </div>\n            </div>\n            <div className="mt-8 border-2 border-black p-3 inline-block">\n              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">NOTE :</h3>';
const newD = '                {renderCustomBoxesInColumn("STAFF LEVEL")}\n              </DraggableStack>\n            </div>\n            <div className="mt-8 border-2 border-black p-3 inline-block">\n              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">NOTE :</h3>';

if (!check(block, oldD, "D: Tutup Kolom4 (terakhir)")) {
  console.log("\n=== GAGAL. TIDAK ADA PERUBAHAN DITERAPKAN. ===");
  process.exit(1);
}

console.log("\n=== OK ===");

if (!APPLY) {
  console.log("Ini baru DRY-RUN. Jalankan lagi dengan --apply untuk menerapkan.");
  process.exit(0);
}

block = block.split(oldD).join(newD);

content = before + block + after;
fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
