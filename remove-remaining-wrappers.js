const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// The 4 remaining column wrappers we need to remove are at lines ~2246, 2269, 2297, 2507
// They all use className="space-y-3"
// Strategy: For each, we need to:
// 1. Remove the opening <div className="space-y-3"> 
// 2. Find its matching </div> and remove it too
// All are at 14-space indent

const lines = content.split('\n');

// Process lines and remove space-y-3 column wrappers
const newLines = [];
let skipColWrapperClose = 0; // depth tracking for removed wrappers

// Track which lines are opening/closing wrappers we want to remove
// Lines 2246, 2269, 2297, 2507 (1-indexed) = 2245, 2268, 2296, 2506 (0-indexed)
// But after edits, we need to scan dynamically
let i = 0;
const wrapperDepths = []; // stack of depths at which we opened a skipped wrapper

while (i < lines.length) {
  const line = lines[i];
  const trimmed = line ? line.trimEnd() : '';
  
  // Detect space-y-3 column wrapper opens (at 14-space indent, inside the <> section)
  if (trimmed === '              <div className="space-y-3">' || 
      trimmed === '              <div className="space-y-3">\r') {
    // Skip this open tag, track depth
    wrapperDepths.push(0);
    i++;
    continue;
  }
  
  if (wrapperDepths.length > 0) {
    // We're inside a skipped wrapper
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    wrapperDepths[wrapperDepths.length - 1] += opens - closes;
    
    // If this line causes depth to go negative, this is the wrapper's closing </div>
    if (wrapperDepths[wrapperDepths.length - 1] < 0 && 
        (trimmed === '              </div>' || trimmed === '              </div>\r')) {
      // Skip this closing tag too
      wrapperDepths.pop();
      i++;
      continue;
    }
  }
  
  newLines.push(lines[i]);
  i++;
}

content = newLines.join('\n');
fs.writeFileSync('frontend/src/pages/Dashboard.jsx', content);
console.log('Done! Removed remaining space-y-3 column wrappers.');
console.log('Lines before:', lines.length, 'Lines after:', newLines.length);
