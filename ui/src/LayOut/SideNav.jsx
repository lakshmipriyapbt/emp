import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Image } from "react-bootstrap-icons";

const SideNav = () => {
  const [isPayrollOpen, setIsPayrollOpen] = useState(false); // State for managing PayRoll dropdown
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false); // State for managing Attendance dropdown
  const [isCompanyOpen, setIsCompanyOpen] = useState(false); // State for managing Company dropdown
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLettresOpen, setIsLettersOpen] = useState(false);
  const location = useLocation();
  const { user = {}, logoFileName, loading } = useAuth();

  useEffect(() => {
    if (
      location.pathname === "/companyRegistration" ||
      location.pathname.startsWith("/companyView")
    ) {
      setIsCompanyOpen(true);
    } else {
      setIsCompanyOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/employeeSalaryStructure" ||
      location.pathname === "/employeeSalaryList" ||
      location.pathname === "/payslipGeneration" ||
      location.pathname === "/payslipsList" ||
      location.pathname === "/increment" ||
      location.pathname === "/incrementList"
    ) {
      setIsPayrollOpen(true);
    } else {
      setIsPayrollOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/offerLetters" ||
      location.pathname === "/experienceForm" ||
      location.pathname === "/appraisalLetter" ||
      location.pathname === "/relievingSummary" ||
      location.pathname === "/internsLetter"
    ) {
      setIsLettersOpen(true);
    } else {
      setIsLettersOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/addAttendance" ||
      location.pathname === "/attendanceList" ||
      location.pathname === "/attendanceReport"
    ) {
      setIsAttendanceOpen(true);
    } else {
      setIsAttendanceOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/companySalaryView" ||
      location.pathname === "/companySalaryStructure" ||
      location.pathname === "/relievingTemplates" ||
      location.pathname === "/appraisalLetter" ||
      location.pathname === "/internsTemplates"
    ) {
      setIsSettingsOpen(true);
    } else {
      setIsSettingsOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/companyRegistration" ||
      location.pathname.startsWith("/companyView")
    ) {
      setIsCompanyOpen(true);
    } else {
      setIsCompanyOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/employeeSalaryStructure" ||
      location.pathname === "/employeeSalaryList" ||
      location.pathname === "/payslipGeneration" ||
      location.pathname === "/payslipsList" ||
      location.pathname === "/increment" ||
      location.pathname === "/incrementList"
    ) {
      setIsPayrollOpen(true);
    } else {
      setIsPayrollOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/addAttendance" ||
      location.pathname === "/attendanceList" ||
      location.pathname === "/attendanceReport"
    ) {
      setIsAttendanceOpen(true);
    } else {
      setIsAttendanceOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/companyRegistration" ||
      location.pathname.startsWith("/companyView")
    ) {
      setIsCompanyOpen(true);
    } else {
      setIsCompanyOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/employeeSalaryStructure" ||
      location.pathname === "/employeeSalaryList" ||
      location.pathname === "/payslipGeneration" ||
      location.pathname === "/payslipsList" ||
      location.pathname === "/increment" ||
      location.pathname === "/incrementList"
    ) {
      setIsPayrollOpen(true);
    } else {
      setIsPayrollOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/addAttendance" ||
      location.pathname === "/attendanceList" ||
      location.pathname === "/attendanceReport"
    ) {
      setIsAttendanceOpen(true);
    } else {
      setIsAttendanceOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/companyRegistration" ||
      location.pathname.startsWith("/companyView")
    ) {
      setIsCompanyOpen(true);
    } else {
      setIsCompanyOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/employeeSalaryStructure" ||
      location.pathname === "/employeeSalaryList" ||
      location.pathname === "/payslipGeneration" ||
      location.pathname === "/payslipsList" ||
      location.pathname === "/increment" ||
      location.pathname === "/incrementList"
    ) {
      setIsPayrollOpen(true);
    } else {
      setIsPayrollOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/addAttendance" ||
      location.pathname === "/attendanceList" ||
      location.pathname === "/attendanceReport"
    ) {
      setIsAttendanceOpen(true);
    } else {
      setIsAttendanceOpen(false);
    }
  }, [location]);

  useEffect(() => {
    if (
      location.pathname === "/companySalaryView" ||
      location.pathname === "/offerLetters" ||
      location.pathname === "/experienceLetter" ||
      location.pathname === "/payslipTemplates"
    ) {
      setIsSettingsOpen(true);
    } else {
      setIsSettingsOpen(false);
    }
  }, [location]);

  const togglePayroll = (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    setIsPayrollOpen(!isPayrollOpen);
    setIsCompanyOpen(false);
    setIsAttendanceOpen(false);
    setIsLettersOpen(false);
  };

  const toggleCompany = (e) => {
    e.preventDefault();
    setIsCompanyOpen(!isCompanyOpen);
    setIsAttendanceOpen(false);
    setIsPayrollOpen(false);
    setIsLettersOpen(false);
  };

  const toggleAttendance = (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    setIsAttendanceOpen(!isAttendanceOpen);
    setIsCompanyOpen(false);
    setIsPayrollOpen(false);
    setIsLettersOpen(false);
  };

  const toggleSettings = (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    setIsSettingsOpen(!isSettingsOpen);
    setIsCompanyOpen(false);
    setIsAttendanceOpen(false);
    setIsPayrollOpen(false);
    setIsLettersOpen(false);
  };

  const toggleLetters = (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    setIsSettingsOpen(false);
    setIsCompanyOpen(false);
    setIsAttendanceOpen(false);
    setIsPayrollOpen(false);
    setIsLettersOpen(!isLettresOpen);
  };


  // if (!isInitialized) {
  //   return <div>Loading context...</div>; // Show a loading message or spinner until context is initialized
  // }

  const emsAdminLogoPath = "assets/img/pathbreaker_logo.png";

  return (
    <nav id="sidebar" className="sidebar js-sidebar">
      <div className="sidebar-content js-simplebar">
      <a className="sidebar-brand" href="/main">
          {loading ? (
            <span>Loading...</span>
          ) : (
            <span>
              {logoFileName ? (
                // If logoFileName exists, display the company logo
                <img
                  className="align-middle text-center"
                  src={`${logoFileName}`}
                  alt="Company Logo"
                  style={{ height: "55px", width: "160px" }}
                />
              ) : (
                // If logoFileName doesn't exist, display "Add Logo"
                user && user.userRole && user.userRole.includes("company_admin") ? (
                  // Only show "Add Logo" if the user is a company admin
                  <a href="/profile">
                    <span className="text-warning fs-6" style={{ marginLeft: "40px" }}>
                      <Image /> Add Logo
                    </span>
                  </a>
                ) : null
              )}
              {user && user.userRole && user.userRole.includes("ems_admin") && !logoFileName && (
                // Display the EMS Admin Logo if the user is an EMS admin and logoFileName is not present
                <img
                  className="align-middle"
                  src="assets/img/pathbreaker_logo.png"
                  alt="EMS Admin Logo"
                  style={{ height: "55px", width: "160px" }}
                />
              )}
            </span>
          )}
        </a>
        <ul className="sidebar-nav mt-2">
          {user && user.userRole && user.userRole.includes("ems_admin") && (
            <>
              <li
                className={`sidebar-item ${location.pathname === "/main" ? "active" : ""}`}
              >
                <Link className="sidebar-link" to="/main">
                  <i className="bi bi-grid-1x2-fill"></i>
                  <span className="align-middle">Dashboard</span>
                </Link>
              </li>

              <li className="sidebar-item">
                <a
                  className="sidebar-link collapsed d-flex justify-content-between align-items-center"
                  href="#"
                  onClick={toggleCompany}
                  data-bs-target="#company"
                  data-bs-toggle="collapse"
                >
                  <span className="align-middle">
                    <i className="bi bi-building"></i>
                  </span>
                  <span className="align-middle">Employer</span>
                  <i
                    className={`bi ${isCompanyOpen ? "bi-chevron-up" : "bi-chevron-down"} ms-auto`}
                  ></i>
                </a>
                <ul
                  id="company"
                  className={`sidebar-dropDown list-unstyled collapse ${isCompanyOpen ? "show" : ""}`}
                  data-bs-parent="#sidebar"
                >
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/companyRegistration" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/companyRegistration">
                      Registration
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname.startsWith("/companyView") ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/companyView">
                      Summary
                    </Link>
                  </li>
                </ul>
              </li>
            </>
          )}

          {user && user.userRole && user.userRole.includes("company_admin") && (
            <>
              <li
                className={`sidebar-item ${location.pathname === "/main" ? "active" : ""}`}
              >
                <Link className="sidebar-link" to="/main">
                  <i className="bi bi-grid-1x2-fill"></i>
                  <span className="align-middle">Dashboard</span>
                </Link>
              </li>

              <li
                className={`sidebar-item ${location.pathname === "/department" ? "active" : ""}`}
              >
                <Link className="sidebar-link" to="/department">
                  <i className="bi bi-diagram-3-fill"></i>
                  <span className="align-middle">Department</span>
                </Link>
              </li>

              <li
                className={`sidebar-item ${location.pathname === "/designation" ? "active" : ""}`}
              >
                <Link className="sidebar-link" to="/designation">
                  <i className="bi bi-file-earmark-medical-fill"></i>
                  <span className="align-middle">Designation</span>
                </Link>
              </li>

              <li
                className={`sidebar-item ${location.pathname.startsWith("/employee") ? "active" : ""}`}
              >
                <Link className="sidebar-link" to="/employeeview">
                  <i className="bi bi-person-plus-fill"></i>
                  <span className="align-middle">Employees</span>
                </Link>
              </li>

              <li className="sidebar-item has-dropdown">
                <a
                  className="sidebar-link collapsed d-flex justify-content-between align-items-center"
                  href="#"
                  onClick={toggleLetters}
                  data-bs-target="#letterManagement"
                  data-bs-toggle="collapse"
                >
                  <span className="align-middle">
                    <i className="bi bi-files" style={{ fontSize: "medium" }}></i>
                  </span>
                  <span className="align-middle">Letters</span>
                  <i className={`bi ${isLettresOpen ? "bi-chevron-up" : "bi-chevron-down"} ms-auto`}></i>
                </a>
                <ul
                  id="letterManagement"
                  className={`sidebar-dropDown list-unstyled collapse ${isLettresOpen ? "show" : ""}`}
                >
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/offerLetterForm" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/offerLetterForm">
                      Offer Letter
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/experienceForm" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/experienceForm">
                      Experience
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/relievingSummary" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/relievingSummary">
                      Relieving
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/appraisalLetter" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/appraisalLetter">
                      Appraisal
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/internsLetter" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/internsLetter">
                      Interns
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="sidebar-item has-dropdown">
                <a
                  className="sidebar-link collapsed d-flex justify-content-between align-items-center"
                  href="#"
                  onClick={toggleAttendance}
                  data-bs-target="#attendenceManagement"
                  data-bs-toggle="collapse"
                >
                  <span className="align-middle">
                    <i className="bi bi-calendar-check-fill" style={{ fontSize: "medium" }}></i>
                  </span>
                  <span className="align-middle">Attendance</span>
                  <i className={`bi ${isAttendanceOpen ? "bi-chevron-up" : "bi-chevron-down"} ms-auto`}></i>
                </a>
                <ul
                  id="attendenceManagement"
                  className={`sidebar-dropDown list-unstyled collapse ${isAttendanceOpen ? "show" : ""}`}
                >
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/addAttendance" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/addAttendance">
                      Manage Attendance
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/attendanceReport" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/attendanceReport">
                      Attendance Report
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="sidebar-item has-dropdown">
                <a
                  className="sidebar-link collapsed d-flex justify-content-between align-items-center"
                  href="#"
                  onClick={togglePayroll}
                  data-bs-target="#payroll"
                  data-bs-toggle="collapse"
                >
                  <span className="align-middle">
                    <i className="bi bi-receipt-cutoff"></i>
                  </span>
                  <span className="align-middle">Payroll</span>
                  <i className={`bi ${isPayrollOpen ? "bi-chevron-up" : "bi-chevron-down"} ms-auto`}></i>
                </a>
                <ul
                  id="payroll"
                  className={`sidebar-dropDown list-unstyled collapse ${isPayrollOpen ? "show" : ""}`}
                  data-bs-parent="#sidebar"
                >
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/employeeSalaryStructure" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/employeeSalaryStructure">
                      Manage Salary
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/payslipGeneration" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/payslipGeneration">
                      Generate Payslips
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname.startsWith("/payslipsList") ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/payslipsList">
                      Payslips
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="sidebar-item has-dropdown">
                <a
                  className="sidebar-link collapsed d-flex justify-content-between align-items-center"
                  href="#"
                  onClick={toggleSettings}
                  data-bs-target="#settingsManagement"
                  data-bs-toggle="collapse"
                >
                  <span className="align-middle">
                    <i className="bi bi-gear-fill" style={{ fontSize: "medium" }}></i>
                  </span>
                  <span className="align-middle">Settings</span>
                  <i className={`bi ${isSettingsOpen ? "bi-chevron-up" : "bi-chevron-down"} ms-auto`}></i>
                </a>
                <ul
                  id="settingsManagement"
                  className={`sidebar-dropDown list-unstyled collapse ${isSettingsOpen ? "show" : ""}`}
                >
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/companySalaryView" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/companySalaryView">
                      Company Salary Structure
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/offerLetters" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/offerLetters">
                      Offer Letter Templates
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/appraisalTemplates" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/appraisalTemplates">
                      Appraisal Templates
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/experienceLetter" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/experienceLetter">
                      Experience Letter Template
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/relievingTemplates" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/relievingTemplates">
                      Relieving Template
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/internsTemplates" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/internsTemplates">
                      Interns Template
                    </Link>
                  </li>
                  <li
                    style={{ paddingLeft: "40px" }}
                    className={`sidebar-item ${location.pathname === "/payslipTemplates" ? "active" : ""}`}
                  >
                    <Link className="sidebar-link" to="/payslipTemplates">
                      Payslip Template
                    </Link>
                  </li>
                </ul>
              </li>
            </>
          )}

          {/* {roles === "Employee" && (

            <>
              <li
                className={`sidebar-item ${
                  location.pathname === "/main" ? "active" : ""
                }`}
              >
                <Link className="sidebar-link" to={"/main"}>
                  <Speedometer2 color="orange" size={25} />{" "}
                  <span className="align-middle" >
                    Dashboard
                  </span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${
                  location.pathname === "/department" ? "active" : ""
                }`}
              >
                <Link className="sidebar-link" to={"/department"}>
                  <Diagram3Fill color="orange" size={25} />{" "}
                  <span className="align-middle" >
                    Departments
                  </span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${
                  location.pathname === "/designation" ? "active" : ""
                }`}
              >
                <Link className="sidebar-link" to={"/designation"}>
                  <FileMedicalFill color="orange" size={25} />{" "}
                  <span className="align-middle" >
                    Designation
                  </span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${
                  location.pathname.startsWith("/employee") ? "active" : ""
                }`}
              >
                <Link className="sidebar-link" to={"/employeeview"}>
                  <PersonVcardFill color="orange" size={25} />{" "}
                  <span className="align-middle" >
                    Employees
                  </span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${
                  location.pathname.startsWith("/payslip") ? "active" : ""
                }`}
              >
                <Link className="sidebar-link" to={"/payslipview"}>
                  <Receipt color="orange" size={25} />{" "}
                  <span className="align-middle" >
                    PaySlips
                  </span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${
                  location.pathname.startsWith("/relieving") ? "active" : ""
                }`}
              >
                <Link className="sidebar-link" to={"/relievingview"}>
                  <EraserFill color="orange" size={25} />{" "}
                  <span className="align-middle" >
                    Relieved Summary
                  </span>
                </Link>
              </li>
            </>
          )} */}

          {(!user || !(user.userRole && (user.userRole.includes("company_admin") || user.userRole.includes("ems_admin")))) && (
            <>
              <li
                className={`sidebar-item ${location.pathname === "/main" ? "active" : ""}`}
              >
                <Link className="sidebar-link" to="/main">
                  <i className="bi bi-grid-1x2-fill"></i>
                  <span className="align-middle">Dashboard</span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${location.pathname === "/employeeSalary" ? "active" : ""}`}
              >
                <Link className="sidebar-link" to="/employeeSalary">
                  <i className="bi bi-card-list"></i>
                  <span className="align-middle">Salary List</span>
                </Link>
              </li>
              <li
                className={`sidebar-item ${location.pathname === "/employeePayslip" ? "active" : ""}`}
              >
                <Link className="sidebar-link" to="/employeePayslip">
                  <i className="bi bi-file-earmark-medical-fill"></i>
                  <span className="align-middle">Payslips</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}


export default SideNav;
