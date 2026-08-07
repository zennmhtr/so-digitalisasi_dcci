const fs = require("fs");
const path = require("path");

const editorPath = path.join(__dirname, "frontend/src/pages/SoBagianEditor.jsx");
let src = fs.readFileSync(editorPath, "utf8");
let changed = false;

const replaceUnique = (label, oldStr, newStr, { allowMissing = false } = {}) => {
  const count = src.split(oldStr).length - 1;
  if (count === 0) {
    if (allowMissing) {
      console.log(`⏭️  ${label}: pattern tidak ditemukan (kemungkinan sudah dipatch), skip.`);
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

// Tidak ada guard tebak-tebak lagi — replaceUnique sendiri yang menentukan
// apakah patch masih perlu dijalankan (pattern lama masih ada) atau di-skip
// (pattern lama sudah tidak ada = sudah dipatch sebelumnya).
replaceUnique(
  "departmentGroups (lengkap 11 departemen)",
  `const departmentGroups = {
  "hrga-it": {
    "SECTION HEAD": ["HRGA & IT DEPARTMENT"],
    "STAFF LEVEL": ["HRD", "GENERAL AFFAIR & IND. RELATIONS", "INFORMATION TECHNOLOGY"],
  },
};`,
  `const departmentGroups = {
  "finance": {
    "SECTION HEAD": ["FINANCE DEPARTMENT"],
    "STAFF": ["FINANCE & ACCOUNTING"],
  },
  "management-representative": {
    "SECTION HEAD": ["MANAGEMENT REPRESENTATIVE DEPARTMENT"],
    "STAFF": ["MANAGEMENT REPRESENTATIVE"],
  },
  "marketing-battery": {
    "DEPARTMENT HEAD": ["MARKETING BATTERY DEPARTMENT"],
    "STAFF/SPECIALIST": ["AUX & POWER BATTERY MARKETING", "ESS MARKETING"],
  },
  "purchasing": {
    "SECTION HEAD": ["PURCHASING DEPARTMENT"],
    "STAFF LEVEL": ["CONTROLCABLE", "BATTERY", "GENERAL & LEGAL", "SUBCONT"],
  },
  "management-development": {
    "STAFF": ["MANAGEMENT DEVELOPEMENT/PDCA"],
  },
  "mi-she": {
    "SECTION HEAD": ["MI & SHE DEPARTMENT"],
    "STAFF LEVEL": ["MI", "SHE (5R-SMK3-ISO 14001)"],
  },
  "hrga-it": {
    "SECTION HEAD": ["HRGA & IT DEPARTMENT"],
    "STAFF LEVEL": ["HRD", "GENERAL AFFAIR & IND. RELATIONS", "INFORMATION TECHNOLOGY"],
  },
  "qa": {
    "DEPARTMENT HEAD": ["QA DEPARTMENT"],
    "UNIT/STAFF LEVEL": ["QUALITY ASSURANCE PROCESS (UNIT)"],
    "OPERATOR/ADMIN": ["QUALITY ASSURANCE PROCESS", "LAB & KALIBRASI", "VENDOR MANAGEMENT", "CLAIM & COMPLAIN"],
  },
  "marketing-engineering": {
    "DEPARTMENT HEAD": ["MARKETING ENGINEERING DEPARTMENT"],
    "SECTION HEAD": ["SALES & MARKETING CONTROLCABLE (SECTION)", "ENGINEERING CONTROLCABLE"],
    "STAFF": ["SALES & MARKETING CONTROLCABLE", "CUSTOMER REPRESENTATIVE", "PRODUCT & QUALITY ENGINEERING CABLE", "PROCESS ENGINEERING CABLE", "NEW BUSINESS DEVELOPMENT"],
  },
  "manufactur-battery": {
    "SENIOR ENGINEER": ["MANUFACTURING BATTERY DEPARTMENT"],
    "ENGINEER": ["BATTERY PRODUCTION", "QUALITY ASSURANCE", "BATTERY PME"],
    "TEAM MEMBER/TECHNICIAN": ["AUXILIARY BATTERY PRODUCT", "BESS PRODUCT", "BEV PRODUCT", "QUALITY CHECK"],
  },
  "ppic": {
    "DEPARTMENT HEAD": ["PPIC DEPARTMENT"],
    "UNIT HEAD/STAFF": ["PPC CONTROLCABLE", "BATTERY & AHM OES", "WHS CONTROLCABLE"],
    "GROUP HEAD": ["CONTROLCABLE"],
    "MEMBER": ["PROD PLAN", "DN/MANIFEST", "DELIVERY", "BATTERY", "SUPPLIER CONTROL", "MRP", "RM & OHP", "SUPPLY"],
  },
  "manufacturing-cable": {
    "SECTION HEAD": ["MANUFACTURING CABLE DEPARTMENT"],
    "STAFF / UNIT HEAD": ["MANUFACTURING UNIT", "ASSEMBLING UNIT", "PRODUCTION ENGINEERING (UNIT HEAD)"],
    "GROUP HEAD": ["GROUP CO & CI", "GROUP PO", "GROUP ASSEMBLING"],
    "TEAM MEMBER/ADMIN": ["COMPONENT OUTER & COMPONENT INNER", "PROSES OUTER", "MAINTENANCE", "PRODUCTION ENGINEERING (STAFF)", "ASSEMBLING", "QUALITY CONTROL PROCESS", "QUALITY CONTROL INCOMING", "ADMINISTRATION"],
  },
};`,
  { allowMissing: true }
);

if (changed) {
  fs.writeFileSync(editorPath, src);
  console.log("\n✅ SoBagianEditor.jsx berhasil ditulis.");
} else {
  console.log("\nℹ️  Tidak ada perubahan (pattern lama tidak ditemukan — cek manual kalau perlu).");
}
console.log("🎉 Patch departmentGroups selesai. Lanjutkan dengan build frontend.");