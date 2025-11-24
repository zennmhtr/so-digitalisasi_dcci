import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/print-styles.css';

const HrgaIt = () => {
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
    const margin = paperSize === 'A3' ? '10mm' : '8mm';
    
    printStyle.innerHTML = `
      @media print {
        @page {
          size: ${paperSize} ${orientation};
          margin: ${margin};
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
                onChange={(e) => setPrintSettings({...printSettings, paperSize: e.target.value})}
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
                onChange={(e) => setPrintSettings({...printSettings, orientation: e.target.value})}
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
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">(HRGA & IT DEPARTMENT)</h3>
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
                          <p className="text-sm font-bold text-black underline leading-tight">DIKI WAHYUDI</p>
                          <p className="text-sm text-black leading-tight">DEPARTEMENT HEAD</p>
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
                          <p className="text-sm text-black leading-tight">HRDGA&IT DEPT. HEAD</p>
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
                <h3 className="font-bold text-xs text-black">STAFF LEVEL</h3>
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
                  <p className="text-sm font-semibold mb-2 leading-tight whitespace-nowrap">DIRECTOR</p>
                  <hr className="my-2 border-gray-300" />
                  <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                  <p className="text-sm leading-tight">(23200038)</p>
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
            <div className="space-y-4">
              <div className="min-h-[20px]"></div>
            </div>

            {/* Kolom 3 - Section Head */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[200px] w-[300px]">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex border-b border-gray-400">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                      <p className="text-sm font-bold">HRD1.0</p>
                    </div>
                    <div className="p-2 flex-1 text-center bg-gray-100">
                      <p className="text-sm font-semibold leading-tight whitespace-nowrap">HRDGA & IT</p>
                    </div>
                  </div>
                  
                  {/* Staff dalam Section Head */}
                  <div className="flex border-b border-gray-300 flex-1">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                      <p className="text-sm font-bold"></p>
                    </div>
                    <div className="p-3 flex-1 text-center flex flex-col justify-center">
                      <p className="text-sm font-semibold leading-tight">DIKI WAHYUDI *</p>
                      <p className="text-sm leading-tight">(23060056)</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-1 border-b-0">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                      <p className="text-sm font-bold">HRD2.0</p>
                    </div>
                    <div className="p-3 flex-1 text-center flex flex-col justify-center">
                      <p className="text-sm font-semibold leading-tight">VERONICA HANI M. **</p>
                      <p className="text-sm leading-tight">(23240206)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom 4 - Staff Level */}
            <div className="space-y-4 flex flex-col items-center staff-cards">
              {/* HRD Section */}
              <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[350px]">
                <div className="flex flex-col h-full">
                  <div className="flex border-b border-gray-400">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                      <p className="text-sm font-bold"></p>
                    </div>
                    <div className="p-2 flex-1 text-center bg-gray-100">
                      <p className="text-sm font-semibold leading-tight whitespace-nowrap">HRD</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-1 border-b-0">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                      <p className="text-sm font-bold">HRD1.1</p>
                    </div>
                    <div className="p-3 flex-1 text-center flex flex-col justify-center">
                      <p className="text-sm font-semibold leading-tight">THARISA ARRAHMA R.</p>
                      <p className="text-sm leading-tight">(23230072)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* General Affair & Industrial Relations Section */}
              <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[280px] w-[350px]">
                <div className="flex flex-col h-full">
                  <div className="flex border-b border-gray-400">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                      <p className="text-sm font-bold"></p>
                    </div>
                    <div className="p-2 flex-1 text-center bg-gray-100">
                      <p className="text-sm font-semibold leading-tight">GENERAL AFFAIR & IND. RELATIONS</p>
                    </div>
                  </div>
                  
                  {[
                    { id: "GA1.1", name: "SUPRIADI", nip: "(23120131)" },
                    { id: "GA1.2", name: "PARTINI LUPI", nip: "(23110116)" },
                    { id: "GA1.3", name: "MIMBARYANTO", nip: "(23120158)" },
                  ].map((staff, i) => (
                    <div 
                      key={i} 
                      className={`flex border-b border-gray-300 flex-1 ${i === 2 ? 'border-b-0' : ''}`}
                    >
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">{staff.id}</p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <p className="text-sm font-semibold leading-tight">{staff.name}</p>
                        <p className="text-sm leading-tight">{staff.nip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Information Technology Section */}
              <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[180px] w-[350px]">
                <div className="flex flex-col h-full">
                  <div className="flex border-b border-gray-400">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                      <p className="text-sm font-bold"></p>
                    </div>
                    <div className="p-2 flex-1 text-center bg-gray-100">
                      <p className="text-sm font-semibold leading-tight">INFORMATION TECHNOLOGY</p>
                    </div>
                  </div>
                  
                  {[
                    { id: "IT1.1", name: "ROZIQIN", nip: "(23070074)" },
                    { id: "IT1.2", name: "FARHANSYAH A.L", nip: "(23220040)" },
                  ].map((staff, i) => (
                    <div 
                      key={i} 
                      className={`flex border-b border-gray-300 flex-1 ${i === 1 ? 'border-b-0' : ''}`}
                    >
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">{staff.id}</p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <p className="text-sm font-semibold leading-tight">{staff.name}</p>
                        <p className="text-sm leading-tight">{staff.nip}</p>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
};

export default HrgaIt;