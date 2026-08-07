import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import RolePermission from './pages/RolePermission';
import Department from './pages/Department';
import FinanceDepartment from './pages/FinanceDepartment';
import HrgaIt from './pages/HrgaIt';
import ManagementDevelopment from './pages/ManagementDevelopment';
import MiShe from './pages/MiShe';
import MarketingEngineering from './pages/MarketingEngineering';
import ManagementRepresentative from './pages/ManagementRepresentative';
import Purchasing from './pages/Purchasing';
import Ppic from './pages/Ppic';
import ManufacturBattery from './pages/ManufacturBattery';
import ManufacturingCable from './pages/ManufacturingCable';
import QaDepartment from './pages/QaDepartment';
import MarketingBatteryDepartment from './pages/MarketingBatteryDepartment';
import DashboardEditor from './pages/DashboardEditor';
import DashboardEditorAdvanced from './pages/DashboardEditorAdvanced';
import OrganizationDemo from './pages/OrganizationDemo';
import SoBagianEditor from './pages/SoBagianEditor';
import DepartmentEditor from './components/DepartmentEditor';
import JobdescManagement from './pages/JobdescManagement';
import SOChangeRequests from './pages/SOChangeRequests';
import SOBagianChangeRequests from './pages/SOBagianChangeRequests';
import JobDescChangeRequests from './pages/JobDescChangeRequests';
import MatriksSkill from './pages/MatriksSkill';
import MatriksSkillChangeRequests from './pages/MatriksSkillChangeRequests';
import JobdescViewer from './components/JobdescViewer';

// ────────────────────────────────────────────────────────────────
// Logic pencocokan jobdesc (dipindah dari Dashboard.jsx onCodeClick)
// Dipakai oleh JobdescViewerPage di bawah.
// ────────────────────────────────────────────────────────────────
const codeTitleKeywords = {
  "ENG1.0": ["ENGINEERING", "ENG1.0"],
  "ENG1.1": ["ENGINEERING", "QUALITY ENGINEERING", "ENG1.1"],
  "ENG1.2": ["PROCESS ENGINEERING", "ENG1.2"],
  "ENG1.3": ["NEW BUSINESS", "BESS", "ENG1.3"],
  "MKT1.0": ["MARKETING CABLE", "SALES MARKETING", "MKT1.0"],
  "MKT1.1": ["MARKETING", "MKT1.1"],
  "MKT1.1.1": ["MKT1.1.1"],
  "MKT1.1.2": ["MKT1.1.2"],
  "MKT1.1.3": ["CUSTOMER REPRESENTATIVE", "MKT1.1.3"],
  "MKT2.0": ["MARKETING BATTERY", "MKT2.0", "MARKETING CABLE"],
  "MKT2.1": ["AUX", "POWER BATTERY MARKETING", "MKT2.1", "MARKETING", "RND AUX"],
  "MKT2.2": ["ESS MARKETING", "MKT2.2"],
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
  "HRD1.0": ["HRDGA", "HRGA", "HRD DEPT", "HRD1.0", "HRD"],
  "HRD1.1": ["HRD", "HRD1.1"],
  "HRD2.0": ["HRD2.0"],
  "GA1.1": ["GENERAL AFFAIR", "GA1.1"],
  "GA1.2": ["GENERAL AFFAIR", "GA1.2"],
  "GA1.3": ["GENERAL AFFAIR", "GA1.3"],
  "IT1.1": ["INFORMATION TECHNOLOGY", "IT1.1"],
  "IT1.2": ["INFORMATION TECHNOLOGY", "IT1.2"],
  "FIN1.0": ["FINANCE", "ACCOUNTING", "FIN1.0"],
  "FIN1.1": ["FINANCE", "ACCOUNTING", "FIN1.1"],
  "FIN1.2": ["FIN1.2"],
  "FIN1.3": ["FIN1.3"],
  "FIN1.4": ["FIN1.4"],
  "PCH1.0": ["PROCUREMENT", "PURCHASING", "PCH1.0"],
  "PCH1.1": ["CONTROLCABLE", "PCH1.1"],
  "PCH1.2": ["BATTERY", "PCH1.2"],
  "PCH1.3": ["GENERAL", "LEGAL", "PCH1.3"],
  "PCH1.4": ["SUBCONT", "PCH1.4"],
  "QAC1.0": ["QUALITY ASSURANCE", "QA DEPT", "QAC1.0"],
  "QAC1.1": ["QA", "QUALITY", "QAC1.1"],
  "QAC1.1.1": ["QUALITY ASSURANCE PROCESS", "QAC1.1.1"],
  "QAC1.1.2": ["QAC1.1.2"],
  "QAC1.1.3": ["LAB", "KALIBRASI", "QAC1.1.3"],
  "QAC1.1.4": ["VENDOR MANAGEMENT", "QAC1.1.4"],
  "QAC1.1.5": ["CLAIM", "COMPLAIN", "QAC1.1.5"],
  "QAC2.0": ["QA BATTERY", "QAC2.0"],
  "CR02.0": ["QA BATTERY", "CR02.0"],
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
  "PRD2.0": ["BATTERY PRODUCTION", "PME", "PRD2.0", "MANUFACTURING"],
  "PRD2.1": ["BATTERY PRODUCTION", "PRD2.1"],
  "PRD2.2": ["PRD2.2"],
  "PRD2.3": ["QUALITY ASSURANCE", "PRD2.3"],
  "PRD3.0": ["BATTERY PME", "PRD3.0"],
  "RND1.0": ["RND", "BESS", "RND1.0"],
  "RND1.1": ["AUX", "POWER BATTERY ENGINEERING", "RND1.1"],
  "RND1.2": ["ESS ENGINEERING", "RND1.2"],
  "RND1.3": ["MICRO CONTROLLER", "RND1.3"],
  "MD1.0": ["MI", "SHE", "MD1.0"],
  "MIO1.1": ["MI", "MIO1.1"],
  "MIO1.2": ["SHE", "MIO1.2"],
  "MDO1.0": ["MANAGEMENT DEVELOPMENT", "PDCA", "MDO1.0"],
  "MDO2.0": ["MDO2.0"],
  "MRO1.0": ["MANAGEMENT REPRESENTATIVE", "MRO1.0", "MR"],
  "MRO1.1": ["MRO1.1"],
  "BOD1.0": ["PRESIDENT DIRECTOR", "BOD1.0"],
  "BOD1.1": ["DIRECTOR", "BOD1.1"],
};

const jdNormalize = (str) =>
  (str || "").trim().toUpperCase().replace(/\*+/g, "").replace(/\s+/g, " ").trim();
const jdNormalizeId = (str) => (str || "").replace(/\s+/g, "").trim();
const jdSplitCombined = (str) =>
  (str || "").split(/[\/,]/).map((p) => p.trim()).filter(Boolean);
const jdContainsId = (haystack, needle) => {
  if (!haystack || !needle) return false;
  const needleClean = jdNormalizeId(needle);
  return jdSplitCombined(haystack).some((p) => jdNormalizeId(p) === needleClean);
};

function findJobdescMatch(allJobdesc, itemCode, itemEmpIdRaw, itemNameRaw) {
  const code = (itemCode || "").trim().toUpperCase();
  const empId = (itemEmpIdRaw || "").trim();
  const name = jdNormalize(itemNameRaw);

  return (
    (allJobdesc || []).find((jd) => {
      const jdNoPNK = (jd.memberNoPNK || "").trim();
      const jdName = jdNormalize(jd.memberName);
      const jdPositionTitle = (jd.positionTitle || "").toUpperCase();

      const empIdMatch =
        empId && empId !== "-" && jdNoPNK &&
        (jdNormalizeId(jdNoPNK) === jdNormalizeId(empId) || jdContainsId(jdNoPNK, empId));

      const nameMatch =
        name && jdName &&
        (jdName === name || jdSplitCombined(jd.memberName).some((p) => jdNormalize(p) === name));

      if (!empIdMatch && !nameMatch) return false;

      const keywords = codeTitleKeywords[code];
      if (keywords && keywords.length > 0) {
        return keywords.some((kw) => jdPositionTitle.includes(kw));
      }
      return true;
    }) || null
  );
}

// ────────────────────────────────────────────────────────────────
// Halaman full-page Jobdesc Viewer — dibuka lewat klik kode di
// StaticOrgChart.jsx, route: /jobdesc-viewer/:empId?code=..&name=..
// ────────────────────────────────────────────────────────────────
function JobdescViewerPage() {
  const { empId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code') || '';
  const name = searchParams.get('name') || '';

  const [loading, setLoading] = React.useState(true);
  const [jobdescData, setJobdescData] = React.useState(null);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    const fetchJobdesc = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const response = await fetch(`/api/jobdescriptions?limit=200`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.ok) {
          const result = await response.json();
          const allJobdesc = result.data || result;
          const found = findJobdescMatch(allJobdesc, code, empId, name);
          found ? setJobdescData(found) : setNotFound(true);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('❌ Error fetching job description:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchJobdesc();
  }, [empId, code, name]);

  const handleClose = () => navigate(-1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job description...</p>
        </div>
      </div>
    );
  }

  if (notFound || !jobdescData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg p-6 shadow-lg w-[520px] max-w-full text-center">
          <p className="font-semibold mb-2">Jobdesk Tidak Ditemukan</p>
          <p className="text-sm text-gray-600 mb-4">Tidak ada data jobdesk untuk {name || empId}</p>
          <button onClick={handleClose} className="px-4 py-2 bg-blue-600 text-white rounded">Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <JobdescViewer
      user={{ name, noPNK: empId, department: { name: jobdescData.division || 'N/A' } }}
      jobdesc={jobdescData}
      viewOnly={true}
      onClose={handleClose}
    />
  );
}

// ────────────────────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        }
      />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <Layout>
            <UserManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/roles" element={
        <ProtectedRoute>
          <Layout>
            <RolePermission />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/departments" element={
        <ProtectedRoute>
          <Layout>
            <Department />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/finance-department" element={
        <ProtectedRoute>
          <FinanceDepartment />
        </ProtectedRoute>
      } />
      <Route path="/hrga-it-department" element={
        <ProtectedRoute>
          <HrgaIt />
        </ProtectedRoute>
      } />
      <Route path="/management-development" element={
        <ProtectedRoute>
          <ManagementDevelopment />
        </ProtectedRoute>
      } />
      <Route path="/mi-she" element={
        <ProtectedRoute>
          <MiShe />
        </ProtectedRoute>
      } />
      <Route path="/marketing-engineering" element={
        <ProtectedRoute>
          <MarketingEngineering />
        </ProtectedRoute>
      } />
      <Route path="/management-representative" element={
        <ProtectedRoute>
          <ManagementRepresentative />
        </ProtectedRoute>
      } />
      <Route path="/purchasing" element={
        <ProtectedRoute>
          <Purchasing />
        </ProtectedRoute>
      } />
      <Route path="/ppic" element={
        <ProtectedRoute>
          <Ppic />
        </ProtectedRoute>
      } />
      <Route path="/manufactur-battery" element={
        <ProtectedRoute>
          <ManufacturBattery />
        </ProtectedRoute>
      } />
      <Route path="/manufacturing-cable" element={
        <ProtectedRoute>
          <ManufacturingCable />
        </ProtectedRoute>
      } />
      <Route path="/qa-department" element={
        <ProtectedRoute>
          <QaDepartment />
        </ProtectedRoute>
      } />
      <Route path="/marketing-battery-department" element={
        <ProtectedRoute>
          <MarketingBatteryDepartment />
        </ProtectedRoute>
      } />
      <Route path="/dashboard-editor" element={
        <ProtectedRoute>
          <DashboardEditor />
        </ProtectedRoute>
      } />
      <Route path="/dashboard-editor-advanced" element={
        <ProtectedRoute>
          <DashboardEditorAdvanced />
        </ProtectedRoute>
      } />
      <Route path="/organization-demo" element={
        <OrganizationDemo />
      } />
      <Route path="/so-bagian-editor" element={
        <ProtectedRoute>
          <SoBagianEditor />
        </ProtectedRoute>
      } />
      <Route path="/department-editor/:departmentId" element={
        <ProtectedRoute>
          <DepartmentEditor />
        </ProtectedRoute>
      } />

      {/* ── Route baru: Jobdesc Viewer halaman penuh ── */}
      <Route path="/jobdesc-viewer/:empId" element={
        <ProtectedRoute>
          <JobdescViewerPage />
        </ProtectedRoute>
      } />

      <Route path="/jobdesc-management" element={
        <ProtectedRoute>
          <Layout>
            <JobdescManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/so-change-requests" element={
        <ProtectedRoute>
          <Layout>
            <SOChangeRequests />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/so-bagian-change-requests" element={
        <ProtectedRoute>
          <Layout>
            <SOBagianChangeRequests />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/jobdesc-change-requests" element={
        <ProtectedRoute>
          <Layout>
            <JobDescChangeRequests />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/matriks-skill" element={
        <ProtectedRoute>
          <Layout>
            <MatriksSkill />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/matriks-skill-change-requests" element={
        <ProtectedRoute>
          <Layout>
            <MatriksSkillChangeRequests />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;