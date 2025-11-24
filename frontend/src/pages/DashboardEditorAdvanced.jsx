import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DraggableTraditionalLayout from '../components/DraggableTraditionalLayout';

const DashboardEditorAdvanced = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organizationData, setOrganizationData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
          effectiveDate: "08/09/2025"
        },
        commissioners: {
          president: {
            title: "PRESIDENT COMMISIONER",
            name: "IRIANTO SANTOSO"
          },
          commissioners: ["SUBAGIO", "HONG KUO MING", "LIAO CHIN HSIEN"]
        },
        structure: {
          bod: [
            { id: 'bod-1', code: 'BOD1.0', title: 'PRESIDENT DIRECTOR', name: 'EKO MARYANTO', empId: '23100235' },
            { id: 'bod-2', code: 'BOD1.1', title: 'DIRECTOR', name: 'BAMBANG WURYANTO', empId: '23200038' }
          ],
          management: [
            { id: 'mio-1', code: 'MIO1.0', title: 'MI & SHE (5R-SMK3-ISO 14001)', name: 'ELIATA DUMAR GINTING', empId: '23190806' }
          ],
          divisions: [
            { id: 'div-1', label: 'CONTROLCABLE BUSINESS', type: 'business-label' }
          ],
          departments: [
            { id: 'qa-1', code: 'QAC1.0', title: 'QA', name: 'M BAGUS SANTOSO', empId: '23220025' }
          ],
          sections: [
            { id: 'prd-1', code: 'PRD1.0', title: 'CONTROLCABLE MANUFACTURE', name: 'KARNA SATIA SALIM*', empId: '23230114' }
          ]
        },
        positions: {} 
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
      
      window.dispatchEvent(new CustomEvent('dashboard-data-updated', { 
        detail: organizationData 
      }));
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'dashboard-organization-data',
        newValue: JSON.stringify(organizationData),
        storageArea: localStorage
      }));
      
      setHasChanges(false);
      setShowSaveDialog(true);
      
      setTimeout(() => {
        setShowSaveDialog(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPositions = () => {
    if (confirm('Are you sure you want to reset all positions to default? This action cannot be undone.')) {
      const resetData = {
        ...organizationData,
        positions: {} 
      };
      setOrganizationData(resetData);
      setHasChanges(true);
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access the SO DCI Editor.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Advanced Organization Chart Editor
            </h1>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  hasChanges && !isSaving
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSaving ? '💾 Saving...' : hasChanges ? '💾 Save Changes' : '✅ Saved'}
              </button>
              <button
                onClick={handleResetPositions}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                title="Reset all positions to default"
              >
                🔄 Reset Positions
              </button>
              <button
                onClick={() => navigate('/dashboard-editor')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Classic Editor
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
             
              {hasChanges && (
                <div className="flex items-center gap-2 text-orange-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-screen">
            {organizationData && (
              <DraggableTraditionalLayout
                organizationData={organizationData}
                onDataChange={handleDataChange}
              />
            )}
          </div>
        </div>

        {/* Save Success Dialog */}
        {showSaveDialog && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-slide-in">
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
    </div>
  );
};

export default DashboardEditorAdvanced;