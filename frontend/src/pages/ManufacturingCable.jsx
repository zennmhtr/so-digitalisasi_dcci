import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/print-styles.css';

const ManufacturingCable = () => {
  const navigate = useNavigate();
  const [printSettings, setPrintSettings] = useState({
    paperSize: 'A4',
    orientation: 'landscape'
  });
  const [showPrintOptions, setShowPrintOptions] = useState(false);

  const defaultData = {
    header: {
      title: "CONTROLCABLE MANUFACTURE",
      code: "PRD1.0",
      head: "KARNA SATIA SALIM*",
      empId: "23230114",
    },
    positions: [
      {
        id: "prd1-1",
        code: "PRD1.1",
        title: "MANUFACTURING UNIT",
        name: "DADI ROSADI",
        empId: "23060049",
      },
      {
        id: "prd1-2",
        code: "PRD1.2",
        title: "ASSEMBLING UNIT",
        name: "M. SUGIARTO",
        empId: "23050024",
      },
      {
        id: "prd1-0-1",
        code: "PRD1.0.1",
        title: "PRODUCTION ENGINEERING",
        name: "CHOIRUL AMIN",
        empId: "23110109",
      },
      {
        id: "prd1-1-1",
        code: "PRD1.1.1",
        title: "GROUP CO&CI",
        name: "AGUS PURWANTORO",
        empId: "23120156",
      },
      {
        id: "prd1-1-1",
        code: "PRD1.1.1",
        title: "GROUP CO&CI",
        name: "AJI BABAN",
        empId: "23120156",
      },
      {
        id: "prd1-1-2",
        code: "PRD1.1.2",
        title: "GROUP PO",
        name: "MAYAR SANTOSO",
        empId: "23090089",
      },
      {
        id: "prd1-1-2",
        code: "PRD1.1.2",
        title: "GROUP PO",
        name: "IWAN SUPRIYADI",
        empId: "23110114",
      },
      {
        id: "prd1-2-1",
        code: "PRD1.2.1",
        title: "GROUP ASSEMBLING",
        name: "PIKI TAOFIK",
        empId: "23110117",
      },
      {
        id: "prd1-2-1",
        code: "PRD1.2.1",
        title: "GROUP ASSEMBLING",
        name: "DEDY IRWANSYAH",
        empId: "23120132",
      },
      {
        id: "prd1-2-1",
        code: "PRD1.2.1",
        title: "GROUP ASSEMBLING",
        name: "AGUNG BASUKI",
        empId: "23070072",
      },
      {
        id: "prd1-2-1",
        code: "PRD1.2.1",
        title: "GROUP ASSEMBLING",
        name: "YULIANTO",
        empId: "23110122",
      },
      {
        id: "prd1-2-1",
        code: "PRD1.2.1",
        title: "GROUP ASSEMBLING",
        name: "SOPAN",
        empId: "23110118",
      },
      {
        id: "prd1-2-1",
        code: "PRD1.2.1",
        title: "GROUP ASSEMBLING",
        name: "MUJIATI",
        empId: "23120164",
      },
      {
        id: "prd1-2-1",
        code: "PRD1.2.1",
        title: "GROUP ASSEMBLING",
        name: "HIDAYATUL",
        empId: "23120165",
      },
      {
        id: "prd1-1-3",
        code: "PRD1.1.3",
        title: "COMPONENT OUTER & COMPONENT INNER",
        name: "TEAM MEMBER",
        empId: "-",
      },
      {
        id: "prd1-1-4",
        code: "PRD1.1.4",
        title: "PROSES OUTER",
        name: "TEAM MEMBER",
        empId: "-",
      },
      {
        id: "prd1-1-5",
        code: "PRD1.1.5",
        title: "MAINTENANCE",
        name: "TRI YULIYANTO",
        empId: "23110120",
      },
      {
        id: "prd1-1-6",
        code: "PRD1.1.6",
        title: "MAINTENANCE",
        name: "AHMAD DAYU ZAINI",
        empId: "23180703",
      },
      {
        id: "prd1-1-7",
        code: "PRD1.1.7",
        title: "PRODUCTION ENGINEERING",
        name: "HANA OKTA",
        empId: "23120155",
      },
      {
        id: "prd1-2-2",
        code: "PRD1.2.2",
        title: "ASSEMBLING",
        name: "TEAM MEMBER",
        empId: "-",
      },

      //(Quality Control Process)
      {
        id: "prd1-2-3",
        code: "PRD1.2.3",
        title: "QUALITY CONTROL PROCESS",
        name: "SUGIHARTO (COORD)",
        empId: "23120137",
      },
      {
        id: "prd1-2-4",
        code: "PRD1.2.4",
        title: "QUALITY CONTROL PROCESS",
        name: "CIPTO RAHMAD SASONO",
        empId: "23060047",
      },
      {
        id: "prd1-2-4",
        code: "PRD1.2.4",
        title: "QUALITY CONTROL PROCESS",
        name: "DENDI SETYAWAN",
        empId: "23120146",
      },
      {
        id: "prd1-2-4",
        code: "PRD1.2.4",
        title: "QUALITY CONTROL PROCESS",
        name: "HERI MOHAMMAD AFANDI",
        empId: "23120138",
      },
      {
        id: "prd1-2-4",
        code: "PRD1.2.4",
        title: "QUALITY CONTROL PROCESS",
        name: "INDRI NOVITA SARI",
        empId: "23110113",
        group: "TEAM MEMBER/ADMIN",
      },
      {
        id: "prd1-2-4",
        code: "PRD1.2.4",
        title: "QUALITY CONTROL PROCESS",
        name: "PARTO",
        empId: "23120140",
        group: "TEAM MEMBER/ADMIN",
      },
      {
        id: "prd1-2-4",
        code: "PRD1.2.4",
        title: "QUALITY CONTROL PROCESS",
        name: "SUPANTO",
        empId: "23090091",
        group: "TEAM MEMBER/ADMIN",
      },
      {
        id: "prd1-2-4",
        code: "PRD1.2.4",
        title: "QUALITY CONTROL PROCESS",
        name: "WANTO",
        empId: "23110121",
        group: "TEAM MEMBER/ADMIN",
      },
      {
        id: "prd1-2-4",
        code: "PRD1.2.4",
        title: "QUALITY CONTROL PROCESS",
        name: "JUPRI SAHALA",
        empId: "23120154",
        group: "TEAM MEMBER/ADMIN",
      },
      {
        id: "prd1-2-4",
        code: "PRD1.2.4",
        title: "QUALITY CONTROL PROCESS",
        name: "ARIYANTO",
        empId: "23120219",
        group: "TEAM MEMBER/ADMIN",
      },
      {
        id: "prd1-2-4",
        code: "PRD1.2.4",
        title: "QUALITY CONTROL PROCESS",
        name: "TEAM MEMBER",
        empId: "-",
        group: "TEAM MEMBER/ADMIN",
      },
      // (QUALITY CONTROL INCOMING)
      {
        id: "prd1-0-2",
        code: "PRD1.0.2",
        title: "QUALITY CONTROL INCOMING",
        name: "MAULANA MALIK IBRAHIM",
        empId: "23220078",
        group: "TEAM MEMBER/ADMIN",
      },
      {
        id: "prd1-0-3",
        code: "PRD1.0.3",
        title: "QUALITY CONTROL INCOMING",
        name: "MOH. NURHIDAYAT",
        empId: "23120181",
        group: "TEAM MEMBER/ADMIN",
      },
      // (ADMINISTRATION)
      {
        id: "prd1-0-4",
        code: "PRD1.0.4",
        title: "ADMINISTRATION",
        name: "DWI WIDYASTUTI",
        empId: "23120191",
        group: "TEAM MEMBER/ADMIN",
      },
      {
        id: "prd1-0-5",
        code: "PRD1.0.5",
        title: "ADMINISTRATION",
        name: "MELINDA SURYANI HASIBUAN",
        empId: "23230008",
        group: "TEAM MEMBER/ADMIN",
      },
      {
        id: "prd1-0-6",
        code: "PRD1.0.6",
        title: "ADMINISTRATION",
        name: "RIRIN ERLINA",
        empId: "23120217",
        group: "TEAM MEMBER/ADMIN",
      },
      {
        id: "prd1-0-7",
        code: "PRD1.0.7",
        title: "ADMINISTRATION",
        name: "ANDI PUTRA MALBA SYAGGAF",
        empId: "23230027",
        group: "TEAM MEMBER/ADMIN",
      },
    ],
  };

  const [orgData, setOrgData] = useState(defaultData);

  const loadDataFromStorage = () => {
    try {
      const storageKey = 'so-bagian-manufacturing-cable';
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.header && parsed.positions) {
          setOrgData(parsed);
          return true;
        }
      }
      setOrgData(defaultData);
      return false;
    } catch (error) {
      console.error('Error:', error);
      setOrgData(defaultData);
      return false;
    }
  };

  useEffect(() => { loadDataFromStorage(); }, []);

  useEffect(() => {
    const eventName = 'so-bagian-manufacturing-cable-updated';
    const handleUpdate = (event) => {
      const newData = event.detail;
      if (newData?.header && newData?.positions) {
        setOrgData(newData);
        localStorage.setItem('so-bagian-manufacturing-cable', JSON.stringify(newData));
        alert('Updated!');
      }
    };
    window.addEventListener(eventName, handleUpdate);
    return () => window.removeEventListener(eventName, handleUpdate);
  }, []);

  useEffect(() => {
    const handleFocus = () => loadDataFromStorage();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  const handlePrint = () => {
    const printContainer = document.querySelector('.print-container');
    if (printContainer) {
      printContainer.setAttribute('data-paper', printSettings.paperSize);
      printContainer.setAttribute('data-orientation', printSettings.orientation);
    }

    document.documentElement.setAttribute('data-paper', printSettings.paperSize);
    document.documentElement.setAttribute('data-orientation', printSettings.orientation);

    const printStyle = document.getElementById('dynamic-print-style') || document.createElement('style');
    printStyle.id = 'dynamic-print-style';

    const paperSize = printSettings.paperSize;
    const orientation = printSettings.orientation;

    let scale = 0.75;
    if (paperSize === 'A4' && orientation === 'landscape') {
      scale = 0.35;
    } else if (paperSize === 'A4' && orientation === 'portrait') {
      scale = 0.50;
    } else if (paperSize === 'A3' && orientation === 'landscape') {
      scale = 0.95;
    } else if (paperSize === 'A3' && orientation === 'portrait') {
      scale = 0.88;
    }

    printStyle.innerHTML = `
      @media print {
        @page {
          size: ${paperSize} ${orientation};
          margin: 0;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        .print\\:hidden,
        button,
        [class*="print:hidden"] {
          display: none !important;
        }
        
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: white !important;
          overflow: hidden !important;
        }
        
        body > div {
          padding: 0 !important;
          margin: 0 !important;
          background: white !important;
        }
        
        .min-h-screen {
          min-height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          background: white !important;
        }
        
        .print-container {
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: visible !important;
          background: white !important;
        }
        
        .print-container > div {
          transform: scale(${scale}) !important;
          transform-origin: top left !important;
          width: ${100 / scale}% !important;
          padding: 12px !important;
        }
        
        .bg-blue-300 {
          background-color: #93c5fd !important;
        }
        
        .bg-gray-100 {
          background-color: #f3f4f6 !important;
        }
        
        .bg-white {
          background-color: #ffffff !important;
        }
        
        .bg-gray-50 {
          background-color: #ffffff !important;
        }
        
        .border,
        .border-2,
        .border-4,
        .border-black {
          border-color: #000000 !important;
        }
        
        .border-gray-300 {
          border-color: #d1d5db !important;
        }
        
        .border-gray-400 {
          border-color: #9ca3af !important;
        }
        
        /* Pastikan text color */
        .text-black {
          color: #000000 !important;
        }
        
        .text-gray-800,
        .text-gray-700,
        .text-gray-600,
        .text-gray-500 {
          color: #000000 !important;
        }
        
        img {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          display: block !important;
        }
        
        * {
          page-break-inside: avoid !important;
          page-break-after: avoid !important;
          page-break-before: avoid !important;
        }
      }
    `;

    document.head.appendChild(printStyle);

    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Back Button and Print Button */}
      <div className="mb-4 flex justify-between print:hidden">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          ← Back to Main Dashboard
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPrintOptions(!showPrintOptions)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Print Settings
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Download
          </button>
        </div>
      </div>

      {/* Print Options Panel */}
      {showPrintOptions && (
        <div className="mb-4 bg-white rounded-lg shadow-sm p-4 border print-options">
          <h3 className="text-lg font-semibold mb-3">Print Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paper Size
              </label>
              <select
                value={printSettings.paperSize}
                onChange={(e) => setPrintSettings({ ...printSettings, paperSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orientation
              </label>
              <select
                value={printSettings.orientation}
                onChange={(e) => setPrintSettings({ ...printSettings, orientation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              <strong>Preview:</strong> {printSettings.paperSize} - {printSettings.orientation === 'landscape' ? 'Landscape' : 'Portrait'}
            </div>
          </div>
        </div>
      )}

      {/* Manufacturing Cable Department Organization Chart */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black print-container print:overflow-visible print:rounded-none print:shadow-none">
        <div className="min-w-[1200px] relative p-4 print:min-w-0 print:p-0">

          {/* Header Section with borders */}
          <div className="mb-4 border-2 border-black p-3 print:mb-3 print:p-3 print:border-2">
            <div className="flex items-start gap-2">
              <div className="w-32 flex items-center justify-center p-4 border-2 border-black" style={{ height: '160px' }}>
                <img
                  src="/logo/dcci.png"
                  alt="Dharma Group Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1" style={{ height: '160px' }}>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">STRUKTUR ORGANISASI</h1>
                  <h2 className="text-xl font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">(MANUFACTURING CABLE DEPARTMENT)</h3>
                  <p className="text-md text-gray-500">Effective Date : 30 September 2025</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex space-x-1">
                  <div className="text-center">
                    <div className="w-60 h-40 border border-black bg-white">
                      <div className="p-2 border-b border-black bg-white">
                        <p className="text-sm font-bold text-black">Prepared by :</p>
                      </div>
                      <div className="p-3 flex flex-col justify-end h-32">
                        <div className="h-16"></div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-black underline leading-tight">DEPARTMENT HEAD</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-60 h-40 border border-black bg-white">
                      <div className="p-2 border-b border-black bg-white">
                        <p className="text-sm font-bold text-black">Checked by :</p>
                      </div>
                      <div className="p-3 flex flex-col justify-end h-32">
                        <div className="h-16"></div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-black underline leading-tight">DIKI WAHYUDI</p>
                          <p className="text-sm text-black leading-tight">HRGAIT DEPT. HEAD</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-60 h-40 border border-black bg-white">
                      <div className="p-2 border-b border-black bg-white">
                        <p className="text-sm font-bold text-black">Approved by :</p>
                      </div>
                      <div className="p-3 flex flex-col justify-end h-32">
                        <div className="h-16"></div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-black underline leading-tight">BAMBANG WURYANTO</p>
                          <p className="text-sm text-black leading-tight">DIRECTOR</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Header Rows */}
          <div className="mb-6 relative" style={{ zIndex: 2 }}>
            <div className="grid grid-cols-6 gap-2 mb-4">
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">BOARD OF DIRECTOR</h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">DEPARTMENT HEAD</h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">STAFF/UNIT HEAD</h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">GROUP HEAD</h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">TEAM MEMBER/ADMIN</h3>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-6 gap-2 relative org-grid" style={{ zIndex: 2 }}>

            {/* Kolom 1 - Board of Director */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[180px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">BOD1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">PRESIDENT DIRECTOR</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">EKO MARYANTO</p>
                  <p className="text-xs leading-tight uppercase">(23200235)</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[180px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">BOD1.1</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">DIRECTOR</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">BAMBANG WURYANTO</p>
                  <p className="text-xs leading-tight uppercase">(23200038)</p>
                </div>
              </div>
            </div>

            {/* Kolom 2 - Department Head (Empty) */}
            <div className="space-y-4 flex flex-col items-center">
              {/* Empty column */}
            </div>

            {/* Kolom 3 - Section Head */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[180px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">{orgData.header.code}</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.header.title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.header.head}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.header.empId})</p>
                </div>
              </div>
            </div>

            {/* Kolom 4 - Staff/Unit Head */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">{orgData.positions[0].code}</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[0].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[0].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[0].empId})</p>
                </div>
              </div>

              <div className="min-h-[420px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">{orgData.positions[1].code}</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[1].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[1].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[1].empId})</p>
                </div>
              </div>

              <div className="min-h-[880px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">{orgData.positions[2].code}</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[2].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[2].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[2].empId})</p>
                </div>
              </div>
            </div>

            {/* Kolom 5 - Group Head */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[180px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">{orgData.positions[3].code}</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[3].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[3].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[3].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[4].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[4].empId})</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[180px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">{orgData.positions[5].code}</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[5].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[5].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[5].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[6].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[6].empId})</p>
                </div>
              </div>

              <div className="min-h-[240px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[300px] w-[180px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">{orgData.positions[7].code}</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[7].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[7].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[7].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[8].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[8].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[9].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[9].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[10].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[10].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[11].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[11].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[12].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[12].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[13].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[13].empId})</p>
                </div>
              </div>
            </div>

            {/* Kolom 6 - Team Member/Admin */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[180px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">{orgData.positions[14].code}</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[14].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[14].name}</p>
                </div>
              </div>

              <div className="min-h-[10px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[180px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">{orgData.positions[15].code}</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[15].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[15].name}</p>
                </div>
              </div>

              <div className="min-h-[30px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm w-[180px]">
                <div className="flex">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    <p className="text-xs font-bold uppercase">{orgData.positions[16].code}</p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[16].title}</p>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-xs leading-tight uppercase">{orgData.positions[16].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[16].empId})</p>
                  </div>
                </div>
                <div className="flex border-t border-gray-400">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    <p className="text-xs font-bold uppercase">{orgData.positions[17].code}</p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs leading-tight uppercase">{orgData.positions[17].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[17].empId})</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[180px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">{orgData.positions[18].code}</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[18].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[18].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[18].empId})</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[180px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">{orgData.positions[19].code}</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[19].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[19].name}</p>
                </div>
              </div>


              <div className="min-h-[240px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm w-[180px]">
                <div className="flex">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    <p className="text-xs font-bold uppercase">{orgData.positions[20].code}</p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[20].title}</p>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-xs leading-tight uppercase">{orgData.positions[20].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[20].empId})</p>
                  </div>
                </div>
                <div className="flex border-t border-gray-400">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    {/* Empty for alignment */}
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center border-t border-gray-400">
                    <p className="text-xs leading-tight uppercase">{orgData.positions[21].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[21].empId})</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    {/* Empty for alignment */}
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center border-t border-gray-400">
                    <p className="text-xs leading-tight uppercase">{orgData.positions[22].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[22].empId})</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    <p className="text-xs font-bold uppercase">{orgData.positions[23].code}</p>
                    {/* Empty for alignment */}
                  </div>

                  <div className="p-2 flex-1 text-center flex flex-col justify-center border-t border-gray-400">
                    <p className="text-xs leading-tight uppercase">{orgData.positions[23].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[23].empId})</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    {/* Empty for alignment */}
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center border-t border-gray-400">
                    <p className="text-xs leading-tight uppercase">{orgData.positions[24].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[24].empId})</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    {/* Empty for alignment */}
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center border-t border-gray-400">
                    <p className="text-xs leading-tight uppercase">{orgData.positions[25].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[25].empId})</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center border-t border-gray-400">
                    <p className="text-xs leading-tight uppercase">{orgData.positions[26].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[26].empId})</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    {/* Empty for alignment */}
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center border-t border-gray-400">
                    <p className="text-xs leading-tight uppercase">{orgData.positions[27].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[27].empId})</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    {/* Empty for alignment */}
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center border-t border-gray-400">
                    <p className="text-xs leading-tight uppercase">{orgData.positions[28].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[28].empId})</p>
                  </div>
                </div>
              </div>

              <div className="min-h-[130px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm w-[180px]">
                <div className="flex">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    <p className="text-xs font-bold uppercase">{orgData.positions[29].code}</p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[29].title}</p>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-xs leading-tight uppercase">{orgData.positions[29].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[29].empId})</p>
                  </div>
                </div>
                <div className="flex border-t border-gray-400">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    <p className="text-xs font-bold uppercase">{orgData.positions[30].code}</p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs leading-tight uppercase">{orgData.positions[30].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[30].empId})</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[160px] w-[180px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <div className="flex flex-col">
                    <p className="text-xs font-bold uppercase">{orgData.positions[31].code}</p>
                  </div>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[31].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[31].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[31].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[32].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[32].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[33].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[33].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">{orgData.positions[34].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[34].empId})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-8 border-2 border-black p-3 inline-block">
            <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">NOTE :</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-start">
                <span className="w-12 font-semibold">( )</span>
                <span>: CONCURRE</span>
              </div>
              <div className="flex items-start">
                <span className="w-12 font-semibold">**</span>
                <span>: ACTING</span>
              </div>
              <div className="flex items-start">
                <span className="w-12 font-semibold">( INC )</span>
                <span>: INCUMBENT</span>
              </div>
              <div className="flex items-start">
                <span className="w-12 font-semibold">TBR</span>
                <span>: TO BE RECRUIT</span>
              </div>
              <div className="flex items-start">
                <span className="w-12 font-semibold">TBD</span>
                <span>: TO BE DEVELOP</span>
              </div>
              <div className="flex items-start">
                <span className="w-12 font-semibold">COORD</span>
                <span>: COORDINATOR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturingCable;
