const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

const startMarker = 'if (selectedDepartment.id === "mi-she")';
const endMarker = 'if (selectedDepartment.id === "manufacturing-cable")';
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

const dsOpen = (colKey, minH) =>
  `<DraggableStack\n                deptId={selectedDepartment.id}\n                columnKey="${colKey}"\n                boxPositions={boxPositions}\n                setPositionsForDept={setPositionsForDept}\n                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}\n                isEditMode={isEditMode}\n                minHeight={${minH}}\n              >`;

const oldA = '              <div className="space-y-4 flex flex-col items-center">\n                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">\n                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">\n                    <p className="text-sm font-bold">BOD1.0</p>';
const newA = '              ' + dsOpen("mishe-col1-bod", 280) + '\n                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">\n                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">\n                    <p className="text-sm font-bold">BOD1.0</p>';
if (!check(block, oldA, "A")) allOk = false;

const oldB = '                    <p className="text-sm leading-tight">(23200038)</p>\n                  </div>\n                </div>\n              </div>\n              <div className="space-y-4">\n                <div className="min-h-[20px]"></div>\n              </div>\n              <div className="space-y-4 flex flex-col items-center">\n                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">\n                  <div className="flex flex-col h-full">\n                    <div className="flex border-b border-gray-400">\n                      <div className="p-2 flex-1 text-center bg-gray-100">\n                        {isEditMode ? (\n                          <input\n                            type="text"\n                            value={dept.header?.boxTitle || "MI & SHE (5R-SMK3-ISO 14001)"}';
const newB = '                    <p className="text-sm leading-tight">(23200038)</p>\n                  </div>\n                </div>\n              </DraggableStack>\n              ' + dsOpen("mishe-col2-depthead", 160) + '\n                {renderCustomBoxesInColumn("DEPARTMENT HEAD")}\n              </DraggableStack>\n              ' + dsOpen("mishe-col3-section", 200) + '\n                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">\n                  <div className="flex flex-col h-full">\n                    <div className="flex border-b border-gray-400">\n                      <div className="p-2 flex-1 text-center bg-gray-100">\n                        {isEditMode ? (\n                          <input\n                            type="text"\n                            value={dept.header?.boxTitle || "MI & SHE (5R-SMK3-ISO 14001)"}';
if (!check(block, oldB, "B")) allOk = false;

const oldC = '                        <EditableField\n                          value={`(${dept.header.empId})`}\n                          onSave={(value) =>\n                            handleEdit(selectedDepartment.id, "header", null, "empId", value.replace(/[()]/g, ""))\n                          }\n                          className="text-sm leading-tight"\n                        />\n                      </div>\n                    </div>\n                  </div>\n                </div>\n              </div>\n              <div className="space-y-4 flex flex-col items-center">\n                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">\n                  <div className="flex flex-col h-full">\n                    <div className="flex border-b border-gray-400">\n                      <div className="p-2 flex-1 text-center bg-gray-100">\n                        {isEditMode ? (\n                          <input\n                            type="text"\n                            value={dept.positions[0]?.title || ""}';
const newC = '                        <EditableField\n                          value={`(${dept.header.empId})`}\n                          onSave={(value) =>\n                            handleEdit(selectedDepartment.id, "header", null, "empId", value.replace(/[()]/g, ""))\n                          }\n                          className="text-sm leading-tight"\n                        />\n                      </div>\n                    </div>\n                  </div>\n                </div>\n                {renderCustomBoxesInColumn("SECTION HEAD")}\n              </DraggableStack>\n              ' + dsOpen("mishe-col4-staff", 500) + '\n                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">\n                  <div className="flex flex-col h-full">\n                    <div className="flex border-b border-gray-400">\n                      <div className="p-2 flex-1 text-center bg-gray-100">\n                        {isEditMode ? (\n                          <input\n                            type="text"\n                            value={dept.positions[0]?.title || ""}';
if (!check(block, oldC, "C")) allOk = false;

const oldD = '              </div>\n            </div>\n            <div className="mt-8 border-2 border-black p-3 inline-block">\n              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">NOTE :</h3>';
const newD = '                {renderCustomBoxesInColumn("STAFF LEVEL")}\n              </DraggableStack>\n            </div>\n            <div className="mt-8 border-2 border-black p-3 inline-block">\n              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">NOTE :</h3>';
if (!check(block, oldD, "D")) allOk = false;

if (!allOk) {
  console.log("\n=== ADA CHECK YANG GAGAL. TIDAK ADA PERUBAHAN DITERAPKAN. ===");
  process.exit(1);
}

console.log("\n=== SEMUA CHECK OK ===");

if (!APPLY) {
  console.log("Ini baru DRY-RUN. Jalankan lagi dengan --apply untuk menerapkan.");
  process.exit(0);
}

block = block.split(oldA).join(newA);
block = block.split(oldB).join(newB);
block = block.split(oldC).join(newC);
block = block.split(oldD).join(newD);

content = before + block + after;
fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: patch diterapkan.");
