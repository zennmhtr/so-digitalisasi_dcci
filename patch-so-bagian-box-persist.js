const fs = require("fs");
const path = require("path");

const apiPath = path.join(__dirname, "frontend/src/services/api.js");
const editorPath = path.join(__dirname, "frontend/src/pages/SoBagianEditor.jsx");

// ---------- 1. Tambahkan soBagianDataAPI ke services/api.js ----------
let apiSrc = fs.readFileSync(apiPath, "utf8");

if (apiSrc.includes("soBagianDataAPI")) {
  console.log("⏭️  soBagianDataAPI sudah ada di api.js, skip.");
} else {
  const marker = "export const soBagianChangeRequestsAPI = {";
  if (!apiSrc.includes(marker)) {
    throw new Error("Marker soBagianChangeRequestsAPI tidak ditemukan di api.js");
  }
  const insertion = `export const soBagianDataAPI = {
  get: (bagianId) => api.get(\`/so-bagian-data/\${bagianId}\`),
  getAll: () => api.get('/so-bagian-data'),
  save: (bagianId, data) => api.put(\`/so-bagian-data/\${bagianId}\`, data),
  addBox: (bagianId, box) => api.post(\`/so-bagian-data/\${bagianId}/box\`, box),
  deleteBox: (bagianId, boxId) => api.delete(\`/so-bagian-data/\${bagianId}/box/\${boxId}\`),
};

${marker}`;
  apiSrc = apiSrc.replace(marker, insertion);
  fs.writeFileSync(apiPath, apiSrc);
  console.log("✅ soBagianDataAPI ditambahkan ke api.js");
}

// ---------- 2. Patch SoBagianEditor.jsx ----------
let src = fs.readFileSync(editorPath, "utf8");
let changed = false;

// 2a. Tambahkan import soBagianDataAPI
const importOld = `import { soBagianChangeRequestsAPI } from "../services/api";`;
const importNew = `import { soBagianChangeRequestsAPI, soBagianDataAPI } from "../services/api";`;
if (src.includes(importOld) && !src.includes("soBagianDataAPI }")) {
  src = src.replace(importOld, importNew);
  changed = true;
  console.log("✅ Import soBagianDataAPI ditambahkan");
} else if (src.includes("soBagianDataAPI }")) {
  console.log("⏭️  Import soBagianDataAPI sudah ada, skip.");
} else {
  throw new Error("Baris import soBagianChangeRequestsAPI tidak ditemukan / formatnya beda.");
}

// 2b. Helper function untuk sync custom boxes ke server
const helperMarker = `  const handleAddBox = () => {`;
if (!src.includes(helperMarker)) {
  throw new Error("Marker handleAddBox tidak ditemukan.");
}
if (src.includes("syncCustomBoxesToServer")) {
  console.log("⏭️  Helper syncCustomBoxesToServer sudah ada, skip.");
} else {
  const helperCode = `  const syncCustomBoxesToServer = async (deptId, updatedPositions) => {
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
          parentId: null,
          order: p.order || 0,
        })),
      });
    } catch (err) {
      console.error("Gagal sync custom box ke server:", err);
      throw err;
    }
  };

${helperMarker}`;
  src = src.replace(helperMarker, helperCode);
  changed = true;
  console.log("✅ Helper syncCustomBoxesToServer ditambahkan");
}

// 2c. Patch handleAddBox supaya panggil API setelah update state lokal
const addBoxOld = `    const newPosition = {
      id: newId,
      code: addBoxForm.code || "",
      title: addBoxForm.title,
      name: addBoxForm.name,
      empId: addBoxForm.empId || "-",
      column: addBoxForm.column,
      order,
      isCustom: true,
    };
    setDepartmentData((prev) => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        positions: [...(prev[deptId].positions || []), newPosition],
      },
    }));
    setShowAddBoxModal(false);
    if (!isEditMode) setIsEditMode(true);
  };`;

const addBoxNew = `    const newPosition = {
      id: newId,
      code: addBoxForm.code || "",
      title: addBoxForm.title,
      name: addBoxForm.name,
      empId: addBoxForm.empId || "-",
      column: addBoxForm.column,
      order,
      isCustom: true,
    };
    const updatedPositions = [...(departmentData[deptId].positions || []), newPosition];

    setDepartmentData((prev) => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        positions: updatedPositions,
      },
    }));
    setShowAddBoxModal(false);
    if (!isEditMode) setIsEditMode(true);

    try {
      await syncCustomBoxesToServer(deptId, updatedPositions);
    } catch (err) {
      alert("Box ditambahkan di layar, tapi GAGAL disimpan ke server. Cek koneksi lalu coba tambah ulang.");
    }
  };`;

if (src.includes(addBoxOld)) {
  src = src.replace(addBoxOld, addBoxNew);
  src = src.replace("const handleAddBox = () => {", "const handleAddBox = async () => {");
  changed = true;
  console.log("✅ handleAddBox dipatch");
} else if (src.includes("syncCustomBoxesToServer(deptId, updatedPositions)")) {
  console.log("⏭️  handleAddBox sudah dipatch sebelumnya, skip.");
} else {
  throw new Error("Blok handleAddBox tidak cocok — file mungkin sudah berbeda dari yang diharapkan.");
}

// 2d. Patch handleRemoveCustomBox
const removeBoxOld = `  const handleRemoveCustomBox = (deptId, posId) => {
    setDepartmentData((prev) => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        positions: prev[deptId].positions.filter((p) => p.id !== posId),
      },
    }));
  };`;

const removeBoxNew = `  const handleRemoveCustomBox = async (deptId, posId) => {
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

if (src.includes(removeBoxOld)) {
  src = src.replace(removeBoxOld, removeBoxNew);
  changed = true;
  console.log("✅ handleRemoveCustomBox dipatch");
} else if (src.includes("handleRemoveCustomBox = async")) {
  console.log("⏭️  handleRemoveCustomBox sudah dipatch sebelumnya, skip.");
} else {
  throw new Error("Blok handleRemoveCustomBox tidak cocok.");
}

// 2e. Load custom boxes dari server saat departemen dipilih
const loadMarker = `  useEffect(() => {
    if (!selectedDepartment) return;

    const handleUpdate = (event) => {`;

if (!src.includes(loadMarker)) {
  throw new Error("Marker useEffect handleUpdate tidak ditemukan.");
}
if (src.includes("loadCustomBoxesFromServer")) {
  console.log("⏭️  useEffect load custom boxes sudah ada, skip.");
} else {
  const loadEffect = `  useEffect(() => {
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
                merged.push({ ...b, isCustom: true });
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
  }, [selectedDepartment]);

${loadMarker}`;
  src = src.replace(loadMarker, loadEffect);
  changed = true;
  console.log("✅ useEffect load custom boxes ditambahkan");
}

if (changed) {
  fs.writeFileSync(editorPath, src);
  console.log("✅ SoBagianEditor.jsx berhasil ditulis.");
} else {
  console.log("ℹ️  Tidak ada perubahan baru pada SoBagianEditor.jsx.");
}

console.log("\n🎉 Patch selesai. Lanjutkan dengan build frontend.");
