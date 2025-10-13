import React, { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';

const JobdescForm = ({ user, existingJobdesc, onSave, onCancel, selectedDepartment }) => {
  const [formData, setFormData] = useState({
    department: selectedDepartment || existingJobdesc?.department || '',
    division: existingJobdesc?.division || '',
    positionTitle: existingJobdesc?.positionTitle || user?.position || '',
    reportsTo: existingJobdesc?.reportsTo || '',
    tanggal: existingJobdesc?.tanggal ? new Date(existingJobdesc.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    revisi: existingJobdesc?.revisi || '0',
    responsibilities: existingJobdesc?.responsibilities?.length > 0 ? existingJobdesc.responsibilities : [''],
    accountabilities: existingJobdesc?.accountabilities?.length > 0 ? existingJobdesc.accountabilities : [''],
    interactions: {
      internal: existingJobdesc?.interactions?.internal?.length > 0 ? existingJobdesc.interactions.internal : ['']
    },
    competence: {
      managerial: existingJobdesc?.competence?.managerial?.length > 0 ? existingJobdesc.competence.managerial : [''],
      skill: existingJobdesc?.competence?.skill?.length > 0 ? existingJobdesc.competence.skill : ['']
    },
    jobSpecification: {
      age: existingJobdesc?.jobSpecification?.age || '',
      education: existingJobdesc?.jobSpecification?.education || '',
      nonFormalEducation: existingJobdesc?.jobSpecification?.nonFormalEducation || '',
      experience: existingJobdesc?.jobSpecification?.experience || ''
    }
  });
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.division.trim()) {
      newErrors.division = 'Division is required';
    }
    
    if (!formData.positionTitle.trim()) {
      newErrors.positionTitle = 'Position Title is required';
    }
    
    if (!formData.reportsTo.trim()) {
      newErrors.reportsTo = 'Reports To is required';
    }
    
    if (formData.responsibilities.every(item => !item.trim())) {
      newErrors.responsibilities = 'At least one responsibility is required';
    }
    
    if (formData.accountabilities.every(item => !item.trim())) {
      newErrors.accountabilities = 'At least one accountability is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleNestedArrayChange = (parentField, childField, index, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: prev[parentField][childField].map((item, i) => i === index ? value : item)
      }
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
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

  const addNestedArrayItem = (parentField, childField) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: [...prev[parentField][childField], '']
      }
    }));
  };

  const removeNestedArrayItem = (parentField, childField, index) => {
    if (formData[parentField][childField].length > 1) {
      setFormData(prev => ({
        ...prev,
        [parentField]: {
          ...prev[parentField],
          [childField]: prev[parentField][childField].filter((_, i) => i !== index)
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      // Clean up empty array items
      const cleanData = {
        ...formData,
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        accountabilities: formData.accountabilities.filter(a => a.trim()),
        interactions: {
          internal: formData.interactions.internal.filter(i => i.trim()),
          external: [] // Always empty since we removed external interactions
        },
        competence: {
          managerial: formData.competence.managerial.filter(m => m.trim()),
          technical: [], // Always empty since we removed technical
          behavioral: [], // Always empty since we removed behavioral
          skill: formData.competence.skill.filter(s => s.trim())
        },
        jobSpecification: {
          ...formData.jobSpecification,
          skills: [], // Always empty since we removed skills
          certification: [] // Always empty since we removed certification
        },
        tanggal: formData.tanggal,
        revisi: formData.revisi
      };

      // Remove the timeout and directly call onSave
      onSave(cleanData);
    } catch (error) {
      console.error('Error saving jobdesc:', error);
      alert('Failed to save job description. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-lg bg-white my-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {existingJobdesc ? 'Edit' : 'Create'} Job Description
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Employee: <span className="font-medium">{user.name}</span> ({user.noPNK})
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  placeholder="Auto-detected from current department"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => handleInputChange('tanggal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revisi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.revisi}
                  onChange={(e) => handleInputChange('revisi', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter revision number"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Division <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => handleInputChange('division', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.division ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter division"
                />
                {errors.division && (
                  <p className="text-red-500 text-xs mt-1">{errors.division}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.positionTitle}
                  onChange={(e) => handleInputChange('positionTitle', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.positionTitle ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter position title"
                />
                {errors.positionTitle && (
                  <p className="text-red-500 text-xs mt-1">{errors.positionTitle}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reports To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.reportsTo}
                onChange={(e) => handleInputChange('reportsTo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.reportsTo ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter supervisor/manager name"
              />
              {errors.reportsTo && (
                <p className="text-red-500 text-xs mt-1">{errors.reportsTo}</p>
              )}
            </div>
          </div>

          {/* Responsibilities */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Responsibilities <span className="text-red-500">*</span>
              </h4>
              <button
                type="button"
                onClick={() => addArrayItem('responsibilities')}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
            
            {formData.responsibilities.map((responsibility, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <div className="flex-1">
                  <textarea
                    value={responsibility}
                    onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Responsibility ${index + 1}`}
                    rows="2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeArrayItem('responsibilities', index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md self-start"
                  disabled={formData.responsibilities.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {errors.responsibilities && (
              <p className="text-red-500 text-xs mt-1">{errors.responsibilities}</p>
            )}
          </div>

          {/* Accountabilities */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Accountabilities <span className="text-red-500">*</span>
              </h4>
              <button
                type="button"
                onClick={() => addArrayItem('accountabilities')}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
            
            {formData.accountabilities.map((accountability, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <div className="flex-1">
                  <textarea
                    value={accountability}
                    onChange={(e) => handleArrayChange('accountabilities', index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Accountability ${index + 1}`}
                    rows="2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeArrayItem('accountabilities', index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md self-start"
                  disabled={formData.accountabilities.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {errors.accountabilities && (
              <p className="text-red-500 text-xs mt-1">{errors.accountabilities}</p>
            )}
          </div>

          {/* Interactions */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Interactions</h4>
            
            <div>
              {/* Internal Interactions */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">Internal Interactions</h5>
                  <button
                    type="button"
                    onClick={() => addNestedArrayItem('interactions', 'internal')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.interactions.internal.map((interaction, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={interaction}
                      onChange={(e) => handleNestedArrayChange('interactions', 'internal', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder={`Internal interaction ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeNestedArrayItem('interactions', 'internal', index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      disabled={formData.interactions.internal.length === 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Competence */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Competence</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Managerial Competence */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">Managerial</h5>
                  <button
                    type="button"
                    onClick={() => addNestedArrayItem('competence', 'managerial')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.competence.managerial.map((competence, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={competence}
                      onChange={(e) => handleNestedArrayChange('competence', 'managerial', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder={`Managerial competence ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeNestedArrayItem('competence', 'managerial', index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      disabled={formData.competence.managerial.length === 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Skill Competence */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">Skill</h5>
                  <button
                    type="button"
                    onClick={() => addNestedArrayItem('competence', 'skill')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.competence.skill.map((competence, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={competence}
                      onChange={(e) => handleNestedArrayChange('competence', 'skill', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder={`Skill competence ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeNestedArrayItem('competence', 'skill', index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      disabled={formData.competence.skill.length === 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Job Specification */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Job Specification</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Usia</label>
                <textarea
                  value={formData.jobSpecification.age}
                  onChange={(e) => handleInputChange('jobSpecification', {
                    ...formData.jobSpecification,
                    age: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Rentang usia yang dibutuhkan"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pendidikan</label>
                <textarea
                  value={formData.jobSpecification.education}
                  onChange={(e) => handleInputChange('jobSpecification', {
                    ...formData.jobSpecification,
                    education: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Tingkat pendidikan yang dibutuhkan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pendidikan Non Formal</label>
                <textarea
                  value={formData.jobSpecification.nonFormalEducation}
                  onChange={(e) => handleInputChange('jobSpecification', {
                    ...formData.jobSpecification,
                    nonFormalEducation: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Pelatihan atau sertifikasi yang dibutuhkan"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pengalaman Kerja</label>
                <textarea
                  value={formData.jobSpecification.experience}
                  onChange={(e) => handleInputChange('jobSpecification', {
                    ...formData.jobSpecification,
                    experience: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Pengalaman kerja yang dibutuhkan"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {existingJobdesc ? 'Update' : 'Save'} Job Description
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobdescForm;