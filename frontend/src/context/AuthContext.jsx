import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Rehydrate session from localStorage on first load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        // Corrupted data — clear it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsInitializing(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  const refreshUser = (updatedFields) => {
    const merged = { ...currentUser, ...updatedFields };
    localStorage.setItem("user", JSON.stringify(merged));
    setCurrentUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user: currentUser, isInitializing, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be called inside <AuthProvider>");
  return ctx;
};
