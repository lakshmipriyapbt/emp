import React, { useEffect, useMemo, useState } from "react";
import {toast } from "react-toastify";
import ExperienceTemplate1 from "./ExperienceTemplate1";
import ExperienceTemplate2 from "./ExperienceTemplate2";
import { useAuth } from "../../../Context/AuthContext";
import { companyViewByIdApi, EmployeeGetApiById} from "../../../Utils/Axios";

const ExperiencePreview = ({ previewData, selectedTemplate }) => { // Accept previewData as a prop
  const [companyData, setCompanyData] = useState({});
  const [loading, setLoading] = useState(false);
  const { company } = useAuth();
  console.log("preview",previewData)
  const fetchCompanyData = async () => {
    try {
      const response = await companyViewByIdApi(company.id);
      setCompanyData(response.data);
    } catch (err) {
      console.error("Error fetching company data:", err);
      toast.error("Failed to fetch company data");
    }
  };
  useEffect(()=>{
    fetchCompanyData();
  },[])

  const templates = useMemo(() => [
    {
      title: "Template 1",
      name: "1",
      content: () => (
        <ExperienceTemplate1
          companyLogo={company?.imageFile}
          companyData={company}
          employeeName={previewData.employeeName}
          employeeId={previewData.employeeId}
          designation={previewData.designationName}
          department={previewData.departmentName}
          joiningDate={previewData.joiningDate}
          experienceDate={previewData.experienceDate}
          date={previewData.date}
        />
      ),
    },
    {
      title: "Template 2",
      name: "2",
      content: () => (
        <ExperienceTemplate2
          companyLogo={company?.imageFile}
          companyData={company}
          employeeName={previewData.employeeName}
          employeeId={previewData.employeeId}
          designation={previewData.designationName}
          department={previewData.departmentName}
          joiningDate={previewData.joiningDate}
          experienceDate={previewData.experienceDate}
          date={previewData.date}
        />
      ),
    },
  ], [companyData, company?.imageFile, previewData]);

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

export default ExperiencePreview;
