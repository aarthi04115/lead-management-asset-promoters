import axios from "axios";

// When using Vite's dev proxy, /api requests are forwarded to localhost:5000
// The VITE_API_BASE_URL or VITE_API_URL env var lets you point at a different backend in staging/prod
const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api";

export const getBackendURL = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api";
  let baseDomain = "";
  if (apiBase.startsWith("http://") || apiBase.startsWith("https://")) {
    baseDomain = apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;
  } else {
    baseDomain = "http://localhost:5005"; // Local fallback
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseDomain}${cleanPath}`;
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or invalid — clear storage and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (email, password, role) =>
    api.post("/auth/login", { email, password, role }),
  changePassword: (currentPassword, newPassword, confirmPassword) =>
    api.post("/auth/change-password", { currentPassword, newPassword, confirmPassword }),
  getProfile: () =>
    api.get("/auth/profile"),
  updateProfile: (name) =>
    api.put("/auth/profile", { name }),
};

export default api;
