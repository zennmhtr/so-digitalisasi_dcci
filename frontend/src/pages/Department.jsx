import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { departmentsAPI } from '../services/api';
import Swal from 'sweetalert2';

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentsAPI.getAll();
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      alert('Error loading departments. Please check if you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter(dept =>
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingDept(null);
    setFormData({ code: '', name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      description: dept.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (deptId) => {
    const confirmResult = await Swal.fire({
      title: 'Are you sure you want to delete this department?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    });
    if (confirmResult.isConfirmed) {
      try {
        await departmentsAPI.delete(deptId);
        fetchDepartments();
        Swal.fire({
          title: 'Deleted!',
          text: 'Department has been deleted successfully.',
          icon: 'success',
          timer: 4000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deleting department:', error);
        Swal.fire({
          title: 'Failed!',
          text: 'Error deleting department. Please try again.',
          icon: 'error',
          timer: 4000,
          showConfirmButton: false
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingDept) {
        await departmentsAPI.update(editingDept._id, formData);
      } else {
        await departmentsAPI.create(formData);
      }
      
      fetchDepartments();
      setIsModalOpen(false);
      setFormData({ code: '', name: '', description: '' });
      Swal.fire({
        title: editingDept ? 'Updated!' : 'Added!',
        text: editingDept ? 'Department has been updated successfully.' : 'New department has been added successfully.',
        icon: 'success',
        timer: 4000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error saving department:', error);
      Swal.fire({
        title: 'Failed!',
        text: 'Error saving department. Please try again.',
        icon: 'error',
        timer: 4000,
        showConfirmButton: false
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Department</h1>
        <p className="text-gray-600">Manage company departments and their information</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search departments..."
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
          Add Department
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name Department
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No departments found
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                        {dept.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {dept.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(dept)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept._id)}
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
          <div className="relative top-10 mx-auto p-8 border w-full max-w-2xl shadow-lg rounded-lg bg-white my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingDept ? 'Edit Department' : 'Add New Department'}
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
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-3">
                    Department Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    required
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="e.g., IT, HR, FIN"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
                    Department Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="e.g., Information Technology"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-3">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                    placeholder="Describe the department's responsibilities and functions..."
                  />
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
                  {editingDept ? 'Update' : 'Add'} Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Department;