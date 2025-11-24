import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/print-styles.css';

const ManufacturBattery = () => {
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
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">STRUKTUR ORGANISASI</h1>
                  <h2 className="text-xl font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">(MANUFACTURING BATTERY DEPARTMENT)</h3>
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
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[240px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">PRD2.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">BATTERY PRODUCTION & PME</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">DIONISIUS AUGUSTO**</p>
                  <p className="text-xs leading-tight uppercase">(23220105)</p>
                </div>
              </div>
            </div>

            {/* Kolom 4 - Engineer */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm w-[240px]">
                <div className="flex">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    <p className="text-xs font-bold uppercase">PRD2.1</p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-1 leading-tight uppercase">BATTERY PRODUCTION</p>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-xs leading-tight uppercase">YEREMIA SOTYA</p>
                    <p className="text-xs leading-tight uppercase">(23230135)</p>
                  </div>
                </div>
                <div className="flex border-t border-gray-400">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    <p className="text-xs font-bold uppercase">PRD2.2</p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs leading-tight uppercase">ASEP AGUNG WIGUNA</p>
                    <p className="text-xs leading-tight uppercase">(23190805)</p>
                  </div>
                </div>
              </div>

              <div className="min-h-[665px]"></div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[240px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">PRD2.3</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">QUALITY ASSURANCE</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">ADHITYA SATIAWA</p>
                  <p className="text-xs leading-tight uppercase">SURYADATA (23230091)</p>
                </div>
              </div>

              <div className="min-h-[2px]"></div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[240px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">PRD3.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">BATTERY PME</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">TBR</p>
                </div>
              </div>
            </div>

            {/* Kolom 5 - Team Member/Technician */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[200px] w-[240px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">PRD2.1.1</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">AUXILIARY BATTERY PRODUCT</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">RIZAL GUNAWAN</p>
                  <p className="text-xs leading-tight uppercase">(23230055)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">MUH. NANDER</p>
                  <p className="text-xs leading-tight uppercase">(23120193)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">GANTIANTO</p>
                  <p className="text-xs leading-tight uppercase">(23120145)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">TARMUDIN</p>
                  <p className="text-xs leading-tight uppercase">(23120184)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">DEDI SUKMA</p>
                  <p className="text-xs leading-tight uppercase">(23110110)</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[180px] w-[240px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">PRD2.1.2</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">BESS PRODUCT</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">EKO DAMAR WAHYUDI</p>
                  <p className="text-xs leading-tight uppercase">(23230115)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">WIDODO</p>
                  <p className="text-xs leading-tight uppercase">(23120197)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">SUPRIYONO</p>
                  <p className="text-xs leading-tight uppercase">(23110119)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">PUTRI LESTARI</p>
                  <p className="text-xs leading-tight uppercase">(23240229)</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[220px] w-[240px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">PRD2.1.3</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">BEV PRODUCT</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">RIZIQ RIDWAN</p>
                  <p className="text-xs leading-tight uppercase">(23210079)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">AINA WAKHORIDAH</p>
                  <p className="text-xs leading-tight uppercase">(23230053)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">DENDI SETIAWAN</p>
                  <p className="text-xs leading-tight uppercase">(23230054)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">GALIH SOMAT</p>
                  <p className="text-xs leading-tight uppercase">(23230116)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">M. YUNUS ARIFAI</p>
                  <p className="text-xs leading-tight uppercase">(23120192)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">DODIK</p>
                  <p className="text-xs leading-tight uppercase">(23120161)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">NACA RODIANA HENDRAYANA</p>
                  <p className="text-xs leading-tight uppercase">(23120199)</p>
                </div>
              </div>

              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[240px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                  <p className="text-xs font-bold uppercase">PRD2.3.1</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight uppercase">QUALITY CHECK</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight uppercase">TBR</p>
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

export default ManufacturBattery;