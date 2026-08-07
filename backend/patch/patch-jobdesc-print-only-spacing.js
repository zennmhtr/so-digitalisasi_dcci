const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/components/JobdescViewer.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");
let allOk = true;

function check(content, old, label) {
  const count = content.split(old).length - 1;
  console.log(`[${label}] ditemukan: ${count}`);
  return count;
}

// PATCH 1: ganti className titik dua (mr-8 saat ini) -> mr-2 + class khusus, jadi View kembali normal
const old1 = '<span className="mr-6"> :</span>';
const new1 = '<span className="mr-2 jobdesc-colon-gap"> :</span>';
const count1 = check(content, old1, "Patch 1: className titik dua");
if (count1 !== 4) allOk = false;

// PATCH 2: tambahkan aturan CSS khusus print untuk class jobdesc-colon-gap
const old2 = '.ml-8 { margin-left: 1.5rem !important; }\n        </style>';
const new2 = '.ml-8 { margin-left: 1.5rem !important; }\n          .jobdesc-colon-gap { margin-right: 2.5rem !important; }\n        </style>';
const count2 = check(content, old2, "Patch 2: CSS print khusus");
if (count2 !== 1) allOk = false;

if (!allOk) {
  console.log("\n=== ADA CHECK YANG GAGAL. TIDAK ADA PERUBAHAN DITERAPKAN. ===");
  process.exit(1);
}

console.log("\n=== SEMUA CHECK OK ===");

if (!APPLY) {
  console.log("Ini baru DRY-RUN. Jalankan lagi dengan --apply untuk menerapkan.");
  process.exit(0);
}

content = content.split(old1).join(new1);
content = content.split(old2).join(new2);

fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
