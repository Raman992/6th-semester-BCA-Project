import React from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

const ProtectedRoute = ({ children }) => {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div
        style={{
          margin: 0,
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img src="/turkeyloading.gif" alt="loading" />
        <p className="text-white mt-4">Verifying access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
