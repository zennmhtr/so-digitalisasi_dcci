import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const StaticOrgChart = ({
  organizationData,
  onCodeClick,
  employeeJobdescStatus = {},
  highlightedKeys = {},   // { 'department-qa-1': 'modified', 'bod-bod-1': 'moved', ... }
  isPreview = false,      // true = mode preview (disable click, sembunyikan "click to view")
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const routePermissionMap = {
    "/mi-she": "View MI & SHE SO",
    "/management-development": "View Management Dev SO",
    "/management-representative": "View Management Rep SO",
    "/qa-department": "View QA SO",
    "/ppic": "View PPIC SO",
    "/marketing-engineering": "View Marketing Engineering SO",
    "/marketing-battery-department": "View Marketing Battery SO",
    "/manufacturing-cable": "View Manufacturing Cable SO",
    "/manufactur-battery": "View Manufacturing Battery SO",
    "/hrga-it-department": "View HRGA & IT SO",
    "/purchasing": "View Purchasing SO",
    "/finance-department": "View Finance SO",
  };

  const routeByCode = {
    "QAC1.0": "/qa-department",
    "PPIC1.0": "/ppic",
    "ENG1.0": "/marketing-engineering",
    "HRD1.0": "/hrga-it-department",
    "PCH1.0": "/purchasing",
    "FIN1.0": "/finance-department",
    "PRD1.0": "/manufacturing-cable",
    "PRD2.0": "/manufactur-battery",
    "MRO1.0": "/management-representative",
    "MDO1.0": "/management-development",
    "MD1.0": "/mi-she",
    "MKT2.0": "/marketing-battery-department",
  };

  const routeCorrections = {
    "/quality-assurance": "/qa-department",
    "/manufactur-baterai": "/manufactur-battery",
    "/marketing-engineering-dept": "/marketing-engineering",
  };

  const getCanonicalRoute = (item) => {
    let route = routeByCode[item.code] || item.route;
    return routeCorrections[route] || route || null;
  };

  const canViewDepartmentSO = (route) => {
    if (isPreview) return false;
    if (!route) return false;
    const userPermissions = user?.role?.permissions || [];
    if (userPermissions.includes("View All SO Details")) return true;
    const requiredPermission = routePermissionMap[route];
    return requiredPermission ? userPermissions.includes(requiredPermission) : false;
  };

  const getPos = (key, defaultX, defaultY) => {
    const p = organizationData?.positions?.[key];
    return { left: p?.x ?? defaultX, top: p?.y ?? defaultY };
  };

  const getSize = (key, defaultW = 176, defaultH = 80) => {
    const s = organizationData?.sizes?.[key];
    return { width: s?.width ?? defaultW, height: s?.height ?? defaultH };
  };

  // Warna highlight per tipe perubahan
  const highlightStyleMap = {
    added: { outline: '3px solid #22c55e', outlineOffset: '2px', borderRadius: '4px' },
    removed: { outline: '3px solid #ef4444', outlineOffset: '2px', borderRadius: '4px' },
    moved: { outline: '3px solid #f59e0b', outlineOffset: '2px', borderRadius: '4px' },
    modified: { outline: '3px solid #3b82f6', outlineOffset: '2px', borderRadius: '4px' },
  };

  const CardWrapper = ({ posKey, defaultX, defaultY, defaultW, defaultH, style = {}, children }) => {
    const { left, top } = getPos(posKey, defaultX, defaultY);
    const { width, height } = getSize(posKey, defaultW, defaultH);
    const highlightType = highlightedKeys[posKey];
    const highlightStyle = highlightType ? highlightStyleMap[highlightType] || {} : {};
    return (
      <div
        className="absolute"
        style={{ ...style, left, top, width, height, zIndex: 20, ...highlightStyle }}
      >
        {children}
      </div>
    );
  };

  const clickable = (item) => {
    if (isPreview) return '';
    const route = getCanonicalRoute(item);
    return route && canViewDepartmentSO(route)
  };

  const CODE_TO_MATRIKS = {
    'QAC1.0': 'quality-assurance',
    'PPIC1.0': 'ppic',
    'ENG1.0': 'marketing-engineering',
    'ENG1.1': 'marketing-engineering',
    'HRD1.0': 'hrga-it',
    'HRD1.1': 'hrga-it',
    'PCH1.0': 'purchasing',
    'FIN1.0': 'finance',
    'MRO1.0': 'management-representative',
    'MDO1.0': 'management-development',
    'MD1.0': 'mi-she',
    'PRD1.0': 'manufacturing-cable',
    'PRD2.0': 'manufactur-battery',
    'MKT2.1': 'Marketing Battery',
    'MKT2.2': 'Marketing Battery',
  };

  const handleTitleClick = (e, item) => {
    e.stopPropagation();
    const deptId = CODE_TO_MATRIKS[(item.code || '').toUpperCase()];
    if (deptId) {
      localStorage.setItem('matriks_target_dept', deptId);
      navigate('/matriks-skill');
    }
  };

  const ROUTE_TO_SO_BAGIAN = {
    '/management-representative': 'management-representative',
    '/hrga-it-department':        'hrga-it',
    '/marketing-battery-department': 'marketing-battery',
    '/marketing-engineering':     'marketing-engineering',
    '/management-development':    'management-development',
    '/ppic':                      'ppic',
    '/qa-department':             'qa',
    '/mi-she':                    'mi-she',
    '/manufacturing-cable':       'manufacturing-cable',
    '/manufactur-battery':        'manufactur-battery',
    '/purchasing':                'purchasing',
    '/finance-department':        'finance',
  };

  const CODE_TO_SO_BAGIAN = {
    'MRO1.0': 'management-representative',
    'MRO1.1': 'management-representative',
    'MDO1.0': 'management-development',
    'MDO2.0': 'management-development',
    'HRD1.0': 'hrga-it',
    'HRD1.1': 'hrga-it',
    'HRD2.0': 'hrga-it',
    'GA1.1': 'hrga-it',
    'GA1.2': 'hrga-it',
    'GA1.3': 'hrga-it',
    'IT1.1': 'hrga-it',
    'IT1.2': 'hrga-it',
    'ENG1.0': 'marketing-engineering',
    'ENG1.1': 'marketing-engineering',
    'ENG1.2': 'marketing-engineering',
    'ENG1.3': 'marketing-engineering',
    'MKT1.0': 'marketing-engineering',
    'MKT1.1': 'marketing-engineering',
    'MKT1.1.1': 'marketing-engineering',
    'MKT1.1.2': 'marketing-engineering',
    'MKT1.1.3': 'marketing-engineering',
    'MKT2.0': 'marketing-battery',
    'MKT2.1': 'marketing-battery',
    'MKT2.2': 'marketing-battery',
    'PPIC1.0': 'ppic',
    'PPIC1.1': 'ppic',
    'PPIC1.2': 'ppic',
    'PPIC1.3': 'ppic',
    'PPIC1.1.1': 'ppic',
    'PPIC1.1.2': 'ppic',
    'PPIC1.1.3': 'ppic',
    'PPIC1.2.1': 'ppic',
    'PPIC1.2.2': 'ppic',
    'PPIC1.3.1': 'ppic',
    'PPIC1.3.2': 'ppic',
    'PPIC1.3.3': 'ppic',
    'PPIC1.3.4': 'ppic',
    'PPIC1.3.5': 'ppic',
    'PCH1.0': 'purchasing',
    'PCH1.1': 'purchasing',
    'PCH1.2': 'purchasing',
    'PCH1.3': 'purchasing',
    'PCH1.4': 'purchasing',
    'FIN1.0': 'finance',
    'FIN1.1': 'finance',
    'FIN1.2': 'finance',
    'FIN1.3': 'finance',
    'FIN1.4': 'finance',
    'QAC1.0': 'qa-department',
    'QAC1.1': 'qa-department',
    'QAC1.1.1': 'qa-department',
    'QAC1.1.2': 'qa-department',
    'QAC1.1.3': 'qa-department',
    'QAC1.1.4': 'qa-department',
    'QAC1.1.5': 'qa-department',
    'PRD1.0': 'manufacturing-cable',
    'PRD1.1': 'manufacturing-cable',
    'PRD1.2': 'manufacturing-cable',
    'PRD1.0.1': 'manufacturing-cable',
    'PRD1.1.1': 'manufacturing-cable',
    'PRD1.1.2': 'manufacturing-cable',
    'PRD1.1.3': 'manufacturing-cable',
    'PRD1.1.4': 'manufacturing-cable',
    'PRD1.1.5': 'manufacturing-cable',
    'PRD1.1.6': 'manufacturing-cable',
    'PRD1.1.7': 'manufacturing-cable',
    'PRD1.2.1': 'manufacturing-cable',
    'PRD1.2.2': 'manufacturing-cable',
    'PRD1.2.3': 'manufacturing-cable',
    'PRD1.2.4': 'manufacturing-cable',
    'PRD1.0.2': 'manufacturing-cable',
    'PRD1.0.3': 'manufacturing-cable',
    'PRD1.0.4': 'manufacturing-cable',
    'PRD2.0': 'manufactur-battery',
    'PRD2.1': 'manufactur-battery',
    'PRD2.2': 'manufactur-battery',
    'PRD2.3': 'manufactur-battery',
    'PRD3.0': 'manufactur-battery',
    'MD1.0': 'mi-she',
    'MIO1.0': 'mi-she',
    'MIO1.1': 'mi-she',
    'MIO1.2': 'mi-she',
  };

  const handleNameClick = (e, item) => {
    e.stopPropagation();
    e.preventDefault();
    const code = (item.code || '').toUpperCase();
    let deptId = CODE_TO_SO_BAGIAN[code];
    if (!deptId) {
      const route = getCanonicalRoute(item);
      deptId = ROUTE_TO_SO_BAGIAN[route];
    }
    if (deptId) {
      navigate('/so-bagian-editor?dept=' + deptId);
    } else {
      navigate('/so-bagian-editor');
    }
  };

  const handleClick = (item) => {
    if (isPreview) return;
    const route = getCanonicalRoute(item);
    if (route && item.clickable && canViewDepartmentSO(route)) {
      navigate(route);
    }
  };

  if (!organizationData?.structure) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const renderCodeButton = (item) => {
    if ((item?.code || '').toUpperCase().startsWith('BOD')) {
      return <p className="text-[8px] font-bold uppercase text-gray-600">{item?.code || ''}</p>;
    }

    const empId = (item?.empId || '').trim();
    const itemName = (item?.name || '')
      .trim()
      .toUpperCase()
      .replace(/\*+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!empId && !itemName) {
      return <p className="text-[8px] font-bold uppercase">{item?.code || ''}</p>;
    }

    const empIdMatch = empId && empId !== '-' && (
      employeeJobdescStatus[empId] ||
      empId.split(/[\/,]/).some(part => employeeJobdescStatus[part.trim()])
    );
    const nameMatch = itemName && (
      employeeJobdescStatus[itemName] ||
      itemName.split(/[\/,]/).some(part => employeeJobdescStatus[part.trim()])
    );
    const hasJobdesc = empIdMatch || nameMatch;

    if (!empId || empId === '-') {
      return <p className="text-[8px] font-bold uppercase text-gray-600">{item?.code || ''}</p>;
    }

    // Di mode preview, tidak perlu warna jobdesc — tampilkan netral
    if (isPreview) {
      return <p className="text-[8px] font-bold uppercase text-gray-700">{item?.code || ''}</p>;
    }

    const color = hasJobdesc ? 'text-blue-600 hover:bg-blue-50' : 'text-red-600 hover:bg-red-50';
    const handleCodeClick = (e) => {
      e.stopPropagation();
      if (typeof onCodeClick === 'function') {
        onCodeClick(item);
      }
    };

    return (
      <div
        role="button"
        tabIndex={0}
        className={`text-[8px] font-bold hover:underline focus:outline-none uppercase px-1 py-0.5 rounded transition-colors w-full h-full flex items-center justify-center cursor-pointer ${color}`}
        onClick={handleCodeClick}
        onKeyDown={(e) => { if (e.key === 'Enter') handleCodeClick(e); }}
        title={
          hasJobdesc
            ? 'Klik untuk melihat job description'
            : 'Belum memiliki job description'
        }
      >
        {item.code}
      </div>
    );
  };

  const renderConnections = () => {
    const conns = organizationData?.connections || [];
    if (conns.length === 0) return null;

    const getAnchorPoint = (key, side) => {
      const pos = organizationData?.positions?.[key];
      const size = organizationData?.sizes?.[key] || { width: 176, height: 80 };
      if (!pos) return null;
      switch (side) {
        case 'top': return { x: pos.x + size.width / 2, y: pos.y };
        case 'bottom': return { x: pos.x + size.width / 2, y: pos.y + size.height };
        case 'left': return { x: pos.x, y: pos.y + size.height / 2 };
        case 'right': return { x: pos.x + size.width, y: pos.y + size.height / 2 };
        default: return null;
      }
    };

    const getClosestPoints = (key1, key2) => {
      const pos1 = organizationData?.positions?.[key1];
      const pos2 = organizationData?.positions?.[key2];
      if (!pos1 || !pos2) return null;
      const size1 = organizationData?.sizes?.[key1] || { width: 176, height: 80 };
      const size2 = organizationData?.sizes?.[key2] || { width: 176, height: 80 };
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
      let minDist = Infinity, bestP1 = edges1[0], bestP2 = edges2[0];
      for (const p1 of edges1) {
        for (const p2 of edges2) {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < minDist) { minDist = dist; bestP1 = p1; bestP2 = p2; }
        }
      }
      return { from: bestP1, to: bestP2 };
    };

    const generateElbowPath = (from, to, bendRatio = 0.5) => {
      const x1 = from.x, y1 = from.y, x2 = to.x, y2 = to.y;
      const dx = x2 - x1, dy = y2 - y1;
      if (Math.abs(dx) < 5) return `M ${x1} ${y1} L ${x2} ${y2}`;
      if (Math.abs(dy) < 5) return `M ${x1} ${y1} L ${x2} ${y2}`;
      const fromSide = from.side || 'right';
      if (fromSide === 'right' || fromSide === 'left') {
        const midX = x1 + dx * bendRatio;
        return `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
      }
      const midY = y1 + dy * bendRatio;
      return `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`;
    };

    const buildPath = (conn, from, to) => {
      const waypoints = conn.waypoints || [];
      if (waypoints.length === 0) {
        const style = conn.style || 'elbow';
        const bendRatio = conn.bendRatio ?? 0.5;
        return style === 'straight'
          ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
          : generateElbowPath(from, to, bendRatio);
      }
      const points = [from, ...waypoints, to];
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1], cur = points[i];
        const isFirst = i === 1, isLast = i === points.length - 1;
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

    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 5, overflow: 'visible' }}>
        {conns.map(conn => {
          let from, to;
          if (conn.fromSide && conn.toSide) {
            const f = getAnchorPoint(conn.from, conn.fromSide);
            const t = getAnchorPoint(conn.to, conn.toSide);
            if (!f || !t) return null;
            from = { ...f, side: conn.fromSide };
            to = { ...t, side: conn.toSide };
          } else {
            const pts = getClosestPoints(conn.from, conn.to);
            if (!pts) return null;
            from = pts.from;
            to = pts.to;
          }
          const d = buildPath(conn, from, to);
          return (
            <path key={conn.id} d={d} stroke="#6b7280" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="relative overflow-x-auto" style={{ minHeight: '2200px', minWidth: '1200px', backgroundColor: 'transparent' }}>
      {renderConnections()}

      {/* ── Header ── */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
        <div className="pointer-events-auto mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'nowrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, minWidth: '320px' }}>
            <div className="w-24 h-24 flex items-center justify-center mr-4 p-2" style={{ flexShrink: 0 }}>
              <img src="/logo/Logo DG New 2022.png" alt="Dharma Group Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">{organizationData.header?.title}</h1>
              <h2 className="text-lg font-semibold text-gray-700">{organizationData.header?.company}</h2>
              <p className="text-sm text-gray-500">Effective Date: {organizationData.header?.effectiveDate}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border border-gray-400 p-4 bg-white" style={{ flexShrink: 0, minWidth: '420px', marginLeft: 'auto' }}>
            <div className="text-center border-r border-gray-400 pr-4" style={{ minWidth: '120px' }}>
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Prepared By :</p>
              <img src={organizationData.signatures?.preparedBy?.image || "/signatures/Diki_Wahyudi.png"} alt="ttd" className="h-12 object-contain mx-auto my-2" />
              <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.preparedBy?.name || 'Diki Wahyudi'}</p>
              <p className="text-xs text-gray-500">Prep Date : {organizationData.signatures?.preparedBy?.date || '08/09/2025'}</p>
            </div>
            <div className="text-center border-r border-gray-400 pr-4" style={{ minWidth: '120px' }}>
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">{organizationData.signatures?.middleBy?.title || 'Checked By :'}</p>
              <img src={organizationData.signatures?.middleBy?.image || "/signatures/Bambang_Wuryanto.png"} alt="ttd" className="h-12 object-contain mx-auto my-2" />
              <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.middleBy?.name || 'Bambang Wuryanto'}</p>
              <p className="text-xs text-gray-500">Checked Date : {organizationData.signatures?.middleBy?.date || '08/09/2025'}</p>
            </div>
            <div className="text-center" style={{ minWidth: '120px' }}>
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Approved By :</p>
              <img src={organizationData.signatures?.approvedBy?.image || "/signatures/Eko_Maryanto.png"} alt="ttd" className="h-12 object-contain mx-auto my-2" />
              <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.approvedBy?.name || 'Eko Maryanto'}</p>
              <p className="text-xs text-gray-500">Approved Date : {organizationData.signatures?.approvedBy?.date || '08/09/2025'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Commissioners */}
      <CardWrapper posKey="commissioners-header" defaultX={50} defaultY={175} defaultW={272} defaultH={70}>
        <div className="bg-white border border-gray-400 rounded shadow-sm w-full h-full flex flex-col overflow-hidden">
          <div className="bg-blue-300 px-2 py-1.5 text-center flex-shrink-0">
            <h3 className="font-bold text-xs text-white leading-tight">{organizationData.uiLabels?.['commissioners-header'] || 'BOARD OF COMMISSIONERS'}</h3>
          </div>
          <div className="flex border-b border-gray-300 flex-shrink-0">
            <div className="px-2 py-1 text-[8px] font-semibold border-r border-gray-300 w-[120px] flex-shrink-0 flex items-center leading-tight text-black">
              {organizationData.commissioners?.president?.title || 'PRESIDENT COMMISIONER'}
            </div>
            <div className="px-2 py-1 text-[8px] flex items-center leading-tight text-black">
              : {organizationData.commissioners?.president?.name || 'IRIANTO SANTOSO'}
            </div>
          </div>
          <div className="flex flex-1">
            <div className="px-2 py-1 text-[8px] font-semibold border-r border-gray-300 w-[120px] flex-shrink-0 flex items-center leading-tight text-black">COMMISSIONERS</div>
            <div className="px-2 py-1 text-[8px] flex-1 flex flex-col justify-center gap-[3px] text-black">
              {organizationData.commissioners?.commissioners?.map((name, i) => (
                <p key={i} className="leading-tight">: {name}</p>
              ))}
            </div>
          </div>
        </div>
      </CardWrapper>

      {/* Column headers */}
      <CardWrapper posKey="header-bod" defaultX={50} defaultY={250} defaultW={176} defaultH={40}>
        <div style={{ backgroundColor: '#93c5fd', borderRadius: '4px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '12px', color: 'white', lineHeight: 1.2, textAlign: 'center', margin: 0 }}>BOARD OF DIRECTOR</h3>
        </div>
      </CardWrapper>
      <CardWrapper posKey="header-business" defaultX={450} defaultY={250} defaultW={176} defaultH={40}>
        <div style={{ backgroundColor: '#93c5fd', borderRadius: '4px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '12px', color: 'white', lineHeight: 1.2, textAlign: 'center', margin: 0 }}>{organizationData.uiLabels?.['header-business'] || 'BUSINESS UNIT'}</h3>
        </div>
      </CardWrapper>
      <CardWrapper posKey="header-division" defaultX={450} defaultY={250} defaultW={176} defaultH={40}>
        <div style={{ backgroundColor: '#93c5fd', borderRadius: '4px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '12px', color: 'white', lineHeight: 1.2, textAlign: 'center', margin: 0 }}>DIVISION HEAD</h3>
        </div>
      </CardWrapper>
      <CardWrapper posKey="header-department" defaultX={650} defaultY={250} defaultW={176} defaultH={40}>
        <div style={{ backgroundColor: '#93c5fd', borderRadius: '4px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '12px', color: 'white', lineHeight: 1.2, textAlign: 'center', margin: 0 }}>DEPARTMENT HEAD</h3>
        </div>
      </CardWrapper>
      <CardWrapper posKey="header-section" defaultX={850} defaultY={250} defaultW={200} defaultH={40}>
        <div style={{ backgroundColor: '#93c5fd', borderRadius: '4px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '12px', color: 'white', lineHeight: 1.2, textAlign: 'center', margin: 0 }}>SECTION HEAD / ENGINEERING PRODUCT LEADER</h3>
        </div>
      </CardWrapper>

      {/* ── Board of Directors ── */}
      {organizationData.structure?.bod?.map((item, index) => {
        return (
          <CardWrapper key={item.id} posKey={`bod-${item.id}`} defaultX={50} defaultY={320 + index * 90} style={{ width: '176px' }}>
            <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full h-full">
              <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-10 flex-shrink-0 flex items-center justify-center">
                <p className="text-[8px] font-bold uppercase text-gray-600">{item.code}</p>
              </div>
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                <div className="px-2 py-1 text-center border-b border-gray-300">
                  <p className="text-[8px] font-semibold leading-tight break-words text-black">{item.title}</p>
                </div>
                <div className="px-2 py-1 text-center flex-1 flex flex-col justify-center">
                  <p className="text-[8px] leading-tight break-words text-black">{item.name}</p>
                  {item.empId && <p className="text-[8px] leading-tight text-black">({item.empId})</p>}
                </div>
              </div>
            </div>
          </CardWrapper>
        );
      })}

      {/* ── Custom Added Headers ── */}
      {organizationData.structure?.headers?.map((item) => {
        const posKey = `header-${item.id}`;
        return (
          <CardWrapper key={posKey} posKey={posKey} defaultX={50} defaultY={50} defaultW={176} defaultH={40}>
            <div className="bg-blue-300 p-2 rounded text-center w-full h-full flex items-center justify-center">
              <h3 className="font-bold text-xs text-white leading-tight">{item.title}</h3>
            </div>
          </CardWrapper>
        );
      })}

      {/* Business labels */}
      {organizationData.structure?.business?.map((item, i) => {
        const key = `business-${item.id}`;
        return (
          <CardWrapper key={key} posKey={key} defaultX={450} defaultY={500 + i * 300} defaultW={176} defaultH={100}>
            <div className="bg-gray-200 p-3 rounded text-center font-bold text-xs w-full h-full flex items-center justify-center">
              <span className="leading-tight">{item.label}</span>
            </div>
          </CardWrapper>
        );
      })}

      {/* Management */}
      {organizationData.structure?.management?.map((item, i) => {
        const yMap = { 'MD1.0': 590, 'MRO1.0': 760, 'CRO1.0': 850, 'CRO2.0': 940 };
        const dy = yMap[item.code] ?? 500 + i * 90;
        if (item.code === 'MDO2.0') return null;

        if (item.code === 'MDO1.0') {
          const mdo2 = organizationData.structure.management.find(m => m.code === 'MDO2.0');
          const mdo2Route = mdo2 ? getCanonicalRoute(mdo2) : null;
          const key = `management-${item.id}`;
          return (
            <CardWrapper key={key} posKey={key} defaultX={250} defaultY={dy} defaultW={176} defaultH={170}>
              <div className="bg-white border border-gray-400 rounded shadow-sm w-full h-full flex flex-col">
                <div className="flex flex-col h-full">
                  <div className="flex border-b border-gray-300">
                    <div className="p-2 flex-1 text-center bg-gray-100">
                      <p className="text-[8px] font-semibold leading-tight text-black">{item.title}</p>
                    </div>
                  </div>
                  <div className="flex border-b border-gray-300 flex-1">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-10 flex items-center justify-center">
                      {renderCodeButton(item)}
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <p className="text-[8px] leading-tight cursor-pointer hover:text-indigo-600 hover:underline" onClick={(e) => handleNameClick(e, item)} title="Klik untuk lihat SO Bagian">{item.name}</p>
                      <p className="text-[8px] leading-tight text-black">({item.empId})</p>
                    </div>
                  </div>
                  {mdo2 && (
                    <div className="flex flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-10 flex items-center justify-center">
                        {renderCodeButton(mdo2)}
                      </div>
                      <div className="p-2 flex-1 text-center flex flex-col justify-center">
                        <p className="text-[8px] leading-tight cursor-pointer hover:text-indigo-600 hover:underline" onClick={(e) => handleNameClick(e, mdo2)} title="Klik untuk lihat SO Bagian">{mdo2.name}</p>
                        <p className="text-[8px] leading-tight text-black">({mdo2.empId})</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardWrapper>
          );
        }

        const route = getCanonicalRoute(item);
        return (
          <CardWrapper key={item.id} posKey={`management-${item.id}`} defaultX={250} defaultY={dy} style={{ width: '176px' }}>
            <div className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full h-full ${clickable(item)}`} onClick={() => handleClick(item)}>
              <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-10 flex-shrink-0 flex items-center justify-center">
                {renderCodeButton(item)}
              </div>
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                <div
                  className="px-2 py-1 text-center border-b border-gray-300 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={(e) => handleTitleClick(e, item)}
                  title="Klik untuk lihat Matriks Skill"
                >
                  <p className="text-[8px] font-semibold leading-tight break-words text-black">{item.title}</p>
                </div>
                <div
                  className="px-2 py-1 text-center cursor-pointer hover:bg-indigo-50 transition-colors flex-1 flex flex-col justify-center"
                  onClick={(e) => handleNameClick(e, item)}
                  title="Klik untuk lihat SO Bagian"
                >
                  <p className="text-[8px] leading-tight break-words text-black">{item.name}</p>
                  {item.empId && <p className="text-[8px] leading-tight text-black">({item.empId})</p>}
                  {!isPreview && item.clickable && route && canViewDepartmentSO(route) && (
                    <p className="click-button no-print text-[8px] text-blue-600 font-semibold mt-0.5">Click to SO Bagian →</p>
                  )}
                </div>
              </div>
            </div>
          </CardWrapper>
        );
      })}

      {/* ── Divisions ── */}
      {organizationData.structure?.divisions?.map((item, index) => {
        const divisionDefaults = { 'MKT2.0': { x: 650, y: 1180 } };
        const def = divisionDefaults[item.code] || { x: 450, y: 650 + index * 100 };
        return (
          <CardWrapper key={item.id} posKey={`division-${item.id}`} defaultX={def.x} defaultY={def.y} style={{ width: '176px' }}>
            <div className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full h-full ${clickable(item)}`} onClick={() => handleClick(item)}>
              <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-10 flex-shrink-0 flex items-center justify-center">
                {renderCodeButton(item)}
              </div>
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                <div
                  className="px-2 py-1 text-center border-b border-gray-300 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={(e) => handleTitleClick(e, item)}
                  title="Klik untuk lihat Matriks Skill"
                >
                  <p className="text-[8px] font-bold leading-tight break-words text-black">{item.title}</p>
                </div>
                <div
                  className="px-2 py-1 text-center cursor-pointer hover:bg-indigo-50 transition-colors flex-1 flex flex-col justify-center"
                  onClick={(e) => handleNameClick(e, item)}
                  title="Klik untuk lihat SO Bagian"
                >
                  <p className="text-[8px] leading-tight break-words text-black">{item.name}</p>
                  {item.empId && <p className="text-[8px] leading-tight text-black">({item.empId})</p>}
                </div>
              </div>
            </div>
          </CardWrapper>
        );
      })}

      {/* ── Departments ── */}
      {organizationData.structure?.departments?.map((item, index) => {
        const spacingMap = { 0: 540, 1: 630, 2: 790, 3: 880, 4: 970, 5: 1180, 6: 1450, 7: 1170 };
        const defaultY = spacingMap[index] ?? 540 + index * 90;
        const route = getCanonicalRoute(item);
        return (
          <CardWrapper key={item.id} posKey={`department-${item.id}`} defaultX={650} defaultY={defaultY} style={{ width: '176px' }}>
            <div className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full h-full ${clickable(item)}`} onClick={() => handleClick(item)}>
              <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-10 flex-shrink-0 flex items-center justify-center">
                {renderCodeButton(item)}
              </div>
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                {/* Jabatan - klik ke Matriks Skill */}
                <div
                  className="px-2 py-1 text-center border-b border-gray-300 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={(e) => handleTitleClick(e, item)}
                  title="Klik untuk lihat Matriks Skill"
                >
                  <p className="text-[8px] font-semibold leading-tight break-words text-black">{item.title}</p>
                </div>
                {/* Nama + NPK + Click to SO Bagian - satu box, klik ke SO Bagian */}
                <div
                  className="px-2 py-1 text-center cursor-pointer hover:bg-indigo-50 transition-colors flex-1 flex flex-col justify-center"
                  onClick={(e) => handleNameClick(e, item)}
                  title="Klik untuk lihat SO Bagian"
                >
                  <p className="text-[8px] leading-tight break-words text-black">{item.name}</p>
                  {item.empId && <p className="text-[8px] leading-tight text-black">({item.empId})</p>}
                  {!isPreview && item.clickable && route && canViewDepartmentSO(route) && (
                    <p className="click-button no-print text-[8px] text-blue-600 font-semibold mt-0.5">Click to SO Bagian →</p>
                  )}
                </div>
              </div>
            </div>
          </CardWrapper>
        );
      })}

      {/* ── Sections ── */}
      {organizationData.structure?.sections?.map((item, index) => {
        const specialPositions = { 0: 320, 1: 410, 2: 500, 3: 750, 4: 840, 5: 930, 6: 1020, 7: 1110, 8: 1200, 9: 1290, 10: 1380, 11: 1470 };
        const defaultY = specialPositions[index] ?? 320 + index * 90;
        const route = getCanonicalRoute(item);
        return (
          <CardWrapper key={item.id} posKey={`section-${item.id}`} defaultX={850} defaultY={defaultY} style={{ width: '200px' }}>
            <div className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full h-full ${clickable(item)}`} onClick={() => handleClick(item)}>
              <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-10 flex-shrink-0 flex items-center justify-center">
                {renderCodeButton(item)}
              </div>
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                {/* Jabatan - klik ke Matriks Skill */}
                <div
                  className="px-2 py-1 text-center border-b border-gray-300 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={(e) => handleTitleClick(e, item)}
                  title="Klik untuk lihat Matriks Skill"
                >
                  <p className="text-[8px] font-semibold leading-tight break-words text-black">{item.title}</p>
                </div>
                {/* Nama + NPK + Click to SO Bagian - satu box, klik ke SO Bagian */}
                <div
                  className="px-2 py-1 text-center cursor-pointer hover:bg-indigo-50 transition-colors flex-1 flex flex-col justify-center"
                  onClick={(e) => handleNameClick(e, item)}
                  title="Klik untuk lihat SO Bagian"
                >
                  <p className="text-[8px] leading-tight break-words text-black">{item.name}</p>
                  {item.empId && <p className="text-[8px] leading-tight text-black">({item.empId})</p>}
                  {!isPreview && item.clickable && route && canViewDepartmentSO(route) && (
                    <p className="click-button no-print text-[8px] text-blue-600 font-semibold mt-0.5">Click to SO Bagian →</p>
                  )}
                </div>
              </div>
            </div>
          </CardWrapper>
        );
      })}

      {/* Legend */}
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
    </div>
  );
};

export default StaticOrgChart;