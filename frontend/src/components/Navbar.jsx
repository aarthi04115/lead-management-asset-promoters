import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
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

  const getLinkClass = ({ isActive }) =>
    `navbar-link ${isActive ? 'text-primary border-b-2 border-secondary font-extrabold' : 'text-on-surface-variant hover:text-primary border-b-2 border-transparent'} text-[11px] uppercase tracking-wider font-bold transition-all px-1 py-[21px]`;

  return (
    <nav className="navbar">
      <div className="flex items-center gap-8">
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="navbar-brand">
          <div className="navbar-logo-box">🏠</div>
          <div className="navbar-brand-text">
            <span className="navbar-brand-name">Maestrominds</span>
            <span className="navbar-brand-sub">Enterprise CRM</span>
          </div>
        </Link>

        {!isAdmin && (
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/dashboard" end className={getLinkClass}>Dashboard</NavLink>
            <NavLink to="/employee/leads" className={getLinkClass}>Leads</NavLink>
            <NavLink to="/employee/followups" className={getLinkClass}>Follow-ups</NavLink>
            <NavLink to="/employee/site-visits" className={getLinkClass}>Site Visits</NavLink>
            <NavLink to="/employee/properties" className={getLinkClass}>Properties</NavLink>
          </div>
        )}
      </div>

      <div className="navbar-right">
        <span className={`badge ${isAdmin ? "badge-admin" : "badge-employee"} uppercase tracking-widest text-[10px] font-extrabold`}>
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
