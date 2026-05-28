const fs = require('fs');
const filePath = 'frontend/src/pages/DashboardEditorAdvanced.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix duplicate id "mkt-eng" — ganti yang kedua dengan id unik
const oldDuplicate = `          { id: "mkt-eng", code: "MKT1.0", title: "MARKETING", name: "SAVITRI OCTAVIANI", empId: "23190254", clickable: true, route: "/marketing-department" },
          { id: "mkt-2", code: "MKT1.1", title: "MARKETING BESS", name: "TBD", empId: "-" },
          { id: "mkt-adv", code: "MKT1.2", title: "MARKETING (AFTERMARKET)", name: "TBD", empId: "-" },`;

const newFixed = `          { id: "mkt-eng", code: "MKT1.0", title: "MARKETING", name: "SAVITRI OCTAVIANI", empId: "23190254", clickable: true, route: "/marketing-department" },
          { id: "mkt-eng-2", code: "MKT1.1", title: "MARKETING BESS", name: "TBD", empId: "-" },
          { id: "mkt-adv", code: "MKT1.2", title: "MARKETING (AFTERMARKET)", name: "TBD", empId: "-" },`;

if (content.includes(oldDuplicate)) {
  content = content.replace(oldDuplicate, newFixed);
  fs.writeFileSync(filePath, content);
  console.log('✅ Fix duplicate key berhasil');
} else {
  console.log('⚠️  Duplicate key pattern tidak ditemukan — mungkin sudah diperbaiki');
}