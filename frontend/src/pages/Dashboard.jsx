import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import JobdescViewer from "../components/JobdescViewer";
import StaticOrgChart from "../components/StaticOrgChart";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
  const bod1Ref = useRef(null);
  const bod2Ref = useRef(null);
  const fin1Ref = useRef(null);
  const pch1Ref = useRef(null);
  const bus1Ref = useRef(null);
  const mio1Ref = useRef(null);
  const mdo1Ref = useRef(null);
  const mro1Ref = useRef(null);
  const cro1Ref = useRef(null);
  const cro2Ref = useRef(null);
  const bus2Ref = useRef(null);
  const rnd1Ref = useRef(null);
  const prd1Ref = useRef(null);
  const qa1Ref = useRef(null);
  const ppic1Ref = useRef(null);
  const mktEngRef = useRef(null);
  const mktEng1Ref = mktEngRef; // alias
  const mkt2Ref = useRef(null);
  const mkt2AdvRef = useRef(null);
  const hrd1Ref = useRef(null);
  const hrd1_1Ref = useRef(null);
  const mkt2_0Ref = useRef(null);
  const mkt2_1Ref = useRef(null);
  const prd2Ref = useRef(null);
  const qac2Ref = useRef(null);
  const rnd1_1Ref = useRef(null);
  const rnd1_2Ref = useRef(null);
  const rnd1_3Ref = useRef(null);
  const mkt3Ref = useRef(null);
  const mkt1Ref = useRef(null);
  const eng1Ref = useRef(null);
  const gridRef = useRef(null);
  const [connectorPath, setConnectorPath] = useState("");
  const [connectorPath2, setConnectorPath2] = useState("");
  const [connectorPath3, setConnectorPath3] = useState("");
  const [connectorPath4, setConnectorPath4] = useState("");
  const [connectorPath5, setConnectorPath5] = useState("");
  const [connectorPath6, setConnectorPath6] = useState("");
  const [connectorPath7, setConnectorPath7] = useState("");
  const [connectorPath8, setConnectorPath8] = useState("");
  const [connectorPath9, setConnectorPath9] = useState("");
  const [connectorPath10, setConnectorPath10] = useState("");
  const [connectorPath11, setConnectorPath11] = useState("");
  const [connectorPath12, setConnectorPath12] = useState("");
  const [connectorPath13, setConnectorPath13] = useState("");
  const [connectorPath14, setConnectorPath14] = useState("");
  const [connectorPath15, setConnectorPath15] = useState("");
  const [connectorPath16, setConnectorPath16] = useState("");
  const [connectorPath17, setConnectorPath17] = useState("");
  const [connectorPath18, setConnectorPath18] = useState("");
  const [connectorPath19, setConnectorPath19] = useState("");
  const [connectorPath20, setConnectorPath20] = useState("");
  const [connectorPath21, setConnectorPath21] = useState("");
  const [connectorPath22, setConnectorPath22] = useState("");
  const [connectorPath23, setConnectorPath23] = useState("");
  const [connectorPath24, setConnectorPath24] = useState("");
  const [connectorPath25, setConnectorPath25] = useState("");
  const [connectorPathMktAdv, setConnectorPathMktAdv] = useState("");
  const [connectorPathHrd1, setConnectorPathHrd1] = useState("");
  const [connectorPathHrd1_1, setConnectorPathHrd1_1] = useState("");

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
      const response = await fetch(`/api/jobdescriptions?limit=200`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        const result = await response.json();
        const allJobdesc = result.data || result;
        const codeTitleKeywords = {
          // Engineering
          "ENG1.0": ["ENGINEERING", "ENG1.0"],
          "ENG1.1": ["ENGINEERING", "QUALITY ENGINEERING", "ENG1.1"],
          "ENG1.2": ["PROCESS ENGINEERING", "ENG1.2"],
          "ENG1.3": ["NEW BUSINESS", "BESS", "ENG1.3"],
          // Marketing
          "MKT1.0": ["MARKETING CABLE", "SALES MARKETING", "MKT1.0"],
          "MKT1.1": ["MARKETING", "MKT1.1"],
          "MKT1.1.1": ["MKT1.1.1"],
          "MKT1.1.2": ["MKT1.1.2"],
          "MKT1.1.3": ["CUSTOMER REPRESENTATIVE", "MKT1.1.3"],
          "MKT2.0": ["MARKETING BATTERY", "MKT2.0", "MARKETING CABLE"],
          "MKT2.1": ["AUX", "POWER BATTERY MARKETING", "MKT2.1", "MARKETING", "RND AUX"],
          "MKT2.2": ["ESS MARKETING", "MKT2.2"],
          // PPIC
          "PPIC1.0": ["PPIC", "PPC", "WAREHOUSE", "PPIC1.0"],
          "PPIC1.1": ["PPC CONTROLCABLE", "PPIC1.1"],
          "PPIC1.2": ["BATTERY", "AHM OES", "PPIC1.2"],
          "PPIC1.3": ["WHS CONTROLCABLE", "PPIC1.3"],
          "PPIC1.3.1": ["CONTROLCABLE", "PPIC1.3.1"],
          "PPIC1.1.1": ["PROD PLAN", "PPIC1.1.1"],
          "PPIC1.1.2": ["DN", "MANIFEST", "PPIC1.1.2"],
          "PPIC1.1.3": ["DELIVERY", "PPIC1.1.3"],
          "PPIC1.2.1": ["BATTERY", "PPIC1.2.1"],
          "PPIC1.2.2": ["BATTERY STAFF", "PPIC1.2.2"],
          "PPIC1.3.2": ["SUPPLIER CONTROL", "PPIC1.3.2"],
          "PPIC1.3.3": ["MRP", "PPIC1.3.3"],
          "PPIC1.3.4": ["RM", "OHP", "PPIC1.3.4"],
          "PPIC1.3.5": ["HASIL PRODUKSI", "PPIC1.3.5"],
          // HRD
          "HRD1.0": ["HRDGA", "HRGA", "HRD DEPT", "HRD1.0", "HRD"],
          "HRD1.1": ["POD", "HRD1.1"],
          "HRD2.0": ["HRD2.0"],
          "GA1.1": ["GENERAL AFFAIR", "GA1.1"],
          "GA1.2": ["GENERAL AFFAIR", "GA1.2"],
          "GA1.3": ["GENERAL AFFAIR", "GA1.3"],
          "IT1.1": ["INFORMATION TECHNOLOGY", "IT1.1"],
          "IT1.2": ["INFORMATION TECHNOLOGY", "IT1.2"],
          // Finance
          "FIN1.0": ["FINANCE", "ACCOUNTING", "FIN1.0"],
          "FIN1.1": ["FINANCE", "ACCOUNTING", "FIN1.1"],
          "FIN1.2": ["FIN1.2"],
          "FIN1.3": ["FIN1.3"],
          "FIN1.4": ["FIN1.4"],
          // Purchasing
          "PCH1.0": ["PROCUREMENT", "PURCHASING", "PCH1.0"],
          "PCH1.1": ["CONTROLCABLE", "PCH1.1"],
          "PCH1.2": ["BATTERY", "PCH1.2"],
          "PCH1.3": ["GENERAL", "LEGAL", "PCH1.3"],
          "PCH1.4": ["SUBCONT", "PCH1.4"],
          // QA
          "QAC1.0": ["QUALITY ASSURANCE", "QA DEPT", "QAC1.0"],
          "QAC1.1": ["QA", "QUALITY", "QAC1.1"],
          "QAC1.1.1": ["QUALITY ASSURANCE PROCESS", "QAC1.1.1"],
          "QAC1.1.2": ["QAC1.1.2"],
          "QAC1.1.3": ["LAB", "KALIBRASI", "QAC1.1.3"],
          "QAC1.1.4": ["VENDOR MANAGEMENT", "QAC1.1.4"],
          "QAC1.1.5": ["CLAIM", "COMPLAIN", "QAC1.1.5"],
          "QAC2.0": ["QA BATTERY", "QAC2.0"],
          "CR02.0": ["QA BATTERY", "CR02.0"],
          // Production Cable
          "PRD1.0": ["PROD", "CONTROLCABLE MANUFACTURE", "PRD1.0"],
          "PRD1.1": ["MANUFACTURING UNIT", "PRD1.1"],
          "PRD1.2": ["ASSEMBLING UNIT", "PRD1.2"],
          "PRD1.0.1": ["PRODUCTION ENGINEERING", "PRD1.0.1"],
          "PRD1.1.1": ["GROUP CO", "PRD1.1.1"],
          "PRD1.1.2": ["GROUP PO", "PRD1.1.2"],
          "PRD1.1.3": ["COMPONENT OUTER", "PRD1.1.3"],
          "PRD1.1.4": ["PROSES OUTER", "PRD1.1.4"],
          "PRD1.1.5": ["MAINTENANCE", "PRD1.1.5"],
          "PRD1.1.6": ["MAINTENANCE", "PRD1.1.6"],
          "PRD1.1.7": ["PRODUCTION ENGINEERING", "PRD1.1.7"],
          "PRD1.2.1": ["GROUP ASSEMBLING", "PRD1.2.1"],
          "PRD1.2.2": ["ASSEMBLING", "PRD1.2.2"],
          "PRD1.2.3": ["QUALITY CONTROL PROCESS", "PRD1.2.3"],
          "PRD1.2.4": ["QUALITY CONTROL PROCESS", "PRD1.2.4"],
          "PRD1.0.2": ["QUALITY CONTROL INCOMING", "PRD1.0.2"],
          "PRD1.0.3": ["QUALITY CONTROL INCOMING", "PRD1.0.3"],
          "PRD1.0.4": ["ADMINISTRATION", "PRD1.0.4"],
          // Production Battery
          "PRD2.0": ["BATTERY PRODUCTION", "PME", "PRD2.0", "MANUFACTURING"],
          "PRD2.1": ["BATTERY PRODUCTION", "PRD2.1"],
          "PRD2.2": ["PRD2.2"],
          "PRD2.3": ["QUALITY ASSURANCE", "PRD2.3"],
          "PRD3.0": ["BATTERY PME", "PRD3.0"],
          // RND
          "RND1.0": ["RND", "BESS", "RND1.0"],
          "RND1.1": ["AUX", "POWER BATTERY ENGINEERING", "RND1.1"],
          "RND1.2": ["ESS ENGINEERING", "RND1.2"],
          "RND1.3": ["MICRO CONTROLLER", "RND1.3"],
          // MI & SHE
          "MD1.0": ["MI", "SHE", "MD1.0"],
          "MIO1.1": ["MI", "MIO1.1"],
          "MIO1.2": ["SHE", "MIO1.2"],
          // Management
          "MDO1.0": ["MANAGEMENT DEVELOPMENT", "PDCA", "MDO1.0"],
          "MDO2.0": ["MDO2.0"],
          "MRO1.0": ["MANAGEMENT REPRESENTATIVE", "MRO1.0", "MR"],
          "MRO1.1": ["MRO1.1"],
          // BOD
          "BOD1.0": ["PRESIDENT DIRECTOR", "BOD1.0"],
          "BOD1.1": ["DIRECTOR", "BOD1.1"],
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
      console.error("❌ Error fetching job description:", error);
    } finally {
      setLoadingJobdesc(false);
    }
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

        // Debug: cek apakah empId yang bermasalah ada di statusMap
        const testIds = ["11230640", "23040119", "23060056", "23200067", "23220017"];
        testIds.forEach(id => {
          console.log(`statusMap["${id}"] =`, statusMap[id]);
        });
        console.log("Full statusMap keys:", Object.keys(statusMap));

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
        effectiveDate: "02/06/2026",
        regNo: "02/06/2026",
        preparedDate: "02/06/2026",
        approvedDate: "02/06/2026",
      },
      signatures: {
        preparedBy: {
          name: "Diki Wahyudi",
          date: "02/06/2026",
        },
        middleBy: {
          title: "Bambang Wuryanto",
          name: "Bambang Wuryanto",
          date: "02/06/2026",
        },
        approvedBy: {
          name: "Eko Maryanto",
          date: "02/06/2026",
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
        bod: [
          {
            id: "bod-1",
            code: "BOD1.0",
            title: "PRESIDENT DIRECTOR",
            name: "EKO MARYANTO",
            empId: "23200235",
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
            id: "mro-1",
            code: "MRO1.0",
            title: "MANAGEMENT REPRESENTATIVE",
            name: "SUGIYARTO*",
            empId: "23060041",
            clickable: true,
            route: "/management-representative",
          },
          {
            id: "cro-1",
            code: "CRO1.0",
            title: "CUSTOMER REPRESENTATIVE AHM",
            name: "SUMIYARTO*",
            empId: "23030015",
          },
          {
            id: "cro-2",
            code: "CRO2.0",
            title: "CUSTOMER REPRESENTATIVE NON AHM",
            name: "DWI PURWANTO*",
            empId: "23050023",
          },
          {
            id: "pac-1",
            code: "PAC1.0",
            title: "PLANT ACTIVITY",
            name: "M BAGUS SANTOSO*",
            empId: "23220025",
            clickable: true,
          },
        ],
        divisions: [
          {
            id: "mkt2-0",
            code: "MKT2.0",
            title: "BUSINESS DEVELOPMENT",
            name: "DADANG AHMAD DJUNAEDI",
            empId: "11230640",
          },
          {
            id: "bus-dev-2",
            code: "BUS-DEV2.0",
            title: "BUSINESS DEVELOPMENT",
            name: "DADANG AHMAD DJUNAEDI",
            empId: "",
          },
        ],
        departments: [
          {
            id: "qa-1",
            code: "QAC1.0",
            title: "QUALITY ASSURANCE",
            name: "M BAGUS SANTOSO",
            empId: "23220025",
            clickable: true,
            route: "/qa-department",
          },
          {
            id: "ppic-1",
            code: "PPIC1.0",
            title: "PPIC & WAREHOUSE",
            name: "DIKI WAHYUDI",
            empId: "23060056",
            clickable: true,
            route: "/ppic",
          },
          {
            id: "mkt-1",
            code: "ENG1.0",
            title: "ENGINEERING",
            name: "ANDREAS AGUNG S.*",
            empId: "23040119",
            clickable: true,
            route: "/marketing-engineering",
          },
          {
            id: "PME-1",
            code: "PME1.0",
            title: "PE & MAINTENANCE",
            name: "ANDREAS AGUNG S.*",
            empId: "23040119",
          },
          {
            id: "mkt-1-adv",
            code: "MKT1.0",
            title: "MARKETING ADV",
            name: "ANDREAS AGUNG S.*",
            empId: "23040119",
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
            id: "rnd-1",
            code: "RND1.0",
            title: "RND & BESS",
            name: "RENDRA PRAMONO",
            empId: "23200067",
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
        ],

        // SECTIONS
        sections: [
          {
            id: "prd-1",
            code: "PRD1.0",
            title: "MANUFACTURE CONTROLCABLE",
            name: "KARNA SATIA SALIM**",
            empId: "23230114",
            clickable: true,
            route: "/manufacturing-cable",
          },
          {
            id: "eng1-1",
            code: "ENG1.1",
            title: "ENGINEERING",
            name: "SUGIYARTO",
            empId: "23060041",
          },
          {
            id: "mkt1-1",
            code: "MKT1.1",
            title: "MARKETING",
            name: "SAVITRI OCTAVIANI",
            empId: "23130254",
          },
          {
            id: "hrd1-1",
            code: "HRD1.1",
            title: "HRGA & IT",
            name: "VERONICA HANI MUTIARA PALUPI **.",
            empId: "23240206",
          },
          {
            id: "mkt2-1",
            code: "MKT2.1",
            title: "MARKETING DC BATTERY",
            name: "CHRYSNA YULIAWAN**",
            empId: "23240177",
          },
          {
            id: "prd-2",
            code: "PRD2.0",
            title: "PRODUCTION & PME BATTERY",
            name: "DIONISIUS AUGUSTO**",
            empId: "23220105",
            clickable: true,
            route: "/manufactur-battery",
          },
          {
            id: "qac2-0",
            code: "QAC2.0",
            title: "QA BATTERY",
            name: "TBD",
            empId: "-",
          },
          {
            id: "rnd1-1",
            code: "RND1.1",
            title: "AUX & POWER BATTERY ENGINEERING",
            name: "BRIAN BUDI SANTOSO**",
            empId: "23210077",
          },
          {
            id: "rnd1-2",
            code: "RND1.2",
            title: "ESS ENGINEERING",
            name: "RAIHAN RAMADHAN**",
            empId: "23220104",
          },
          {
            id: "rnd1-3",
            code: "RND1.3",
            title: "MICRO CONTROLLER ENGINEERING",
            name: "TBD",
            empId: "-",
          },
          {
            id: "mkt3.0",
            code: "MKT3.0",
            title: "MARKETING BESS",
            name: "TBD",
            empId: "-",
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

    const fetchApprovedData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return null;
        const res = await fetch("/api/so-change-requests/latest-approved", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return null;
        const result = await res.json();
        if (result.success && result.data?.organizationData) {
          localStorage.setItem("dashboard-organization-data", JSON.stringify(result.data.organizationData));
          return result.data.organizationData;
        }
        return null;
      } catch (err) { return null; }
    };

    const mergeClickableRoutes = (data) => {
      if (!data?.structure) return data;
      const merged = { ...data, structure: { ...data.structure } };

      const mergeArr = (arr, initArr) =>
        (arr || []).map(item => {
          const init = (initArr || []).find(i => i.id === item.id);
          if (!init) return item;
          return {
            ...item,
            clickable: init.clickable ?? item.clickable,
            route: init.route ?? item.route,
          };
        });

      merged.structure.departments = mergeArr(
        data.structure.departments,
        initialData.structure.departments
      );
      merged.structure.sections = mergeArr(
        data.structure.sections,
        initialData.structure.sections
      );
      merged.structure.management = mergeArr(
        data.structure.management,
        initialData.structure.management
      );

      return merged;
    };

    const fetchOrganizationData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return null;
        const res = await fetch("/api/organization-data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return null;
        const result = await res.json();
        return result.success ? result.data : null;
      } catch { return null; }
    };

    const saveOrganizationDataToServer = async (data) => {
      try {
        const token = localStorage.getItem("token");
        await fetch("/api/organization-data", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ data }),
        });
      } catch (err) { console.error("saveToServer error:", err); }
    };

    const loadData = async () => {
      const approvedData = await fetchApprovedData();
      if (approvedData) {
        const merged = mergeClickableRoutes(approvedData);
        setOrganizationData(approvedData);
        await saveOrganizationDataToServer(approvedData);
        return;
      }

      const serverData = await fetchOrganizationData();
      if (serverData) {
        const merged = mergeClickableRoutes(serverData);
        setOrganizationData(serverData);
        localStorage.setItem("dashboard-organization-data", JSON.stringify(serverData));
        return;
      }

      const savedData = localStorage.getItem("dashboard-organization-data");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);

          if (parsedData?.structure?.management) {
            parsedData.structure.management = parsedData.structure.management.filter(
              (m) => m.id !== "md-1"
            );
            parsedData.structure.management = parsedData.structure.management.filter(
              (m) => m.code !== "MDO2.0"
            );
            const mdo1 = parsedData.structure.management.find((m) => m.code === "MDO1.0");
            if (mdo1 && mdo1.name && mdo1.name.toUpperCase().includes("KARINA")) {
              mdo1.name = "WAHYU KARTIKO ADI";
              mdo1.empId = "23240005";
            }
            if (mdo1) {
              mdo1.clickable = true;
              mdo1.route = "/management-development";
            }

            initialData.structure.management.forEach((initItem) => {
              const exists = parsedData.structure.management.find((m) => m.id === initItem.id);
              if (!exists) {
                parsedData.structure.management.push(initItem);
              }
            });
          }

          if (!parsedData.structure.divisions || parsedData.structure.divisions.length === 0) {
            parsedData.structure.divisions = initialData.structure.divisions;
          } else {
            const mkt2 = parsedData.structure.divisions.find((d) => d.code === "MKT2.0");
            if (!mkt2) {
              parsedData.structure.divisions.push(...initialData.structure.divisions);
            } else if (mkt2.name !== "DADANG AHMAD DJUNAEDI" || mkt2.title !== "BUSINESS DEVELOPMENT" || mkt2.empId !== "11230640") {
              mkt2.name = "DADANG AHMAD DJUNAEDI";
              mkt2.title = "BUSINESS DEVELOPMENT";
              mkt2.empId = "11230640";
            }

            const busDev2 = parsedData.structure.divisions.find((d) => d.code === "MKT2.0");
            if (!busDev2) {
              const newBusDev2 = initialData.structure.divisions.find((d) => d.code === "MKT2.0");
              if (newBusDev2) {
                parsedData.structure.divisions.push(newBusDev2);
              }
            }
          }

          if (!parsedData.structure.departments || parsedData.structure.departments.length === 0) {
            parsedData.structure.departments = initialData.structure.departments;
          } else {
            if (parsedData.structure.departments) {
              parsedData.structure.departments = parsedData.structure.departments.map(dept => {
                const initDept = initialData.structure.departments.find(d => d.id === dept.id);
                if (initDept) {
                  return {
                    ...dept,
                    clickable: initDept.clickable ?? dept.clickable,
                    route: initDept.route ?? dept.route,
                  };
                }
                return dept;
              });
            }

            if (parsedData.structure.sections) {
              parsedData.structure.sections = parsedData.structure.sections.map(sec => {
                const initSec = initialData.structure.sections.find(s => s.id === sec.id);
                if (initSec) {
                  return {
                    ...sec,
                    clickable: initSec.clickable ?? sec.clickable,
                    route: initSec.route ?? sec.route,
                  };
                }
                return sec;
              });
            }
            const eng2 = parsedData.structure.departments.find((d) => d.code === "ENG2.0");
            if (!eng2) {
              const newEng2 = initialData.structure.departments.find((d) => d.code === "ENG2.0");
              if (newEng2) {
                parsedData.structure.departments.push(newEng2);
              }
            }
          }

          if (!parsedData.structure.sections || parsedData.structure.sections.length === 0) {
            parsedData.structure.sections = initialData.structure.sections;
          }
          if (!parsedData.commissioners) {
            parsedData.commissioners = initialData.commissioners;
          }

          localStorage.setItem("dashboard-organization-data", JSON.stringify(parsedData));
          setOrganizationData(parsedData);
          await saveOrganizationDataToServer(parsedData);
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
    };

    loadData();

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

    const pollInterval = setInterval(async () => {
      const serverData = await fetchOrganizationData();
      if (serverData) {
        const merged = mergeClickableRoutes(serverData);
        setOrganizationData(serverData);
        localStorage.setItem("dashboard-organization-data", JSON.stringify(serverData));
      }
    }, 30000);

    window.addEventListener("storage", handleStorageChange);

    const handleCustomUpdate = (e) => {
      setOrganizationData(e.detail);
    };

    window.addEventListener("dashboard-data-updated", handleCustomUpdate);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("dashboard-data-updated", handleCustomUpdate);
    };
  }, []);

  useEffect(() => {
    if (organizationData) {
      checkAllEmployeeJobdescStatus();
    }
  }, [organizationData]);

  // Hitung posisi garis penghubung bod-2 -> fin-1
  useEffect(() => {
    const updateConnector = () => {
      if (!bod2Ref.current || !fin1Ref.current || !gridRef.current) return;
      const gridRect = gridRef.current.getBoundingClientRect();
      const bod2Rect = bod2Ref.current.getBoundingClientRect();
      const fin1Rect = fin1Ref.current.getBoundingClientRect();
      // Titik awal: bawah tengah bod-2
      const startX = bod2Rect.left + bod2Rect.width / 2 - gridRect.left;
      const startY = bod2Rect.bottom - gridRect.top;
      // Titik akhir: sisi kiri tengah fin-1
      const endX = fin1Rect.left - gridRect.left;
      const endY = fin1Rect.top + fin1Rect.height / 2 - gridRect.top;
      // Turun dari bawah bod-2, lalu belok kanan menuju fin-1
      const path = `M ${startX} ${startY} L ${startX} ${endY} L ${endX} ${endY}`;
      setConnectorPath(path);
    };
    const timer = setTimeout(updateConnector, 150);
    window.addEventListener("resize", updateConnector);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateConnector);
    };
  }, [organizationData]);

  useEffect(() => {
    const updateConnector2 = () => {
      if (!bod2Ref.current || !pch1Ref.current || !gridRef.current) return;
      const gridRect = gridRef.current.getBoundingClientRect();
      const bod2Rect = bod2Ref.current.getBoundingClientRect();
      const pch1Rect = pch1Ref.current.getBoundingClientRect();
      const startX = bod2Rect.left + bod2Rect.width / 2 - gridRect.left;
      const startY = bod2Rect.bottom - gridRect.top;
      const endX = pch1Rect.left - gridRect.left;
      const endY = pch1Rect.top + pch1Rect.height / 2 - gridRect.top;
      const path = `M ${startX} ${startY} L ${startX} ${endY} L ${endX} ${endY}`;
      setConnectorPath2(path);
    };
    const timer = setTimeout(updateConnector2, 150);
    window.addEventListener("resize", updateConnector2);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateConnector2);
    };
  }, [organizationData]);

  // Hitung posisi garis penghubung bod-1 -> bus-1 (Controlcable Operation)
  useEffect(() => {
    const updateConnector3 = () => {
      if (!bod1Ref.current || !bus1Ref.current || !gridRef.current) return;
      const gridRect = gridRef.current.getBoundingClientRect();
      const bod1Rect = bod1Ref.current.getBoundingClientRect();
      const bus1Rect = bus1Ref.current.getBoundingClientRect();
      const startX = bod1Rect.right - gridRect.left;
      const startY = bod1Rect.top + bod1Rect.height / 2 - gridRect.top;
      const endX = bus1Rect.left - gridRect.left;
      const endY = bus1Rect.top + bus1Rect.height / 2 - gridRect.top;
      const path = `M ${startX} ${startY} L ${endX} ${endY}`;
      setConnectorPath3(path);
    };
    const timer = setTimeout(updateConnector3, 150);
    window.addEventListener("resize", updateConnector3);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateConnector3);
    };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bod2Ref.current || !mio1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bod2 = bod2Ref.current.getBoundingClientRect();
      const mio1 = mio1Ref.current.getBoundingClientRect();
      const vx = bod2.left + bod2.width / 2 - g.left;
      const vy = bod2.bottom - g.top;
      const endY = mio1.top + mio1.height / 2 - g.top;
      const endX = mio1.left - g.left;
      setConnectorPath4(`M ${vx} ${vy} L ${vx} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bod2Ref.current || !mdo1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bod2 = bod2Ref.current.getBoundingClientRect();
      const mdo1 = mdo1Ref.current.getBoundingClientRect();
      const vx = bod2.left + bod2.width / 2 - g.left;
      const vy = bod2.bottom - g.top;
      const endY = mdo1.top + mdo1.height / 2 - g.top;
      const endX = mdo1.left - g.left;
      setConnectorPath5(`M ${vx} ${vy} L ${vx} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bod2Ref.current || !mro1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bod2 = bod2Ref.current.getBoundingClientRect();
      const mro1 = mro1Ref.current.getBoundingClientRect();
      const vx = bod2.left + bod2.width / 2 - g.left;
      const vy = bod2.bottom - g.top;
      const endY = mro1.top + mro1.height / 2 - g.top;
      const endX = mro1.left - g.left;
      setConnectorPath6(`M ${vx} ${vy} L ${vx} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bod2Ref.current || !cro1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bod2 = bod2Ref.current.getBoundingClientRect();
      const cro1 = cro1Ref.current.getBoundingClientRect();
      const vx = bod2.left + bod2.width / 2 - g.left;
      const vy = bod2.bottom - g.top;
      const endY = cro1.top + cro1.height / 2 - g.top;
      const endX = cro1.left - g.left;
      setConnectorPath7(`M ${vx} ${vy} L ${vx} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bod2Ref.current || !cro2Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bod2 = bod2Ref.current.getBoundingClientRect();
      const cro2 = cro2Ref.current.getBoundingClientRect();
      const vx = bod2.left + bod2.width / 2 - g.left;
      const vy = bod2.bottom - g.top;
      const endY = cro2.top + cro2.height / 2 - g.top;
      const endX = cro2.left - g.left;
      setConnectorPath8(`M ${vx} ${vy} L ${vx} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bod2Ref.current || !bus2Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bod2 = bod2Ref.current.getBoundingClientRect();
      const bus2 = bus2Ref.current.getBoundingClientRect();
      const vx = bod2.left + bod2.width / 2 - g.left;
      const vy = bod2.bottom - g.top;
      const endY = bus2.top + bus2.height / 2 - g.top;
      const endX = bus2.left - g.left;
      setConnectorPath9(`M ${vx} ${vy} L ${vx} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bus2Ref.current || !mkt2_0Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bus2 = bus2Ref.current.getBoundingClientRect();
      const mkt2_0 = mkt2_0Ref.current.getBoundingClientRect();
      const startX = bus2.right - g.left;
      const startY = bus2.top + bus2.height / 2 - g.top;
      const endX = mkt2_0.left - g.left;
      const endY = mkt2_0.top + mkt2_0.height / 2 - g.top;
      setConnectorPath18(`M ${startX} ${startY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!mkt2_0Ref.current || !mkt2_1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const mkt2_0 = mkt2_0Ref.current.getBoundingClientRect();
      const mkt2_1 = mkt2_1Ref.current.getBoundingClientRect();
      const startX = mkt2_0.right - g.left;
      const startY = mkt2_0.top + mkt2_0.height / 2 - g.top;
      const endX = mkt2_1.left - g.left;
      const endY = mkt2_1.top + mkt2_1.height / 2 - g.top;
      setConnectorPath19(`M ${startX} ${startY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!mkt2_0Ref.current || !mkt2_1Ref.current || !prd2Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const mkt2_0 = mkt2_0Ref.current.getBoundingClientRect();
      const mkt2_1 = mkt2_1Ref.current.getBoundingClientRect();
      const prd2 = prd2Ref.current.getBoundingClientRect();
      const lineStartX = mkt2_0.right - g.left;
      const lineEndX = mkt2_1.left - g.left;
      const branchX = lineStartX + (lineEndX - lineStartX) / 2;
      const branchY = mkt2_0.top + mkt2_0.height / 2 - g.top;
      const prd2EndY = prd2.top + prd2.height / 2 - g.top;
      const prd2EndX = prd2.left - g.left;
      setConnectorPath20(`M ${branchX} ${branchY} L ${branchX} ${prd2EndY} L ${prd2EndX} ${prd2EndY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!mkt2_0Ref.current || !mkt2_1Ref.current || !qac2Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const mkt2_0 = mkt2_0Ref.current.getBoundingClientRect();
      const mkt2_1 = mkt2_1Ref.current.getBoundingClientRect();
      const qac2 = qac2Ref.current.getBoundingClientRect();
      const lineStartX = mkt2_0.right - g.left;
      const lineEndX = mkt2_1.left - g.left;
      const branchX = lineStartX + (lineEndX - lineStartX) / 2;
      const branchY = mkt2_0.top + mkt2_0.height / 2 - g.top;
      const qac2EndY = qac2.top + qac2.height / 2 - g.top;
      const qac2EndX = qac2.left - g.left;
      setConnectorPath21(`M ${branchX} ${branchY} L ${branchX} ${qac2EndY} L ${qac2EndX} ${qac2EndY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!rnd1Ref.current || !rnd1_1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const rnd1 = rnd1Ref.current.getBoundingClientRect();
      const rnd1_1 = rnd1_1Ref.current.getBoundingClientRect();
      const startX = rnd1.right - g.left;
      const startY = rnd1.top + rnd1.height / 2 - g.top;
      const endX = rnd1_1.left - g.left;
      const endY = rnd1_1.top + rnd1_1.height / 2 - g.top;
      setConnectorPath22(`M ${startX} ${startY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!rnd1Ref.current || !rnd1_1Ref.current || !rnd1_2Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const rnd1 = rnd1Ref.current.getBoundingClientRect();
      const rnd1_1 = rnd1_1Ref.current.getBoundingClientRect();
      const rnd1_2 = rnd1_2Ref.current.getBoundingClientRect();
      const lineStartX = rnd1.right - g.left;
      const lineEndX = rnd1_1.left - g.left;
      const branchX = lineStartX + (lineEndX - lineStartX) / 2;
      const branchY = rnd1.top + rnd1.height / 2 - g.top;
      const endY = rnd1_2.top + rnd1_2.height / 2 - g.top;
      const endX = rnd1_2.left - g.left;
      setConnectorPath23(`M ${branchX} ${branchY} L ${branchX} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!rnd1Ref.current || !rnd1_1Ref.current || !rnd1_3Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const rnd1 = rnd1Ref.current.getBoundingClientRect();
      const rnd1_1 = rnd1_1Ref.current.getBoundingClientRect();
      const rnd1_3 = rnd1_3Ref.current.getBoundingClientRect();
      const lineStartX = rnd1.right - g.left;
      const lineEndX = rnd1_1.left - g.left;
      const branchX = lineStartX + (lineEndX - lineStartX) / 2;
      const branchY = rnd1.top + rnd1.height / 2 - g.top;
      const endY = rnd1_3.top + rnd1_3.height / 2 - g.top;
      const endX = rnd1_3.left - g.left;
      setConnectorPath24(`M ${branchX} ${branchY} L ${branchX} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!rnd1Ref.current || !rnd1_1Ref.current || !mkt3Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const rnd1 = rnd1Ref.current.getBoundingClientRect();
      const rnd1_1 = rnd1_1Ref.current.getBoundingClientRect();
      const mkt3 = mkt3Ref.current.getBoundingClientRect();
      const lineStartX = rnd1.right - g.left;
      const lineEndX = rnd1_1.left - g.left;
      const branchX = lineStartX + (lineEndX - lineStartX) / 2;
      const branchY = rnd1.top + rnd1.height / 2 - g.top;
      const endY = mkt3.top + mkt3.height / 2 - g.top;
      const endX = mkt3.left - g.left;
      setConnectorPath25(`M ${branchX} ${branchY} L ${branchX} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!mkt2Ref.current || !mkt1Ref.current || !mkt2AdvRef.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const mkt2 = mkt2Ref.current.getBoundingClientRect();
      const mkt1 = mkt1Ref.current.getBoundingClientRect();
      const mktAdv = mkt2AdvRef.current.getBoundingClientRect();
      const lineStartX = mkt2.right - g.left;
      const lineEndX = mkt1.left - g.left;
      const midX = lineStartX + (lineEndX - lineStartX) / 2;
      const midY = mkt2.top + mkt2.height / 2 - g.top;
      const advStartX = mktAdv.right - g.left;
      const advStartY = mktAdv.top + mktAdv.height / 2 - g.top;
      setConnectorPathMktAdv(`M ${advStartX} ${advStartY} L ${midX} ${advStartY} L ${midX} ${midY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bod1Ref.current || !bus1Ref.current || !hrd1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bod1 = bod1Ref.current.getBoundingClientRect();
      const bus1 = bus1Ref.current.getBoundingClientRect();
      const hrd1 = hrd1Ref.current.getBoundingClientRect();
      const lineStartX = bod1.right - g.left;
      const lineEndX = bus1.left - g.left;
      const branchX = lineStartX + (lineEndX - lineStartX) * 0.97;
      const branchY = bod1.top + bod1.height / 2 - g.top;
      const endY = hrd1.top + hrd1.height / 2 - g.top;
      const endX = hrd1.left - g.left;
      setConnectorPathHrd1(`M ${branchX} ${branchY} L ${branchX} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!hrd1Ref.current || !hrd1_1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const hrd1 = hrd1Ref.current.getBoundingClientRect();
      const hrd1_1 = hrd1_1Ref.current.getBoundingClientRect();
      const startX = hrd1.right - g.left;
      const startY = hrd1.top + hrd1.height / 2 - g.top;
      const endX = hrd1_1.left - g.left;
      const endY = hrd1_1.top + hrd1_1.height / 2 - g.top;
      setConnectorPathHrd1_1(`M ${startX} ${startY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bod2Ref.current || !rnd1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bod2 = bod2Ref.current.getBoundingClientRect();
      const rnd1 = rnd1Ref.current.getBoundingClientRect();
      const vx = bod2.left + bod2.width / 2 - g.left;
      const vy = bod2.bottom - g.top;
      const endY = rnd1.top + rnd1.height / 2 - g.top;
      const endX = rnd1.left - g.left;
      setConnectorPath10(`M ${vx} ${vy} L ${vx} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bus1Ref.current || !prd1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bus1 = bus1Ref.current.getBoundingClientRect();
      const prd1 = prd1Ref.current.getBoundingClientRect();
      const startX = bus1.right - g.left;
      const startY = bus1.top + bus1.height / 2 - g.top;
      const endX = prd1.left - g.left;
      setConnectorPath11(`M ${startX} ${startY} L ${endX} ${startY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bus1Ref.current || !prd1Ref.current || !qa1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bus1 = bus1Ref.current.getBoundingClientRect();
      const prd1 = prd1Ref.current.getBoundingClientRect();
      const qa1 = qa1Ref.current.getBoundingClientRect();
      const startX = bus1.right - g.left;
      const endX = prd1.left - g.left;
      const branchX = startX + (endX - startX) * 0.3;
      const branchY = bus1.top + bus1.height / 2 - g.top;
      const qa1EndY = qa1.top + qa1.height / 2 - g.top;
      const qa1EndX = qa1.left - g.left;
      setConnectorPath12(`M ${branchX} ${branchY} L ${branchX} ${qa1EndY} L ${qa1EndX} ${qa1EndY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bus1Ref.current || !prd1Ref.current || !ppic1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bus1 = bus1Ref.current.getBoundingClientRect();
      const prd1 = prd1Ref.current.getBoundingClientRect();
      const ppic1 = ppic1Ref.current.getBoundingClientRect();
      const startX = bus1.right - g.left;
      const endX = prd1.left - g.left;
      const branchX = startX + (endX - startX) * 0.3;
      const branchY = bus1.top + bus1.height / 2 - g.top;
      const ppic1EndY = ppic1.top + ppic1.height / 2 - g.top;
      const ppic1EndX = ppic1.left - g.left;
      setConnectorPath13(`M ${branchX} ${branchY} L ${branchX} ${ppic1EndY} L ${ppic1EndX} ${ppic1EndY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bus1Ref.current || !prd1Ref.current || !mktEngRef.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bus1 = bus1Ref.current.getBoundingClientRect();
      const prd1 = prd1Ref.current.getBoundingClientRect();
      const mktEng = mktEngRef.current.getBoundingClientRect();
      const startX = bus1.right - g.left;
      const endX = prd1.left - g.left;
      const branchX = startX + (endX - startX) * 0.3;
      const branchY = bus1.top + bus1.height / 2 - g.top;
      const engEndY = mktEng.top + mktEng.height / 2 - g.top;
      const engEndX = mktEng.left - g.left;
      setConnectorPath14(`M ${branchX} ${branchY} L ${branchX} ${engEndY} L ${engEndX} ${engEndY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!mktEngRef.current || !eng1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const mktEng = mktEngRef.current.getBoundingClientRect();
      const eng1 = eng1Ref.current.getBoundingClientRect();
      const startX = mktEng.right - g.left;
      const startY = mktEng.top + mktEng.height / 2 - g.top;
      const endX = eng1.left - g.left;
      const endY = eng1.top + eng1.height / 2 - g.top;
      setConnectorPath16(`M ${startX} ${startY} L ${startX} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!mkt2Ref.current || !mkt1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const mkt2 = mkt2Ref.current.getBoundingClientRect();
      const mkt1 = mkt1Ref.current.getBoundingClientRect();
      const startX = mkt2.right - g.left;
      const startY = mkt2.top + mkt2.height / 2 - g.top;
      const endX = mkt1.left - g.left;
      const endY = mkt1.top + mkt1.height / 2 - g.top;
      setConnectorPath17(`M ${startX} ${startY} L ${startX} ${endY} L ${endX} ${endY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  useEffect(() => {
    const update = () => {
      if (!bus1Ref.current || !prd1Ref.current || !mkt2Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bus1 = bus1Ref.current.getBoundingClientRect();
      const prd1 = prd1Ref.current.getBoundingClientRect();
      const mkt2 = mkt2Ref.current.getBoundingClientRect();
      const startX = bus1.right - g.left;
      const endX = prd1.left - g.left;
      const branchX = startX + (endX - startX) * 0.3;
      const branchY = bus1.top + bus1.height / 2 - g.top;
      const mkt2EndY = mkt2.top + mkt2.height / 2 - g.top;
      const mkt2EndX = mkt2.left - g.left;
      setConnectorPath15(`M ${branchX} ${branchY} L ${branchX} ${mkt2EndY} L ${mkt2EndX} ${mkt2EndY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  const renderCodeButton = (item) => {
    if (!item.id) {
      return <p className="text-[7.5px] font-bold">{item.code}</p>;
    }
    const empId = (item.empId || "").trim();
    const itemName = (item.name || "")
      .trim()
      .toUpperCase()
      .replace(/\*+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const empIdMatch = empId && empId !== "-" && (
      employeeJobdescStatus[empId] ||
      empId.split(/[\/,]/).some(part => employeeJobdescStatus[part.trim()])
    );

    const nameMatch = itemName && (
      employeeJobdescStatus[itemName] ||
      itemName.split(/[\/,]/).some(part => employeeJobdescStatus[part.trim()])
    );

    const hasJobdesc = empIdMatch || nameMatch;

    const buttonColor = hasJobdesc
      ? "text-blue-600 hover:bg-blue-50"
      : "text-red-600 hover:bg-red-50";

    const handleClick = (e) => {
      e.stopPropagation();

      console.log('🔍 handleClick:', {
        name: item.name,
        empId: item.empId,
        clickable: item.clickable,
        route: item.route
      });

      if (item.clickable && item.route) {
        if (canViewDepartmentSO(item.route)) {
          navigate(item.route);
        } else {
          alert("Anda tidak memiliki akses ke halaman ini.");
        }
        return;
      }

      onCodeClick(item);
    };

    return (
      <button
        className={`text-[7.5px] font-bold hover:underline focus:outline-none uppercase px-1 py-1 rounded transition-colors ${buttonColor}`}
        onClick={handleClick}
        title={
          item.clickable
            ? "Klik untuk melihat detail departemen"
            : hasJobdesc
              ? "Klik untuk melihat job description"
              : "Belum memiliki job description"
        }
      >
        {item.code}
      </button>
    );
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.querySelector('.dashboard-print-container');
    if (!element) return;
    setIsGeneratingPDF(true);

    try {
      element.style.overflow = 'visible';
      await new Promise(r => setTimeout(r, 400));

      const actualWidth = element.scrollWidth;
      const actualHeight = element.scrollHeight;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: actualWidth,
        windowHeight: actualHeight,
        width: actualWidth,
        height: actualHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (_clonedDoc, clonedEl) => {
          clonedEl.style.cssText = `
          width: ${actualWidth}px !important;
          height: ${actualHeight}px !important;
          overflow: visible !important;
          background: #ffffff !important;
          padding: 16px !important;
          margin: 0 !important;
          position: relative !important;
          transform: none !important;
        `;

          clonedEl.querySelectorAll('*').forEach(el => {
            const cs = window.getComputedStyle(el);
            if (['hidden', 'auto', 'scroll'].includes(cs.overflow)) el.style.overflow = 'visible';
            if (['hidden', 'auto', 'scroll'].includes(cs.overflowX)) el.style.overflowX = 'visible';
            if (['hidden', 'auto', 'scroll'].includes(cs.overflowY)) el.style.overflowY = 'visible';
          });

          clonedEl.querySelectorAll('*').forEach(el => {
            const cs = window.getComputedStyle(el);
            if (cs.display === 'flex' || cs.display === 'inline-flex') {
              el.style.flexShrink = '0';
              el.style.flexWrap = 'nowrap';
            }
          });

          clonedEl.querySelectorAll('svg').forEach(svg => {
            svg.style.overflow = 'visible';
          });
        }
      });

      element.style.overflow = 'auto';

      const imgData = canvas.toDataURL('image/png');
      const imgWidthMm = (canvas.width / 2) * 0.264583;
      const imgHeightMm = (canvas.height / 2) * 0.264583;

      const pdf = new jsPDF({
        orientation: imgWidthMm > imgHeightMm ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [imgWidthMm, imgHeightMm],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMm, imgHeightMm);
      pdf.save('PT DCCI - Organization Structure.pdf');

    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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

      <div className="no-print bg-white rounded-lg shadow-sm p-4 mb-4">
        {canPrint && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="no-print bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Generating PDF...
                </>
              ) : (
                <>
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF (A3)
                </>
              )}
            </button>
          </div>
        )}
      </div>
      <div
        className="dashboard-print-container bg-white rounded-lg shadow-sm p-4 overflow-x-auto"
        ref={containerRef}
      >
        {/* Dashboard.jsx */}
        <StaticOrgChart
          organizationData={organizationData}
          onCodeClick={onCodeClick}
          employeeJobdescStatus={employeeJobdescStatus}
        />
      </div>
    </div>
  );
};

export default Dashboard;