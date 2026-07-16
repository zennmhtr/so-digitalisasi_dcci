// patch-hrga-it-section-head.js
// Cara pakai:
//   1) Dry-run: node patch-hrga-it-section-head.js
//   2) Terapkan: node patch-hrga-it-section-head.js --apply

const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

function countOccurrences(str, sub) {
  let count = 0, pos = 0;
  while ((pos = str.indexOf(sub, pos)) !== -1) { count++; pos += 1; }
  return count;
}

let allOk = true;

// ============================================================
// PATCH A: handleRemoveCustomBox — kosongkan slot tanda tangan kalau namanya cocok
// ============================================================
const oldA = `  const handleRemoveCustomBox = async (deptId, posId) => {
    const updatedPositions = departmentData[deptId].positions.filter((p) => p.id !== posId);

    setDepartmentData((prev) => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        positions: updatedPositions,
      },
    }));

    try {
      await syncCustomBoxesToServer(deptId, updatedPositions);
    } catch (err) {
      alert("Box dihapus di layar, tapi GAGAL update di server. Cek koneksi lalu coba lagi.");
    }
  };`;

const newA = `  const handleRemoveCustomBox = async (deptId, posId) => {
    const dept = departmentData[deptId];
    const removedPosition = (dept.positions || []).find((p) => p.id === posId);
    const updatedPositions = dept.positions.filter((p) => p.id !== posId);

    let updatedHeader = dept.header;
    if (removedPosition && removedPosition.column === "SECTION HEAD") {
      const signatureSlots = ["preparedBy", "checkedBy", "approvedBy"];
      const normalize = (s) => (s || "").replace(/[*]/g, "").trim().toUpperCase();
      const removedNameNorm = normalize(removedPosition.name);
      const newHeader = { ...dept.header };
      let headerChanged = false;
      signatureSlots.forEach((slot) => {
        const nameKey = \`\${slot}Name\`;
        const roleKey = \`\${slot}Role\`;
        if (removedNameNorm && normalize(newHeader[nameKey]) === removedNameNorm) {
          newHeader[nameKey] = "";
          newHeader[roleKey] = "";
          headerChanged = true;
        }
      });
      if (headerChanged) updatedHeader = newHeader;
    }

    setDepartmentData((prev) => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        positions: updatedPositions,
        header: updatedHeader,
      },
    }));

    if (updatedHeader !== dept.header) {
      try {
        const dataToSave = {
          ...departmentData[deptId],
          positions: updatedPositions,
          header: updatedHeader,
          lastModified: new Date().toISOString(),
        };
        localStorage.setItem(\`so-bagian-\${deptId}\`, JSON.stringify(dataToSave));
      } catch (e) {
        console.error("Gagal simpan header ke localStorage:", e);
      }
    }

    try {
      await syncCustomBoxesToServer(deptId, updatedPositions);
    } catch (err) {
      alert("Box dihapus di layar, tapi GAGAL update di server. Cek koneksi lalu coba lagi.");
    }
  };`;

const countA = countOccurrences(content, oldA);
console.log(`[Patch A] handleRemoveCustomBox — ditemukan: ${countA}`);
if (countA !== 1) allOk = false;

// ============================================================
// PATCH B+C: Kolom 2 (Department Head) + Kolom 3 (Section Head) — digabung jadi satu patch
// ============================================================
const oldBC = `              {/* Kolom 2 - Department Head - Empty */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 3 - Section Head */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.header?.title || "HRGA IT"}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "header",
                                null,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Section Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.header?.title || "HRGA & IT"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton({
                          code: "HRD1.0",
                          name: dept.header.head,
                          empId: dept.header.empId,
                          title: dept.header.title,
                        })}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "head",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={\`(\${dept.header.empId})\`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton(dept.positions[0])}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={\`(\${dept.positions[0]?.empId})\`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {renderCustomBoxesInColumn("SECTION HEAD")}
              </div>

              {/* Kolom 4 - Staff Level */}`;

const newBC = `              {/* Kolom 2 - Department Head */}
              <div className="space-y-4 flex flex-col items-center">
                {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
              </div>

              {/* Kolom 3 - Section Head */}
              <div className="space-y-4 flex flex-col items-center">
                {(() => {
                  const sectionHeadItems = (dept.positions || [])
                    .filter((p) => p.column === "SECTION HEAD" && p.groupKey === "HRGA & IT DEPARTMENT")
                    .sort((a, b) => a.order - b.order);
                  return (
                    <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                      <div className="flex flex-col h-full">
                        <div className="flex border-b border-gray-400">
                          <div className="p-2 flex-1 text-center bg-gray-100">
                            <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                              {dept.header?.title || "HRGA & IT"}
                            </p>
                          </div>
                        </div>
                        {sectionHeadItems.map((staff, idx) => (
                          <div
                            key={staff.id}
                            className={\`flex flex-1 relative \${idx === sectionHeadItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}\`}
                          >
                            {isEditMode && (
                              <button
                                onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                title="Hapus"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                            <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                              {renderCodeButton(staff)}
                            </div>
                            <div className="p-3 flex-1 text-center flex flex-col justify-center">
                              <EditableField
                                value={staff.name}
                                onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                className="text-sm font-semibold leading-tight"
                              />
                              <EditableField
                                value={\`(\${staff.empId})\`}
                                onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                className="text-sm leading-tight"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                {renderCustomBoxesInColumn("SECTION HEAD")}
              </div>

              {/* Kolom 4 - Staff Level */}`;

const countBC = countOccurrences(content, oldBC);
console.log(`[Patch B+C] Kolom 2+3 — ditemukan: ${countBC}`);
if (countBC !== 1) allOk = false;

// ============================================================
// TERAPKAN
// ============================================================
if (!allOk) {
  console.log("");
  console.log("=== ADA CHECK YANG GAGAL. TIDAK ADA PERUBAHAN DITERAPKAN. ===");
  process.exit(1);
}

console.log("");
console.log("=== SEMUA CHECK OK ===");

if (!APPLY) {
  console.log("Ini baru DRY-RUN. Jalankan lagi dengan --apply untuk benar-benar menerapkan patch.");
  process.exit(0);
}

content = content.replace(oldA, newA);
content = content.replace(oldBC, newBC);

fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: semua patch diterapkan ke file.");
