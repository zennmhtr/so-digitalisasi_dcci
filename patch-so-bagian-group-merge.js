const fs = require("fs");
const path = require("path");

const editorPath = path.join(__dirname, "frontend/src/pages/SoBagianEditor.jsx");
let src = fs.readFileSync(editorPath, "utf8");
let changed = false;

const replaceUnique = (label, oldStr, newStr, { allowMissing = false } = {}) => {
  const count = src.split(oldStr).length - 1;
  if (count === 0) {
    if (src.includes(label + "__MARKER_DONE__")) return; // not used, placeholder
    if (allowMissing) {
      console.log(`⏭️  ${label}: pattern tidak ditemukan (mungkin sudah dipatch), skip.`);
      return;
    }
    throw new Error(`${label}: pattern OLD tidak ditemukan di file.`);
  }
  if (count > 1) {
    throw new Error(`${label}: pattern OLD ditemukan ${count}x, tidak unik — patch dibatalkan demi keamanan.`);
  }
  src = src.replace(oldStr, newStr);
  changed = true;
  console.log(`✅ ${label} dipatch`);
};

// Guard: kalau sudah pernah dipatch semua, keluar cepat
if (src.includes("departmentGroups")) {
  console.log("⏭️  departmentGroups sudah ada — patch grup sepertinya sudah pernah dijalankan sebelumnya. Tidak ada yang diubah.");
  process.exit(0);
}

// 1. Tambahkan departmentGroups setelah departmentColumns
replaceUnique(
  "departmentGroups",
  `  qa: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "UNIT/STAFF LEVEL", "GROUP HEAD", "OPERATOR/ADMIN"],
};`,
  `  qa: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "UNIT/STAFF LEVEL", "GROUP HEAD", "OPERATOR/ADMIN"],
};

// Grup existing per departemen+kolom — box custom bisa "gabung" ke sini alih-alih jadi box terpisah
const departmentGroups = {
  "hrga-it": {
    "STAFF LEVEL": ["GENERAL AFFAIR & IND. RELATIONS", "INFORMATION TECHNOLOGY"],
  },
};`
);

// 2. Tambahkan groupKey ke state addBoxForm
replaceUnique(
  "addBoxForm.groupKey (state)",
  `  const [addBoxForm, setAddBoxForm] = useState({
    column: "",
    afterId: "", // "" = taruh di awal kolom
    title: "",
    name: "",
    empId: "",
    code: "",
  });`,
  `  const [addBoxForm, setAddBoxForm] = useState({
    column: "",
    afterId: "", // "" = taruh di awal kolom
    groupKey: "", // "" = box terpisah, diisi = gabung ke grup existing
    title: "",
    name: "",
    empId: "",
    code: "",
  });`
);

// 3. Reset groupKey di openAddBoxModal
replaceUnique(
  "openAddBoxModal reset groupKey",
  `    setAddBoxForm({
      column: cols[cols.length - 1] || "",
      afterId: "",
      title: "",
      name: "",
      empId: "",
      code: "",
    });`,
  `    setAddBoxForm({
      column: cols[cols.length - 1] || "",
      afterId: "",
      groupKey: "",
      title: "",
      name: "",
      empId: "",
      code: "",
    });`
);

// 4. Sertakan groupKey di posisi baru saat handleAddBox
replaceUnique(
  "handleAddBox newPosition groupKey",
  `    const newPosition = {
      id: newId,
      code: addBoxForm.code || "",
      title: addBoxForm.title,
      name: addBoxForm.name,
      empId: addBoxForm.empId || "-",
      column: addBoxForm.column,
      order,
      isCustom: true,
    };
    const updatedPositions = [...(departmentData[deptId].positions || []), newPosition];`,
  `    const newPosition = {
      id: newId,
      code: addBoxForm.code || "",
      title: addBoxForm.title,
      name: addBoxForm.name,
      empId: addBoxForm.empId || "-",
      column: addBoxForm.column,
      groupKey: addBoxForm.groupKey || null,
      order,
      isCustom: true,
    };
    const updatedPositions = [...(departmentData[deptId].positions || []), newPosition];`
);

// 5. Simpan groupKey sebagai parentId saat sync ke server (skema DB sudah punya field parentId)
replaceUnique(
  "syncCustomBoxesToServer parentId=groupKey",
  `          column: p.column,
          parentId: null,
          order: p.order || 0,
        })),`,
  `          column: p.column,
          parentId: p.groupKey || null,
          order: p.order || 0,
        })),`
);

// 6. Saat load dari server, mapping parentId -> groupKey
replaceUnique(
  "load effect map parentId->groupKey",
  `            record.boxes.forEach((b) => {
              if (!existingIds.has(b.id)) {
                merged.push({ ...b, isCustom: true });
              }
            });`,
  `            record.boxes.forEach((b) => {
              if (!existingIds.has(b.id)) {
                merged.push({ ...b, groupKey: b.parentId || null, isCustom: true });
              }
            });`
);

// 7. renderCustomBoxesInColumn — jangan render box yang groupKey-nya terisi (karena dirender inline di grupnya)
replaceUnique(
  "renderCustomBoxesInColumn exclude grouped",
  `    const customBoxes = (dept.positions || [])
      .filter((p) => p.isCustom && p.column === column)
      .sort((a, b) => a.order - b.order);`,
  `    const customBoxes = (dept.positions || [])
      .filter((p) => p.isCustom && p.column === column && !p.groupKey)
      .sort((a, b) => a.order - b.order);`
);

// 8. Render tambahan baris custom di dalam box GENERAL AFFAIR & IND. RELATIONS
replaceUnique(
  "GA inline custom rows",
  `                    ))}
                  </div>
                </div>

                {/* Information Technology Section */}`,
  `                    ))}
                    {(dept.positions || [])
                      .filter((p) => p.isCustom && p.groupKey === "GENERAL AFFAIR & IND. RELATIONS" && p.column === "STAFF LEVEL")
                      .map((staff) => (
                        <div key={staff.id} className="flex border-b border-gray-300 flex-1 relative">
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

                {/* Information Technology Section */}`
);

// 9. Render tambahan baris custom di dalam box INFORMATION TECHNOLOGY
replaceUnique(
  "IT inline custom rows",
  `                    ))}
                  </div>
                </div>
                {renderCustomBoxesInColumn("STAFF LEVEL")}`,
  `                    ))}
                    {(dept.positions || [])
                      .filter((p) => p.isCustom && p.groupKey === "INFORMATION TECHNOLOGY" && p.column === "STAFF LEVEL")
                      .map((staff) => (
                        <div key={staff.id} className="flex border-b border-gray-300 flex-1 relative">
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
                {renderCustomBoxesInColumn("STAFF LEVEL")}`
);

// 10. Modal — tambahkan dropdown "Gabung ke Grup"
replaceUnique(
  "Modal dropdown gabung ke grup",
  `                {/* "Setelah siapa" — DINAMIS dari box custom yang sudah ada di kolom itu */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Taruh Setelah</label>`,
  `                {(departmentGroups[selectedDepartment.id]?.[addBoxForm.column] || []).length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Gabung ke Grup (opsional)</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                      value={addBoxForm.groupKey}
                      onChange={e => setAddBoxForm(f => ({ ...f, groupKey: e.target.value }))}
                    >
                      <option value="">-- Box Terpisah --</option>
                      {(departmentGroups[selectedDepartment.id]?.[addBoxForm.column] || []).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* "Setelah siapa" — DINAMIS dari box custom yang sudah ada di kolom itu */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Taruh Setelah</label>`
);

if (changed) {
  fs.writeFileSync(editorPath, src);
  console.log("\n✅ SoBagianEditor.jsx berhasil ditulis.");
} else {
  console.log("\nℹ️  Tidak ada perubahan.");
}
console.log("🎉 Patch grup selesai. Lanjutkan dengan build frontend.");
