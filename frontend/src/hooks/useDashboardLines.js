import { useState, useEffect } from 'react';

export const useDashboardLines = (refs, organizationData) => {
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
          `/api/jobdescriptions`,
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
          `/api/jobdescriptions`,
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
              id: "md-1",
              code: "MD1.0",
              title: "MDEV, MI, SHE/5R",
              name: "WAHYU KARTIKO ADI",
              empId: "23240005",
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
              title: "CUSTOMER REPRESENTATIVE AHM",
              name: "SUMIYARTO*",
              empId: "23030015",
            },
            {
              id: "cro-2",
              code: "CRO2.0",
              title: "CUSTOMER REPRESENTATIVE NON AHM",
              name: "DWI PURWANTO*",
              empId: "23030023",
            },
            {
              id: "pac-1",
              code: "PAC1.0",
              title: "PLANT ACTIVITY",
              name: "M BAGUS SANTOSO",
              empId: "23220025",
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


      return { connectorPath, connectorPath2, connectorPath3, connectorPath4, connectorPath5, connectorPath6, connectorPath7, connectorPath8, connectorPath9, connectorPath10, connectorPath11, connectorPath12, connectorPath13, connectorPath14, connectorPath15, connectorPath16, connectorPath17, connectorPath18, connectorPath19, connectorPath20, connectorPath21, connectorPath22, connectorPath23, connectorPath24, connectorPath25, connectorPathMktAdv, connectorPathHrd1, connectorPathHrd1_1 };
    };
