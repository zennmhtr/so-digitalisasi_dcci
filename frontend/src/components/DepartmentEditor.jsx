import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DepartmentEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [departmentData, setDepartmentData] = useState(null);

  const hasAccess = React.useMemo(() => {
    const userRole = user?.role;
    const userPermissions = typeof userRole === 'object' ? userRole?.permissions : [];
    return user && userPermissions?.includes('SO DCI Editor');
  }, [user]);

  const departmentConfigs = {
    'finance-department': {
      name: 'Finance Department',
      title: 'FINANCE & ACCOUNTING DEPARTMENT',
      storageKey: 'finance-department-data',
      route: '/finance-department'
    },
    'hrga-it-department': {
      name: 'HRGA & IT Department', 
      title: 'HRDGA & IT DEPARTMENT',
      storageKey: 'hrga-it-department-data',
      route: '/hrga-it-department'
    },
    'manufactur-battery': {
      name: 'Manufacturing Battery',
      title: 'BATTERY PRODUCTION DEPARTMENT',
      storageKey: 'manufactur-battery-data',
      route: '/manufactur-battery'
    },
    'manufacturing-cable': {
      name: 'Manufacturing Cable',
      title: 'CONTROLCABLE MANUFACTURE DEPARTMENT', 
      storageKey: 'manufacturing-cable-data',
      route: '/manufacturing-cable'
    },
    'marketing-battery-department': {
      name: 'Marketing Battery',
      title: 'MARKETING BATTERY DEPARTMENT',
      storageKey: 'marketing-battery-department-data',
      route: '/marketing-battery-department'
    },
    'marketing-engineering': {
      name: 'Marketing Engineering',
      title: 'MARKETING ENGINEERING DEPARTMENT',
      storageKey: 'marketing-engineering-data', 
      route: '/marketing-engineering'
    },
    'management-development': {
      name: 'Management Development',
      title: 'MANAGEMENT DEVELOPMENT DEPARTMENT',
      storageKey: 'management-development-data',
      route: '/management-development'
    },
    'management-representative': {
      name: 'Management Representative',
      title: 'MANAGEMENT REPRESENTATIVE DEPARTMENT',
      storageKey: 'management-representative-data',
      route: '/management-representative'
    },
    'mi-she': {
      name: 'MI & SHE',
      title: 'MI & SHE DEPARTMENT',
      storageKey: 'mi-she-data',
      route: '/mi-she'
    },
    'ppic': {
      name: 'PPIC',
      title: 'PPC & WAREHOUSE DEPARTMENT',
      storageKey: 'ppic-data',
      route: '/ppic'
    },
    'purchasing': {
      name: 'Purchasing',
      title: 'PURCHASING DEPARTMENT',
      storageKey: 'purchasing-data',
      route: '/purchasing'
    },
    'qa-department': {
      name: 'QA Department',
      title: 'QUALITY ASSURANCE DEPARTMENT',
      storageKey: 'qa-department-data',
      route: '/qa-department'
    }
  };

  const currentDept = departmentConfigs[departmentId];

  useEffect(() => {
    if (!currentDept) return;

    const getInitialData = () => {
      switch(departmentId) {
        case 'manufactur-battery':
          return {
            header: {
              title: currentDept.title,
              effectiveDate: "30 September 2025"
            },
            signatures: {
              preparedBy: { name: "DIKI WAHYUDI", date: "30/09/2025" },
              middleBy: { title: "DIKI WAHYUDI", name: "DIKI WAHYUDI", date: "30/09/2025" },
              approvedBy: { name: "EKO MARYANTO", date: "30/09/2025" }
            },
            structure: {
              departments: [
                { id: 'bod-1-0', code: 'BOD1.0', title: 'PRESIDENT DIRECTOR', name: 'EKO MARYANTO', empId: '23200235', group: 'BOARD OF DIRECTOR' },
                { id: 'bod-1-1', code: 'BOD1.1', title: 'DIRECTOR', name: 'BAMBANG WURYANTO', empId: '23200038', group: 'BOARD OF DIRECTOR' },
                { id: 'prd-2-0', code: 'PRD2.0', title: 'BATTERY PRODUCTION & PME', name: 'DIONISIUS AUGUSTO**', empId: '23220105', group: 'DEPARTMENT HEAD' }
              ],
              sections: [
                // ENGINEER
                { id: 'prd-2-1', code: 'PRD2.1', title: 'BATTERY PRODUCTION', name: 'YEREMIA SOTYA', empId: '23230135', group: 'ENGINEER' },
                { id: 'prd-2-2', code: 'PRD2.2', title: 'BATTERY PRODUCTION', name: 'ASEP AGUNG WIGUNA', empId: '23190805', group: 'ENGINEER' },
                // SENIOR ENGINEER
                { id: 'prd-2-3', code: 'PRD2.3', title: 'QUALITY ASSURANCE', name: 'ADHITYA SATIAWA SURYADATA', empId: '23230091', group: 'SENIOR ENGINEER' },
                { id: 'prd-3-0', code: 'PRD3.0', title: 'BATTERY PME', name: 'TBR', empId: '', group: 'SENIOR ENGINEER' },
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
          };

        case 'finance-department':
          return {
            header: {
              title: currentDept.title,
              effectiveDate: "08/09/2025"
            },
            signatures: {
              preparedBy: { name: "Diki Wahyudi", date: "08/09/2025" },
              middleBy: { title: "Bambang Wuryanto", name: "Bambang Wuryanto", date: "08/09/2025" },
              approvedBy: { name: "Eko Maryanto", date: "08/09/2025" }
            },
            structure: {
              departments: [
                { id: 'fin-1-0', code: 'FIN1.0', title: 'FINANCE & ACCOUNTING', name: 'YULIUS PERMATA', empId: '23220017' }
              ],
              sections: [
                { id: 'fin-1-1', code: 'FIN1.1', title: 'FINANCE', name: 'YULIUS PERMATA', empId: '23220017' },
                { id: 'fin-1-2', code: 'FIN1.2', title: 'ACCOUNTING', name: 'STAFF ACCOUNTING', empId: '' }
              ]
            }
          };

        case 'hrga-it-department':
          return {
            header: {
              title: currentDept.title,
              effectiveDate: "30 September 2025"
            },
            signatures: {
              preparedBy: { name: "DIKI WAHYUDI", date: "30/09/2025" },
              middleBy: { title: "DIKI WAHYUDI", name: "DIKI WAHYUDI", date: "30/09/2025" },
              approvedBy: { name: "BAMBANG WURYANTO", date: "30/09/2025" }
            },
            structure: {
              departments: [
                { id: 'bod-1-0', code: 'BOD1.0', title: 'DIRECTOR', name: 'BAMBANG WURYANTO', empId: '23200038' },
                { id: 'bod-1-1', code: 'BOD1.1', title: 'DIRECTOR', name: 'BAMBANG WURYANTO', empId: '23200038' }
              ],
              sections: [
                { id: 'hrd-1-0', code: 'HRD1.0', title: 'HRDGA & IT', name: 'DIKI WAHYUDI *', empId: '23060056' },
                { id: 'hrd-2-0', code: 'HRD2.0', title: 'VERONICA HANI M. **', name: 'VERONICA HANI M. **', empId: '23240206' },
                { id: 'hrd-1-1', code: 'HRD1.1', title: 'HRD', name: 'THARISA ARRAHMA R.', empId: '23230072' },
                { id: 'ga-1-1', code: 'GA1.1', title: 'GENERAL AFFAIR & IND. RELATIONS', name: 'SUPRIADI', empId: '23120131' },
                { id: 'ga-1-2', code: 'GA1.2', title: 'GENERAL AFFAIR & IND. RELATIONS', name: 'PARTINI LUPI', empId: '23110116' },
                { id: 'ga-1-3', code: 'GA1.3', title: 'GENERAL AFFAIR & IND. RELATIONS', name: 'MIMBARYANTO', empId: '23120158' },
                { id: 'it-1-1', code: 'IT1.1', title: 'INFORMATION TECHNOLOGY', name: 'ROZIQIN', empId: '23070074' },
                { id: 'it-1-2', code: 'IT1.2', title: 'INFORMATION TECHNOLOGY', name: 'FARHANSYAH A.L', empId: '23220040' }
              ]
            }
          };

        case 'manufacturing-cable':
          return {
            header: {
              title: currentDept.title,
              effectiveDate: "08/09/2025"
            },
            signatures: {
              preparedBy: { name: "Diki Wahyudi", date: "08/09/2025" },
              middleBy: { title: "Bambang Wuryanto", name: "Bambang Wuryanto", date: "08/09/2025" },
              approvedBy: { name: "Eko Maryanto", date: "08/09/2025" }
            },
            structure: {
              departments: [
                { id: 'prd-1-0', code: 'PRD1.0', title: 'CONTROLCABLE MANUFACTURE', name: 'KARNA SATIA SALIM*', empId: '23230114' }
              ],
              sections: [
                { id: 'prd-1-1', code: 'PRD1.1', title: 'PRODUCTION LEADER', name: 'RANGGA ARIF FATAH', empId: '23190808' },
                { id: 'prd-1-2', code: 'PRD1.2', title: 'QUALITY CONTROL', name: 'BAYU ALDI PRATAMA', empId: '23230088' }
              ]
            }
          };

        case 'management-development':
          return {
            header: {
              title: currentDept.title,
              effectiveDate: "30 September 2025"
            },
            signatures: {
              preparedBy: { name: "", date: "30/09/2025" },
              middleBy: { title: "DIKI WAHYUDI", name: "DIKI WAHYUDI", date: "30/09/2025" },
              approvedBy: { name: "BAMBANG WURYANTO", date: "30/09/2025" }
            },
            structure: {
              departments: [],
              sections: [
                { id: 'mdo-1', code: 'MDO1.0', title: 'MANAGEMENT DEVELOPEMENT/PDCA', name: 'KARNA SATIA SALIM*', empId: '23230114' },
                { id: 'mdo-2', code: 'MDO2.0', title: 'MANAGEMENT DEVELOPEMENT/PDCA', name: 'WAHYU KARTIKO ADI', empId: '23240175' }
              ]
            }
          };

        default:
          return {
            header: {
              title: currentDept.title,
              effectiveDate: "08/09/2025"
            },
            signatures: {
              preparedBy: { name: "Diki Wahyudi", date: "08/09/2025" },
              middleBy: { title: "Bambang Wuryanto", name: "Bambang Wuryanto", date: "08/09/2025" },
              approvedBy: { name: "Eko Maryanto", date: "08/09/2025" }
            },
            structure: {
              departments: [],
              sections: []
            }
          };
      }
    };

    const initialData = getInitialData();
    
    const savedData = localStorage.getItem(currentDept.storageKey);
    if (savedData) {
      try {
        setDepartmentData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error parsing saved data:', error);
        setDepartmentData(initialData);
      }
    } else {
      setDepartmentData(initialData);
    }
  }, [departmentId, currentDept]);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the Department Editor.</p>
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

  if (!departmentData || !currentDept) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading department data...</p>
        </div>
      </div>
    );
  }

  const handleEdit = (category, id, field, value) => {
    setDepartmentData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      
      if (category === 'header') {
        newData.header[field] = value;
      } else if (category === 'signatures') {
        if (id === 'preparedBy' || id === 'middleBy' || id === 'approvedBy') {
          newData.signatures[id][field] = value;
        }
      } else {
        const item = newData.structure[category]?.find(item => item.id === id);
        if (item) {
          item[field] = value;
        }
      }
      
      return newData;
    });
  };

  const saveLayout = async () => {
    try {
      const dataToSave = {
        ...departmentData,
        lastModified: new Date().toISOString(),
        modifiedBy: user?.name || user?.username
      };
      
      localStorage.setItem(currentDept.storageKey, JSON.stringify(dataToSave));
      
      window.dispatchEvent(new CustomEvent(`${departmentId}-data-updated`, { 
        detail: dataToSave 
      }));
      
      setShowSaveDialog(true);
      setTimeout(() => {
        setShowSaveDialog(false);
      }, 3000);
      
      console.log(`✅ ${currentDept.name} data saved successfully`);
    } catch (error) {
      console.error('Error saving department data:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const EditableBox = ({ item, category, className = "" }) => {
    const [isEditing, setIsEditing] = useState({});

    const startEdit = (field) => {
      if (isEditMode) {
        setIsEditing(prev => ({ ...prev, [field]: true }));
      }
    };

    const finishEdit = (field, value) => {
      handleEdit(category, item.id, field, value);
      setIsEditing(prev => ({ ...prev, [field]: false }));
    };

    const renderEditableField = (field, value, placeholder = "") => {
      if (isEditing[field]) {
        return (
          <input
            type="text"
            defaultValue={value}
            className="w-full px-1 py-0.5 text-xs border rounded bg-yellow-50"
            placeholder={placeholder}
            autoFocus
            onBlur={(e) => finishEdit(field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                finishEdit(field, e.target.value);
              } else if (e.key === 'Escape') {
                setIsEditing(prev => ({ ...prev, [field]: false }));
              }
            }}
          />
        );
      }

      return (
        <span
          onClick={() => startEdit(field)}
          className={isEditMode ? 'cursor-pointer hover:bg-yellow-100 rounded px-1' : ''}
          title={isEditMode ? 'Click to edit' : ''}
        >
          {value || placeholder}
        </span>
      );
    };

    return (
      <div className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] ${className} ${
        isEditMode ? 'ring-2 ring-blue-200' : ''
      }`}>
        <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
          <p className="text-xs font-bold">
            {renderEditableField('code', item.code, 'CODE')}
          </p>
        </div>
        <div className="p-2 flex-1 text-center flex flex-col justify-center">
          <p className="text-xs font-semibold mb-1 leading-tight">
            {renderEditableField('title', item.title, 'Title')}
          </p>
          {(item.name || isEditMode) && (
            <>
              <hr className="my-1 border-gray-300" />
              <p className="text-xs leading-tight">
                {renderEditableField('name', item.name, 'Name')}
              </p>
              {(item.empId || isEditMode) && (
                <p className="text-xs leading-tight">
                  ({renderEditableField('empId', item.empId, 'ID')})
                </p>
              )}
            </>
          )}
          {isEditMode && (
            <p className="text-xs text-gray-500 mt-1">Click fields to edit</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Toolbar */}
      <div className="bg-white shadow-sm border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">{currentDept.name} Editor</h1>
            <div className="flex items-center space-x-2">
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
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={saveLayout}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Save Changes
            </button>
           
            <button
              onClick={() => navigate(currentDept.route)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              → View Department
            </button>

            <button
              onClick={() => navigate('/dashboard-editor')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ← Back to Main Editor
            </button>
          </div>
        </div>
        
        {/* Save confirmation */}
        {showSaveDialog && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">✅ {currentDept.name} changes saved successfully!</p>
            <p className="text-green-700 text-sm mt-1">
              ✨ Department page has been automatically updated with your changes.
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 flex items-center justify-center mr-4 p-2">
              <img 
                src="/logo/Logo DG New 2022.png" 
                alt="Dharma Group Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">
                {isEditMode ? (
                  <input
                    type="text"
                    value={departmentData.header.title}
                    onChange={(e) => handleEdit('header', null, 'title', e.target.value)}
                    className="bg-yellow-50 border rounded px-2 py-1"
                  />
                ) : (
                  departmentData.header.title
                )}
              </h1>
              <h2 className="text-lg font-semibold text-gray-700">PT DHARMA CONTROLCABLE INDONESIA</h2>
              <p className="text-sm text-gray-500">
                Effective Date: {isEditMode ? (
                  <input
                    type="text"
                    value={departmentData.header.effectiveDate}
                    onChange={(e) => handleEdit('header', null, 'effectiveDate', e.target.value)}
                    className="bg-yellow-50 border rounded px-2 py-1 ml-1"
                  />
                ) : (
                  departmentData.header.effectiveDate
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Department Structure */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Department Head */}
            {departmentData.structure.departments?.map((item) => (
              <div key={item.id} className="space-y-3">
                <h3 className="text-center font-bold text-sm bg-blue-300 text-white p-2 rounded">DEPARTMENT HEAD</h3>
                <EditableBox item={item} category="departments" />
              </div>
            ))}

            {/* Sections */}
            {departmentData.structure.sections?.map((item) => (
              <div key={item.id} className="space-y-3">
                <h3 className="text-center font-bold text-sm bg-green-300 text-white p-2 rounded">SECTION</h3>
                <EditableBox item={item} category="sections" />
              </div>
            ))}

          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-8 mb-8">
          <div className="border border-gray-400 p-6 bg-white">
            <div className="grid grid-cols-3 gap-8">
              {/* Prepared By */}
              <div className="text-center">
                <div className="border-b border-gray-400 pb-2 mb-4">
                  <p className="text-sm font-bold">Prepared By :</p>
                </div>
                <div className="w-32 h-16 border border-gray-300 mx-auto mb-4 bg-gray-50 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Signature</span>
                </div>
                <div className="border-b border-gray-300 mx-auto w-32 mb-2"></div>
                <p className="text-sm font-semibold underline mb-1">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={departmentData.signatures?.preparedBy?.name || 'Diki Wahyudi'}
                      onChange={(e) => handleEdit('signatures', 'preparedBy', 'name', e.target.value)}
                      className="bg-yellow-50 border rounded px-2 py-1 text-sm text-center w-full"
                    />
                  ) : (
                    departmentData.signatures?.preparedBy?.name || 'Diki Wahyudi'
                  )}
                </p>
                <p className="text-xs">
                  Prep Date : {isEditMode ? (
                    <input
                      type="text"
                      value={departmentData.signatures?.preparedBy?.date || '08/09/2025'}
                      onChange={(e) => handleEdit('signatures', 'preparedBy', 'date', e.target.value)}
                      className="bg-yellow-50 border rounded px-1 text-xs w-20 ml-1"
                    />
                  ) : (
                    departmentData.signatures?.preparedBy?.date || '08/09/2025'
                  )}
                </p>
              </div>

              {/* Middle - Bambang Wuryanto */}
              <div className="text-center">
                <div className="border-b border-gray-400 pb-2 mb-4">
                  <p className="text-sm font-bold">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={departmentData.signatures?.middleBy?.title || 'Bambang Wuryanto'}
                        onChange={(e) => handleEdit('signatures', 'middleBy', 'title', e.target.value)}
                        className="bg-yellow-50 border rounded px-2 py-1 text-sm text-center w-full"
                      />
                    ) : (
                      departmentData.signatures?.middleBy?.title || 'Bambang Wuryanto'
                    )}
                  </p>
                </div>
                <div className="w-32 h-16 border border-gray-300 mx-auto mb-4 bg-gray-50 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Signature</span>
                </div>
                <div className="border-b border-gray-300 mx-auto w-32 mb-2"></div>
                <p className="text-sm font-semibold underline mb-1">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={departmentData.signatures?.middleBy?.name || 'Bambang Wuryanto'}
                      onChange={(e) => handleEdit('signatures', 'middleBy', 'name', e.target.value)}
                      className="bg-yellow-50 border rounded px-2 py-1 text-sm text-center w-full"
                    />
                  ) : (
                    departmentData.signatures?.middleBy?.name || 'Bambang Wuryanto'
                  )}
                </p>
                <p className="text-xs">
                  Prepared Date : {isEditMode ? (
                    <input
                      type="text"
                      value={departmentData.signatures?.middleBy?.date || '08/09/2025'}
                      onChange={(e) => handleEdit('signatures', 'middleBy', 'date', e.target.value)}
                      className="bg-yellow-50 border rounded px-1 text-xs w-20 ml-1"
                    />
                  ) : (
                    departmentData.signatures?.middleBy?.date || '08/09/2025' 
                  )}
                </p>
              </div>

              {/* Approved By */}
              <div className="text-center">
                <div className="border-b border-gray-400 pb-2 mb-4">
                  <p className="text-sm font-bold">Approved By :</p>
                </div>
                <div className="w-32 h-16 border border-gray-300 mx-auto mb-4 bg-gray-50 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Signature</span>
                </div>
                <div className="border-b border-gray-300 mx-auto w-32 mb-2"></div>
                <p className="text-sm font-semibold underline mb-1">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={departmentData.signatures?.approvedBy?.name || 'Eko Maryanto'}
                      onChange={(e) => handleEdit('signatures', 'approvedBy', 'name', e.target.value)}
                      className="bg-yellow-50 border rounded px-2 py-1 text-sm text-center w-full"
                    />
                  ) : (
                    departmentData.signatures?.approvedBy?.name || 'Eko Maryanto'
                  )}
                </p>
                <p className="text-xs">
                  Prepared Date : {isEditMode ? (
                    <input
                      type="text"
                      value={departmentData.signatures?.approvedBy?.date || '08/09/2025'}
                      onChange={(e) => handleEdit('signatures', 'approvedBy', 'date', e.target.value)}
                      className="bg-yellow-50 border rounded px-1 text-xs w-20 ml-1"
                    />
                  ) : (
                    departmentData.signatures?.approvedBy?.date || '08/09/2025'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-bold text-sm mb-2">DEPARTMENT EDITOR FEATURES:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-green-700">
            <div>
              <p>• <strong>Click-to-edit</strong> any text field</p>
              <p>• <strong>Real-time visual feedback</strong></p>
              <p>• <strong>Department-specific structure</strong></p>
            </div>
            <div>
              <p>• <strong>Permission-based access</strong></p>
              <p>• <strong>Auto-sync with department pages</strong></p>
              <p>• <strong>Header, dates & signatures editable</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentEditor;