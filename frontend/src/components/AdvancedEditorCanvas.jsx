import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

const EditOverlay = ({ itemKey, positions, sizes, editValues, setEditValues, saveEdit, cancelEdit }) => {
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

const ANCHOR_SIDES = ['top', 'right', 'bottom', 'left'];
const GRID_SIZE = 20; // px — jarak antar garis grid

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
  const [bendDrag, setBendDrag] = useState(null);
  const [liveBend, setLiveBend] = useState({});

  // ── draw.io-style connector state ─────────────────────────────
  const [connectDrag, setConnectDrag] = useState(null); // { fromKey, fromSide, x1, y1, curX, curY }
  const [waypointDrag, setWaypointDrag] = useState(null); // { connId, index, startClientX, startClientY, startX, startY }
  const [dragPreview, setDragPreview] = useState(null); // { connId, index, x, y } — live preview while dragging a waypoint

  const cardRefs = useRef({});
  const PDF_LAYOUT_BY_CODE = {
    'BOD1.0': { x: 50, y: 320 },
    'BOD1.1': { x: 50, y: 410 },
    'MD1.0': { x: 250, y: 500 },
    'MRO1.0': { x: 250, y: 590 },
    'CRO1.0': { x: 250, y: 680 },
    'CRO2.0': { x: 250, y: 770 },
    'PAC1.0': { x: 250, y: 860 },
    'BUS-CONTROLCABLE': { x: 450, y: 500 },
    'BUS-DCBATTERY': { x: 450, y: 1180 },
    'MKT2.0': { x: 650, y: 1180 },
    'QAC1.0': { x: 850, y: 500 },
    'PPIC1.0': { x: 850, y: 590 },
    'ENG1.0': { x: 850, y: 590 },
    'PME1.0': { x: 850, y: 770 },
    'MKT1.0': { x: 650, y: 860 },
    'MKT1.0': { x: 850, y: 860 },
    'HRD1.0': { x: 850, y: 950 },
    'RND1.0': { x: 850, y: 1270 },
    'PCH1.0': { x: 850, y: 1620 },
    'PRD2.0': { x: 850, y: 1270 },
    'QAC2.0': { x: 850, y: 1360 },
    'PRD1.0': { x: 1050, y: 320 },
    'ENG1.0': { x: 650, y: 680 },
    'ENG1.1': { x: 1050, y: 680 },
    'MKT1.1': { x: 1050, y: 860 },
    'HRD1.1': { x: 1050, y: 950 },
    'MKT2.1': { x: 1050, y: 1180 },
    'RND1.1': { x: 1050, y: 1270 },
    'RND1.2': { x: 1050, y: 1360 },
    'RND1.3': { x: 1050, y: 1450 },
    'MKT3.0': { x: 1050, y: 1540 },
    'FIN1.0': { x: 1050, y: 1700 },
  };

  const getDefaultPositions = useCallback(() => {
    if (!organizationData) return {};
    const p = {};
    const defaults = {
      'commissioners-header': { x: 50, y: 175 },
      'header-bod': { x: 50, y: 250 },
      'header-business': { x: 450, y: 250 },
      'header-division': { x: 650, y: 250 },
      'header-department': { x: 850, y: 250 },
      'header-section': { x: 1050, y: 250 },
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
      p[k] = organizationData.positions?.[k] || PDF_LAYOUT_BY_CODE[item.code] || { x: 50, y: 320 + i * 90 };
    });

    const mgmtY = { 'MD1.0': 500, 'MRO1.0': 590, 'CRO1.0': 680, 'CRO2.0': 770, 'PAC1.0': 860 };
    organizationData.structure?.management?.forEach((item, i) => {
      const k = `management-${item.id}`;
      p[k] = organizationData.positions?.[k] || PDF_LAYOUT_BY_CODE[item.code] || { x: 250, y: mgmtY[item.code] ?? 500 + i * 90 };
    });

    const busDefaults = [PDF_LAYOUT_BY_CODE['BUS-CONTROLCABLE'], PDF_LAYOUT_BY_CODE['BUS-DCBATTERY']];
    organizationData.structure?.business?.forEach((item, i) => {
      const k = `business-${item.id}`;
      p[k] = organizationData.positions?.[k] || busDefaults[i] || { x: 450, y: 500 + i * 300 };
    });

    organizationData.structure?.divisions?.forEach((item, i) => {
      const k = `division-${item.id}`;
      p[k] = organizationData.positions?.[k] || PDF_LAYOUT_BY_CODE[item.code] || { x: 450, y: 650 + i * 100 };
    });

    const deptY = [540, 630, 790, 880, 970, 1180, 1450, 1170];
    organizationData.structure?.departments?.forEach((item, i) => {
      const k = `department-${item.id}`;
      p[k] = organizationData.positions?.[k] || PDF_LAYOUT_BY_CODE[item.code] || { x: 650, y: deptY[i] ?? 540 + i * 90 };
    });

    const secY = { 0: 320, 1: 410, 2: 500, 3: 750, 4: 840, 5: 930, 6: 1020, 7: 1110, 8: 1200, 9: 1290, 10: 1380, 11: 1470 };
    organizationData.structure?.sections?.forEach((item, i) => {
      const k = `section-${item.id}`;
      p[k] = organizationData.positions?.[k] || PDF_LAYOUT_BY_CODE[item.code] || { x: 850, y: secY[i] ?? 320 + i * 90 };
    });

    return p;
  }, [organizationData]);

  useEffect(() => {
    if (!organizationData) return;
    setPositions(getDefaultPositions());
    setSizes(organizationData.sizes || {});
  }, [organizationData, getDefaultPositions]);

  // ── Canvas-relative point (mengikuti scroll, sama dengan coordinate space positions/sizes) ──
  const getCanvasPoint = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left + containerRef.current.scrollLeft,
      y: e.clientY - rect.top + containerRef.current.scrollTop,
    };
  };

  // ── Anchor point di tepi box (top/right/bottom/left) ──────────
  const getAnchorPoint = (key, side) => {
    const pos = positions[key];
    const size = sizes[key] || { width: 176, height: 80 };
    if (!pos) return null;
    switch (side) {
      case 'top': return { x: pos.x + size.width / 2, y: pos.y };
      case 'bottom': return { x: pos.x + size.width / 2, y: pos.y + size.height };
      case 'left': return { x: pos.x, y: pos.y + size.height / 2 };
      case 'right': return { x: pos.x + size.width, y: pos.y + size.height / 2 };
      default: return null;
    }
  };

  // ── Fallback lama: titik terdekat otomatis (untuk koneksi lama tanpa fromSide/toSide) ──
  const getClosestPoints = (key1, key2) => {
    const pos1 = positions[key1];
    const pos2 = positions[key2];
    if (!pos1 || !pos2) return null;

    const size1 = sizes[key1] || { width: 176, height: 80 };
    const size2 = sizes[key2] || { width: 176, height: 80 };

    const edges1 = [
      { x: pos1.x + size1.width / 2, y: pos1.y, side: 'top' },
      { x: pos1.x + size1.width / 2, y: pos1.y + size1.height, side: 'bottom' },
      { x: pos1.x, y: pos1.y + size1.height / 2, side: 'left' },
      { x: pos1.x + size1.width, y: pos1.y + size1.height / 2, side: 'right' },
    ];
    const edges2 = [
      { x: pos2.x + size2.width / 2, y: pos2.y, side: 'top' },
      { x: pos2.x + size2.width / 2, y: pos2.y + size2.height, side: 'bottom' },
      { x: pos2.x, y: pos2.y + size2.height / 2, side: 'left' },
      { x: pos2.x + size2.width, y: pos2.y + size2.height / 2, side: 'right' },
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

  // ── Resolusi endpoint koneksi: pakai anchor eksplisit kalau ada, fallback closest-point ──
  const getConnEndpoints = (conn) => {
    if (conn.fromSide && conn.toSide) {
      const from = getAnchorPoint(conn.from, conn.fromSide);
      const to = getAnchorPoint(conn.to, conn.toSide);
      if (from && to) return { from: { ...from, side: conn.fromSide }, to: { ...to, side: conn.toSide } };
    }
    return getClosestPoints(conn.from, conn.to);
  };

  // ── Drag logic ─────────────────────────────────────────────────
  const handleMouseDown = async (e, itemKey) => {
    if (editorMode === 'connect') {
      // Interaksi connect sekarang sepenuhnya lewat anchor dots (lihat renderAnchors)
      e.preventDefault();
      return;
    }

    if (editorMode === 'line') {
      e.preventDefault();
      return;
    }

    if (editorMode === 'delete') {
      e.preventDefault();
      const confirmResult = await Swal.fire({
        title: `Delete this box "${itemKey}"? This will also remove its connections.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      });
      if (confirmResult.isConfirmed) {
        deleteBox(itemKey);
      }
      return;
    }

    if (editorMode === 'edit') {
      e.preventDefault();
      startEditing(itemKey);
      return;
    }

    e.preventDefault();
    setSelectedItem(itemKey);
    setDraggedItem({
      key: itemKey,
      startX: e.clientX,
      startY: e.clientY,
      startPos: positions[itemKey] || { x: 0, y: 0 },
    });
  };

  // ── Anchor drag (membuat koneksi baru, gaya draw.io) ──────────
  const startConnectDrag = (e, key, side) => {
    e.stopPropagation();
    e.preventDefault();
    const pt = getAnchorPoint(key, side);
    if (!pt) return;
    setConnectDrag({ fromKey: key, fromSide: side, x1: pt.x, y1: pt.y, curX: pt.x, curY: pt.y });
  };

  const completeConnectDrag = (e, key, side) => {
    e.stopPropagation();
    if (!connectDrag) return;
    if (connectDrag.fromKey === key) {
      setConnectDrag(null);
      return;
    }
    const newConn = {
      id: `conn-${Date.now()}`,
      from: connectDrag.fromKey,
      to: key,
      fromSide: connectDrag.fromSide,
      toSide: side,
      waypoints: [],
      style: 'elbow',
      bendRatio: 0.5,
    };
    const conns = [...(organizationData.connections || []), newConn];
    onDataChange({ ...organizationData, connections: conns, positions, sizes });
    setConnectDrag(null);
  };

  // ── Waypoint drag (geser titik belok manual, mode Line) ───────
  const startWaypointDrag = (e, connId, index, currentPoint) => {
    e.stopPropagation();
    e.preventDefault();
    setWaypointDrag({ connId, index, startClientX: e.clientX, startClientY: e.clientY, startX: currentPoint.x, startY: currentPoint.y });
  };

  // ── Tambah titik belok baru: double-click di garis (mode Line), disisipkan di segmen terdekat ──
  const addWaypoint = (conn, from, to, e) => {
    if (editorMode !== 'line') return;
    const pt = getCanvasPoint(e);
    const existing = conn.waypoints || [];
    const chain = [from, ...existing, to];
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < chain.length - 1; i++) {
      const a = chain[i], b = chain[i + 1];
      const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
      const dist = Math.hypot(pt.x - midX, pt.y - midY);
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    }
    const newWaypoints = [...existing];
    newWaypoints.splice(bestIdx, 0, pt);
    const conns = (organizationData.connections || []).map(c =>
      c.id === conn.id ? { ...c, waypoints: newWaypoints } : c
    );
    onDataChange({ ...organizationData, connections: conns, positions, sizes });
  };

  // ── Hapus titik belok: double-click di titiknya (mode Line) ──
  const removeWaypoint = (connId, index) => {
    const conns = (organizationData.connections || []).map(c => {
      if (c.id !== connId) return c;
      const wps = (c.waypoints || []).filter((_, i) => i !== index);
      return { ...c, waypoints: wps };
    });
    onDataChange({ ...organizationData, connections: conns, positions, sizes });
  };

  const handleMouseMove = useCallback((e) => {
    if (connectDrag) {
      const pt = getCanvasPoint(e);
      setConnectDrag(prev => prev ? { ...prev, curX: pt.x, curY: pt.y } : prev);
      return;
    }
    if (waypointDrag) {
      const dx = e.clientX - waypointDrag.startClientX;
      const dy = e.clientY - waypointDrag.startClientY;
      setDragPreview({
        connId: waypointDrag.connId,
        index: waypointDrag.index,
        x: waypointDrag.startX + dx,
        y: waypointDrag.startY + dy,
      });
      return;
    }
    if (bendDrag) {
      const { connId, axis, x1, y1, x2, y2, startClientX, startClientY, startRatio } = bendDrag;
      let ratio;
      if (axis === 'x') {
        ratio = startRatio + (e.clientX - startClientX) / (x2 - x1);
      } else {
        ratio = startRatio + (e.clientY - startClientY) / (y2 - y1);
      }
      ratio = Math.max(0.05, Math.min(0.95, ratio));
      setLiveBend(prev => ({ ...prev, [connId]: ratio }));
      return;
    }
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
  }, [connectDrag, waypointDrag, bendDrag, draggedItem, resizing]);

  const handleMouseUp = useCallback(() => {
    if (connectDrag) {
      // Dilepas di area kosong (bukan di atas anchor) → batalkan
      setConnectDrag(null);
      return;
    }
    if (waypointDrag) {
      if (dragPreview) {
        const conns = (organizationData.connections || []).map(c => {
          if (c.id !== waypointDrag.connId) return c;
          const wps = [...(c.waypoints || [])];
          wps[waypointDrag.index] = { x: dragPreview.x, y: dragPreview.y };
          return { ...c, waypoints: wps };
        });
        onDataChange({ ...organizationData, connections: conns, positions, sizes });
      }
      setWaypointDrag(null);
      setDragPreview(null);
      return;
    }
    if (bendDrag) {
      const { connId } = bendDrag;
      const ratio = liveBend[connId];
      if (ratio !== undefined) {
        const conns = (organizationData.connections || []).map(c =>
          c.id === connId ? { ...c, bendRatio: ratio } : c
        );
        onDataChange({ ...organizationData, connections: conns, positions, sizes });
      }
      setBendDrag(null);
      return;
    }
    if (resizing) {
      onDataChange({ ...organizationData, positions, sizes });
      setResizing(null);
      return;
    }
    if (draggedItem) {
      onDataChange({ ...organizationData, positions, sizes });
      setDraggedItem(null);
    }
  }, [connectDrag, waypointDrag, dragPreview, bendDrag, liveBend, draggedItem, resizing, organizationData, positions, sizes, onDataChange]);

  useEffect(() => {
    if (draggedItem || resizing || bendDrag || connectDrag || waypointDrag) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedItem, resizing, bendDrag, connectDrag, waypointDrag, handleMouseMove, handleMouseUp]);

  // ── Canvas click (deselect) ────────────────────────────────────
  const handleCanvasClick = (e) => {
    if (e.target === containerRef.current || e.target.tagName === 'svg') {
      setSelectedItem(null);
      setEditingItem(null);
      setConnectDrag(null);
    }
  };

  // ── Delete box ─────────────────────────────────────────────────
  const deleteBox = (key) => {
    const newData = { ...organizationData };
    ['headers', 'bod', 'management', 'divisions', 'departments', 'sections', 'business'].forEach(cat => {
      if (newData.structure?.[cat]) {
        newData.structure[cat] = newData.structure[cat].filter(item => {
          const prefix = cat === 'headers' ? 'header' : cat === 'divisions' ? 'division' : cat === 'departments' ? 'department' : cat === 'sections' ? 'section' : cat === 'business' ? 'business' : cat === 'bod' ? 'bod' : 'management';
          const itemKey = `${prefix}-${item.id}`;
          return itemKey !== key;
        });
      }
    });

    newData.connections = (newData.connections || []).filter(c => c.from !== key && c.to !== key);
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
    const item = findItemByKey(key);
    if (!item) {
      return;
    }

    if (key === 'commissioners-list') {
      setEditingItem(key);
      setSelectedItem(key);
      setEditValues({
        title: (organizationData.commissioners?.commissioners || []).join('\n'),
        name: '',
        code: '',
        empId: '',
        isLabel: true,
        isHeader: false,
      });
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

    } else if (editingItem === 'commissioners-list') {
      if (!newData.commissioners) newData.commissioners = {};
      newData.commissioners.commissioners = editValues.title
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

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

  const handleConnectionClick = async (connId) => {
    if (editorMode !== 'delete') return;
    const confirmResult = await Swal.fire({
      title: 'Delete this connection line?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    });
    if (confirmResult.isConfirmed) {
      const conns = (organizationData.connections || []).filter(c => c.id !== connId);
      onDataChange({ ...organizationData, connections: conns, positions, sizes });
    }
  };

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

  const startBendDrag = (e, connId, axis, x1, y1, x2, y2, currentRatio) => {
    e.stopPropagation();
    e.preventDefault();
    setBendDrag({ connId, axis, x1, y1, x2, y2, startClientX: e.clientX, startClientY: e.clientY, startRatio: currentRatio });
  };

  const toggleConnStyle = (connId) => {
    const conns = (organizationData.connections || []).map(c =>
      c.id === connId ? { ...c, style: c.style === 'straight' ? 'elbow' : 'straight' } : c
    );
    onDataChange({ ...organizationData, connections: conns, positions, sizes });
  };

  const getCardCenter = (key, edge = 'bottom') => {
    const pos = positions[key];
    if (!pos) return null;
    const size = sizes[key] || { width: 176, height: 80 };
    const cx = pos.x + size.width / 2;
    if (edge === 'bottom') return { x: cx, y: pos.y + size.height };
    if (edge === 'top') return { x: cx, y: pos.y };
    return { x: cx, y: pos.y + size.height / 2 };
  };

  const generateElbowPath = (from, to, bendRatio = 0.5) => {
    const x1 = from.x, y1 = from.y;
    const x2 = to.x, y2 = to.y;
    const dx = x2 - x1, dy = y2 - y1;

    if (Math.abs(dx) < 5) return `M ${x1} ${y1} L ${x2} ${y2}`;
    if (Math.abs(dy) < 5) return `M ${x1} ${y1} L ${x2} ${y2}`;

    const fromSide = from.side || 'right';
    const toSide = to.side || 'left';

    if ((fromSide === 'right' || fromSide === 'left') &&
      (toSide === 'top' || toSide === 'bottom')) {
      return `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`;
    }

    if ((fromSide === 'top' || fromSide === 'bottom') &&
      (toSide === 'left' || toSide === 'right')) {
      return `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`;
    }

    if ((fromSide === 'right' || fromSide === 'left') &&
      (toSide === 'left' || toSide === 'right')) {
      const midX = x1 + dx * bendRatio;
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    }

    const midY = y1 + dy * bendRatio;
    return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  };

  const buildPath = (conn, from, to) => {
    const waypoints = (dragPreview && dragPreview.connId === conn.id)
      ? (conn.waypoints || []).map((wp, i) => (i === dragPreview.index ? { x: dragPreview.x, y: dragPreview.y } : wp))
      : (conn.waypoints || []);

    if (waypoints.length === 0) {
      const style = conn.style || 'elbow';
      const bendRatio = liveBend[conn.id] ?? conn.bendRatio ?? 0.5;
      return style === 'straight'
        ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
        : generateElbowPath(from, to, bendRatio);
    }

    const points = [from, ...waypoints, to];
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      const isFirst = i === 1;
      const isLast = i === points.length - 1;
      const verticalFirst = isFirst && (from.side === 'top' || from.side === 'bottom');
      const verticalLast = isLast && (to.side === 'top' || to.side === 'bottom');
      if (verticalLast || verticalFirst) {
        d += ` L ${prev.x} ${cur.y} L ${cur.x} ${cur.y}`;
      } else {
        d += ` L ${cur.x} ${prev.y} L ${cur.x} ${cur.y}`;
      }
    }
    return d;
  };

  const renderConnections = () => {
    const conns = organizationData?.connections || [];
    if (conns.length === 0) return null;

    const isDeleteMode = editorMode === 'delete';
    const isLineMode = editorMode === 'line';

    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 5, overflow: 'visible' }}
      >
        {conns.map(conn => {
          const pts = getConnEndpoints(conn);
          if (!pts) return null;
          const { from, to } = pts;

          const waypoints = (dragPreview && dragPreview.connId === conn.id)
            ? (conn.waypoints || []).map((wp, i) => (i === dragPreview.index ? { x: dragPreview.x, y: dragPreview.y } : wp))
            : (conn.waypoints || []);

          const d = buildPath(conn, from, to);
          const style = conn.style || 'elbow';
          const bendRatio = liveBend[conn.id] ?? conn.bendRatio ?? 0.5;

          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const axis = (from.side === 'left' || from.side === 'right') ? 'x' : 'y';
          const handleX = axis === 'x' ? from.x + (to.x - from.x) * bendRatio : mx;
          const handleY = axis === 'y' ? from.y + (to.y - from.y) * bendRatio : my;

          const pillX = waypoints.length > 0 ? (waypoints[0].x + from.x) / 2 : mx;
          const pillY = waypoints.length > 0 ? (waypoints[0].y + from.y) / 2 - 18 : my - 18;

          return (
            <g key={conn.id}>
              {/* Hit area transparan lebar agar mudah diklik/double-click */}
              <path
                d={d}
                stroke="transparent"
                strokeWidth={14}
                fill="none"
                style={{
                  pointerEvents: (isDeleteMode || isLineMode) ? 'stroke' : 'none',
                  cursor: isDeleteMode ? 'pointer' : isLineMode ? 'copy' : 'default',
                }}
                onClick={() => handleConnectionClick(conn.id)}
                onDoubleClick={(e) => addWaypoint(conn, from, to, e)}
              />
              {/* Visible line */}
              <path
                d={d}
                stroke={isDeleteMode ? '#ef4444' : isLineMode ? '#3b82f6' : '#6b7280'}
                strokeWidth={isDeleteMode || isLineMode ? 2.5 : 1.5}
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
              {/* Bend handle lama — hanya muncul kalau belum ada waypoint manual */}
              {isLineMode && waypoints.length === 0 && style === 'elbow' && (
                <circle
                  cx={handleX} cy={handleY} r={6}
                  fill="#3b82f6" stroke="white" strokeWidth={1.5}
                  style={{ cursor: axis === 'x' ? 'ew-resize' : 'ns-resize', pointerEvents: 'all' }}
                  onMouseDown={(e) => startBendDrag(e, conn.id, axis, from.x, from.y, to.x, to.y, bendRatio)}
                />
              )}
              {/* Waypoint manual — drag bebas, double-click untuk hapus */}
              {isLineMode && waypoints.map((wp, i) => (
                <circle
                  key={i}
                  cx={wp.x} cy={wp.y} r={6}
                  fill="#f59e0b" stroke="white" strokeWidth={1.5}
                  style={{ cursor: 'move', pointerEvents: 'all' }}
                  onMouseDown={(e) => startWaypointDrag(e, conn.id, i, wp)}
                  onDoubleClick={(e) => { e.stopPropagation(); removeWaypoint(conn.id, i); }}
                />
              ))}
              {/* Style toggle pill — switch Straight/Elbow, hanya berguna saat belum ada waypoint */}
              {isLineMode && waypoints.length === 0 && (
                <g
                  transform={`translate(${pillX}, ${pillY})`}
                  style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  onClick={() => toggleConnStyle(conn.id)}
                >
                  <rect x={-24} y={-9} width={48} height={18} rx={9} fill="#1f2937" />
                  <text x={0} y={1} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="9" fontWeight="bold">
                    {style === 'straight' ? 'Lurus' : 'Siku'}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderAnchors = () => {
    if (editorMode !== 'connect') return null;
    const keys = Object.keys(positions);
    return (
      <svg
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 70, overflow: 'visible', pointerEvents: 'none' }}
      >
        {keys.map(key =>
          ANCHOR_SIDES.map(side => {
            const pt = getAnchorPoint(key, side);
            if (!pt) return null;
            const isSource = connectDrag?.fromKey === key && connectDrag?.fromSide === side;
            return (
              <circle
                key={`${key}-${side}`}
                cx={pt.x} cy={pt.y} r={5}
                fill={isSource ? '#10b981' : '#3b82f6'}
                stroke="white" strokeWidth={1.5}
                style={{ cursor: 'crosshair', pointerEvents: 'all' }}
                onMouseDown={(e) => startConnectDrag(e, key, side)}
                onMouseUp={(e) => completeConnectDrag(e, key, side)}
              />
            );
          })
        )}
        {connectDrag && (
          <line
            x1={connectDrag.x1} y1={connectDrag.y1}
            x2={connectDrag.curX} y2={connectDrag.curY}
            stroke="#10b981" strokeWidth={2} strokeDasharray="4 3"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>
    );
  };

  const EditorCard = ({ itemKey, children, className = '', defaultW = 176, defaultH = 80 }) => {
    const pos = positions[itemKey] || { x: 0, y: 0 };
    const size = sizes[itemKey] || { width: defaultW, height: defaultH };
    const isDragging = draggedItem?.key === itemKey;
    const isSelected = selectedItem === itemKey;
    const isConnectSource = connectDrag?.fromKey === itemKey;

    return (
      <div
        ref={el => { cardRefs.current[itemKey] = el; }}
        className={`absolute select-none ${className} ${isDragging ? 'opacity-75 z-50' : 'z-20'} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
          } ${isConnectSource ? 'ring-2 ring-green-500 ring-offset-1' : ''} ${editorMode === 'move' || editorMode === 'resize' ? 'cursor-move' : ''
          } ${editorMode === 'connect' ? 'cursor-crosshair' : ''} ${editorMode === 'delete' ? 'cursor-pointer hover:ring-2 hover:ring-red-500' : ''
          } ${editorMode === 'edit' ? 'cursor-text' : ''} ${editorMode === 'line' ? 'cursor-default' : ''}`}
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

  const renderStandardCard = (item, itemKey) => {
    return (
      <EditorCard key={itemKey} itemKey={itemKey} defaultW={176} defaultH={80}>
        <div
          className={`bg-white border border-gray-400 rounded shadow-sm flex hover:shadow-md transition-shadow w-full h-full ${item.clickable && canViewSODetails ? 'cursor-pointer hover:border-blue-400' : ''
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
      className="relative w-full bg-white overflow-auto no-print-grid"
      style={{
        minHeight: '2200px',
        minWidth: '1200px',
        backgroundImage:
          'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), ' +
          'linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
      onClick={handleCanvasClick}
    >
      {editorMode === 'connect' && connectDrag && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-pulse">
          🔗 Lepaskan di titik biru pada box tujuan
        </div>
      )}

      {/* SVG Connections */}
      {renderConnections()}
      {renderAnchors()}

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
              <img src={organizationData.signatures?.preparedBy?.image || "/signatures/Diki_Wahyudi.png"} alt="ttd" className="h-12 object-contain mx-auto my-2" />
              <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.preparedBy?.name || 'Diki Wahyudi'}</p>
              <p className="text-xs text-gray-500">Prep Date : {organizationData.signatures?.preparedBy?.date || '08/09/2025'}</p>
            </div>

            <div className="text-center border-r border-gray-400 pr-4">
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">{organizationData.signatures?.middleBy?.title || 'Checked By :'}</p>
              <img src={organizationData.signatures?.middleBy?.image || "/signatures/Bambang_Wuryanto.png"} alt="ttd" className="h-12 object-contain mx-auto my-2" />
              <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.middleBy?.name || 'Bambang Wuryanto'}</p>
              <p className="text-xs text-gray-500">Checked Date : {organizationData.signatures?.middleBy?.date || '08/09/2025'}</p>
            </div>

            <div className="text-center">
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Approved By :</p>
              <img src={organizationData.signatures?.approvedBy?.image || "/signatures/Eko_Maryanto.png"} alt="ttd" className="h-12 object-contain mx-auto my-2" />
              <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.approvedBy?.name || 'Eko Maryanto'}</p>
              <p className="text-xs text-gray-500">Approved Date : {organizationData.signatures?.approvedBy?.date || '08/09/2025'}</p>
            </div>
          </div>
        </div>
      </div>

      <EditorCard itemKey="commissioners-header" defaultW={272} defaultH={70}>
        <div className="bg-white border border-gray-400 rounded shadow-sm w-full h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
          <div className="bg-blue-300 px-2 py-1.5 text-center flex-shrink-0 hover:bg-blue-400 transition-colors">
            <h3 className="font-bold text-xs text-white leading-tight">{organizationData.uiLabels?.['commissioners-header'] || 'BOARD OF COMMISSIONERS'}</h3>
          </div>
          <div className="flex border-b border-gray-300 flex-shrink-0">
            <div className="px-2 py-1 text-[8px] font-semibold border-r border-gray-300 w-[120px] flex-shrink-0 flex items-center leading-tight">
              {organizationData.commissioners?.president?.title || 'PRESIDENT COMMISIONER'}
            </div>
            <div className="px-2 py-1 text-[8px] flex items-center leading-tight">
              : {organizationData.commissioners?.president?.name || 'IRIANTO SANTOSO'}
            </div>
          </div>
          <div className="flex flex-1">
            <div className="px-2 py-1 text-[8px] font-semibold border-r border-gray-300 w-[120px] flex-shrink-0 flex items-center leading-tight">
              COMMISSIONERS
            </div>
            <div className="px-2 py-1 text-[8px] flex-1 flex flex-col justify-center gap-[3px]">
              {organizationData.commissioners?.commissioners?.map((name, i) => (
                <p key={i} className="leading-tight">: {name}</p>
              ))}
            </div>
          </div>
        </div>
      </EditorCard>

      {[
        { key: 'header-bod', defaultLabel: 'BOARD OF DIRECTOR', bg: 'bg-blue-300', w: 176 },
        { key: 'header-business', defaultLabel: 'BUSINESS UNIT', bg: 'bg-blue-300', w: 176 },
        { key: 'header-division', defaultLabel: 'DIVISION HEAD', bg: 'bg-blue-300', w: 176 },
        { key: 'header-department', defaultLabel: 'DEPARTMENT HEAD', bg: 'bg-blue-300', w: 176 },
        { key: 'header-section', defaultLabel: 'SECTION HEAD / ENGINEERING PRODUCT LEADER', bg: 'bg-blue-300', w: 200 },
      ].map(h => {
        const label = organizationData.uiLabels?.[h.key] || h.defaultLabel;
        return (
          <EditorCard key={h.key} itemKey={h.key} defaultW={h.w} defaultH={40}>
            <div className={`${h.bg} p-2 rounded text-center w-full h-full flex items-center justify-center hover:opacity-90 transition-opacity`}>
              <h3 className="font-bold text-xs text-white leading-tight">{label}</h3>
            </div>
          </EditorCard>
        );
      })}

      {organizationData.structure?.headers?.map(item => (
        <EditorCard key={`header-${item.id}`} itemKey={`header-${item.id}`} defaultW={176} defaultH={40}>
          <div className="bg-blue-300 p-2 rounded text-center w-full h-full flex items-center justify-center hover:bg-blue-400 transition-colors">
            <h3 className="font-bold text-xs text-white leading-tight">{item.title}</h3>
          </div>
        </EditorCard>
      ))}

      {organizationData.structure?.bod?.map(item => renderStandardCard(item, `bod-${item.id}`))}
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

      {organizationData.structure?.divisions?.map(item => renderStandardCard(item, `division-${item.id}`))}
      {organizationData.structure?.departments?.map(item => renderStandardCard(item, `department-${item.id}`))}
      {organizationData.structure?.sections?.map(item => renderStandardCard(item, `section-${item.id}`))}

      {editingItem && (
        <EditOverlay
          itemKey={editingItem}
          positions={positions}
          sizes={sizes}
          editValues={editValues}
          setEditValues={setEditValues}
          saveEdit={saveEdit}
          cancelEdit={cancelEdit}
        />
      )}

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
        <div className="font-semibold mb-1 flex items-center gap-1.5">
          {editorMode === 'move' && (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              Move Mode
            </>
          )}
          {editorMode === 'connect' && (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Connect Mode
            </>
          )}
          {editorMode === 'edit' && (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Mode
            </>
          )}
          {editorMode === 'delete' && (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Mode
            </>
          )}
          {editorMode === 'resize' && (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Resize Mode
            </>
          )}
          {editorMode === 'line' && (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M9 12h11M4 18h16" />
              </svg>
              Line Mode
            </>
          )}
        </div>
        <div className="text-xs space-y-0.5">
          {editorMode === 'move' && <><div>• Drag any card to reposition</div><div>• Double-click to edit text</div></>}
          {editorMode === 'connect' && <><div>• Klik & tahan titik biru di tepi box</div><div>• Tarik ke titik biru box tujuan</div><div>• Lepas mouse untuk membuat garis</div></>}
          {editorMode === 'edit' && <><div>• Click any box to edit its text</div><div>• Press Enter to save, Escape to cancel</div></>}
          {editorMode === 'delete' && <><div>• Click a box to delete it</div><div>• Click a connection line to remove it</div></>}
          {editorMode === 'resize' && <><div>• Click a box to select it</div><div>• Drag the blue handle at bottom-right</div></>}
          {editorMode === 'line' && <><div>• Double-click garis untuk menambah titik belok</div><div>• Drag titik oranye untuk membentuk rute</div><div>• Double-click titik oranye untuk menghapusnya</div></>}
        </div>
      </div>
    </div>
  );
};

export default AdvancedEditorCanvas;