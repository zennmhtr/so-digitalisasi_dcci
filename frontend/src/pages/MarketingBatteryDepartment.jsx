import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/print-styles.css';

const MarketingBatteryDepartment = () => {
  const navigate = useNavigate();
  const [printSettings, setPrintSettings] = useState({
    paperSize: 'A4',
    orientation: 'landscape'
  });
  const [showPrintOptions, setShowPrintOptions] = useState(false);

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
      scale = 0.98;
    } else if (paperSize === 'A4' && orientation === 'portrait') {
      scale = 0.68;
    } else if (paperSize === 'A3' && orientation === 'landscape') {
      scale = 1.40;
    } else if (paperSize === 'A3' && orientation === 'portrait') {
      scale = 1;
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

      {/* Marketing Battery Department Organization Chart */}
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
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">(MARKETING BATTERY DEPARTMENT)</h3>
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
                          <p className="text-sm font-bold text-black underline leading-tight">RENDRA PRAMONO</p>
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
          <div className="mb-6 relative" style={{ zIndex: 2 }}>
            <div className="grid grid-cols-4 gap-2 mb-4">
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
                <h3 className="font-bold text-xs text-black">STAFF/SPECIALIST</h3>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-4 gap-2 relative org-grid" style={{ zIndex: 2 }}>

            {/* Kolom 1 - Board of Director */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[280px]">
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

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[280px]">
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

            {/* Kolom 2 - Department Head */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[280px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">MKT2.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">MARKETING</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">RENDRA PRAMONO</p>
                  <p className="text-xs leading-tight uppercase">(23200067)</p>
                </div>
              </div>
            </div>

            {/* Kolom 3 - Section Head */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[280px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">QAC2.1.1</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">AUX & POWER BATTERY MARKETING</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">CHRYSNA YULIAWAN **</p>
                  <p className="text-xs leading-tight uppercase">(23240177)</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[280px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">QAC2.1.1</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">ESS MARKETING</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">FERDINAND STEVANUS A. **</p>
                  <p className="text-xs leading-tight uppercase">(23220049)</p>
                </div>
              </div>
            </div>

            {/* Kolom 4 - Staff/Specialist (Empty for now) */}
            <div className="space-y-4 flex flex-col items-center">
              {/* Can be filled with staff/specialists if needed */}
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

export default MarketingBatteryDepartment;