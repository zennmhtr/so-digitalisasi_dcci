// patch-hrga-it-frontend.js
// Jalankan dari folder backend ATAU frontend, tidak masalah — pakai absolute path.
// Cara pakai:
//   1) Dry-run dulu (cek saja, TIDAK mengubah file):
//        node patch-hrga-it-frontend.js
//   2) Kalau semua check "OK", baru terapkan:
//        node patch-hrga-it-frontend.js --apply

const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");
const originalContent = content;

function countOccurrences(str, sub) {
  let count = 0, pos = 0;
  while ((pos = str.indexOf(sub, pos)) !== -1) { count++; pos += 1; }
  return count;
}

let allOk = true;

// ============================================================
// PATCH 1: departmentGroups — SUDAH ADA "HRD" sebelumnya, dilewati.
// ============================================================
console.log(`[Patch 1] departmentGroups — dilewati (sudah ada "HRD" secara manual).`);

// ============================================================
// PATCH 2: loadCustomBoxesFromServer useEffect — fetch dari deptId langsung
// ============================================================
const old2 = `  useEffect(() => {
    if (!selectedDepartment) return;
    const loadCustomBoxesFromServer = async () => {
      try {
        const res = await soBagianDataAPI.get(\`\${selectedDepartment.id}__custom\`);
        const record = res.data?.data;
        if (record && record.boxes && record.boxes.length > 0) {
          setDepartmentData((prev) => {
            const dept = prev[selectedDepartment.id];
            if (!dept) return prev;
            const existingIds = new Set((dept.positions || []).map((p) => p.id));
            const merged = [...(dept.positions || [])];
            record.boxes.forEach((b) => {
              if (!existingIds.has(b.id)) {
                merged.push({ ...b, groupKey: b.parentId || null, isCustom: true });
              }
            });
            return { ...prev, [selectedDepartment.id]: { ...dept, positions: merged } };
          });
        }
      } catch (err) {
        console.error("Gagal load custom boxes dari server:", err);
      }
    };
    loadCustomBoxesFromServer();
  }, [selectedDepartment]);`;

const new2 = `  useEffect(() => {
    if (!selectedDepartment) return;
    const deptId = selectedDepartment.id;
    const loadBoxesFromServer = async () => {
      try {
        const res = await soBagianDataAPI.get(deptId);
        const record = res.data?.data;
        if (record && record.boxes && record.boxes.length > 0) {
          setDepartmentData((prev) => {
            const dept = prev[deptId];
            if (!dept) return prev;
            const dbBoxIds = new Set(record.boxes.map((b) => b.id));
            const migratedColumns = new Set(record.boxes.map((b) => b.column));
            const keptOld = (dept.positions || []).filter(
              (p) => !migratedColumns.has(p.column) || dbBoxIds.has(p.id)
            );
            const keptOldWithoutDup = keptOld.filter((p) => !dbBoxIds.has(p.id));
            const dbBoxesMapped = record.boxes.map((b) => ({
              id: b.id,
              code: b.code || "",
              title: b.title || "",
              name: b.name || "",
              empId: b.empId || "",
              column: b.column,
              groupKey: b.parentId || null,
              order: b.order || 0,
              isCustom: true,
            }));
            const merged = [...keptOldWithoutDup, ...dbBoxesMapped];
            return { ...prev, [deptId]: { ...dept, positions: merged } };
          });
        }
      } catch (err) {
        console.error("Gagal load posisi dari server:", err);
      }
    };
    loadBoxesFromServer();
  }, [selectedDepartment]);`;

const count2 = countOccurrences(content, old2);
console.log(`[Patch 2] loadCustomBoxesFromServer useEffect — ditemukan: ${count2}`);
if (count2 !== 1) allOk = false;

// ============================================================
// PATCH 3: syncCustomBoxesToServer — target deptId langsung, bukan __custom
// ============================================================
const old3 = `  const syncCustomBoxesToServer = async (deptId, updatedPositions) => {
    try {
      const customBoxes = (updatedPositions || []).filter((p) => p.isCustom);
      const deptMeta = departments.find((d) => d.id === deptId);
      await soBagianDataAPI.save(\`\${deptId}__custom\`, {
        bagianName: \`\${deptMeta?.name || deptId} (Custom Boxes)\`,
        columns: departmentColumns[deptId] || [],
        header: { effectiveDate: "", signatures: {} },
        boxes: customBoxes.map((p) => ({
          id: p.id,
          code: p.code || "",
          title: p.title || "",
          name: p.name || "",
          empId: p.empId || "",
          column: p.column,
          parentId: p.groupKey || null,
          order: p.order || 0,
        })),
      });
    } catch (err) {
      console.error("Gagal sync custom box ke server:", err);
      throw err;
    }
  };`;

const new3 = `  const syncCustomBoxesToServer = async (deptId, updatedPositions) => {
    try {
      const customBoxes = (updatedPositions || []).filter((p) => p.isCustom);
      const deptMeta = departments.find((d) => d.id === deptId);
      await soBagianDataAPI.save(deptId, {
        bagianName: deptMeta?.name || deptId,
        columns: departmentColumns[deptId] || [],
        header: { effectiveDate: "", signatures: {} },
        boxes: customBoxes.map((p) => ({
          id: p.id,
          code: p.code || "",
          title: p.title || "",
          name: p.name || "",
          empId: p.empId || "",
          column: p.column,
          parentId: p.groupKey || null,
          order: p.order || 0,
        })),
      });
    } catch (err) {
      console.error("Gagal sync box ke server:", err);
      throw err;
    }
  };`;

const count3 = countOccurrences(content, old3);
console.log(`[Patch 3] syncCustomBoxesToServer — ditemukan: ${count3}`);
if (count3 !== 1) allOk = false;

// ============================================================
// PATCH 4: Unifikasi render HRD/GA/IT (line-range based, paling aman untuk block besar)
// ============================================================
const lines = content.split("\n");
const anchorStart = '                {/* HRD Section */}';
const anchorEnd = '                {renderCustomBoxesInColumn("STAFF LEVEL")}';

const startIdx = lines.findIndex((l) => l === anchorStart);
const endIdx = lines.findIndex((l) => l === anchorEnd);

console.log(`[Patch 4] anchor start line: ${startIdx + 1}, anchor end line: ${endIdx + 1}`);

let patch4Ok = startIdx !== -1 && endIdx !== -1 && endIdx > startIdx;
if (!patch4Ok) {
  console.log("[Patch 4] GAGAL: anchor tidak ditemukan atau urutan salah.");
  allOk = false;
} else {
  console.log(`[Patch 4] akan mengganti baris ${startIdx + 1} sampai ${endIdx} (${endIdx - startIdx} baris), baris ${endIdx + 1} (renderCustomBoxesInColumn) tidak diubah.`);
}

const newBlock4 = `                {(() => {
                  const staffPositions = (dept.positions || []).filter(
                    (p) => p.column === "STAFF LEVEL" && p.groupKey
                  );
                  const renderGroupCard = (groupKey, minHeightClass) => {
                    const items = staffPositions
                      .filter((p) => p.groupKey === groupKey)
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div key={groupKey} className={\`bg-white border border-gray-400 rounded shadow-sm \${minHeightClass} w-[280px]\`}>
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <p className="text-sm font-semibold leading-tight">
                                {groupKey}
                              </p>
                            </div>
                          </div>
                          {items.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={\`flex flex-1 relative \${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}\`}
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
                  };
                  return (
                    <React.Fragment>
                      {renderGroupCard("HRD", "min-h-[120px]")}
                      {renderGroupCard("GENERAL AFFAIR & IND. RELATIONS", "min-h-[280px]")}
                      {renderGroupCard("INFORMATION TECHNOLOGY", "min-h-[180px]")}
                    </React.Fragment>
                  );
                })()}`;

// ============================================================
// TERAPKAN jika --apply, dan semua check OK
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

// Terapkan patch 2-3 (string replace) — patch 1 dilewati, sudah ada manual
content = content.replace(old2, new2);
content = content.replace(old3, new3);

// Terapkan patch 4 (line-range replace) — pakai ulang lines dari content TERBARU
const linesAfter123 = content.split("\n");
const startIdx2 = linesAfter123.findIndex((l) => l === anchorStart);
const endIdx2 = linesAfter123.findIndex((l) => l === anchorEnd);

const newLines = [
  ...linesAfter123.slice(0, startIdx2),
  ...newBlock4.split("\n"),
  ...linesAfter123.slice(endIdx2),
];

content = newLines.join("\n");

fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: semua 4 patch diterapkan ke file.");
