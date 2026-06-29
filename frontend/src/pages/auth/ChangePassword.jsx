import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";

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

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    navigate("/");
    return null;
  }

  const dashPath = user.role === "admin" ? "/admin" : "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      setIsSubmitting(false);
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setIsSubmitting(false);
      return;
    }
    if (currentPassword === newPassword) {
      setErrorMsg("New password must be different from current password.");
      setIsSubmitting(false);
      return;
    }

    try {
      await authAPI.changePassword(currentPassword, newPassword, confirmPassword);
      setSuccessMsg("Password changed successfully. You will be signed out shortly.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        logout();
        navigate("/");
      }, 2200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to change password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const PasswordField = ({ id, label, value, onChange, show, onToggle, placeholder }) => (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrapper">
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={isSubmitting}
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={onToggle}
          disabled={isSubmitting}
          title={show ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="change-password-wrapper">
      <div className="change-password-card">
        {/* Logo */}
        <div className="change-password-logo">
          <div className="change-password-logo-box">🏠</div>
          <span className="change-password-logo-text">Maestrominds CRM</span>
        </div>

        <div className="change-password-header">
          <h2>Security Update</h2>
          <p>Choose a strong password to protect your account and portfolio data.</p>
        </div>

        {errorMsg && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: "20px" }}>
            <span className="alert-icon">⚠️</span>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" role="alert" style={{ marginBottom: "20px" }}>
            <span className="alert-icon">✅</span>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="change-password-form">
          <PasswordField
            id="currentPassword"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => { setCurrentPassword(e.target.value); setErrorMsg(""); }}
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
            placeholder="Enter your current password"
          />

          <PasswordField
            id="newPassword"
            label="New Password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(""); }}
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
            placeholder="Enter new password (min. 6 characters)"
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(""); }}
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
            placeholder="Re-enter your new password"
          />

          <button
            type="submit"
            className="btn btn-gold btn-full"
            disabled={isSubmitting}
            style={{ marginTop: "8px" }}
          >
            {isSubmitting ? (
              <span className="btn-loading">
                <span className="spinner-sm" />
                Updating...
              </span>
            ) : (
              "SAVE SECURE PASSWORD ✓"
            )}
          </button>
        </form>

        <div className="change-password-back">
          <button
            type="button"
            className="btn-text-back"
            onClick={() => navigate(dashPath)}
          >
            ← Cancel and go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
