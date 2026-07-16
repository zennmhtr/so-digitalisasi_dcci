// patch-hrga-it-approval-flow-backend.js
// Cara pakai:
//   1) Dry-run: node patch-hrga-it-approval-flow-backend.js
//   2) Terapkan: node patch-hrga-it-approval-flow-backend.js --apply

const fs = require("fs");

const FILE = "/var/www/so-digitalisasi_dcci/backend/routes/so-bagian-change-requests.js";
const APPLY = process.argv.includes("--apply");

let content = fs.readFileSync(FILE, "utf8");

function countOccurrences(str, sub) {
  let count = 0, pos = 0;
  while ((pos = str.indexOf(sub, pos)) !== -1) { count++; pos += 1; }
  return count;
}

let allOk = true;

// ============================================================
// PATCH 1: Tambahkan import SOBagianData + helper applyBoxChangeIfNeeded
// ============================================================
const old1 = `const SOBagianChangeRequest = require("../models/SOBagianChangeRequest");
const router = express.Router();`;

const new1 = `const SOBagianChangeRequest = require("../models/SOBagianChangeRequest");
const SOBagianData = require("../models/SOBagianData");
const router = express.Router();

// Mapping nama department (field "department" di change request) ke bagianId di SOBagianData.
// Tambahkan entry baru di sini setiap kali department lain ikut dimigrasi ke sistem box dinamis.
const DEPARTMENT_NAME_TO_BAGIAN_ID = {
  "HRGA & IT Department": "hrga-it",
};

// Menerapkan perubahan box (add/delete) ke SOBagianData setelah change request disetujui penuh.
// Aman dipanggil berkali-kali (idempotent): box yang sudah ada tidak ditambah dobel,
// box yang sudah hilang tidak dihapus ulang.
async function applyBoxChangeIfNeeded(request) {
  if (request.changeType !== "add" && request.changeType !== "delete") return;

  const bagianId = DEPARTMENT_NAME_TO_BAGIAN_ID[request.department];
  if (!bagianId) return;

  const record = await SOBagianData.findOne({ bagianId });
  if (!record) return;

  if (request.changeType === "add" && request.proposedData?.boxData) {
    const box = request.proposedData.boxData;
    const exists = record.boxes.some((b) => b.id === box.id);
    if (!exists) {
      record.boxes.push({
        id: box.id,
        code: box.code || "",
        title: box.title || "",
        name: box.name || "",
        empId: box.empId || "",
        column: box.column,
        parentId: box.groupKey || null,
        order: box.order || 0,
      });
      await record.save();
      console.log(\`✅ Box "\${box.name}" diterapkan permanen ke \${bagianId}\`);
    }
  } else if (request.changeType === "delete" && request.currentData?.removedBox) {
    const removedId = request.currentData.removedBox.id;
    const before = record.boxes.length;
    record.boxes = record.boxes.filter((b) => b.id !== removedId);
    if (record.boxes.length !== before) {
      await record.save();
      console.log(\`✅ Box "\${request.currentData.removedBox.name}" dihapus permanen dari \${bagianId}\`);
    }
  }
}`;

const count1 = countOccurrences(content, old1);
console.log(`[Patch 1] Import + helper function — ditemukan: ${count1}`);
if (count1 !== 1) allOk = false;

// ============================================================
// PATCH 2: Panggil applyBoxChangeIfNeeded di branch "Manager Request Flow" (direct director approve)
// ============================================================
const old2 = `          } catch (err) {
            console.error("Warning: failed to inject approval data:", err);
          }

          request.markModified("proposedData");
          await request.save();

          const populated = await SOBagianChangeRequest.findById(request._id)
            .populate("requestedBy", "name email department")
            .populate("firstApprovedBy", "name email")
            .populate("approvedBy", "name email");

          console.log("✅ Manager request approved directly by Director");`;

const new2 = `          } catch (err) {
            console.error("Warning: failed to inject approval data:", err);
          }

          request.markModified("proposedData");
          await request.save();
          await applyBoxChangeIfNeeded(request);

          const populated = await SOBagianChangeRequest.findById(request._id)
            .populate("requestedBy", "name email department")
            .populate("firstApprovedBy", "name email")
            .populate("approvedBy", "name email");

          console.log("✅ Manager request approved directly by Director");`;

const count2 = countOccurrences(content, old2);
console.log(`[Patch 2] Branch Manager Request Flow — ditemukan: ${count2}`);
if (count2 !== 1) allOk = false;

// ============================================================
// PATCH 3: Panggil applyBoxChangeIfNeeded di branch "Employee Request Flow" (final director approve)
// ============================================================
const old3 = `          } catch (err) {
            console.error(
              "Warning: failed to inject approvedBy.date into proposedData:",
              err
            );
          }

          request.markModified("proposedData");
          await request.save();

          const populated = await SOBagianChangeRequest.findById(request._id)
            .populate("requestedBy", "name email department")
            .populate("firstApprovedBy", "name email")
            .populate("secondApprovedBy", "name email")
            .populate("approvedBy", "name email")
            .populate("reviewedBy", "name email");

          console.log("✅ Employee request fully approved by Director");`;

const new3 = `          } catch (err) {
            console.error(
              "Warning: failed to inject approvedBy.date into proposedData:",
              err
            );
          }

          request.markModified("proposedData");
          await request.save();
          await applyBoxChangeIfNeeded(request);

          const populated = await SOBagianChangeRequest.findById(request._id)
            .populate("requestedBy", "name email department")
            .populate("firstApprovedBy", "name email")
            .populate("secondApprovedBy", "name email")
            .populate("approvedBy", "name email")
            .populate("reviewedBy", "name email");

          console.log("✅ Employee request fully approved by Director");`;

const count3 = countOccurrences(content, old3);
console.log(`[Patch 3] Branch Employee Request Flow — ditemukan: ${count3}`);
if (count3 !== 1) allOk = false;

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
content = content.replace(old3, new3);

fs.writeFileSync(FILE, content, "utf8");
console.log("BERHASIL: semua patch diterapkan ke file.");
