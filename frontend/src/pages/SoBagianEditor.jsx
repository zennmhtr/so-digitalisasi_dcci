import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

const SoBagianEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [departmentData, setDepartmentData] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Check if user has SO Bagian Editor permission
  const hasAccess = React.useMemo(() => {
    const userRole = user?.role;
    const userPermissions = typeof userRole === 'object' ? userRole?.permissions : [];
    console.log('SO Bagian Editor Debug:', {
      user: user?.name,
      userRole: userRole?.name,
      userPermissions,
      hasAccess: userPermissions?.includes('SO Bagian Editor')
    });
    return user && userPermissions?.includes('SO Bagian Editor');
  }, [user]);

  // Department list with their REAL data structures from actual pages
  const departments = [
    {
      id: 'finance',
      name: 'Finance Department',
      route: '/finance-department',
      color: 'bg-blue-500',
      structure: {
        header: {
          title: 'FINANCE & ACCOUNTING DEPARTMENT',
          code: 'FIN1.0',
          head: 'YULIUS PERMATA',
          empId: '23220017',
          effectiveDate: '30 September 2025'
        },
        positions: [
          { id: 'fin-1', code: 'FIN1.1', title: 'STAFF', name: 'FAKHDARENI', empId: '23060055' },
          { id: 'fin-2', code: 'FIN1.2', title: 'STAFF', name: 'KHOIRUNNISA', empId: '23170572' },
          { id: 'fin-3', code: 'FIN1.3', title: 'STAFF', name: 'SITI ROKHAYATI', empId: '23120177' },
          { id: 'fin-4', code: 'FIN1.4', title: 'STAFF', name: 'ANNISA NUR HANDAYANI', empId: '23120198' }
        ]
      }
    },
    {
      id: 'hrga-it',
      name: 'HRGA & IT Department',
      route: '/hrga-it',
      color: 'bg-green-500',
      structure: {
        header: {
          title: 'HRGA & IT DEPARTMENT',
          code: 'HRD1.0',
          head: 'DIKI WAHYUDI *',
          empId: '23060056',
          effectiveDate: '30 September 2025'
        },
        positions: [
          { id: 'hrd-1', code: 'HRD2.0', title: 'VERONICA HANI M. **', name: 'VERONICA HANI M. **', empId: '23240206' },
          { id: 'hrd-2', code: 'HRD1.1', title: 'HRD', name: 'THARISA ARRAHMA R.', empId: '23230072' },
          { id: 'hrd-3', code: 'GA1.1', title: 'GENERAL AFFAIR & IND. RELATIONS', name: 'SUPRIADI', empId: '23120131' },
          { id: 'hrd-4', code: 'GA1.2', title: 'GENERAL AFFAIR & IND. RELATIONS', name: 'PARTINI LUPI', empId: '23110116' },
          { id: 'hrd-5', code: 'GA1.3', title: 'GENERAL AFFAIR & IND. RELATIONS', name: 'MIMBARYANTO', empId: '23120158' },
          { id: 'it-1', code: 'IT1.1', title: 'INFORMATION TECHNOLOGY', name: 'ROZIQIN', empId: '23070074' },
          { id: 'it-2', code: 'IT1.2', title: 'INFORMATION TECHNOLOGY', name: 'FARHANSYAH A.L', empId: '23220040' }
        ]
      }
    },
    {
      id: 'management-development',
      name: 'Management Development',
      route: '/management-development',
      color: 'bg-purple-500',
      structure: {
        header: {
          title: 'MANAGEMENT DEVELOPMENT DEPARTMENT',
          code: 'MDO',
          head: '',
          empId: '',
          effectiveDate: '30 September 2025'
        },
        positions: [
          { id: 'mdo-1', code: 'MDO1.0', title: 'MANAGEMENT DEVELOPEMENT/PDCA', name: 'KARNA SATIA SALIM*', empId: '23230114' },
          { id: 'mdo-2', code: 'MDO2.0', title: 'MANAGEMENT DEVELOPEMENT/PDCA', name: 'WAHYU KARTIKO ADI', empId: '23240175' }
        ]
      }
    },
    {
      id: 'management-rep',
      name: 'Management Representative',
      route: '/management-representative',
      color: 'bg-orange-500',
      structure: {
        header: {
          title: 'MANAGEMENT REPRESENTATIVE',
          code: 'MRO1.0',
          head: 'SUGIYARTO*',
          empId: '23600041'
        },
        positions: [
          { id: 'mro-1', code: 'MRO1.1', title: 'REP STAFF', name: 'STAFF NAME 1', empId: '23600042' }
        ]
      }
    },
    {
      id: 'manufactur-battery',
      name: 'Manufacturing Battery',
      route: '/manufactur-battery',
      color: 'bg-red-500',
      structure: {
        header: {
          title: 'MANUFACTURING BATTERY DEPARTMENT',
          code: '',
          head: '',
          empId: '',
          effectiveDate: '30 September 2025'
        },
        positions: [
          // BOARD OF DIRECTOR
          { id: 'bod-1-0', code: 'BOD1.0', title: 'PRESIDENT DIRECTOR', name: 'EKO MARYANTO', empId: '23200235', group: 'BOARD OF DIRECTOR' },
          { id: 'bod-1-1', code: 'BOD1.1', title: 'DIRECTOR', name: 'BAMBANG WURYANTO', empId: '23200038', group: 'BOARD OF DIRECTOR' },
          // SENIOR ENGINEER
          { id: 'prd-2-0', code: 'PRD2.0', title: 'BATTERY PRODUCTION & PME', name: 'DIONISIUS AUGUSTO**', empId: '23220105', group: 'SENIOR ENGINEER' },
          // ENGINEER
          { id: 'prd-2-1', code: 'PRD2.1', title: 'BATTERY PRODUCTION', name: 'YEREMIA SOTYA', empId: '23230135', group: 'ENGINEER' },
          { id: 'prd-2-2', code: 'PRD2.2', title: 'BATTERY PRODUCTION', name: 'ASEP AGUNG WIGUNA', empId: '23190805', group: 'ENGINEER' },
          // ENGINEER - QA
          { id: 'prd-2-3', code: 'PRD2.3', title: 'QUALITY ASSURANCE', name: 'ADHITYA SATIAWA SURYADATA', empId: '23230091', group: 'ENGINEER' },
          // ENGINEER - PME
          { id: 'prd-3-0', code: 'PRD3.0', title: 'BATTERY PME', name: 'TBR', empId: '', group: 'ENGINEER' },
          // TEAM MEMBER/TECHNICIAN - AUXILIARY BATTERY PRODUCT
          { id: 'prd-2-1-1-1', code: 'PRD2.1.1', title: 'AUXILIARY BATTERY PRODUCT', name: 'RIZAL GUNAWAN', empId: '23230055', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-1-2', code: 'PRD2.1.1', title: 'AUXILIARY BATTERY PRODUCT', name: 'MUH. NANDER', empId: '23120193', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-1-3', code: 'PRD2.1.1', title: 'AUXILIARY BATTERY PRODUCT', name: 'GANTIANTO', empId: '23120145', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-1-4', code: 'PRD2.1.1', title: 'AUXILIARY BATTERY PRODUCT', name: 'TARMUDIN', empId: '23120184', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-1-5', code: 'PRD2.1.1', title: 'AUXILIARY BATTERY PRODUCT', name: 'DEDI SUKMA', empId: '23110110', group: 'TEAM MEMBER/TECHNICIAN' },
          // TEAM MEMBER/TECHNICIAN - BESS PRODUCT
          { id: 'prd-2-1-2-1', code: 'PRD2.1.2', title: 'BESS PRODUCT', name: 'EKO DAMAR WAHYUDI', empId: '23230115', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-2-2', code: 'PRD2.1.2', title: 'BESS PRODUCT', name: 'WIDODO', empId: '23120197', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-2-3', code: 'PRD2.1.2', title: 'BESS PRODUCT', name: 'SUPRIYONO', empId: '23110119', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-2-4', code: 'PRD2.1.2', title: 'BESS PRODUCT', name: 'PUTRI LESTARI', empId: '23240229', group: 'TEAM MEMBER/TECHNICIAN' },
          // TEAM MEMBER/TECHNICIAN - BEV PRODUCT
          { id: 'prd-2-1-3-1', code: 'PRD2.1.3', title: 'BEV PRODUCT', name: 'RIZIQ RIDWAN', empId: '23210079', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-3-2', code: 'PRD2.1.3', title: 'BEV PRODUCT', name: 'AINA WAKHORIDAH', empId: '23230053', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-3-3', code: 'PRD2.1.3', title: 'BEV PRODUCT', name: 'DENDI SETIAWAN', empId: '23230054', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-3-4', code: 'PRD2.1.3', title: 'BEV PRODUCT', name: 'GALIH SOMAT', empId: '23230116', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-3-5', code: 'PRD2.1.3', title: 'BEV PRODUCT', name: 'M. YUNUS ARIFAI', empId: '23120192', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-3-6', code: 'PRD2.1.3', title: 'BEV PRODUCT', name: 'DODIK', empId: '23120161', group: 'TEAM MEMBER/TECHNICIAN' },
          { id: 'prd-2-1-3-7', code: 'PRD2.1.3', title: 'BEV PRODUCT', name: 'NACA RODIANA HENDRAYANA', empId: '23120199', group: 'TEAM MEMBER/TECHNICIAN' },
          // TEAM MEMBER/TECHNICIAN - QUALITY CHECK
          { id: 'prd-2-3-1', code: 'PRD2.3.1', title: 'QUALITY CHECK', name: 'TBR', empId: '', group: 'TEAM MEMBER/TECHNICIAN' },
        ]
      }
    },
    {
      id: 'manufacturing-cable',
      name: 'Manufacturing Cable',
      route: '/manufacturing-cable',
      color: 'bg-indigo-500',
      structure: {
        header: {
          title: 'CONTROLCABLE MANUFACTURE',
          code: 'PRD1.0',
          head: 'KARNA SATIA SALIM*',
          empId: '23230114'
        },
        positions: [
          { id: 'prd1-1', code: 'PRD1.1', title: 'CABLE STAFF 1', name: 'STAFF NAME 1', empId: '23230115' },
          { id: 'prd1-2', code: 'PRD1.2', title: 'CABLE STAFF 2', name: 'STAFF NAME 2', empId: '23230116' }
        ]
      }
    },
    {
      id: 'marketing-battery',
      name: 'Marketing Battery Department',
      route: '/marketing-battery-department',
      color: 'bg-pink-500',
      structure: {
        header: {
          title: 'MARKETING BATTERY',
          code: 'MKT2.0',
          head: 'RENDRA PRAMONO',
          empId: '23200067'
        },
        positions: [
          { id: 'mkt2-1', code: 'MKT2.1', title: 'AUX & POWER BATTERY MARKETING', name: 'CHRYSNA YULIAWAN**', empId: '23240177' },
          { id: 'mkt2-2', code: 'MKT2.2', title: 'ESS MARKETING', name: 'FERDINAND STEVANUS A**', empId: '23220049' }
        ]
      }
    },
    {
      id: 'marketing-engineering',
      name: 'Marketing Engineering',
      route: '/marketing-engineering',
      color: 'bg-teal-500',
      structure: {
        header: {
          title: 'MARKETING ENGINEERING',
          code: 'MKT1.0',
          head: 'ANDREAS AGUNG S.',
          empId: '23040119'
        },
        positions: [
          { id: 'mkt1-1', code: 'MKT1.1', title: 'MARKETING', name: 'SAVITRI OCTAVIANI', empId: '23130254' }
        ]
      }
    },
    {
      id: 'mi-she',
      name: 'MI & SHE',
      route: '/mi-she',
      color: 'bg-yellow-500',
      structure: {
        header: {
          title: 'MI & SHE (5R-SMK3-ISO 14001)',
          code: 'MIO1.0',
          head: 'ELIATA DUMAR GINTING',
          empId: '23190806'
        },
        positions: [
          { id: 'mio-1', code: 'MIO1.1', title: 'SHE STAFF', name: 'STAFF NAME 1', empId: '23190807' }
        ]
      }
    },
    {
      id: 'ppic',
      name: 'PPIC',
      route: '/ppic',
      color: 'bg-cyan-500',
      structure: {
        header: {
          title: 'PPC DEPARTMENT',
          code: 'PPIC1.0',
          head: 'DIKI WAHYUDI*',
          empId: '23060056'
        },
        positions: [
          { id: 'ppic1-1', code: 'PPIC1.1', title: 'PPC CONTROLCABLE', name: 'ADE AKHMAD FAUZI*', empId: '23090093' },
          { id: 'ppic1-2', code: 'PPIC1.2', title: 'BATTERY & AHM OES', name: 'BUCHORI*', empId: '23120159' },
          { id: 'ppic1-3', code: 'PPIC1.3', title: 'WHS CONTROLCABLE', name: 'ANANG SUTAMTOMO*', empId: '23080082' },
          { id: 'ppic1-3-1', code: 'PPIC1.3.1', title: 'CONTROLCABLE', name: 'SETIYONO', empId: '23090090' },
          { id: 'ppic1-1-1', code: 'PPIC1.1.1', title: 'PROD PLAN', name: 'ERLI SULIANTO', empId: '23070073' },
          { id: 'ppic1-1-2', code: 'PPIC1.1.2', title: 'DNI/MANIFEST', name: 'EFPAIN TAMBUNAN', empId: '23110111' },
          { id: 'ppic1-1-3', code: 'PPIC1.1.3', title: 'DELIVERY', name: 'SUDARMANTO', empId: '23120151' },
          { id: 'ppic1-1-4', code: 'PPIC1.1.4', title: 'OPERATOR', name: 'OPERATOR', empId: '' },
          { id: 'ppic1-2-1', code: 'PPIC1.2.1', title: 'BATTERY', name: 'SRINATIN', empId: '23120130' },
          { id: 'ppic1-2-2', code: 'PPIC1.2.2', title: 'BATTERY STAFF', name: 'M. HAMAM MUCHLISIN', empId: '23120174' },
          { id: 'ppic1-3-2', code: 'PPIC1.3.2', title: 'SUPPLIER CONTROL', name: 'SULASTRI', empId: '23120190' },
          { id: 'ppic1-3-3', code: 'PPIC1.3.3', title: 'MRP', name: 'LAILA FITRIYAH', empId: '23120196' },
          { id: 'ppic1-3-4', code: 'PPIC1.3.4', title: 'RM & OHP', name: 'SUPRIYANTO', empId: '23120153' },
          { id: 'ppic1-3-5', code: 'PPIC1.3.5', title: 'HASIL PRODUKGAS', name: 'RAGIL PAMUGKAS', empId: '23120154' },
          { id: 'ppic1-3-6', code: 'PPIC1.3.6', title: 'SUPPLY', name: 'OPERATOR (2)', empId: '' }
        ]
      }
    },
    {
      id: 'purchasing',
      name: 'Purchasing',
      route: '/purchasing',
      color: 'bg-lime-500',
      structure: {
        header: {
          title: 'PROCUREMENT & PURCHASING',
          code: 'PCH1.0',
          head: 'DIKI WAHYUDI* / FAKHDARENI*',
          empId: '23060056 / 23060055'
        },
        positions: [
          { id: 'pch1-1', code: 'PCH1.1', title: 'CONTROLCABLE', name: 'RIF\'QI FATHAH', empId: '23230017' },
          { id: 'pch1-2', code: 'PCH1.2', title: 'BATTERY', name: 'MARCHELINO DWI PUTRANTO', empId: '23250234' },
          { id: 'pch1-3', code: 'PCH1.3', title: 'GENERAL & LEGAL', name: 'SYIFA NUR MULYANI', empId: '23220060' },
          { id: 'pch1-4', code: 'PCH1.4', title: 'SUBCONT', name: 'ELITRI SULISTIYO', empId: '23110112' }
        ]
      }
    },
    {
      id: 'qa',
      name: 'QA Department',
      route: '/qa-department',
      color: 'bg-rose-500',
      structure: {
        header: {
          title: 'QA DEPARTMENT',
          code: 'QAC1.0',
          head: 'M BAGUS SANTOSO',
          empId: '23220025'
        },
        positions: [
          { id: 'qa-1', code: 'QAC1.1', title: 'QA STAFF 1', name: 'STAFF NAME 1', empId: '23220026' },
          { id: 'qa-2', code: 'QAC1.2', title: 'QA STAFF 2', name: 'STAFF NAME 2', empId: '23220027' }
        ]
      }
    }
  ];

  // Initialize department data
  useEffect(() => {
    const initialData = {};
    departments.forEach(dept => {
      const savedData = localStorage.getItem(`so-bagian-${dept.id}`);
      if (savedData) {
        try {
          initialData[dept.id] = JSON.parse(savedData);
        } catch (error) {
          console.error(`Error parsing saved data for ${dept.id}:`, error);
          initialData[dept.id] = dept.structure;
        }
      } else {
        initialData[dept.id] = dept.structure;
      }
    });
    setDepartmentData(initialData);
  }, []);

  // If no access, show access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the SO Bagian Editor.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleEdit = (deptId, category, id, field, value) => {
    setDepartmentData(prev => {
      const newData = { ...prev };
      if (category === 'header') {
        newData[deptId].header[field] = value;
      } else if (category === 'positions') {
        const position = newData[deptId].positions.find(pos => pos.id === id);
        if (position) {
          position[field] = value;
        }
      }
      return newData;
    });
  };

  const saveDepartment = async (deptId) => {
    try {
      const dataToSave = {
        ...departmentData[deptId],
        lastModified: new Date().toISOString(),
        modifiedBy: user?.name || user?.username
      };
      
      localStorage.setItem(`so-bagian-${deptId}`, JSON.stringify(dataToSave));
      
      // Dispatch event to notify respective department page
      window.dispatchEvent(new CustomEvent(`so-bagian-${deptId}-updated`, { 
        detail: dataToSave 
      }));
      
      setShowSaveDialog(true);
      setTimeout(() => {
        setShowSaveDialog(false);
      }, 3000);
      
      console.log(`✅ ${deptId} data saved successfully`);
    } catch (error) {
      console.error(`Error saving ${deptId} data:`, error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const EditableField = ({ value, onSave, placeholder = "", className = "" }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleSave = () => {
      onSave(editValue);
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          className={`bg-yellow-50 border rounded px-2 py-1 ${className}`}
          placeholder={placeholder}
          autoFocus
        />
      );
    }

    return (
      <span
        onClick={() => isEditMode && setIsEditing(true)}
        className={isEditMode ? 'cursor-pointer hover:bg-yellow-100 rounded px-1' : ''}
        title={isEditMode ? 'Click to edit' : ''}
      >
        {value || placeholder}
      </span>
    );
  };

  // Function to render department-specific layout matching original departmental pages
  const renderDepartmentSpecificLayout = () => {
    if (!selectedDepartment || !departmentData[selectedDepartment.id]) return null;

    const dept = departmentData[selectedDepartment.id];

    // Management Representative Layout - match ManagementRepresentative.jsx
    if (selectedDepartment.id === 'management-rep') {
      return (
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
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">(MANAGEMENT REPRESENTATIVE DEPARTMENT)</h3>
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
                            <p className="text-sm font-bold text-black underline leading-tight">SUGIYARTO</p>
                            <p className="text-sm text-black leading-tight">SECTION HEAD</p>
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
              <div className="grid grid-cols-4 gap-4 mb-4">
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
                  <h3 className="font-bold text-xs text-black">STAFF</h3>
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
                    <p className="text-sm font-semibold mb-2 leading-tight">PRESIDENT DIRECTOR</p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
                    <p className="text-sm leading-tight">(23200235)</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.1</p>
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">DIRECTOR</p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>
              </div>
              {/* Kolom 2 - Department Head (empty) */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="min-h-[20px]"></div>
              </div>
              {/* Kolom 3 - Section Head */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[300px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">MR01.0</p>
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">MANAGEMENT<br />REPRESENTATIVE</p>
                    <hr className="my-2 border-gray-300" />
                    <EditableField
                      value={"SUGIYARTO *"}
                      onSave={() => {}}
                      className="text-sm leading-tight"
                    />
                    <EditableField
                      value={"(23060041)"}
                      onSave={() => {}}
                      className="text-sm leading-tight"
                    />
                  </div>
                </div>
              </div>
              {/* Kolom 4 - Staff */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[350px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">MR01.1</p>
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">MANAGEMENT<br />REPRESENTATIVE</p>
                    <hr className="my-2 border-gray-300" />
                    <EditableField
                      value={"BOBI SAPUTRA"}
                      onSave={() => {}}
                      className="text-sm leading-tight"
                    />
                    <EditableField
                      value={"(23240175)"}
                      onSave={() => {}}
                      className="text-sm leading-tight"
                    />
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
      );
    }
    if (selectedDepartment.id === 'hrga-it') {
      return (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1000px] relative p-4">
            
            {/* Header Section with borders */}
            <div className="mb-4 border-2 border-black p-3">
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
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">({dept.header.title})</h3>
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
            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              <div className="grid grid-cols-4 gap-4 mb-4">
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

              {/* Kolom 2 - Department Head - Empty */}
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
                        <p className="text-sm font-bold">{dept.header.code}</p>
                      </div>
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        <p className="text-sm font-semibold leading-tight whitespace-nowrap">HRDGA & IT</p>
                      </div>
                    </div>
                    
                    {/* DIKI WAHYUDI */}
                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold"></p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'head', value)}
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.header.empId})`}
                          onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'empId', value.replace(/[()]/g, ''))}
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                    
                    {/* VERONICA HANI M. */}
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">{dept.positions[0]?.code}</p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) => handleEdit(selectedDepartment.id, 'positions', dept.positions[0]?.id, 'name', value)}
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[0]?.empId})`}
                          onSave={(value) => handleEdit(selectedDepartment.id, 'positions', dept.positions[0]?.id, 'empId', value.replace(/[()]/g, ''))}
                          className="text-sm leading-tight"
                        />
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
                        <p className="text-sm font-bold">{dept.positions[1]?.code}</p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[1]?.name}
                          onSave={(value) => handleEdit(selectedDepartment.id, 'positions', dept.positions[1]?.id, 'name', value)}
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[1]?.empId})`}
                          onSave={(value) => handleEdit(selectedDepartment.id, 'positions', dept.positions[1]?.id, 'empId', value.replace(/[()]/g, ''))}
                          className="text-sm leading-tight"
                        />
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
                        <p className="text-sm font-semibold text-xs leading-tight">GENERAL AFFAIR & IND. RELATIONS</p>
                      </div>
                    </div>
                    
                    {dept.positions?.slice(2, 5).map((staff, i) => (
                      <div 
                        key={i} 
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? 'border-b-0' : ''}`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          <p className="text-sm font-bold">{staff.code}</p>
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'name', value)}
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'empId', value.replace(/[()]/g, ''))}
                            className="text-sm leading-tight"
                          />
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
                    
                    {dept.positions?.slice(5, 7).map((staff, i) => (
                      <div 
                        key={i} 
                        className={`flex border-b border-gray-300 flex-1 ${i === 1 ? 'border-b-0' : ''}`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          <p className="text-sm font-bold">{staff.code}</p>
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'name', value)}
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'empId', value.replace(/[()]/g, ''))}
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
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
      );
    }

    // Management Development Layout
    if (selectedDepartment.id === 'management-development') {
      return (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1000px] relative p-4">
            
            {/* Header Section with borders */}
            <div className="mb-4 border-2 border-black p-3">
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
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">({dept.header.title})</h3>
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
                            <p className="text-sm font-bold text-black underline leading-tight"></p>
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
              <div className="grid grid-cols-4 gap-4 mb-4">
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
                  <h3 className="font-bold text-xs text-black">STAFF</h3>
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
                    <p className="text-sm font-semibold mb-2 leading-tight whitespace-nowrap">PRESIDENT DIRECTOR</p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
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

              {/* Kolom 2 - Department Head - Empty */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 3 - Section Head - Empty */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 4 - Staff */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[180px] w-[350px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold"></p>
                      </div>
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        <p className="text-sm font-semibold leading-tight">MANAGEMENT DEVELOPEMENT/PDCA</p>
                      </div>
                    </div>
                    
                    {dept.positions.map((staff, i) => (
                      <div 
                        key={i} 
                        className={`flex border-b border-gray-300 flex-1 ${i === dept.positions.length - 1 ? 'border-b-0' : ''}`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          <p className="text-sm font-bold">{staff.code}</p>
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'name', value)}
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'empId', value.replace(/[()]/g, ''))}
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
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
      );
    }

    // Manufacturing Battery Layout
    if (selectedDepartment.id === 'manufactur-battery') {
      return (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1000px] relative p-4">
            
            {/* Header Section with borders */}
            <div className="mb-4 border-2 border-black p-3">
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
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">({dept.header.title})</h3>
                    <p className="text-md text-gray-500">Effective Date : {dept.header.effectiveDate || '30 September 2025'}</p>
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
                            <p className="text-sm font-bold text-black underline leading-tight">{dept.header.head}</p>
                            <p className="text-sm text-black leading-tight">DEPT. HEAD</p>
                          </div>
                        </div>
                      </div>
                    // Layout identik dengan ManufacturBattery.jsx (5 kolom, urutan dan mapping group sama)
                    return (
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
                              {dept.positions.filter(p => p.group === 'BOARD OF DIRECTOR').map((person, i) => (
                                <div key={i} className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[240px]">
                                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                                    <p className="text-xs font-bold uppercase">{person.code}</p>
                                  </div>
                                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                                    <p className="text-xs font-semibold mb-1 leading-tight uppercase">{person.title}</p>
                                    <hr className="my-1 border-gray-300" />
                                    <EditableField
                                      value={person.name}
                                      onSave={(value) => handleEdit(selectedDepartment.id, 'positions', person.id, 'name', value)}
                                      className="text-xs leading-tight uppercase"
                                    />
                                    <EditableField
                                      value={`(${person.empId})`}
                                      onSave={(value) => handleEdit(selectedDepartment.id, 'positions', person.id, 'empId', value.replace(/[()]/g, ''))}
                                      className="text-xs leading-tight uppercase"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Kolom 2 - Department Head (Empty) */}
                            <div className="space-y-4 flex flex-col items-center">
                              {/* Kosong, sesuai layout utama */}
                            </div>

                            {/* Kolom 3 - Senior Engineer */}
                            <div className="space-y-4 flex flex-col items-center">
                              {dept.positions.filter(p => p.group === 'SENIOR ENGINEER').map((person, i) => (
                                <div key={i} className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[100px] w-[240px]">
                                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                                    <p className="text-xs font-bold uppercase">{person.code}</p>
                                  </div>
                                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                                    <p className="text-xs font-semibold mb-1 leading-tight uppercase">{person.title}</p>
                                    <hr className="my-1 border-gray-300" />
                                    <EditableField
                                      value={person.name}
                                      onSave={(value) => handleEdit(selectedDepartment.id, 'positions', person.id, 'name', value)}
                                      className="text-xs leading-tight uppercase"
                                    />
                                    <EditableField
                                      value={`(${person.empId})`}
                                      onSave={(value) => handleEdit(selectedDepartment.id, 'positions', person.id, 'empId', value.replace(/[()]/g, ''))}
                                      className="text-xs leading-tight uppercase"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Kolom 4 - Engineer */}
                            <div className="space-y-4 flex flex-col items-center">
                              {dept.positions.filter(p => p.group === 'ENGINEER').map((person, i) => (
                                <div key={i} className="bg-white border border-gray-400 rounded shadow-sm w-[240px]">
                                  <div className="flex">
                                    <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                                      <p className="text-xs font-bold uppercase">{person.code}</p>
                                    </div>
                                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                                      <p className="text-xs font-semibold mb-1 leading-tight uppercase">{person.title}</p>
                                      <hr className="my-1 border-gray-300" />
                                      <EditableField
                                        value={person.name}
                                        onSave={(value) => handleEdit(selectedDepartment.id, 'positions', person.id, 'name', value)}
                                        className="text-xs leading-tight uppercase"
                                      />
                                      <EditableField
                                        value={`(${person.empId})`}
                                        onSave={(value) => handleEdit(selectedDepartment.id, 'positions', person.id, 'empId', value.replace(/[()]/g, ''))}
                                        className="text-xs leading-tight uppercase"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Kolom 5 - Team Member/Technician */}
                            <div className="space-y-4 flex flex-col items-center">
                              {dept.positions.filter(p => p.group === 'TEAM MEMBER/TECHNICIAN').map((person, i) => (
                                <div key={i} className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[240px]">
                                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                                    <p className="text-xs font-bold uppercase">{person.code}</p>
                                  </div>
                                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                                    <p className="text-xs font-semibold mb-1 leading-tight uppercase">{person.title}</p>
                                    <hr className="my-1 border-gray-300" />
                                    <EditableField
                                      value={person.name}
                                      onSave={(value) => handleEdit(selectedDepartment.id, 'positions', person.id, 'name', value)}
                                      className="text-xs leading-tight uppercase"
                                    />
                                    <EditableField
                                      value={`(${person.empId})`}
                                      onSave={(value) => handleEdit(selectedDepartment.id, 'positions', person.id, 'empId', value.replace(/[()]/g, ''))}
                                      className="text-xs leading-tight uppercase"
                                    />
                                  </div>
                                </div>
                              ))}
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
                  </div>
                </div>
              </div>
            </div>

            {/* Header Rows - 6 kolom seperti PPIC asli */}
            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              <div className="grid grid-cols-6 gap-4 mb-4">
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
                  <h3 className="font-bold text-xs text-black">UNIT HEAD/STAFF</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">GROUP HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">MEMBER</h3>
                </div>
              </div>
            </div>

            {/* Content Grid - 6 kolom sesuai PPIC asli */}
            <div className="grid grid-cols-6 gap-4 relative org-grid" style={{ zIndex: 2 }}>
              
              {/* Kolom 1 - Board of Director - Empty */}
              <div className="space-y-3 flex flex-col items-center">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 2 - Department Head */}
              <div className="space-y-3 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[200px]">
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                    <p className="text-xs font-bold">{dept.header.code}</p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-1 leading-tight">PPC</p>
                    <hr className="my-1 border-gray-300" />
                    <EditableField
                      value={dept.header.head}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'head', value)}
                      className="text-xs leading-tight"
                    />
                    <EditableField
                      value={`(${dept.header.empId})`}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'empId', value.replace(/[()]/g, ''))}
                      className="text-xs leading-tight"
                    />
                  </div>
                </div>
              </div>

              {/* Kolom 3 - Section Head - Empty */}
              <div className="space-y-3 flex flex-col items-center">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 4 - Unit Head/Staff */}
              <div className="space-y-3 flex flex-col items-center">
                {dept.positions.slice(0, 3).map((staff, i) => (
                  <div key={i} className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[200px]">
                    <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                      <p className="text-xs font-bold">{staff.code}</p>
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <p className="text-xs font-semibold mb-1 leading-tight">{staff.title}</p>
                      <hr className="my-1 border-gray-300" />
                      <EditableField
                        value={staff.name}
                        onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'name', value)}
                        className="text-xs leading-tight"
                      />
                      <EditableField
                        value={`(${staff.empId})`}
                        onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'empId', value.replace(/[()]/g, ''))}
                        className="text-xs leading-tight"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Kolom 5 - Group Head */}
              <div className="space-y-3 flex flex-col items-center">
                {dept.positions.slice(3, 4).map((staff, i) => (
                  <div key={i} className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[200px]" style={{ marginTop: '475px' }}>
                    <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                      <p className="text-xs font-bold">{staff.code}</p>
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <p className="text-xs font-semibold mb-1 leading-tight">{staff.title}</p>
                      <hr className="my-1 border-gray-300" />
                      <EditableField
                        value={staff.name}
                        onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'name', value)}
                        className="text-xs leading-tight"
                      />
                      <EditableField
                        value={`(${staff.empId})`}
                        onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'empId', value.replace(/[()]/g, ''))}
                        className="text-xs leading-tight"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Kolom 6 - Member */}
              <div className="space-y-3 flex flex-col items-center">
                {dept.positions.slice(4).map((staff, i) => (
                  <div key={i} className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] w-[200px]">
                    <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                      <p className="text-xs font-bold">{staff.code}</p>
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <p className="text-xs font-semibold mb-1 leading-tight">{staff.title}</p>
                      <hr className="my-1 border-gray-300" />
                      <EditableField
                        value={staff.name}
                        onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'name', value)}
                        className="text-xs leading-tight"
                      />
                      <EditableField
                        value={`(${staff.empId})`}
                        onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'empId', value.replace(/[()]/g, ''))}
                        className="text-xs leading-tight"
                      />
                    </div>
                  </div>
                ))}
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
      );
    }

    // Purchasing Layout
    if (selectedDepartment.id === 'purchasing') {
      return (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1000px] relative p-4">
            
            {/* Header Section with borders */}
            <div className="mb-4 border-2 border-black p-3">
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
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">({dept.header.title})</h3>
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
                            <p className="text-sm font-bold text-black underline leading-tight">{dept.header.head}</p>
                            <p className="text-sm text-black leading-tight">DEPT. HEAD</p>
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
              <div className="grid grid-cols-4 gap-4 mb-4">
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
                    <p className="text-sm font-semibold mb-2 leading-tight">PRESIDENT DIRECTOR</p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
                    <p className="text-sm leading-tight">(23200235)</p>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.1</p>
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">DIRECTOR</p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>
              </div>

              {/* Kolom 2 - Department Head - Empty */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 3 - Section Head */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">{dept.header.code}</p>
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">PROCUREMENT &<br />PURCHASING</p>
                    <hr className="my-2 border-gray-300" />
                    <EditableField
                      value={dept.header.head}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'head', value)}
                      className="text-sm leading-tight"
                    />
                    <EditableField
                      value={`(${dept.header.empId})`}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'empId', value.replace(/[()]/g, ''))}
                      className="text-sm leading-tight"
                    />
                  </div>
                </div>
              </div>

              {/* Kolom 4 - Staff Level */}
              <div className="space-y-4 flex flex-col items-center">
                {dept.positions.map((staff, i) => (
                  <div key={i} className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                      <p className="text-sm font-bold">{staff.code}</p>
                    </div>
                    <div className="p-3 flex-1 text-center flex flex-col justify-center">
                      <p className="text-sm font-semibold mb-2 leading-tight">{staff.title}</p>
                      <hr className="my-2 border-gray-300" />
                      <EditableField
                        value={staff.name}
                        onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'name', value)}
                        className="text-sm leading-tight"
                      />
                      <EditableField
                        value={`(${staff.empId})`}
                        onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'empId', value.replace(/[()]/g, ''))}
                        className="text-sm leading-tight"
                      />
                    </div>
                  </div>
                ))}
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
      );
    }

    // MI & SHE Layout
    if (selectedDepartment.id === 'mi-she'){
      return(
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1000px] relative p-4">

            {/* Header Section with borders */}
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div className="w-32 flex items-center justify-center p-4 border-2 border-black" style={{ height: '160px' }}>
                  <img 
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="border-2 border-black p-4 text-center flex items-center flex-1 mr-1" style={{ height: '160px' }}>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-xl font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">({dept.header.title})</h3>
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
                            <p className="text-sm font-bold text-black underline leading-tight">{dept.header.head}</p>
                            <p className="text-sm text-black leading-tight">DEPT. HEAD</p>
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
                          <div className="h-16">
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
            </div>

            {/* Header Rows */}
            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              <div className="grid grid-cols-4 gap-4 mb-4">
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
                    <p className="text-sm font-semibold mb-2 leading-tight">PRESIDENT DIRECTOR</p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
                    <p className="text-sm leading-tight">(23200235)</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.1</p>
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">DIRECTOR</p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>
              </div>

              {/* Kolom 2 - Department Head - Empty */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 3 - Section Head*/}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">{dept.header.code}</p>
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">MI & SHE</p>
                    <hr className="my-2 border-gray-300" />
                    <EditableField
                      value={dept.header.head}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'head, value')}
                      className="text-sm leading-tight"
                    />
                    <EditableField
                     value={`(${dept.header.empId})`} 
                     onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'empId', value.replace(/[()]/g, ''))}
                     className="text-sm leading-tight"
                    />
                  </div>
                </div>
              </div>

              {/* Kolom 4 - Staff Level */}
              <div className="space-y-4 flex flex-col items-center">
                {dept.positions.map((staff, i) => (
                  <div key={i} className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                      <p className="text-sm font-bold">{staff.code}</p>
                    </div>
                    <div className="p-3 flex-1 text-center flex flex-col justify-center">
                      <p className="text-sm font-semibold mb-2 leading-tight">{staff.title}</p>
                      <hr className="my-2 border-gray-300" />
                      <EditableField
                        value={staff.name}
                        onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'name', value)}
                        className="text-sm leading-tight"
                      />
                      <EditableField
                        value={`(${staff.empId})`}
                        onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'empId', value.replace(/[()]/g, ''))}
                        className="text-sm leading-tight"
                      />
                    </div>
                  </div>
                ))}
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
      );
    }

    // Layout untuk departemen lain yang belum memiliki layout khusus
    // Menggunakan layout generic yang tetap editable
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
        <div className="min-w-[1000px] relative p-4">
          
          {/* Header Section with borders */}
          <div className="mb-4 border-2 border-black p-3">
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
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">({dept.header.title})</h3>
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
                          <p className="text-sm font-bold text-black underline leading-tight">{dept.header.head}</p>
                          <p className="text-sm text-black leading-tight">DEPT. HEAD</p>
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
            <div className="grid grid-cols-4 gap-4 mb-4">
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
                <h3 className="font-bold text-xs text-black">STAFF</h3>
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
                  <p className="text-sm font-semibold mb-2 leading-tight">PRESIDENT DIRECTOR</p>
                  <hr className="my-2 border-gray-300" />
                  <p className="text-sm leading-tight">EKO MARYANTO</p>
                  <p className="text-sm leading-tight">(23200235)</p>
                </div>
              </div>
              
              <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                  <p className="text-sm font-bold">BOD1.1</p>
                </div>
                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                  <p className="text-sm font-semibold mb-2 leading-tight">DIRECTOR</p>
                  <hr className="my-2 border-gray-300" />
                  <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                  <p className="text-sm leading-tight">(23200038)</p>
                </div>
              </div>
            </div>

            {/* Kolom 2 - Department Head - Bisa kosong atau berisi department head */}
            <div className="space-y-4 flex flex-col items-center">
              {dept.header.code && dept.header.code.includes('1.0') && (
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">{dept.header.code}</p>
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">DEPT. HEAD</p>
                    <hr className="my-2 border-gray-300" />
                    <EditableField
                      value={dept.header.head}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'head', value)}
                      className="text-sm leading-tight"
                    />
                    <EditableField
                      value={`(${dept.header.empId})`}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'empId', value.replace(/[()]/g, ''))}
                      className="text-sm leading-tight"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Kolom 3 - Section Head - Jika department head tidak ada di kolom 2 */}
            <div className="space-y-4 flex flex-col items-center">
              {!(dept.header.code && dept.header.code.includes('1.0')) && (
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">{dept.header.code}</p>
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <EditableField
                      value={dept.header.title}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'title', value)}
                      className="text-sm font-semibold mb-2 leading-tight"
                    />
                    <hr className="my-2 border-gray-300" />
                    <EditableField
                      value={dept.header.head}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'head', value)}
                      className="text-sm leading-tight"
                    />
                    <EditableField
                      value={`(${dept.header.empId})`}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'header', null, 'empId', value.replace(/[()]/g, ''))}
                      className="text-sm leading-tight"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Kolom 4 - Staff */}
            <div className="space-y-4 flex flex-col items-center">
              {dept.positions.map((staff, i) => (
                <div key={i} className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">{staff.code}</p>
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <EditableField
                      value={staff.title}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'title', value)}
                      className="text-sm font-semibold mb-2 leading-tight"
                    />
                    <hr className="my-2 border-gray-300" />
                    <EditableField
                      value={staff.name}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'name', value)}
                      className="text-sm leading-tight"
                    />
                    <EditableField
                      value={`(${staff.empId})`}
                      onSave={(value) => handleEdit(selectedDepartment.id, 'positions', staff.id, 'empId', value.replace(/[()]/g, ''))}
                      className="text-sm leading-tight"
                    />
                  </div>
                </div>
              ))}
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
    );
  };

  return (
    <Layout sidebarVisible={sidebarVisible}>
      <div className="min-h-screen bg-gray-50 p-4">
        {!selectedDepartment ? (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">SO Bagian</h1>
            <p className="text-gray-600">Edit struktur organisasi untuk semua departemen</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Pilih Departemen untuk Edit</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => {
                  setSelectedDepartment(dept);
                  setSidebarVisible(false);
                }}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{dept.name}</h3>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h6m-3-3v6m7-7a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    {departmentData[dept.id]?.header?.head || 'TBD'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {departmentData[dept.id]?.positions?.length || 0} positions
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : selectedDepartment && departmentData[selectedDepartment.id] ? (
          <div className="space-y-4">
          {/* Editor Toolbar */}
          <div className="bg-white shadow-sm border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setSelectedDepartment(null);
                    setSidebarVisible(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Selection
                </button>
                <h2 className="text-xl font-semibold">{selectedDepartment.name}</h2>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isEditMode
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isEditMode ? 'View Mode' : 'Edit Mode'}
                </button>
              </div>
              
              <button
                onClick={() => saveDepartment(selectedDepartment.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>

            {/* Save confirmation */}
            {showSaveDialog && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">✅ Changes saved successfully!</p>
                <p className="text-green-700 text-sm mt-1">
                  Department page will reflect these changes immediately.
                </p>
              </div>
            )}
          </div>

          {/* Department Structure Editor with Department-Specific Layout */}
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            {renderDepartmentSpecificLayout()}
          </div>
        </div>
      ) : null}
      </div>
    </Layout>
  );
};

export default SoBagianEditor;