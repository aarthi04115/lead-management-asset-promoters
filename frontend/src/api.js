import axios from "axios";

// When using Vite's dev proxy, /api requests are forwarded to localhost:5000
// Permanent automatic environment detection to avoid Vercel build-caching issues
const isDev = import.meta.env.MODE === "development" || import.meta.env.DEV;
const BASE_URL = isDev
  ? "http://localhost:5005/api"
  : "https://lead-management-asset-promoters-2.onrender.com/api";

export const getBackendURL = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const baseDomain = isDev
    ? "http://localhost:5005"
    : "https://lead-management-asset-promoters-2.onrender.com";

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
