import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated but doesn't have the right role — send them to their own dashboard
  const isEmployee = ['employee', 'lead_management', 'followup_management', 'sitevisit_verification', 'sales_executive'].includes(user?.role);
  const hasAccess = requiredRole === 'employee' ? isEmployee : user?.role === requiredRole;

  if (requiredRole && !hasAccess) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
};

export default ProtectedRoute;
