import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import LayOut from "./LayOut";
import { CompanyImagePatchApi, CompanyStampPatchApi, companyUpdateByIdApi } from "../Utils/Axios";
import { useAuth } from "../Context/AuthContext";
import { validateLocation } from "../Utils/Validate";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Profile() {
  const {company, employee } = useAuth();
  const {
    register,
    handleSubmit,
    reset,getValues,setValue,
    formState: { errors },
  } = useForm({
     mode: "onChange",
     defaultValues:company
   });

   const [logoPreview, setLogoPreview] = useState(company?.imageFile || "");
   const [stampPreview, setStampPreview] = useState(company?.stampImage || "");
  const [logoMessage, setLogoMessage] = useState("");
  const [stampMessage, setStampMessage] = useState("");
  const [companyField, setCompanyField] = useState(""); // CIN or Registration No.
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [loadingStamp, setLoadingStamp] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(null);
  const navigate=useNavigate()
  let companyId = employee?.companyId;

 // Set default values and determine field type
 useEffect(() => {
  if (company) {
    Object.keys(company).forEach((key) => setValue(key, company[key]));

    // Determine whether to show CIN or Registration Number
    if (company.cinNo) {
      setCompanyField("cinNo");
    } else if (company.regNo) {
      setCompanyField("regNo");
    }
  }
}, [company, setValue]);

  // Update previews when company data changes
  useEffect(() => {
    if (company) {
      setLogoPreview(company.imageFile);
      setStampPreview(company.stampImage);
    }
  }, [company]);

  // Handle file change (Independent)
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected Logo File:", file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleStampChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected Stamp File:", file);
      setStampPreview(URL.createObjectURL(file));
    }
  };

  // Upload Logo (Independent)
  const uploadLogo = async (data) => {
    setLoadingLogo(true);
    setLogoMessage("");

    try {
      if (data.logo?.[0]) {
        console.log("Uploading Logo Payload:", data.logo[0]); // Log payload
        const formData = new FormData();
        formData.append("file", data.logo[0]);
        await CompanyImagePatchApi(companyId, formData);
        setLogoMessage("Logo uploaded successfully!");
        reset();
        setLogoPreview(null);
        window.location.reload();

      }
    } catch (error) {
      setLogoMessage("Failed to upload logo.");
    } finally {
      setLoadingLogo(false);
    }
  };

    // Upload Stamp (Fixed)
    const uploadStamp = async () => {
      setLoadingStamp(true);
      setStampMessage("");
  
      try {
        if (!companyId) {
          console.error("companyId is missing!");
          return;
        }
  
        // Get the file from react-hook-form
        const stampFile = getValues("stamp")[0];
  
        if (!stampFile) {
          console.error("No file selected!");
          setStampMessage("Please select a file before uploading.");
          return;
        }
  
        console.log("Uploading Stamp Payload:", stampFile);
  
        const formData = new FormData();
        formData.append("stamp", stampFile); // Ensure correct key
  
        // Debugging - Log FormData
        for (const pair of formData.entries()) {
          console.log(`${pair[0]}:`, pair[1]);
        }
        await CompanyStampPatchApi(companyId, formData);
        setStampMessage("Stamp uploaded successfully!");
        reset();
        setStampPreview(null);
      } catch (error) {
        setStampMessage("Failed to upload stamp.");
        console.error("Upload error:", error);
      } finally {
        setLoadingStamp(false);
      }
    };

      const handleDetailsSubmit = async (data) => {
        if (!company.id) return;
        const updateData = {
          companyAddress: data.companyAddress,
          mobileNo: data.mobileNo,
          alternateNo: data.alternateNo,
          name: data.name,
          personalMailId: data.personalMailId,
          personalMobileNo: data.personalMobileNo,
          address: data.address,
        };
        try {
          // Attempt to update company details
          await companyUpdateByIdApi(company.id, updateData);
          // Clear any previous error message
          setErrorMessage("");
          setError(null);
          // If the update is successful, show success message
          setSuccessMessage("Profile Updated Successfully.");
          toast.success("Company Details Updated Successfully");
          // Redirect to main page
          navigate("/main");
        } catch (err) {
          // Log the error to the console
          console.error("Details update error:", err);
          // Clear any previous success message
          setSuccessMessage("");
          // Set the error message and display error notification
          setErrorMessage("Failed To Update Profile Details.");
          setError(err);
          const errorMessage = err?.response?.data?.message || "An error occurred";
          // Show error notification with the error message from the API
          toast.error(errorMessage);
        }
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
  
    function handlePhoneNumberChange(event) {
      let value = event.target.value;
      // Ensure only one space is allowed after +91
      if (value.startsWith("+91 ") && value.charAt(3) !== " ") {
        value = "+91 " + value.slice(3); // Ensure one space after +91
      }
      // Update the value in the input
      event.target.value = value;
    }
  
    // Function to handle keydown for specific actions (e.g., prevent multiple spaces)
    function handlePhoneNumberKeyDown(event) {
      let value = event.target.value;
      // Prevent backspace if the cursor is before the "+91 "
      if (
        event.key === "Backspace" &&
        value.startsWith("+91 ") &&
        event.target.selectionStart <= 4
      ) {
        event.preventDefault(); // Prevent the backspace if it's before the "+91 "
      }
      // Prevent multiple spaces after +91
      if (event.key === " " && value.charAt(3) === " ") {
        event.preventDefault();
      }
    }
  
    const toInputEmailCase = (e) => {
      const input = e.target;
      let value = input.value;
  
      // Remove all spaces from the input
      value = value.replace(/\s+/g, "");
  
      // If the first character is not lowercase, make it lowercase
      if (value.length > 0 && value[0] !== value[0].toLowerCase()) {
        value = value.charAt(0).toLowerCase() + value.slice(1);
      }
  
      // Update the input value
      input.value = value;
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
  

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <h1 className="h3 mb-3">
          <strong>Profile</strong>
        </h1>
        <div className="row">
          <div className="col-12">
            <h2 className="text-center">Upload Company Logo & Stamp</h2>
            <div className="row">
              {/* LOGO Upload (Independent) */}
              <div className="col-md-6 mb-4">
                <form onSubmit={handleSubmit(uploadLogo)} className="card p-3 shadow-sm">
                  <label className="form-label fw-bold">Upload Logo</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    {...register("logo")}
                    onChange={handleLogoChange}
                  />
                  {logoPreview && (
                    <img
                      src={logoPreview||"Logo Stamp"}
                      alt="Logo Preview"
                      className="img-fluid mt-2 rounded shadow"
                      style={{ maxHeight: "150px" }}
                    />
                  )}
                  <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loadingLogo}>
                    {loadingLogo ? "Uploading..." : "Upload Logo"}
                  </button>
                  {logoMessage && <div className="mt-2 alert alert-warning text-center">{logoMessage}</div>}
                </form>
              </div>

              {/* STAMP Upload (Independent) */}
              <div className="col-md-6 mb-4">
                <form onSubmit={handleSubmit(uploadStamp)} className="card p-3 shadow-sm">
                  <label className="form-label fw-bold">Upload Stamp</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    {...register("stamp")}
                    onChange={handleStampChange}
                  />
                  {stampPreview && (
                    <img
                      src={stampPreview}
                      alt="Stamp Preview"
                      className="img-fluid mt-2 rounded shadow"
                      style={{ maxHeight: "150px" }}
                    />
                  )}
                  <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loadingStamp}>
                    {loadingStamp ? "Uploading..." : "Upload Stamp"}
                  </button>
                  {stampMessage && <div className="mt-2 alert alert-warning text-center">{stampMessage}</div>}
                </form>
              </div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(handleDetailsSubmit)}>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header ">
                  <h5 className="card-title" style={{ marginBottom: "0px" }}>
                    Company Details
                  </h5>
                  <div
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd" }}
                  />
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label htmlFor="companyName" className="form-label">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        className="form-control"
                        {...register("companyName")}
                        readOnly
                      />
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Service Name</label>
                      <input
                        type="text"
                        id="shortName"
                        className="form-control"
                        {...register("shortName")}
                        readOnly
                      />
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Contact Number <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Contact Number"
                        autoComplete="off"
                        maxLength={14} // Limit input to 14 characters
                        defaultValue="+91 " // Set the initial value to +91 with a space
                        onInput={handlePhoneNumberChange} // Handle input changes
                        onKeyDown={handlePhoneNumberKeyDown} // Handle keydown for specific actions
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
                            notRepeatingDigits: (value) => {
                              const isRepeating = /^(\d)\1{12}$/.test(value); // Check for repeating digits
                              return (
                                !isRepeating ||
                                "Contact Number cannot consist of the same digit repeated."
                              );
                            },
                          },
                          pattern: {
                            value: /^\+91\s\d{10}$/, // Ensure it starts with +91, followed by a space and exactly 10 digits
                            message: "Contact Number is Required",
                          },
                        })}
                      />
                      {errors.mobileNo && (
                        <p className="errorMsg">{errors.mobileNo.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                      <label className="form-label">
                        Alternate Number <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Alternate Number"
                        autoComplete="off"
                        maxLength={14}
                        defaultValue="+91 " // Set the initial value to +91 with a space
                        onInput={handlePhoneNumberChange} // Handle input changes
                        onKeyDown={handlePhoneNumberKeyDown} // Handle keydown for specific actions
                        {...register("alternateNo", {
                          validate: {
                            startsWithPlus91: (value) => {
                              if (!value.startsWith("+91 ")) {
                                return "Alternate Number must start with +91 and a space.";
                              }
                              return true;
                            },
                            correctLength: (value) => {
                              if (value.length !== 14) {
                                return "Alternate Number must be exactly 10 digits (including +91).";
                              }
                              return true;
                            },
                            notRepeatingDigits: (value) => {
                              const isRepeating = /^(\d)\1{12}$/.test(value); // Check for repeating digits
                              return (
                                !isRepeating ||
                                "Alternate Number cannot consist of the same digit repeated."
                              );
                            },
                          },
                          pattern: {
                            value: /^\+91\s\d{10}$/, // Ensure it starts with +91, followed by a space and exactly 10 digits
                            message: "Alternate Number is Required",
                          },
                        })}
                      />
                      {errors.alternateNo && (
                        <p className="errorMsg">{errors.alternateNo.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label htmlFor="emailId" className="form-label">
                        {" "}
                        Company Email Id
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter Company Email Id"
                        autoComplete="off"
                        {...register("emailId", {
                          required: "Company Email Id is Required",
                          pattern: {
                            value:
                              /^(?![0-9]+@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                            message: "Invalid email format",
                          },
                        })}
                        readOnly
                      />
                      {errors.emailId && (
                        <p className="errorMsg">{errors.emailId.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Company Address <span style={{ color: "red" }}>*</span>
                      </label>
                      <textarea
                        type="text"
                        className="form-control"
                        placeholder="Enter Company Address"
                        autoComplete="off"
                        {...register("companyAddress", {
                          required: "Company Address is Required",
                          pattern: {
                            value:
                              /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,-_&*.()^+\-/+:]*$/,
                            message: "Please enter a valid address.",
                          },
                          minLength: {
                            value: 3,
                            message: "Minimum 3 Characters allowed",
                          },
                          maxLength: {
                            value: 200,
                            message: "Maximum 200 Characters allowed",
                          },
                          validate: validateLocation,
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
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title" style={{ marginBottom: "0px" }}>
                      Company Registration Details
                    </h5>
                    <div
                      className="dropdown-divider"
                      style={{ borderTopColor: "#d7d9dd" }}
                    />
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        {companyField && (
                          <>
                            <label className="form-label">{companyField === "cinNo" ? "CIN Number" : "Registration Number"}</label>
                            <input type="text" className="form-control" {...register(companyField)} />
                          </>
                        )}
                      </div>
                      <div className="col-lg-1"></div>
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">Company GST Number</label>
                        <input
                          type="text"
                          id="gstNo"
                          className="form-control"
                          {...register("gstNo")}
                          readOnly
                        />
                      </div>
                      <div className="col-lg-1"></div>
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">Company PAN Number</label>
                        <input
                          type="text"
                          id="panNo"
                          className="form-control"
                          {...register("panNo")}
                          readOnly
                        />
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
                    <h5 className="card-title" style={{ marginBottom: "0px" }}>
                      Authorized Details
                    </h5>
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
                          onInput={toInputTitleCase} // Handle case conversion and trim spaces
                          maxLength={100}
                          autoComplete="off"
                          {...register("name", {
                            required: "Name is Required",
                            minLength: {
                              value: 3,
                              message: "Minimum 3 characters Required",
                            },
                            maxLength: {
                              value: 100,
                              message: "Name must not exceed 100 characters",
                            },
                            pattern: {
                              value: /^[a-zA-Z\s]*$/,
                              message: "Name should contain only alphabets",
                            },
                            validate: {
                              noTrailingSpaces: (value) => {
                                // Custom validation to check if there's a trailing space
                                if (value.trim() !== value) {
                                  return "Spaces at the end are not allowed.";
                                }
                                return true;
                              },
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
                          Personal Email Id{" "}
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Enter Personal Email Id"
                          autoComplete="off"
                          onInput={toInputEmailCase}
                          {...register("personalMailId", {
                            required: "Personal Email Id is Required",
                            pattern: {
                              value:
                                /^(?![0-9]+@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
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
                          maxLength={14}
                          defaultValue="+91 " // Set the initial value to +91 with a space
                          onInput={handlePhoneNumberChange} // Handle input changes
                          {...register("personalMobileNo", {
                            required: "Personal Mobile Number is Required",
                            validate: {
                              startsWithPlus91: (value) => {
                                if (!value.startsWith("+91 ")) {
                                  return "Personal Mobile Number must start with +91 and a space.";
                                }
                                return true;
                              },
                              correctLength: (value) => {
                                if (value.length !== 14) {
                                  return "Personal Mobile Number must be exactly 10 digits (including +91).";
                                }
                                return true;
                              },
                              notRepeatingDigits: (value) => {
                                const isRepeating = /^(\d)\1{12}$/.test(value); // Check for repeating digits
                                return (
                                  !isRepeating ||
                                  "Personal Mobile Number cannot consist of the same digit repeated."
                                );
                              },
                            },
                            pattern: {
                              value: /^\+91\s\d{10}$/, // Ensure it starts with +91, followed by a space and exactly 10 digits
                              message: "Personal Mobile Number is Required",
                            },
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
                          onInput={toInputAddressCase}
                          maxLength={200}
                          {...register("address", {
                            required: "Address is Required",
                            pattern: {
                              value:
                                /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,-_&*.()^+\-/+:]*$/,
                              message: "Please enter valid Address",
                            },
                            minLength: {
                              value: 3,
                              message: "Minimum 3 Characters allowed",
                            },
                            maxLength: {
                              value: 200,
                              message: "Maximum 200 Characters allowed",
                            },
                            validate: validateLocation,
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
              <div className="col-lg-1"></div>
              <div className="col-12 d-flex justify-content-end">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </LayOut>
  );
}

export default Profile;
