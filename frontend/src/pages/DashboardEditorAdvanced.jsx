import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdvancedEditorCanvas from '../components/AdvancedEditorCanvas';

const DashboardEditorAdvanced = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organizationData, setOrganizationData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorMode, setEditorMode] = useState('move'); // move | connect | edit | delete | resize
  const [showAddBox, setShowAddBox] = useState(false);
  
  // newBox state extended to support different box types
  const [newBox, setNewBox] = useState({ 
    boxType: 'standard', // standard | header | label
    category: 'department', 
    code: '', 
    title: '', 
    name: '', 
    empId: '' 
  });

  const hasAccess = React.useMemo(() => {
    const userRole = user?.role;
    const userPermissions = typeof userRole === 'object' ? userRole?.permissions : [];
    return user && userPermissions?.includes('SO DCI Editor');
  }, [user]);

  useEffect(() => {
    const savedData = localStorage.getItem('dashboard-organization-data');
    if (savedData) {
      setOrganizationData(JSON.parse(savedData));
    } else {
      const initialData = {
      header: {
        title: "ORGANIZATION STRUCTURE",
        company: "PT DHARMA CONTROLCABLE INDONESIA",
        effectiveDate: "08/09/2025",
        regNo: "08/10/2025",
        preparedDate: "08/09/2025",
        approvedDate: "08/09/2025",
      },
      signatures: {
        preparedBy: { name: "Diki Wahyudi", date: "16/03/2026" },
        middleBy: { title: "Bambang Wuryanto", name: "Bambang Wuryanto", date: "16/03/2026" },
        approvedBy: { name: "Eko Maryanto", date: "16/03/2026" },
      },
      commissioners: {
        president: { title: "PRESIDENT COMMISIONER", name: "IRIANTO SANTOSO" },
        commissioners: ["SUBAGIO", "HONG KUO MING", "LIAO CHIN HSIEN"],
      },
      structure: {
        bod: [
          { id: "bod-1", code: "BOD1.0", title: "PRESIDENT DIRECTOR", name: "EKO MARYANTO", empId: "23100235" },
          { id: "bod-2", code: "BOD1.1", title: "DIRECTOR", name: "BAMBANG WURYANTO", empId: "23200038" },
        ],
        management: [
          { id: "mio-1", code: "MIO1.0", title: "MI & SHE (5R-SMK3-ISO 14001)", name: "ELIATA DUMAR GINTING", empId: "23190806", clickable: true, route: "/mi-she" },
          { id: "mdo-1", code: "MDO1.0", title: "MANAGEMENT DEVELOPMENT/PDCA", name: "WAHYU KARTIKO ADI", empId: "23240005", type: "combined", clickable: true, route: "/management-development" },
          { id: "mro-1", code: "MRO1.0", title: "MANAGEMENT REPRESENTATIVE", name: "SUGIYARTO*", empId: "23600041", clickable: true, route: "/management-representative" },
          { id: "cro-1", code: "CRO1.0", title: "CUSTOMER REPRESENTATIVE 4 WHEEL", name: "DWI PURWANTO*", empId: "23190023", clickable: true, route: "/customer-representative" },
          { id: "cro-2", code: "CRO2.0", title: "CUSTOMER REPRESENTATIVE 2 WHEEL", name: "SUGIYARTO*", empId: "23600041" },
        ],
        business: [
          { id: "bus-1", label: "CONTROLCABLE OPERATION" },
          { id: "bus-2", label: "DC BATTERY BUSINESS" },
        ],
        headers: [], // dynamic headers array
        divisions: [
          { id: "mkt2-0", code: "MKT2.0", title: "MARKETING", name: "DADANG AHMAD JUNAEDI", empId: "11230640", clickable: true, route: "/marketing-division" },
        ],
        departments: [
          { id: "qa-1", code: "QAC1.0", title: "QUALITY ASSURANCE", name: "M BAGUS SANTOSO", empId: "23220025", clickable: true, route: "/quality-assurance" },
          { id: "ppic-1", code: "PPIC1.0", title: "PPC & WAREHOUSE", name: "TBD", empId: "-", clickable: true, route: "/ppc-warehouse" },
          { id: "mkt-eng", code: "MKT1.0", title: "MARKETING", name: "SAVITRI OCTAVIANI", empId: "23190254", clickable: true, route: "/marketing-department" },
          { id: "mkt-2", code: "MKT1.1", title: "MARKETING BESS", name: "TBD", empId: "-" },
          { id: "mkt-adv", code: "MKT1.2", title: "MARKETING (AFTERMARKET)", name: "TBD", empId: "-" },
          { id: "hrd-1", code: "HRD1.0", title: "HRDGA & IT", name: "AGUS KURNIAWAN*", empId: "23090007", clickable: true, route: "/hrd-department" },
          { id: "rnd-1", code: "RND1.0", title: "RESEARCH & DEVELOPMENT", name: "RAIHAN RAMADHAN**", empId: "23220104", clickable: true, route: "/rnd-department" },
          { id: "pch-1", code: "PCH1.0", title: "PURCHASING", name: "AGUS KURNIAWAN*", empId: "23090007", clickable: true, route: "/purchasing-department" },
        ],
        sections: [
          { id: "prd-1", code: "PRD1.0", title: "MANUFACTURE CONTROLCABLE", name: "KARNA SATIA SALIM*", empId: "23230114", clickable: true, route: "/production-section" },
          { id: "eng1-1", code: "ENG1.1", title: "ENGINEERING", name: "SUGIYARTO", empId: "23060041" },
          { id: "mkt1-1", code: "MKT1.1", title: "MARKETING", name: "SAVITRI OCTAVIANI", empId: "23190254" },
          { id: "hrd1-1", code: "HRD1.1", title: "HRDGA & IT", name: "AGUS KURNIAWAN*", empId: "23090007" },
          { id: "mkt2-1", code: "MKT2.1", title: "MARKETING BESS", name: "TBD", empId: "-" },
          { id: "prd-2", code: "PRD2.0", title: "MANUFACTURE DC BATTERY", name: "TBD", empId: "-" },
          { id: "qac2-0", code: "QAC2.0", title: "QUALITY ASSURANCE DC BATTERY", name: "TBD", empId: "-" },
          { id: "rnd1-1", code: "RND1.1", title: "ELECTRONIC ENGINEERING", name: "ROBI WAHYUDI", empId: "23210077" },
          { id: "rnd1-2", code: "RND1.2", title: "ESS ENGINEERING", name: "RAIHAN RAMADHAN**", empId: "23220104" },
          { id: "rnd1-3", code: "RND1.3", title: "MICRO CONTROLLER ENGINEERING", name: "TBD", empId: "-" },
          { id: "mkt3.0", code: "MKT3.0", title: "MARKETING BESS", name: "TBD", empId: "-" },
          { id: "fin-1", code: "FIN1.0", title: "FINANCE & ACCOUNTING", name: "YULIUS PERMATA", empId: "23220017", clickable: true, route: "/finance-department" },
        ],
      },
      connections: [],
      sizes: {},
      positions: {},
      };

      setOrganizationData(initialData);
      localStorage.setItem('dashboard-organization-data', JSON.stringify(initialData));
    }
  }, []);

  const handleDataChange = (newData) => {
    setOrganizationData(newData);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!organizationData || !hasChanges) return;
    setIsSaving(true);
    try {
      localStorage.setItem('dashboard-organization-data', JSON.stringify(organizationData));
      window.dispatchEvent(new CustomEvent('dashboard-data-updated', { detail: organizationData }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'dashboard-organization-data',
        newValue: JSON.stringify(organizationData),
        storageArea: localStorage,
      }));
      setHasChanges(false);
      setShowSaveDialog(true);
      setTimeout(() => setShowSaveDialog(false), 3000);
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPositions = () => {
    if (confirm('Reset ALL positions, connections, and sizes to default? This cannot be undone.')) {
      const resetData = { ...organizationData, positions: {}, connections: [], sizes: {} };
      setOrganizationData(resetData);
      setHasChanges(true);
    }
  };

  const handleAddBox = () => {
    if (!newBox.title) {
      alert('Title/Label is required.');
      return;
    }

    if (newBox.boxType === 'standard' && !newBox.code) {
      alert('Code is required for standard boxes.');
      return;
    }

    const id = `custom-${Date.now()}`;
    const newData = JSON.parse(JSON.stringify(organizationData));
    let posKey = '';

    if (newBox.boxType === 'standard') {
      const newItem = {
        id,
        code: newBox.code,
        title: newBox.title,
        name: newBox.name || 'TBD',
        empId: newBox.empId || '-',
      };

      const catMap = {
        bod: 'bod',
        management: 'management',
        division: 'divisions',
        department: 'departments',
        section: 'sections',
      };

      const structKey = catMap[newBox.category] || 'departments';
      const keyPrefix = newBox.category === 'division' ? 'division' : newBox.category === 'department' ? 'department' : newBox.category === 'section' ? 'section' : newBox.category;

      if (!newData.structure[structKey]) newData.structure[structKey] = [];
      newData.structure[structKey].push(newItem);
      posKey = `${keyPrefix}-${id}`;
    } else if (newBox.boxType === 'header') {
      const newItem = { id, title: newBox.title };
      if (!newData.structure.headers) newData.structure.headers = [];
      newData.structure.headers.push(newItem);
      posKey = `header-${id}`;
    } else if (newBox.boxType === 'label') {
      const newItem = { id, label: newBox.title };
      if (!newData.structure.business) newData.structure.business = [];
      newData.structure.business.push(newItem);
      posKey = `business-${id}`;
    }

    // Place at center of viewport roughly
    newData.positions = { ...newData.positions, [posKey]: { x: 500, y: 600 } };
    newData.sizes = newData.sizes || {};

    setOrganizationData(newData);
    setHasChanges(true);
    setShowAddBox(false);
    setNewBox({ boxType: 'standard', category: 'department', code: '', title: '', name: '', empId: '' });
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have permission to access the SO DCI Editor.</p>
          <div className="mt-6">
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const modes = [
    { id: 'move', icon: '🖱️', label: 'Move', desc: 'Drag boxes' },
    { id: 'connect', icon: '🔗', label: 'Connect', desc: 'Draw lines' },
    { id: 'edit', icon: '✏️', label: 'Edit', desc: 'Edit text' },
    { id: 'resize', icon: '↔️', label: 'Resize', desc: 'Resize boxes' },
    { id: 'delete', icon: '🗑️', label: 'Delete', desc: 'Remove items' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top toolbar */}
      <div className="sticky top-0 z-[100] bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Title */}
            <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">
              Advanced Organization Chart Editor
            </h1>

            {/* Mode toolbar */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {modes.map(m => (
                <button
                  key={m.id}
                  onClick={() => setEditorMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    editorMode === m.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title={m.desc}
                >
                  <span>{m.icon}</span>
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddBox(true)}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-xs font-medium hover:bg-emerald-600 transition-colors"
              >
                ➕ Add Box
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  hasChanges && !isSaving
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? '💾 Saving…' : hasChanges ? '💾 Save' : '✅ Saved'}
              </button>
              <button
                onClick={handleResetPositions}
                className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-xs font-medium hover:bg-orange-600 transition-colors"
                title="Reset all positions to default"
              >
                🔄 Reset
              </button>
              <button
                onClick={() => navigate('/dashboard-editor')}
                className="px-3 py-1.5 bg-gray-500 text-white rounded-md text-xs font-medium hover:bg-gray-600"
              >
                Classic Editor
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600"
              >
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white border border-gray-200 m-2 rounded-lg overflow-auto" style={{ height: 'calc(100vh - 60px)' }}>
        {organizationData && (
          <AdvancedEditorCanvas
            organizationData={organizationData}
            onDataChange={handleDataChange}
            editorMode={editorMode}
          />
        )}
      </div>

      {/* Add Box Modal */}
      {showAddBox && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw]">
            <h2 className="text-lg font-bold text-gray-900 mb-4">➕ Add New Box</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Box Type</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  value={newBox.boxType}
                  onChange={e => setNewBox(v => ({ ...v, boxType: e.target.value }))}
                >
                  <option value="standard">Standard Box (Code, Title, Name)</option>
                  <option value="header">Header Box (Blue Title)</option>
                  <option value="label">Business Label (Grey Text)</option>
                </select>
              </div>

              {newBox.boxType === 'standard' && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={newBox.category}
                    onChange={e => setNewBox(v => ({ ...v, category: e.target.value }))}
                  >
                    <option value="bod">Board of Directors</option>
                    <option value="management">Management</option>
                    <option value="division">Division</option>
                    <option value="department">Department</option>
                    <option value="section">Section</option>
                  </select>
                </div>
              )}
              
              {newBox.boxType === 'standard' && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Code *</label>
                  <input
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="e.g. PRD2.0"
                    value={newBox.code}
                    onChange={e => setNewBox(v => ({ ...v, code: e.target.value }))}
                  />
                </div>
              )}
              
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  {newBox.boxType === 'label' ? 'Label *' : 'Title *'}
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder={newBox.boxType === 'label' ? 'e.g. BUSINESS OPERATIONS' : 'e.g. PRODUCTION SECTION'}
                  value={newBox.title}
                  onChange={e => setNewBox(v => ({ ...v, title: e.target.value }))}
                />
              </div>

              {newBox.boxType === 'standard' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Name</label>
                    <input
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      placeholder="e.g. JOHN DOE"
                      value={newBox.name}
                      onChange={e => setNewBox(v => ({ ...v, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Employee ID</label>
                    <input
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      placeholder="e.g. 23100001"
                      value={newBox.empId}
                      onChange={e => setNewBox(v => ({ ...v, empId: e.target.value }))}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleAddBox}
                className="flex-1 bg-blue-500 text-white rounded-md py-2 font-medium hover:bg-blue-600 transition-colors"
              >
                Add Box
              </button>
              <button
                onClick={() => setShowAddBox(false)}
                className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Toast */}
      {showSaveDialog && (
        <div className="fixed top-16 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-[200] animate-slide-in">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Changes saved successfully!</span>
          </div>
          <p className="text-sm text-green-100 mt-1">Dashboard will reflect the new layout.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardEditorAdvanced;