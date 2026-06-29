import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

// SVG Eye Icons
const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ROLES = [
  {
    id: "admin",
    icon: "👑",
    name: "Admin Portal",
    desc: "Manage employees, properties, leads, analytics, reports, and business operations.",
    ctaLabel: "Login as Admin →",
    ctaDark: true,
  },
  {
    id: "employee",
    icon: "👤",
    name: "Employee Portal",
    desc: "Manage assigned leads, follow-ups, site visits, customer interactions, and personal performance.",
    ctaLabel: "Login as Employee →",
    ctaDark: false,
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const { data } = await api.post("/auth/login", { email, password, role: selectedRole });
      login(data.data.user, data.data.token);
      navigate(data.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Login failed. Please try again.");
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setErrorMsg("");
    setEmail("");
    setPassword("");
  };

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="login-root">
      {/* Top bar */}
      <header className="login-topbar">
        <div className="login-topbar-brand">
          <div className="topbar-logo">🏠</div>
          <div className="topbar-brand-text">
            <span className="topbar-brand-name">Maestrominds</span>
            <span className="topbar-subtitle">Enterprise CRM</span>
          </div>
        </div>
        <div className="topbar-status">
          <span className="status-dot" />
          System Status: Online
        </div>
      </header>

      <div className="login-body">
        {/* Left hero panel */}
        <aside className="login-hero">
          <div className="hero-eyebrow">
            <ShieldIcon /> Smart Real Estate CRM
          </div>
          <h1 className="hero-title">
            Empowering Real<br />
            Estate <em>Excellence</em>
          </h1>
          <p className="hero-desc">
            Centralized platform for managing leads, properties, customer
            interactions, site visits, employee performance, and business analytics.
          </p>

          {/* Role cards on hero side — decorative only */}
          <div className="hero-role-cards">
            {ROLES.map((r) => (
              <div
                key={r.id}
                className={`hero-role-card${selectedRole === r.id ? " selected" : ""}`}
                onClick={() => setSelectedRole(r.id)}
              >
                <div className="role-card-icon">{r.icon}</div>
                <div className="role-card-name">{r.name}</div>
                <div className="role-card-desc">{r.desc}</div>
              </div>
            ))}
          </div>

          <div className="hero-trust">
            <div className="trust-item"><span className="trust-icon">🔒</span> 256-bit Encryption</div>
            <div className="trust-item"><span className="trust-icon">☁️</span> Cloud Integrated</div>
            <div className="trust-item"><span className="trust-icon">🛡️</span> ISO Certified</div>
          </div>
        </aside>

        {/* Right form panel */}
        <main className="login-form-panel">
          {!selectedRole ? (
            /* Role selection */
            <>
              <div className="form-panel-eyebrow">
                <ShieldIcon />
                SSO Secured
              </div>
              <h2 className="form-panel-title">Smart Real Estate CRM</h2>
              <p className="form-panel-subtitle">
                Centralized platform for managing leads, properties, customer
                interactions, site visits, employee performance, and business analytics.
              </p>

              <div className="role-select-section">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="role-select-card"
                    onClick={() => setSelectedRole(r.id)}
                  >
                    <div className="role-select-icon">{r.icon}</div>
                    <div className="role-select-body">
                      <div className="role-select-name">{r.name}</div>
                      <div className="role-select-desc">{r.desc}</div>
                    </div>
                    <span
                      className={`role-select-cta${r.ctaDark ? "" : " outline"}`}
                      tabIndex={-1}
                    >
                      {r.ctaLabel}
                    </span>
                  </button>
                ))}
              </div>

              <p style={{ marginTop: "28px", fontSize: "12px", color: "var(--text-faint)", textAlign: "center" }}>
                {todayLabel}
              </p>
            </>
          ) : (
            /* Login form */
            <>
              <div className="form-panel-eyebrow">
                <ShieldIcon />
                Access Protocol
              </div>
              <h2 className="form-panel-title">
                {selectedRole === "admin" ? "Admin Login" : "Employee Login"}
              </h2>
              <p className="form-panel-subtitle">
                {selectedRole === "admin"
                  ? "Authorized personnel only. Please verify your identity to proceed."
                  : "Secure entry for the Elite Concierge Network."}
              </p>

              <div className="form-role-badge">
                {selectedRole === "admin" ? "👑" : "👤"} {selectedRole === "admin" ? "Admin Portal" : "Employee Portal"}
              </div>

              {errorMsg && (
                <div className="alert alert-error" role="alert" style={{ marginBottom: "16px" }}>
                  <span className="alert-icon">⚠️</span>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">
                    {selectedRole === "admin" ? "Admin Email" : "Employee ID or Email"}
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon">@</span>
                    <input
                      id="email"
                      type="email"
                      className="has-icon"
                      placeholder={selectedRole === "admin" ? "admin@maestrominds.com" : "you@maestrominds.com"}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                      disabled={isSubmitting}
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Security Password</label>
                  <div className="password-wrapper">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                      disabled={isSubmitting}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                      title={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-gold btn-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="btn-loading">
                      <span className="spinner-sm" />
                      Authorizing...
                    </span>
                  ) : (
                    selectedRole === "admin" ? "LOGIN TO PORTAL →" : "AUTHORIZE LOGIN →"
                  )}
                </button>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    type="button"
                    className="btn-text-back"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    ← Back to portal selection
                  </button>
                </div>
              </form>

              <div style={{
                marginTop: "28px",
                padding: "12px 14px",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-sm)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "var(--text-muted)"
              }}>
                <span>●</span>
                <span style={{ color: "var(--green)", fontWeight: 600 }}>SYSTEM STATUS: OPERATIONAL</span>
                <span style={{ marginLeft: "auto" }}>v2.4.0</span>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Login;
