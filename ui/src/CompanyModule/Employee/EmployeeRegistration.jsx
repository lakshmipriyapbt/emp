
import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import { DepartmentGetApi, DesignationGetApi, EmployeeGetApiById, EmployeePatchApiById, EmployeePostApi, EmployeePutApiById, employeeUpdateByIdApi, employeeViewApi } from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";

const EmployeeRegistration = () => {

  const {
    register,
    watch,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      status: "", // Initialize with default value or leave empty if fetching dynamically
      roles: null
    },
    mode: "onChange",
  });
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // State to track if updating or creating
  const [employeeId, setEmployeeId] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const navigate = useNavigate();
  const location = useLocation();
  console.log(user.company)
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };
  const handlePasswordChange = (e) => {
    setPasswordShown(e.target.value);
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

  const Employement = [
    { value: "Permanent", label: "Permanent" },
    { value: "Contract", label: "Contract" },
    { value: "Trainee", label: "Trainee" },
    { value: "Support", label: "Support" },
  ];

  const Roles = [
    { value: "Employee", label: "Employee" },
    { value: "Hr", label: "Hr" },
    { value: "Manager", label: "Manager" },
    { value: "Accountant", label: "Accountant" },
  ];

  const status = [
    { value: "Active", label: "Active" },
    { value: "InActive", label: "InActive" },
  ];

  useEffect(() => {
    // Retrieve companyName from session storage
    const storedCompanyName = localStorage.getItem("name");
    setCompanyName(storedCompanyName);

    // Generate employeeId only if data is not submitted
    if (!isDataSubmitted && storedCompanyName) {
      const generatedEmployeeId = generateEmployeeId(storedCompanyName);
      setEmployeeId(generatedEmployeeId);
    }
  }, [isDataSubmitted, companyName]);

  const generateEmployeeId = (companyName) => {
    const seriesCounter = localStorage.getItem("seriesCounter") || 1;
    const formattedSeriesCounter = String(seriesCounter).padStart(4, "0");
    const newEmployeeId =
      companyName.toUpperCase().substring(0, 3) + formattedSeriesCounter;

    return newEmployeeId;
  };


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

  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position
    // Remove leading spaces
    value = value.replace(/^\s+/g, '');
    // Ensure only alphabets and spaces are allowed
    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
    value = value.split('').filter(char => allowedCharsRegex.test(char)).join('');
    // Capitalize the first letter of each word
    const words = value.split(' ');
    // Capitalize the first letter of each word and lowercase the rest
    const capitalizedWords = words.map(word => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return '';
    });
    // Join the words back into a string
    let formattedValue = capitalizedWords.join(' ');
    // Remove spaces not allowed (before the first two characters)
    if (formattedValue.length > 2) {
      formattedValue = formattedValue.slice(0, 2) + formattedValue.slice(2).replace(/\s+/g, ' ');
    }
    // Update input value
    input.value = formattedValue;
    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  const toInputLowerCase = (e) => {
    const input = e.target;
    let value = input.value;
    // Remove leading spaces
    value = value.replace(/^\s+/g, '');

    // Initially disallow spaces if there are no non-space characters
    if (!/\S/.test(value)) {
      // If no non-space characters are present, prevent spaces
      value = value.replace(/\s+/g, '');
    } else {
      // Allow spaces if there are non-space characters
      value = value.toLowerCase();
      value = value.replace(/^\s+/g, ''); // Remove leading spaces
      const words = value.split(' ');
      const capitalizedWords = words.map(word => {
        return word.charAt(0).toLowerCase() + word.slice(1);
      });
      value = capitalizedWords.join(' ');
    }
    // Update input value
    input.value = value;
  };

  const toInputSpaceCase = (e) => {
    let inputValue = e.target.value;
    let newValue = "";
    let capitalizeNext = true;  // Flag to determine if the next character should be capitalized

    // Remove spaces from the beginning of inputValue
    inputValue = inputValue.trimStart();

    for (let i = 0; i < inputValue.length; i++) {
      const char = inputValue.charAt(i);

      // Check if the current character is a space
      if (char === " ") {
        newValue += char;
        capitalizeNext = true;  // Set flag to capitalize next non-space character
      } else if (capitalizeNext && char.match(/[a-zA-Z0-9]/)) {
        newValue += char.toUpperCase();
        capitalizeNext = false;  // Reset flag after capitalizing a character
      } else {
        newValue += char;  // Add character as is if it's not the first one after a space
      }
    }

    // Update the input value
    e.target.value = newValue;
  };




  let company = user.company
  const onSubmit = async (data) => {
    // const roles = data.roles ? [data.roles] : []; 
    // Constructing the payload
    let payload = {
      companyName: company,
      employeeType: data.employeeType,
      emailId: data.emailId,
      password: data.password,
      designation: data.designation,
      location: data.location,
      manager: data.manager,
      //roles: roles,
      mobileNo: data.mobileNo,
      status: data.status,
      accountNo: data.accountNo,
      ifscCode: data.ifscCode,
      bankName: data.bankName,
      aadhaarId: data.aadhaarId
    };
    if (location.state && location.state.id) {
      payload = {
        ...payload,
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfHiring: data.dateOfHiring,
        department: data.department,
        panNo: data.panNo,
        uanNo: data.uanNo,
        dateOfBirth: data.dateOfBirth
      };
    } else {
      // Include these fields for the create request
      payload = {
        ...payload,
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfHiring: data.dateOfHiring,
        department: data.department,
        panNo: data.panNo,
        aadhaarId: data.aadhaarId,
        uanNo: data.uanNo,
        dateOfBirth: data.dateOfBirth
      };
    }

    try {
      if (location.state && location.state.id) {
        const response = await EmployeePatchApiById(location.state.id, payload);
        console.log("Update successful", response.data);
        toast.success("Employee Updated Successfully");
      } else {
        const response = await EmployeePostApi(payload);
        console.log("Employee created", response.data);
        toast.success("Employee Created Successfully");
      }
      setTimeout(() => {
        navigate("/employeeView");
      }, 1000); // Adjust the delay time as needed (in milliseconds)

      reset();
    } catch (error) {
      if (error.response && error.response.data) {
        const { error: errorData } = error.response.data;
  
        if (errorData && errorData.messages && Array.isArray(errorData.messages)) {
          const message = errorData.messages.join('\n'); // Join messages with new lines
          setErrorMessage(message);
        } else {
          const message = error.response.data.message || "An unexpected error occurred.";
          setErrorMessage(message);
        }
      } else {
        handleApiErrors(error);
      }
    }
  };

  const handleApiErrors = (error) => {
    // if (error.response && error.response.data && error.response.data.message) {
    //   const alertMessage = `${error.response.data.message} (Duplicate Values)`;
    //   alert(alertMessage);
    // }
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
      const errorMessage = error.response.data.error.message;
      setErrorMessage(errorMessage)
      toast.error(errorMessage);
    } else {
      // toast.error("Network Error !");
    }
    console.error(error.response);
  };

  useEffect(() => {
    if (location && location.state && location.state.id) {
      const fetchData = async () => {
        try {
          const response = await EmployeeGetApiById(location.state.id);
          console.log(response.data);
          reset(response.data);
          setIsUpdating(true);
          // Assuming roles is an array and setting the first role
          setValue('status', response.data.data.status.toString());
          // Check if roles array has any items
          const role = response.data.data.roles[0]; // Assuming roles is an array
          const selectedRole = Roles.find(option => option.value === role);
          setValue('roles', selectedRole || null);
        } catch (error) {
          handleApiErrors(error);
        }
      };

      fetchData();
    }
  }, [location.state, reset, setValue]);


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toISOString().split("T")[0];
    return formattedDate;
  };
  const today = new Date();
  const threeMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()).toISOString().split('T')[0];
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    if (month < 10) {
      month = `0${month}`;
    }
    if (day < 10) {
      day = `0${day}`;
    }

    return `${year}-${month}-${day}`;
  };

  const validateDate = (value) => {
    const selectedDate = new Date(value);
    if (selectedDate > new Date(threeMonthsFromNow)) {
        return "Date of Hiring cannot be more than 3 months from today.";
    }
    return true; // Return true if no errors
};

// Custom validation function for date of birth based on date of hiring
const validateDateOfBirth = (value, dateOfHiring) => {
  const selectedDateOfBirth = new Date(value);
  const selectedDateOfHiring = new Date(dateOfHiring); // Ensure this is a Date object
  // Calculate limits
  const minDateOfBirth = new Date(selectedDateOfHiring);
  minDateOfBirth.setFullYear(selectedDateOfHiring.getFullYear() - 21); // 21 years ago from date of hiring

  const maxDateOfBirth = new Date(selectedDateOfHiring);
  maxDateOfBirth.setFullYear(selectedDateOfHiring.getFullYear() - 80); // 80 years ago from date of hiring

  // Validate against the limits
  if (selectedDateOfBirth > minDateOfBirth) {

      return "Date of Birth must be at least 21 years before the Date of Hiring.";
  }
  if (selectedDateOfBirth < maxDateOfBirth) {
      return "Date of Birth must not exceed 80 years before the Date of Hiring.";
  }

  return true; // Return true if no errors
};

const validatePassword = (value) => {
  const errors = [];
  if (!/(?=.*[0-9])/.test(value)) {
    errors.push("at least one digit");
  }
  if (!/(?=.*[a-z])/.test(value)) {
    errors.push("at least one lowercase letter");
  }
  if (!/(?=.*[A-Z])/.test(value)) {
    errors.push("at least one uppercase letter");
  }
  if (!/(?=.*\W)/.test(value)) {
    errors.push("at least one special character");
  }
  if (value.includes(" ")) {
    errors.push("no spaces");
  }

  if (errors.length > 0) {
    return `Password must contain ${errors.join(", ")}.`;
  }
  return true; // Return true if all conditions are satisfied
};

const validateName = (value) => {
  if (!value || value.trim().length === 0) {
    return "Manager Name is Required.";
  } else if (!/^[A-Za-z ]+$/.test(value)) {
    return "Only Alphabetic Characters are Allowed.";
  } else {
    const words = value.split(" ");
    
    for (const word of words) {
      if (word.length < 3 || word.length > 30) {
        return "Invalid Format of Manager.";
      }
    }
    
    if (/^\s|\s$/.test(value)) {
      return "No Leading or Trailing Spaces Allowed.";
    } else if (/\s{2,}/.test(value)) {
      return "No Multiple Spaces Between Words Allowed.";
    }
  }

  return true; // Return true if all conditions are satisfied
};

const validateLocation = (value) => {
  if (!value || value.trim().length === 0) {
    return "Location is Required.";
  } else if (!/^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,&*.()^\-/]*$/.test(value)) {
    return "Only Alphabetic Characters are Allowed.";
  } else {
    const words = value.split(" ");
    
    for (const word of words) {
      if (word.length < 3 || word.length > 200) {
        return "Invalid Format of Location.";
      }
    }
    
    if (/^\s|\s$/.test(value)) {
      return "No Leading or Trailing Spaces Allowed.";
    } else if (/\s{2,}/.test(value)) {
      return "No Multiple Spaces Between Words Allowed.";
    }
  }

  return true; // Return true if all conditions are satisfied
};

// In your component
const dateOfHiring = watch("dateOfHiring"); // Use `watch` from react-hook-form

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3"><strong>Registration</strong> </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="/employeeView">Employee</a>
                </li>
                <li className="breadcrumb-item active">
                  Registration
                </li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title ">
                  {isUpdating ? "Employee Data" : "Employee Registration"}
                </h5>
                <div
                  className="dropdown-divider"
                  style={{ borderTopColor: "#d7d9dd" }}
                />
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row ">
                    {isUpdating ? (
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">
                          Employee Type <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Employee Type"
                          name="employeeType"
                          readOnly
                          {...register("employeeType", {
                            required: "Employee Type Required",
                            pattern: {
                              value: /^[A-Za-z ]+$/,
                              message: "This field accepts only alphabetic characters",
                            },
                          })}
                        />
                        {errors.employeeType && (
                          <p className="errorMsg">
                            {errors.employeeType.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">
                          Employee Type <span style={{ color: "red" }}>*</span>
                        </label>
                        <Controller
                          name="employeeType"
                          control={control}
                          rules={{ required: 'Employee Type is Required' }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={Employement}
                              value={Employement.find(option => option.value === field.value)}
                              onChange={(val) => field.onChange(val.value)}
                              placeholder="Select Employee Type"
                            />
                          )}
                        />
                        {errors.employeeType && (
                          <p className="errorMsg">
                            {errors.employeeType.message}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Employee Id <span style={{ color: "red" }}>*</span></label>
                      <input
                        type={isUpdating ? "text" : "text"}
                        readOnly={isUpdating}
                        className="form-control"
                        placeholder="Enter Employee Id"
                        name="employeeId"
                        minLength={1} maxLength={10}
                        onKeyDown={handleEmailChange}
                        autoComplete='off'
                        {...register("employeeId", {
                          required: "Employee Id is Required",
                          pattern: {
                            value: /^(?=.*\d)[A-Z0-9]+$/,
                            message: "These fields accepts only Integers and Alphanumerical Characters",
                          },
                          minLength: {
                            value: 1,
                            message: "minimum 1 character Required",
                          },
                          maxLength: {
                            value: 10,
                            message: "not exceed 10 characters",
                          },
                        })}
                      />
                      {errors.employeeId && (
                        <p className="errorMsg">{errors.employeeId.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">First Name <span style={{ color: "red" }}>*</span></label>
                      <input
                        type="text"
                        readOnly={isUpdating}
                        className="form-control"
                        placeholder="Enter First Name"
                        name="firstName"
                        onInput={toInputTitleCase}
                        minLength={2}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("firstName", {
                          required: "First Name is Required",
                          pattern: {
                            value: /^[A-Za-z ]+$/,
                            message:
                              "These fields accepts only Alphabetic Characters",
                          },
                          minLength: {
                            value: 3,
                            message: "Minimum 3 characters Required",
                          },
                          maxLength: {
                            value: 100,
                            message: "Maximum 100 characters Required",
                          },
                        })}
                      />
                      {errors.firstName && (
                        <p className="errorMsg">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Last Name <span style={{ color: "red" }}>*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Last Name"
                        name="lastName"
                        readOnly={isUpdating}
                        minLength={1}
                        onInput={toInputTitleCase}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("lastName", {
                          required: "Last Name is Required",
                          pattern: {
                            value: /^[A-Za-z ]+$/,
                            message: "These fields accept only alphabetic characters",
                          },
                          minLength: {
                            value: 1,
                            message: "Minimum 1 character Required",
                          },
                          maxLength: {
                            value: 100,
                            message: "Maximum 100 characters Required",
                          },
                        })}
                      />
                      {errors.lastName && (
                        <p className="errorMsg">{errors.lastName.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Email Id <span style={{ color: "red" }}>*</span></label>
                      <input
                        type={isUpdating ? "email" : "email"}
                        readOnly={isUpdating}
                        className="form-control"
                        placeholder="Enter Email Id"
                        name="emailId"
                        autoComplete="off"
                        onInput={toInputLowerCase}
                        onKeyDown={handleEmailChange}
                        {...register("emailId", {
                          required: "Email Id is Required",
                          pattern: {
                            value: /^(?![0-9]+@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                            message: "Invalid Email Format",
                          },
                        })}
                      />
                      {errors.emailId && (
                        <p className="errorMsg">{errors.emailId.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Date of Joining <span style={{ color: "red" }}>*</span></label>
                      <input
                        type={isUpdating ? "date" : "date"}
                        readOnly={isUpdating}
                        name="dateOfHiring"
                        placeholder="Enter Hiring Date"
                        className="form-control"
                        autoComplete="off"
                        max={threeMonthsFromNow}
                        {...register("dateOfHiring", {
                          required: true,
                          validate:validateDate
                        })}
                      />
                      {errors.dateOfHiring && (
                        <p className="errorMsg">{errors.dateOfHiring.message||"Date of Joining is Required"}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>

                    {/* {isUpdating ? (
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">
                          Department <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Employee Type"
                          name="departmentName"
                          readOnly
                          {...register("departmentName", {
                            required: "Department is Required",
                            pattern: {
                              value: /^[A-Za-z ]+$/,
                              message: "This field accepts only alphabetic characters",
                            },
                          })}
                        />
                        {errors.departmentName && (
                          <p className="errorMsg">
                            {errors.departmentName.message}
                          </p>
                        )}
                      </div>

                    ) : (  */}

                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Department <span style={{ color: "red" }}>*</span>
                      </label>
                      <Controller
                        name="department"
                        control={control}
                        defaultValue=""
                        rules={{ required: "Department is Required" }}
                        render={({ field }) => (
                          <select {...field} className="form-select">
                            <option value="" disabled>Select Department</option>
                            {departments.map(department => (
                              <option key={department.id} value={department.id}>
                                {department.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.department && (
                        <p className="errorMsg">
                          {errors.department.message}
                        </p>
                      )}
                    </div>
                    {/* )} */}

                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                      <label className="form-label">Designation <span style={{ color: "red" }}>*</span></label>
                      <Controller
                        name="designation"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <select {...field} className="form-select" >
                            <option value="" disabled>Select Designation</option>
                            {designations.map(designation => (
                              <option key={designation.id} value={designation.id}>
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

                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Manager <span style={{ color: "red" }}>*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Manager"
                        onInput={toInputTitleCase}
                        autoComplete="off" minLength={1}
                        onKeyDown={handleEmailChange}
                        {...register("manager", {
                          required: "Manager is Required",

                        validate:{
                          validateName,
                        }
                        })}
                      />
                      {errors.manager && (
                        <p className="errorMsg">{errors.manager.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Location <span style={{ color: "red" }}>*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Location"
                        onInput={toInputTitleCase}
                        autoComplete="off" minLength={2}
                        onKeyDown={handleEmailChange}
                        {...register("location", {
                          required: "Location is Required",
                         validate:{
                          validateLocation
                         }
                        })}
                      />
                      {errors.location && (
                        <p className="errorMsg">{errors.location.message}</p>
                      )}
                    </div>
                    {isUpdating && (
                      <div className="col-lg-1"></div>
                    )}
                    {isUpdating ? (
                      <></>
                    ) : (
                      <>
                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                          <label className="form-label">Password <span style={{ color: "red" }}>*</span></label>
                          <div className="col-sm-12 input-group">
                            <input
                              className="form-control"
                              placeholder="Enter Password"
                              onChange={handlePasswordChange}
                              autoComplete="off"
                              onKeyDown={handleEmailChange} maxLength={16}
                              type={passwordShown ? "text" : "password"}
                              {...register("password", {
                                required: "Password is Required",
                               validate:validatePassword,
                                minLength: {
                                  value: 6,
                                  message: "minimum 6 characters are Required",
                                },
                                maxLength: {
                                  value: 16,
                                  message: "maximum 16 characters!",
                                },
                              })}
                            />
                            <i
                              onClick={togglePasswordVisiblity}
                              style={{ margin: "5px" }}
                            >
                              {" "}
                              {passwordShown ? (
                                <Eye size={17} />
                              ) : (
                                <EyeSlash size={17} />
                              )}
                            </i>
                          </div>
                          {errors.password && (
                            <p className="errorMsg">{errors.password.message}</p>
                          )}
                        </div>

                      </>
                    )}
                   {!isUpdating && (
                      <div className="col-lg-1"></div>
                    )}                  
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Date of Birth <span style={{ color: "red" }}>*</span></label>
                      <input
                        type={isUpdating ? "date" : "date"}
                        readOnly={isUpdating}
                        name="dateOfBirth"
                        placeholder="Enter Birth Date"
                        className="form-control"
                        autoComplete="off"
                        {...register("dateOfBirth", {
                          required: true,
                          validate: (value) => validateDateOfBirth(value, dateOfHiring) // Custom validation

                        })}
                        max={getCurrentDate()}
                        {...register("dateOfBirth", {
                          required: true,
                        })}
                      />
                      {errors.dateOfBirth && (
                        <p className="errorMsg">{errors.dateOfBirth.message|| "Date of Birth is Required"}</p>
                      )}
                    </div>
                    {isUpdating && (
                      <div className="col-lg-1"></div>
                    )}
                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                      <label className="form-label">Status <span style={{ color: "red" }}>*</span></label>
                      <Controller
                        name="status"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={[
                              { value: "Active", label: "Active" },
                              { value: "InActive", label: "InActive" },
                            ]}
                            value={
                              field.value
                                ? { value: field.value, label: ["Active", "InActive"].find(option => option === field.value) }
                                : null
                            }
                            onChange={(val) => field.onChange(val.value)}
                            placeholder="Select Status"
                          />
                        )}
                      />
                      {errors.status && <p className="errorMsg"> Status is Required</p>}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                          <label className="form-label">
                            Mobile Number <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="Enter Contact Number"
                            autoComplete="off"
                            maxLength={10}
                            onInput={toInputSpaceCase}
                            onKeyDown={handleEmailChange}
                            {...register("mobileNo", {
                              required: "Mobile Number is Required",
                              pattern: {
                                value: /^(?!0000000000)[0-9]{10}$/,
                                message:
                                "Mobile Number should be exactly 10 digits long, should contain only numbers, and cannot be all zeros.",
                              },
                              validate: {
                                notRepeatingDigits: value => {
                                  const isRepeating = /^(\d)\1{9}$/.test(value); // Check for repeated digits
                                  return !isRepeating || "Mobile Number cannot consist of the same digit repeated.";
                                }
                              }
                            })}
                          />
                          {errors.mobileNo && (
                            <p className="errorMsg">{errors.mobileNo.message}</p>
                          )}
                        </div>
                    {/* {isUpdating ? (
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">Role <span style={{ color: "red" }}>*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Last Name"
                          name="roles"
                          readOnly
                          {...register("roles", {
                            required: "Role is Required",
                            pattern: {
                              value: /^[A-Za-z ]+$/,
                              message:
                                "These fields accepts only Alphabetic Characters",
                            },
                          })}
                        />
                        {errors.roles && (
                          <p className="errorMsg">
                            {errors.type.message}
                          </p>
                        )}
                      </div>
                    ) : ( */}
                    {/* <div className="col-12 col-md-6 col-lg-5 mb-2">
                        <label className="form-label mb-3">Select Role<span style={{ color: "red" }}>*</span></label>
                        <Controller
                          name="roles"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select
                            {...field}
                            options={Roles}
                            value={Roles.find(option => option.value === field.value) || null}
                            onChange={(selectedOption) => {
                                // Handle the change and set the selected value
                                field.onChange(selectedOption ? selectedOption.value : '');
                            }}                            placeholder="Select Role"
                            isClearable // Optionally allow clearing the selection
                        />
                          )}
                        />
                        {errors.roles && <p className="errorMsg">Employee Role is Required</p>}
                      </div> */}
                    {/* )} */}
                    <div className="card-header" style={{ paddingLeft: "0px" }}>
                      <h5 className="card-title ">
                        Account Details
                      </h5>
                      <div
                        className="dropdown-divider"
                        style={{ borderTopColor: "#d7d9dd" }}
                      />
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Bank Account Number <span style={{ color: "red" }}>*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Bank Account Number"
                        name="accountNo"
                        onInput={toInputSpaceCase}
                        onKeyDown={handleEmailChange}
                        autoComplete="off"
                        {...register("accountNo", {
                          required: "Bank Account Number is Required",
                          pattern: {
                            value: /^\d{9,18}$/,
                            message:
                              "These fields accepts only Integers",
                          },
                          minLength: {
                            value: 9,
                            message: "Account Number minimum 9 numbers Required",
                          },
                          maxLength: {
                            value: 18,
                            message: "Account Number must not exceed 18 characters",
                          },
                        })}
                      />
                      {errors.accountNo && (
                        <p className="errorMsg">{errors.accountNo.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Bank IFSC Code <span style={{ color: "red" }}>*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Bank IFSC Code"
                        name="ifscCode"
                        onInput={toInputSpaceCase}
                        onKeyDown={handleEmailChange}
                        autoComplete="off"
                        {...register("ifscCode", {
                          required: "Bank IFSC Code is Required",
                          pattern: {
                            value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                            message:
                              "Please enter a valid IFSC code ",
                          },
                          maxLength: {
                            value: 11,
                            message: "IFSC Code must not exceed 11 characters",
                          },
                        })}
                      />
                      {errors.ifscCode && (
                        <p className="errorMsg">{errors.ifscCode.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Bank Name <span style={{ color: "red" }}>*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Bank Name"
                        name="bankName"
                        onInput={toInputSpaceCase}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("bankName", {
                          required: "Bank Name is Required",
                          pattern: {
                            value: /^[A-Za-z&'(),./\- ]{1,100}$/,
                            message:
                              "Invalid Bank Name format",
                          },
                          minLength: {
                            value: 3,
                            message: "Minimum 3 characters Required",
                          },
                          maxLength: {
                            value: 50,
                            message: "Maximum 50 characters Required",
                          },
                        })}
                      // disabled={editMode}
                      />
                      {errors.bankName && (
                        <p className="errorMsg">{errors.bankName.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">UAN Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter UAN Number"
                        name="uanNo"
                        readOnly={isUpdating}
                        onInput={toInputSpaceCase}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("uanNo", {
                          pattern: {
                            value: /^\d{12}$/,
                            message:
                              "Allows only Integers",
                          },
                          minLength: {
                            value: 12,
                            message: "MInimum 12 characters required",
                          },
                          maxLength: {
                            value: 12,
                            message: "UAN Number must not exceed 12 characters",
                          },
                        })}
                      />
                      {errors.uanNo && (
                        <p className="errorMsg">{errors.uanNo.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">PAN Number <span style={{ color: "red" }}>*</span></label>
                      <input
                        type={isUpdating ? "text" : "text"}
                        readOnly={isUpdating}
                        className="form-control"
                        placeholder="Enter PAN Number"
                        name="panNo"
                        onInput={toInputSpaceCase}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("panNo", {
                          required: "PAN Number is Required",
                          maxLength: {
                            value: 10,
                            message: "Pan Number must not exceed 10 characters",
                          },
                          pattern: {
                            value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                            message:
                              "Pan Number should be in the format: ABCDE1234F",
                          },
                        })}
                      />
                      {errors.panNo && (
                        <p className="errorMsg">{errors.panNo.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Aadhaar Number <span style={{ color: "red" }}>*</span></label>
                      <input
                        type="text"
                        readOnly={isUpdating}
                        className="form-control"
                        placeholder="Enter Aadhaar Number"
                        name="aadhaarId"
                        onInput={toInputSpaceCase}
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        {...register("aadhaarId", {
                          required: "Aadhaar Number is Required",
                          pattern: {
                            value: /^\d{12}$/,
                            message:
                              "Allows only Integers",
                          },
                          maxLength: {
                            value: 12,
                            message: "Aadhar Number must not exceed 12 characters",
                          },
                        })}
                      />
                      {errors.aadhaarId && (
                        <p className="errorMsg">{errors.aadhaarId.message}</p>
                      )}
                    </div>
                    {errorMessage && (
                      <div className="alert alert-danger mt-4 text-center">
                        {errorMessage}
                      </div>
                    )}
                    <div
                      className="col-12 mt-4  d-flex justify-content-end"
                      style={{ background: "none" }}
                    >
                      <button
                        className={
                          isUpdating
                            ? "btn btn-danger bt-lg"
                            : "btn btn-primary btn-lg"
                        }
                        style={{ marginRight: "65px" }}
                        type="submit"
                      >
                        {isUpdating ? "Update Employee" : "Add Employee"}{" "}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default EmployeeRegistration;
