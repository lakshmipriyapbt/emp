import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../../Context/AuthContext";
import { companyViewByIdApi, EmployeeGetApiById } from "../../../../Utils/Axios";
import InternOfferLetterTemplate from "./InternOfferLetterTemplate";
import LayOut from "../../../../LayOut/LayOut";
import { Link } from "react-router-dom";

const InternOfferLetter = () => {
  const [companyData, setCompanyData] = useState({});
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { authUser, company={} } = useAuth();

  // // Fetch company data
  // const fetchCompanyData = async (companyId) => {
  //   try {
  //     const response = await companyViewByIdApi(companyId);
  //     setCompanyData(response.data);
  //   } catch (err) {
  //     console.error("Error fetching company data:", err);
  //     toast.error("Failed to fetch company data");
  //   }
  // };

  // // Fetch employee data
  // const fetchEmployeeDetails = async (employeeId) => {
  //   try {
  //     const response = await EmployeeGetApiById(employeeId);
  //     setEmployeeDetails(response.data);
  //     if (response.data.companyId) {
  //       fetchCompanyData(response.data.companyId);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching employee details:", err);
  //     toast.error("Failed to fetch employee details");
  //   }
  // };

  // useEffect(() => {
  //   const userId = authUser.userId;
  //   setLoading(true);
  //   if (userId) {
  //     fetchEmployeeDetails(userId);
  //   }
  //   setLoading(false);
  // }, [authUser.userId]);

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>INTERNSHIP OFFER LETTER</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>         
                </li>
                <li className="breadcrumb-item active">
                  Internship Offer Letter
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Intern Offer Letter Template */}

          <InternOfferLetterTemplate
            companyLogo={company?.imageFile}
            companyData={companyData}
            date="March 20, 2025"
            employeeName="John Doe"
            address="1234 Main St, City, State"
            department="Engineering"
            startDate="2025-06-01"
            endDate="2025-09-01"
            designation="Software Intern"
            associateName="Jane Smith"
            associateDesignation="Engineering Manager"
            stipend="25000"
            acceptDate="2025-04-01"
            hrName="Mark Lee"
            hrEmail="mark.lee@company.com"
            hrMobileNo="9876543210"
            stamp={company?.stampImage}
          />
      </div>
    </LayOut>
  );
};

export default InternOfferLetter;
