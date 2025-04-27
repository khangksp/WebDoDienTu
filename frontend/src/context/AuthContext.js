import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    console.log("AuthProvider - Initial user from localStorage:", savedUser ? JSON.parse(savedUser) : null);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    console.log("AuthProvider - Logging in user:", userData);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    console.log("AuthProvider - Logging out");
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("mataikhoan");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  console.log("ProtectedRoute - Current user:", user);
  console.log("ProtectedRoute - Allowed roles:", allowedRoles);

  if (!user) {
    console.log("ProtectedRoute - No user, redirecting to /login");
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.loaiquyen)) {
    console.log("ProtectedRoute - Role not allowed, redirecting to /");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;