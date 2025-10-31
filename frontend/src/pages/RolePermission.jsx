import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { rolesAPI } from '../services/api';

const RolePermission = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    active: true
  });

  const availablePermissions = [
    // System Core Permissions - Basic system access
    'View Dashboard',
    'Manage Users',
    'Manage Roles',
    'Manage Departments',
    
    // Dashboard & Editor Permissions - Organization structure access
    'SO DCI Editor',
    'SO Bagian Editor',
    'Print SO',
    'View All SO Details',        // Admin only - can view all departments SO
    'Jobdesc Management',
    
    // Department Job Description Access - For Job Description Management per department
    'Finance Department',         // Finance Department Job Description
    'HRGA & IT Department',      // HRGA & IT Department Job Description
    'Management Development',     // Management Development Job Description
    'Management Representative',  // Management Representative Job Description
    'Manufacturing Battery',     // Manufacturing Battery Job Description
    'Manufacturing Cable',       // Manufacturing Cable Job Description
    'Marketing Battery Department', // Marketing Battery Department Job Description
    'Marketing Engineering',     // Marketing Engineering Job Description
    'MI & SHE',                 // MI & SHE Job Description
    'PPIC',                     // PPIC Job Description
    'Purchasing',               // Purchasing Department Job Description
    'QA Department',            // QA Department Job Description
    
    // SO Details View Access - For viewing SO Turunan per department
    'View Finance SO',           // View Finance Department SO Details
    'View HRGA & IT SO',        // View HRGA & IT Department SO Details
    'View Management Dev SO',    // View Management Development SO Details
    'View Management Rep SO',    // View Management Representative SO Details
    'View Manufacturing Battery SO', // View Manufacturing Battery SO Details
    'View Manufacturing Cable SO',   // View Manufacturing Cable SO Details
    'View Marketing Battery SO', // View Marketing Battery SO Details
    'View Marketing Engineering SO', // View Marketing Engineering SO Details
    'View MI & SHE SO',         // View MI & SHE SO Details
    'View PPIC SO',             // View PPIC SO Details
    'View Purchasing SO',       // View Purchasing SO Details
    'View QA SO'                // View QA Department SO Details
  ];

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await rolesAPI.getAll();
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      alert('Error loading roles. Please check if you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
      active: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      active: role.active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await rolesAPI.delete(roleId);
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Error deleting role. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingRole) {
        await rolesAPI.update(editingRole._id, formData);
      } else {
        await rolesAPI.create(formData);
      }
      
      fetchRoles();
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        permissions: [],
        active: true
      });
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Error saving role. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePermissionChange = (permission) => {
    const updatedPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    
    setFormData({
      ...formData,
      permissions: updatedPermissions
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Role & Permission</h1>
        <p className="text-gray-600">Manage user roles and their permissions</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search roles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No roles found
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {role.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {role.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        role.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {role.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(role)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(role._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-8 mx-auto p-8 border w-full max-w-3xl shadow-lg rounded-lg bg-white my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
                      Role Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="e.g., Manager, Admin"
                    />
                  </div>

                  <div>
                    <label htmlFor="active" className="block text-sm font-medium text-gray-700 mb-3">
                      Status
                    </label>
                    <select
                      id="active"
                      name="active"
                      value={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.value === 'true'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-3">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                    placeholder="Describe the role's responsibilities and access level..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissions
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 space-y-6">
                    {/* System Core Permissions */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">System Core Permissions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePermissions.slice(0, 4).map((permission) => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={() => handlePermissionChange(permission)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="ml-3 text-sm text-gray-700">{permission}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Dashboard & Editor Permissions */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Dashboard & Editor Access</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePermissions.slice(4, 9).map((permission) => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={() => handlePermissionChange(permission)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="ml-3 text-sm text-gray-700">{permission}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Job Description Department Access */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Job Description Department Access</h4>
                      <p className="text-xs text-gray-600 mb-3">Access to manage job descriptions for specific departments</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePermissions.slice(9, 21).map((permission) => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={() => handlePermissionChange(permission)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="ml-3 text-sm text-gray-700">{permission}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* SO Details View Access per Department */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">SO Details View Access (per Department)</h4>
                      <p className="text-xs text-gray-600 mb-3">View SO Turunan (organizational structure details) for specific departments</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availablePermissions.slice(21).map((permission) => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={() => handlePermissionChange(permission)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="ml-3 text-sm text-gray-700">{permission}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select the permissions this role should have access to. Permissions are based on actual system features and department structure.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  {editingRole ? 'Update' : 'Add'} Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermission;