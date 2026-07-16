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
import StaticOrgChart from "../components/StaticOrgChart";
import Swal from 'sweetalert2';

const SOPreview = ({ proposedData, currentData }) => {
  console.log("🔍 SOPreview Debug:", {
    hasProposedData: !!proposedData,
    hasCurrentData: !!currentData,
    proposedData: proposedData,
    currentData: currentData,
  });

  const newOrg = proposedData.organizationData;
  const oldOrg = currentData?.organizationData || null;

  if (!proposedData?.organizationData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No organization data available</p>
      </div>
    );
  }

  // ─── 1. getChangeSummary ────────────────────────────────────────
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

    if (!oldOrg) return summary;

    const generateItemKey = (item) => {
      if (item.code) return `code:${item.code.trim().toUpperCase()}`;
      if (item.id) return `id:${item.id}`;
      if (item.label) return `label:${item.label.trim().toUpperCase()}`;
      if (item.title) return `title:${item.title.trim().toUpperCase().substring(0, 30)}`;
      return `fallback:${JSON.stringify(item).substring(0, 50)}`;
    };

    const normalize = (str) => {
      if (str === null || str === undefined) return "";
      return String(str).trim().toUpperCase();
    };

    const compareItems = (oldItem, newItem) => {
      const changes = { name: false, empId: false, title: false, label: false, code: false };
      let hasChanges = false;
      if (normalize(oldItem.name) !== normalize(newItem.name)) { changes.name = true; hasChanges = true; }
      if (normalize(oldItem.empId) !== normalize(newItem.empId)) { changes.empId = true; hasChanges = true; }
      if (normalize(oldItem.title) !== normalize(newItem.title)) { changes.title = true; hasChanges = true; }
      if (normalize(oldItem.label) !== normalize(newItem.label)) { changes.label = true; hasChanges = true; }
      if (normalize(oldItem.code) !== normalize(newItem.code)) { changes.code = true; hasChanges = true; }
      return { hasChanges, changes };
    };

    if (newOrg.header && oldOrg.header) {
      Object.keys(newOrg.header).forEach((key) => {
        if (key === "effectiveDate") return;
        if (normalize(newOrg.header[key]) !== normalize(oldOrg.header[key])) {
          summary.headerChanges.push({ field: key, old: oldOrg.header[key] || "-", new: newOrg.header[key] || "-" });
        }
      });
    }

    if (newOrg.signatures && oldOrg.signatures) {
      ["preparedBy", "middleBy", "approvedBy"].forEach((sigType) => {
        if (newOrg.signatures[sigType] && oldOrg.signatures[sigType]) {
          if (normalize(newOrg.signatures[sigType].name) !== normalize(oldOrg.signatures[sigType].name)) {
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
      if (normalize(newOrg.commissioners.president?.name) !== normalize(oldOrg.commissioners.president?.name)) {
        summary.commissionerChanges.push({
          field: "President Commissioner",
          old: oldOrg.commissioners.president?.name || "-",
          new: newOrg.commissioners.president?.name || "-",
        });
      }
      const oldComms = oldOrg.commissioners.commissioners || [];
      const newComms = newOrg.commissioners.commissioners || [];
      if (JSON.stringify(oldComms.map(normalize)) !== JSON.stringify(newComms.map(normalize))) {
        summary.commissionerChanges.push({
          field: "Commissioners List",
          old: oldComms.join(", ") || "-",
          new: newComms.join(", ") || "-",
        });
      }
    }

    ["bod", "management", "divisions", "departments", "sections"].forEach((section) => {
      const newItems = newOrg.structure?.[section] || [];
      const oldItems = oldOrg.structure?.[section] || [];
      const oldItemsMap = new Map(oldItems.map(item => [generateItemKey(item), item]));
      const newItemsMap = new Map(newItems.map(item => [generateItemKey(item), item]));

      newItems.forEach((newItem) => {
        const key = generateItemKey(newItem);
        const oldItem = oldItemsMap.get(key);
        if (!oldItem) {
          summary.structureChanges[section].added.push(newItem);
        } else {
          const comparison = compareItems(oldItem, newItem);
          if (comparison.hasChanges) {
            summary.structureChanges[section].modified.push({ old: oldItem, new: newItem, changes: comparison.changes });
          }
        }
      });

      oldItems.forEach((oldItem) => {
        const key = generateItemKey(oldItem);
        if (!newItemsMap.has(key)) {
          summary.structureChanges[section].removed.push(oldItem);
        }
      });
    });

    return summary;
  };

  // ─── 2. getLayoutChangeSummary ──────────────────────────────────
  const getLayoutChangeSummary = () => {
    if (!oldOrg) return { positionChanges: [], connectionChanges: { added: [], removed: [] }, sizeChanges: [] };

    const positionChanges = [];
    const sizeChanges = [];

    const newPositions = newOrg.positions || {};
    const oldPositions = oldOrg.positions || {};
    const allPosKeys = new Set([...Object.keys(newPositions), ...Object.keys(oldPositions)]);

    allPosKeys.forEach(key => {
      const oldPos = oldPositions[key];
      const newPos = newPositions[key];
      if (!oldPos && newPos) {
        positionChanges.push({ key, type: 'added', old: null, new: newPos });
      } else if (oldPos && !newPos) {
        positionChanges.push({ key, type: 'removed', old: oldPos, new: null });
      } else if (oldPos && newPos) {
        const dx = Math.abs((oldPos.x || 0) - (newPos.x || 0));
        const dy = Math.abs((oldPos.y || 0) - (newPos.y || 0));
        if (dx > 5 || dy > 5) {
          positionChanges.push({ key, type: 'moved', old: oldPos, new: newPos, dx: Math.round(dx), dy: Math.round(dy) });
        }
      }
    });

    const newSizes = newOrg.sizes || {};
    const oldSizes = oldOrg.sizes || {};
    const allSizeKeys = new Set([...Object.keys(newSizes), ...Object.keys(oldSizes)]);

    allSizeKeys.forEach(key => {
      const o = oldSizes[key];
      const n = newSizes[key];
      if (o && n && (Math.abs((o.width || 0) - (n.width || 0)) > 2 || Math.abs((o.height || 0) - (n.height || 0)) > 2)) {
        sizeChanges.push({ key, old: o, new: n });
      }
    });

    const newConns = newOrg.connections || [];
    const oldConns = oldOrg.connections || [];
    const connKey = (c) => `${c.from}->${c.to}`;
    const oldConnMap = new Map(oldConns.map(c => [connKey(c), c]));
    const newConnMap = new Map(newConns.map(c => [connKey(c), c]));
    const addedConns = newConns.filter(c => !oldConnMap.has(connKey(c)));
    const removedConns = oldConns.filter(c => !newConnMap.has(connKey(c)));

    return { positionChanges, connectionChanges: { added: addedConns, removed: removedConns }, sizeChanges };
  };

  // ─── 3. Panggil keduanya ────────────────────────────────────────
  const changeSummary = getChangeSummary();
  const layoutSummary = getLayoutChangeSummary();

  const hasLayoutChanges =
    layoutSummary.positionChanges.length > 0 ||
    layoutSummary.connectionChanges.added.length > 0 ||
    layoutSummary.connectionChanges.removed.length > 0 ||
    layoutSummary.sizeChanges.length > 0;

  const hasAnyChanges =
    changeSummary.headerChanges.length > 0 ||
    changeSummary.signatureChanges.length > 0 ||
    changeSummary.commissionerChanges.length > 0 ||
    Object.values(changeSummary.structureChanges).some(
      (s) => s.added.length > 0 || s.modified.length > 0 || s.removed.length > 0
    ) ||
    hasLayoutChanges; // ← sekarang termasuk layout

  // ─── 4. Early returns ───────────────────────────────────────────
  if (!currentData || !oldOrg) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-yellow-800 text-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Data SEBELUM Tidak Tersedia
            </h4>
            <p className="text-sm text-yellow-700 mt-2">
              Sistem tidak memiliki data struktur sebelumnya (currentData). Tidak dapat menampilkan perbandingan perubahan.
            </p>
            <p className="text-sm text-yellow-700 mt-2 font-semibold">
              Solusi: Pastikan data tersimpan di localStorage sebelum submit changes.
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Perubahan Terdeteksi</h3>
        <p className="text-gray-600 mb-4">Data sama antara SEBELUM dan SESUDAH.</p>
      </div>
    );
  }

  // ─── 5. Render helpers ──────────────────────────────────────────
  const sectionNames = {
    bod: "Board of Directors",
    management: "Management Functions",
    divisions: "Division Labels",
    departments: "Department Heads",
    sections: "Section Heads / Engineering Product Leaders",
  };

  const renderComparisonBox = (change) => {
    const { old: oldItem, new: newItem, changes } = change;
    return (
      <div className="bg-white border-2 border-blue-500 rounded-lg overflow-hidden shadow-md">
        <div className="grid grid-cols-2 divide-x-2 divide-blue-500">
          <div className="p-4 bg-red-50">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">SEBELUM</span>
              <span className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded">{oldItem.code || oldItem.id}</span>
            </div>
            <div className="space-y-2">
              {oldItem.title && <div><p className="text-xs text-gray-600 font-semibold">Jabatan:</p><p className="text-sm font-bold text-gray-900">{oldItem.title}</p></div>}
              {oldItem.label && <div><p className="text-xs text-gray-600 font-semibold">Label:</p><p className="text-sm font-bold text-gray-900">{oldItem.label}</p></div>}
              {oldItem.name && <div><p className="text-xs text-gray-600 font-semibold">Nama:</p><p className="text-base font-bold text-gray-900">{oldItem.name}</p></div>}
              {oldItem.empId && <div><p className="text-xs text-gray-600 font-semibold">Employee ID:</p><p className="text-sm font-mono text-gray-800">{oldItem.empId}</p></div>}
            </div>
          </div>
          <div className="p-4 bg-green-50">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">SESUDAH</span>
              <span className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded">{newItem.code || newItem.id}</span>
            </div>
            <div className="space-y-2">
              {newItem.title && <div><p className="text-xs text-gray-600 font-semibold">Jabatan:</p><p className={`text-sm font-bold ${changes.title ? "text-green-700 bg-green-200 px-2 py-1 rounded" : "text-gray-900"}`}>{newItem.title}</p></div>}
              {newItem.label && <div><p className="text-xs text-gray-600 font-semibold">Label:</p><p className={`text-sm font-bold ${changes.label ? "text-green-700 bg-green-200 px-2 py-1 rounded" : "text-gray-900"}`}>{newItem.label}</p></div>}
              {newItem.name && <div><p className="text-xs text-gray-600 font-semibold">Nama:</p><p className={`text-base font-bold ${changes.name ? "text-green-700 bg-green-200 px-2 py-1 rounded" : "text-gray-900"}`}>{newItem.name}</p></div>}
              {newItem.empId && <div><p className="text-xs text-gray-600 font-semibold">Employee ID:</p><p className={`text-sm font-mono ${changes.empId ? "text-green-700 bg-green-200 px-2 py-1 rounded" : "text-gray-800"}`}>{newItem.empId}</p></div>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSimpleComparison = (field, oldValue, newValue) => (
    <div className="bg-white border-2 border-blue-500 rounded-lg overflow-hidden shadow-md">
      <div className="grid grid-cols-2 divide-x-2 divide-blue-500">
        <div className="p-4 bg-red-50">
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full mb-3 inline-block">SEBELUM</span>
          <div><p className="text-xs text-gray-600 font-semibold">{field}:</p><p className="text-sm font-bold text-gray-900">{oldValue || "-"}</p></div>
        </div>
        <div className="p-4 bg-green-50">
          <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-3 inline-block">SESUDAH</span>
          <div><p className="text-xs text-gray-600 font-semibold">{field}:</p><p className="text-sm font-bold text-green-700 bg-green-200 px-2 py-1 rounded inline-block">{newValue || "-"}</p></div>
        </div>
      </div>
    </div>
  );

  // ─── 6. Main render ─────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header Changes */}
      {changeSummary.headerChanges.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Perubahan Header ({changeSummary.headerChanges.length})
          </h3>
          <div className="space-y-4">
            {changeSummary.headerChanges.map((change, idx) => (
              <div key={idx}>{renderSimpleComparison(change.field, change.old, change.new)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Signature Changes */}
      {changeSummary.signatureChanges.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Perubahan Tanda Tangan ({changeSummary.signatureChanges.length})
          </h3>
          <div className="space-y-4">
            {changeSummary.signatureChanges.map((change, idx) => (
              <div key={idx}>{renderSimpleComparison(change.field, change.old, change.new)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Commissioner Changes */}
      {changeSummary.commissionerChanges.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Perubahan Komisaris ({changeSummary.commissionerChanges.length})
          </h3>
          <div className="space-y-4">
            {changeSummary.commissionerChanges.map((change, idx) => (
              <div key={idx}>{renderSimpleComparison(change.field, change.old, change.new)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Structure Changes */}
      {Object.entries(changeSummary.structureChanges).map(([section, changes]) => {
        const hasChanges = changes.added.length > 0 || changes.modified.length > 0 || changes.removed.length > 0;
        if (!hasChanges) return null;
        return (
          <div key={section}>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              {sectionNames[section]} - Perubahan
            </h3>

            {changes.modified.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Data yang Diubah ({changes.modified.length})
                </h4>
                <div className="space-y-4">
                  {changes.modified.map((change, idx) => <div key={idx}>{renderComparisonBox(change)}</div>)}
                </div>
              </div>
            )}

            {changes.added.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Data Baru ({changes.added.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {changes.added.map((item, idx) => (
                    <div key={idx} className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                      <p className="font-bold">{item.code}: {item.name || item.label}</p>
                      {item.title && <p className="text-sm text-gray-600">{item.title}</p>}
                      {item.empId && <p className="text-xs text-gray-500">ID: {item.empId}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {changes.removed.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Data yang Dihapus ({changes.removed.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {changes.removed.map((item, idx) => (
                    <div key={idx} className="bg-red-50 border-2 border-red-500 rounded-lg p-4 opacity-75">
                      <p className="font-bold line-through">{item.code}: {item.name || item.label}</p>
                      {item.title && <p className="text-sm text-gray-600 line-through">{item.title}</p>}
                      {item.empId && <p className="text-xs text-gray-500 line-through">ID: {item.empId}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Layout Changes ─────────────────────────────────────── */}
      {hasLayoutChanges && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="5 9 2 12 5 15" /><polyline points="9 5 12 2 15 5" />
              <polyline points="15 19 12 22 9 19" /><polyline points="19 9 22 12 19 15" />
              <line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" />
            </svg>
            Perubahan Layout/Posisi Box
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-red-400 rounded-lg overflow-hidden">
              <div className="bg-red-500 px-4 py-2 flex items-center gap-2">
                <span className="text-white text-sm font-bold">SEBELUM</span>
                <span className="text-red-200 text-xs">— Struktur Lama</span>
              </div>
              <div
                className="overflow-auto bg-gray-50"
                style={{ height: '550px' }}
              >
                <div style={{
                  zoom: 0.35,
                  width: `${100 / 0.35}%`,
                  transformOrigin: 'top left',
                  pointerEvents: 'none',
                }}>
                  <StaticOrgChart
                    organizationData={oldOrg}
                    onCodeClick={() => { }}
                    employeeJobdescStatus={{}}
                  />
                </div>
              </div>
            </div>

            <div className="border-2 border-green-400 rounded-lg overflow-hidden">
              <div className="bg-green-500 px-4 py-2 flex items-center gap-2">
                <span className="text-white text-sm font-bold">SESUDAH</span>
                <span className="text-green-200 text-xs">— Struktur Baru</span>
              </div>
              <div
                className="overflow-auto bg-gray-50"
                style={{ height: '550px' }}
              >
                <div style={{
                  zoom: 0.35,
                  width: `${100 / 0.35}%`,
                  transformOrigin: 'top left',
                  pointerEvents: 'none',
                }}>
                  <StaticOrgChart
                    organizationData={newOrg}
                    onCodeClick={() => { }}
                    employeeJobdescStatus={{}}
                  />
                </div>
              </div>
            </div>
          </div>

          {layoutSummary.positionChanges.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-bold text-blue-800 mb-2">
                Detail Pergeseran ({layoutSummary.positionChanges.length} box berubah posisi):
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {layoutSummary.positionChanges.map((change, idx) => (
                  <div key={idx} className="text-xs font-mono text-blue-700 flex items-center gap-2">
                    <span className="bg-blue-200 px-1.5 py-0.5 rounded font-bold">{change.key}</span>
                    {change.type === 'moved' && <span>geser {change.dx}px horizontal, {change.dy}px vertikal</span>}
                    {change.type === 'added' && <span className="text-green-700">box baru ditambahkan</span>}
                    {change.type === 'removed' && <span className="text-red-700">box dihapus</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(layoutSummary.connectionChanges.added.length > 0 || layoutSummary.connectionChanges.removed.length > 0) && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Perubahan Line/Koneksi ({layoutSummary.connectionChanges.added.length + layoutSummary.connectionChanges.removed.length})
              </h3>
              <div className="space-y-3">
                {layoutSummary.connectionChanges.added.map((conn, idx) => (
                  <div key={`add-${idx}`} className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex-shrink-0">DITAMBAHKAN</span>
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <span className="bg-white border border-gray-300 rounded px-2 py-1 font-bold">{conn.from}</span>
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span className="bg-white border border-gray-300 rounded px-2 py-1 font-bold">{conn.to}</span>
                    </div>
                  </div>
                ))}
                {layoutSummary.connectionChanges.removed.map((conn, idx) => (
                  <div key={`rem-${idx}`} className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">DIHAPUS</span>
                    <div className="flex items-center gap-2 font-mono text-sm opacity-60">
                      <span className="bg-white border border-gray-300 rounded px-2 py-1 font-bold line-through">{conn.from}</span>
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span className="bg-white border border-gray-300 rounded px-2 py-1 font-bold line-through">{conn.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
        window.dispatchEvent(
          new CustomEvent("dashboard-data-updated", {
            detail: proposedData.organizationData,
          })
        );

        alert("Request approved successfully! Dashboard will reload to show changes.");

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
          "Request approved successfully! Dashboard will reload to show changes."
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
                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" style={{ display: "inline", verticalAlign: "-3px", marginRight: 4 }}>
                        <circle cx="12" cy="8" r="4" fill="#3B82F6" />
                        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#60A5FA" />
                      </svg>
                      {" "}<strong>{request.requestedBy?.name || "Unknown"}</strong>
                    </span>
                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" style={{ display: "inline", verticalAlign: "-3px", marginRight: 4 }}>
                        <rect x="4" y="3" width="16" height="18" rx="1" fill="#F59E0B" />
                        <rect x="7" y="6" width="2.5" height="2.5" fill="#FFFBEB" />
                        <rect x="11.5" y="6" width="2.5" height="2.5" fill="#FFFBEB" />
                        <rect x="16" y="6" width="2.5" height="2.5" fill="#FFFBEB" />
                        <rect x="7" y="10.5" width="2.5" height="2.5" fill="#FFFBEB" />
                        <rect x="11.5" y="10.5" width="2.5" height="2.5" fill="#FFFBEB" />
                        <rect x="16" y="10.5" width="2.5" height="2.5" fill="#FFFBEB" />
                        <rect x="10" y="15.5" width="4" height="5.5" fill="#FFFBEB" />
                      </svg>
                      {" "}{request.department || "Tidak ada departemen"}
                    </span>
                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" style={{ display: "inline", verticalAlign: "-3px", marginRight: 4 }}>
                        <path
                          d="M4 4v6h6M20 20v-6h-6M5.5 9A8 8 0 0119.8 9.5M18.5 15A8 8 0 014.2 14.5"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {" "}{request.changeType}
                    </span>

                    <span>
                      <svg width="16" height="16" viewBox="0 0 24 24" style={{ display: "inline", verticalAlign: "-3px", marginRight: 4 }}>
                        <circle cx="12" cy="12" r="9" fill="#8B5CF6" />
                        <path d="M12 7v5l3.5 3.5" fill="none" stroke="#F5F3FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {" "}{formatDate(request.createdAt)}
                    </span>
                  </div>

                  {(request.firstApprovedBy || request.secondApprovedBy) && (
                    <div className="mt-2 text-xs text-gray-400">
                      {request.firstApprovedBy && (
                        <span className="inline-flex items-center gap-1 mr-3">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          Director : {request.firstApprovedBy?.name}

                        </span>
                      )}
                      {request.secondApprovedBy ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          Presiden Director : {request.secondApprovedBy?.name}
                        </span>
                      ) : request.status === "waiting_second_approval" ? (
                        <span className="text-blue-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Waiting for Second Approval
                        </span>
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
                          Requested by :
                        </span>
                        <p className="text-gray-600">
                          {selectedRequest.requestedBy?.name}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Date :
                        </span>
                        <p className="text-gray-600">
                          {formatDate(selectedRequest.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Affected Section :
                        </span>
                        <p className="text-gray-600">
                          {selectedRequest.affectedSection}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Change Type :
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
                          Approval Progress :
                        </h4>
                        <div className="space-y-2">
                          {selectedRequest.firstApprovedBy && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span>
                                <strong>Director :</strong>{" "}
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
                                <strong>Presiden Director :</strong> Pending
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
                        Review Comments :
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
                          Review Comments :
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
                </div>
              )}
            </div>

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