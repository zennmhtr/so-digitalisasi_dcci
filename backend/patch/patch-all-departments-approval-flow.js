// patch-all-departments-approval-flow.js (v2 - anchor lebih sederhana)
const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/backend/routes/so-bagian-change-requests.js";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

function countOccurrences(str, sub) {
  let count = 0, pos = 0;
  while ((pos = str.indexOf(sub, pos)) !== -1) { count++; pos += 1; }
  return count;
}

let allOk = true;

// PATCH 1: mapping + helper (sudah terbukti cocok sebelumnya)
const old1 = `const SOBagianData = require("../models/SOBagianData");
const router = express.Router();`;

const new1 = `const SOBagianData = require("../models/SOBagianData");
const router = express.Router();

const DEPARTMENT_NAME_TO_BAGIAN_ID = {
  "Finance": "finance",
  "Finance Department": "finance",
  "HRGA & IT": "hrga-it",
  "HRGA & IT Department": "hrga-it",
  "Management Development": "management-development",
  "Management Representative": "management-representative",
  "Manufacturing Battery": "manufactur-battery",
  "Manufacturing Cable": "manufacturing-cable",
  "Marketing Battery": "marketing-battery",
  "Marketing Battery Department": "marketing-battery",
  "Marketing Engineering": "marketing-engineering",
  "MI & SHE": "mi-she",
  "PPIC": "ppic",
  "Purchasing": "purchasing",
  "QA": "qa",
  "QA Department": "qa",
  "QA (Quality Assurance)": "qa",
};

async function applyBoxChangeIfNeeded(request) {
  if (request.changeType !== "add" && request.changeType !== "delete") return;
  const bagianId = DEPARTMENT_NAME_TO_BAGIAN_ID[request.department];
  if (!bagianId) {
    console.log(\`⚠️ applyBoxChangeIfNeeded: department "\${request.department}" tidak ada di mapping, dilewati.\`);
    return;
  }
  const record = await SOBagianData.findOne({ bagianId });
  if (!record) return;
  if (request.changeType === "add" && request.proposedData?.boxData) {
    const box = request.proposedData.boxData;
    const exists = record.boxes.some((b) => b.id === box.id);
    if (!exists) {
      record.boxes.push({
        id: box.id,
        code: box.code || "",
        title: box.title || "",
        name: box.name || "",
        empId: box.empId || "",
        column: box.column,
        parentId: box.groupKey || null,
        order: box.order || 0,
      });
      await record.save();
      console.log(\`✅ Box "\${box.name}" diterapkan permanen ke \${bagianId}\`);
    }
  } else if (request.changeType === "delete" && request.currentData?.removedBox) {
    const removedId = request.currentData.removedBox.id;
    const before = record.boxes.length;
    record.boxes = record.boxes.filter((b) => b.id !== removedId);
    if (record.boxes.length !== before) {
      await record.save();
      console.log(\`✅ Box "\${request.currentData.removedBox.name}" dihapus permanen dari \${bagianId}\`);
    }
  }
}`;

const count1 = countOccurrences(content, old1);
console.log(`[Patch 1] Import + mapping + helper — ditemukan: ${count1}`);
if (count1 !== 1) allOk = false;

// PATCH 2+3: sisipkan applyBoxChangeIfNeeded setelah SETIAP applyApprovedPositions
const oldCall = `          await applyApprovedPositions(request);
`;
const newCall = `          await applyApprovedPositions(request);
          await applyBoxChangeIfNeeded(request);
`;
const countCall = countOccurrences(content, oldCall);
console.log(`[Patch 2+3] Pemanggilan applyApprovedPositions — ditemukan: ${countCall} (harus 2)`);
if (countCall !== 2) allOk = false;

if (!allOk) {
  console.log("\n=== ADA CHECK YANG GAGAL. TIDAK ADA PERUBAHAN DITERAPKAN. ===");
  process.exit(1);
}

console.log("\n=== SEMUA CHECK OK ===");

if (!APPLY) {
  console.log("Ini baru DRY-RUN. Jalankan lagi dengan --apply untuk menerapkan.");
  process.exit(0);
}

content = content.replace(old1, new1);
content = content.split(oldCall).join(newCall);

fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: semua patch diterapkan.");
