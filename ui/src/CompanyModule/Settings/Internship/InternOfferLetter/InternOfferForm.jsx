import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { DepartmentGetApi, DesignationGetApi, InternOfferLetterDownload } from "../../../../Utils/Axios";
import { fetchEmployees } from "../../../../Redux/EmployeeSlice";
import LayOut from "../../../../LayOut/LayOut";
import InternOfferPrev from "./InternOfferPrev";
import { useAuth } from "../../../../Context/AuthContext";

const InternOfferForm = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,watch,
    formState: { errors },
    reset,
  } = useForm({ mode: "onChange" });
  
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [hrEmployees, setHrEmployees] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState({
    associateName: "",
    associateDesignation: "",
  }); 
  const [selectedHR, setSelectedHR] = useState({
    hrId:"",
    hrName: "",
    hrEmail: "",
  });
    const { company } = useAuth();
    const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: employees, status } = useSelector((state) => state.employees);

  useEffect(() => {
    if (status === "loading") {
      dispatch(fetchEmployees());
    }
  }, [dispatch, status]);

  // Handle Assignee and HR selection
  const handleAssigneeChange = (event) => {
    const selectedId = event.target.value;
    const selectedEmployee = employees.find((emp) => String(emp.id) === selectedId); // Ensure type match
  
    if (selectedEmployee) {
      setSelectedAssignee({
        associateId: selectedEmployee.id,  // Store ID to match the <select> value
        associateName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
        associateDesignation: selectedEmployee.designationName,
      });
    }
  };  

  const handleHRChange = (event) => {
    const selectedId = event.target.value;
  
    if (selectedId === "Company Admin") {
      setSelectedHR({
        hrId: "Company Admin",
        hrName: "Company Admin",
        hrEmail: company?.mailId || "N/A",
      });
    } else {
      const selectedHRPerson = hrEmployees.find((emp) => String(emp.id) === selectedId);
  
      if (selectedHRPerson) {
        setSelectedHR({
          hrId: String(selectedHRPerson.id),
          hrName: `${selectedHRPerson.firstName || ""} ${selectedHRPerson.lastName || ""}`,
          hrEmail: selectedHRPerson.emailId,
        });
      }
    }
  };  
  
  const joiningDate = watch("startDate");

  const validateEndDate = (endDate) => {
    if (!joiningDate) return "Joining Date is required before selecting End Date";
  
    const joinDateObj = new Date(joiningDate);
    const endDateObj = new Date(endDate);
    const maxEndDate = new Date(joinDateObj);
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1); // 12 months ahead
  
    if (endDateObj < joinDateObj) {
      return "End Date cannot be before Joining Date";
    }
    if (endDateObj > maxEndDate) {
      return "End Date cannot exceed 12 months from Joining Date";
    }
  
    return true;
  };
  
  const validateAssigneeDate = (acceptDate) => {
    if (!joiningDate) return "Joining Date is required before selecting Assignee Date";
  
    const joinDateObj = new Date(joiningDate);
    const assigneeDateObj = new Date(acceptDate);
    const maxAssigneeDate = new Date(joinDateObj);
    maxAssigneeDate.setMonth(maxAssigneeDate.getMonth() + 1); // 1 month ahead
  
    if (assigneeDateObj < joinDateObj) {
      return "Assignee Date cannot be before Joining Date";
    }
    if (assigneeDateObj > maxAssigneeDate) {
      return "Assignee Date cannot exceed 1 month from Joining Date";
    }
  
    return true;
  };
  

  useEffect(() => {
    // Dynamically update the max End Date and Accept Date based on the joiningDate
    if (joiningDate) {
      const joiningDateObj = new Date(joiningDate);
      
      // Set max End Date to 12 months after the joiningDate
      const maxEndDate = new Date(joiningDateObj);
      maxEndDate.setMonth(maxEndDate.getMonth() + 12);
      setValue("endDate", maxEndDate.toISOString().split("T")[0]);

      // Set max Accept Date to 1 month after the joiningDate
      const maxAcceptDate = new Date(joiningDateObj);
      maxAcceptDate.setMonth(maxAcceptDate.getMonth() + 1);
      setValue("acceptDate", maxAcceptDate.toISOString().split("T")[0]);
    }
  }, [joiningDate, setValue]);

  useEffect(() => {
    const allEmployeeOptions = employees.map((emp) => ({
      id: emp.id,
      name: `${emp.firstName || ""} ${emp.lastName || ""} (${emp.designationName})`.trim(),
    }));
  
    setEmployeeOptions(allEmployeeOptions);
  
    const hrDepartmentsEmployees = employees.filter(
      (emp) =>
        emp.departmentName &&
        (emp.departmentName.toLowerCase().startsWith("hr") ||
          emp.departmentName.toLowerCase().endsWith("hr") ||
          emp.departmentName.toLowerCase().startsWith("human resources"))
    );
  
    // ✅ Save full employee objects here
    setHrEmployees(hrDepartmentsEmployees);
  
    // If no HR employees exist, default to Company Admin
    if (hrDepartmentsEmployees.length === 0) {
      setSelectedHR({
        hrId: "Company Admin",
        hrName: "Company Admin",
        hrEmail: company?.emailId || "N/A",
      });
    }
  }, [employees, company]);  
  
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

  const fetchDesignations = async () => {
    try {
      const data = await DesignationGetApi();
      setDesignations(data);
    } catch (error) {
      // handleApiErrors(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);
  const currentDate = new Date().toISOString().split('T')[0]; // Formats date as 'YYYY-MM-DD'

  const onSubmit = (data) => {
    const formData = {
        ...data,
        date:currentDate,
        companyId:company.id,
        associateName: selectedAssignee ? selectedAssignee.associateName : '',
        associateDesignation: selectedAssignee ? selectedAssignee.associateDesignation : '',
        hrName: selectedHR ? selectedHR.hrName : 'Company Admin',
        hrEmail: selectedHR ? selectedHR.hrEmail : 'Company Admin',
      };
    setPreviewData(formData);
    console.log("preview:", formData);
    setShowPreview(true);
  };
    const handleConfirmSubmission = async () => {
      try {
        const success = await InternOfferLetterDownload(previewData);
        if (success) {
          setShowPreview(true);
          reset();
          setShowPreview(false)
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

    // Ensure only allowed characters (alphabets, numbers, and some special chars)
    const allowedCharsRegex = /^[a-zA-Z\s]+$/;
    value = value
      .split("")
      .filter((char) => allowedCharsRegex.test(char))
      .join("");

    // Capitalize the first letter of each word
    const words = value.split(" ");

    // Capitalize the first letter of each word and leave the rest of the characters as they are
    const capitalizedWords = words.map((word) => {
      if (word.length > 0) {
        // Capitalize the first letter, keep the rest as is
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return "";
    });

    // Join the words back into a string
    let formattedValue = capitalizedWords.join(" ");

    // Remove spaces not allowed (before the first two characters)
    if (formattedValue.length > 1) {
      formattedValue =
        formattedValue.slice(0, 1) +
        formattedValue.slice(1).replace(/\s+/g, " ");
    }

    // Update input value
    input.value = formattedValue;

    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
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

  const toInputAddressCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position
    // Remove leading spaces
    value = value.replace(/^\s+/g, "");
    // Ensure only alphabets (upper and lower case), numbers, and allowed special characters
    const allowedCharsRegex = /^[a-zA-Z0-9\s!-_@#&()*/,.\\-{}]+$/;
    value = value
      .split("")
      .filter((char) => allowedCharsRegex.test(char))
      .join("");

    // Capitalize the first letter of each word, but allow uppercase letters in the middle of the word
    const words = value.split(" ");
    const capitalizedWords = words.map((word) => {
      if (word.length > 0) {
        // Capitalize the first letter, but leave the middle of the word intact
        return word.charAt(0).toUpperCase() + word.slice(1);
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

  function handlePhoneNumberChange(event) {
    let value = event.target.value;

    // Ensure the value starts with +91 and one space
    if (value.startsWith("+91") && value.charAt(3) !== " ") {
      value = "+91 " + value.slice(3); // Ensure one space after +91
    }

    // Allow only numeric characters after +91 and the space
    const numericValue = value.slice(4).replace(/[^0-9]/g, ""); // Remove any non-numeric characters after +91
    if (numericValue.length <= 10) {
      value = "+91 " + numericValue; // Keep the +91 with a space
    }

    // Limit the total length to 14 characters (including +91 space)
    if (value.length > 14) {
      value = value.slice(0, 14); // Truncate if the length exceeds 14 characters
    }

    // Update the input field's value
    event.target.value = value;
  }

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

  const today = new Date();
  const threeMonthsFromNow = new Date(
    today.getFullYear(),
    today.getMonth() + 3,
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1">
          <div className="col">
            <h1 className="h3">
              <strong>Intern Offer Letter Form</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  Generate Offer Letter
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Employee Offer Letter Form</h5>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Employee Name"
                        name="employeeName"
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
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Email Id <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter Email Id"
                        name="internEmail"
                        autoComplete="off"
                        // onInput={toInputEmailCase}
                        onKeyDown={handleEmailChange}
                        {...register("internEmail", {
                          required: "Email Id is Required",
                          pattern: {
                            value:
                              /^[a-z][a-zA-Z0-9._+-]*@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                            message: "Invalid Email Format",
                          },
                        })}
                      />
                      {errors.internEmail && (
                        <p className="errorMsg">{errors.internEmail.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Contact No</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Mobile Number"
                        autoComplete="off"
                        name="mobileNo"
                        maxLength={14} // Limit input to 15 characters (including +91)
                        defaultValue="+91 " // Set the initial value to +91 with a space
                        onInput={handlePhoneNumberChange} // Handle input changes
                        {...register("mobileNo", {
                          required: "Contact Number is Required",
                          validate: {
                            startsWithPlus91: (value) => {
                              if (!value.startsWith("+91 ")) {
                                return "Contact Number must start with +91 and a space.";
                              }
                              return true;
                            },
                            correctLength: (value) => {
                              if (value.length !== 14) {
                                return "Contact Number must be exactly 10 digits (including +91).";
                              }
                              return true;
                            },
                            startsWithValidDigit: (value) => {
                              const validStart = /^[+91\s][6789]/.test(value);
                              if (!validStart) {
                                return "Contact Number must start with +91 followed by 6, 7, 8, or 9.";
                              }
                              return true;
                            },
                            notRepeatingDigits: (value) => {
                              const isRepeating = /^(\d)\1{12}$/.test(value); // Check for repeating digits
                              return (
                                !isRepeating ||
                                "Contact Number cannot consist of the same digit repeated."
                              );
                            },
                          },
                          pattern: {
                            value: /^\+91\s[6-9]\d{9}$/, // Ensure it starts with +91, followed by a space, and then 6-9 and 9 more digits
                            message: "Contact Number is Required.",
                          },
                        })}
                      />
                      {errors.mobileNo && (
                        <p className="errorMsg">
                          {errors.mobileNo.message}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Address</label>
                      <textarea type="text" className="form-control" name="address"
                   {...register("address", {
                    required: "Address is required",
                    pattern: { value: /^[a-zA-Z0-9\s!-_@#&()*/,.\\-{}]+$/,
                      message: "Enter a valid Address",
                    }, minLength: {
                      value: 3,
                      message: "Minimum 3 Characters allowed",
                    },
                    maxLength: {
                      value: 200,
                      message: "Maximum 200 Characters allowed",
                    },
                    validate: (value) =>
                      value.trim().length === value.length ||
                      "Spaces at the end are not allowed.",
                  })}
                  />
                      {errors.address && (
                        <p className="errorMsg">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Joining Date</label>
                      <input
                        type="date"
                        name="startDate"
                        placeholder="Enter Joining Date"
                        className="form-control"
                        autoComplete="off"
                        onClick={(e) => e.target.showPicker()} 
                        max={threeMonthsFromNow}
                        {...register("startDate", {
                            required: "Joining Date is required",
                        })}
                      />
                      {errors.startDate && (
                        <p className="errorMsg">{errors.startDate.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                    <label className="form-label">End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        placeholder="Enter End Date"
                        className="form-control"
                        autoComplete="off"
                        onClick={(e) => e.target.showPicker()} 
                        {...register("endDate", {
                        required: "End Date is required",
                        validate:validateEndDate,
                        })}
                    />
                      {errors.endDate && (
                        <p className="errorMsg">{errors.endDate.message}</p>
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
                          <select {...field} className="form-select">
                            <option value="" disabled>
                              Select Department
                            </option>
                            {departments.map((department) => (
                              <option key={department.id} value={department.departmentName}>
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
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Designation</label>
                      <Controller
                        name="designation"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <select {...field} className="form-select">
                            <option value="" disabled>
                              Select Designation
                            </option>
                            {designations.map((designation) => (
                              <option
                                key={designation.id}
                                value={designation.designationName}
                              >
                                {designation.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors && errors.designation && (
                        <p className="errorMsg">Designation is Required</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Job Location</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Address"
                        autoComplete="off"
                        minLength={2}
                        name="companyBranch"
                        onKeyDown={handleEmailChange}
                        onInput={toInputAddressCase}
                        {...register("companyBranch", {
                          required: "Job Location is Required",
                          pattern: {
                            value:
                              /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,-_&*.()^\-/]*$/, // Your pattern for valid characters
                            message: "Please enter valid Job Location",
                          },
                          minLength: {
                            value: 3,
                            message: "Minimum 3 Characters allowed",
                          },
                          maxLength: {
                            value: 200,
                            message: "Maximum 200 Characters allowed",
                          },
                          validate: {
                            // Custom validation for trailing spaces
                            noTrailingSpaces: (value) => {
                              if (/\s$/.test(value)) {
                                // Check for trailing space
                                return "Spaces at the end are not allowed"; // Error message
                              }
                              return true; // Validation passes
                            },
                          },
                        })}
                      />
                      {errors.companyBranch  && (
                        <p className="errorMsg text-danger">
                          {errors.companyBranch.message}
                        </p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Stiffend (₹/month)</label>
                      <input
                        type="text"
                        className="form-control"
                        maxLength={10}
                        placeholder="Enter Stipend Amount"
                        name="stipend"
                        {...register("stipend", {
                          // required: "Stipend is required",
                          min: {
                            value: 5,
                            message: "Minimum 5 Numbers Required",
                          },
                          pattern: {
                            value: /^[0-9]+$/,
                            message: "These field accepts only Integers",
                          },
                        })}
                      />
                      {errors.stipend && (
                        <p className="errorMsg">{errors.stipend.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Accept Date Time Line
                      </label>
                      <input
                        type="date"
                        name="acceptDate"
                        placeholder="Enter Joining Date"
                        className="form-control"
                        autoComplete="off"
                        onClick={(e) => e.target.showPicker()} 
                        {...register("acceptDate", {
                          required: "Accept Date is required",
                          validate: validateAssigneeDate,
                        })}
                      />
                      {errors.acceptDate && (
                        <p className="errorMsg">{errors.acceptDate.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Assigned To</label>
                      <select
                          className="form-select"
                          onChange={handleAssigneeChange}
                          name="associateId"
                          value={selectedAssignee.associateId || ""}
                        >
                          <option value="" disabled>
                            Select Employee
                          </option>
                          {employeeOptions.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name}
                            </option>
                          ))}
                        </select>

                      {errors.associateName && (
                        <p className="errorMsg">
                          {errors.associateName.message}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">HR</label>
                      <select
        id="hrSelect"
        className="form-select"
        onChange={handleHRChange}
        value={selectedHR?.hrId || ""}
      >
        <option value="">Select HR</option>
        {hrEmployees.length > 0 ? (
          <>
            {hrEmployees.map((emp) => (
              <option key={emp.id} value={String(emp.id)}>
                {`${emp.firstName} ${emp.lastName} (${emp.designationName})`}
              </option>
            ))}
            <option value="Company Admin">Company Admin</option>
          </>
        ) : (
          <option value="Company Admin">Company Admin</option>
        )}
      </select>
                      {errors.hrName && (
                        <p className="errorMsg">{errors.hrName.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">HR Mobile Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Mobile Number"
                        autoComplete="off"
                        name="hrMobileNo"
                        maxLength={14} // Limit input to 15 characters (including +91)
                        defaultValue="+91 " // Set the initial value to +91 with a space
                        onInput={handlePhoneNumberChange} // Handle input changes
                        {...register("hrMobileNo", {
                            required: "Hr Contact Number is Required", // Error message when the field is left empty
                            validate: {
                              startsWithPlus91: (value) => {
                                if (!value.startsWith("+91 ")) {
                                  return " HR Contact Number must start with +91 and a space."; // Custom error for wrong prefix
                                }
                                return true;
                              },
                              correctLength: (value) => {
                                if (value.length !== 14) {
                                  return "Contact Number must be exactly 14 characters (including +91 and space)."; // Custom error for incorrect length
                                }
                                return true;
                              },
                              startsWithValidDigit: (value) => {
                                const validStart = /^[+91\s][6789]/.test(value); // Validate that the second digit is between 6-9
                                if (!validStart) {
                                  return "Contact Number must start with +91 followed by 6, 7, 8, or 9."; // Custom error for invalid start
                                }
                                return true;
                              },
                              notRepeatingDigits: (value) => {
                                const isRepeating = /^(\d)\1{12}$/.test(value); // Check for repeating digits (e.g., +91 111111111111)
                                if (isRepeating) {
                                  return "Contact Number cannot consist of the same digit repeated."; // Custom error for repeating digits
                                }
                                return true;
                              },
                            },
                            pattern: {
                              value: /^\+91\s[6789]\d{9}$/, // Ensure it starts with +91, followed by a space, and then 6-9 and 9 more digits
                              message: "Invalid format. Contact Number must be like +91 9876543210.", // Custom error for incorrect pattern
                            },
                          })}
                      />
                      {errors.hrMobileNo && (
                        <p className="errorMsg">
                          {errors.hrMobileNo.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-footer" style={{ marginLeft: "80%" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={clearForm}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ marginLeft: "10px" }}
                  >
                    Submit
                  </button>
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
                        <InternOfferPrev
                          previewData={previewData}
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

export default InternOfferForm;
