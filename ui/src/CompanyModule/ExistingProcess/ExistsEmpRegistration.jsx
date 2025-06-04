import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { Bounce, toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import Loader from "../../Utils/Loader";
import {
  EmployeeGetApi,
  RelievingFormPostApi,
  RelievingLetterDownload,
  TemplateGetAPI,
} from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";
import Preview from "../Settings/Relieving/Preview";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../../Redux/EmployeeSlice";

const ExistsEmpRegistration = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm({ mode: "onChange" });
  const { authUser, company } = useAuth();
  const [emp, setEmp] = useState([]);
  const [noticePeriod, setNoticePeriod] = useState(0);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // New state to store the selected employee
  const [templateAvailable, setTemplateAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  // Fetch employees from Redux store
  const { data: employees } = useSelector((state) => state.employees);

  // Fetch employees when the component mounts
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const calculateNoticePeriod = (
    resignationDate,
    relievingDate,
    dateOfHiring
  ) => {
    if (resignationDate && relievingDate) {
      const resignation = new Date(resignationDate);
      const lastWorking = new Date(relievingDate);
      const hiringDate = new Date(dateOfHiring);

      // Check if last working date is after resignation date and resignation date is after hiring date
      if (lastWorking > resignation && resignation > hiringDate) {
        // Calculate full months between resignation and last working date
        const monthDiff =
          (lastWorking.getFullYear() - resignation.getFullYear()) * 12 +
          (lastWorking.getMonth() - resignation.getMonth());

        // Calculate the total number of days between resignation and relieving date
        const totalDaysDiff = Math.floor(
          (lastWorking - resignation) / (1000 * 3600 * 24)
        );

        // Calculate the number of days remaining after accounting for full months
        const daysDiff = totalDaysDiff - monthDiff * 30; // Estimate that 1 month has 30 days

        // Singular/plural handling for months
        const monthText = monthDiff === 1 ? "month" : "months";
        // Singular/plural handling for days
        const dayText = daysDiff === 1 ? "day" : "days";

        // If the difference is less than a month, show only the days
        if (monthDiff === 0) {
          setNoticePeriod(`${daysDiff} ${dayText}`);
        } else {
          // If it's 1 month or more, show both months and days
          setNoticePeriod(`${monthDiff} ${monthText} ${daysDiff} ${dayText}`);
        }
      } else {
        // If the conditions are not met, set notice period to 0
        setNoticePeriod(0);
      }
    } else {
      setNoticePeriod(0);
    }
  };

  useEffect(() => {
    const subscription = watch((value) => {
      calculateNoticePeriod(
        value.resignationDate,
        value.relievingDate,
        value.dateOfHiring
      );
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Custom validation for resignationDate and relievingDate
  const validateResignationDate = (value) => {
    const dateOfHiring = new Date(watch("dateOfHiring"));
    const resignationDate = new Date(value);

    // Check if the resignation date is after the date of hiring
    if (resignationDate < dateOfHiring) {
      return "Resignation Date must be after the Date of Hiring.";
    }
    return true;
  };
  const validateYear = (dateString) => {
    if (!dateString) return true; // Skip validation if empty

    const year = new Date(dateString).getFullYear();
    return year.toString().length === 4 || "Year must be exactly 4 digits";
  };

  const validateRelievingDate = (value) => {
    const resignationDate = new Date(watch("resignationDate"));
    const relievingDate = new Date(value);

    // Check if the relieving date is after the resignation date
    if (relievingDate < resignationDate) {
      return "Last Working Day (Relieving Date) must be after the Resignation Date.";
    }
    return true;
  };

  useEffect(() => {
    if (employees) {
      const activeEmployees = employees
        .filter((employee) => employee.status === "Active")
        .map((employee) => ({
          label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
          value: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId,
          designationName: employee.designationName,
          departmentName: employee.departmentName,
          dateOfHiring: employee.dateOfHiring,
        }));

      setEmp(activeEmployees);
    }
  }, [employees]);

  const fetchTemplate = async (companyId) => {
    try {
      const res = await TemplateGetAPI(companyId);
      const templateNumber = res.data.data.relievingTemplateNo;
      setSelectedTemplate(templateNumber);
      setTemplateAvailable(!!templateNumber);
    } catch (error) {
      setTemplateAvailable(false);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, []);

  const onSubmit = (data) => {
    const draftValue = data.draft === "true";
    const submissionData = {
      date: data.generatedDate,
      resignationDate: data.resignationDate,
      relievingDate: data.relievingDate,
      noticePeriod: noticePeriod,
    };
    const preview = {
      employeeName: selectedEmployee
        ? selectedEmployee.employeeName
        : data.employeeName,
      id: data.employeeId,
      employeeId: selectedEmployee
        ? selectedEmployee.employeeId
        : data.employeeId,
      designationName: data.designationName || "",
      departmentName: data.departmentName || "",
      resignationDate: data.resignationDate || "",
      lastWorkingDate: data.relievingDate || "",
      date: data.generatedDate || "",
      noticePeriod,
      companyName: authUser.company,
      draft: draftValue,
    };
    setPreviewData(preview);
    setShowPreview(true);
    console.log("preview", true);
    setSubmissionData(submissionData);
  };

  const handleConfirmSubmission = async () => {
    const employeeId = previewData.id;
    const isDraft = previewData.draft;

    try {
      // Step 1: First, make the API call to submit the form data (RelievingFormPostApi)
      const response = await RelievingFormPostApi(employeeId, submissionData,isDraft);

      // Display success message for form submission
      toast.success(response.data.message);

      // Step 2: After a 30-second delay, trigger the download API call
      const TIMEOUT_DURATION = 1000; // 5 seconds timeout for download
      const DOWNLOAD_DELAY = 1000; // 5 seconds delay before downloading the relieving letter

      // Create a timeout promise that rejects after the timeout duration for download
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Relieving letter download timed out")),
          TIMEOUT_DURATION
        )
      );

      // Create a flag to prevent further execution if the download completes successfully
      let downloadCompleted = false;

      // Function to ensure the timeout promise doesn't trigger after download finishes
      const wrappedRelievingDownload = async () => {
        try {
          // Delay the execution of the download API call by 30 seconds
          await new Promise((resolve) => setTimeout(resolve, DOWNLOAD_DELAY)); // 30 second delay

          // Now, call the download API after the delay
          const isDraft = previewData.draft;
          const downloadResponse = await RelievingLetterDownload(employeeId, isDraft);
          downloadCompleted = true; // Mark download as completed
          return downloadResponse; // Return the download response if successful
        } catch (error) {
          throw error; // Pass any download errors to be caught in the main try-catch
        }
      };

      // Step 3: Race between the download API call and the timeout
      const downloadResponse = await Promise.race([
        wrappedRelievingDownload(), // This wraps the download call to handle success/failure
        timeoutPromise, // Timeout after the specified duration
      ]);

      // If download completed successfully, proceed
      if (downloadCompleted) {
        // Handle success responses
        if (downloadResponse && downloadResponse.data) {
          toast.success(downloadResponse.data.message);
        }

        // Reset and navigate after success
        setShowPreview(false);
        navigate("/relievingSummary");
        clearForm()
      }
    } catch (error) {
      console.error("Error submitting relieving letter:", error);

      // Add more specific error handling for the download
      if (error.message && error.message.includes("timed out")) {
        // toast.error('The download took too long, please try again later.');
      } else if (error.response) {
        // Handle known error responses
        handleError(error);
      } else {
        // Handle generic network errors
        toast.error("Network Error, please check your internet connection.");
      }
    }
  };

  const handleError = (errors) => {
    let errorMessage = "An Error Occurred!"; // Default error message

    if (errors.response) {
      const status = errors.response.data.error
        ? errors.response.data.error.message
        : null;
      if (status) {
        errorMessage = status;
      } else {
        // If no custom error message, handle based on status codes
        switch (errors.response.status) {
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
      }
    } else {
      errorMessage = "Network Error!";
    }
    toast.error(errorMessage, {
      position: "top-right",
      transition: Bounce,
      hideProgressBar: true,
      theme: "colored",
      autoClose: 3000,
    });
  };

  const clearForm = () => {
    reset();
    navigate("/relievingSummary");
  };

  const handleEmployeeChange = (selectedOption) => {
    // Update the selected employee in the state
    const selectedEmp = emp.find((emp) => emp.value === selectedOption?.value);

    if (selectedEmp) {
      setSelectedEmployee(selectedEmp);

      // Update form fields with selected employee data
      setValue("employeeId", selectedEmp.value); // set employeeId correctly
      setValue("designationName", selectedEmp.designationName);
      setValue("departmentName", selectedEmp.departmentName);
      setValue("dateOfHiring", selectedEmp.dateOfHiring);

      // Clear any previous errors
      clearErrors("employeeId");

      // Trigger validation for the employeeId field
      trigger("employeeId");
    } else {
      // If no employee is selected, reset other fields
      setValue("employeeId", "");
      setValue("designationName", "");
      setValue("departmentName", "");
      setValue("dateOfHiring", "");

      // Set error if needed, but it's likely you just want to reset
      // setError("employeeId", { message: "Employee selection is required" });

      // Clear any previous errors
      clearErrors("employeeId");
    }
  };

  if (loading) return <Loader />;

  // Render loading message or template not available message
  if (!templateAvailable) {
    return (
      <LayOut>
        <div className="container-fluid p-0">
          <div className="row justify-content-center">
            <div className="col-8 text-center mt-5">
              <h2>No Relieving Template Available</h2>
              <p>
                To set up the Relieving templates before proceeding, Please
                select the Template from Settings{" "}
                <a href="/relievingTemplates">Relieving Templates </a>
              </p>
              <p>
                Please contact the administrator to set up the experience
                templates before proceeding.
              </p>
            </div>
          </div>
        </div>
      </LayOut>
    );
  }
  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1">
          <div className="col">
            <h1 className="h3">
              <strong>Employee Relieving Form</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="/relievingSummary">Relieving Summary</a>
                </li>
                <li className="breadcrumb-item active">
                  Employee Relieving Form
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Relieving Form</h5>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                      <label className="form-label">Select Employee Name</label>
                      <Controller
                        name="employeeId"
                        control={control}
                        rules={{ required: "Employee Name is required" }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={emp}
                            value={
                              emp.find(
                                (option) => option.value === field.value
                              ) || null
                            } // Handle clearing
                            onChange={handleEmployeeChange}
                            placeholder="Select Employee Name"
                          />
                        )}
                      />
                      {errors.employeeId && (
                        <p className="errorMsg">Employee Name Required</p>
                      )}
                    </div>
                    <input
                      type="hidden"
                      className="form-control"
                      placeholder="Designation"
                      name="employeeName"
                      readOnly
                      {...register("employeeName")}
                    />

                    <input
                      type="hidden"
                      className="form-control"
                      placeholder="Designation"
                      name="employeeId"
                      readOnly
                      {...register("employeeId")}
                    />
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Designation"
                        name="designationName"
                        readOnly
                        {...register("designationName", { required: true })}
                      />
                      {errors.designationName && (
                        <p className="errorMsg">Designation Required</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Department"
                        name="departmentName"
                        readOnly
                        {...register("departmentName", { required: true })}
                      />
                      {errors.departmentName && (
                        <p className="errorMsg">Department Required</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Date of Hired</label>
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Resignation Date"
                        name="dateOfHiring"
                        readOnly
                        {...register("dateOfHiring", { required: true })}
                      />
                      {errors.dateOfHiring && (
                        <p className="errorMsg">Date of Hiring Required</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Date of Resignation</label>
                      <Controller
                        name="resignationDate"
                        control={control}
                        rules={{
                          required: "Resignation Date is required",
                          validate: (value) => {
                            const resignationValidation = validateResignationDate(value);
                            if (resignationValidation !== true) return resignationValidation;

                            const yearValidation = validateYear(value);
                            return yearValidation;
                          }
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="date"
                            className="form-control"
                            placeholder="Resignation Date"
                          />
                        )}
                      />
                      {errors.resignationDate && (
                        <p className="errorMsg">
                          {errors.resignationDate.message}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Date of Last Working Day
                      </label>
                      <Controller
                        name="relievingDate"
                        control={control}
                        rules={{
                          required: "Relieving Date is required",
                          validate: (value) => {
                            const relievingValidation = validateRelievingDate(value);
                            if (relievingValidation !== true) return relievingValidation;

                            const yearValidation = validateYear(value);
                            return yearValidation;
                          }
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="date"
                            className="form-control"
                            placeholder="Last Working Date"
                          />
                        )}
                      />
                      {errors.relievingDate && (
                        <p className="errorMsg">
                          {errors.relievingDate.message}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Notice Period (Months)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={noticePeriod}
                        readOnly
                      />
                    </div>

                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Letter Generated Date</label>
                      <input
                        type="date"
                        name="generatedDate"
                        placeholder="Enter Generated Date"
                        className="form-control"
                        autoComplete="off"
                        onClick={(e) => e.target.showPicker()}
                        {...register("generatedDate", {
                          required: "Generated Date is required",
                          validate: {
                            notBeforeLastWorkingDate: (value) => {
                              const lastWorkingDate = watch("relievingDate");
                              if (!lastWorkingDate) return true; // Skip this check if lastWorkingDate isn't selected yet

                              // Validate year format first
                              const yearValidationMessage = validateYear(value);
                              if (yearValidationMessage !== true) return yearValidationMessage;

                              return (
                                new Date(value) >= new Date(lastWorkingDate) ||
                                "Generated Date cannot be before Last Working Date"
                              );
                            },
                          },
                        })}
                      />
                      {errors.generatedDate && (
                        <p className="errorMsg">{errors.generatedDate.message}</p>
                      )}

                    </div>

                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label mb-2">Select Mode</label> {/* Added spacing below label */}
                      <div className="d-flex gap-3"> {/* Flexbox for side-by-side layout */}
                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            id="draft"
                            name="draft"
                            value={true}
                            {...register("draft", { required: true })}
                          />
                          <label className="form-check-label" htmlFor="draft">
                            Draft Copy
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            id="undraft"
                            name="draft"
                            value={false}
                            {...register("draft", { required: true })}
                          />
                          <label className="form-check-label" htmlFor="undraft">
                            Digital Copy
                          </label>
                        </div>
                      </div>
                      {errors.draft && (
                        <p className="errorMsg">Please select Draft Copy or Digital Copy</p>
                      )}
                    </div>
                    <div className="col-12 d-flex align-items-start mt-5">
                      {error && (
                        <div className="col-9 alert alert-danger text-center mt-4">
                          {error}
                        </div>
                      )}
                      <div
                        className={`col-${error ? "3" : "12"
                          } d-flex justify-content-end mt-4`}
                      >
                        <button
                          className="btn btn-secondary me-2"
                          type="button"
                          onClick={clearForm}
                        >
                          Close
                        </button>
                        <button
                          className="btn btn-primary btn-lg"
                          type="submit"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              {showPreview && (
                <div
                  className={`modal fade ${showPreview ? "show" : ""}`}
                  style={{ display: showPreview ? "block" : "none" }}
                  tabIndex="-1"
                  role="dialog"
                  aria-hidden={!showPreview}
                >
                  <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          Preview Experience Letter
                        </h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowPreview(false)}
                          aria-label="Close"
                        >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div className="modal-body">
                        <Preview
                          previewData={previewData}
                          selectedTemplate={selectedTemplate}
                        />
                        {console.log("Preview data:", previewData)}
                        {console.log("Selected Template:", selectedTemplate)}
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowPreview(false)}
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleConfirmSubmission}
                        >
                          Confirm Submission
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default ExistsEmpRegistration;
