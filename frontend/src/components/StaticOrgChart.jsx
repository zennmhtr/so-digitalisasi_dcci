import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    return {
      left: p?.x ?? defaultX,
      top: p?.y ?? defaultY,
    };
  };

  const CardWrapper = ({ posKey, defaultX, defaultY, style = {}, children }) => {
    const { left, top } = getPos(posKey, defaultX, defaultY);
    return (
      <div className="absolute" style={{ left, top, zIndex: 5, ...style }}>
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
      <button
        className={`text-[8px] font-bold hover:underline focus:outline-none uppercase px-1 py-0.5 rounded transition-colors ${color}`}
        onClick={(e) => { e.stopPropagation(); onCodeClick && onCodeClick(item); }}
        title={hasJobdesc ? 'Klik untuk melihat job description' : 'Belum memiliki job description'}
      >
        {item.code}
      </button>
    );
  };

  if (!organizationData?.structure) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div
      className="relative overflow-x-auto"
      style={{ minHeight: '2000px', minWidth: '1200px', backgroundColor: 'transparent' }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none" style={{ zIndex: 50 }}>
        <div className="flex justify-between items-center mb-4 pointer-events-auto">
          <div className="flex items-center">
            <div className="w-24 h-24 flex items-center justify-center mr-4 p-2">
              <img
                src="/logo/Logo DG New 2022.png"
                alt="Dharma Group Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">
                {organizationData.header?.title}
              </h1>
              <h2 className="text-lg font-semibold text-gray-700">
                {organizationData.header?.company}
              </h2>
              <p className="text-sm text-gray-500">
                Effective Date: {organizationData.header?.effectiveDate}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border border-gray-400 p-4 bg-white">
            <div className="text-center border-r border-gray-400 pr-4">
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Prepared By :</p>
              <div className="border-b border-gray-300 mx-auto w-20 mb-16" />
              <p className="text-xs font-semibold underline mb-1">
                {organizationData.signatures?.preparedBy?.name || 'Diki Wahyudi'}
              </p>
              <p className="text-xs text-gray-500">
                Prep Date : {organizationData.signatures?.preparedBy?.date || '08/09/2025'}
              </p>
            </div>
            <div className="text-center border-r border-gray-400 pr-4">
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">
                {organizationData.signatures?.middleBy?.title || 'Bambang Wuryanto'}
              </p>
              <div className="border-b border-gray-300 mx-auto w-20 mb-16" />
              <p className="text-xs font-semibold underline mb-1">
                {organizationData.signatures?.middleBy?.name || 'Bambang Wuryanto'}
              </p>
              <p className="text-xs text-gray-500">
                Prepared Date : {organizationData.signatures?.middleBy?.date || '08/09/2025'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Approved By :</p>
              <div className="border-b border-gray-300 mx-auto w-20 mb-16" />
              <p className="text-xs font-semibold underline mb-1">
                {organizationData.signatures?.approvedBy?.name || 'Eko Maryanto'}
              </p>
              <p className="text-xs text-gray-500">
                Prepared Date : {organizationData.signatures?.approvedBy?.date || '08/09/2025'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Commissioners Header ─────────────────────────────── */}
      <CardWrapper posKey="commissioners-header" defaultX={400} defaultY={20}>
        <div className="bg-blue-300 p-4 rounded text-center" style={{ width: '192px' }}>
          <h3 className="font-bold text-sm text-white">BOARD OF COMMISSIONERS</h3>
        </div>
      </CardWrapper>

      {/* ── President Commissioner ───────────────────────────── */}
      <CardWrapper posKey="president-commissioner" defaultX={250} defaultY={100} style={{ width: '192px' }}>
        <div className="bg-white border border-gray-400 rounded shadow-sm w-full text-center min-h-[100px]">
          <div className="p-2 bg-gray-100 border-b border-gray-300">
            <p className="text-sm font-semibold">
              {organizationData.commissioners?.president?.title || 'PRESIDENT COMMISIONER'}
            </p>
          </div>
          <div className="p-4 flex items-center justify-center h-16">
            <p className="text-xs font-medium">
              {organizationData.commissioners?.president?.name || 'IRIANTO SANTOSO'}
            </p>
          </div>
        </div>
      </CardWrapper>

      {/* ── Commissioners List ───────────────────────────────── */}
      <CardWrapper posKey="commissioners-list" defaultX={470} defaultY={100} style={{ width: '192px' }}>
        <div className="bg-white border border-gray-400 p-4 rounded shadow-sm w-full text-center min-h-[100px] flex flex-col justify-center">
          <p className="text-sm font-semibold mb-3">COMMISSIONERS</p>
          {organizationData.commissioners?.commissioners?.map((name, index) => (
            <React.Fragment key={index}>
              <hr className="my-1 border-gray-300" />
              <p className="text-xs mb-1">{name}</p>
            </React.Fragment>
          ))}
        </div>
      </CardWrapper>

      {/* ── Column Headers ───────────────────────────────────── */}
      <CardWrapper posKey="header-bod" defaultX={50} defaultY={250}>
        <div className="bg-blue-300 p-3 rounded text-center" style={{ width: '176px' }}>
          <h3 className="font-bold text-xs text-white">BOARD OF DIRECTOR</h3>
        </div>
      </CardWrapper>

      <CardWrapper posKey="header-management" defaultX={250} defaultY={250}>
        <div className="p-3 rounded text-center" style={{ width: '176px' }}>
          <h3 className="font-bold text-xs text-transparent">&nbsp;</h3>
        </div>
      </CardWrapper>

      <CardWrapper posKey="header-division" defaultX={450} defaultY={250}>
        <div className="bg-blue-300 p-3 rounded text-center" style={{ width: '176px' }}>
          <h3 className="font-bold text-xs text-white">DIVISION HEAD</h3>
        </div>
      </CardWrapper>

      <CardWrapper posKey="header-department" defaultX={650} defaultY={250}>
        <div className="bg-blue-300 p-3 rounded text-center" style={{ width: '176px' }}>
          <h3 className="font-bold text-xs text-white">DEPARTMENT HEAD</h3>
        </div>
      </CardWrapper>

      <CardWrapper posKey="header-section" defaultX={850} defaultY={250}>
        <div className="bg-blue-300 p-3 rounded text-center" style={{ width: '200px' }}>
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
          <div
            className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full ${clickable(item)}`}
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

      {/* ── Business Labels (Column 3) ───────────────────────── */}
      {organizationData.structure?.business?.map((item, index) => (
        <CardWrapper
          key={item.id}
          posKey={`business-${item.id}`}
          defaultX={450}
          defaultY={500 + index * 300}
          style={{ width: '176px' }}
        >
          <div className="bg-gray-200 p-3 rounded text-center font-bold text-xs min-h-[100px] flex items-center justify-center">
            <span className="leading-tight">{item.label}</span>
          </div>
        </CardWrapper>
      ))}

      {/* ── Management Cards (Column 2) ──────────────────────── */}
      {organizationData.structure?.management?.map((item, index) => {
        const defaultYMap = {
          'MIO1.0': 500, 'MDO1.0': 590, 'MRO1.0': 760,
          'CRO1.0': 850, 'CRO2.0': 940,
        };
        const defaultY = defaultYMap[item.code] ?? 500 + index * 90;

        if (item.code === 'MDO2.0') return null;

        if (item.code === 'MDO1.0') {
          const mdo2 = organizationData.structure.management.find(m => m.code === 'MDO2.0');
          return (
            <CardWrapper key={item.id} posKey={`management-${item.id}`} defaultX={250} defaultY={defaultY} style={{ width: '176px' }}>
              <div
                className={`bg-white border border-gray-400 rounded shadow-sm min-h-[170px] w-full ${mdo2?.clickable && canViewSODetails ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors' : ''}`}
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
          <CardWrapper key={item.id} posKey={`management-${item.id}`} defaultX={250} defaultY={defaultY} style={{ width: '176px' }}>
            <div
              className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full ${clickable(item)}`}
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
          <div
            className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full ${clickable(item)}`}
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
              className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full ${clickable(item)}`}
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
              className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-full ${clickable(item)}`}
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
    </div>
  );
};

export default StaticOrgChart;