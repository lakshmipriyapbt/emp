import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ element, allowedTypes }) => {

  const { userId, userRole, company, source } = useSelector((state) => state.auth);
  console.log("Redux State in ProtectedRoute:", { userId, userRole, company, source });
  const role = userRole?.[0];
  console.log("Role from protected routes ",role);

  console.log("User Role:", userRole);
  console.log("Allowed Types:", allowedTypes);
  console.log("Extracted Role:", role);


  // if (!userRole || userRole.length === 0) {
  //   console.log("Waiting for Redux state to load...");
  //   return <div>Loading...</div>;
  // }
  
  // if (!allowedTypes.includes(role)) {
  //   console.warn("Security Access Error: Unauthorized role", role);

  //   switch (role) {
  //     case 'ems_admin':
  //       return <Navigate to="/login" replace />;
  //     case 'company_admin':
  //       return <Navigate to="/companyLogin" replace />;
  //     default:
  //       return <Navigate to="/" replace />;
  //   }
  // }


  if (!allowedTypes.includes(role)) {
    console.warn("403 Forbidden: User does not have the required permissions.");
    return <Navigate to="/forbidden" replace />;
  }


  return element;
};

export default ProtectedRoute;