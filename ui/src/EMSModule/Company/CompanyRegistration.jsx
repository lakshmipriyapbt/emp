import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import LayOut from "../../LayOut/LayOut";
import {
  CompanyRegistrationApi,
  companyUpdateByIdApi,
  companyViewByIdApi,
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeSlash } from "react-bootstrap-icons";

const CompanyRegistration = () => {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ mode: 'onChange' });
  const [postImage, setPostImage] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [passwordShown, setPasswordShown] = useState("");
  const [editMode, setEditMode] = useState(false); // State to track edit mode
  const [errorMessage, setErrorMessage] = useState('');
  const watchRegistrationNumber = watch('cinNo', '');

  const location = useLocation();
  const navigate = useNavigate();

  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };
  const handlePasswordChange = (e) => {
    setPasswordShown(e.target.value);
  };
  const handleEmailChange = (e) => {
    const value = e.target.value;
    if (value.trim() !== "") {
      return;
    }
    if (e.keyCode === 32) {
      e.preventDefault();
    }
  };

  const handleCompanyTypeChange = (e) => {
    setCompanyType(e.target.value);
  };

  const onChangePicture = (e) => {
    setPostImage(URL.createObjectURL(e.target.files[0]));
  };

  const onSubmit = async (data) => {
    try {
        const updateData = {
            password: data.password,
            companyAddress: data.companyAddress,
            mobileNo: data.mobileNo,
            alternateNo: data.alternateNo,
            name: data.name,
            personalMailId: data.personalMailId,
            personalMobileNo: data.personalMobileNo,
            address: data.address,
            companyType: data.companyType,
        };

        // Conditionally add CIN number or Company Registration Number
        if (data.companyType === "Private Limited") {
            updateData.cinNumber = data.cinNumber;
        } else if (data.companyType === "Firm") {
            updateData.companyRegistrationNumber = data.companyRegistrationNumber;
        }

        if (location.state && location.state.id) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await companyUpdateByIdApi(location.state.id, updateData);
            toast.success("Company Updated Successfully");
        } else {
            await CompanyRegistrationApi(data);
            toast.success("Company Created Successfully");
        }

        navigate("/companyView");
        reset();
    } catch (error) {
      if (error.response) {
          const { status, data } = error.response;
          console.error('Update error status:', status);
          console.error('Update error data:', data);
  
          if (status === 409) {
              toast.error('Conflict error: Check for duplicate entries or unique constraints.');
          } else {
              const { message, data: duplicateData } = data;
              const errorMessage = `
                  ${message}
                  Issues:
                  ${Object.entries(duplicateData || {}).map(([key, value]) => `${key}: ${value || 'N/A'}`).join('\n')}
              `.trim();
              toast.error(errorMessage);
          }
      } else {
          console.error('An unexpected error occurred:', error);
          toast.error('An unexpected error occurred. Please try again.');
      }
  }
  
};

  useEffect(() => {
    if (location && location.state && location.state.id) {
      const fetchData = async () => {
        try {
          const response = await companyViewByIdApi(location.state.id);
          console.log(response.data);
          reset(response.data);
          setCompanyType(response.data.companyType);
          setEditMode(true);
        } catch (error) {
          handleApiErrors(error);
        }
      };

      fetchData();
    }
  }, [location.state]);


  const handleApiErrors = (error) => {
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      // toast.error("Network Error !");
    }
    console.error(error.response);
  };

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


  const toInputLowerCase = (e) => {
    const input = e.target;
    let value = input.value;

    // Remove all spaces
    value = value.replace(/\s+/g, '');

    // Convert the entire string to lowercase
    value = value.toLowerCase();

    // Update input value
    input.value = value;
  };


  const toInputSpaceCase = (e) => {
    let inputValue = e.target.value;
    let newValue = "";

    // Remove spaces from the beginning of inputValue
    inputValue = inputValue.trimStart(); // Keep spaces only after the initial non-space character

    // Track if we've encountered any non-space character yet
    let encounteredNonSpace = false;

    for (let i = 0; i < inputValue.length; i++) {
      const char = inputValue.charAt(i);

      // Allow any alphabetic characters (both lowercase and uppercase) and numbers
      // Allow spaces only after encountering non-space characters
      if (char.match(/[a-zA-Z0-9]/) || (encounteredNonSpace && char === " ")) {
        if (char !== " ") {
          encounteredNonSpace = true;
        }
        newValue += char;
      }
    }

    // Update the input value
    e.target.value = newValue;
  };


  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const validateREGISTER = (value) => {
    const spaceError = "Spaces are not allowed in the Register Number.";
    const patternError = "Invalid Register Number format";

    if (/\s/.test(value)) {
      return spaceError; // Return space error if spaces are found
    }

    // Check the pattern for the CIN Number
    if (!/^([LU]{1})([0-9]{5})([A-Z]{2})([0-9]{4})([A-Z]{3})([0-9]{6})$/.test(value)) {
      return patternError; // Return pattern error if it doesn't match
    }

    return true; // Return true if all checks pass
  };

  const validateCIN = (value) => {
    const spaceError = "Spaces are not allowed in the CIN Number.";
    const patternError = "Invalid CIN Number format";

    if (/\s/.test(value)) {
      return spaceError; // Return space error if spaces are found
    }

    // Check the pattern for the CIN Number
    if (!/^([LU]{1})([0-9]{5})([A-Z]{2})([0-9]{4})([A-Z]{3})([0-9]{6})$/.test(value)) {
      return patternError; // Return pattern error if it doesn't match
    }

    return true; // Return true if all checks pass
  };
  const validateGST = (value) => {
    const spaceError = "Spaces are not allowed in the GST Number.";
    const patternError = "Invalid GST Number format";

    if (/\s/.test(value)) {
      return spaceError; // Return space error if spaces are found
    }

    // Check the pattern for the CIN Number
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9]{1}Z[0-9A-Z]{1}$/.test(value)) {
      return patternError; // Return pattern error if it doesn't match
    }

    return true; // Return true if all checks pass
  };
  const validatePAN = (value) => {
    const spaceError = "Spaces are not allowed in the PAN Number.";
    const patternError = "Invalid PAN Number format";

    if (/\s/.test(value)) {
      return spaceError; // Return space error if spaces are found
    }

    // Check the pattern for the CIN Number
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
      return patternError; // Return pattern error if it doesn't match
    }

    return true; // Return true if all checks pass
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    setPostImage(base64);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Registration</strong>{" "}
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Registration</li>
              </ol>
            </nav>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header ">
                  <div className="d-flex justify-content-start align-items-start">
                    <h5 className="card-title me-2">Company Type</h5>
                    <span className="text-danger">
                      {errors.companyType && (
                        <p className="mb-0">{errors.companyType.message}</p>
                      )}
                    </span>
                  </div>
                  <hr
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd", width: "100%" }}
                  />
                </div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <div>
                        <label>
                          <input
                            type="radio"
                            name="companyType"
                            value="Private Limited"
                            style={{ marginRight: "10px" }}
                            {...register("companyType", {
                              required: !editMode ? "Please Select Your Company Type" : false,
                            })}
                            disabled={editMode}
                            onChange={handleCompanyTypeChange}
                          />
                          Private Limited
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="ml-3">
                        <input
                          type="radio"
                          name="companyType"
                          value="Firm"
                          style={{ marginRight: "10px" }}
                          {...register("companyType", {
                            required: !editMode ? "Please Select Your Company Type" : false,
                          })}
                          disabled={editMode}
                          onChange={handleCompanyTypeChange}
                        />
                        Firm
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Company Details</h5>
                  <div
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd" }}
                  />
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Company Name <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Company Name"
                        onInput={toInputTitleCase}
                        autoComplete="off"
                        {...register("companyName", {
                          required: "Company Name is Required",
                          pattern: {
                            value: /^[a-zA-Z\s,.'\-/]*$/,
                            message: "Field accepts only alphabets and special characters:( , ' -  . /)",
                          },
                          minLength: {
                            value: 2,
                            message: "minimum 2 characters Required",
                          },
                          maxLength: {
                            value: 100,
                            message: "maximum 100 characters allowed",
                          },
                        })}
                        disabled={editMode}
                      />
                      {errors.companyName && (
                        <p className="errorMsg">{errors.companyName.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Service Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        onInput={toInputLowerCase}
                        placeholder="Enter Service Name"
                        autoComplete="off"
                        {...register("shortName", {
                          required: "Service Name is Required",
                          pattern: {
                            value: /^[a-z]+$/,
                            message:
                              "No Spaces allowed. These fields only accept small cases only.",
                          },
                          minLength: {
                            value: 2,
                            message: "minimum 2 characters Required",

                          },
                          maxLength: {
                            value: 30,
                            message: "minimum 2 and maximum 30 characters allowed",
                          },
                        })}
                        disabled={editMode}
                      />
                      {errors.shortName && (
                        <p className="errorMsg">{errors.shortName.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Company Email Id <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter Company Email Id"
                        autoComplete="off"
                        onInput={toInputLowerCase}
                        onKeyDown={handleEmailChange}
                        {...register("emailId", {
                          required: "Company Email Id is Required",
                          pattern: {
                            value: /^(?![0-9]+@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                            message: "Invalid email format",
                          },
                        })}
                        disabled={editMode}
                      />
                      {errors.emailId && (
                        <p className="errorMsg">{errors.emailId.message}</p>
                      )}
                    </div>
                    {editMode ? (
                      <>
                        <div className="col-lg-1"></div>
                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                          <label className="form-label">
                            Contact Number <span style={{ color: "red" }}>*</span>
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="Enter Contact Number"
                            autoComplete="off"
                            maxLength={10}
                            onKeyDown={handleEmailChange}
                            onInput={toInputSpaceCase}
                            {...register("mobileNo", {
                              required: "Contact Number is Required",
                              pattern: {
                                value: /^(?!0000000000)[0-9]{10}$/,
                                message:
                                "Contact Number should be exactly 10 digits long, should contain only numbers, and cannot be all zeros.",
                              },
                              validate: {
                                notRepeatingDigits: value => {
                                  const isRepeating = /^(\d)\1{9}$/.test(value); // Check for repeated digits
                                  return !isRepeating || "Contact Number cannot consist of the same digit repeated.";
                                }
                              }

                            })}
                          />
                          {errors.mobileNo && (
                            <p className="errorMsg">{errors.mobileNo.message}</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-lg-1"></div>
                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                          <label className="form-label">
                            Password <span style={{ color: "red" }}>*</span>
                          </label>
                          <div className="col-sm-12 input-group">
                            <input
                              className="form-control"
                              placeholder="Enter Password"
                              onChange={handlePasswordChange}
                              //onInput={toInputTitleCase}
                              autoComplete="off"
                              onKeyDown={handleEmailChange}
                              type={passwordShown ? "text" : "password"}
                              {...register("password", {
                                required: "Password is Required",
                                validate: validatePassword,
                                minLength: {
                                  value: 6,
                                  message: "Minimum 6 characters Required",
                                },
                                maxLength: {
                                  value: 16,
                                  message: "Minimum 6 & maximum 16 characters allowed",
                                },
                              })}
                            />
                            <i onClick={togglePasswordVisiblity} style={{ margin: "5px" }}>
                              {passwordShown ? <Eye size={17} /> : <EyeSlash size={17} />}
                            </i>
                          </div>
                          {errors.password && (
                            <p className="errorMsg">{errors.password.message}</p>
                          )}
                        </div>
                      </>
                    )}
                    {!editMode && (
                      <>
                        <div className="col-12 col-md-6 col-lg-5 mb-3">
                          <label className="form-label">
                            Contact Number <span style={{ color: "red" }}>*</span>
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
                              required: "Contact Number is Required",
                              pattern: {
                                value: /^(?!0000000000)[0-9]{10}$/,
                                message:
                                "Contact Number should be exactly 10 digits long, should contain only numbers, and cannot be all zeros.",
                              },
                              validate: {
                                notRepeatingDigits: value => {
                                  const isRepeating = /^(\d)\1{9}$/.test(value); // Check for repeated digits
                                  return !isRepeating || "Contact Number cannot consist of the same digit repeated.";
                                }
                              }
                            })}
                          />
                          {errors.mobileNo && (
                            <p className="errorMsg">{errors.mobileNo.message}</p>
                          )}
                        </div>

                        <div className="col-lg-1"></div>
                      </>
                    )}
                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                      <label className="form-label">
                        Alternate Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Alternate Number"
                        autoComplete="off"
                        maxLength={10}
                        onInput={toInputSpaceCase}
                        onKeyDown={handleEmailChange}
                        {...register("alternateNo", {
                          pattern: {
                            value: /^(?!0000000000)[0-9]{10}$/,
                            message:
                            "Alternate Number should be exactly 10 digits long, should contain only numbers, and cannot be all zeros.",
                          },
                          validate: {
                            notRepeatingDigits: value => {
                              const isRepeating = /^(\d)\1{9}$/.test(value); // Check for repeated digits
                              return !isRepeating || "Alternate Number cannot consist of the same digit repeated.";
                            }
                          }
                        })}
                      />
                      {errors.alternateNo && (
                        <p className="errorMsg">{errors.alternateNo.message}</p>
                      )}
                    </div>
                    {editMode && (
                      <div className="col-lg-1"></div>

                    )}
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Company Address <span style={{ color: "red" }}>*</span>
                      </label>
                      <textarea
                        type="text"
                        className="form-control"
                        placeholder="Enter Company Address"
                        onKeyDown={handleEmailChange}
                        onInput={toInputTitleCase}
                        autoComplete="off"
                        {...register("companyAddress", {
                          required: "Company Address is Required",
                          pattern: {
                            value: /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,&*.()^\-/]*$/,
                            message:
                              "Please enter valid Address",
                          },
                          minLength: {
                            value: 3,
                            message: "minimum 3 characters allowed",
                          },
                          maxLength: {
                            value: 200,
                            message: "maximum 200 characters allowed",
                          },
                        })}
                      />
                      {errors.companyAddress && (
                        <p className="errorMsg">
                          {errors.companyAddress.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Company Registration Details</h5>
                  <div
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd" }}
                  />
                </div>
                <div className="card-body">
                  <div className="row">
                  {companyType === "Private Limited" && (
                    <>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Company CIN Number<span style={{ color: "red" }}>*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Company CIN Number"
                        onKeyDown={handleEmailChange}
                        onInput={toInputSpaceCase}
                        autoComplete="off"
                        maxLength={21}
                        {...register("cinNo", {
                          required: "Company CIN Number is Required",
                          maxLength: {
                            value: 21,
                            message: "CIN Number must not exceed 21 characters",
                          },

                          validate: validateCIN,

                        })}
                        disabled={editMode}
                      />
                      {errors.cinNo && (
                        <p className="errorMsg">{errors.cinNo.message}</p>
                      )}

                    </div>

                     <div className="col-lg-1"></div>
                     </>
                  )}
                   
                    {companyType === "Firm" && (
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">
                          Company Registration Number <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Company Registration Number"
                          autoComplete="off"
                          maxLength={21}
                          {...register("companyRegNo", {
                            required: "Company Registration Number is Required",
                            maxLength: {
                              value: 21,
                              message: "Registration Number must not exceed 21 characters",
                            },
                            validate: validateREGISTER
                          })}
                          disabled={editMode}
                        />
                        {errors.companyRegNo && <p className="errorMsg">{errors.companyRegNo.message}</p>}
                      </div>
                    )}

                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Company GST Number{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Company GST Number"
                        autoComplete="off"
                        onInput={toInputSpaceCase}
                        onKeyDown={handleEmailChange}
                        maxLength={15}
                        {...register("gstNo", {
                          required: "Company GST Number is Required",
                          maxLength: {
                            value: 15,
                            message: "GST Number must not exceed 15 characters",
                          },
                          validate: validateGST
                        })}
                        disabled={editMode}
                      />
                      {errors.gstNo && <p className="errorMsg">{errors.gstNo.message}</p>}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Company PAN Number{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        onInput={toInputSpaceCase}
                        placeholder="Enter Company PAN Number"
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        maxLength={10}
                        {...register("panNo", {
                          required: "Company PAN Number is Required",
                          maxLength: {
                            value: 10,
                            message: "PAN Number must not exceed 10 characters",
                          },
                          validate: validatePAN

                        })}
                        disabled={editMode}
                      />
                      {errors.panNo && (
                        <p className="errorMsg">{errors.panNo.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title">Authorized Details</h5>
                  <div
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd" }}
                  />
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Name"
                        onKeyDown={handleEmailChange}
                        onInput={toInputTitleCase}

                        autoComplete="off"
                        {...register("name", {
                          required: "Name is Required",
                          minLength: {
                            value: 3,
                            message: "Minimun 3 characters Required",
                          },
                          maxLength: {
                            value: 100,
                            message: "Name must not exceed 100 characters",
                          },
                          pattern: {
                            value: /^[a-zA-Z\s]*$/,
                            message: "Name should contain only alphabets",
                          },
                        })}
                      />
                      {errors.name && (
                        <p className="errorMsg">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Personal Email Id <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter Personal Email Id"
                        autoComplete="off"
                        onInput={toInputLowerCase}
                        onKeyDown={handleEmailChange}
                        {...register("personalMailId", {
                          required: "Personal Email Id is Required",
                          pattern: {
                            value: /^(?![0-9]+@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                            message: "Invalid Email Format ",
                          },
                        })}
                      />
                      {errors.personalMailId && (
                        <p className="errorMsg">
                          {errors.personalMailId.message}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Personal Mobile Number{" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Personal Mobile Number"
                        autoComplete="off"
                        onKeyDown={handleEmailChange}
                        maxLength={10}
                        onInput={toInputSpaceCase}
                        {...register("personalMobileNo", {
                          required: "Personal Mobile Number is Required",
                          pattern: {
                            value: /^(?!0000000000)[0-9]{10}$/,
                            message:

                              "Mobile Number should contain only 10 numbers",
                          },
                          validate: {
                            notRepeatingDigits: value => {
                              const isRepeating = /^(\d)\1{9}$/.test(value); // Check for repeated digits
                              return !isRepeating || "Personal Mobile Number cannot consist of the same Digit repeated.";
                            }
                          }
                        })}
                      />
                      {errors.personalMobileNo && (
                        <p className="errorMsg">
                          {errors.personalMobileNo.message}
                        </p>
                      )}
                    </div>

                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Address <span style={{ color: "red" }}>*</span>
                      </label>
                      <textarea
                        type="text"
                        className="form-control"
                        placeholder="Enter Address"
                        autoComplete="off"
                        onInput={toInputTitleCase}
                        onKeyDown={handleEmailChange}
                        maxLength={200}
                        {...register("address", {
                          required: "Address is Required",
                          maxLength: {
                            value: 200,
                            message: "Name must not exceed 200 characters",
                          },
                          minLength: {
                            value: 3,
                            message: "Mimium 3 characters Required",
                          },
                          pattern: {
                            value: /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,&*.()^\-/]*$/,
                            message: "Please enter valid Address",
                          },
                        })}
                      />
                      {errors.address && (
                        <p className="errorMsg">{errors.address.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-1"></div>
          {errorMessage && (
            <div className="alert alert-info mt-4 text-center">
              {errorMessage}
            </div>
          )}
          <div className="col-12 d-flex justify-content-end mt-5"
            style={{ background: "none" }}
          >
            <button type="submit" className="btn btn-primary btn-lg" style={{ marginRight: "65px" }}>
              {editMode ? 'Update Company' : 'Submit'}
            </button>
          </div>
        </form>
      </div >
    </LayOut >
  );
};

export default CompanyRegistration;