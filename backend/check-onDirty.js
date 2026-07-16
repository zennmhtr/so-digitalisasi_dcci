const fs = require("fs");
const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const content = fs.readFileSync(FILE, "utf8");
const lines = content.split("\n");

const missing = [];
const has = [];

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/columnKey="([^"]+)"/);
  if (m) {
    // cari sampai 8 baris ke depan, apakah ada onDirty sebelum isEditMode
    let foundOnDirty = false;
    for (let j = i; j < i + 8 && j < lines.length; j++) {
      if (lines[j].includes("onDirty=")) { foundOnDirty = true; break; }
      if (lines[j].includes("isEditMode={isEditMode}")) break;
    }
    if (foundOnDirty) has.push(`${i + 1}: ${m[1]}`);
    else missing.push(`${i + 1}: ${m[1]}`);
  }
}

console.log(`=== PUNYA onDirty (${has.length}) ===`);
has.forEach(x => console.log("  " + x));
console.log(`\n=== TIDAK PUNYA onDirty (${missing.length}) ===`);
missing.forEach(x => console.log("  " + x));
