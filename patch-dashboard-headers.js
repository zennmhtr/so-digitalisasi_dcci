const fs = require('fs');
const path = 'frontend/src/pages/Dashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Commissioners Header
content = content.replace(
  /<div className="border border-gray-400 bg-gray-50 text-center mb-4">/,
  '<div className="border border-gray-400 bg-gray-50 text-center mb-4" style={{ position: \'absolute\', left: organizationData?.positions?.[\'commissioners-header\']?.x || 400, top: organizationData?.positions?.[\'commissioners-header\']?.y || 20, zIndex: 30, width: \'192px\' }}>'
);

// President Commissioner
content = content.replace(
  /<div className="border border-gray-400 bg-white p-3 text-center h-full flex flex-col justify-center">/,
  '<div className="border border-gray-400 bg-white p-3 text-center h-full flex flex-col justify-center" style={{ position: \'absolute\', left: organizationData?.positions?.[\'president-commissioner\']?.x || 250, top: organizationData?.positions?.[\'president-commissioner\']?.y || 100, zIndex: 30, width: \'192px\', minHeight: \'100px\' }}>'
);

// Commissioners List
content = content.replace(
  /<div className="border border-gray-400 bg-white p-3 text-center h-full flex flex-col justify-center gap-2">/,
  '<div className="border border-gray-400 bg-white p-3 text-center h-full flex flex-col justify-center gap-2" style={{ position: \'absolute\', left: organizationData?.positions?.[\'commissioners-list\']?.x || 470, top: organizationData?.positions?.[\'commissioners-list\']?.y || 100, zIndex: 30, width: \'192px\', minHeight: \'100px\' }}>'
);

// Headers:
const headers = [
  { text: 'BOARD OF DIRECTOR', key: 'header-bod', x: 50, y: 250 },
  { text: 'BUSINESS UNIT', key: 'header-management', x: 250, y: 250 },
  { text: 'DIVISION HEAD', key: 'header-division', x: 450, y: 250 },
  { text: 'DEPARTMENT HEAD', key: 'header-department', x: 650, y: 250 },
  { text: 'SECTION HEAD \\/ ENGINEERING PRODUCT LEADER', key: 'header-section', x: 850, y: 250 }
];

headers.forEach(h => {
  const regex = new RegExp(`(<div className="bg-blue-300 font-bold text-white text-center rounded p-2 text-[8px] uppercase h-full flex items-center justify-center leading-tight">\\s*${h.text}\\s*<\\/div>)`);
  content = content.replace(regex, `<div style={{ position: 'absolute', left: organizationData?.positions?.['${h.key}']?.x || ${h.x}, top: organizationData?.positions?.['${h.key}']?.y || ${h.y}, zIndex: 30, width: '176px' }}>$1</div>`);
});

fs.writeFileSync(path, content);
console.log('Patched headers successfully.');
