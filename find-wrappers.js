const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');
const lines = content.split('\n');

// Find all remaining column wrapper divs in the gridRef section (lines 2070+)
for (let i = 2068; i < lines.length - 30; i++) {
  const l = lines[i];
  if (l && (l.includes('"space-y-') || l.includes('"flex flex-col gap-0"'))) {
    console.log((i + 1), l.substring(0, 80));
  }
}
