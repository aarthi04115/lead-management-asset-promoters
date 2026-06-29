import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LeadProvider } from "./context/LeadContext";
import { FollowUpProvider } from "./context/FollowUpContext";
import { PropertyProvider } from "./context/PropertyContext";
import { SiteVisitProvider } from "./context/SiteVisitContext";
import { SearchProvider } from "./context/SearchContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/auth/Login";
import ChangePassword from "./pages/auth/ChangePassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LeadManagement from "./pages/admin/LeadManagement";
import FollowUpManagement from "./pages/admin/FollowUpManagement";
import SiteVisitVerification from "./pages/admin/SiteVisitVerification";
import PropertyManagement from "./pages/admin/PropertyManagement";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import EmployeeLead from "./pages/employee/EmployeeLead";
import EmployeeFollowUp from "./pages/employee/EmployeeFollowUp";
import EmployeeSiteVisit from "./pages/employee/EmployeeSiteVisit";
import EmployeeProperties from "./pages/employee/EmployeeProperties";

const App = () => (
  <AuthProvider>
    <Router>
      <SearchProvider>
        <PropertyProvider>
          <LeadProvider>
            <FollowUpProvider>
              <SiteVisitProvider>
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<Login />} />

                  {/* Admin protected */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/leads"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <LeadManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/followups"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <FollowUpManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/employees"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <EmployeeManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/sitevisits"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <SiteVisitVerification />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/properties"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <PropertyManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reports/*"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings/*"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Settings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Employee protected */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute requiredRole="employee">
                        <EmployeeDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employee/leads"
                    element={
                      <ProtectedRoute requiredRole="employee">
                        <EmployeeLead />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employee/followups"
                    element={
                      <ProtectedRoute requiredRole="employee">
                        <EmployeeFollowUp />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employee/site-visits"
                    element={
                      <ProtectedRoute requiredRole="employee">
                        <EmployeeSiteVisit />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employee/properties"
                    element={
                      <ProtectedRoute requiredRole="employee">
                        <EmployeeProperties />
                      </ProtectedRoute>
                    }
                  />

                  {/* Both roles */}
                  <Route
                    path="/change-password"
                    element={
                      <ProtectedRoute>
                        <ChangePassword />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </SiteVisitProvider>
            </FollowUpProvider>
          </LeadProvider>
        </PropertyProvider>
      </SearchProvider>
    </Router>
  </AuthProvider>
);

export default App;
