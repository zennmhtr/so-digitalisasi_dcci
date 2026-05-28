import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * AdvancedEditorCanvas — Full-featured org-chart editor.
 * Supports: drag-to-move, SVG connectors, inline edit, resize, add/delete boxes.
 */
const AdvancedEditorCanvas = ({ organizationData, onDataChange, editorMode, onStartConnect }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef(null);

  const canViewSODetails = user?.role?.permissions?.includes('View SO Details') || false;

  // ── Positions ──────────────────────────────────────────────────
  const [positions, setPositions] = useState({});
  const [sizes, setSizes] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [resizing, setResizing] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);

  // Card refs for connector calculations
  const cardRefs = useRef({});

  // ── Default position maps ─────────────────────────────────────
  const getDefaultPositions = useCallback(() => {
    if (!organizationData) return {};
    const p = {};
    const defaults = {
      'commissioners-header': { x: 400, y: 20 },
      'president-commissioner': { x: 250, y: 100 },
      'commissioners-list': { x: 470, y: 100 },
      'header-bod': { x: 50, y: 250 },
      'header-management': { x: 250, y: 250 },
      'header-division': { x: 450, y: 250 },
      'header-department': { x: 650, y: 250 },
      'header-section': { x: 850, y: 250 },
    };
    Object.entries(defaults).forEach(([k, v]) => {
      p[k] = organizationData.positions?.[k] || v;
    });

    organizationData.structure?.headers?.forEach((item, i) => {
      const k = `header-${item.id}`;
      p[k] = organizationData.positions?.[k] || { x: 50, y: 50 };
    });

    organizationData.structure?.bod?.forEach((item, i) => {
      const k = `bod-${item.id}`;
      p[k] = organizationData.positions?.[k] || { x: 50, y: 320 + i * 90 };
    });

    const mgmtY = { 'MIO1.0': 500, 'MDO1.0': 590, 'MRO1.0': 760, 'CRO1.0': 850, 'CRO2.0': 940 };
    organizationData.structure?.management?.forEach((item, i) => {
      const k = `management-${item.id}`;
      p[k] = organizationData.positions?.[k] || { x: 250, y: mgmtY[item.code] ?? 500 + i * 90 };
    });

    organizationData.structure?.business?.forEach((item, i) => {
      const k = `business-${item.id}`;
      p[k] = organizationData.positions?.[k] || { x: 450, y: 500 + i * 300 };
    });

    organizationData.structure?.divisions?.forEach((item, i) => {
      const k = `division-${item.id}`;
      p[k] = organizationData.positions?.[k] || { x: 450, y: 650 + i * 100 };
    });

    const deptY = [540, 630, 790, 880, 970, 1180, 1450, 1170];
    organizationData.structure?.departments?.forEach((item, i) => {
      const k = `department-${item.id}`;
      p[k] = organizationData.positions?.[k] || { x: 650, y: deptY[i] ?? 540 + i * 90 };
    });

    const secY = { 0: 320, 1: 410, 2: 500, 3: 750, 4: 840, 5: 930, 6: 1020, 7: 1110, 8: 1200, 9: 1290, 10: 1380, 11: 1470 };
    organizationData.structure?.sections?.forEach((item, i) => {
      const k = `section-${item.id}`;
      p[k] = organizationData.positions?.[k] || { x: 850, y: secY[i] ?? 320 + i * 90 };
    });

    return p;
  }, [organizationData]);

  useEffect(() => {
    if (!organizationData) return;
    setPositions(getDefaultPositions());
    setSizes(organizationData.sizes || {});
  }, [organizationData, getDefaultPositions]);

  // ── Drag logic ─────────────────────────────────────────────────
  const handleMouseDown = (e, itemKey) => {
    if (editorMode === 'connect') {
      e.preventDefault();
      if (!connectFrom) {
        setConnectFrom(itemKey);
      } else if (connectFrom !== itemKey) {
        // Create connection
        const newConn = {
          id: `conn-${Date.now()}`,
          from: connectFrom,
          to: itemKey,
        };
        const conns = [...(organizationData.connections || []), newConn];
        onDataChange({ ...organizationData, connections: conns, positions, sizes });
        setConnectFrom(null);
      }
      return;
    }

    if (editorMode === 'delete') {
      e.preventDefault();
      if (window.confirm(`Delete this box "${itemKey}"? This will also remove its connections.`)) {
        deleteBox(itemKey);
      }
      return;
    }

    if (editorMode === 'edit') {
      e.preventDefault();
      startEditing(itemKey);
      return;
    }

    // Default: move mode
    e.preventDefault();
    setSelectedItem(itemKey);
    setDraggedItem({
      key: itemKey,
      startX: e.clientX,
      startY: e.clientY,
      startPos: positions[itemKey] || { x: 0, y: 0 },
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (resizing) {
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;
      const newW = Math.max(120, Math.min(400, resizing.startW + deltaX));
      const newH = Math.max(40, Math.min(300, resizing.startH + deltaY));
      setSizes(prev => ({ ...prev, [resizing.key]: { width: newW, height: newH } }));
      return;
    }
    if (!draggedItem) return;
    const dx = e.clientX - draggedItem.startX;
    const dy = e.clientY - draggedItem.startY;
    setPositions(prev => ({
      ...prev,
      [draggedItem.key]: {
        x: draggedItem.startPos.x + dx,
        y: draggedItem.startPos.y + dy,
      },
    }));
  }, [draggedItem, resizing]);

  const handleMouseUp = useCallback(() => {
    if (resizing) {
      onDataChange({ ...organizationData, positions, sizes });
      setResizing(null);
      return;
    }
    if (draggedItem) {
      onDataChange({ ...organizationData, positions, sizes });
      setDraggedItem(null);
    }
  }, [draggedItem, resizing, organizationData, positions, sizes, onDataChange]);

  useEffect(() => {
    if (draggedItem || resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedItem, resizing, handleMouseMove, handleMouseUp]);

  // ── Canvas click (deselect) ────────────────────────────────────
  const handleCanvasClick = (e) => {
    if (e.target === containerRef.current || e.target.tagName === 'svg') {
      setSelectedItem(null);
      setEditingItem(null);
      setConnectFrom(null);
    }
  };

  // ── Delete box ─────────────────────────────────────────────────
  const deleteBox = (key) => {
    const newData = { ...organizationData };
    // Remove from structure
    ['headers', 'bod', 'management', 'divisions', 'departments', 'sections', 'business'].forEach(cat => {
      if (newData.structure?.[cat]) {
        newData.structure[cat] = newData.structure[cat].filter(item => {
          const prefix = cat === 'headers' ? 'header' : cat === 'divisions' ? 'division' : cat === 'departments' ? 'department' : cat === 'sections' ? 'section' : cat === 'business' ? 'business' : cat === 'bod' ? 'bod' : 'management';
          const itemKey = `${prefix}-${item.id}`;
          return itemKey !== key;
        });
      }
    });
    // Remove connections
    newData.connections = (newData.connections || []).filter(c => c.from !== key && c.to !== key);
    // Remove position & size
    const newPositions = { ...positions };
    delete newPositions[key];
    const newSizes = { ...sizes };
    delete newSizes[key];
    newData.positions = newPositions;
    newData.sizes = newSizes;
    setPositions(newPositions);
    setSizes(newSizes);
    setSelectedItem(null);
    onDataChange(newData);
  };

  // ── Inline editing ─────────────────────────────────────────────
  const startEditing = (key) => {
    // Find current item data
    const item = findItemByKey(key);
    if (!item) {
      // Cannot edit hardcoded items or items not in the structure array
      return;
    }
    
    setEditingItem(key);
    setSelectedItem(key);
    setEditValues({
      title: item.title || item.label || '',
      name: item.name || '',
      code: item.code || '',
      empId: item.empId || '',
      isLabel: 'label' in item,
      isHeader: key.startsWith('header-'),
    });
  };

  const findItemByKey = (key) => {
    const cats = [
      { prefix: 'bod-', arr: organizationData.structure?.bod },
      { prefix: 'management-', arr: organizationData.structure?.management },
      { prefix: 'division-', arr: organizationData.structure?.divisions },
      { prefix: 'department-', arr: organizationData.structure?.departments },
      { prefix: 'section-', arr: organizationData.structure?.sections },
      { prefix: 'business-', arr: organizationData.structure?.business },
      { prefix: 'header-', arr: organizationData.structure?.headers },
    ];
    for (const { prefix, arr } of cats) {
      if (key.startsWith(prefix) && arr) {
        const id = key.slice(prefix.length);
        return arr.find(it => it.id === id);
      }
    }
    
    // Special hardcoded items
    if (key === 'president-commissioner') {
      return {
        id: 'president-commissioner',
        title: organizationData.commissioners?.president?.title || 'PRESIDENT COMMISIONER',
        name: organizationData.commissioners?.president?.name || 'IRIANTO SANTOSO'
      };
    }
    
    if (key === 'commissioners-header') {
      return { id: key, label: organizationData.uiLabels?.[key] || 'BOARD OF COMMISSIONERS' };
    }
    
    const headerDefaults = {
      'header-bod': 'BOARD OF DIRECTOR',
      'header-division': 'DIVISION HEAD',
      'header-department': 'DEPARTMENT HEAD',
      'header-section': 'SECTION HEAD / ENGINEERING PRODUCT LEADER'
    };
    if (headerDefaults[key]) {
      return { id: key, label: organizationData.uiLabels?.[key] || headerDefaults[key] };
    }

    return null;
  };

  const saveEdit = () => {
    if (!editingItem) return;
    const newData = JSON.parse(JSON.stringify(organizationData));
    
    if (editingItem === 'president-commissioner') {
      if (!newData.commissioners) newData.commissioners = {};
      if (!newData.commissioners.president) newData.commissioners.president = {};
      newData.commissioners.president.title = editValues.title;
      newData.commissioners.president.name = editValues.name;
    } else if (['commissioners-header', 'header-bod', 'header-division', 'header-department', 'header-section'].includes(editingItem)) {
      if (!newData.uiLabels) newData.uiLabels = {};
      newData.uiLabels[editingItem] = editValues.title;
    } else {
      const cats = [
        { prefix: 'bod-', arr: newData.structure?.bod },
        { prefix: 'management-', arr: newData.structure?.management },
        { prefix: 'division-', arr: newData.structure?.divisions },
        { prefix: 'department-', arr: newData.structure?.departments },
        { prefix: 'section-', arr: newData.structure?.sections },
        { prefix: 'business-', arr: newData.structure?.business },
        { prefix: 'header-', arr: newData.structure?.headers },
      ];
      for (const { prefix, arr } of cats) {
        if (editingItem.startsWith(prefix) && arr) {
          const id = editingItem.slice(prefix.length);
          const item = arr.find(it => it.id === id);
          if (item) {
            if ('label' in item) {
               item.label = editValues.title;
            } else {
               item.title = editValues.title;
               item.name = editValues.name;
               item.code = editValues.code;
               item.empId = editValues.empId;
            }
          }
        }
      }
    }
    
    newData.positions = positions;
    newData.sizes = sizes;
    setEditingItem(null);
    onDataChange(newData);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValues({});
  };

  // ── Delete connection ──────────────────────────────────────────
  const handleConnectionClick = (connId) => {
    if (editorMode !== 'delete') return;
    if (window.confirm('Delete this connection line?')) {
      const conns = (organizationData.connections || []).filter(c => c.id !== connId);
      onDataChange({ ...organizationData, connections: conns, positions, sizes });
    }
  };

  // ── Resize handles ─────────────────────────────────────────────
  const startResize = (e, key) => {
    e.stopPropagation();
    e.preventDefault();
    const currentSize = sizes[key] || { width: 176, height: 80 };
    setResizing({
      key,
      startX: e.clientX,
      startY: e.clientY,
      startW: currentSize.width,
      startH: currentSize.height,
    });
  };

  // ── Connector SVG ──────────────────────────────────────────────
  const getCardCenter = (key, edge = 'bottom') => {
    const pos = positions[key];
    if (!pos) return null;
    const size = sizes[key] || { width: 176, height: 80 };
    const cx = pos.x + size.width / 2;
    if (edge === 'bottom') return { x: cx, y: pos.y + size.height };
    if (edge === 'top') return { x: cx, y: pos.y };
    return { x: cx, y: pos.y + size.height / 2 };
  };

  // ── Elbow path generator ───────────────────────────────────────
  const generateElbowPath = (from, to) => {
    const x1 = from.x, y1 = from.y;
    const x2 = to.x,   y2 = to.y;
    const dx = x2 - x1, dy = y2 - y1;
    const r = 8;
    if (Math.abs(dx) < 5) return `M ${x1} ${y1} L ${x2} ${y2}`;
    if (Math.abs(dy) < 5) return `M ${x1} ${y1} L ${x2} ${y2}`;
    const signX = dx > 0 ? 1 : -1;
    const signY = dy > 0 ? 1 : -1;
    const fromSide = from.side || 'right';
    if (fromSide === 'right' || fromSide === 'left') {
      const midX = x1 + dx / 2;
      const rX = Math.min(r, Math.abs(dx) / 2);
      const rY = Math.min(r, Math.abs(dy) / 2);
      return [
        `M ${x1} ${y1}`,
        `H ${midX - rX * signX}`,
        `Q ${midX} ${y1} ${midX} ${y1 + rY * signY}`,
        `V ${y2 - rY * signY}`,
        `Q ${midX} ${y2} ${midX + rX * signX} ${y2}`,
        `H ${x2}`,
      ].join(' ');
    }
    const midY = y1 + dy / 2;
    const rX2 = Math.min(r, Math.abs(dx) / 2);
    const rY2 = Math.min(r, Math.abs(dy) / 2);
    return [
      `M ${x1} ${y1}`,
      `V ${midY - rY2 * signY}`,
      `Q ${x1} ${midY} ${x1 + rX2 * signX} ${midY}`,
      `H ${x2 - rX2 * signX}`,
      `Q ${x2} ${midY} ${x2} ${midY + rY2 * signY}`,
      `V ${y2}`,
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
  };

  // ── Card component ─────────────────────────────────────────────
  const EditorCard = ({ itemKey, children, className = '', defaultW = 176, defaultH = 80 }) => {
    const pos = positions[itemKey] || { x: 0, y: 0 };
    const size = sizes[itemKey] || { width: defaultW, height: defaultH };
    const isDragging = draggedItem?.key === itemKey;
    const isSelected = selectedItem === itemKey;
    const isConnectSource = connectFrom === itemKey;

    return (
      <div
        ref={el => { cardRefs.current[itemKey] = el; }}
        className={`absolute select-none ${className} ${isDragging ? 'opacity-75 z-50' : 'z-20'} ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
        } ${isConnectSource ? 'ring-2 ring-green-500 ring-offset-1' : ''} ${
          editorMode === 'move' || editorMode === 'resize' ? 'cursor-move' : ''
        } ${editorMode === 'connect' ? 'cursor-crosshair' : ''} ${
          editorMode === 'delete' ? 'cursor-pointer hover:ring-2 hover:ring-red-500' : ''
        } ${editorMode === 'edit' ? 'cursor-text' : ''}`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
        onMouseDown={(e) => handleMouseDown(e, itemKey)}
        onDoubleClick={(e) => {
          e.preventDefault();
          startEditing(itemKey);
        }}
      >
        {children}
        {/* Resize handle (bottom-right corner) */}
        {isSelected && editorMode === 'resize' && (
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-sm cursor-se-resize z-50 hover:bg-blue-600"
            onMouseDown={(e) => startResize(e, itemKey)}
            title="Drag to resize"
          />
        )}
      </div>
    );
  };

  // ── Edit overlay ───────────────────────────────────────────────
  const EditOverlay = ({ itemKey }) => {
    const pos = positions[itemKey] || { x: 0, y: 0 };
    const size = sizes[itemKey] || { width: 220, height: 200 };

    return (
      <div
        className="absolute z-[100] bg-white border-2 border-blue-500 rounded-lg shadow-2xl p-3"
        style={{ left: `${pos.x}px`, top: `${pos.y}px`, width: `${Math.max(size.width, 220)}px` }}
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="space-y-2">
          {!editValues.isLabel && !editValues.isHeader && (
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Code</label>
              <input
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                value={editValues.code}
                onChange={e => setEditValues(v => ({ ...v, code: e.target.value }))}
              />
            </div>
          )}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase">
              {editValues.isLabel ? 'Label' : 'Title'}
            </label>
            <input
              className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-400 focus:outline-none"
              value={editValues.title}
              onChange={e => setEditValues(v => ({ ...v, title: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
              autoFocus
            />
          </div>
          {!editValues.isLabel && !editValues.isHeader && (
            <>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Name</label>
                <input
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                  value={editValues.name}
                  onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Employee ID</label>
                <input
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                  value={editValues.empId}
                  onChange={e => setEditValues(v => ({ ...v, empId: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                />
              </div>
            </>
          )}
          <div className="flex gap-1 pt-1">
            <button
              className="flex-1 text-xs bg-blue-500 text-white rounded py-1 hover:bg-blue-600 transition-colors"
              onClick={saveEdit}
            >
              ✓ Save
            </button>
            <button
              className="flex-1 text-xs bg-gray-300 text-gray-700 rounded py-1 hover:bg-gray-400 transition-colors"
              onClick={cancelEdit}
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Standard card render ───────────────────────────────────────
  const renderStandardCard = (item, itemKey) => {
    return (
      <EditorCard key={itemKey} itemKey={itemKey} defaultW={176} defaultH={80}>
        <div
          className={`bg-white border border-gray-400 rounded shadow-sm flex hover:shadow-md transition-shadow w-full h-full ${
            item.clickable && canViewSODetails ? 'cursor-pointer hover:border-blue-400' : ''
          }`}
        >
          <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-10 flex-shrink-0 flex items-center justify-center">
            <p className="text-[8px] font-bold">{item.code}</p>
          </div>
          <div className="p-2 flex-1 min-w-0 text-center flex flex-col justify-center items-center overflow-hidden h-full">
            <p className="text-[8px] font-semibold mb-1 leading-tight break-words">{item.title}</p>
            <hr className="my-1 border-gray-300 w-full" />
            <p className="text-[8px] leading-tight break-words">{item.name}</p>
            {item.empId && <p className="text-[8px] leading-tight">({item.empId})</p>}
          </div>
        </div>
      </EditorCard>
    );
  };

  // ── Loading state ──────────────────────────────────────────────
  if (!organizationData?.structure) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-gray-600 ml-3">Loading organization data…</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-white overflow-auto"
      style={{ minHeight: '2200px', minWidth: '1200px' }}
      onClick={handleCanvasClick}
    >
      {/* Connect mode indicator */}
      {editorMode === 'connect' && connectFrom && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-pulse">
          🔗 Now click the target box to connect from "{connectFrom}"
        </div>
      )}

      {/* SVG Connections */}
      {renderConnections()}

      {/* Header Section */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
        <div className="flex justify-between items-center mb-4 pointer-events-auto">
          <div className="flex items-center">
            <div className="w-24 h-24 flex items-center justify-center mr-4 p-2">
              <img src="/logo/Logo DG New 2022.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">{organizationData.header?.title}</h1>
              <h2 className="text-lg font-semibold text-gray-700">{organizationData.header?.company}</h2>
              <p className="text-sm text-gray-500">Effective Date: {organizationData.header?.effectiveDate}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border border-gray-400 p-4 bg-white pointer-events-auto">
            <div className="text-center border-r border-gray-400 pr-4">
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Prepared By :</p>
              <div className="border-b border-gray-300 mx-auto w-20 mb-16" />
              <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.preparedBy?.name || 'Diki Wahyudi'}</p>
              <p className="text-xs text-gray-500">Prep Date : {organizationData.signatures?.preparedBy?.date || '08/09/2025'}</p>
            </div>
            <div className="text-center border-r border-gray-400 pr-4">
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">{organizationData.signatures?.middleBy?.title || 'Bambang Wuryanto'}</p>
              <div className="border-b border-gray-300 mx-auto w-20 mb-16" />
              <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.middleBy?.name || 'Bambang Wuryanto'}</p>
              <p className="text-xs text-gray-500">Prepared Date : {organizationData.signatures?.middleBy?.date || '08/09/2025'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Approved By :</p>
              <div className="border-b border-gray-300 mx-auto w-20 mb-16" />
              <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.approvedBy?.name || 'Eko Maryanto'}</p>
              <p className="text-xs text-gray-500">Prepared Date : {organizationData.signatures?.approvedBy?.date || '08/09/2025'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Commissioners ───────────────────────────────────── */}
      <EditorCard itemKey="commissioners-header" defaultW={192} defaultH={52}>
        <div className="bg-blue-300 p-4 rounded text-center w-full h-full flex items-center justify-center hover:bg-blue-400 transition-colors">
          <h3 className="font-bold text-sm text-white">{organizationData.uiLabels?.['commissioners-header'] || 'BOARD OF COMMISSIONERS'}</h3>
        </div>
      </EditorCard>

      <EditorCard itemKey="president-commissioner" defaultW={192} defaultH={100}>
        <div className="bg-white border border-gray-400 rounded shadow-sm text-center w-full h-full flex flex-col hover:shadow-md transition-shadow">
          <div className="p-2 bg-gray-100 border-b border-gray-300 flex-shrink-0">
            <p className="text-sm font-semibold">{organizationData.commissioners?.president?.title || 'PRESIDENT COMMISIONER'}</p>
          </div>
          <div className="p-4 flex-1 flex items-center justify-center">
            <p className="text-xs font-medium">{organizationData.commissioners?.president?.name || 'IRIANTO SANTOSO'}</p>
          </div>
        </div>
      </EditorCard>

      <EditorCard itemKey="commissioners-list" defaultW={192} defaultH={120}>
        <div className="bg-white border border-gray-400 p-4 rounded shadow-sm text-center w-full h-full flex flex-col justify-center hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold mb-3">COMMISSIONERS</p>
          {organizationData.commissioners?.commissioners?.map((name, i) => (
            <React.Fragment key={i}>
              <hr className="my-1 border-gray-300 w-full" />
              <p className="text-xs mb-1">{name}</p>
            </React.Fragment>
          ))}
        </div>
      </EditorCard>

      {/* ── Column Headers (Hardcoded defaults) ─────────────── */}
      {[
        { key: 'header-bod', defaultLabel: 'BOARD OF DIRECTOR', bg: 'bg-blue-300', w: 176 },
        { key: 'header-management', defaultLabel: '\u00a0', bg: '', w: 176, transparent: true },
        { key: 'header-division', defaultLabel: 'DIVISION HEAD', bg: 'bg-blue-300', w: 176 },
        { key: 'header-department', defaultLabel: 'DEPARTMENT HEAD', bg: 'bg-blue-300', w: 176 },
        { key: 'header-section', defaultLabel: 'SECTION HEAD / ENGINEERING PRODUCT LEADER', bg: 'bg-blue-300', w: 200 },
      ].map(h => {
        const label = organizationData.uiLabels?.[h.key] || h.defaultLabel;
        return (
          <EditorCard key={h.key} itemKey={h.key} defaultW={h.w} defaultH={40}>
            <div className={`${h.bg} p-2 rounded text-center w-full h-full flex items-center justify-center hover:opacity-90 transition-opacity`}>
              <h3 className={`font-bold text-xs ${h.transparent ? 'text-transparent' : 'text-white'} leading-tight`}>{label}</h3>
            </div>
          </EditorCard>
        );
      })}

      {/* ── Custom Added Headers ────────────────────────────── */}
      {organizationData.structure?.headers?.map(item => (
        <EditorCard key={`header-${item.id}`} itemKey={`header-${item.id}`} defaultW={176} defaultH={40}>
          <div className="bg-blue-300 p-2 rounded text-center w-full h-full flex items-center justify-center hover:bg-blue-400 transition-colors">
            <h3 className="font-bold text-xs text-white leading-tight">{item.title}</h3>
          </div>
        </EditorCard>
      ))}

      {/* ── BOD cards ───────────────────────────────────────── */}
      {organizationData.structure?.bod?.map(item => renderStandardCard(item, `bod-${item.id}`))}

      {/* ── Management cards ────────────────────────────────── */}
      {organizationData.structure?.management?.map(item => {
        if (item.code === 'MDO2.0') return null;
        const key = `management-${item.id}`;

        if (item.code === 'MDO1.0') {
          const mdo2 = organizationData.structure.management.find(m => m.code === 'MDO2.0');
          return (
            <EditorCard key={key} itemKey={key} defaultW={176} defaultH={170}>
              <div className="bg-white border border-gray-400 rounded shadow-sm hover:shadow-md transition-shadow w-full h-full flex flex-col">
                <div className="flex border-b border-gray-300">
                  <div className="p-2 flex-1 text-center bg-gray-100 flex items-center justify-center">
                    <p className="text-[8px] font-semibold leading-tight">{item.title}</p>
                  </div>
                </div>
                <div className="flex border-b border-gray-300 flex-1">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-10 flex items-center justify-center">
                    <p className="text-[8px] font-bold">{item.code}</p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center items-center">
                    <p className="text-[8px] leading-tight">{item.name}</p>
                    <p className="text-[8px] leading-tight">({item.empId})</p>
                  </div>
                </div>
                {mdo2 && (
                  <div className="flex flex-1">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-10 flex items-center justify-center">
                      <p className="text-[8px] font-bold">{mdo2.code}</p>
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center items-center">
                      <p className="text-[8px] leading-tight">{mdo2.name}</p>
                      <p className="text-[8px] leading-tight">({mdo2.empId})</p>
                    </div>
                  </div>
                )}
              </div>
            </EditorCard>
          );
        }

        return renderStandardCard(item, key);
      })}

      {/* ── Business labels ─────────────────────────────────── */}
      {organizationData.structure?.business?.map(item => {
        const key = `business-${item.id}`;
        return (
          <EditorCard key={key} itemKey={key} defaultW={176} defaultH={100}>
            <div className="bg-gray-200 p-3 rounded text-center font-bold text-xs w-full h-full flex items-center justify-center hover:bg-gray-300 transition-colors">
              <span className="leading-tight">{item.label}</span>
            </div>
          </EditorCard>
        );
      })}

      {/* ── Division cards ──────────────────────────────────── */}
      {organizationData.structure?.divisions?.map(item => renderStandardCard(item, `division-${item.id}`))}

      {/* ── Department cards ────────────────────────────────── */}
      {organizationData.structure?.departments?.map(item => renderStandardCard(item, `department-${item.id}`))}

      {/* ── Section cards ───────────────────────────────────── */}
      {organizationData.structure?.sections?.map(item => renderStandardCard(item, `section-${item.id}`))}

      {/* ── Edit overlay ────────────────────────────────────── */}
      {editingItem && <EditOverlay itemKey={editingItem} />}

      {/* ── Legend ───────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 bg-gray-50 p-4 rounded-lg border border-gray-400 max-w-sm z-30">
        <h4 className="font-bold text-sm mb-2">NOTE:</h4>
        <div className="text-xs space-y-1">
          <p><span className="font-bold">*</span> CONCURE</p>
          <p><span className="font-bold">**</span> ACTING</p>
          <p><span className="font-bold">(INC.)</span> INCUMBENT</p>
          <p><span className="font-bold">TBR</span> TO BE RECRUIT</p>
          <p><span className="font-bold">TBD</span> TO BE DEVELOP</p>
        </div>
      </div>

      {/* ── Instructions (mode-specific) ────────────────────── */}
      <div className="absolute bottom-4 right-4 bg-blue-100 border border-blue-400 rounded p-3 text-sm z-30 max-w-xs">
        <div className="font-semibold mb-1">
          {editorMode === 'move' && '🖱️ Move Mode'}
          {editorMode === 'connect' && '🔗 Connect Mode'}
          {editorMode === 'edit' && '✏️ Edit Mode'}
          {editorMode === 'delete' && '🗑️ Delete Mode'}
          {editorMode === 'resize' && '↔️ Resize Mode'}
        </div>
        <div className="text-xs space-y-0.5">
          {editorMode === 'move' && <><div>• Drag any card to reposition</div><div>• Double-click to edit text</div></>}
          {editorMode === 'connect' && <><div>• Click source box first</div><div>• Then click target box</div><div>• Arrow line will appear</div></>}
          {editorMode === 'edit' && <><div>• Click any box to edit its text</div><div>• Press Enter to save, Escape to cancel</div></>}
          {editorMode === 'delete' && <><div>• Click a box to delete it</div><div>• Click a connection line to remove it</div></>}
          {editorMode === 'resize' && <><div>• Click a box to select it</div><div>• Drag the blue handle at bottom-right</div></>}
        </div>
      </div>
    </div>
  );
};

export default AdvancedEditorCanvas;
