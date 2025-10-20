import React, { useState } from 'react';

const OrganizationDemo = () => {
  const [demoMode, setDemoMode] = useState('comparison');

  const sampleData = {
    structure: {
      bod: [
        { id: 'bod-1', code: 'BOD1.0', title: 'PRESIDENT DIRECTOR', name: 'EKO MARYANTO', empId: '23100235' },
        { id: 'bod-2', code: 'BOD1.1', title: 'DIRECTOR', name: 'BAMBANG WURYANTO', empId: '23200038' }
      ],
      management: [
        { id: 'mio-1', code: 'MIO1.0', title: 'MI & SHE', name: 'ELIATA DUMAR GINTING', empId: '23190806' },
        { id: 'mro-1', code: 'MRO1.0', title: 'MANAGEMENT REP', name: 'SUGIYARTO', empId: '23600041' },
      ],
      departments: [
        { id: 'qa-1', code: 'QAC1.0', title: 'QA', name: 'M BAGUS SANTOSO', empId: '23220025' },
        { id: 'ppic-1', code: 'PPIC1.0', title: 'PPC & WAREHOUSE', name: 'DIKI WAHYUDI', empId: '23060056' },
      ],
      sections: [
        { id: 'prd-1', code: 'PRD1.0', title: 'MANUFACTURING', name: 'KARNA SATIA SALIM', empId: '23230114' },
        { id: 'hrd-1', code: 'HRD1.0', title: 'HRDGA & IT', name: 'DIKI WAHYUDI', empId: '23060056' },
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🚀 Advanced Organization Chart Solution
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Solusi lengkap untuk masalah struktur organisasi yang fleksibel dengan connector melengkung dan drag & drop bebas.
          </p>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setDemoMode('comparison')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                demoMode === 'comparison' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Problem vs Solution
            </button>
            <button
              onClick={() => setDemoMode('features')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                demoMode === 'features' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Features Overview
            </button>
            <button
              onClick={() => setDemoMode('implementation')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                demoMode === 'implementation' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Technical Implementation
            </button>
          </div>
        </div>

        {/* Content based on selected mode */}
        {demoMode === 'comparison' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Problems */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-800 mb-4">❌ Masalah Saat Ini</h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h3 className="font-semibold text-red-700 mb-2">Line Connector Issues</h3>
                  <ul className="text-red-600 text-sm space-y-1">
                    <li>• Hanya garis lurus, tidak bisa melengkung</li>
                    <li>• Tidak bisa membuat sudut atau belokan</li>
                    <li>• Tampilan kaku dan tidak profesional</li>
                    <li>• Sulit dibaca untuk struktur yang kompleks</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h3 className="font-semibold text-red-700 mb-2">Drag & Drop Limitations</h3>
                  <ul className="text-red-600 text-sm space-y-1">
                    <li>• Tidak bisa memindahkan posisi secara bebas</li>
                    <li>• Terikat pada grid CSS yang kaku</li>
                    <li>• Posisi box tidak bisa disesuaikan dengan keinginan</li>
                    <li>• Perlu edit manual di kode untuk mengubah layout</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h3 className="font-semibold text-red-700 mb-2">Flexibility Issues</h3>
                  <ul className="text-red-600 text-sm space-y-1">
                    <li>• Structure organisasi sangat mungkin berubah sewaktu-waktu</li>
                    <li>• Membutuhkan developer untuk mengubah layout</li>
                    <li>• Tidak user-friendly untuk admin/HR</li>
                    <li>• Maintenance yang rumit dan memakan waktu</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Solutions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-green-800 mb-4">✅ Solusi Advanced Editor</h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-green-700 mb-2">Curved Connectors</h3>
                  <ul className="text-green-600 text-sm space-y-1">
                    <li>• Bezier curves dan smooth connections</li>
                    <li>• Connector otomatis melengkung dengan indah</li>
                    <li>• Multiple curve styles: smooth, step, straight</li>
                    <li>• Arrow markers yang customizable</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-green-700 mb-2">Full Drag & Drop</h3>
                  <ul className="text-green-600 text-sm space-y-1">
                    <li>• Drag box ke posisi manapun secara bebas</li>
                    <li>• Real-time positioning dengan pixel precision</li>
                    <li>• Collision detection untuk mencegah overlap</li>
                    <li>• Snap-to-grid optional untuk alignment yang rapi</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-green-700 mb-2">Advanced Features</h3>
                  <ul className="text-green-600 text-sm space-y-1">
                    <li>• Zoom in/out untuk navigasi chart besar</li>
                    <li>• Pan/scroll untuk menjelajahi area yang luas</li>
                    <li>• Minimap untuk overview dan quick navigation</li>
                    <li>• Auto-save dan export ke berbagai format</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {demoMode === 'features' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 Fitur Unggulan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 border border-blue-200 rounded-lg">
                  <div className="text-blue-600 text-3xl mb-3">🔗</div>
                  <h3 className="font-bold text-gray-800 mb-2">Smart Connectors</h3>
                  <p className="text-gray-600 text-sm">
                    Line connector otomatis melengkung dengan algoritma Bezier curve. 
                    Mendukung berbagai style: curved, stepped, orthogonal.
                  </p>
                </div>

                <div className="p-4 border border-green-200 rounded-lg">
                  <div className="text-green-600 text-3xl mb-3">🖱️</div>
                  <h3 className="font-bold text-gray-800 mb-2">Free Positioning</h3>
                  <p className="text-gray-600 text-sm">
                    Drag & drop bebas tanpa batasan grid. Posisikan box di manapun 
                    sesuai kebutuhan struktur organisasi Anda.
                  </p>
                </div>

                <div className="p-4 border border-purple-200 rounded-lg">
                  <div className="text-purple-600 text-3xl mb-3">🔍</div>
                  <h3 className="font-bold text-gray-800 mb-2">Zoom & Pan</h3>
                  <p className="text-gray-600 text-sm">
                    Navigate chart yang besar dengan mudah. Zoom in untuk detail,
                    zoom out untuk overview keseluruhan.
                  </p>
                </div>

                <div className="p-4 border border-orange-200 rounded-lg">
                  <div className="text-orange-600 text-3xl mb-3">⚡</div>
                  <h3 className="font-bold text-gray-800 mb-2">Real-time Editing</h3>
                  <p className="text-gray-600 text-sm">
                    Edit text langsung di chart, tambah box baru dengan click,
                    ubah connections dengan drag.
                  </p>
                </div>

                <div className="p-4 border border-red-200 rounded-lg">
                  <div className="text-red-600 text-3xl mb-3">💾</div>
                  <h3 className="font-bold text-gray-800 mb-2">Auto Save</h3>
                  <p className="text-gray-600 text-sm">
                    Semua perubahan otomatis tersimpan. Export ke PDF, PNG, 
                    atau JSON untuk backup dan sharing.
                  </p>
                </div>

                <div className="p-4 border border-teal-200 rounded-lg">
                  <div className="text-teal-600 text-3xl mb-3">🎨</div>
                  <h3 className="font-bold text-gray-800 mb-2">Customizable</h3>
                  <p className="text-gray-600 text-sm">
                    Custom styling untuk box, connector, colors. Responsive
                    design yang bekerja di semua device.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🚀 Dual Engine Power</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-blue-600 mb-2">React Flow Engine</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Easy to use, user-friendly interface</li>
                    <li>• Built-in controls dan navigation</li>
                    <li>• Optimized performance untuk large charts</li>
                    <li>• Rich ecosystem dan plugin support</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-purple-600 mb-2">D3.js Engine</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Maximum flexibility dan control</li>
                    <li>• Custom animations dan interactions</li>
                    <li>• Advanced force simulations</li>
                    <li>• Professional grade data visualization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {demoMode === 'implementation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Technical Implementation</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-3">1. React Flow Implementation</h3>
                  <div className="bg-white rounded p-3 border">
                    <pre className="text-sm overflow-x-auto">
{`// Custom Bezier Curve Connector
const CustomEdge = ({ sourceX, sourceY, targetX, targetY }) => {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    curvature: 0.3 // Control curve intensity
  });
  
  return (
    <path
      d={edgePath}
      stroke="#3B82F6"
      strokeWidth={3}
      markerEnd="url(#arrowhead)"
    />
  );
};`}
                    </pre>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-3">2. D3.js Force Simulation</h3>
                  <div className="bg-white rounded p-3 border">
                    <pre className="text-sm overflow-x-auto">
{`// Advanced Force Simulation
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).distance(100))
  .force('charge', d3.forceManyBody().strength(-300))
  .force('collision', d3.forceCollide().radius(60))
  .force('center', d3.forceCenter(width/2, height/2));`}
                    </pre>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-bold text-purple-800 mb-3">3. Drag & Drop System</h3>
                  <div className="bg-white rounded p-3 border">
                    <pre className="text-sm overflow-x-auto">
{`// Free positioning dengan drag behavior
const dragBehavior = d3.drag()
  .on('start', (event, d) => {
    d.fx = d.x; d.fy = d.y;
  })
  .on('drag', (event, d) => {
    d.fx = event.x; d.fy = event.y;
    updateConnections(d);
  })
  .on('end', (event, d) => {
    savePosition(d);
  });`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Files Created</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded p-4 border">
                  <h4 className="font-semibold text-green-600 mb-2">New Components:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• OrganizationChart.jsx (React Flow)</li>
                    <li>• OrganizationChartD3.jsx (D3.js)</li>
                    <li>• DashboardEditorAdvanced.jsx</li>
                  </ul>
                </div>
                <div className="bg-white rounded p-4 border">
                  <h4 className="font-semibold text-blue-600 mb-2">Dependencies Added:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• reactflow@^11.11.4 (sudah ada)</li>
                    <li>• d3@latest (baru ditambahkan)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-yellow-800 mb-3">🎯 How to Access</h3>
              <ol className="text-yellow-700 space-y-2">
                <li><strong>1.</strong> Buka Dashboard Editor yang sudah ada</li>
                <li><strong>2.</strong> Klik tombol "🚀 Advanced Editor" di bagian atas</li>
                <li><strong>3.</strong> Atau akses langsung di URL: <code>/dashboard-editor-advanced</code></li>
                <li><strong>4.</strong> Pilih engine: React Flow atau D3.js</li>
                <li><strong>5.</strong> Aktifkan Edit Mode dan mulai berkreasi!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Try?</h2>
          <p className="text-blue-100 mb-6">
            Semua fitur sudah terintegrasi dengan sistem yang ada. Tidak merusak data yang sudah ada dan 
            backward compatible dengan editor klasik.
          </p>
          <div className="space-x-4">
            <a
              href="/dashboard-editor-advanced"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors inline-block"
            >
              🚀 Try Advanced Editor
            </a>
            <a
              href="/dashboard-editor"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-400 transition-colors inline-block"
            >
              📝 Classic Editor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDemo;