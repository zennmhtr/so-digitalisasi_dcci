import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../assets/print-styles.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organizationData, setOrganizationData] = useState(null);

  // Check if user has Dashboard Print permission
  const canPrint = user?.role?.permissions?.includes('Dashboard Print') || false;

  // Initialize organization data - same as DashboardEditor
  useEffect(() => {
    const initialData = {
      header: {
        title: "ORGANIZATION STRUCTURE",
        company: "PT DHARMA CONTROLCABLE INDONESIA",
        effectiveDate: "08/09/2025",
        regNo: "08/10/2025",
        preparedDate: "08/09/2025",
        approvedDate: "08/09/2025"
      },
      signatures: {
        preparedBy: {
          name: "Diki Wahyudi",
          date: "08/09/2025"
        },
        middleBy: {
          title: "Bambang Wuryanto",
          name: "Bambang Wuryanto",
          date: "08/09/2025"
        },
        approvedBy: {
          name: "Eko Maryanto",
          date: "08/09/2025"
        }
      },
      commissioners: {
        president: {
          title: "PRESIDENT COMMISIONER",
          name: "IRIANTO SANTOSO"
        },
        commissioners: [
          "SUBAGIO",
          "HONG KUO MING", 
          "LIAO CHIN HSIEN"
        ]
      },
      structure: {
        // Board of Directors - Column 1
        bod: [
          { id: 'bod-1', code: 'BOD1.0', title: 'PRESIDENT DIRECTOR', name: 'EKO MARYANTO', empId: '23100235' },
          { id: 'bod-2', code: 'BOD1.1', title: 'DIRECTOR', name: 'BAMBANG WURYANTO', empId: '23200038' }
        ],
        // Management Functions - Column 2
        management: [
          { id: 'mio-1', code: 'MIO1.0', title: 'MI & SHE (5R-SMK3-ISO 14001)', name: 'ELIATA DUMAR GINTING', empId: '23190806', clickable: true, route: '/mi-she' },
          { id: 'mdo-1', code: 'MDO1.0', title: 'MANAGEMENT DEVELOPMENT/PDCA', name: 'KARINA SATIA SALIM*', empId: '23230114', type: 'combined', part: 1 },
          { id: 'mdo-2', code: 'MDO2.0', title: 'MANAGEMENT DEVELOPMENT/PDCA', name: 'WAHYU KARTIKO ADI', empId: '23240005', type: 'combined', part: 2, clickable: true, route: '/management-development' },
          { id: 'mro-1', code: 'MRO1.0', title: 'MANAGEMENT REPRESENTATIVE', name: 'SUGIYARTO*', empId: '23600041', clickable: true, route: '/management-representative' },
          { id: 'cro-1', code: 'CRO1.0', title: 'CUSTOMER REPRESENTATIVE 2 WHEEL', name: 'SUMIYARTO*', empId: '23030015' },
          { id: 'co2-1', code: 'CO2.0', title: 'CUSTOMER REPRESENTATIVE 4 WHEEL', name: 'DWI PURWANTO*', empId: '23030023' }
        ],
        // Division Labels - Column 3
        divisions: [
          { id: 'div-1', label: 'CONTROLCABLE BUSINESS', type: 'business-label' },
          { id: 'div-2', label: 'BATTERY BUSINESS', type: 'business-label' },
          { id: 'div-3', label: 'AFTERMARKET BUSINESS', type: 'business-label' }
        ],
        // Department Head - Column 4
        departments: [
          { id: 'qa-1', code: 'QAC1.0', title: 'QA', name: 'M BAGUS SANTOSO', empId: '23220025', clickable: true, route: '/qa-department' },
          { id: 'ppic-1', code: 'PPIC1.0', title: 'PPC & WAREHOUSE', name: 'DIKI WAHYUDI', empId: '23060056', clickable: true, route: '/ppic' },
          { id: 'mkt-eng', code: 'MKT1.0', title: 'MI & SHE (5R-SMK3-ISO 14001)', name: 'ANDREAS AGUNG S.', empId: '23040119', clickable: true, route: '/marketing-engineering' },
          { id: 'mkt-2', code: 'MKT2.0', title: 'MARKETING', name: 'RENDRA PRAMONO', empId: '23200067', clickable: true, route: '/marketing-battery-department' },
          { id: 'rnd-1', code: 'RND1.0', title: 'RND', name: 'RENDRA PRAMONO', empId: '23200067' },
          { id: 'qac-2', code: 'QAC2.0', title: 'QA/QC/DOC', name: 'RENDRA PRAMONO', empId: '23200067' },
          { id: 'mkt-3', code: 'MKT3.0', title: 'MARKETING', name: 'TBR', empId: '' }
        ],
        // Section Head / Engineering Product Leader - Column 5
        sections: [
          { id: 'prd-1', code: 'PRD1.0', title: 'CONTROLCABLE MANUFACTURE', name: 'KARNA SATIA SALIM*', empId: '23230114', clickable: true, route: '/manufacturing-cable' },
          { id: 'prd-2', code: 'PRD2.0', title: 'BATTERY PRODUCTION', name: 'DIONISIUS AUGUSTO**', empId: '23220105', clickable: true, route: '/manufactur-battery' },
          { id: 'prd-3', code: 'PRD3.0', title: 'BATTERY PME', name: 'DIONISIUS AUGUSTO**', empId: '23220105', clickable: true, route: '/manufactur-battery' },
          { id: 'mkt-1-1', code: 'MKT1.1', title: 'MARKETING', name: 'SAVITRI OCTAVIANI', empId: '23130254' },
          { id: 'eng-1', code: 'ENG1.0', title: 'ENGINEERING', name: 'SUGIYARTO', empId: '2360041' },
          { id: 'mkt-2-1', code: 'MKT2.1', title: 'AUX & POWER BATTERY MARKETING', name: 'CHRYSNA YULIAWAN**', empId: '23240177' },
          { id: 'mkt-2-2', code: 'MKT2.2', title: 'ESS MARKETING', name: 'FERDINAND STEVANUS A**', empId: '23220049' },
          { id: 'rnd-1-0', code: 'RND1.0', title: 'AUX & POWER BATTERY ENGINEERING PRODUCT LEADER', name: 'BRIAN BUDI SANTOSO**', empId: '23210077' },
          { id: 'rnd-2-0', code: 'RND2.0', title: 'ESS ENGINEERING PRODUCT LEADER', name: 'RAIHAN RAMADHAN**', empId: '23220104' },
          { id: 'rnd-3-0', code: 'RND3.0', title: 'MICRO CONTROLLER ENGINEERING PRODUCT LEADER', name: 'ELISABETH GUSTI**', empId: '23230087' },
          { id: 'qac-2-1', code: 'QAC2.1', title: 'BATTERY QA', name: 'BELLA TIURMA PRATIWI**', empId: '23230092' },
          { id: 'mkt-3-1', code: 'MKT3.1', title: 'MARKETING', name: 'TBR', empId: '' },
          { id: 'hrd-1', code: 'HRD1.0', title: 'HRDGA & IT', name: 'DIKI WAHYUDI*', empId: '23060056', clickable: true, route: '/hrga-it-department' },
          { id: 'pch-1', code: 'PCH1.0', title: 'PURCHASING', name: 'DIKI WAHYUDI*', empId: '23060056', clickable: true, route: '/purchasing' },
          { id: 'fin-1', code: 'FIN1.0', title: 'FINANCE & ACCOUNTING', name: 'YULIUS PERMATA', empId: '23220017', clickable: true, route: '/finance-department' }
        ]
      }
    };
    
    // Load from localStorage if exists, otherwise use initial data
    const savedData = localStorage.getItem('dashboard-organization-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setOrganizationData(parsedData);
      } catch (error) {
        console.error('Error parsing saved data:', error);
        setOrganizationData(initialData);
      }
    } else {
      setOrganizationData(initialData);
    }

    // Listen for localStorage changes (when DashboardEditor saves)
    const handleStorageChange = (e) => {
      if (e.key === 'dashboard-organization-data' && e.newValue) {
        try {
          const updatedData = JSON.parse(e.newValue);
          setOrganizationData(updatedData);
        } catch (error) {
          console.error('Error parsing updated data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    const handleCustomUpdate = (e) => {
      setOrganizationData(e.detail);
    };

    window.addEventListener('dashboard-data-updated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dashboard-data-updated', handleCustomUpdate);
    };
  }, []);

  // Handle print/download
  const handlePrint = () => {
    // Set data attributes for CSS targeting - A3 Portrait
    const printContainer = document.querySelector('.dashboard-print-container');
    if (printContainer) {
      printContainer.setAttribute('data-paper', 'A3');
      printContainer.setAttribute('data-orientation', 'portrait');
    }
    
    // Set data attributes on document root for @page rules
    document.documentElement.setAttribute('data-paper', 'A3');
    document.documentElement.setAttribute('data-orientation', 'portrait');
    
    // Create dynamic @page rule for A3 Portrait
    const printStyle = document.getElementById('dynamic-print-style') || document.createElement('style');
    printStyle.id = 'dynamic-print-style';
    printStyle.innerHTML = `
      @media print {
        @page {
          size: A3 portrait;
          margin: 8mm;
        }
        
        /* Hide all web interface elements */
        .no-print, .click-button, nav, .sidebar, .navigation, .menu,
        button, .btn, .toolbar, .header-actions, .actions, .controls,
        .scrollbar, ::-webkit-scrollbar, .paste-image, .upload-image,
        .image-paste, .drag-drop, input[type="file"], .file-upload,
        .image-upload, .paste-area, .drop-zone {
          display: none !important;
          visibility: hidden !important;
        }
        
        /* Hide scrollbars completely */
        * {
          overflow: visible !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
        }
        
        html, body {
          overflow: visible !important;
          height: auto !important;
          background: white !important;
        }
        
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        /* Scale for A3 Portrait to fit everything in one page */
        .dashboard-print-container,
        .organization-chart {
          transform: scale(0.75) !important;
          transform-origin: top left !important;
          width: 133% !important;
          height: auto !important;
          page-break-inside: avoid !important;
          page-break-after: avoid !important;
          page-break-before: avoid !important;
        }
        
        /* Maintain exact dashboard layout */
        .grid {
          display: grid !important;
        }
        
        .grid-cols-4 {
          grid-template-columns: repeat(4, 1fr) !important;
        }
        
        .grid-cols-6 {
          grid-template-columns: repeat(6, 1fr) !important;
        }
        
        /* Keep spacing and positioning exact */
        .space-y-4 > * + * { margin-top: 1rem !important; }
        .space-y-3 > * + * { margin-top: 0.75rem !important; }
        .gap-4 { gap: 1rem !important; }
        
        /* Preserve colors and borders */
        .bg-blue-300 { background-color: #93c5fd !important; }
        .bg-gray-100 { background-color: #f3f4f6 !important; }
        .border-black { border-color: #000000 !important; }
        .text-black { color: #000000 !important; }
        
        /* Remove interfering effects */
        * {
          box-shadow: none !important;
          transition: none !important;
          animation: none !important;
        }
        
        /* Keep essential card shadows */
        .bg-white.border.border-gray-400 {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
        }
      }
    `;
    
    document.head.appendChild(printStyle);
    
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Loading state
  if (!organizationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-16 h-16  flex items-center justify-center mr-4 p-2">
              <img 
                src="/logo/Logo DG New 2022.png" 
                alt="Dharma Group Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">{organizationData.header.title}</h1>
              <h2 className="text-lg font-semibold text-gray-700">{organizationData.header.company}</h2>
              <p className="text-sm text-gray-500">Effective Date: {organizationData.header.effectiveDate}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="grid grid-cols-3 gap-4 border border-gray-400 p-4 bg-white">
              {/* Prepared By */}
              <div className="text-center border-r border-gray-400 pr-4">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Prepared By :</p>
                <div className="w-20 h-12 border border-gray-300 mx-auto mb-2 bg-gray-50 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Signature</span>
                </div>
                <div className="border-b border-gray-300 mx-auto w-20 mb-1"></div>
                <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.preparedBy?.name || 'Diki Wahyudi'}</p>
                <p className="text-xs text-gray-500">Prep Date : {organizationData.signatures?.preparedBy?.date || '08/09/2025'}</p>
              </div>

              {/* Middle - Bambang Wuryanto */}
              <div className="text-center border-r border-gray-400 pr-4">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">{organizationData.signatures?.middleBy?.title || 'Bambang Wuryanto'}</p>
                <div className="w-20 h-12 border border-gray-300 mx-auto mb-2 bg-gray-50 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Signature</span>
                </div>
                <div className="border-b border-gray-300 mx-auto w-20 mb-1"></div>
                <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.middleBy?.name || 'Bambang Wuryanto'}</p>
                <p className="text-xs text-gray-500">Prepared Date : {organizationData.signatures?.middleBy?.date || '08/09/2025'}</p>
              </div>

              {/* Approved By */}
              <div className="text-center">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Approved By :</p>
                <div className="w-20 h-12 border border-gray-300 mx-auto mb-2 bg-gray-50 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Signature</span>
                </div>
                <div className="border-b border-gray-300 mx-auto w-20 mb-1"></div>
                <p className="text-xs font-semibold underline mb-1">{organizationData.signatures?.approvedBy?.name || 'Eko Maryanto'}</p>
                <p className="text-xs text-gray-500">Prepared Date : {organizationData.signatures?.approvedBy?.date || '08/09/2025'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Print Button - Only show if user has permission */}
        {canPrint && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handlePrint}
              className="no-print bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print A3
            </button>
          </div>
        )}
      </div>

      {/* Organization Chart */}
      <div className="dashboard-print-container bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
        {/* Board of Commissioners */}
        <div className="mb-8">
          <div className="bg-blue-300 p-4 rounded text-center max-w-md mx-auto mb-6">
            <h3 className="font-bold text-sm text-white">BOARD OF COMMISSIONERS</h3>
          </div>
          
          <div className="flex justify-center gap-6 mb-6">
            <div className="bg-white border border-gray-400 rounded shadow-sm w-48 text-center min-h-[100px]">
              <div className="p-2 bg-gray-100 border-b border-gray-300">
                <p className="text-sm font-semibold">{organizationData.commissioners?.president?.title || 'PRESIDENT COMMISIONER'}</p>
              </div>
              <div className="p-4 flex items-center justify-center h-16">
                <p className="text-xs font-medium">{organizationData.commissioners?.president?.name || 'IRIANTO SANTOSO'}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-400 p-4 rounded shadow-sm w-48 text-center min-h-[100px] flex flex-col justify-center">
              <p className="text-sm font-semibold mb-3">COMMISSIONERS</p>
              {organizationData.commissioners?.commissioners?.map((name, index) => (
                <React.Fragment key={index}>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs mb-1">{name}</p>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="mb-6">
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-blue-300 p-3 rounded text-center">
              <h3 className="font-bold text-xs text-white">BOARD OF DIRECTOR</h3>
            </div>
            <div className="p-3 rounded text-center">
              <h3 className="font-bold text-xs text-transparent">&nbsp;</h3>
            </div>
            <div className="bg-blue-300 p-3 rounded text-center">
              <h3 className="font-bold text-xs text-white">DIVISION HEAD</h3>
            </div>
            <div className="bg-blue-300 p-3 rounded text-center">
              <h3 className="font-bold text-xs text-white">DEPARTMENT HEAD</h3>
            </div>
            <div className="bg-blue-300 p-3 rounded text-center">
              <h3 className="font-bold text-xs text-white leading-tight">SECTION HEAD / ENGINEERING PRODUCT LEADER</h3>
            </div>
          </div>
        </div>

        {/* Main Content Grid - 5 Columns - COMPLETE DYNAMIC STRUCTURE */}
        <div className="mb-6">
          <div className="grid grid-cols-5 gap-4">
            
            {/* Column 1 - Board of Directors */}
            <div className="space-y-3">
              {organizationData.structure?.bod?.map((item) => (
                <div key={item.id} className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
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
              ))}
            </div>

            {/* Column 2 - Management Functions */}
            <div className="space-y-4">
              {/* Empty space to align with President Director */}
              <div className="min-h-[180px]"></div>
              
              {/* Management items with special handling for combined MDO */}
              {organizationData.structure?.management?.map((item) => {
                if (item.code === 'MDO1.0') {
                  // Combined MDO box
                  const mdo2 = organizationData.structure.management.find(m => m.code === 'MDO2.0');
                  return (
                    <div key="mdo-combined" 
                      className={`bg-white border border-gray-400 rounded shadow-sm min-h-[170px] ${
                        mdo2?.clickable ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200' : ''
                      }`}
                      onClick={() => {
                        if (mdo2?.clickable && mdo2?.route) {
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
                            {mdo2?.clickable && (
                              <p className="click-button no-print text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else if (item.code === 'MDO2.0') {
                  // Skip MDO2.0 as it's handled in the combined box
                  return null;
                } else {
                  // Regular management item
                  return (
                    <div key={item.id} 
                      className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] ${
                        item.clickable ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200' : ''
                      }`}
                      onClick={() => {
                        if (item.clickable && item.route) {
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
                        {item.clickable && (
                          <p className="click-button no-print text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                        )}
                      </div>
                    </div>
                  );
                }
              })}
            </div>

            {/* Column 3 - Division Head (Business Labels) */}
            <div className="space-y-3">
              {/* Spacers to align with content */}
              <div className="min-h-[110px]"></div>
              <div className="min-h-[120px]"></div>
              <div className="min-h-[200px]"></div>
              <div className="min-h-[120px]"></div>
              <div className="min-h-[130px]"></div>
              
              {organizationData.structure?.divisions?.map((div, index) => (
                <React.Fragment key={div.id}>
                  {index > 0 && <div className={index === 1 ? "min-h-[100px]" : "min-h-[570px]"}></div>}
                  <div className={`bg-gray-200 p-3 rounded text-center font-bold text-xs min-h-${index === 0 ? '[100px]' : '[80px]'} flex items-center justify-center`}>
                    <span className="leading-tight">{div.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 4 - Department Head */}
            <div className="space-y-3">
              {/* Spacers */}
              <div className="min-h-[110px]"></div>
              <div className="min-h-[150px]"></div>
              <div className="min-h-[190px]"></div>
              
              {organizationData.structure?.departments?.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index === 1 && <div className="min-h-[10px]"></div>}
                  {index === 3 && <div className="min-h-[1px]"></div>}
                  {index === 4 && <div className="min-h-[105px]"></div>}
                  {index === 5 && <div className="min-h-[110px]"></div>}
                  {index === 6 && <div className="min-h-[250px]"></div>}
                  <div 
                    className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] ${
                      item.clickable ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200' : ''
                    }`}
                    onClick={() => {
                      if (item.clickable && item.route) {
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
                      {item.clickable && (
                        <p className="click-button no-print text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                      )}
                    </div>
                  </div>
                  {index === 6 && <div className="min-h-[1px]"></div>}
                </React.Fragment>
              ))}
            </div>

            {/* Column 5 - Section Head / Engineering Product Leader */}
            <div className="space-y-3">
              {organizationData.structure?.sections?.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index === 3 && <div className="min-h-[435px]"></div>}
                  {index === 4 && <div className="min-h-[10px]"></div>}
                  {index === 5 && <div className="min-h-[10px]"></div>}
                  <div 
                    className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] ${
                      item.clickable ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200' : ''
                    }`}
                    onClick={() => {
                      if (item.clickable && item.route) {
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
                      {item.clickable && (
                        <p className="click-button no-print text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-bold text-sm mb-2">NOTE:</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p><span className="font-bold">*</span> CONCURE</p>
              <p><span className="font-bold">INC (</span> ACTING</p>
              <p><span className="font-bold">INC )</span> INCUMBENT</p>
            </div>
            <div>
              <p><span className="font-bold">TBR</span> TO BE RECRUIT</p>
              <p><span className="font-bold">TBD</span> TO BE DEVELOP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
