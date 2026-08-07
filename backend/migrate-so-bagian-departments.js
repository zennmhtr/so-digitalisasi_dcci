// migrate-so-bagian-departments.js
require('dotenv').config();
const mongoose = require('mongoose');
const SOBagianDepartment = require('./models/SOBagianDepartment');

const seed = [
  { bagianId: 'finance', name: 'Finance', route: '/finance-department', color: 'bg-blue-500', columns: ['BOARD OF DIRECTOR','DEPARTMENT HEAD','SECTION HEAD','STAFF'], order: 1, isCustom: false },
  { bagianId: 'hrga-it', name: 'HRGA & IT', route: '/hrga-it', color: 'bg-green-500', columns: ['BOARD OF DIRECTOR','DEPARTMENT HEAD','SECTION HEAD','STAFF LEVEL'], order: 2, isCustom: false },
  { bagianId: 'management-development', name: 'Management Development', route: '/management-development', color: 'bg-purple-500', columns: ['BOARD OF DIRECTOR','DEPARTMENT HEAD','SECTION HEAD','STAFF'], order: 3, isCustom: false },
  { bagianId: 'management-representative', name: 'Management Representative', route: '/management-representative', color: 'bg-orange-500', columns: ['BOARD OF DIRECTOR','DEPARTMENT HEAD','SECTION HEAD','STAFF'], order: 4, isCustom: false },
  { bagianId: 'manufactur-battery', name: 'Manufacturing Battery', route: '/manufactur-battery', color: 'bg-red-500', columns: ['BOARD OF DIRECTOR','DEPARTMENT HEAD','SENIOR ENGINEER','ENGINEER','TEAM MEMBER/TECHNICIAN'], order: 5, isCustom: false },
  { bagianId: 'manufacturing-cable', name: 'Manufacturing Cable', route: '/manufacturing-cable', color: 'bg-indigo-500', columns: ['BOARD OF DIRECTOR','DEPARTMENT HEAD','SECTION HEAD','STAFF / UNIT HEAD','GROUP HEAD','TEAM MEMBER/ADMIN'], order: 6, isCustom: false },
  { bagianId: 'marketing-battery', name: 'Marketing Battery', route: '/marketing-battery-department', color: 'bg-pink-500', columns: ['BOARD OF DIRECTOR','DEPARTMENT HEAD','SECTION HEAD','STAFF/SPECIALIST'], order: 7, isCustom: false },
  { bagianId: 'marketing-engineering', name: 'Marketing Engineering', route: '/marketing-engineering', color: 'bg-teal-500', columns: ['BOARD OF DIRECTOR','DEPARTMENT HEAD','SECTION HEAD','STAFF'], order: 8, isCustom: false },
  { bagianId: 'mi-she', name: 'MI & SHE', route: '/mi-she', color: 'bg-yellow-500', columns: ['BOARD OF DIRECTOR','DEPARTMENT HEAD','SECTION HEAD','STAFF LEVEL'], order: 9, isCustom: false },
  { bagianId: 'ppic', name: 'PPIC', route: '/ppic', color: 'bg-cyan-500', columns: ['BOARD OF DIRECTOR','DEPARTMENT HEAD','SECTION HEAD','UNIT HEAD/STAFF','GROUP HEAD','MEMBER'], order: 10, isCustom: false },
  { bagianId: 'purchasing', name: 'Purchasing', route: '/purchasing', color: 'bg-lime-500', columns: ['BOARD OF DIRECTOR','DEPARTMENT HEAD','SECTION HEAD','STAFF LEVEL'], order: 11, isCustom: false },
  { bagianId: 'qa', name: 'QA (Quality Assurance)', route: '/qa-department', color: 'bg-rose-500', columns: ['BOARD OF DIRECTOR','DEPARTMENT HEAD','UNIT/STAFF LEVEL','GROUP HEAD','OPERATOR/ADMIN'], order: 12, isCustom: false },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const d of seed) {
    await SOBagianDepartment.findOneAndUpdate({ bagianId: d.bagianId }, d, { upsert: true, new: true });
    console.log(`✅ Seeded: ${d.name}`);
  }
  await mongoose.disconnect();
  console.log('Done.');
})();