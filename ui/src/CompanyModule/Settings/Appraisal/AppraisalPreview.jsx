import React, { useEffect, useMemo, useState } from "react";
import { Bounce, toast } from "react-toastify";
import { useAuth } from "../../../Context/AuthContext";
import { companyViewByIdApi, EmployeeGetApiById} from "../../../Utils/Axios";
import AppraisalTemplate1 from "./AppraisalTemplate1";
import AppraisalTemplate2 from "./AppraisalTemplate2";

const AppraisalPreview = ({ previewData, selectedTemplate }) => { // Accept previewData as a prop
  const [companyData, setCompanyData] = useState({});
  const [loading, setLoading] = useState(false);
  const { authUser, company } = useAuth();

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
      if (response.data.companyId) {
        fetchCompanyData(response.data.companyId);
      }
    } catch (err) {
      console.error("Error fetching employee details:", err);
      toast.error("Failed to fetch employee details");
    }
  };

  useEffect(() => {
    const userId = authUser.userId;
    setLoading(true);
    if (userId) {
      fetchEmployeeDetails(userId);
    }
    setLoading(false);
  }, [authUser.userId]);
  console.log("companyData***",company);

  const templates = useMemo(() => [
    {
      title: "Template 1",
      name: "1",
      content: () => (
        <AppraisalTemplate1
        companyLogo={company?.imageFile}
        companyData={company}
        allowances={previewData.allowances}   
        date={previewData.date}
        hike={previewData.salaryHikePersentage}
        employeeName={previewData.employeeName}
        employeeId={previewData.employeeId}
        designation={previewData.designationName}
        effectiveDate={previewData.dateOfSalaryIncrement}
        salaryIncrease={previewData.grossCompensation} 
        totalAllowances= {previewData.totalAllowances}
        basicSalary= {previewData.basicSalary}
        draft={previewData.draft}
        stampImage={company?.stampImage}
        />
      ),
    },
    {
      title: "Template 2",
      name: "2",
      content: () => (
        <AppraisalTemplate2
          companyLogo={company?.imageFile}
          companyData={company}
          hike={previewData.salaryHikePersentage}
          allowances={previewData.allowances}   // Passing allowances dynamically
          date={previewData.date}
          employeeName={previewData.employeeName}
          employeeId={previewData.employeeId}
          designation={previewData.designationName}
          effectiveDate={previewData.dateOfSalaryIncrement}
          salaryIncrease={previewData.grossCompensation} 
          totalAllowances= {previewData.totalAllowances}
          basicSalary= {previewData.basicSalary}
          draft={previewData.draft}
          stampImage={company?.stampImage}
         />
      ),
    },    
  ], [companyData, company?.imageFile]);
  

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

export default AppraisalPreview;
