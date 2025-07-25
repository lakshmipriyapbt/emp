import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ element, allowedTypes }) => {

  const { userId, userRole, company, source } = useSelector((state) => state.auth);
  console.log("Redux State in ProtectedRoute:", { userId, userRole, company, source });
  const role = userRole?.[0];
  
  if (!allowedTypes.includes(role)) {
    console.warn("403 Forbidden: User does not have the required permissions.");
    return <Navigate to="/forbidden" replace />;
  }


  return element;
};

export default ProtectedRoute;