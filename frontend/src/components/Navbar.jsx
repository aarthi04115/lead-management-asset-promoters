import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user?.name?.charAt(0).toUpperCase() ?? "?";
  const isAdmin = user?.role === "admin";

  return (
    <nav className="navbar">
      <Link to={isAdmin ? "/admin" : "/dashboard"} className="navbar-brand">
        <div className="navbar-logo-box">🏠</div>
        <div className="navbar-brand-text">
          <span className="navbar-brand-name">Maestrominds</span>
          <span className="navbar-brand-sub">Enterprise CRM</span>
        </div>
      </Link>

      <div className="navbar-right">
        <span className={`badge ${isAdmin ? "badge-admin" : "badge-employee"}`}>
          {isAdmin ? "👑 Admin" : "👤 Employee"}
        </span>

        <div className="navbar-user-menu" ref={menuRef}>
          <button
            className="navbar-user"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
            aria-expanded={showUserMenu}
          >
            <div className="avatar" aria-label={`Avatar for ${user?.name}`}>
              {initials}
            </div>
            <span className="navbar-username">{user?.name}</span>
            <span className="dropdown-arrow">▾</span>
          </button>

          {showUserMenu && (
            <div className="user-dropdown-menu" role="menu">
              <div style={{
                padding: "12px 16px 10px",
                borderBottom: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-dark)" }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {user?.email}
                </div>
              </div>

              <Link
                to="/change-password"
                className="menu-item"
                role="menuitem"
                onClick={() => setShowUserMenu(false)}
              >
                <span className="menu-item-icon">🔐</span>
                Change Password
              </Link>

              <button
                className="menu-item logout-item"
                role="menuitem"
                onClick={handleLogout}
              >
                <span className="menu-item-icon">🚪</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
