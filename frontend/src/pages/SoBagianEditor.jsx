import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { soBagianChangeRequestsAPI } from "../services/api";
import JobdescViewer from "../components/JobdescViewer";

const SoBagianEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [departmentData, setDepartmentData] = useState({});
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
          const jdName = (jd.memberName || "").trim().toUpperCase();
          if (jdNoPNK) statusMap[jdNoPNK] = true;
          if (jdName) statusMap[jdName] = true;
        })
        setEmployeeJobdescStatus(statusMap);
        console.log("✅ Employee Jobdesc Status:", statusMap);
      }
    } catch (error) {
      console.error("Error fetching employee jobdesc status:", error);
    }
  };

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
      const deptKeywords = {
        "PPIC": ["PPIC", "PPC", "WAREHOUSE", "WHS", "DELIVERY", "PLANNING"],
        "HRD":  ["HRD", "HRGA", "GA", "IT", "INFORMATION", "POD"],
        "MFG":  ["MANUFACTURING", "MFG", "PRODUKSI"],
        "PRD":  ["MANUFACTURING", "PRD", "CABLE"],
        "QA":   ["QUALITY", "QA", "QC"],
        "MKT":  ["MARKETING", "MKT", "SALES"],
        "FIN":  ["FINANCE", "ACCOUNTING", "FIN", "SAP"],
        "MR":   ["MR", "MANAGEMENT REPRESENTATIVE"],
        "PUR":  ["PURCHASING", "PUR", "PROCUREMENT"],
        "ENG":  ["ENGINEERING", "ENG"],
      };

      const foundJobdesc = allJobdesc.find((jd) => {
        const jdNoPNK = (jd.memberNoPNK || "").trim();
        const itemEmpId = (item.empId || "").trim();

        if (!itemEmpId || itemEmpId === "-" || !jdNoPNK) return false;
        if (jdNoPNK !== itemEmpId) return false;
        if (item.code) {
          const codePrefix = item.code.replace(/[\d.]/g, "").toUpperCase();
          const keywords = deptKeywords[codePrefix];
          if (keywords && keywords.length > 0) {
            const posTitle = (jd.positionTitle || "").toUpperCase();
            return keywords.some(kw => posTitle.includes(kw));
          }
        }

        return true; // fallback jika prefix tidak dikenal
      });

      if (foundJobdesc) {
        console.log("✅ Found:", foundJobdesc.positionTitle);
        setJobdescData(foundJobdesc);
      } else {
        console.log("❌ Not found for:", item.name);
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
      name: "Finance Department",
      route: "/finance-department",
      color: "bg-blue-500",
      structure: {
        header: {
          title: "FINANCE & ACCOUNTING",
          code: "FIN1.0",
          head: "YULIUS PERMATA",
          empId: "23220017",
          effectiveDate: "16 Maret 2026",
        },
        positions: [
          {
            id: "fin-1",
            code: "FIN1.1",
            title: "FINANCE & ACCOUNTING",
            name: "FAKHDARENI",
            empId: "23060055",
          },
          {
            id: "fin-2",
            code: "FIN1.2",
            title: "FINANCE & ACCOUNTING",
            name: "KHOIRUNNISA",
            empId: "23170572",
          },
          {
            id: "fin-3",
            code: "FIN1.3",
            title: "FINANCE & ACCOUNTING",
            name: "SITI ROKHAYATI",
            empId: "23120177",
          },
          {
            id: "fin-4",
            code: "FIN1.4",
            title: "FINANCE & ACCOUNTING",
            name: "ANNISA NUR HANDAYANI",
            empId: "23120198",
          },
        ],
      },
    },
    {
      id: "hrga-it",
      name: "HRGA & IT Department",
      route: "/hrga-it",
      color: "bg-green-500",
      structure: {
        header: {
          id: "hrd-1",
          title: "HRGA & IT",
          code: "HRD1.0",
          head: "DIKI WAHYUDI *",
          empId: "23060056",
        },
        positions: [
          {
            id: "hrd-2",
            code: "HRD2.0",
            title: "HRGA & IT",
            name: "VERONICA HANI M. **",
            empId: "23240206",
          },
          {
            id: "hrd-3",
            code: "HRD1.1",
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
        },
        positions: [
          {
            id: "mdo-1",
            code: "MDO1.0",
            title: "MANAGEMENT DEVELOPEMENT/PDCA",
            name: "KARNA SATIA SALIM*",
            empId: "23230114",
          },
          {
            id: "mdo-2",
            code: "MDO2.0",
            title: "MANAGEMENT DEVELOPEMENT/PDCA",
            name: "WAHYU KARTIKO ADI",
            empId: "23240005",
          },
        ],
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
        },
        positions: [
          {
            id: "mro1-1",
            code: "MRO1.1",
            title: "MANAGEMENT REPRESENTATIVE",
            name: "BOBI SAPUTRA",
            empId: "23240175",
          },
        ],
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
        },
        positions: [
          // ENGINEER
          {
            id: "prd-2-1",
            code: "PRD2.1",
            title: "BATTERY PRODUCTION",
            name: "YEREMIA SOTYA",
            empId: "23230135",
            group: "ENGINEER",
          },
          {
            id: "prd-2-2",
            code: "PRD2.2",
            title: "BATTERY PRODUCTION",
            name: "ASEP AGUNG WIGUNA",
            empId: "23190805",
            group: "ENGINEER",
          },
          // ENGINEER - QA
          {
            id: "prd-2-3",
            code: "PRD2.3",
            title: "QUALITY ASSURANCE",
            name: "ADHITYA SATIAWA SURYADATA",
            empId: "23230091",
            group: "ENGINEER",
          },
          // ENGINEER - PME
          {
            id: "prd-3-0",
            code: "PRD3.0",
            title: "BATTERY PME",
            name: "TBR",
            empId: "-",
            group: "ENGINEER",
          },
          // TEAM MEMBER/TECHNICIAN - AUXILIARY BATTERY PRODUCT
          {
            id: "prd-2-1-1-1",
            code: "PRD2.1.1",
            title: "AUXILIARY BATTERY PRODUCT",
            name: "RIZAL GUNAWAN",
            empId: "23230055",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-1-2",
            code: "PRD2.1.1",
            title: "AUXILIARY BATTERY PRODUCT",
            name: "MUH. NANDER",
            empId: "23120193",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-1-3",
            code: "PRD2.1.1",
            title: "AUXILIARY BATTERY PRODUCT",
            name: "GANTIANTO",
            empId: "23120145",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-1-4",
            code: "PRD2.1.1",
            title: "AUXILIARY BATTERY PRODUCT",
            name: "TARMUDIN",
            empId: "23120184",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-1-5",
            code: "PRD2.1.1",
            title: "AUXILIARY BATTERY PRODUCT",
            name: "DEDI SUKMA",
            empId: "23110110",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          // TEAM MEMBER/TECHNICIAN - BESS PRODUCT
          {
            id: "prd-2-1-2-1",
            code: "PRD2.1.2",
            title: "BESS PRODUCT",
            name: "EKO DAMAR WAHYUDI",
            empId: "23230115",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-2-2",
            code: "PRD2.1.2",
            title: "BESS PRODUCT",
            name: "WIDODO",
            empId: "23120197",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-2-3",
            code: "PRD2.1.2",
            title: "BESS PRODUCT",
            name: "SUPRIYONO",
            empId: "23110119",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-2-4",
            code: "PRD2.1.2",
            title: "BESS PRODUCT",
            name: "PUTRI LESTARI",
            empId: "23240229",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          // TEAM MEMBER/TECHNICIAN - BEV PRODUCT
          {
            id: "prd-2-1-3-1",
            code: "PRD2.1.3",
            title: "BEV PRODUCT",
            name: "RIZIQ RIDWAN",
            empId: "23210079",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-3-2",
            code: "PRD2.1.3",
            title: "BEV PRODUCT",
            name: "AINA WAKHORIDAH",
            empId: "23230053",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-3-3",
            code: "PRD2.1.3",
            title: "BEV PRODUCT",
            name: "DENDI SETIAWAN",
            empId: "23230054",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-3-4",
            code: "PRD2.1.3",
            title: "BEV PRODUCT",
            name: "GALIH SOMAT",
            empId: "23230116",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-3-5",
            code: "PRD2.1.3",
            title: "BEV PRODUCT",
            name: "M. YUNUS ARIFAI",
            empId: "23120192",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-3-6",
            code: "PRD2.1.3",
            title: "BEV PRODUCT",
            name: "DODIK",
            empId: "23120161",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          {
            id: "prd-2-1-3-7",
            code: "PRD2.1.3",
            title: "BEV PRODUCT",
            name: "NACA RODIANA HENDRAYANA",
            empId: "23120199",
            group: "TEAM MEMBER/TECHNICIAN",
          },
          // TEAM MEMBER/TECHNICIAN - QUALITY CHECK
          {
            id: "prd-2-3-1",
            code: "PRD2.3.1",
            title: "QUALITY CHECK",
            name: "TBR",
            empId: "-",
            group: "TEAM MEMBER/TECHNICIAN",
          },
        ],
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
        },
        positions: [
          {
            id: "prd1-1",
            code: "PRD1.1",
            title: "MANUFACTURING UNIT",
            name: "DADI ROSADI",
            empId: "23060049",
          },
          {
            id: "prd1-2",
            code: "PRD1.2",
            title: "ASSEMBLING UNIT",
            name: "M. SUGIARTO",
            empId: "23050024",
          },
          {
            id: "prd1-0-1",
            code: "PRD1.0.1",
            title: "PRODUCTION ENGINEERING",
            name: "CHOIRUL AMIN",
            empId: "23110109",
          },
          {
            id: "prd1-1-1",
            code: "PRD1.1.1",
            title: "GROUP CO&CI",
            name: "AGUS PURWANTORO",
            empId: "23120156",
          },
          {
            id: "prd1-1-1",
            code: "PRD1.1.1",
            title: "GROUP CO&CI",
            name: "AJI BABAN",
            empId: "23120156",
          },
          {
            id: "prd1-1-2",
            code: "PRD1.1.2",
            title: "GROUP PO",
            name: "MAYAR SANTOSO",
            empId: "23090089",
          },
          {
            id: "prd1-1-2",
            code: "PRD1.1.2",
            title: "GROUP PO",
            name: "IWAN SUPRIYADI",
            empId: "23110114",
          },
          {
            id: "prd1-2-1",
            code: "PRD1.2.1",
            title: "GROUP ASSEMBLING",
            name: "PIKI TAOFIK",
            empId: "23110117",
          },
          {
            id: "prd1-2-1",
            code: "PRD1.2.1",
            title: "GROUP ASSEMBLING",
            name: "DEDY IRWANSYAH",
            empId: "23120132",
          },
          {
            id: "prd1-2-1",
            code: "PRD1.2.1",
            title: "GROUP ASSEMBLING",
            name: "AGUNG BASUKI",
            empId: "23070072",
          },
          {
            id: "prd1-2-1",
            code: "PRD1.2.1",
            title: "GROUP ASSEMBLING",
            name: "YULIANTO",
            empId: "23110122",
          },
          {
            id: "prd1-2-1",
            code: "PRD1.2.1",
            title: "GROUP ASSEMBLING",
            name: "SOPAN",
            empId: "23110118",
          },
          {
            id: "prd1-2-1",
            code: "PRD1.2.1",
            title: "GROUP ASSEMBLING",
            name: "MUJIATI",
            empId: "23120164",
          },
          {
            id: "prd1-2-1",
            code: "PRD1.2.1",
            title: "GROUP ASSEMBLING",
            name: "HIDAYATUL",
            empId: "23120165",
          },
          {
            id: "prd1-1-3",
            code: "PRD1.1.3",
            title: "COMPONENT OUTER & COMPONENT INNER",
            name: "TEAM MEMBER",
            empId: "-",
          },
          {
            id: "prd1-1-4",
            code: "PRD1.1.4",
            title: "PROSES OUTER",
            name: "TEAM MEMBER",
            empId: "-",
          },
          {
            id: "prd1-1-5",
            code: "PRD1.1.5",
            title: "MAINTENANCE",
            name: "TRI YULIYANTO",
            empId: "23110120",
          },
          {
            id: "prd1-1-6",
            code: "PRD1.1.6",
            title: "MAINTENANCE",
            name: "AHMAD DAYU ZAINI",
            empId: "23180703",
          },
          {
            id: "prd1-1-7",
            code: "PRD1.1.7",
            title: "PRODUCTION ENGINEERING",
            name: "HANA OKTA",
            empId: "23120155",
          },
          {
            id: "prd1-2-2",
            code: "PRD1.2.2",
            title: "ASSEMBLING",
            name: "TEAM MEMBER",
            empId: "-",
          },

          //(Quality Control Process)
          {
            id: "prd1-2-3",
            code: "PRD1.2.3",
            title: "QUALITY CONTROL PROCESS",
            name: "SUGIHARTO (COORD)",
            empId: "23120137",
          },
          {
            id: "prd1-2-4",
            code: "PRD1.2.4",
            title: "QUALITY CONTROL PROCESS",
            name: "CIPTO RAHMAD SASONO",
            empId: "23060047",
          },
          {
            id: "prd1-2-4",
            code: "PRD1.2.4",
            title: "QUALITY CONTROL PROCESS",
            name: "DENDI SETYAWAN",
            empId: "23120146",
          },
          {
            id: "prd1-2-4",
            code: "PRD1.2.4",
            title: "QUALITY CONTROL PROCESS",
            name: "HERI MOHAMMAD AFANDI",
            empId: "23120138",
          },
          {
            id: "prd1-2-4",
            code: "PRD1.2.4",
            title: "QUALITY CONTROL PROCESS",
            name: "INDRI NOVITA SARI",
            empId: "23110113",
            group: "TEAM MEMBER/ADMIN",
          },
          {
            id: "prd1-2-4",
            code: "PRD1.2.4",
            title: "QUALITY CONTROL PROCESS",
            name: "PARTO",
            empId: "23120140",
            group: "TEAM MEMBER/ADMIN",
          },
          {
            id: "prd1-2-4",
            code: "PRD1.2.4",
            title: "QUALITY CONTROL PROCESS",
            name: "SUPANTO",
            empId: "23090091",
            group: "TEAM MEMBER/ADMIN",
          },
          {
            id: "prd1-2-4",
            code: "PRD1.2.4",
            title: "QUALITY CONTROL PROCESS",
            name: "WANTO",
            empId: "23110121",
            group: "TEAM MEMBER/ADMIN",
          },
          {
            id: "prd1-2-4",
            code: "PRD1.2.4",
            title: "QUALITY CONTROL PROCESS",
            name: "JUPRI SAHALA",
            empId: "23120154",
            group: "TEAM MEMBER/ADMIN",
          },
          {
            id: "prd1-2-4",
            code: "PRD1.2.4",
            title: "QUALITY CONTROL PROCESS",
            name: "ARIYANTO",
            empId: "23120219",
            group: "TEAM MEMBER/ADMIN",
          },
          {
            id: "prd1-2-4",
            code: "PRD1.2.4",
            title: "QUALITY CONTROL PROCESS",
            name: "TEAM MEMBER",
            empId: "-",
            group: "TEAM MEMBER/ADMIN",
          },
          // (QUALITY CONTROL INCOMING)
          {
            id: "prd1-0-2",
            code: "PRD1.0.2",
            title: "QUALITY CONTROL INCOMING",
            name: "MAULANA MALIK IBRAHIM",
            empId: "23220078",
            group: "TEAM MEMBER/ADMIN",
          },
          {
            id: "prd1-0-3",
            code: "PRD1.0.3",
            title: "QUALITY CONTROL INCOMING",
            name: "MOH. NURHIDAYAT",
            empId: "23120181",
            group: "TEAM MEMBER/ADMIN",
          },
          // (ADMINISTRATION)
          {
            id: "prd1-0-4",
            code: "PRD1.0.4",
            title: "ADMINISTRATION",
            name: "DWI WIDYASTUTI",
            empId: "23120191",
            group: "TEAM MEMBER/ADMIN",
          },
          {
            id: "prd1-0-5",
            code: "PRD1.0.5",
            title: "ADMINISTRATION",
            name: "MELINDA SURYANI HASIBUAN",
            empId: "23230008",
            group: "TEAM MEMBER/ADMIN",
          },
          {
            id: "prd1-0-6",
            code: "PRD1.0.6",
            title: "ADMINISTRATION",
            name: "RIRIN ERLINA",
            empId: "23120217",
            group: "TEAM MEMBER/ADMIN",
          },
          {
            id: "prd1-0-7",
            code: "PRD1.0.7",
            title: "ADMINISTRATION",
            name: "ANDI PUTRA MALBA SYAGGAF",
            empId: "23230027",
            group: "TEAM MEMBER/ADMIN",
          },
        ],
      },
    },
    {
      id: "marketing-battery",
      name: "Marketing Battery Department",
      route: "/marketing-battery-department",
      color: "bg-pink-500",
      structure: {
        header: {
          title: "MARKETING BATTERY",
          code: "MKT2.0",
          head: "RENDRA PRAMONO",
          empId: "23200067",
        },
        positions: [
          {
            id: "mkt2-1",
            code: "MKT2.1",
            title: "AUX & POWER BATTERY MARKETING",
            name: "CHRYSNA YULIAWAN**",
            empId: "23240177",
          },
          {
            id: "mkt2-2",
            code: "MKT2.2",
            title: "ESS MARKETING",
            name: "FERDINAND STEVANUS A**",
            empId: "23220049",
          },
        ],
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
        },
        positions: [
          {
            id: "mkt1-1",
            code: "MKT1.1",
            title: "SALES & MARKETING CONTROLCABLE",
            name: "SAVITRI OCTAVIANI",
            empId: "23130254",
          },
          {
            id: "eng1-0",
            code: "ENG1.0",
            title: "ENGINEERING CONTROLCABLE",
            name: "SUGIYARTO",
            empId: "23060041",
          },
          {
            id: "mkt1-1-1",
            code: "MKT1.1.1",
            title: "SALES & MARKETING CONTROLCABLE",
            name: "RIKA TRI HARMELIA",
            empId: "23110101",
          },
          {
            id: "mkt1-1-2",
            code: "MKT1.1.2",
            title: "SALES & MARKETING CONTROLCABLE",
            name: "KHANSA Z.H",
            empId: "23230110",
          },
          {
            id: "mkt1-1-3",
            code: "MKT1.1.3",
            title: "CUSTOMER REPRESENTATIVE",
            name: "SUMIYARTO",
            empId: "23030015",
          },
          {
            id: "eng1-1",
            code: "ENG1.1",
            title: "PRODUCT & QUALITY ENGINEERING CABLE",
            name: "NUR DWI WAHYONO",
            empId: "23120160",
          },
          {
            id: "eng1-1",
            code: "ENG1.1",
            title: "PRODUCT & QUALITY ENGINEERING CABLE",
            name: "ALIF PRIATNA",
            empId: "23190773",
          },
          {
            id: "eng1-1",
            code: "ENG1.1",
            title: "PRODUCT & QUALITY ENGINEERING CABLE",
            name: "ANNISA SEPTIYANING CHOIR*",
            empId: "23240228",
          },
          {
            id: "eng1-2",
            code: "ENG1.2",
            title: "PROCESS ENGINEERING CABLE",
            name: "MUHAMMAD SYARIFUDIN",
            empId: "23190727",
          },
          {
            id: "eng1-2",
            code: "ENG1.2",
            title: "PROCESS ENGINEERING CABLE",
            name: "AHMAD JAELANI SIDIK*",
            empId: "23240227",
          },
          {
            id: "eng1-2",
            code: "ENG1.2",
            title: "PROCESS ENGINEERING CABLE",
            name: "DEDI SETIADI",
            empId: "23120143",
          },
          {
            id: "eng1-3",
            code: "ENG1.3",
            title: "NEW BUSINESS DEVELOPMENT",
            name: "ANNISA SETIYANING CHOIR*",
            empId: "23240228",
          },
          {
            id: "eng1-3",
            code: "ENG1.3",
            title: "NEW BUSINESS DEVELOPMENT",
            name: "AHMAD JAELANI SIDIK*",
            empId: "23240227",
          },
        ],
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
        },
        positions: [
          {
            id: "mio1-1",
            code: "MIO1.1",
            title: "MI",
            name: "BOBI SAPUTRA*",
            empId: "23240175",
          },
          {
            id: "mio1-2",
            code: "MIO1.2",
            title: "SHE(5R-SMK3-ISO 14001)",
            name: "AFKA FIKRI AIMAN (COORD)",
            empId: "23230122",
          },
          {
            id: "mio1-2",
            code: "MIO1.2",
            title: "SHE(5R-SMK3-ISO 14001)",
            name: "TARJO",
            empId: "23090096",
          },
          {
            id: "mio1-2",
            code: "MIO1.2",
            title: "SHE(5R-SMK3-ISO 14001)",
            name: "ZEL UWEYS A.A.A.A.S.A",
            empId: "23120171",
          },
        ],
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
        },
        positions: [
          {
            id: "ppic1-1",
            code: "PPIC1.1",
            title: "PPC CONTROLCABLE",
            name: "ADE AKHMAD FAUZI*",
            empId: "23090093",
          },
          {
            id: "ppic1-2",
            code: "PPIC1.2",
            title: "BATTERY & AHM OES",
            name: "BUCHORI**",
            empId: "23120159",
          },
          {
            id: "ppic1-3",
            code: "PPIC1.3",
            title: "WHS CONTROLCABLE",
            name: "ANANG SUTAMTOMO**",
            empId: "23080082",
          },
          {
            id: "ppic1-3-1",
            code: "PPIC1.3.1",
            title: "CONTROLCABLE",
            name: "SETIYONO",
            empId: "23090090",
          },
          {
            id: "ppic1-1-1",
            code: "PPIC1.1.1",
            title: "PROD PLAN",
            name: "ERLI SULIANTO",
            empId: "23070073",
          },
          {
            id: "ppic1-1-2",
            code: "PPIC1.1.2",
            title: "DN/MANIFEST",
            name: "EFRAIN TAMBUNAN",
            empId: "23110111",
          },
          {
            id: "ppic1-1-3",
            code: "PPIC1.1.3",
            title: "DELIVERY",
            name: "SUDARMANTO",
            empId: "23120151",
          },
          {
            id: "ppic1-1-4",
            code: "PPIC1.1.4",
            title: "DELIVERY",
            name: "OPERATOR",
            empId: "-",
          },
          {
            id: "ppic1-2-1",
            code: "PPIC1.2.1",
            title: "BATTERY",
            name: "SRI NATIN",
            empId: "231202130",
          },
          {
            id: "ppic1-2-2",
            code: "PPIC1.2.2",
            title: "BATTERY STAFF",
            name: "M. HAMAM MUCHLISIN",
            empId: "23120174",
          },
          {
            id: "ppic1-3-2",
            code: "PPIC1.3.2",
            title: "SUPPLIER CONTROL",
            name: "SULASTRI",
            empId: "23120190",
          },
          {
            id: "ppic1-3-3",
            code: "PPIC1.3.3",
            title: "MRP",
            name: "LAILA FITRIYAH",
            empId: "23120196",
          },
          {
            id: "ppic1-3-4",
            code: "PPIC1.3.4",
            title: "RM & OHP",
            name: "SUPRIYANTO",
            empId: "23120153",
          },
          {
            id: "ppic1-3-5",
            code: "PPIC1.3.5",
            title: "HASIL PRODUKGAS",
            name: "RAGIL PAMUGKAS",
            empId: "23120154",
          },
          {
            id: "ppic1-3-6",
            code: "PPIC1.3.6",
            title: "SUPPLY",
            name: "OPERATOR (2)",
            empId: "-",
          },
        ],
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
        },
        positions: [
          {
            id: "pch1-1",
            code: "PCH1.1",
            title: "CONTROLCABLE",
            name: "RIF'QI FATHAH",
            empId: "23230017",
          },
          {
            id: "pch1-2",
            code: "PCH1.2",
            title: "BATTERY",
            name: "MARCHELINO DWI PUTRANTO",
            empId: "23250234",
          },
          {
            id: "pch1-3",
            code: "PCH1.3",
            title: "GENERAL & LEGAL",
            name: "SYIFA NUR MULYANI",
            empId: "23220060",
          },
          {
            id: "pch1-4",
            code: "PCH1.4",
            title: "SUBCONT",
            name: "ELITRI SULISTIYO",
            empId: "23110112",
          },
        ],
      },
    },
    {
      id: "qa",
      name: "QA Department",
      route: "/qa-department",
      color: "bg-rose-500",
      structure: {
        header: {
          title: "QA DEPARTMENT",
          code: "QAC1.0",
          head: "M BAGUS SANTOSO",
          empId: "23220025",
        },
        positions: [
          {
            id: "qac1-1-1",
            code: "QAC1.1.1",
            title: "QUALITY ASSURANCE PROCESS",
            name: "DWI PURWANTO",
            empId: "23050023",
          },
          {
            id: "qac1-1-2",
            code: "QAC1.1.2",
            title: "QUALITY ASSURANCE PROCESS",
            name: "SUCI PURWANTO",
            empId: "23050023",
          },
          {
            id: "qac1-1-3",
            code: "QAC1.1.3",
            title: "LAB & KALIBRASI",
            name: "NURDIANTO",
            empId: "23160477",
          },
          {
            id: "qac1-1-4",
            code: "QAC1.1.4",
            title: "VENDOR MANAGEMENT",
            name: "SUCI PURWANTO*",
            empId: "23050023",
          },
          {
            id: "qac1-1-5",
            code: "QAC1.1.5",
            title: "CLAIM & COMPLAIN",
            name: "CANDRA MAULANA",
            empId: "23080082",
          },
        ],
      },
    },
  ];

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
      return departments;
    }

    return departments.filter((d) => {
      if (userDepartmentName === d.name) return true;

      const required = departmentPermissions[d.name] || [];
      return required.some((perm) => userPermissions.includes(perm));
    });
  }, [user, departments]);

  useEffect(() => {
    const initialData = {};
    departments.forEach((dept) => {
      const savedData = localStorage.getItem(`so-bagian-${dept.id}`);
      if (savedData) {
        try {
          initialData[dept.id] = JSON.parse(savedData);
        } catch (error) {
          console.error(`Error parsing saved data for ${dept.id}:`, error);
          initialData[dept.id] = dept.structure;
        }
      } else {
        initialData[dept.id] = dept.structure;
      }
    });
    setDepartmentData(initialData);
  }, []);

  useEffect(() => {
    if (!selectedDepartment) return;

    const handleUpdate = (event) => {
      console.log("🔔 Received update event for:", selectedDepartment.id);
      console.log("📦 New data:", event.detail);

      setDepartmentData((prev) => ({
        ...prev,
        [selectedDepartment.id]: event.detail,
      }));

      alert("✅ SO Bagian has been updated with approved changes!");
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
      const currentStructure = departmentData[selectedDepartment.id];

      console.log("Selected Department ID:", selectedDepartment.id);
      const storageKey = `so-bagian-${selectedDepartment.id}`;
      const savedDataRaw = localStorage.getItem(storageKey);
      let originalStructure = null;

      if (savedDataRaw) {
        try {
          originalStructure = JSON.parse(savedDataRaw);
          console.log(
            "📦 Found original data from localStorage:",
            originalStructure
          );
        } catch (err) {
          console.error("Error parsing original data:", err);
        }
      }

      if (!originalStructure) {
        const defaultDept = departments.find(
          (d) => d.id === selectedDepartment.id
        );
        if (defaultDept && defaultDept.structure) {
          originalStructure = defaultDept.structure;
          console.log("📦 Using default department structure as original data");
        }
      }

      console.log("📤 Current structure data:", currentStructure);
      console.log("📤 Original structure data:", originalStructure);
      console.log("📤 Selected department:", selectedDepartment);

      const dataToSubmit = {
        departmentId: selectedDepartment.id,
        structure: currentStructure,
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
        alert("✅ Change request submitted successfully!");
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

      // Clone element
      const clone = printContent.cloneNode(true);

      // Fungsi untuk copy computed styles ke inline styles
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

      // Apply computed styles ke semua elemen
      const sourceElements = printContent.querySelectorAll('*');
      const targetElements = clone.querySelectorAll('*');

      copyStyles(printContent, clone);

      sourceElements.forEach((el, i) => {
        if (targetElements[i]) {
          copyStyles(el, targetElements[i]);
        }
      });

      // Fix overflow di clone
      clone.style.setProperty('overflow', 'visible', 'important');
      clone.style.setProperty('width', '100%', 'important');
      clone.style.setProperty('border', 'none', 'important');
      clone.style.setProperty('box-shadow', 'none', 'important');

      // Fix semua overflow-x di dalam clone
      clone.querySelectorAll('*').forEach(el => {
        const overflow = window.getComputedStyle(el).overflow;
        if (overflow === 'auto' || overflow === 'hidden' || overflow === 'scroll') {
          el.style.setProperty('overflow', 'visible', 'important');
        }
      });

      // Fix gambar logo agar tidak terlalu besar
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
          className={`bg-yellow-50 border rounded px-2 py-1 ${className}`}
          placeholder={placeholder}
          autoFocus
        />
      );
    }

    return (
      <span
        onClick={() => isEditMode && setIsEditing(true)}
        className={
          isEditMode ? "cursor-pointer hover:bg-yellow-100 rounded px-1" : ""
        }
        title={isEditMode ? "Click to edit" : ""}
      >
        {value || placeholder}
      </span>
    );
  };

  const renderCodeButton = (person) => {
    if (!person || !person.empId) {
      return (
        <p className="text-xs font-bold uppercase">{person?.code || ""}</p>
      );
    }

    const empId = (person.empId || "").trim();
    const personName = (person.name || "").trim().toUpperCase();
    const hasJobdesc = employeeJobdescStatus[empId] || employeeJobdescStatus[personName];

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

  const renderDepartmentSpecificLayout = () => {
    if (!selectedDepartment || !departmentData[selectedDepartment.id])
      return null;

    const dept = departmentData[selectedDepartment.id];

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
                  <div>
                    <h1 className="text-base font-bold text-gray-800 mb-1">
                      STRUKTUR ORGANISASI
                    </h1>
                    <h2 className="text-sm font-semibold text-gray-700 mb-1">
                      PT DHARMA CONTROLCABLE INDONESIA
                    </h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      ({dept.header.title})
                    </h3>
                    <p className="text-xs text-gray-500">
                      Effective Date : 16 June 2024
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Prepared by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight"></p>
                            <p className="text-sm text-black leading-tight">
                              DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Checked by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              DIKI WAHYUDI
                            </p>
                            <p className="text-sm text-black leading-tight">
                              HRGA&IT DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Approved by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              BAMBANG WURYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DIRECTOR
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
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    BOARD OF DIRECTOR
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    DEPARTMENT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">STAFF</h3>
                </div>
              </div>
            </div>

            <div
              className="grid grid-cols-4 gap-4 relative org-grid"
              style={{ zIndex: 2 }}
            >
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.0</p>
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
                    <p className="text-sm font-bold">BOD1.1</p>
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
              </div>

              <div className="space-y-4 flex flex-col items-center"></div>

              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={
                              dept.header?.title || "MANAGEMENT REPRESENTATIVE"
                            }
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "header",
                                null,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Section Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.header?.title || "MANAGEMENT REPRESENTATIVE"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton({
                          code: "MRO1.0",
                          name: dept.header.head,
                          empId: dept.header.empId,
                          title: dept.header.title,
                        })}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "head",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.header.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[0]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectDepartment.id,
                                "positions",
                                dept.positions[0]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[0]?.title ||
                              "MANAGEMENT REPRESENTATIVE"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[0])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[0]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                  <div>
                    <h1 className="text-base font-bold text-gray-800 mb-1">
                      STRUKTUR ORGANISASI
                    </h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">
                      PT DHARMA CONTROLCABLE INDONESIA
                    </h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      ({dept.header.title})
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date : 16 Maret 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Prepared by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              DIKI WAHYUDI
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DEPARTEMENT HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Checked by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              DIKI WAHYUDI
                            </p>
                            <p className="text-sm text-black leading-tight">
                              HRDGA&IT DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Approved by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              BAMBANG WURYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              PRESIDENT DIRECTOR
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
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    BOARD OF DIRECTOR
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    DEPARTMENT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">STAFF LEVEL</h3>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div
              className="grid grid-cols-4 gap-4 relative org-grid"
              style={{ zIndex: 2 }}
            >
              {/* Kolom 1 - Board of Director */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.0</p>
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
                    <p className="text-sm font-bold">BOD1.1</p>
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

              {/* Kolom 2 - Department Head - Empty */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 3 - Section Head */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.header?.title || "HRGA IT"}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "header",
                                null,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Section Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.header?.title || "HRGA & IT"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* DIKI WAHYUDI */}
                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton({
                          code: "HRD1.0",
                          name: dept.header.head,
                          empId: dept.header.empId,
                          title: dept.header.title,
                        })}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "head",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.header.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>

                    {/* VERONICA HANI M. */}
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton(dept.positions[0])}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[0]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 4 - Staff Level */}
              <div className="space-y-4 flex flex-col items-center staff-cards">
                {/* HRD Section */}
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[1]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[1]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[1]?.title || "HRD"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[1])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[1]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[1]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* General Affair & Industrial Relations Section */}
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[280px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[2]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[2]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[2]?.title ||
                              "GENERAL AFFAIR & IND. RELATIONS"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(2, 5).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Information Technology Section */}
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[180px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold"></p>
                      </div>
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[5]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[5]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[5]?.title ||
                              "INFORMATION TECHNOLOGY"}
                          </p>
                        )}
                      </div>
                    </div>
                    {dept.positions?.slice(5, 7).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 1 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                  <div>
                    <h1 className="text-base font-bold text-gray-800 mb-1">
                      STRUKTUR ORGANISASI
                    </h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">
                      PT DHARMA CONTROLCABLE INDONESIA
                    </h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      ({dept.header.title})
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date : 16 Maret 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Prepared by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight"></p>
                            <p className="text-sm text-black leading-tight">
                              DEPARTEMENT HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Checked by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              DIKI WAHYUDI
                            </p>
                            <p className="text-sm text-black leading-tight">
                              HRDGA&IT DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Approved by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              BAMBANG WURYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DIRECTOR
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
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    BOARD OF DIRECTOR
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    DEPARTMENT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">STAFF</h3>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div
              className="grid grid-cols-4 gap-4 relative org-grid"
              style={{ zIndex: 2 }}
            >
              {/* Kolom 1 - Board of Director */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.0</p>
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
                    <p className="text-sm font-bold">BOD1.1</p>
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

              {/* Kolom 2 - Department Head - Empty */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 3 - Section Head - Empty */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 4 - Staff */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[0]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[0]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[0]?.title || "MANAGEMENT DEVELOPMENT"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[0])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[0]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton(dept.positions[1])}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[1]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[1]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                  <div>
                    <h1 className="text-base font-bold text-gray-800 mb-1">
                      STRUKTUR ORGANISASI
                    </h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">
                      PT DHARMA CONTROLCABLE INDONESIA
                    </h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (MANUFACTURING BATTERY DEPARTMENT)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date : 16 Maret 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Prepared by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              DIONISIUS AUGUSTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              SENIOR ENGINEER
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Checked by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              DIKI WAHYUDI
                            </p>
                            <p className="text-sm text-black leading-tight">
                              HRGAIT DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Approved by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              EKO MARYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              PRESIDENT DIRECTOR
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
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="bg-blue-300 p-2 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    BOARD OF DIRECTOR
                  </h3>
                </div>
                <div className="bg-blue-300 p-2 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    DEPARTMENT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-2 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    SENIOR ENGINEER
                  </h3>
                </div>
                <div className="bg-blue-300 p-2 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">ENGINEER</h3>
                </div>
                <div className="bg-blue-300 p-2 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    TEAM MEMBER/TECHNICIAN
                  </h3>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div
              className="grid grid-cols-5 gap-2 relative org-grid"
              style={{ zIndex: 2 }}
            >
              {/* Kolom 1 - Board of Director */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[220px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-13 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.0</p>
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

                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[220px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-13 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.1</p>
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
              </div>

              {/* Kolom 2 - Department Head (Empty) */}
              <div className="space-y-4 flex flex-col items-center">
                {/* Kosong sesuai layout */}
              </div>

              {/* Kolom 3 - Senior Engineer */}
              <div className="space-y-4 flex flex-col">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.header?.title || "BATTERY PRODUCTION & PME"}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "header",
                                null,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Section Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.header?.title || "BATTERY PRODUCTION & PME"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton({
                          code: "PRD2.0",
                          name: dept.header.head,
                          empId: dept.header.empId,
                          title: dept.header.title,
                        })}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "head",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.header.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 4 - Engineer */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[0]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[0]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[0]?.title ||
                              "BATTERY PRODUCTION"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(0, 2).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[2]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[2]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[2]?.title || "QUALITY ASSURANCE"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[2])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[2]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[2]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[2]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[2]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[3]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[3]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[3]?.title || "BATTERY PME"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[3])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[3]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[3]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[3]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[3]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 5 - Team Member/Technician */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[4]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[4]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[4]?.title ||
                              "AUXILIARY BATTERY PRODUCT"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(4, 9).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 4 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[9]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[9]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[9]?.title ||
                              "BESS PRODUCT"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(9, 13).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 3 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[13]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[13]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[13]?.title ||
                              "BEV PRODUCT"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(13, 20).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 6 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[20]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[1]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[20]?.title || "QUALITY CHECK"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[20])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[20]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[20]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[20]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[20]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                  <div>
                    <h1 className="text-base font-bold text-gray-800 mb-1">
                      STRUKTUR ORGANISASI
                    </h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">
                      PT DHARMA CONTROLCABLE INDONESIA
                    </h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      ({dept.header.title})
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date : 16 Maret 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Prepared by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              {dept.header.head}
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Checked by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              BAMBANG WURYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DIRECTOR
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Approved by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              EKO MARYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              PRESIDENT DIRECTOR
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
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    BOARD OF DIRECTOR
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    DEPARTMENT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">STAFF LEVEL</h3>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div
              className="grid grid-cols-4 gap-4 relative org-grid"
              style={{ zIndex: 2 }}
            >
              {/* Kolom 1 - Board of Director */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.0</p>
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
                    <p className="text-sm font-bold">BOD1.1</p>
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
              </div>

              {/* Kolom 2 - Department Head - Empty */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 3 - Section Head */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.header?.title || "PROCUREMENT & PURCHASING"}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "header",
                                null,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Section Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.header?.title || "PROCUREMENT & PURCHASING"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton({
                          code: "PCH1.0",
                          name: dept.header.head,
                          empId: dept.header.empId,
                          title: dept.header.title,
                        })}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "head",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.header.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 4 - Staff Level */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[0]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[0]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[0]?.title || "CONTROLCABLE"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[0])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[0]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* BATTERY */}
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[1]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[1]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[1]?.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton(dept.positions[1])}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[1]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[1]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* GENERAL & LEGAL */}
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[2]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[2]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[2]?.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton(dept.positions[2])}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[2]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[2]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[2]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[2]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUBCONT */}
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[3]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[3]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[3]?.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton(dept.positions[3])}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[3]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[3]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[3]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[3]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                  className="border-2 border-black p-4 text-center flex items-center flex-1 mr-1"
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
                      ({dept.header.title})
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date : 16 Maret 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Prepared by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              {dept.header.head}
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Checked by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              BAMBANG WURYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DIRECTOR
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Approved by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16">
                            <div className="text-center">
                              <p className="text-sm font-bold text-black underline leading-tight">
                                EKO MARYANTO
                              </p>
                              <p className="text-sm text-black leading-tight">
                                PRESIDENT DIRECTOR
                              </p>
                            </div>
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
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    BOARD OF DIRECTOR
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    DEPARTMENT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">STAFF LEVEL</h3>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div
              className="grid grid-cols-4 gap-4 relative org-grid"
              style={{ zIndex: 2 }}
            >
              {/* Kolom 1 - Board of Director */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.0</p>
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
                    <p className="text-sm font-bold">BOD1.1</p>
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
              </div>

              {/* Kolom 2 - Department Head - Empty */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 3 - Section Head*/}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.header?.title || "MI & SHE (5R-SMK3-ISO 14001)"}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "header",
                                null,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Section Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.header?.title || "MI & SHE (5R-SMK3-ISO 14001)"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton({
                          code: "MIO1.0",
                          name: dept.header.head,
                          empId: dept.header.empId,
                          title: dept.header.title,
                        })}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "head",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.header.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 4 - Staff Level */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[0]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[0]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[0]?.title || "MI"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[0])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[0]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[280px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[1]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[1]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[1]?.title ||
                              "SHE (5R-SMK3-ISO 14001)"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(1, 4).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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

    if (selectedDepartment.id === "manufacturing-cable") {
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
                      ({dept.header.title})
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date : 16 Maret 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Prepared by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              {dept.header.head}
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Checked by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              DIKI WAHYUDI
                            </p>
                            <p className="text-sm text-black leading-tight">
                              HRGA&IT DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Approved by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              BAMBANG WURYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DIRECTOR
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
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    BOARD OF DIRECTOR
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    DEPARTMENT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    STAFF / UNIT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">GROUP HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    TEAM MEMBER/ADMIN
                  </h3>
                </div>
              </div>
            </div>

            <div
              className="grid grid-cols-6 gap-2 relative org-grid"
              style={{ zIndex: 2 }}
            >
              <div className="space-y-4 flex flex-col">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[180px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-13 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.0</p>
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

                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[180px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-13 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.1</p>
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
              </div>

              <div className="space-y-4 flex flex-col items-center"></div>

              {/* KOLOM 3 - SECTION HEAD */}
              <div className="space-y-4 flex flex-col">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[190px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.header?.title || "CONTROLCABLE MANUFACTURE"}
                            onChange={(e) =>
                              handleEdit(selectedDepartment.id,
                                "header",
                                null,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Section Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.header?.title || "CONTROLCABLE MANUFACTURE"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton({
                          code: "PRD1.0",
                          name: dept.header.head,
                          empId: dept.header.empId,
                          title: dept.header.title,
                        })}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "head",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.header.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KOLOM 4 - STAFF LEVEL */}
              <div className="space-y-4 flex flex-col items-center staff cards">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[0]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[0]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[0]?.title || "MANUFACTURIN UNIT"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[0])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[0]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[1]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[1]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[1]?.title || "ASSEMBLING UNIT"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[1])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[1]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[1]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[2]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[2]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[2]?.title || "PRODUCTION ENGINEERING"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[2])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[2]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[2]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[2]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[2]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 5 - Group Head*/}
              {/* Group co&ci */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[220px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[3]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[3]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[3]?.title ||
                              "GROUP CO & CI"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(3, 5).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[220px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[5]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[5]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[5]?.title ||
                              "GROUP PO"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(5, 7).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[220px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[7]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[7]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[7]?.title ||
                              "GROUP ASSEMBLING"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(7, 14).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 6 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kolom 6 - Team member/admin */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[14]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[14]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[14]?.title || "COMPONENT OUTER & COMPONENT INNER"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[14])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[14]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[14]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[14]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[14]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[15]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[15]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[15]?.title || "PROSES OUTER"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[15])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[15]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[15]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[15]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[15]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[16]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[16]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[16]?.title ||
                              "MAINTENANCE"}
                          </p>
                        )}
                      </div>
                    </div>
                    {dept.positions?.slice(16, 18).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[18]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[18]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[18]?.title || "PRODUCTION ENGINEERING"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[18])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[18]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[18]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[18]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[18]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[19]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[19]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[19]?.title || "PRODUCTION ENGINEERING"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[19])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[19]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[19]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[19]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[19]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[20]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[20]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[20]?.title ||
                              "QUALITY CONTROL PROCESS"}
                          </p>
                        )}
                      </div>
                    </div>
                    {dept.positions?.slice(20, 31).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[31]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[31]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[31]?.title ||
                              "QUALITY CONTROL INCOMING"}
                          </p>
                        )}
                      </div>
                    </div>
                    {dept.positions?.slice(31, 33).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[33]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[33]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[33]?.title ||
                              "ADMINISTRATION"}
                          </p>
                        )}
                      </div>
                    </div>
                    {dept.positions?.slice(33, 37).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                  <div>
                    <h1 className="text-base font-bold text-gray-800 mb-1">
                      STRUKTUR ORGANISASI
                    </h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">
                      PT DHARMA CONTROLCABLE INDONESIA
                    </h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      ({dept.header.title})
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date : 16 Maret 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Prepared by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              {dept.header.head}
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Checked by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              DIKI WAHYUDI
                            </p>
                            <p className="text-sm text-black leading-tight">
                              HRGA&IT DEPT.HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Approved by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              BAMBANG WURYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DIRECTOR
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
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    BOARD OF DIRECTOR
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    DEPARTMENT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">STAFF</h3>
                </div>
              </div>
            </div>

            <div
              className="grid grid-cols-4 gap-4 relative org-grid"
              style={{ zIndex: 2 }}
            >
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.0</p>
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
                    <p className="text-sm font-bold">BOD1.1</p>
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
              </div>

              {/* Kolom 2 */}
              <div className="space-y-4">
                <div className="min-h-[20px]"></div>
              </div>

              {/* Kolom 3 */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.header?.title || "FINANCE & ACCOUNTING"}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "header",
                                null,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Section Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.header?.title || "FINANCE & ACCOUNTING"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton({
                          code: "FIN1.0",
                          name: dept.header.head,
                          empId: dept.header.empId,
                          title: dept.header.title,
                        })}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "head",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.header.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={
                              dept.positions[0]?.title || "FINANCE & ACCOUNTING"
                            }
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[0]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[0]?.title || "FINANCE & ACCOUNTING"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[0])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[0]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton(dept.positions[1])}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[1]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[1]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton(dept.positions[2])}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[2]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[2]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[2]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[2]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton(dept.positions[3])}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[3]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[3]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[3]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[3]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                  <div>
                    <h1 className="text-base font-bold text-gray-800 mb-1">
                      STRUKTUR ORGANISASI
                    </h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">
                      PT DHARMA CONTROLCABLE INDONESIA
                    </h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      ({dept.header.title})
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date : 16 Maret 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Prepared by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              {dept.header.head}
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Checked by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              DIKI WAHYUDI
                            </p>
                            <p className="text-sm text-black leading-tight">
                              HRGA&IT DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Approved by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              BAMBANG WURYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DIRECTOR
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
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    BOARD OF DIRECTOR
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    DEPARTMENT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    STAFF/SPECIALIST
                  </h3>
                </div>
              </div>
            </div>

            <div
              className="grid grid-cols-4 gap-4 relative org-grid"
              style={{ zIndex: 2 }}
            >
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.0</p>
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
                    <p className="text-sm font-bold">BOD1.1</p>
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
              </div>

              {/* Kolom 2 - Department Head */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.header?.title || "MARKETING"}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "header",
                                null,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Section Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.header?.title || "MARKETING"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton({
                          code: "MKT2.0",
                          name: dept.header.head,
                          empId: dept.header.empId,
                          title: dept.header.title,
                        })}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "head",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.header.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 3 - Section Head */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[0]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[0]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[0]?.title || "AUX & POWER BATTERY MARKETING"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[0])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[0]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[1]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[1]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[1]?.title || "ESS MARKETING"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[1])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[1]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[1]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                      ({dept.header.title})
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date : 16 Maret 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Prepared by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              {dept.header.head}
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Checked by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              DIKI WAHYUDI
                            </p>
                            <p className="text-sm text-black leading-tight">
                              HRGA&IT DEPT.HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Approved by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              BAMBANG WURYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DIRECTOR
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
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    BOARD OF DIRECTOR
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    DEPARTMENT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">STAFF</h3>
                </div>
              </div>
            </div>

            <div
              className="grid grid-cols-4 gap-4 relative org-grid"
              style={{ zIndex: 2 }}
            >
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.0</p>
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
                    <p className="text-sm font-bold">BOD1.1</p>
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
              </div>

              {/* Kolom 2 - Department Head */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.header?.title || "MARKETING"}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "header",
                                null,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Section Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.header?.title || "MARKETING"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton({
                          code: "MKT1.0",
                          name: dept.header.head,
                          empId: dept.header.empId,
                          title: dept.header.title,
                        })}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "head",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.header.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 3 - Section Head */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[0]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[0]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[0]?.title || "SALES & MARKETING CONTROLCABLE"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[0])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[0]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[1]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[1]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[1]?.title || "ENGINEERING CONTROLCABLE"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[1])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[1]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[1]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 4 - Staff */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[280px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[2]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[2]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[2]?.title ||
                              "SALES & MARKETING CONTROLCABLE"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(2, 4).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[4]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[4]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[4]?.title || "CUSTOMER REPRESENTATIVE"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[4])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[4]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[4]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[4]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[4]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[280px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[5]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[5]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[5]?.title ||
                              "PRODUCT & QUALITY ENGINEERING CABLE"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(5, 8).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[280px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[8]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[8]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[8]?.title ||
                              "PROCESS ENGINEERING CABLE"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(8, 11).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[280px] w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[11]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[11]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[11]?.title ||
                              "NEW BUSINESS DEVELOPMENT"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(11, 13).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                      ({dept.header.title})
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date : 16 Maret 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Prepared by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              {dept.header.head}
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Checked by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              DIKI WAHYUDI
                            </p>
                            <p className="text-sm text-black leading-tight">
                              HRGA&IT DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Approved by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              BAMBANG WURYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DIRECTOR
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
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    BOARD OF DIRECTOR
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    DEPARTMENT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">SECTION HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    UNIT HEAD/STAFF
                  </h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">GROUP HEAD</h3>
                </div>
                <div className="bg-blue-300 p-3 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">MEMBER</h3>
                </div>
              </div>
            </div>

            <div
              className="grid grid-cols-6 gap-2 relative org-grid"
              style={{ zIndex: 2 }}
            >
              <div className="space-y-4 flex flex-col">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[180px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-13 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.0</p>
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

                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[180px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-13 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.1</p>
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
              </div>

              {/* Kolom 2 - Department Head */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.header?.title || "PPIC"}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "header",
                                null,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Section Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.header?.title || "PPIC"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* DIKI WAHYUDI */}
                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton({
                          code: "PPIC1.0",
                          name: dept.header.head,
                          empId: dept.header.empId,
                          title: dept.header.title,
                          departmentOid: dept.header.departmentOid,
                        })}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "head",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.header.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 3 - Section Head */}
              <div className="space-y-4 flex flex-col items-center"></div>

              {/* Kolom 4 - Unit Head/Staff */}
              <div className="space-y-4 flex-flex-col">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[0]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[0]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[0]?.title || "PPC CONTROLCABLE"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[0])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[0]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[1]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[1]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[1]?.title || "BATTERY & AHM OES"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[1])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[1]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[1]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[2]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[2]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[2]?.title || "WHS CONTROLCABLE"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[2])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[2]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[2]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[2]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[2]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 5 - Group Head */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[3]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[3]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[3]?.title || "CONTROLCABLE"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[3])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[3]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[3]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[3]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[3]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 6 - Member */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[4]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[4]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[4]?.title || "PROD PLAN"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[4])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[4]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[4]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[4]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[4]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[5]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[5]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[5]?.title || "DM/MANIFEST"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[5])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[5]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[5]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[5]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[5]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[6]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[6]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[6]?.title ||
                              "DELIVERY"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(6, 8).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[8]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[8]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[8]?.title ||
                              "BATTERY"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(8, 10).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[10]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[10]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[10]?.title || "SUPPLIER CONTROL"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[10])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[10]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[10]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[10]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[10]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[11]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[11]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[11]?.title || "MRP"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[11])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[11]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[11]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[11]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[11]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[12]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[12]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[12]?.title ||
                              "RM & OHP"}
                          </p>
                        )}
                      </div>
                    </div>

                    {dept.positions?.slice(12, 14).map((staff, i) => (
                      <div
                        key={i}
                        className={`flex border-b border-gray-300 flex-1 ${i === 2 ? "border-b-0" : ""
                          }`}
                      >
                        <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                          {renderCodeButton(staff)}
                        </div>
                        <div className="p-3 flex-1 text-center flex flex-col justify-center">
                          <EditableField
                            value={staff.name}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "name",
                                value
                              )
                            }
                            className="text-sm font-semibold leading-tight"
                          />
                          <EditableField
                            value={`(${staff.empId})`}
                            onSave={(value) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                staff.id,
                                "empId",
                                value.replace(/[()]/g, "")
                              )
                            }
                            className="text-sm leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[180px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[14]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[14]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[14]?.title || "SUPPLY"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[14])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[14]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[14]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[14]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[14]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                  <div>
                    <h1 className="text-base font-bold text-gray-800 mb-1">
                      STRUKTUR ORGANISASI
                    </h1>
                    <h2 className="text-base font-semibold text-gray-700 mb-1">
                      PT DHARMA CONTROLCABLE INDONESIA
                    </h2>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      (MANUFACTURING BATTERY DEPARTMENT)
                    </h3>
                    <p className="text-sm text-gray-500">
                      Effective Date : 16 Maret 2026
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-1">
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Prepared by:
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center ">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              M BAGUS SANTOSO
                            </p>
                            <p className="text-sm text-black leading-tight ">
                              DEPARTMENT HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Checked by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              DIKI WAHYUDI
                            </p>
                            <p className="text-sm text-black leading-tight">
                              HRGA&IT DEPT. HEAD
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-60 h-40 border border-black bg-white">
                        <div className="p-2 border-b border-black bg-white">
                          <p className="text-sm font-bold text-black">
                            Approved by :
                          </p>
                        </div>
                        <div className="p-3 flex flex-col justify-end h-32">
                          <div className="h-16"></div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-black underline leading-tight">
                              BAMBANG WURYANTO
                            </p>
                            <p className="text-sm text-black leading-tight">
                              DIRECTOR
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
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="bg-blue-300 p-2 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    BOARD OF DIRECTOR
                  </h3>
                </div>
                <div className="bg-blue-300 p-2 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    DEPARTMENT HEAD
                  </h3>
                </div>
                <div className="bg-blue-300 p-2 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    UNIT/STAFF LEVEL
                  </h3>
                </div>
                <div className="bg-blue-300 p-2 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">GROUP HEAD</h3>
                </div>
                <div className="bg-blue-300 p-2 rounded text-center border border-black">
                  <h3 className="font-bold text-xs text-black">
                    OPERATOR/ADMIN
                  </h3>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div
              className="grid grid-cols-5 gap-2 relative org-grid"
              style={{ zIndex: 2 }}
            >
              {/* Kolom 1 - Board of Director */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[220px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-13 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.0</p>
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

                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[220px]">
                  <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-13 flex items-center justify-center">
                    <p className="text-sm font-bold">BOD1.1</p>
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
              </div>

              {/* Kolom 2 - Department Head */}
              <div className="space-y-4 flex flex-col items-center">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.header?.title || "QUALITY ASSURANCE"}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "header",
                                null,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Section Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.header?.title || "QUALITY ASSURANCE"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex border-b border-gray-300 flex-1">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        {renderCodeButton({
                          code: "QAC1.1",
                          name: dept.header.head,
                          empId: dept.header.empId,
                          title: dept.header.title,
                        })}
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.header.head}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "head",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.header.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "header",
                              null,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 3 - Unit/Staff Level */}
              <div className="space-y-4 flex flex-col">
                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[0]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[0]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[0]?.title || "LAB & KALIBRASI"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[0])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[0]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[0]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[0]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 4 - Group Head */}
              <div className="space-y-4 flex flex-col items-center"></div>

              {/* Kolom 5 - Operator/Admin */}
              <div className="space-y-4 flex-col items-center staff-cards">
                <div className="bg-white border border-gray-400 rounded shadow-sm flex min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[1]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[1]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight whitespace-nowrap bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight whitespace-nowrap">
                            {dept.positions[1]?.title ||
                              "QUALITY ASSURANCE PROCESS"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[1])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[1]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[1]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[1]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[2]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[2]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[2]?.title || "LAB & KALIBRASI"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[2])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[2]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[2]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[2]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[2]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[3]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[3]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[3]?.title || "VENDOR MANAGEMENT"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[3])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[3]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[3]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[3]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[3]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-400 rounded shadow-sm min-h-[120px] w-[220px]">
                  <div className="flex flex-col h-full">
                    <div className="flex border-b border-gray-400">
                      <div className="p-2 flex-1 text-center bg-gray-100">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={dept.positions[4]?.title || ""}
                            onChange={(e) =>
                              handleEdit(
                                selectedDepartment.id,
                                "positions",
                                dept.positions[4]?.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="text-sm font-semibold leading-tight bg-yellow-50 border rounded px-2 py-1 w-full text-center"
                            placeholder="Position Title"
                          />
                        ) : (
                          <p className="text-sm font-semibold leading-tight">
                            {dept.positions[4]?.title || "LAB & KALIBRASI"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 border-b-0">
                      <div className="bg-gray-100 p-2 text-center border-r border-gray-400 w-20 flex items-center justify-center">
                        <p className="text-sm font-bold">
                          {renderCodeButton(dept.positions[4])}
                        </p>
                      </div>
                      <div className="p-3 flex-1 text-center flex flex-col justify-center">
                        <EditableField
                          value={dept.positions[4]?.name}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[4]?.id,
                              "name",
                              value
                            )
                          }
                          className="text-sm font-semibold leading-tight"
                        />
                        <EditableField
                          value={`(${dept.positions[4]?.empId})`}
                          onSave={(value) =>
                            handleEdit(
                              selectedDepartment.id,
                              "positions",
                              dept.positions[4]?.id,
                              "empId",
                              value.replace(/[()]/g, "")
                            )
                          }
                          className="text-sm leading-tight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
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
              <h1 className="text-xs font-bold text-gray-800 mb-1">
                SO Bagian
              </h1>
              <p className="text-gray-600">
                Edit struktur organisasi untuk semua departemen
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Pilih Departemen untuk Edit
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleDepartments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => {
                    setSelectedDepartment(dept);
                    setSidebarVisible(false);
                  }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {dept.name}
                    </h3>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536M9 13h6m-3-3v6m7-7a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      {departmentData[dept.id]?.header?.head || "TBD"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {departmentData[dept.id]?.positions?.length || 0}{" "}
                      positions
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : selectedDepartment && departmentData[selectedDepartment.id] ? (
          <div className="space-y-4">
            {/* Editor Toolbar */}
            <div className="bg-white shadow-sm border rounded-lg p-4 no-print">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setSelectedDepartment(null);
                      setSidebarVisible(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ← Back to Selection
                  </button>
                  <h2 className="text-xl font-semibold">
                    {selectedDepartment.name}
                  </h2>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${isEditMode
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                  >
                    {isEditMode ? "View Mode" : "Edit Mode"}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Tombol Print */}
                  <button
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-60"
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

                  {isEditMode && (
                    <button
                      onClick={() => openSubmitModal()}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Submit for Approval
                    </button>
                  )}
                </div>
              </div>

              {showSaveDialog && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold">
                    ✅ Changes saved successfully!
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Department page will reflect these changes immediately.
                  </p>
                </div>
              )}
            </div>

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

                {/* ✅ Important Notice */}
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

                {/* ✅ Buttons DIPINDAHKAN KE SINI - DALAM SPACE-Y-4 */}
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
      </div>
    </Layout>
  );
};

export default SoBagianEditor;