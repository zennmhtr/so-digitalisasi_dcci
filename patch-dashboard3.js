const fs = require('fs');
const path = 'frontend/src/pages/Dashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\{\/\* Board of Commissioners \*\/\}[\s\S]*?\{\/\* Main Content Grid - 5 Columns - COMPLETE DYNAMIC STRUCTURE \*\/\}\s*<div className="mb-6">\s*<div ref=\{gridRef\} className="relative" style=\{\{ minHeight: "2000px", minWidth: "1200px" \}\}>/m;

const replacement = `<div ref={gridRef} className="relative" style={{ minHeight: "2000px", minWidth: "1200px" }}>
        {/* Board of Commissioners */}
        <div style={{ position: 'absolute', left: organizationData?.positions?.['commissioners-header']?.x || 400, top: organizationData?.positions?.['commissioners-header']?.y || 20, zIndex: 30 }}>
          <div className="bg-blue-300 p-4 rounded text-center w-[400px] hover:bg-blue-400 transition-colors border-2 border-transparent hover:border-blue-600">
            <h3 className="font-bold text-sm text-white">
              BOARD OF COMMISSIONERS
            </h3>
          </div>
        </div>

        <div style={{ position: 'absolute', left: organizationData?.positions?.['president-commissioner']?.x || 250, top: organizationData?.positions?.['president-commissioner']?.y || 100, zIndex: 30 }}>
          <div className="bg-white border border-gray-400 rounded shadow-sm w-48 text-center min-h-[100px] hover:shadow-lg transition-shadow hover:border-blue-400">
            <div className="p-2 bg-gray-100 border-b border-gray-300">
              <p className="text-sm font-semibold">
                {organizationData.commissioners?.president?.title ||
                  "PRESIDENT COMMISIONER"}
              </p>
            </div>
            <div className="p-4 flex items-center justify-center h-16">
              <p className="text-xs font-medium">
                {organizationData.commissioners?.president?.name ||
                  "IRIANTO SANTOSO"}
              </p>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', left: organizationData?.positions?.['commissioners-list']?.x || 470, top: organizationData?.positions?.['commissioners-list']?.y || 100, zIndex: 30 }}>
          <div className="bg-white border border-gray-400 p-4 rounded shadow-sm w-48 text-center min-h-[100px] flex flex-col justify-center hover:shadow-lg transition-shadow hover:border-blue-400">
            <p className="text-sm font-semibold mb-3">COMMISSIONERS</p>
            {organizationData.commissioners?.commissioners?.map(
              (name, index) => (
                <React.Fragment key={index}>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs mb-1">{name}</p>
                </React.Fragment>
              )
            )}
          </div>
        </div>

        {/* Column Headers */}
        <div style={{ position: 'absolute', left: organizationData?.positions?.['header-bod']?.x || 50, top: organizationData?.positions?.['header-bod']?.y || 250, zIndex: 30 }}>
          <div className="bg-blue-300 p-3 rounded text-center w-44">
            <h3 className="font-bold text-[10px] text-white">
              BOARD OF DIRECTOR
            </h3>
          </div>
        </div>

        <div style={{ position: 'absolute', left: organizationData?.positions?.['header-management']?.x || 250, top: organizationData?.positions?.['header-management']?.y || 250, zIndex: 30 }}>
          <div className="p-3 rounded text-center w-44">
            <h3 className="font-bold text-[10px] text-transparent">&nbsp;</h3>
          </div>
        </div>

        <div style={{ position: 'absolute', left: organizationData?.positions?.['header-division']?.x || 450, top: organizationData?.positions?.['header-division']?.y || 250, zIndex: 30 }}>
          <div className="bg-blue-300 p-3 rounded text-center w-44">
            <h3 className="font-bold text-[10px] text-white">DIVISION HEAD</h3>
          </div>
        </div>

        <div style={{ position: 'absolute', left: organizationData?.positions?.['header-department']?.x || 650, top: organizationData?.positions?.['header-department']?.y || 250, zIndex: 30 }}>
          <div className="bg-blue-300 p-3 rounded text-center w-44">
            <h3 className="font-bold text-[10px] text-white">DEPARTMENT HEAD</h3>
          </div>
        </div>

        <div style={{ position: 'absolute', left: organizationData?.positions?.['header-section']?.x || 850, top: organizationData?.positions?.['header-section']?.y || 250, zIndex: 30 }}>
          <div className="bg-blue-300 p-3 rounded text-center w-48">
            <h3 className="font-bold text-[10px] text-white leading-tight">
              SECTION HEAD / ENGINEERING PRODUCT LEADER
            </h3>
          </div>
        </div>

        {/* Main Content Grid - 5 Columns - COMPLETE DYNAMIC STRUCTURE */}`;

content = content.replace(regex, replacement);

fs.writeFileSync(path, content);
console.log('Done replacing layout!');
