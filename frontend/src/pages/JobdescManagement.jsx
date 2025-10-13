import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Users, FileText, Eye, Edit, Plus, Trash2, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import JobdescViewer from '../components/JobdescViewer';
import JobdescForm from '../components/JobdescForm';

const JobdescManagement = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentMembers, setDepartmentMembers] = useState([]);
  const [expandedDepartments, setExpandedDepartments] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showJobdescForm, setShowJobdescForm] = useState(false);
  const [showJobdescViewer, setShowJobdescViewer] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingJobdesc, setEditingJobdesc] = useState(null);
  const [jobDescriptions, setJobDescriptions] = useState({});

  // Data members untuk setiap departemen
  const departmentMembersData = {
    'Purchasing': [
      { id: 1, name: 'Diki Wahyudi', noPNK: '23060056', email: 'diki.wahyudi@company.com', position: 'Dept Head' },
      { id: 2, name: 'Rifqi', noPNK: '23230017', email: 'rifqi@company.com', position: 'Staff' },
      { id: 3, name: 'Syifa', noPNK: '23220060', email: 'syifa@company.com', position: 'Staff' },
      { id: 4, name: 'Marchel', noPNK: '23250234', email: 'marchel@company.com', position: 'Staff' },
      { id: 5, name: 'Eli Tri', noPNK: '23110112', email: 'elitri@company.com', position: 'Staff' }
    ],
    'Finance Department': [],
    'HRGA & IT Department': [],
    'Management Development': [],
    'Management Representative': [],
    'Manufacturing Battery': [],
    'Manufacturing Cable': [],
    'Marketing Battery Department': [],
    'Marketing Engineering': [],
    'MI & SHE': [],
    'PPIC': [],
    'QA Department': []
  };

  console.log('JobdescManagement rendered, user:', user);

  // Mapping department dengan permission yang diperlukan
  const departmentPermissions = {
    'Finance Department': ['Finance', 'Admin', 'HR Manager'],
    'HRGA & IT Department': ['HRGA', 'IT', 'Admin', 'HR Manager'],
    'Management Development': ['Management', 'Admin', 'HR Manager'],
    'Management Representative': ['Management', 'Admin', 'HR Manager'],
    'Manufacturing Battery': ['Production', 'Manufacturing', 'Admin', 'HR Manager'],
    'Manufacturing Cable': ['Production', 'Manufacturing', 'Admin', 'HR Manager'],
    'Marketing Battery Department': ['Marketing', 'Sales', 'Admin', 'HR Manager'],
    'Marketing Engineering': ['Marketing', 'Engineering', 'Admin', 'HR Manager'],
    'MI & SHE': ['Safety', 'Environment', 'Admin', 'HR Manager'],
    'PPIC': ['Production', 'Planning', 'Admin', 'HR Manager'],
    'Purchasing': ['Purchasing', 'Procurement', 'Admin', 'HR Manager'],
    'QA Department': ['Quality', 'QA', 'Admin', 'HR Manager']
  };

  // Pre-defined departments yang akan ditampilkan
  const predefinedDepartments = [
    { name: 'Finance Department', code: 'FIN', description: 'Finance and Accounting Department' },
    { name: 'HRGA & IT Department', code: 'HRGA', description: 'Human Resources and IT Department' },
    { name: 'Management Development', code: 'MD', description: 'Management Development Department' },
    { name: 'Management Representative', code: 'MR', description: 'Management Representative Department' },
    { name: 'Manufacturing Battery', code: 'MFB', description: 'Manufacturing Battery Department' },
    { name: 'Manufacturing Cable', code: 'MFC', description: 'Manufacturing Cable Department' },
    { name: 'Marketing Battery Department', code: 'MKB', description: 'Marketing Battery Department' },
    { name: 'Marketing Engineering', code: 'MKE', description: 'Marketing Engineering Department' },
    { name: 'MI & SHE', code: 'SHE', description: 'MI & SHE Department' },
    { name: 'PPIC', code: 'PPIC', description: 'PPIC Department' },
    { name: 'Purchasing', code: 'PCH', description: 'Purchasing Department' },
    { name: 'QA Department', code: 'QA', description: 'Quality Assurance Department' }
  ];

  useEffect(() => {
    console.log('useEffect triggered, user:', user);
    loadAccessibleDepartments();
  }, [user]);

  const loadAccessibleDepartments = () => {
    try {
      console.log('Loading accessible departments...');
      setLoading(true);
      
      // Filter departments berdasarkan role permission user
      const userPermissions = user?.role?.permissions || [];
      const userDepartmentName = user?.department?.name;
      
      console.log('User permissions:', userPermissions);
      console.log('User department:', userDepartmentName);
      
      const accessibleDepts = predefinedDepartments.filter(dept => {
        // Admin dan HR Manager bisa akses semua departemen
        if (userPermissions.includes('Admin') || userPermissions.includes('HR Manager')) {
          return true;
        }
        
        // User bisa akses departemen sendiri
        if (userDepartmentName === dept.name) {
          return true;
        }
        
        // Cek permission khusus departemen
        const requiredPermissions = departmentPermissions[dept.name] || [];
        return requiredPermissions.some(permission => userPermissions.includes(permission));
      });
      
      console.log('Accessible departments:', accessibleDepts);
      setDepartments(accessibleDepts);
      setError('');
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartment = (departmentName) => {
    console.log('Toggling department:', departmentName);
    const newExpanded = new Set(expandedDepartments);
    
    if (newExpanded.has(departmentName)) {
      newExpanded.delete(departmentName);
      if (selectedDepartment === departmentName) {
        setSelectedDepartment(null);
        setDepartmentMembers([]);
      }
    } else {
      newExpanded.add(departmentName);
      setSelectedDepartment(departmentName);
      // Load members for selected department
      const members = departmentMembersData[departmentName] || [];
      setDepartmentMembers(members);
    }
    
    setExpandedDepartments(newExpanded);
  };

  const handleAddMember = (newMember) => {
    if (selectedDepartment) {
      const updatedMembers = [...departmentMembers, {
        id: Date.now(),
        name: newMember.name,
        noPNK: newMember.noPNK,
        email: newMember.email,
        position: newMember.position || 'Staff'
      }];
      setDepartmentMembers(updatedMembers);
      
      // Update the departmentMembersData
      departmentMembersData[selectedDepartment] = updatedMembers;
    }
    setShowAddMemberModal(false);
  };

  const handleCreateJobdesc = (member) => {
    setSelectedMember(member);
    setShowJobdescForm(true);
  };

  const handleViewJobdesc = (member) => {
    setSelectedMember(member);
    setShowJobdescViewer(true);
  };

  const handleEditJobdesc = (member) => {
    setSelectedMember(member);
    setEditingJobdesc(jobDescriptions[member.id] || null);
    setShowJobdescForm(true);
  };

  const handleDeleteJobdesc = (member) => {
    if (window.confirm(`Are you sure you want to delete job description for ${member.name}?`)) {
      const updatedJobDescs = { ...jobDescriptions };
      delete updatedJobDescs[member.id];
      setJobDescriptions(updatedJobDescs);
      alert('Job description deleted successfully');
    }
  };

  const handleDeleteMember = (member) => {
    if (window.confirm(`Are you sure you want to delete member ${member.name}? This will also delete their job description.`)) {
      // Remove member from the list
      const updatedMembers = departmentMembers.filter(m => m.id !== member.id);
      setDepartmentMembers(updatedMembers);
      
      // Update the departmentMembersData
      departmentMembersData[selectedDepartment] = updatedMembers;
      
      // Remove job description if exists
      const updatedJobDescs = { ...jobDescriptions };
      delete updatedJobDescs[member.id];
      setJobDescriptions(updatedJobDescs);
      
      alert('Member deleted successfully');
    }
  };

  const handleDownloadJobdesc = (member) => {
    const jobdesc = jobDescriptions[member.id];
    if (jobdesc) {
      // Open print dialog for the job description
      setSelectedMember(member);
      setShowJobdescViewer(true);
      // The print functionality will be handled in the JobdescViewer component
      setTimeout(() => {
        window.print();
      }, 500);
    } else {
      alert('No job description found for this member');
    }
  };

  const handleJobdescSave = (jobdescData) => {
    setJobDescriptions(prev => ({
      ...prev,
      [selectedMember.id]: jobdescData
    }));
    setShowJobdescForm(false);
    setSelectedMember(null);
    setEditingJobdesc(null);
    alert('Job description saved successfully');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      not_started: { 
        color: 'bg-gray-100 text-gray-800', 
        text: 'Not Started' 
      },
      draft: { 
        color: 'bg-yellow-100 text-yellow-800', 
        text: 'Draft' 
      },
      submitted: { 
        color: 'bg-blue-100 text-blue-800', 
        text: 'Submitted' 
      },
      approved: { 
        color: 'bg-green-100 text-green-800', 
        text: 'Approved' 
      }
    };

    const config = statusConfig[status] || statusConfig.not_started;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  console.log('Rendering component, departments:', departments.length);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Description Management</h1>
          <p className="text-gray-600">
        
          </p>
          
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Departments ({departments.length})
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Click on a department to view its members
                </p>
              </div>

              <div className="p-4">
                {loading && departments.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading departments...</span>
                  </div>
                ) : departments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg mb-2">🏢</div>
                    <p className="text-gray-500">No accessible departments found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Contact your administrator for access
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {departments.map((dept) => (
                      <div key={dept.name} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleDepartment(dept.name)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{dept.name}</h3>
                            <p className="text-sm text-gray-600">{dept.code}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {selectedDepartment === dept.name && departmentMembers.length > 0 && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {departmentMembers.length} members
                              </span>
                            )}
                            {expandedDepartments.has(dept.name) ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Department Members */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      {selectedDepartment ? `${selectedDepartment} - Members` : 'Department Members'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedDepartment 
                        ? 'View and manage job descriptions for department members'
                        : 'Select a department to view its members'
                      }
                    </p>
                  </div>
                  {selectedDepartment && (
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Member
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {!selectedDepartment ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">👥</div>
                    <p className="text-gray-500">Select a department from the list</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Choose a department to view its members and manage their job descriptions
                    </p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading members...</span>
                  </div>
                ) : departmentMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">👤</div>
                    <p className="text-gray-500">No members found in this department</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Click "Add Member" to add the first member to this department
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {departmentMembers.map((member) => {
                      const hasJobdesc = jobDescriptions[member.id];
                      const jobdescStatus = hasJobdesc ? 'approved' : 'not_started';
                      
                      return (
                        <div key={member.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-semibold text-base">
                                  {member.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">{member.name}</h3>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span className="font-medium w-16">PNK:</span>
                                    <span>{member.noPNK}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span className="font-medium w-16">Email:</span>
                                    <span className="truncate">{member.email}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span className="font-medium w-16">Position:</span>
                                    <span>{member.position}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-3 ml-6">
                              <div className="flex items-center">
                                {getStatusBadge(jobdescStatus)}
                              </div>
                              
                              <div className="flex space-x-2">
                                {/* Show Create button only if no job description exists */}
                                {!hasJobdesc && (
                                  <button
                                    onClick={() => handleCreateJobdesc(member)}
                                    className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded transition-colors duration-200 border border-green-200"
                                    title="Create Job Description"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                )}
                                
                                {/* Show other buttons only if job description exists */}
                                {hasJobdesc && (
                                  <>
                                    <button
                                      onClick={() => handleViewJobdesc(member)}
                                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded transition-colors duration-200 border border-blue-200"
                                      title="View Job Description"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleEditJobdesc(member)}
                                      className="bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded transition-colors duration-200 border border-amber-200"
                                      title="Edit Job Description"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDownloadJobdesc(member)}
                                      className="bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded transition-colors duration-200 border border-purple-200"
                                      title="Download/Print Job Description"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMember(member)}
                                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded transition-colors duration-200 border border-red-200"
                                      title="Delete Member"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          departmentName={selectedDepartment}
          onSave={handleAddMember}
          onCancel={() => setShowAddMemberModal(false)}
        />
      )}

      {/* Job Description Form Modal */}
      {showJobdescForm && selectedMember && (
        <JobdescForm
          user={selectedMember}
          existingJobdesc={editingJobdesc}
          selectedDepartment={selectedDepartment}
          onSave={handleJobdescSave}
          onCancel={() => {
            setShowJobdescForm(false);
            setSelectedMember(null);
            setEditingJobdesc(null);
          }}
        />
      )}

      {/* Job Description Viewer Modal */}
      {showJobdescViewer && selectedMember && (
        <JobdescViewer
          user={selectedMember}
          jobdesc={jobDescriptions[selectedMember.id] || null}
          onClose={() => {
            setShowJobdescViewer(false);
            setSelectedMember(null);
          }}
          onEdit={() => {
            setShowJobdescViewer(false);
            handleEditJobdesc(selectedMember);
          }}
          onDelete={() => {
            setShowJobdescViewer(false);
            handleDeleteJobdesc(selectedMember);
          }}
        />
      )}
    </div>
  );
};

// Add Member Modal Component
const AddMemberModal = ({ departmentName, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    noPNK: '',
    email: '',
    position: 'Staff'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.noPNK && formData.email) {
      onSave(formData);
      setFormData({ name: '', noPNK: '', email: '', position: 'Staff' });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-lg bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add Member to {departmentName}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No PNK *
            </label>
            <input
              type="text"
              value={formData.noPNK}
              onChange={(e) => setFormData({ ...formData, noPNK: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Staff">Staff</option>
              <option value="Senior Staff">Senior Staff</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Assistant Manager">Assistant Manager</option>
              <option value="Manager">Manager</option>
              <option value="Dept Head">Dept Head</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Job Description Form Component
const JobDescriptionForm = ({ member, departmentName, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    division: '',
    department: departmentName,
    positionTitle: member.position,
    reportsTo: '',
    responsibilities: [''],
    accountabilities: [''],
    interactions: [''],
    competence: [''],
    jobSpecification: {
      age: { min: '', max: '' },
      education: '',
      nonFormalEducation: '',
      experience: ''
    }
  });

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayItem = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically save to backend
    alert(`Job Description created for ${member.name}`);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-lg bg-white my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Create Job Description</h3>
            <p className="text-gray-600 text-sm mt-1">
              Employee: <span className="font-medium">{member.name}</span> ({member.noPNK})
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <Plus className="w-6 h-6 transform rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter division"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position Title</label>
                <input
                  type="text"
                  value={formData.positionTitle}
                  onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reports To</label>
                <input
                  type="text"
                  value={formData.reportsTo}
                  onChange={(e) => setFormData({ ...formData, reportsTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter supervisor name"
                />
              </div>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Responsibilities</h4>
              <button
                type="button"
                onClick={() => addArrayItem('responsibilities')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add
              </button>
            </div>
            {formData.responsibilities.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <span className="text-gray-600 text-sm mt-2">{index + 1}.</span>
                <textarea
                  value={item}
                  onChange={(e) => updateArrayItem('responsibilities', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder={`Responsibility ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('responsibilities', index)}
                  className="text-red-600 hover:text-red-700 px-2"
                  disabled={formData.responsibilities.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Accountabilities */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Accountabilities</h4>
              <button
                type="button"
                onClick={() => addArrayItem('accountabilities')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add
              </button>
            </div>
            {formData.accountabilities.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <textarea
                  value={item}
                  onChange={(e) => updateArrayItem('accountabilities', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder={`Accountability ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('accountabilities', index)}
                  className="text-red-600 hover:text-red-700 px-2"
                  disabled={formData.accountabilities.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Interactions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Interactions</h4>
              <button
                type="button"
                onClick={() => addArrayItem('interactions')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add
              </button>
            </div>
            {formData.interactions.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem('interactions', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Interaction ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('interactions', index)}
                  className="text-red-600 hover:text-red-700 px-2"
                  disabled={formData.interactions.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Competence */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Competence</h4>
              <button
                type="button"
                onClick={() => addArrayItem('competence')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add
              </button>
            </div>
            {formData.competence.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem('competence', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Competence ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('competence', index)}
                  className="text-red-600 hover:text-red-700 px-2"
                  disabled={formData.competence.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Job Specification */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Job Specification</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
                <input
                  type="number"
                  value={formData.jobSpecification.age.min}
                  onChange={(e) => setFormData({
                    ...formData,
                    jobSpecification: {
                      ...formData.jobSpecification,
                      age: { ...formData.jobSpecification.age, min: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
                <input
                  type="number"
                  value={formData.jobSpecification.age.max}
                  onChange={(e) => setFormData({
                    ...formData,
                    jobSpecification: {
                      ...formData.jobSpecification,
                      age: { ...formData.jobSpecification.age, max: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <textarea
                  value={formData.jobSpecification.education}
                  onChange={(e) => setFormData({
                    ...formData,
                    jobSpecification: { ...formData.jobSpecification, education: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <textarea
                  value={formData.jobSpecification.experience}
                  onChange={(e) => setFormData({
                    ...formData,
                    jobSpecification: { ...formData.jobSpecification, experience: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
            >
              Save Job Description
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobdescManagement;