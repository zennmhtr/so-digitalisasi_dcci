const fs = require('fs');
const filePath = 'frontend/src/components/AdvancedEditorCanvas.jsx';
let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('generateElbowPath')) {
  console.log('✅ Sudah di-patch sebelumnya.');
  process.exit(0);
}

// ── Regex: cari seluruh blok renderConnections dari awal sampai closing }; ──
// Strategi: cari dari "const renderConnections" sampai pola return ); diikuti }; 
const renderConnStart = content.indexOf('  const renderConnections = () => {');
if (renderConnStart === -1) {
  console.log('❌ Tidak menemukan "const renderConnections"');
  process.exit(1);
}

// Cari closing dari fungsi ini — cari "  };" setelah renderConnStart
// Fungsi diakhiri dengan return (...); lalu };
// Kita cari posisi SVG closing tag </svg> lalu closing }; setelahnya
const svgClose = '</svg>';
const svgCloseIdx = content.indexOf(svgClose, renderConnStart);
if (svgCloseIdx === -1) {
  console.log('❌ Tidak menemukan </svg> setelah renderConnections');
  process.exit(1);
}

// Setelah </svg>, cari ");" dan "};" penutup fungsi
const afterSvg = content.indexOf('\n  };', svgCloseIdx);
if (afterSvg === -1) {
  console.log('❌ Tidak menemukan penutup fungsi setelah </svg>');
  process.exit(1);
}

const renderConnEnd = afterSvg + '\n  };'.length;

// Ambil bagian sebelum dan sesudah fungsi
const before = content.slice(0, renderConnStart);
const after = content.slice(renderConnEnd);

// ── Fungsi baru renderConnections dengan elbow path ──
const newRenderConnections = `  // ── Elbow path generator ───────────────────────────────────────
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

  const renderConnections = () => {
    const conns = organizationData?.connections || [];
    if (conns.length === 0) return null;

    const getClosestPoints = (key1, key2) => {
      const pos1 = positions[key1];
      const pos2 = positions[key2];
      if (!pos1 || !pos2) return null;

      const size1 = sizes[key1] || { width: 176, height: 80 };
      const size2 = sizes[key2] || { width: 176, height: 80 };

      const edges1 = [
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
      ];

      let minDist = Infinity;
      let bestP1 = edges1[0];
      let bestP2 = edges2[0];

      for (const p1 of edges1) {
        for (const p2 of edges2) {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < minDist) {
            minDist = dist;
            bestP1 = p1;
            bestP2 = p2;
          }
        }
      }
      return { from: bestP1, to: bestP2 };
    };

    const isDeleteMode = editorMode === 'delete';

    return (
      <svg
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
        {conns.map(conn => {
          const pts = getClosestPoints(conn.from, conn.to);
          if (!pts) return null;
          const d = generateElbowPath(pts.from, pts.to);
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
                markerEnd={isDeleteMode ? 'url(#arrow-red)' : 'url(#arrow-gray)'}
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
          );
        })}
      </svg>
    );
  };`;

content = before + newRenderConnections + after;
fs.writeFileSync(filePath, content);

console.log('✅ Patch elbow v3 berhasil!');
console.log('   - renderConnections diganti dengan elbow path');
console.log('   - generateElbowPath helper ditambahkan');
console.log('   - Arrowhead marker defs ditambahkan');
console.log('   - Delete mode: ikon X merah di tengah line');
console.log('');
console.log('Jalankan: npm run dev'); 