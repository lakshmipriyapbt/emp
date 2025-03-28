import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { companyViewByIdApi, EmployeeGetApiById } from "../Utils/Axios";

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
            const empResponse = await EmployeeGetApiById(userId);
            setEmployee(empResponse.data.data);

            const companyIdFromEmp = empResponse.data.data?.companyId || companyId;
            if (companyIdFromEmp) {
              const companyResponse = await companyViewByIdApi(companyIdFromEmp);
              console.log("CompanyResponse",companyResponse.data.data)
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

  console.log("employee",employee);
  console.log("Company",company);
  console.log("authUser",authUser)

  return (
    <AuthContext.Provider value={{ authUser,setAuthUser, employee, company }}>
      {children}
    </AuthContext.Provider>
  );
};

export const  useAuth = () => useContext(AuthContext);

