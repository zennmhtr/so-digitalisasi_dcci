// patch-mdev-addbox.js
const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const startMarker = 'if (selectedDepartment.id === "management-development")';
const endMarker = 'if (selectedDepartment.id === "manufactur-battery")';
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

// PATCH 1: Kolom 2 + Kolom 3 (empty -> filled dengan renderCustomBoxesInColumn)
const old1 = `              {/* Kolom 2 - Department Head - Empty */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 3 - Section Head - Empty */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>`;

const new1 = `              {/* Kolom 2 - Department Head */}
              <div className="space-y-4 flex flex-col items-center">
                {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
              </div>

              {/* Kolom 3 - Section Head */}
              <div className="space-y-4 flex flex-col items-center">
                {renderCustomBoxesInColumn("SECTION HEAD")}
              </div>`;

const count1 = block.split(old1).length - 1;
console.log(`[Patch 1] Kolom 2+3 (empty->filled) — ditemukan: ${count1}`);
if (count1 !== 1) allOk = false;

// PATCH 2: Sisipkan render STAFF sebelum penutup DraggableStack col4-staff
const old2 = `                  </div>
                </div>
              </DraggableStack>
            </div>

            {/* Notes Section */}`;

const new2 = `                  </div>
                </div>
                {renderCustomBoxesInColumn("STAFF")}
              </DraggableStack>
            </div>

            {/* Notes Section */}`;

const count2 = block.split(old2).length - 1;
console.log(`[Patch 2] Render STAFF di col4-staff — ditemukan: ${count2}`);
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

block = block.split(old1).join(new1);
block = block.split(old2).join(new2);

content = before + block + after;
fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
