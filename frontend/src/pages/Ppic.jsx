import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/print-styles.css";
import JobdescViewer from "../components/JobdescViewer";

const Ppic = () => {
  const navigate = useNavigate();
  const [printSettings, setPrintSettings] = useState({
    paperSize: "A4",
    orientation: "landscape",
  });
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobdescData, setJobdescData] = useState(null);
  const [loadingJobdesc, setLoadingJobdesc] = useState(false);
  const [employeeJobdescStatus, setEmployeeJobdescStatus] = useState({});

  const checkAllEmployeeJobdescStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/jobdescriptions`, {
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
      const response = await fetch(`http://localhost:3001/api/jobdescriptions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const result = await response.json();
        const allJobdesc = result.data || result;

        const foundJobdesc = allJobdesc.find((jd) => {
          const jdNoPNK = (jd.memberNoPNK || '').trim();
          const itemEmpId = (item.empId || '').trim();
          if (!itemEmpId || itemEmpId === '-' || !jdNoPNK) return false;
          if (jdNoPNK !== itemEmpId) return false;
          if (item.departmentOid) {
            const jdDeptOid = (jd.department?.$oid || '').trim();
            return jdDeptOid === item.departmentOid;
          }

          return true;
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
      title: "PPIC",
      id: "ppic-1",
      code: "PPIC1.0",
      head: "DIKI WAHYUDI*",
      empId: "23060056",
      departmentOid: "690c195501e848a06615ddbf",
    },
    positions: [
      {
        id: "ppic1-1",
        code: "PPIC1.1",
        title: "PPC CONTROLCABLE",
        name: "ADE AKHMAD FAUZI*",
        empId: "23090093",
      },
      {
        id: "ppic1-2",
        code: "PPIC1.2",
        title: "BATTERY & AHM OES",
        name: "BUCHORI**",
        empId: "23120159",
      },
      {
        id: "ppic1-3",
        code: "PPIC1.3",
        title: "WHS CONTROLCABLE",
        name: "ANANG SUTAMTOMO**",
        empId: "23080082",
      },
      {
        id: "ppic1-3-1",
        code: "PPIC1.3.1",
        title: "CONTROLCABLE",
        name: "SETIYONO",
        empId: "23090090",
      },
      {
        id: "ppic1-1-1",
        code: "PPIC1.1.1",
        title: "PROD PLAN",
        name: "ERLI SULIANTO",
        empId: "23070073",
      },
      {
        id: "ppic1-1-2",
        code: "PPIC1.1.2",
        title: "DN/MANIFEST",
        name: "EFRAIN TAMBUNAN",
        empId: "23110111",
      },
      {
        id: "ppic1-1-3",
        code: "PPIC1.1.3",
        title: "DELIVERY",
        name: "SUDARMANTO",
        empId: "23120151",
      },
      {
        id: "ppic1-1-4",
        code: "PPIC1.1.4",
        title: "DELIVERY",
        name: "OPERATOR",
        empId: "-",
      },
      {
        id: "ppic1-2-1",
        code: "PPIC1.2.1",
        title: "BATTERY",
        name: "SRI NATIN",
        empId: "231202130",
      },
      {
        id: "ppic1-2-2",
        code: "PPIC1.2.2",
        title: "BATTERY STAFF",
        name: "M. HAMAM MUCHLISIN",
        empId: "23120174",
      },
      {
        id: "ppic1-3-2",
        code: "PPIC1.3.2",
        title: "SUPPLIER CONTROL",
        name: "SULASTRI",
        empId: "23120190",
      },
      {
        id: "ppic1-3-3",
        code: "PPIC1.3.3",
        title: "MRP",
        name: "LAILA FITRIYAH",
        empId: "23120196",
      },
      {
        id: "ppic1-3-4",
        code: "PPIC1.3.4",
        title: "RM & OHP",
        name: "SUPRIYANTO",
        empId: "23120153",
      },
      {
        id: "ppic1-3-5",
        code: "PPIC1.3.5",
        title: "HASIL PRODUKGAS",
        name: "RAGIL PAMUGKAS",
        empId: "23120154",
      },
      {
        id: "ppic1-3-6",
        code: "PPIC1.3.6",
        title: "SUPPLY",
        name: "OPERATOR (2)",
        empId: "-",
      },
    ],
  };

  const [orgData, setOrgData] = useState(defaultData);

  const loadDataFromStorage = () => {
    try {
      const storageKey = 'so-bagian-ppic';
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.header && parsed.positions) {
          parsed.header.departmentOid = defaultData.header.departmentOid;
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
    const eventName = 'so-bagian-ppic-updated';
    const handleUpdate = (event) => {
      const newData = event.detail;
      if (newData?.header && newData?.positions) {
        setOrgData(newData);
        localStorage.setItem('so-bagian-ppic', JSON.stringify(newData));
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
      scale = 0.55;
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
          onClick={() => navigate("/")}
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
                onChange={(e) =>
                  setPrintSettings({
                    ...printSettings,
                    paperSize: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  setPrintSettings({
                    ...printSettings,
                    orientation: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              <strong>Preview:</strong> {printSettings.paperSize} -{" "}
              {printSettings.orientation === "landscape"
                ? "Landscape"
                : "Portrait"}
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
              <div
                className="w-32 flex items-center justify-center p-4 border-2 border-black"
                style={{ height: "160px" }}
              >
                <img
                  src="/logo/dcci.png"
                  alt="Dharma Group Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div
                className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                style={{ height: "160px" }}
              >
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    STRUKTUR ORGANISASI
                  </h1>
                  <h2 className="text-xl font-semibold text-gray-700 mb-1">
                    PT DHARMA CONTROLCABLE INDONESIA
                  </h2>
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">
                    (PPC & WAREHOUSE DEPARTMENT)
                  </h3>
                  <p className="text-md text-gray-500">
                    Effective Date : 16 Maret 2026
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex space-x-1">
                  <div className="text-center">
                    <div className="w-60 h-40 border border-black bg-white">
                      <div className="p-2 border-b border-black bg-white">
                        <p className="text-sm font-bold text-black">
                          Prepared by :
                        </p>
                      </div>
                      <div className="p-3 flex flex-col justify-end h-32">
                        <div className="h-16"></div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-black underline leading-tight">
                            DIKI WAHYUDI
                          </p>
                          <p className="text-sm text-black leading-tight">
                            DEPARTMENT HEAD
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-60 h-40 border border-black bg-white">
                      <div className="p-2 border-b border-black bg-white">
                        <p className="text-sm font-bold text-black">
                          Checked by :
                        </p>
                      </div>
                      <div className="p-3 flex flex-col justify-end h-32">
                        <div className="h-16"></div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-black underline leading-tight">
                            DIKI WAHYUDI
                          </p>
                          <p className="text-sm text-black leading-tight">
                            HRGAIT DEPT. HEAD
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-60 h-40 border border-black bg-white">
                      <div className="p-2 border-b border-black bg-white">
                        <p className="text-sm font-bold text-black">
                          Approved by :
                        </p>
                      </div>
                      <div className="p-3 flex flex-col justify-end h-32">
                        <div className="h-16"></div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-black underline leading-tight">
                            EKO MARYANTO
                          </p>
                          <p className="text-sm text-black leading-tight">
                            PRESIDENT DIRECTOR
                          </p>
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
                <h3 className="font-bold text-xs text-black">
                  BOARD OF DIRECTOR
                </h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">
                  DEPARTMENT HEAD
                </h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">
                  UNIT HEAD/STAFF
                </h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">GROUP HEAD</h3>
              </div>
              <div className="bg-blue-300 p-2 rounded text-center border border-black">
                <h3 className="font-bold text-xs text-black">MEMBER</h3>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div
            className="grid grid-cols-6 gap-2 relative org-grid"
            style={{ zIndex: 2 }}
          >
            {/* Kolom 1 - Board of Director */}
            <div className="space-y-3 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold">BOD1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">
                    PRESIDENT DIRECTOR
                  </p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">EKO MARYANTO</p>
                  <p className="text-xs leading-tight">(23200235)</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold">BOD1.1</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">
                    DIRECTOR
                  </p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">BAMBANG WURYANTO</p>
                  <p className="text-xs leading-tight">(23200038)</p>
                </div>
              </div>
            </div>

            {/* Kolom 2 - Department Head */}
            <div className="space-y-3 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton({ code: orgData.header.code, name: orgData.header.head, empId: orgData.header.empId, departmentOid: orgData.header.departmentOid })}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">
                    {orgData.header.title}
                  </p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">{orgData.header.head}</p>
                  <p className="text-xs leading-tight">{orgData.header.empId}</p>
                </div>
              </div>
            </div>

            {/* Kolom 3 - Section Head */}
            <div className="space-y-3 flex flex-col items-center">
              <div className="min-h-[20px]"></div>
            </div>

            {/* Kolom 4 - Unit Head/Staff */}
            <div className="space-y-3 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[0])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">
                    {orgData.positions[0].title}
                  </p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">{orgData.positions[0].name}</p>
                  <p className="text-xs leading-tight">{orgData.positions[0].empId}</p>
                </div>
              </div>

              <div className="min-h-[200px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[1])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">
                    {orgData.positions[1].title}
                  </p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">{orgData.positions[1].name}</p>
                  <p className="text-xs leading-tight">{orgData.positions[1].empId}</p>
                </div>
              </div>

              <div className="min-h-[40px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[2])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">
                    {orgData.positions[2].title}
                  </p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">{orgData.positions[2].name}</p>
                  <p className="text-xs leading-tight">{orgData.positions[2].empId}</p>
                </div>
              </div>
            </div>

            {/* Kolom 5 - Group Head */}
            <div className="space-y-3 flex flex-col items-center">
              <div className="min-h-[475px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[3])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">
                    {orgData.positions[3].title}
                  </p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">{orgData.positions[3].name}</p>
                  <p className="text-xs leading-tight">{orgData.positions[3].empId}</p>
                </div>
              </div>
            </div>

            {/* Kolom 6 - Member */}
            <div className="space-y-3 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[4])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">
                    {orgData.positions[4].title}
                  </p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">{orgData.positions[4].name}</p>
                  <p className="text-xs leading-tight">{orgData.positions[4].empId}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[5])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">
                    {orgData.positions[5].title}
                  </p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">{orgData.positions[5].name}</p>
                  <p className="text-xs leading-tight">{orgData.positions[5].empId}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[190px]">
                <div className="flex flex-col h-full">
                  <div className="flex flex-1">
                    <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                      {renderCodeButton(orgData.positions[6])}
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <div className="bg-gray-100 p-1 mb-1">
                        <p className="text-xs font-semibold leading-tight">
                          {orgData.positions[6].title}
                        </p>
                      </div>
                      <hr className="my-1 border-gray-300" />
                      <p className="text-xs leading-tight">{orgData.positions[6].name}</p>
                      <p className="text-xs leading-tight">{orgData.positions[6].empId}</p>
                    </div>
                  </div>
                  <div className="flex flex-1">
                    <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                      {renderCodeButton(orgData.positions[7])}
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <hr className="my-1 border-gray-300" />
                      <p className="text-xs leading-tight">{orgData.positions[7].name}</p>
                      <p className="text-xs leading-tight">{orgData.positions[7].empId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[190px]">
                <div className="flex flex-col h-full">
                  <div className="flex flex-1">
                    <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                      {renderCodeButton(orgData.positions[8])}
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <div className="bg-gray-100 p-1 mb-1">
                        <p className="text-xs font-semibold leading-tight">
                          {orgData.positions[8].title}
                        </p>
                      </div>
                      <hr className="my-1 border-gray-300" />
                      <p className="text-xs leading-tight">{orgData.positions[8].name}</p>
                      <p className="text-xs leading-tight">{orgData.positions[8].empId}</p>
                    </div>
                  </div>
                  <div className="flex flex-1">
                    <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                      {renderCodeButton(orgData.positions[9])}
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <hr className="my-1 border-gray-300" />
                      <p className="text-xs leading-tight">
                        {orgData.positions[9].name}
                      </p>
                      <p className="text-xs leading-tight">{orgData.positions[9].empId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[10])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">
                    {orgData.positions[10].title}
                  </p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">{orgData.positions[10].name}</p>
                  <p className="text-xs leading-tight">{orgData.positions[10].empId}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[11])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">
                    {orgData.positions[11].title}
                  </p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">{orgData.positions[11].name}</p>
                  <p className="text-xs leading-tight">{orgData.positions[11].empId}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[190px]">
                <div className="flex flex-col h-full">
                  <div className="flex flex-1">
                    <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                      {renderCodeButton(orgData.positions[12])}
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <div className="bg-gray-100 p-1 mb-1">
                        <p className="text-xs font-semibold leading-tight">
                          {orgData.positions[12].title}
                        </p>
                      </div>
                      <hr className="my-1 border-gray-300" />
                      <p className="text-xs leading-tight">{orgData.positions[12].name}</p>
                      <p className="text-xs leading-tight">{orgData.positions[12].empId}</p>
                    </div>
                  </div>
                  <div className="flex flex-1">
                    <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                      {renderCodeButton(orgData.positions[13])}
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <hr className="my-1 border-gray-300" />
                      <p className="text-xs leading-tight">{orgData.positions[13].name}</p>
                      <p className="text-xs leading-tight">{orgData.positions[13].empId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[190px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  {renderCodeButton(orgData.positions[14])}
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">
                    {orgData.positions[14].title}
                  </p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">{orgData.positions[14].name}</p>
                  <p className="text-xs leading-tight">{orgData.positions[14].empId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-8 border-2 border-black p-3 inline-block">
            <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">
              NOTE :
            </h3>
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

export default Ppic;