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

// PATCH 1: Kolom 2 - Department Head (Empty) -> render
const old1 = `              {/* Kolom 2 - Department Head (Empty) */}
              <div className="space-y-4 flex flex-col items-center">
                {/* Kosong sesuai layout */}
              </div>`;
const new1 = `              {/* Kolom 2 - Department Head */}
              <div className="space-y-4 flex flex-col items-center">
                {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
              </div>`;
const count1 = block.split(old1).length - 1;
console.log(`[Patch 1] Kolom 2 Department Head — ditemukan: ${count1}`);
if (count1 !== 1) allOk = false;

// PATCH 2: render SENIOR ENGINEER sebelum penutup manbat-col3-senior
const old2 = `                      </div>
                    </div>
                  </div>
                </div>
              </DraggableStack>
              {/* Kolom 4 - Engineer */}`;
const new2 = `                      </div>
                    </div>
                  </div>
                </div>
                {renderCustomBoxesInColumn("SENIOR ENGINEER")}
              </DraggableStack>
              {/* Kolom 4 - Engineer */}`;
const count2 = block.split(old2).length - 1;
console.log(`[Patch 2] Render SENIOR ENGINEER — ditemukan: ${count2}`);
if (count2 !== 1) allOk = false;

// PATCH 3: render ENGINEER sebelum penutup manbat-col4-engineer
const old3 = `                    </div>
                  </div>
                </div>
              </DraggableStack>
              {/* Kolom 5 - Team Member/Technician */}`;
const new3 = `                    </div>
                  </div>
                </div>
                {renderCustomBoxesInColumn("ENGINEER")}
              </DraggableStack>
              {/* Kolom 5 - Team Member/Technician */}`;
const count3 = block.split(old3).length - 1;
console.log(`[Patch 3] Render ENGINEER — ditemukan: ${count3}`);
if (count3 !== 1) allOk = false;

// PATCH 4: render TEAM MEMBER/TECHNICIAN sebelum penutup manbat-col5-team
const old4 = `                      </div>
                    </div>
                  </div>
                </div>
              </DraggableStack>
            </div>
            {/* Notes Section */}`;
const new4 = `                      </div>
                    </div>
                  </div>
                </div>
                {renderCustomBoxesInColumn("TEAM MEMBER/TECHNICIAN")}
              </DraggableStack>
            </div>
            {/* Notes Section */}`;
const count4 = block.split(old4).length - 1;
console.log(`[Patch 4] Render TEAM MEMBER/TECHNICIAN — ditemukan: ${count4}`);
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

block = block.split(old1).join(new1);
block = block.split(old2).join(new2);
block = block.split(old3).join(new3);
block = block.split(old4).join(new4);

content = before + block + after;
fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
