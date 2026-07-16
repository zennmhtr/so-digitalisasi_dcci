const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/components/JobdescViewer.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const old1 = '<span className="mr-2"> :</span>';
const new1 = '<span className="mr-8"> :</span>';

const count1 = content.split(old1).length - 1;
console.log(`[Patch] Spasi setelah titik dua — ditemukan: ${count1} (harus 4)`);

if (count1 !== 4) {
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
