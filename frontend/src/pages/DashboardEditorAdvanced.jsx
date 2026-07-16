import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { soChangeRequestsAPI } from "../services/api";
import AdvancedEditorCanvas from '../components/AdvancedEditorCanvas';
import Swal from 'sweetalert2';

const Field = ({ label, value, onChange, placeholder, hint }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
    {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const DashboardEditorAdvanced = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organizationData, setOrganizationData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [editorMode, setEditorMode] = useState('move');
  const [showAddBox, setShowAddBox] = useState(false);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    affectedSection: "departments",
  });
  const [editModeStartData, setEditModeStartData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [newBox, setNewBox] = useState({
    boxType: 'standard',
    category: 'department',
    code: '',
    title: '',
    name: '',
    empId: ''
  });

  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [headerForm, setHeaderForm] = useState({
    company: '',
    effectiveDate: '',
    preparedBy: '',
    preparedByDate: '',
    middleBy: '',
    middleByDate: '',
    approvedBy: '',
    approvedByDate: '',
  });

  const openHeaderModal = () => {
    if (!organizationData) return;
    setHeaderForm({
      company: organizationData.header?.company || '',
      effectiveDate: organizationData.header?.effectiveDate || '',
      preparedBy: organizationData.signatures?.preparedBy?.name || '',
      preparedByDate: organizationData.signatures?.preparedBy?.date || '',
      middleBy: organizationData.signatures?.middleBy?.name || '',
      middleByDate: organizationData.signatures?.middleBy?.date || '',
      approvedBy: organizationData.signatures?.approvedBy?.name || '',
      approvedByDate: organizationData.signatures?.approvedBy?.date || '',
    });
    setShowHeaderModal(true);
  };

  const handleSaveHeader = () => {
    const updated = JSON.parse(JSON.stringify(organizationData));
    updated.header.company = headerForm.company;
    updated.header.effectiveDate = headerForm.effectiveDate;
    updated.signatures.preparedBy.name = headerForm.preparedBy;
    updated.signatures.preparedBy.date = headerForm.preparedByDate;
    updated.signatures.middleBy.name = headerForm.middleBy;
    updated.signatures.middleBy.date = headerForm.middleByDate;
    updated.signatures.approvedBy.name = headerForm.approvedBy;
    updated.signatures.approvedBy.date = headerForm.approvedByDate;
    setOrganizationData(updated);
    setHasChanges(true);
    setShowHeaderModal(false);
  };

  const submitForApproval = async () => {
    if (!submitForm.title.trim()) {
      alert("Please enter a title for this change request");
      return;
    }
    if (!submitForm.description.trim()) {
      alert("Please enter a description for this change request");
      return;
    }

    try {
      const now = new Date();

      let baselineData = editModeStartData;
      if (!baselineData) {
        const savedDataRaw = localStorage.getItem("dashboard-organization-data");
        if (savedDataRaw) baselineData = JSON.parse(savedDataRaw);
      }

      if (!baselineData) {
        alert("❌ Error: Cannot find original data. Please refresh the page.");
        return;
      }

      const dataToSubmit = JSON.parse(JSON.stringify(organizationData));
      dataToSubmit.lastModified = now.toISOString();
      dataToSubmit.modifiedBy = user?.name || user?.username;

      const requestData = {
        title: submitForm.title,
        description: submitForm.description,
        changeType: "update",
        affectedSection: submitForm.affectedSection,
        priority: submitForm.priority,
        proposedData: { organizationData: dataToSubmit },
        currentData: { organizationData: baselineData },
      };

      const response = await soChangeRequestsAPI.create(requestData);

      if (response.data.success) {
        await Swal.fire({
          title: 'Berhasil!',
          text: 'Change request submitted successfully!',
          icon: 'success',
          confirmButtonColor: '#16a34a',
          confirmButtonText: 'OK',
          timer: 2000,
          showConfirmButton: false,
        });
        setShowSubmitModal(false);
        setSubmitForm({ title: "", description: "", priority: "medium", affectedSection: "departments" });
        setEditModeStartData(null);
        setIsEditMode(false);
        navigate("/so-change-requests");
      }
    } catch (error) {
      console.error("❌ Error submitting:", error);
      alert(error.response?.data?.message || "Failed to submit change request.");
    }
  };

  const hasAccess = React.useMemo(() => {
    const userRole = user?.role;
    const userPermissions = typeof userRole === 'object' ? userRole?.permissions : [];
    return user && userPermissions?.includes('SO DCI Editor');
  }, [user]);

  useEffect(() => {
    const savedData = localStorage.getItem('dashboard-organization-data');

    const correctMkt2 = {
      id: "mkt2-0", code: "MKT2.0",
      title: "BUSINESS DEVELOPMENT",
      name: "DADANG AHMAD DJUNAEDI", empId: "11230640"
    };
    const eng10 = {
      id: "eng-1", code: "ENG1.0",
      title: "ENGINEERING",
      name: "ANDREAS AGUNG S.*", empId: "23040119",
      clickable: true, route: "/marketing-engineering"
    };
    const mkt10 = {
      id: "mkt-1", code: "MKT1.0",
      title: "MARKETING ADV.",
      name: "ANDREAS AGUNG S.*", empId: "23040119",
      clickable: true, route: "/marketing-battery-department"
    };

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (!parsedData.structure) parsedData.structure = {};
      if (!parsedData.structure.divisions || parsedData.structure.divisions.length === 0) {
        parsedData.structure.divisions = [correctMkt2];
      } else {
        const mkt2 = parsedData.structure.divisions.find(d => d.code === 'MKT2.0');
        if (!mkt2) {
          parsedData.structure.divisions.push(correctMkt2);
        } else {
          mkt2.name = correctMkt2.name;
          mkt2.title = correctMkt2.title;
          mkt2.empId = correctMkt2.empId;
        }
        parsedData.structure.divisions = parsedData.structure.divisions
          .filter(d => d.code !== 'BUS-DEV2.0');
      }

      if (!parsedData.structure.departments) parsedData.structure.departments = [];
      if (!parsedData.structure.departments.find(d => d.code === 'ENG1.0')) {
        const pmeIdx = parsedData.structure.departments.findIndex(d => d.code === 'PME1.0');
        if (pmeIdx >= 0) {
          parsedData.structure.departments.splice(pmeIdx, 0, eng10);
        } else {
          parsedData.structure.departments.unshift(eng10);
        }
      }

      if (!parsedData.structure.departments.find(d => d.code === 'MKT1.0')) {
        const pmeIdx = parsedData.structure.departments.findIndex(d => d.code === 'PME1.0');
        if (pmeIdx >= 0) {
          parsedData.structure.departments.splice(pmeIdx + 1, 0, mkt10);
        } else {
          parsedData.structure.departments.push(mkt10);
        }
      }

      parsedData.structure.departments = parsedData.structure.departments
        .filter(d => d.code !== 'ENG2.0');

      localStorage.setItem('dashboard-organization-data', JSON.stringify(parsedData));
      setOrganizationData(parsedData);
    } else {
      const initialData = {
        header: {
          title: "ORGANIZATION STRUCTURE",
          company: "PT DHARMA CONTROLCABLE INDONESIA",
          effectiveDate: "02/06/2026",
          regNo: "02/06/2026",
          preparedDate: "02/06/2026",
          approvedDate: "02/06/2026",
        },
        signatures: {
          preparedBy: {
            name: "Diki Wahyudi",
            image: "/signatures/Diki_Wahyudi.png",  
            date: "02/06/2026"
          },
          middleBy: {
            name: "Bambang Wuryanto",
            image: "/signatures/Bambang_Wuryanto.png",  
            date: "02/06/2026"
          },
          rightBy: {
            name: "Eko Maryanto",
            image: "/signatures/Eko_Maryanto.png",  
            date: "02/06/2026"
          }
        },
        commissioners: {
          president: { title: "PRESIDENT COMMISIONER", name: "IRIANTO SANTOSO" },
          commissioners: ["SUBAGIO", "HONG KUO MING", "LIAO CHIN HSIEN"],
        },
        structure: {
          bod: [
            { id: "bod-1", code: "BOD1.0", title: "PRESIDENT DIRECTOR", name: "EKO MARYANTO", empId: "23200235" },
            { id: "bod-2", code: "BOD1.1", title: "DIRECTOR", name: "BAMBANG WURYANTO", empId: "23200038" },
          ],
          management: [
            { id: "mio-1", code: "MD1.0", title: "MDEV, MI & SHE/5R", name: "WAHYU KARTIKO ADI", empId: "23240005", clickable: true, route: "/mi-she" },
            { id: "mro-1", code: "MRO1.0", title: "MANAGEMENT REPRESENTATIVE", name: "SUGIYARTO*", empId: "23600041", clickable: true, route: "/management-representative" },
            { id: "cro-1", code: "CRO1.0", title: "CUSTOMER REPRESENTATIVE AHM", name: "SUMIYARTO*", empId: "23030015" },
            { id: "cro-2", code: "CRO2.0", title: "CUSTOMER REPRESENTATIVE NON AHM", name: "DWI PURWANTO*", empId: "23190023", clickable: true, route: "/customer-representative" },
            { id: "pac-1", code: "PAC1.0", title: "PLANT ACTIVITY", name: "M BAGUS SANTOSO*", empId: "23220025", clickable: true, route: "/customer-representative" },
          ],
          business: [
            { id: "bus-1", label: "CONTROLCABLE OPERATION" },
            { id: "bus-2", label: "DC BATTERY BUSINESS" },
          ],
          headers: [],
          divisions: [
            { id: "mkt2-0", code: "MKT2.0", title: "BUSINESS DEVELOPMENT", name: "DADANG AHMAD DJUNAEDI", empId: "11230640" },
          ],
          departments: [
            { id: "qa-1", code: "QAC1.0", title: "QUALITY ASSURANCE", name: "M BAGUS SANTOSO", empId: "23220025", clickable: true, route: "/quality-assurance" },
            { id: "ppic-1", code: "PPIC1.0", title: "PPIC & WAREHOUSE", name: "DIKI WAHYUDI", empId: "23060056", clickable: true, route: "/ppc-warehouse" },
            { id: "eng-1", code: "ENG1.0", title: "ENGINEERING", name: "ANDREAS AGUNG S.*", empId: "23040119", clickable: true, route: "/marketing-engineering" },
            { id: "mkt-2", code: "MKT1.1", title: "MARKETING BESS", name: "TBD", empId: "-" },
            { id: "PME-1", code: "PME1.0", title: "PE & MAINTENANCE", name: "ANDREAS AGUNG S.*", empId: "23040119" },
            { id: "mkt-1", code: "MKT1.0", title: "MARKETING ADV.", name: "ANDREAS AGUNG S.*", empId: "23040119", clickable: true, route: "/marketing-battery-department" },
            { id: "hrd-1", code: "HRD1.0", title: "HRDGA & IT", name: "DIKI WAHYUDI*", empId: "23060056", clickable: true, route: "/hrd-department" },
            { id: "rnd-1", code: "RND1.0", title: "RESEARCH & DEVELOPMENT", name: "RAIHAN RAMADHAN**", empId: "23220104", clickable: true, route: "/rnd-department" },
            { id: "pch-1", code: "PCH1.0", title: "PURCHASING", name: "DIKI WAHYUDI*", empId: "23060056", clickable: true, route: "/purchasing-department" },
          ],
          sections: [
            { id: "prd-1", code: "PRD1.0", title: "MANUFACTURE CONTROLCABLE", name: "KARNA SATIA SALIM*", empId: "23230114", clickable: true, route: "/production-section" },
            { id: "eng1-1", code: "ENG1.1", title: "ENGINEERING", name: "SUGIYARTO", empId: "23060041" },
            { id: "mkt1-1", code: "MKT1.1", title: "MARKETING", name: "SAVITRI OCTAVIANI", empId: "23190254" },
            { id: "hrd1-1", code: "HRD1.1", title: "HRDGA & IT", name: "THARISA ARRAHMA R.", empId: "23230072" },
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

  const saveToServer = async (data) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/organization-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data }),
      });
    } catch (err) { console.error("saveToServer error:", err); }
  };

  const handleDataChange = (newData) => {
    setOrganizationData(newData);
    setHasChanges(true);
  };

  const handleResetPositions = async () => {
    const confirmResult = await Swal.fire({
      title: 'Reset ALL positions, connections, and sizes to default? This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    });
    if (confirmResult.isConfirmed) {
      const resetData = { ...organizationData, positions: {}, connections: [], sizes: {} };
      setOrganizationData(resetData);
      setHasChanges(true);
    }
  };

  const handleAddBox = () => {
    if (!newBox.title) { alert('Title/Label is required.'); return; }
    if (newBox.boxType === 'standard' && !newBox.code) { alert('Code is required for standard boxes.'); return; }

    const id = `custom-${Date.now()}`;
    const newData = JSON.parse(JSON.stringify(organizationData));

    if (newBox.boxType === 'standard') {
      const newItem = { id, code: newBox.code, title: newBox.title, name: newBox.name || 'TBD', empId: newBox.empId || '-' };
      const catMap = { bod: 'bod', management: 'management', division: 'divisions', department: 'departments', section: 'sections' };
      const structKey = catMap[newBox.category] || 'departments';
      if (!newData.structure[structKey]) newData.structure[structKey] = [];
      newData.structure[structKey].push(newItem);
      newData.positions = { ...newData.positions, [`${newBox.category}-${id}`]: { x: 500, y: 600 } };
    } else if (newBox.boxType === 'header') {
      const newItem = { id, title: newBox.title };
      if (!newData.structure.headers) newData.structure.headers = [];
      newData.structure.headers.push(newItem);
      newData.positions = { ...newData.positions, [`header-${id}`]: { x: 500, y: 600 } };
    } else if (newBox.boxType === 'label') {
      const newItem = { id, label: newBox.title };
      if (!newData.structure.business) newData.structure.business = [];
      newData.structure.business.push(newItem);
      newData.positions = { ...newData.positions, [`business-${id}`]: { x: 500, y: 600 } };
    }

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
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const modes = [
    {
      id: 'move',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="3" width="12" height="18" rx="6" strokeWidth="1.5" />
          <line x1="6" y1="9" x2="18" y2="9" strokeWidth="1.5" />
          <line x1="12" y1="3" x2="12" y2="9" strokeWidth="1.5" />
          <rect x="11" y="5" width="2" height="3.5" rx="1" strokeWidth="1.2" />
        </svg>
      ),
      label: 'Move', desc: 'Drag boxes', color: 'text-blue-500',
    },
    {
      id: 'connect',
      icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>),
      label: 'Connect', desc: 'Draw lines', color: 'text-emerald-500',
    },
    {
      id: 'edit',
      icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>),
      label: 'Edit', desc: 'Edit text', color: 'text-amber-500',
    },
    {
      id: 'resize',
      icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>),
      label: 'Resize', desc: 'Resize boxes', color: 'text-violet-500',
    },
    {
      id: 'delete',
      icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>),
      label: 'Delete', desc: 'Remove items', color: 'text-red-500',
    },
    {
      id: 'line',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M9 12h11M4 18h16" />
        </svg>
      ),
      label: 'Elbow', desc: 'Atur titik belok garis', color: 'text-indigo-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Toolbar ── */}
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
                  onClick={() => {
                    if (m.id === 'edit' && editorMode !== 'edit') {
                      const snapshot = JSON.parse(JSON.stringify(organizationData));
                      setEditModeStartData(snapshot);
                      setIsEditMode(true);
                    } else if (m.id !== 'edit') {
                      setIsEditMode(false);
                    }
                    setEditorMode(m.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${editorMode === m.id ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  title={m.desc}
                >
                  <span className={editorMode === m.id ? 'text-white' : m.color}>{m.icon}</span>
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">

              {/* Edit Header Info */}
              <button
                onClick={openHeaderModal}
                className="px-3 py-1.5 bg-teal-500 text-white rounded-md text-xs font-medium hover:bg-teal-600 transition-colors flex items-center gap-1.5"
                title="Edit company name, effective date, and signatories"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Edit Header</span>
              </button>

              {/* Add Box */}
              <button
                onClick={() => setShowAddBox(true)}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-xs font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Box
              </button>

              {/* Submit for Approval */}
              <button
                onClick={() => hasChanges && setShowSubmitModal(true)}
                disabled={!hasChanges}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${hasChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                title={hasChanges ? 'Submit changes for approval' : 'No changes to submit'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Submit for Approval</span>
              </button>

              {/* Reset */}
              <button
                onClick={handleResetPositions}
                className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-xs font-medium hover:bg-orange-600 transition-colors flex items-center gap-1.5"
                title="Reset all positions to default"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Reset</span>
              </button>

              {/* Back to Dashboard */}
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div className="bg-white border border-gray-200 m-2 rounded-lg overflow-auto" style={{ height: 'calc(100vh - 60px)' }}>
        {organizationData && (
          <AdvancedEditorCanvas
            organizationData={organizationData}
            onDataChange={handleDataChange}
            editorMode={editorMode}
          />
        )}
      </div>

      {/* ── Edit Header Info Modal ── */}
      {showHeaderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Edit Header Info</h2>
                  <p className="text-xs text-gray-500">Nama perusahaan, tanggal, dan penandatangan</p>
                </div>
              </div>
              <button onClick={() => setShowHeaderModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">

              {/* Section: Document Info */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Informasi Dokumen</p>
                <div className="space-y-3">
                  <Field
                    label="Nama Perusahaan"
                    value={headerForm.company}
                    onChange={v => setHeaderForm(f => ({ ...f, company: v }))}
                    placeholder="PT DHARMA CONTROLCABLE INDONESIA"
                  />
                  <Field
                    label="Effective Date"
                    value={headerForm.effectiveDate}
                    onChange={v => setHeaderForm(f => ({ ...f, effectiveDate: v }))}
                    placeholder="DD/MM/YYYY"
                    hint="Format: DD/MM/YYYY"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Section: Signatories */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Penandatangan</p>
                <div className="space-y-3">
                  {/* Prepared By */}
                  <div className="grid grid-cols-2 gap-2">
                    <Field
                      label="Prepared By"
                      value={headerForm.preparedBy}
                      onChange={v => setHeaderForm(f => ({ ...f, preparedBy: v }))}
                      placeholder="Nama Prepared By"
                    />
                    <Field
                      label="Tanggal"
                      value={headerForm.preparedByDate}
                      onChange={v => setHeaderForm(f => ({ ...f, preparedByDate: v }))}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>

                  {/* Director / Checked By */}
                  <div className="grid grid-cols-2 gap-2">
                    <Field
                      label="Checked By (Director)"
                      value={headerForm.middleBy}
                      onChange={v => setHeaderForm(f => ({ ...f, middleBy: v }))}
                      placeholder="Nama Director"
                    />
                    <Field
                      label="Tanggal"
                      value={headerForm.middleByDate}
                      onChange={v => setHeaderForm(f => ({ ...f, middleByDate: v }))}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>

                  {/* Approved By */}
                  <div className="grid grid-cols-2 gap-2">
                    <Field
                      label="Approved By"
                      value={headerForm.approvedBy}
                      onChange={v => setHeaderForm(f => ({ ...f, approvedBy: v }))}
                      placeholder="Nama Approved By"
                    />
                    <Field
                      label="Tanggal"
                      value={headerForm.approvedByDate}
                      onChange={v => setHeaderForm(f => ({ ...f, approvedByDate: v }))}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>
              </div>

              {/* Preview strip */}
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500 space-y-1 border border-gray-100">
                <p className="font-semibold text-gray-600 mb-1">Preview</p>
                <p><span className="text-gray-400">Perusahaan:</span> {headerForm.company || '—'}</p>
                <p><span className="text-gray-400">Effective Date :</span> {headerForm.effectiveDate || '—'}</p>
                <p><span className="text-gray-400">Prep Date :</span> {headerForm.preparedBy || '—'} <span className="text-gray-300 mx-1">·</span> {headerForm.preparedByDate || '—'}</p>
                <p><span className="text-gray-400">Prep Date :</span> {headerForm.middleBy || '—'} <span className="text-gray-300 mx-1">·</span> {headerForm.middleByDate || '—'}</p>
                <p><span className="text-gray-400">Prep Date :</span> {headerForm.approvedBy || '—'} <span className="text-gray-300 mx-1">·</span> {headerForm.approvedByDate || '—'}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowHeaderModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveHeader}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Perubahan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Add Box Modal ── */}
      {showAddBox && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw]">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Add New Box</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Box Type</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  value={newBox.boxType} onChange={e => setNewBox(v => ({ ...v, boxType: e.target.value }))}>
                  <option value="standard">Standard Box (Code, Title, Name)</option>
                  <option value="header">Header Box (Blue Title)</option>
                  <option value="label">Business Label (Grey Text)</option>
                </select>
              </div>

              {newBox.boxType === 'standard' && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Category</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={newBox.category} onChange={e => setNewBox(v => ({ ...v, category: e.target.value }))}>
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
                  <input className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="e.g. PRD2.0" value={newBox.code} onChange={e => setNewBox(v => ({ ...v, code: e.target.value }))} />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  {newBox.boxType === 'label' ? 'Label *' : 'Title *'}
                </label>
                <input className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder={newBox.boxType === 'label' ? 'e.g. BUSINESS OPERATIONS' : 'e.g. PRODUCTION SECTION'}
                  value={newBox.title} onChange={e => setNewBox(v => ({ ...v, title: e.target.value }))} />
              </div>

              {newBox.boxType === 'standard' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Name</label>
                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      placeholder="e.g. JOHN DOE" value={newBox.name} onChange={e => setNewBox(v => ({ ...v, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Employee ID</label>
                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      placeholder="e.g. 23100001" value={newBox.empId} onChange={e => setNewBox(v => ({ ...v, empId: e.target.value }))} />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={handleAddBox} className="flex-1 bg-blue-500 text-white rounded-md py-2 font-medium hover:bg-blue-600 transition-colors">
                Add Box
              </button>
              <button onClick={() => setShowAddBox(false)} className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 font-medium hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit for Approval Modal ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Submit SO Changes for Approval</h2>
              <button onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                <input type="text" value={submitForm.title}
                  onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Update Organization Structure" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                <textarea value={submitForm.description}
                  onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4" placeholder="Describe the changes you made..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Affected Section</label>
                  <select value={submitForm.affectedSection}
                    onChange={(e) => setSubmitForm({ ...submitForm, affectedSection: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="departments">Departments</option>
                    <option value="sections">Sections</option>
                    <option value="divisions">Divisions</option>
                    <option value="management">Management</option>
                    <option value="bod">Board of Directors</option>
                    <option value="commissioners">Commissioners</option>
                    <option value="header">Header Info</option>
                    <option value="signatures">Signatures</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select value={submitForm.priority}
                    onChange={(e) => setSubmitForm({ ...submitForm, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> Your changes will not appear in the dashboard until approved by a Director &amp; President Director.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowSubmitModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                Cancel
              </button>
              <button onClick={submitForApproval}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardEditorAdvanced;