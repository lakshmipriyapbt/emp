import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import AppraisalTemplate1 from "./AppraisalTemplate1";
import AppraisalTemplate2 from "./AppraisalTemplate2";
import LayOut from "../../LayOut/LayOut";
import { CompanySalaryStructureGetApi, companyViewByIdApi, EmployeeGetApiById, PayslipTemplate, TemplateGetAPI } from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";

const AppraisalTemplate = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [companyData, setCompanyData] = useState({});
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [fetchedTemplate, setFetchedTemplate] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  
  // Salary Structure State
  const [salaryStructure, setSalaryStructure] = useState([]);
  const [allowances, setAllowances] = useState({});
  const [error, setError] = useState("");

  const { authUser, company } = useAuth();
  const logo = "/assets/img/adapt_adapt_logo.png";

  // Fetching Salary Structures
  useEffect(() => {
    const fetchSalaryStructures = async () => {
      try {
        const response = await CompanySalaryStructureGetApi();
        const allSalaryStructures = response.data.data;

        if (allSalaryStructures.length === 0) {
          setError('Company Salary Structure is not defined');
          setSalaryStructure([]);
        } else {
          const activeSalaryStructures = allSalaryStructures.filter(structure => structure.status === "Active");

          if (activeSalaryStructures.length > 0) {
            setSalaryStructure(activeSalaryStructures);
            setAllowances(activeSalaryStructures[0].allowances);
            setError(''); // Clear error if salary structures are found
          } else {
            setError('No active salary structure found');
          }
        }
      } catch (error) {
        setError('Error fetching salary structures.');
        console.error("API fetch error:", error);
      }
    };

    fetchSalaryStructures();
  }, []);

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

  useEffect(() => {
    const userId = authUser.userId;
    setLoading(true);
    if (userId) {
      fetchEmployeeDetails(userId);
    }
    setLoading(false);
  }, [authUser.userId]);

  const fetchTemplate = async (companyId) => {
    try {
      const res = await TemplateGetAPI(companyId);
      const templateNo = res.data.data.relievingTemplateNo; // Get the experience template number
      setFetchedTemplate(res.data.data); // Store fetched data
      setIsFetched(true); // Mark template as fetched
      // Find the corresponding template and set it as selected
      const templateToSelect = templates.find(template => template.name === templateNo);
      if (templateToSelect) {
        setSelectedTemplate(templateToSelect);
        setActiveCardIndex(templates.indexOf(templateToSelect)); // Set the active card index
      }
    } catch (error) {
      handleApiErrors(error);
    }
  };

  useEffect(() => {
    if (companyData) {
      fetchTemplate(companyData.id);
    }
  }, [companyData]);

  const templates = useMemo(() => [
    {
      title: "Template 1",
      name: "1",
      content: () => (
        <AppraisalTemplate1
          companyLogo={company?.imageFile}
          companyData={companyData}
          allowances={allowances}   // Passing allowances dynamically
          date="October 28, 2024"
          employeeName="John Doe"
          employeeId="E123456"
          jobTitle="Software Engineer"
          joiningDate="January 1, 2020"
          lastWorkingDate="October 27, 2024"
        />
      ),
    },
    {
      title: "Template 2",
      name: "2",
      content: () => (
        <AppraisalTemplate2
          companyLogo={company?.imageFile}
          companyData={companyData}
          allowances={allowances}   // Passing allowances dynamically
          date="October 28, 2024"
          employeeName="John Doe"
          employeeId="E123456"
          jobTitle="Software Engineer"
          effectiveDate="November,2024"
        />
      ),
    },
  ], [companyData, allowances, company?.imageFile]);

  useEffect(() => {
    // Set default template as Template 1
    setSelectedTemplate(templates[0]);
    setActiveCardIndex(0); // Set the index of Template 1
  }, [templates]);

  const handleCardClick = (template, index) => {
    setSelectedTemplate(template);
    setActiveCardIndex(index);
    setIsFetched(false);
  };

  const handleSubmitTemplate = async () => {
    const dataToSubmit = {
      companyId: companyData.id, // Ensure this is correct
      appraisalTemplateNo: selectedTemplate.name,
      // Add other necessary fields if required
    };
    try {
      const response = await PayslipTemplate(dataToSubmit);
      
      // Assuming a successful submission is indicated by the presence of a specific property
      if (response.data) { // Adjust this condition based on your API's response structure
        toast.success("Template submitted successfully!");
        setSelectedTemplate(null);
        setActiveCardIndex(null);
        setIsFetched(false);
      } else {
        toast.error("Failed to submit template");
      }
    } catch (error) {
      // Log the error for debugging
      console.error("API call error:", error);
  
      // Check if the error response has details
      if (error.response) {
        console.error("Response data:", error.response.data); // Log response data
        const errorMessage = error.response.data.detail || "An error occurred";
        toast.error(`Error: ${errorMessage}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleApiErrors = (error) => {
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error !");
    }
    console.error(error.response);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Appraisal Templates</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Appraisal Templates</li>
              </ol>
            </nav>
          </div>
        </div>
        <div>
          <div className="row d-flex justify-content-evenly">
            {templates.map((template, index) => (
              <div className="col-md-3" key={index} onClick={() => handleCardClick(template, index)}>
                <div className={`card mb-3 cursor-grab border ${activeCardIndex === index ? 'bg-light' : ''}`}>
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title text-muted">{template.title}</h5>
                      </div>
                    </div>
                    <div className="mb-0">
                      <span className="text-muted">Click to view.</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedTemplate && (
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title text-center">{selectedTemplate.title}</h5>
                {selectedTemplate.content()}
                <div className="text-end">
                  {!isFetched && (
                    <>
                      <button
                        className="btn btn-secondary mt-3 me-2"
                        onClick={() => {
                          setSelectedTemplate(null);
                          setActiveCardIndex(null);
                          setIsFetched(false); // Reset fetched status
                        }}
                      >
                        Close
                      </button>
                      <button className="btn btn-primary mt-3" type="button" onClick={handleSubmitTemplate}>
                        Submit Template
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayOut>
  );
};

export default AppraisalTemplate;
