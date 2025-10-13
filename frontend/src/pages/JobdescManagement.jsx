import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Users, FileText, Eye, Edit, Plus, Trash2, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { departmentsAPI, membersAPI, jobDescriptionsAPI } from '../services/api';
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

  useEffect(() => {
    console.log('useEffect triggered, user:', user);
    loadAccessibleDepartments();
  }, [user]);

  const loadAccessibleDepartments = async () => {
    try {
      console.log('Loading accessible departments...');
      setLoading(true);
      
      const response = await departmentsAPI.getAll();
      const allDepartments = response.data.data;
      
      // Filter departments berdasarkan role permission user
      const userPermissions = user?.role?.permissions || [];
      const userDepartmentName = user?.department?.name;
      
      console.log('User permissions:', userPermissions);
      console.log('User department:', userDepartmentName);
      
      const accessibleDepts = allDepartments.filter(dept => {
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

  const loadDepartmentMembers = async (departmentId) => {
    try {
      setLoading(true);
      
      // Load members and job descriptions in parallel
      const [membersResponse, jobdescResponse] = await Promise.all([
        membersAPI.getByDepartment(departmentId),
        jobDescriptionsAPI.getByDepartment(departmentId).catch(() => ({ data: { data: [] } }))
      ]);
      
      const members = membersResponse.data.data;
      const jobDescriptions = jobdescResponse.data.data || [];
      
      setDepartmentMembers(members);
      
      // Map job descriptions to members
      const jobDescsMap = {};
      
      jobDescriptions.forEach(jobdesc => {
        // Find member by user ID or by noPNK
        const member = members.find(m => 
          (jobdesc.user && m.id === jobdesc.user._id) || 
          (jobdesc.memberNoPNK && m.noPNK === jobdesc.memberNoPNK)
        );
        
        if (member) {
          jobDescsMap[member.id] = jobdesc;
          console.log(`Job description mapped for ${member.name}:`, jobdesc);
        }
      });
      
      console.log('Members loaded:', members);
      console.log('Job descriptions loaded:', jobDescriptions);
      console.log('Job descriptions mapped:', jobDescsMap);
      setJobDescriptions(jobDescsMap);
      
    } catch (err) {
      console.error('Error loading department members:', err);
      setError('Failed to load department members: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartment = (departmentName, departmentId) => {
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
      loadDepartmentMembers(departmentId);
    }
    
    setExpandedDepartments(newExpanded);
  };

  const handleAddMember = async (newMemberData) => {
    try {
      setLoading(true);
      const selectedDept = departments.find(d => d.name === selectedDepartment);
      
      const memberData = {
        ...newMemberData,
        department: selectedDept._id
      };
      
      const response = await membersAPI.create(memberData);
      
      if (response.data.success) {
        // Reload members for current department
        await loadDepartmentMembers(selectedDept._id);
        setShowAddMemberModal(false);
        alert('Member added successfully');
      }
    } catch (err) {
      console.error('Error adding member:', err);
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJobdesc = (member) => {
    setSelectedMember(member);
    setEditingJobdesc(null);
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

  const handleDeleteJobdesc = async (member) => {
    if (window.confirm(`Are you sure you want to delete job description for ${member.name}?`)) {
      try {
        const jobdesc = jobDescriptions[member.id];
        if (jobdesc) {
          await jobDescriptionsAPI.delete(jobdesc._id);
          
          // Remove from local state
          const updatedJobDescs = { ...jobDescriptions };
          delete updatedJobDescs[member.id];
          setJobDescriptions(updatedJobDescs);
          
          alert('Job description deleted successfully');
        }
      } catch (err) {
        console.error('Error deleting job description:', err);
        setError(err.response?.data?.message || 'Failed to delete job description');
      }
    }
  };

  const handleDeleteMember = async (member) => {
    if (window.confirm(`Are you sure you want to delete member ${member.name}? This will also delete their job description.`)) {
      try {
        await membersAPI.delete(member.id);
        
        // Reload members for current department
        const selectedDept = departments.find(d => d.name === selectedDepartment);
        await loadDepartmentMembers(selectedDept._id);
        
        alert('Member deleted successfully');
      } catch (err) {
        console.error('Error deleting member:', err);
        setError(err.response?.data?.message || 'Failed to delete member');
      }
    }
  };

  const handleDownloadJobdesc = (member) => {
    const jobdesc = jobDescriptions[member.id];
    if (jobdesc) {
      // Create print window with job description content - same as JobdescViewer
      const printWindow = window.open('', '_blank');
      
      // Generate job description HTML content
      const jobDescHTML = `
        <div class="border-b-2 border-black">
          <div class="flex">
            <div class="w-32 border-r-2 border-black p-2 flex items-center justify-center">
              <img src="/images/dcilong.png" alt="Dharma Group Logo" class="max-w-full max-h-20 object-contain" />
            </div>
            <div class="flex-1 text-center p-2 border-r-2 border-black">
              <h1 class="text-xl font-bold mb-2">JOB DESCRIPTION</h1>
              <div class="flex justify-center space-x-8 text-xs">
                <div><span class="font-medium">Tanggal: </span><span>${jobdesc?.tanggal ? new Date(jobdesc.tanggal).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}</span></div>
                <div><span class="font-medium">Revisi: </span><span>${jobdesc?.revisi || '0'}</span></div>
              </div>
            </div>
            <div class="w-32 border-r-2 border-black">
              <div class="border-b border-black p-2 text-center"><p class="text-xs font-bold">Dibuat,</p></div>
              <div class="border-b border-black p-4 text-center"></div>
            </div>
            <div class="w-32">
              <div class="border-b border-black p-2 text-center"><p class="text-xs font-bold">Disetujui,</p></div>
              <div class="border-b border-black p-4 text-center"></div>
            </div>
          </div>
        </div>
        
        <div class="border-b-2 border-black">
          <div class="flex">
            <div class="flex-1 border-r border-black">
              <div class="border-b border-black p-3">
                <div class="flex"><span class="font-bold w-32">DIVISION</span><span class="mr-2">:</span><span>${jobdesc?.division || '-'}</span></div>
              </div>
              <div class="p-3">
                <div class="flex"><span class="font-bold w-32">POSITION TITLE</span><span class="mr-2">:</span><span>${jobdesc?.positionTitle || '-'}</span></div>
              </div>
            </div>
            <div class="flex-1">
              <div class="border-b border-black p-3">
                <div class="flex"><span class="font-bold w-32">DEPARTMENT</span><span class="mr-2">:</span><span>${(jobdesc?.department?.name || member?.department?.name || '-').toUpperCase()}</span></div>
              </div>
              <div class="p-3">
                <div class="flex"><span class="font-bold w-32">REPORTS TO</span><span class="mr-2">:</span><span>${jobdesc?.reportsTo || '-'}</span></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="border-b border-black p-3">
          <div class="mb-2">
            <span class="font-bold text-sm">RESPONSIBILITIES</span>
            <span class="text-xs ml-2">(Responsibilities berisi urutan tugas pemegang jabatan serta tugas-tugas yang dilaksanakannya - berkaitan dengan jabatan yang dipegangnya, bisa tugas harian atau tugas bekala)</span>
          </div>
          <ol class="list-decimal list-inside space-y-1 text-sm">
            ${jobdesc?.responsibilities && jobdesc.responsibilities.length > 0 ? 
              jobdesc.responsibilities.map(responsibility => `<li>${responsibility}</li>`).join('') : 
              '<li>No responsibilities defined</li>'
            }
          </ol>
        </div>
        
        <div class="border-b border-black p-3">
          <div class="mb-2">
            <span class="font-bold text-sm">ACCOUNTABILITIES</span>
            <span class="text-xs ml-2">Accountabilities berisi wewenang yang dilimpahkan kepada jabatan untuk dapat melaksanakan tugas dengan baik, dan hal-hal apa yang diberikan oleh jabatan ini tetapi tidak diberikan kepada jabatan yang lain, bisa berisi :</span>
          </div>
          <ol class="list-decimal list-inside space-y-1 text-sm">
            ${jobdesc?.accountabilities && jobdesc.accountabilities.length > 0 ? 
              jobdesc.accountabilities.map(accountability => `<li>${accountability}</li>`).join('') : 
              '<li>No accountabilities defined</li>'
            }
          </ol>
        </div>
        
        <div class="border-b border-black p-3">
          <div class="mb-2">
            <span class="font-bold text-sm">INTERACTIONS</span>
            <span class="text-xs ml-2">(Interaksi berisi  bagian / dengan siapa saja yang bersangkutan berhubungan / bekerjasama untuk kelancaran tugas - tugasnya, baik didalam maupun diluar perusahaan)</span>
          </div>
          <ol class="list-decimal list-inside space-y-1 text-sm">
            ${jobdesc?.interactions?.internal && jobdesc.interactions.internal.length > 0 ? 
              jobdesc.interactions.internal.map(interaction => `<li>${interaction}</li>`).join('') : 
              '<li>No interactions defined</li>'
            }
          </ol>
        </div>
        
        <div class="border-b border-black p-3">
          <div class="mb-2">
            <span class="font-bold text-sm">COMPETENCE</span>
            <span class="text-xs ml-2"> (Competence berisi keahlian dan / atau pengetahuan khusus yang harus dimiliki pemegang jabatan untuk dapat berhasil dalam melaksanakan tugasnya. Diberikan juga lamanya waktu minimal pengalaman dibidang tersebut)</span>
          </div>
          <div class="grid grid-cols-2 gap-8">
            <div>
              <p class="font-bold text-sm mb-2">A. Competence Managerial :</p>
              <ol class="list-decimal list-inside space-y-1 text-sm">
                ${jobdesc.competence?.managerial && jobdesc.competence.managerial.length > 0 ? 
                  jobdesc.competence.managerial.map(comp => `<li>${comp}</li>`).join('') : 
                  `<li>Teamwork</li><li>Trouble Shooting</li><li>Customer Satisfaction</li><li>Cross Functional Capability</li><li>Quality Focus</li><li>Cost Efficiency</li><li>Continuous Improvement</li><li>Planning Monitoring</li><li>Personal Integrity</li><li>Drive for Result</li>`
                }
              </ol>
            </div>
            <div>
              <p class="font-bold text-sm mb-2">B. Competence Skill :</p>
              <ol class="list-decimal list-inside space-y-1 text-sm">
                ${jobdesc.competence?.skill && jobdesc.competence.skill.length > 0 ? 
                  jobdesc.competence.skill.map(skill => `<li>${skill}</li>`).join('') : 
                  `<li>Microsoft Office</li><li>Komunikasi</li><li>Negosiasi</li><li>SAP</li><li>Control Plan</li>`
                }
              </ol>
            </div>
          </div>
        </div>
        
        <div class="p-3">
          <div class="mb-2">
            <span class="font-bold text-sm">JOB SPECIFICATION</span>
            <span class="text-xs ml-2">(berisi persyaratan yang harus dipenuhi pemegang jabatan)</span>
          </div>
          <div class="grid grid-cols-2 gap-8 text-sm">
            <div class="space-y-1">
              <div class="flex"><span class="w-32">Usia</span><span class="mr-2">:</span><span>${jobdesc.jobSpecification?.age || 'Min. 21 Tahun'}</span></div>
              <div class="flex"><span class="w-32">Pendidikan</span><span class="mr-2">:</span><span>${jobdesc.jobSpecification?.education || 'Minimal D3'}</span></div>
              <div class="flex"><span class="w-32">Pendidikan Non Formal</span><span class="mr-2">:</span><span>${jobdesc.jobSpecification?.nonFormalEducation || '-'}</span></div>
              <div class="flex"><span class="w-32">Pengalaman Kerja</span><span class="mr-2">:</span><span>${jobdesc.jobSpecification?.experience || 'Min. 1 Tahun'}</span></div>
            </div>
          </div>
        </div>
      `;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Job Description - ${member.name}</title>
          <style>
            @page { 
              size: A4 portrait; 
              margin: 5mm; 
              border: 2px solid #000;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 3mm; 
              background: white; 
              color: black;
              width: 100%;
              min-height: 100vh;
              box-sizing: border-box;
              border: 2px solid #000;
            }
            .border-2 { 
              border: none; 
              width: 100%;
              height: auto;
              margin: 0;
              box-sizing: border-box;
              page-break-inside: auto;
            }
            .border-black { border-color: #000; }
            .border-b-2 { border-bottom: 2px solid #000; }
            .border-r-2 { border-right: 2px solid #000; }
            .border-b { border-bottom: 1px solid #000; }
            .border-r { border-right: 1px solid #000; }
            .flex { display: flex; }
            .flex-1 { flex: 1; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .text-center { text-align: center; }
            .grid { display: grid; }
            .grid-cols-2 { 
              grid-template-columns: repeat(2, 1fr); 
              gap: 1.5rem;
            }
            .gap-8 { gap: 1.5rem; }
            .space-x-8 > * + * { margin-left: 1.5rem; }
            .space-y-1 > * + * { margin-top: 0.3rem; }
            .w-32 { width: 9rem; }
            .p-2 { padding: 0.8rem; }
            .p-3 { padding: 1rem; }
            .p-4 { padding: 1.2rem; }
            .p-7 { padding: 2rem; }
            .mb-2 { margin-bottom: 0.8rem; }
            .mb-3 { margin-bottom: 1rem; }
            .ml-2 { margin-left: 0.8rem; }
            .mr-2 { margin-right: 0.8rem; }
            .text-xl { 
              font-size: 1.6rem; 
              font-weight: bold; 
              line-height: 1.4;
            }
            .text-sm { 
              font-size: 1rem; 
              line-height: 1.4;
            }
            .text-xs { 
              font-size: 0.9rem; 
              line-height: 1.3;
            }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .list-decimal { 
              list-style-type: decimal; 
              padding-left: 1.2rem;
            }
            .list-inside { list-style-position: inside; }
            img { 
              max-width: 100%; 
              max-height: 90px; 
              object-fit: contain; 
            }
            /* Page break and border handling */
            .content-section {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 1rem;
            }
            
            /* Allow sections to break if too long */
            .long-section {
              page-break-inside: auto;
              break-inside: auto;
            }
            
            /* Optimize space usage */
            ol, ul {
              margin: 0.6rem 0;
              padding-left: 1.5rem;
            }
            li {
              margin-bottom: 0.4rem;
              line-height: 1.4;
            }
            
            /* Header section - never break */
            .header-section {
              min-height: auto;
              padding: 1rem;
              page-break-after: avoid;
              break-after: avoid;
            }
            
            /* Each major section styling */
            .job-section {
              padding: 0.8rem 1rem;
              margin-bottom: 0.5rem;
            }
            
            /* Ensure proper page margins are maintained */
            html, body {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div class="border-2 border-black">
            ${jobDescHTML}
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      alert('No job description found for this member');
    }
  };

  const handleJobdescSave = async (jobdescData) => {
    try {
      setLoading(true);
      const selectedDept = departments.find(d => d.name === selectedDepartment);
      
      const payload = {
        ...jobdescData,
        user: selectedMember.user || null,
        memberName: selectedMember.name,
        memberNoPNK: selectedMember.noPNK,
        memberEmail: selectedMember.email,
        memberPosition: selectedMember.position,
        department: selectedDept._id
      };
      
      let response;
      if (editingJobdesc) {
        // Update existing job description
        response = await jobDescriptionsAPI.update(editingJobdesc._id, payload);
      } else {
        // Create new job description
        response = await jobDescriptionsAPI.create(payload);
      }
      
      if (response.data.success) {
        // Update local state
        setJobDescriptions(prev => ({
          ...prev,
          [selectedMember.id]: response.data.data
        }));
        
        setShowJobdescForm(false);
        setSelectedMember(null);
        setEditingJobdesc(null);
        alert('Job description saved successfully');
      }
    } catch (err) {
      console.error('Error saving job description:', err);
      setError(err.response?.data?.message || 'Failed to save job description');
    } finally {
      setLoading(false);
    }
  };

  console.log('Rendering component, departments:', departments.length);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Description Management</h1>
          <p className="text-gray-600">
            Manage job descriptions for all department members. All data is automatically saved to the database.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 text-sm mt-2"
            >
              Dismiss
            </button>
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
                      <div key={dept._id} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleDepartment(dept.name, dept._id)}
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
                      disabled={loading}
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
                                    <span className="font-medium w-16">NPK:</span>
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
                              <div className="flex space-x-2">
                                {/* Show Create button only if no job description exists */}
                                {!hasJobdesc && (
                                  <button
                                    onClick={() => handleCreateJobdesc(member)}
                                    className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded transition-colors duration-200 border border-green-200"
                                    title="Create Job Description"
                                    disabled={loading}
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
                                  </>
                                )}
                                
                                <button
                                  onClick={() => handleDeleteMember(member)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded transition-colors duration-200 border border-red-200"
                                  title="Delete Member"
                                  disabled={loading}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
          loading={loading}
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
const AddMemberModal = ({ departmentName, onSave, onCancel, loading = false }) => {
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
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No NPK *
            </label>
            <input
              type="text"
              value={formData.noPNK}
              onChange={(e) => setFormData({ ...formData, noPNK: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add Member'
              )}
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