import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { soBagianChangeRequestsAPI, soBagianDataAPI, soBagianDepartmentsAPI } from "../services/api";
import JobdescViewer from "../components/JobdescViewer";
import Swal from "sweetalert2";
import { SIGNATURE_IMAGES, DEPARTMENT_SIGNER, DEFAULT_APPROVER } from "../config/signatures";

const getSignatureByName = (name) => {
  if (!name) return null;
  const clean = name.replace(/\*\*/g, "").trim().toUpperCase();
  const matchedKey = Object.keys(SIGNATURE_IMAGES).find(key =>
    key.toUpperCase() === clean || clean.includes(key.toUpperCase()) || key.toUpperCase().includes(clean)
  );
  return matchedKey ? SIGNATURE_IMAGES[matchedKey] : null;
};

const departmentColumns = {
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

const departmentGroups = {
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

const DraggablePositionBox = ({
  posKey,
  positions,
  setPositions,
  isEditMode,
  defaultPos = { x: 0, y: 0 },
  children,
}) => {
  const [dragging, setDragging] = useState(false);
  const startRef = React.useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const pos = positions[posKey] || defaultPos;

  const onMouseDown = (e) => {
    if (!isEditMode) return;
    if (e.target.closest(".so-drag-editable")) return; // biarkan klik di field editable jalan normal, jangan drag
    e.preventDefault();
    e.stopPropagation();
    startRef.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      setPositions((prev) => ({
        ...prev,
        [posKey]: { x: startRef.current.posX + dx, y: startRef.current.posY + dy },
      }));
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, posKey, setPositions]);

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        left: "50%",
        top: pos.y,
        transform: `translateX(calc(-50% + ${pos.x}px))`,
        cursor: isEditMode ? "move" : "default",
        zIndex: dragging ? 50 : 1,
      }}
      className={dragging ? "opacity-75 shadow-2xl" : ""}
    >
      {children}
    </div>
  );
};

const DraggableStack = ({ deptId, columnKey, boxPositions, setPositionsForDept, onDirty, isEditMode, minHeight = 600, gap = 16, children }) => {
  const items = React.Children.toArray(children).filter(Boolean);
  const itemRefs = React.useRef([]);
  const [autoOffsets, setAutoOffsets] = useState([]);

  useEffect(() => {
    const measure = () => {
      const heights = itemRefs.current.map((el) => (el ? el.offsetHeight : 0));
      let cum = 0;
      const offsets = heights.map((h) => {
        const y = cum;
        cum += h + gap;
        return y;
      });
      setAutoOffsets(offsets);
    };

    const timer = setTimeout(measure, 50);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [items.length, gap]);

  const wrappedSetPositions = (updater) => {
    setPositionsForDept(deptId)(updater);
    if (onDirty) onDirty(deptId);
  };

  return (
    <div className="relative w-full" style={{ minHeight }}>
      {items.map((child, idx) => {
        const posKey = `${columnKey}-${idx}`;
        const defaultY = autoOffsets[idx] ?? idx * 150;
        return (
          <DraggablePositionBox
            key={posKey}
            posKey={posKey}
            positions={boxPositions[deptId] || {}}
            setPositions={wrappedSetPositions}
            isEditMode={isEditMode}
            defaultPos={{ x: 0, y: defaultY }}
          >
            <div ref={(el) => (itemRefs.current[idx] = el)}>{child}</div>
          </DraggablePositionBox>
        );
      })}
    </div>
  );
};

const SoBagianEditor = ({ previewMode = false, previewDepartmentId = null } = {}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [departmentData, setDepartmentData] = useState({});
  const [originalDepartmentData, setOriginalDepartmentData] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobdescData, setJobdescData] = useState(null);
  const [loadingJobdesc, setLoadingJobdesc] = useState(false);
  const [employeeJobdescStatus, setEmployeeJobdescStatus] = useState({});
  const [isPrinting, setIsPrinting] = useState(false);

  const [showAddBoxModal, setShowAddBoxModal] = useState(false);
  const [addBoxForm, setAddBoxForm] = useState({
    column: "",
    afterId: "",
    groupKey: "",
    title: "",
    name: "",
    empId: "",
    code: "",
  });

  const [boxPositions, setBoxPositions] = useState({});
  const [dbDepartments, setDbDepartments] = useState([]);
  const [pendingDeptRequests, setPendingDeptRequests] = useState([]);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [addDeptForm, setAddDeptForm] = useState({ bagianId: "", name: "", route: "", color: "bg-slate-500" });
  const [showRenameDeptModal, setShowRenameDeptModal] = useState(false);
  const [renameDeptTarget, setRenameDeptTarget] = useState(null);
  const [renameDeptValue, setRenameDeptValue] = useState("");

  const [customColumnsByDept, setCustomColumnsByDept] = useState({});
  const [columnLabels, setColumnLabels] = useState({});
  const [hiddenColumns, setHiddenColumns] = useState({});

  const getBaseColumnsForDept = (deptId) =>
    departmentColumns[deptId] || selectedDepartment?.columns || [
      "BOARD OF DIRECTOR",
      "DEPARTMENT HEAD",
      "SECTION HEAD",
      "STAFF",
    ];

  const isColumnHidden = (deptId, colKey) =>
    !!hiddenColumns[deptId]?.[colKey] ||
    !!departmentData[deptId]?.header?.hiddenColumns?.[colKey];

  const getColumnsForDept = (deptId) => {
    const all =
      customColumnsByDept[deptId] ||
      departmentData[deptId]?.header?.customColumns ||
      getBaseColumnsForDept(deptId);
    return all.filter((c) => !isColumnHidden(deptId, c));
  };

  const getColumnLabel = (deptId, colKey) =>
    columnLabels[deptId]?.[colKey] ||
    departmentData[deptId]?.header?.columnLabels?.[colKey] ||
    colKey;

  const renameColumn = (deptId, colKey, newLabel) => {
    setColumnLabels((prev) => ({
      ...prev,
      [deptId]: { ...(prev[deptId] || {}), [colKey]: newLabel },
    }));
    setDepartmentData((prev) => {
      const d = { ...prev[deptId] };
      d.header = {
        ...d.header,
        columnLabels: { ...(d.header?.columnLabels || {}), [colKey]: newLabel },
      };
      return { ...prev, [deptId]: d };
    });
  };

  const countBoxesInColumn = (deptId, colKey) => {
    return (departmentData[deptId]?.positions || []).filter(
      (p) => p.column === colKey && p.pendingAction !== "delete"
    ).length;
  };

  const deleteColumn = (deptId, colKey) => {
    const remainingCols = getColumnsForDept(deptId);
    if (remainingCols.length <= 1) {
      alert("Minimal harus ada 1 header yang tersisa.");
      return;
    }
    const boxCount = countBoxesInColumn(deptId, colKey);
    const label = getColumnLabel(deptId, colKey);

    Swal.fire({
      title: `Hapus Header "${label}"?`,
      html:
        boxCount > 0
          ? `Header ini beserta <b>${boxCount} box</b> di dalamnya akan dihapus. Perubahan perlu di-submit untuk approval.`
          : `Header ini akan dihapus dari struktur organisasi.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Ya, Hapus Header",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (!result.isConfirmed) return;

      if (boxCount > 0) {
        const boxesToDelete = (departmentData[deptId]?.positions || []).filter(
          (p) => p.column === colKey && p.pendingAction !== "delete"
        );
        boxesToDelete.forEach((b) => handleRemoveCustomBox(deptId, b.id));
      }

      setHiddenColumns((prev) => ({
        ...prev,
        [deptId]: { ...(prev[deptId] || {}), [colKey]: true },
      }));
      setDepartmentData((prev) => {
        const d = { ...prev[deptId] };
        d.header = {
          ...d.header,
          hiddenColumns: { ...(d.header?.hiddenColumns || {}), [colKey]: true },
        };
        return { ...prev, [deptId]: d };
      });

      if (!isEditMode) setIsEditMode(true);
    });
  };

  const restoreColumn = (deptId, colKey) => {
    setHiddenColumns((prev) => {
      const d = { ...(prev[deptId] || {}) };
      delete d[colKey];
      return { ...prev, [deptId]: d };
    });
    setDepartmentData((prev) => {
      const d = { ...prev[deptId] };
      const newHiddenColumns = { ...(d.header?.hiddenColumns || {}) };
      delete newHiddenColumns[colKey];
      d.header = { ...d.header, hiddenColumns: newHiddenColumns };
      return { ...prev, [deptId]: d };
    });
  };

  const getHiddenColumnsForDept = (deptId) => {
    const all = customColumnsByDept[deptId] || getBaseColumnsForDept(deptId);
    return all.filter((c) => isColumnHidden(deptId, c));
  };

  // --- Add Header (sama seperti sebelumnya) ---
  const [showAddHeaderModal, setShowAddHeaderModal] = useState(false);
  const [addHeaderForm, setAddHeaderForm] = useState({ name: "", afterColumn: "" });

  const openAddHeaderModal = () => {
    const cols = getColumnsForDept(selectedDepartment.id);
    setAddHeaderForm({ name: "", afterColumn: cols[cols.length - 1] || "" });
    setShowAddHeaderModal(true);
  };

  const handleAddHeader = () => {
    const name = addHeaderForm.name.trim().toUpperCase();
    if (!name) {
      alert("Nama header wajib diisi");
      return;
    }
    const deptId = selectedDepartment.id;
    const currentCols = customColumnsByDept[deptId] || getBaseColumnsForDept(deptId);
    if (currentCols.includes(name)) {
      alert("Header dengan nama tersebut sudah ada");
      return;
    }
    const insertIndex = addHeaderForm.afterColumn
      ? currentCols.indexOf(addHeaderForm.afterColumn) + 1
      : currentCols.length;
    const newCols = [...currentCols];
    newCols.splice(insertIndex, 0, name);

    setCustomColumnsByDept((prev) => ({ ...prev, [deptId]: newCols }));
    // Simpan juga ke departmentData supaya ikut ter-submit ke change request
    setDepartmentData((prev) => {
      const d = { ...prev[deptId] };
      d.header = {
        ...d.header,
        customColumns: newCols,
      };
      return { ...prev, [deptId]: d };
    });
    setShowAddHeaderModal(false);
    if (!isEditMode) setIsEditMode(true);
  };

  const handleRemoveHeader = (deptId, colName, baseCols = []) => {
    if (baseCols.includes(colName)) {
      alert("Header bawaan tidak bisa dihapus dari sini");
      return;
    }
    const hasBoxes = (departmentData[deptId]?.positions || []).some(
      (p) => p.isCustom && p.column === colName && p.pendingAction !== "delete"
    );
    if (hasBoxes) {
      alert("Hapus semua box di header ini dulu sebelum menghapus headernya");
      return;
    }
    setCustomColumnsByDept((prev) => ({
      ...prev,
      [deptId]: (prev[deptId] || getColumnsForDept(deptId)).filter((c) => c !== colName),
    }));
  };

  const setPositionsForDept = (deptId) => (updater) => {
    setBoxPositions((prev) => ({
      ...prev,
      [deptId]: typeof updater === "function" ? updater(prev[deptId] || {}) : updater,
    }));
  };

  const resetPositionsForDept = (deptId) => {
    Swal.fire({
      title: "Reset Layout?",
      text: "Semua posisi box akan dikembalikan ke layout default. Perubahan ini perlu di-submit untuk approval.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Reset",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setBoxPositions((prev) => ({ ...prev, [deptId]: {} }));
        setPositionsDirty((prev) => ({ ...prev, [deptId]: true }));
      }
    });
  };

  const [positionsDirty, setPositionsDirty] = useState({});
  const [hiddenStructuralBoxes, setHiddenStructuralBoxes] = useState({});
  const isStructuralBoxHidden = (deptId, boxKey) => {
    if (hiddenStructuralBoxes[`${deptId}:${boxKey}`]) return true;
    return !!departmentData[deptId]?.header?.hiddenBoxes?.[boxKey];
  };

  const hideStructuralBox = (deptId, boxKey, boxTitle) => {
    setHiddenStructuralBoxes((prev) => ({
      ...prev,
      [`${deptId}:${boxKey}`]: true,
    }));
    setDepartmentData((prev) => {
      const d = { ...prev[deptId] };
      d.header = {
        ...d.header,
        hiddenBoxes: { ...(d.header?.hiddenBoxes || {}), [boxKey]: true },
      };
      return { ...prev, [deptId]: d };
    });
    if (!isEditMode) setIsEditMode(true);
  };

  const deleteBoxWithData = (deptId, boxKey, boxLabel, items) => {
    Swal.fire({
      title: `Hapus Box "${boxLabel}" beserta semua datanya?`,
      html: `Box ini beserta <b>${items.length} data karyawan</b> di dalamnya akan dihapus. Perubahan perlu di-submit untuk approval.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      confirmButtonText: "Ya, Hapus Semua",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        items.forEach((item) => handleRemoveCustomBox(deptId, item.id));
        setDepartmentData((prev) => {
          const d = { ...prev[deptId] };
          d.header = {
            ...d.header,
            hiddenBoxes: { ...(d.header?.hiddenBoxes || {}), [boxKey]: true },
          };
          return { ...prev, [deptId]: d };
        });
        if (!isEditMode) setIsEditMode(true);
      }
    });
  };

  const setPositionsForDeptTracked = (deptId) => (updater) => {
    setBoxPositions((prev) => ({
      ...prev,
      [deptId]: typeof updater === "function" ? updater(prev[deptId] || {}) : updater,
    }));
    setPositionsDirty((prev) => ({ ...prev, [deptId]: true }));
  };

  const openSubmitModal = () => {
    setShowSubmitModal(true);
    setSubmitForm({
      title: "",
      description: "",
      priority: "medium",
    });
  };

  const checkAllEmployeeJobdescStatus = async () => {
    try {
      const response = await fetch(
        `/api/jobdescriptions?limit=200`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const allJobdesc = result.data || result;
        const statusMap = {};

        allJobdesc.forEach(jd => {
          const jdNoPNK = (jd.memberNoPNK || "").trim();
          if (jdNoPNK) {
            statusMap[jdNoPNK] = true;
            jdNoPNK.split(/[\/,]/).forEach(part => {
              const p = part.trim();
              if (p) statusMap[p] = true;
            });
          }

          const memberName = (jd.memberName || "")
            .trim()
            .toUpperCase()
            .replace(/\*+/g, "")
            .replace(/\s+/g, " ")
            .trim();
          if (memberName) {
            statusMap[memberName] = true;
            memberName.split(/[\/,]/).forEach(part => {
              const p = part.trim();
              if (p) statusMap[p] = true;
            });
          }
        });

        setEmployeeJobdescStatus(statusMap);
        console.log("✅ Employee Jobdesc Status:", statusMap);
      } else {
        console.error("❌ Failed to fetch jobdesc status, response not ok:", response.status);
      }
    } catch (error) {
      console.error("Error fetching employee jobdesc status:", error);
    }
  };

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await soBagianDepartmentsAPI.getAll();
        setDbDepartments(res.data?.data || []);
      } catch (err) {
        console.error("Gagal load departemen:", err);
      }
    };
    loadDepartments();
  }, []);

  useEffect(() => {
    if (previewMode && previewDepartmentId && dbDepartments.length > 0) {
      const target = dbDepartments.find(
        (d) => d.id === previewDepartmentId || d._id === previewDepartmentId
      );
      if (target) {
        setSelectedDepartment(target);
        setSidebarVisible(false);
        setIsEditMode(false);
      }
    }
  }, [previewMode, previewDepartmentId, dbDepartments]);

  useEffect(() => {
    const loadPendingDeptRequests = async () => {
      try {
        const res = await soBagianChangeRequestsAPI.getAll();
        const all = res.data?.data || res.data || [];
        const relevant = all.filter(
          (r) =>
            ["department-add", "department-rename", "department-delete"].includes(r.changeType) &&
            ["pending", "waiting_director_approval"].includes(r.status)
        );
        setPendingDeptRequests(relevant);
      } catch (err) {
        console.error("Gagal load pending department requests:", err);
      }
    };
    loadPendingDeptRequests();
  }, []);


  useEffect(() => {
    if (selectedDepartment) {
      checkAllEmployeeJobdescStatus();
    }
  }, [selectedDepartment]);

  const onCodeClick = async (item) => {
    setSelectedJob(item);
    setShowJobModal(true);
    setLoadingJobdesc(true);
    setJobdescData(null);

    try {
      const response = await fetch(
        `/api/jobdescriptions?limit=200`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const allJobdesc = result.data || result;
        const codeTitleKeywords = {
          "ENG1.0": ["ENGINEERING CABLE", "ENG1.0"],
          "ENG1.1": ["PRODUCT", "QUALITY ENGINEERING", "ENG1.1"],
          "ENG1.2": ["PROCESS ENG", "ENG1.2"],
          "ENG1.3": ["NEW BUSINESS", "BESS", "ENG1.3"],
          "MKT1.0": ["MARKETING CABLE", "SALES MARKETING", "MKT1.0"],
          "MKT1.1": ["MARKETING CABLE", "MKT1.1"],
          "MKT1.1.1": ["MARKETING", "MKT1.1.1"],
          "MKT1.1.2": ["MARKETING", "MKT1.1.2"],
          "MKT1.1.3": ["CUSTOMER REPRESENTATIVE", "MKT1.1.3"],
          "MKT2.0": ["MARKETING BATTERY", "MKT2.0"],
          "MKT2.1": ["AUX", "POWER BATTERY MARKETING", "MKT2.1"],
          "MKT2.2": ["MARKETING", "MKT2.2"],
          "PPIC1.0": ["PPIC", "PPC", "WAREHOUSE", "PPIC1.0"],
          "PPIC1.1": ["PPIC", "PPIC1.1"],
          "PPIC1.2": ["PPIC", "AHM OES", "PPIC1.2"],
          "PPIC1.3": ["WAREHOUSE", "PPIC1.3"],
          "PPIC1.1.1": ["PPIC", "PPIC1.1.1"],
          "PPIC1.1.2": ["PPIC", "MANIFEST", "PPIC1.1.2"],
          "PPIC1.1.3": ["DELIVERY", "PPIC1.1.3"],
          "PPIC1.2.1": ["PPIC", "PPIC1.2.1"],
          "PPIC1.2.2": ["PPIC", "PPIC1.2.2"],
          "PPIC1.3.1": ["WAREHOUSE", "PPIC1.3.1"],
          "PPIC1.3.2": ["WAREHOUSE", "PPIC1.3.2"],
          "PPIC1.3.3": ["MRP", "PPIC1.3.3"],
          "PPIC1.3.4": ["RM", "OHP", "PPIC1.3.4"],
          "PPIC1.3.5": ["RM", "PPIC1.3.5"],
          "HRD1.0": ["HRD", "HRD1.0"],
          "HRD1.1": ["HRD", "POD STAFF", "HRD1.1"],
          "HRD1.1.1": ["HRD", "PERSONALIA", "HRD1.1"],
          "HRD2.0": ["POD"],
          "GA1.1": ["GA", "GA1.1"],
          "GA1.2": ["GA", "GA1.2"],
          "GA1.3": ["INDUSTRIAL", "GA1.3"],
          "IT1.1": ["IT", "IT1.1"],
          "IT1.2": ["IT", "IT1.2"],
          "FIN1.0": ["FINANCE", "ACCOUNTING", "FIN1.0"],
          "FIN1.1": ["FINANCE", "ACCOUNTING", "FIN1.1"],
          "FIN1.2": ["FINANCE"],
          "FIN1.3": ["SAP STAFF"],
          "FIN1.4": ["SAP STAFF"],
          "PCH1.0": ["PROCUREMENT", "PURCHASING", "PCH1.0"],
          "PCH1.1": ["CONTROLCABLE", "PCH1.1"],
          "PCH1.2": ["BATTERY", "PCH1.2"],
          "PCH1.3": ["GENERAL", "LEGAL", "PCH1.3"],
          "PCH1.4": ["SUBCONT", "PCH1.4"],
          "QAC1.0": ["QUALITY ASSURANCE", "QA DEPT", "QAC1.0"],
          "QAC1.1": ["QA", "QUALITY", "QAC1.1"],
          "QAC1.1.1": ["QUALITY ASSURANCE", "QAC1.1.1"],
          "QAC1.1.2": ["QA OPERATOR HEAD", "QAC1.1.2"],
          "QAC1.1.3": ["LAB", "KALIBRASI", "QAC1.1.3"],
          "QAC1.1.4": ["QA PROJECT", "QAC1.1.4"],
          "QAC1.1.5": ["CLAIM", "COMPLAIN", "ADMINISTRASI", "QAC1.1.5"],
          "QAC2.0": ["QA BATTERY", "QAC2.0"],
          "PRD1.0": ["PROD", "PRD1.0"],
          "PRD1.1": ["MANUFACTURING UNIT", "PRD1.1", "PRODUCTION"],
          "PRD1.2": ["ASSEMBLING UNIT", "PRD1.2", "ASSY"],
          "PRD1.0.1": ["PRODUCTION", "PRD1.0.1"],
          "PRD1.1.1": ["PRD1.1.1", "CO & CI"],
          "PRD1.1.2": ["GROUP PO", "PRD1.1.2", "PO"],
          "PRD1.2.1": ["GROUP ASSEMBLING", "PRD1.2.1", "ASSY"],
          "PRD1.1.5": ["MAINTENANCE", "PRD1.1.5"],
          "PRD1.1.6": ["MAINTENANCE", "PRD1.1.6"],
          "PRD1.2.3": ["QUALITY", "PRD1.2.3"],
          "PRD1.2.4": ["QUALITY", "PRD1.2.4"],
          "PRD1.0.2": ["QUALITY CONTROL INCOMING", "PRD1.0.2"],
          "PRD1.0.3": ["QUALITY CONTROL INCOMING", "PRD1.0.3"],
          "PRD1.0.4": ["ADMINISTRATION", "PRD1.0.4"],
          "PRD2.0": ["MANUFACTURING", "PME", "PRD2.0"],
          "PRD2.1": ["MANUFACTURING", "PRD2.1"],
          "PRD2.3": ["MANUFACTURING", "PRD2.3"],
          "PRD3.0": ["BATTERY PME", "PRD3.0"],
          "RND1.0": ["RND", "BESS", "RND1.0"],
          "RND1.1": ["AUX", "POWER BATTERY ENGINEERING", "RND1.1"],
          "RND1.2": ["ESS ENGINEERING", "RND1.2"],
          "RND1.3": ["MICRO CONTROLLER", "RND1.3"],
          "MIO1.0": ["MI & SHE", "SHE", "MIO1.0"],
          "MIO1.1": ["MANAGEMENT IMPROVEMENT", "MIO1.1"],
          "MIO1.2": ["SHE", "MIO1.2"],
          "MDO1.0": ["MANAGEMENT DEVELOPMENT", "PDCA", "MI & SHE", "MDO1.0"],
          "MDO2.0": ["MDO2.0"],
          "MRO1.0": ["MR", "MRO1.0"],
          "MRO1.1": ["MR STAFF"],
        };

        const normalize = (str) =>
          (str || "").trim().toUpperCase().replace(/\*+/g, "").replace(/\s+/g, " ").trim();
        const normalizeId = (str) =>
          (str || "").replace(/\s+/g, "").trim();
        const splitCombined = (str) =>
          (str || "").split(/[\/,]/).map(p => p.trim()).filter(Boolean);
        const containsId = (haystack, needle) => {
          if (!haystack || !needle) return false;
          const needleClean = normalizeId(needle);
          return splitCombined(haystack).some(p => normalizeId(p) === needleClean);
        };

        const itemCode = (item.code || "").trim().toUpperCase();
        const itemEmpId = (item.empId || "").trim();
        const itemName = normalize(item.name);

        console.log("🔍 Searching for:", { itemCode, itemEmpId, itemName });

        const foundJobdesc = allJobdesc.find((jd) => {
          const jdNoPNK = (jd.memberNoPNK || "").trim();
          const jdName = normalize(jd.memberName);
          const jdPositionTitle = (jd.positionTitle || "").toUpperCase();
          const empIdMatch =
            itemEmpId &&
            itemEmpId !== "-" &&
            jdNoPNK &&
            (normalizeId(jdNoPNK) === normalizeId(itemEmpId) ||
              containsId(jdNoPNK, itemEmpId));

          const nameMatch =
            itemName &&
            jdName &&
            (jdName === itemName ||
              splitCombined(jd.memberName).some(p => normalize(p) === itemName));

          if (!empIdMatch && !nameMatch) return false;

          const keywords = codeTitleKeywords[itemCode];
          if (keywords && keywords.length > 0) {
            const titleMatch = keywords.some(kw => jdPositionTitle.includes(kw));
            if (!titleMatch) {
              console.log(`⏭️ Skip [${itemCode}]: positionTitle tidak cocok →`, jdPositionTitle);
              return false;
            }
            console.log(`✅ MATCH [${itemCode}]:`, jdPositionTitle);
            return true;
          }

          console.log(`✅ MATCH fallback:`, jd.memberName, jdNoPNK);
          return true;
        });

        if (foundJobdesc) {
          console.log("✅ Job description found:", {
            memberName: foundJobdesc.memberName,
            memberNoPNK: foundJobdesc.memberNoPNK,
            positionTitle: foundJobdesc.positionTitle,
          });
          setJobdescData(foundJobdesc);
        } else {
          console.log("❌ Not found for:", { name: item.name, code: item.code, empId: item.empId });
          console.log("💡 Available:", allJobdesc.map(jd => `${jd.memberName} (${jd.memberNoPNK}) - ${jd.positionTitle}`));
        }
      }
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setLoadingJobdesc(false);
    }
  };

  const hasAccess = React.useMemo(() => {
    const userRole = user?.role;
    const userPermissions =
      typeof userRole === "object" ? userRole?.permissions : [];
    console.log("SO Bagian Editor Debug:", {
      user: user?.name,
      userRole: userRole?.name,
      userPermissions,
      hasAccess: userPermissions?.includes("SO Bagian Editor"),
    });
    return user && userPermissions?.includes("SO Bagian Editor");
  }, [user]);

  const departments = [
    {
      id: "finance",
      name: "Finance",
      route: "/finance-department",
      color: "bg-blue-500",
      structure: {
        header: {
          title: "FINANCE & ACCOUNTING",
          code: "FIN1.0",
          head: "YULIUS PERMATA",
          empId: "23220017",
          effectiveDate: "16 Maret 2026",
          documentTitle: "STRUKTUR ORGANISASI",
          companyName: "PT DHARMA CONTROLCABLE INDONESIA",

          preparedBy: {
            name: "YULIUS PERMATA",
            title: "SECTION HEAD"
          },

          checkedBy: {
            name: "DIKI WAHYUDI",
            title: "HRGA & IT DEPT. HEAD"
          },

          approvedBy: {
            name: "BAMBANG WURYANTO",
            title: "DIRECTOR"
          },
        },
        positions: [],
      },
    },
    {
      id: "hrga-it",
      name: "HRGA & IT",
      route: "/hrga-it",
      color: "bg-green-500",
      structure: {
        header: {
          id: "hrd-1",
          title: "HRGA & IT",
          code: "HRD1.0",
          head: "DIKI WAHYUDI*",
          empId: "23060056",

          effectiveDate: "16 Maret 2026",
          documentTitle: "STRUKTUR ORGANISASI",
          companyName: "PT DHARMA CONTROLCABLE INDONESIA",

          preparedBy: {
            name: "DIKI WAHYUDI*",
            title: "DEPARTMENT HEAD"
          },

          checkedBy: {
            name: "DIKI WAHYUDI",
            title: "HRGA&IT DEPT. HEAD"
          },

          approvedBy: {
            name: "BAMBANG WURYANTO",
            title: "DIRECTOR"
          },
        },
        positions: [
          {
            id: "hrd-2",
            code: "HRD1.1",
            title: "HRGA & IT",
            name: "VERONICA HANI M.**",
            empId: "23240206",
          },
          {
            id: "hrd-3",
            code: "HRD1.1.1",
            title: "HRD",
            name: "THARISA ARRAHMA R.",
            empId: "23230072",
          },
          {
            id: "hrd-4",
            code: "GA1.1",
            title: "GENERAL AFFAIR & IND. RELATIONS",
            name: "SUPRIADI",
            empId: "23120131",
          },
          {
            id: "hrd-5",
            code: "GA1.2",
            title: "GENERAL AFFAIR & IND. RELATIONS",
            name: "PARTINI LUPI",
            empId: "23110116",
          },
          {
            id: "hrd-6",
            code: "GA1.3",
            title: "GENERAL AFFAIR & IND. RELATIONS",
            name: "MIMBARYANTO",
            empId: "23120158",
          },
          {
            id: "it-1",
            code: "IT1.1",
            title: "INFORMATION TECHNOLOGY",
            name: "ROZIQIN",
            empId: "23070074",
          },
          {
            id: "it-2",
            code: "IT1.2",
            title: "INFORMATION TECHNOLOGY",
            name: "FARHANSYAH A.L",
            empId: "23220040",
          },
        ],
      },
    },
    {
      id: "management-development",
      name: "Management Development",
      route: "/management-development",
      color: "bg-purple-500",
      structure: {
        header: {
          title: "MANAGEMENT DEVELOPMENT DEPARTMENT",
          code: "MDO",
          head: "",
          empId: "",
          effectiveDate: "16 Maret 2026",
          documentTitle: "STRUKTUR ORGANISASI",
          companyName: "PT DHARMA CONTROLCABLE INDONESIA",

          preparedBy: {
            name: "-",
            title: "DEPARTMENT HEAD"
          },

          checkedBy: {
            name: "DIKI WAHYUDI",
            title: "HRDGA&IT DEPT. HEAD"
          },

          approvedBy: {
            name: "BAMBANG WURYANTO",
            title: "DIRECTOR"
          },
        },
        positions: [],
      },
    },
    {
      id: "management-representative",
      name: "Management Representative",
      route: "/management-representative",
      color: "bg-orange-500",
      structure: {
        header: {
          title: "MANAGEMENT REPRESENTATIVE",
          code: "MRO1.0",
          head: "SUGIYARTO*",
          empId: "23600041",
          effectiveDate: "16 Maret 2026",
          documentTitle: "STRUKTUR ORGANISASI",
          companyName: "PT DHARMA CONTROLCABLE INDONESIA",

          preparedBy: {
            name: "SUGIYARTO*",
            title: "SECTION HEAD"
          },

          checkedBy: {
            name: "DIKI WAHYUDI",
            title: "HRDGA & IT DEPT. HEAD"
          },

          approvedBy: {
            name: "BAMBANG WURYANTO",
            title: "DIRECTOR"
          },
        },
        positions: [],
      },
    },
    {
      id: "manufactur-battery",
      name: "Manufacturing Battery",
      route: "/manufactur-battery",
      color: "bg-red-500",
      structure: {
        header: {
          title: "BATTERY PRODUCTION & PME",
          code: "PRD2.0",
          head: "DIONISIUS AUGUSTO**",
          empId: "23220105",
          effectiveDate: "16 Maret 2026",
          documentTitle: "STRUKTUR ORGANISASI",
          companyName: "PT DHARMA CONTROLCABLE INDONESIA",

          preparedBy: {
            name: "DIONISIUS AUGUSTO**",
            title: "SENIOR ENGINEER"
          },

          checkedBy: {
            name: "DIKI WAHYUDI",
            title: "HRDGA & IT DEPT. HEAD"
          },

          approvedBy: {
            name: "BAMBANG WURYANTO",
            title: "DIRECTOR"
          },
        },
        positions: [],
      },
    },
    {
      id: "manufacturing-cable",
      name: "Manufacturing Cable",
      route: "/manufacturing-cable",
      color: "bg-indigo-500",
      structure: {
        header: {
          title: "CONTROLCABLE MANUFACTURE",
          code: "PRD1.0",
          head: "KARNA SATIA SALIM*",
          empId: "23230114",
          effectiveDate: "16 Maret 2026",
          documentTitle: "STRUKTUR ORGANISASI",
          companyName: "PT DHARMA CONTROLCABLE INDONESIA",

          preparedBy: {
            name: "KARNA SATIA SALIM*",
            title: "SECTION HEAD"
          },

          checkedBy: {
            name: "DIKI WAHYUDI",
            title: "HRDGA & IT DEPT. HEAD"
          },

          approvedBy: {
            name: "BAMBANG WURYANTO",
            title: "DIRECTOR"
          },
        },
        positions: [],
      },
    },
    {
      id: "marketing-battery",
      name: "Marketing Battery",
      route: "/marketing-battery-department",
      color: "bg-pink-500",
      structure: {
        header: {
          title: "MARKETING BATTERY",
          code: "MKT2.0",
          head: "RENDRA PRAMONO",
          empId: "23200067",
          effectiveDate: "16 Maret 2026",
          documentTitle: "STRUKTUR ORGANISASI",
          companyName: "PT DHARMA CONTROLCABLE INDONESIA",

          preparedBy: {
            name: "RENDRA PRAMONO",
            title: "DEPARTMENT HEAD"
          },

          checkedBy: {
            name: "DIKI WAHYUDI",
            title: "HRDGA & IT DEPT. HEAD"
          },

          approvedBy: {
            name: "BAMBANG WURYANTO",
            title: "DIRECTOR"
          },
        },
        positions: [],
      },
    },
    {
      id: "marketing-engineering",
      name: "Marketing Engineering",
      route: "/marketing-engineering",
      color: "bg-teal-500",
      structure: {
        header: {
          title: "MARKETING ENGINEERING",
          code: "MKT1.0",
          head: "ANDREAS AGUNG S.",
          empId: "23040119",
          effectiveDate: "16 Maret 2026",
          documentTitle: "STRUKTUR ORGANISASI",
          companyName: "PT DHARMA CONTROLCABLE INDONESIA",

          preparedBy: {
            name: "ANDREAS AGUNG S.",
            title: "DEPARTMENT HEAD"
          },

          checkedBy: {
            name: "DIKI WAHYUDI",
            title: "HRDGA & IT DEPT. HEAD"
          },

          approvedBy: {
            name: "BAMBANG WURYANTO",
            title: "DIRECTOR"
          },
        },
        positions: [],
      },
    },
    {
      id: "mi-she",
      name: "MI & SHE",
      route: "/mi-she",
      color: "bg-yellow-500",
      structure: {
        header: {
          title: "MI & SHE (5R-SMK3-ISO 14001)",
          code: "MIO1.0",
          head: "ELIATA DUMAR GINTING",
          empId: "23190806",
          effectiveDate: "16 Maret 2026",
          documentTitle: "STRUKTUR ORGANISASI",
          companyName: "PT DHARMA CONTROLCABLE INDONESIA",

          preparedBy: {
            name: "ELIATA DUMAR GINTING",
            title: "SECTION HEAD"
          },

          checkedBy: {
            name: "DIKI WAHYUDI",
            title: "HRDGA & IT DEPT. HEAD"
          },

          approvedBy: {
            name: "BAMBANG WURYANTO",
            title: "DIRECTOR"
          },
        },
        positions: [],
      },
    },
    {
      id: "ppic",
      name: "PPIC",
      route: "/ppic",
      color: "bg-cyan-500",
      structure: {
        header: {
          title: "PPIC",
          code: "PPIC1.0",
          head: "DIKI WAHYUDI*",
          empId: "23060056",
          effectiveDate: "16 Maret 2026",
          documentTitle: "STRUKTUR ORGANISASI",
          companyName: "PT DHARMA CONTROLCABLE INDONESIA",

          preparedBy: {
            name: "DIKI WAHYUDI*",
            title: "DEPARTMENT HEAD"
          },

          checkedBy: {
            name: "DIKI WAHYUDI",
            title: "HRDGA & IT DEPT. HEAD"
          },

          approvedBy: {
            name: "BAMBANG WURYANTO",
            title: "DIRECTOR"
          },
        },
        positions: [],
      },
    },
    {
      id: "purchasing",
      name: "Purchasing",
      route: "/purchasing",
      color: "bg-lime-500",
      structure: {
        header: {
          title: "PROCUREMENT & PURCHASING",
          code: "PCH1.0",
          head: "DIKI WAHYUDI* / FAKHDARENI*",
          empId: "23060056 / 23060055",
          effectiveDate: "16 Maret 2026",
          documentTitle: "STRUKTUR ORGANISASI",
          companyName: "PT DHARMA CONTROLCABLE INDONESIA",

          preparedBy: {
            name: "DIKI WAHYUDI* / FAKHDARENI*",
            title: "SECTION HEAD"
          },

          checkedBy: {
            name: "DIKI WAHYUDI",
            title: "HRDGA & IT DEPT. HEAD"
          },

          approvedBy: {
            name: "BAMBANG WURYANTO",
            title: "PRESIDENT DIRECTOR"
          },
        },
        positions: [],
      },
    },
    {
      id: "qa",
      name: "QA (Quality Assurance)",
      route: "/qa-department",
      color: "bg-rose-500",
      structure: {
        header: {
          title: "QA DEPARTMENT",
          code: "QAC1.0",
          head: "M. BAGUS SANTOSO",
          empId: "23220025",
          effectiveDate: "16 Maret 2026",
          documentTitle: "STRUKTUR ORGANISASI",
          companyName: "PT DHARMA CONTROLCABLE INDONESIA",

          preparedBy: {
            name: "M BAGUS SANTOSO",
            title: "DEPARTMENT HEAD"
          },

          checkedBy: {
            name: "DIKI WAHYUDI",
            title: "HRDGA & IT DEPT. HEAD"
          },

          approvedBy: {
            name: "BAMBANG WURYANTO",
            title: "DIRECTOR"
          },
        },
        positions: [],
      },
    },
  ];

  const allDepartments = React.useMemo(() => {
    const hardcodedIds = new Set(departments.map((d) => d.id));
    const customFromDb = dbDepartments
      .filter((d) => !hardcodedIds.has(d.bagianId))
      .map((d) => ({
        id: d.bagianId,
        name: d.name,
        route: d.route,
        color: d.color,
        columns: d.columns,
        groups: d.groups,
        isCustomDept: true,
        structure: {
          header: { title: d.name, effectiveDate: "16 Maret 2026" },
          positions: [],
        },
      }));

    const dbNameMap = {};
    dbDepartments.forEach((d) => { dbNameMap[d.bagianId] = d.name; });

    const hardcodedWithLatestName = departments.map((d) => ({
      ...d,
      name: dbNameMap[d.id] || d.name,
    }));

    return [...hardcodedWithLatestName, ...customFromDb];
  }, [dbDepartments]);

  const departmentPermissions = {
    "Finance Department": ["Finance Department", "Manage Users"],
    "HRGA & IT Department": ["HRGA & IT Department", "Manage Users"],
    "Management Development": ["Management Development", "Manage Users"],
    "Management Representative": ["Management Representative", "Manage Users"],
    "Manufacturing Battery": ["Manufacturing Battery", "Manage Users"],
    "Manufacturing Cable": ["Manufacturing Cable", "Manage Users"],
    "Marketing Battery Department": [
      "Marketing Battery Department",
      "Manage Users",
    ],
    "Marketing Engineering": ["Marketing Engineering", "Manage Users"],
    "MI & SHE": ["MI & SHE", "Manage Users"],
    PPIC: ["PPIC", "Manage Users"],
    Purchasing: ["Purchasing", "Manage Users"],
    "QA Department": ["QA Department", "Manage Users"],
  };

  const visibleDepartments = React.useMemo(() => {
    const userPermissions = user?.role?.permissions || [];
    const userDepartmentName = user?.department?.name;

    if (userPermissions.includes("Manage Users")) {
      return allDepartments;
    }

    return allDepartments.filter((d) => {
      if (userDepartmentName === d.name) return true;

      const required = departmentPermissions[d.name] || [];
      return required.some((perm) => userPermissions.includes(perm));
    });
  }, [user, allDepartments]);

  useEffect(() => {
    const initialData = {};
    const originalData = {};
    allDepartments.forEach((dept) => {
      const savedData = localStorage.getItem(`so-bagian-${dept.id}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          initialData[dept.id] = parsed;
          originalData[dept.id] = JSON.parse(JSON.stringify(parsed));
        } catch (error) {
          initialData[dept.id] = dept.structure;
          originalData[dept.id] = JSON.parse(JSON.stringify(dept.structure));
        }
      } else {
        initialData[dept.id] = dept.structure;
        originalData[dept.id] = JSON.parse(JSON.stringify(dept.structure));
      }
    });
    setDepartmentData((prev) => ({ ...initialData, ...prev }));
    setOriginalDepartmentData((prev) => ({ ...originalData, ...prev }));
  }, [allDepartments]);

  useEffect(() => {
    if (!selectedDepartment) return;
    const deptId = selectedDepartment.id;
    const loadBoxesFromServer = async () => {
      try {
        const res = await soBagianDataAPI.get(deptId);
        const record = res.data?.data;
        if (record?.positions) {
          setBoxPositions((prev) => ({ ...prev, [deptId]: record.positions }));
        }
        if (record) {
          setDepartmentData((prev) => {
            const dept = prev[deptId];
            if (!dept) return prev;
            const nonCustomPositions = (dept.positions || []).filter((p) => !p.isCustom);
            const dbBoxesMapped = (record.boxes || []).map((b) => ({
              id: b.id,
              code: b.code || "",
              title: b.title || "",
              name: b.name || "",
              empId: b.empId || "",
              column: b.column,
              groupKey: b.parentId || null,
              order: b.order || 0,
              isCustom: true,
            }));
            const merged = [...nonCustomPositions, ...dbBoxesMapped];
            return {
              ...prev,
              [deptId]: {
                ...dept,
                positions: merged,
                header: {
                  ...(record.header || {}),
                  ...dept.header,
                  hiddenBoxes: {
                    ...((record.header || {}).hiddenBoxes || {}),
                    ...((dept.header || {}).hiddenBoxes || {}),
                  },
                },
              },
            };
          });
        }
      } catch (err) {
        console.error("Gagal load posisi dari server:", err);
      }
    };
    loadBoxesFromServer();
  }, [selectedDepartment]);

  useEffect(() => {
    if (!selectedDepartment) return;

    const handleUpdate = (event) => {
      console.log("🔔 Received update event for:", selectedDepartment.id);
      console.log("📦 New data:", event.detail);

      setDepartmentData((prev) => ({
        ...prev,
        [selectedDepartment.id]: event.detail,
      }));

      alert("SO Bagian has been updated with approved changes!");
    };

    window.addEventListener(
      `so-bagian-${selectedDepartment.id}-updated`,
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        `so-bagian-${selectedDepartment.id}-updated`,
        handleUpdate
      );
    };
  }, [selectedDepartment]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const deptId = urlParams.get("dept");

    if (deptId) {
      console.log("🔍 Auto-selecting department from URL:", deptId);
      const dept = departments.find((d) => d.id === deptId);
      if (dept) {
        setSelectedDepartment(dept);
        setSidebarVisible(false);

        window.history.replaceState({}, "", "/so-bagian-editor");
      }
    }
  }, [departments]);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the SO Bagian Editor.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleEdit = (deptId, category, id, field, value) => {
    setDepartmentData((prev) => {
      const newData = { ...prev };
      if (category === "header") {
        newData[deptId].header[field] = value;
      } else if (category === "positions") {
        const position = newData[deptId].positions.find((pos) => pos.id === id);
        if (position) {
          position[field] = value;
        }
      }
      return newData;
    });
  };

  const openAddBoxModal = () => {
    const cols = getColumnsForDept(selectedDepartment.id);
    setAddBoxForm({
      column: cols[cols.length - 1] || "",
      afterId: "",
      groupKey: "",
      title: "",
      name: "",
      empId: "",
      code: "",
    });
    setShowAddBoxModal(true);
  };

  const getCustomPositionsInColumn = (deptId, column) => {
    const positions = departmentData[deptId]?.positions || [];
    return positions.filter((p) => p.isCustom && p.column === column);
  };

  const syncCustomBoxesToServer = async (deptId, updatedPositions) => {
    try {
      const customBoxes = (updatedPositions || []).filter((p) => p.isCustom);
      const deptMeta = departments.find((d) => d.id === deptId);
      await soBagianDataAPI.save(deptId, {
        bagianName: deptMeta?.name || deptId,
        columns: departmentColumns[deptId] || [],
        header: { effectiveDate: "", signatures: {} },
        boxes: customBoxes.map((p) => ({
          id: p.id,
          code: p.code || "",
          title: p.title || "",
          name: p.name || "",
          empId: p.empId || "",
          column: p.column,
          parentId: p.groupKey || null,
          order: p.order || 0,
        })),
        positions: boxPositions[deptId] || {},
      });
    } catch (err) {
      console.error("Gagal sync box ke server:", err);
      throw err;
    }
  };

  const handleAddBox = () => {
    if (!addBoxForm.column) {
      alert("Pilih kolom/header tujuan terlebih dahulu");
      return;
    }
    if (!addBoxForm.title.trim() || !addBoxForm.name.trim()) {
      alert("Title dan Name wajib diisi");
      return;
    }
    const deptId = selectedDepartment.id;
    const newId = `custom-${deptId}-${Date.now()}`;
    const customInColumn = getCustomPositionsInColumn(deptId, addBoxForm.column);
    let order = 0;
    if (addBoxForm.afterId) {
      const afterBox = customInColumn.find((p) => p.id === addBoxForm.afterId);
      order = afterBox ? afterBox.order + 0.5 : customInColumn.length;
    } else {
      order = customInColumn.length > 0 ? Math.max(...customInColumn.map((p) => p.order)) + 1 : 0;
    }
    const newPosition = {
      id: newId,
      code: addBoxForm.code || "",
      title: addBoxForm.title,
      name: addBoxForm.name,
      empId: addBoxForm.empId || "-",
      column: addBoxForm.column,
      groupKey: addBoxForm.groupKey || null,
      order,
      isCustom: true,
      pendingAction: "add",
    };

    setDepartmentData((prev) => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        positions: [...(prev[deptId].positions || []), newPosition],
      },
    }));
    setShowAddBoxModal(false);
    if (!isEditMode) setIsEditMode(true);
  };

  const handleRemoveCustomBox = async (deptId, posId) => {
    const dept = departmentData[deptId];
    const position = (dept.positions || []).find((p) => p.id === posId);
    if (!position) return;

    if (position.pendingAction === "add") {
      if (position.pendingRequestId) {
        try {
          await soBagianChangeRequestsAPI.cancel(position.pendingRequestId);
        } catch (err) {
          console.error("Gagal membatalkan request add box:", err);
        }
      }
      setDepartmentData((prev) => ({
        ...prev,
        [deptId]: {
          ...prev[deptId],
          positions: prev[deptId].positions.filter((p) => p.id !== posId),
        },
      }));
      return;
    }

    setDepartmentData((prev) => {
      const d = prev[deptId];
      const positions = d.positions.map((p) =>
        p.id === posId ? { ...p, pendingAction: "delete" } : p
      );
      return { ...prev, [deptId]: { ...d, positions } };
    });
  };

  useEffect(() => {
    if (!selectedDepartment) return;
    const deptId = selectedDepartment.id;
    const loadPendingBoxRequests = async () => {
      try {
        const res = await soBagianChangeRequestsAPI.getAll();
        const allRequests = res.data?.data || res.data || [];
        const relevant = allRequests.filter(
          (r) =>
            r.department === selectedDepartment.name &&
            (r.changeType === "add" || r.changeType === "delete") &&
            ["pending", "waiting_director_approval"].includes(r.status)
        );

        setDepartmentData((prev) => {
          const dept = prev[deptId];
          if (!dept) return prev;
          let positions = [...(dept.positions || [])];

          relevant.forEach((r) => {
            if (r.changeType === "add" && r.proposedData?.boxData) {
              const box = r.proposedData.boxData;
              const alreadyThere = positions.some((p) => p.id === box.id);
              if (!alreadyThere) {
                positions.push({ ...box, isCustom: true, pendingAction: "add", pendingRequestId: r._id });
              }
            } else if (r.changeType === "delete" && r.currentData?.removedBox) {
              const removedId = r.currentData.removedBox.id;
              positions = positions.map((p) =>
                p.id === removedId ? { ...p, pendingAction: "delete", pendingRequestId: r._id } : p
              );
            }
          });

          return { ...prev, [deptId]: { ...dept, positions } };
        });
      } catch (err) {
        console.error("Gagal load pending box requests:", err);
      }
    };
    loadPendingBoxRequests();
  }, [selectedDepartment]);

  const saveDepartment = async (deptId) => {
    try {
      const dataToSave = {
        ...departmentData[deptId],
        lastModified: new Date().toISOString(),
        modifiedBy: user?.name || user?.username,
      };

      localStorage.setItem(`so-bagian-${deptId}`, JSON.stringify(dataToSave));

      window.dispatchEvent(
        new CustomEvent(`so-bagian-${deptId}-updated`, {
          detail: dataToSave,
        })
      );

      setShowSaveDialog(true);
      setTimeout(() => {
        setShowSaveDialog(false);
      }, 3000);

      console.log(`✅ ${deptId} data saved successfully`);
    } catch (error) {
      console.error(`Error saving ${deptId} data:`, error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const submitDepartmentChangeRequest = async (changeType, title, description, deptData) => {
    try {
      await soBagianChangeRequestsAPI.create({
        title,
        description,
        changeType,
        department: deptData.name || deptData.bagianId,
        proposedData: { departmentData: { ...deptData, action: changeType.replace("department-", "") } },
      });
      await Swal.fire({ title: "Berhasil!", text: "Request submitted untuk approval.", icon: "success", timer: 2000, showConfirmButton: false });
      const res = await soBagianChangeRequestsAPI.getAll();
      const all = res.data?.data || res.data || [];
      setPendingDeptRequests(all.filter((r) =>
        ["department-add", "department-rename", "department-delete"].includes(r.changeType) &&
        ["pending", "waiting_director_approval"].includes(r.status)
      ));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal submit request");
    }
  };

  const handleAddDepartment = () => {
    if (!addDeptForm.bagianId.trim() || !addDeptForm.name.trim()) {
      alert("ID dan Nama departemen wajib diisi");
      return;
    }
    submitDepartmentChangeRequest(
      "department-add",
      `Tambah Departemen : ${addDeptForm.name}`,
      `Menambahkan departemen baru "${addDeptForm.name}"`,
      addDeptForm
    );
    setShowAddDeptModal(false);
    setAddDeptForm({ bagianId: "", name: "", route: "", color: "bg-slate-500" });
  };

  const handleRenameDepartment = () => {
    if (!renameDeptValue.trim()) return;
    submitDepartmentChangeRequest(
      "department-rename",
      `Rename Departemen : ${renameDeptTarget.name} → ${renameDeptValue}`,
      `Mengubah nama departemen dari "${renameDeptTarget.name}" menjadi "${renameDeptValue}"`,
      { bagianId: renameDeptTarget.id, oldName: renameDeptTarget.name, newName: renameDeptValue }
    );
    setShowRenameDeptModal(false);
  };

  const handleDeleteDepartment = (dept) => {
    Swal.fire({
      title: `Hapus Departemen "${dept.name}"?`,
      text: "Permintaan hapus akan menunggu approval Director.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Ya, Konfirmasi Hapus",
    }).then((result) => {
      if (result.isConfirmed) {
        submitDepartmentChangeRequest(
          "department-delete",
          `Hapus Departemen : ${dept.name}`,
          `Menghapus departemen "${dept.name}"`,
          { bagianId: dept.id, name: dept.name }
        );
      }
    });
  };

  const isDeptPending = (deptId, type) =>
    pendingDeptRequests.some((r) => r.proposedData?.departmentData?.bagianId === deptId && r.changeType === type);

  const submitForApproval = async () => {
    console.log('🔍 Original header:', JSON.stringify(originalDepartmentData[selectedDepartment.id]?.header));
    console.log('🔍 Current header:', JSON.stringify(departmentData[selectedDepartment.id]?.header));
    console.log('🔍 Are same?', JSON.stringify(originalDepartmentData[selectedDepartment.id]) === JSON.stringify(departmentData[selectedDepartment.id]));
    if (!submitForm.title.trim()) {
      alert("Please enter a title for this change request");
      return;
    }

    if (!submitForm.description.trim()) {
      alert("Please enter a description for this change request");
      return;
    }

    try {
      const now = new Date();
      const currentStructure = departmentData[selectedDepartment.id];
      alert("HIDDEN BOXES SAAT SUBMIT: " + JSON.stringify(currentStructure?.header?.hiddenBoxes));

      console.log("Selected Department ID:", selectedDepartment.id);
      const originalStructure = originalDepartmentData[selectedDepartment.id] ||
        departments.find(d => d.id === selectedDepartment.id)?.structure || null;

      console.log("📤 Current structure data:", currentStructure);
      console.log("📤 Original structure data:", originalStructure);
      console.log("📤 Selected department:", selectedDepartment);

      const dataToSubmit = {
        departmentId: selectedDepartment.id,
        structure: currentStructure,
        positions: boxPositions[selectedDepartment.id] || {},
        lastModified: now.toISOString(),
        modifiedBy: user?.name || user?.username,
      };

      console.log("🔍 Current Structure Header:", currentStructure?.header);
      console.log("🔍 Current Structure Positions:", currentStructure?.positions);
      console.log("🔍 Full Data to Submit:", JSON.stringify(dataToSubmit, null, 2));

      const currentDataToSubmit = originalStructure
        ? {
          departmentId: selectedDepartment.id,
          structure: originalStructure,
        }
        : null;

      const requestData = {
        title: submitForm.title,
        description: submitForm.description,
        priority: submitForm.priority,
        changeType: "update",
        department: selectedDepartment.name,
        proposedData: {
          organizationData: dataToSubmit,
        },
        currentData: currentDataToSubmit
          ? {
            organizationData: currentDataToSubmit,
          }
          : null,
      };

      console.log("📤 Submitting request with data:", requestData);
      console.log("📤 Has currentData:", !!requestData.currentData);

      const response = await soBagianChangeRequestsAPI.create(requestData);

      if (response.data.success) {
        await Swal.fire({
          title: 'Berhasil!',
          text: 'Change request submitted successfully!',
          icon: 'success',
          confirmButtonColor: '#16a34a',
          confirmButtonText: 'OK',
          timer: 2000,
          showConfirmButton: false,
        });
        setShowSubmitModal(false);
        navigate("/so-bagian-change-requests");
      }
    } catch (error) {
      console.error("Error submitting request:", error);

      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => `${err.param}: ${err.msg}`)
          .join("\n");
        alert(`Validation Error:\n${errorMessages}`);
      } else {
        alert(
          error.response?.data?.message ||
          "Failed to submit request. Please try again."
        );
      }
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);

    setTimeout(() => {
      const printContent = document.querySelector('.print-area');

      if (!printContent) {
        alert('Print area tidak ditemukan!');
        setIsPrinting(false);
        return;
      }

      const clone = printContent.cloneNode(true);
      const copyStyles = (source, target) => {
        const computed = window.getComputedStyle(source);
        const styleProps = [
          'display', 'position', 'top', 'left', 'right', 'bottom',
          'width', 'height', 'min-width', 'max-width', 'min-height',
          'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
          'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
          'border', 'border-top', 'border-bottom', 'border-left', 'border-right',
          'border-width', 'border-style', 'border-color', 'border-radius',
          'background', 'background-color',
          'color', 'font-size', 'font-weight', 'font-family',
          'text-align', 'text-decoration',
          'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink',
          'align-items', 'align-self', 'justify-content', 'justify-self',
          'grid', 'grid-template-columns', 'grid-template-rows', 'gap',
          'overflow', 'overflow-x', 'overflow-y',
          'box-shadow', 'visibility', 'opacity',
          'white-space', 'word-break', 'line-height',
          'vertical-align',
        ];

        styleProps.forEach(prop => {
          const value = computed.getPropertyValue(prop);
          if (value) {
            target.style.setProperty(prop, value, 'important');
          }
        });
      };

      const sourceElements = printContent.querySelectorAll('*');
      const targetElements = clone.querySelectorAll('*');

      copyStyles(printContent, clone);

      sourceElements.forEach((el, i) => {
        if (targetElements[i]) {
          copyStyles(el, targetElements[i]);
        }
      });

      clone.style.setProperty('overflow', 'visible', 'important');
      clone.style.setProperty('width', '100%', 'important');
      clone.style.setProperty('border', 'none', 'important');
      clone.style.setProperty('box-shadow', 'none', 'important');
      clone.querySelectorAll('*').forEach(el => {
        const overflow = window.getComputedStyle(el).overflow;
        if (overflow === 'auto' || overflow === 'hidden' || overflow === 'scroll') {
          el.style.setProperty('overflow', 'visible', 'important');
        }
      });

      clone.querySelectorAll('img').forEach(img => {
        img.style.setProperty('max-width', '100%', 'important');
        img.style.setProperty('max-height', '100%', 'important');
        img.style.setProperty('object-fit', 'contain', 'important');
      });

      const printWindow = window.open('', '_blank');

      if (!printWindow) {
        alert('Popup diblokir! Izinkan popup untuk localhost.');
        setIsPrinting(false);
        return;
      }

      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${selectedDepartment?.name || 'SO Bagian'}</title>
  <style>
    @page {
      size: A3 landscape;
      margin: 8mm;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      width: 100% !important;
    }
    body > div {
      width: 100% !important;
      overflow: visible !important;
    }
    img {
      max-width: 100% !important;
      max-height: 100% !important;
      object-fit: contain !important;
    }
    button {
      display: none !important;
    }
  </style>
</head>
<body>
  ${clone.outerHTML}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() { window.close(); }, 500);
      }, 800);
    };
  <\/script>
</body>
</html>`);

      printWindow.document.close();
      setIsPrinting(false);
    }, 500);
  };

  const EditableField = ({
    value,
    onSave,
    placeholder = "",
    className = "",
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleSave = () => {
      onSave(editValue);
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
          className={`so-drag-editable bg-yellow-50 border rounded px-2 py-1 ${className}`}
          placeholder={placeholder}
          autoFocus
        />
      );
    }
    return (
      <span
        onClick={() => isEditMode && setIsEditing(true)}
        className={`so-drag-editable ${isEditMode ? "cursor-pointer hover:bg-yellow-100 rounded px-1" : ""
          }`}
        title={isEditMode ? "Click to edit" : ""}
      >
        {value || placeholder}
      </span>
    );
  };

  const HeaderCell = ({ deptId, colKey }) => {
    const label = getColumnLabel(deptId, colKey);
    return (
      <div className="bg-blue-300 p-3 rounded text-center border border-black relative">
        {isEditMode ? (
          <input
            type="text"
            value={label}
            onChange={(e) => renameColumn(deptId, colKey, e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            className="so-drag-editable font-bold text-xs text-black bg-blue-200 border border-blue-600 rounded px-1 py-1 w-full text-center"
          />
        ) : (
          <h3 className="font-bold text-xs text-black">{label}</h3>
        )}
        {isEditMode && (
          <button
            onClick={() => deleteColumn(deptId, colKey)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
            title="Hapus header ini"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  const EditableBoxTitle = ({ boxKey, defaultTitle, className = "text-sm font-semibold leading-tight whitespace-nowrap" }) => {
    const dept = departmentData[selectedDepartment.id];
    const currentTitle = dept?.header?.groupTitles?.[boxKey] || defaultTitle;
    if (!isEditMode) {
      return <p className={className}>{currentTitle}</p>;
    }
    return (
      <input
        type="text"
        value={currentTitle}
        onChange={(e) => {
          const newTitle = e.target.value;
          setDepartmentData((prev) => {
            const d = { ...prev[selectedDepartment.id] };
            d.header = {
              ...d.header,
              groupTitles: { ...(d.header?.groupTitles || {}), [boxKey]: newTitle },
            };
            return { ...prev, [selectedDepartment.id]: d };
          });
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className={`so-drag-editable ${className} bg-yellow-50 border rounded px-2 py-1 w-full text-center`}
        placeholder="Judul Box"
      />
    );
  };

  const EditableStaticCode = ({ boxKey, defaultCode, className = "text-sm font-bold" }) => {
    const dept = departmentData[selectedDepartment.id];
    const currentCode = dept?.header?.staticCodes?.[boxKey] ?? defaultCode;
    if (!isEditMode) {
      return <p className={className}>{currentCode}</p>;
    }
    return (
      <input
        type="text"
        value={currentCode}
        onChange={(e) => {
          const newCode = e.target.value;
          setDepartmentData((prev) => {
            const d = { ...prev[selectedDepartment.id] };
            d.header = {
              ...d.header,
              staticCodes: { ...(d.header?.staticCodes || {}), [boxKey]: newCode },
            };
            return { ...prev, [selectedDepartment.id]: d };
          });
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className={`so-drag-editable ${className} bg-yellow-50 border rounded px-1 py-0.5 w-full text-center`}
      />
    );
  };

  const renderCodeButton = (person) => {
    if (isEditMode) {
      return (
        <input
          type="text"
          value={person?.code || ""}
          onChange={(e) => handleEdit(selectedDepartment.id, "positions", person.id, "code", e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          className="so-drag-editable text-xs font-bold uppercase bg-yellow-50 border rounded px-1 py-0.5 w-full text-center"
          placeholder="Code"
        />
      );
    }
    if (!person || !person.empId) {
      return (
        <p className="text-xs font-bold uppercase">{person?.code || ""}</p>
      );
    }

    const empId = (person.empId || "").trim();
    const personName = (person.name || "")
      .trim()
      .toUpperCase()
      .replace(/\*+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const empIdMatch = empId && empId !== "-" && (
      employeeJobdescStatus[empId] ||
      empId.split(/[\/,]/).some(part => employeeJobdescStatus[part.trim()])
    );

    const nameMatch = personName && (
      employeeJobdescStatus[personName] ||
      personName.split(/[\/,]/).some(part => employeeJobdescStatus[part.trim()])
    );

    const hasJobdesc = empIdMatch || nameMatch;

    const buttonColor = hasJobdesc
      ? "text-blue-600 hover:bg-blue-50"
      : "text-red-600 hover:bg-red-50";

    return (
      <button
        className={`text-xs font-bold hover:underline focus:outline-none uppercase px-2 py-1 rounded transition-colors ${buttonColor}`}
        onClick={(e) => {
          e.stopPropagation();
          onCodeClick(person);
        }}
        title={hasJobdesc ? "Klik untuk melihat job description" : "Belum memiliki job description"}
      >
        {person.code}
      </button>
    );
  };

  const renderHeaderSection = (deptId, dept) => {
    const handleHeaderEdit = (field, value) => {
      handleEdit(deptId, "header", null, field, value);
    };
  };

  const renderDepartmentSpecificLayout = () => {
    if (!selectedDepartment || !departmentData[selectedDepartment.id])
      return null;

    const dept = departmentData[selectedDepartment.id];

    const knownCustomLayoutIds = [
      "finance", "hrga-it", "management-development", "management-representative",
      "manufactur-battery", "manufacturing-cable", "marketing-battery",
      "marketing-engineering", "mi-she", "ppic", "purchasing", "qa", "rnd", "marketing-bess"
    ];

    if (!knownCustomLayoutIds.includes(selectedDepartment.id)) {
      const cols = getColumnsForDept(selectedDepartment.id);
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1400px] relative p-4">
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div className="w-32 flex items-center justify-center p-4 border-2 border-black" style={{ height: "160px" }}>
                  <img src="/logo/dcci.png" alt="Dharma Group Logo" className="w-full h-full object-contain" />
                </div>
                <div className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1" style={{ height: "160px" }}>
                  <div className="w-full">
                    <h1 className="text-base font-bold text-gray-800 mb-1">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField value={dept.header?.title || selectedDepartment.name} onSave={(v) => handleEdit(selectedDepartment.id, "header", null, "title", v)} />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date :{" "}
                      <EditableField value={dept.header?.effectiveDate || "16 Maret 2026"} onSave={(v) => handleEdit(selectedDepartment.id, "header", null, "effectiveDate", v)} />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header?.preparedByName || "") && (
                              <img src={getSignatureByName(dept.header?.preparedByName || "")} alt="TTD" style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField value={dept.header?.preparedByName || ""} onSave={(v) => handleEdit(selectedDepartment.id, "header", null, "preparedByName", v)} />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField value={dept.header?.preparedByRole || "DEPARTMENT HEAD"} onSave={(v) => handleEdit(selectedDepartment.id, "header", null, "preparedByRole", v)} />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header?.checkedByName || "BAMBANG WURYANTO") && (
                              <img src={getSignatureByName(dept.header?.checkedByName || "BAMBANG WURYANTO")} alt="TTD" style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField value={dept.header?.checkedByName || "BAMBANG WURYANTO"} onSave={(v) => handleEdit(selectedDepartment.id, "header", null, "checkedByName", v)} />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField value={dept.header?.checkedByRole || "DIRECTOR"} onSave={(v) => handleEdit(selectedDepartment.id, "header", null, "checkedByRole", v)} />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header?.approvedByName || "EKO MARYANTO") && (
                              <img src={getSignatureByName(dept.header?.approvedByName || "EKO MARYANTO")} alt="TTD" style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField value={dept.header?.approvedByName || "EKO MARYANTO"} onSave={(v) => handleEdit(selectedDepartment.id, "header", null, "approvedByName", v)} />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField value={dept.header?.approvedByRole || "PRESIDENT DIRECTOR"} onSave={(v) => handleEdit(selectedDepartment.id, "header", null, "approvedByRole", v)} />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
              {cols.map((col) => (
                <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
              ))}
            </div>
            <div className="grid gap-4 relative org-grid" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
              {cols.map((col, colIdx) => (
                <DraggableStack
                  key={col}
                  deptId={selectedDepartment.id}
                  columnKey={`generic-${col}`}
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={200}
                >
                  {colIdx === 0 && (
                    <>
                      <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" />
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <p className="text-sm font-semibold mb-2 leading-tight">
                            PRESIDENT DIRECTOR
                          </p>
                          <hr className="my-2 border-gray-300" />
                          <p className="text-sm leading-tight">EKO MARYANTO</p>
                          <p className="text-sm leading-tight">(23200235)</p>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" />
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <p className="text-sm font-semibold mb-2 leading-tight">
                            DIRECTOR
                          </p>
                          <hr className="my-2 border-gray-300" />
                          <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                          <p className="text-sm leading-tight">(23200038)</p>
                        </div>
                      </div>
                    </>
                  )}
                  {renderCustomBoxesInColumn(col)}
                </DraggableStack>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (selectedDepartment.id === "management-representative") {
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1400px] relative p-4">
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-32 flex items-center justify-center p-4 border-2 border-black"
                  style={{ height: "160px" }}
                >
                  <img
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div
                  className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                  style={{ height: "160px" }}
                >
                  <div className="w-full">
                    <h1 className="text-base font-bold text-gray-800 mb-1">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField
                        value={dept.header.title || "MANAGEMENT REPRESENTATIVE"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "title", value)
                        }
                      />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date :{" "}
                      <EditableField
                        value={dept.header.effectiveDate || "16 Maret 2026"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "effectiveDate", value)
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {/* Prepared by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.preparedByName || "SUGIYARTO*") && (
                              <img
                                src={getSignatureByName(dept.header.preparedByName || "SUGIYARTO*")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.preparedByName || "SUGIYARTO*"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.preparedByRole || "DEPT. HEAD"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checked by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.checkedByName || "BAMBANG WURYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.checkedByRole || "DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.approvedByName || "EKO MARYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.approvedByName || "EKO MARYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.approvedByName || "EKO MARYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.approvedByRole || "PRESIDENT DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              {(() => {
                const cols = getColumnsForDept(selectedDepartment.id);
                return (
                  <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {cols.map((col) => (
                      <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
                    ))}
                  </div>
                );
              })()}
            </div>

            <div
              className="grid gap-4 relative org-grid"
              style={{ zIndex: 2, gridTemplateColumns: `repeat(${getColumnsForDept(selectedDepartment.id).length}, minmax(0, 1fr))` }}
            >
              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="mrep-col1-bod"
                boxPositions={boxPositions}
                setPositionsForDept={setPositionsForDept}
                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                isEditMode={isEditMode}
                minHeight={280}
              >
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">
                      PRESIDENT DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
                    <p className="text-sm leading-tight">(23200235)</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">
                      DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>
              </DraggableStack>

              {!isColumnHidden(selectedDepartment.id, "DEPARTMENT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mrep-col2-depthead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
                </DraggableStack>
              )}

              {!isColumnHidden(selectedDepartment.id, "SECTION HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mrep-col3-dept"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "section-head")) return null;
                    const sectionHeadItems = (dept.positions || [])
                      .filter((p) => p.column === "SECTION HEAD" && p.groupKey === "MANAGEMENT REPRESENTATIVE DEPARTMENT" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm w-[280px] relative">
                        {isEditMode && sectionHeadItems.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "section-head", "Management Representative (Section Head)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && sectionHeadItems.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "section-head", "Management Representative (Section Head)", sectionHeadItems)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="section-head" defaultTitle="MANAGEMENT REPRESENTATIVE" />
                            </div>
                          </div>
                          {sectionHeadItems.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === sectionHeadItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("SECTION HEAD")}
                </DraggableStack>
              )}

              {!isColumnHidden(selectedDepartment.id, "STAFF") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mrep-col4-staff"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "staff")) return null;
                    const staffItems = (dept.positions || [])
                      .filter((p) => p.column === "STAFF" && p.groupKey === "MANAGEMENT REPRESENTATIVE" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm w-[280px] relative">
                        {isEditMode && staffItems.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "staff", "Management Representative (Staff)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && staffItems.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "staff", "Management Representative (Staff)", staffItems)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="staff" defaultTitle="MANAGEMENT REPRESENTATIVE" />
                            </div>
                          </div>
                          {staffItems.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === staffItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("STAFF")}
                </DraggableStack>
              )}

              {(() => {
                const baseCols = getBaseColumnsForDept(selectedDepartment.id);
                const extraCols = getColumnsForDept(selectedDepartment.id).filter((c) => !baseCols.includes(c));
                return extraCols.map((col) => (
                  <DraggableStack
                    key={col}
                    deptId={selectedDepartment.id}
                    columnKey={`mrep-extra-${col}`}
                    boxPositions={boxPositions}
                    setPositionsForDept={setPositionsForDept}
                    onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                    isEditMode={isEditMode}
                    minHeight={160}
                  >
                    {renderCustomBoxesInColumn(col)}
                  </DraggableStack>
                ));
              })()}
            </div>
          </div>
        </div>
      );
    }

    if (selectedDepartment.id === "hrga-it") {
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1400px] relative p-4">
            {/* Header Section with borders */}
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-32 flex items-center justify-center p-4 border-2 border-black"
                  style={{ height: "160px" }}
                >
                  <img
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                  style={{ height: "160px" }}
                >
                  <div className="w-full">
                    <h1 className="text-base font-bold text-gray-800 mb-1">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField
                        value={dept.header.title || "HRDGA & IT"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "title", value)
                        }
                      />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date :{" "}
                      <EditableField
                        value={dept.header.effectiveDate || "16 Maret 2026"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "effectiveDate", value)
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {/* Prepared by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.preparedByName || "DIKI WAHYUDI*") && (
                              <img
                                src={getSignatureByName(dept.header.preparedByName || "DIKI WAHYUDI*")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.preparedByName || "DIKI WAHYUDI*"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.preparedByRole || "SECTION HEAD"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checked by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.checkedByName || "BAMBANG WURYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.checkedByRole || "DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved by - sama strukturnya */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.approvedByName || "EKO MARYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.approvedByName || "EKO MARYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.approvedByName || "EKO MARYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.approvedByRole || "PRESIDENT DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Rows */}
            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              {(() => {
                const cols = getColumnsForDept(selectedDepartment.id);
                return (
                  <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {cols.map((col) => (
                      <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Content Grid */}
            <div
              className="grid gap-4 relative org-grid"
              style={{ zIndex: 2, gridTemplateColumns: `repeat(${getColumnsForDept(selectedDepartment.id).length}, minmax(0, 1fr))` }}
            >
              {/* Kolom 1 - Board of Director */}
              {!isColumnHidden(selectedDepartment.id, "BOARD OF DIRECTOR") && (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                      <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" />
                    </div>
                    <div className="p-3 flex-1 text-center flex flex-col justify-center">
                      <p className="text-sm font-semibold mb-2 leading-tight whitespace-nowrap">
                        PRESIDENT DIRECTOR
                      </p>
                      <hr className="my-2 border-gray-300" />
                      <p className="text-sm leading-tight">EKO MARYANTO</p>
                      <p className="text-sm leading-tight">(23200235)</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                    <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                      <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" />
                    </div>
                    <div className="p-3 flex-1 text-center flex flex-col justify-center">
                      <p className="text-sm font-semibold mb-2 leading-tight whitespace-nowrap">
                        DIRECTOR
                      </p>
                      <hr className="my-2 border-gray-300" />
                      <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                      <p className="text-sm leading-tight">(23200038)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Kolom 2 - Department Head */}
              {!isColumnHidden(selectedDepartment.id, "DEPARTMENT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="hrga-it-col2-depthead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
                </DraggableStack>
              )}

              {/* Kolom 3 - Section Head */}
              {!isColumnHidden(selectedDepartment.id, "SECTION HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="hrga-it-col3-section"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={400}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "section-head")) return null;
                    const sectionHeadItems = (dept.positions || [])
                      .filter((p) => p.column === "SECTION HEAD" && p.groupKey === "HRGA & IT DEPARTMENT" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm w-[280px] relative">
                        {isEditMode && sectionHeadItems.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "section-head", "HRGA & IT (Section Head)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && sectionHeadItems.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "section-head", "HRGA & IT (Section Head)", sectionHeadItems)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={dept.header?.boxTitle || "HRGA & IT"}
                                  onChange={(e) =>
                                    handleEdit(selectedDepartment.id, "header", null, "boxTitle", e.target.value)
                                  }
                                  onMouseDown={(e) => e.stopPropagation()}
                                  className="so-drag-editable text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                                  placeholder="Section Title"
                                />
                              ) : (
                                <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                                  {dept.header?.boxTitle || "HRGA & IT"}
                                </p>
                              )}
                            </div>
                          </div>
                          {sectionHeadItems.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === sectionHeadItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("SECTION HEAD")}
                </DraggableStack>
              )}

              {/* Kolom 4 - Staff Level */}
              {!isColumnHidden(selectedDepartment.id, "STAFF LEVEL") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="hrga-it-col4-staff"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={800}
                >
                  {(() => {
                    const staffPositions = (dept.positions || []).filter(
                      (p) => p.column === "STAFF LEVEL" && p.groupKey && p.pendingAction !== "delete"
                    );
                    const renderGroupCard = (groupKey, minHeightClass) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, groupKey)) return null;
                      const items = staffPositions
                        .filter((p) => p.groupKey === groupKey)
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div key={groupKey} className={`bg-white border border-gray-400 rounded shadow-sm w-[280px] relative`}>
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, groupKey, groupKey)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, groupKey, groupKey, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    value={dept.header?.groupTitles?.[groupKey] || groupKey}
                                    onChange={(e) => {
                                      const newTitle = e.target.value;
                                      setDepartmentData((prev) => {
                                        const d = { ...prev[selectedDepartment.id] };
                                        d.header = {
                                          ...d.header,
                                          groupTitles: { ...(d.header.groupTitles || {}), [groupKey]: newTitle },
                                        };
                                        return { ...prev, [selectedDepartment.id]: d };
                                      });
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="so-drag-editable text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                                    placeholder="Judul Grup"
                                  />
                                ) : (
                                  <p className="text-sm font-semibold leading-tight">
                                    {dept.header?.groupTitles?.[groupKey] || groupKey}
                                  </p>
                                )}
                              </div>
                            </div>
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-sm font-semibold leading-tight"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-sm leading-tight"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    const groupDefs = [
                      { key: "HRD", cls: "" },
                      { key: "GENERAL AFFAIR & IND. RELATIONS", cls: "" },
                      { key: "INFORMATION TECHNOLOGY", cls: "" },
                    ];

                    return groupDefs.map((g) => renderGroupCard(g.key, g.cls));
                  })()}
                  {(() => {
                    const customBoxes = (departmentData["hrga-it"]?.positions || [])
                      .filter((p) => p.isCustom && p.column === "STAFF LEVEL" && !p.groupKey && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return customBoxes.map((p) => (
                      <div key={p.id} className={isEditMode ? "bg-white border-2 border-purple-400 rounded shadow-sm min-h-[120px] w-[280px] relative" : "bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px] relative"}>
                        {isEditMode && (
                          <button
                            onClick={() => handleRemoveCustomBox(selectedDepartment.id, p.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableField
                                value={p.title}
                                onSave={(value) => handleEdit(selectedDepartment.id, "positions", p.id, "title", value)}
                                className="text-sm font-semibold leading-tight"
                              />
                            </div>
                          </div>
                          <div className="flex flex-1">
                            <div className={isEditMode ? "bg-purple-50 p-2 text-center border-r border-purple-300 w-20 flex items-center justify-center" : "bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center"}>
                              {renderCodeButton(p)}
                            </div>
                            <div className="p-3 flex-1 text-center flex flex-col justify-center">
                              <EditableField
                                value={p.name}
                                onSave={(value) => handleEdit(selectedDepartment.id, "positions", p.id, "name", value)}
                                className="text-sm font-semibold leading-tight"
                              />
                              <EditableField
                                value={`(${p.empId})`}
                                onSave={(value) => handleEdit(selectedDepartment.id, "positions", p.id, "empId", value.replace(/[()]/g, ""))}
                                className="text-sm leading-tight"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </DraggableStack>
              )}
              {(() => {
                const baseCols = ["BOARD OF DIRECTOR", "DEPARTMENT HEAD", "SECTION HEAD", "STAFF LEVEL"];
                const extraCols = getColumnsForDept(selectedDepartment.id).filter((c) => !baseCols.includes(c));
                return extraCols.map((col) => (
                  <DraggableStack
                    key={col}
                    deptId={selectedDepartment.id}
                    columnKey={`hrga-it-extra-${col}`}
                    boxPositions={boxPositions}
                    setPositionsForDept={setPositionsForDept}
                    onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                    isEditMode={isEditMode}
                    minHeight={160}
                  >
                    {renderCustomBoxesInColumn(col)}
                  </DraggableStack>
                ));
              })()}
            </div> {/* ← penutup Content Grid */}


            {/* Notes Section */}
            <div className="mt-8 border-2 border-black p-3 inline-block">
              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">
                NOTE :
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( )</span>
                  <span>: CONCURRE</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">**</span>
                  <span>: ACTING</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( INC )</span>
                  <span>: INCUMBENT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBR</span>
                  <span>: TO BE RECRUIT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBD</span>
                  <span>: TO BE DEVELOP</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">COORD</span>
                  <span>: COORDINATOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDepartment.id === "management-development") {
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1400px] relative p-4">
            {/* Header Section with borders */}
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-32 flex items-center justify-center p-4 border-2 border-black"
                  style={{ height: "160px" }}
                >
                  <img
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                  style={{ height: "160px" }}
                >
                  <div className="w-full">
                    <h1 className="text-base font-bold text-gray-800 mb-1">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField
                        value={dept.header.title || "MANAGEMENT DEVELOPMENT"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "title", value)
                        }
                      />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date :{" "}
                      <EditableField
                        value={dept.header.effectiveDate || "16 Maret 2026"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "effectiveDate", value)
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {/* Prepared by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.preparedByName || "RENDRA PRAMONO") && (
                              <img
                                src={getSignatureByName(dept.header.preparedByName || "RENDRA PRAMONO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.preparedByName || "RENDRA PRAMONO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.preparedByRole || "DEPT. HEAD"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checked by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.checkedByName || "BAMBANG WURYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.checkedByRole || "DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved by - sama strukturnya */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.approvedByName || "EKO MARYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.approvedByName || "EKO MARYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.approvedByName || "EKO MARYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.approvedByRole || "PRESIDENT DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Rows */}
            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              {(() => {
                const cols = getColumnsForDept(selectedDepartment.id);
                return (
                  <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {cols.map((col) => (
                      <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Content Grid */}
            <div
              className="grid gap-4 relative org-grid"
              style={{ zIndex: 2, gridTemplateColumns: `repeat(${getColumnsForDept(selectedDepartment.id).length}, minmax(0, 1fr))` }}
            >
              {/* Kolom 1 - Board of Director */}
              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="mdev-col1-bod"
                boxPositions={boxPositions}
                setPositionsForDept={setPositionsForDept}
                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                isEditMode={isEditMode}
                minHeight={280}
              >
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight whitespace-nowrap">
                      PRESIDENT DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight whitespace-nowrap">
                      DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>
              </DraggableStack>

              {/* Kolom 2 - Department Head */}
              {!isColumnHidden(selectedDepartment.id, "DEPARTMENT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mdev-col2-depthead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
                </DraggableStack>
              )}

              {/* Kolom 3 - Section Head */}
              {!isColumnHidden(selectedDepartment.id, "SECTION HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mdev-col3-section"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {renderCustomBoxesInColumn("SECTION HEAD")}
                </DraggableStack>
              )}

              {/* Kolom 4 - Staff */}
              {!isColumnHidden(selectedDepartment.id, "STAFF") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mdev-col4-staff"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={200}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "staff")) return null;
                    const staffItems = (dept.positions || [])
                      .filter((p) => p.column === "STAFF" && p.groupKey === "MANAGEMENT DEVELOPEMENT/PDCA" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px] relative">
                        {isEditMode && staffItems.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "staff", "Management Development/PDCA (Staff)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && staffItems.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "staff", "Management Development/PDCA (Staff)", staffItems)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="staff" defaultTitle="MANAGEMENT DEVELOPEMENT/PDCA" />
                            </div>
                          </div>
                          {staffItems.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === staffItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("STAFF")}
                </DraggableStack>
              )}

              {(() => {
                const baseCols = getBaseColumnsForDept(selectedDepartment.id);
                const extraCols = getColumnsForDept(selectedDepartment.id).filter((c) => !baseCols.includes(c));
                return extraCols.map((col) => (
                  <DraggableStack
                    key={col}
                    deptId={selectedDepartment.id}
                    columnKey={`mdev-extra-${col}`}
                    boxPositions={boxPositions}
                    setPositionsForDept={setPositionsForDept}
                    onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                    isEditMode={isEditMode}
                    minHeight={160}
                  >
                    {renderCustomBoxesInColumn(col)}
                  </DraggableStack>
                ));
              })()}
            </div>

            {/* Notes Section */}
            <div className="mt-8 border-2 border-black p-3 inline-block">
              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">
                NOTE :
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( )</span>
                  <span>: CONCURRE</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">**</span>
                  <span>: ACTING</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( INC )</span>
                  <span>: INCUMBENT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBR</span>
                  <span>: TO BE RECRUIT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBD</span>
                  <span>: TO BE DEVELOP</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">COORD</span>
                  <span>: COORDINATOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDepartment.id === "manufactur-battery") {
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1400px] relative p-4">
            {/* Header Section with borders */}
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-32 flex items-center justify-center p-4 border-2 border-black"
                  style={{ height: "160px" }}
                >
                  <img
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                  style={{ height: "160px" }}
                >
                  <div className="w-full">
                    <h1 className="text-base font-bold text-gray-800 mb-1">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField
                        value={dept.header.title || "MANUFACTURING BATTERY"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "title", value)
                        }
                      />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date :{" "}
                      <EditableField
                        value={dept.header.effectiveDate || "16 Maret 2026"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "effectiveDate", value)
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {/* Prepared by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.preparedByName || "DIONISIUS AUGUSTO**") && (
                              <img
                                src={getSignatureByName(dept.header.preparedByName || "DIONISIUS AUGUSTO**")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.preparedByName || "DIONISIUS AUGUSTO**"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.preparedByRole || "SENIOR ENGINEER"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checked by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.checkedByName || "BAMBANG WURYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.checkedByRole || "DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.approvedByName || "EKO MARYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.approvedByName || "EKO MARYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.approvedByName || "EKO MARYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.approvedByRole || "PRESIDENT DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Rows */}
            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              {(() => {
                const cols = getColumnsForDept(selectedDepartment.id);
                return (
                  <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {cols.map((col) => (
                      <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Content Grid */}
            <div
              className="grid gap-2 relative org-grid"
              style={{ zIndex: 2, gridTemplateColumns: `repeat(${getColumnsForDept(selectedDepartment.id).length}, minmax(0, 1fr))` }}
            >
              {/* Kolom 1 - Board of Director */}
              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="manbat-col1-bod"
                boxPositions={boxPositions}
                setPositionsForDept={setPositionsForDept}
                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                isEditMode={isEditMode}
                minHeight={280}
              >
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[230px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-13 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" />
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">
                      PRESIDENT DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
                    <p className="text-sm leading-tight">(23200235)</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[230px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-13 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">
                      DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>
              </DraggableStack>

              {/* Kolom 2 - Department Head */}
              {!isColumnHidden(selectedDepartment.id, "DEPARTMENT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="manbat-col2-depthead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
                </DraggableStack>
              )}

              {/* Kolom 3 - Senior Engineer */}
              {!isColumnHidden(selectedDepartment.id, "SENIOR ENGINEER") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="manbat-col3-senior"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "senior-engineer")) return null;
                    const items = (dept.positions || [])
                      .filter((p) => p.column === "SENIOR ENGINEER" && p.groupKey === "MANUFACTURING BATTERY DEPARTMENT" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[230px] relative">
                        {isEditMode && items.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "senior-engineer", "Battery Production & PME")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && items.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "senior-engineer", "Battery Production & PME", items)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full w-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="senior-engineer" defaultTitle="BATTERY PRODUCTION & PME" />
                            </div>
                          </div>
                          {items.length === 0 && (
                            <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                              Belum ada data
                            </div>
                          )}
                          {items.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("SENIOR ENGINEER")}
                </DraggableStack>
              )}

              {/* Kolom 4 - Engineer */}
              {!isColumnHidden(selectedDepartment.id, "ENGINEER") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="manbat-col4-engineer"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={600}
                >
                  {(() => {
                    const groups = [
                      { title: "BATTERY PRODUCTION", key: "BATTERY PRODUCTION" },
                      { title: "QUALITY ASSURANCE", key: "QUALITY ASSURANCE" },
                      { title: "BATTERY PME", key: "BATTERY PME" },
                    ];

                    const renderGroup = ({ title, key }) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, key)) return null;
                      const items = (dept.positions || [])
                        .filter((p) => p.column === "ENGINEER" && p.groupKey === key && p.pendingAction !== "delete")
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div key={key} className="bg-white border border-gray-400 rounded shadow-sm w-[220px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, key, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, key, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    value={dept.header?.groupTitles?.[key] || title}
                                    onChange={(e) => {
                                      const newTitle = e.target.value;
                                      setDepartmentData((prev) => {
                                        const d = { ...prev[selectedDepartment.id] };
                                        d.header = {
                                          ...d.header,
                                          groupTitles: { ...(d.header.groupTitles || {}), [key]: newTitle },
                                        };
                                        return { ...prev, [selectedDepartment.id]: d };
                                      });
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="so-drag-editable text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                                    placeholder="Judul Grup"
                                  />
                                ) : (
                                  <EditableBoxTitle boxKey={key} defaultTitle={title} />
                                )}
                              </div>
                            </div>
                            {items.length === 0 && (
                              <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                                Belum ada data
                              </div>
                            )}
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-sm font-semibold leading-tight"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-sm leading-tight"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return groups.map(renderGroup);
                  })()}
                  {renderCustomBoxesInColumn("ENGINEER")}
                </DraggableStack>
              )}

              {/* Kolom 5 - Team Member/Technician */}
              {!isColumnHidden(selectedDepartment.id, "TEAM MEMBER/TECHNICIAN") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="manbat-col5-team"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={1400}
                >
                  {(() => {
                    const groups = [
                      { title: "AUXILIARY BATTERY PRODUCT", key: "AUXILIARY BATTERY PRODUCT" },
                      { title: "BESS PRODUCT", key: "BESS PRODUCT" },
                      { title: "BEV PRODUCT", key: "BEV PRODUCT" },
                      { title: "QUALITY CHECK", key: "QUALITY CHECK" },
                    ];

                    const renderGroup = ({ title, key }) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, key)) return null;
                      const items = (dept.positions || [])
                        .filter((p) => p.column === "TEAM MEMBER/TECHNICIAN" && p.groupKey === key && p.pendingAction !== "delete")
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div key={key} className="bg-white border border-gray-400 rounded shadow-sm w-[230px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, key, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, key, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    value={dept.header?.groupTitles?.[key] || title}
                                    onChange={(e) => {
                                      const newTitle = e.target.value;
                                      setDepartmentData((prev) => {
                                        const d = { ...prev[selectedDepartment.id] };
                                        d.header = {
                                          ...d.header,
                                          groupTitles: { ...(d.header.groupTitles || {}), [key]: newTitle },
                                        };
                                        return { ...prev, [selectedDepartment.id]: d };
                                      });
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="so-drag-editable text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                                    placeholder="Judul Grup"

                                  />
                                ) : (
                                  <p className="text-sm font-semibold leading-tight">{dept.header?.groupTitles?.[key] || title}</p>
                                )}
                              </div>
                            </div>
                            {items.length === 0 && (
                              <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                                Belum ada data
                              </div>
                            )}
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-sm font-semibold leading-tight"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-sm leading-tight"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return groups.map(renderGroup);
                  })()}
                  {renderCustomBoxesInColumn("TEAM MEMBER/TECHNICIAN")}
                </DraggableStack>
              )}

              {(() => {
                const baseCols = getBaseColumnsForDept(selectedDepartment.id);
                const extraCols = getColumnsForDept(selectedDepartment.id).filter((c) => !baseCols.includes(c));
                return extraCols.map((col) => (
                  <DraggableStack
                    key={col}
                    deptId={selectedDepartment.id}
                    columnKey={`manbat-extra-${col}`}
                    boxPositions={boxPositions}
                    setPositionsForDept={setPositionsForDept}
                    onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                    isEditMode={isEditMode}
                    minHeight={160}
                  >
                    {renderCustomBoxesInColumn(col)}
                  </DraggableStack>
                ));
              })()}
            </div>

            {/* Notes Section */}
            <div className="mt-8 border-2 border-black p-3 inline-block">
              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">
                NOTE :
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( )</span>
                  <span>: CONCURRE</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">**</span>
                  <span>: ACTING</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( INC )</span>
                  <span>: INCUMBENT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBR</span>
                  <span>: TO BE RECRUIT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBD</span>
                  <span>: TO BE DEVELOP</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">COORD</span>
                  <span>: COORDINATOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDepartment.id === "purchasing") {
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1400px] relative p-4">
            {/* Header Section with borders */}
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-32 flex items-center justify-center p-4 border-2 border-black"
                  style={{ height: "160px" }}
                >
                  <img
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                  style={{ height: "160px" }}
                >
                  <div className="w-full">
                    <h1 className="text-base font-bold text-gray-800 mb-1">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField
                        value={dept.header.title || "PURCHASING"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "title", value)
                        }
                      />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date :{" "}
                      <EditableField
                        value={dept.header.effectiveDate || "16 Maret 2026"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "effectiveDate", value)
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {/* Prepared by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.preparedByName || "DIKI WAHYUDI* / FAKHDARENI*") && (
                              <img
                                src={getSignatureByName(dept.header.preparedByName || "DIKI WAHYUDI* / FAKHDARENI*")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.preparedByName || "DIKI WAHYUDI* / FAKHDARENI*"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.preparedByRole || "SECTION HEAD"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checked by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.checkedByName || "BAMBANG WURYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.checkedByRole || "DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved by - sama strukturnya */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.approvedByName || "EKO MARYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.approvedByName || "EKO MARYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.approvedByName || "EKO MARYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.approvedByRole || "PRESIDENT DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Rows */}
            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              {(() => {
                const cols = getColumnsForDept(selectedDepartment.id);
                return (
                  <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {cols.map((col) => (
                      <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Content Grid */}
            <div className="grid gap-4 relative org-grid"
              style={{ zIndex: 2, gridTemplateColumns: `repeat(${getColumnsForDept(selectedDepartment.id).length}, minmax(0, 1fr))` }}
            >
              {/* Kolom 1 - Board of Director */}
              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="purch-col1-bod"
                boxPositions={boxPositions}
                setPositionsForDept={setPositionsForDept}
                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                isEditMode={isEditMode}
                minHeight={280}
              >
                <div className="bg-white border border-gray-400 rounded shadow-sm flex w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">
                      PRESIDENT DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
                    <p className="text-sm leading-tight">(23200235)</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">
                      DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>
              </DraggableStack>

              {/* Kolom 2 - Department Head */}
              {!isColumnHidden(selectedDepartment.id, "DEPARTMENT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="purch-col2-depthead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
                </DraggableStack>
              )}

              {/* Kolom 3 - Section Head */}
              {!isColumnHidden(selectedDepartment.id, "SECTION HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="purch-col3-section"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={200}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "section-head")) return null;
                    const sectionHeadItems = (dept.positions || [])
                      .filter((p) => p.column === "SECTION HEAD" && p.groupKey === "PURCHASING DEPARTMENT" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm w-[300px] relative">
                        {isEditMode && sectionHeadItems.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "section-head", "Procurement & Purchasing (Section Head)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && sectionHeadItems.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "section-head", "Procurement & Purchasing (Section Head)", sectionHeadItems)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="section-head" defaultTitle="PROCUREMENT & PURCHASING" />
                            </div>
                          </div>
                          {sectionHeadItems.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === sectionHeadItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("SECTION HEAD")}
                </DraggableStack>
              )}

              {/* Kolom 4 - Staff Level */}
              {!isColumnHidden(selectedDepartment.id, "STAFF LEVEL") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="purch-col4-staff"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={500}
                >
                  {(() => {
                    const groups = [
                      { title: "PROCUREMENT & PURCHASING", key: "PROCUREMENT & PURCHASING" },
                      { title: "CONTROLCABLE", key: "CONTROLCABLE" },
                      { title: "BATTERY", key: "BATTERY" },
                      { title: "GENERAL & LEGAL", key: "GENERAL & LEGAL" },
                      { title: "SUBCONT", key: "SUBCONT" },
                    ];

                    const renderGroup = ({ title, key }) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, key)) return null;
                      const items = (dept.positions || [])
                        .filter((p) => p.column === "STAFF LEVEL" && p.groupKey === key && p.pendingAction !== "delete")
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div key={key} className="bg-white border border-gray-400 rounded shadow-sm w-[280px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, key, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, key, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                <EditableBoxTitle boxKey={key} defaultTitle={title} />
                              </div>
                            </div>
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-sm leading-tight"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-sm leading-tight"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return groups.map(renderGroup);
                  })()}
                  {renderCustomBoxesInColumn("STAFF LEVEL")}
                </DraggableStack>
              )}

              {(() => {
                const baseCols = getBaseColumnsForDept(selectedDepartment.id);
                const extraCols = getColumnsForDept(selectedDepartment.id).filter((c) => !baseCols.includes(c));
                return extraCols.map((col) => (
                  <DraggableStack
                    key={col}
                    deptId={selectedDepartment.id}
                    columnKey={`purch-extra-${col}`}
                    boxPositions={boxPositions}
                    setPositionsForDept={setPositionsForDept}
                    onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                    isEditMode={isEditMode}
                    minHeight={160}
                  >
                    {renderCustomBoxesInColumn(col)}
                  </DraggableStack>
                ));
              })()}
            </div>

            {/* Notes Section */}
            <div className="mt-8 border-2 border-black p-3 inline-block">
              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">
                NOTE :
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( )</span>
                  <span>: CONCURRE</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">**</span>
                  <span>: ACTING</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( INC )</span>
                  <span>: INCUMBENT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBR</span>
                  <span>: TO BE RECRUIT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBD</span>
                  <span>: TO BE DEVELOP</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">COORD</span>
                  <span>: COORDINATOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDepartment.id === "mi-she") {
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1400px] relative p-4">
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-32 flex items-center justify-center p-4 border-2 border-black"
                  style={{ height: "160px" }}
                >
                  <img
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                  style={{ height: "160px" }}
                >
                  <div className="w-full">
                    <h1 className="text-base font-bold text-gray-800 mb-1">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField
                        value={dept.header.title || "MI & SHE"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "title", value)
                        }
                      />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date :{" "}
                      <EditableField
                        value={dept.header.effectiveDate || "16 Maret 2026"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "effectiveDate", value)
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {/* Prepared by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.preparedByName || "ELIATA DUMAR GINTING") && (
                              <img
                                src={getSignatureByName(dept.header.preparedByName || "ELIATA DUMAR GINTING")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.preparedByName || "ELIATA DUMAR GINTING"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.preparedByRole || "SECT. HEAD"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checked by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.checkedByName || "BAMBANG WURYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.checkedByRole || "DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.approvedByName || "EKO MARYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.approvedByName || "EKO MARYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.approvedByName || "EKO MARYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.approvedByRole || "PRESIDENT DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Rows */}
            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              {(() => {
                const cols = getColumnsForDept(selectedDepartment.id);
                return (
                  <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {cols.map((col) => (
                      <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
                    ))}
                  </div>
                );
              })()}
            </div>
            <div className="grid gap-4 relative org-grid"
              style={{ zIndex: 2, gridTemplateColumns: `repeat(${getColumnsForDept(selectedDepartment.id).length}, minmax(0, 1fr))` }}
            >
              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="mishe-col1-bod"
                boxPositions={boxPositions}
                setPositionsForDept={setPositionsForDept}
                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                isEditMode={isEditMode}
                minHeight={280}
              >
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" className="text-xs font-bold" />
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-2 leading-tight break-words">PRESIDENT DIRECTOR</p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-xs leading-tight break-words">EKO MARYANTO</p>
                    <p className="text-xs leading-tight">(23200235)</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" className="text-xs font-bold" />
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-2 leading-tight break-words">DIRECTOR</p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-xs leading-tight break-words">BAMBANG WURYANTO</p>
                    <p className="text-xs leading-tight">(23200038)</p>
                  </div>
                </div>
              </DraggableStack>

              {!isColumnHidden(selectedDepartment.id, "DEPARTMENT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mishe-col2-depthead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
                </DraggableStack>
              )}

              {!isColumnHidden(selectedDepartment.id, "SECTION HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mishe-col3-section"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={200}
                >
                  {(() => {
                    const sectionBoxKey = "section-head-mi-she-department";
                    if (isStructuralBoxHidden(selectedDepartment.id, sectionBoxKey)) return null;

                    const sectionHeadItems = (dept.positions || [])
                      .filter((p) => p.column === "SECTION HEAD" && p.groupKey === "MI & SHE DEPARTMENT" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px] relative">
                        {isEditMode && sectionHeadItems.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, sectionBoxKey, dept.header?.boxTitle || "MI & SHE (5R-SMK3-ISO 14001)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && sectionHeadItems.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, sectionBoxKey, dept.header?.boxTitle || "MI & SHE (5R-SMK3-ISO 14001)", sectionHeadItems)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="section-head" defaultTitle="MI & SHE (5R-SMK3-ISO 14001)" />
                            </div>
                          </div>
                          {sectionHeadItems.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === sectionHeadItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("SECTION HEAD")}
                </DraggableStack>
              )}

              {!isColumnHidden(selectedDepartment.id, "STAFF LEVEL") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mishe-col4-staff"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={500}
                >
                  {(() => {
                    const miItems = (dept.positions || [])
                      .filter((p) => p.column === "STAFF LEVEL" && p.groupKey === "MI" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    const sheItems = (dept.positions || [])
                      .filter((p) => p.column === "STAFF LEVEL" && p.groupKey === "SHE (5R-SMK3-ISO 14001)" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);

                    const renderGroup = (title, items) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, title)) return null;
                      return (
                        <div key={title} className="bg-white border border-gray-400 rounded shadow-sm w-[280px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, title, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, title, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                <EditableBoxTitle boxKey={title} defaultTitle={title} />
                              </div>
                            </div>
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-sm font-semibold leading-tight"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-sm leading-tight"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return [
                      renderGroup("MI", miItems),
                      renderGroup("SHE (5R-SMK3-ISO 14001)", sheItems),
                    ];
                  })()}
                  {renderCustomBoxesInColumn("STAFF LEVEL")}
                </DraggableStack>
              )}

              {(() => {
                const baseCols = getBaseColumnsForDept(selectedDepartment.id);
                const extraCols = getColumnsForDept(selectedDepartment.id).filter((c) => !baseCols.includes(c));
                return extraCols.map((col) => (
                  <DraggableStack
                    key={col}
                    deptId={selectedDepartment.id}
                    columnKey={`mishe-extra-${col}`}
                    boxPositions={boxPositions}
                    setPositionsForDept={setPositionsForDept}
                    onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                    isEditMode={isEditMode}
                    minHeight={160}
                  >
                    {renderCustomBoxesInColumn(col)}
                  </DraggableStack>
                ));
              })()}
            </div>
            <div className="mt-8 border-2 border-black p-3 inline-block">
              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">NOTE :</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( )</span>
                  <span>: CONCURRE</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">**</span>
                  <span>: ACTING</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( INC )</span>
                  <span>: INCUMBENT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBR</span>
                  <span>: TO BE RECRUIT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBD</span>
                  <span>: TO BE DEVELOP</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">COORD</span>
                  <span>: COORDINATOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDepartment.id === "manufacturing-cable") {
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1700px] relative p-4">
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-32 flex items-center justify-center p-4 border-2 border-black"
                  style={{ height: "160px" }}
                >
                  <img
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                  style={{ height: "160px" }}
                >
                  <div className="w-full">
                    <h1 className="text-base font-bold text-gray-800 mb-1">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField
                        value={dept.header.title || "MANUFACTURING CABLE"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "title", value)
                        }
                      />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date :{" "}
                      <EditableField
                        value={dept.header.effectiveDate || "16 Maret 2026"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "effectiveDate", value)
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {/* Prepared by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.preparedByName || "KARNA SATIA SALIM*") && (
                              <img
                                src={getSignatureByName(dept.header.preparedByName || "KARNA SATIA SALIM*")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.preparedByName || "KARNA SATIA SALIM*"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.preparedByRole || "SECTION HEAD"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checked by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.checkedByName || "BAMBANG WURYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.checkedByRole || "DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.approvedByName || "EKO MARYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.approvedByName || "EKO MARYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.approvedByName || "EKO MARYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.approvedByRole || "PRESIDENT DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              {(() => {
                const cols = getColumnsForDept(selectedDepartment.id);
                return (
                  <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {cols.map((col) => (
                      <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="grid gap-3 relative org-grid"
              style={{ zIndex: 2, gridTemplateColumns: `repeat(${getColumnsForDept(selectedDepartment.id).length}, minmax(0, 1fr))` }}
            >

              {/* KOLOM 1 - BOARD OF DIRECTOR */}
              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="mancable-col1-bod"
                boxPositions={boxPositions}
                setPositionsForDept={setPositionsForDept}
                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                isEditMode={isEditMode}
                minHeight={280}
              >
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[240px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" className="text-xs font-bold" />
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-2 leading-tight break-words">
                      PRESIDENT DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-xs leading-tight break-words">EKO MARYANTO</p>
                    <p className="text-xs leading-tight">(23200235)</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[240px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" className="text-xs font-bold" />
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-2 leading-tight break-words">
                      DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-xs leading-tight break-words">BAMBANG WURYANTO</p>
                    <p className="text-xs leading-tight">(23200038)</p>
                  </div>
                </div>
              </DraggableStack>

              {/* KOLOM 2 - DEPARTMENT HEAD */}
              {!isColumnHidden(selectedDepartment.id, "DEPARTMENT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mancable-col2-depthead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
                </DraggableStack>
              )}

              {/* KOLOM 3 - SECTION HEAD */}
              {!isColumnHidden(selectedDepartment.id, "SECTION HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mancable-col3-section"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "section-head")) return null;
                    const items = (dept.positions || [])
                      .filter((p) => p.column === "SECTION HEAD" && p.groupKey === "MANUFACTURING CABLE DEPARTMENT" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm w-[235px] relative">
                        {isEditMode && items.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "section-head", "Controlcable Manufacture")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && items.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "section-head", "Controlcable Manufacture", items)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="section-head" defaultTitle="CONTROLCABLE MANUFACTURE" className="text-xs font-semibold leading-tight break-words text-center" />
                            </div>
                          </div>
                          {items.length === 0 && (
                            <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                              Belum ada data
                            </div>
                          )}
                          {items.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-2 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-xs font-semibold leading-tight break-words text-center"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-xs leading-tight text-center"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );

                    return groups.map(renderGroup);
                  })()}
                  {renderCustomBoxesInColumn("SECTION HEAD")}
                </DraggableStack>
              )}

              {/* KOLOM 4 - STAFF / UNIT HEAD */}
              {!isColumnHidden(selectedDepartment.id, "STAFF / UNIT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mancable-col4-staff"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={420}
                >
                  {(() => {
                    const groups = [
                      { title: "MANUFACTURING UNIT", key: "MANUFACTURING UNIT" },
                      { title: "ASSEMBLING UNIT", key: "ASSEMBLING UNIT" },
                      { title: "PRODUCTION ENGINEERING", key: "PRODUCTION ENGINEERING (UNIT HEAD)" },
                    ];

                    const renderGroup = ({ title, key }) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, key)) return null;
                      const items = (dept.positions || [])
                        .filter((p) => p.column === "STAFF / UNIT HEAD" && p.groupKey === key && p.pendingAction !== "delete")
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div key={key} className="bg-white border border-gray-400 rounded shadow-sm w-[235px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, key, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, key, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                <EditableBoxTitle boxKey={key} defaultTitle={title} className="text-xs font-semibold leading-tight break-words text-center" />
                              </div>
                            </div>
                            {items.length === 0 && (
                              <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                                Belum ada data
                              </div>
                            )}
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-xs font-semibold leading-tight break-words text-center"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-xs leading-tight text-center"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return groups.map(renderGroup);
                  })()}
                  {renderCustomBoxesInColumn("STAFF / UNIT HEAD")}
                </DraggableStack>
              )}

              {/* KOLOM 5 - GROUP HEAD */}
              {!isColumnHidden(selectedDepartment.id, "GROUP HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mancable-col5-group"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={900}
                >
                  {(() => {
                    const groups = [
                      { title: "GROUP CO & CI", key: "GROUP CO & CI" },
                      { title: "GROUP PO", key: "GROUP PO" },
                      { title: "GROUP ASSEMBLING", key: "GROUP ASSEMBLING" },
                    ];

                    const renderGroup = ({ title, key }) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, key)) return null;
                      const items = (dept.positions || [])
                        .filter((p) => p.column === "GROUP HEAD" && p.groupKey === key && p.pendingAction !== "delete")
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div key={key} className="bg-white border border-gray-400 rounded shadow-sm w-[235px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, key, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, key, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                <EditableBoxTitle boxKey={key} defaultTitle={title} className="text-xs font-semibold leading-tight break-words text-center" />
                              </div>
                            </div>
                            {items.length === 0 && (
                              <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                                Belum ada data
                              </div>
                            )}
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-xs font-semibold leading-tight break-words text-center"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-xs leading-tight text-center"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return groups.map(renderGroup);
                  })()}
                  {renderCustomBoxesInColumn("GROUP HEAD")}
                </DraggableStack>
              )}

              {/* KOLOM 6 - TEAM MEMBER / ADMIN */}
              {!isColumnHidden(selectedDepartment.id, "TEAM MEMBER/ADMIN") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mancable-col6-team"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={1800}
                >
                  {/* positions 14 - COMPONENT OUTER & INNER */}
                  {(() => {
                    const groups = [
                      { title: "COMPONENT OUTER & COMPONENT INNER", key: "COMPONENT OUTER & COMPONENT INNER" },
                      { title: "PROSES OUTER", key: "PROSES OUTER" },
                      { title: "MAINTENANCE", key: "MAINTENANCE" },
                      { title: "PRODUCTION ENGINEERING", key: "PRODUCTION ENGINEERING (STAFF)" },
                      { title: "ASSEMBLING", key: "ASSEMBLING" },
                      { title: "QUALITY CONTROL PROCESS", key: "QUALITY CONTROL PROCESS" },
                      { title: "QUALITY CONTROL INCOMING", key: "QUALITY CONTROL INCOMING" },
                      { title: "ADMINISTRATION", key: "ADMINISTRATION" },
                    ];

                    const renderGroup = ({ title, key }) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, key)) return null;
                      const items = (dept.positions || [])
                        .filter((p) => p.column === "TEAM MEMBER/ADMIN" && p.groupKey === key && p.pendingAction !== "delete")
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div key={key} className="bg-white border border-gray-400 rounded shadow-sm w-[235px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, key, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, key, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                <EditableBoxTitle boxKey={key} defaultTitle={title} className="text-xs font-semibold leading-tight break-words text-center" />
                              </div>
                            </div>
                            {items.length === 0 && (
                              <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                                Belum ada data
                              </div>
                            )}
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-16 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-2 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-xs font-semibold leading-tight break-words text-center"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-xs leading-tight text-center"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return groups.map(renderGroup);
                  })()}
                  {renderCustomBoxesInColumn("TEAM MEMBER/ADMIN")}
                </DraggableStack>
              )}

              {(() => {
                const baseCols = getBaseColumnsForDept(selectedDepartment.id);
                const extraCols = getColumnsForDept(selectedDepartment.id).filter((c) => !baseCols.includes(c));
                return extraCols.map((col) => (
                  <DraggableStack
                    key={col}
                    deptId={selectedDepartment.id}
                    columnKey={`mancable-extra-${col}`}
                    boxPositions={boxPositions}
                    setPositionsForDept={setPositionsForDept}
                    onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                    isEditMode={isEditMode}
                    minHeight={160}
                  >
                    {renderCustomBoxesInColumn(col)}
                  </DraggableStack>
                ));
              })()}
            </div>

            <div className="mt-8 border-2 border-black p-3 inline-block">
              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">NOTE :</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( )</span>
                  <span>: CONCURRE</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">**</span>
                  <span>: ACTING</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( INC )</span>
                  <span>: INCUMBENT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBR</span>
                  <span>: TO BE RECRUIT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBD</span>
                  <span>: TO BE DEVELOP</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">COORD</span>
                  <span>: COORDINATOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDepartment.id === "finance") {
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1400px] relative p-4">
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-32 flex items-center justify-center p-4 border-2 border-black"
                  style={{ height: "160px" }}
                >
                  <img
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                  style={{ height: "160px" }}
                >
                  <div className="w-full">
                    <h1 className="text-base font-bold text-gray-800 mb-1">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField
                        value={dept.header.title || "FINANCE DEPARTMENT"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "title", value)
                        }
                      />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date :{" "}
                      <EditableField
                        value={dept.header.effectiveDate || "16 Maret 2026"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "effectiveDate", value)
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {/* Prepared by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.preparedByName || "YULIUS PERMATA") && (
                              <img
                                src={getSignatureByName(dept.header.preparedByName || "YULIUS PERMATA")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.preparedByName || "YULIUS PERMATA"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.preparedByRole || "SECTION HEAD"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checked by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.checkedByName || "BAMBANG WURYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.checkedByRole || "DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.approvedByName || "EKO MARYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.approvedByName || "EKO MARYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.approvedByName || "EKO MARYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.approvedByRole || "PRESIDENT DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              {(() => {
                const cols = getColumnsForDept(selectedDepartment.id);
                return (
                  <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {cols.map((col) => (
                      <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
                    ))}
                  </div>
                );
              })()}
            </div>

            <div
              className="grid gap-4 relative org-grid"
              style={{ zIndex: 2, gridTemplateColumns: `repeat(${getColumnsForDept(selectedDepartment.id).length}, minmax(0, 1fr))` }}
            >
              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="finance-col1-bod"
                boxPositions={boxPositions}
                setPositionsForDept={setPositionsForDept}
                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                isEditMode={isEditMode}
                minHeight={280}
              >
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">
                      PRESIDENT DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
                    <p className="text-sm leading-tight">(23200235)</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">
                      DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>
              </DraggableStack>

              {/* Kolom 2 - Department Head */}
              {!isColumnHidden(selectedDepartment.id, "DEPARTMENT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="finance-col2-depthead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
                </DraggableStack>
              )}

              {/* Kolom 3 - Section Head (FIN1.0, sekarang dari database) */}
              {!isColumnHidden(selectedDepartment.id, "SECTION HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="finance-col3-section"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={280}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "section-head")) return null;
                    const sectionHeadItems = (dept.positions || [])
                      .filter((p) => p.column === "SECTION HEAD" && p.groupKey === "FINANCE DEPARTMENT" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm w-[280px] relative">
                        {isEditMode && sectionHeadItems.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "section-head", "Finance & Accounting (Section Head)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && sectionHeadItems.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "section-head", "Finance & Accounting (Section Head)", sectionHeadItems)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="section-head" defaultTitle="FINANCE & ACCOUNTING" />
                            </div>
                          </div>
                          {sectionHeadItems.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === sectionHeadItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("SECTION HEAD")}
                </DraggableStack>
              )}

              {!isColumnHidden(selectedDepartment.id, "STAFF") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="finance-col4-staff"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={280}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "staff")) return null;
                    const staffItems = (dept.positions || [])
                      .filter((p) => p.column === "STAFF" && p.groupKey === "FINANCE & ACCOUNTING" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px] relative">
                        {isEditMode && staffItems.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "staff", "Finance & Accounting (Staff)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && staffItems.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "staff", "Finance & Accounting (Staff)", staffItems)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="staff" defaultTitle="FINANCE & ACCOUNTING" />
                            </div>
                          </div>
                          {staffItems.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === staffItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("STAFF")}
                </DraggableStack>
              )}

              {(() => {
                const baseCols = getBaseColumnsForDept(selectedDepartment.id);
                const extraCols = getColumnsForDept(selectedDepartment.id).filter((c) => !baseCols.includes(c));
                return extraCols.map((col) => (
                  <DraggableStack
                    key={col}
                    deptId={selectedDepartment.id}
                    columnKey={`finance-extra-${col}`}
                    boxPositions={boxPositions}
                    setPositionsForDept={setPositionsForDept}
                    onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                    isEditMode={isEditMode}
                    minHeight={160}
                  >
                    {renderCustomBoxesInColumn(col)}
                  </DraggableStack>
                ));
              })()}
            </div>

            <div className="mt-8 border-2 border-black p-3 inline-block">
              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">
                NOTE :
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( )</span>
                  <span>: CONCURRE</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">**</span>
                  <span>: ACTING</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( INC )</span>
                  <span>: INCUMBENT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBR</span>
                  <span>: TO BE RECRUIT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBD</span>
                  <span>: TO BE DEVELOP</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">COORD</span>
                  <span>: COORDINATOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDepartment.id === "marketing-battery") {
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1400px] relative p-4">
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-32 flex items-center justify-center p-4 border-2 border-black"
                  style={{ height: "160px" }}
                >
                  <img
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                  style={{ height: "160px" }}
                >
                  <div className="w-full">
                    <h1 className="text-base font-bold text-gray-800 mb-1">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField
                        value={dept.header.title || "MARKETING BATTERY"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "title", value)
                        }
                      />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date :{" "}
                      <EditableField
                        value={dept.header.effectiveDate || "16 Maret 2026"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "effectiveDate", value)
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {/* Prepared by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.preparedByName || "RENDRA PRAMONO") && (
                              <img
                                src={getSignatureByName(dept.header.preparedByName || "RENDRA PRAMONO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.preparedByName || "RENDRA PRAMONO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.preparedByRole || "DEPT. HEAD"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checked by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.checkedByName || "BAMBANG WURYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.checkedByRole || "DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.approvedByName || "EKO MARYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.approvedByName || "EKO MARYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.approvedByName || "EKO MARYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.approvedByRole || "PRESIDENT DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              {(() => {
                const cols = getColumnsForDept(selectedDepartment.id);
                return (
                  <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {cols.map((col) => (
                      <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="grid gap-4 relative org-grid"
              style={{ zIndex: 2, gridTemplateColumns: `repeat(${getColumnsForDept(selectedDepartment.id).length}, minmax(0, 1fr))` }}
            >
              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="mktbat-col1-bod"
                boxPositions={boxPositions}
                setPositionsForDept={setPositionsForDept}
                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                isEditMode={isEditMode}
                minHeight={280}
              >
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">
                      PRESIDENT DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
                    <p className="text-sm leading-tight">(23200235)</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">
                      DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>
              </DraggableStack>

              {/* Kolom 2 - Department Head */}
              {!isColumnHidden(selectedDepartment.id, "DEPARTMENT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mktbat-col2-depthead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "dept-head")) return null;
                    const deptHeadItems = (dept.positions || [])
                      .filter((p) => p.column === "DEPARTMENT HEAD" && p.groupKey === "MARKETING BATTERY DEPARTMENT" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm w-[280px] relative">
                        {isEditMode && deptHeadItems.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "dept-head", "Marketing (Department Head)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && deptHeadItems.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "dept-head", "Marketing (Department Head)", deptHeadItems)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="dept-head" defaultTitle="MARKETING" />
                            </div>
                          </div>
                          {deptHeadItems.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === deptHeadItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
                </DraggableStack>
              )}

              {/* Kolom 3 - Section Head */}
              {!isColumnHidden(selectedDepartment.id, "SECTION HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mktbat-col3-staff"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={320}
                >
                  {(() => {
                    const auxItems = (dept.positions || [])
                      .filter((p) => p.column === "STAFF/SPECIALIST" && p.groupKey === "AUX & POWER BATTERY MARKETING" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    const essItems = (dept.positions || [])
                      .filter((p) => p.column === "STAFF/SPECIALIST" && p.groupKey === "ESS MARKETING" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);

                    const renderGroup = (title, items) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, title)) return null;
                      return (
                        <div key={title} className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, title, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, title, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                <EditableBoxTitle boxKey={title} defaultTitle={title} />
                              </div>
                            </div>
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-sm font-semibold leading-tight"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-sm leading-tight"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return [
                      renderGroup("AUX & POWER BATTERY MARKETING", auxItems),
                      renderGroup("ESS MARKETING", essItems),
                    ];
                  })()}
                  {renderCustomBoxesInColumn("STAFF/SPECIALIST")}
                </DraggableStack>
              )}

              {(() => {
                const baseCols = getBaseColumnsForDept(selectedDepartment.id);
                const extraCols = getColumnsForDept(selectedDepartment.id).filter((c) => !baseCols.includes(c));
                return extraCols.map((col) => (
                  <DraggableStack
                    key={col}
                    deptId={selectedDepartment.id}
                    columnKey={`mktbat-extra-${col}`}
                    boxPositions={boxPositions}
                    setPositionsForDept={setPositionsForDept}
                    onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                    isEditMode={isEditMode}
                    minHeight={160}
                  >
                    {renderCustomBoxesInColumn(col)}
                  </DraggableStack>
                ));
              })()}
            </div>

            <div className="mt-8 border-2 border-black p-3 inline-block">
              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">
                NOTE :
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( )</span>
                  <span>: CONCURRE</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">**</span>
                  <span>: ACTING</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( INC )</span>
                  <span>: INCUMBENT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBR</span>
                  <span>: TO BE RECRUIT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBD</span>
                  <span>: TO BE DEVELOP</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">COORD</span>
                  <span>: COORDINATOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDepartment.id === "marketing-engineering") {
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1400px] relative p-4">
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-32 flex items-center justify-center p-4 border-2 border-black"
                  style={{ height: "160px" }}
                >
                  <img
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                  style={{ height: "160px" }}
                >
                  <div>
                    <h1 className="text-base font-bold text-gray-800 mb-1">
                      STRUKTUR ORGANISASI
                    </h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">
                      PT DHARMA CONTROLCABLE INDONESIA
                    </h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField
                        value={dept.header.title}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "title", value)
                        }
                      />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date : 16 Maret 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {/* Prepared by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.preparedByName || "ANDREAS AGUNG S.") && (
                              <img
                                src={getSignatureByName(dept.header.preparedByName || "ANDREAS AGUNG S.")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.preparedByName || "ANDREAS AGUNG S."}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.preparedByRole || "DEPT. HEAD"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checked by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.checkedByName || "BAMBANG WURYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.checkedByRole || "DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.approvedByName || "EKO MARYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.approvedByName || "EKO MARYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.approvedByName || "EKO MARYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.approvedByRole || "PRESIDENT DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              {(() => {
                const cols = getColumnsForDept(selectedDepartment.id);
                return (
                  <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {cols.map((col) => (
                      <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="grid gap-4 relative org-grid"
              style={{ zIndex: 2, gridTemplateColumns: `repeat(${getColumnsForDept(selectedDepartment.id).length}, minmax(0, 1fr))` }}
            >
              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="mkteng-col1-bod"
                boxPositions={boxPositions}
                setPositionsForDept={setPositionsForDept}
                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                isEditMode={isEditMode}
                minHeight={280}
              >
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">
                      PRESIDENT DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
                    <p className="text-sm leading-tight">(23200235)</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">
                      DIRECTOR
                    </p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>
              </DraggableStack>

              {/* Kolom 2 - Department Head */}
              {!isColumnHidden(selectedDepartment.id, "DEPARTMENT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mkteng-col2-depthead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "dept-head")) return null;
                    const deptHeadItems = (dept.positions || [])
                      .filter((p) => p.column === "DEPARTMENT HEAD" && p.groupKey === "MARKETING ENGINEERING DEPARTMENT" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm w-[280px] relative">
                        {isEditMode && deptHeadItems.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "dept-head", "Marketing (Department Head)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && deptHeadItems.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "dept-head", "Marketing (Department Head)", deptHeadItems)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="dept-head" defaultTitle="MARKETING" />
                            </div>
                          </div>
                          {deptHeadItems.length === 0 && (
                            <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                              Belum ada data
                            </div>
                          )}
                          {deptHeadItems.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === deptHeadItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("DEPARTMENT HEAD")}
                </DraggableStack>
              )}

              {/* Kolom 3 - Section Head */}
              {!isColumnHidden(selectedDepartment.id, "SECTION HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mkteng-col3-section"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={320}
                >
                  {(() => {
                    const groups = [
                      { title: "SALES & MARKETING CONTROLCABLE", key: "SALES & MARKETING CONTROLCABLE (SECTION)" },
                      { title: "ENGINEERING CONTROLCABLE", key: "ENGINEERING CONTROLCABLE" },
                    ];

                    const renderGroup = ({ title, key }) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, key)) return null;
                      const items = (dept.positions || [])
                        .filter((p) => p.column === "SECTION HEAD" && p.groupKey === key && p.pendingAction !== "delete")
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div key={key} className="bg-white border border-gray-400 rounded shadow-sm w-[290px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, key, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, key, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                <EditableBoxTitle boxKey={key} defaultTitle={title} />
                              </div>
                            </div>
                            {items.length === 0 && (
                              <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                                Belum ada data
                              </div>
                            )}
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-sm font-semibold leading-tight"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-sm leading-tight"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return groups.map(renderGroup);
                  })()}
                  {renderCustomBoxesInColumn("SECTION HEAD")}
                </DraggableStack>
              )}

              {/* Kolom 4 - Staff */}
              {!isColumnHidden(selectedDepartment.id, "STAFF") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="mkteng-col4-staff"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={1200}
                >
                  {(() => {
                    const groups = [
                      { title: "SALES & MARKETING CONTROLCABLE", key: "SALES & MARKETING CONTROLCABLE" },
                      { title: "CUSTOMER REPRESENTATIVE", key: "CUSTOMER REPRESENTATIVE" },
                      { title: "PRODUCT & QUALITY ENGINEERING CABLE", key: "PRODUCT & QUALITY ENGINEERING CABLE" },
                      { title: "PROCESS ENGINEERING CABLE", key: "PROCESS ENGINEERING CABLE" },
                      { title: "NEW BUSINESS DEVELOPMENT", key: "NEW BUSINESS DEVELOPMENT" },
                    ];

                    const renderGroup = ({ title, key }) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, key)) return null;
                      const items = (dept.positions || [])
                        .filter((p) => p.column === "STAFF" && p.groupKey === key && p.pendingAction !== "delete")
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div key={key} className="bg-white border border-gray-400 rounded shadow-sm w-[315px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, key, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, key, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    value={dept.header?.groupTitles?.[key] || title}
                                    onChange={(e) => {
                                      const newTitle = e.target.value;
                                      setDepartmentData((prev) => {
                                        const d = { ...prev[selectedDepartment.id] };
                                        d.header = {
                                          ...d.header,
                                          groupTitles: { ...(d.header.groupTitles || {}), [key]: newTitle },
                                        };
                                        return { ...prev, [selectedDepartment.id]: d };
                                      });
                                    }}

                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="so-drag-editable text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                                    placeholder="Judul Grup"

                                  />
                                ) : (
                                  <EditableBoxTitle boxKey={key} defaultTitle={title} />
                                )}
                              </div>
                            </div>
                            {items.length === 0 && (
                              <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                                Belum ada data
                              </div>
                            )}
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-sm font-semibold leading-tight"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-sm leading-tight"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return groups.map(renderGroup);
                  })()}
                  {renderCustomBoxesInColumn("STAFF")}
                </DraggableStack>
              )}

              {(() => {
                const baseCols = getBaseColumnsForDept(selectedDepartment.id);
                const extraCols = getColumnsForDept(selectedDepartment.id).filter((c) => !baseCols.includes(c));
                return extraCols.map((col) => (
                  <DraggableStack
                    key={col}
                    deptId={selectedDepartment.id}
                    columnKey={`mkteng-extra-${col}`}
                    boxPositions={boxPositions}
                    setPositionsForDept={setPositionsForDept}
                    onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                    isEditMode={isEditMode}
                    minHeight={160}
                  >
                    {renderCustomBoxesInColumn(col)}
                  </DraggableStack>
                ));
              })()}
            </div>

            <div className="mt-8 border-2 border-black p-3 inline-block">
              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">
                NOTE :
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( )</span>
                  <span>: CONCURRE</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">**</span>
                  <span>: ACTING</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( INC )</span>
                  <span>: INCUMBENT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBR</span>
                  <span>: TO BE RECRUIT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBD</span>
                  <span>: TO BE DEVELOP</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">COORD</span>
                  <span>: COORDINATOR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDepartment.id === "ppic") {
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1700px] relative p-4">
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-32 flex items-center justify-center p-4 border-2 border-black"
                  style={{ height: "160px" }}
                >
                  <img
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                  style={{ height: "160px" }}
                >
                  <div className="w-full">
                    <h1 className="text-base font-bold text-gray-800 mb-1">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField
                        value={dept.header.title || "PPIC"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "title", value)
                        }
                      />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date :{" "}
                      <EditableField
                        value={dept.header.effectiveDate || "16 Maret 2026"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "effectiveDate", value)
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {/* Prepared by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.preparedByName || "DIKI WAHYUDI*") && (
                              <img
                                src={getSignatureByName(dept.header.preparedByName || "DIKI WAHYUDI*")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.preparedByName || "DIKI WAHYUDI*"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.preparedByRole || "DEPT. HEAD"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checked by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.checkedByName || "BAMBANG WURYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.checkedByRole || "DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.approvedByName || "EKO MARYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.approvedByName || "EKO MARYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.approvedByName || "EKO MARYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.approvedByRole || "PRESIDENT DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column Headers */}
            <div className="mb-4 relative" style={{ zIndex: 2 }}>
              {(() => {
                const cols = getColumnsForDept(selectedDepartment.id);
                return (
                  <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {cols.map((col) => (
                      <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Content Grid */}
            <div className="grid gap-3 relative org-grid"
              style={{ zIndex: 2, gridTemplateColumns: `repeat(${getColumnsForDept(selectedDepartment.id).length}, minmax(0, 1fr))` }}
            >
              {/* Kolom 1 - Board of Director */}
              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="ppic-col1-bod"
                boxPositions={boxPositions}
                setPositionsForDept={setPositionsForDept}
                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                isEditMode={isEditMode}
                minHeight={280}
              >
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[235px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-1 leading-tight">PRESIDENT DIRECTOR</p>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
                    <p className="text-sm leading-tight">(23200235)</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[235px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-1 leading-tight">DIRECTOR</p>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>
              </DraggableStack>

              {/* Kolom 2 - Department Head */}
              {!isColumnHidden(selectedDepartment.id, "DEPARTMENT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="ppic-col2-depthead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "dept-head")) return null;
                    const items = (dept.positions || [])
                      .filter((p) => p.column === "DEPARTMENT HEAD" && p.groupKey === "PPIC DEPARTMENT" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm w-[230px] relative">
                        {isEditMode && items.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "dept-head", "PPIC (Department Head)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && items.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "dept-head", "PPIC (Department Head)", items)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="dept-head" defaultTitle="PPIC" />
                            </div>
                          </div>
                          {items.length === 0 && (
                            <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                              Belum ada data
                            </div>
                          )}
                          {items.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight break-words"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("DEPARTMENT HEAD", "230px")}
                </DraggableStack>
              )}

              {/* Kolom 3 - Section Head (kosong) */}
              {!isColumnHidden(selectedDepartment.id, "SECTION HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="ppic-col3-section"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {renderCustomBoxesInColumn("SECTION HEAD", "230px")}
                </DraggableStack>
              )}

              {/* Kolom 4 - Unit Head/Staff */}
              {!isColumnHidden(selectedDepartment.id, "UNIT HEAD/STAFF") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="ppic-col4-unitstaff"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={400}
                >
                  {(() => {
                    const groups = [
                      { title: "PPC CONTROLCABLE", key: "PPC CONTROLCABLE" },
                      { title: "BATTERY & AHM OES", key: "BATTERY & AHM OES" },
                      { title: "WHS CONTROLCABLE", key: "WHS CONTROLCABLE" },
                    ];

                    const renderGroup = ({ title, key }) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, key)) return null;
                      const items = (dept.positions || [])
                        .filter((p) => p.column === "UNIT HEAD/STAFF" && p.groupKey === key && p.pendingAction !== "delete")
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div key={key} className="bg-white border border-gray-400 rounded shadow-sm w-[230px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, key, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, key, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    value={dept.header?.groupTitles?.[key] || title}
                                    onChange={(e) => {
                                      const newTitle = e.target.value;
                                      setDepartmentData((prev) => {
                                        const d = { ...prev[selectedDepartment.id] };
                                        d.header = {
                                          ...d.header,
                                          groupTitles: { ...(d.header.groupTitles || {}), [key]: newTitle },
                                        };
                                        return { ...prev, [selectedDepartment.id]: d };
                                      });
                                    }}

                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="so-drag-editable text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                                    placeholder="Judul Grup"
                                  />
                                ) : (
                                  <EditableBoxTitle boxKey={key} defaultTitle={title} />
                                )}
                              </div>
                            </div>
                            {items.length === 0 && (
                              <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                                Belum ada data
                              </div>
                            )}
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-sm font-semibold leading-tight break-words"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-sm leading-tight"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return groups.map(renderGroup);
                  })()}
                  {renderCustomBoxesInColumn("UNIT HEAD/STAFF", "230px")}
                </DraggableStack>
              )}

              {/* Kolom 5 - Group Head */}
              {!isColumnHidden(selectedDepartment.id, "GROUP HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="ppic-col5-grouphead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "group-head")) return null;
                    const items = (dept.positions || [])
                      .filter((p) => p.column === "GROUP HEAD" && p.groupKey === "CONTROLCABLE" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm w-[230px] relative">
                        {isEditMode && items.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "group-head", "Controlcable (Group Head)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && items.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "group-head", "Controlcable (Group Head)", items)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="group-head" defaultTitle="CONTROLCABLE" />
                            </div>
                          </div>
                          {items.length === 0 && (
                            <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                              Belum ada data
                            </div>
                          )}
                          {items.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight break-words"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("GROUP HEAD", "230px")}
                </DraggableStack>
              )}

              {/* Kolom 6 - Member */}
              {!isColumnHidden(selectedDepartment.id, "MEMBER") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="ppic-col6-member"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={1300}
                >
                  {(() => {
                    const groups = [
                      { title: "PROD PLAN", key: "PROD PLAN" },
                      { title: "DN/MANIFEST", key: "DN/MANIFEST" },
                      { title: "DELIVERY", key: "DELIVERY" },
                      { title: "BATTERY", key: "BATTERY" },
                      { title: "SUPPLIER CONTROL", key: "SUPPLIER CONTROL" },
                      { title: "MRP", key: "MRP" },
                      { title: "RM & OHP", key: "RM & OHP" },
                      { title: "SUPPLY", key: "SUPPLY" },
                    ];

                    const renderGroup = ({ title, key }) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, key)) return null;
                      const items = (dept.positions || [])
                        .filter((p) => p.column === "MEMBER" && p.groupKey === key && p.pendingAction !== "delete")
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div key={key} className="bg-white border border-gray-400 rounded shadow-sm w-[230px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, key, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, key, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    value={dept.header?.groupTitles?.[key] || title}
                                    onChange={(e) => {
                                      const newTitle = e.target.value;
                                      setDepartmentData((prev) => {
                                        const d = { ...prev[selectedDepartment.id] };
                                        d.header = {
                                          ...d.header,
                                          groupTitles: { ...(d.header.groupTitles || {}), [key]: newTitle },
                                        };
                                        return { ...prev, [selectedDepartment.id]: d };
                                      });
                                    }}

                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="so-drag-editable text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                                    placeholder="Judul Grup"
                                  />
                                ) : (
                                  <p className="text-sm font-semibold leading-tight">{dept.header?.groupTitles?.[key] || title}</p>
                                )}
                              </div>

                            </div>
                            {items.length === 0 && (
                              <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                                Belum ada data
                              </div>
                            )}
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-sm font-semibold leading-tight break-words"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-sm leading-tight"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return groups.map(renderGroup);
                  })()}
                  {renderCustomBoxesInColumn("MEMBER", "230px")}
                </DraggableStack>
              )}

              {(() => {
                const baseCols = getBaseColumnsForDept(selectedDepartment.id);
                const extraCols = getColumnsForDept(selectedDepartment.id).filter((c) => !baseCols.includes(c));
                return extraCols.map((col) => (
                  <DraggableStack
                    key={col}
                    deptId={selectedDepartment.id}
                    columnKey={`ppic-extra-${col}`}
                    boxPositions={boxPositions}
                    setPositionsForDept={setPositionsForDept}
                    onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                    isEditMode={isEditMode}
                    minHeight={160}
                  >
                    {renderCustomBoxesInColumn(col, "230px")}
                  </DraggableStack>
                ));
              })()}
            </div>

            {/* Notes Section */}
            <div className="mt-8 border-2 border-black p-3 inline-block">
              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">NOTE :</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( )</span>
                  <span>: CONCURRE</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">**</span>
                  <span>: ACTING</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( INC )</span>
                  <span>: INCUMBENT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBR</span>
                  <span>: TO BE RECRUIT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBD</span>
                  <span>: TO BE DEVELOP</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">COORD</span>
                  <span>: COORDINATOR</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      );
    }

    if (selectedDepartment.id === "qa") {
      return (
        <div className="print-area bg-white rounded-lg shadow-sm overflow-x-auto border-4 border-black">
          <div className="min-w-[1400px] relative p-4">
            {/* Header Section */}
            <div className="mb-4 border-2 border-black p-3">
              <div className="flex items-start gap-2">
                <div
                  className="w-32 flex items-center justify-center p-4 border-2 border-black"
                  style={{ height: "160px" }}
                >
                  <img
                    src="/logo/dcci.png"
                    alt="Dharma Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div
                  className="border-2 border-black p-4 text-center flex items-center justify-center flex-1 mr-1"
                  style={{ height: "160px" }}
                >
                  <div className="w-full">
                    <h1 className="text-base font-bold text-gray-800 mb-1">STRUKTUR ORGANISASI</h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">PT DHARMA CONTROLCABLE INDONESIA</h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (<EditableField
                        value={dept.header.title || "QA DEPARTMENT"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "title", value)
                        }
                      />)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date :{" "}
                      <EditableField
                        value={dept.header.effectiveDate || "16 Maret 2026"}
                        onSave={(value) =>
                          handleEdit(selectedDepartment.id, "header", null, "effectiveDate", value)
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    {/* Prepared by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Prepared by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.preparedByName || "M BAGUS SANTOSO") && (
                              <img
                                src={getSignatureByName(dept.header.preparedByName || "M BAGUS SANTOSO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.preparedByName || "M BAGUS SANTOSO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.preparedByRole || "DEPT. HEAD"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "preparedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Checked by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Checked by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.checkedByName || "BAMBANG WURYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.checkedByName || "BAMBANG WURYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.checkedByRole || "DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "checkedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approved by */}
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">Approved by :</p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16 flex items-center justify-center">
                            {getSignatureByName(dept.header.approvedByName || "EKO MARYANTO") && (
                              <img
                                src={getSignatureByName(dept.header.approvedByName || "EKO MARYANTO")}
                                alt="TTD"
                                style={{ maxHeight: "50px", maxWidth: "120px", objectFit: "contain" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div className="text-center border-t border-black pt-1">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              <EditableField
                                value={dept.header.approvedByName || "EKO MARYANTO"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByName", value)
                                }
                              />
                            </p>
                            <p className="text-sm text-black leading-tight">
                              <EditableField
                                value={dept.header.approvedByRole || "PRESIDENT DIRECTOR"}
                                onSave={(value) =>
                                  handleEdit(selectedDepartment.id, "header", null, "approvedByRole", value)
                                }
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column Headers */}
            <div className="mb-6 relative" style={{ zIndex: 2 }}>
              {(() => {
                const cols = getColumnsForDept(selectedDepartment.id);
                return (
                  <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
                    {cols.map((col) => (
                      <HeaderCell key={col} deptId={selectedDepartment.id} colKey={col} />
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Content Grid */}
            <div className="grid gap-2 relative org-grid"
              style={{ zIndex: 2, gridTemplateColumns: `repeat(${getColumnsForDept(selectedDepartment.id).length}, minmax(0, 1fr))` }}
            >
              {/* Kolom 1 - Board of Director */}
              <DraggableStack
                deptId={selectedDepartment.id}
                columnKey="qa-col1-bod"
                boxPositions={boxPositions}
                setPositionsForDept={setPositionsForDept}
                onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                isEditMode={isEditMode}
                minHeight={280}
              >
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[250px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-13 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.0`} defaultCode="BOD1.0" />
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">PRESIDENT DIRECTOR</p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">EKO MARYANTO</p>
                    <p className="text-sm leading-tight">(23200235)</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[250px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-13 flex items-center justify-center">
                    <EditableStaticCode boxKey={`${selectedDepartment.id}-bod1.1`} defaultCode="BOD1.1" />
                  </div>
                  <div className="p-3 flex-1 text-center flex flex-col justify-center">
                    <p className="text-sm font-semibold mb-2 leading-tight">DIRECTOR</p>
                    <hr className="my-2 border-gray-300" />
                    <p className="text-sm leading-tight">BAMBANG WURYANTO</p>
                    <p className="text-sm leading-tight">(23200038)</p>
                  </div>
                </div>
              </DraggableStack>

              {/* Kolom 2 - Department Head */}
              {!isColumnHidden(selectedDepartment.id, "DEPARTMENT HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="qa-col2-depthead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "dept-head")) return null;
                    const deptHeadItems = (dept.positions || [])
                      .filter((p) => p.column === "DEPARTMENT HEAD" && p.groupKey === "QA DEPARTMENT" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm w-[260px] relative">
                        {isEditMode && deptHeadItems.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "dept-head", "Quality Assurance (Department Head)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && deptHeadItems.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "dept-head", "Quality Assurance (Department Head)", deptHeadItems)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="dept-head" defaultTitle="QUALITY ASSURANCE" />
                            </div>
                          </div>
                          {deptHeadItems.length === 0 && (
                            <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                              Belum ada data
                            </div>
                          )}
                          {deptHeadItems.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === deptHeadItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("DEPARTMENT HEAD", "260px")}
                </DraggableStack>
              )}

              {/* Kolom 3 - Unit/Staff Level */}
              {!isColumnHidden(selectedDepartment.id, "UNIT/STAFF LEVEL") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="qa-col3-unitstaff"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  {(() => {
                    if (isStructuralBoxHidden(selectedDepartment.id, "unit-staff")) return null;
                    const unitItems = (dept.positions || [])
                      .filter((p) => p.column === "UNIT/STAFF LEVEL" && p.groupKey === "QUALITY ASSURANCE PROCESS (UNIT)" && p.pendingAction !== "delete")
                      .sort((a, b) => a.order - b.order);
                    return (
                      <div className="bg-white border border-gray-400 rounded shadow-sm w-[260px] relative">
                        {isEditMode && unitItems.length === 0 && (
                          <button
                            onClick={() => hideStructuralBox(selectedDepartment.id, "unit-staff", "Quality Assurance Process (Unit/Staff)")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                            title="Hapus box kosong"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {isEditMode && unitItems.length > 0 && (
                          <button
                            onClick={() => deleteBoxWithData(selectedDepartment.id, "unit-staff", "Quality Assurance Process (Unit/Staff)", unitItems)}
                            className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                            title="Hapus box beserta semua data"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className="flex flex-col h-full">
                          <div className="flex border-b border-gray-400">
                            <div className="p-2 flex-1 text-center bg-gray-100">
                              <EditableBoxTitle boxKey="unit-staff" defaultTitle="QUALITY ASSURANCE PROCESS" />
                            </div>
                          </div>
                          {unitItems.length === 0 && (
                            <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                              Belum ada data
                            </div>
                          )}
                          {unitItems.map((staff, idx) => (
                            <div
                              key={staff.id}
                              className={`flex flex-1 relative ${idx === unitItems.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                            >
                              {isEditMode && (
                                <button
                                  onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                  title="Hapus"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                {renderCodeButton(staff)}
                              </div>
                              <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                <EditableField
                                  value={staff.name}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                  className="text-sm font-semibold leading-tight"
                                />
                                <EditableField
                                  value={`(${staff.empId})`}
                                  onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                  className="text-sm leading-tight"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {renderCustomBoxesInColumn("UNIT/STAFF LEVEL", "260px")}
                </DraggableStack>
              )}

              {/* Kolom 4 - Group Head */}
              {!isColumnHidden(selectedDepartment.id, "GROUP HEAD") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="qa-col4-grouphead"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={160}
                >
                  <div className="[&_.w-\[220px\]]:!w-[280px]">
                    {renderCustomBoxesInColumn("GROUP HEAD", "260px")}
                  </div>
                </DraggableStack>
              )}

              {/* Kolom 5 - Operator/Admin */}
              {!isColumnHidden(selectedDepartment.id, "OPERATOR/ADMIN") && (
                <DraggableStack
                  deptId={selectedDepartment.id}
                  columnKey="qa-col5-operator"
                  boxPositions={boxPositions}
                  setPositionsForDept={setPositionsForDept}
                  onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                  isEditMode={isEditMode}
                  minHeight={550}
                >
                  {/* QUALITY ASSURANCE PROCESS */}
                  {(() => {
                    const groups = [
                      { title: "QUALITY ASSURANCE PROCESS", key: "QUALITY ASSURANCE PROCESS" },
                      { title: "LAB & KALIBRASI", key: "LAB & KALIBRASI" },
                      { title: "VENDOR MANAGEMENT", key: "VENDOR MANAGEMENT" },
                      { title: "CLAIM & COMPLAIN", key: "CLAIM & COMPLAIN" },
                    ];

                    const renderGroup = ({ title, key }) => {
                      if (isStructuralBoxHidden(selectedDepartment.id, key)) return null;
                      const items = (dept.positions || [])
                        .filter((p) => p.column === "OPERATOR/ADMIN" && p.groupKey === key && p.pendingAction !== "delete")
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div key={key} className="bg-white border border-gray-400 rounded shadow-sm w-[250px] relative">
                          {isEditMode && items.length === 0 && (
                            <button
                              onClick={() => hideStructuralBox(selectedDepartment.id, key, title)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                              title="Hapus box kosong"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {isEditMode && items.length > 0 && (
                            <button
                              onClick={() => deleteBoxWithData(selectedDepartment.id, key, title, items)}
                              className="absolute -top-2 -left-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 z-10"
                              title="Hapus box beserta semua data"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <div className="flex flex-col h-full">
                            <div className="flex border-b border-gray-400">
                              <div className="p-2 flex-1 text-center bg-gray-100">
                                {isEditMode ? (
                                  <input
                                    type="text"
                                    value={dept.header?.groupTitles?.[key] || title}
                                    onChange={(e) => {
                                      const newTitle = e.target.value;
                                      setDepartmentData((prev) => {
                                        const d = { ...prev[selectedDepartment.id] };
                                        d.header = {
                                          ...d.header,
                                          groupTitles: { ...(d.header.groupTitles || {}), [key]: newTitle },
                                        };
                                        return { ...prev, [selectedDepartment.id]: d };
                                      });
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="so-drag-editable text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                                    placeholder="Judul Grup"
                                  />
                                ) : (
                                  <p className="text-sm font-semibold leading-tight">
                                    {dept.header?.groupTitles?.[key] || title}
                                  </p>
                                )}
                              </div>
                            </div>
                            {items.length === 0 && (
                              <div className="flex-1 flex items-center justify-center p-4 text-xs text-gray-400 italic min-h-[70px]">
                                Belum ada data
                              </div>
                            )}
                            {items.map((staff, idx) => (
                              <div
                                key={staff.id}
                                className={`flex flex-1 relative ${idx === items.length - 1 ? "border-b-0" : "border-b border-gray-300"}`}
                              >
                                {isEditMode && (
                                  <button
                                    onClick={() => handleRemoveCustomBox(selectedDepartment.id, staff.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
                                    title="Hapus"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                                <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                                  {renderCodeButton(staff)}
                                </div>
                                <div className="p-3 flex-1 text-center flex flex-col justify-center">
                                  <EditableField
                                    value={staff.name}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "name", value)}
                                    className="text-sm font-semibold leading-tight"
                                  />
                                  <EditableField
                                    value={`(${staff.empId})`}
                                    onSave={(value) => handleEdit(selectedDepartment.id, "positions", staff.id, "empId", value.replace(/[()]/g, ""))}
                                    className="text-sm leading-tight"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return groups.map(renderGroup);
                  })()}
                  {renderCustomBoxesInColumn("OPERATOR/ADMIN", "250px")}
                </DraggableStack>
              )}

              {(() => {
                const baseCols = getBaseColumnsForDept(selectedDepartment.id);
                const extraCols = getColumnsForDept(selectedDepartment.id).filter((c) => !baseCols.includes(c));
                return extraCols.map((col) => (
                  <DraggableStack
                    key={col}
                    deptId={selectedDepartment.id}
                    columnKey={`qa-extra-${col}`}
                    boxPositions={boxPositions}
                    setPositionsForDept={setPositionsForDept}
                    onDirty={() => setPositionsDirty((prev) => ({ ...prev, [selectedDepartment.id]: true }))}
                    isEditMode={isEditMode}
                    minHeight={160}
                  >
                    {renderCustomBoxesInColumn(col, "250px")}
                  </DraggableStack>
                ));
              })()}
            </div>

            {/* Notes Section */}
            <div className="mt-8 border-2 border-black p-3 inline-block">
              <h3 className="text-sm font-bold mb-2 border-b border-black pb-1">NOTE :</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( )</span>
                  <span>: CONCURRE</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">**</span>
                  <span>: ACTING</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">( INC )</span>
                  <span>: INCUMBENT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBR</span>
                  <span>: TO BE RECRUIT</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">TBD</span>
                  <span>: TO BE DEVELOP</span>
                </div>
                <div className="flex items-start">
                  <span className="w-12 font-semibold">COORD</span>
                  <span>: COORDINATOR</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      );
    }
  };

  const renderCustomBoxesInColumn = (column, width = "280px") => {
    if (!selectedDepartment || !departmentData[selectedDepartment.id]) return null;
    const dept = departmentData[selectedDepartment.id];
    const customBoxes = (dept.positions || [])
      .filter((p) => p.isCustom && p.column === column && !p.groupKey)
      .sort((a, b) => a.order - b.order);
    if (customBoxes.length === 0) return null;
    return customBoxes.map((p) => (
      <div
        key={p.id}
        className={isEditMode ? "bg-white border-2 border-purple-400 rounded shadow-sm relative" : "bg-white border border-gray-400 rounded shadow-sm relative"}
        style={{ width }}
      >
        {p.pendingAction && (
          <span className={`absolute -top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white z-20 ${p.pendingAction === "delete" ? "bg-red-500" : "bg-amber-500"}`}>
            {p.pendingAction === "delete" ? "Menunggu Hapus" : "Pending Approval"}
          </span>
        )}
        {isEditMode && (
          <button
            onClick={() => handleRemoveCustomBox(selectedDepartment.id, p.id)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 z-10"
            title="Hapus box beserta data"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        <div className="flex flex-col h-full rounded overflow-hidden">
          <div className="flex border-b border-gray-400">
            <div className="p-2 flex-1 text-center bg-gray-100">
              {isEditMode ? (
                <input
                  type="text"
                  value={p.title}
                  onChange={(e) => handleEdit(selectedDepartment.id, "positions", p.id, "title", e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="so-drag-editable text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                  placeholder="Title"
                />
              ) : (
                <p className="text-sm font-semibold leading-tight">{p.title}</p>
              )}
            </div>
          </div>
          {/* Baris bawah: Kode di kiri, Nama + NPK di kanan */}
          <div className="flex flex-1">
            <div className={isEditMode ? "bg-purple-50 p-2 text-center border-r border-purple-300 w-20 flex items-center justify-center" : "bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center"}>
              {renderCodeButton(p)}
            </div>
            <div className="p-3 flex-1 text-center flex flex-col justify-center">
              <EditableField
                value={p.name}
                onSave={(value) => handleEdit(selectedDepartment.id, "positions", p.id, "name", value)}
                className="text-sm font-semibold leading-tight"
              />
              <EditableField
                value={`(${p.empId})`}
                onSave={(value) => handleEdit(selectedDepartment.id, "positions", p.id, "empId", value.replace(/[()]/g, ""))}
                className="text-sm leading-tight"
              />
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const renderAdditionalPositions = () => {
    if (!selectedDepartment || !departmentData[selectedDepartment.id]) return null;
    const dept = departmentData[selectedDepartment.id];
    const customPositions = (dept.positions || []).filter((p) => p.isCustom);
    if (customPositions.length === 0) return null;

    const grouped = {};
    customPositions.forEach((p) => {
      if (!grouped[p.column]) grouped[p.column] = [];
      grouped[p.column].push(p);
    });

    return (
      <div className="p-4 border-t-4 border-purple-300 mt-2">
        <h3 className="text-sm font-bold text-purple-700 mb-3">ADDITIONAL POSITIONS (Pending/Custom)</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(grouped).map(([column, items]) => (
            <div key={column} className="flex-1 min-w-[260px]">
              <div className="bg-purple-200 text-center text-xs font-bold py-2 rounded border border-black mb-2">
                {column}
              </div>
              <div className="space-y-2">
                {items
                  .sort((a, b) => a.order - b.order)
                  .map((p) => (
                    <div key={p.id} className="bg-white border border-purple-300 rounded shadow-sm flex relative">
                      {isEditMode && (
                        <button
                          onClick={() => handleRemoveCustomBox(selectedDepartment.id, p.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                          title="Remove"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <div className="bg-gray-100 p-2 text-center border-r border-purple-300 w-20 flex items-center justify-center">
                        {renderCodeButton(p)}
                      </div>
                      <div className="p-3 flex-1 text-center">
                        <EditableField
                          value={p.name}
                          onSave={(value) => handleEdit(selectedDepartment.id, "positions", p.id, "name", value)}
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${p.empId})`}
                          onSave={(value) => handleEdit(selectedDepartment.id, "positions", p.id, "empId", value.replace(/[()]/g, ""))}
                          className="text-sm leading-tight block"
                        />
                        <p className="text-xs text-gray-500 mt-1">{p.title}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout sidebarVisible={sidebarVisible}>
      <div className="min-h-screen bg-gray-50 p-4">
        {showJobModal && selectedJob && (
          <>
            {loadingJobdesc ? (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-lg w-[520px] max-w-[95%]">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">
                      Loading job description...
                    </span>
                  </div>
                </div>
              </div>
            ) : jobdescData ? (
              <JobdescViewer
                user={{
                  name: selectedJob.name,
                  noPNK: selectedJob.empId,
                  positionCode: selectedJob.code || selectedJob.id || "",
                  department: { name: jobdescData.division || "N/A" },
                }}
                jobdesc={jobdescData}
                viewOnly={true}
                onClose={() => {
                  setShowJobModal(false);
                  setJobdescData(null);
                  setSelectedJob(null);
                }}
              />
            ) : (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-lg w-[520px] max-w-[95%]">
                  <p className="font-semibold mb-2">Jobdesk Tidak Ditemukan</p>
                  <p className="text-sm text-gray-600">
                    Tidak ada data jobdesk untuk {selectedJob?.name}
                  </p>
                  <button
                    onClick={() => {
                      setShowJobModal(false);
                      setSelectedJob(null);
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {!selectedDepartment ? (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">SO Bagian</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Edit struktur organisasi untuk semua departemen
              </p>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">
                Pilih Departemen untuk Edit
              </h2>
              <button
                onClick={() => setShowAddDeptModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Departemen
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="relative bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {isDeptPending(dept.id, "department-delete") && (
                    <span className="absolute -top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-red-500 z-10">
                      Menunggu Hapus
                    </span>
                  )}
                  {isDeptPending(dept.id, "department-rename") && (
                    <span className="absolute -top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-amber-500 z-10">
                      Pending Rename
                    </span>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenameDeptTarget(dept);
                        setRenameDeptValue(dept.name);
                        setShowRenameDeptModal(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Rename"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDepartment(dept);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Hapus"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setSidebarVisible(false);
                      const defaultDept = allDepartments.find(d => d.id === dept.id);
                      setOriginalDepartmentData(prev => ({
                        ...prev,
                        [dept.id]: JSON.parse(JSON.stringify(
                          departmentData[dept.id] || defaultDept?.structure
                        ))
                      }));
                    }}
                    className="text-left w-full"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 pr-14">
                        {dept.name}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">
                        {departmentData[dept.id]?.header?.preparedByName || departmentData[dept.id]?.header?.head || "TBD"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {departmentData[dept.id]?.positions?.length || 0}{" "}
                        positions
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

        ) : selectedDepartment && departmentData[selectedDepartment.id] ? (
          <div className="space-y-4">
            {/* Editor Toolbar */}
            {!previewMode && (
              <div className="bg-white shadow-sm border rounded-lg p-4 no-print">
                <div className="flex items-center gap-3 flex-nowrap overflow-x-auto pb-1">
                  <button
                    onClick={() => {
                      setSelectedDepartment(null);
                      setSidebarVisible(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Main Dashboard
                  </button>

                  <h2
                    className="text-lg font-semibold truncate max-w-[320px] flex-shrink mr-2"
                    title={selectedDepartment.name}
                  >
                    {selectedDepartment.name}
                  </h2>

                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap flex-shrink-0
                    ${isEditMode
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                  >
                    {isEditMode ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Mode
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Mode
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3 flex-nowrap ml-auto">
                    {isEditMode && (
                      <button
                        onClick={openAddBoxModal}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Box
                      </button>
                    )}

                    {isEditMode && (
                      <button
                        onClick={openAddHeaderModal}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Header
                      </button>
                    )}

                    {isEditMode && selectedDepartment && getHiddenColumnsForDept(selectedDepartment.id).length > 0 && (
                      <div className="relative group flex-shrink-0">
                        <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Header Tersembunyi ({getHiddenColumnsForDept(selectedDepartment.id).length})
                        </button>
                        <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg hidden group-hover:block z-50 min-w-[200px]">
                          {getHiddenColumnsForDept(selectedDepartment.id).map((col) => (
                            <button
                              key={col}
                              onClick={() => restoreColumn(selectedDepartment.id, col)}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 whitespace-nowrap"
                            >
                              ↩ {getColumnLabel(selectedDepartment.id, col)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {isEditMode && (
                      <button
                        onClick={() => resetPositionsForDept(selectedDepartment.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset Layout
                      </button>
                    )}

                    {isEditMode && (
                      <button
                        onClick={() => openSubmitModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Submit for Approval
                      </button>
                    )}

                    {/* Tombol Print — selalu align kanan total */}
                    <button
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-60 whitespace-nowrap flex-shrink-0"
                      title="Print / Simpan sebagai PDF"
                    >
                      {isPrinting ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Menyiapkan...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                            />
                          </svg>
                          Print / PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>


                {showSaveDialog && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-semibold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Changes saved successfully!
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      Department page will reflect these changes immediately.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Department Structure Editor with Department-Specific Layout */}
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              {renderDepartmentSpecificLayout()}
            </div>
          </div>
        ) : null}

        {showSubmitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Submit SO Bagian Changes for Approval
                </h2>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={submitForm.title}
                    onChange={(e) =>
                      setSubmitForm({ ...submitForm, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Update Finance Department Structure"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={submitForm.description}
                    onChange={(e) =>
                      setSubmitForm({
                        ...submitForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Describe the changes you made..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={submitForm.priority}
                    onChange={(e) =>
                      setSubmitForm({ ...submitForm, priority: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Important:</strong> Your changes will not appear
                        in the SO Bagian until approved by a Manager.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitForApproval}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddBoxModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw]">
              <h2 className="text-lg font-bold mb-4">Tambah Box Baru</h2>

              <div className="space-y-3">
                {/* Kolom/Header — DINAMIS berdasarkan departmentColumns[dept.id], bukan hardcode */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Header / Kolom</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                    value={addBoxForm.column}
                    onChange={e => setAddBoxForm(f => ({ ...f, column: e.target.value, afterId: "" }))}
                  >
                    {getColumnsForDept(selectedDepartment.id).map(col => (
                      <option key={col} value={col}>{getColumnLabel(selectedDepartment.id, col)}</option>
                    ))}
                  </select>
                </div>

                {(departmentGroups[selectedDepartment.id]?.[addBoxForm.column] || []).length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Gabung ke Grup (opsional)</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                      value={addBoxForm.groupKey}
                      onChange={e => setAddBoxForm(f => ({ ...f, groupKey: e.target.value }))}
                    >
                      <option value="">-- Box Terpisah --</option>
                      {(departmentGroups[selectedDepartment.id]?.[addBoxForm.column] || []).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* "Setelah siapa" — DINAMIS dari box custom yang sudah ada di kolom itu */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Tambahkan Setelah</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                    value={addBoxForm.afterId}
                    onChange={e => setAddBoxForm(f => ({ ...f, afterId: e.target.value }))}
                  >
                    <option value="">-- Paling atas / awal kolom --</option>
                    {getCustomPositionsInColumn(selectedDepartment.id, addBoxForm.column)
                      .sort((a, b) => a.order - b.order)
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.name} — {p.title}</option>
                      ))}
                  </select>
                </div>

                <input placeholder="Code (contoh: HRD1.5)" value={addBoxForm.code}
                  onChange={e => setAddBoxForm(f => ({ ...f, code: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm" />
                <input placeholder="Title *" value={addBoxForm.title}
                  onChange={e => setAddBoxForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm" />
                <input placeholder="Nama *" value={addBoxForm.name}
                  onChange={e => setAddBoxForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm" />
                <input placeholder="Employee ID" value={addBoxForm.empId}
                  onChange={e => setAddBoxForm(f => ({ ...f, empId: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={handleAddBox} className="flex-1 bg-blue-500 text-white rounded-md py-2">Tambah</button>
                <button onClick={() => setShowAddBoxModal(false)} className="flex-1 bg-gray-200 rounded-md py-2">Batal</button>
              </div>
            </div>
          </div>
        )}

        {showAddHeaderModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw]">
              <h2 className="text-lg font-bold mb-4">Tambah Header Baru</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Nama Header</label>
                  <input
                    placeholder="contoh: GROUP HEAD"
                    value={addHeaderForm.name}
                    onChange={(e) => setAddHeaderForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Sisipkan Setelah</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm mt-1"
                    value={addHeaderForm.afterColumn}
                    onChange={(e) => setAddHeaderForm((f) => ({ ...f, afterColumn: e.target.value }))}
                  >
                    {getColumnsForDept(selectedDepartment.id).map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={handleAddHeader} className="flex-1 bg-indigo-600 text-white rounded-md py-2">Tambah</button>
                <button onClick={() => setShowAddHeaderModal(false)} className="flex-1 bg-gray-200 rounded-md py-2">Batal</button>
              </div>
            </div>
          </div>
        )}

        {showAddDeptModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw]">
              <h2 className="text-lg font-bold mb-4">Tambah Departemen Baru</h2>
              <div className="space-y-3">
                <input placeholder="ID/Slug (contoh: rnd-battery)" value={addDeptForm.bagianId}
                  onChange={(e) => setAddDeptForm((f) => ({ ...f, bagianId: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  className="w-full border rounded-md px-3 py-2 text-sm" />
                <input placeholder="Nama Departemen *" value={addDeptForm.name}
                  onChange={(e) => setAddDeptForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm" />
                <input placeholder="Route (opsional, contoh: /rnd-battery)" value={addDeptForm.route}
                  onChange={(e) => setAddDeptForm((f) => ({ ...f, route: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Departemen baru akan tampil dengan layout 4 kolom standar (Board of Director / Department Head / Section Head / Staff).
              </p>
              <div className="flex gap-2 mt-5">
                <button onClick={handleAddDepartment} className="flex-1 bg-emerald-600 text-white rounded-md py-2">Konfirmasi</button>
                <button onClick={() => setShowAddDeptModal(false)} className="flex-1 bg-gray-200 rounded-md py-2">Batal</button>
              </div>
            </div>
          </div>
        )}

        {showRenameDeptModal && renameDeptTarget && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw]">
              <h2 className="text-lg font-bold mb-4">Rename Departemen</h2>
              <input value={renameDeptValue} onChange={(e) => setRenameDeptValue(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm" />
              <div className="flex gap-2 mt-5">
                <button onClick={handleRenameDepartment} className="flex-1 bg-blue-600 text-white rounded-md py-2">Konfirmasi</button>
                <button onClick={() => setShowRenameDeptModal(false)} className="flex-1 bg-gray-200 rounded-md py-2">Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SoBagianEditor;