const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

content = content.replace(/<\/div>\s*{\/\* Column 2/g, '{/* Column 2');
content = content.replace(/<\/div>\s*{\/\* Column 3/g, '{/* Column 3');
content = content.replace(/<\/div>\s*{\/\* Column 4/g, '{/* Column 4');
content = content.replace(/<\/div>\s*{\/\* Column 5/g, '{/* Column 5');
content = content.replace(/<\/div>\s*{\/\* Column 6/g, '{/* Column 6');

content = content.replace(/style=\{getPos\([^)]+\)\.style\}/g, '');
content = content.replace(/\$\{getPos\([^)]+\)\.className\}/g, '');

// The very last closing div for the grid also needs to be removed?
// The grid wrapper was `<div className="grid grid-cols-6 gap-4">`. We removed it.
// At the very end of the component, there might be one extra `</div>`.
// Let's just rely on the compiler to tell us if there's an extra `</div>` or we can find it.
// The grid layout closed right before the Legend (NOTE: ...).
// So `</div>\s*{/* Legend */}` should become `{/* Legend */}`
content = content.replace(/<\/div>\s*{\/\* Legend/g, '{/* Legend');

// We also need to remove the `const getPos = ...` since it's no longer used and could cause errors.
// Wait, getPos is still defined, it's fine if it's unused.

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', content);
