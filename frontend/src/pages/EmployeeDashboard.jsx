import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Notification from "../components/Notification";
import { useNotify } from "../hooks/useNotify";
import { formatDate, formatDateTime } from "../utils/formatters";
import api from "../api";


const EmployeeDashboard = () => {
  const { refreshUser } = useAuth();
  const { notification, notify } = useNotify();

  const [profile, setProfile] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setProfile(data.data);
        setNameInput(data.data.name);
      } catch (err) {
        notify("error", err.response?.data?.message || "Failed to load profile.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) { notify("error", "Name cannot be empty."); return; }
    if (nameInput.trim() === profile.name) { setIsEditing(false); return; }
    try {
      const { data } = await api.put("/auth/profile", { name: nameInput.trim() });
      setProfile((p) => ({ ...p, name: data.data.name }));
      refreshUser({ name: data.data.name });
      setIsEditing(false);
      notify("success", "Name updated successfully.");
    } catch (err) {
      notify("error", err.response?.data?.message || "Failed to update profile.");
    }
  };

  const cancelEdit = () => {
    setNameInput(profile.name);
    setIsEditing(false);
  };

  if (isFetching) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p className="loading-text">Loading your workspace...</p>
      </div>
    );
  }

  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const STATS = [
    { icon: "👥", value: 0, label: "My Contacts" },
    { icon: "📊", value: 0, label: "Active Deals" },
    { icon: "📅", value: 0, label: "Meetings" },
    { icon: "✅", value: 0, label: "Tasks Done" },
  ];

  return (
    <>
      <Navbar />
      <main className="dashboard-layout">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-greeting">
              Good day, <span className="name-accent">{firstName}</span> 👋
            </h1>
            <p className="dashboard-date">{todayLabel}</p>
          </div>
          <span className="badge badge-employee">👤 Employee</span>
        </div>

        {/* Notification */}
        <Notification notification={notification} />

        {/* Stats */}
        <div className="stats-grid">
          {STATS.map(({ icon, value, label }) => (
            <div className="stat-card" key={label}>
              <div className="stat-icon-box">{icon}</div>
              <div className="stat-body">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        {profile && (
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="avatar avatar-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="profile-card-title">My Profile</h2>
                <p className="text-muted" style={{ fontSize: "13px", marginTop: "2px" }}>
                  Manage your personal information
                </p>
              </div>
            </div>

            <div className="profile-rows">
              {/* Full Name — editable */}
              <div className="profile-row">
                <span className="profile-key">Full Name</span>
                {isEditing ? (
                  <form onSubmit={handleSaveName} className="edit-inline">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="edit-input"
                      autoFocus
                      maxLength={50}
                    />
                    <button type="submit" className="btn btn-sm btn-primary">Save</button>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="profile-value-row">
                    <span className="profile-value">{profile.name}</span>
                    <button className="btn btn-sm btn-ghost" onClick={() => setIsEditing(true)}>
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-row">
                <span className="profile-key">Email Address</span>
                <span className="profile-value">{profile.email}</span>
              </div>

              <div className="profile-row">
                <span className="profile-key">Role</span>
                <span className="badge badge-employee">👤 Employee</span>
              </div>

              <div className="profile-row">
                <span className="profile-key">Account Status</span>
                <span className={`badge ${profile.isActive ? "badge-success" : "badge-inactive"}`}>
                  {profile.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-key">Member Since</span>
                <span className="profile-value">{formatDate(profile.createdAt)}</span>
              </div>

              {profile.lastLogin && (
                <div className="profile-row">
                  <span className="profile-key">Last Login</span>
                  <span className="profile-value">{formatDateTime(profile.lastLogin)}</span>
                </div>
              )}

              <div className="profile-row">
                <span className="profile-key">User ID</span>
                <span className="profile-value monospace text-muted">{profile._id}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default EmployeeDashboard;
