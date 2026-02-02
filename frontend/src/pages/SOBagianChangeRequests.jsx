import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  FileText,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { soBagianChangeRequestsAPI } from "../services/api";

const SOBagianPreview = ({ proposedData, currentData }) => {
  const [showDebug, setShowDebug] = useState(false);

  console.log("🔍 SOBagianPreview Debug:", {
    hasProposedData: !!proposedData,
    hasCurrentData: !!currentData,
    proposedData: proposedData,
    currentData: currentData
  });

  // ✅ VALIDASI DATA
  if (!proposedData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No proposed data available</p>
      </div>
    );
  }

  // ✅ EXTRACT STRUCTURE DENGAN SAFE HANDLING
  let newStructure = null;
  let oldStructure = null;

  // Try to get structure from different possible paths
  if (proposedData.organizationData?.structure) {
    newStructure = proposedData.organizationData.structure;
  } else if (proposedData.structure) {
    newStructure = proposedData.structure;
  }

  if (currentData?.organizationData?.structure) {
    oldStructure = currentData.organizationData.structure;
  } else if (currentData?.structure) {
    oldStructure = currentData.structure;
  }

  console.log("📊 Extracted structures:", {
    newStructure,
    oldStructure
  });

  if (!newStructure) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-yellow-800 text-lg">⚠️ Invalid Data Structure</h4>
            <p className="text-sm text-yellow-700 mt-2">
              The proposed data structure is missing or invalid.
            </p>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="mt-2 text-xs text-yellow-600 underline"
            >
              {showDebug ? 'Hide' : 'Show'} Debug Info
            </button>
            {showDebug && (
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-64">
                {JSON.stringify({ proposedData, currentData }, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { header: newHeader, positions: newPositions = [] } = newStructure;
  const { header: oldHeader, positions: oldPositions = [] } = oldStructure || {
    header: null,
    positions: [],
  };

  console.log("📋 Positions count:", {
    newPositions: newPositions.length,
    oldPositions: oldPositions.length,
  });

  const getChangeSummary = () => {
    const summary = {
      headerChanges: [],
      positionChanges: {
        added: [],
        modified: [],
        removed: [],
      },
      totalPositions: newPositions.length,
      totalOldPositions: oldPositions.length,
    };

    if (!oldStructure || oldPositions.length === 0) {
      console.log("⚠️ No old structure data - showing all as new");
      return summary;
    }

    // Header changes
    if (newHeader && oldHeader) {
      if (newHeader.head !== oldHeader.head) {
        summary.headerChanges.push({
          field: "Department Head",
          old: oldHeader.head || "-",
          new: newHeader.head || "-",
        });
      }
      if (newHeader.empId !== oldHeader.empId) {
        summary.headerChanges.push({
          field: "Employee ID",
          old: oldHeader.empId || "-",
          new: newHeader.empId || "-",
        });
      }
    }

    // Position changes
    const oldPositionsMap = new Map();
    oldPositions.forEach((pos) => {
      oldPositionsMap.set(pos.code, pos);
    });

    const newPositionsMap = new Map();
    newPositions.forEach((pos) => {
      newPositionsMap.set(pos.code, pos);
    });

    newPositions.forEach((newPos) => {
      const oldPos = oldPositionsMap.get(newPos.code);

      if (!oldPos) {
        summary.positionChanges.added.push(newPos);
      } else {
        const nameChanged = (newPos.name || "").trim() !== (oldPos.name || "").trim();
        const empIdChanged = (newPos.empId || "").trim() !== (oldPos.empId || "").trim();
        const titleChanged = (newPos.title || "").trim() !== (oldPos.title || "").trim();
        const hasChanges = nameChanged || empIdChanged || titleChanged;

        if (hasChanges) {
          summary.positionChanges.modified.push({
            code: newPos.code,
            old: oldPos,
            new: newPos,
            changes: {
              name: nameChanged,
              empId: empIdChanged,
              title: titleChanged,
            }
          });
        }
      }
    });

    oldPositions.forEach((oldPos) => {
      if (!newPositionsMap.has(oldPos.code)) {
        summary.positionChanges.removed.push(oldPos);
      }
    });

    return summary;
  };

  const changeSummary = getChangeSummary();

  const renderComparisonBox = (change) => {
    const { old: oldPos, new: newPos, changes } = change;

    return (
      <div className="bg-white border-2 border-blue-500 rounded-lg overflow-hidden shadow-md">
        <div className="grid grid-cols-2 divide-x-2 divide-blue-500">
          {/* BEFORE */}
          <div className="p-4 bg-red-50">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                BEFORE
              </span>
              <span className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded">
                {oldPos.code}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Position:</p>
                <p className="text-sm font-bold text-gray-900">{oldPos.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Name:</p>
                <p className="text-base font-bold text-gray-900">{oldPos.name || "TBD"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Employee ID:</p>
                <p className="text-sm font-mono text-gray-800">{oldPos.empId || "-"}</p>
              </div>
            </div>
          </div>

          {/* AFTER */}
          <div className="p-4 bg-green-50">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                AFTER
              </span>
              <span className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded">
                {newPos.code}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Position:</p>
                <p className={`text-sm font-bold ${changes.title ? 'text-green-700 bg-green-200 px-2 py-1 rounded' : 'text-gray-900'}`}>
                  {newPos.title}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Name:</p>
                <p className={`text-base font-bold ${changes.name ? 'text-green-700 bg-green-200 px-2 py-1 rounded' : 'text-gray-900'}`}>
                  {newPos.name || "TBD"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Employee ID:</p>
                <p className={`text-sm font-mono ${changes.empId ? 'text-green-700 bg-green-200 px-2 py-1 rounded' : 'text-gray-800'}`}>
                  {newPos.empId || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasAnyChanges =
    changeSummary.headerChanges.length > 0 ||
    changeSummary.positionChanges.added.length > 0 ||
    changeSummary.positionChanges.modified.length > 0 ||
    changeSummary.positionChanges.removed.length > 0;

  if (!currentData || !oldStructure) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-800 text-lg">ℹ️ New Structure Request</h4>
            <p className="text-sm text-blue-700 mt-2">
              This is a new structure creation or no previous data available.
            </p>
            <div className="mt-4">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                Proposed Structure:
              </p>
              <div className="bg-white rounded p-3 space-y-2">
                <div>
                  <span className="text-xs text-gray-600">Department Head:</span>
                  <p className="font-semibold">{newHeader?.head} ({newHeader?.empId})</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Total Positions:</span>
                  <p className="font-semibold">{newPositions.length} positions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAnyChanges) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Changes Detected</h3>
        <p className="text-gray-600">The organization structure has not been modified.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Changes */}
      {changeSummary.headerChanges.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            <FileText className="w-5 h-5 text-orange-600" />
            📝 Header Changes
          </h3>
          <div className="bg-white border-2 border-blue-500 rounded-lg overflow-hidden shadow-md">
            <div className="grid grid-cols-2 divide-x-2 divide-blue-500">
              {/* Before */}
              <div className="p-4 bg-red-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    BEFORE
                  </span>
                </div>
                <div className="space-y-2">
                  {changeSummary.headerChanges.map((change, idx) => (
                    <div key={idx}>
                      <p className="text-xs text-gray-600 font-semibold">{change.field}:</p>
                      <p className="text-sm font-bold text-gray-900">{change.old}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* After */}
              <div className="p-4 bg-green-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    AFTER
                  </span>
                </div>
                <div className="space-y-2">
                  {changeSummary.headerChanges.map((change, idx) => (
                    <div key={idx}>
                      <p className="text-xs text-gray-600 font-semibold">{change.field}:</p>
                      <p className="text-sm font-bold text-gray-900">{change.new}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modified Positions */}
      {changeSummary.positionChanges.modified.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            ✏️ Modified Positions ({changeSummary.positionChanges.modified.length})
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {changeSummary.positionChanges.modified.map((change, idx) => (
              <div key={idx}>
                {renderComparisonBox(change)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Added Positions */}
      {changeSummary.positionChanges.added.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            ✅ New Positions ({changeSummary.positionChanges.added.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {changeSummary.positionChanges.added.map((position, idx) => (
              <div key={idx} className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                <p className="font-bold">{position.code}: {position.name}</p>
                <p className="text-sm text-gray-600">{position.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Removed Positions */}
      {changeSummary.positionChanges.removed.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            ❌ Removed Positions ({changeSummary.positionChanges.removed.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {changeSummary.positionChanges.removed.map((position, idx) => (
              <div key={idx} className="bg-red-50 border-2 border-red-500 rounded-lg p-4 opacity-75">
                <p className="font-bold line-through">{position.code}: {position.name}</p>
                <p className="text-sm text-gray-600 line-through">{position.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SOBagianDetailModal = ({
  request,
  onClose,
  onApprove,
  onRevisi,
  onReject,
  canApprove,
  actionLoading,
  reviewComments,
  setReviewComments,
  showValidationError,
  setShowValidationError,
}) => {
  const [activeTab, setActiveTab] = useState("preview");

  const formatDate = (date) => {
    return new Date(date).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      waiting_director_approval: {
        color: "bg-blue-100 text-blue-800",
        text: "Waiting Director",
      },
      approved: { color: "bg-green-100 text-green-800", text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
      cancelled: { color: "bg-gray-100 text-gray-800", text: "Cancelled" },
      revisi: { color: "bg-orange-100 text-orange-800", text: "Revisi" },
    };
    const config = configs[status] || configs.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${colors[priority] || colors.medium
          }`}
      >
        {priority?.toUpperCase() || "MEDIUM"}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 border-b border-gray-200 px-6 py-4 bg-white z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Request Detail
              </h2>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(request.status)}
                {getPriorityBadge(request.priority)}
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  {request.department}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-4 mt-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("preview")}
              className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === "preview"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Structure Preview
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === "details"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Request Details
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "preview" ? (
            <SOBagianPreview
              proposedData={request.proposedData}
              currentData={request.currentData}
            />
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {request.title}
                </h3>
                <p className="text-gray-600 mb-4">{request.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">
                      Requested by:
                    </span>
                    <p className="text-gray-600">{request.requestedBy?.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Date:</span>
                    <p className="text-gray-600">
                      {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Change Type:
                    </span>
                    <p className="text-gray-600">{request.changeType}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Department:
                    </span>
                    <p className="text-gray-600">{request.department}</p>
                  </div>
                </div>
              </div>

              {(request.firstApprovedBy || request.secondApprovedBy) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Approval Progress:
                  </h4>
                  <div className="space-y-2">
                    {request.firstApprovedBy && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>
                          <strong>Manager Approval:</strong>{" "}
                          {request.firstApprovedBy.name}
                        </span>
                        {request.firstApprovedAt && (
                          <span className="text-gray-500">
                            ({formatDate(request.firstApprovedAt)})
                          </span>
                        )}
                      </div>
                    )}
                    {request.secondApprovedBy ? (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>
                          <strong>Director Approval:</strong>{" "}
                          {request.secondApprovedBy.name}
                        </span>
                        {request.secondApprovedAt && (
                          <span className="text-gray-500">
                            ({formatDate(request.secondApprovedAt)})
                          </span>
                        )}
                      </div>
                    ) : request.status === "waiting_director_approval" ? (
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

              {request.reviewComments && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Review Comments:
                  </h4>
                  <div
                    className={`border-l-4 p-4 ${request.status === "rejected"
                      ? "bg-red-50 border-red-500"
                      : request.status === "revisi"
                        ? "bg-orange-50 border-orange-500"
                        : "bg-blue-50 border-blue-500"
                      }`}
                  >
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {request.reviewComments}
                    </p>
                    {request.reviewedBy && request.reviewedAt && (
                      <p className="text-sm text-gray-500 mt-2">
                        By {request.reviewedBy.name} on{" "}
                        {formatDate(request.reviewedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {canApprove &&
                ["pending", "waiting_director_approval"].includes(
                  request.status
                ) && (
                  <div>
                    <label className="block font-semibold text-gray-900 mb-2">
                      <MessageSquare className="inline w-5 h-5 mr-2" />
                      Review Comments:
                    </label>
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${showValidationError
                        ? "border-red-500 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-blue-500"
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
          )}
        </div>

        {canApprove &&
          ["pending", "waiting_director_approval"].includes(request.status) && (
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={actionLoading}
              >
                Close
              </button>
              <button
                onClick={() => onReject(request._id)}
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
                onClick={() => onRevisi(request._id)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={actionLoading}
              >
                <AlertCircle className="w-4 h-4" />
                Send for Revision
              </button>
              <button
                onClick={() => onApprove(request._id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={actionLoading}
              >
                {request.status === "waiting_director_approval" ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Final Approve
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </>
                )}
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

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
      PPIC: "SO Bagian PPIC Approval",
      Purchasing: "SO Bagian Purchasing Approval",
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
      console.log("🔥 APPLY CHANGES - START");
      console.log("📄 Full request object:", request);

      const { proposedData } = request;

      if (!proposedData) {
        console.error("❌ No proposedData found");
        alert("⚠️ Cannot apply changes: No proposed data");
        return false;
      }

      console.log("📦 Proposed data:", proposedData);

      // ✅ TRY MULTIPLE PATHS TO GET organizationData
      let orgData = null;

      if (proposedData.organizationData) {
        orgData = proposedData.organizationData;
        console.log("✅ Found organizationData directly");
      } else if (proposedData.structure) {
        // Fallback: if structure is directly in proposedData
        orgData = proposedData;
        console.log("✅ Using proposedData as organizationData");
      }

      if (!orgData) {
        console.error("❌ No organization data found");
        alert("⚠️ Cannot apply changes: Invalid data structure");
        return false;
      }

      console.log("📊 Organization data:", orgData);

      // ✅ GET departmentId
      let departmentId = orgData.departmentId;

      // Fallback: try to get from request.department
      if (!departmentId && request.department) {
        // Convert department name to ID
        const deptMapping = {
          "HRGA & IT Department": "hrga-it",
          "Finance Department": "finance",
          "Management Development": "management-development",
          "Management Representative": "management-representative",
          "Manufacturing Battery": "manufactur-battery",
          "Manufacturing Cable": "manufacturing-cable",
          "Marketing Battery Department": "marketing-battery",
          "Marketing Engineering": "marketing-engineering",
          "MI & SHE": "mi-she",
          "PPIC": "ppic",
          "Purchasing": "purchasing",
          "QA Department": "qa"
        };

        departmentId = deptMapping[request.department];
        console.log("🔄 Converted department name to ID:", request.department, "→", departmentId);
      }

      if (!departmentId) {
        console.error("❌ No departmentId found");
        console.log("Available data:", { orgData, request });
        alert("⚠️ Cannot apply changes: Department ID not found");
        return false;
      }

      console.log("🏢 Department ID:", departmentId);

      // ✅ GET structure
      const structure = orgData.structure;

      if (!structure) {
        console.error("❌ No structure found");
        alert("⚠️ Cannot apply changes: Structure data not found");
        return false;
      }

      console.log("🏗️ Structure:", structure);

      // ✅ PREPARE DATA TO SAVE
      const storageKey = `so-bagian-${departmentId}`;
      console.log("💾 Storage key:", storageKey);

      const dataToSave = {
        header: structure.header,
        positions: structure.positions,
        lastModified: orgData.lastModified || new Date().toISOString(),
        modifiedBy: orgData.modifiedBy || "System",
        approvedAt: request.approvedAt,
        approvedBy: request.approvedBy?.name || "Unknown",
      };

      console.log("💾 Data to save:", dataToSave);

      // ✅ SAVE TO LOCALSTORAGE
      try {
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        console.log("✅ Saved to localStorage");

        // Verify
        const saved = localStorage.getItem(storageKey);
        console.log("✅ Verification - Data in localStorage:", JSON.parse(saved));
      } catch (storageError) {
        console.error("❌ localStorage error:", storageError);
        alert("⚠️ Failed to save to localStorage");
        return false;
      }

      // ✅ DISPATCH EVENT
      const eventName = `so-bagian-${departmentId}-updated`;
      console.log("📡 Dispatching event:", eventName);
      console.log("📡 Event data:", dataToSave);

      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: dataToSave,
        })
      );

      console.log("✅ Event dispatched successfully");
      console.log("🔥 APPLY CHANGES - COMPLETE");

      // ✅ CLOSE MODAL & RELOAD
      setShowDetailModal(false);
      setReviewComments("");
      loadRequests();

      // ✅ SHOW SUCCESS MESSAGE
      alert(`✅ Changes approved and applied!\n\nDepartment: ${request.department}\nStorage Key: ${storageKey}\nEvent: ${eventName}\n\nThe ${request.department} page will now reflect the changes.`);

      return true;

    } catch (error) {
      console.error("❌ ERROR in applyChangesToSOBagian:", error);
      console.error("Stack trace:", error.stack);
      alert(`⚠️ Error applying changes: ${error.message}`);
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
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${selectedTab === tab.id
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

                      {request.status === "approved" && (
                        <button
                          onClick={() => viewDetail(request)}
                          className="flex items-center gap-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          View Approved
                        </button>
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
        <SOBagianDetailModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
            setReviewComments("");
            setShowValidationError(false);
          }}
          onApprove={(requestId) => handleApprove(requestId)}
          onRevisi={(requestId) => handleRevisi(requestId)}
          onReject={(requestId) => handleReject(requestId)}
          canApprove={canApproveRequest(selectedRequest)}
          actionLoading={actionLoading}
          reviewComments={reviewComments}
          setReviewComments={setReviewComments}
          showValidationError={showValidationError}
          setShowValidationError={setShowValidationError}
        />
      )}
    </div>
  );
};

export default SOBagianChangeRequests;