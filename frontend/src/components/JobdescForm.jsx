import React, { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';

const JobdescForm = ({ user, existingJobdesc, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    division: existingJobdesc?.division || '',
    positionTitle: existingJobdesc?.positionTitle || '',
    reportsTo: existingJobdesc?.reportsTo || '',
    responsibilities: existingJobdesc?.responsibilities || [''],
    accountabilities: existingJobdesc?.accountabilities || [''],
    interactions: existingJobdesc?.interactions || { internal: [''], external: [''] },
    competence: existingJobdesc?.competence || { technical: [''], behavioral: [''] },
    jobSpecification: existingJobdesc?.jobSpecification || {
      education: '',
      experience: '',
      skills: [''],
      certification: ['']
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
          external: formData.interactions.external.filter(e => e.trim())
        },
        competence: {
          technical: formData.competence.technical.filter(t => t.trim()),
          behavioral: formData.competence.behavioral.filter(b => b.trim())
        },
        jobSpecification: {
          ...formData.jobSpecification,
          skills: formData.jobSpecification.skills.filter(s => s.trim()),
          certification: formData.jobSpecification.certification.filter(c => c.trim())
        }
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Internal Interactions */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">Internal</h5>
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

              {/* External Interactions */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">External</h5>
                  <button
                    type="button"
                    onClick={() => addNestedArrayItem('interactions', 'external')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.interactions.external.map((interaction, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={interaction}
                      onChange={(e) => handleNestedArrayChange('interactions', 'external', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder={`External interaction ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeNestedArrayItem('interactions', 'external', index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      disabled={formData.interactions.external.length === 1}
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
              {/* Technical Competence */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">Technical</h5>
                  <button
                    type="button"
                    onClick={() => addNestedArrayItem('competence', 'technical')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.competence.technical.map((competence, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={competence}
                      onChange={(e) => handleNestedArrayChange('competence', 'technical', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder={`Technical competence ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeNestedArrayItem('competence', 'technical', index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      disabled={formData.competence.technical.length === 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Behavioral Competence */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">Behavioral</h5>
                  <button
                    type="button"
                    onClick={() => addNestedArrayItem('competence', 'behavioral')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.competence.behavioral.map((competence, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={competence}
                      onChange={(e) => handleNestedArrayChange('competence', 'behavioral', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder={`Behavioral competence ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeNestedArrayItem('competence', 'behavioral', index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      disabled={formData.competence.behavioral.length === 1}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <textarea
                  value={formData.jobSpecification.education}
                  onChange={(e) => handleInputChange('jobSpecification', {
                    ...formData.jobSpecification,
                    education: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Required education level and qualifications"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <textarea
                  value={formData.jobSpecification.experience}
                  onChange={(e) => handleInputChange('jobSpecification', {
                    ...formData.jobSpecification,
                    experience: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Required work experience"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Skills */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">Skills</h5>
                  <button
                    type="button"
                    onClick={() => addNestedArrayItem('jobSpecification', 'skills')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.jobSpecification.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleNestedArrayChange('jobSpecification', 'skills', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder={`Skill ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeNestedArrayItem('jobSpecification', 'skills', index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      disabled={formData.jobSpecification.skills.length === 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-gray-700">Certification</h5>
                  <button
                    type="button"
                    onClick={() => addNestedArrayItem('jobSpecification', 'certification')}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {formData.jobSpecification.certification.map((cert, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) => handleNestedArrayChange('jobSpecification', 'certification', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder={`Certification ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeNestedArrayItem('jobSpecification', 'certification', index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      disabled={formData.jobSpecification.certification.length === 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
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