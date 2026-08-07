import React from "react";

const DEPARTMENT_COLUMNS = {
  "finance": ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF"],
  "hrga-it": ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF LEVEL"],
  "management-development": ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF"],
  "management-representative": ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF"],
  "manufactur-battery": ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SENIOR ENGINEER", "ENGINEER", "TEAM MEMBER/TECHNICIAN"],
  "manufacturing-cable": ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF / UNIT HEAD", "GROUP HEAD", "TEAM MEMBER/ADMIN"],
  "marketing-battery": ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF/SPECIALIST"],
  "marketing-engineering": ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF"],
  "mi-she": ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF LEVEL"],
  ppic: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "UNIT HEAD/STAFF", "GROUP HEAD", "MEMBER"],
  purchasing: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF LEVEL"],
  qa: ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "UNIT/STAFF LEVEL", "GROUP HEAD", "OPERATOR/ADMIN"],
};

const DEPARTMENT_GROUPS = {
  "finance": {
    "SECTION HEAD": ["FINANCE DEPARTMENT"],
    "STAFF": ["FINANCE & ACCOUNTING"],
  },
  "management-representative": {
    "SECTION HEAD": ["MANAGEMENT REPRESENTATIVE DEPARTMENT"],
    "STAFF": ["MANAGEMENT REPRESENTATIVE"],
  },
  "marketing-battery": {
    "DEPARTMENT HEAD": ["MARKETING BATTERY DEPARTMENT"],
    "STAFF/SPECIALIST": ["AUX & POWER BATTERY MARKETING", "ESS MARKETING"],
  },
  "purchasing": {
    "SECTION HEAD": ["PURCHASING DEPARTMENT"],
    "STAFF LEVEL": ["CONTROLCABLE", "BATTERY", "GENERAL & LEGAL", "SUBCONT"],
  },
  "management-development": {
    "STAFF": ["MANAGEMENT DEVELOPEMENT/PDCA"],
  },
  "mi-she": {
    "SECTION HEAD": ["MI & SHE DEPARTMENT"],
    "STAFF LEVEL": ["MI", "SHE (5R-SMK3-ISO 14001)"],
  },
  "hrga-it": {
    "DEPARTMENT HEAD": ["HRDGA & IT"],
    "SECTION HEAD": ["HRGA & IT"],
    "STAFF LEVEL": ["HRD", "GENERAL AFFAIR & IND. RELATIONS", "INFORMATION TECHNOLOGY"],
  },
  "qa": {
    "DEPARTMENT HEAD": ["QA DEPARTMENT"],
    "UNIT/STAFF LEVEL": ["QUALITY ASSURANCE PROCESS (UNIT)"],
    "OPERATOR/ADMIN": ["QUALITY ASSURANCE PROCESS", "LAB & KALIBRASI", "VENDOR MANAGEMENT", "CLAIM & COMPLAIN", "ADMINISTRASI"],
  },
  "marketing-engineering": {
    "DEPARTMENT HEAD": ["MARKETING ENGINEERING DEPARTMENT"],
    "SECTION HEAD": ["SALES & MARKETING CONTROLCABLE (SECTION)", "ENGINEERING CONTROLCABLE"],
    "STAFF": ["SALES & MARKETING CONTROLCABLE", "CUSTOMER REPRESENTATIVE", "PRODUCT & QUALITY ENGINEERING CABLE", "PROCESS ENGINEERING CABLE", "NEW BUSINESS DEVELOPMENT"],
  },
  "manufactur-battery": {
    "SENIOR ENGINEER": ["MANUFACTURING BATTERY DEPARTMENT"],
    "ENGINEER": ["BATTERY PRODUCTION", "QUALITY ASSURANCE", "BATTERY PME"],
    "TEAM MEMBER/TECHNICIAN": ["AUXILIARY BATTERY PRODUCT", "BESS PRODUCT", "BEV PRODUCT", "QUALITY CHECK"],
  },
  "ppic": {
    "DEPARTMENT HEAD": ["PPIC DEPARTMENT"],
    "UNIT HEAD/STAFF": ["PPC CONTROLCABLE", "BATTERY & AHM OES", "WHS CONTROLCABLE"],
    "GROUP HEAD": ["CONTROLCABLE"],
    "MEMBER": ["PROD PLAN", "DN/MANIFEST", "DELIVERY", "BATTERY", "SUPPLIER CONTROL", "MRP", "RM & OHP", "SUPPLY"],
  },
  "manufacturing-cable": {
    "SECTION HEAD": ["MANUFACTURING CABLE DEPARTMENT"],
    "STAFF / UNIT HEAD": ["MANUFACTURING UNIT", "ASSEMBLING UNIT", "PRODUCTION ENGINEERING (UNIT HEAD)"],
    "GROUP HEAD": ["GROUP CO & CI", "GROUP PO", "GROUP ASSEMBLING"],
    "TEAM MEMBER/ADMIN": ["COMPONENT OUTER & COMPONENT INNER", "PROSES OUTER", "MAINTENANCE", "PRODUCTION ENGINEERING (STAFF)", "ASSEMBLING", "QUALITY CONTROL PROCESS", "QUALITY CONTROL INCOMING", "ADMINISTRATION"],
  },
};

const StaticSoBagianChart = ({
  structureData,
  deptName,
  deptId = null, 
  diffStatuses = {},
  compareHeader = null,
}) => {
  const header = structureData?.header || {};
  const positions = Array.isArray(structureData?.positions) ? structureData.positions : [];

  const hiddenColumns = header.hiddenColumns || {};
  const columnLabels = header.columnLabels || {};

  const deptColumnDefs = deptId ? DEPARTMENT_COLUMNS[deptId] : null;
  const deptGroupDefs = deptId ? DEPARTMENT_GROUPS[deptId] : null;

  const columnsFromPositions = [...new Set(positions.map((p) => p.column).filter(Boolean))];
  const customColumns = Array.isArray(header.customColumns) ? header.customColumns : [];
  const mustHaveColumns = ["BOARD OF DIRECTOR"];
  const relevantColumns =
    customColumns.length > 0
      ? customColumns
      : deptColumnDefs && deptColumnDefs.length > 0
      ? deptColumnDefs
      : columnsFromPositions.length > 0
      ? columnsFromPositions
      : ["DEPARTMENT HEAD", "SECTION HEAD", "STAFF"];

  const rawColumns = [...new Set([...mustHaveColumns, ...relevantColumns])];
  const CANONICAL_ORDER = [
    "BOARD OF DIRECTOR",
    "DEPARTMENT HEAD",
    "SECTION HEAD",
    "SENIOR ENGINEER",
    "UNIT/STAFF LEVEL",
    "ENGINEER",
    "UNIT HEAD/STAFF",
    "STAFF/SPECIALIST",
    "STAFF LEVEL",
    "STAFF",
    "STAFF / UNIT HEAD",
    "GROUP HEAD",
    "TEAM MEMBER/TECHNICIAN",
    "TEAM MEMBER/ADMIN",
    "OPERATOR/ADMIN",
    "MEMBER",
  ];

  let columns;
  if (deptColumnDefs && deptColumnDefs.length > 0 && customColumns.length === 0) {
    columns = deptColumnDefs.filter((c) => !hiddenColumns[c]);
  } else {
    const canonicalPart = CANONICAL_ORDER.filter((c) => rawColumns.includes(c));
    const extraPart = rawColumns.filter((c) => !CANONICAL_ORDER.includes(c));
    columns = [...canonicalPart, ...extraPart].filter((c) => !hiddenColumns[c]);
  }

  const getLabel = (col) => columnLabels[col] || col;

  const getPositionsInColumn = (col) =>
    positions
      .map((p, idx) => ({ p, idx }))
      .filter(({ p }) => p.column === col)
      .sort((a, b) => {
        const orderA = a.p.order ?? a.idx;
        const orderB = b.p.order ?? b.idx;
        return orderA - orderB;
      })
      .map(({ p }) => p);

  const getGroupedPositionsInColumn = (col, groupKeys) => {
    const colPositions = positions.filter((p) => p.column === col);
    const groups = groupKeys.map((groupKey) => {
      const items = colPositions
        .filter((p) => p.groupKey === groupKey)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return { groupKey, items };
    });
    const ungrouped = colPositions
      .filter((p) => !groupKeys.includes(p.groupKey))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return { groups, ungrouped };
  };

  const statusStyle = {
    added: { border: "border-green-500", bg: "bg-green-50", badge: "bg-green-500", label: "BARU" },
    removed: { border: "border-red-500", bg: "bg-red-50", badge: "bg-red-500", label: "DIHAPUS" },
    modified: { border: "border-amber-500", bg: "bg-amber-50", badge: "bg-amber-500", label: "DIUBAH" },
  };

  const isDiff = (getValue) => {
    if (!compareHeader) return false;
    return getValue(header) !== getValue(compareHeader);
  };

  const deptTitle = header.title || deptName || "-";
  const effectiveDate = header.effectiveDate || "16 Maret 2026";

  const signatures = [
    {
      key: "prepared",
      label: "Prepared by :",
      name: header.preparedByName || "",
      role: header.preparedByRole || "DEPARTMENT HEAD",
      nameDiff: isDiff((h) => h.preparedByName || ""),
      roleDiff: isDiff((h) => h.preparedByRole || "DEPARTMENT HEAD"),
    },
    {
      key: "checked",
      label: "Checked by :",
      name: header.checkedByName || "BAMBANG WURYANTO",
      role: header.checkedByRole || "DIRECTOR",
      nameDiff: isDiff((h) => h.checkedByName || "BAMBANG WURYANTO"),
      roleDiff: isDiff((h) => h.checkedByRole || "DIRECTOR"),
    },
    {
      key: "approved",
      label: "Approved by :",
      name: header.approvedByName || "EKO MARYANTO",
      role: header.approvedByRole || "PRESIDENT DIRECTOR",
      nameDiff: isDiff((h) => h.approvedByName || "EKO MARYANTO"),
      roleDiff: isDiff((h) => h.approvedByRole || "PRESIDENT DIRECTOR"),
    },
  ];

  const titleDiff = isDiff((h) => h.title || deptName || "-");
  const dateDiff = isDiff((h) => h.effectiveDate || "16 Maret 2026");

  if (!structureData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
        Tidak ada data struktur
      </div>
    );
  }

  const chartMinWidth = Math.max(1500, columns.length * 300);
  const PersonRow = ({ p, isLast = false }) => {
    const status = diffStatuses?.[p.id];
    const style = status ? statusStyle[status] : null;
    return (
      <div
        className={`flex ${!isLast ? "border-b border-gray-300" : ""} ${
          style ? `${style.bg}` : ""
        }`}
      >
        <div className="bg-gray-100 px-2 py-2 flex items-center justify-center border-r border-gray-400 flex-shrink-0" style={{ minWidth: "56px" }}>
          <p className="text-xs font-bold text-blue-700">{p.code || "-"}</p>
        </div>
        <div className="flex-1 min-w-0 py-1.5 px-2.5">
          {style && (
            <div className={`${style.badge} text-white text-[9px] font-bold text-center leading-tight rounded mb-0.5 -mx-1 px-1`}>
              {style.label}
            </div>
          )}
          <p className={`text-sm font-semibold text-gray-900 leading-tight truncate ${status === "removed" ? "line-through" : ""}`}>
            {p.name || "-"}
          </p>
          {p.empId && <p className="text-xs text-gray-500 leading-tight">({p.empId})</p>}
        </div>
      </div>
    );
  };

  const SingleBox = ({ p }) => {
    const status = diffStatuses?.[p.id];
    const style = status ? statusStyle[status] : null;
    return (
      <div
        className={`flex border rounded shadow-sm overflow-hidden bg-white ${
          style ? `${style.border} ${style.bg} border-2` : "border-gray-400"
        }`}
      >
        <div className="bg-gray-100 px-2 py-2 flex items-center justify-center border-r border-gray-400 flex-shrink-0" style={{ minWidth: "56px" }}>
          <p className="text-xs font-bold text-blue-700">{p.code || "-"}</p>
        </div>
        <div className="flex-1 min-w-0">
          {style && (
            <div className={`${style.badge} text-white text-[9px] font-bold text-center leading-tight`}>
              {style.label}
            </div>
          )}
          {p.title && (
            <div className="bg-yellow-50 border-b border-gray-300 px-2 py-1 leading-tight">
              <p className="text-xs font-bold text-gray-700 truncate">{p.title}</p>
            </div>
          )}
          <div className="px-2.5 py-1.5">
            <p className={`text-sm font-semibold text-gray-900 truncate ${status === "removed" ? "line-through" : ""}`}>
              {p.name || "-"}
            </p>
            {p.empId && <p className="text-xs text-gray-500 leading-tight">({p.empId})</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 bg-white" style={{ minWidth: `${chartMinWidth}px` }}>
      <div className="border-2 border-black p-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="border-2 border-black flex items-center justify-center flex-shrink-0" style={{ width: "90px", height: "90px" }}>
            <img src="/logo/dcci.png" alt="Logo" className="w-full h-full object-contain p-1.5" />
          </div>
          <div
            className={`border-2 border-black flex-1 flex items-center justify-center text-center p-2 ${
              titleDiff || dateDiff ? "bg-amber-100" : ""
            }`}
            style={{ height: "90px" }}
          >
            <div>
              <p className="text-base font-bold text-gray-800 leading-tight">STRUKTUR ORGANISASI</p>
              <p className="text-sm text-gray-600 leading-tight">PT DHARMA CONTROLCABLE INDONESIA</p>
              <p className={`text-sm text-gray-600 leading-tight ${titleDiff ? "font-bold underline" : ""}`}>
                ({deptTitle})
              </p>
              <p className={`text-xs text-gray-500 leading-tight ${dateDiff ? "font-bold underline" : ""}`}>
                Effective Date : {effectiveDate}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {signatures.map((sig) => (
              <div
                key={sig.key}
                className={`border border-black bg-white ${sig.nameDiff || sig.roleDiff ? "ring-2 ring-amber-400" : ""}`}
                style={{ width: "150px", height: "90px" }}
              >
                <div className="border-b border-black px-1.5 py-1">
                  <p className="text-xs font-bold text-black leading-tight">{sig.label}</p>
                </div>
                <div className="flex flex-col justify-end px-1.5 py-1" style={{ height: "66px" }}>
                  <div className={`text-center border-t border-black pt-1 ${sig.nameDiff ? "bg-amber-100" : ""}`}>
                    <p className="text-xs font-bold text-black underline truncate">{sig.name || "-"}</p>
                    <p className={`text-xs text-black truncate ${sig.roleDiff ? "font-bold" : ""}`}>{sig.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col) => (
          <div key={col} className="bg-blue-300 border border-black rounded p-2 text-center">
            <p className="text-sm font-bold text-black">{getLabel(col)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 items-start" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col) => {
          const isBoardColumn = /board of director/i.test(col);
          const groupKeys = deptGroupDefs?.[col];

          return (
            <div key={col} className="space-y-3">
              {isBoardColumn && (
                <>
                  <div className="flex border border-gray-400 rounded shadow-sm overflow-hidden bg-white">
                    <div className="bg-gray-100 px-2 py-2 flex items-center justify-center border-r border-gray-400 flex-shrink-0" style={{ minWidth: "56px" }}>
                      <p className="text-xs font-bold text-blue-700">BOD1.0</p>
                    </div>
                    <div className="px-2.5 py-1.5">
                      <p className="text-sm font-semibold text-gray-900">PRESIDENT DIRECTOR</p>
                      <p className="text-sm text-gray-700">EKO MARYANTO</p>
                      <p className="text-xs text-gray-500">(23200235)</p>
                    </div>
                  </div>
                  <div className="flex border border-gray-400 rounded shadow-sm overflow-hidden bg-white">
                    <div className="bg-gray-100 px-2 py-2 flex items-center justify-center border-r border-gray-400 flex-shrink-0" style={{ minWidth: "56px" }}>
                      <p className="text-xs font-bold text-blue-700">BOD1.1</p>
                    </div>
                    <div className="px-2.5 py-1.5">
                      <p className="text-sm font-semibold text-gray-900">DIRECTOR</p>
                      <p className="text-sm text-gray-700">BAMBANG WURYANTO</p>
                      <p className="text-xs text-gray-500">(23200038)</p>
                    </div>
                  </div>
                </>
              )}

              {!isBoardColumn && groupKeys && groupKeys.length > 0 ? (
                <>
                  {getGroupedPositionsInColumn(col, groupKeys).groups.map(({ groupKey, items }) => (
                    <div key={groupKey} className="bg-white border border-gray-400 rounded shadow-sm overflow-hidden">
                      <div className="bg-gray-100 border-b border-gray-400 px-2 py-1.5 text-center">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                          {header.groupTitles?.[groupKey] || groupKey}
                        </p>
                      </div>
                      {items.length === 0 ? (
                        <p className="text-xs text-gray-300 italic text-center py-2">kosong</p>
                      ) : (
                        items.map((p, idx) => (
                          <PersonRow key={p.id} p={p} isLast={idx === items.length - 1} />
                        ))
                      )}
                    </div>
                  ))}
                  {getGroupedPositionsInColumn(col, groupKeys).ungrouped.map((p) => (
                    <SingleBox key={p.id} p={p} />
                  ))}
                </>
              ) : null}

              {!isBoardColumn && (!groupKeys || groupKeys.length === 0) && (
                <>
                  {getPositionsInColumn(col).length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded p-2 text-center">
                      <p className="text-xs text-gray-300 italic">kosong</p>
                    </div>
                  ) : (
                    getPositionsInColumn(col).map((p) => <SingleBox key={p.id} p={p} />)
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaticSoBagianChart;