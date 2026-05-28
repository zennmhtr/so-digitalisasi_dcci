const fs = require('fs');
const filePath = 'frontend/src/components/AdvancedEditorCanvas.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// ── 1. Ganti fungsi renderConnections seluruhnya ──
const oldRenderConnections = `  const renderConnections = () => {
    const conns = organizationData?.connections || [];
    if (conns.length === 0) return null;

    const getClosestPoints = (key1, key2) => {
      const pos1 = positions[key1];
      const pos2 = positions[key2];
      if (!pos1 || !pos2) return null;

      const size1 = sizes[key1] || { width: 176, height: 80 };
      const size2 = sizes[key2] || { width: 176, height: 80 };

      const edges1 = [
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

    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 5, overflow: 'visible' }}
      >
        {conns.map(conn => {
          const pts = getClosestPoints(conn.from, conn.to);
          if (!pts) return null;
          return (
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
          );
        })}
      </svg>
    );
  };`;

const newRenderConnections = `  const renderConnections = () => {
    const conns = organizationData?.connections || [];
    if (conns.length === 0) return null;

    // ── Cari titik edge terdekat antara dua box ──────────────
    const getClosestPoints = (key1, key2) => {
      const pos1 = positions[key1];
      const pos2 = positions[key2];
      if (!pos1 || !pos2) return null;

      const size1 = sizes[key1] || { width: 176, height: 80 };
      const size2 = sizes[key2] || { width: 176, height: 80 };

      // 4 titik edge: top, bottom, left, right
      const edges1 = [
        { x: pos1.x + size1.width / 2, y: pos1.y,                    side: 'top'    },
        { x: pos1.x + size1.width / 2, y: pos1.y + size1.height,      side: 'bottom' },
        { x: pos1.x,                   y: pos1.y + size1.height / 2,  side: 'left'   },
        { x: pos1.x + size1.width,     y: pos1.y + size1.height / 2,  side: 'right'  },
      ];
      const edges2 = [
        { x: pos2.x + size2.width / 2, y: pos2.y,                    side: 'top'    },
        { x: pos2.x + size2.width / 2, y: pos2.y + size2.height,      side: 'bottom' },
        { x: pos2.x,                   y: pos2.y + size2.height / 2,  side: 'left'   },
        { x: pos2.x + size2.width,     y: pos2.y + size2.height / 2,  side: 'right'  },
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

    // ── Generate elbow path orthogonal dengan sudut rounded ──
    const generateElbowPath = (from, to) => {
      const x1 = from.x;
      const y1 = from.y;
      const x2 = to.x;
      const y2 = to.y;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const r = 8; // radius sudut

      // Hampir lurus — tidak perlu belok
      if (Math.abs(dx) < 5) return \`M \${x1} \${y1} L \${x2} \${y2}\`;
      if (Math.abs(dy) < 5) return \`M \${x1} \${y1} L \${x2} \${y2}\`;

      const fromSide = from.side;
      const toSide = to.side;

      const signX = dx > 0 ? 1 : -1;
      const signY = dy > 0 ? 1 : -1;

      // ── Horizontal-first (right/left → naik/turun) ──
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

      // ── Vertical-first (top/bottom → kiri/kanan) ──
      const midY = y1 + dy / 2;
      const rX = Math.min(r, Math.abs(dx) / 2);
      const rY = Math.min(r, Math.abs(dy) / 2);
      return [
        \`M \${x1} \${y1}\`,
        \`V \${midY - rY * signY}\`,
        \`Q \${x1} \${midY} \${x1 + rX * signX} \${midY}\`,
        \`H \${x2 - rX * signX}\`,
        \`Q \${x2} \${midY} \${x2} \${midY + rY * signY}\`,
        \`V \${y2}\`,
      ].join(' ');
    };

    const isDeleteMode = editorMode === 'delete';

    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 5, overflow: 'visible' }}
      >
        <defs>
          {/* Arrowhead marker normal */}
          <marker id="arrow-normal" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
          </marker>
          {/* Arrowhead marker delete mode */}
          <marker id="arrow-delete" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
          </marker>
        </defs>

        {conns.map(conn => {
          const pts = getClosestPoints(conn.from, conn.to);
          if (!pts) return null;

          const d = generateElbowPath(pts.from, pts.to);

          return (
            <g key={conn.id}>
              {/* Hit area (invisible, lebar agar mudah diklik saat delete mode) */}
              <path
                d={d}
                stroke="transparent"
                strokeWidth={12}
                fill="none"
                style={{ pointerEvents: isDeleteMode ? 'stroke' : 'none', cursor: isDeleteMode ? 'pointer' : 'default' }}
                onClick={() => handleConnectionClick(conn.id)}
              />
              {/* Visible line */}
              <path
                d={d}
                stroke={isDeleteMode ? '#ef4444' : '#6b7280'}
                strokeWidth={isDeleteMode ? 2.5 : 1.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd={isDeleteMode ? 'url(#arrow-delete)' : 'url(#arrow-normal)'}
                style={{ pointerEvents: 'none' }}
              />
              {/* Delete mode: tampilkan X di tengah line */}
              {isDeleteMode && (() => {
                const mx = (pts.from.x + pts.to.x) / 2;
                const my = (pts.from.y + pts.to.y) / 2;
                return (
                  <g
                    style={{ pointerEvents: 'all', cursor: 'pointer' }}
                    onClick={() => handleConnectionClick(conn.id)}
                  >
                    <circle cx={mx} cy={my} r={9} fill="#ef4444" />
                    <text x={mx} y={my} textAnchor="middle" dominantBaseline="central"
                      fill="white" fontSize="11" fontWeight="bold">✕</text>
                  </g>
                );
              })()}
            </g>
          );
        })}
      </svg>
    );
  };`;

if (content.includes(oldRenderConnections)) {
  content = content.replace(oldRenderConnections, newRenderConnections);
  fs.writeFileSync(filePath, content);
  console.log('✅ Patch berhasil diterapkan ke AdvancedEditorCanvas.jsx');
  console.log('   Perubahan:');
  console.log('   • <line> straight → <path> elbow orthogonal dengan sudut rounded');
  console.log('   • Ditambahkan arrowhead marker di ujung connector');
  console.log('   • Hit area 12px agar mudah diklik saat delete mode');
  console.log('   • Ikon ✕ di tengah connector saat delete mode');
} else {
  console.log('❌ Patch gagal — teks lama tidak ditemukan persis.');
  console.log('   Kemungkinan file sudah dimodifikasi sebelumnya.');
  console.log('   Coba cari manual bagian renderConnections di AdvancedEditorCanvas.jsx');
}