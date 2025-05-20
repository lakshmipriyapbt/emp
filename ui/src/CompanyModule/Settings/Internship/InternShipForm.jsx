import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import { Bounce, toast } from "react-toastify";
import LayOut from "../../../LayOut/LayOut";
import {
  DepartmentGetApi,
  DesignationGetApi,
  EmployeeGetApi,
  EmployeeGetApiById,
  InternshipCertificateDownload,
  InternShipFormPostApi,
  TemplateGetAPI,
} from "../../../Utils/Axios";
import { useAuth } from "../../../Context/AuthContext";
import InternShipPreview from "./InternShipPreview";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../../../Redux/EmployeeSlice";

const InternShipForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({ mode: "onChange" });
  const { authUser, company } = useAuth();
  const [emp, setEmp] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // New state to store the selected employee
  const [templateAvailable, setTemplateAvailable] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch employees from Redux store
  const { data: employees, status } = useSelector((state) => state.employees);
  const watchDepartment = watch("department");

  // Fetch employees when the component mounts
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {

    const filteredData = employees
      .filter((employee) => employee.firstName !== null)
      .map(({ referenceId, ...rest }) => rest);
    setEmp(
      filteredData.map((employee) => ({
        label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
        value: `${employee.firstName} ${employee.lastName}`,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId,
        designationName: employee.designationName,
        departmentName: employee.departmentName,
        dateOfHiring: employee.dateOfHiring,
      }))
    );
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await DepartmentGetApi();
      setDepartments(data.data.data);
    } catch (error) {
      // handleApiErrors(error)
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignations = async (departmentId) => {
    try {
      if (departmentId) {
        const data = await DesignationGetApi(departmentId); // Pass departmentId to API
        setDesignations(data);
      } else {
        setDesignations([]); // Clear designations if no department selected
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
      setDesignations([]);
    }
  };

  useEffect(() => {
    if (watchDepartment) {
      // Find the department object to get its ID
      const selectedDept = departments.find(dept => dept.name === watchDepartment);
      if (selectedDept) {
        fetchDesignations(selectedDept.id);
      }
    } else {
      setDesignations([]); // Clear designations when no department selected
    }
  }, [watchDepartment]);

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  const fetchTemplate = async () => {
    try {
      const res = await TemplateGetAPI(company?.id);
      const templateNumber = res.data.data.internshipTemplateNo;
      setSelectedTemplate(templateNumber);
      setTemplateAvailable(!!templateNumber);
    } catch (error) {
      handleError(error);
      setTemplateAvailable(false);
    }
  };
  useEffect(() => {
    fetchTemplate();
  }, []);

  const onSubmit = (data) => {
    const draftValue = data.draft === "true"; // Convert string to boolean

    const currentDate = new Date().toISOString().split("T")[0]; // "2024-11-15"
    const id = company?.id;
    const lastWorkingDate = data.lastWorkingDate;
    const dateOfHiring = data.dateOfHiring;
    // Call the validateDatePeriod function to check for errors
    const isValid = validateDatePeriod(lastWorkingDate, dateOfHiring);

    // If the validation fails, do not proceed with the preview page display
    if (!isValid) {
      setShowPreview(false); // Hide preview page if validation fails
      return;
    }

    const submissionData = {
      
      companyId: company?.id,
      employeeName: data.employeeName,
      department: data.department,
      designation: data.designation,
      date: data.generatedDate,
      startDate: data.dateOfHiring,
      endDate: data.lastWorkingDate,
      draft: draftValue,
    };
    console.log("submissionData", submissionData);
    const preview = {
      companyLogo: company?.imageFile,
      employeeName: selectedEmployee
        ? selectedEmployee.employeeName
        : data.employeeName,
      employeeId: selectedEmployee
        ? selectedEmployee.employeeId
        : data.employeeId,
      designationName: data.designation || "",
      departmentName: data.department || "",
      startDate: data.dateOfHiring || "",
      lastWorkingDate: data.lastWorkingDate || "",
      generatedDate: data.generatedDate || "",
      draft: draftValue || false,
      companyName: authUser.company,
      companyData: company,
      
    };
    console.log("preview data : ", preview)
    setPreviewData(preview);
    setShowPreview(true);
    setSubmissionData(submissionData);
  };

  const handleConfirmSubmission = async () => {
    try {
      const success = await InternshipCertificateDownload(submissionData);
      if (success) {
        toast.success("InternShip Letter Downloaded Successfully");
        setShowPreview(false);
        reset();
      }
    } catch (error) {
      console.error("Error downloading the PDF:", error);
      handleError(error);
    }
  };

  const handleError = (errors) => {
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
      // toast.error("Network Error!", {
      //   position: "top-right",
      //   transition: Bounce,
      //   hideProgressBar: true,
      //   theme: "colored",
      //   autoClose: 3000,
      // });
    }
  };

  const clearForm = () => {
    reset();
  };

  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position
    // Remove leading spaces
    value = value.replace(/^\s+/g, "");
    // Ensure only alphabets and spaces are allowed
    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
    value = value
      .split("")
      .filter((char) => allowedCharsRegex.test(char))
      .join("");
    // Capitalize the first letter of each word
    const words = value.split(" ");
    // Capitalize the first letter of each word and lowercase the rest
    const capitalizedWords = words.map((word) => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return "";
    });
    // Join the words back into a string
    let formattedValue = capitalizedWords.join(" ");
    // Remove spaces not allowed (before the first two characters)
    if (formattedValue.length > 2) {
      formattedValue =
        formattedValue.slice(0, 2) +
        formattedValue.slice(2).replace(/\s+/g, " ");
    }
    // Update input value
    input.value = formattedValue;
    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  const validateDatePeriod = (lastWorkingDate, dateOfHiring) => {
    // Reset the error before starting validation
    setError("");
    if (lastWorkingDate && dateOfHiring) {
      const lastWorking = new Date(lastWorkingDate);
      const hiringDate = new Date(dateOfHiring);

      // Check if last working date is before date of hiring
      if (lastWorking < hiringDate) {
        setError("Internship date cannot be before the date of Joining.");
        return false; // Return false if validation fails
      }

      // Clear any previous error if validation passes
      setError("");
      return true; // Return true if validation passes
    } else {
      setError("Please provide all the required dates.");
      return false; // Return false if required dates are missing
    }
  };
  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = (today.getMonth() + 1).toString().padStart(2, "0");
    const dd = today.getDate().toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleEmailChange = (e) => {
    // Get the current value of the input field
    const value = e.target.value;
    // Check if the value is empty
    if (value.trim() !== "") {
      return; // Allow space button
    }
    // Prevent space character entry if the value is empty
    if (e.keyCode === 32) {
      e.preventDefault();
    }
  };

  const validateName = (value) => {
    // Trim leading and trailing spaces before further validation
    const trimmedValue = value.trim();

    // Check if value is empty after trimming (meaning it only had spaces)
    if (trimmedValue.length === 0) {
      return "Field is Required.";
    }

    // Allow alphabetic characters, spaces, and numbers
    else if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
      return "Only Alphabetic Characters are Allowed.";
    } else {
      const words = trimmedValue.split(" ");

      // Check for minimum and maximum word length, allowing one-character words at the end
      for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // If the word length is less than 3 and it's not the last word, show error
        if (word.length < 3 && i !== words.length - 1) {
          return "Minimum Length 3 Characters Required.";
        }

        // Check maximum word length
        if (word.length > 100) {
          return "Max Length 100 Characters Exceeded.";
        }
      }

      // Check for trailing and leading spaces
      if (/\s$/.test(value)) {
        return "Spaces at the end are not allowed."; // Trailing space error
      } else if (/^\s/.test(value)) {
        return "No Leading Space Allowed."; // Leading space error
      }

      // Check if there are multiple spaces between words
      else if (/\s{2,}/.test(trimmedValue)) {
        return "No Multiple Spaces Between Words Allowed.";
      }
    }

    return true; // Return true if all conditions are satisfied
  };
  // Render loading message or template not available message
  if (!templateAvailable) {
    return (
      <LayOut>
        <div className="container-fluid p-0">
          <div className="row justify-content-center">
            <div className="col-8 text-center mt-5">
              <h2>No Internship Template Available</h2>
              <p>
                To set up the Internship templates before proceeding, Please
                select the Template from Settings{" "}
                <a href="/internsTemplates">Internship Templates </a>
              </p>
              <p>
                Please contact the administrator to set up the Internship
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
              <strong>Internship Form</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  Internship Experience
                </li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">
                  {isUpdating
                    ? "Employee Internship Data"
                    : "Employee Internship Form"}
                </h5>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Employee Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Employee Name"
                        name="firstName"
                        onInput={toInputTitleCase}
                        minLength={2}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("employeeName", {
                          required: "Employee Name is Required",
                          minLength: {
                            value: 3,
                            message: "Minimum 3 Characters Required",
                          },
                          validate: {
                            validateName,
                          },
                        })}
                      />
                      {errors.employeeName && (
                        <p className="errorMsg">
                          {errors.employeeName.message}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Department</label>
                      <Controller
                        name="department"
                        control={control}
                        defaultValue=""
                        rules={{ required: "Department is Required" }}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="form-select"
                            onChange={(e) => {
                              field.onChange(e); // Update form state
                              // Reset designation when department changes
                              setValue("designation", "");
                              // Find department and fetch its designations
                              const selectedDept = departments.find(dept => dept.name === e.target.value);
                              if (selectedDept) {
                                fetchDesignations(selectedDept.id);
                              }
                            }}
                          >
                            <option value="" disabled>Select Department</option>
                            {departments.map((department) => (
                              <option key={department.id} value={department.name}>
                                {department.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.department && (
                        <p className="errorMsg">{errors.department.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Designation</label>
                      <Controller
                        name="designation"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: {
                            value: true,
                            message: watchDepartment ? "Designation is Required" : "Please select a department first"
                          }
                        }}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="form-select"
                            disabled={!watchDepartment}
                          >
                            <option value="" disabled>Select Designation</option>
                            {designations.map((designation) => (
                              <option key={designation.id} value={designation.name}>
                                {designation.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.designation && (
                        <p className="errorMsg">{errors.designation.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Date of Joined</label>
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Date of Joining"
                        name="dateOfHiring"
                        onClick={(e) => e.target.showPicker()}
                        max={getCurrentDate()} // This restricts the date to today
                        {...register("dateOfHiring", {
                          required: "Date of Joining is required",
                        })} // Required validation
                      />
                      {errors.dateOfHiring && (
                        <p className="errorMsg">Date of Joining Required</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Date of Internship</label>
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Last Working Date"
                        name="lastWorkingDate"
                        onClick={(e) => e.target.showPicker()}
                        max={getCurrentDate()}
                        {...register("lastWorkingDate", { required: true })}
                        onBlur={(e) =>
                          validateDatePeriod(
                            e.target.value,
                            e.target.form.dateOfHiring.value
                          )
                        } // Validate onBlur
                      />
                      {errors.lastWorkingDate && (
                        <p className="errorMsg">Date of Internship Required</p>
                      )}
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
                        const lastWorkingDate = watch("lastWorkingDate");
                       if (!lastWorkingDate) return true; // Skip this check if lastWorkingDate isn't selected yet
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
                           <label className="form-label">Select Mode</label>
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

                       {errors.draft && (
                            <p className="errorMsg">Please select draft copy or digital copy</p>
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
                          className={
                            isUpdating
                              ? "btn btn-danger btn-lg"
                              : "btn btn-primary btn-lg"
                          }
                          type="submit"
                        >
                          {isUpdating ? "Update" : "Submit"}
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
                    <div className="modal-content mt-2 mb-3">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          Preview Intenrship Letter
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
                        <InternShipPreview
                          previewData={previewData}
                          selectedTemplate={selectedTemplate}
                        />
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

export default InternShipForm;
