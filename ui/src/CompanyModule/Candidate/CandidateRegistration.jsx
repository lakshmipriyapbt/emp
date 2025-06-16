import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import Select from "react-select";
import { useAuth } from "../../Context/AuthContext";

const CandidateRegistration = () => {
    const navigate = useNavigate();
    const { employee } = useAuth();
    const companyId = employee?.companyId;

    const {
        register,
        handleSubmit,
        reset,
        control,
        trigger,
        setValue,
        getValues,
        watch,
        formState: { errors },
    } = useForm({ mode: "onChange" });

    const [jobPositions] = useState([
        // Software Engineering / Development
        { value: "Software Engineer", label: "Software Engineer" },
        { value: "Frontend Developer", label: "Frontend Developer" },
        { value: "Backend Developer", label: "Backend Developer" },
        { value: "Full Stack Developer", label: "Full Stack Developer" },
        { value: "Mobile App Developer", label: "Mobile App Developer" },
        { value: "DevOps Engineer", label: "DevOps Engineer" },
        { value: "Embedded Systems Engineer", label: "Embedded Systems Engineer" },

        // UI/UX & Design
        { value: "UI Designer", label: "UI Designer" },
        { value: "UX Designer", label: "UX Designer" },
        { value: "Product Designer", label: "Product Designer" },
        { value: "Graphic Designer", label: "Graphic Designer" },

        // Product & Management
        { value: "Product Manager", label: "Product Manager" },
        { value: "Project Manager", label: "Project Manager" },
        { value: "Technical Program Manager", label: "Technical Program Manager" },
        { value: "Scrum Master", label: "Scrum Master" },

        // Quality Assurance
        { value: "QA Engineer", label: "QA Engineer" },
        { value: "Test Automation Engineer", label: "Test Automation Engineer" },
        { value: "Manual Tester", label: "Manual Tester" },

        // Data & Analytics
        { value: "Data Analyst", label: "Data Analyst" },
        { value: "Data Scientist", label: "Data Scientist" },
        { value: "Machine Learning Engineer", label: "Machine Learning Engineer" },
        { value: "Business Intelligence Analyst", label: "Business Intelligence Analyst" },

        // IT & Infrastructure
        { value: "System Administrator", label: "System Administrator" },
        { value: "Network Engineer", label: "Network Engineer" },
        { value: "IT Support Specialist", label: "IT Support Specialist" },
        { value: "Cloud Engineer", label: "Cloud Engineer" },
        { value: "Security Analyst", label: "Security Analyst" },

        // Others
        { value: "Technical Writer", label: "Technical Writer" },
        { value: "Database Administrator", label: "Database Administrator" },
        { value: "Solution Architect", label: "Solution Architect" },
        { value: "Business Analyst", label: "Business Analyst" }
    ]);

    const mobileValue = watch("mobile");
    const [mobile, setMobile] = useState("+91 ");

    useEffect(() => {
        // Ensure the prefix is always present
        if (!mobileValue?.startsWith("+91 ")) {
            setValue("mobile", "+91 ");
        }
    }, [mobileValue, setValue]);

    const handleMobileChange = (e) => {
        const value = e.target.value;

        // Prevent deletion of the prefix
        if (value.length < 4) {
            setValue("mobile", "+91 ");
            return;
        }

        // Only allow numbers after the prefix
        const newDigits = value.slice(4).replace(/\D/g, '');

        // Enforce first digit (after prefix) is 6-9
        if (newDigits.length > 0 && !/[6-9]/.test(newDigits[0])) {
            return;
        }

        // Limit to 10 digits after prefix
        const formattedValue = `+91 ${newDigits.slice(0, 10)}`;
        setValue("mobile", formattedValue);
    };

    const handleKeyDown = (e) => {
        // Prevent backspace/delete from removing the prefix
        if (
            (e.key === 'Backspace' || e.key === 'Delete') &&
            (e.target.selectionStart <= 4 || e.target.selectionEnd <= 4)
        ) {
            e.preventDefault();
        }
    };
    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'InActive' },
    ];

    const validateField = (value, type) => {
        switch (type) {
            case "name":
                return (
                    /^[a-zA-Z\s.,'-]+$/.test(value) ||
                    "Only letters, spaces, and basic punctuation allowed"
                );
            case "email":
                const emailRegex =
                    /^(?![0-9]+@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/i;
                if (/[A-Z]/.test(value)) return "Email must be lowercase";
                return emailRegex.test(value) || "Invalid email format";
            case "mobile":
                return /^[6-9][0-9]{9}$/.test(value) || "Must start with 6-9 and be 10 digits";
            case "pincode":
                return /^\d{6}$/.test(value) || "Must be 6 digits";
            case "address":
                return (
                    /^[a-zA-Z0-9\s!@#&()*/.,_+'"-]+$/.test(value) ||
                    "Invalid special characters"
                );
            default:
                return true;
        }
    };

    const noTrailingSpaces = (value) => {
        if (value.endsWith(' ')) return "Spaces are not allowed at the end";
        if (value.length < 3) return "Minimum 3 characters required";
        return true;
    };

    const preventInvalidInput = (e, type) => {
        const key = e.key;
        if (type === "alpha" && /[^a-zA-Z\s.,'-]/.test(key)) e.preventDefault();
        if (type === "alphanumeric" && /[^a-zA-Z0-9]/.test(key)) e.preventDefault();
        if (type === "numeric" && !/^[0-9]$/.test(key)) e.preventDefault();
        if (type === "whitespace" && key === " ") e.preventDefault();
        if (type === 'address' && !/[a-zA-Z0-9\s&,-\/]/.test(key)) e.preventDefault();
    };

    const handleInputChange = (e, fieldName) => {
        let value = e.target.value.trimStart().replace(/ {2,}/g, " ");
        if (fieldName !== "email") {
            value = value.replace(/\b\w/g, (char) => char.toUpperCase());
        }
        setValue(fieldName, value);
        trigger(fieldName);
    };

    const onSubmit = (data) => {
        console.log("Candidate Data:", data);
        toast.success("Candidate registered successfully!");
        reset();
        navigate("/candidates/view");
    };
    const handleClear = () => {
        reset();
        setValue("position", null);
        setValue("status",null);
    };

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3">
                            <strong>Candidate Registration</strong>
                        </h1>
                    </div>
                    <div className="col-auto">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to="/main" className="custom-link">Home</Link>
                                </li>
                                <li className="breadcrumb-item active">Candidate Registration</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title mb-0">Candidate Details</h5>
                                <div className="dropdown-divider" style={{ borderTopColor: "#d7d9dd" }} />
                            </div>

                            <div className="card-body">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="row">
                                        {/* Personal Information */}
                                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                                            <label className="form-label">
                                                First Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="firstname"
                                                autoComplete="off"
                                                placeholder="Enter candidate's first name"
                                                {...register("firstname", {
                                                    required: "First name is required",
                                                    validate: noTrailingSpaces,
                                                    maxLength: {
                                                        value: 100,
                                                        message: "Maximum 100 characters allowed"
                                                    }
                                                })}
                                                onChange={(e) => handleInputChange(e, "firstname")}
                                                onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                                            />
                                            {errors.firstname && (
                                                <p className="errorMsg">{errors.firstname.message}</p>
                                            )}
                                        </div>
                                        <div className="col-lg-1"></div>
                                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                                            <label className="form-label">
                                                Last Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="lastname"
                                                autoComplete="off"
                                                placeholder="Enter candidate's last name"
                                                {...register("lastname", {
                                                    required: "Last name is required",
                                                    validate: noTrailingSpaces,
                                                    maxLength: {
                                                        value: 100,
                                                        message: "Maximum 100 characters allowed"
                                                    }
                                                })}
                                                onChange={(e) => handleInputChange(e, "lastname")}
                                                onKeyPress={(e) => preventInvalidInput(e, "alpha")}
                                            />
                                            {errors.lastname && (
                                                <p className="errorMsg">{errors.lastname.message}</p>
                                            )}
                                        </div>
                                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                                            <label className="form-label">
                                                Candidate ID <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="candidateId"
                                                autoComplete="off"
                                                placeholder="Enter candidateId"
                                                {...register("candidateId", {
                                                    required: "candidateId is required",
                                                    validate: noTrailingSpaces,
                                                    maxLength: {
                                                        value: 100,
                                                        message: "Maximum 100 characters allowed"
                                                    }
                                                })}
                                                onChange={(e) => handleInputChange(e, "candidateId")}
                                                onKeyPress={(e) => preventInvalidInput(e, "alphanumeric")}
                                            />
                                            {errors.candidateId && (
                                                <p className="errorMsg">{errors.candidateId.message}</p>
                                            )}
                                        </div>
                                        <div className="col-lg-1"></div>
                                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                                            <label className="form-label">
                                                Email <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                autoComplete="off"
                                                placeholder="Enter email address"
                                                {...register("email", {
                                                    required: "Email is required",
                                                    validate: (value) => validateField(value, "email"),
                                                    maxLength: {
                                                        value: 100,
                                                        message: "Maximum 100 characters allowed"
                                                    }
                                                })}
                                                onChange={(e) => handleInputChange(e, "email")}
                                                onKeyPress={(e) => preventInvalidInput(e, "whitespace")}
                                            />
                                            {errors.email && (
                                                <p className="errorMsg">{errors.email.message}</p>
                                            )}
                                        </div>
                                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                                            <label className="form-label">
                                                Mobile Number <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="mobile"
                                                autoComplete="off"
                                                placeholder="+91 9876543210"
                                                {...register("mobile", {
                                                    validate: {
                                                        required: (value) => value.length > 4 || "Mobile number is required",
                                                        validNumber: (value) => /^\+91 [6-9]\d{9}$/.test(value) || "First digit must be 6-9 followed by 9 digits",
                                                    },
                                                })}
                                                value={mobileValue}
                                                onChange={handleMobileChange}
                                                onKeyDown={handleKeyDown}
                                                onBlur={() => trigger("mobile")}
                                            />
                                            {errors.mobile && (
                                                <p className="errorMsg">{errors.mobile.message}</p>
                                            )}
                                        </div>
                                        <div className="col-lg-1"></div>
                                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                                            <label className="form-label">
                                                Position Applied For <span className="text-danger">*</span>
                                            </label>
                                            <Controller
                                                name="position"
                                                control={control}
                                                rules={{ required: "Position is required" }}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        classNamePrefix="react-select"
                                                        options={jobPositions}
                                                        placeholder="Select position"
                                                    />
                                                )}
                                            />
                                            {errors.position && (
                                                <p className="errorMsg">{errors.position.message}</p>
                                            )}
                                        </div>
                                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                                            <label className="form-label">
                                                Status <span style={{ color: "red" }}>*</span>
                                            </label>
                                            <Controller
                                                name="status"  // The name you want for the field
                                                control={control}
                                                 rules={{ required: "status is required" }}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        options={statusOptions}  // Dropdown options for Active and Inactive
                                                        getOptionLabel={(e) => e.label}  // What to display in the dropdown
                                                        getOptionValue={(e) => e.value}  // Value submitted with the form
                                                    />
                                                )}
                                            />
                                            {errors.status && (
                                                <p className="errorMsg">{errors.status.message || "Status is required"}</p>
                                            )}
                                        </div>
                                        <div className="col-lg-1"></div>
                                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                                            <label className="form-label">
                                                Address <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className='form-control'
                                                name="address"
                                                autoComplete="off"
                                                rows={4}
                                                placeholder="Enter full address"
                                                {...register("address", {
                                                    required: "Address is required",
                                                    validate: noTrailingSpaces,
                                                    maxLength: {
                                                        value: 250,
                                                        message: "Maximum 250 characters allowed"
                                                    }
                                                })}
                                                onChange={(e) => handleInputChange(e, "address")}
                                                onKeyPress={(e) => preventInvalidInput(e, 'address')}
                                            />
                                            {errors.address && (
                                                <p className="errorMsg">{errors.address.message}</p>
                                            )}
                                        </div>

                                        {/* Form Actions */}
                                        <div className="col-12 mt-4 d-flex justify-content-end">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary me-2"
                                                onClick={handleClear}
                                            >
                                                Clear
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                            >
                                                Register Candidate
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

export default CandidateRegistration;