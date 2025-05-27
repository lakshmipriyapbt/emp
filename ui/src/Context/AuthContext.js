import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { EmployeeGetApiById, getUserById, companyViewByIdApi } from "../Utils/Axios";

// Create the context
const AuthContext = createContext();

// Create the Provider component
export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);      // Stores decoded user info (e.g., userId, companyId)
  const [employee, setEmployee] = useState(null);       // Stores employee/user details
  const [company, setCompany] = useState(null);         // Stores company details
  const [isInitialized, setIsInitialized] = useState(false); // Tells us when auth is ready (app booted or login done)

  // Runs once on app start or refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsInitialized(true);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      // Optionally validate expiration
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setIsInitialized(true);
        return;
      }

      // Save essential info to state
      setAuthUser({
        userId: decoded.sub,
        roles: decoded.roles || [],
        companyId: decoded.companyId,
        employeeId: decoded.employee,
        company: decoded.company
      });
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      setIsInitialized(true);
    }
  }, []);

  // Fetch employee/user + company when authUser changes (login or after app initializes)
  useEffect(() => {
    if (!authUser) {
      setEmployee(null);
      setCompany(null);
      setIsInitialized(true);
      return;
    }

    const fetchDetails = async () => {
      try {
        let empData = null;

        try {
          // First try fetching as employee
          const empRes = await EmployeeGetApiById(authUser.userId);
          empData = empRes?.data?.data;
        } catch {
          // If that fails, try fetching as user
          const userRes = await getUserById(authUser.userId);
          const userData = userRes?.data?.data;
          empData = Array.isArray(userData) && userData.length > 0 ? userData[0] : userData;
        }

        setEmployee(empData);
        console.log("empData companyId and authUser companyId", empData?.companyId, authUser?.companyId);

        const companyId = empData?.companyId || authUser?.companyId;

        if (companyId) {
          const compRes = await companyViewByIdApi(companyId);
          setCompany(compRes?.data?.data);
        }
      } catch (error) {
        console.error("Failed fetching employee or company", error);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchDetails();
  }, [authUser]);

  // Function to handle login and token storage
  const login = (token) => {
    try {
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);

      const userId = decoded.sub;
      const roles = decoded.roles || [];
      const companyId = decoded.companyId;
      const company = decoded.company;
      const employeeId = decoded.employee;

      console.log("roles", roles);

      // Set authUser object (triggers fetch effect above)
      setAuthUser({
        userId,
        roles,
        companyId,
        company,
        employeeId
      });

      setIsInitialized(false); // Reset while loading fresh data
    } catch (err) {
      console.error("Login failed - invalid token", err);
    }
  };

  // Function to logout user and clear all state
  const logout = () => {
    localStorage.removeItem("token");
    setAuthUser(null);
    setEmployee(null);
    setCompany(null);
    setIsInitialized(true);
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        employee,
        company,
        isInitialized,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
