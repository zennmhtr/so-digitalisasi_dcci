import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Purchasing from './pages/purchasing';
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
