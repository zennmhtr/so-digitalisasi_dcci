import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  AlertCircle,
  FileText,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { soChangeRequestsAPI } from "../services/api";

const SOPreview = ({ proposedData, currentData }) => {
  console.log("🔍 SOPreview Debug:", {
    hasProposedData: !!proposedData,
    hasCurrentData: !!currentData,
    proposedData: proposedData,
    currentData: currentData,
  });

  const newOrg = proposedData.organizationData;
  const oldOrg = currentData?.organizationData || null;

  console.log("📊 Org Data:", {
    newOrg: newOrg,
    oldOrg: oldOrg,
    hasOldOrg: !!oldOrg,
  });

  if (!proposedData?.organizationData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No organization data available</p>
      </div>
    );
  }

  const getChangeSummary = () => {
    const summary = {
      headerChanges: [],
      signatureChanges: [],
      commissionerChanges: [],
      structureChanges: {
        bod: { added: [], modified: [], removed: [] },
        management: { added: [], modified: [], removed: [] },
        divisions: { added: [], modified: [], removed: [] },
        departments: { added: [], modified: [], removed: [] },
        sections: { added: [], modified: [], removed: [] },
      },
    };

    if (!oldOrg) {
      console.log("⚠️ No old data - treating as new structure");
      return summary;
    }

    const generateItemKey = (item) => {
      if (item.code) return `code:${item.code.trim().toUpperCase()}`;
      if (item.id) return `id:${item.id}`;
      if (item.label) return `label:${item.label.trim().toUpperCase()}`;
      if (item.title)
        return `title:${item.title.trim().toUpperCase().substring(0, 30)}`;
      return `fallback:${JSON.stringify(item).substring(0, 50)}`;
    };

    const normalize = (str) => {
      if (str === null || str === undefined) return "";
      return String(str).trim().toUpperCase();
    };

    const compareItems = (oldItem, newItem) => {
      const changes = {
        name: false,
        empId: false,
        title: false,
        label: false,
        code: false,
      };

      let hasChanges = false;

      if (normalize(oldItem.name) !== normalize(newItem.name)) {
        changes.name = true;
        hasChanges = true;
        console.log(`🔄 Name changed: "${oldItem.name}" → "${newItem.name}"`);
      }

      if (normalize(oldItem.empId) !== normalize(newItem.empId)) {
        changes.empId = true;
        hasChanges = true;
        console.log(
          `🔄 EmpId changed: "${oldItem.empId}" → "${newItem.empId}"`
        );
      }

      if (normalize(oldItem.title) !== normalize(newItem.title)) {
        changes.title = true;
        hasChanges = true;
        console.log(
          `🔄 Title changed: "${oldItem.title}" → "${newItem.title}"`
        );
      }

      if (normalize(oldItem.label) !== normalize(newItem.label)) {
        changes.label = true;
        hasChanges = true;
        console.log(
          `🔄 Label changed: "${oldItem.label}" → "${newItem.label}"`
        );
      }

      if (normalize(oldItem.code) !== normalize(newItem.code)) {
        changes.code = true;
        hasChanges = true;
        console.log(`🔄 Code changed: "${oldItem.code}" → "${newItem.code}"`);
      }

      return { hasChanges, changes };
    };

    if (newOrg.header && oldOrg.header) {
      Object.keys(newOrg.header).forEach((key) => {
        if (key === "effectiveDate") return;
        if (normalize(newOrg.header[key]) !== normalize(oldOrg.header[key])) {
          summary.headerChanges.push({
            field: key,
            old: oldOrg.header[key] || "-",
            new: newOrg.header[key] || "-",
          });
        }
      });
    }

    if (newOrg.signatures && oldOrg.signatures) {
      ["preparedBy", "middleBy", "approvedBy"].forEach((sigType) => {
        if (newOrg.signatures[sigType] && oldOrg.signatures[sigType]) {
          if (
            normalize(newOrg.signatures[sigType].name) !==
            normalize(oldOrg.signatures[sigType].name)
          ) {
            summary.signatureChanges.push({
              field: `${sigType} - Name`,
              old: oldOrg.signatures[sigType].name || "-",
              new: newOrg.signatures[sigType].name || "-",
            });
          }
        }
      });
    }

    if (newOrg.commissioners && oldOrg.commissioners) {
      if (
        normalize(newOrg.commissioners.president?.name) !==
        normalize(oldOrg.commissioners.president?.name)
      ) {
        summary.commissionerChanges.push({
          field: "President Commissioner",
          old: oldOrg.commissioners.president?.name || "-",
          new: newOrg.commissioners.president?.name || "-",
        });
      }

      const oldComms = oldOrg.commissioners.commissioners || [];
      const newComms = newOrg.commissioners.commissioners || [];
      if (
        JSON.stringify(oldComms.map(normalize)) !==
        JSON.stringify(newComms.map(normalize))
      ) {
        summary.commissionerChanges.push({
          field: "Commissioners List",
          old: oldComms.join(", ") || "-",
          new: newComms.join(", ") || "-",
        });
      }
    }

    const sections = [
      "bod",
      "management",
      "divisions",
      "departments",
      "sections",
    ];

    sections.forEach((section) => {
      const newItems = newOrg.structure?.[section] || [];
      const oldItems = oldOrg.structure?.[section] || [];

      console.log(`\n📊 Comparing section: ${section.toUpperCase()}`);
      console.log(
        `   Old items: ${oldItems.length}, New items: ${newItems.length}`
      );

      const oldItemsMap = new Map();
      oldItems.forEach((item) => {
        const key = generateItemKey(item);
        oldItemsMap.set(key, item);
        console.log(
          `   📌 Old key: ${key} → ${item.name || item.label || item.title}`
        );
      });

      const newItemsMap = new Map();
      newItems.forEach((item) => {
        const key = generateItemKey(item);
        newItemsMap.set(key, item);
        console.log(
          `   📌 New key: ${key} → ${item.name || item.label || item.title}`
        );
      });

      newItems.forEach((newItem) => {
        const key = generateItemKey(newItem);
        const oldItem = oldItemsMap.get(key);

        if (!oldItem) {
          summary.structureChanges[section].added.push(newItem);
          console.log(`   ✅ ADDED: ${key}`);
        } else {
          const comparison = compareItems(oldItem, newItem);

          if (comparison.hasChanges) {
            summary.structureChanges[section].modified.push({
              old: oldItem,
              new: newItem,
              changes: comparison.changes,
            });
            console.log(`   ✏️ MODIFIED: ${key}`, comparison.changes);
          } else {
            console.log(`   ⏸️ No changes: ${key}`);
          }
        }
      });

      oldItems.forEach((oldItem) => {
        const key = generateItemKey(oldItem);
        if (!newItemsMap.has(key)) {
          summary.structureChanges[section].removed.push(oldItem);
          console.log(`   ❌ REMOVED: ${key}`);
        }
      });
    });

    console.log("\n📈 Summary:", {
      headerChanges: summary.headerChanges.length,
      signatureChanges: summary.signatureChanges.length,
      commissionerChanges: summary.commissionerChanges.length,
      structureChanges: Object.entries(summary.structureChanges).map(
        ([key, val]) => ({
          section: key,
          added: val.added.length,
          modified: val.modified.length,
          removed: val.removed.length,
        })
      ),
    });

    return summary;
  };

  const changeSummary = getChangeSummary();

  const renderComparisonBox = (change, section) => {
    const { old: oldItem, new: newItem, changes } = change;

    return (
      <div className="bg-white border-2 border-blue-500 rounded-lg overflow-hidden shadow-md">
        <div className="grid grid-cols-2 divide-x-2 divide-blue-500">
          {/* SEBELUM */}
          <div className="p-4 bg-red-50">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                SEBELUM
              </span>
              <span className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded">
                {oldItem.code || oldItem.id}
              </span>
            </div>
            <div className="space-y-2">
              {oldItem.title && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">
                    Jabatan:
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {oldItem.title}
                  </p>
                </div>
              )}
              {oldItem.label && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Label:</p>
                  <p className="text-sm font-bold text-gray-900">
                    {oldItem.label}
                  </p>
                </div>
              )}
              {oldItem.name && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Nama:</p>
                  <p className="text-base font-bold text-gray-900">
                    {oldItem.name || "TBD"}
                  </p>
                </div>
              )}
              {oldItem.empId && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">
                    Employee ID:
                  </p>
                  <p className="text-sm font-mono text-gray-800">
                    {oldItem.empId || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SESUDAH */}
          <div className="p-4 bg-green-50">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                SESUDAH
              </span>
              <span className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded">
                {newItem.code || newItem.id}
              </span>
            </div>
            <div className="space-y-2">
              {newItem.title && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">
                    Jabatan:
                  </p>
                  <p
                    className={`text-sm font-bold ${changes.title
                      ? "text-green-700 bg-green-200 px-2 py-1 rounded"
                      : "text-gray-900"
                      }`}
                  >
                    {newItem.title}
                  </p>
                </div>
              )}
              {newItem.label && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Label:</p>
                  <p
                    className={`text-sm font-bold ${changes.label
                      ? "text-green-700 bg-green-200 px-2 py-1 rounded"
                      : "text-gray-900"
                      }`}
                  >
                    {newItem.label}
                  </p>
                </div>
              )}
              {newItem.name && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Nama:</p>
                  <p
                    className={`text-base font-bold ${changes.name
                      ? "text-green-700 bg-green-200 px-2 py-1 rounded"
                      : "text-gray-900"
                      }`}
                  >
                    {newItem.name || "TBD"}
                  </p>
                </div>
              )}
              {newItem.empId && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">
                    Employee ID:
                  </p>
                  <p
                    className={`text-sm font-mono ${changes.empId
                      ? "text-green-700 bg-green-200 px-2 py-1 rounded"
                      : "text-gray-800"
                      }`}
                  >
                    {newItem.empId || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSimpleComparison = (field, oldValue, newValue) => {
    return (
      <div className="bg-white border-2 border-blue-500 rounded-lg overflow-hidden shadow-md">
        <div className="grid grid-cols-2 divide-x-2 divide-blue-500">
          <div className="p-4 bg-red-50">
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full mb-3 inline-block">
              SEBELUM
            </span>
            <div>
              <p className="text-xs text-gray-600 font-semibold">{field}:</p>
              <p className="text-sm font-bold text-gray-900">
                {oldValue || "-"}
              </p>
            </div>
          </div>
          <div className="p-4 bg-green-50">
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-3 inline-block">
              SESUDAH
            </span>
            <div>
              <p className="text-xs text-gray-600 font-semibold">{field}:</p>
              <p className="text-sm font-bold text-green-700 bg-green-200 px-2 py-1 rounded inline-block">
                {newValue || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasAnyChanges =
    changeSummary.headerChanges.length > 0 ||
    changeSummary.signatureChanges.length > 0 ||
    changeSummary.commissionerChanges.length > 0 ||
    Object.values(changeSummary.structureChanges).some(
      (section) =>
        section.added.length > 0 ||
        section.modified.length > 0 ||
        section.removed.length > 0
    );

  if (!currentData || !oldOrg) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-yellow-800 text-lg">
              ⚠️ Data SEBELUM Tidak Tersedia
            </h4>
            <p className="text-sm text-yellow-700 mt-2">
              Sistem tidak memiliki data struktur sebelumnya (currentData).
              Tidak dapat menampilkan perbandingan perubahan.
            </p>
            <p className="text-sm text-yellow-700 mt-2 font-semibold">
              Solusi: Pastikan data tersimpan di localStorage sebelum submit
              changes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAnyChanges) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tidak Ada Perubahan Terdeteksi
        </h3>
        <p className="text-gray-600 mb-4">
          Data sama antara SEBELUM dan SESUDAH.
        </p>
      </div>
    );
  }

  const sectionNames = {
    bod: "Board of Directors",
    management: "Management Functions",
    divisions: "Division Labels",
    departments: "Department Heads",
    sections: "Section Heads / Engineering Product Leaders",
  };

  return (
    <div className="space-y-6">
      {/* Header Changes */}
      {changeSummary.headerChanges.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📋 Perubahan Header ({changeSummary.headerChanges.length})
          </h3>
          <div className="space-y-4">
            {changeSummary.headerChanges.map((change, idx) => (
              <div key={idx}>
                {renderSimpleComparison(change.field, change.old, change.new)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature Changes */}
      {changeSummary.signatureChanges.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            ✍️ Perubahan Tanda Tangan ({changeSummary.signatureChanges.length})
          </h3>
          <div className="space-y-4">
            {changeSummary.signatureChanges.map((change, idx) => (
              <div key={idx}>
                {renderSimpleComparison(change.field, change.old, change.new)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commissioner Changes */}
      {changeSummary.commissionerChanges.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            👔 Perubahan Komisaris ({changeSummary.commissionerChanges.length})
          </h3>
          <div className="space-y-4">
            {changeSummary.commissionerChanges.map((change, idx) => (
              <div key={idx}>
                {renderSimpleComparison(change.field, change.old, change.new)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structure Changes */}
      {Object.entries(changeSummary.structureChanges).map(
        ([section, changes]) => {
          const hasChanges =
            changes.added.length > 0 ||
            changes.modified.length > 0 ||
            changes.removed.length > 0;

          if (!hasChanges) return null;

          return (
            <div key={section}>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                🏢 {sectionNames[section]} - Perubahan
              </h3>

              {/* Modified Items */}
              {changes.modified.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    ✏️ Data yang Diubah ({changes.modified.length})
                  </h4>
                  <div className="space-y-4">
                    {changes.modified.map((change, idx) => (
                      <div key={idx}>
                        {renderComparisonBox(change, section)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Added Items */}
              {changes.added.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    ✅ Data Baru ({changes.added.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {changes.added.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-green-50 border-2 border-green-500 rounded-lg p-4"
                      >
                        <p className="font-bold">
                          {item.code}: {item.name || item.label}
                        </p>
                        {item.title && (
                          <p className="text-sm text-gray-600">{item.title}</p>
                        )}
                        {item.empId && (
                          <p className="text-xs text-gray-500">
                            ID: {item.empId}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Removed Items */}
              {changes.removed.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    ❌ Data yang Dihapus ({changes.removed.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {changes.removed.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-red-50 border-2 border-red-500 rounded-lg p-4 opacity-75"
                      >
                        <p className="font-bold line-through">
                          {item.code}: {item.name || item.label}
                        </p>
                        {item.title && (
                          <p className="text-sm text-gray-600 line-through">
                            {item.title}
                          </p>
                        )}
                        {item.empId && (
                          <p className="text-xs text-gray-500 line-through">
                            ID: {item.empId}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }
      )}
    </div>
  );
};

const SOChangeRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviewComments, setReviewComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  const isFirstApprover = user?.role?.permissions?.includes(
    "SO Changes Director Approval"
  );
  const isFinalApprover = user?.role?.permissions?.includes(
    "SO Changes President Director Approval"
  );
  const canViewOwn = user?.role?.permissions?.includes(
    "View Own SO Change Requests"
  );

  const canApprove = isFirstApprover || isFinalApprover;

  console.log("🔐 SO Change Requests Permission Check:", {
    user: user?.name,
    permissions: user?.role?.permissions,
    canApprove: canApprove,
  });

  useEffect(() => {
    const isFirstApprover = user?.role?.permissions?.includes(
      "SO Changes Director Approval"
    );
    const isFinalApprover = user?.role?.permissions?.includes(
      "SO Changes President Director Approval"
    );

    console.log("🔍 SO Change Requests - Permission Debug:", {
      user: user?.name,
      userId: user?.id,
      role: user?.role?.name,
      permissions: user?.role?.permissions,
      isFirstApprover,
      isFinalApprover,
      canApprove,
      allPermissions: user?.role?.permissions,
    });
  }, [user, canApprove]);

  useEffect(() => {
    loadRequests();
  }, [selectedTab]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params = selectedTab !== "all" ? { status: selectedTab } : {};
      const response = await soChangeRequestsAPI.getAll(params);

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
    if (!canApprove) {
      alert("You do not have permission to approve requests");
      return;
    }

    if (!confirm("Are you sure you want to approve this request?")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await soChangeRequestsAPI.approve(
        requestId,
        reviewComments
      );

      if (response.data.success) {
        const updatedRequest = response.data.data;
        console.log("✅ Approve response:", updatedRequest);

        if (updatedRequest.status === "approved") {
          const applied = applyChangesToDashboard(updatedRequest);
          if (!applied) {
            setShowDetailModal(false);
            setReviewComments("");
            loadRequests();
          }
        } else if (updatedRequest.status === "waiting_second_approval") {
          alert("First approval recorded. Waiting for second approver.");
          setShowDetailModal(false);
          setReviewComments("");
          loadRequests();
        } else {
          setShowDetailModal(false);
          setReviewComments("");
          loadRequests();
        }
      }
    } catch (error) {
      console.error("❌ Error approving request:", error);
      alert(error.response?.data?.message || "Failed to approve request");
      setActionLoading(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevisi = async (requestId) => {
    if (!canApprove) {
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
      const response = await soChangeRequestsAPI.revisi(
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
    if (!canApprove) {
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
      const response = await soChangeRequestsAPI.reject(
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
      const response = await soChangeRequestsAPI.cancel(requestId);

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

  const applyChangesToDashboard = (request) => {
    try {
      const { proposedData } = request;

      console.log("🔄 Applying changes to dashboard:", proposedData);

      if (proposedData && proposedData.organizationData) {
        console.log("✅ Found organizationData, saving to localStorage...");

        localStorage.setItem(
          "dashboard-organization-data",
          JSON.stringify(proposedData.organizationData)
        );

        if (proposedData.layoutData) {
          console.log("✅ Found layoutData, saving to localStorage...");
          localStorage.setItem(
            "dashboard-editor-layout",
            JSON.stringify(proposedData.layoutData)
          );
        }

        console.log("✅ Changes applied to dashboard localStorage");

        // Dispatch custom event so Dashboard (if open in same tab) picks up changes immediately
        window.dispatchEvent(
          new CustomEvent("dashboard-data-updated", {
            detail: proposedData.organizationData,
          })
        );

        alert(
          "✅ Request approved successfully! Dashboard will reload to show changes."
        );

        window.location.href = "/";

        return true;
      } else {
        console.log(
          "⚠️ Using old format, applying based on affectedSection..."
        );
        const currentData = localStorage.getItem("dashboard-organization-data");
        let dashboardData = currentData ? JSON.parse(currentData) : {};
        const { affectedSection } = request;

        if (affectedSection === "header") {
          dashboardData.header = { ...dashboardData.header, ...proposedData };
        } else if (affectedSection === "commissioners") {
          dashboardData.commissioners = {
            ...dashboardData.commissioners,
            ...proposedData,
          };
        } else if (affectedSection === "signatures") {
          dashboardData.signatures = {
            ...dashboardData.signatures,
            ...proposedData,
          };
        } else if (
          [
            "bod",
            "management",
            "divisions",
            "departments",
            "sections",
          ].includes(affectedSection)
        ) {
          if (!dashboardData.structure) {
            dashboardData.structure = {};
          }
          dashboardData.structure[affectedSection] = proposedData;
        }

        localStorage.setItem(
          "dashboard-organization-data",
          JSON.stringify(dashboardData)
        );

        console.log("✅ Changes applied to dashboard (old format)");

        alert(
          "✅ Request approved successfully! Dashboard will reload to show changes."
        );
        window.location.href = "/";

        return true;
      }
    } catch (error) {
      console.error("❌ Error applying changes to dashboard:", error);
      alert(
        "Changes approved but failed to apply to dashboard. Please refresh the page manually."
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
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: Clock,
        text: "Pending",
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
      waiting_second_approval: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: Clock,
        text: "Waiting Second Approval",
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
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-700 border-gray-300",
      medium: "bg-blue-100 text-blue-700 border-blue-300",
      high: "bg-orange-100 text-orange-700 border-orange-300",
      urgent: "bg-red-100 text-red-700 border-red-300",
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[priority] || colors.medium}`}
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

  if (!canApprove && !canViewOwn) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500">Anda tidak memiliki permission untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  const allTabs = [
    { id: "all", label: "All Requests" },
    { id: "pending", label: "Pending" },
    { id: "waiting_second_approval", label: "Waiting Approval" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "cancelled", label: "Cancelled" },
    { id: "revisi", label: "Revisi" },
  ];

  const tabCounts = allTabs.map((tab) => ({
    ...tab,
    count: tab.id === "all" ? requests.length : requests.filter((r) => r.status === tab.id).length,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SO Change Requests</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review and approve organization structure change requests
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
          filteredRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    {getStatusBadge(request.status)}
                    {getPriorityBadge(request.priority)}
                    <span className="text-xs text-gray-400">#{request._id?.slice(-6)}</span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 truncate">{request.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{request.description}</p>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500 mt-2">
                    <span>👤 <strong>{request.requestedBy?.name}</strong></span>
                    <span>📋 {request.affectedSection}</span>
                    <span>🕐 {formatDate(request.createdAt)}</span>
                  </div>

                  {(request.firstApprovedBy || request.secondApprovedBy) && (
                    <div className="mt-2 text-xs text-gray-400">
                      {request.firstApprovedBy && (
                        <span className="inline-flex items-center gap-1 mr-3">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          Director: {request.firstApprovedBy?.name}

                        </span>
                      )}
                      {request.secondApprovedBy ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          Presiden Director: {request.secondApprovedBy?.name}
                        </span>
                      ) : request.status === "waiting_second_approval" ? (
                        <span className="text-blue-500">🕒 Waiting for Second Approval</span>
                      ) : null}
                    </div>
                  )}

                  {request.reviewedBy && (
                    <div className="mt-1 text-xs text-gray-400">
                      Reviewed by {request.reviewedBy.name} · {formatDate(request.reviewedAt)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {canApprove &&
                    request.status === "pending" &&
                    isFirstApprover && (
                      <button
                        onClick={() => viewDetail(request)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Review & Approve
                      </button>
                    )}

                  {canApprove &&
                    request.status === "waiting_second_approval" &&
                    isFinalApprover && (
                      <button
                        onClick={() => viewDetail(request)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Review & Final Approve
                      </button>
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
                      <MessageSquare className="w-4 h-4" />
                      View Rejected
                    </button>
                  )}

                  {canViewOwn &&
                    !canApprove &&
                    request.status === "pending" &&
                    request.requestedBy?._id === user?.id && (
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
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 border-b border-gray-200 px-6 py-4 bg-white z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Request Detail
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
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

              {/* Add Tabs */}
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
                <SOPreview
                  proposedData={selectedRequest.proposedData}
                  currentData={selectedRequest.currentData}
                />
              ) : (
                <div className="space-y-6">
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
                        <span className="font-semibold text-gray-700">
                          Date:
                        </span>
                        <p className="text-gray-600">
                          {formatDate(selectedRequest.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Affected Section:
                        </span>
                        <p className="text-gray-600">
                          {selectedRequest.affectedSection}
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
                    </div>
                  </div>

                  {/* Approval Progress */}
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
                                <strong>Director:</strong>{" "}
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
                                <strong>Presiden Director:</strong>{" "}
                                {selectedRequest.secondApprovedBy.name}
                              </span>
                              {selectedRequest.secondApprovedAt && (
                                <span className="text-gray-500">
                                  ({formatDate(selectedRequest.secondApprovedAt)})
                                </span>
                              )}
                            </div>
                          ) : selectedRequest.status ===
                            "waiting_second_approval" ? (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Clock className="w-5 h-5" />
                              <span>
                                <strong>Presiden Director:</strong> Pending
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}

                  {/* Review Comments */}
                  {selectedRequest.reviewComments && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Review Comments:
                      </h4>
                      <div
                        className={`border-l-4 p-4 ${selectedRequest.status === "rejected"
                          ? "bg-red-50 border-red-500"
                          : selectedRequest.status === "revisi"
                            ? "bg-orange-50 border-orange-500"
                            : "bg-blue-50 border-blue-500"
                          }`}
                      >
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedRequest.reviewComments}
                        </p>
                        {selectedRequest.reviewedBy &&
                          selectedRequest.reviewedAt && (
                            <p className="text-sm text-gray-500 mt-2">
                              By {selectedRequest.reviewedBy.name} on{" "}
                              {formatDate(selectedRequest.reviewedAt)}
                            </p>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Review Input for Managers */}
                  {canApprove &&
                    ["pending", "waiting_second_approval"].includes(
                      selectedRequest.status
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

            {/* Modal Footer - same as before */}
            {/* Modal Footer */}
            {canApprove &&
              ["pending", "waiting_second_approval"].includes(
                selectedRequest.status
              ) && (
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={actionLoading}
                  >
                    Close
                  </button>
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
                    <AlertCircle className="w-4 h-4" />
                    Send for Revision
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={actionLoading}
                  >
                    {selectedRequest.status === "waiting_second_approval" ? (
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
      )}
    </div>
  );
};

export default SOChangeRequests;