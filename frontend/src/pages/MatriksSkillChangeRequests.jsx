import React, { useState, useEffect } from "react";
import {
    CheckCircle,
    XCircle,
    Clock,
    MessageSquare,
    AlertCircle,
    FileText,
    Users,
    Eye,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { matriksSkillChangeRequestsAPI } from "../services/api";
import Swal from 'sweetalert2';

const calcAveragePreview = (vals) => {
    const v = (vals || []).filter((x) => x !== null && x !== undefined);
    if (!v.length) return "-";
    return (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2);
};

const PieChartPreview = ({ value }) => {
    if (!value || isNaN(value)) return <span style={{ fontSize: 9, color: "#9ca3af" }}>-</span>;
    const numValue = parseFloat(value);
    const percentage = (numValue / 4) * 100;
    const getColor = (val) => {
        if (val >= 3.5) return "#22c55e";
        if (val >= 3.0) return "#84cc16";
        if (val >= 2.5) return "#fbbf24";
        if (val >= 2.0) return "#fb923c";
        return "#ef4444";
    };
    const color = getColor(numValue);
    const size = 28, center = size / 2, radius = size / 2 - 1;
    const angle = (percentage / 100) * 360;
    const radians = (angle - 90) * (Math.PI / 180);
    const x = center + radius * Math.cos(radians);
    const y = center + radius * Math.sin(radians);
    const largeArcFlag = angle > 180 ? 1 : 0;
    let path;
    if (percentage >= 100) {
        path = `M ${center},${center} m -${radius},0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
    } else if (percentage > 0) {
        path = `M ${center},${center} L ${center},${center - radius} A ${radius},${radius} 0 ${largeArcFlag},1 ${x},${y} Z`;
    } else {
        path = '';
    }
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={size} height={size}>
                <circle cx={center} cy={center} r={radius} fill="#e5e7eb" />
                {path && <path d={path} fill={color} />}
            </svg>
        </div>
    );
};

const MatriksTableFullPreview = ({ proposedData, departmentName }) => {
    const matriksData = proposedData?.matriksData || proposedData;
    if (!matriksData) {
        return (
            <div className="text-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Data matriks tidak ditemukan</p>
            </div>
        );
    }

    const { judul, divisi, departemen, tglEfektif, kompetensi = [], karyawan = [] } = matriksData;

    const thStyle = {
        border: "1px solid #6b7280",
        padding: "4px 6px",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 10,
        backgroundColor: "white",
        color: "#000000",
    };
    const tdFixed = {
        border: "1px solid #d1d5db",
        padding: "4px 6px",
        fontSize: 11,
        backgroundColor: "white",
        whiteSpace: "nowrap",
    };

    return (
        <div style={{ fontFamily: "sans-serif" }}>
            {/* Header */}
            <div style={{ border: "1px solid #9ca3af", backgroundColor: "#fff", width: "100%", marginBottom: 12 }}>
                <div style={{ display: "flex", borderBottom: "1px solid #9ca3af" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid #9ca3af", padding: "10px 16px", minWidth: "160px" }}>
                        <img src="/logo/dcci.png" alt="PT DCI" style={{ height: "48px", objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 16px", borderRight: "1px solid #9ca3af" }}>
                        <span style={{ fontSize: 16, fontWeight: "bold", letterSpacing: "0.05em", color: "#111827", textTransform: "uppercase" }}>
                            {judul || "MATRIKS KOMPETENSI"}
                        </span>
                    </div>
                    {["DIBUAT", "DISETUJUI"].map((label, i) => (
                        <div key={i} style={{ borderLeft: "1px solid #9ca3af", width: "90px", display: "flex", flexDirection: "column" }}>
                            <div style={{ borderBottom: "1px solid #9ca3af", padding: "4px 6px", textAlign: "center" }}>
                                <span style={{ fontSize: 9, fontWeight: "bold", color: "#111827" }}>{label}</span>
                            </div>
                            <div style={{ flex: 1, minHeight: "50px" }} />
                            <div style={{ borderTop: "1px solid #9ca3af", padding: "3px 6px", textAlign: "center" }}>
                                <span style={{ fontSize: 7, color: "#6b7280" }}>Nama & Ttd</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                    {[["Divisi", divisi], ["Departemen", departemen], ["Tanggal Efektif", tglEfektif]].map(([label, value], i) => (
                        <div key={i} style={{ padding: "6px 12px", borderRight: i < 2 ? "1px solid #9ca3af" : "none", fontSize: 12 }}>
                            <span style={{ fontWeight: 600, color: "#374151" }}>{label}</span>
                            <span style={{ color: "#6b7280" }}> : </span>
                            <span style={{ color: "#111827" }}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "auto" }}>
                    <thead>
                        <tr>
                            {[
                                { label: "No", minW: 36, rowSpan: 2 },
                                { label: "NPK", minW: 80, rowSpan: 2 },
                                { label: "NAMA", minW: 150, rowSpan: 2 },
                                { label: "JABATAN", minW: 110, rowSpan: 2 },
                                { label: "BAGIAN", minW: 120, rowSpan: 2 },
                                { label: "SK / K", minW: 110, rowSpan: 2 },
                            ].map(({ label, minW, rowSpan }) => (
                                <th key={label} rowSpan={rowSpan} style={{ ...thStyle, minWidth: minW, verticalAlign: "middle" }}>{label}</th>
                            ))}
                            <th colSpan={kompetensi.length} style={{ ...thStyle }}>KOMPETENSI</th>
                            <th rowSpan={2} style={{ ...thStyle, minWidth: 110, verticalAlign: "middle" }}>Hasil<br />Kompetensi</th>
                        </tr>
                        <tr>
                            {kompetensi.map((k, i) => (
                                <th key={i} style={{
                                    border: "1px solid #6b7280", textAlign: "center", fontWeight: "bold", fontSize: 9,
                                    backgroundColor: "white", color: "#000000",
                                    writingMode: "vertical-rl", transform: "rotate(180deg)",
                                    minWidth: 30, maxWidth: 30, height: 120, verticalAlign: "bottom", padding: "4px 2px",
                                }}>{k}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {karyawan.map((kar, kIdx) => (
                            <React.Fragment key={kar.npk || kIdx}>
                                {/* Row 1: Kompetensi */}
                                <tr>
                                    <td rowSpan={4} style={{ ...tdFixed, textAlign: "center", fontWeight: 600 }}>{kar.no}</td>
                                    <td rowSpan={4} style={tdFixed}>{kar.npk}</td>
                                    <td rowSpan={4} style={{ ...tdFixed, fontWeight: 500 }}>{kar.nama}</td>
                                    <td rowSpan={4} style={tdFixed}>{kar.jabatan}</td>
                                    <td rowSpan={4} style={tdFixed}>{kar.bagian}</td>
                                    <td style={{ ...tdFixed, fontWeight: 600, textAlign: "center", color: "#000000" }}>Kompetensi</td>
                                    {kompetensi.map((_, ci) => {
                                        const val = (kar.kompetensiValues || [])[ci] ?? null;
                                        return (
                                            <td key={ci} style={{ border: "1px solid #d1d5db", textAlign: "center", backgroundColor: "white", minWidth: 30, padding: "2px" }}>
                                                {val !== null ? <PieChartPreview value={val} /> : ""}
                                            </td>
                                        );
                                    })}
                                    <td rowSpan={4} style={{ border: "1px solid #d1d5db", textAlign: "center", fontWeight: "bold", fontSize: 11, backgroundColor: "white", color: "#1f3864", verticalAlign: "middle" }}>
                                        {calcAveragePreview(kar.kompetensiValues)}
                                    </td>
                                </tr>
                                {/* Row 2: Standar Kompetensi */}
                                <tr>
                                    <td style={{ ...tdFixed, fontWeight: 600, textAlign: "center", color: "#000000" }}>Standar Kompetensi</td>
                                    {kompetensi.map((_, ci) => {
                                        const val = (kar.standarKompetensi || [])[ci] ?? null;
                                        return (
                                            <td key={ci} style={{ border: "1px solid #d1d5db", textAlign: "center", backgroundColor: "white", minWidth: 30, padding: "2px" }}>
                                                {val !== null ? <PieChartPreview value={val} /> : ""}
                                            </td>
                                        );
                                    })}
                                </tr>
                                {/* Row 3: Metode Fulfillment */}
                                <tr>
                                    <td style={{ ...tdFixed, textAlign: "center", color: "#374151" }}>Metode Fulfillment</td>
                                    {kompetensi.map((_, ci) => {
                                        const val = (kar.metodeFulfillment || [])[ci] ?? null;
                                        return (
                                            <td key={ci} style={{ border: "1px solid #d1d5db", textAlign: "center", backgroundColor: val ? "#eff6ff" : "white", minWidth: 30, padding: "2px", fontSize: 10 }}>
                                                {val || ""}
                                            </td>
                                        );
                                    })}
                                </tr>
                                {/* Row 4: Schedule Fulfillment */}
                                <tr>
                                    <td style={{ ...tdFixed, textAlign: "center", color: "#374151" }}>Schedule Fulfillment</td>
                                    {kompetensi.map((_, ci) => {
                                        const val = (kar.scheduleFulfillment || [])[ci] ?? null;
                                        return (
                                            <td key={ci} style={{ border: "1px solid #d1d5db", textAlign: "center", backgroundColor: "white", minWidth: 30, padding: "2px", fontSize: 10 }}>
                                                {val || ""}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MatriksPreviewModal = ({ request, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl flex flex-col" style={{ height: "calc(100vh - 2rem)", maxHeight: "calc(100vh - 2rem)" }}>
            <div className="flex-shrink-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-xl">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-600" />
                        Preview Matriks Skill
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">{request.department} — {request.title}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
                >
                    &times;
                </button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-auto p-6">
                <MatriksTableFullPreview proposedData={request.proposedData} departmentName={request.department} />
            </div>
            <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end rounded-b-xl">
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Tutup Preview
                </button>
            </div>
        </div>
    </div>
);

const MatriksSkillDetailModal = ({
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
    const [showFullPreview, setShowFullPreview] = useState(false);
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between bg-gray-50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{request.title}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {request.department} · {formatDate(request.createdAt)}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Request Information</h3>
                            <p className="text-gray-600 mb-4">{request.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="font-semibold text-gray-700">Requested by:</span><p className="text-gray-600">{request.requestedBy?.name}</p></div>
                                <div><span className="font-semibold text-gray-700">Date:</span><p className="text-gray-600">{formatDate(request.createdAt)}</p></div>
                                <div><span className="font-semibold text-gray-700">Change Type:</span><p className="text-gray-600 capitalize">{request.changeType}</p></div>
                                <div><span className="font-semibold text-gray-700">Department:</span><p className="text-gray-600">{request.department}</p></div>
                                <div><span className="font-semibold text-gray-700">Priority:</span><p className="text-gray-600 capitalize">{request.priority}</p></div>
                            </div>
                        </div>

                        {(request.firstApprovedBy || request.secondApprovedBy) && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Approval Progress:</h4>
                                <div className="space-y-2">
                                    {request.firstApprovedBy && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span><strong>Manager Approval :</strong> {request.firstApprovedBy.name}</span>
                                            {request.firstApprovedAt && <span className="text-gray-400">({formatDate(request.firstApprovedAt)})</span>}
                                        </div>
                                    )}
                                    {request.secondApprovedBy ? (
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span><strong>Director Approval :</strong> {request.secondApprovedBy.name}</span>
                                            {request.secondApprovedAt && <span className="text-gray-400">({formatDate(request.secondApprovedAt)})</span>}
                                        </div>
                                    ) : request.status === "waiting_director_approval" ? (
                                        <div className="flex items-center gap-2 text-sm text-blue-600">
                                            <Clock className="w-5 h-5" />
                                            <span><strong>Director Approval :</strong> Pending</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {request.reviewComments && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Review Comments :</h4>
                                <div className={`border-l-4 p-4 rounded ${request.status === "rejected" ? "bg-red-50 border-red-500"
                                    : request.status === "revisi" ? "bg-orange-50 border-orange-500"
                                        : "bg-blue-50 border-blue-500"
                                    }`}>
                                    <p className="text-gray-700 whitespace-pre-wrap">{request.reviewComments}</p>
                                    {request.reviewedBy && request.reviewedAt && (
                                        <p className="text-sm text-gray-400 mt-2">By {request.reviewedBy.name} on {formatDate(request.reviewedAt)}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {canApprove && ["pending", "waiting_director_approval"].includes(request.status) && (
                            <div>
                                <label className="block font-semibold text-gray-900 mb-2">
                                    <MessageSquare className="inline w-5 h-5 mr-2" />
                                    Review Comments:
                                </label>
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
                                    onChange={(e) => { setReviewComments(e.target.value); setShowValidationError(false); }}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${showValidationError ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                    rows="4"
                                    placeholder="Add your review comments... (Required for rejection/revision)"
                                />
                                {showValidationError && (
                                    <p className="text-red-600 text-sm mt-1 font-semibold flex items-center gap-1">
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                        </svg>
                                        Comments are required!
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Preview Button */}
                        <div className="border-t border-gray-200 pt-4">
                            <button
                                onClick={() => setShowFullPreview(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
                            >
                                <Eye className="w-5 h-5" />
                                <span className="font-medium">Preview Matriks Skill</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    {canApprove && ["pending", "waiting_director_approval"].includes(request.status) && (
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
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                disabled={actionLoading}
                            >
                                {actionLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <XCircle className="w-4 h-4" />}
                                Reject
                            </button>
                            <button
                                onClick={() => onRevisi(request._id)}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                                disabled={actionLoading}
                            >
                                <AlertCircle className="w-4 h-4" /> Send for Revision
                            </button>
                            <button
                                onClick={() => onApprove(request._id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                ) : (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                {request.status === "waiting_director_approval" ? "Final Approve (Director)" : "Approve"}
                            </button>
                        </div>
                    )}

                    {!canApprove && (
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                            <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showFullPreview && (
                <MatriksPreviewModal
                    request={request}
                    onClose={() => setShowFullPreview(false)}
                />
            )}
        </>
    );
};

const MatriksSkillChangeRequests = () => {
    const { user } = useAuth();
    const userPermissions = user?.role?.permissions || [];

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [reviewComments, setReviewComments] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [showValidationError, setShowValidationError] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewRequest, setPreviewRequest] = useState(null);

    const getDepartmentApprovalPermission = (departmentName) => {
        const mapping = {
            "Finance": "Manager Finance Approval",
            "Finance Department": "Manager Finance Approval",
            "HRGA & IT": "Manager HRGA & IT Approval",
            "HRGA & IT Department": "Manager HRGA & IT Approval",
            "Management Development": "Manager Management Development Approval",
            "Management Representative": "Manager Management Representative Approval",
            "Manufacturing Battery": "Manager Manufacturing Battery Approval",
            "Manufacturing Cable": "Manager Manufacturing Cable Approval",
            "Marketing Battery": "Manager Marketing Battery Approval",
            "Marketing Battery Department": "Manager Marketing Battery Approval",
            "Marketing Engineering": "Manager Marketing Engineering Approval",
            "MI & SHE": "Manager MI & SHE Approval",
            "PPIC": "Manager PPIC Approval",
            "Purchasing": "Manager Purchasing Approval",
            "Quality Assurance": "Manager QA Approval",
            "QA Department": "Manager QA Approval",
        };
        return mapping[departmentName] || null;
    };

    const canApproveRequest = (request) => {
        if (userPermissions.includes("Manage Users")) return true;
        if (userPermissions.includes("SO Changes Director Approval")) return true;
        const requiredPermission = getDepartmentApprovalPermission(request.department);
        return requiredPermission && userPermissions.includes(requiredPermission);
    };

    const isRequesterManager = (request) => {
        const requesterPermissions = request.requestedBy?.role?.permissions || [];
        return requesterPermissions.some((p) => p.startsWith("Manager") && p.endsWith("Approval"));
    };

    const hasAnyApprovalPermission = () => {
        if (userPermissions.includes("Manage Users")) return true;
        if (userPermissions.includes("SO Changes Director Approval")) return true;
        return userPermissions.some((p) => p.startsWith("Manager") && p.endsWith("Approval"));
    };

    const hasPageAccess =
        userPermissions.includes("Matriks Skill Editor") ||
        userPermissions.includes("SO Changes Director Approval") ||
        userPermissions.includes("Manage Users") ||
        userPermissions.some((p) => p.startsWith("Manager") && p.endsWith("Approval"));

    const isRegularEmployee =
        userPermissions.includes("Matriks Skill Editor") &&
        !userPermissions.includes("SO Changes Director Approval") &&
        !userPermissions.includes("Manage Users") &&
        !userPermissions.some((p) => p.startsWith("Manager") && p.endsWith("Approval"));

    const isManager =
        userPermissions.some((p) => p.startsWith("Manager") && p.endsWith("Approval")) &&
        !userPermissions.includes("SO Changes Director Approval") &&
        !userPermissions.includes("Manage Users");

    useEffect(() => {
        if (user) loadRequests();
    }, [user, selectedTab]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const params = selectedTab !== "all" ? { status: selectedTab } : {};
            const response = await matriksSkillChangeRequestsAPI.getAll(params);
            if (response.data.success) setRequests(response.data.data);
        } catch (error) {
            console.error("Error loading requests:", error);
            alert("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        if (!canApproveRequest(selectedRequest)) {
            alert("You do not have permission to approve this request");
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
        } try {
            setActionLoading(true);
            const response = await matriksSkillChangeRequestsAPI.approve(requestId, reviewComments);
            if (response.data.success) {
                const updated = response.data.data;
                if (updated.status === "approved") {
                    applyChangesToMatriks(updated);
                } else if (updated.status === "waiting_director_approval") {
                    alert("First approval recorded. Waiting for Director approval.");
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
            console.error("Error approving request:", error);
            alert(error.response?.data?.message || "Failed to approve request");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevisi = async (requestId) => {
        if (!canApproveRequest(selectedRequest)) {
            alert("You do not have permission to revisi this request");
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
            const response = await matriksSkillChangeRequestsAPI.revisi(requestId, trimmed);
            if (response.data.success) {
                alert("Request sent for revision.");
                setShowDetailModal(false);
                setReviewComments("");
                loadRequests();
            }
        } catch (error) {
            console.error("Error revising request:", error);
            alert(error.response?.data?.message || "Failed to send request for revision");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (requestId) => {
        if (!canApproveRequest(selectedRequest)) {
            alert("You do not have permission to reject this request");
            return;
        }
        const trimmed = reviewComments.trim();
        if (!trimmed) {
            setShowValidationError(true);
            alert("⚠️ Please provide a reason for rejection.");
            setTimeout(() => setShowValidationError(false), 5000);
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
        } try {
            setActionLoading(true);
            const response = await matriksSkillChangeRequestsAPI.reject(requestId, trimmed);
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
        } try {
            setActionLoading(true);
            const response = await matriksSkillChangeRequestsAPI.cancel(requestId);
            if (response.data.success) {
                alert("Request cancelled.");
                loadRequests();
            }
        } catch (error) {
            console.error("Error cancelling request:", error);
            alert(error.response?.data?.message || "Failed to cancel request");
        } finally {
            setActionLoading(false);
        }
    };

    const applyChangesToMatriks = (request) => {
        try {
            const { proposedData } = request;
            if (!proposedData) {
                alert("⚠️ Cannot apply changes: No proposed data");
                return;
            }

            const deptId = proposedData.deptId || proposedData.matriksData?.deptId;
            if (!deptId) {
                Swal.fire({
                    title: "Berhasil!",
                    html: `Perubahan telah disetujui dan diterapkan.<br><br> <b>Departemen :</b> ${request.department}<br> Halaman ${request.department} akan otomatis menampilkan perubahan ini.`,
                    icon: "success",
                    confirmButtonColor: "#16a34a",
                    confirmButtonText: "OK",
                });
                setShowDetailModal(false);
                setReviewComments("");
                loadRequests();
                return;
            }

            const storageKey = `matriks-skill-${deptId}`;
            const dataToSave = {
                ...(proposedData.matriksData || proposedData),
                approvedAt: request.approvedAt,
                approvedBy: request.approvedBy?.name || "Unknown",
            };

            localStorage.setItem(storageKey, JSON.stringify(dataToSave));

            window.dispatchEvent(new CustomEvent(`matriks-skill-${deptId}-updated`, { detail: dataToSave }));

            Swal.fire({
                title: "Berhasil!",
                text: `Perubahan telah disetujui dan diterapkan untuk Departemen ${request.department}.`,
                icon: "success",
                confirmButtonColor: "#16a34a",
                confirmButtonText: "OK",
            });
            setShowDetailModal(false);
            setReviewComments("");
            loadRequests();
        } catch (error) {
            console.error("Error applying changes:", error);
            alert(`Warning: Changes approved but could not apply locally: ${error.message}`);
            setShowDetailModal(false);
            loadRequests();
        }
    };

    const viewDetail = (request) => {
        setSelectedRequest(request);
        setReviewComments("");
        setShowValidationError(false);
        setShowDetailModal(true);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    const getStatusBadge = (status) => {
        const cfg = {
            pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock, label: "Pending" },
            waiting_director_approval: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: Clock, label: "Waiting Director" },
            approved: { color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle, label: "Approved" },
            rejected: { color: "bg-red-100 text-red-800 border-red-300", icon: XCircle, label: "Rejected" },
            cancelled: { color: "bg-gray-100 text-gray-600 border-gray-300", icon: XCircle, label: "Cancelled" },
            revisi: { color: "bg-orange-100 text-orange-800 border-orange-300", icon: AlertCircle, label: "Revisi" },
        };
        const { color, icon: Icon, label } = cfg[status] || cfg.pending;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const cfg = {
            low: "bg-gray-100 text-gray-600",
            medium: "bg-blue-100 text-blue-700",
            high: "bg-orange-100 text-orange-700",
            urgent: "bg-red-100 text-red-700",
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${cfg[priority] || cfg.medium}`}>
                {priority?.toUpperCase()}
            </span>
        );
    };

    const tabs = [
        { id: "all", label: "All Requests" },
        { id: "pending", label: "Pending" },
        { id: "waiting_director_approval", label: "Waiting Director" },
        { id: "approved", label: "Approved" },
        { id: "rejected", label: "Rejected" },
        { id: "revisi", label: "Revisi" },
    ];

    const tabCounts = tabs.map((tab) => ({
        ...tab,
        count: tab.id === "all" ? requests.length : requests.filter((r) => r.status === tab.id).length,
    }));

    if (user && !hasPageAccess) {
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

    return (
        <div className="p-6 space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Matriks Skill Change Requests</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isRegularEmployee
                            ? "Lihat dan kelola change request yang Anda submit untuk Matriks Kompetensi Skill"
                            : isManager
                                ? "Kelola change request Matriks Skill — request Anda langsung membutuhkan persetujuan Director"
                                : "Review and manage change requests for Matriks Kompetensi Skill data"}
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

            {/* Request list */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
                        <p className="text-gray-500">Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No change requests found</h3>
                        <p className="text-gray-400 mt-1 text-sm">
                            {selectedTab !== "all" ? `No requests with status "${selectedTab}".` : "No requests submitted yet."}
                        </p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5">
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
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                            </svg>
                                            <strong>{request.requestedBy?.name}</strong>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            {request.department}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            {request.changeType}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formatDate(request.createdAt)}
                                        </span>
                                    </div>

                                    {request.status === "waiting_director_approval" && request.firstApprovedBy && (
                                        <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Manager approved : {request.firstApprovedBy.name}
                                            <span className="text-blue-500 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Waiting for Director Approval
                                            </span>
                                        </div>
                                    )}

                                    {request.approvedBy && (
                                        <div className="mt-2 text-xs text-gray-400">
                                            <strong> Director Approved :</strong> {request.approvedBy.name}
                                            {request.approvedAt && <> · {formatDate(request.approvedAt)}</>}
                                        </div>
                                    )}

                                    {request.reviewedBy && request.status !== "approved" && (
                                        <div className="mt-1 text-xs text-gray-400">
                                            <strong>Reviewed by :</strong> {request.reviewedBy.name}
                                            {request.reviewedAt && <> · {formatDate(request.reviewedAt)}</>}
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    {canApproveRequest(request) &&
                                        request.status === "pending" &&
                                        request.requestedBy?._id !== user?.id &&
                                        !isRequesterManager(request) && (
                                            <>
                                                {getDepartmentApprovalPermission(request.department) &&
                                                    userPermissions.includes(getDepartmentApprovalPermission(request.department)) ? (
                                                    <button
                                                        onClick={() => viewDetail(request)}
                                                        className="flex items-center gap-1 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        Review & Approve
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                                                        title="Waiting for Manager Approval First"
                                                    >
                                                        <Clock className="w-4 h-4" /> Wait Manager Approval
                                                    </button>
                                                )}
                                            </>
                                        )}

                                    {canApproveRequest(request) &&
                                        request.status === "pending" &&
                                        request.requestedBy?._id !== user?.id &&
                                        isRequesterManager(request) && (
                                            <>
                                                {userPermissions.includes("SO Changes Director Approval") ||
                                                    userPermissions.includes("Manage Users") ? (
                                                    <button
                                                        onClick={() => viewDetail(request)}
                                                        className="flex items-center gap-1 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        Review & Approve
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                                                        title="Only Director can approve Manager's request"
                                                    >
                                                        <Clock className="w-4 h-4" /> Director Approval Required
                                                    </button>
                                                )}
                                            </>
                                        )}

                                    {canApproveRequest(request) &&
                                        request.status === "waiting_director_approval" &&
                                        request.requestedBy?._id !== user?.id && (
                                            <>
                                                {userPermissions.includes("SO Changes Director Approval") ||
                                                    userPermissions.includes("Manage Users") ? (
                                                    <button
                                                        onClick={() => viewDetail(request)}
                                                        className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                    >
                                                        Director Final Approve
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg cursor-not-allowed"
                                                    >
                                                        <Clock className="w-4 h-4" /> Wait For Director's Approval
                                                    </button>
                                                )}
                                            </>
                                        )}

                                    {request.status === "approved" && (
                                        <button
                                            onClick={() => viewDetail(request)}
                                            className="flex items-center gap-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" /> View Approved
                                        </button>
                                    )}
                                    {request.status === "revisi" && (
                                        <button
                                            onClick={() => viewDetail(request)}
                                            className="flex items-center gap-1 px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                                        >
                                            <MessageSquare className="w-4 h-4" /> View Revisi
                                        </button>
                                    )}
                                    {request.status === "rejected" && (
                                        <button
                                            onClick={() => viewDetail(request)}
                                            className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <XCircle className="w-4 h-4" /> View Rejected
                                        </button>
                                    )}

                                    {request.status === "pending" &&
                                        request.requestedBy?._id === user?.id &&
                                        !userPermissions.includes("SO Changes Director Approval") && (
                                            <button
                                                onClick={() => handleCancel(request._id)}
                                                className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <XCircle className="w-4 h-4" /> Cancel Request
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
                <MatriksSkillDetailModal
                    request={selectedRequest}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedRequest(null);
                        setReviewComments("");
                        setShowValidationError(false);
                    }}
                    onApprove={(id) => handleApprove(id)}
                    onRevisi={(id) => handleRevisi(id)}
                    onReject={(id) => handleReject(id)}
                    canApprove={canApproveRequest(selectedRequest)}
                    actionLoading={actionLoading}
                    reviewComments={reviewComments}
                    setReviewComments={setReviewComments}
                    showValidationError={showValidationError}
                    setShowValidationError={setShowValidationError}
                />
            )}

            {showPreviewModal && previewRequest && (
                <MatriksPreviewModal
                    request={previewRequest}
                    onClose={() => { setShowPreviewModal(false); setPreviewRequest(null); }}
                />
            )}
        </div>
    );
};

export default MatriksSkillChangeRequests;