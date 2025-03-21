import React, { useState,useEffect } from 'react';
import LayOut from '../../LayOut/LayOut';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../../Redux/EmployeeSlice';
import { DepartmentGetApi, DesignationGetApi, EmployeePatchApiById, EmployeePostApi } from '../../Utils/Axios';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

export default function EmployeeRegister() {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,reset,
    formState: { errors },
    trigger,getValues
  } = useForm({
    mode:"onChange",
      defaultValues: {
        // Step 1: Employee Details
        employeeType: "",
        employeeId: "",
        firstName: "",
        lastName: "",
        department: "",
        designation: "",
        manager: "",
        hiringDate: "",
        location: "",
        status: "",
        mailId: "",
        // Step 2: Personal Details
        dob: "",
        contactNumber: "",
        alternateNumber: "",
        personalEmail: "",
        aadhar: "",
        uan: "",
        pan: "",
        pAddress: "",
        tAddress: "",
  
        // Step 3: Education Details
        educationList: [{ level: "", institution: "", board: "", branch: "", year: "", percentage: "" }],
  
        // Step 4: Experience Details
        experienceList: [{ company: "", position: "", startDate: "", endDate: "", tenure: "" }],
  
        // Step 5: Bank Details
        bankName: "",
        accountNumber: "",
        ifsc: "",
        bankBranch: "",
     
      },
    });

  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
 const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  // Step 2: Access employee data from the Redux store
  const { data: employees, status, error } = useSelector((state) => state.employees);
  // Step 3: Fetch employees on component mount

 // Manage dynamic fields for education
 const { fields: educationFields, append: addEducation, remove: removeEducation } = useFieldArray({
  control, name: "educationList"
});

// Manage dynamic fields for experience
const { fields: experienceFields, append: addExperience, remove: removeExperience } = useFieldArray({
  control, name: "experienceList"
});

const onNext = async () => {
  const isValid = await trigger(); // Validate current step fields
  if (isValid) setStep(step + 1);
};

const onPrevious = () => {
  setStep(step - 1);
};
  const Employement = [
    { value: "Permanent", label: "Permanent" },
    { value: "Contract", label: "Contract" },
    { value: "Trainee", label: "Trainee" },
    { value: "Support", label: "Support" },
    { value: "Associate", label: "Associate" },
  ];

  let company = user.company;
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
      aadhaarId: data.aadhaarId,
    };
    if (location.state && location.state.id) {
      payload = {
        ...payload,
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfHiring: data.dateOfHiring,
        manager:data.manager,
        department: data.department,
        panNo: data.panNo,
        uanNo: data.uanNo,
        dateOfBirth: data.dateOfBirth,
      };
    } else {
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
        dateOfBirth: data.dateOfBirth,
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
      let errorList = [];

      // Check if error response exists
      if (error.response) {
        console.log("Axios response error:", error.response.data.error); // Log Axios error response

        // Case 1: General error message
        if (error.response.data.error && error.response.data.error.message) {
          const generalErrorMessage = error.response.data.error.message;
          errorList.push(generalErrorMessage);
          toast.error(generalErrorMessage);
        }

        // Case 2: Specific error messages (multiple messages, such as form validation errors)
        if (error.response.data.error && error.response.data.error.messages) {
          const specificErrorMessages = error.response.data.error.messages;
          toast.error("Invalid Format Fields");
          specificErrorMessages.forEach((message) => {
            // Display each error message individually
            errorList.push(message);
          });
        }

        // Case 3: Specific error data (duplicate value conflicts)
        if (error.response.data.data) {
          const conflictData = error.response.data.data;
          let conflictMessage = "Error Details:\n";
          toast.error(error.response.data.message);
          // Check if data contains specific conflict details (e.g., duplicate values)
          Object.keys(conflictData).forEach((key) => {
            const value = conflictData[key];
            conflictMessage += `${key}: ${value}\n,`;
          });

          // Display detailed conflict message in toast and add to error list
          errorList.push(conflictMessage);
        }

        // Handle HTTP 409 Conflict Error (duplicate or other conflicts)
        if (error.response.status === 409) {
          const conflictMessage = "A conflict occurred.";
          toast.error(conflictMessage); // Show conflict error in toast
        }
      } else {
        // General error (non-Axios)
        console.log("Error without response:", error);
        toast.error("An unexpected error occurred. Please try again later.");
      }

      // Update the error messages in the state
      setErrorMessage(errorList);
    }
  };

  // eslint-disable-next-line no-undef
  useEffect(() => {
    if (status === "loading") {
      dispatch(fetchEmployees());
    }
  }, [dispatch, status]); 
  
  // Filter employees whose designation starts or ends with "Manager"
const managerEmployees = employees.filter(
  (emp) =>
    emp.designationName &&
    (emp.designationName.trim().toLowerCase().startsWith("manager") ||
      emp.designationName.trim().toLowerCase().endsWith("manager"))
);

// Map manager employees to dropdown format
const managerOptions = managerEmployees.map((emp) => ({
  id: emp.id,
  name: `${emp.firstName || ""} ${emp.lastName || ""} (${emp.designationName})`.trim(),
}));

// Always include "CompanyAdmin" as an option
const dropdownOptions = [
  ...managerOptions,
  { id: "CompanyAdmin", name: "CompanyAdmin" }
];
  // Get the last employeeId in the list
  const lastEmployeeId = employees.length > 0 ? employees[employees.length - 1].employeeId : "N/A";

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

  const calculateTenure = (index, startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start < end) {
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

         // Convert months and days to fractional years
         const fractionalYears = years + (months / 12) + (days / 365);

         // Set the tenure value in years with decimal precision
         setValue(`experienceList.${index}.tenure`, `${fractionalYears.toFixed(2)} years`)

        } else {
        setValue(`experienceList.${index}.tenure`, "Invalid date range");
      }
    }
  };

  return (
    <LayOut>
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4 w-100">
        <div className="card-body">
        <h2 className="text-start text-dark">Employee Registration</h2>
          <div className="d-flex justify-content-end my-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`mx-1 rounded-circle ${
                  i === step ? 'bg-primary' : i < step ? 'bg-success' : 'bg-secondary'
                }`} style={{ width: '10px', height: '10px' }}
              />
            ))}
          </div>
          <p className="text-end">Step {step} of 5</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div>    
                <h3 className="mb-3">Step 1: Employee Details</h3>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <label>Employee First Name</label>
                    <input type="text" className="form-control" name='firstName'
                      {...register("firstName", { required: "First Name is required",
                        pattern: { value: /^[A-Za-z]+$/, message: "Invalid format" },
                       })}
                    />
                    <small className="text-danger">{errors.firstName?.message}</small>
                  </div>
                  <div className="col-md-6 mb-2">
                    <label>Employee Last Name</label>
                    <input type="text" className="form-control" name='lastName'
                      {...register("lastName", { required: "Last Name is required",
                        pattern: { value: /^[A-Za-z]+$/, message: "Invalid format" },
                       })}
                    />
                      <small className="text-danger">{errors.lastName?.message}</small>
                  </div>
                  <div className="col-md-6 mb-2 mt-2">
                    <label>Employee ID</label> (last ID:{lastEmployeeId})
                    <input type="text" className="form-control" name='employeeId'
                     {...register("employeeId", {
                      required: "Employee ID is required",
                      pattern: { value: /^[A-Za-z0-9_-]+$/, message: "Invalid Employee ID format" },
                    })}
                    />
                      <small className="text-danger">{errors.employeeId?.message}</small>
                  </div>
                  <div className="col-md-6 mb-2 mt-2">
                    <label>Employee Type</label>
                    <select className="form-select" id='employeeType' name='employeeType'
                      {...register("employeeType", { required: "Select Employee Type" })}
                      >
                      <option value="">Select Employment Type</option>
                      {Employement.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <small className="text-danger">{errors.employeeType?.message}</small>
                  </div>
                  <div className="col-md-6 mb-2 mt-2">
                    <label>Department</label>
                    <select className="form-select" id='department' name='department'
                      {...register("department", { required: "Select Department" })}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <small className="text-danger">{errors.department?.message}</small>
                  </div>
                  <div className="col-md-6 mb-2 mt-2">
                    <label>Designation</label>
                    <select className="form-select" id='designation' name='designation'
                        {...register("designation", { required: "Select Designation" })}
                    >
                      <option value="">Select Designation</option>
                      {designations.map((des) => (
                        <option key={des.id} value={des.id}>{des.name}</option>
                      ))}
                    </select>
                    <small className="text-danger">{errors.designation?.message}</small>
                  </div>
                  <div className="col-md-6 mb-2 mt-2">
                    <label>Employee Mail ID</label>
                    <input type="email" className="form-control"
                     {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" },
                    })}
                  />
                  <small className="text-danger">{errors.email?.message}</small>        
                  </div>
                  <div className="col-md-6 mb-2 mt-2">
                    <label>Manager</label>
                    <select className="form-select" id='manager' name='manager'
                      {...register("manager", { required: "Select Manager" })}
                      >
                      <option value="">Select Manager</option>
                      {dropdownOptions.map((mgr) => (
                        <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-2 mt-2">
                    <label>Date of Hiring</label>
                    <input type="date" className="form-control"
                     {...register("dateOfHiring", {
                      required: "Date of Hiring is required",
                    })}
                  />
                  <small className="text-danger">{errors.dateOfHiring?.message}</small>
                  </div>
                  <div className="col-md-6 mb-2 mt-2">
                    <label>Branch Location</label>
                    <input type="text" className="form-control"
                     {...register("location", {
                      required: "Branch Location is required",
                      pattern: { value: /^[A-Za-z\s]+$/, message: "Only alphabets allowed" },
                    })}
                  />
                  <small className="text-danger">{errors.location?.message}</small>
                  </div>
                  <div className="col-md-6 mb-2 mt-2">
                    <label>Status</label>
                    <select className="form-control" id='status' name='status'
                     {...register("status", { required: "Select Status" })}
                     >
                      <option value="">Select Status</option>
                      <option value='Active'>Active</option>
                      <option value='In Active'>InActive</option>
                      <option value='On Board'>OnBoard</option>
                      <option value='Notice Period'>Notice Period</option>
                      <option value='Relieved'>Relieved</option>
                    </select>
                    <small className="text-danger">{errors.status?.message}</small>
                  </div>

                </div>
              </div>
            )}
            {step === 2 && (
              <div>
              <h3 className="mb-3">Step 2: Personal Details</h3>
              <h5>Personal Details</h5>
              <div className="row mb-3">
                <div className="col-md-4">
                  <label htmlFor="dob" className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" id="dob" 
                  {...register("dateOfBirth", {
                    required: "Date of Birth is required",
                  })}
                />
                <small className="text-danger">{errors.dateOfBirth?.message}</small>
                </div>
                <div className="col-md-4">
                  <label htmlFor="mobileNumber" className="form-label">Mobile Number</label>
                  <input type="tel" className="form-control" id="mobileNumber"
                  {...register("mobileNo", {
                    required: "Mobile Number is required",
                    pattern: { value: /^\+?[1-9]\d{0,2}[6-9]\d{9}$/,
                      message: "Enter a valid mobile number with optional country code",
                    },
                  })}
                />
              <small className="text-danger">{errors.mobileNo?.message}</small>
                </div>
                <div className="col-md-4">
                  <label htmlFor="alternateNumber" className="form-label">Alternate Number</label>
                  <input type="tel" className="form-control" 
                    {...register("alternateNo", {
                      required: "Alternate Number is required",
                      pattern: { value: /^\+?[1-9]\d{0,2}[6-9]\d{9}$/,
                        message: "Enter a valid Alternate mobile number with optional country code",
                      },
                    })}
                  />
                    <small className="text-danger">{errors.alternateNo?.message}</small>
                </div>
              </div> 
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="maritalStatus" className="form-label">Marital Status</label>
                  <select
                      className="form-select"
                      id="maritalStatus"
                      {...register("maritalStatus", { required: "Please select your Marital Status" })}
                  >
                      <option value="">Select Marital Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                  </select>
                    <small className="text-danger">{errors.maritalStatus?.message}</small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="aadharNumber" className="form-label">Aadhar Number</label>
                  <input type="text" className="form-control" id="aadhaarId"
                    {...register("aadhaarId", {
                      required: "Aadhar Number is required",
                      pattern: { value: /^\d{12}$/,
                        message: "Enter a valid Aadhar Number",
                      },
                    })}
                    />
                    <small className="text-danger">{errors.aadhaarId?.message}</small>
                </div>
              </div>
          
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="panNumber" className="form-label">PAN Number</label>
                  <input type="text" className="form-control" id="panNo" 
                  {...register("panNo", {
                    required: "PAN Number is required",
                    pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                      message: "Enter a valid PAN Number",
                    },
                  })}
                  />
                  <small className="text-danger">{errors.panNo?.message}</small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="uanNumber" className="form-label">UAN Number (Optional)</label>
                  <input type="text" className="form-control" id="uanNumber" 
                  {...register("uanNo", {
                    required: "UAN Number is required",
                    pattern: { value: /^\d{12}$/,
                      message: "Enter a valid UAN Number",
                    },
                  })}
                  />
                  <small className="text-danger">{errors.uanNo?.message}</small>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="pAddress" className="form-label">Permanent Address</label>
                  <textarea type="text" className="form-control"
                   {...register("pAddress", {
                    required: "Permanent Address is required",
                    pattern: { value: /^[A-Za-z0-9\s,.-]{5,100}$/,
                      message: "Enter a valid Permanent Address",
                    },
                  })}
                  />
                  <small className="text-danger">{errors.pAddress?.message}</small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="tAddress" className="form-label">Temporary Address</label>
                  <textarea type="text" className="form-control"
                   {...register("tAddress ", {
                    required: "Temporary Address is required",
                    pattern: { value: /^[A-Za-z0-9\s,.-]{5,100}$/,
                      message: "Enter a valid Temporary Address",
                    },
                  })}
                  />
                  <small className="text-danger">{errors.tAddress?.message}</small>
                </div>
              </div>
              {/* <h5 className="mt-4 mb-3">Permanent Address</h5>
              <div className="col-md-6">
                  <textarea type="text" className="form-control"/>
                </div> */}
              {/* <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="pStreet" className="form-label">Street</label>
                  <input type="text" className="form-control" id="pStreet" value={formData.pStreet} onChange={(e) => updateFormData('pStreet', e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="pVillage" className="form-label">Village</label>
                  <input type="text" className="form-control" id="pVillage" value={formData.pVillage} onChange={(e) => updateFormData('pVillage', e.target.value)} required />
                </div>
              </div>
          
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="pCity" className="form-label">City</label>
                  <input type="text" className="form-control" id="pCity" value={formData.pCity} onChange={(e) => updateFormData('pCity', e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="pPincode" className="form-label">Pincode</label>
                  <input type="text" className="form-control" id="pPincode" value={formData.pPincode} onChange={(e) => updateFormData('pPincode', e.target.value)} required />
                </div>
              </div>
          
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="pState" className="form-label">State</label>
                  <input type="text" className="form-control" id="pState" value={formData.pState} onChange={(e) => updateFormData('pState', e.target.value)} required />
                </div>
              </div> */}
          
              {/* <h5 className="mt-4 mb-3">Temporary Address</h5>
                <div className="col-md-6">
                  <textarea type="text" className="form-control"/>
                </div> */}
            </div>
            )}
            {step === 3 && (
              <div>
                <h3 className="mb-3">Step 3: Educational Details</h3>

                {educationFields.map((edu, index) => (
                  <div key={edu.id} className="row mb-2">
                    <div className="col-md-4">
                      <label>Education Level</label>
                      <input type="text" className="form-control"
                        {...register(`educationList.${index}.level`, {
                          required: "Education Level is required",
                          pattern: { value: /^[A-Za-z\s]+$/, message: "Only letters allowed" }
                        })}
                      />
                      <small className="text-danger">{errors.educationList?.[index]?.level?.message}</small>
                    </div>

                    <div className="col-md-4">
                      <label>Name of Institution/University</label>
                      <input type="text" className="form-control"
                        {...register(`educationList.${index}.institution`, {
                          required: "Institution is required",
                          pattern: { value: /^[A-Za-z\s]+$/, message: "Only letters allowed" }
                        })}
                      />
                      <small className="text-danger">{errors.educationList?.[index]?.institution?.message}</small>
                    </div>

                    <div className="col-md-4">
                      <label>Board of Study</label>
                      <input type="text" className="form-control"
                        {...register(`educationList.${index}.board`, {
                          required: "Board of Study is required",
                          pattern: { value: /^[A-Za-z\s]+$/, message: "Only letters allowed" }
                        })}
                      />
                      <small className="text-danger">{errors.educationList?.[index]?.board?.message}</small>
                    </div>

                    <div className="col-md-4">
                      <label>Branch/Specialization</label>
                      <input type="text" className="form-control"
                        {...register(`educationList.${index}.branch`, {
                          required: "Branch is required",
                          pattern: { value: /^[A-Za-z\s]+$/, message: "Only letters allowed" }
                        })}
                      />
                      <small className="text-danger">{errors.educationList?.[index]?.branch?.message}</small>
                    </div>

                    <div className="col-md-4">
                      <label>Year of Pass Out</label>
                      <input type="text" className="form-control"
                        {...register(`educationList.${index}.year`, {
                          required: "Year is required",
                          pattern: { value: /^(19|20)\d{2}$/, message: "Enter a valid 4-digit year (1900-2099)" }
                        })}
                      />
                      <small className="text-danger">{errors.educationList?.[index]?.year?.message}</small>
                    </div>

                    <div className="col-md-4">
                      <label>Percentage</label>
                      <input type="text" className="form-control"
                        {...register(`educationList.${index}.percentage`, {
                          required: "Percentage is required",
                          pattern: { value: /^(100|[0-9]{1,2}(\.\d{1,2})?)$/, message: "Enter a valid percentage (0-100)" }
                        })}
                      />
                      <small className="text-danger">{errors.educationList?.[index]?.percentage?.message}</small>
                    </div>

                    <div className="col-md-1">
                      <button type="button" className="btn btn-danger mt-4" onClick={() => removeEducation(index)}>Delete</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-primary mt-2" onClick={() => addEducation({ level: "", institution: "", board: "", branch: "", year: "", percentage: "" })}>
                  Add More
                </button>
              </div>
            )}
             {/* Step 4: Experience Details */}
            {step === 4 && (
                <div>
                  <h3 className="mb-3">Step 4: Experience Details</h3>
                  {experienceFields.map((exp, index) => {
                    const startDate = watch(`experienceList.${index}.startDate`);
                    const endDate = watch(`experienceList.${index}.endDate`);
                    return (
                      <div key={exp.id} className="row mb-2">
                        <div className="col-md-3">
                          <label>Company Name</label>
                          <input type="text" className="form-control"
                            {...register(`experienceList.${index}.company`, {
                              required: "Company Name is required",
                            })}
                          />
                          <small className="text-danger">{errors.experienceList?.[index]?.company?.message}</small>
                        </div>

                        <div className="col-md-3">
                          <label>Position/Title</label>
                          <input type="text" className="form-control"
                            {...register(`experienceList.${index}.position`, {
                              required: "Position is required",
                            })}
                          />
                          <small className="text-danger">{errors.experienceList?.[index]?.position?.message}</small>
                        </div>

                        <div className="col-md-2">
                          <label>Start Date</label>
                          <input type="date" className="form-control"
                            {...register(`experienceList.${index}.startDate`, {
                              required: "Start Date is required",
                            })}
                            onChange={(e) => calculateTenure(0, e.target.value, getValues(`experienceList.0.endDate`))}
                            />
                            <small className="text-danger">{errors.experienceList?.[0]?.startDate?.message}</small>
                            </div>

                        <div className="col-md-2">
                          <label>End Date</label>
                          <input type="date" className="form-control"
                            {...register(`experienceList.${index}.endDate`, {
                              required: "End Date is required",
                            })}
                            onChange={(e) => calculateTenure(0, getValues(`experienceList.0.startDate`), e.target.value)}
                            />
                            <small className="text-danger">{errors.experienceList?.[0]?.endDate?.message}</small>
                        </div>

                        <div className="col-md-2">
                          <label>Tenure</label>
                          <input type="text" className="form-control"
                            {...register(`experienceList.0.tenure`)}
                          readOnly />
                        </div>

                        <div className="col-md-1">
                          <button type="button" className="btn btn-danger mt-4" onClick={() => removeExperience(index)}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                  <button type="button" className="btn btn-primary mt-2" onClick={() => addExperience({ company: "", position: "", startDate: "", endDate: "", tenure: "" })}>
                    Add More
                  </button>
                </div>
            )}
            {step === 5 && (
              <div>
                <h3 className="mb-3">Step 5: Personal & Bank Details</h3>
                <div className="row">
                 <div className="col-md-6">
                   <label>Bank Name</label>
                   <select className="form-control"  {...register("bankName", { required: "Bank Name is required" })}>
                     <option value="">Select Bank</option>
                     <option value="HDFC">HDFC</option>
                     <option value="SBI">SBI</option>
                     <option value="ICICI">ICICI</option>
                   </select>
                   <small className="text-danger">{errors.bankName?.message}</small>
                 </div>
                 <div className="col-md-6">
                   <label>Account Number</label>
                   <input type="text" className="form-control" 
                    {...register("accountNumber", {
                      required: "Account Number is required",
                      pattern: {
                        value: /^\d{6,18}$/,
                        message: "Enter a valid Account Number (6-18 digits only)",
                      },
                    })}
                  />
                  <small className="text-danger">{errors.accountNumber?.message}</small>
                 </div>
                 <div className="col-md-6 mt-2">
                   <label>IFSC Code</label>
                   <input type="text" className="form-control" 
                    {...register("ifscCode", {
                      required: "IFSC Code is required",
                      pattern: {
                        value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                        message: "Invalid IFSC Code format (e.g., HDFC0123456)",
                      },
                    })}
                  />
                  <small className="text-danger">{errors.ifscCode?.message}</small>
                 </div>
                 <div className="col-md-6 mt-2">
                   <label>Branch</label>
                   <input type="text" className="form-control" 
                    {...register("branch", {
                      required: "Branch Name is required",
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "Only letters and spaces allowed",
                      },
                    })}
                  />
                  <small className="text-danger">{errors.branch?.message}</small>
                 </div>
               </div>
              </div>
            )}
              {errorMessage && (
                      <div className="alert alert-danger mt-4 text-center">
                        {errorMessage}
                      </div>
                    )}
             <div className="mt-3 d-flex justify-content-between">
        {step > 1 && (
          <button type="button" className="btn btn-secondary me-2" onClick={onPrevious}>
            Previous
          </button>
        )}
        {step < 5 ? (
          <button type="button" className="btn btn-primary" onClick={onNext}>
            Next
          </button>
        ) : (
          <button type="submit" className="btn btn-success">
            Submit
          </button>
        )}
      </div>
          </form>
        </div>
      </div>
    </div>
    </LayOut>

  );
}
