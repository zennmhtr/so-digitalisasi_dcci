import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

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
              <h1 className="text-xl font-bold text-gray-800 mb-1">ORGANIZATION STRUCTURE</h1>
              <h2 className="text-lg font-semibold text-gray-700">PT DHARMA CONTROLCABLE INDONESIA</h2>
              <p className="text-sm text-gray-500">Effective Date: 08/09/2025</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex space-x-8">
              <div className="text-center">
                <p className="text-xs text-gray-500">Prepared By</p>
                <div className="w-20 h-8 border-b border-gray-300 mt-2"></div>
                <p className="text-xs text-gray-500 mt-1">Reg No : 08/10/2025</p>
                <p className="text-xs text-gray-500">Prepared Date : 08/09/2025</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Approved By</p>
                <div className="w-20 h-8 border-b border-gray-300 mt-2"></div>
                <p className="text-xs text-gray-500 mt-1">Approved Date : 08/09/2025</p>
                <p className="text-xs text-gray-500">Prepared Date : 08/09/2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
        {/* Board of Commissioners */}
        <div className="mb-8">
          <div className="bg-blue-300 p-4 rounded text-center max-w-md mx-auto mb-6">
            <h3 className="font-bold text-sm text-white">BOARD OF COMMISSIONERS</h3>
          </div>
          
          <div className="flex justify-center gap-6 mb-6">
            <div className="bg-white border border-gray-400 rounded shadow-sm w-48 text-center min-h-[100px]">
              <div className="p-2 bg-gray-100 border-b border-gray-300">
                <p className="text-sm font-semibold">PRESIDENT COMMISIONER</p>
              </div>
              <div className="p-4 flex items-center justify-center h-16">
                <p className="text-xs font-medium">IRIANTO SANTOSO</p>
              </div>
            </div>
            <div className="bg-white border border-gray-400 p-4 rounded shadow-sm w-48 text-center min-h-[100px] flex flex-col justify-center">
              <p className="text-sm font-semibold mb-3">COMMISSIONERS</p>
              <hr className="my-2 border-gray-300" />
              <p className="text-xs mb-1">SUBAGIO</p>
              <hr className="my-1 border-gray-300" />
              <p className="text-xs mb-1">HONG KUO MING</p>
              <hr className="my-1 border-gray-300" />
              <p className="text-xs">LIAO CHIN HSIEN</p>
            </div>
          </div>
        </div>

        {/* Top Level Headers - 5 tabel biru sejajar dengan grid */}
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

        {/* Content untuk 5 kolom sesuai header biru - Grid Layout */}
        <div className="mb-6">
          <div className="grid grid-cols-5 gap-4">
            
            {/* Kolom 1 - Board of Director */}
            <div className="space-y-3">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">BOD1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">PRESIDENT DIRECTOR</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">EKO MARYANTO</p>
                  <p className="text-xs leading-tight">(23100235)</p>
                </div>
              </div>
              
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">BOD1.1</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">DIRECTOR</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">BAMBANG WURYANTO</p>
                  <p className="text-xs leading-tight">(23200038)</p>
                </div>
              </div>
            </div>

              {/* Kolom 2 - Management Functions */}
            <div className="space-y-4">
              {/* Empty space to align with President Director */}
              <div className="min-h-[180px]"></div>
              {/* Combined Management Development/PDCA Box */}
             <div 
                className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                onClick={() => navigate('/mi-she')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/mi-she');
                  }
                }}
              >
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">MIO1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">MI & SHE (5R-SMK3-ISO 14001)</p>
                  <hr className="my-1 border-gray-300" />
                 <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">ELIATA DUMAR GINTING</p>
                  <p className="text-xs leading-tight">(23190806)</p>
                  <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                </div>
              </div>

           
              {/* Combined Management Development/PDCA Box */}
              <div 
                className="bg-white border border-gray-400 rounded shadow-sm min-h-[170px] cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                onClick={() => navigate('/management-development')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/management-development');
                  }
                }}
              >
                <div className="flex flex-col h-full">
                  {/* Header row */}
                  <div className="flex border-b border-gray-300">
                   
                    
                    <div className="p-2 flex-1 text-center bg-gray-100">
                      <p className="text-xs font-semibold leading-tight">MANAGEMENT DEVELOPMENT/PDCA</p>
                    </div>
                  </div>
                  
                  {/* First content row */}
                  <div className="flex border-b border-gray-300 flex-1">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                      <p className="text-xs font-bold">MDO1.0</p>

                    </div>
                    <div className="p-3 flex-1 text-center flex flex-col justify-center">
                      <p className="text-xs leading-tight">KARINA SATIA SALIM*</p>
                      <p className="text-xs leading-tight">(23230114)</p>
                    </div>
                  </div>
                  
                  {/* Second content row */}
                  <div className="flex flex-1">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                      <p className="text-xs font-bold">MDO2.0</p>
                    </div>
                    <div className="p-3 flex-1 text-center flex flex-col justify-center">
                      <p className="text-xs leading-tight">WAHYU KARTIKO ADI</p>
                      <p className="text-xs leading-tight">(23240005)</p>
                      <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[90px] cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                onClick={() => navigate('/management-representative')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/management-representative');
                  }
                }}
              >
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                  <p className="text-xs font-bold">MRO1.0</p>
                </div>
                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">MANAGEMENT REPRESENTATIVE</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">SUGIYARTO*</p>
                  <p className="text-xs leading-tight">(23600041)</p>
                  <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                </div>
              </div>
              
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                  <p className="text-xs font-bold">CRO1.0</p>
                </div>
                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">CUSTOMER REPRESENTATIVE 2 WHEEL</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">SUMIYARTO*</p>
                  <p className="text-xs leading-tight">(23030015)</p>
                </div>
              </div>
              
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                  <p className="text-xs font-bold">CO2.0</p>
                </div>
                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">CUSTOMER REPRESENTATIVE 4 WHEEL</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">DWI PURWANTO*</p>
                  <p className="text-xs leading-tight">(23030023)</p>
                </div>
              </div>
            </div>

            {/* Kolom 3 - Division Head */}
            <div className="space-y-3">
              {/* Empty spaces to align with CO2.0 */}
              <div className="min-h-[110px]"></div>
              <div className="min-h-[120px]"></div>
              <div className="min-h-[200px]"></div>
              <div className="min-h-[120px]"></div>
              <div className="min-h-[130px]"></div>
              
              {/* CONTROLCABLE BUSINESS aligned with CO2.0 */}
              <div className="bg-gray-200 p-3 rounded text-center font-bold text-xs min-h-[100px] flex items-center justify-center">
                <span className="leading-tight">CONTROLCABLE BUSINESS</span>
              </div>
              
               <div className="min-h-[100px]"></div>
              <div className="bg-gray-200 p-3 rounded text-center font-bold text-xs min-h-[80px] flex items-center justify-center">
                <span className="leading-tight">BATTERY BUSINESS</span>
              </div>
              
               <div className="min-h-[570px]"></div>
              <div className="bg-gray-200 p-3 rounded text-center font-bold text-xs min-h-[80px] flex items-center justify-center">
                <span className="leading-tight">AFTERMARKET BUSINESS</span>
              </div>
            </div>

            {/* Kolom 4 - Department Head */}
            <div className="space-y-3">
              {/* Empty spaces to align with Management Representative */}
              <div className="min-h-[110px]"></div>
              <div className="min-h-[150px]"></div>
              <div className="min-h-[190px]"></div>
              
              {/* QA aligned with Management Representative */}
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[90px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">QAC1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">QA</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">M BAGUS SANTOSO</p>
                  <p className="text-xs leading-tight">(23220025)</p>
                </div>
              </div>
              
              {/* Space to separate QA and PPC & WAREHOUSE */}
              <div className="min-h-[10px]"></div>
              
              {/* PPC & WAREHOUSE aligned with Customer Representative 2 Wheel */}
              <div 
                className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                onClick={() => navigate('/ppic')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/ppic');
                  }
                }}
              >
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">PPIC1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">PPC & WAREHOUSE</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">DIKI WAHYUDI</p>
                  <p className="text-xs leading-tight">(23060056)</p>
                  <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                </div>
              </div>

               {/* Space to separate PPC & WAREHOUSE and marketing*/}
              <div className="min-h-[1px]"></div>

              <div 
                className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                onClick={() => navigate('/marketing-engineering')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/marketing-engineering');
                  }
                }}
              >
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">MKT1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">MI & SHE (5R-SMK3-ISO 14001)</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">ANDREAS AGUNG S.</p>
                  <p className="text-xs leading-tight">(23040119)</p>
                  <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                </div>
              </div>
            
             
              
              {/* Marketing aligned after CONTROLCABLE BUSINESS */}
               <div className="min-h-[105px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">MKT2.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">MARKETING</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">RENDRA PRAMONO</p>
                  <p className="text-xs leading-tight">(23200067)</p>
                </div>
              </div>
              
               <div className="min-h-[110px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                   <p className="text-xs font-bold">RND1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">RND</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">RENDRA PRAMONO</p>
                  <p className="text-xs leading-tight">(23200067)</p>
                </div>
              </div>
              

               <div className="min-h-[250px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">QAC2.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">QA/QC/DOC</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">RENDRA PRAMONO</p>
                  <p className="text-xs leading-tight">(23200067)</p>
                </div>
              </div>
              
               <div className="min-h-[1px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">MKT3.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">MARKETING</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">TBR</p>
                </div>
              </div>
            </div>

            {/* Kolom 5 - Section Head / Engineering Product Leader */}
            
            <div className="space-y-3">
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[90px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">PRD1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">CONTROLCABLE MANUFACTURE</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">KARNA SATIA SALIM*</p>
                  <p className="text-xs leading-tight">(23230114)</p>
                </div>
              </div>
              
              <div 
                className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                onClick={() => navigate('/manufactur-battery')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/manufactur-battery');
                  }
                }}
              >
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">PRD2.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">BATTERY PRODUCTION</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">DIONISIUS AUGUSTO**</p>
                  <p className="text-xs leading-tight">(23220105)</p>
                  <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                </div>
              </div>
              
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">PRD3.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">BATTERY PME</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">DIONISIUS AUGUSTO**</p>
                  <p className="text-xs leading-tight">(23220105)</p>
                </div>
              </div>
              
               <div className="min-h-[435px]"></div>
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">MKT1.1</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">MARKETING</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">SAVITRI OCTAVIANI</p>
                  <p className="text-xs leading-tight">(23130254)</p>
                </div>
              </div>


               <div className="min-h-[10px]"></div>
               <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">ENG1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">ENGINEERING</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">SUGIYARTO</p>
                  <p className="text-xs leading-tight">(2360041)</p>
                </div>
              </div>

               <div className="min-h-[10px]"></div>
               <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">MKT2.1</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">AUX & POWER BATTERY MARKETING</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">CHRYSNA YULIAWAN**</p>
                  <p className="text-xs leading-tight">(23240177)</p>
                </div>
              </div>

               <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">MKT2.2</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">ESS MARKETING</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">FERDINAND STEVANUS A**</p>
                  <p className="text-xs leading-tight">(23220049)</p>
                </div>
              </div>

               <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[110px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">RND1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">AUX & POWER BATTERY ENGINEERING PRODUCT LEADER</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">BRIAN BUDI SANTOSO**</p>
                  <p className="text-xs leading-tight">(23210077)</p>
                </div>
              </div>

               <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">RND2.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">ESS ENGINEERING PRODUCT LEADER</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">RAIHAN RAMADHAN**</p>
                  <p className="text-xs leading-tight">(23220104)</p>
                </div>
              </div>

               <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[110px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">RND3.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">MICRO CONTROLLER ENGINEERING PRODUCT LEADER</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">ELISABETH GUSTI**</p>
                  <p className="text-xs leading-tight">(23230087)</p>
                </div>
              </div>

               <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">QAC2.1</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">BATTERY QA</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">BELLA TIURMA PRATIWI**</p>
                  <p className="text-xs leading-tight">(23230092)</p>
                </div>
              </div>

               <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]">
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">MKT3.1</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">MARKETING</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">TBR</p>
                </div>
              </div>

               <div 
                className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                onClick={() => navigate('/hrga-it-department')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/hrga-it-department');
                  }
                }}
              >
               <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">HRD1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">HRDGA & IT</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">DIKI WAHYUDI*</p>
                  <p className="text-xs leading-tight">(23060056)</p>
                  <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                </div>
            </div>

               <div 
                className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                onClick={() => navigate('/purchasing')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/purchasing');
                  }
                }}
              >
                 <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">PCH1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">PURCHASING</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">DIKI WAHYUDI*</p>
                  <p className="text-xs leading-tight">(23060056)</p>
                  <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                </div>
              </div>

               <div 
                className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                onClick={() => navigate('/finance-department')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/finance-department');
                  }
                }}
              >
                <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                  <p className="text-xs font-bold">FIN1.0</p>
                </div>
                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                  <p className="text-xs font-semibold mb-1 leading-tight">FINANCE & ACCOUNTING</p>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs leading-tight">YULIUS PERMATA</p>
                  <p className="text-xs leading-tight">(23220017)</p>
                  <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                </div>
              </div>
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