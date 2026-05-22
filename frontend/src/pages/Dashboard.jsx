import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import JobdescViewer from "../components/JobdescViewer";
import StaticOrgChart from "../components/StaticOrgChart";
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
          date: "16/03/2026",
        },
        middleBy: {
          title: "Bambang Wuryanto",
          name: "Bambang Wuryanto",
          date: "16/03/2026",
        },
        approvedBy: {
          name: "Eko Maryanto",
          date: "16/03/2026",
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
            name: "WAHYU KARTIKO ADI",
            empId: "23240005",
            type: "combined",
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
            id: "cro-2",
            code: "CRO2.0",
            title: "CUSTOMER REPRESENTATIVE 4 WHEEL",
            name: "DWI PURWANTO*",
            empId: "23030023",
          },
        ],
        // Business Labels - Column 3
        business: [
          {
            id: "bus-1",
            label: "CONTROLCABLE OPERATION",
            type: "business-label",
          },
          {
            id: "bus-2",
            label: "DC BATTERY BUSINESS",
            type: "business-label"
          },
        ],
        // Division Labels - Column 4
        divisions: [
          {
            id: "mkt2-0",
            code: "MKT2.0",
            title: "MARKETING",
            name: "DADANG AHMAD JUNAEDI",
            empId: "11230640",
          }
        ],
        // Department Head - Column 5
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
            title: "PPC & WAREHOUSE",
            name: "DIKI WAHYUDI",
            empId: "23060056",
            clickable: true,
            route: "/ppic",
          },
          {
            id: "mkt-eng",
            code: "ENG1.0",
            title: "ENGINEERING",
            name: "ANDREAS AGUNG S.",
            empId: "23040119",
            clickable: true,
            route: "/marketing-engineering",
          },
          {
            id: "mkt-2",
            code: "MKT1.0",
            title: "MARKETING",
            name: "TBD",
          },
          {
            id: "mkt-adv",
            code: "MKT2.0",
            title: "MARKETING ADV.",
            name: "ANDREAS AGUNG S.",
            empId: "23040119",
            clickable: true,
            route: "/marketing-battery-department",
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
        // Section Head / Engineering Product Leader - Column 6
        sections: [
          {
            id: "prd-1",
            code: "PRD1.0",
            title: "MANUFACTURE CONTROLCABLE",
            name: "KARNA SATIA SALIM*",
            empId: "23230114",
            clickable: true,
            route: "/manufacturing-cable",
          },
          {
            id: "eng1-1",
            code: "ENG1.1",
            title: "ENGINEERING",
            name: "SUGIYARTO",
            empId: "23060041"
          },
          {
            id: "mkt1-1",
            code: "MKT1.1",
            title: "MARKETING",
            name: "SAVITRI OCTAVIANI",
            empId: "23130254"
          },
          {
            id: "hrd1-1",
            code: "HRD1.1",
            title: "HRDGA & IT",
            name: "THARISA ARRAHMA R.",
            empId: "23230072"
          },
          {
            id: "mkt2-1",
            code: "MKT2.1",
            title: "MARKETING DC BATTERY",
            name: "CHRYSNA YULIAWAN**",
            empId: "23240177"
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
            empId: "-"
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
            empId: "-"
          },
          {
            id: "mkt3.0",
            code: "MKT3.0",
            title: "MARKETING BESS",
            name: "TBD",
            empId: "-"
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

        if (parsedData?.structure?.management) {
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

          // Sync: tambahkan item dari initialData yang belum ada di localStorage (berdasarkan id)
          initialData.structure.management.forEach((initItem) => {
            const exists = parsedData.structure.management.find((m) => m.id === initItem.id);
            if (!exists) {
              parsedData.structure.management.push(initItem);
            }
          });

          localStorage.setItem("dashboard-organization-data", JSON.stringify(parsedData));
        }

        if (parsedData?.structure?.divisions) {
          const mkt2 = parsedData.structure.divisions.find((d) => d.code === "MKT2.0");
          if (mkt2 && mkt2.name !== "DADANG AHMAD JUNAEDI") {
            mkt2.name = "DADANG AHMAD JUNAEDI";
            mkt2.empId = "11230640";
            localStorage.setItem("dashboard-organization-data", JSON.stringify(parsedData));
          }
        }

        // Only fall back to initialData for departments/sections if they are missing entirely
        if (!parsedData.structure.departments || parsedData.structure.departments.length === 0) {
          parsedData.structure.departments = initialData.structure.departments;
        }
        if (!parsedData.structure.sections || parsedData.structure.sections.length === 0) {
          parsedData.structure.sections = initialData.structure.sections;
        }
        localStorage.setItem("dashboard-organization-data", JSON.stringify(parsedData));

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

  // Hitung posisi garis penghubung bod-2 u2192 fin-1
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

  // Hitung posisi garis penghubung bod-2 -> pch-1
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
      // Dari kanan tengah bod-1, lurus horizontal ke kiri tengah bus-1
      const startX = bod1Rect.right - gridRect.left;
      const startY = bod1Rect.top + bod1Rect.height / 2 - gridRect.top;
      const endX = bus1Rect.left - gridRect.left;
      const endY = bus1Rect.top + bus1Rect.height / 2 - gridRect.top;
      // Garis lurus horizontal dari kanan bod-1 ke kiri bus-1
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

  // Garis Director -> MI & SHE
  useEffect(() => {
    const update = () => {
      if (!bod2Ref.current || !mio1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bod2 = bod2Ref.current.getBoundingClientRect();
      const mio1 = mio1Ref.current.getBoundingClientRect();
      // Dari bawah tengah bod-2, turun vertikal, lalu belok kanan ke mio-1
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

  // Garis Director -> Management Development
  useEffect(() => {
    const update = () => {
      if (!bod2Ref.current || !mdo1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bod2 = bod2Ref.current.getBoundingClientRect();
      const mdo1 = mdo1Ref.current.getBoundingClientRect();
      // Dari bawah tengah bod-2, turun vertikal, lalu belok kanan ke mdo-1
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

  // Garis Director -> Management Representative
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

  // Garis Director -> Customer Representative AHM (cro-1)
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

  // Garis Director -> Customer Representative 4 Wheel (cro-2)
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

  // Garis Director -> DC Battery Business (bus-2)
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

  // Garis DC Battery Business (bus-2) -> Business Development (mkt2-0)
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

  // Garis Business Development (mkt2-0) -> Marketing DC Battery (mkt2-1)
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

  // Cabang dari tengah garis (mkt2-0 -> mkt2-1) turun ke Production & PME Battery (prd-2)
  useEffect(() => {
    const update = () => {
      if (!mkt2_0Ref.current || !mkt2_1Ref.current || !prd2Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const mkt2_0 = mkt2_0Ref.current.getBoundingClientRect();
      const mkt2_1 = mkt2_1Ref.current.getBoundingClientRect();
      const prd2 = prd2Ref.current.getBoundingClientRect();
      // Titik cabang = tengah antara mkt2_0 kanan dan mkt2_1 kiri
      const lineStartX = mkt2_0.right - g.left;
      const lineEndX = mkt2_1.left - g.left;
      const branchX = lineStartX + (lineEndX - lineStartX) / 2;
      const branchY = mkt2_0.top + mkt2_0.height / 2 - g.top;
      // Turun ke kiri tengah prd-2
      const prd2EndY = prd2.top + prd2.height / 2 - g.top;
      const prd2EndX = prd2.left - g.left;
      setConnectorPath20(`M ${branchX} ${branchY} L ${branchX} ${prd2EndY} L ${prd2EndX} ${prd2EndY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  // Cabang dari titik yang sama turun ke QA Battery (qac2-0)
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

  // Garis RND & BESS (rnd-1) -> AUX & POWER BATTERY ENGINEERING (rnd1-1)
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

  // Cabang dari tengah garis (rnd1 -> rnd1-1) turun ke ESS ENGINEERING (rnd1-2)
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

  // Cabang dari titik yang sama turun ke MICRO CONTROLLER ENGINEERING (rnd1-3)
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

  // Cabang dari titik yang sama turun ke MARKETING BESS (mkt3.0)
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

  // Garis putus-putus dari MARKETING ADV. ke tengah garis penghubung mkt-2 -> mkt1-1
  useEffect(() => {
    const update = () => {
      if (!mkt2Ref.current || !mkt1Ref.current || !mkt2AdvRef.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const mkt2 = mkt2Ref.current.getBoundingClientRect();
      const mkt1 = mkt1Ref.current.getBoundingClientRect();
      const mktAdv = mkt2AdvRef.current.getBoundingClientRect();
      // Titik tengah garis horizontal mkt-2 -> mkt1-1
      const lineStartX = mkt2.right - g.left;
      const lineEndX = mkt1.left - g.left;
      const midX = lineStartX + (lineEndX - lineStartX) / 2;
      const midY = mkt2.top + mkt2.height / 2 - g.top;
      // Titik awal: kanan tengah kotak MARKETING ADV.
      const advStartX = mktAdv.right - g.left;
      const advStartY = mktAdv.top + mktAdv.height / 2 - g.top;
      // Path: dari kanan kotak MARKETING ADV., belok ke kanan sampai midX, lalu naik ke midY
      setConnectorPathMktAdv(`M ${advStartX} ${advStartY} L ${midX} ${advStartY} L ${midX} ${midY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  // Cabang dari tengah garis (bod1 -> bus1) turun ke HRDGA & IT (hrd-1)
  useEffect(() => {
    const update = () => {
      if (!bod1Ref.current || !bus1Ref.current || !hrd1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bod1 = bod1Ref.current.getBoundingClientRect();
      const bus1 = bus1Ref.current.getBoundingClientRect();
      const hrd1 = hrd1Ref.current.getBoundingClientRect();
      const lineStartX = bod1.right - g.left;
      const lineEndX = bus1.left - g.left;
      // Geser branchX lebih ke kanan (97% mendekati bus1) agar tidak menimpa kotak lain
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

  // Garis HRDGA & IT (hrd-1) -> HRDGA & IT (hrd1-1)
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

  // Garis Director -> RND & BESS (rnd-1)
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

  // Garis Controlcable Operation (bus-1) -> Manufacture Controlcable (prd-1)
  // dengan cabang turun ke Quality Assurance (qa-1)
  useEffect(() => {
    const update = () => {
      if (!bus1Ref.current || !prd1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bus1 = bus1Ref.current.getBoundingClientRect();
      const prd1 = prd1Ref.current.getBoundingClientRect();
      // Garis horizontal dari kanan tengah bus-1 ke kiri tengah prd-1
      const startX = bus1.right - g.left;
      const startY = bus1.top + bus1.height / 2 - g.top;
      const endX = prd1.left - g.left;
      setConnectorPath11(`M ${startX} ${startY} L ${endX} ${startY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  // Cabang dari titik tengah garis horizontal (bus-1->prd-1) turun ke Quality Assurance (qa-1)
  useEffect(() => {
    const update = () => {
      if (!bus1Ref.current || !prd1Ref.current || !qa1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bus1 = bus1Ref.current.getBoundingClientRect();
      const prd1 = prd1Ref.current.getBoundingClientRect();
      const qa1 = qa1Ref.current.getBoundingClientRect();
      // Titik cabang = 30% dari kanan bus-1 ke kiri prd-1, pada Y garis horizontal
      const startX = bus1.right - g.left;
      const endX = prd1.left - g.left;
      const branchX = startX + (endX - startX) * 0.3;
      const branchY = bus1.top + bus1.height / 2 - g.top;
      // Turun dari titik cabang ke kiri tengah qa-1
      const qa1EndY = qa1.top + qa1.height / 2 - g.top;
      const qa1EndX = qa1.left - g.left;
      setConnectorPath12(`M ${branchX} ${branchY} L ${branchX} ${qa1EndY} L ${qa1EndX} ${qa1EndY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  // Cabang dari titik yang sama (bus-1->prd-1) turun ke PPC & Warehouse (ppic-1)
  useEffect(() => {
    const update = () => {
      if (!bus1Ref.current || !prd1Ref.current || !ppic1Ref.current || !gridRef.current) return;
      const g = gridRef.current.getBoundingClientRect();
      const bus1 = bus1Ref.current.getBoundingClientRect();
      const prd1 = prd1Ref.current.getBoundingClientRect();
      const ppic1 = ppic1Ref.current.getBoundingClientRect();
      // Titik cabang sama persis dengan cabang qa-1 (30% dari kanan bus-1 ke kiri prd-1)
      const startX = bus1.right - g.left;
      const endX = prd1.left - g.left;
      const branchX = startX + (endX - startX) * 0.3;
      const branchY = bus1.top + bus1.height / 2 - g.top;
      // Turun dari titik cabang ke kiri tengah ppic-1
      const ppic1EndY = ppic1.top + ppic1.height / 2 - g.top;
      const ppic1EndX = ppic1.left - g.left;
      setConnectorPath13(`M ${branchX} ${branchY} L ${branchX} ${ppic1EndY} L ${ppic1EndX} ${ppic1EndY}`);
    };
    const t = setTimeout(update, 150);
    window.addEventListener("resize", update);
    return () => { clearTimeout(t); window.removeEventListener("resize", update); };
  }, [organizationData]);

  // Cabang dari titik yang sama (bus-1->prd-1) turun ke Engineering (mkt-eng)
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

  // Garis penghubung ENG1.0 (mkt-eng/ENGINEERING) -> ENG1.1 (eng1-1/ENGINEERING)
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

  // Garis penghubung MKT1.0 (mkt-2/MARKETING) -> MKT1.1 (mkt1-1/MARKETING)
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

  // Cabang dari titik yang sama (bus-1->prd-1) turun ke Marketing (mkt-2)
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
    const itemName = (item.name || "").trim().toUpperCase();
    const hasJobdesc = employeeJobdescStatus[empId] || employeeJobdescStatus[itemName];

    const buttonColor = hasJobdesc
      ? "text-blue-600 hover:bg-blue-50"
      : "text-red-600 hover:bg-red-50";
    console.log(item)
    return (
      <button
        className={`text-[7.5px] font-bold hover:underline focus:outline-none uppercase px-1 py-1 rounded transition-colors ${buttonColor}`}
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
      margin: 5mm 8mm;
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
      transform: scale(0.75) !important;
      transform-origin: top center !important;
      margin: 0 auto !important;
      background: white !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      padding: 4px !important;
      page-break-inside: avoid !important;
    }

    .dashboard-print-container * {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      overflow: visible !important;
    }

    /* Font size - Tetap readable */
    .dashboard-print-container .text-xs {
      font-size: 8.5px !important;
      line-height: 1.15 !important;
    }

    .dashboard-print-container .text-sm {
      font-size: 9.5px !important;
      line-height: 1.15 !important;
    }

    .dashboard-print-container .text-lg {
      font-size: 12px !important;
      line-height: 1.2 !important;
    }

    .dashboard-print-container .text-xl {
      font-size: 14px !important;
      line-height: 1.2 !important;
    }

    .dashboard-print-container .text-2xl {
      font-size: 15.5px !important;
      line-height: 1.25 !important;
    }

    /* Spacing ultra compact */
    .dashboard-print-container .space-y-3 > * + * {
      margin-top: 0.25rem !important;
    }

    .dashboard-print-container .space-y-4 > * + * {
      margin-top: 0.35rem !important;
    }

    .dashboard-print-container .gap-4 {
      gap: 0.35rem !important;
    }

    .dashboard-print-container .gap-6 {
      gap: 0.5rem !important;
    }

    .dashboard-print-container .mb-4 {
      margin-bottom: 0.4rem !important;
    }

    .dashboard-print-container .mb-6 {
      margin-bottom: 0.55rem !important;
    }

    .dashboard-print-container .mb-8 {
      margin-bottom: 0.7rem !important;
    }

    .dashboard-print-container .mt-8 {
      margin-top: 0.6rem !important;
    }

    .dashboard-print-container .p-2 {
      padding: 0.25rem !important;
    }

    .dashboard-print-container .p-3 {
      padding: 0.35rem !important;
    }

    .dashboard-print-container .p-4 {
      padding: 0.45rem !important;
    }

    .dashboard-print-container .p-6 {
      padding: 0.6rem !important;
    }

    /* Box heights - scale 0.75 */
    .dashboard-print-container .min-h-\\[80px\\] {
      min-height: 56px !important;
    }

    .dashboard-print-container .min-h-\\[100px\\] {
      min-height: 70px !important;
    }

    .dashboard-print-container .min-h-\\[110px\\] {
      min-height: 77px !important;
    }

    .dashboard-print-container .min-h-\\[120px\\] {
      min-height: 84px !important;
    }

    .dashboard-print-container .min-h-\\[130px\\] {
      min-height: 91px !important;
    }

    .dashboard-print-container .min-h-\\[150px\\] {
      min-height: 105px !important;
    }

    .dashboard-print-container .min-h-\\[170px\\] {
      min-height: 119px !important;
    }

    .dashboard-print-container .min-h-\\[180px\\] {
      min-height: 126px !important;
    }

    .dashboard-print-container .min-h-\\[190px\\] {
      min-height: 133px !important;
    }

    .dashboard-print-container .min-h-\\[200px\\] {
      min-height: 140px !important;
    }

    /* Grid columns */
    .dashboard-print-container .grid-cols-6 {
      grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
    }

    .dashboard-print-container .grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }

    /* Width untuk code box */
    .dashboard-print-container .w-12 {
      width: 2.8rem !important;
    }

    .dashboard-print-container .w-14 {
      width: 3.3rem !important;
    }

    /* Logo size */
    .dashboard-print-container .w-24 {
      width: 4.5rem !important;
    }

    .dashboard-print-container .h-24 {
      height: 4.5rem !important;
    }

    /* Border styling */
    .dashboard-print-container .border {
      border-width: 0.8px !important;
    }

    .dashboard-print-container .border-2 {
      border-width: 1.2px !important;
    }

    .dashboard-print-container .border-4 {
      border-width: 1.8px !important;
    }

    /* Ensure colors print correctly */
    .dashboard-print-container .bg-blue-300,
    .dashboard-print-container .bg-gray-100,
    .dashboard-print-container .bg-gray-200,
    .dashboard-print-container .bg-gray-50,
    .dashboard-print-container .bg-white {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Legend box */
    .dashboard-print-container .max-w-sm {
      max-width: 17rem !important;
    }

    /* Hide print button */
    .no-print {
      display: none !important;
    }
  }
  `;

    document.head.appendChild(printStyle);

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        printStyle.remove();
      }, 500);
    }, 100);
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

      {/* Organization Chart - Dynamic, synced with editor */}
      <div
        className="dashboard-print-container bg-white rounded-lg shadow-sm p-4 overflow-x-auto"
        ref={containerRef}
      >
        // Dashboard.jsx
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
