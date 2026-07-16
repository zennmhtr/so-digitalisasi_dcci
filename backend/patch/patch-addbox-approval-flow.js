// patch-addbox-approval-flow.js
// Mengubah Add Box / Delete Box supaya lewat approval flow, bukan langsung permanen.
// Cara pakai:
//   1) Dry-run: node patch-addbox-approval-flow.js
//   2) Terapkan: node patch-addbox-approval-flow.js --apply

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
// PATCH 1: handleAddBox
// ============================================================
const newHandleAddBox = `const handleAddBox = async () => {
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

    try {
      const res = await soBagianChangeRequestsAPI.create({
        title: \`Tambah box: \${newPosition.name} di \${newPosition.column}\`,
        description: \`Menambahkan box baru "\${newPosition.title}" (\${newPosition.name}) ke kolom \${newPosition.column}.\`,
        priority: "medium",
        changeType: "add",
        department: selectedDepartment.name,
        proposedData: { boxData: newPosition },
      });
      const requestId = res.data?.data?._id;
      setDepartmentData((prev) => {
        const dept = prev[deptId];
        const positions = (dept.positions || []).map((p) =>
          p.id === newId ? { ...p, pendingRequestId: requestId } : p
        );
        return { ...prev, [deptId]: { ...dept, positions } };
      });
    } catch (err) {
      alert("Gagal mengirim permintaan approval. Box dibatalkan, coba lagi.");
      setDepartmentData((prev) => {
        const dept = prev[deptId];
        return {
          ...prev,
          [deptId]: {
            ...dept,
            positions: (dept.positions || []).filter((p) => p.id !== newId),
          },
        };
      });
    }
  };`;

let r = replaceFunctionBody(
  content,
  "const handleAddBox = async () => {",
  "\n  };",
  newHandleAddBox,
  "Patch 1: handleAddBox"
);
content = r.content;
if (!r.ok) allOk = false;

// ============================================================
// PATCH 2: handleRemoveCustomBox
// ============================================================
const newHandleRemoveCustomBox = `const handleRemoveCustomBox = async (deptId, posId) => {
    const dept = departmentData[deptId];
    const position = (dept.positions || []).find((p) => p.id === posId);
    if (!position) return;

    if (position.pendingAction === "add") {
      setDepartmentData((prev) => ({
        ...prev,
        [deptId]: {
          ...prev[deptId],
          positions: prev[deptId].positions.filter((p) => p.id !== posId),
        },
      }));
      if (position.pendingRequestId) {
        try {
          await soBagianChangeRequestsAPI.cancel(position.pendingRequestId);
        } catch (err) {
          console.error("Gagal membatalkan request add box:", err);
        }
      }
      return;
    }

    setDepartmentData((prev) => {
      const d = prev[deptId];
      const positions = d.positions.map((p) =>
        p.id === posId ? { ...p, pendingAction: "delete" } : p
      );
      return { ...prev, [deptId]: { ...d, positions } };
    });

    try {
      const res = await soBagianChangeRequestsAPI.create({
        title: \`Hapus box: \${position.name} dari \${position.column}\`,
        description: \`Menghapus box "\${position.title}" (\${position.name}) dari kolom \${position.column}.\`,
        priority: "medium",
        changeType: "delete",
        department: selectedDepartment.name,
        proposedData: { boxData: position },
        currentData: { removedBox: position },
      });
      const requestId = res.data?.data?._id;
      setDepartmentData((prev) => {
        const d = prev[deptId];
        const positions = d.positions.map((p) =>
          p.id === posId ? { ...p, pendingRequestId: requestId } : p
        );
        return { ...prev, [deptId]: { ...d, positions } };
      });
    } catch (err) {
      alert("Gagal mengirim permintaan hapus. Coba lagi.");
      setDepartmentData((prev) => {
        const d = prev[deptId];
        const positions = d.positions.map((p) =>
          p.id === posId ? { ...p, pendingAction: undefined } : p
        );
        return { ...prev, [deptId]: { ...d, positions } };
      });
    }
  };`;

r = replaceFunctionBody(
  content,
  "const handleRemoveCustomBox = async (deptId, posId) => {",
  "\n  };",
  newHandleRemoveCustomBox,
  "Patch 2: handleRemoveCustomBox"
);
content = r.content;
if (!r.ok) allOk = false;

// ============================================================
// PATCH 3: Sisipkan useEffect baru untuk load pending requests
// (disisipkan tepat setelah definisi handleRemoveCustomBox yang baru)
// ============================================================
const anchor3 = newHandleRemoveCustomBox;
const newEffect = `

  useEffect(() => {
    if (!selectedDepartment) return;
    const deptId = selectedDepartment.id;
    const loadPendingBoxRequests = async () => {
      try {
        const res = await soBagianChangeRequestsAPI.getAll();
        const allRequests = res.data?.data || res.data || [];
        const relevant = allRequests.filter(
          (r) =>
            r.department === selectedDepartment.name &&
            (r.changeType === "add" || r.changeType === "delete") &&
            ["pending", "waiting_director_approval"].includes(r.status)
        );

        setDepartmentData((prev) => {
          const dept = prev[deptId];
          if (!dept) return prev;
          let positions = [...(dept.positions || [])];

          relevant.forEach((r) => {
            if (r.changeType === "add" && r.proposedData?.boxData) {
              const box = r.proposedData.boxData;
              const alreadyThere = positions.some((p) => p.id === box.id);
              if (!alreadyThere) {
                positions.push({ ...box, isCustom: true, pendingAction: "add", pendingRequestId: r._id });
              }
            } else if (r.changeType === "delete" && r.currentData?.removedBox) {
              const removedId = r.currentData.removedBox.id;
              positions = positions.map((p) =>
                p.id === removedId ? { ...p, pendingAction: "delete", pendingRequestId: r._id } : p
              );
            }
          });

          return { ...prev, [deptId]: { ...dept, positions } };
        });
      } catch (err) {
        console.error("Gagal load pending box requests:", err);
      }
    };
    loadPendingBoxRequests();
  }, [selectedDepartment]);`;

if (content.includes(anchor3)) {
  const insertPos = content.indexOf(anchor3) + anchor3.length;
  content = content.slice(0, insertPos) + newEffect + content.slice(insertPos);
  console.log("[Patch 3] useEffect loadPendingBoxRequests — disisipkan setelah handleRemoveCustomBox.");
} else {
  console.log("[Patch 3] GAGAL: anchor (handleRemoveCustomBox baru) tidak ditemukan.");
  allOk = false;
}

// ============================================================
// PATCH 4: renderCustomBoxesInColumn — tambah badge pending
// ============================================================
const old4marker1 = 'className={isEditMode ? "bg-white border-2 border-purple-400 rounded shadow-sm flex min-h-[120px] w-[280px] relative" : "bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px] relative"}\n      >';
const new4 = `className={isEditMode ? "bg-white border-2 border-purple-400 rounded shadow-sm flex min-h-[120px] w-[280px] relative" : "bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px] relative"}
      >
        {p.pendingAction && (
          <span className={\`absolute -top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white z-20 \${p.pendingAction === "delete" ? "bg-red-500" : "bg-amber-500"}\`}>
            {p.pendingAction === "delete" ? "Menunggu Hapus" : "Pending Approval"}
          </span>
        )}`;

const count4 = content.split(old4marker1).length - 1;
console.log(`[Patch 4] Badge pending di renderCustomBoxesInColumn — ditemukan: ${count4}`);
if (count4 !== 1) allOk = false;

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

content = content.split(old4marker1).join(new4);

fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: semua patch diterapkan.");
