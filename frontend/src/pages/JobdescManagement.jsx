import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Users,
  FileText,
  Eye,
  Edit,
  Plus,
  Trash2,
  Printer,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  departmentsAPI,
  membersAPI,
  jobDescriptionsAPI,
  jobDescChangeRequestsAPI,
} from "../services/api";
import JobdescViewer from "../components/JobdescViewer";
import JobdescForm from "../components/JobdescForm";

const JobdescManagement = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentMembers, setDepartmentMembers] = useState([]);
  const [expandedDepartments, setExpandedDepartments] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showJobdescForm, setShowJobdescForm] = useState(false);
  const [showJobdescViewer, setShowJobdescViewer] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingJobdesc, setEditingJobdesc] = useState(null);
  const [jobDescriptions, setJobDescriptions] = useState({});

  console.log("JobdescManagement rendered, user:", user);

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

  useEffect(() => {
    console.log("useEffect triggered, user:", user);
    loadAccessibleDepartments();
  }, [user]);

  const isManagerForDepartment = (departmentName) => {
    const userPermissions = user?.role?.permissions || [];

    const departmentPermissionMap = {
      "Finance Department": "SO Bagian Finance Approval",
      "HRGA & IT Department": "SO Bagian HRGA & IT Approval",
      "Management Development": "SO Bagian Management Development Approval",
      "Management Representative":
        "SO Bagian Management Representative Approval",
      "Manufacturing Battery": "SO Bagian Manufacturing Battery Approval",
      "Manufacturing Cable": "SO Bagian Manufacturing Cable Approval",
      "Marketing Battery Department": "SO Bagian Marketing Battery Approval",
      "Marketing Engineering": "SO Bagian Marketing Engineering Approval",
      "MI & SHE": "SO Bagian MI & SHE Approval",
      PPIC: "SO Bagian PPIC Approval",
      Purchasing: "SO Bagian Purchasing Approval",
      "QA Department": "SO Bagian QA Approval",
    };
    const requiredPermission = departmentPermissionMap[departmentName];

    return (
      userPermissions.includes("Manage Users") ||
      (requiredPermission && userPermissions.includes(requiredPermission))
    );
  };

  const canManageMembers = selectedDepartment
    ? isManagerForDepartment(selectedDepartment)
    : false;

  const canCreateJobdesc = (member) => {
    const isDirector = isManagerForDepartment(selectedDepartment);

    // Cek kesamaan berdasarkan noPNK atau email
    const isSelf =
      (member.noPNK && user?.noPNK && member.noPNK === user.noPNK) ||
      (member.email &&
        user?.email &&
        member.email.toLowerCase() === user.email.toLowerCase()) ||
      (member.user && user?.id && member.user === user.id) ||
      (member.id && user?.id && member.id === user.id);

    console.log("🔍 canCreateJobdesc check:", {
      memberName: member.name,
      memberNoPNK: member.noPNK,
      memberEmail: member.email,
      userName: user?.name,
      userNoPNK: user?.noPNK,
      userEmail: user?.email,
      isDirector,
      isSelf,
      result: isDirector || isSelf,
    });

    return isDirector || isSelf;
  };

  const loadAccessibleDepartments = async () => {
    try {
      console.log("Loading accessible departments...");
      setLoading(true);

      const response = await departmentsAPI.getAll();
      const allDepartments = response.data.data;

      const userPermissions = user?.role?.permissions || [];
      const userDepartmentName = user?.department?.name;

      console.log("User permissions:", userPermissions);
      console.log("User department:", userDepartmentName);

      const accessibleDepts = allDepartments.filter((dept) => {
        if (userPermissions.includes("Manage Users")) {
          return true;
        }

        if (userDepartmentName === dept.name) {
          return true;
        }

        const requiredPermissions = departmentPermissions[dept.name] || [];
        return requiredPermissions.some((permission) =>
          userPermissions.includes(permission)
        );
      });

      console.log("Accessible departments:", accessibleDepts);
      setDepartments(accessibleDepts);
      setError("");
    } catch (err) {
      console.error("Error loading departments:", err);
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentMembers = async (departmentId) => {
    try {
      setLoading(true);

      const [membersResponse, jobdescResponse] = await Promise.all([
        membersAPI.getByDepartment(departmentId),
        jobDescriptionsAPI
          .getByDepartment(departmentId)
          .catch(() => ({ data: { data: [] } })),
      ]);

      const members = membersResponse.data.data;
      const jobDescriptions = jobdescResponse.data.data || [];

      setDepartmentMembers(members);

      const jobDescsMap = {};

      jobDescriptions.forEach((jobdesc) => {
        const member = members.find(
          (m) =>
            (jobdesc.member && m.id === jobdesc.member._id) ||
            (jobdesc.user && m.id === jobdesc.user._id) ||
            (jobdesc.member && m.id === jobdesc.member) ||
            (jobdesc.user && m.id === jobdesc.user) ||
            (jobdesc.memberNoPNK && m.noPNK === jobdesc.memberNoPNK)
        );

        if (member) {
          jobDescsMap[member.id] = jobdesc;
          console.log(`Job description mapped for ${member.name}:`, jobdesc);
        }
      });

      console.log("Members loaded:", members);
      console.log("Job descriptions loaded:", jobDescriptions);
      console.log("Job descriptions mapped:", jobDescsMap);
      setJobDescriptions(jobDescsMap);
    } catch (err) {
      console.error("Error loading department members:", err);
      setError(
        "Failed to load department members: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartment = (departmentName, departmentId) => {
    console.log("Toggling department:", departmentName);
    const newExpanded = new Set(expandedDepartments);

    if (newExpanded.has(departmentName)) {
      newExpanded.delete(departmentName);
      if (selectedDepartment === departmentName) {
        setSelectedDepartment(null);
        setDepartmentMembers([]);
      }
    } else {
      newExpanded.add(departmentName);
      setSelectedDepartment(departmentName);
      loadDepartmentMembers(departmentId);
    }

    setExpandedDepartments(newExpanded);
  };

  const handleAddMember = async (newMemberData) => {
    try {
      setLoading(true);
      const selectedDept = departments.find(
        (d) => d.name === selectedDepartment
      );

      console.log("📤 Sending member data:", {
        name: newMemberData.name,
        noPNK: newMemberData.noPNK,
        position: newMemberData.position,
        department: selectedDept._id,
      });

      const memberData = {
        ...newMemberData,
        noPNK: newMemberData.noPNK,
        department: selectedDept._id,
      };

      const response = await membersAPI.create(memberData);

      if (response.data.success) {
        await loadDepartmentMembers(selectedDept._id);
        setShowAddMemberModal(false);
        alert("Member added successfully");
      }
    } catch (err) {
      console.error("Error adding member:", err);
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJobdesc = (member) => {
    setSelectedMember(member);
    setEditingJobdesc(null);
    setShowJobdescForm(true);
  };

  const handleViewJobdesc = (member) => {
    setSelectedMember(member);
    setShowJobdescViewer(true);
  };

  const handleEditJobdesc = (member) => {
    setSelectedMember(member);
    setEditingJobdesc(jobDescriptions[member.id] || null);
    setShowJobdescForm(true);
  };

  const handleDeleteJobdesc = async (member) => {
    if (
      window.confirm(
        `Are you sure you want to delete job description for ${member.name}?`
      )
    ) {
      try {
        const jobdesc = jobDescriptions[member.id];
        if (jobdesc) {
          await jobDescriptionsAPI.delete(jobdesc._id);

          const updatedJobDescs = { ...jobDescriptions };
          delete updatedJobDescs[member.id];
          setJobDescriptions(updatedJobDescs);

          alert("Job description deleted successfully");
        }
      } catch (err) {
        console.error("Error deleting job description:", err);
        setError(
          err.response?.data?.message || "Failed to delete job description"
        );
      }
    }
  };

  const handleDeleteMember = async (member) => {
    if (
      window.confirm(
        `Are you sure you want to delete member ${member.name}? This will also delete their job description.`
      )
    ) {
      try {
        await membersAPI.delete(member.id);

        const selectedDept = departments.find(
          (d) => d.name === selectedDepartment
        );
        await loadDepartmentMembers(selectedDept._id);

        alert("Member deleted successfully");
      } catch (err) {
        console.error("Error deleting member:", err);
        setError(err.response?.data?.message || "Failed to delete member");
      }
    }
  };

  const handlePrint = (member) => {
    const jobdesc = jobDescriptions[member.id];
    if (!jobdesc) {
      alert("No job description found for this member");
      return;
    }

    const jobDescHTML = `
      <div class="bg-white border-2 border-black">
        <!-- Header Section -->
        <div class="border-b-2 border-black">
          <div class="flex">
            <!-- Logo and Company Section -->
            <div class="w-64 border-r-2 border-black p-2">
              <div class="flex flex-col items-center">
                <img src="/images/dcilong.png" alt="Dharma Group Logo" class="max-w-full max-h-26 object-contain mb-2" />
              </div>
            </div>
            
            <!-- Title Section -->
            <div class="flex-1 border-r-2 border-black flex flex-col justify-between p-2">
              <div></div>
              <div class="text-center">
                <h1 class="text-xl font-bold italic">JOB DESCRIPTION</h1>
              </div>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div class="text-left">
                  <span class="font-medium">Tanggal: </span>
                  <span>${
                    jobdesc?.tanggal
                      ? new Date(jobdesc.tanggal).toLocaleDateString("id-ID")
                      : new Date().toLocaleDateString("id-ID")
                  }</span>
                </div>
                <div class="text-left">
                  <span class="font-medium">Revisi: </span>
                  <span>${jobdesc?.revisi || "0"}</span>
                </div>
              </div>
            </div>
            
            <!-- Dibuat Section -->
            <div class="w-32 border-r-2 border-black">
              <div class="border-b border-black p-1 text-center">
                <p class="text-xs font-bold">Dibuat,</p>
              </div>
              <div class="border-b border-black p-12 text-center">
                <!-- Space for signature -->
              </div>
            </div>

            <!-- Disetujui Section -->
            <div class="w-32">
              <div class="border-b border-black p-1 text-center">
                <p class="text-xs font-bold">Disetujui,</p>
              </div>
              <div class="border-b border-black p-12 text-center">
                <!-- Space for signature -->
              </div>
            </div>
          </div>
        </div>

        <!-- Employee Info Section -->
        <div class="border-b-2 border-black">
          <div class="flex">
            <div class="flex-1 border-r border-black">
              <div class="border-b border-black p-3">
                <div class="flex">
                  <span class="font-bold w-32">DIVISION</span>
                  <span class="mr-2">:</span>
                  <span>${jobdesc?.division || "-"}</span>
                </div>
              </div>
              <div class="p-3">
                <div class="flex">
                  <span class="font-bold w-32">POSITION TITLE</span>
                  <span class="mr-2">:</span>
                  <span>${jobdesc?.positionTitle || "-"}</span>
                </div>
              </div>
            </div>
            <div class="flex-1">
              <div class="border-b border-black p-3">
                <div class="flex">
                  <span class="font-bold w-32">DEPARTMENT</span>
                  <span class="mr-2">:</span>
                  <span>${(
                    jobdesc?.department?.name ||
                    member?.department?.name ||
                    "-"
                  ).toUpperCase()}</span>
                </div>
              </div>
              <div class="p-3">
                <div class="flex">
                  <span class="font-bold w-32">REPORTS TO</span>
                  <span class="mr-2">:</span>
                  <span>${jobdesc?.reportsTo || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Responsibilities -->
        <div class="border-b border-black p-3">
          <div class="mb-2">
            <span class="font-bold text-sm">RESPONSIBILITIES</span>
            <span class="text-xs ml-8">(Responsibilities berisi urutan tugas pemegang jabatan serta tugas-tugas yang dilaksanakannya - berkaitan dengan jabatan yang dipegangnya, bisa tugas harian atau tugas bekala)</span>
          </div>
          <ol class="list-decimal list-inside space-y-1 text-sm">
            ${
              jobdesc?.responsibilities && jobdesc.responsibilities.length > 0
                ? jobdesc.responsibilities
                    .map((responsibility) => `<li>${responsibility}</li>`)
                    .join("")
                : "<li>No responsibilities defined</li>"
            }
          </ol>
        </div>

        <!-- Accountabilities -->
        <div class="border-b border-black p-3">
          <div class="mb-2">
            <span class="font-bold text-sm">ACCOUNTABILITIES</span>
            <span class="text-xs ml-8">(Accountabilities berisi wewenang yang diberikan kepada jabatan untuk dapat melaksanakan tugas dengan baik, dan dapat dievaluasi pencapaiannya)</span>
          </div>
          <ol class="list-decimal list-inside space-y-1 text-sm">
            ${
              jobdesc?.accountabilities && jobdesc.accountabilities.length > 0
                ? jobdesc.accountabilities
                    .map((accountability) => `<li>${accountability}</li>`)
                    .join("")
                : "<li>No accountabilities defined</li>"
            }
          </ol>
        </div>

        <!-- Interactions -->
        <div class="border-b border-black p-3">
          <div class="mb-2">
            <span class="font-bold text-sm">INTERACTIONS</span>
            <span class="text-xs ml-8">(Interaksi berisi  bagian / dengan siapa saja yang bersangkutan berhubungan / bekerjasama untuk kelancaran tugas - tugasnya, baik didalam maupun diluar perusahaan)</span>
          </div>
          <ol class="list-decimal list-inside space-y-1 text-sm">
            ${
              jobdesc?.interactions?.internal &&
              jobdesc.interactions.internal.length > 0
                ? jobdesc.interactions.internal
                    .map((interaction) => `<li>${interaction}</li>`)
                    .join("")
                : "<li>No interactions defined</li>"
            }
          </ol>
        </div>

        <!-- Competence -->
        <div class="border-b border-black p-3">
          <div class="mb-2">
            <span class="font-bold text-sm">COMPETENCE</span>
            <span class="text-xs ml-8"> (Competence berisi keahlian dan / atau pengetahuan khusus yang harus dimiliki pemegang jabatan untuk dapat berhasil dalam melaksanakan tugasnya. Diberikan juga lamanya waktu minimal pengalaman dibidang tersebut)</span>
          </div>
          
          <div class="grid grid-cols-2 gap-8">
            <div>
              <p class="font-bold text-sm mb-2">A. Competence Managerial :</p>
              <ol class="list-decimal list-inside space-y-1 text-sm">
                ${
                  jobdesc.competence?.managerial &&
                  jobdesc.competence.managerial.length > 0
                    ? jobdesc.competence.managerial
                        .map((comp) => `<li>${comp}</li>`)
                        .join("")
                    : [
                        "Teamwork",
                        "Trouble Shooting",
                        "Customer Satisfaction",
                        "Cross Functional Capability",
                        "Quality Focus",
                        "Cost Efficiency",
                        "Continuous Improvement",
                        "Planning Monitoring",
                        "Personal Integrity",
                        "Drive for Result",
                      ]
                        .map((comp) => `<li>${comp}</li>`)
                        .join("")
                }
              </ol>
            </div>
            <div>
              <p class="font-bold text-sm mb-2">B. Competence Skill :</p>
              <ol class="list-decimal list-inside space-y-1 text-sm">
                ${
                  jobdesc.competence?.skill &&
                  jobdesc.competence.skill.length > 0
                    ? jobdesc.competence.skill
                        .map((comp) => `<li>${comp}</li>`)
                        .join("")
                    : [
                        "Microsoft Office",
                        "Komunikasi",
                        "Report",
                        "Administration",
                        "SAP",
                        "Oracle Plus",
                      ]
                        .map((comp) => `<li>${comp}</li>`)
                        .join("")
                }
              </ol>
            </div>
          </div>
        </div>

        <!-- Job Specification -->
        <div class="p-3">
          <div class="mb-2">
            <span class="font-bold text-sm">JOB SPECIFICATION</span>
            <span class="text-xs ml-8">(berisi persyaratan yang harus dipenuhi pemegang jabatan)</span>
          </div>
          
          <div class="grid grid-cols-2 gap-8 text-sm">
            <div class="space-y-1">
              <div class="flex">
                <span class="w-44">Usia</span>
                <span class="mr-2">:</span>
                <span>${jobdesc.jobSpecification?.age || "Min. 21 Tahun"}</span>
              </div>
              <div class="flex">
                <span class="w-44">Pendidikan</span>
                <span class="mr-2">:</span>
                <span>${
                  jobdesc.jobSpecification?.education || "Minimal D3"
                }</span>
              </div>
              <div class="flex">
                <span class="w-44">Pendidikan Non Formal</span>
                <span class="mr-2">:</span>
                <span>${
                  jobdesc.jobSpecification?.nonFormalEducation || "-"
                }</span>
              </div>
              <div class="flex">
                <span class="w-44">Pengalaman Kerja</span>
                <span class="mr-2">:</span>
                <span>${
                  jobdesc.jobSpecification?.experience || "Min. 1 Tahun"
                }</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Job Description - ${member.name}</title>
        <style>
          @page { 
            size: A4 portrait; 
            margin: 3mm; 
            border: 2px solid #000;
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 2mm; 
            background: white; 
            color: black;
            width: 100%;
            min-height: 100vh;
            box-sizing: border-box;
            border: 2px solid #000;
            font-size: 11px;
            line-height: 1.3;
          }
          .border-2 { 
            border: none; 
            width: 100%;
            min-height: 100%;
            margin: 0;
            box-sizing: border-box;
          }
          .border-black { border-color: #000 !important; }
          .border-b-2 { border-bottom: 2px solid #000 !important; }
          .border-r-2 { border-right: 2px solid #000 !important; }
          .border-b { border-bottom: 1px solid #000 !important; }
          .border-r { border-right: 1px solid #000 !important; }
          .flex { display: flex; }
          .flex-1 { flex: 1; }
          .flex-col { flex-direction: column; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .text-center { text-align: center; }
          .grid { display: grid; }
          .grid-cols-2 { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 1.2rem;
          }
          .gap-8 { gap: 1.2rem; }
          .space-x-8 > * + * { margin-left: 1.2rem; }
          .space-y-1 > * + * { margin-top: 0.3rem; }
          .w-32 { width: 7rem; }
          .w-40 { width: 8.5rem; }
          .w-44 { width: 10rem; }
          .w-64 { width: 14rem; }
          .p-1 { padding: 0.2rem; }
          .p-2 { padding: 0.6rem; }
          .p-3 { padding: 0.8rem; }
          .p-4 { padding: 1.0rem; }
          .p-6 { padding: 0.8rem; }
          .p-7 { padding: 1.0rem; }
          .p-8 { padding: 1.2rem; }
          .p-12 { padding: 2.0rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-3 { margin-bottom: 0.6rem; }
          .ml-2 { margin-left: 0.5rem; }
          .mr-2 { margin-right: 0.5rem; }
          .ml-6 { margin-left: 1.0rem; }
          .ml-8 { margin-left: 1.5rem; }
          .text-xl { 
            font-size: 16px; 
            font-weight: bold; 
            line-height: 1.3;
          }
          .text-sm { 
            font-size: 12px; 
            line-height: 1.3;
          }
          .text-xs { 
            font-size: 10px; 
            line-height: 1.2;
          }
          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          .italic { font-style: italic; }
          .list-decimal { 
            list-style-type: decimal; 
            padding-left: 1.2rem;
            margin: 0.4rem 0;
          }
          .list-inside { list-style-position: inside; }
          img { 
            max-width: 100%; 
            max-height: 50px; 
            object-fit: contain; 
          }
          
          /* Optimize space usage */
          ol, ul {
            margin: 0.4rem 0;
            padding-left: 1.2rem;
          }
          li {
            margin-bottom: 0.3rem;
            line-height: 1.3;
          }
          
          /* Compact sections */
          .content-section {
            margin-bottom: 0;
          }
          
          /* Header section optimization */
          .header-section {
            flex-shrink: 0;
            min-height: auto;
          }
            break-after: avoid;
          }
          
          /* Each major section styling */
          .job-section {
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
          }
          
          /* Ensure proper page margins are maintained */
          html, body {
            box-sizing: border-box;
          }
          /* Image sizing for larger container */
          img {
            max-width: 100%;
            max-height: 90px;
            object-fit: contain;
          }
          
          /* SIMPLE BORDER FIX - LANGSUNG KE INTINYA */
          
          /* Hilangkan semua gap dan margin */
          * {
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          
          /* Container utama tanpa padding sama sekali */
          body, .border-2 {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Semua elemen border langsung ke tepi */
          .border-b, .border-b-2, .border-r, .border-r-2 {
            position: relative !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Konten dalam elemen diberi padding terpisah */
          .p-1 { padding: 0.2rem !important; }
          .p-2 { padding: 0.4rem !important; }
          .p-3 { padding: 0.5rem !important; }
          .p-6 { padding: 0.8rem !important; }
          .p-8 { padding: 1.0rem !important; }
          .p-12 { padding: 1.8rem !important; }
          
          /* Khusus untuk margin-left spacing section titles */
          .ml-8 { margin-left: 1.5rem !important; }
        </style>
      </head>
      <body>
        ${jobDescHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleJobdescSave = async (jobdescData, isNewRequest = false) => {
    try {
      setLoading(true);
      const selectedDept = departments.find(
        (d) => d.name === selectedDepartment
      );

      if (!selectedDept) {
        alert("Department not found");
        return;
      }

      if (isNewRequest) {
        console.log(
          "🔄 Creating new job description - sending to approval flow"
        );

        if (
          !confirm(
            "This will submit the job description for approval. Continue?"
          )
        ) {
          setLoading(false);
          return;
        }

        const changeRequestPayload = {
          title: `New Job Description for ${selectedMember.name}`,
          description: `Job description creation request for ${selectedMember.name} (${selectedMember.noPNK}) - Position: ${jobdescData.positionTitle}`,
          changeType: "add",
          department: selectedDepartment,
          priority: "medium",
          proposedData: {
            jobDescData: {
              member:
                selectedMember.type === "member" ? selectedMember.id : null,
              user: selectedMember.user || null,
              memberName: selectedMember.name,
              memberNoPNK: selectedMember.noPNK,
              memberEmail: selectedMember.email,
              memberPosition: selectedMember.position,
              department: selectedDept._id,
              tanggal: jobdescData.tanggal || new Date().toISOString(),
              revisi: jobdescData.revisi || "0",
              division: jobdescData.division,
              positionTitle: jobdescData.positionTitle,
              reportsTo: jobdescData.reportsTo,
              responsibilities: jobdescData.responsibilities || [],
              accountabilities: jobdescData.accountabilities || [],
              interactions: jobdescData.interactions || {
                internal: [],
                external: [],
              },
              competence: jobdescData.competence || {
                managerial: [],
                technical: [],
                behavioral: [],
                skill: [],
              },
              jobSpecification: jobdescData.jobSpecification || {},
            },
            memberInfo: {
              name: selectedMember.name,
              noPNK: selectedMember.noPNK,
              email: selectedMember.email,
              position: selectedMember.position,
            },
            organizationData: {
              departmentId: selectedDept._id,
              departmentName: selectedDepartment,
              header: {
                effectiveDate: new Date().toLocaleDateString("en-GB"),
                _effectiveDateTs: new Date().toISOString(),
              },
              signatures: {
                preparedBy: {
                  date: new Date().toLocaleDateString("en-GB"),
                  _ts: new Date().toISOString(),
                },
                approvedBy: {
                  date: "",
                  _ts: "",
                },
              },
            },
          },
          currentData: null,
        };

        console.log(
          "📤 Sending job desc change request:",
          changeRequestPayload
        );

        const response = await jobDescChangeRequestsAPI.create(
          changeRequestPayload
        );

        if (response.data.success) {
          alert("✅ Job description submitted for approval successfully!");
          setShowJobdescForm(false);
          setSelectedMember(null);
          setEditingJobdesc(null);
          await loadDepartmentMembers(selectedDept._id);
        }
      }
      else {
        console.log("🔄 Updating existing job description - direct save");

        const payload = {
          ...jobdescData,
          member: selectedMember.type === "member" ? selectedMember.id : null,
          user: selectedMember.user || null,
          memberName: selectedMember.name,
          memberNoPNK: selectedMember.noPNK,
          memberEmail: selectedMember.email,
          memberPosition: selectedMember.position,
          department: selectedDept._id,
        };

        let response;
        if (editingJobdesc) {
          response = await jobDescriptionsAPI.update(
            editingJobdesc._id,
            payload
          );
        } else {
          response = await jobDescriptionsAPI.create(payload);
        }

        if (response.data.success) {
          setJobDescriptions((prev) => ({
            ...prev,
            [selectedMember.id]: response.data.data,
          }));

          setShowJobdescForm(false);
          setSelectedMember(null);
          setEditingJobdesc(null);
          alert("Job description updated successfully");
        }
      }
    } catch (err) {
      console.error("Error saving job description:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to save job description";
      alert(`Error: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  console.log("Rendering component, departments:", departments.length);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Job Description Management
          </h1>
          <p className="text-gray-600">
            Manage job descriptions for all department members.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700 text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex gap-6 h-[calc(100vh-240px)]">
          {/* Department List - Scrollable */}
          <div className="w-1/3 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Departments ({departments.length})
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Click on a department to view its members
                </p>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {loading && departments.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading departments...
                    </span>
                  </div>
                ) : departments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg mb-2">🏢</div>
                    <p className="text-gray-500">
                      No accessible departments found
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Contact your administrator for access
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {departments.map((dept) => (
                      <div
                        key={dept._id}
                        className="border border-gray-200 rounded-lg"
                      >
                        <button
                          onClick={() => toggleDepartment(dept.name, dept._id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {dept.name}
                            </h3>
                            <p className="text-sm text-gray-600">{dept.code}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {selectedDepartment === dept.name &&
                              departmentMembers.length > 0 && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {departmentMembers.length} members
                                </span>
                              )}
                            {expandedDepartments.has(dept.name) ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Department Members - Fixed Position */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      {selectedDepartment
                        ? `${selectedDepartment} - Members`
                        : "Department Members"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedDepartment
                        ? "View and manage job descriptions for department members"
                        : "Select a department to view its members"}
                    </p>
                  </div>
                  {selectedDepartment && canManageMembers && (
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
                      disabled={loading}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Member
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                {!selectedDepartment ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">👥</div>
                    <p className="text-gray-500">
                      Select a department from the list
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Choose a department to view its members and manage their
                      job descriptions
                    </p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading members...
                    </span>
                  </div>
                ) : departmentMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">👤</div>
                    <p className="text-gray-500">
                      No members found in this department
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Click "Add Member" to add the first member to this
                      department
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {departmentMembers.map((member) => {
                      const hasJobdesc = jobDescriptions[member.id];
                      const canCreate = canCreateJobdesc(member);
                      return (
                        <div
                          key={member.id}
                          className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-semibold text-base">
                                  {member.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                  {member.name}
                                </h3>
                                <div className="space-y-1">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span className="font-medium w-16">
                                      Position:
                                    </span>
                                    <span>{member.position}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end space-y-3 ml-6">
                              <div className="flex space-x-2">
                                {/* Show Create button only if no job description exists */}

                                {!hasJobdesc && canCreate && (
                                  <button
                                    onClick={() => handleCreateJobdesc(member)}
                                    className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded transition-colors duration-200 border border-green-200"
                                    title="Create Job Description"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                )}
                                {!hasJobdesc && !canCreate && (
                                  <button
                                    disabled
                                    className="bg-gray-100 text-gray-400 p-2 rounded cursor-not-allowed border border-gray-200"
                                    title="Only the employee or department director can create"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Show other buttons only if job description exists */}
                                {hasJobdesc && (
                                  <>
                                    <button
                                      onClick={() => handleViewJobdesc(member)}
                                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded transition-colors duration-200 border border-blue-200"
                                      title="View Job Description"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    {canCreate && (
                                      <button
                                        onClick={() =>
                                          handleEditJobdesc(member)
                                        }
                                        className="bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded transition-colors duration-200 border border-amber-200"
                                        title="Edit Job Description"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                    )}
                                    {!canCreate && (
                                      <button disabled>Edit</button>
                                    )}
                                    {jobDescriptions[member.id] && (
                                      <button
                                        onClick={() => handlePrint(member)}
                                        className="bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded transition-colors duration-200 border border-purple-200"
                                        title="Print Job Description"
                                      >
                                        <Printer className="w-4 h-4" />
                                      </button>
                                    )}
                                  </>
                                )}

                                {canManageMembers ? (
                                  <button
                                    onClick={() => handleDeleteMember(member)}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded transition-colors duration-200 border border-red-200"
                                    title="Delete Member"
                                    disabled={loading}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    className="bg-gray-100 text-gray-400 p-2 rounded cursor-not-allowed border border-gray-200"
                                    title="Only Managers can delete members"
                                    disabled
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          departmentName={selectedDepartment}
          onSave={handleAddMember}
          onCancel={() => setShowAddMemberModal(false)}
          loading={loading}
        />
      )}

      {/* Job Description Form Modal */}
      {showJobdescForm && selectedMember && (
        <JobdescForm
          user={selectedMember}
          existingJobdesc={editingJobdesc}
          selectedDepartment={selectedDepartment}
          onSave={handleJobdescSave}
          onCancel={() => {
            setShowJobdescForm(false);
            setSelectedMember(null);
            setEditingJobdesc(null);
          }}
        />
      )}

      {/* Job Description Viewer Modal */}
      {showJobdescViewer && selectedMember && (
        <JobdescViewer
          user={selectedMember}
          jobdesc={jobDescriptions[selectedMember.id] || null}
          onClose={() => {
            setShowJobdescViewer(false);
            setSelectedMember(null);
          }}
          onEdit={() => {
            setShowJobdescViewer(false);
            handleEditJobdesc(selectedMember);
          }}
          onDelete={() => {
            setShowJobdescViewer(false);
            handleDeleteJobdesc(selectedMember);
          }}
        />
      )}
    </div>
  );
};

const AddMemberModal = ({
  departmentName,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    noPNK: "",
    position: "Staff",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.noPNK && formData.position) {
      onSave(formData);
      setFormData({ name: "", noPNK: "", position: "Staff" });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-lg bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add Member to {departmentName}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
              placeholder="Enter member's full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. PNK <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.noPNK}
              onChange={(e) =>
                setFormData({ ...formData, noPNK: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
              placeholder="Enter PNK number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="Staff">Staff</option>
              <option value="Senior Staff">Senior Staff</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Assistant Manager">Assistant Manager</option>
              <option value="Manager">Manager</option>
              <option value="Dept Head">Dept Head</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !formData.name || !formData.noPNK}
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const JobDescriptionForm = ({ member, departmentName, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    division: "",
    department: departmentName,
    positionTitle: member.position,
    reportsTo: "",
    responsibilities: [""],
    accountabilities: [""],
    interactions: [""],
    competence: [""],
    jobSpecification: {
      age: { min: "", max: "" },
      education: "",
      nonFormalEducation: "",
      experience: "",
    },
  });

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const updateArrayItem = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Job Description created for ${member.name}`);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-lg bg-white my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Create Job Description
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Employee: <span className="font-medium">{member.name}</span> (
              {member.noPNK})
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <Plus className="w-6 h-6 transform rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division
                </label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) =>
                    setFormData({ ...formData, division: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter division"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position Title
                </label>
                <input
                  type="text"
                  value={formData.positionTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, positionTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reports To
                </label>
                <input
                  type="text"
                  value={formData.reportsTo}
                  onChange={(e) =>
                    setFormData({ ...formData, reportsTo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter supervisor name"
                />
              </div>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Responsibilities
              </h4>
              <button
                type="button"
                onClick={() => addArrayItem("responsibilities")}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add
              </button>
            </div>
            {formData.responsibilities.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <span className="text-gray-600 text-sm mt-2">{index + 1}.</span>
                <textarea
                  value={item}
                  onChange={(e) =>
                    updateArrayItem("responsibilities", index, e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder={`Responsibility ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("responsibilities", index)}
                  className="text-red-600 hover:text-red-700 px-2"
                  disabled={formData.responsibilities.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Accountabilities */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Accountabilities
              </h4>
              <button
                type="button"
                onClick={() => addArrayItem("accountabilities")}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add
              </button>
            </div>
            {formData.accountabilities.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <textarea
                  value={item}
                  onChange={(e) =>
                    updateArrayItem("accountabilities", index, e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder={`Accountability ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("accountabilities", index)}
                  className="text-red-600 hover:text-red-700 px-2"
                  disabled={formData.accountabilities.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Interactions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Interactions
              </h4>
              <button
                type="button"
                onClick={() => addArrayItem("interactions")}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add
              </button>
            </div>
            {formData.interactions.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    updateArrayItem("interactions", index, e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Interaction ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("interactions", index)}
                  className="text-red-600 hover:text-red-700 px-2"
                  disabled={formData.interactions.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Competence */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Competence</h4>
              <button
                type="button"
                onClick={() => addArrayItem("competence")}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add
              </button>
            </div>
            {formData.competence.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    updateArrayItem("competence", index, e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Competence ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("competence", index)}
                  className="text-red-600 hover:text-red-700 px-2"
                  disabled={formData.competence.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Job Specification */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Job Specification
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Age
                </label>
                <input
                  type="number"
                  value={formData.jobSpecification.age.min}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jobSpecification: {
                        ...formData.jobSpecification,
                        age: {
                          ...formData.jobSpecification.age,
                          min: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Age
                </label>
                <input
                  type="number"
                  value={formData.jobSpecification.age.max}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jobSpecification: {
                        ...formData.jobSpecification,
                        age: {
                          ...formData.jobSpecification.age,
                          max: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <textarea
                  value={formData.jobSpecification.education}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jobSpecification: {
                        ...formData.jobSpecification,
                        education: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <textarea
                  value={formData.jobSpecification.experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jobSpecification: {
                        ...formData.jobSpecification,
                        experience: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
            >
              Save Job Description
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobdescManagement;
