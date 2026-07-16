const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const startMarker = 'if (selectedDepartment.id === "finance")';
const endMarker = 'if (selectedDepartment.id === "marketing-battery")';
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

const old1 = `              {/* Kolom 2 */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>`;
const new1 = `              {/* Kolom 2 - Department Head */}
              <div className="space-y-4 flex flex-col items-center">
                {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
              </div>`;
if (!check(block, old1, "Patch 1: DEPARTMENT HEAD")) allOk = false;

const old2 = `              </DraggableStack>

              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="finance-col4-staff"`;
const new2 = `                {renderCustomBoxesInColumn("SECTION HEAD")}
              </DraggableStack>

              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="finance-col4-staff"`;
if (!check(block, old2, "Patch 2: SECTION HEAD")) allOk = false;

const old3 = `              </DraggableStack>
            </div>

            <div className="mt-8 border-2 border-black p-3 inline-block">`;
const new3 = `                {renderCustomBoxesInColumn("STAFF")}
              </DraggableStack>
            </div>

            <div className="mt-8 border-2 border-black p-3 inline-block">`;
if (!check(block, old3, "Patch 3: STAFF")) allOk = false;

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

content = before + block + after;
fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
