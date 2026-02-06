import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import JobdescViewer from "../components/JobdescViewer";
import "../assets/print-styles.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organizationData, setOrganizationData] = useState(null);
  const [customLayout, setCustomLayout] = useState({
    connectors: [],
    newBoxes: [],
  });
  const containerRef = useRef(null);

  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobdescData, setJobdescData] = useState(null);
  const [loadingJobdesc, setLoadingJobdesc] = useState(false);
  const [employeeJobdescStatus, setEmployeeJobdescStatus] = useState({});

  const onCodeClick = async (item) => {
    setSelectedJob(item);
    setShowJobModal(true);
    setLoadingJobdesc(true);
    setJobdescData(null);

    try {
      console.log("🔍 Searching job description for:", {
        name: item.name,
        empId: item.empId,
        title: item.title,
      });

      const response = await fetch(
        `http://localhost:3001/api/jobdescriptions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("📦 API Response structure:", {
          hasData: !!result.data,
          isArray: Array.isArray(result.data),
          dataLength: result.data?.length,
        });

        const allJobdescs = result.data || result;
        console.log("📋 Total Job Descriptions:", allJobdescs.length);
        console.log(
          "📋 All Job Descriptions:",
          allJobdescs.map((jd) => ({
            memberName: jd.memberName,
            memberNoPNK: jd.memberNoPNK,
            positionTitle: jd.positionTitle,
          }))
        );

        const foundJobdesc = allJobdescs.find((jd) => {
          const jdName = (jd.memberName || "").trim().toUpperCase();
          const jdNoPNK = (jd.memberNoPNK || "").trim();
          const itemName = (item.name || "").trim().toUpperCase();
          const itemEmpId = (item.empId || "").trim();

          console.log("🔄 Comparing:", {
            jdName,
            jdNoPNK,
            itemName,
            itemEmpId,
            nameMatch: jdName === itemName,
            empIdMatch: jdNoPNK === itemEmpId,
          });

          if (itemEmpId && jdNoPNK && jdNoPNK === itemEmpId) {
            console.log("✅ MATCH by empId!", jdNoPNK);
            return true;
          }

          if (jdName && itemName && jdName === itemName) {
            console.log("✅ MATCH by exact name!", jdName);
            return true;
          }

          if (
            jdName &&
            itemName &&
            (jdName.includes(itemName) || itemName.includes(jdName))
          ) {
            console.log("⚠️ PARTIAL MATCH by name!", { jdName, itemName });
            return true;
          }

          return false;
        });

        if (foundJobdesc) {
          console.log("✅ Job description found:", {
            memberName: foundJobdesc.memberName,
            memberNoPNK: foundJobdesc.memberNoPNK,
            positionTitle: foundJobdesc.positionTitle,
          });
          setJobdescData(foundJobdesc);
        } else {
          console.log("❌ No job description found for:", item.name);
          console.log(
            "💡 Available job descriptions:",
            allJobdescs.map((jd) => `${jd.memberName} (${jd.memberNoPNK})`)
          );
        }
      } else {
        console.error("❌ API response not ok:", response.status);
      }
    } catch (error) {
      console.error("❌ Error fetching job description:", error);
    } finally {
      setLoadingJobdesc(false);
    }
  };

  const checkAllEmployeeJobdescStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/jobdescriptions`,
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
          const memberName = (jd.memberName || "").trim().toUpperCase();

          if (jdNoPNK) statusMap[jdNoPNK] = true;
          if (memberName) statusMap[memberName] = true;
        })
        setEmployeeJobdescStatus(statusMap);
        console.log("✅ Employee jobdesc status:", statusMap);
      }
    } catch (error) {
      console.error("❌ Error fetching employee jobdesc status:", error);
    }
  };

  const canPrint = user?.role?.permissions?.includes("Print SO") || false;

  const routePermissionMap = {
    "/mi-she": "View MI & SHE SO",
    "/management-development": "View Management Dev SO",
    "/management-representative": "View Management Rep SO",
    "/qa-department": "View QA SO",
    "/ppic": "View PPIC SO",
    "/marketing-engineering": "View Marketing Engineering SO",
    "/marketing-battery-department": "View Marketing Battery SO",
    "/manufacturing-cable": "View Manufacturing Cable SO",
    "/manufactur-battery": "View Manufacturing Battery SO",
    "/hrga-it-department": "View HRGA & IT SO",
    "/purchasing": "View Purchasing SO",
    "/finance-department": "View Finance SO",
  };

  const canViewDepartmentSO = (route) => {
    if (!route) return false;

    const userPermissions = user?.role?.permissions || [];

    if (userPermissions.includes("View All SO Details")) {
      return true;
    }

    const requiredPermission = routePermissionMap[route];
    if (requiredPermission && userPermissions.includes(requiredPermission)) {
      return true;
    }

    return false;
  };

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
        preparedBy: {
          name: "Diki Wahyudi",
          date: "08/09/2025",
        },
        middleBy: {
          title: "Bambang Wuryanto",
          name: "Bambang Wuryanto",
          date: "08/09/2025",
        },
        approvedBy: {
          name: "Eko Maryanto",
          date: "08/09/2025",
        },
      },
      commissioners: {
        president: {
          title: "PRESIDENT COMMISIONER",
          name: "IRIANTO SANTOSO",
        },
        commissioners: ["SUBAGIO", "HONG KUO MING", "LIAO CHIN HSIEN"],
      },
      structure: {
        // Board of Directors - Column 1
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
        // Management Functions - Column 2
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
        // Division Labels - Column 3
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
        // Department Head - Column 4
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
            id: "mkt-eng",
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
            route: "/marketing-battery-department",
          },
          {
            id: "rnd-1",
            code: "RND1.0",
            title: "RND",
            name: "RENDRA PRAMONO",
            empId: "23200067",
          },
          {
            id: "qac-2",
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
        // Section Head / Engineering Product Leader - Column 5
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
            name: "DIONISIUS AUGUSTO**",
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
            id: "rnd-1-0",
            code: "RND1.0",
            title: "AUX & POWER BATTERY ENGINEERING PRODUCT LEADER",
            name: "BRIAN BUDI SANTOSO**",
            empId: "23210077",
          },
          {
            id: "rnd-2-0",
            code: "RND2.0",
            title: "ESS ENGINEERING PRODUCT LEADER",
            name: "RAIHAN RAMADHAN**",
            empId: "23220104",
          },
          {
            id: "rnd-3-0",
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
      } catch (error) {
        console.error("Error parsing saved data:", error);
        setOrganizationData(initialData);
      }
    } else {
      setOrganizationData(initialData);
    }

    const savedLayout = localStorage.getItem("dashboard-editor-layout");
    if (savedLayout) {
      try {
        setCustomLayout(JSON.parse(savedLayout));
      } catch (error) {
        console.error("Error parsing layout data:", error);
      }
    }

    const handleStorageChange = (e) => {
      if (e.key === "dashboard-organization-data" && e.newValue) {
        try {
          const updatedData = JSON.parse(e.newValue);
          setOrganizationData(updatedData);
        } catch (error) {
          console.error("Error parsing updated data:", error);
        }
      }
      if (e.key === "dashboard-editor-layout" && e.newValue) {
        try {
          setCustomLayout(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing layout data:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const handleCustomUpdate = (e) => {
      setOrganizationData(e.detail);
    };

    window.addEventListener("dashboard-data-updated", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("dashboard-data-updated", handleCustomUpdate);
    };

  }, []);

  useEffect(() => {
    if (organizationData) {
      checkAllEmployeeJobdescStatus();
    }
  }, [organizationData]);

  const renderCodeButton = (item) => {
    if (!item.empId) {
      return <p className="text-xs font-bold">{item.code}</p>;
    }

    const empId = (item.empId || "").trim();
    const itemName = (item.name || "").trim().toUpperCase();
    const hasJobdesc = employeeJobdescStatus[empId] || employeeJobdescStatus[itemName];

    const buttonColor = hasJobdesc
      ? "text-blue-600 hover:bg-blue-50"
      : "text-red-600 hover:bg-red-50";

    return (
      <button
        className={`text-xs font-bold hover:underline focus:outline-none uppercase px-2 py-1 rounded transition-colors ${buttonColor}`}
        onClick={(e) => {
          e.stopPropagation();
          onCodeClick(item);
        }}
        title={hasJobdesc ? "Klik untuk melihat job description" : "Belum memiliki job description"}
      >
        {item.code}
      </button>
    );
  };

  const handlePrint = () => {
    const printContainer = document.querySelector(".dashboard-print-container");
    if (!printContainer) return;

    const oldStyle = document.getElementById("dynamic-print-style");
    if (oldStyle) oldStyle.remove();

    const printStyle = document.createElement("style");
    printStyle.id = "dynamic-print-style";
    printStyle.innerHTML = `
    @media print {
      @page {
        size: A3 portrait;
        margin: 0;
      }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        height: 100% !important;
        overflow: hidden !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body::before, body::after {
        display: none !important;
        content: none !important;
      }

      .no-print, nav, .menu, .sidebar, button, header, footer, .click-button {
        display: none !important;
        visibility: hidden !important;
      }

      *::-webkit-scrollbar { display: none !important; }
      * { scrollbar-width: none !important; -ms-overflow-style: none !important; }

      .dashboard-print-container {
        overflow: visible !important;
        max-width: none !important;
        width: 100% !important;
        transform: scale(0.70) !important;
        transform-origin: top center !important;
        margin: 25mm auto 0 auto !important;
        background: white !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        padding: 5px !important;
        page-break-inside: avoid !important;
      }

      .dashboard-print-container * {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        overflow: visible !important;
      }

      /* Optimasi ukuran font untuk print */
      .dashboard-print-container .text-xs {
        font-size: 8px !important;
        line-height: 1.2 !important;
      }

      .dashboard-print-container .text-sm {
        font-size: 9px !important;
        line-height: 1.2 !important;
      }

      .dashboard-print-container .text-lg {
        font-size: 11.5px !important;
        line-height: 1.25 !important;
      }

      .dashboard-print-container .text-xl {
        font-size: 13.5px !important;
        line-height: 1.25 !important;
      }

      /* Kurangi spacing untuk hemat ruang */
      .dashboard-print-container .space-y-3 > * + * {
        margin-top: 0.3rem !important;
      }

      .dashboard-print-container .space-y-4 > * + * {
        margin-top: 0.45rem !important;
      }

      .dashboard-print-container .gap-4 {
        gap: 0.45rem !important;
      }

      .dashboard-print-container .gap-6 {
        gap: 0.65rem !important;
      }

      .dashboard-print-container .mb-4 {
        margin-bottom: 0.55rem !important;
      }

      .dashboard-print-container .mb-6 {
        margin-bottom: 0.75rem !important;
      }

      .dashboard-print-container .mb-8 {
        margin-bottom: 0.95rem !important;
      }

      .dashboard-print-container .p-2 {
        padding: 0.3rem !important;
      }

      .dashboard-print-container .p-3 {
        padding: 0.4rem !important;
      }

      .dashboard-print-container .p-4 {
        padding: 0.5rem !important;
      }

      .dashboard-print-container .p-6 {
        padding: 0.65rem !important;
      }

      /* Kurangi min-height untuk compact layout */
      .dashboard-print-container .min-h-\\[80px\\] {
        min-height: 58px !important;
      }

      .dashboard-print-container .min-h-\\[100px\\] {
        min-height: 72px !important;
      }

      .dashboard-print-container .min-h-\\[110px\\] {
        min-height: 78px !important;
      }

      .dashboard-print-container .min-h-\\[120px\\] {
        min-height: 86px !important;
      }

      .dashboard-print-container .min-h-\\[130px\\] {
        min-height: 95px !important;
      }

      .dashboard-print-container .min-h-\\[150px\\] {
        min-height: 110px !important;
      }

      .dashboard-print-container .min-h-\\[170px\\] {
        min-height: 125px !important;
      }

      .dashboard-print-container .min-h-\\[180px\\] {
        min-height: 135px !important;
      }

      .dashboard-print-container .min-h-\\[190px\\] {
        min-height: 140px !important;
      }

      .dashboard-print-container .min-h-\\[200px\\] {
        min-height: 145px !important;
      }

      .dashboard-print-container .min-h-\\[250px\\] {
        min-height: 185px !important;
      }

      .dashboard-print-container .min-h-\\[435px\\] {
        min-height: 320px !important;
      }

      .dashboard-print-container .min-h-\\[570px\\] {
        min-height: 420px !important;
      }
    }
  `;
    document.head.appendChild(printStyle);

    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Loading state
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

  return (
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

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center">
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
                {organizationData.header.title}
              </h1>
              <h2 className="text-lg font-semibold text-gray-700">
                {organizationData.header.company}
              </h2>
              <p className="text-sm text-gray-500">
                Effective Date:{" "}
                {organizationData?.header?.effectiveDate ||
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
                  {organizationData.signatures?.preparedBy?.name ||
                    "Diki Wahyudi"}
                </p>
                <p className="text-xs text-gray-500">
                  Prep Date:{" "}
                  {organizationData?.signatures?.preparedBy?.date || "Pending"}
                </p>
              </div>

              {/* Middle - Bambang Wuryanto */}
              <div className="text-center border-r border-gray-400 pr-4">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">
                  Approved By:
                </p>
                <div className="border-b border-gray-300 mx-auto w-20 mb-16"></div>
                <p className="text-xs font-semibold underline mb-1">
                  {organizationData.signatures?.middleBy?.name ||
                    "Bambang Wuryanto"}
                </p>
                <p className="text-xs text-gray-500">
                  Prepared Date:{" "}
                  {organizationData?.signatures?.middleBy?.date || "Pending"}
                </p>
              </div>

              {/* Approved By */}
              <div className="text-center">
                <p className="text-xs font-bold border-b border-gray-400 pb-1 mb-2">
                  Approved By :
                </p>
                <div className="border-b border-gray-300 mx-auto w-20 mb-16"></div>
                <p className="text-xs font-semibold underline mb-1">
                  {organizationData.signatures?.approvedBy?.name ||
                    "Eko Maryanto"}
                </p>
                <p className="text-xs text-gray-500">
                  Prepared Date:{" "}
                  {organizationData?.signatures?.approvedBy?.date || "Pending"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Button - Only show if user has permission */}
        {canPrint && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handlePrint}
              className="no-print bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
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
                  strokeWidth="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print A3
            </button>
          </div>
        )}
      </div>

      {/* Organization Chart */}
      <div
        className="dashboard-print-container bg-white rounded-lg shadow-sm p-6 overflow-x-auto"
        ref={containerRef}
      >
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
                  {organizationData.commissioners?.president?.title ||
                    "PRESIDENT COMMISIONER"}
                </p>
              </div>
              <div className="p-4 flex items-center justify-center h-16">
                <p className="text-xs font-medium">
                  {organizationData.commissioners?.president?.name ||
                    "IRIANTO SANTOSO"}
                </p>
              </div>
            </div>
            <div className="bg-white border border-gray-400 p-4 rounded shadow-sm w-48 text-center min-h-[100px] flex flex-col justify-center">
              <p className="text-sm font-semibold mb-3">COMMISSIONERS</p>
              {organizationData.commissioners?.commissioners?.map(
                (name, index) => (
                  <React.Fragment key={index}>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-xs mb-1">{name}</p>
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

        {/* Main Content Grid - 5 Columns - COMPLETE DYNAMIC STRUCTURE */}
        <div className="mb-6">
          <div className="grid grid-cols-5 gap-4">
            {/* Column 1 - Board of Directors */}
            <div className="space-y-3">
              {organizationData.structure?.bod?.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px]"
                >
                  <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                    <p className="text-xs font-bold">{item.code}</p>
                  </div>
                  <div className="p-2 flex-1 text-center flex flex-col justify-center">
                    <p className="text-xs font-semibold mb-1 leading-tight">
                      {item.title}
                    </p>
                    <hr className="my-1 border-gray-300" />
                    <p className="text-xs leading-tight">{item.name}</p>
                    <p className="text-xs leading-tight">({item.empId})</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 - Management Functions */}
            <div className="space-y-4">
              <div className="min-h-[180px]"></div>

              {/* Management items with special handling for combined MDO */}
              {organizationData.structure?.management?.map((item) => {
                if (item.code === "MDO1.0") {
                  // Combined MDO box
                  const mdo2 = organizationData.structure.management.find(
                    (m) => m.code === "MDO2.0"
                  );
                  return (
                    <div
                      key="mdo-combined"
                      className={`bg-white border border-gray-400 rounded shadow-sm min-h-[170px] ${mdo2?.clickable && canViewDepartmentSO(mdo2?.route)
                        ? "cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                        : ""
                        }`}
                      onClick={() => {
                        if (
                          mdo2?.clickable &&
                          mdo2?.route &&
                          canViewDepartmentSO(mdo2?.route)
                        ) {
                          navigate(mdo2.route);
                        }
                      }}
                    >
                      <div className="flex flex-col h-full">
                        {/* Header row */}
                        <div className="flex border-b border-gray-300">
                          <div className="p-2 flex-1 text-center bg-gray-100">
                            <p className="text-xs font-semibold leading-tight">
                              {item.title}
                            </p>
                          </div>
                        </div>

                        {/* First content row (MDO1.0) */}
                        <div className="flex border-b border-gray-300 flex-1">
                          <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                            {renderCodeButton(item)}
                          </div>
                          <div className="p-3 flex-1 text-center flex flex-col justify-center">
                            <p className="text-xs leading-tight">{item.name}</p>
                            <p className="text-xs leading-tight">
                              ({item.empId})
                            </p>
                          </div>
                        </div>

                        {/* Second content row (MDO2.0) */}
                        <div className="flex flex-1">
                          <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                            {renderCodeButton(item)}
                          </div>
                          <div className="p-3 flex-1 text-center flex flex-col justify-center">
                            <p className="text-xs leading-tight">
                              {mdo2?.name}
                            </p>
                            <p className="text-xs leading-tight">
                              ({mdo2?.empId})
                            </p>
                            {mdo2?.clickable &&
                              canViewDepartmentSO(mdo2?.route) && (
                                <p className="click-button no-print text-xs text-blue-600 mt-1 font-semibold">
                                  Click to view details →
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
                      className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] ${item.clickable && canViewDepartmentSO(item.route)
                        ? "cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                        : ""
                        }`}
                      onClick={() => {
                        if (
                          item.clickable &&
                          item.route &&
                          canViewDepartmentSO(item.route)
                        ) {
                          navigate(item.route);
                        }
                      }}
                    >
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-14 flex items-center justify-center">
                        {renderCodeButton(item)}
                      </div>
                      <div className="p-2 flex-1 text-center flex flex-col justify-center">
                        <p className="text-xs font-semibold mb-1 leading-tight">
                          {item.title}
                        </p>
                        <hr className="my-1 border-gray-300" />
                        <p className="text-xs leading-tight">{item.name}</p>
                        <p className="text-xs leading-tight">({item.empId})</p>
                        {item.clickable && canViewDepartmentSO(item.route) && (
                          <p className="click-button no-print text-xs text-blue-600 mt-1 font-semibold">
                            Click to view details →
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
              {/* Spacers to align with content */}
              <div className="min-h-[110px]"></div>
              <div className="min-h-[120px]"></div>
              <div className="min-h-[200px]"></div>
              <div className="min-h-[120px]"></div>
              <div className="min-h-[130px]"></div>

              {organizationData.structure?.divisions?.map((div, index) => (
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
                      } flex items-center justify-center`}
                  >
                    <span className="leading-tight">{div.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 4 - Department Head */}
            <div className="space-y-3">
              {/* Spacers */}
              <div className="min-h-[110px]"></div>
              <div className="min-h-[150px]"></div>
              <div className="min-h-[190px]"></div>

              {organizationData.structure?.departments?.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index === 1 && <div className="min-h-[10px]"></div>}
                  {index === 3 && <div className="min-h-[1px]"></div>}
                  {index === 4 && <div className="min-h-[105px]"></div>}
                  {index === 5 && <div className="min-h-[110px]"></div>}
                  {index === 6 && <div className="min-h-[250px]"></div>}
                  <div
                    className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] ${item.clickable && canViewDepartmentSO(item.route)
                      ? "cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200"
                      : ""
                      }`}
                    onClick={() => {
                      if (
                        item.clickable &&
                        item.route &&
                        canViewDepartmentSO(item.route)
                      ) {
                        navigate(item.route);
                      }
                    }}
                  >
                    <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                      {renderCodeButton(item)}
                    </div>
                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <p className="text-xs font-semibold mb-1 leading-tight">
                        {item.title}
                      </p>
                      <hr className="my-1 border-gray-300" />
                      <p className="text-xs leading-tight">{item.name}</p>
                      {item.empId && (
                        <p className="text-xs leading-tight">({item.empId})</p>
                      )}
                      {item.clickable && canViewDepartmentSO(item.route) && (
                        <p className="click-button no-print text-xs text-blue-600 mt-1 font-semibold">
                          Click to view details →
                        </p>
                      )}
                    </div>
                  </div>
                  {index === 6 && <div className="min-h-[1px]"></div>}
                </React.Fragment>
              ))}
            </div>

            {/* Column 5 - Section Head / Engineering Product Leader */}
            <div className="space-y-3">
              {organizationData.structure?.sections?.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index === 3 && <div className="min-h-[435px]"></div>}
                  {index === 4 && <div className="min-h-[10px]"></div>}
                  {index === 5 && <div className="min-h-[10px]"></div>}

                  <div
                    className={`bg-white border border-gray-400 rounded shadow-sm flex min-h-[80px] ${item.clickable && canViewDepartmentSO(item.route)
                      ? "hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200 cursor-pointer"
                      : ""
                      }`}
                    onClick={() => {
                      if (
                        item.clickable &&
                        item.route &&
                        canViewDepartmentSO(item.route)
                      ) {
                        navigate(item.route);
                      }
                    }}
                  >
                    <div className="bg-gray-100 p-1 text-center border-r border-gray-400 w-12 flex items-center justify-center">
                      {renderCodeButton(item)}
                    </div>

                    <div className="p-2 flex-1 text-center flex flex-col justify-center">
                      <p className="text-xs font-semibold mb-1 leading-tight">
                        {item.title}
                      </p>
                      <hr className="my-1 border-gray-300" />
                      <p className="text-xs leading-tight">{item.name}</p>
                      {item.empId && (
                        <p className="text-xs leading-tight">({item.empId})</p>
                      )}
                      {item.clickable && canViewDepartmentSO(item.route) && (
                        <p className="click-button no-print text-xs text-blue-600 mt-1 font-semibold">
                          Click to view details →
                        </p>
                      )}
                    </div>
                  </div>
                </React.Fragment>
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
    </div>
  );
};

export default Dashboard;
