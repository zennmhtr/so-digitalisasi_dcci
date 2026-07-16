const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const old1 = `              {/* Kolom 2 - Department Head (Empty) */}
              <div className="space-y-4 flex flex-col items-center">
                {/* Kosong sesuai layout */}
              </div>`;
const new1 = `              {/* Kolom 2 - Department Head */}
              <div className="space-y-4 flex flex-col items-center">
                {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
              </div>`;

const count1 = content.split(old1).length - 1;
console.log(`[Patch 1] Kolom 2 Department Head — ditemukan: ${count1}`);

if (count1 !== 1) {
  console.log("=== GAGAL. TIDAK ADA PERUBAHAN DITERAPKAN. ===");
  process.exit(1);
}

console.log("=== OK ===");

if (!APPLY) {
  console.log("Ini baru DRY-RUN. Jalankan lagi dengan --apply untuk menerapkan.");
  process.exit(0);
}

content = content.split(old1).join(new1);
fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
