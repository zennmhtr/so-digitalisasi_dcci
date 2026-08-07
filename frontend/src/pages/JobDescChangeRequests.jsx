import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  Eye,
  FileText,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { jobDescChangeRequestsAPI } from "../services/api";
import Swal from 'sweetalert2';

const JobDescChangeRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviewComments, setReviewComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [showJobDescPreview, setShowJobDescPreview] = useState(false);
  const [previewJobDescData, setPreviewJobDescData] = useState(null);

  const getDepartmentApprovalPermission = (departmentName) => {
    const mapping = {
      "Finance Department": "Manager Finance Approval",
      "HRGA & IT Department": "Manager HRGA & IT Approval",
      "Management Development": "Manager Management Development Approval",
      "Management Representative":
        "Manager Management Representative Approval",
      "Manufacturing Battery": "Manager Manufacturing Battery Approval",
      "Manufacturing Cable": "Manager Manufacturing Cable Approval",
      "Marketing Battery Department": "Manager Marketing Battery Approval",
      "Marketing Engineering": "Manager Marketing Engineering Approval",
      "MI & SHE": "Manager MI & SHE Approval",
      PPIC: "Manager PPIC Approval",
      Purchasing: "Manager Purchasing Approval",
      "QA Department": "Manager QA Approval",
    };
    return mapping[departmentName] || null;
  };

  const canApproveRequest = (request) => {
    const userPermissions = user?.role?.permissions || [];

    if (userPermissions.includes("Manage Users")) return true;
    if (userPermissions.includes("SO Changes Director Approval")) return true;

    const requiredPermission = getDepartmentApprovalPermission(
      request.department
    );
    const isManagerApprover =
      requiredPermission && userPermissions.includes(requiredPermission);

    return isManagerApprover;
  };

  const isRequesterManager = (request) => {
    const requesterPermissions = request.requestedBy?.role?.permissions || [];
    return requesterPermissions.some(
      (perm) => perm.startsWith("Manager") && perm.endsWith("Approval")
    );
  };

  const hasAnyApprovalPermission = () => {
    const userPermissions = user?.role?.permissions || [];
    if (userPermissions.includes("Manage Users")) return true;
    if (userPermissions.includes("SO Changes Director Approval")) return true;

    return userPermissions.some(
      (perm) => perm.startsWith("Manager") && perm.endsWith("Approval")
    );
  };

  const canViewBagian = user?.role?.permissions?.includes("Job Desc Request");

  console.log("🔐 Job Desc Change Requests Permission Check:", {
    user: user?.name,
    permissions: user?.role?.permissions,
    hasAnyApprovalPermission: hasAnyApprovalPermission(),
  });

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user, selectedTab]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params = selectedTab !== "all" ? { status: selectedTab } : {};
      console.log("📡 Fetching requests with params:", params);
      const response = await jobDescChangeRequestsAPI.getAll(params);
      console.log("📥 Response:", response.data);
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
      alert("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!canApproveRequest(selectedRequest)) {
      alert("You do not have permission to approve requests");
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Are you sure you want to approve this request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    });
    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await jobDescChangeRequestsAPI.approve(
        requestId,
        reviewComments
      );

      if (response.data.success) {
        const updatedRequest = response.data.data;
        console.log("✅ Approve response:", updatedRequest);
        if (updatedRequest.status === "approved") {
          applyChangesToJobDesc(updatedRequest);
        } else if (updatedRequest.status === "waiting_director_approval") {
          alert("First approval recorder. waiting for director approval");
          setShowDetailModal(false);
          setReviewComments("");
          loadRequests();
          setActionLoading(false);
        } else {
          setShowDetailModal(false);
          setReviewComments("");
          loadRequests();
          setActionLoading(false);
        }
      }
    } catch (error) {
      console.error("❌ Error approving request:", error);
      alert(error.response?.data?.message || "Failed to approve request");
      setActionLoading(false);
    }
  };

  const handleRevisi = async (requestId) => {
    if (!canApproveRequest(selectedRequest)) {
      alert("You do not have permission to revisi requests");
      return;
    }

    const trimmedComments = reviewComments.trim();
    if (!trimmedComments) {
      Swal.fire({
        title: "Perhatian",
        text: "Mohon isi komentar untuk revisi terlebih dahulu.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "OK",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Are you sure you want to send this request for revision?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    });
    if (!confirmResult.isConfirmed) {
      return;
    } try {
      setActionLoading(true);
      const response = await jobDescChangeRequestsAPI.revisi(
        requestId,
        trimmedComments
      );

      if (response.data.success) {
        alert("Request sent for revision");
        setShowDetailModal(false);
        setReviewComments("");
        loadRequests();
      }
    } catch (error) {
      console.error("Error revising request:", error);
      alert(
        error.response?.data?.message || "Failed to send request for revision"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!canApproveRequest(selectedRequest)) {
      alert("You do not have permission to reject requests");
      return;
    }

    const trimmedComments = reviewComments.trim();
    if (!trimmedComments || trimmedComments.length === 0) {
      setShowValidationError(true);
      await Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Please provide a reason for rejection in the Review Comments field.",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "OK",
        timer: 5000,
        timerProgressBar: true,
      });
      setTimeout(() => {
        setShowValidationError(false);
      }, 5000);
      return;
    }

    setShowValidationError(false);

    const confirmResult = await Swal.fire({
      title: "Are you sure you want to reject this request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    });
    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await jobDescChangeRequestsAPI.reject(
        requestId,
        trimmedComments
      );

      if (response.data.success) {
        await Swal.fire({
          icon: "error",
          title: "Ditolak!",
          text: "Request telah berhasil ditolak.",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "OK",
          timer: 3000,
          timerProgressBar: true,
        });
        setShowDetailModal(false);
        setReviewComments("");
        loadRequests();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert(error.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure you want to cancel this request?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    });
    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await jobDescChangeRequestsAPI.cancel(requestId);

      if (response.data.success) {
        alert("Request cancelled");
        setShowDetailModal(false);
        loadRequests();
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert(error.response?.data?.message || "Failed to cancel request");
    } finally {
      setActionLoading(false);
    }
  };

  const applyChangesToJobDesc = (request) => {
    try {
      const { proposedData } = request;
      console.log("📄 Full request:", request);
      console.log("📄 Proposed data:", proposedData);

      if (proposedData && proposedData.organizationData) {
        const orgData = proposedData.organizationData;
        const jobDescData = proposedData.jobDescData;
        const memberInfo = proposedData.memberInfo;

        console.log("📦 Organization data:", orgData);
        console.log("📦 Job Desc data:", jobDescData);
        console.log("👤 Member info:", memberInfo);

        const departmentId = orgData.departmentId;
        const departmentName = orgData.departmentName;

        if (!departmentId) {
          console.error("❌ No departmentId found");
          alert("⚠️ Cannot apply changes: Department ID not found");
          return false;
        }

        console.log("🏢 Department ID:", departmentId);
        console.log("🏢 Department Name:", departmentName);

        console.log("✅ Changes applied successfully");

        setShowDetailModal(false);
        setReviewComments("");
        loadRequests();

        alert(
          "✅ Job Description request approved successfully! Redirecting to Job Desc Management..."
        );

        setTimeout(() => {
          window.location.href = `/jobdesc-management?dept=${departmentName}`;
        }, 1500);

        return true;
      } else {
        console.error("❌ Invalid data structure");
        alert("⚠️ Request format invalid. Cannot apply changes.");
        return false;
      }
    } catch (error) {
      console.error("❌ Error applying changes:", error);
      alert(
        "Changes approved. Please refresh the Job Desc Management page to see the new job description."
      );

      setShowDetailModal(false);
      setReviewComments("");
      loadRequests();

      return false;
    }
  };

  const viewDetail = (request) => {
    setSelectedRequest(request);
    setReviewComments("");
    setShowValidationError(false);
    setShowDetailModal(true);
  };

  const handlePreviewJobDesc = (request) => {
    if (request.proposedData && request.proposedData.jobDescData) {
      setPreviewJobDescData({
        jobDesc: request.proposedData.jobDescData,
        memberInfo: request.proposedData.memberInfo || {
          name: request.requestedBy?.name,
          noPNK: request.proposedData.jobDescData.memberNoPNK,
          email: request.proposedData.jobDescData.memberEmail,
          position: request.proposedData.jobDescData.memberPosition,
        },
        departmentName: request.department,
      });
      setShowJobDescPreview(true);
    } else {
      alert("Job description data not found in request");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: Clock,
        text: "Pending",
      },
      waiting_director_approval: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: Clock,
        text: "Waiting Director Approval",
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
        text: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: XCircle,
        text: "Rejected",
      },
      cancelled: {
        color: "bg-gray-100 text-gray-600 border-gray-300",
        icon: AlertCircle,
        text: "Cancelled",
      },
      revisi: {
        color: "bg-orange-100 text-orange-800 border-orange-300",
        icon: MessageSquare,
        text: "Revisi",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const color = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${color[priority] || color.medium
          }`}
      >
        {priority?.toUpperCase() || "MEDIUM"}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRequests = requests;

  if (!hasAnyApprovalPermission() && !canViewBagian) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600">
            You do not have permission to view Job Desc Change Requests.
          </p>
        </div>
      </div>
    );
  }

  const userPermissionsGlobal = user?.role?.permissions || [];
  const isDirectorGlobal =
    userPermissionsGlobal.includes("SO Changes Director Approval") ||
    userPermissionsGlobal.includes("Manage Users");

  const allTabs = [
    { id: "all", label: "All Requests" },
    { id: "pending", label: "Pending" },
    { id: "waiting_director_approval", label: "Waiting Director" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "cancelled", label: "Cancelled" },
    { id: "revisi", label: "Revisi" },
  ].filter((tab) => !(tab.id === "cancelled" && isDirectorGlobal));

  const tabCounts = allTabs.map((tab) => ({
    ...tab,
    count: tab.id === "all" ? requests.length : requests.filter((r) => r.status === tab.id).length,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Description Change Requests</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review and approve Job Description change requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">{requests.length} requests</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {tabCounts.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 ${selectedTab === tab.id
                ? "bg-white border border-b-white border-gray-200 -mb-px text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${selectedTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Request List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No change requests found</h3>
            <p className="text-gray-400 mt-1 text-sm">
              {selectedTab !== "all" ? `No requests with status "${selectedTab}".` : "No requests submitted yet."}
            </p>
          </div>
        ) : (
          filteredRequests.filter(r => r !== null && r !== undefined && r._id).map((request) => {
            const userPermissions = user?.role?.permissions || [];
            const isManagerApprover =
              getDepartmentApprovalPermission(request.department) &&
              userPermissions.includes(getDepartmentApprovalPermission(request.department));
            const isDirectorApprover = userPermissions.includes("SO Changes Director Approval");
            return (
              <div
                key={request._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                        {request.department}
                      </span>
                      <span className="text-xs text-gray-400">#{request._id?.slice(-6)}</span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 truncate">{request.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{request.description}</p>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                        <strong>{request.requestedBy?.name || "unknown"}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(request.createdAt)}
                      </span>
                    </div>

                    {(request.firstApprovedBy || request.secondApprovedBy) && (
                      <div className="mt-2 text-xs text-gray-400">
                        {request.firstApprovedBy && (
                          <span className="inline-flex items-center gap-1 mr-3">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            Approved : {request.firstApprovedBy?.name}
                            {request.firstApprovedAt ? ` (${formatDate(request.firstApprovedAt)})` : ""}
                          </span>
                        )}
                        {request.secondApprovedBy ? (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            Director : {request.secondApprovedBy?.name}
                          </span>
                        ) : request.status === "waiting_director_approval" ? (
                          <span className="text-blue-500 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Waiting for Director Approval
                          </span>
                        ) : null}
                      </div>
                    )}

                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {canApproveRequest(request) &&
                      request.status === "pending" &&
                      request.requestedBy?._id !== user?.id &&
                      !isRequesterManager(request) && (
                        <>
                          {getDepartmentApprovalPermission(
                            request.department
                          ) &&
                            userPermissions.includes(
                              getDepartmentApprovalPermission(
                                request.department
                              )
                            ) ? (
                            <button
                              onClick={() => viewDetail(request)}
                              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Review & Approve
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                              title="Waiting for Manager Approval First"
                            >
                              <Clock className="w-4 h-4" />
                              Wait Manager Approval
                            </button>
                          )}
                        </>
                      )}

                    {canApproveRequest(request) &&
                      request.status === "pending" &&
                      request.requestedBy?._id !== user?.id &&
                      isRequesterManager(request) && (
                        <>
                          {userPermissions.includes(
                            "SO Changes Director Approval"
                          ) || userPermissions.includes("Manage Users") ? (
                            <button
                              onClick={() => viewDetail(request)}
                              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Review & Approve
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                              title="Only Director can approve Manager's request"
                            >
                              <Clock className="w-4 h-4" />
                              Director Approval Required
                            </button>
                          )}
                        </>
                      )}

                    {canApproveRequest(request) &&
                      request.status === "waiting_director_approval" &&
                      request.requestedBy?._id !== user?.id && (
                        <>
                          {userPermissions.includes(
                            "SO Changes Director Approval"
                          ) || userPermissions.includes("Manage Users") ? (
                            <button
                              onClick={() => viewDetail(request)}
                              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Director Final Approve
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg cursor-not-allowed"
                              title="Waiting for Director approval"
                            >
                              <Clock className="w-4 h-4" />
                              Wait For Director's Approval
                            </button>
                          )}
                        </>
                      )}

                    {request.status === "approved" && (
                      <button
                        onClick={() => viewDetail(request)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        View Approved
                      </button>
                    )}

                    {request.status === "revisi" && (
                      <button
                        onClick={() => viewDetail(request)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        View Revisi
                      </button>
                    )}

                    {request.status === "rejected" && (
                      <button
                        onClick={() => viewDetail(request)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        View Rejected
                      </button>
                    )}

                    {request.status === "pending" &&
                      request.requestedBy?._id === user?.id &&
                      !userPermissions.includes(
                        "SO Changes Director Approval"
                      ) && (
                        <button
                          onClick={() => handleCancel(request._id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Request
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedRequest.title}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  {getStatusBadge(selectedRequest.status)}
                  {getPriorityBadge(selectedRequest.priority)}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                    {selectedRequest.department}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >&times;</button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {selectedRequest.title}
                </h3>
                <p classname="text-gray-600 mb-4">
                  {selectedRequest.description}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">
                      Requested by:
                    </span>
                    <p className="text-gray-600">
                      {selectedRequest.requestedBy?.name}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Date:</span>
                    <p className="text-gray-600">
                      {formatDate(selectedRequest.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Change Type:
                    </span>
                    <p className="text-gray-600">
                      {selectedRequest.changeType}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Department:
                    </span>
                    <p className="text-gray-600">
                      {selectedRequest.department}
                    </p>
                  </div>
                </div>
              </div>

              {(selectedRequest.firstApprovedBy ||
                selectedRequest.secondApprovedBy) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Approval Progress:
                    </h4>
                    <div className="space-y-2">
                      {selectedRequest.firstApprovedBy && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>
                            <strong>Manager Approval:</strong>{" "}
                            {selectedRequest.firstApprovedBy.name}
                          </span>
                          {selectedRequest.firstApprovedAt && (
                            <span className="text-gray-500">
                              ({formatDate(selectedRequest.firstApprovedAt)})
                            </span>
                          )}
                        </div>
                      )}
                      {selectedRequest.secondApprovedBy ? (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>
                            <strong>Director Approval:</strong>{" "}
                            {selectedRequest.secondApprovedBy.name}
                          </span>
                          {selectedRequest.secondApprovedAt && (
                            <span className="text-gray-500">
                              ({formatDate(selectedRequest.secondApprovedAt)})
                            </span>
                          )}
                        </div>
                      ) : selectedRequest.status ===
                        "waiting_director_approval" ? (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Clock className="w-5 h-5" />
                          <span>
                            <strong>Director Approval:</strong> Pending
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

              {selectedRequest.reviewComments && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Review Comments :
                  </h4>
                  <div
                    className={`border-l-4 p-4 ${selectedRequest.status === "rejected"
                      ? "bg-red-50 border-red-500"
                      : selectedRequest.status === "revisi"
                        ? "bg-orange-50 border-orange-500"
                        : "bg-blue-50 border-blue 500"
                      }`}
                  >
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedRequest.reviewComments}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      By {selectedRequest.reviewedBy?.name} on{" "}
                      {formatDate(selectedRequest.reviewedAt)}
                    </p>
                  </div>
                </div>
              )}

              {canApproveRequest(selectedRequest) &&
                ["pending", "waiting_director_approval"].includes(
                  selectedRequest.status
                ) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      <MessageSquare className="inline w-5 h-5 mr-2" />
                      Review Comments:
                    </h4>
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Optional for approval
                      </span>
                      <span>|</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        <span className="font-semibold text-red-600">Required for rejection</span>
                      </span>
                    </p>
                    <textarea
                      value={reviewComments}
                      onChange={(e) => {
                        setReviewComments(e.target.value);
                        setShowValidationError(false);
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${showValidationError
                        ? "border-red-500 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
                        }`}
                      rows="4"
                      placeholder="Add your comments here... (Required if rejecting"
                    />
                    {showValidationError && (
                      <p className="text-red-600 text-sm mt-2 font-semibold flex items-center gap-1">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        Rejection reason is required!
                      </p>
                    )}
                  </div>
                )}
              {selectedRequest && (
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => handlePreviewJobDesc(selectedRequest)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
                  >
                    <Eye className="w-5 h-5" />
                    <span className="font-medium">Preview Job Description</span>
                  </button>
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

              {canApproveRequest(selectedRequest) && (
                <>
                  {selectedRequest.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleReject(selectedRequest._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transtion-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                        <AlertCircle className="w-4 h-4" />
                        Send for Revision
                      </button>

                      <button
                        onClick={() => handleApprove(selectedRequest._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={actionLoading}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    </>
                  )}
                  {selectedRequest.status === "waiting_director_approval" && (
                    <>
                      <button
                        onClick={() => handleReject(selectedRequest._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-alowwed flex items-center gap-2"
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
                        <AlertCircle className="w-4 h-4" />
                        Send for Revision
                      </button>

                      <button
                        onClick={() => handleApprove(selectedRequest._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={actionLoading}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Final Approve
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Job Description Preview Modal */}
      {showJobDescPreview && previewJobDescData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Job Description Preview
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Employee:{" "}
                  <span className="font-medium">
                    {previewJobDescData.memberInfo.name}
                  </span>{" "}
                  ({previewJobDescData.memberInfo.noPNK})
                </p>
              </div>
              <button
                onClick={() => {
                  setShowJobDescPreview(false);
                  setPreviewJobDescData(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Job Description Content */}
            <div className="p-6">
              <div
                className="bg-white border-2 border-black"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {/* Header Section */}
                <div className="border-b-2 border-black">
                  <div className="flex">
                    {/* Logo Section */}
                    <div className="w-64 border-r-2 border-black p-2">
                      <div className="flex flex-col items-center">
                        <img
                          src="/images/dcilong.png"
                          alt="Dharma Group Logo"
                          className="max-w-full max-h-26 object-contain mb-2"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/dcilong.png";
                          }}
                        />
                      </div>
                    </div>

                    {/* Title Section */}
                    <div className="flex-1 border-r-2 border-black flex flex-col justify-between p-2">
                      <div></div>
                      <div className="text-center">
                        <h1 className="text-xl font-bold italic">
                          JOB DESCRIPTION
                        </h1>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="text-left">
                          <span className="font-medium">Tanggal : </span>
                          <span>
                            {previewJobDescData.jobDesc?.tanggal
                              ? new Date(previewJobDescData.jobDesc.tanggal).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                              : new Date().toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                          </span>
                        </div>
                        <div className="text-left">
                          <span className="font-medium">Revisi : </span>
                          <span>
                            {previewJobDescData.jobDesc?.revisi || "0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dibuat Section */}
                    <div className="w-32 border-r-2 border-black">
                      <div className="border-b border-black p-1 text-center">
                        <p className="text-xs font-bold">Dibuat,</p>
                      </div>
                      <div className="border-b border-black p-12 text-center"></div>
                    </div>

                    {/* Disetujui Section */}
                    <div className="w-32">
                      <div className="border-b border-black p-1 text-center">
                        <p className="text-xs font-bold">Disetujui,</p>
                      </div>
                      <div className="border-b border-black p-12 text-center"></div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="border-b-2 border-black">
                  <div className="flex">
                    <div className="flex-1 border-r border-black">
                      <div className="border-b border-black p-3">
                        <div className="flex">
                          <span className="font-bold w-32">DIVISION</span>
                          <span className="mr-2">:</span>
                          <span>
                            {previewJobDescData.jobDesc?.division || "-"}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex">
                          <span className="font-bold w-32">POSITION TITLE</span>
                          <span className="mr-2">:</span>
                          <span>
                            {previewJobDescData.jobDesc?.positionTitle || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="border-b border-black p-3">
                        <div className="flex">
                          <span className="font-bold w-32">DEPARTMENT</span>
                          <span className="mr-2">:</span>
                          <span>
                            {previewJobDescData.departmentName?.toUpperCase() ||
                              "-"}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex">
                          <span className="font-bold w-32">REPORTS TO</span>
                          <span className="mr-2">:</span>
                          <span>
                            {previewJobDescData.jobDesc?.reportsTo || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="border-b border-black p-3">
                  <div className="mb-2">
                    <span className="font-bold text-sm">RESPONSIBILITIES</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {previewJobDescData.jobDesc?.responsibilities &&
                      previewJobDescData.jobDesc.responsibilities.length > 0 ? (
                      previewJobDescData.jobDesc.responsibilities.map(
                        (responsibility, index) => (
                          <li key={index}>{responsibility}</li>
                        )
                      )
                    ) : (
                      <li>No responsibilities defined</li>
                    )}
                  </ol>
                </div>

                {/* Accountabilities */}
                <div className="border-b border-black p-3">
                  <div className="mb-2">
                    <span className="font-bold text-sm">ACCOUNTABILITIES</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {previewJobDescData.jobDesc?.accountabilities &&
                      previewJobDescData.jobDesc.accountabilities.length > 0 ? (
                      previewJobDescData.jobDesc.accountabilities.map(
                        (accountability, index) => (
                          <li key={index}>{accountability}</li>
                        )
                      )
                    ) : (
                      <li>No accountabilities defined</li>
                    )}
                  </ol>
                </div>

                {/* Interactions */}
                <div className="border-b border-black p-3">
                  <div className="mb-2">
                    <span className="font-bold text-sm">INTERACTIONS</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {previewJobDescData.jobDesc?.interactions?.internal &&
                      previewJobDescData.jobDesc.interactions.internal.length >
                      0 ? (
                      previewJobDescData.jobDesc.interactions.internal.map(
                        (interaction, index) => (
                          <li key={index}>{interaction}</li>
                        )
                      )
                    ) : (
                      <li>No interactions defined</li>
                    )}
                  </ol>
                </div>

                {/* Competence */}
                <div className="border-b border-black p-3">
                  <div className="mb-2">
                    <span className="font-bold text-sm">COMPETENCE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="font-bold text-sm mb-2">
                        A. Competence Managerial :
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {previewJobDescData.jobDesc?.competence?.managerial &&
                          previewJobDescData.jobDesc.competence.managerial
                            .length > 0 ? (
                          previewJobDescData.jobDesc.competence.managerial.map(
                            (comp, index) => <li key={index}>{comp}</li>
                          )
                        ) : (
                          <li>No managerial competence defined</li>
                        )}
                      </ol>
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-2">
                        B. Competence Skill :
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {previewJobDescData.jobDesc?.competence?.skill &&
                          previewJobDescData.jobDesc.competence.skill.length >
                          0 ? (
                          previewJobDescData.jobDesc.competence.skill.map(
                            (skill, index) => <li key={index}>{skill}</li>
                          )
                        ) : (
                          <li>No skills defined</li>
                        )}
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Job Specification */}
                <div className="p-3">
                  <div className="mb-2">
                    <span className="font-bold text-sm">JOB SPECIFICATION</span>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-sm">
                    <div className="space-y-1">
                      <div className="flex">
                        <span className="w-44">Usia</span>
                        <span className="mr-2">:</span>
                        <span>
                          {previewJobDescData.jobDesc?.jobSpecification?.age ||
                            "-"}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-44">Pendidikan</span>
                        <span className="mr-2">:</span>
                        <span>
                          {previewJobDescData.jobDesc?.jobSpecification
                            ?.education || "-"}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-44">Pendidikan Non Formal</span>
                        <span className="mr-2">:</span>
                        <span>
                          {previewJobDescData.jobDesc?.jobSpecification
                            ?.nonFormalEducation || "-"}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="w-44">Pengalaman Kerja</span>
                        <span className="mr-2">:</span>
                        <span>
                          {previewJobDescData.jobDesc?.jobSpecification
                            ?.experience || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => {
                  setShowJobDescPreview(false);
                  setPreviewJobDescData(null);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescChangeRequests;