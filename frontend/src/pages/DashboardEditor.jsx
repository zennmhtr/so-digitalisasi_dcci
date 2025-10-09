import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [organizationData, setOrganizationData] = useState(null);

  // Check if user has Dashboard Editor permission
  const hasAccess = React.useMemo(() => {
    const userRole = user?.role;
    const userPermissions = typeof userRole === 'object' ? userRole?.permissions : [];
    console.log('Dashboard Editor Debug:', {
      user: user?.name,
      userRole: userRole?.name,
      userPermissions,
      hasAccess: userPermissions?.includes('Dashboard Editor')
    });
    return user && userPermissions?.includes('Dashboard Editor');
  }, [user]);

  // Initialize organization data - COMPLETE data from Dashboard
  useEffect(() => {
    const initialData = {
      header: {
        title: "ORGANIZATION STRUCTURE",
        company: "PT DHARMA CONTROLCABLE INDONESIA",
        effectiveDate: "08/09/2025",
        regNo: "08/10/2025",
        preparedDate: "08/09/2025",
        approvedDate: "08/09/2025"
      },
      commissioners: {
        president: {
          title: "PRESIDENT COMMISIONER",
          name: "IRIANTO SANTOSO"
        },
        commissioners: [
          "SUBAGIO",
          "HONG KUO MING", 
          "LIAO CHIN HSIEN"
        ]
      },
      structure: {
        // Board of Directors - Column 1
        bod: [
          { id: 'bod-1', code: 'BOD1.0', title: 'PRESIDENT DIRECTOR', name: 'EKO MARYANTO', empId: '23100235' },
          { id: 'bod-2', code: 'BOD1.1', title: 'DIRECTOR', name: 'BAMBANG WURYANTO', empId: '23200038' }
        ],
        // Management Functions - Column 2
        management: [
          { id: 'mio-1', code: 'MIO1.0', title: 'MI & SHE (5R-SMK3-ISO 14001)', name: 'ELIATA DUMAR GINTING', empId: '23190806', clickable: true, route: '/mi-she' },
          { id: 'mdo-1', code: 'MDO1.0', title: 'MANAGEMENT DEVELOPMENT/PDCA', name: 'KARINA SATIA SALIM*', empId: '23230114', type: 'combined', part: 1 },
          { id: 'mdo-2', code: 'MDO2.0', title: 'MANAGEMENT DEVELOPMENT/PDCA', name: 'WAHYU KARTIKO ADI', empId: '23240005', type: 'combined', part: 2, clickable: true, route: '/management-development' },
          { id: 'mro-1', code: 'MRO1.0', title: 'MANAGEMENT REPRESENTATIVE', name: 'SUGIYARTO*', empId: '23600041', clickable: true, route: '/management-representative' },
          { id: 'cro-1', code: 'CRO1.0', title: 'CUSTOMER REPRESENTATIVE 2 WHEEL', name: 'SUMIYARTO*', empId: '23030015' },
          { id: 'co2-1', code: 'CO2.0', title: 'CUSTOMER REPRESENTATIVE 4 WHEEL', name: 'DWI PURWANTO*', empId: '23030023' }
        ],
        // Division Labels - Column 3
        divisions: [
          { id: 'div-1', label: 'CONTROLCABLE BUSINESS', type: 'business-label' },
          { id: 'div-2', label: 'BATTERY BUSINESS', type: 'business-label' },
          { id: 'div-3', label: 'AFTERMARKET BUSINESS', type: 'business-label' }
        ],
        // Department Head - Column 4
        departments: [
          { id: 'qa-1', code: 'QAC1.0', title: 'QA', name: 'M BAGUS SANTOSO', empId: '23220025', clickable: true, route: '/qa-department' },
          { id: 'ppic-1', code: 'PPIC1.0', title: 'PPC & WAREHOUSE', name: 'DIKI WAHYUDI', empId: '23060056', clickable: true, route: '/ppic' },
          { id: 'mkt-eng', code: 'MKT1.0', title: 'MI & SHE (5R-SMK3-ISO 14001)', name: 'ANDREAS AGUNG S.', empId: '23040119', clickable: true, route: '/marketing-engineering' },
          { id: 'mkt-2', code: 'MKT2.0', title: 'MARKETING', name: 'RENDRA PRAMONO', empId: '23200067', clickable: true, route: '/marketing-battery-department' },
          { id: 'rnd-1', code: 'RND1.0', title: 'RND', name: 'RENDRA PRAMONO', empId: '23200067' },
          { id: 'qac-2', code: 'QAC2.0', title: 'QA/QC/DOC', name: 'RENDRA PRAMONO', empId: '23200067' },
          { id: 'mkt-3', code: 'MKT3.0', title: 'MARKETING', name: 'TBR', empId: '' }
        ],
        // Section Head / Engineering Product Leader - Column 5
        sections: [
          { id: 'prd-1', code: 'PRD1.0', title: 'CONTROLCABLE MANUFACTURE', name: 'KARNA SATIA SALIM*', empId: '23230114', clickable: true, route: '/manufacturing-cable' },
          { id: 'prd-2', code: 'PRD2.0', title: 'BATTERY PRODUCTION', name: 'DIONISIUS AUGUSTO**', empId: '23220105', clickable: true, route: '/manufactur-battery' },
          { id: 'prd-3', code: 'PRD3.0', title: 'BATTERY PME', name: 'DIONISIUS AUGUSTO**', empId: '23220105', clickable: true, route: '/manufactur-battery' },
          { id: 'mkt-1-1', code: 'MKT1.1', title: 'MARKETING', name: 'SAVITRI OCTAVIANI', empId: '23130254' },
          { id: 'eng-1', code: 'ENG1.0', title: 'ENGINEERING', name: 'SUGIYARTO', empId: '2360041' },
          { id: 'mkt-2-1', code: 'MKT2.1', title: 'AUX & POWER BATTERY MARKETING', name: 'CHRYSNA YULIAWAN**', empId: '23240177' },
          { id: 'mkt-2-2', code: 'MKT2.2', title: 'ESS MARKETING', name: 'FERDINAND STEVANUS A**', empId: '23220049' },
          { id: 'rnd-1-0', code: 'RND1.0', title: 'AUX & POWER BATTERY ENGINEERING PRODUCT LEADER', name: 'BRIAN BUDI SANTOSO**', empId: '23210077' },
          { id: 'rnd-2-0', code: 'RND2.0', title: 'ESS ENGINEERING PRODUCT LEADER', name: 'RAIHAN RAMADHAN**', empId: '23220104' },
          { id: 'rnd-3-0', code: 'RND3.0', title: 'MICRO CONTROLLER ENGINEERING PRODUCT LEADER', name: 'ELISABETH GUSTI**', empId: '23230087' },
          { id: 'qac-2-1', code: 'QAC2.1', title: 'BATTERY QA', name: 'BELLA TIURMA PRATIWI**', empId: '23230092' },
          { id: 'mkt-3-1', code: 'MKT3.1', title: 'MARKETING', name: 'TBR', empId: '' },
          { id: 'hrd-1', code: 'HRD1.0', title: 'HRDGA & IT', name: 'DIKI WAHYUDI*', empId: '23060056', clickable: true, route: '/hrga-it-department' },
          { id: 'pch-1', code: 'PCH1.0', title: 'PURCHASING', name: 'DIKI WAHYUDI*', empId: '23060056', clickable: true, route: '/purchasing' },
          { id: 'fin-1', code: 'FIN1.0', title: 'FINANCE & ACCOUNTING', name: 'YULIUS PERMATA', empId: '23220017', clickable: true, route: '/finance-department' }
        ]
      }
    };
    
    // Load from localStorage if exists
    const savedData = localStorage.getItem('dashboard-organization-data');
    if (savedData) {
      setOrganizationData(JSON.parse(savedData));
    } else {
      setOrganizationData(initialData);
    }
  }, []);

  // If no access, show access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the Dashboard Editor.</p>
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

  // Loading state
  if (!organizationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization data...</p>
        </div>
      </div>
    );
  }

  const handleEdit = (category, id, field, value) => {
    setOrganizationData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      
      if (category === 'header') {
        newData.header[field] = value;
      } else if (category === 'commissioners') {
        if (id === 'president') {
          newData.commissioners.president[field] = value;
        } else {
          const index = parseInt(id);
          newData.commissioners.commissioners[index] = value;
        }
      } else {
        const item = newData.structure[category].find(item => item.id === id);
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
        ...organizationData,
        lastModified: new Date().toISOString(),
        modifiedBy: user?.name || user?.username
      };
      
      // Save to localStorage
      localStorage.setItem('dashboard-organization-data', JSON.stringify(dataToSave));
      
      // Dispatch custom event to notify Dashboard component (same tab)
      window.dispatchEvent(new CustomEvent('dashboard-data-updated', { 
        detail: dataToSave 
      }));
      
      // Also trigger storage event manually for same-tab updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'dashboard-organization-data',
        newValue: JSON.stringify(dataToSave),
        storageArea: localStorage
      }));
      
      setShowSaveDialog(true);
      setTimeout(() => {
        setShowSaveDialog(false);
      }, 3000);
      
      console.log('✅ Data saved successfully and Dashboard notified');
    } catch (error) {
      console.error('Error saving organization data:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const resetLayout = () => {
    if (window.confirm('Are you sure you want to reset all changes? This cannot be undone.')) {
      localStorage.removeItem('dashboard-organization-data');
      window.location.reload();
    }
  };

  // Editable Box Component
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
      } ${item.clickable && !isEditMode ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200' : ''}`}
      onClick={() => {
        if (item.clickable && item.route && !isEditMode) {
          navigate(item.route);
        }
      }}>
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
          {item.clickable && !isEditMode && (
            <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
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
            <h1 className="text-xl font-bold text-gray-800">Dashboard Editor</h1>
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
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
        
        
        
        
        
        {/* Save confirmation */}
        {showSaveDialog && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">✅ Changes saved successfully!</p>
            <p className="text-green-700 text-sm mt-1">
              Main Dashboard has been automatically updated with your changes. 
              Go back to Dashboard to see the results immediately.
            </p>
          </div>
        )}
      </div>

      {/* Main Content - Exact replica of Dashboard structure */}
      <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
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
                    value={organizationData.header.title}
                    onChange={(e) => handleEdit('header', null, 'title', e.target.value)}
                    className="bg-yellow-50 border rounded px-2 py-1"
                  />
                ) : (
                  organizationData.header.title
                )}
              </h1>
              <h2 className="text-lg font-semibold text-gray-700">
                {isEditMode ? (
                  <input
                    type="text"
                    value={organizationData.header.company}
                    onChange={(e) => handleEdit('header', null, 'company', e.target.value)}
                    className="bg-yellow-50 border rounded px-2 py-1"
                  />
                ) : (
                  organizationData.header.company
                )}
              </h2>
              <p className="text-sm text-gray-500">
                Effective Date: {isEditMode ? (
                  <input
                    type="text"
                    value={organizationData.header.effectiveDate}
                    onChange={(e) => handleEdit('header', null, 'effectiveDate', e.target.value)}
                    className="bg-yellow-50 border rounded px-2 py-1 ml-1"
                  />
                ) : (
                  organizationData.header.effectiveDate
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="grid grid-cols-3 gap-4 border border-gray-400 p-4 bg-white">
              {/* Prepared By */}
              <div className="text-center border-r border-gray-400 pr-4">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Prepared By :</p>
                <div className="w-20 h-12 border border-gray-300 mx-auto mb-2 bg-gray-50 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Signature</span>
                </div>
                <div className="border-b border-gray-300 mx-auto w-20 mb-1"></div>
                <p className="text-xs font-semibold underline mb-1">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={organizationData.signatures?.preparedBy?.name || 'Diki Wahyudi'}
                      onChange={(e) => {
                        setOrganizationData(prev => ({
                          ...prev,
                          signatures: {
                            ...prev.signatures,
                            preparedBy: {
                              ...prev.signatures?.preparedBy,
                              name: e.target.value
                            }
                          }
                        }));
                      }}
                      className="bg-yellow-50 border rounded px-2 py-1 text-xs text-center w-full"
                    />
                  ) : (
                    organizationData.signatures?.preparedBy?.name || 'Diki Wahyudi'
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  Prep Date : {isEditMode ? (
                    <input
                      type="text"
                      value={organizationData.signatures?.preparedBy?.date || '08/09/2025'}
                      onChange={(e) => {
                        setOrganizationData(prev => ({
                          ...prev,
                          signatures: {
                            ...prev.signatures,
                            preparedBy: {
                              ...prev.signatures?.preparedBy,
                              date: e.target.value
                            }
                          }
                        }));
                      }}
                      className="bg-yellow-50 border rounded px-1 text-xs w-20 ml-1"
                    />
                  ) : (
                    organizationData.signatures?.preparedBy?.date || '08/09/2025'
                  )}
                </p>
              </div>

              {/* Middle - Bambang Wuryanto */}
              <div className="text-center border-r border-gray-400 pr-4">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={organizationData.signatures?.middleBy?.title || 'Bambang Wuryanto'}
                      onChange={(e) => {
                        setOrganizationData(prev => ({
                          ...prev,
                          signatures: {
                            ...prev.signatures,
                            middleBy: {
                              ...prev.signatures?.middleBy,
                              title: e.target.value
                            }
                          }
                        }));
                      }}
                      className="bg-yellow-50 border rounded px-2 py-1 text-xs text-center w-full"
                    />
                  ) : (
                    organizationData.signatures?.middleBy?.title || 'Bambang Wuryanto'
                  )}
                </p>
                <div className="w-20 h-12 border border-gray-300 mx-auto mb-2 bg-gray-50 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Signature</span>
                </div>
                <div className="border-b border-gray-300 mx-auto w-20 mb-1"></div>
                <p className="text-xs font-semibold underline mb-1">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={organizationData.signatures?.middleBy?.name || 'Bambang Wuryanto'}
                      onChange={(e) => {
                        setOrganizationData(prev => ({
                          ...prev,
                          signatures: {
                            ...prev.signatures,
                            middleBy: {
                              ...prev.signatures?.middleBy,
                              name: e.target.value
                            }
                          }
                        }));
                      }}
                      className="bg-yellow-50 border rounded px-2 py-1 text-xs text-center w-full"
                    />
                  ) : (
                    organizationData.signatures?.middleBy?.name || 'Bambang Wuryanto'
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  Prepared Date : {isEditMode ? (
                    <input
                      type="text"
                      value={organizationData.signatures?.middleBy?.date || '08/09/2025'}
                      onChange={(e) => {
                        setOrganizationData(prev => ({
                          ...prev,
                          signatures: {
                            ...prev.signatures,
                            middleBy: {
                              ...prev.signatures?.middleBy,
                              date: e.target.value
                            }
                          }
                        }));
                      }}
                      className="bg-yellow-50 border rounded px-1 text-xs w-20 ml-1"
                    />
                  ) : (
                    organizationData.signatures?.middleBy?.date || '08/09/2025'
                  )}
                </p>
              </div>

              {/* Approved By */}
              <div className="text-center">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">Approved By :</p>
                <div className="w-20 h-12 border border-gray-300 mx-auto mb-2 bg-gray-50 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Signature</span>
                </div>
                <div className="border-b border-gray-300 mx-auto w-20 mb-1"></div>
                <p className="text-xs font-semibold underline mb-1">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={organizationData.signatures?.approvedBy?.name || 'Eko Maryanto'}
                      onChange={(e) => {
                        setOrganizationData(prev => ({
                          ...prev,
                          signatures: {
                            ...prev.signatures,
                            approvedBy: {
                              ...prev.signatures?.approvedBy,
                              name: e.target.value
                            }
                          }
                        }));
                      }}
                      className="bg-yellow-50 border rounded px-2 py-1 text-xs text-center w-full"
                    />
                  ) : (
                    organizationData.signatures?.approvedBy?.name || 'Eko Maryanto'
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  Prepared Date : {isEditMode ? (
                    <input
                      type="text"
                      value={organizationData.signatures?.approvedBy?.date || '08/09/2025'}
                      onChange={(e) => {
                        setOrganizationData(prev => ({
                          ...prev,
                          signatures: {
                            ...prev.signatures,
                            approvedBy: {
                              ...prev.signatures?.approvedBy,
                              date: e.target.value
                            }
                          }
                        }));
                      }}
                      className="bg-yellow-50 border rounded px-1 text-xs w-20 ml-1"
                    />
                  ) : (
                    organizationData.signatures?.approvedBy?.date || '08/09/2025'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Board of Commissioners */}
        <div className="mb-8">
          <div className="bg-blue-300 p-4 rounded text-center max-w-md mx-auto mb-6">
            <h3 className="font-bold text-sm text-white">BOARD OF COMMISSIONERS</h3>
          </div>
          
          <div className="flex justify-center gap-6 mb-6">
            <div className="bg-white border border-gray-400 rounded shadow-sm w-48 text-center min-h-[100px]">
              <div className="p-2 bg-gray-100 border-b border-gray-300">
                <p className="text-sm font-semibold">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={organizationData.commissioners.president.title}
                      onChange={(e) => handleEdit('commissioners', 'president', 'title', e.target.value)}
                      className="bg-yellow-50 border rounded px-2 py-1 w-full text-sm"
                    />
                  ) : (
                    organizationData.commissioners.president.title
                  )}
                </p>
              </div>
              <div className="p-4 flex items-center justify-center h-16">
                <p className="text-xs font-medium">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={organizationData.commissioners.president.name}
                      onChange={(e) => handleEdit('commissioners', 'president', 'name', e.target.value)}
                      className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                    />
                  ) : (
                    organizationData.commissioners.president.name
                  )}
                </p>
              </div>
            </div>
            <div className="bg-white border border-gray-400 p-4 rounded shadow-sm w-48 text-center min-h-[100px] flex flex-col justify-center">
              <p className="text-sm font-semibold mb-3">COMMISSIONERS</p>
              {organizationData.commissioners.commissioners.map((name, index) => (
                <React.Fragment key={index}>
                  <hr className="my-1 border-gray-300" />
                  <p className="text-xs mb-1">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleEdit('commissioners', index.toString(), null, e.target.value)}
                        className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                      />
                    ) : (
                      name
                    )}
                  </p>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Column Headers */}
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

        {/* Main Content Grid - 5 Columns - COMPLETE STRUCTURE */}
        <div className="mb-6">
          <div className="grid grid-cols-5 gap-4">
            
            {/* Column 1 - Board of Directors */}
            <div className="space-y-3">
              {organizationData.structure.bod.map((item) => (
                <EditableBox key={item.id} item={item} category="bod" />
              ))}
            </div>

            {/* Column 2 - Management Functions */}
            <div className="space-y-4">
              {/* Empty space to align with President Director */}
              <div className="min-h-[180px]"></div>
              
              {/* Management items with special handling for combined MDO */}
              {organizationData.structure.management.map((item) => {
                if (item.code === 'MDO1.0') {
                  // Combined MDO box
                  const mdo2 = organizationData.structure.management.find(m => m.code === 'MDO2.0');
                  return (
                    <div key="mdo-combined" className={`bg-white border border-gray-400 rounded shadow-sm min-h-[170px] ${
                      isEditMode ? 'ring-2 ring-blue-200' : ''
                    } ${mdo2?.clickable && !isEditMode ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200' : ''}`}
                    onClick={() => {
                      if (mdo2?.clickable && mdo2?.route && !isEditMode) {
                        navigate(mdo2.route);
                      }
                    }}>
                      <div className="flex flex-col h-full">
                        {/* Header row */}
                        <div className="flex border-b border-gray-300">
                          <div className="p-2 flex-1 text-center bg-gray-100">
                            <p className="text-xs font-semibold leading-tight">MANAGEMENT DEVELOPMENT/PDCA</p>
                          </div>
                        </div>
                        
                        {/* First content row (MDO1.0) */}
                        <div className="flex border-b border-gray-300 flex-1">
                          <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                            <p className="text-xs font-bold">
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={item.code}
                                  onChange={(e) => handleEdit('management', item.id, 'code', e.target.value)}
                                  className="bg-yellow-50 border rounded px-1 w-12 text-xs"
                                />
                              ) : (
                                item.code
                              )}
                            </p>
                          </div>
                          <div className="p-3 flex-1 text-center flex flex-col justify-center">
                            <p className="text-xs leading-tight">
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleEdit('management', item.id, 'name', e.target.value)}
                                  className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                                />
                              ) : (
                                item.name
                              )}
                            </p>
                            <p className="text-xs leading-tight">
                              ({isEditMode ? (
                                <input
                                  type="text"
                                  value={item.empId}
                                  onChange={(e) => handleEdit('management', item.id, 'empId', e.target.value)}
                                  className="bg-yellow-50 border rounded px-1 w-16 text-xs"
                                />
                              ) : (
                                item.empId
                              )})
                            </p>
                          </div>
                        </div>
                        
                        {/* Second content row (MDO2.0) */}
                        <div className="flex flex-1">
                          <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                            <p className="text-xs font-bold">
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={mdo2?.code}
                                  onChange={(e) => handleEdit('management', mdo2?.id, 'code', e.target.value)}
                                  className="bg-yellow-50 border rounded px-1 w-12 text-xs"
                                />
                              ) : (
                                mdo2?.code
                              )}
                            </p>
                          </div>
                          <div className="p-3 flex-1 text-center flex flex-col justify-center">
                            <p className="text-xs leading-tight">
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={mdo2?.name}
                                  onChange={(e) => handleEdit('management', mdo2?.id, 'name', e.target.value)}
                                  className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                                />
                              ) : (
                                mdo2?.name
                              )}
                            </p>
                            <p className="text-xs leading-tight">
                              ({isEditMode ? (
                                <input
                                  type="text"
                                  value={mdo2?.empId}
                                  onChange={(e) => handleEdit('management', mdo2?.id, 'empId', e.target.value)}
                                  className="bg-yellow-50 border rounded px-1 w-16 text-xs"
                                />
                              ) : (
                                mdo2?.empId
                              )})
                            </p>
                            {mdo2?.clickable && !isEditMode && (
                              <p className="text-xs text-blue-600 mt-1 font-semibold">Click to view details →</p>
                            )}
                            {isEditMode && (
                              <p className="text-xs text-gray-500 mt-1">Click fields to edit</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else if (item.code === 'MDO2.0') {
                  // Skip MDO2.0 as it's handled in the combined box
                  return null;
                } else {
                  return <EditableBox key={item.id} item={item} category="management" />;
                }
              })}
            </div>

            {/* Column 3 - Division Head (Business Labels) */}
            <div className="space-y-3">
              {/* Spacers to align with content */}
              <div className="min-h-[110px]"></div>
              <div className="min-h-[120px]"></div>
              <div className="min-h-[200px]"></div>
              <div className="min-h-[120px]"></div>
              <div className="min-h-[130px]"></div>
              
              {organizationData.structure.divisions.map((div, index) => (
                <React.Fragment key={div.id}>
                  {index > 0 && <div className={index === 1 ? "min-h-[100px]" : "min-h-[570px]"}></div>}
                  <div className={`bg-gray-200 p-3 rounded text-center font-bold text-xs min-h-${index === 0 ? '[100px]' : '[80px]'} flex items-center justify-center ${
                    isEditMode ? 'ring-2 ring-blue-200' : ''
                  }`}>
                    <span className="leading-tight">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={div.label}
                          onChange={(e) => handleEdit('divisions', div.id, 'label', e.target.value)}
                          className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs text-center"
                        />
                      ) : (
                        div.label
                      )}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 4 - Department Head */}
            <div className="space-y-3">
              {/* Spacers */}
              <div className="min-h-[110px]"></div>
              <div className="min-h-[150px]"></div>
              <div className="min-h-[190px]"></div>
              
              {organizationData.structure.departments.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index === 1 && <div className="min-h-[10px]"></div>}
                  {index === 3 && <div className="min-h-[1px]"></div>}
                  {index === 4 && <div className="min-h-[105px]"></div>}
                  {index === 5 && <div className="min-h-[110px]"></div>}
                  {index === 6 && <div className="min-h-[250px]"></div>}
                  <EditableBox item={item} category="departments" />
                  {index === 6 && <div className="min-h-[1px]"></div>}
                </React.Fragment>
              ))}
            </div>

            {/* Column 5 - Section Head / Engineering Product Leader */}
            <div className="space-y-3">
              {organizationData.structure.sections.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index === 3 && <div className="min-h-[435px]"></div>}
                  {index === 4 && <div className="min-h-[10px]"></div>}
                  {index === 5 && <div className="min-h-[10px]"></div>}
                  <EditableBox item={item} category="sections" />
                </React.Fragment>
              ))}
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
          
          <div className="mt-4 bg-green-50 p-3 rounded border-l-4 border-green-400">
            <h4 className="font-bold text-sm mb-2 text-green-800">✅ DASHBOARD EDITOR FEATURES:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-green-700">
              <div>
                <p>• <strong>Complete Organization Structure</strong> - All {organizationData.structure.sections.length + organizationData.structure.departments.length + organizationData.structure.management.length + organizationData.structure.bod.length} positions</p>
                <p>• <strong>Click-to-edit</strong> any text field</p>
                <p>• <strong>Real-time visual feedback</strong></p>
                <p>• <strong>Exact same layout</strong> as main Dashboard</p>
              </div>
              <div>
                <p>• <strong>Permission-based access</strong> control</p>
                <p>• <strong>Safe data persistence</strong></p>
                <p>• <strong>Navigation preservation</strong></p>
                <p>• <strong>Header, dates & signatures editable</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEditor;