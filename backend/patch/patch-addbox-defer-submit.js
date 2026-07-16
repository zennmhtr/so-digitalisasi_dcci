// patch-addbox-defer-submit.js
// Membuat Add Box / Delete Box HANYA update lokal, dan baru dikirim sebagai
// change request saat user klik "Submit for Approval".
// Cara pakai:
//   1) Dry-run: node patch-addbox-defer-submit.js
//   2) Terapkan: node patch-addbox-defer-submit.js --apply

const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/frontend/src/pages/SoBagianEditor.jsx";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");
let allOk = true;

function replaceFunctionBody(content, startMarker, endMarker, newBody, label) {
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) {
    console.log(`[${label}] GAGAL: start marker tidak ditemukan.`);
    return { content, ok: false };
  }
  const endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx === -1) {
    console.log(`[${label}] GAGAL: end marker tidak ditemukan setelah start.`);
    return { content, ok: false };
  }
  const endPos = endIdx + endMarker.length;
  console.log(`[${label}] OK — akan mengganti ${endPos - startIdx} karakter.`);
  const newContent = content.slice(0, startIdx) + newBody + content.slice(endPos);
  return { content: newContent, ok: true };
}

// ============================================================
// PATCH 1: handleAddBox — hanya update lokal, tanpa API call
// ============================================================
const newHandleAddBox = `const handleAddBox = () => {
    if (!addBoxForm.column) {
      alert("Pilih kolom/header tujuan terlebih dahulu");
      return;
    }
    if (!addBoxForm.title.trim() || !addBoxForm.name.trim()) {
      alert("Title dan Name wajib diisi");
      return;
    }
    const deptId = selectedDepartment.id;
    const newId = \`custom-\${deptId}-\${Date.now()}\`;
    const customInColumn = getCustomPositionsInColumn(deptId, addBoxForm.column);
    let order = 0;
    if (addBoxForm.afterId) {
      const afterBox = customInColumn.find((p) => p.id === addBoxForm.afterId);
      order = afterBox ? afterBox.order + 0.5 : customInColumn.length;
    } else {
      order = customInColumn.length > 0 ? Math.min(...customInColumn.map((p) => p.order)) - 1 : 0;
    }
    const newPosition = {
      id: newId,
      code: addBoxForm.code || "",
      title: addBoxForm.title,
      name: addBoxForm.name,
      empId: addBoxForm.empId || "-",
      column: addBoxForm.column,
      groupKey: addBoxForm.groupKey || null,
      order,
      isCustom: true,
      pendingAction: "add",
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

let r = replaceFunctionBody(
  content,
  "const handleAddBox = async () => {",
  "\n  };",
  newHandleAddBox,
  "Patch 1: handleAddBox (jadi lokal-saja)"
);
content = r.content;
if (!r.ok) allOk = false;

// ============================================================
// PATCH 2: handleRemoveCustomBox — hanya update lokal, tanpa API call
// (kecuali batalkan request yang MEMANG sudah pernah disubmit)
// ============================================================
const newHandleRemoveCustomBox = `const handleRemoveCustomBox = async (deptId, posId) => {
    const dept = departmentData[deptId];
    const position = (dept.positions || []).find((p) => p.id === posId);
    if (!position) return;

    if (position.pendingAction === "add") {
      if (position.pendingRequestId) {
        try {
          await soBagianChangeRequestsAPI.cancel(position.pendingRequestId);
        } catch (err) {
          console.error("Gagal membatalkan request add box:", err);
        }
      }
      setDepartmentData((prev) => ({
        ...prev,
        [deptId]: {
          ...prev[deptId],
          positions: prev[deptId].positions.filter((p) => p.id !== posId),
        },
      }));
      return;
    }

    setDepartmentData((prev) => {
      const d = prev[deptId];
      const positions = d.positions.map((p) =>
        p.id === posId ? { ...p, pendingAction: "delete" } : p
      );
      return { ...prev, [deptId]: { ...d, positions } };
    });
  };`;

r = replaceFunctionBody(
  content,
  "const handleRemoveCustomBox = async (deptId, posId) => {",
  "\n  };",
  newHandleRemoveCustomBox,
  "Patch 2: handleRemoveCustomBox (jadi lokal-saja)"
);
content = r.content;
if (!r.ok) allOk = false;

// ============================================================
// PATCH 3: submitForApproval — kirim semua pending box change saat klik Submit
// ============================================================
const anchor3 = `    if (!submitForm.description.trim()) {
      alert("Please enter a description for this change request");
      return;
    }
`;

const insertion3 = `
    const deptId = selectedDepartment.id;
    const pendingBoxes = (departmentData[deptId]?.positions || []).filter(
      (p) => p.pendingAction && !p.pendingRequestId
    );
    for (const box of pendingBoxes) {
      try {
        const isDelete = box.pendingAction === "delete";
        const res = await soBagianChangeRequestsAPI.create({
          title: isDelete
            ? \`Hapus box: \${box.name} dari \${box.column}\`
            : \`Tambah box: \${box.name} di \${box.column}\`,
          description: isDelete
            ? \`Menghapus box "\${box.title}" (\${box.name}) dari kolom \${box.column}.\`
            : \`Menambahkan box baru "\${box.title}" (\${box.name}) ke kolom \${box.column}.\`,
          priority: "medium",
          changeType: isDelete ? "delete" : "add",
          department: selectedDepartment.name,
          proposedData: { boxData: box },
          currentData: isDelete ? { removedBox: box } : null,
        });
        const requestId = res.data?.data?._id;
        setDepartmentData((prev) => {
          const d = prev[deptId];
          const positions = d.positions.map((p) =>
            p.id === box.id ? { ...p, pendingRequestId: requestId } : p
          );
          return { ...prev, [deptId]: { ...d, positions } };
        });
      } catch (err) {
        console.error("Gagal mengirim perubahan box:", box, err);
      }
    }
`;

if (content.includes(anchor3)) {
  const insertPos = content.indexOf(anchor3) + anchor3.length;
  content = content.slice(0, insertPos) + insertion3 + content.slice(insertPos);
  console.log("[Patch 3] Loop kirim pending box — disisipkan di submitForApproval.");
} else {
  console.log("[Patch 3] GAGAL: anchor validasi description tidak ditemukan.");
  allOk = false;
}

// ============================================================
// TERAPKAN
// ============================================================
if (!allOk) {
  console.log("\n=== ADA CHECK YANG GAGAL. TIDAK ADA PERUBAHAN DITERAPKAN. ===");
  process.exit(1);
}

console.log("\n=== SEMUA CHECK OK ===");

if (!APPLY) {
  console.log("Ini baru DRY-RUN. Jalankan lagi dengan --apply untuk menerapkan.");
  process.exit(0);
}

fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: semua patch diterapkan.");
