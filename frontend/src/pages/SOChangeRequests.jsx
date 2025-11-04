import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { soChangeRequestsAPI } from '../services/api';

const SOChangeRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);

  // Check permissions - Only "Approve SO Changes" can access this page
  const canApprove = user?.role?.permissions?.includes('Approve SO Changes');
  
  console.log('🔐 SO Change Requests Permission Check:', {
    user: user?.name,
    permissions: user?.role?.permissions,
    canApprove: canApprove
  });

  // Debug logging
  useEffect(() => {
    console.log('🔍 SO Change Requests - Permission Debug:', {
      user: user?.name,
      userId: user?.id,
      role: user?.role?.name,
      permissions: user?.role?.permissions,
      canApprove,
      hasApprovePermission: user?.role?.permissions?.includes('Approve SO Changes'),
      allPermissions: user?.role?.permissions
    });
  }, [user, canApprove]);

  // Load requests
  useEffect(() => {
    loadRequests();
  }, [selectedTab]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params = selectedTab !== 'all' ? { status: selectedTab } : {};
      const response = await soChangeRequestsAPI.getAll(params);
      
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      alert('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Handle approve
  const handleApprove = async (requestId) => {
    if (!canApprove) {
      alert('You do not have permission to approve requests');
      return;
    }

    if (!confirm('Are you sure you want to approve this request?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await soChangeRequestsAPI.approve(requestId, reviewComments);
      
      if (response.data.success) {
        console.log('✅ Request approved on backend:', response.data.data);
        
        // Apply changes to dashboard (will redirect to dashboard)
        const approvedRequest = response.data.data;
        const applied = applyChangesToDashboard(approvedRequest);
        
        // If apply failed or didn't redirect, close modal manually
        if (!applied) {
          setShowDetailModal(false);
          setReviewComments('');
          loadRequests();
        }
      }
    } catch (error) {
      console.error('❌ Error approving request:', error);
      alert(error.response?.data?.message || 'Failed to approve request');
      setActionLoading(false);
    }
  };
  // Handle Revisi
  const handleRevisi = async (requestId) => {
  if (!canApprove) {
    alert('You do not have permission to revisi requests');
    return;
  }

  const trimmedComments = reviewComments.trim();
  if (!trimmedComments) {
    alert('⚠️ Please provide comments for revision.');
    return;
  }

  if (!confirm('Are you sure you want to send this request for revision?')) return;

  try {
    setActionLoading(true);
    const response = await soChangeRequestsAPI.revisi(requestId, trimmedComments);

    if (response.data.success) {
      alert('Request sent for revision');
      setShowDetailModal(false);
      setReviewComments('');
      loadRequests();
    }
  } catch (error) {
    console.error('Error revising request:', error);
    alert(error.response?.data?.message || 'Failed to send request for revision');
  } finally {
    setActionLoading(false);
  }
};


  // Handle reject
  const handleReject = async (requestId) => {
    if (!canApprove) {
      alert('You do not have permission to reject requests');
      return;
    }

    // Validate review comments - MUST have reason for rejection
    const trimmedComments = reviewComments.trim();
    if (!trimmedComments || trimmedComments.length === 0) {
      setShowValidationError(true);
      alert('⚠️ Please provide a reason for rejection in the Review Comments field.');
      
      // Auto hide error after 5 seconds
      setTimeout(() => {
        setShowValidationError(false);
      }, 5000);
      
      return;
    }

    setShowValidationError(false);

    if (!confirm('Are you sure you want to reject this request?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await soChangeRequestsAPI.reject(requestId, trimmedComments);
      
      if (response.data.success) {
        alert('❌ Request rejected');
        setShowDetailModal(false);
        setReviewComments('');
        loadRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await soChangeRequestsAPI.cancel(requestId);
      
      if (response.data.success) {
        alert('Request cancelled');
        setShowDetailModal(false);
        loadRequests();
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert(error.response?.data?.message || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  // Apply approved changes to dashboard
  const applyChangesToDashboard = (request) => {
    try {
      const { proposedData } = request;

      console.log('🔄 Applying changes to dashboard:', proposedData);

      // Check if proposedData has organizationData and layoutData structure
      if (proposedData && proposedData.organizationData) {
        console.log('✅ Found organizationData, saving to localStorage...');
        
        // Save organization data to localStorage
        localStorage.setItem('dashboard-organization-data', JSON.stringify(proposedData.organizationData));
        
        // Save layout data if exists
        if (proposedData.layoutData) {
          console.log('✅ Found layoutData, saving to localStorage...');
          localStorage.setItem('dashboard-editor-layout', JSON.stringify(proposedData.layoutData));
        }

        console.log('✅ Changes applied to dashboard localStorage');
        
        // Show success message and reload page to reflect changes
        alert('✅ Request approved successfully! Dashboard will reload to show changes.');
        
        // Reload the page to dashboard
        window.location.href = '/';
        
        return true;
      } else {
        // Old format - apply based on affected section
        console.log('⚠️ Using old format, applying based on affectedSection...');
        const currentData = localStorage.getItem('dashboard-organization-data');
        let dashboardData = currentData ? JSON.parse(currentData) : {};
        const { affectedSection } = request;

        if (affectedSection === 'header') {
          dashboardData.header = { ...dashboardData.header, ...proposedData };
        } else if (affectedSection === 'commissioners') {
          dashboardData.commissioners = { ...dashboardData.commissioners, ...proposedData };
        } else if (affectedSection === 'signatures') {
          dashboardData.signatures = { ...dashboardData.signatures, ...proposedData };
        } else if (['bod', 'management', 'divisions', 'departments', 'sections'].includes(affectedSection)) {
          if (!dashboardData.structure) {
            dashboardData.structure = {};
          }
          dashboardData.structure[affectedSection] = proposedData;
        }

        localStorage.setItem('dashboard-organization-data', JSON.stringify(dashboardData));

        console.log('✅ Changes applied to dashboard (old format)');
        
        // Show success message and reload page
        alert('✅ Request approved successfully! Dashboard will reload to show changes.');
        window.location.href = '/';
        
        return true;
      }
    } catch (error) {
      console.error('❌ Error applying changes to dashboard:', error);
      alert('Changes approved but failed to apply to dashboard. Please refresh the page manually.');
      return false;
    }
  };

  // View request detail
  const viewDetail = (request) => {
    setSelectedRequest(request);
    setReviewComments('');
    setShowValidationError(false); // Reset validation error
    setShowDetailModal(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
  approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
  cancelled: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'Cancelled' },
  revisi: { color: 'bg-orange-100 text-orange-800', icon: MessageSquare, text: 'Revisi' } // <—
};


    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority] || colors.medium}`}>
        {priority?.toUpperCase() || 'MEDIUM'}
      </span>
    );
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter requests by tab
  const filteredRequests = requests;

  // Only users with "Approve SO Changes" permission can access this page
  if (!canApprove) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">
            You need "Approve SO Changes" permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">SO Change Requests</h1>
          <p className="text-gray-600 mt-1">
            Review and approve organization structure change requests
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'all', label: 'All Requests' },
                { id: 'pending', label: 'Pending' },
                { id: 'approved', label: 'Approved' },
                { id: 'rejected', label: 'Rejected' },
                { id: 'revisi', label: 'Revisi'}
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.title}
                      </h3>
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>

                    <p className="text-gray-600 text-sm mb-3">
                      {request.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>
                        <strong>Requested by:</strong> {request.requestedBy?.name}
                      </span>
                      <span>
                        <strong>Date:</strong> {formatDate(request.createdAt)}
                      </span>
                      <span>
                        <strong>Section:</strong> {request.affectedSection}
                      </span>
                    </div>

                    {request.reviewedBy && (
                      <div className="mt-2 text-sm text-gray-500">
                        <strong>Reviewed by:</strong> {request.reviewedBy.name} on {formatDate(request.reviewedAt)}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
  {canApprove && request.status === 'pending' && (
    <button
      onClick={() => viewDetail(request)}
      className="flex items-center gap-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
    >
      <CheckCircle className="w-4 h-4" />
      Review & Approve
    </button>
  )}

  {/* Tombol untuk Revisi */}
  {request.status === 'revisi' && (
    <button
      onClick={() => viewDetail(request)}
      className="flex items-center gap-1 px-3 py-2 text-sm bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors"
    >
      <MessageSquare className="w-4 h-4" />
      View Revisi
    </button>
  )}
</div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
<div className={`sticky top-0 border-b border-gray-200 px-6 py-4 flex justify-between items-center ${
  selectedRequest.status === 'revisi' ? 'bg-orange-50' : 'bg-white'
}`}>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Request Detail
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedRequest.status)}
                  {getPriorityBadge(selectedRequest.priority)}
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Request Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {selectedRequest.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedRequest.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Requested by:</span>
                    <p className="text-gray-600">{selectedRequest.requestedBy?.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Date:</span>
                    <p className="text-gray-600">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Affected Section:</span>
                    <p className="text-gray-600">{selectedRequest.affectedSection}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Change Type:</span>
                    <p className="text-gray-600">{selectedRequest.changeType}</p>
                  </div>
                </div>
              </div>

              {/* Changes Preview - Hidden for better UX */}
              {/* Data changes are already applied when approved, no need to show technical JSON */}

              {/* Review Comments (if reviewed) */}
              {selectedRequest.reviewComments && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Review Comments:</h4>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <p className="text-gray-700">{selectedRequest.reviewComments}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      By {selectedRequest.reviewedBy?.name} on {formatDate(selectedRequest.reviewedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Review Section (for managers on pending requests) */}
              {canApprove && selectedRequest.status === 'pending' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    <MessageSquare className="inline w-5 h-5 mr-2" />
                    Review Comments:
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    ✅ Optional for approval | ⚠️ <span className="font-semibold text-red-600">Required for rejection</span>
                  </p>
                  <textarea
                    value={reviewComments}
                    onChange={(e) => {
                      setReviewComments(e.target.value);
                      setShowValidationError(false); // Clear error when typing
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      showValidationError 
                        ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    rows="4"
                    placeholder="Add your comments here... (Required if rejecting)"
                  />
                  {showValidationError && (
                    <p className="text-red-600 text-sm mt-2 font-semibold">
                      ⚠️ Rejection reason is required!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={actionLoading}
              >
                Close
              </button>

              {canApprove && selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(selectedRequest._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Reject
                      </>
                    )}
                  </button>

                  <button
  onClick={() => handleRevisi(selectedRequest._id)}
  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
  disabled={actionLoading}
>
  {actionLoading ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      Processing...
    </>
  ) : (
    <>
      <AlertCircle className="w-4 h-4" />
      Send for Revision
    </>
  )}
</button>


                  <button
                    onClick={() => handleApprove(selectedRequest._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Approve & Apply Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOChangeRequests;
