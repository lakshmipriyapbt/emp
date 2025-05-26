import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { companyViewByIdApi, EmployeeGetApiById, getUserById } from "../Utils/Axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.sub;
        const userRole = decodedToken.roles;
        const company = decodedToken.company;
        const employeeId = decodedToken.employeeId;
        const companyId = decodedToken.companyId;
        setAuthUser({ userId, userRole, company, employeeId, companyId });

      // Fetch Employee Data
      const fetchEmployeeAndCompany = async () => {
        try {
          let userResponse;

          // Check the role and call the corresponding API
          if (userRole === "Admin" || userRole === "HR" || userRole === "Accountant") {
            // For Admin, HR, Accountant, use `getUserById` API
            console.log(`Fetching user data for ${userRole} with userId: ${userId}`);
            userResponse = await getUserById(userId);
            console.log("UserId Response:", userResponse.data); // Log full response

            setEmployee(userResponse.data.data);
          } else if (userRole === "company-admin" || userRole === "employee") {
            // For company-admin and employee, use `EmployeeGetApiById` API
            console.log(`Fetching employee data for ${userRole} with userId: ${userId}`);
            userResponse = await EmployeeGetApiById(userId);
            console.log("Employee Id Response:", userResponse.data); // Log full response

            setEmployee(userResponse.data.data);
          }

          // Log employee state right after setting it
          console.log("Employee State after setEmployee:", employee);

          // After getting employee data, fetch company data if needed
          const companyIdFromEmp = userResponse?.data?.data?.companyId || companyId;
          console.log("Company ID from employee data:", companyIdFromEmp);
          
          if (companyIdFromEmp) {
            const companyResponse = await companyViewByIdApi(companyIdFromEmp);
            console.log("CompanyResponse:", companyResponse.data); // Log full company response

            setCompany(companyResponse.data.data);
          }
        } catch (error) {
          console.error("Error fetching employee or company data:", error);
        }
      };
        fetchEmployeeAndCompany();
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem("token");
        setAuthUser(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authUser,setAuthUser, employee, company }}>
      {children}
    </AuthContext.Provider>
  );
};

export const  useAuth = () => useContext(AuthContext);

