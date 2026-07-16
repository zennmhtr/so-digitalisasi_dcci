import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/print-styles.css';
import JobdescViewer from '../components/JobdescViewer';

const ManufacturBattery = () => {
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
      const response = await fetch(`/api/jobdescriptions`, {
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
      const response = await fetch(`/api/jobdescriptions?limit=200`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const result = await response.json();
        const allJobdesc = result.data || result;
        const foundJobdesc = allJobdesc.find((jd) => {
          const jdName = (jd.memberName || '').trim().toUpperCase();
          const jdNoPNK = (jd.memberNoPNK || '').trim();
          const itemName = (item.name || '').trim().toUpperCase();
          const itemEmpId = (item.empId || '').trim();
          if (itemEmpId && jdNoPNK && jdNoPNK === itemEmpId) return true;
          if (jdName && itemName && jdName === itemName) return true;
          if (jdName && itemName && (jdName.includes(itemName) || itemName.includes(jdName))) return true;
          return false;
        });
        if (foundJobdesc) setJobdescData(foundJobdesc);
      }
    } catch (error) {
      console.error('Error fetching job description:', error);
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
      title: "BATTERY PRODUCTION & PME",
      code: "PRD2.0",
      head: "DIONISIUS AUGUSTO**",
      empId: "23220105",
    },
    positions: [
      {
        id: "prd-2-1",
        code: "PRD2.1",
        title: "BATTERY PRODUCTION",
        name: "YEREMIA SOTYA",
        empId: "23230135",
        group: "ENGINEER",
      },
      {
        id: "prd-2-2",
        code: "PRD2.2",
        title: "BATTERY PRODUCTION",
        name: "ASEP AGUNG WIGUNA",
        empId: "23190805",
        group: "ENGINEER",
      },
      {
        id: "prd-2-3",
        code: "PRD2.3",
        title: "QUALITY ASSURANCE",
        name: "ADHITYA SATIAWA SURYADATA",
        empId: "23230091",
        group: "ENGINEER",
      },
      {
        id: "prd-3-0",
        code: "PRD3.0",
        title: "BATTERY PME",
        name: "TBR",
        empId: "-",
        group: "ENGINEER",
      },
      {
        id: "prd-2-1-1-1",
        code: "PRD2.1.1",
        title: "AUXILIARY BATTERY PRODUCT",
        name: "RIZAL GUNAWAN",
        empId: "23230055",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-1-2",
        code: "PRD2.1.1",
        title: "AUXILIARY BATTERY PRODUCT",
        name: "MUH. NANDER",
        empId: "23120193",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-1-3",
        code: "PRD2.1.1",
        title: "AUXILIARY BATTERY PRODUCT",
        name: "GANTIANTO",
        empId: "23120145",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-1-4",
        code: "PRD2.1.1",
        title: "AUXILIARY BATTERY PRODUCT",
        name: "TARMUDIN",
        empId: "23120184",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-1-5",
        code: "PRD2.1.1",
        title: "AUXILIARY BATTERY PRODUCT",
        name: "DEDI SUKMA",
        empId: "23110110",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-2-1",
        code: "PRD2.1.2",
        title: "BESS PRODUCT",
        name: "EKO DAMAR WAHYUDI",
        empId: "23230115",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-2-2",
        code: "PRD2.1.2",
        title: "BESS PRODUCT",
        name: "WIDODO",
        empId: "23120197",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-2-3",
        code: "PRD2.1.2",
        title: "BESS PRODUCT",
        name: "SUPRIYONO",
        empId: "23110119",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-2-4",
        code: "PRD2.1.2",
        title: "BESS PRODUCT",
        name: "PUTRI LESTARI",
        empId: "23240229",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-3-1",
        code: "PRD2.1.3",
        title: "BEV PRODUCT",
        name: "RIZIQ RIDWAN",
        empId: "23210079",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-3-2",
        code: "PRD2.1.3",
        title: "BEV PRODUCT",
        name: "AINA WAKHORIDAH",
        empId: "23230053",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-3-3",
        code: "PRD2.1.3",
        title: "BEV PRODUCT",
        name: "DENDI SETIAWAN",
        empId: "23230054",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-3-4",
        code: "PRD2.1.3",
        title: "BEV PRODUCT",
        name: "GALIH SOMAT",
        empId: "23230116",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-3-5",
        code: "PRD2.1.3",
        title: "BEV PRODUCT",
        name: "M. YUNUS ARIFAI",
        empId: "23120192",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-3-6",
        code: "PRD2.1.3",
        title: "BEV PRODUCT",
        name: "DODIK",
        empId: "23120161",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-1-3-7",
        code: "PRD2.1.3",
        title: "BEV PRODUCT",
        name: "NACA RODIANA HENDRAYANA",
        empId: "23120199",
        group: "TEAM MEMBER/TECHNICIAN",
      },
      {
        id: "prd-2-3-1",
        code: "PRD2.3.1",
        title: "QUALITY CHECK",
        name: "TBR",
        empId: "-",
        group: "TEAM MEMBER/TECHNICIAN",
      },
    ],
  };

  const [orgData, setOrgData] = useState(defaultData);

  const loadDataFromStorage = () => {
    try {
      const storageKey = 'so-bagian-manufactur-battery';
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
    const eventName = 'so-bagian-manufactur-battery-updated';
    const handleUpdate = (event) => {
      const newData = event.detail;
      if (newData?.header && newData?.positions) {
        setOrgData(newData);
        localStorage.setItem('so-bagian-manufactur-battery', JSON.stringify(newData));
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
      scale = 0.50;
    } else if (paperSize === 'A4' && orientation === 'portrait') {
      scale = 0.62;
    } else if (paperSize === 'A3' && orientation === 'landscape') {
      scale = 0.72;
    } else if (paperSize === 'A3' && orientation === 'portrait') {
      scale = 0.78;
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
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Main Dashboard
        </button>
        <div className="flex items-center space-x-2">
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

      {/* Manufacturing Battery Department Organization Chart */}
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
                  <h1 className="text-md ont-bold text-gray-800 mb-2">STRUKTUR ORGANISASI</h1>
                  <h2 className="text-l font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">({orgData.header.title})</h3>
                  <p className="text-s text-gray-500">Effective Date : 16 Maret 2026</p>
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
                          <p className="text-sm font-bold text-black underline leading-tight">DIKI WAHYUDI</p>
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
                          <p className="text-sm font-bold text-black underline leading-tight">BAMBANG WURYANTO</p>
                          <p className="text-sm text-black leading-tight">DIRECTOR</p>
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
                          <p className="text-sm font-bold text-black underline leading-tight">EKO MARYANTO</p>
                          <p className="text-sm text-black leading-tight">PRESIDENT DIRECTOR</p>
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
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">BOARD OF DIRECTOR</h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">DEPARTMENT HEAD</h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">SENIOR ENGINEER</h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">ENGINEER</h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">TEAM MEMBER/TECHNICIAN</h3>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-5 gap-2 relative org-grid" style={{ zIndex: 2 }}>

            {/* Kolom 1 - Board of Director */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[240px]">
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

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[240px]">
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

            {/* Kolom 3 - Senior Engineer */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[230px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton({ code: orgData.header.code, name: orgData.header.head, empId: orgData.header.empId })}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.header.title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.header.head}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.header.empId})</p>
                </div>
              </div>
            </div>

            {/* Kolom 4 - Engineer */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm w-[230px]">
                <div className="flex">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    {renderCodeButton(orgData.positions[0])}
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[0].title}</p>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[0].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[0].empId})</p>
                  </div>
                </div>
                <div className="flex border-t border-gray-400">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    {renderCodeButton(orgData.positions[1])}
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[1].name}</p>
                    <p className="text-xs leading-tight uppercase">({orgData.positions[1].empId})</p>
                  </div>
                </div>
              </div>

              <div className="min-h-[665px]"></div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[230px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[2])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[2].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[2].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[2].empId})</p>
                </div>
              </div>

              <div className="min-h-[2px]"></div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[230px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[3])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[3].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">({orgData.positions[3].empId})</p>
                </div>
              </div>
            </div>

            {/* Kolom 5 - Team Member/Technician */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[200px] w-[230px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[4])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[4].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[4].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[4].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[5].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[5].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[6].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[6].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[7].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[7].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[8].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[8].empId})</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[180px] w-[230px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[9])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[9].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[9].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[9].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[10].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[10].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[11].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[11].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[12].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[12].empId})</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[220px] w-[230px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[13])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[13].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[13].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[13].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[14].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[14].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[15].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[15].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[16].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[16].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[17].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[17].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[18].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[18].empId})</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">{orgData.positions[19].name}</p>
                  <p className="text-xs leading-tight uppercase">({orgData.positions[19].empId})</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[230px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[20])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">{orgData.positions[20].title}</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs font-bold leading-tight uppercase">({orgData.positions[20].empId})</p>
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

export default ManufacturBattery;