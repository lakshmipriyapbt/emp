import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CompanyImageGetApi, companyViewByIdApi, EmployeeGetApiById, EmployeePaySlipDownloadById, EmployeePayslipGetById } from "../Utils/Axios";
import { toast } from "react-toastify";
import LayOut from "../LayOut/LayOut";
import { Download } from "react-bootstrap-icons";
import { useAuth } from "../Context/AuthContext";

const PayslipDoc = () => {
  const [companyData, setCompanyData] = useState({});
  const [payslipData, setPayslipData] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const employeeId = queryParams.get("employeeId");
  const payslipId = queryParams.get("payslipId");
  const { user, logoFileName } = useAuth();

  const fetchCompanyData = async (companyId) => {
    try {
      const response = await companyViewByIdApi(companyId);
      setCompanyData(response.data);
    } catch (err) {
      console.error("Error fetching company data:", err);
      toast.error("Failed to fetch company data");
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await EmployeeGetApiById(employeeId);
      setEmployeeDetails(response.data);
      if (response.data.companyId) {
        fetchCompanyData(response.data.companyId);
      }
    } catch (err) {
      console.error("Error fetching employee details:", err);
      toast.error("Failed to fetch employee details");
    }
  };

  const fetchPayslipData = async () => {
    if (!employeeId || !payslipId) return;
    try {
      const response = await EmployeePayslipGetById(employeeId, payslipId);
      setPayslipData(response.data.data || null);
    } catch (err) {
      console.error("Error fetching payslip data:", err);
      toast.error("Failed to fetch payslip data");
    }
  };

  const handleDownload = async () => {
    if (employeeId && payslipId) {
      try {
        const success = await EmployeePaySlipDownloadById(employeeId, payslipId);
        if (success) {
          toast.success("Payslip downloaded successfully");
        } else {
          toast.error("Failed to download payslip");
        }
      } catch (err) {
        console.error("Error downloading payslip:", err);
        toast.error("Failed to download payslip");
      }
    } else {
      console.error("Employee ID or Payslip ID is missing");
      toast.error("Employee ID or Payslip ID is missing");
    }
  };
  
  useEffect(() => {
    setLoading(true);
    if (employeeId) {
      fetchEmployeeDetails(employeeId);
    }
    if (employeeId && payslipId) {
      fetchPayslipData();
    }
    setLoading(false);
  }, [employeeId, payslipId, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!payslipData || !employeeDetails) {
    return <div>No data available</div>;
  }

  const maskPanNumber = (panNumber) => {
    if (!panNumber || panNumber.length < 4) return panNumber;
    const maskedPart = panNumber.slice(0, -4).replace(/./g, '*');
    const visiblePart = panNumber.slice(-4);
    return maskedPart + visiblePart;
  };

  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <LayOut>
      <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
        <div className="col">
          <h1 className="h3 mb-3">
            <strong>PaySlip</strong>
          </h1>
        </div>
        <div className="col-auto" style={{ paddingBottom: '20px' }}>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/main">Home</a>
              </li>
              <li className="breadcrumb-item"><a href="/payslipsList">Payslip View</a></li>
              <li className="breadcrumb-item active">PaySlipForm</li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="container mt-4" style={{ pointerEvents: "none" }}>
        <div className="card">
          <div className="card-header mt-4" style={{ background: "none", paddingBottom: "0px", paddingLeft: "30px", paddingRight: "30px" }}>
            <div className="header-content mt-4" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p><b>{payslipData.month} - {payslipData.year} PaySlip</b></p>
                <p><b>Name: {employeeDetails.firstName} {employeeDetails.lastName}</b></p>
              </div>
              <div>
                {logoFileName ? (
                  <img className="align-middle" src={logoFileName} alt="Logo" style={{ height: "80px", width: "180px" }} />
                ) : (
                  <p>Logo</p>
                )}
              </div>
            </div>
          </div>
          <div className="card-body m-0 p-2">
            <div className="payslip-details">
              <div style={{ padding: "20px" }}>
                <table style={{ borderCollapse: "collapse", border: "1px solid black", width: "100%" }}>
                  <tbody>
                    <tr>
                      <th colSpan={4} style={{ textAlign: "left", background: "#ffcc80", color: 'black', paddingLeft: "5px", border: "1px solid black" }}><b>Employee Details</b></th>
                    </tr>
                    <tr>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Employee ID</th>
                      <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{employeeDetails.employeeId}</td>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Joining Date</th>
                      <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{employeeDetails.dateOfHiring}</td>
                    </tr>
                    <tr>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Date Of Birth</th>
                      <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{employeeDetails.dateOfBirth}</td>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>PAN</th>
                      <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{maskPanNumber(employeeDetails.panNo)}</td>
                    </tr>
                    <tr>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Department</th>
                      <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{employeeDetails.departmentName}</td>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>UAN</th>
                      <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{maskPanNumber(employeeDetails.uanNo)}</td>
                    </tr>
                    <tr>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Designation</th>
                      <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{employeeDetails.designationName}</td>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Location</th>
                      <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>
                      {/* {employeeDetails.location && typeof employeeDetails.location === 'string' ?
                          (() => {
                            const parts = employeeDetails.location.trim().split(',');
                            const state = parts.slice(-2, -1)[0]?.trim() || ''; // Optional chaining and fallback
                            const address = parts.slice(-3, -2)[0]?.trim() || ''; // Optional chaining and fallback
                            return `${address}, ${state}`;
                          })() : ''
                        } */}
                        {employeeDetails.location}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="4" style={{ textAlign: "left", border: "1px solid black" }}>
                        Bank ACC No: {maskPanNumber(employeeDetails.accountNo)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        IFSC: {employeeDetails.ifscCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        Bank: {employeeDetails.bankName}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="lop" style={{ padding: "20px" }}>
                <table style={{ borderCollapse: "collapse", border: "1px solid black", width: "100%" }}>
                  <tbody>
                    <tr>
                      <th style={{ padding: "4px", width: "180px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Total Working Days</th>
                      <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{payslipData.attendance?.totalWorkingDays || 0}</td>
                      <th style={{ padding: "4px", width: "180px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Working Days</th>
                      <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{payslipData.attendance?.noOfWorkingDays || 0}</td>
                      <th style={{ padding: "4px", width: "180px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Total Leaves</th>
                      <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{(payslipData.attendance?.totalWorkingDays || 0) - (payslipData.attendance?.noOfWorkingDays || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="salary-details" style={{ padding: "20px", paddingTop: "10px", paddingBottom: "10px" }}>
                <table style={{ borderCollapse: "collapse", border: "1px solid black", width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "4px", width: "300px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Earnings (A)</th>
                      <th style={{ padding: "4px", width: "300px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Amount (A)</th>
                      <th style={{ padding: "4px", width: "300px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Deductions (B)</th>
                      <th style={{ padding: "4px", width: "300px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Amount (B)</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderCollapse: "collapse" }}>
                    {Object.entries(payslipData.salary?.salaryConfigurationEntity?.allowances || {}).map(([key, value], index) => {
                      const deductionKey = Object.keys(payslipData.salary?.salaryConfigurationEntity?.deductions || {})[index];
                      const deductionValue = payslipData.salary?.salaryConfigurationEntity?.deductions[deductionKey];
                      return (
                        <tr key={key} style={{ border: "none" }}>
                          <td className="earnings" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}>{formatFieldName(key)}</td>
                          <td className="earnings" style={{ textAlign: "left", border: "none", borderRight: "1px solid black" }}>{value}</td>
                          <td className="deductions" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}>{deductionKey ? formatFieldName(deductionKey) : ''}</td>
                          <td className="deductions" style={{ textAlign: "left", border: "none" }}>{deductionValue}</td>
                        </tr>
                      );
                    })}

                    {Object.entries(payslipData.salary?.salaryConfigurationEntity?.deductions || {})
                      .slice(Object.keys(payslipData.salary?.salaryConfigurationEntity?.allowances || {}).length)
                      .map(([key, value]) => (
                        <tr key={key} style={{ border: "none" }}>
                          <td className="earnings" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}></td>
                          <td className="earnings" style={{ textAlign: "left", border: "none", borderRight: "1px solid black" }}></td>
                          <td className="deductions" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}>{formatFieldName(key)}</td>
                          <td className="deductions" style={{ textAlign: "left", border: "none" }}>{value}</td>
                        </tr>
                      ))}
                    <tr>
                      <td className="earnings" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}></td>
                      <td className="earnings" style={{ textAlign: "left", border: "none", borderRight: "1px solid black" }}></td>
                      <td className="deductions" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}>LOP</td>
                      <td className="deductions" style={{ textAlign: "left", border: "none" }}>{payslipData.salary?.lop || 0}</td>
                    </tr>
                    <tr>
                      <td className="earnings" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}></td>
                      <td className="earnings" style={{ textAlign: "left", border: "none", borderRight: "1px solid black" }}></td>
                      <td className="deductions" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}>Total Deductions (B)</td>
                      <td className="deductions" style={{ textAlign: "left", border: "none" }}>{payslipData.salary?.totalDeductions || 0}</td>
                    </tr>
                    <tr>
                      <td className="earnings" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}></td>
                      <td className="earnings" style={{ textAlign: "left", border: "none", borderRight: "1px solid black" }}></td>
                      <th style={{ padding: "4px", width: "300px", textAlign: "left", background: "#ffcc80", color: 'black', border: "none", border: "1px solid black" }}>Taxes (C)</th>
                      <th style={{ padding: "4px", width: "300px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Amount (C)</th>
                    </tr>
                    <tr>
                      <td className="earnings" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}></td>
                      <td className="earnings" style={{ textAlign: "left", border: "none", borderRight: "1px solid black" }}></td>
                      <td className="deductions" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}>PF Tax</td>
                      <td className="deductions" style={{ textAlign: "left", border: "none" }}>{payslipData.salary?.pfTax || 0}</td>
                    </tr>
                    <tr>
                      <td className="earnings" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}></td>
                      <td className="earnings" style={{ textAlign: "left", border: "none", borderRight: "1px solid black" }}></td>
                      <td className="deductions" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}>Income Tax</td>
                      <td className="deductions" style={{ textAlign: "left", border: "none" }}>{payslipData.salary?.incomeTax || 0}</td>
                    </tr>
                    <tr>
                      <td className="earnings" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}>Total Earnings (A)</td>
                      <td className="earnings" style={{ textAlign: "left", border: "none", borderRight: "1px solid black" }}>{payslipData.salary?.totalEarnings || 0}</td>
                      <td className="deductions" style={{ padding: "4px", textAlign: "left", border: "none", borderRight: "1px solid black" }}>Total Tax(C)</td>
                      <td className="deductions" style={{ textAlign: "left", border: "none" }}>{payslipData.salary?.totalTax || 0}</td>
                    </tr>
                    <tr>
                      <td className="earnings" colSpan={1} style={{ padding: "4px", textAlign: "left", background: "#ffcc80", color: 'black', border: "none", border: "1px solid black" }}><b>Net Pay (A-B-C)</b></td>
                      <td className="earnings" colSpan={3} style={{ textAlign: "left", border: "1px solid black" }}><b>{payslipData.salary?.netSalary || 0}</b></td>
                    </tr>
                    <tr>
                      <td className="earnings" colSpan={1} style={{ padding: "4px", textAlign: "left", background: "#ffcc80", color: 'black', border: "none", border: "1px solid black" }}><b>Net Salary (in words)</b></td>
                      <td className="earnings" colSpan={3} style={{ textAlign: "left", border: "1px solid black" }}><b>{payslipData.inWords || ""}</b></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <span className="ms-4"><em>This is a computer-generated payslip and does not require authentication</em></span>
              <div className="bottom" style={{ marginLeft: "50px", marginRight: "50px", marginTop: "1px", paddingBottom: "30px" }}>
                &nbsp;&nbsp;
              </div>
              <div className="line" style={{ marginLeft: "20px", marginRight: "20px", color: "black " }}><hr /></div>
              <div className="bottom" style={{ marginLeft: "50px", marginRight: "50px", marginTop: "20px", paddingBottom: "2px" }}>
                <div className="line"></div>
                <div className="company-details text-center" style={{ padding: "2px" }}>
                  <h6>{companyData.companyAddress}.</h6>
                  <h6>Contact No: {companyData.mobileNo}</h6>
                  <h6>Mail Id: {companyData.emailId}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-end align-items-center me-4">
        <button type="button" className="btn btn-outline-primary" onClick={handleDownload}>
          <span className="m-2">Download</span> <Download size={18} className="ml-1" />
        </button>
      </div>
    </LayOut>
  );
};

export default PayslipDoc;






// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import {
//   CompanyImageGetApi,
//   companyViewByIdApi,
//   EmployeeGetApiById,
//   EmployeePaySlipDownloadById,
//   EmployeePayslipGetById
// } from "../Utils/Axios";
// import { toast } from "react-toastify";
// import LayOut from "../LayOut/LayOut";
// import { Download } from "react-bootstrap-icons";
// import { useAuth } from "../Context/AuthContext";

// const PayslipDoc = () => {
//   const [companyData, setCompanyData] = useState({});
//   const [payslipData, setPayslipData] = useState(null);
//   const [employeeDetails, setEmployeeDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const employeeId = queryParams.get("employeeId");
//   const payslipId = queryParams.get("payslipId");
//   const { user, logoFileName } = useAuth();

//   const fetchCompanyData = async (companyId) => {
//     try {
//       const response = await companyViewByIdApi(companyId);
//       setCompanyData(response.data);
//     } catch (err) {
//       console.error("Error fetching company data:", err);
//       toast.error("Failed to fetch company data");
//     }
//   };

//   const fetchEmployeeDetails = async (employeeId) => {
//     try {
//       const response = await EmployeeGetApiById(employeeId);
//       setEmployeeDetails(response.data);
//       if (response.data.companyId) {
//         fetchCompanyData(response.data.companyId);
//       }
//     } catch (err) {
//       console.error("Error fetching employee details:", err);
//       toast.error("Failed to fetch employee details");
//     }
//   };

//   const fetchPayslipData = async () => {
//     if (!employeeId || !payslipId) return;
//     try {
//       const response = await EmployeePayslipGetById(employeeId, payslipId);
//       setPayslipData(response.data.data || null);
//     } catch (err) {
//       console.error("Error fetching payslip data:", err);
//       toast.error("Failed to fetch payslip data");
//     }
//   };

//   const handleDownload = async () => {
//     if (employeeId && payslipId) {
//       try {
//         await EmployeePaySlipDownloadById(employeeId, payslipId);
//         toast.success("Payslip downloaded successfully");
//       } catch (err) {
//         console.error("Error downloading payslip:", err);
//         toast.error("Failed to download payslip");
//       }
//     } else {
//       console.error("Employee ID or Payslip ID is missing");
//     }
//   };

//   useEffect(() => {
//     setLoading(true);
//     if (employeeId) {
//       fetchEmployeeDetails(employeeId);
//     }
//     if (employeeId && payslipId) {
//       fetchPayslipData();
//     }
//     setLoading(false);
//   }, [employeeId, payslipId, user]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!payslipData || !employeeDetails) {
//     return <div>No data available</div>;
//   }

//   const maskPanNumber = (panNumber) => {
//     if (!panNumber || panNumber.length < 4) return panNumber;
//     const maskedPart = panNumber.slice(0, -4).replace(/./g, '*');
//     const visiblePart = panNumber.slice(-4);
//     return maskedPart + visiblePart;
//   };

//   const formatFieldName = (fieldName) => {
//     return fieldName
//       .replace(/([A-Z])/g, ' $1')
//       .replace(/^./, (str) => str.toUpperCase())
//       .trim();
//   };

//   return (
//     <LayOut>
//       <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
//         <div className="col">
//           <h1 className="h3 mb-3">
//             <strong>PaySlip</strong>
//           </h1>
//         </div>
//         <div className="col-auto" style={{ paddingBottom: '20px' }}>
//           <nav aria-label="breadcrumb">
//             <ol className="breadcrumb mb-0">
//               <li className="breadcrumb-item">
//                 <a href="/main">Home</a>
//               </li>
//               <li className="breadcrumb-item"><a href="/payslipsList">Payslip View</a></li>
//               <li className="breadcrumb-item active">PaySlipForm</li>
//             </ol>
//           </nav>
//         </div>
//       </div>
//       <div className="container mt-4" style={{ pointerEvents: "none" }}>
//         <div className="card">
//           <div className="card-header mt-4" style={{ background: "none", paddingBottom: "0px", paddingLeft: "30px", paddingRight: "30px" }}>
//             <div className="header-content mt-4" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <div>
//                 <p><b>{payslipData.month} - {payslipData.year} PaySlip</b></p>
//                 <p><b>Name: {employeeDetails.firstName} {employeeDetails.lastName}</b></p>
//               </div>
//               <div>
//                 {logoFileName ? (
//                   <img className="align-middle" src={logoFileName} alt="Logo" style={{ height: "80px", width: "180px" }} />
//                 ) : (
//                   <p>Logo</p>
//                 )}
//               </div>
//             </div>
//           </div>
//           <div className="card-body m-0 p-2">
//             <div className="payslip-details">
//               <div style={{ padding: "20px" }}>
//                 <table style={{ borderCollapse: "collapse", width: "100%" }}>
//                   <tbody>
//                     <tr>
//                       <th colSpan={4} style={{ textAlign: "left", background: "#ffcc80", color: 'black', paddingLeft: "5px", border: "1px solid black" }}>
//                         <b>Employee Details</b>
//                       </th>
//                     </tr>
//                     <tr>
//                       <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Employee ID</th>
//                       <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{employeeDetails.employeeId}</td>
//                       <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Joining Date</th>
//                       <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{employeeDetails.dateOfHiring}</td>
//                     </tr>
//                     <tr>
//                       <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Date Of Birth</th>
//                       <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{employeeDetails.dateOfBirth}</td>
//                       <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>PAN</th>
//                       <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{maskPanNumber(employeeDetails.panNo)}</td>
//                     </tr>
//                     <tr>
//                       <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Department</th>
//                       <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{employeeDetails.departmentName}</td>
//                       <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>UAN</th>
//                       <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{maskPanNumber(employeeDetails.uanNo)}</td>
//                     </tr>
//                     <tr>
//                       <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Designation</th>
//                       <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{employeeDetails.designationName}</td>
//                       <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>Location</th>
//                       <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>{employeeDetails.location}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//               <div style={{ padding: "20px" }}>
//                 <table style={{ borderCollapse: "collapse", width: "100%" }}>
//                   <tbody>
//                     <tr>
//                       <th colSpan={4} style={{ textAlign: "left", background: "#ffcc80", color: 'black', paddingLeft: "5px", border: "1px solid black" }}>
//                         <b>Pay Details</b>
//                       </th>
//                     </tr>
//                     {payslipData.payslipDetail && payslipData.payslipDetail.length > 0 ? (
//                       payslipData.payslipDetail.map((detail, index) => (
//                         <tr key={index}>
//                           <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>
//                             {formatFieldName(detail.type)}
//                           </th>
//                           <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>
//                             {detail.amount}
//                           </td>
//                           <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#ffcc80", color: 'black', border: "1px solid black" }}>
//                             {formatFieldName(detail.type2)}
//                           </th>
//                           <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}>
//                             {detail.amount2}
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan={4} style={{ textAlign: "center", border: "1px solid black" }}>
//                           No pay details available
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//             <div className="text-center">
//               <button onClick={handleDownload} className="btn btn-primary">
//                 <Download /> Download Payslip
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </LayOut>
//   );
// };

// export default PayslipDoc;
