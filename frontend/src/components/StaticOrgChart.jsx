import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * StaticOrgChart - Read-only version of DraggableTraditionalLayout.
 * Uses the EXACT same coordinate system as the editor, so positions sync perfectly.
 * Nodes are absolutely positioned inside a `position: relative` container.
 */
const StaticOrgChart = ({ organizationData, onCodeClick, employeeJobdescStatus = {} }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const canViewSODetails =
    user?.role?.permissions?.includes('View SO Details') || false;

  const canViewDepartmentSO = (route) => {
    if (!route) return false;
    return canViewSODetails;
  };

  const getPos = (key, defaultX, defaultY) => {
    const p = organizationData?.positions?.[key];
    return { left: p?.x ?? defaultX, top: p?.y ?? defaultY };
  };

  const getSize = (key, defaultW = 176, defaultH = 80) => {
    const s = organizationData?.sizes?.[key];
    return { width: s?.width ?? defaultW, height: s?.height ?? defaultH };
  };

  const CardWrapper = ({ posKey, defaultX, defaultY, defaultW, defaultH, style = {}, children }) => {
    const { left, top } = getPos(posKey, defaultX, defaultY);
    const { width, height } = getSize(posKey, defaultW, defaultH);
    return (
      <div
        className="absolute"
        style={{ ...style, left, top, width, height, zIndex: 20 }}
      >
        {children}
      </div>
    );
  };

  const clickable = (item) =>
    item.clickable && canViewDepartmentSO(item.route)
      ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200'
      : '';

  const handleClick = (item) => {
    if (item.clickable && item.route && canViewDepartmentSO(item.route)) {
      navigate(item.route);
    }
  };

  if (!organizationData?.structure) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  // ── renderCodeButton ──────────────────────────────────────
  const renderCodeButton = (item) => {
    if (!item?.empId || item.empId === '-') {
      return <p className="text-[8px] font-bold uppercase">{item?.code || ''}</p>;
    }
    const empId = (item.empId || '').trim();
    const itemName = (item.name || '').trim().toUpperCase();
    const hasJobdesc = employeeJobdescStatus[empId] || employeeJobdescStatus[itemName];
    const color = hasJobdesc
      ? 'text-blue-600 hover:bg-blue-50'
      : 'text-red-600 hover:bg-red-50';
    return (
      <div
        role="button"
        tabIndex={0}
        className={`text-[8px] font-bold hover:underline focus:outline-none uppercase px-1 py-0.5 rounded transition-colors w-full h-full flex items-center justify-center cursor-pointer ${color}`}
        onClick={(e) => { e.stopPropagation(); onCodeClick && onCodeClick(item); }}
        onKeyDown={(e) => { if(e.key === 'Enter') { e.stopPropagation(); onCodeClick && onCodeClick(item); } }}
        title={hasJobdesc ? 'Klik untuk melihat job description' : 'Belum memiliki job description'}
      >
        {item.code}
      </div>
    );
  };

  // Standard card renderer
  const renderCard = (item, posKey, defaultX, defaultY) => {
    return (
      <CardWrapper key={posKey} posKey={posKey} defaultX={defaultX} defaultY={defaultY} defaultW={176} defaultH={80}>
        <div
          className={`bg-white border border-gray-400 rounded shadow-sm flex flex-col w-full h-full ${clickable(item)}`}
          onClick={() => handleClick(item)}
        >
          <div className="flex flex-1">
            <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-10 flex-shrink-0 flex items-center justify-center">
              {renderCodeButton(item)}
            </div>
            <div className="p-2 flex-1 min-w-0 text-center flex flex-col justify-center items-center overflow-hidden h-full">
              <p className="text-[8px] font-semibold mb-1 leading-tight break-words">{item.title}</p>
              <hr className="my-1 border-gray-300 w-full" />
              <p className="text-[8px] leading-tight break-words">{item.name}</p>
              {item.empId && <p className="text-[8px] leading-tight">({item.empId})</p>}
              {item.clickable && canViewSODetails && (
                <p className="click-button no-print text-[7.5px] text-blue-600 mt-1 font-semibold">Click to view details →</p>
              )}
            </div>
          </div>
        </div>
      </CardWrapper>
    );
  };

  // ── SVG connections ────────────────────────────────────────────
  const renderConnections = () => {
    const conns = organizationData?.connections || [];
    if (conns.length === 0) return null;

    const getClosestPoints = (key1, key2) => {
      const pos1 = organizationData?.positions?.[key1];
      const pos2 = organizationData?.positions?.[key2];
      if (!pos1 || !pos2) return null;

      const size1 = organizationData?.sizes?.[key1] || { width: 176, height: 80 };
      const size2 = organizationData?.sizes?.[key2] || { width: 176, height: 80 };

      const edges1 = [
        { x: pos1.x + size1.width / 2, y: pos1.y,                   side: 'top'    }, // top
        { x: pos1.x + size1.width / 2, y: pos1.y + size1.height,     side: 'bottom' }, // bottom
        { x: pos1.x,                   y: pos1.y + size1.height / 2, side: 'left'   }, // left
        { x: pos1.x + size1.width,     y: pos1.y + size1.height / 2, side: 'right'  }, // right
      ];
      
      const edges2 = [
        { x: pos2.x + size2.width / 2, y: pos2.y,                   side: 'top'    }, // top
        { x: pos2.x + size2.width / 2, y: pos2.y + size2.height,     side: 'bottom' }, // bottom
        { x: pos2.x,                   y: pos2.y + size2.height / 2, side: 'left'   }, // left
        { x: pos2.x + size2.width,     y: pos2.y + size2.height / 2, side: 'right'  }, // right
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

    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 5, overflow: 'visible' }}
      >
        <defs>
          <marker id="arrow-gray" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
          </marker>
        </defs>
        {conns.map(conn => {
          const pts = getClosestPoints(conn.from, conn.to);
          if (!pts) return null;
          const d = generateElbowPath(pts.from, pts.to);
          return (
            <path
              key={conn.id}
              d={d}
              stroke="#6b7280"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div
      className="relative overflow-x-auto"
      style={{ minHeight: '2000px', minWidth: '1200px', backgroundColor: 'transparent' }}
    >
      {renderConnections()}

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
        <div className="flex justify-between items-center mb-4 pointer-events-auto">
          <div className="flex items-center">
            <div className="w-24 h-24 flex items-center justify-center mr-4 p-2">
              <img src="/logo/Logo DG New 2022.png" alt="Dharma Group Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">{organizationData.header?.title}</h1>
              <h2 className="text-lg font-semibold text-gray-700">{organizationData.header?.company}</h2>
              <p className="text-sm text-gray-500">Effective Date: {organizationData.header?.effectiveDate}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border border-gray-400 p-4 bg-white">
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

      {/* Commissioners */}
      <CardWrapper posKey="commissioners-header" defaultX={400} defaultY={20} defaultW={192} defaultH={52}>
        <div className="bg-blue-300 p-4 rounded text-center w-full h-full flex items-center justify-center">
          <h3 className="font-bold text-sm text-white">{organizationData.uiLabels?.['commissioners-header'] || 'BOARD OF COMMISSIONERS'}</h3>
        </div>
      </CardWrapper>

      <CardWrapper posKey="president-commissioner" defaultX={250} defaultY={100} defaultW={192} defaultH={100}>
        <div className="bg-white border border-gray-400 rounded shadow-sm text-center w-full h-full flex flex-col">
          <div className="p-2 bg-gray-100 border-b border-gray-300 flex-shrink-0">
            <p className="text-sm font-semibold">{organizationData.commissioners?.president?.title || 'PRESIDENT COMMISIONER'}</p>
          </div>
          <div className="p-4 flex-1 flex items-center justify-center">
            <p className="text-xs font-medium">{organizationData.commissioners?.president?.name || 'IRIANTO SANTOSO'}</p>
          </div>
        </div>
      </CardWrapper>

      <CardWrapper posKey="commissioners-list" defaultX={470} defaultY={100} defaultW={192} defaultH={120}>
        <div className="bg-white border border-gray-400 p-4 rounded shadow-sm text-center w-full h-full flex flex-col justify-center">
          <p className="text-sm font-semibold mb-3">COMMISSIONERS</p>
          {organizationData.commissioners?.commissioners?.map((name, index) => (
            <React.Fragment key={index}>
              <hr className="my-1 border-gray-300 w-full" />
              <p className="text-xs mb-1">{name}</p>
            </React.Fragment>
          ))}
        </div>
      </CardWrapper>

      {/* ── Column Headers ───────────────────────────────────── */}
      <CardWrapper posKey="header-bod" defaultX={50} defaultY={250} defaultW={176} defaultH={40}>
        <div className="bg-blue-300 p-2 rounded text-center w-full h-full flex items-center justify-center">
          <h3 className="font-bold text-xs text-white leading-tight">BOARD OF DIRECTOR</h3>
        </div>
      </CardWrapper>

      <CardWrapper posKey="header-management" defaultX={250} defaultY={250} defaultW={176} defaultH={40}>
        <div className="p-2 rounded text-center w-full h-full flex items-center justify-center">
          <h3 className="font-bold text-xs text-transparent leading-tight">&nbsp;</h3>
        </div>
      </CardWrapper>

      <CardWrapper posKey="header-division" defaultX={450} defaultY={250} defaultW={176} defaultH={40}>
        <div className="bg-blue-300 p-2 rounded text-center w-full h-full flex items-center justify-center">
          <h3 className="font-bold text-xs text-white leading-tight">DIVISION HEAD</h3>
        </div>
      </CardWrapper>

      <CardWrapper posKey="header-department" defaultX={650} defaultY={250} defaultW={176} defaultH={40}>
        <div className="bg-blue-300 p-2 rounded text-center w-full h-full flex items-center justify-center">
          <h3 className="font-bold text-xs text-white leading-tight">DEPARTMENT HEAD</h3>
        </div>
      </CardWrapper>

      <CardWrapper posKey="header-section" defaultX={850} defaultY={250} defaultW={200} defaultH={40}>
        <div className="bg-blue-300 p-2 rounded text-center w-full h-full flex items-center justify-center">
          <h3 className="font-bold text-xs text-white leading-tight">
            SECTION HEAD / ENGINEERING PRODUCT LEADER
          </h3>
        </div>
      </CardWrapper>

      {/* ── Board of Directors ───────────────────────────────── */}
      {organizationData.structure?.bod?.map((item, index) => (
        <CardWrapper
          key={item.id}
          posKey={`bod-${item.id}`}
          defaultX={50}
          defaultY={320 + index * 90}
          style={{ width: '176px' }}
        >
          <div className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full h-full ${clickable(item)}`}
            onClick={() => handleClick(item)}
          >
            <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-10 flex-shrink-0 flex items-center justify-center">
              {renderCodeButton(item)}
            </div>
            <div className="p-2 flex-1 min-w-0 text-center flex flex-col justify-center overflow-hidden">
              <p className="text-[8px] font-semibold mb-1 leading-tight break-words">{item.title}</p>
              <hr className="my-1 border-gray-300" />
              <p className="text-[8px] leading-tight break-words">{item.name}</p>
              {item.empId && <p className="text-[8px] leading-tight">({item.empId})</p>}
              {item.clickable && canViewSODetails && (
                <p className="click-button no-print text-[7.5px] text-blue-600 mt-1 font-semibold">Click to view details →</p>
              )}
            </div>
          </div>
        </CardWrapper>
      ))}

      {/* ── Custom Added Headers ────────────────────────────── */}
      {organizationData.structure?.headers?.map((item, i) => {
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
        const yMap = { 'MIO1.0': 500, 'MDO1.0': 590, 'MRO1.0': 760, 'CRO1.0': 850, 'CRO2.0': 940 };
        const dy = yMap[item.code] ?? 500 + i * 90;
        if (item.code === 'MDO2.0') return null;

        if (item.code === 'MDO1.0') {
          const mdo2 = organizationData.structure.management.find(m => m.code === 'MDO2.0');
          const key = `management-${item.id}`;
          return (
            <CardWrapper key={key} posKey={key} defaultX={250} defaultY={dy} defaultW={176} defaultH={170}>
              <div
                className={`bg-white border border-gray-400 rounded shadow-sm w-full h-full flex flex-col ${mdo2?.clickable && canViewSODetails ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors' : ''}`}
                onClick={() => mdo2?.clickable && mdo2?.route && canViewSODetails && navigate(mdo2.route)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex border-b border-gray-300">
                    <div className="p-2 flex-1 text-center bg-gray-100">
                      <p className="text-[8px] font-semibold leading-tight">{item.title}</p>
                    </div>
                  </div>
                  <div className="flex border-b border-gray-300 flex-1">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-10 flex items-center justify-center">
                      {renderCodeButton(item)}
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <p className="text-[8px] leading-tight">{item.name}</p>
                      <p className="text-[8px] leading-tight">({item.empId})</p>
                    </div>
                  </div>
                  {mdo2 && (
                    <div className="flex flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-10 flex items-center justify-center">
                        {renderCodeButton(mdo2)}
                      </div>
                      <div className="p-2 flex-1 text-center flex flex-col justify-center">
                        <p className="text-[8px] leading-tight">{mdo2.name}</p>
                        <p className="text-[8px] leading-tight">({mdo2.empId})</p>
                        {mdo2.clickable && canViewSODetails && (
                          <p className="text-[7.5px] text-blue-600 mt-1 font-semibold">Click to view →</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardWrapper>
          );
        }

        return (
          <CardWrapper key={item.id} posKey={`management-${item.id}`} defaultX={250} defaultY={dy} style={{ width: '176px' }}>
            <div
              className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full h-full ${clickable(item)}`}
              onClick={() => handleClick(item)}
            >
              <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-10 flex-shrink-0 flex items-center justify-center">
                {renderCodeButton(item)}
              </div>
              <div className="p-2 flex-1 min-w-0 text-center flex flex-col justify-center overflow-hidden">
                <p className="text-[8px] font-semibold mb-1 leading-tight break-words">{item.title}</p>
                <hr className="my-1 border-gray-300" />
                <p className="text-[8px] leading-tight break-words">{item.name}</p>
                <p className="text-[8px] leading-tight">({item.empId})</p>
                {item.clickable && canViewSODetails && (
                  <p className="text-[7.5px] text-blue-600 mt-1 font-semibold">Click to view details →</p>
                )}
              </div>
            </div>
          </CardWrapper>
        );
      })}

      {/* ── Divisions (Column 4) ──────────────────────────────── */}
      {organizationData.structure?.divisions?.map((item, index) => (
        <CardWrapper
          key={item.id}
          posKey={`division-${item.id}`}
          defaultX={450}
          defaultY={650 + index * 100}
          style={{ width: '176px' }}
        >
          <div className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full h-full ${clickable(item)}`}
            onClick={() => handleClick(item)}
          >
            <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-10 flex-shrink-0 flex items-center justify-center">
              {renderCodeButton(item)}
            </div>
            <div className="p-2 flex-1 min-w-0 text-center flex flex-col justify-center overflow-hidden">
              <p className="text-[8px] font-semibold mb-1 leading-tight break-words">{item.title}</p>
              <hr className="my-1 border-gray-300" />
              <p className="text-[8px] leading-tight break-words">{item.name}</p>
              <p className="text-[8px] leading-tight">({item.empId})</p>
            </div>
          </div>
        </CardWrapper>
      ))}

      {/* ── Departments (Column 5) ────────────────────────────── */}
      {organizationData.structure?.departments?.map((item, index) => {
        const spacingMap = { 0: 540, 1: 630, 2: 790, 3: 880, 4: 970, 5: 1180, 6: 1450, 7: 1170 };
        const defaultY = spacingMap[index] ?? 540 + index * 90;
        return (
          <CardWrapper
            key={item.id}
            posKey={`department-${item.id}`}
            defaultX={650}
            defaultY={defaultY}
            style={{ width: '176px' }}
          >
            <div
              className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full h-full ${clickable(item)}`}
              onClick={() => handleClick(item)}
            >
              <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-10 flex-shrink-0 flex items-center justify-center">
                {renderCodeButton(item)}
              </div>
              <div className="p-2 flex-1 min-w-0 text-center flex flex-col justify-center overflow-hidden">
                <p className="text-[8px] font-semibold mb-1 leading-tight break-words">{item.title}</p>
                <hr className="my-1 border-gray-300" />
                <p className="text-[8px] leading-tight break-words">{item.name}</p>
                {item.empId && <p className="text-[8px] leading-tight">({item.empId})</p>}
                {item.clickable && canViewSODetails && (
                  <p className="click-button no-print text-[7.5px] text-blue-600 mt-1 font-semibold">Click to view details →</p>
                )}
              </div>
            </div>
          </CardWrapper>
        );
      })}

      {/* ── Sections (Column 6) ───────────────────────────────── */}
      {organizationData.structure?.sections?.map((item, index) => {
        const specialPositions = {
          0: 320, 1: 410, 2: 500, 3: 750, 4: 840, 5: 930,
          6: 1020, 7: 1110, 8: 1200, 9: 1290, 10: 1380, 11: 1470,
        };
        const defaultY = specialPositions[index] ?? 320 + index * 90;
        return (
          <CardWrapper
            key={item.id}
            posKey={`section-${item.id}`}
            defaultX={850}
            defaultY={defaultY}
            style={{ width: '200px' }}
          >
            <div
              className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full h-full ${clickable(item)}`}
              onClick={() => handleClick(item)}
            >
              <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-10 flex-shrink-0 flex items-center justify-center">
                {renderCodeButton(item)}
              </div>
              <div className="p-2 flex-1 min-w-0 text-center flex flex-col justify-center overflow-hidden">
                <p className="text-[8px] font-semibold mb-1 leading-tight break-words">{item.title}</p>
                <hr className="my-1 border-gray-300" />
                <p className="text-[8px] leading-tight break-words">{item.name}</p>
                {item.empId && <p className="text-[8px] leading-tight">({item.empId})</p>}
                {item.clickable && canViewSODetails && (
                  <p className="click-button no-print text-[7.5px] text-blue-600 mt-1 font-semibold">Click to view details →</p>
                )}
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