import React, { useEffect, useState } from "react";
import SideNav from "./SideNav";
import Header from "./Header";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { CompanyImageGetApi, EmployeeGetApiById, getUserById } from "../Utils/Axios";
import AutoLogout from "../Utils/AutoLogOut";
import { useSelector } from "react-redux";

const LayOut = ({ children }) => {
  const name = localStorage.getItem("name");
  const { authData, isInitialized } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoFileName, setLogoFileName] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const { userRole } = useSelector((state) => state.auth);


  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    if (!isInitialized || !authData) return;
  
    const fetchCompanyLogo = async (companyId) => {
      try {
        const logoResponse = await CompanyImageGetApi(companyId);
        if (logoResponse?.data?.data) {
          const logoPath = logoResponse.data.data;
          const fileName = logoPath.split("\\").pop();
          setLogoFileName(fileName);
          console.log("fileName:", fileName);
        } else {
          console.error("Response or data is missing");
          setError("Logo not found");
        }
      } catch (err) {
        console.error("Error fetching company logo:", err);
        setError("Error fetching logo");
      }
    };
  
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { userId, userRole } = authData;
        console.log("userId:", userId, "role:", userRole);
  
        if (["Admin", "Hr", "Accountant"].includes(userRole)) {
          const response = await getUserById(userId);
          const companyId = response.data.companyId;
          await fetchCompanyLogo(companyId);
        } else if (["company_admin", "employee"].includes(userRole)) {
          const response = await EmployeeGetApiById(userId);
          
          const companyId = response.data.companyId;
          await fetchCompanyLogo(companyId);
        } else {
          setError("Invalid user role");
        }
  
      } catch (error) {
        console.error(error);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [authData, isInitialized]);
  
  return (
    <div className="wrapper">
       <AutoLogout userRole={userRole} />
      <div className={`fixed-sideNav ${isSidebarVisible ? "" : "collapsed"}`}>
        <SideNav />
      </div>
      <div className={`main ${isSidebarVisible ? "" : "sidebar-collapsed"}`}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="content">{children}</main>
        <footer className="footer">
          <div className="container-fluid">
            <div className="row text-muted">
              <div className="col-6 text-start">
                <p className="mb-0">
                  <Link className="text-muted" target="_blank">
                    <strong>{name} </strong>
                  </Link>
                </p>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <p>Copyright © 2024, All rights reserved.</p>
                <p>Powered by PathBreaker Technologies Pvt. Ltd.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LayOut;
