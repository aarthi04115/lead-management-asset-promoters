import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LeadProvider } from "./context/LeadContext";
import { FollowUpProvider } from "./context/FollowUpContext";
import { PropertyProvider } from "./context/PropertyContext";
import { SiteVisitProvider } from "./context/SiteVisitContext";
import { SearchProvider } from "./context/SearchContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard";
import LeadManagement from "./pages/LeadManagement";
import FollowUpManagement from "./pages/FollowUpManagement";
import SiteVisitVerification from "./pages/SiteVisitVerification";
import PropertyManagement from "./pages/PropertyManagement";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import EmployeeManagement from "./pages/EmployeeManagement";
import EmployeeLead from "./pages/EmployeeLead";
import EmployeeFollowUp from "./pages/EmployeeFollowUp";
import EmployeeSiteVisit from "./pages/EmployeeSiteVisit";
import EmployeeProperties from "./pages/EmployeeProperties";

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
