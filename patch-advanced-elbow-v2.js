const fs = require('fs');
const filePath = 'frontend/src/components/AdvancedEditorCanvas.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// ── Cek apakah sudah di-patch ──
if (content.includes('generateElbowPath')) {
  console.log('✅ File sudah di-patch sebelumnya (generateElbowPath sudah ada)');
  process.exit(0);
}

// ── Helper: generateElbowPath ──
const elbowHelper = `
  // ── Elbow path generator ───────────────────────────────────────
  const generateElbowPath = (from, to) => {
    const x1 = from.x, y1 = from.y;
    const x2 = to.x,   y2 = to.y;
    const dx = x2 - x1, dy = y2 - y1;
    const r = 8;
    if (Math.abs(dx) < 5) return \`M \${x1} \${y1} L \${x2} \${y2}\`;
    if (Math.abs(dy) < 5) return \`M \${x1} \${y1} L \${x2} \${y2}\`;
    const signX = dx > 0 ? 1 : -1;
    const signY = dy > 0 ? 1 : -1;
    const fromSide = from.side || 'right';
    if (fromSide === 'right' || fromSide === 'left') {
      const midX = x1 + dx / 2;
      const rX = Math.min(r, Math.abs(dx) / 2);
      const rY = Math.min(r, Math.abs(dy) / 2);
      return [
        \`M \${x1} \${y1}\`,
        \`H \${midX - rX * signX}\`,
        \`Q \${midX} \${y1} \${midX} \${y1 + rY * signY}\`,
        \`V \${y2 - rY * signY}\`,
        \`Q \${midX} \${y2} \${midX + rX * signX} \${y2}\`,
        \`H \${x2}\`,
      ].join(' ');
    }
    const midY = y1 + dy / 2;
    const rX2 = Math.min(r, Math.abs(dx) / 2);
    const rY2 = Math.min(r, Math.abs(dy) / 2);
    return [
      \`M \${x1} \${y1}\`,
      \`V \${midY - rY2 * signY}\`,
      \`Q \${x1} \${midY} \${x1 + rX2 * signX} \${midY}\`,
      \`H \${x2 - rX2 * signX}\`,
      \`Q \${x2} \${midY} \${x2} \${midY + rY2 * signY}\`,
      \`V \${y2}\`,
    ].join(' ');
  };

`;

// Sisipkan helper sebelum renderConnections
const insertBefore = '  const renderConnections = () => {';
if (!content.includes(insertBefore)) {
  console.log('❌ Tidak menemukan "const renderConnections" — cek nama fungsi di file');
  process.exit(1);
}
content = content.replace(insertBefore, elbowHelper + insertBefore);

// ── Ganti getClosestPoints: tambahkan properti side ──
const oldEdges1 = `      const edges1 = [
        { x: pos1.x + size1.width / 2, y: pos1.y }, // top
        { x: pos1.x + size1.width / 2, y: pos1.y + size1.height }, // bottom
        { x: pos1.x, y: pos1.y + size1.height / 2 }, // left
        { x: pos1.x + size1.width, y: pos1.y + size1.height / 2 }, // right
      ];
      
      const edges2 = [
        { x: pos2.x + size2.width / 2, y: pos2.y }, // top
        { x: pos2.x + size2.width / 2, y: pos2.y + size2.height }, // bottom
        { x: pos2.x, y: pos2.y + size2.height / 2 }, // left
        { x: pos2.x + size2.width, y: pos2.y + size2.height / 2 }, // right
      ];`;

const newEdges1 = `      const edges1 = [
        { x: pos1.x + size1.width / 2, y: pos1.y,                   side: 'top'    },
        { x: pos1.x + size1.width / 2, y: pos1.y + size1.height,     side: 'bottom' },
        { x: pos1.x,                   y: pos1.y + size1.height / 2, side: 'left'   },
        { x: pos1.x + size1.width,     y: pos1.y + size1.height / 2, side: 'right'  },
      ];

      const edges2 = [
        { x: pos2.x + size2.width / 2, y: pos2.y,                   side: 'top'    },
        { x: pos2.x + size2.width / 2, y: pos2.y + size2.height,     side: 'bottom' },
        { x: pos2.x,                   y: pos2.y + size2.height / 2, side: 'left'   },
        { x: pos2.x + size2.width,     y: pos2.y + size2.height / 2, side: 'right'  },
      ];`;

if (content.includes(oldEdges1)) {
  content = content.replace(oldEdges1, newEdges1);
  console.log('✅ edges1/edges2 updated dengan properti side');
} else {
  console.log('⚠️  edges1 pattern tidak cocok persis — coba replace manual');
}

// ── Ganti <line> dengan <g> berisi elbow path ──
// Cari pola <line key={conn.id} ... /> dan ganti
const oldLineJSX = `          return (
            <line
              key={conn.id}
              x1={pts.from.x}
              y1={pts.from.y}
              x2={pts.to.x}
              y2={pts.to.y}
              stroke={editorMode === 'delete' ? '#ef4444' : '#6b7280'}
              strokeWidth={editorMode === 'delete' ? 3 : 1.5}
              className={editorMode === 'delete' ? 'cursor-pointer' : ''}
              style={{ pointerEvents: editorMode === 'delete' ? 'stroke' : 'none' }}
              onClick={() => handleConnectionClick(conn.id)}
            />
          );`;

const newPathJSX = `          const d = generateElbowPath(pts.from, pts.to);
          const isDeleteMode = editorMode === 'delete';
          const mx = (pts.from.x + pts.to.x) / 2;
          const my = (pts.from.y + pts.to.y) / 2;
          return (
            <g key={conn.id}>
              {/* Hit area transparan lebar agar mudah diklik */}
              <path
                d={d}
                stroke="transparent"
                strokeWidth={14}
                fill="none"
                style={{ pointerEvents: isDeleteMode ? 'stroke' : 'none', cursor: isDeleteMode ? 'pointer' : 'default' }}
                onClick={() => handleConnectionClick(conn.id)}
              />
              {/* Visible elbow line */}
              <path
                d={d}
                stroke={isDeleteMode ? '#ef4444' : '#6b7280'}
                strokeWidth={isDeleteMode ? 2.5 : 1.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: 'none' }}
              />
              {/* Ikon X di tengah line saat delete mode */}
              {isDeleteMode && (
                <g style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={() => handleConnectionClick(conn.id)}>
                  <circle cx={mx} cy={my} r={9} fill="#ef4444" />
                  <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="11" fontWeight="bold">✕</text>
                </g>
              )}
            </g>
          );`;

if (content.includes(oldLineJSX)) {
  content = content.replace(oldLineJSX, newPathJSX);
  console.log('✅ <line> berhasil diganti dengan elbow <path>');
} else {
  console.log('❌ Pola <line> tidak ditemukan persis');
  console.log('   Coba cari baris "x1={pts.from.x}" di file dan ganti manual');
  process.exit(1);
}

// ── Tambah defs arrowhead di dalam SVG ──
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
          <marker id="arrow-gray" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
          </marker>
          <marker id="arrow-red" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
          </marker>
        </defs>
        {conns.map(conn => {`;

if (content.includes(oldSvgOpen)) {
  content = content.replace(oldSvgOpen, newSvgOpen);
  console.log('✅ Arrowhead marker defs ditambahkan');
} else {
  console.log('⚠️  SVG open pattern tidak cocok — arrowhead tidak ditambahkan');
}

fs.writeFileSync(filePath, content);
console.log('');
console.log('🎉 Semua patch berhasil diterapkan!');
console.log('   Jalankan: npm run dev');