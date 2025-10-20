import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DraggableTraditionalLayout = ({ organizationData, onDataChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [draggedItem, setDraggedItem] = useState(null);
  const [positions, setPositions] = useState({});
  const containerRef = useRef(null);

  // Check permissions
  const canViewSODetails = user?.role?.permissions?.includes('View SO Details') || false;

  // Initialize positions based on exact dashboard layout
  useEffect(() => {
    if (!organizationData) return;

    const initialPositions = {};
    
    // Default positions matching dashboard exactly
    const defaultPositions = {
      // Board of Commissioners - centered at top
      'commissioners-header': { x: 400, y: 20 },
      'president-commissioner': { x: 250, y: 100 },
      'commissioners-list': { x: 470, y: 100 },
      
      // Column headers - exact 5-column grid
      'header-bod': { x: 50, y: 250 },
      'header-management': { x: 250, y: 250 },
      'header-division': { x: 450, y: 250 },
      'header-department': { x: 650, y: 250 },
      'header-section': { x: 850, y: 250 },
    };

    // Set positions from saved data or use defaults
    Object.keys(defaultPositions).forEach(key => {
      initialPositions[key] = organizationData.positions?.[key] || defaultPositions[key];
    });

    // Board of Directors (Column 1) - starting at y: 320
    if (organizationData.structure?.bod) {
      organizationData.structure.bod.forEach((item, index) => {
        const key = `bod-${item.id}`;
        initialPositions[key] = organizationData.positions?.[key] || { 
          x: 50, 
          y: 320 + index * 90 
        };
      });
    }

    // Management (Column 2) - with proper spacing for combined MDO
    if (organizationData.structure?.management) {
      organizationData.structure.management.forEach((item, index) => {
        const key = `management-${item.id}`;
        let yPos = 500; // Start after BOD spacing
        
        if (item.code === 'MIO1.0') yPos = 500;
        else if (item.code === 'MDO1.0') yPos = 590; // Combined MDO box
        else if (item.code === 'MRO1.0') yPos = 760;
        else if (item.code === 'CRO1.0') yPos = 850;
        else if (item.code === 'CO2.0') yPos = 940;
        
        initialPositions[key] = organizationData.positions?.[key] || { x: 250, y: yPos };
      });
    }

    // Divisions (Column 3) - business labels with proper spacing
    if (organizationData.structure?.divisions) {
      organizationData.structure.divisions.forEach((item, index) => {
        const key = `division-${item.id}`;
        let yPos = 650; // Align with content
        if (index === 1) yPos = 750;
        if (index === 2) yPos = 850;
        
        initialPositions[key] = organizationData.positions?.[key] || { x: 450, y: yPos };
      });
    }

    // Departments (Column 4) - with exact spacing
    if (organizationData.structure?.departments) {
      organizationData.structure.departments.forEach((item, index) => {
        const key = `department-${item.id}`;
        const spacingMap = {
          0: 540, // QA
          1: 630, // PPC
          2: 790, // MI & SHE
          3: 880, // MARKETING
          4: 970, // RND
          5: 1180, // QA/QC/DOC
          6: 1450  // MARKETING (Aftermarket)
        };
        
        initialPositions[key] = organizationData.positions?.[key] || { 
          x: 650, 
          y: spacingMap[index] || (540 + index * 90) 
        };
      });
    }

    // Sections (Column 5) - matching exact layout
    if (organizationData.structure?.sections) {
      organizationData.structure.sections.forEach((item, index) => {
        const key = `section-${item.id}`;
        let yPos = 320 + index * 90; // Basic spacing
        
        // Special positioning for specific items
        const specialPositions = {
          3: 750,  // MARKETING after large gap
          4: 840,  // ENGINEERING
          5: 930,  // AUX & POWER
          6: 1020, // ESS MARKETING
          7: 1110, // AUX & POWER EPL
          8: 1200, // ESS EPL
          9: 1290, // MICRO CONTROLLER EPL
          10: 1380, // BATTERY QA
          11: 1470, // MARKETING (Aftermarket)
          12: 1560, // HRDGA & IT
          13: 1650, // PURCHASING
          14: 1740  // FINANCE
        };
        
        if (specialPositions[index] !== undefined) {
          yPos = specialPositions[index];
        }
        
        initialPositions[key] = organizationData.positions?.[key] || { x: 850, y: yPos };
      });
    }

    setPositions(initialPositions);
  }, [organizationData]);

  const handleMouseDown = (e, itemKey) => {
    e.preventDefault();
    setDraggedItem({
      key: itemKey,
      startX: e.clientX,
      startY: e.clientY,
      startPos: positions[itemKey] || { x: 0, y: 0 }
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedItem) return;

    const deltaX = e.clientX - draggedItem.startX;
    const deltaY = e.clientY - draggedItem.startY;

    const newPositions = {
      ...positions,
      [draggedItem.key]: {
        x: draggedItem.startPos.x + deltaX,
        y: draggedItem.startPos.y + deltaY
      }
    };

    setPositions(newPositions);
  };

  const handleMouseUp = () => {
    if (draggedItem) {
      // Save positions to organizationData
      const updatedData = {
        ...organizationData,
        positions: positions
      };
      onDataChange(updatedData);
      setDraggedItem(null);
    }
  };

  useEffect(() => {
    if (draggedItem) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedItem, positions]);

  if (!organizationData || !organizationData.structure) {
    console.log('DraggableTraditionalLayout - organizationData:', organizationData);
    console.log('DraggableTraditionalLayout - structure:', organizationData?.structure);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization data...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing drag & drop layout</p>
        </div>
      </div>
    );
  }

  const DraggableCard = ({ children, itemKey, className = "", style = {} }) => {
    const position = positions[itemKey] || { x: 0, y: 0 };
    const isDragging = draggedItem?.key === itemKey;

    // Higher z-index for commissioners to ensure they're above header
    const isCommissioner = itemKey.includes('commissioners') || itemKey.includes('president-commissioner');
    const zIndex = isDragging ? 'z-50' : (isCommissioner ? 'z-30' : 'z-10');

    return (
      <div
        className={`absolute cursor-move select-none ${className} ${zIndex} ${isDragging ? 'opacity-75' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          ...style
        }}
        onMouseDown={(e) => handleMouseDown(e, itemKey)}
      >
        {children}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-white overflow-hidden"
      style={{ minHeight: '2000px', minWidth: '1200px' }}
    >
      {/* Header Section - Same as Dashboard */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
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
              <h1 className="text-xl font-bold text-gray-800 mb-1">{organizationData.header?.title}</h1>
              <h2 className="text-lg font-semibold text-gray-700">{organizationData.header?.company}</h2>
              <p className="text-sm text-gray-500">Effective Date: {organizationData.header?.effectiveDate}</p>
            </div>
          </div>
          <div className="text-right pointer-events-auto">
            <div className="grid grid-cols-3 gap-4 border border-gray-400 p-4 bg-white">
              {/* Prepared By */}
              <div className="text-center border-r border-gray-400 pr-4">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Prepared By :</p>
                <div className="border-b border-gray-300 mx-auto w-20 mb-16"></div>
                <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.preparedBy?.name || 'Diki Wahyudi'}</p>
                <p className="text-xs text-gray-500">Prep Date : {organizationData.signatures?.preparedBy?.date || '08/09/2025'}</p>
              </div>

              {/* Middle - Bambang Wuryanto */}
              <div className="text-center border-r border-gray-400 pr-4">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">{organizationData.signatures?.middleBy?.title || 'Bambang Wuryanto'}</p>
                <div className="border-b border-gray-300 mx-auto w-20 mb-16"></div>
                <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.middleBy?.name || 'Bambang Wuryanto'}</p>
                <p className="text-xs text-gray-500">Prepared Date : {organizationData.signatures?.middleBy?.date || '08/09/2025'}</p>
              </div>

              {/* Approved By */}
              <div className="text-center">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Approved By :</p>
                <div className="border-b border-gray-300 mx-auto w-20 mb-16"></div>
                <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.approvedBy?.name || 'Eko Maryanto'}</p>
                <p className="text-xs text-gray-500">Prepared Date : {organizationData.signatures?.approvedBy?.date || '08/09/2025'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Draggable Board of Commissioners Header */}
      <DraggableCard itemKey="commissioners-header">
        <div className="bg-blue-300 p-4 rounded text-center max-w-md hover:bg-blue-400 transition-colors border-2 border-transparent hover:border-blue-600">
          <h3 className="font-bold text-sm text-white">BOARD OF COMMISSIONERS</h3>
        </div>
      </DraggableCard>

      {/* Draggable President Commissioner */}
      <DraggableCard itemKey="president-commissioner">
        <div className="bg-white border border-gray-400 rounded shadow-sm w-48 text-center min-h-[100px] hover:shadow-lg transition-shadow hover:border-blue-400">
          <div className="p-2 bg-gray-100 border-b border-gray-300">
            <p className="text-sm font-semibold">{organizationData.commissioners?.president?.title || 'PRESIDENT COMMISIONER'}</p>
          </div>
          <div className="p-4 flex items-center justify-center h-16">
            <p className="text-xs font-medium">{organizationData.commissioners?.president?.name || 'IRIANTO SANTOSO'}</p>
          </div>
        </div>
      </DraggableCard>

      {/* Draggable Commissioners List */}
      <DraggableCard itemKey="commissioners-list">
        <div className="bg-white border border-gray-400 p-4 rounded shadow-sm w-48 text-center min-h-[100px] flex flex-col justify-center hover:shadow-lg transition-shadow hover:border-blue-400">
          <p className="text-sm font-semibold mb-3">COMMISSIONERS</p>
          {organizationData.commissioners?.commissioners?.map((name, index) => (
            <React.Fragment key={index}>
              <hr className="my-1 border-gray-300" />
              <p className="text-xs mb-1">{name}</p>
            </React.Fragment>
          ))}
        </div>
      </DraggableCard>

      {/* Draggable Column Headers */}
      <DraggableCard itemKey="header-bod">
        <div className="bg-blue-300 p-3 rounded text-center w-44">
          <h3 className="font-bold text-xs text-white">BOARD OF DIRECTOR</h3>
        </div>
      </DraggableCard>

      <DraggableCard itemKey="header-management">
        <div className="p-3 rounded text-center w-44">
          <h3 className="font-bold text-xs text-transparent">&nbsp;</h3>
        </div>
      </DraggableCard>

      <DraggableCard itemKey="header-division">
        <div className="bg-blue-300 p-3 rounded text-center w-44">
          <h3 className="font-bold text-xs text-white">DIVISION HEAD</h3>
        </div>
      </DraggableCard>

      <DraggableCard itemKey="header-department">
        <div className="bg-blue-300 p-3 rounded text-center w-44">
          <h3 className="font-bold text-xs text-white">DEPARTMENT HEAD</h3>
        </div>
      </DraggableCard>

      <DraggableCard itemKey="header-section">
        <div className="bg-blue-300 p-3 rounded text-center w-48">
          <h3 className="font-bold text-xs text-white leading-tight">SECTION HEAD / ENGINEERING PRODUCT LEADER</h3>
        </div>
      </DraggableCard>

      {/* Draggable Board of Directors Cards */}
      {organizationData.structure?.bod?.map((item) => (
        <DraggableCard key={item.id} itemKey={`bod-${item.id}`}>
          <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-44">
            <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
              <p className="text-xs font-bold">{item.code}</p>
            </div>
            <div className="p-2 flex-1 text-center flex flex-col justify-center">
              <p className="text-xs font-semibold mb-1 leading-tight">{item.title}</p>
              <hr className="my-1 border-gray-300" />
              <p className="text-xs leading-tight">{item.name}</p>
              <p className="text-xs leading-tight">({item.empId})</p>
            </div>
          </div>
        </DraggableCard>
      ))}

      {/* Draggable Management Cards */}
      {organizationData.structure?.management?.map((item) => {
        if (item.code === 'MDO1.0') {
          // Combined MDO box
          const mdo2 = organizationData.structure.management.find(m => m.code === 'MDO2.0');
          return (
            <DraggableCard key="mdo-combined" itemKey={`management-${item.id}`}>
              <div className={`bg-white border border-gray-400 rounded shadow-sm min-h-[170px] w-44 ${
                mdo2?.clickable && canViewSODetails ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200' : ''
              }`}
              onClick={() => {
                if (mdo2?.clickable && mdo2?.route && canViewSODetails) {
                  navigate(mdo2.route);
                }
              }}
              >
                <div className="flex flex-col h-full">
                  {/* Header row */}
                  <div className="flex border-b border-gray-300">
                    <div className="p-2 flex-1 text-center bg-gray-100">
                      <p className="text-xs font-semibold leading-tight">{item.title}</p>
                    </div>
                  </div>
                  
                  {/* First content row (MDO1.0) */}
                  <div className="flex border-b border-gray-300 flex-1">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                      <p className="text-xs font-bold">{item.code}</p>
                    </div>
                    <div className="p-3 flex-1 text-center flex flex-col justify-center">
                      <p className="text-xs leading-tight">{item.name}</p>
                      <p className="text-xs leading-tight">({item.empId})</p>
                    </div>
                  </div>
                  
                  {/* Second content row (MDO2.0) */}
                  <div className="flex flex-1">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                      <p className="text-xs font-bold">{mdo2?.code}</p>
                    </div>
                    <div className="p-3 flex-1 text-center flex flex-col justify-center">
                      <p className="text-xs leading-tight">{mdo2?.name}</p>
                      <p className="text-xs leading-tight">({mdo2?.empId})</p>
                      {mdo2?.clickable && canViewSODetails && (
                        <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DraggableCard>
          );
        } else if (item.code === 'MDO2.0') {
          // Skip MDO2.0 as it's handled in the combined box
          return null;
        } else {
          // Regular management item
          return (
            <DraggableCard key={item.id} itemKey={`management-${item.id}`}>
              <div className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-44 ${
                item.clickable && canViewSODetails ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200' : ''
              }`}
              onClick={() => {
                if (item.clickable && item.route && canViewSODetails) {
                  navigate(item.route);
                }
              }}
              >
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">{item.code}</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">{item.title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">{item.name}</p>
                  <p className="text-xs leading-tight">({item.empId})</p>
                  {item.clickable && canViewSODetails && (
                    <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                  )}
                </div>
              </div>
            </DraggableCard>
          );
        }
      })}

      {/* Draggable Division Labels */}
      {organizationData.structure?.divisions?.map((div) => (
        <DraggableCard key={div.id} itemKey={`division-${div.id}`}>
          <div className="bg-gray-200 p-3 rounded text-center font-bold text-xs min-h-[80px] w-44 flex items-center justify-center">
            <span className="leading-tight">{div.label}</span>
          </div>
        </DraggableCard>
      ))}

      {/* Draggable Department Cards */}
      {organizationData.structure?.departments?.map((item) => (
        <DraggableCard key={item.id} itemKey={`department-${item.id}`}>
          <div className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-44 ${
            item.clickable && canViewSODetails ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200' : ''
          }`}
          onClick={() => {
            if (item.clickable && item.route && canViewSODetails) {
              navigate(item.route);
            }
          }}
          >
            <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
              <p className="text-xs font-bold">{item.code}</p>
            </div>
            <div className="p-2 flex-1 text-center flex flex-col justify-center">
              <p className="text-xs font-semibold mb-1 leading-tight">{item.title}</p>
              <hr className="my-1 border-gray-300" />
              <p className="text-xs leading-tight">{item.name}</p>
              {item.empId && <p className="text-xs leading-tight">({item.empId})</p>}
              {item.clickable && canViewSODetails && (
                <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
              )}
            </div>
          </div>
        </DraggableCard>
      ))}

      {/* Draggable Section Cards */}
      {organizationData.structure?.sections?.map((item) => (
        <DraggableCard key={item.id} itemKey={`section-${item.id}`}>
          <div className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-48 ${
            item.clickable && canViewSODetails ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200' : ''
          }`}
          onClick={() => {
            if (item.clickable && item.route && canViewSODetails) {
              navigate(item.route);
            }
          }}
          >
            <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
              <p className="text-xs font-bold">{item.code}</p>
            </div>
            <div className="p-2 flex-1 text-center flex flex-col justify-center">
              <p className="text-xs font-semibold mb-1 leading-tight">{item.title}</p>
              <hr className="my-1 border-gray-300" />
              <p className="text-xs leading-tight">{item.name}</p>
              {item.empId && <p className="text-xs leading-tight">({item.empId})</p>}
              {item.clickable && canViewSODetails && (
                <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
              )}
            </div>
          </div>
        </DraggableCard>
      ))}

      {/* Legend - Fixed position */}
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

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-blue-100 border border-blue-400 rounded p-3 text-sm z-30">
        <div className="font-semibold mb-1">🖱️ Drag & Drop Instructions:</div>
        <div>• Click and drag any card to move it</div>
        <div>• Positions are automatically saved</div>
        <div>• Changes sync with main dashboard</div>
        <div>• Use zoom controls for better navigation</div>
      </div>
    </div>
  );
};

export default DraggableTraditionalLayout;