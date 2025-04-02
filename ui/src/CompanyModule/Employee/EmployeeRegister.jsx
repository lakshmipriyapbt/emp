import React, { useState,useEffect } from 'react';
import LayOut from '../../LayOut/LayOut';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../../Redux/EmployeeSlice';
import { BankNamesGetApi,DepartmentGetApi, DesignationGetApi, EmployeeGetApiById, EmployeePatchApiById, EmployeePostApi } from '../../Utils/Axios';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { toInputAddressCase, toInputTitleCase, validateAadhar, validateEmail, validateFirstName, validateLastName, validateLocation, validateNumber, validatePAN, validatePhoneNumber, validateUAN } from '../../Utils/Validate';

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
        aadhaarId: "",
        uan: "",
        pan: "",
        permanentAddress: "",
        tempAddress: "",
  
        // Step 3: Education Details
        employeeEducation: [{ educationLevel: "", instituteName: "", boardOfStudy: "", branch: "", year: "", percentage: "" }],
  
        // Step 4: Experience Details
        employeeExperience: [{ companyName: "", positionOrTitle: "", startDate: "", endDate: "", tenure: "" }],
  
        // Step 5: Bank Details
        bankName: "",
        accountNumber: "",
        ifsc: "",
        bankBranch: "",
     
      },
    });
  const { authUser} = useAuth();
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [bank,setBank]=useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // State to track if updating or creating
  const [showNoticePeriodOption, setShowNoticePeriodOption] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
 const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  // Step 2: Access employee data from the Redux store
  const { data: employees, status, error } = useSelector((state) => state.employees);
  // Step 3: Fetch employees on component mount

 // Manage dynamic fields for education
 const { fields: 
  educationFields, append: addEducation, remove: removeEducation } = useFieldArray({
  control, name: "employeeEducation"
});

// Manage dynamic fields for experience
const { fields: experienceFields, append: addExperience, remove: removeExperience } = useFieldArray({
  control, name: "employeeExperience"
});

const onNext = async () => {
  if (step === 4) {
    setStep(5); // Skip validation and move to Step 5
  } else {
    const isValid = await trigger(); // Validate other steps
    if (isValid && step < 5) {
      setStep(step + 1); // Move to the next step
    }
  }
};

    const handleApiErrors = (error) => {
      // if (error.response && error.response.data && error.response.data.message) {
      //   const alertMessage = `${error.response.data.message} (Duplicate Values)`;
      //   alert(alertMessage);
      // }
      if (
        error.response &&
        error.response.data &&
        error.response.data.error &&
        error.response.data.error.message
      ) {
        const errorMessage = error.response.data.error.message;
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
      } else {
        // toast.error("Network Error !");
      }
      console.error(error.response);
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

  const onSubmit = async (data) => {
    console.log("data",data)

    // Constructing the payload with all required fields
    let payload = {
      companyName: authUser.company,
      employeeType: data.employeeType,
      employeeId: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      emailId: data.emailId,
      designation: data.designation,
      dateOfHiring: data.dateOfHiring, // Format: yyyy-mm-dd
      dateOfBirth: data.dateOfBirth,   // Format: yyyy-mm-dd
      department: data.department,
      location: data.location,
      tempAddress: data.tempAddress,
      permanentAddress: data.permanentAddress,
      manager: data.manager,
      mobileNo: data.mobileNo,
      alternateNo: data.alternateNo,
      maritalStatus: data.maritalStatus,
      status: data.status,
      panNo: data.panNo,
      uanNo: data.uanNo,
      aadhaarId: data.aadhaarId,
      accountNo: data.accountNo,
      ifscCode: data.ifscCode,
      bankName: data.bankName,
      bankBranch: data.bankBranch,
      pfNo: data.pfNo, // Default value if empty
      
      // Constructing personnelEntity
      personnelEntity: {
          employeeEducation: data.employeeEducation?.map((edu) => ({
              educationLevel: edu.educationLevel || "",
              instituteName: edu.instituteName || "",
              boardOfStudy: edu.boardOfStudy || "",
              branch: edu.branch || "",
              year: edu.year || "",
              percentage: edu.percentage || ""
          })) || []
      }
  };

  // Check if `employeeExperience` has any valid entries
  const validExperience = data.employeeExperience?.filter(exp => 
      exp.companyName.trim() || 
      exp.positionOrTitle.trim() || 
      exp.startDate.trim() || 
      exp.endDate.trim()
  );

  // Only add `employeeExperience` if it contains valid values
  if (validExperience?.length > 0) {
      payload.personnelEntity.employeeExperience = validExperience;
  }

    try {
        if (location.state && location.state.id) {
            // Update existing employee
            const response = await EmployeePatchApiById(location.state.id, payload);
            console.log("Update successful", response.data);
            toast.success("Employee Updated Successfully");
        } else {
            // Create new employee
            const response = await EmployeePostApi(payload);
            console.log("Employee created", response.data);
            toast.success("Employee Created Successfully");
        }

        setTimeout(() => {
            navigate("/employeeView");
        }, 1000); // Adjust delay time if needed

    } catch (error) {
        console.error("Error submitting data:", error);
        toast.error("Error submitting employee details");
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
  id: `${emp.firstName || ""} ${emp.lastName || ""}`,
  name: `${emp.firstName || ""} ${emp.lastName || ""} (${emp.designationName})`.trim(),
}));

// Always include "CompanyAdmin" as an option
const dropdownOptions = [
  ...managerOptions,
  { id: "Company Admin", name: "Company Admin" }
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

  const fetchBankNames = async () => {
 try {
      const res = await BankNamesGetApi();
      setBank(res.data);
      console.log("bank",res.data);
    } catch (error) {
      // handleApiErrors(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
    fetchBankNames();
  }, []);

  useEffect(() => {
    if (location && location.state && location.state.id) {
      const fetchData = async () => {
        try {
          const response = await EmployeeGetApiById(location.state.id);          
          // Reset the entire form data
          reset(response.data.data);
          // Set status manually
          const status = response.data.data.status;
          setValue("status", status.toString());
          setLoading(true);
          // Conditionally show "Notice Period" option based on status
          if (status === "NoticePeriod") {
            setShowNoticePeriodOption(true);
          }
  
          // Set employeeEducation data
          if (response.data.data.personnelEntity?.employeeEducation?.length) {
            reset((prev) => ({
              ...prev,
              employeeEducation: response.data.data.personnelEntity.employeeEducation
            }));
          }
  
          // Set employeeExperience data
          if (response.data.data.personnelEntity?.employeeExperience?.length) {
            reset((prev) => ({
              ...prev,
              employeeExperience: response.data.data.personnelEntity.employeeExperience
            }));
          }
  
        } catch (error) {
          handleApiErrors(error);
        }
      };
  
      fetchData();
    }
  }, [location,location.state, reset, setValue]);

  const validateDates = (value, index) => {
    const startDate = getValues(`employeeExperience.${index}.startDate`);
    if (!startDate || !value) return true; // Allow empty values (if optional)
    return new Date(value) >= new Date(startDate) || "End Date cannot be before Start Date";
  };

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
         setValue(`employeeExperience.${index}.tenure`, `${fractionalYears.toFixed(2)} years`)

        } else {
        setValue(`employeeExperience.${index}.tenure`, "Invalid date range");
      }
    }
  };

  // Watch DOB & Hiring Date to validate them dynamically
const dob = watch("dateOfBirth");
const hiringDate = watch("dateOfHiring");

const validateCompanyName = (value) => {
  // Trim leading and trailing spaces before further validation
  const trimmedValue = value.trim();

  // Check for trailing spaces first
  if (/\s$/.test(value)) {
    return "Spaces e at the end are not allowed.";
  } else if (/^\s/.test(value)) {
    return "No Leading Space Allowed.";
  }

  // Ensure only alphabetic characters and spaces
  else if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
    return "Only Alphabetic Characters are Allowed.";
  }

  // Check for minimum and maximum word length
  else {
    const words = trimmedValue.split(" ");
    for (const word of words) {
      if (word.length < 1) {
        return "Minimum Length 1 Character Required."; // If any word is shorter than 1 character
      } else if (word.length > 100) {
        return "Max Length 100 Characters Required."; // If any word is longer than 100 characters
      }
    }
    // Check if there are multiple spaces between words
    if (/\s{2,}/.test(trimmedValue)) {
      return "No Multiple Spaces Between Words Allowed.";
    }

    // Check minimum character length after other validations
    if (trimmedValue.length < 3) {
      return "Minimum 3 Characters Required.";
    }
  }

  return true; // Return true if all conditions are satisfied
};

// Custom Validation Function
const validateDOB = (value) => {
  if (!value) return "Date of Birth is required";

  const dobDate = new Date(value);
  const minHiringDate = new Date(dobDate);
  minHiringDate.setFullYear(minHiringDate.getFullYear() + 16); // Add 16 years

  if (hiringDate && new Date(hiringDate) < minHiringDate) {
    return "Employee must be at least 16 years old at hiring.";
  }
  return true;
};

const validateHiringDate = (value) => {
  if (!value) return "Date of Hiring is required";

  const hiringDate = new Date(value);
  const dobDate = new Date(dob);

  if (dob && hiringDate < new Date(dobDate.setFullYear(dobDate.getFullYear() + 16))) {
    return "Hiring date must be at least 16 years after DOB.";
  }
  return true;
};

const handleClear = () => {
  reset(); // Reset form fields
  setStep(1); // Move to Step 1
};


  return (
    <LayOut>
      <div className=" row container d-flex justify-content-center align-items-center min-vh-100">
      <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Employee Registration</strong>{" "}
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item">
                  <a href="/employeeView">Employees</a>
                </li>
                <li className="breadcrumb-item active">Registration</li>
              </ol>
            </nav>
          </div>
        </div>
      <div className="card shadow-lg p-4 w-100">
        <div className="card-body">
        <h2 className="text-start text-dark">
          {isUpdating ? "Employee Data" : "Employee Registration"}
        </h2>
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
                <h3 className="mb-3">Step 1: Employee Details <span className='text-danger'>*</span></h3>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <label>Employee First Name</label>
                    <input type="text" className="form-control" name='firstName' onInput={toInputTitleCase}
                      {...register("firstName", { required: "First Name is required",
                        validate:validateFirstName
                       })}
                    />
                    <small className="text-danger">{errors.firstName?.message}</small>
                  </div>
                  <div className="col-md-6 mb-2">
                    <label>Employee Last Name</label>
                    <input type="text" className="form-control" name='lastName' onInput={toInputTitleCase}
                      {...register("lastName", { required: "Last Name is required",
                       validate:validateLastName
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
                     {...register("emailId", {
                      required: "Email is required",
                      validate:validateEmail
                    })}
                  />
                  <small className="text-danger">{errors.emailId?.message}</small>        
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
                    <small className="text-danger">{errors.manager?.message}</small>
                  </div>
                  <div className="col-md-6 mb-2 mt-2">
                    <label>Date of Hiring</label>
                    <input type="date" className="form-control"
                     {...register("dateOfHiring", {
                      required: "Date of Hiring is required",
                      validate:validateHiringDate
                    })}
                  />
                  <small className="text-danger">{errors.dateOfHiring?.message}</small>
                  </div>
                  <div className="col-md-6 mb-2 mt-2">
                    <label>Branch Location</label>
                    <input type="text" className="form-control" onInput={toInputAddressCase}
                     {...register("location", {
                      required: "Branch Location is required",
                      validate:validateLocation
                    })}
                  />
                  <small className="text-danger">{errors.location?.message}</small>
                  </div>
                  <div className="col-md-6 mb-2 mt-2">
                    <label>Status</label>
                    <select className="form-select" id='status' name='status'
                     {...register("status", { required: "Select Status" })}
                     >
                      <option value="">Select Status</option>
                      <option value='Active'>Active</option>
                      <option value='InActive'>In Active</option>
                      <option value='OnBoard'>OnBoard</option>
                      <option value='NoticePeriod'>Notice Period</option>
                      <option value='Relieved'>Relieved</option>
                    </select>
                    <small className="text-danger">{errors.status?.message}</small>
                  </div>

                </div>
              </div>
            )}
            {step === 2 && (
              <div>
              <h3 className="mb-3">Step 2: Personal Details<span className='text-danger'>*</span></h3>
              <h5>Personal Details</h5>
              <div className="row mb-3">
                <div className="col-md-4">
                  <label htmlFor="dob" className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" id="dob" 
                  {...register("dateOfBirth", {
                    required: "Date of Birth is required",
                    validate:validateDOB
                  })}
                />
                <small className="text-danger">{errors.dateOfBirth?.message}</small>
                </div>
                <div className="col-md-4">
                  <label htmlFor="mobileNumber" className="form-label">Mobile Number</label>
                  <input type="tel" className="form-control" id="mobileNumber"
                  {...register("mobileNo", {
                    required: "Mobile Number is required",
                   validate:validatePhoneNumber
                  })}
                />
              <small className="text-danger">{errors.mobileNo?.message}</small>
                </div>
                <div className="col-md-4">
                  <label htmlFor="alternateNumber" className="form-label">Alternate Number</label>
                  <input type="tel" className="form-control" 
                    {...register("alternateNo", {
                      required: "Alternate Number is required",
                     validate:validatePhoneNumber,
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
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                  </select>
                    <small className="text-danger">{errors.maritalStatus?.message}</small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="aadharNumber" className="form-label">Aadhar Number</label>
                  <input type="text" className="form-control" id="aadhaarId"
                    {...register("aadhaarId", {
                      required: "Aadhar Number is required",
                      validate:validateAadhar
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
                   validate:validatePAN
                  })}
                  />
                  <small className="text-danger">{errors.panNo?.message}</small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="uanNumber" className="form-label">UAN Number (Optional)</label>
                  <input type="text" className="form-control" id="uanNumber" 
                  {...register("uanNo", {
                    required: "UAN Number is required",
                    validate:validateUAN
                  })}
                  />
                  <small className="text-danger">{errors.uanNo?.message}</small>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="permanentAddress" className="form-label">Permanent Address</label>
                  <textarea type="text" className="form-control" onInput={toInputAddressCase}
                   {...register("permanentAddress", {
                    required: "Permanent Address is required",
                   validate:validateLocation
                  })}
                  />
                  <small className="text-danger">{errors.permanentAddress?.message}</small>
                </div>
                <div className="col-md-6">
                  <label htmlFor="tempAddress" className="form-label">Temporary Address</label>
                  <textarea type="text" className="form-control" onInput={toInputAddressCase}
                   {...register("tempAddress", {
                    required: "Temporary Address is required",
                  validate:validateLocation
                  })}
                  />
                  <small className="text-danger">{errors.tempAddress?.message}</small>
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
                <h3 className="mb-3">Step 3: Educational Details<span className='text-danger'>*</span></h3>
                {educationFields.map((edu, index) => (
                  <div key={edu.id} className="row mb-2">
                    <div className="col-md-4">
                      <label>Education Level</label>
                      <input type="text" className="form-control" onInput={toInputTitleCase}
                        {...register(`employeeEducation.${index}.educationLevel`, {
                          required: "Education Level is required",
                          pattern: { value: /^[A-Za-z0-9\s]+$/, message: "Only letters allowed" }
                        })}
                      />
                      <small className="text-danger">{errors.employeeEducation?.[index]?.educationLevel?.message}</small>
                    </div>

                    <div className="col-md-4">
                      <label>Name of Institution/University</label>
                      <input type="text" className="form-control" onInput={toInputTitleCase}
                        {...register(`employeeEducation.${index}.instituteName`, {
                          required: "Institution is required",
                          pattern: { value: /^[A-Za-z\s]+$/, message: "Only letters allowed" }
                        })}
                      />
                      <small className="text-danger">{errors.employeeEducation?.[index]?.instituteName?.message}</small>
                    </div>

                    <div className="col-md-4">
                      <label>Board of Study</label>
                      <input type="text" className="form-control" onInput={toInputTitleCase}
                        {...register(`employeeEducation.${index}.boardOfStudy`, {
                          required: "Board of Study is required",
                          pattern: { value: /^[A-Za-z\s]+$/, message: "Only letters allowed" }
                        })}
                      />
                      <small className="text-danger">{errors.employeeEducation?.[index]?.boardOfStudy?.message}</small>
                    </div>

                    <div className="col-md-4">
                      <label>Branch/Specialization</label>
                      <input type="text" className="form-control" onInput={toInputTitleCase}
                        {...register(`employeeEducation.${index}.branch`, {
                          required: "Branch is required",
                          pattern: { value: /^[A-Za-z\s]+$/, message: "Only letters allowed" }
                        })}
                      />
                      <small className="text-danger">{errors.employeeEducation?.[index]?.branch?.message}</small>
                    </div>

                    <div className="col-md-4">
                      <label>Year of Pass Out</label>
                      <input type="text" className="form-control"
                        {...register(`employeeEducation.${index}.year`, {
                          required: "Year is required",
                          pattern: { value: /^(19|20)\d{2}$/, message: "Enter a valid 4-digit year (1900-2099)" }
                        })}
                      />
                      <small className="text-danger">{errors.employeeEducation?.[index]?.year?.message}</small>
                    </div>

                    <div className="col-md-4">
                      <label>Percentage</label>
                      <input type="text" className="form-control"
                        {...register(`employeeEducation.${index}.percentage`, {
                          required: "Percentage is required",
                          pattern: { value: /^(100|[0-9]{1,2}(\.\d{1,2})?)$/, message: "Enter a valid percentage (0-100)" }
                        })}
                      />
                      <small className="text-danger">{errors.employeeEducation?.[index]?.percentage?.message}</small>
                    </div>

                    <div className="col-md-1">
                      <button type="button" className="btn btn-danger mt-4" onClick={() => removeEducation(index)}>Delete</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-primary mt-2" onClick={() => addEducation({ educationLevel: "", instituteName: "", boardOfStudy: "", branch: "", year: "", percentage: "" })}>
                  Add More
                </button>
              </div>
            )}
             {/* Step 4: Experience Details */}
            {step === 4 && (
                <div>
                  <h3 className="mb-3">Step 4: Experience Details(<span className='text-small'>Optional</span>)</h3>
                  {experienceFields.map((exp, index) => {
                    return (
                      <div key={exp.id} className="row mb-2">
                        <div className="col-md-3">
                          <label>Company Name</label>
                          <input type="text" className="form-control" onInput={toInputTitleCase}
                            {...register(`employeeExperience.${index}.companyName`, {
                              validate:validateCompanyName
                            })}
                          />
                          <small className="text-danger">{errors.employeeExperience?.[index]?.companyName?.message}</small>
                        </div>

                        <div className="col-md-3">
                          <label>Designation/Role</label>
                          <input type="text" className="form-control" onInput={toInputTitleCase}
                            {...register(`employeeExperience.${index}.positionOrTitle`, {
                              validate:validateCompanyName
                            })}
                          />
                          <small className="text-danger">{errors.employeeExperience?.[index]?.positionOrTitle?.message}</small>
                        </div>

                        <div className="col-md-2">
                          <label>Start Date</label>
                          <input type="date" className="form-control"
                            {...register(`employeeExperience.${index}.startDate`, {
                            })}
                            onChange={(e) => calculateTenure(0, e.target.value, getValues(`employeeExperience.0.endDate`))}
                            />
                            <small className="text-danger">{errors.employeeExperience?.[0]?.startDate?.message}</small>
                            </div>

                        <div className="col-md-2">
                          <label>End Date</label>
                          <input type="date" className="form-control"
                            {...register(`employeeExperience.${index}.endDate`, {
                              validate: (value) => validateDates(value, index), // Custom validation
                            })}
                            onChange={(e) => calculateTenure(0, getValues(`employeeExperience.0.startDate`), e.target.value)}
                            />
                            <small className="text-danger">{errors.employeeExperience?.[0]?.endDate?.message}</small>
                        </div>

                        <div className="col-md-2">
                          <label>Tenure</label>
                          <input type="text" className="form-control"
                            {...register(`employeeExperience.0.tenure`)}
                          readOnly />
                        </div>

                        <div className="col-md-1">
                          <button type="button" className="btn btn-danger mt-4" onClick={() => removeExperience(index)}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                  <button type="button" className="btn btn-primary mt-2" onClick={() => addExperience({ companyName: "", positionOrTitle: "", startDate: "", endDate: "", tenure: "" })}>
                    Add More
                  </button>
                </div>
            )}
            {step === 5 && (
              <div>
                <h3 className="mb-3">Step 5: Personal & Bank Details <span className='text-danger'>*</span></h3>
                <div className="row">
                 <div className="col-md-6">
                   <label>Bank Name</label>
                   <select className="form-control"  {...register("bankName", { required: "Bank Name is required" })}>
                     <option value="">Select Bank</option>
                     {bank.map((bank,index) => (
                    <option key={index} value={bank.bankName}>
                      {bank.bankName}
                    </option>
                  ))}
                   </select>
                   <small className="text-danger">{errors.bankName?.message}</small>
                 </div>
                 <div className="col-md-6">
                   <label>Account Number</label>
                   <input type="text" className="form-control" name='accountNo'
                    {...register("accountNo", {
                      required: "Account Number is required",
                      pattern: {
                        value: /^\d{6,18}$/,
                        message: "Enter a valid Account Number (6-18 digits only)",
                      },
                    })}
                  />
                  <small className="text-danger">{errors.accountNo?.message}</small>
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
                   <input type="text" className="form-control" onInput={toInputAddressCase}
                    {...register("bankBranch", {
                      required: "Branch Name is required",
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message: "Only letters and spaces allowed",
                      },
                    })}
                  />
                  <small className="text-danger">{errors.bankBranch?.message}</small>
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
                    <button type="button" className="btn btn-warning me-2" onClick={handleClear}>
                      Clear
                    </button>
                    {step < 5 ? (
                      <button type="button" className="btn btn-primary" onClick={onNext}>
                        Next
                      </button>
                    ) : (
                      <button type="submit" className="btn btn-success" onClick={(e) => e.stopPropagation()}>
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
