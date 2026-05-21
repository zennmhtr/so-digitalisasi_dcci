const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');
const original = content;

// We need to find all column wrapper divs between lines ~2068 (right after the pre debug block) 
// and line ~2849 (before the </> close)
// They are: <div className="flex flex-col gap-0">, <div className="space-y-4">,
// and their spacers: <div className="min-h-[...]"></div>
// and their closing </div> tags that close the column wrappers

// Strategy: extract the section between the <> and </> markers we just added
// Then remove column wrappers inside it

const OPEN_MARKER = '            {/* All nodes are absolutely positioned direct children of gridRef */}\r\n            <>';
const CLOSE_MARKER = '            </>';

const startIdx = content.indexOf(OPEN_MARKER);
const endIdx = content.indexOf(CLOSE_MARKER, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find markers!');
  process.exit(1);
}

let section = content.substring(startIdx + OPEN_MARKER.length, endIdx);

// 1. Remove "Column N - ..." comment lines that wrap column sections
section = section.replace(/\n\s*\{\/\* Column \d+ - [^*]*\*\/\}/g, '');

// 2. Remove all column wrapper opening divs and their first child spacers
// Pattern: <div className="flex flex-col gap-0"> or <div className="space-y-4">
section = section.replace(/\n\s*<div className="flex flex-col gap-0">/g, '\n              <>');
section = section.replace(/\n\s*<div className="space-y-4">/g, '\n              <>');

// 3. Remove spacer divs: <div className="min-h-[...]"></div>
section = section.replace(/\n\s*<div className="min-h-\[[\d]+px\]"><\/div>/g, '');
section = section.replace(/\n\s*\{\/\* spacer removed - using absolute positioning \*\/\}/g, '');

// 4. The column wrapper </div> closing tags - these are the ones right before the next column comment
// We need to replace the column-wrapper </div> with </> (to match our <> opening)
// Each column section ends with:
//   </div>  <-- closes the column wrapper
// Then either a blank line + next column comment, or the end marker
// We can identify them because after column-wrapper closing, there's 14 spaces indent
// The column wrapper close tags are at 14 spaces indent: "              </div>"
// But we just changed the opens to "<>" at 14 spaces "              <>"
// so we need to change matching closes from </div> to </>

// Count how many <> we introduced for columns
const openCount = (section.match(/\n\s*<>/g) || []).length;
console.log('Column wrappers found (opened as <>):', openCount);

// For each column wrapper we need to find and replace its corresponding </div>
// The column wrapper divs are at indent level 14 spaces (inside the <> at 12 spaces)
// Their closing </div> are also at 14 spaces
// But we need to be careful not to catch other </div> tags

// Let's process line by line
const lines = section.split('\n');
let depth = 0;
let inColumnWrapper = false;
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Detect column wrapper opening (our <> replacements)
  if (trimmed === '<>' && line.startsWith('              <>')) {
    inColumnWrapper = true;
    depth = 0;
    newLines.push(line);
    continue;
  }
  
  if (inColumnWrapper) {
    // Track div depth inside the column wrapper
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    depth += opens - closes;
    
    // The column wrapper's own closing </div> will be when depth goes negative from 0
    // But since we replaced it with </div>, we look for the 14-space-indent </div>
    if (depth < 0 && trimmed === '</div>' && line.startsWith('              </div>')) {
      // This is the column wrapper close - replace with </>
      newLines.push('              </>');
      inColumnWrapper = false;
      depth = 0;
      continue;
    }
  }
  
  newLines.push(line);
}

section = newLines.join('\n');

content = content.substring(0, startIdx + OPEN_MARKER.length) + section + content.substring(endIdx);

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', content);
console.log('Done! Column wrappers removed.');
