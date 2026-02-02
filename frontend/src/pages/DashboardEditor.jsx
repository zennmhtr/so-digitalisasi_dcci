import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { soChangeRequestsAPI } from "../services/api";

const DashboardEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [organizationData, setOrganizationData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [editModeStartData, setEditModeStartData] = useState(null);
  const [submitForm, setSubmitForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    affectedSection: "departments",
  });

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [connectors, setConnectors] = useState([]);
  const [isDrawingConnector, setIsDrawingConnector] = useState(false);
  const [connectorStart, setConnectorStart] = useState(null);
  const [tempConnector, setTempConnector] = useState(null);
  const [newBoxes, setNewBoxes] = useState([]);
  const [showAddBoxPanel, setShowAddBoxPanel] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const handleMouseMove = useCallback(
    (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });

        if (isDrawingConnector && connectorStart) {
          setTempConnector({
            start: connectorStart,
            end: { x, y },
          });
        }
      }
    },
    [isDrawingConnector, connectorStart]
  );

  const addNewBox = (boxData) => {
    const newBox = {
      id: `new-box-${Date.now()}`,
      code: boxData.code || "NEW",
      title: boxData.title || "New Position",
      name: boxData.name || "To Be Assigned",
      empId: boxData.empId || "",
      position: { x: 100, y: 100 },
      isCustom: true,
    };
    setNewBoxes((prev) => [...prev, newBox]);
    setShowAddBoxPanel(false);
  };

  const startConnector = (elementId, position) => {
    if (!isDrawingMode) return;

    setIsDrawingConnector(true);
    setConnectorStart({ elementId, ...position });
  };

  const finishConnector = (elementId, position) => {
    if (!isDrawingMode || !isDrawingConnector || !connectorStart) return;

    if (connectorStart.elementId !== elementId) {
      const newConnector = {
        id: `connector-${Date.now()}`,
        start: connectorStart,
        end: { elementId, ...position },
        style: "solid",
      };
      setConnectors((prev) => [...prev, newConnector]);
    }

    setIsDrawingConnector(false);
    setConnectorStart(null);
    setTempConnector(null);
  };

  const deleteConnector = (connectorId) => {
    setConnectors((prev) => prev.filter((c) => c.id !== connectorId));
  };

  const hasAccess = React.useMemo(() => {
    const userRole = user?.role;
    const userPermissions =
      typeof userRole === "object" ? userRole?.permissions : [];
    console.log("SO DCI Editor Debug:", {
      user: user?.name,
      userRole: userRole?.name,
      userPermissions,
      hasAccess: userPermissions?.includes("SO DCI Editor"),
    });
    return user && userPermissions?.includes("SO DCI Editor");
  }, [user]);

  useEffect(() => {
    const initialData = {
      header: {
        title: "ORGANIZATION STRUCTURE",
        company: "PT DHARMA CONTROLCABLE INDONESIA",
        effectiveDate: "08/09/2025",
        regNo: "08/10/2025",
        preparedDate: "08/09/2025",
        approvedDate: "08/09/2025",
      },
      signatures: {
        preparedBy: { name: "Diki Wahyudi", date: "08/09/2025" },
        middleBy: {
          title: "Bambang Wuryanto",
          name: "Bambang Wuryanto",
          date: "08/09/2025",
        },
        approvedBy: { name: "Eko Maryanto", date: "08/09/2025" },
      },
      commissioners: {
        president: { title: "PRESIDENT COMMISIONER", name: "IRIANTO SANTOSO" },
        commissioners: ["SUBAGIO", "HONG KUO MING", "LIAO CHIN HSIEN"],
      },
      structure: {
        bod: [
          {
            id: "bod-1",
            code: "BOD1.0",
            title: "PRESIDENT DIRECTOR",
            name: "EKO MARYANTO",
            empId: "23100235",
          },
          {
            id: "bod-2",
            code: "BOD1.1",
            title: "DIRECTOR",
            name: "BAMBANG WURYANTO",
            empId: "23200038",
          },
        ],
        management: [
          {
            id: "mio-1",
            code: "MIO1.0",
            title: "MI & SHE (5R-SMK3-ISO 14001)",
            name: "ELIATA DUMAR GINTING",
            empId: "23190806",
            clickable: true,
            route: "/mi-she",
          },
          {
            id: "mdo-1",
            code: "MDO1.0",
            title: "MANAGEMENT DEVELOPMENT/PDCA",
            name: "KARINA SATIA SALIM*",
            empId: "23230114",
            type: "combined",
            part: 1,
          },
          {
            id: "mdo-2",
            code: "MDO2.0",
            title: "MANAGEMENT DEVELOPMENT/PDCA",
            name: "WAHYU KARTIKO ADI",
            empId: "23240005",
            type: "combined",
            part: 2,
            clickable: true,
            route: "/management-development",
          },
          {
            id: "mro-1",
            code: "MRO1.0",
            title: "MANAGEMENT REPRESENTATIVE",
            name: "SUGIYARTO*",
            empId: "23600041",
            clickable: true,
            route: "/management-representative",
          },
          {
            id: "cro-1",
            code: "CRO1.0",
            title: "CUSTOMER REPRESENTATIVE 2 WHEEL",
            name: "SUMIYARTO*",
            empId: "23030015",
          },
          {
            id: "co2-1",
            code: "CO2.0",
            title: "CUSTOMER REPRESENTATIVE 4 WHEEL",
            name: "DWI PURWANTO*",
            empId: "23030023",
          },
        ],
        divisions: [
          {
            id: "div-1",
            label: "CONTROLCABLE BUSINESS",
            type: "business-label",
          },
          { id: "div-2", label: "BATTERY BUSINESS", type: "business-label" },
          {
            id: "div-3",
            label: "AFTERMARKET BUSINESS",
            type: "business-label",
          },
        ],
        departments: [
          {
            id: "qa-1",
            code: "QAC1.0",
            title: "QA",
            name: "M BAGUS SANTOSO",
            empId: "23220025",
            clickable: true,
            route: "/qa-department",
          },
          {
            id: "ppic-1",
            code: "PPIC1.0",
            title: "PPC & WAREHOUSE",
            name: "DIKI WAHYUDI",
            empId: "23060056",
            clickable: true,
            route: "/ppic",
          },
          {
            id: "mkt-1",
            code: "MKT1.0",
            title: "MI & SHE (5R-SMK3-ISO 14001)",
            name: "ANDREAS AGUNG S.",
            empId: "23040119",
            clickable: true,
            route: "/marketing-engineering",
          },
          {
            id: "mkt-2",
            code: "MKT2.0",
            title: "MARKETING",
            name: "RENDRA PRAMONO",
            empId: "23200067",
            clickable: true,
            route: "/marketing-battery-engineering",
          },
          {
            id: "rnd-1",
            code: "RND1.0",
            title: "RND",
            name: "RENDRA PRAMONO",
            empId: "23200067",
          },
          {
            id: "qac-1",
            code: "QAC2.0",
            title: "QA/QC/DOC",
            name: "RENDRA PRAMONO",
            empId: "23200067",
          },
          {
            id: "mkt-3",
            code: "MKT3.0",
            title: "MARKETING",
            name: "TBR",
            empId: "",
          },
        ],
        sections: [
          {
            id: "prd-1",
            code: "PRD1.0",
            title: "CONTROLCABLE MANUFACTURE",
            name: "KARNA SATIA SALIM*",
            empId: "23230114",
            clickable: true,
            route: "/manufacturing-cable",
          },
          {
            id: "prd-2",
            code: "PRD2.0",
            title: "BATTERY PRODUCTION",
            name: "DIONISIUS AUGUSTO**",
            empId: "23220105",
            clickable: true,
            route: "/manufactur-battery",
          },
          {
            id: "prd-3",
            code: "PRD3.0",
            title: "BATTERY PME",
            name: "DIONISIUS AUGUSTO",
            empId: "23220105",
            clickable: true,
            route: "/manufactur-battery",
          },
          {
            id: "mkt-1-1",
            code: "MKT1.1",
            title: "MARKETING",
            name: "SAVITRI OCTAVIANI",
            empId: "23130254",
          },
          {
            id: "eng-1",
            code: "ENG1.0",
            title: "ENGINEERING",
            name: "SUGIYARTO",
            empId: "2360041",
          },
          {
            id: "mkt-2-1",
            code: "MKT2.1",
            title: "AUX & POWER BATTERY MARKETING",
            name: "CHRYSNA YULIAWAN**",
            empId: "23240177",
          },
          {
            id: "mkt-2-2",
            code: "MKT2.2",
            title: "ESS MARKETING",
            name: "FERDINAND STEVANUS A**",
            empId: "23220049",
          },
          {
            id: "rnd-1",
            code: "RND1.0",
            title: "AUX & POWER BATTERY ENGINEERING PRODUCT LEADER",
            name: "BRIAN BUDI SANTOSO**",
            empId: "23210077",
          },
          {
            id: "rnd-2",
            code: "RND2.0",
            title: "ESS ENGINEERING PRODUCT LEADER",
            name: "RAIHAN RAMADHAN**",
            empId: "23220104",
          },
          {
            id: "rnd-3",
            code: "RND3.0",
            title: "MICRO CONTROLLER ENGINEERING PRODUCT LEADER",
            name: "ELISABETH GUSTI**",
            empId: "23230087",
          },
          {
            id: "qac-2-1",
            code: "QAC2.1",
            title: "BATTERY QA",
            name: "BELLA TIURMA PRATIWI**",
            empId: "23230092",
          },
          {
            id: "mkt-3-1",
            code: "MKT3.1",
            title: "MARKETING",
            name: "TBR",
            empId: "",
          },
          {
            id: "hrd-1",
            code: "HRD1.0",
            title: "HRDGA & IT",
            name: "DIKI WAHYUDI*",
            empId: "23060056",
            clickable: true,
            route: "/hrga-it-department",
          },
          {
            id: "pch-1",
            code: "PCH1.0",
            title: "PURCHASING",
            name: "DIKI WAHYUDI*",
            empId: "23060056",
            clickable: true,
            route: "/purchasing",
          },
          {
            id: "fin-1",
            code: "FIN1.0",
            title: "FINANCE & ACCOUNTING",
            name: "YULIUS PERMATA",
            empId: "23220017",
            clickable: true,
            route: "/finance-department",
          },
        ],
      },
    };

    const savedData = localStorage.getItem("dashboard-organization-data");

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setOrganizationData(parsedData);

        setOriginalData(JSON.parse(JSON.stringify(parsedData)));

        console.log("✅ Loaded existing data from localStorage");
      } catch (error) {
        console.error("❌ Error parsing saved data:", error);
        localStorage.setItem(
          "dashboard-organization-data",
          JSON.stringify(initialData)
        );
        setOrganizationData(initialData);
        setOriginalData(JSON.parse(JSON.stringify(initialData)));
      }
    } else {
      localStorage.setItem(
        "dashboard-organization-data",
        JSON.stringify(initialData)
      );
      setOrganizationData(initialData);

      setOriginalData(JSON.parse(JSON.stringify(initialData)));

      console.log("✅ Created initial data");
    }
  }, []);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the SO DCI Editor.
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

  if (!organizationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization data...</p>
        </div>
      </div>
    );
  }

  const handleEdit = (category, id, field, value) => {
    setOrganizationData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));

      if (category === "header") {
        newData.header[field] = value;
      } else if (category === "commissioners") {
        if (id === "president") {
          newData.commissioners.president[field] = value;
        } else {
          const index = parseInt(id);
          newData.commissioners.commissioners[index] = value;
        }
      } else {
        const item = newData.structure[category].find((item) => item.id === id);
        if (item) {
          item[field] = value;
        }
      }

      return newData;
    });
  };

  const openSubmitModal = () => {
    setShowSubmitModal(true);
    setSubmitForm({
      title: "",
      description: "",
      priority: "medium",
      affectedSection: "departments",
    });
  };

  const submitForApproval = async () => {
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
      const humanDate = now.toLocaleDateString("en-GB");

      let baselineData = editModeStartData;

      if (!baselineData) {
        console.warn("⚠️ editModeStartData not found, trying originalData");
        baselineData = originalData;
      }

      if (!baselineData) {
        console.warn("⚠️ originalData not found, trying localStorage");
        const savedDataRaw = localStorage.getItem(
          "dashboard-organization-data"
        );
        if (savedDataRaw) {
          baselineData = JSON.parse(savedDataRaw);
        }
      }

      if (!baselineData) {
        alert(
          "❌ Error: Cannot find original data for comparison. Please refresh the page."
        );
        return;
      }

      console.log("\n🔍 SUBMIT DEBUG:");
      console.log("📊 Baseline data (BEFORE):", {
        hasBOD: !!baselineData.structure?.bod,
        hasManagement: !!baselineData.structure?.management,
        managementSample: baselineData.structure?.management?.[0],
        fullBaseline: baselineData,
      });
      console.log("📊 Current data (AFTER):", {
        hasBOD: !!organizationData.structure?.bod,
        hasManagement: !!organizationData.structure?.management,
        managementSample: organizationData.structure?.management?.[0],
        fullCurrent: organizationData,
      });

      const dataToSubmit = {
        ...organizationData,
        signatures: {
          ...organizationData.signatures,
          preparedBy: {
            ...(organizationData.signatures?.preparedBy || {}),
            date: humanDate,
            _ts: now.toISOString(),
          },
          middleBy: { ...(organizationData.signatures?.middleBy || {}) },
          approvedBy: { ...(organizationData.signatures?.approvedBy || {}) },
        },
        lastModified: now.toISOString(),
        modifiedBy: user?.name || user?.username,
      };

      const layoutData = {
        connectors,
        newBoxes,
        lastModified: new Date().toISOString(),
      };

      const requestData = {
        title: submitForm.title,
        description: submitForm.description,
        changeType: "update",
        affectedSection: submitForm.affectedSection,
        priority: submitForm.priority,
        proposedData: {
          organizationData: dataToSubmit,
          layoutData: layoutData,
        },
        currentData: {
          organizationData: baselineData,
        },
      };

      console.log("📤 Final request payload:", {
        title: requestData.title,
        hasCurrentData: !!requestData.currentData?.organizationData,
        hasProposedData: !!requestData.proposedData?.organizationData,
        currentManagement:
          requestData.currentData?.organizationData?.structure?.management,
        proposedManagement:
          requestData.proposedData?.organizationData?.structure?.management,
      });

      const response = await soChangeRequestsAPI.create(requestData);

      if (response.data.success) {
        alert("✅ Change request submitted successfully!");
        setShowSubmitModal(false);
        setSubmitForm({
          title: "",
          description: "",
          priority: "medium",
          affectedSection: "departments",
        });

        setEditModeStartData(null);
        setIsEditMode(false);

        navigate("/so-change-requests");
      }
    } catch (error) {
      console.error("❌ Error submitting change request:", error);
      alert(
        error.response?.data?.message || "Failed to submit change request."
      );
    }
  };

  const resetLayout = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all changes? This cannot be undone."
      )
    ) {
      localStorage.removeItem("dashboard-organization-data");
      window.location.reload();
    }
  };

  const ConnectorSVG = () => {
    if (!containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();

    return (
      <svg
        className="absolute top-0 left-0 pointer-events-none z-10"
        width={rect.width}
        height={rect.height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Existing connectors */}
        {connectors.map((connector) => (
          <g key={connector.id}>
            <line
              x1={connector.start.x}
              y1={connector.start.y}
              x2={connector.end.x}
              y2={connector.end.y}
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray={connector.style === "dashed" ? "5,5" : "0"}
            />
            {/* Arrow marker */}
            <polygon
              points={`${connector.end.x - 8},${connector.end.y - 4} ${connector.end.x
                },${connector.end.y} ${connector.end.x - 8},${connector.end.y + 4
                }`}
              fill="#3B82F6"
            />
            {/* Delete button for connector */}
            <circle
              cx={(connector.start.x + connector.end.x) / 2}
              cy={(connector.start.y + connector.end.y) / 2}
              r="8"
              fill="red"
              className="cursor-pointer"
              style={{ pointerEvents: "all" }}
              onClick={() => deleteConnector(connector.id)}
            />
            <text
              x={(connector.start.x + connector.end.x) / 2}
              y={(connector.start.y + connector.end.y) / 2 + 3}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              style={{ pointerEvents: "none" }}
            >
              ×
            </text>
          </g>
        ))}

        {/* Temporary connector while drawing */}
        {tempConnector && (
          <line
            x1={tempConnector.start.x}
            y1={tempConnector.start.y}
            x2={tempConnector.end.x}
            y2={tempConnector.end.y}
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="3,3"
          />
        )}
      </svg>
    );
  };

  const AddBoxPanel = () => {
    const [newBoxData, setNewBoxData] = useState({
      code: "",
      title: "",
      name: "",
      empId: "",
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      addNewBox(newBoxData);
      setNewBoxData({ code: "", title: "", name: "", empId: "" });
    };

    if (!showAddBoxPanel) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <h3 className="text-lg font-bold mb-4">Add New Box</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input
                type="text"
                value={newBoxData.code}
                onChange={(e) =>
                  setNewBoxData((prev) => ({ ...prev, code: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. NEW1.0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={newBoxData.title}
                onChange={(e) =>
                  setNewBoxData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Position Title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={newBoxData.name}
                onChange={(e) =>
                  setNewBoxData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Person Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={newBoxData.empId}
                onChange={(e) =>
                  setNewBoxData((prev) => ({ ...prev, empId: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="23XXXXXX"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowAddBoxPanel(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CustomBox = ({ box }) => {
    const [position, setPosition] = useState(box.position);
    const [isEditing, setIsEditing] = useState({});

    const updateCustomBox = (field, value) => {
      setNewBoxes((prev) =>
        prev.map((b) => (b.id === box.id ? { ...b, [field]: value } : b))
      );
      setIsEditing((prev) => ({ ...prev, [field]: false }));
    };

    const deleteCustomBox = () => {
      setNewBoxes((prev) => prev.filter((b) => b.id !== box.id));
    };

    const renderEditableField = (field, value, placeholder = "") => {
      if (isEditing[field]) {
        return (
          <input
            type="text"
            defaultValue={value}
            className="w-full px-1 py-0.5 text-xs border rounded bg-yellow-50"
            placeholder={placeholder}
            autoFocus
            onBlur={(e) => updateCustomBox(field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateCustomBox(field, e.target.value);
              } else if (e.key === "Escape") {
                setIsEditing((prev) => ({ ...prev, [field]: false }));
              }
            }}
          />
        );
      }

      return (
        <span
          onClick={() => setIsEditing((prev) => ({ ...prev, [field]: true }))}
          className="cursor-pointer hover:bg-yellow-100 rounded px-1"
        >
          {value || placeholder}
        </span>
      );
    };

    return (
      <div
        className="absolute bg-white border-2 border-purple-400 rounded shadow-lg flex min-h-[80px] w-48 z-20"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
        onDragEnd={(e) => {
          const rect = containerRef.current.getBoundingClientRect();
          const newX = e.clientX - rect.left;
          const newY = e.clientY - rect.top;
          setPosition({ x: newX, y: newY });
          setNewBoxes((prev) =>
            prev.map((b) =>
              b.id === box.id ? { ...b, position: { x: newX, y: newY } } : b
            )
          );
        }}
      >
        <div className="bg-purple-100 p-1 text-center border-r border-purple-400 w-12 flex items-center justify-center">
          <p className="text-xs font-bold">
            {renderEditableField("code", box.code, "CODE")}
          </p>
        </div>
        <div className="p-2 flex-1 text-center flex flex-col justify-center relative">
          <button
            onClick={deleteCustomBox}
            className="absolute top-0 right-0 text-red-500 hover:text-red-700 text-xs w-4 h-4 flex items-center justify-center"
          >
            ×
          </button>
          <p className="text-xs font-semibold mb-1 leading-tight">
            {renderEditableField("title", box.title, "Title")}
          </p>
          <hr className="my-1 border-gray-300" />
          <p className="text-xs leading-tight">
            {renderEditableField("name", box.name, "Name")}
          </p>
          {box.empId && (
            <p className="text-xs leading-tight">
              ({renderEditableField("empId", box.empId, "ID")})
            </p>
          )}
          <p className="text-xs text-purple-600 mt-1 font-semibold">
            Custom Box
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Toolbar */}
      <div className="bg-white shadow-sm border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">SO DCI Editor</h1>

            {/* Mode Toggle Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const newEditMode = !isEditMode;
                  setIsEditMode(newEditMode);
                  setIsDrawingMode(false);

                  if (newEditMode && organizationData) {
                    console.log("🔒 ENTERING EDIT MODE - Taking snapshot");
                    console.log(
                      "📸 Current data before edit:",
                      organizationData
                    );

                    const snapshot = JSON.parse(
                      JSON.stringify(organizationData)
                    );
                    setEditModeStartData(snapshot);

                    console.log("✅ Snapshot saved:", snapshot);
                  } else if (!newEditMode) {
                    console.log("🚪 EXITING EDIT MODE");
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${isEditMode
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
              >
                {isEditMode ? "✏️ Edit Mode" : "👁️ View Mode"}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isEditMode && (
              <button
                onClick={() => openSubmitModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
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

            <button
              onClick={() => navigate("/so-change-requests")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              View Requests
            </button>

            <button
              onClick={() => navigate("/")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Mode Instructions */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-700">
            {isEditMode && (
              <p>
                <strong>Edit Mode:</strong> Click on any text field in boxes to
                edit content directly.
              </p>
            )}
            {isDrawingMode && (
              <p>
                <strong>Connect Mode:</strong> Click on boxes to create
                connecting lines between them. Click first box to start, second
                box to finish.
              </p>
            )}
            {!isEditMode && !isDrawingMode && (
              <button
                onClick={() => navigate("/dashboard-editor-advanced")}
                className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                🚀 Try Advanced Editor Now
              </button>
            )}
          </div>
        </div>

        {/* Save confirmation */}
        {showSaveDialog && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✅ Changes saved successfully!
            </p>
            <p className="text-green-700 text-sm mt-1">
              Main Dashboard has been automatically updated with your changes
              including layout, connectors and custom boxes. Go back to
              Dashboard to see the results immediately.
            </p>
          </div>
        )}
      </div>

      {/* Main Content - Enhanced with drag & drop and connector support */}
      <div
        ref={containerRef}
        className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto relative"
        onMouseMove={handleMouseMove}
        style={{ minHeight: "800px" }}
      >
        {/* SVG Layer for Connectors */}
        <ConnectorSVG />

        {/* Custom Boxes */}
        {newBoxes.map((box) => (
          <CustomBox key={box.id} box={box} />
        ))}

        {/* Add Box Panel */}
        <AddBoxPanel />

        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="w-24 h-24 flex items-center justify-center mr-4 p-2">
              <img
                src="/logo/Logo DG New 2022.png"
                alt="Dharma Group Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">
                {isEditMode ? (
                  <input
                    type="text"
                    value={organizationData.header.title}
                    onChange={(e) =>
                      handleEdit("header", null, "title", e.target.value)
                    }
                    className="bg-yellow-50 border rounded px-2 py-1"
                  />
                ) : (
                  organizationData.header.title
                )}
              </h1>
              <h2 className="text-lg font-semibold text-gray-700">
                {isEditMode ? (
                  <input
                    type="text"
                    value={organizationData.header.company}
                    onChange={(e) =>
                      handleEdit("header", null, "company", e.target.value)
                    }
                    className="bg-yellow-50 border rounded px-2 py-1"
                  />
                ) : (
                  organizationData.header.company
                )}
              </h2>
              <p className="text-sm text-gray-500">
                Effective Date:{" "}
                {organizationData?.signatures?.approvedBy?.date ||
                  organizationData?.header?.effectiveDate ||
                  "Waiting Final Approval"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="grid grid-cols-3 gap-4 border border-gray-400 p-4 bg-white">
              {/* Prepared By */}
              <div className="text-center border-r border-gray-400 pr-4">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">
                  Prepared By :
                </p>
                <div className="border-b border-gray-300 mx-auto w-20 mb-16"></div>
                <p className="text-xs font-semibold underline mb-1">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={
                        organizationData.signatures?.preparedBy?.name ||
                        "Diki Wahyudi"
                      }
                      onChange={(e) => {
                        setOrganizationData((prev) => ({
                          ...prev,
                          signatures: {
                            ...prev.signatures,
                            preparedBy: {
                              ...prev.signatures?.preparedBy,
                              name: e.target.value,
                            },
                          },
                        }));
                      }}
                      className="bg-yellow-50 border rounded px-2 py-1 text-xs text-center w-full"
                    />
                  ) : (
                    organizationData.signatures?.preparedBy?.name ||
                    "Diki Wahyudi"
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  Prep Date :{" "}
                  <span className="font-semibold text-gray-700">
                    {organizationData.signatures?.preparedBy?.date ||
                      "Auto on submit"}
                  </span>
                </p>
              </div>

              {/* Middle - Bambang Wuryanto */}
              <div className="text-center border-r border-gray-400 pr-4">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">
                  Approved By :
                </p>
                <div className="border-b border-gray-300 mx-auto w-20 mb-16"></div>
                <p className="text-xs font-semibold underline mb-1">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={
                        organizationData.signatures?.middleBy?.name ||
                        "Bambang Wuryanto"
                      }
                      onChange={(e) => {
                        setOrganizationData((prev) => ({
                          ...prev,
                          signatures: {
                            ...prev.signatures,
                            middleBy: {
                              ...prev.signatures?.middleBy,
                              name: e.target.value,
                            },
                          },
                        }));
                      }}
                      className="bg-yellow-50 border rounded px-2 py-1 text-xs text-center w-full"
                    />
                  ) : (
                    organizationData.signatures?.middleBy?.name ||
                    "Bambang Wuryanto"
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  Prepared Date :{" "}
                  <span className="font-semibold text-gray-700">
                    {organizationData.signatures?.middleBy?.date ||
                      "Pending first approval"}
                  </span>
                </p>
              </div>

              {/* Approved By */}
              <div className="text-center">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">
                  Approved By :
                </p>
                <div className="border-b border-gray-300 mx-auto w-20 mb-16"></div>
                <p className="text-xs font-semibold underline mb-1">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={
                        organizationData.signatures?.approvedBy?.name ||
                        "Eko Maryanto"
                      }
                      onChange={(e) => {
                        setOrganizationData((prev) => ({
                          ...prev,
                          signatures: {
                            ...prev.signatures,
                            approvedBy: {
                              ...prev.signatures?.approvedBy,
                              name: e.target.value,
                            },
                          },
                        }));
                      }}
                      className="bg-yellow-50 border rounded px-2 py-1 text-xs text-center w-full"
                    />
                  ) : (
                    organizationData.signatures?.approvedBy?.name ||
                    "Eko Maryanto"
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  Prepared Date :{" "}
                  <span className="font-semibold text-gray-700">
                    {organizationData.signatures?.approvedBy?.date ||
                      "Pending final approval"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Board of Commissioners */}
        <div className="mb-8">
          <div className="bg-blue-300 p-4 rounded text-center max-w-md mx-auto mb-6">
            <h3 className="font-bold text-sm text-white">
              BOARD OF COMMISSIONERS
            </h3>
          </div>

          <div className="flex justify-center gap-6 mb-6">
            <div className="bg-white border border-gray-400 rounded shadow-sm w-48 text-center min-h-[100px]">
              <div className="p-2 bg-gray-100 border-b border-gray-300">
                <p className="text-sm font-semibold">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={organizationData.commissioners.president.title}
                      onChange={(e) =>
                        handleEdit(
                          "commissioners",
                          "president",
                          "title",
                          e.target.value
                        )
                      }
                      className="bg-yellow-50 border rounded px-2 py-1 w-full text-sm"
                    />
                  ) : (
                    organizationData.commissioners.president.title
                  )}
                </p>
              </div>
              <div className="p-4 flex items-center justify-center h-16">
                <p className="text-xs font-medium">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={organizationData.commissioners.president.name}
                      onChange={(e) =>
                        handleEdit(
                          "commissioners",
                          "president",
                          "name",
                          e.target.value
                        )
                      }
                      className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                    />
                  ) : (
                    organizationData.commissioners.president.name
                  )}
                </p>
              </div>
            </div>
            <div className="bg-white border border-gray-400 p-4 rounded shadow-sm w-48 text-center min-h-[100px] flex flex-col justify-center">
              <p className="text-sm font-semibold mb-3">COMMISSIONERS</p>
              {organizationData.commissioners.commissioners.map(
                (name, index) => (
                  <React.Fragment key={index}>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-xs mb-1">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={name}
                          onChange={(e) =>
                            handleEdit(
                              "commissioners",
                              index.toString(),
                              null,
                              e.target.value
                            )
                          }
                          className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                        />
                      ) : (
                        name
                      )}
                    </p>
                  </React.Fragment>
                )
              )}
            </div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="mb-6">
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-blue-300 p-3 rounded text-center">
              <h3 className="font-bold text-xs text-white">
                BOARD OF DIRECTOR
              </h3>
            </div>
            <div className="p-3 rounded text-center">
              <h3 className="font-bold text-xs text-transparent">&nbsp;</h3>
            </div>
            <div className="bg-blue-300 p-3 rounded text-center">
              <h3 className="font-bold text-xs text-white">DIVISION HEAD</h3>
            </div>
            <div className="bg-blue-300 p-3 rounded text-center">
              <h3 className="font-bold text-xs text-white">DEPARTMENT HEAD</h3>
            </div>
            <div className="bg-blue-300 p-3 rounded text-center">
              <h3 className="font-bold text-xs text-white leading-tight">
                SECTION HEAD / ENGINEERING PRODUCT LEADER
              </h3>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-5 gap-4">
            {/* Column 1 - Board of Directors */}
            <div className="space-y-3">
              {organizationData.structure.bod.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] ${isEditMode ? "ring-2 ring-blue-200" : ""
                    } ${item.clickable && !isEditMode
                      ? "cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                      : ""
                    }`}
                  onClick={() => {
                    if (item.clickable && item.route && !isEditMode) {
                      navigate(item.route);
                    }
                  }}
                >
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                    <p className="text-xs font-bold">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.code}
                          onChange={(e) =>
                            handleEdit("bod", item.id, "code", e.target.value)
                          }
                          className="bg-yellow-50 border rounded px-1 w-10 text-xs"
                        />
                      ) : (
                        item.code
                      )}
                    </p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-1 leading-tight">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            handleEdit("bod", item.id, "title", e.target.value)
                          }
                          className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                        />
                      ) : (
                        item.title
                      )}
                    </p>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-xs leading-tight">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            handleEdit("bod", item.id, "name", e.target.value)
                          }
                          className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                        />
                      ) : (
                        item.name
                      )}
                    </p>
                    <p className="text-xs leading-tight">
                      (
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.empId}
                          onChange={(e) =>
                            handleEdit("bod", item.id, "empId", e.target.value)
                          }
                          className="bg-yellow-50 border rounded px-1 w-16 text-xs"
                        />
                      ) : (
                        item.empId
                      )}
                      )
                    </p>
                    {item.clickable && !isEditMode && (
                      <p className="text-xs text-blue-600 mt-1 font-semibold">
                        Click to view details →
                      </p>
                    )}
                    {isEditMode && (
                      <p className="text-xs text-gray-500 mt-1">
                        Click Fields to edit
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 - Management Functions */}
            <div className="space-y-4">
              <div className="min-h-[180px]"></div>
              {organizationData.structure.management.map((item) => {
                if (item.code === "MDO1.0") {
                  const mdo2 = organizationData.structure.management.find(
                    (m) => m.code === "MDO2.0"
                  );
                  return (
                    <div
                      key="mdo-combined"
                      className={`bg-white border border-gray-400 rounded shadow-sm min-h-[170px] ${isEditMode ? "ring-2 ring-blue-200" : ""
                        } ${mdo2?.clickable && !isEditMode
                          ? "cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                          : ""
                        }`}
                      onClick={() => {
                        if (mdo2?.clickable && mdo2?.route && !isEditMode) {
                          navigate(mdo2.route);
                        }
                      }}
                    >
                      <div className="flex flex-col h-full">
                        {/* Header row */}
                        <div className="flex border-b border-gray-300">
                          <div className="p-2 flex-1 text-center bg-gray-100">
                            <p className="text-xs font-semibold leading-tight">
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) =>
                                    handleEdit("management", item.id, "title", e.target.value)
                                  }
                                  className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs text-center"
                                />
                              ) : (
                                item.title
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex border-b border-gray-300 flex-1">
                          <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                            <p className="text-xs font-bold">
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={item.code}
                                  onChange={(e) =>
                                    handleEdit(
                                      "management",
                                      item.id,
                                      "code",
                                      e.target.value
                                    )
                                  }
                                  className="bg-yellow-50 border rounded px-1 w-12 text-xs"
                                />
                              ) : (
                                item.code
                              )}
                            </p>
                          </div>
                          <div className="p-3 flex-1 text-center flex flex-col justify-center">
                            <p className="text-xs leading-tight">
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) =>
                                    handleEdit(
                                      "management",
                                      item.id,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                                />
                              ) : (
                                item.name
                              )}
                            </p>
                            <p className="text-xs leading-tight">
                              (
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={item.empId}
                                  onChange={(e) =>
                                    handleEdit(
                                      "management",
                                      item.id,
                                      "empId",
                                      e.target.value
                                    )
                                  }
                                  className="bg-yellow-50 border rounded px-1 w-16 text-xs"
                                />
                              ) : (
                                item.empId
                              )}
                              )
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-1">
                          <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                            <p className="text-xs font-bold">
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={mdo2?.code}
                                  onChange={(e) =>
                                    handleEdit(
                                      "management",
                                      mdo2?.id,
                                      "code",
                                      e.target.value
                                    )
                                  }
                                  className="bg-yellow-50 border rounded px-1 w-12 text-xs"
                                />
                              ) : (
                                mdo2?.code
                              )}
                            </p>
                          </div>
                          <div className="p-3 flex-1 text-center flex flex-col justify-center">
                            <p className="text-xs leading-tight">
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={mdo2?.name}
                                  onChange={(e) =>
                                    handleEdit(
                                      "management",
                                      mdo2?.id,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                                />
                              ) : (
                                mdo2?.name
                              )}
                            </p>
                            <p className="text-xs leading-tight">
                              (
                              {isEditMode ? (
                                <input
                                  type="text"
                                  value={mdo2?.empId}
                                  onChange={(e) =>
                                    handleEdit(
                                      "management",
                                      mdo2?.id,
                                      "empId",
                                      e.target.value
                                    )
                                  }
                                  className="bg-yellow-50 border rounded px-1 w-16 text-xs"
                                />
                              ) : (
                                mdo2?.empId
                              )}
                              )
                            </p>
                            {mdo2?.clickable && !isEditMode && (
                              <p className="text-xs text-blue-600 mt-1 font-semibold">
                                Click to view details →
                              </p>
                            )}
                            {isEditMode && (
                              <p className="text-xs text-gray-500 mt-1">
                                Click fields to edit
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else if (item.code === "MDO2.0") {
                  return null;
                } else {
                  return (
                    <div
                      key={item.id}
                      className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] ${isEditMode ? "ring-2 ring-blue-200" : ""
                        } ${item.clickable && !isEditMode
                          ? "cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                          : ""
                        }`}
                      onClick={() => {
                        if (item.clickable && item.route && !isEditMode) {
                          navigate(item.route);
                        }
                      }}
                    >
                      <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                        <p className="text-xs font-bold">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.code}
                              onChange={(e) =>
                                handleEdit(
                                  "management",
                                  item.id,
                                  "code",
                                  e.target.value
                                )
                              }
                              className="bg-yellow-50 border rounded px-1 w-10 text-xs"
                            />
                          ) : (
                            item.code
                          )}
                        </p>
                      </div>
                      <div className="p-2 flex-1 text-center flex flex-col justify-center">
                        <p className="text-xs font-semibold mb-1 leading-tight">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                handleEdit(
                                  "management",
                                  item.id,
                                  "title",
                                  e.target.value
                                )
                              }
                              className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                            />
                          ) : (
                            item.title
                          )}
                        </p>
                        <hr className="my-1 border-gray-300" />
                        <p className="text-xs leading-tight">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                handleEdit(
                                  "management",
                                  item.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                            />
                          ) : (
                            item.name
                          )}
                        </p>
                        <p className="text-xs leading-tight">
                          (
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.empId}
                              onChange={(e) =>
                                handleEdit(
                                  "management",
                                  item.id,
                                  "empId",
                                  e.target.value
                                )
                              }
                              className="bg-yellow-50 border rounded px-1 w-16 text-xs"
                            />
                          ) : (
                            item.empId
                          )}
                          )
                        </p>
                        {item.clickable && !isEditMode && (
                          <p className="text-xs text-blue-600 mt-1 font-semibold">
                            Click to view details →
                          </p>
                        )}
                        {isEditMode && (
                          <p className="text-xs text-gray-500 mt-1">
                            Click fields to edit
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
              })}
            </div>

            {/* Column 3 - Division Head (Business Labels) */}
            <div className="space-y-3">
              <div className="min-h-[110px]"></div>
              <div className="min-h-[120px]"></div>
              <div className="min-h-[200px]"></div>
              <div className="min-h-[120px]"></div>
              <div className="min-h-[130px]"></div>

              {organizationData.structure.divisions.map((div, index) => (
                <React.Fragment key={div.id}>
                  {index > 0 && (
                    <div
                      className={
                        index === 1 ? "min-h-[100px]" : "min-h-[570px]"
                      }
                    ></div>
                  )}
                  <div
                    className={`bg-gray-200 p-3 rounded text-center font-bold text-xs min-h-${index === 0 ? "[100px]" : "[80px]"
                      } flex items-center justify-center ${isEditMode ? "ring-2 ring-blue-200" : ""
                      }`}
                  >
                    <span className="leading-tight">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={div.label}
                          onChange={(e) =>
                            handleEdit(
                              "divisions",
                              div.id,
                              "label",
                              e.target.value
                            )
                          }
                          className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs text-center"
                        />
                      ) : (
                        div.label
                      )}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 4 - Department Head */}
            <div className="space-y-3">
              <div className="min-h-[110px]"></div>
              <div className="min-h-[150px]"></div>
              <div className="min-h-[190px]"></div>

              {organizationData.structure.departments.map((item, index) => (
                <div
                  className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] ${isEditMode ? "ring-2 ring-blue-200" : ""
                    } ${item.clickable && !isEditMode
                      ? "cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                      : ""
                    }`}
                  onClick={() => {
                    if (item.clickable && item.route && !isEditMode) {
                      navigate(item.route);
                    }
                  }}
                >
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                    <p className="text-xs font-bold">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.code}
                          onChange={(e) =>
                            handleEdit(
                              "departments",
                              item.id,
                              "code",
                              e.target.value
                            )
                          }
                          className="bg-yellow-50 border rounded px-1 w-10 text-xs"
                        />
                      ) : (
                        item.code
                      )}
                    </p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-1 leading-tight">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            handleEdit(
                              "departments",
                              item.id,
                              "title",
                              e.target.value
                            )
                          }
                          className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                        />
                      ) : (
                        item.title
                      )}
                    </p>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-xs leading-tight">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            handleEdit(
                              "departments",
                              item.id,
                              "name",
                              e.target.value
                            )
                          }
                          className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                        />
                      ) : (
                        item.name
                      )}
                    </p>
                    <p className="text-xs leading-tight">
                      (
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.empId}
                          onChange={(e) =>
                            handleEdit(
                              "departments",
                              item.id,
                              "empId",
                              e.target.value
                            )
                          }
                          className="bg-yellow-50 border rounded px-1 w-16 text-xs"
                        />
                      ) : (
                        item.empId
                      )}
                      )
                    </p>
                    {item.clickable && !isEditMode && (
                      <p className="text-xs text-blue-600 mt-1 font-semibold">
                        Click to view details →
                      </p>
                    )}
                    {isEditMode && (
                      <p className="text-xs text-gray-500 mt-1">
                        Click fields to edit
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Column 5 - Section Head / Engineering Product Leader */}
            <div className="space-y-3">
              {organizationData.structure.sections.map((item, index) => (
                <div
                  className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] ${isEditMode ? "ring-2 ring-blue-200" : ""
                    } ${item.clickable && !isEditMode
                      ? "cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                      : ""
                    }`}
                  onClick={() => {
                    if (item.clickable && item.route && !isEditMode) {
                      navigate(item.route);
                    }
                  }}
                >
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                    <p className="text-xs font-bold">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.code}
                          onChange={(e) =>
                            handleEdit(
                              "sections",
                              item.id,
                              "code",
                              e.target.value
                            )
                          }
                          className="bg-yellow-50 border rounded px-1 w-10 text-xs"
                        />
                      ) : (
                        item.code
                      )}
                    </p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-1 leading-tight">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            handleEdit(
                              "sections",
                              item.id,
                              "title",
                              e.target.value
                            )
                          }
                          className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                        />
                      ) : (
                        item.title
                      )}
                    </p>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-xs leading-tight">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            handleEdit(
                              "sections",
                              item.id,
                              "name",
                              e.target.value
                            )
                          }
                          className="bg-yellow-50 border rounded px-2 py-1 w-full text-xs"
                        />
                      ) : (
                        item.name
                      )}
                    </p>
                    <p className="text-xs leading-tight">
                      (
                      {isEditMode ? (
                        <input
                          type="text"
                          value={item.empId}
                          onChange={(e) =>
                            handleEdit(
                              "sections",
                              item.id,
                              "empId",
                              e.target.value
                            )
                          }
                          className="bg-yellow-50 border rounded px-1 w-16 text-xs"
                        />
                      ) : (
                        item.empId
                      )}
                      )
                    </p>
                    {item.clickable && !isEditMode && (
                      <p className="text-xs text-blue-600 mt-1 font-semibold">
                        Click to view details →
                      </p>
                    )}
                    {isEditMode && (
                      <p className="text-xs text-gray-500 mt-1">
                        Click fields to edit
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-400 max-w-sm">
          <h4 className="font-bold text-sm mb-2">NOTE:</h4>
          <div className="text-xs space-y-1">
            <p>
              <span className="font-bold">*</span> CONCURE
            </p>
            <p>
              <span className="font-bold">**</span> ACTING
            </p>
            <p>
              <span className="font-bold">(INC.)</span> INCUMBENT
            </p>
            <p>
              <span className="font-bold">TBR</span> TO BE RECRUIT
            </p>
            <p>
              <span className="font-bold">TBD</span> TO BE DEVELOP
            </p>
          </div>
        </div>
      </div>

      {/* Submit for Approval Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Submit SO Changes for Approval
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Affected Section
                  </label>
                  <select
                    value={submitForm.affectedSection}
                    onChange={(e) =>
                      setSubmitForm({
                        ...submitForm,
                        affectedSection: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="departments">Departments</option>
                    <option value="sections">Sections</option>
                    <option value="divisions">Divisions</option>
                    <option value="management">Management</option>
                    <option value="bod">Board of Directors</option>
                    <option value="commissioners">Commissioners</option>
                    <option value="header">Header Info</option>
                    <option value="signatures">Signatures</option>
                  </select>
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
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
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
                      in the dashboard until approved by a Director & President
                      Director.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
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
      )}
    </div>
  );
};

export default DashboardEditor;
