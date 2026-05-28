const fs = require('fs');
const path = 'frontend/src/components/StaticOrgChart.jsx';
let content = fs.readFileSync(path, 'utf8');

// ── 1. Tambah helper function generateElbowPath sebelum renderConnections ──
const helperFn = `
  // Helper: buat elbow path orthogonal dengan sudut membulat
  const generateElbowPath = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const r = 6; // radius sudut

    // Tentukan arah berdasarkan selisih posisi
    if (Math.abs(dx) < 5) {
      // Hampir vertikal lurus
      return \`M \${x1} \${y1} L \${x2} \${y2}\`;
    }

    if (Math.abs(dy) < 5) {
      // Hampir horizontal lurus
      return \`M \${x1} \${y1} L \${x2} \${y2}\`;
    }

    // Titik belok di tengah horizontal
    const midX = x1 + dx / 2;

    const signX = dx > 0 ? 1 : -1;
    const signY = dy > 0 ? 1 : -1;
    const rX = Math.min(r, Math.abs(dx) / 2);
    const rY = Math.min(r, Math.abs(dy) / 2);

    // Path: dari (x1,y1) → horizontal ke midX → belok → vertikal ke y2 → belok → horizontal ke (x2,y2)
    return [
      \`M \${x1} \${y1}\`,
      \`H \${midX - rX * signX}\`,
      \`Q \${midX} \${y1} \${midX} \${y1 + rY * signY}\`,
      \`V \${y2 - rY * signY}\`,
      \`Q \${midX} \${y2} \${midX + rX * signX} \${y2}\`,
      \`H \${x2}\`,
    ].join(' ');
  };

`;

// Sisipkan helper sebelum renderConnections
content = content.replace(
  '  // ── SVG connections ────────────────────────────────────────────',
  helperFn + '  // ── SVG connections ────────────────────────────────────────────'
);

// ── 2. Ganti <line> dengan <path> menggunakan generateElbowPath ──
const oldLine = `            <line
              key={conn.id}
              x1={pts.from.x} y1={pts.from.y} x2={pts.to.x} y2={pts.to.y}
              stroke="#6b7280" strokeWidth="1.5"
            />`;

const newPath = `            <path
              key={conn.id}
              d={generateElbowPath(pts.from.x, pts.from.y, pts.to.x, pts.to.y)}
              stroke="#6b7280"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />`;

content = content.replace(oldLine, newPath);

// ── 3. Tambah arrowhead marker di SVG ──
const oldSvgOpen = `      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 5, overflow: 'visible' }}
      >
        {conns.map(conn => {`;

const newSvgOpen = `      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 5, overflow: 'visible' }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
          </marker>
        </defs>
        {conns.map(conn => {`;

content = content.replace(oldSvgOpen, newSvgOpen);

// ── 4. Tambah markerEnd pada path ──
content = content.replace(
  `              strokeLinecap="round"
              strokeLinejoin="round"
            />`,
  `              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#arrowhead)"
            />`
);

fs.writeFileSync(path, content);
console.log('    Connector elbow patch applied to StaticOrgChart.jsx');
console.log('   - Straight <line> → Elbow <path> dengan sudut membulat');
console.log('   - Ditambahkan arrowhead marker');
console.log('   - Helper generateElbowPath() tersedia');