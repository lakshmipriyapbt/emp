import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CompanyImageGetApi, companyViewByIdApi, EmployeeGetApiById, EmployeePaySlipDownloadById, EmployeePayslipGetById } from "../Utils/Axios";
import { toast } from "react-toastify";
import LayOut from "../LayOut/LayOut";
import { useAuth } from "../Context/AuthContext";

const PayslipUpdate = () => {
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

  const handleUpdate = async () => {
    if (employeeId && payslipId) {
      try {
        await EmployeePaySlipDownloadById(employeeId, payslipId);
        toast.success("Payslip downloaded successfully");
      } catch (err) {
        console.error("Error downloading payslip:", err);
        toast.error("Failed to download payslip");
      }
    } else {
      console.error("Employee ID or Payslip ID is missing");
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
              <li className="breadcrumb-item"><a href="/payslipGeneration">PayRoll</a></li>
              <li className="breadcrumb-item active">Edit Payslip</li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="container mt-2" style={{ pointerEvents: "none" }}>
        <div className="card">
          <div className="card-header mt-2">
            <div className="header-content" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p><b>{payslipData.month} - {payslipData.year} PaySlip</b></p>
                <p>Employee Name: <b>{employeeDetails.firstName} {employeeDetails.lastName}</b></p>
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
            <div className="payslip-details" style={{ border: "1px solid black" }}>
              <div style={{ padding: "20px" }}>
                <table style={{ borderCollapse: "collapse", border: "1px solid black", width: "100%" }}>
                  <tbody>
                    <tr>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left" }}>Employee ID</th>
                      <td style={{ padding: "4px", textAlign: "left" }}>{employeeDetails.employeeId}</td>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left" }}>Date of Hiring</th>
                      <td style={{ padding: "4px", textAlign: "left" }}>{employeeDetails.dateOfHiring}</td>
                    </tr>
                    <tr>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left" }}>Department</th>
                      <td style={{ padding: "4px", textAlign: "left" }}>{employeeDetails.departmentName}</td>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left" }}>Designation</th>
                      <td style={{ padding: "4px", textAlign: "left" }}>{employeeDetails.designationName}</td>
                    </tr>
                    <tr>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left" }}>Bank Name</th>
                      <td style={{ padding: "4px", textAlign: "left" }}>{employeeDetails.bankName}</td>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left" }}>Account Number</th>
                      <td style={{ padding: "4px", textAlign: "left" }}>{employeeDetails.accountNo}</td>
                    </tr>
                    <tr>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left" }}>UAN Number</th>
                      <td style={{ padding: "4px", textAlign: "left" }}>{employeeDetails.uanNo}</td>
                      <th style={{ padding: "4px", width: "150px", textAlign: "left" }}>PAN Number</th>
                      <td style={{ padding: "4px", textAlign: "left" }}>{employeeDetails.panNo}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="lop" style={{ padding: "20px" }}>
                <table style={{ borderCollapse: "collapse", border: "1px solid black", width: "100%" }}>
                  <tbody>
                    <tr>
                      <th style={{ padding: "4px", width: "180px", textAlign: "left" }}>Total Working Days</th>
                      <td style={{ padding: "4px", textAlign: "left" }}>{payslipData.attendance?.totalWorkingDays || 0}</td>
                      <th style={{ padding: "4px", width: "180px", textAlign: "left" }}>Working Days</th>
                      <td style={{ padding: "4px", textAlign: "left" }}>{payslipData.attendance?.noOfWorkingDays || 0}</td>
                      <th style={{ padding: "4px", width: "180px", textAlign: "left" }}>Total Leaves</th>
                      <td style={{ padding: "4px", textAlign: "left" }}>{(payslipData.attendance?.totalWorkingDays || 0) - (payslipData.attendance?.noOfWorkingDays || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="salary-details" style={{ padding: "20px", paddingTop: "10px", paddingBottom: "10px" }}>
                <table style={{ borderCollapse: "collapse", border: "1px solid black", width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "4px", width: "300px", textAlign: "left" }}>Earnings (A)</th>
                      <th style={{ padding: "4px", width: "300px", textAlign: "left" }}>Amount</th>
                      <th style={{ padding: "4px", width: "300px", textAlign: "left" }}>Deductions (B)</th>
                      <th style={{ padding: "4px", width: "300px", textAlign: "left" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(payslipData.salary?.salaryConfigurationEntity?.allowances || {}).map(([key, value], index) => {
                      const deductionKey = Object.keys(payslipData.salary?.salaryConfigurationEntity?.deductions || {})[index];
                      const deductionValue = payslipData.salary?.salaryConfigurationEntity?.deductions[deductionKey];

                      return (
                        <tr key={key}>
                          <td className="earnings" style={{ padding: "4px", textAlign: "left" }}>{formatFieldName(key)}</td>
                          <td className="earnings" style={{ textAlign: "left" }}>{value}</td>
                          <td className="deductions" style={{ padding: "4px", textAlign: "left" }}>{deductionKey ? formatFieldName(deductionKey) : ''}</td>
                          <td className="deductions" style={{ textAlign: "left" }}>{deductionValue}</td>
                        </tr>
                      );
                    })}

                    {Object.entries(payslipData.salary?.salaryConfigurationEntity?.deductions || {})
                      .slice(Object.keys(payslipData.salary?.salaryConfigurationEntity?.allowances || {}).length)
                      .map(([key, value]) => (
                        <tr key={key}>
                          <td className="earnings" style={{ padding: "4px", textAlign: "left" }}></td>
                          <td className="earnings" style={{ textAlign: "left" }}></td>
                          <td className="deductions" style={{ padding: "4px", textAlign: "left" }}>{formatFieldName(key)}</td>
                          <td className="deductions" style={{ textAlign: "left" }}>{value}</td>
                        </tr>
                      ))}

                    {/* Static rows for specific deductions */}
                    <tr>
                      <td className="earnings" style={{ padding: "4px", textAlign: "left" }}></td>
                      <td className="earnings" style={{ textAlign: "left" }}></td>
                      <td className="deductions" style={{ padding: "4px", textAlign: "left" }}>LOP</td>
                      <td className="deductions" style={{ textAlign: "left" }}>{payslipData.salary?.lop || 0}</td>
                    </tr>
                    <tr>
                      <td className="earnings" style={{ padding: "4px", textAlign: "left" }}></td>
                      <td className="earnings" style={{ textAlign: "left" }}></td>
                      <td className="deductions" style={{ padding: "4px", textAlign: "left" }}>Total Deductions (B)</td>
                      <td className="deductions" style={{ textAlign: "left" }}><b>{payslipData.salary?.totalDeductions || 0}</b></td>
                    </tr>
                    <tr>
                      <td className="earnings" style={{ padding: "4px", textAlign: "left" }}></td>
                      <td className="earnings" style={{ textAlign: "left" }}></td>
                      <th style={{ padding: "4px", width: "300px", textAlign: "left" }}>Taxes (C)</th>
                      <th style={{ padding: "4px", width: "300px", textAlign: "left" }}>Amount</th>
                    </tr>
                    <tr>
                      <td className="earnings" style={{ padding: "4px", textAlign: "left" }}></td>
                      <td className="earnings" style={{ textAlign: "left" }}></td>
                      <td className="deductions" style={{ padding: "4px", textAlign: "left" }}>PF Tax</td>
                      <td className="deductions" style={{ textAlign: "left" }}>{payslipData.salary?.pfTax || 0}</td>
                    </tr>
                    <tr>
                      <td className="earnings" style={{ padding: "4px", textAlign: "left" }}></td>
                      <td className="earnings" style={{ textAlign: "left" }}></td>
                      <td className="deductions" style={{ padding: "4px", textAlign: "left" }}>Income Tax</td>
                      <td className="deductions" style={{ textAlign: "left" }}>{payslipData.salary?.incomeTax || 0}</td>
                    </tr>
                    <tr>
                      <td className="earnings" style={{ padding: "4px", textAlign: "left" }}>Total Earnings (A)</td>
                      <td className="earnings" style={{ textAlign: "left" }}><b>{payslipData.salary?.totalEarnings || 0}</b></td>
                      <td className="deductions" style={{ padding: "4px", textAlign: "left" }}>Total Tax(C)</td>
                      <td className="deductions" style={{ textAlign: "left" }}><b>{payslipData.salary?.totalTax || 0}</b></td>
                    </tr>
                    {/* Remaining rows for net salary and in words */}
                    <tr>
                      <td className="earnings" colSpan={1} style={{ padding: "4px", textAlign: "left" }}>Net Salary (A-B-C)</td>
                      <td className="earnings" colSpan={3} style={{ textAlign: "left" }}><b>{payslipData.salary?.netSalary || 0}</b></td>
                    </tr>
                    <tr>
                      <td className="earnings" colSpan={1} style={{ padding: "4px", textAlign: "left" }}>Net Pay (in words):</td>
                      <td className="earnings" colSpan={3} style={{ textAlign: "left" }}><b>{payslipData.inWords || ""}</b></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <span className="ms-4"><em>This is a computer-generated payslip and does not require authentication</em></span>
              <div className="bottom" style={{ marginLeft: "50px", marginRight: "50px", marginTop: "1px", paddingBottom: "30px" }}>
                <div className="line"><hr /></div>
                &nbsp;&nbsp;
              </div>
              <div className="bottom" style={{ marginLeft: "50px", marginRight: "50px", marginTop: "20px", paddingBottom: "2px" }}>
                <div className="line"></div>
                <div className="company-details text-center" style={{ padding: "2px" }}>
                  <p>{companyData.companyAddress},</p>
                  <p>Contact No: {companyData.mobileNo}, Mail Id: {companyData.emailId}.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-end align-items-center me-4">
        <button type="button" className="btn btn-danger" onClick={handleUpdate}>
          <span className="m-2">Update</span>
        </button>
      </div>
    </LayOut>
  );
};

export default PayslipUpdate;
