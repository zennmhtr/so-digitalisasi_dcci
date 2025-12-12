import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { soBagianChangeRequestsAPI } from "../services/api";

const SOBagianChangeRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviewComments, setReviewComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);

  const getDepartmentApprovalPermission = (departmentName) => {
    const mapping = {
      "Finance Department": "SO Bagian Finance Approval",
      "HRGA & IT Department": "SO Bagian HRGA & IT Approval",
      "Management Development": "SO Bagian Management Development Approval",
      "Management Representative":
        "SO Bagian Management Representative Approval",
      "Manufacturing Battery": "SO Bagian Manufacturing Battery Approval",
      "Manufacturing Cable": "SO Bagian Manufacturing Cable Approval",
      "Marketing Battery Department": "SO Bagian Marketing Battery Approval",
      "Marketing Engineering": "SO Bagian Marketing Engineering Approval",
      "MI & SHE": "SO Bagian MI & SHE Approval",
      "PPIC": "SO Bagian PPIC Approval",
      "Purchasing": "SO Bagian Purchasing Approval",
      "QA Department": "SO Bagian QA Approval",
    };
    return mapping[departmentName] || null;
  };

  const canApproveRequest = (request) => {
    const userPermissions = user?.role?.permissions || [];

    if (userPermissions.includes("Manage Users")) return true;
    if (userPermissions.includes("SO Changes First Approval")) return true;

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
      (perm) => perm.startsWith("SO Bagian") && perm.endsWith("Approval")
    );
  };

  const hasAnyApprovalPermission = () => {
    const userPermissions = user?.role?.permissions || [];
    if (userPermissions.includes("Manage Users")) return true;
    if (userPermissions.includes("SO Changes First Approval")) return true;

    return userPermissions.some(
      (perm) => perm.startsWith("SO Bagian") && perm.endsWith("Approval")
    );
  };

  const canViewBagian = user?.role?.permissions?.includes("SO Bagian Request");

  console.log("🔐 SO Bagian Change Requests Permission Check:", {
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
      const response = await soBagianChangeRequestsAPI.getAll(params);
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

    if (!confirm("Are you sure you want to approve this request?")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await soBagianChangeRequestsAPI.approve(
        requestId,
        reviewComments
      );

      if (response.data.success) {
        const updatedRequest = response.data.data;
        console.log("✅ Approve response:", updatedRequest);
        if (updatedRequest.status === "approved") {
          applyChangesToSOBagian(updatedRequest);
        } else if (updatedRequest.status === "waiting_director_approval") {
          alert("First approval recorded. waiting for director approval.");
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
      alert("⚠️ Please provide comments for revision.");
      return;
    }

    if (!confirm("Are you sure you want to send this request for revision?"))
      return;

    try {
      setActionLoading(true);
      const response = await soBagianChangeRequestsAPI.revisi(
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
      alert(
        "⚠️ Please provide a reason for rejection in the Review Comments field."
      );

      setTimeout(() => {
        setShowValidationError(false);
      }, 5000);
      return;
    }

    setShowValidationError(false);

    if (!confirm("Are you sure you want to reject this request?")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await soBagianChangeRequestsAPI.reject(
        requestId,
        trimmedComments
      );

      if (response.data.success) {
        alert("❌ Request rejected");
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
    if (!confirm("Are you sure you want to cancel this request?")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await soBagianChangeRequestsAPI.cancel(requestId);

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

  const applyChangesToSOBagian = (request) => {
    try {
      const { proposedData } = request;
      console.log("📄 Full request:", request);
      console.log("📄 Proposed data:", proposedData);

      if (proposedData && proposedData.organizationData) {
        const orgData = proposedData.organizationData;
        console.log("📦 Organization data:", orgData);

        const departmentId = orgData.departmentId;
        const structure = orgData.structure;

        if (!departmentId) {
          console.error("❌ No departmentId found");
          alert("⚠️ Cannot apply changes: Department ID not found");
          return false;
        }

        if (!structure) {
          console.error("❌ No structure found");
          alert("⚠️ Cannot apply changes: Structure data not found");
          return false;
        }

        console.log("🔍 Department ID:", departmentId);
        console.log("🔍 Structure:", structure);

        const storageKey = `so-bagian-${departmentId}`;

        const dataToSave = {
          ...structure,
          lastModified: orgData.lastModified || new Date().toISOString(),
          modifiedBy: orgData.modifiedBy || "System",
          approvedAt: request.approvedAt,
          approvedBy: request.approvedBy?.name || "Unknown",
        };

        console.log("💾 Storage key:", storageKey);
        console.log("💾 Data to save:", dataToSave);

        localStorage.setItem(storageKey, JSON.stringify(dataToSave));

        const saved = localStorage.getItem(storageKey);
        console.log("✅ Saved data verification:", JSON.parse(saved));

        window.dispatchEvent(
          new CustomEvent(`so-bagian-${departmentId}-updated`, {
            detail: dataToSave,
          })
        );

        console.log("✅ Changes applied successfully");

        setShowDetailModal(false);
        setReviewComments("");
        loadRequests();

        alert(
          "✅ Request approved successfully! Redirecting to SO Bagian Editor..."
        );

        setTimeout(() => {
          window.location.href = `/so-bagian-editor?dept=${departmentId}`;
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
        "Changes approved but failed to apply. Please refresh the page manually."
      );
      return false;
    }
  };

  const viewDetail = (request) => {
    setSelectedRequest(request);
    setReviewComments("");
    setShowValidationError(false);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: "Pending",
      },
      waiting_director_approval: {
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
        text: "Waiting Director Approval",
      },
      approved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Rejected",
      },
      cancelled: {
        color: "bg-gray-100 text-gray-800",
        icon: AlertCircle,
        text: "Cancelled",
      },
      revisi: {
        color: "bg-orange-100 text-orange-800",
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
        className={`px-2 py-1 rounded text-xs font-medium ${
          color[priority] || color.medium
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
            You do not have permission to view SO Bagian Change Requests.
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
          <h1 className="text-2xl font-bold text-gray-900">
            SO Bagian Change Requests
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve organization structure change requests
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {(() => {
                const userPermissions = user?.role?.permissions || [];
                const isDirector =
                  userPermissions.includes("SO Changes First Approval") ||
                  userPermissions.includes("Manage Users");

                return [
                  { id: "all", label: "All Request" },
                  { id: "pending", label: "Pending" },
                  {
                    id: "waiting_director_approval",
                    label: "Waiting Director",
                  },
                  { id: "approved", label: "Approved" },
                  { id: "rejected", label: "Rejected" },
                  { id: "cancelled", label: "Cancel" },
                  { id: "revisi", label: "Revisi" },
                ]
                  .filter((tab) => {
                    if (tab.id === "cancelled") {
                      return !isDirector;
                    }
                    return true;
                  })
                  .map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        selectedTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ));
              })()}
            </nav>
          </div>
        </div>

        {/* Request List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading request...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No request found</p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const userPermissions = user?.role?.permissions || [];
              const isManagerApprover =
                getDepartmentApprovalPermission(request.department) &&
                userPermissions.includes(
                  getDepartmentApprovalPermission(request.department)
                );
              const isDirectorApprover = userPermissions.includes(
                "SO Changes First Approval"
              );
              return (
                <div
                  key={request._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.title}
                        </h3>
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                          {request.department}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>
                          <strong>Requested by:</strong>{" "}
                          {request.requestedBy?.name || "Unknown"}
                        </span>
                        <span>
                          <strong>Date:</strong>
                          {formatDate(request.createdAt)}
                        </span>
                      </div>

                      {(request.firstApprovedBy ||
                        request.secondApprovedBy) && (
                        <div className="mt-2 text-sm text-gray-500">
                          <strong>Approval Stage:</strong>{" "}
                          {request.firstApprovedBy && (
                            <span>
                              ✅ Approved By: {request.firstApprovedBy?.name}{" "}
                              {request.firstApprovedAt
                                ? `(${formatDate(request.firstApprovedAt)})`
                                : ""}
                            </span>
                          )}
                          {request.secondApprovedBy ? (
                            <span>
                              {" | ✅ Second Approve: "}
                              {request.secondApprovedBy?.name}{" "}
                              {request.secondApprovedAt
                                ? `(${formatDate(request.secondApprovedAt)})`
                                : ""}
                            </span>
                          ) : request.status === "waiting_director_approval" ? (
                            <span className="text-blue-600">
                              {" "}
                              | 🕒 Waiting for Director Approval
                            </span>
                          ) : null}
                        </div>
                      )}

                      {request.approvedBy && (
                        <div className="mt-2 flex items-center gap-6 text-sm text-gray-500">
                          <span>
                            <strong>Approved by:</strong>{" "}
                            {request.approvedBy.name}
                          </span>
                          {request.approvedAt && (
                            <span>
                              <strong>Date:</strong>{" "}
                              {formatDate(request.approvedAt)}
                            </span>
                          )}
                        </div>
                      )}
                      {request.reviewedBy && (
                        <div className="mt-2 flex items-center gap-6 text-sm text-gray-500">
                          <span>
                            <strong>Reviewed by:</strong>{" "}
                            {request.reviewedBy.name}
                          </span>
                          {request.reviewedAt && (
                            <span>
                              <strong>Date:</strong>{" "}
                              {formatDate(request.reviewedAt)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
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
                                className="flex items-center gap-1 px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-800 transition-colors"
                              >
                                Review & Approve
                              </button>
                            ) : (
                              <button
                                disabled
                                className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-200 text-gray-500 rounded cursor-not-allowed"
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
                              "SO Changes First Approval"
                            ) || userPermissions.includes("Manage Users") ? (
                              <button
                                onClick={() => viewDetail(request)}
                                className="flex items-center gap-1 px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-800 transition-colors"
                              >
                                Review & Approve
                              </button>
                            ) : (
                              <button
                                disabled
                                className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-200 text-gray-500 rounded cursor-not-allowed"
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
                              "SO Changes First Approval"
                            ) || userPermissions.includes("Manage Users") ? (
                              <button
                                onClick={() => viewDetail(request)}
                                className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                Director Final Approve
                              </button>
                            ) : (
                              <button
                                disabled
                                className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded cursor-not-allowed"
                                title="Waiting for Director approval"
                              >
                                <Clock className="w-4 h-4" />
                                Wait For Director's Approval
                              </button>
                            )}
                          </>
                        )}

                      {request.status === "revisi" && (
                        <button
                          onClick={() => viewDetail(request)}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          View Revisi
                        </button>
                      )}

                      {request.status === "rejected" && (
                        <button
                          onClick={() => viewDetail(request)}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          View Rejected
                        </button>
                      )}

                      {request.status === "pending" &&
                        request.requestedBy?._id === user?.id &&
                        !userPermissions.includes(
                          "SO Changes First Approval"
                        ) && (
                          <button
                            onClick={() => handleCancel(request._id)}
                            className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
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
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4x1 w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div
              className={`sticky top-0 border-b border-gray-200 px-6 py-4 flex justify-between items-center ${
                selectedRequest.status === "revisi"
                  ? "bg-orange-50"
                  : selectedRequest.status === "rejected"
                  ? "bg-red-50"
                  : "bg-white"
              }`}
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Request Detail
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedRequest.status)}
                  {getPriorityBadge(selectedRequest.priority)}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                    {selectedRequest.department}
                  </span>
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

              {/* Review Comments (if reviewed) */}
              {selectedRequest.reviewComments && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Review Comments:
                  </h4>
                  <div
                    className={`border-l-4 p-4 ${
                      selectedRequest.status === "rejected"
                        ? "bg-red-50 border-red-500"
                        : selectedRequest.status === "revisi"
                        ? "bg-orange-50 border-orange-500"
                        : "bg-blue-50 border-blue-500"
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
                    <p className="text-sm text-gray-600 mb-2">
                      ✅ Optional for approval | ⚠️{" "}
                      <span className="font-semibold text-red-600">
                        Required for rejection
                      </span>
                    </p>
                    <textarea
                      value={reviewComments}
                      onChange={(e) => {
                        setReviewComments(e.target.value);
                        setShowValidationError(false);
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        showValidationError
                          ? "border-red-500 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      rows="4"
                      placeholder="Add your comments here... (Required if rejecting"
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
    </div>
  );
};

export default SOBagianChangeRequests;