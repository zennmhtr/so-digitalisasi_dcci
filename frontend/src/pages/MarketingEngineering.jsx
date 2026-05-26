import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/print-styles.css';
import JobdescViewer from '../components/JobdescViewer';

const MarketingEngineering = () => {
  const navigate = useNavigate();
  const [printSettings, setPrintSettings] = useState({
    paperSize: 'A4',
    orientation: 'landscape'
  });
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobdescData, setJobdescData] = useState(null);
  const [loadingJobdesc, setLoadingJobdesc] = useState(false);
  const [employeeJobdescStatus, setEmployeeJobdescStatus] = useState({});

  const checkAllEmployeeJobdescStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/jobdescriptions?limit=200`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const result = await response.json();
        const allJobdesc = result.data || result;
        const statusMap = {};
        allJobdesc.forEach(jd => {
          const jdNoPNK = (jd.memberNoPNK || '').trim();
          const jdName = (jd.memberName || '').trim().toUpperCase();
          if (jdNoPNK) statusMap[jdNoPNK] = true;
          if (jdName) statusMap[jdName] = true;
        });
        setEmployeeJobdescStatus(statusMap);
      }
    } catch (error) {
      console.error('Error fetching employee jobdesc status:', error);
    }
  };

  useEffect(() => { checkAllEmployeeJobdescStatus(); }, []);

  const onCodeClick = async (item) => {
  setSelectedJob(item);
  setShowJobModal(true);
  setLoadingJobdesc(true);
  setJobdescData(null);

  try {
    const response = await fetch(`http://localhost:3001/api/jobdescriptions?limit=200`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (response.ok) {
      const result = await response.json();
      const allJobdesc = result.data || result;
      const codeTitleKeywords = {
        "ENG1.1": ["PRODUCT", "QUALITY ENGINEERING", "ENG1.1"],
        "ENG1.2": ["PROCESS ENGINEERING", "ENG1.2"],
        "ENG1.3": ["NEW BUSINESS DEV", "BESS", "ENG1.3"],
        "MKT1.1": ["SALES", "MARKETING CONTROLCABLE", "MKT1.1"],
        "MKT1.2": ["MKT1.2"],
      };

      // Normalisasi: hapus *, **, spasi berlebih
      const normalize = (str) =>
        (str || "").trim().toUpperCase().replace(/\*+/g, "").replace(/\s+/g, " ").trim();

      // Normalisasi empId: hapus semua spasi
      const normalizeId = (str) =>
        (str || "").replace(/\s+/g, "").trim();

      // Split format gabungan "A / B"
      const splitCombined = (str) =>
        (str || "").split(/[\/,]/).map(p => p.trim()).filter(Boolean);

      const containsId = (haystack, needle) => {
        if (!haystack || !needle) return false;
        const needleClean = normalizeId(needle);
        return splitCombined(haystack).some(p => normalizeId(p) === needleClean);
      };

      const itemCode = (item.code || "").trim().toUpperCase();
      const itemEmpId = (item.empId || "").trim();
      const itemName = normalize(item.name);

      const foundJobdesc = allJobdesc.find((jd) => {
        const jdNoPNK = (jd.memberNoPNK || "").trim();
        const jdName = normalize(jd.memberName);
        const jdPositionTitle = (jd.positionTitle || "").toUpperCase();

        // Cek empId match (termasuk format gabungan & spasi)
        const empIdMatch =
          itemEmpId &&
          jdNoPNK &&
          (normalizeId(jdNoPNK) === normalizeId(itemEmpId) ||
            containsId(jdNoPNK, itemEmpId));

        // Cek name match
        const nameMatch =
          itemName &&
          jdName &&
          (jdName === itemName ||
            splitCombined(jd.memberName).some(p => normalize(p) === itemName));

        if (!empIdMatch && !nameMatch) return false;

        // Jika ada code mapping, gunakan keyword positionTitle sebagai pembeda
        const keywords = codeTitleKeywords[itemCode];
        if (keywords && keywords.length > 0) {
          const titleMatch = keywords.some(kw => jdPositionTitle.includes(kw));
          if (!titleMatch) {
            console.log(`⏭️ Skip: empId/name match tapi positionTitle tidak cocok untuk ${itemCode}`, jdPositionTitle);
            return false;
          }
          console.log(`✅ MATCH by code keyword [${itemCode}]:`, jdPositionTitle);
          return true;
        }

        // Fallback: match by empId atau name saja
        console.log(`✅ MATCH fallback:`, jd.memberName, jdNoPNK);
        return true;
      });

      if (foundJobdesc) {
        console.log("✅ Found:", foundJobdesc.positionTitle);
        setJobdescData(foundJobdesc);
      } else {
        console.log("❌ Not found for:", item.name, item.code);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    setLoadingJobdesc(false);
  }
};

  const renderCodeButton = (person) => {
    if (!person || !person.empId) {
      return <p className="text-xs font-bold uppercase">{person?.code || ''}</p>;
    }
    const empId = (person.empId || '').trim();
    const personName = (person.name || '').trim().toUpperCase();
    const hasJobdesc = employeeJobdescStatus[empId] || employeeJobdescStatus[personName];
    const buttonColor = hasJobdesc ? 'text-blue-600 hover:bg-blue-50' : 'text-red-600 hover:bg-red-50';
    return (
      <button
        className={`text-xs font-bold hover:underline focus:outline-none uppercase px-1 py-0.5 rounded transition-colors print:hidden ${buttonColor}`}
        onClick={(e) => { e.stopPropagation(); onCodeClick(person); }}
        title={hasJobdesc ? 'Klik untuk melihat job description' : 'Belum memiliki job description'}
      >
        {person.code}
      </button>
    );
  };


  const defaultData = {
    header: {
      title: "MARKETING ENGINEERING",
      code: "MKT1.0",
      head: "ANDREAS AGUNG S.",
      empId: "23040119",
    },
    positions: [
      {
        id: "mkt1-1",
        code: "MKT1.1",
        title: "SALES & MARKETING CONTROLCABLE",
        name: "SAVITRI OCTAVIANI",
        empId: "23130254",
      },
      {
        id: "eng1-0",
        code: "ENG1.0",
        title: "ENGINEERING CONTROLCABLE",
        name: "SUGIYARTO",
        empId: "23060041",
      },
      {
        id: "mkt1-1-1",
        code: "MKT1.1.1",
        title: "SALES & MARKETING CONTROLCABLE",
        name: "RIKA TRI HARMELIA",
        empId: "23110101",
      },
      {
        id: "mkt1-1-2",
        code: "MKT1.1.2",
        title: "SALES & MARKETING CONTROLCABLE",
        name: "KHANSA Z.H",
        empId: "23230110",
      },
      {
        id: "mkt1-1-3",
        code: "MKT1.1.3",
        title: "CUSTOMER REPRESENTATIVE",
        name: "SUMIYARTO",
        empId: "23030015",
      },
      {
        id: "eng1-1",
        code: "ENG1.1",
        title: "PRODUCT & QUALITY ENGINEERING CABLE",
        name: "NUR DWI WAHYONO",
        empId: "23120160",
      },
      {
        id: "eng1-1",
        code: "ENG1.1",
        title: "PRODUCT & QUALITY ENGINEERING CABLE",
        name: "ALIF PRIATNA",
        empId: "23190773",
      },
      {
        id: "eng1-1",
        code: "ENG1.1",
        title: "PRODUCT & QUALITY ENGINEERING CABLE",
        name: "ANNISA SEPTIYANING CHOIR*",
        empId: "23240228",
      },
      {
        id: "eng1-2",
        code: "ENG1.2",
        title: "PROCESS ENGINEERING CABLE",
        name: "MUHAMMAD SYARIFUDIN",
        empId: "23190727",
      },
      {
        id: "eng1-2",
        code: "ENG1.2",
        title: "PROCESS ENGINEERING CABLE",
        name: "AHMAD JAELANI SIDIK*",
        empId: "23240227",
      },
      {
        id: "eng1-2",
        code: "ENG1.2",
        title: "PROCESS ENGINEERING CABLE",
        name: "DEDI SETIADI",
        empId: "23120143",

      },
      {
        id: "eng1-3",
        code: "ENG1.3",
        title: "NEW BUSINESS DEVELOPMENT",
        name: "ANNISA SETIYANING CHOIR*",
        empId: "23240228",
        departmentOid: "690c188001e848a06615dd93",
      },
      {
        id: "eng1-3",
        code: "ENG1.3",
        title: "NEW BUSINESS DEVELOPMENT",
        name: "AHMAD JAELANI SIDIK*",
        empId: "23240227",
      },
    ],
  };

  const [orgData, setOrgData] = useState(defaultData);

  const loadDataFromStorage = () => {
    try {
      const storageKey = 'so-bagian-marketing-engineering';
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
    const eventName = 'so-bagian-marketing-engineering-updated';
    const handleUpdate = (event) => {
      const newData = event.detail;
      if (newData?.header && newData?.positions) {
        setOrgData(newData);
        localStorage.setItem('so-bagian-marketing-engineering', JSON.stringify(newData));
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
      scale = 0.53;
    } else if (paperSize === 'A4' && orientation === 'portrait') {
      scale = 0.62;
    } else if (paperSize === 'A3' && orientation === 'landscape') {
      scale = 0.75;
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

      {/* HRGA-IT Department Organization Chart */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black print-container print:overflow-visible print:rounded-none print:shadow-none">
        <div className="min-w-[1000px] relative p-4 print:min-w-0 print:p-0">

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
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">(MARKETING & ENGINEERING CABLE DEPARTMENT)</h3>
                  <p className="text-md text-gray-500">Effective Date : 16 Maret 2026</p>
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
                          <p className="text-sm font-bold text-black underline leading-tight">ANDREAS AGUNG S.</p>
                          <p className="text-sm text-black leading-tight">DEPARTMENT HEAD</p>
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
          <div className="mb-6 relative print:mb-4" style={{ zIndex: 2 }}>
            <div className="grid grid-cols-4 gap-4 mb-4 print:gap-4 print:mb-4">
              <div className="bg-blue-300 p-3 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">BOARD OF DIRECTOR</h3>
              </div>
              <div className="bg-blue-300 p-3 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">DEPARTMENT HEAD</h3>
              </div>
              <div className="bg-blue-300 p-3 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
              </div>
              <div className="bg-blue-300 p-3 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">STAFF</h3>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-4 gap-4 relative org-grid" style={{ zIndex: 2 }}>

            {/* Kolom 1 - Board of Director */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                  <p className="text-sm font-bold">BOD1.0</p>
                </div>
                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                  <p className="text-sm font-semibold mb-2 leading-tight whitespace-nowrap">PRESIDENT DIRECTOR</p>
                  <hr className="my-2 border-gray-300" />
                  <p className="text-sm leading-tight">EKO MARYANTO</p>
                  <p className="text-sm leading-tight">(23200235)</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                  <p className="text-sm font-bold">BOD1.1</p>
                </div>
                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                  <p className="text-sm font-semibold mb-2 leading-tight whitespace-nowrap">DIRECTOR</p>
                  <hr className="my-2 border-gray-300" />
                  <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                  <p className="text-sm leading-tight">(23200038)</p>
                </div>
              </div>
            </div>

            {/* Kolom 2 - Department Head */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                  {renderCodeButton({ code: orgData.header.code, name: orgData.header.head, empId: orgData.header.empId })}
                </div>
                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                  <p className="text-sm font-semibold mb-2 leading-tight whitespace-nowrap">{orgData.header.title}</p>
                  <hr className="my-2 border-gray-300" />
                  <p className="text-sm leading-tight">{orgData.header.head}</p>
                  <p className="text-sm leading-tight">({orgData.header.empId})</p>
                </div>
              </div>
            </div>

            {/* Kolom 3 - Section Head */}
            <div className="space-y-4 flex flex-col items-center">
              {/* Sales & Marketing Control Cable */}
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[0])}
                </div>
                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                  <p className="text-sm font-semibold mb-2 leading-tight">{orgData.positions[0].title}</p>
                  <hr className="my-2 border-gray-300" />
                  <p className="text-sm leading-tight">{orgData.positions[0].name}</p>
                  <p className="text-sm leading-tight">({orgData.positions[0].empId})</p>
                </div>
              </div>

              {/* Spacer to align ENG1.0 with ENG1.1 */}
              <div className="h-[185px]"></div>

              {/* Engineering Control Cable */}
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[1])}
                </div>
                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                  <p className="text-sm font-semibold mb-2 leading-tight">{orgData.positions[1].title}</p>
                  <hr className="my-2 border-gray-300" />
                  <p className="text-sm leading-tight">{orgData.positions[1].name}</p>
                  <p className="text-sm leading-tight">({orgData.positions[1].empId})</p>
                </div>
              </div>
            </div>

            {/* Kolom 4 - Staff Level */}
            <div className="space-y-4 flex flex-col items-center staff-cards">
              {/* Sales & Marketing Control Cable Staff */}
              <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[180px] w-[280px]">
                <div className="flex flex-col h-full">
                  <div className="flex border-b border-gray-400">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20">
                      <p className="text-sm font-bold"></p>
                    </div>
                    <div className="p-2 flex-1 text-center bg-gray-100">
                      <p className="text-sm font-semibold leading-tight">{orgData.positions[2]?.title}</p>
                    </div>
                  </div>
                  {orgData.positions.slice(2, 4).map((staff, i) => (
                    <div key={i} className={`flex flex-1 ${i < 2 ? 'border-b border-gray-300' : ''}`}>
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton(staff)}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <p className="text-sm leading-tight">{staff?.name}</p>
                        <p className="text-sm leading-tight">({staff?.empId})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Representative */}
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[4])}
                </div>
                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                  <p className="text-sm font-semibold mb-2 leading-tight whitespace-nowrap">{orgData.positions[4]?.title}</p>
                  <hr className="my-2 border-gray-300" />
                  <p className="text-sm leading-tight">{orgData.positions[4]?.name}</p>
                  <p className="text-sm leading-tight">({orgData.positions[4]?.empId})</p>
                </div>
              </div>

              {/* Product & Quality Engineering Cable */}
              <div className="bg-white border border-gray-400 rounded shadow-sm w-[280px] min-h-[160px]">
                <div className="flex">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    {renderCodeButton(orgData.positions[5])}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 p-2 text-center border-b border-gray-400">
                      <p className="text-sm font-bold">{orgData.positions[5]?.title}</p>
                    </div>
                    <div className="p-2 space-y-2">
                      <div className="text-center">
                        <p className="text-sm">{orgData.positions[6]?.name}</p>
                        <p className="text-sm">({orgData.positions[6]?.empId})</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm">{orgData.positions[7]?.name}</p>
                        <p className="text-sm">({orgData.positions[7]?.empId})</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm">{orgData.positions[8]?.name}</p>
                        <p className="text-sm">({orgData.positions[8]?.empId})</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Process Engineering Cable */}
              <div className="bg-white border border-gray-400 rounded shadow-sm w-[280px] min-h-[160px]">
                <div className="flex">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    {renderCodeButton(orgData.positions[9])}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 p-2 text-center border-b border-gray-400">
                      <p className="text-sm font-bold">{orgData.positions[9]?.title}</p>
                    </div>
                    <div className="p-2 space-y-2">
                      <div className="text-center">
                        <p className="text-sm">{orgData.positions[10]?.name}</p>
                        <p className="text-sm">({orgData.positions[10]?.empId})</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm">{orgData.positions[11]?.name}</p>
                        <p className="text-sm">({orgData.positions[11]?.empId})</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm">{orgData.positions[12]?.name}</p>
                        <p className="text-sm">({orgData.positions[12]?.empId})</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Business Development */}
              <div className="bg-white border border-gray-400 rounded shadow-sm w-[280px] min-h-[140px]">
                <div className="flex">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    {renderCodeButton(orgData.positions[11])}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 p-2 text-center border-b border-gray-400">
                      <p className="text-sm font-bold">{orgData.positions[11]?.title}</p>
                    </div>
                    <div className="p-2 space-y-2">
                      <div className="text-center">
                        <p className="text-sm">{orgData.positions[11]?.name}</p>
                        <p className="text-sm">({orgData.positions[11]?.empId})</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm">{orgData.positions[12]?.name}</p>
                        <p className="text-sm">({orgData.positions[12]?.empId})</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Notes Section */}
          <div className="mt-8 border-2 border-black p-3 inline-block print:mt-6 print:p-3">
            <h3 className="text-sm font-bold mb-2 border-b border-black pb-1 print:text-sm print:mb-2">NOTE :</h3>
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

      {showJobModal && selectedJob && (
        <>
          {loadingJobdesc ? (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-lg w-[520px] max-w-[95%]">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading job description...</span>
                </div>
              </div>
            </div>
          ) : jobdescData ? (
            <JobdescViewer
              user={{
                name: selectedJob.name,
                noPNK: selectedJob.empId,
                department: { name: jobdescData.division || 'N/A' },
              }}
              jobdesc={jobdescData}
              viewOnly={true}
              onClose={() => { setShowJobModal(false); setJobdescData(null); setSelectedJob(null); }}
            />
          ) : (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-lg w-[520px] max-w-[95%]">
                <p className="font-semibold mb-2">Jobdesk Tidak Ditemukan</p>
                <p className="text-sm text-gray-600">Tidak ada data jobdesk untuk {selectedJob?.name}</p>
                <button
                  onClick={() => { setShowJobModal(false); setSelectedJob(null); }}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MarketingEngineering;