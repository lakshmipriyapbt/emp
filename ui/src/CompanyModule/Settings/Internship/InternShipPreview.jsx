import React, { useEffect, useMemo, useState } from "react";
import { Bounce, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext";
import { companyViewByIdApi, EmployeeGetApiById, TemplateGetAPI } from "../../../Utils/Axios";
import InternShipTemplate2 from "./InternShipTemplate2";
import InternshipTemplate1 from "./InternshipTemplate1";

const InternShipPreview = ({ previewData, selectedTemplate }) => { // Accept previewData as a prop
  const [companyData, setCompanyData] = useState({});
  const [loading, setLoading] = useState(false);
  const { user,logoFileName} = useAuth();
  const navigate=useNavigate();
  const logo = "/assets/img/adapt_adapt_logo.png";

  const fetchCompanyData = async (companyId) => {
    try {
      const response = await companyViewByIdApi(companyId);
      setCompanyData(response.data);
      console.log("CompanyData",response.data)
    } catch (err) {
      console.error("Error fetching company data:", err);
      toast.error("Failed to fetch company data");
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await EmployeeGetApiById(employeeId);
      if (response.data.companyId) {
        fetchCompanyData(response.data.companyId);
      }
    } catch (err) {
      console.error("Error fetching employee details:", err);
      toast.error("Failed to fetch employee details");
    }
  };

  useEffect(() => {
    const userId = user.userId;
    setLoading(true);
    if (userId) {
      fetchEmployeeDetails(userId);
    }
    setLoading(false);
  }, [user.userId]);

  const handleApiErrors = (errors) => {
    if (errors.response) {
      const status = errors.response.status;
      let errorMessage = "";

      switch (status) {
        case 403:
          errorMessage = "Session Timeout!";
          navigate("/");
          break;
        case 404:
          errorMessage = "Resource Not Found!";
          break;
        case 406:
          errorMessage = "Invalid Details!";
          break;
        case 500:
          errorMessage = "Server Error!";
          break;
        default:
          errorMessage = "An Error Occurred!";
          break;
      }

      toast.error(errorMessage, {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
    } else {
      toast.error("Network Error!", {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
    }
  };

  const templates = useMemo(() => [
    {
      title: "Template 1",
      name: "1",
      content: () => (
        <InternshipTemplate1
        companyLogo={logoFileName}
        companyName={companyData.companyName}
        companyAddress={companyData.companyAddress}
        contactNumber={companyData.mobileNo}
        mailId={companyData.emailId}
          employeeName={previewData.employeeName}
          employeeId={previewData.employeeId}
          designation={previewData.designationName}
          department={previewData.departmentName}
          startDate={previewData.startDate}
          endDate={previewData.lastWorkingDate}
        />
      ),
    },
    {
      title: "Template 2",
      name: "2",
      content: () => (
        <InternShipTemplate2
        companyLogo={logoFileName}
        companyName={companyData.companyName}
        companyAddress={companyData.companyAddress}
        contactNumber={companyData.mobileNo}
        mailId={companyData.emailId}
          employeeName={previewData.employeeName}
          employeeId={previewData.employeeId}
          department={previewData.departmentName}
          designation={previewData.designationName}
          joiningDate={previewData.dateOfHiring}
          startDate={previewData.startDate}
          endDate={previewData.lastWorkingDate}
        />
      ),
    },
  ], [companyData, logoFileName, previewData]);

  const selectedTemplateContent = useMemo(() => {
    const template = templates.find(t => t.name === selectedTemplate);
    return template ? template.content() : <div className="text-dark">No template selected</div>;
  }, [selectedTemplate, templates]);
  

  return (

      <div className="container-fluid p-0">
        <div>
          {selectedTemplate && (
            <div className="mb-3">
              {selectedTemplateContent}
            </div>
          )}
        </div>
      </div>
  );
};

export default InternShipPreview;
