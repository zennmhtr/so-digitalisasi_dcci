// patch-hrga-it-approval-flow-frontend.js
// Cara pakai:
//   1) Dry-run: node patch-hrga-it-approval-flow-frontend.js
//   2) Terapkan: node patch-hrga-it-approval-flow-frontend.js --apply

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
// PATCH 1: handleAddBox — ajukan approval, bukan langsung simpan permanen
// ============================================================
const old1 = `    const updatedPositions = [...(departmentData[deptId].positions || []), newPosition];
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

const new1 = `    const updatedPositions = [...(departmentData[deptId].positions || []), newPosition];
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
      await soBagianChangeRequestsAPI.create({
        title: \`Tambah box: \${newPosition.name} (\${newPosition.code || newPosition.id})\`,
        description: \`Menambahkan box baru "\${newPosition.name}" di kolom \${newPosition.column}\${newPosition.groupKey ? \` (grup \${newPosition.groupKey})\` : ""}.\`,
        priority: "medium",
        changeType: "add",
        department: "HRGA & IT Department",
        proposedData: { boxData: newPosition, bagianId: deptId },
        currentData: null,
      });
      alert("Box ditambahkan di layar dan diajukan untuk approval. Menunggu persetujuan Manager/Director.");
    } catch (err) {
      console.error(err);
      alert("Box ditambahkan di layar, tapi GAGAL mengajukan approval. Cek koneksi lalu coba lagi.");
    }
  };`;

const count1 = countOccurrences(content, old1);
console.log(`[Patch 1] handleAddBox — ditemukan: ${count1}`);
if (count1 !== 1) allOk = false;

// ============================================================
// PATCH 2: handleRemoveCustomBox — ajukan approval, bukan langsung simpan permanen
// ============================================================
const old2 = `    try {
      await syncCustomBoxesToServer(deptId, updatedPositions);
    } catch (err) {
      alert("Box dihapus di layar, tapi GAGAL update di server. Cek koneksi lalu coba lagi.");
    }
  };`;

const new2 = `    try {
      await soBagianChangeRequestsAPI.create({
        title: \`Hapus box: \${removedPosition?.name || posId}\`,
        description: \`Menghapus box "\${removedPosition?.name || posId}" dari kolom \${removedPosition?.column || "-"}.\`,
        priority: "medium",
        changeType: "delete",
        department: "HRGA & IT Department",
        proposedData: null,
        currentData: { removedBox: removedPosition, bagianId: deptId },
      });
      alert("Box dihapus di layar dan diajukan untuk approval. Menunggu persetujuan Manager/Director.");
    } catch (err) {
      console.error(err);
      alert("Box dihapus di layar, tapi GAGAL mengajukan approval. Cek koneksi lalu coba lagi.");
    }
  };`;

const count2 = countOccurrences(content, old2);
console.log(`[Patch 2] handleRemoveCustomBox — ditemukan: ${count2}`);
if (count2 !== 1) allOk = false;

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

content = content.replace(old1, new1);
content = content.replace(old2, new2);

fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: semua patch diterapkan ke file.");
