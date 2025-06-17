import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import Select from "react-select";
import { useAuth } from "../../Context/AuthContext";
import { CandidatePostApi } from "../../Utils/Axios";

const CandidateRegistration = () => {
    const navigate = useNavigate();
    const { authUser } = useAuth();
    const [errorMessage, setErrorMessage] = useState("");

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
    } = useForm({
        mode: "onChange",
        defaultValues: {
            mobileNo: "+91 " // Set default value with prefix
        }
    });

    const mobileValue = watch("mobileNo");

    useEffect(() => {
        // Ensure the prefix is always present
        if (!mobileValue?.startsWith("+91 ")) {
            setValue("mobileNo", "+91 ");
        }
    }, [mobileValue, setValue]);

    const handleMobileChange = (e) => {
        const value = e.target.value;

        // If user tries to delete the prefix, reset it
        if (value.length < 4) {
            setValue("mobileNo", "+91 ");
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
        setValue("mobileNo", formattedValue);
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

    const noTrailingSpaces = (value, enforceMinLength = true) => {
        if (value.endsWith(' ')) return "Spaces are not allowed at the end";
        if (enforceMinLength && value.length < 3) return "Minimum 3 characters required";
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

    const onSubmit = async (data) => {
        try {
            const payload = {
                companyName: authUser.company,
                candidateId: data.candidateId,
                firstName: data.firstname,
                lastName: data.lastname,
                emailId: data.email,
                dateOfHiring: data.dateOfHiring,
                mobileNo: `+91 ${data.mobileNo.replace("+91 ", "")}`,
                status: data.status.value
            };

            const response = await CandidatePostApi(payload);

            // Successful response
            if (response.status === 200 || response.status === 201) {
                setTimeout(() => {
                    toast.success("Candidate registered successfully!");
                    reset();
                    navigate("/candidatesView");
                }, 1000); // 1-second delay
                return;
            }

            // Handle API errors (status codes other than 200/201)
            let errorMsg = "Failed to register candidate";

            if (response.status === 409) {
                // Extract the backend error message
                const backendMessage = response.data?.error?.message;
                if (backendMessage) {
                    // Replace %s with the actual email
                    errorMsg = backendMessage.replace("%s", data.email);
                } else {
                    errorMsg = "This email is already registered";
                }
            } else if (response.data?.message) {
                errorMsg = response.data.message;
            }

            setErrorMessage(errorMsg);
            toast.error(errorMsg);

        } catch (error) {
            console.error('Registration Error:', error);

            let errorMsg = "Failed to register candidate";

            // Handle network errors or other exceptions
            if (error.request) {
                errorMsg = "No response received from server";
            } else if (error.message) {
                errorMsg = error.message;
            }

            setErrorMessage(errorMsg);
            toast.error(errorMsg);
        }
    };

    const handleClear = () => {
        reset();
        setValue("status", null);
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
                                                    validate: (value) => noTrailingSpaces(value, true), // enforces min length
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
                                                    validate: (value) => noTrailingSpaces(value, false), // enforces min length
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
                                                    validate: (value) => noTrailingSpaces(value, true), // enforces min length
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
                                                name="mobileNo"
                                                autoComplete="off"
                                                placeholder="+91 9876543210"
                                                value={mobileValue}
                                                onChange={handleMobileChange}
                                                onKeyDown={handleKeyDown}
                                                onBlur={() => {
                                                    // Ensure format is correct on blur
                                                    if (mobileValue && !mobileValue.startsWith("+91 ")) {
                                                        setValue("mobileNo", `+91 ${mobileValue.replace(/\D/g, '').slice(0, 10)}`);
                                                    }
                                                    trigger("mobileNo");
                                                }}
                                                {...register("mobileNo", {
                                                    validate: {
                                                        required: (value) => value?.length > 4 || "Mobile number is required",
                                                        validNumber: (value) => /^\+91 [6-9]\d{9}$/.test(value) || "Must be +91 followed by 10 digit number starting with 6-9"
                                                    }
                                                })}
                                            />
                                            {errors.mobileNo && (
                                                <p className="errorMsg">{errors.mobileNo.message}</p>
                                            )}
                                        </div>
                                        <div className="col-lg-1"></div>
                                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                                            <label className="form-label">
                                                Date of Registration <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="dateOfHiring"
                                                {...register("dateOfHiring", {
                                                    required: "Date of Hiring is required"
                                                })}
                                            />
                                            {errors.dateOfHiring && (
                                                <p className="errorMsg">{errors.dateOfHiring.message}</p>
                                            )}
                                        </div>
                                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                                            <label className="form-label">
                                                Status <span style={{ color: "red" }}>*</span>
                                            </label>
                                            <Controller
                                                name="status"
                                                control={control}
                                                rules={{ required: "status is required" }}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        options={statusOptions}
                                                        getOptionLabel={(e) => e.label}
                                                        getOptionValue={(e) => e.value}
                                                    />
                                                )}
                                            />
                                            {errors.status && (
                                                <p className="errorMsg">{errors.status.message || "Status is required"}</p>
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
                                {errorMessage && (
                                    <div className="alert alert-danger mt-3">
                                        {errorMessage}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayOut>
    );
};

export default CandidateRegistration;