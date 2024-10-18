import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal, Button, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "react-bootstrap";
import LayOut from "./LayOut";
import { CameraFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CompanyImagePatchApi, companyUpdateByIdApi, companyViewByIdApi } from "../Utils/Axios";
import { useAuth } from "../Context/AuthContext";

function Profile() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ mode: "onChange" });
  const [companyData, setCompanyData] = useState({});
  const [postImage, setPostImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(null);
  const [imgError,setImgError]=useState(null);
  const { user = {}, logoFileName } = useAuth();
  const navigate = useNavigate();



  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user.companyId) return;
      try {
        const response = await companyViewByIdApi(user.companyId);
        const data = response.data;
        setCompanyData(data);
        // Set form values
        Object.keys(data).forEach(key => setValue(key, data[key]));
      } catch (err) {
        setError(err);
      }
    };

    fetchCompanyData();
  }, [setValue, user.companyId]);


  const handleDetailsSubmit = async (data) => {
    if (!user.companyId) return;

    const updateData = {
      companyAddress: data.companyAddress,
      mobileNo: data.mobileNo,
      landNo: data.landNo,
      name: data.name,
      personalMailId: data.personalMailId,
      personalMobileNo: data.personalMobileNo,
      address: data.address
    };

    try {
      // Attempt to update company details
      await companyUpdateByIdApi(user.companyId, updateData);

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

      // Show error notification
      toast.error("Failed To Update Company Details");
    }
  };



  const handleLogoSubmit = async () => {
    if (!user.companyId) return;
    if (!postImage) {
      setErrorMessage("Logo is Required");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", "string");
      formData.append("file", postImage);
      await CompanyImagePatchApi(user.companyId, formData);
      setPostImage(null);
      setSuccessMessage("Logo updated successfully.");
      toast.success("Company Logo Updated Successfully");
      setErrorMessage("");
      closeModal();
      setTimeout(() => {
        window.location.href = "/main";
      }, 2000);
    } catch (err) {
      console.error("Logo update error:", err);
      setSuccessMessage("");
      toast.error("Failed To Update Logo");
      setError(err);
    }
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

  const onChangePicture = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (200KB)
      if (file.size > 200 * 1024) {
        setImgError("File size must be less than 200KB.");
        return;
      }

      // Check file type
      const validTypes = ["image/png", "image/jpeg", "image/svg+xml", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        setImgError("Only .png, .jpg, .jpeg, .svg, and .pdf files are allowed.");
        return;
      }

      // Create an image element to check dimensions
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        // Check dimensions
        if (img.height > 80) {
          setImgError("Image height must be less than or equal to 80px.");
        } else if (img.width > 200) {
          setImgError("Image width must be less than or equal to 200px.");
        } else {
          setImgError(''); // Clear errors if all checks pass
          setPostImage(file); // Set the valid image file
          console.log("File is valid and ready for upload:", file);
        }
      };

      img.onerror = () => {
        setImgError("Invalid image file.");
      };

    }
  };
  
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleCloseUploadImageModal = () => {
    setPostImage(null);
    setShowModal(false);
    setErrorMessage("");
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
      // Convert the entire string to lowercase
      value = value.toLowerCase();

      // Remove leading spaces
      value = value.replace(/^\s+/g, '');

      // Capitalize the first letter of each word
      const words = value.split(' ');
      const capitalizedWords = words.map(word => {
        return word.charAt(0).toLowerCase() + word.slice(1);
      });

      value = capitalizedWords.join(' ');
    }

    // Update input value
    input.value = value;
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <h1 className="h3 mb-3">
          <strong>Profile</strong>
        </h1>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Add Company Logo</h5>
                <hr />
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 col-md-6 mb-3">
                    <div
                      style={{
                        position: "relative",
                        fontSize: "50px",
                        cursor: "pointer",
                        marginRight: "80%",
                      }}
                      onClick={openModal}
                    >
                      <div
                        style={{
                          position: "relative",
                          justifyContent: "center",
                        }}
                      >
                        <CameraFill />
                       
                      </div>
                    
                    </div>
                    <span className="text-danger align-start">Max-Height=80px; Max-Width=200px; Max-Size=200 KB </span>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    {logoFileName && (
                      <img
                        className="align-middle"
                        src={`${logoFileName}`}
                        accept=".png, .jpg. ,svg ,.jpeg, .pdf"
                        alt="Company Logo"
                        style={{ height: "80px", width: "200px" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleDetailsSubmit)}>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header ">
                  <h5 className="card-title">Company Details</h5>
                  <div className="dropdown-divider" style={{ borderTopColor: "#d7d9dd" }} />
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label htmlFor="companyName" className="form-label">Company Name</label>
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
                      <label className="form-label">
                        Service Name
                      </label>
                      <input
                        type="text"
                        id="shortName"
                        className="form-control"
                        {...register("shortName")}
                        readOnly
                      />
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                      <label className="form-label">
                        Alternate Number <span style={{ color: "red" }}>*</span>
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
                          required: "Alternate Number is Required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message:
                              "Alternate Number should contain only 10 numbers",
                          },
                        })}
                      />
                      {errors.mobileNo && (
                        <p className="errorMsg">{errors.mobileNo.message}</p>
                      )}
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">
                        Mobile Number <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Enter Mobile Number"
                        autoComplete="off"
                        maxLength={10}
                        onInput={toInputSpaceCase}
                        onKeyDown={handleEmailChange}
                        {...register("mobileNo", {
                          required: "Mobile Number is Required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message:
                              "Mobile Number should contain only 10 numbers. ",
                          },
                        })}
                      />
                      {errors.mobileNo && (
                        <p className="errorMsg">{errors.mobileNo.message}</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label htmlFor="emailId" className="form-label">Company MailId</label>
                      <input
                        type="text"
                        id="emailId"
                        className="form-control"
                        {...register("emailId")}
                        readOnly
                      />
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
                        onKeyDown={handleEmailChange}
                        onInput={toInputTitleCase}
                        autoComplete="off"
                        {...register("companyAddress", {
                          required: "Company Address is Required",
                          pattern: {
                            value: /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,&*()^\-/]*$/,
                            message:
                              "Please enter valid Address",
                          },
                          minLength: {
                            value: 3,
                            message: "minimum 3 characters allowed",
                          },
                          maxLength: {
                            value: 100,
                            message: "maximum 100 characters allowed",
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
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title">Company Registration Details</h5>
                    <div className="dropdown-divider" style={{ borderTopColor: "#d7d9dd" }} />
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">Company CIN Number</label>
                        <input
                          type="text"
                          id="cinNo"
                          className="form-control"
                          {...register("cinNo")}
                          readOnly
                        />
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
                    <h5 className="card-title">Authorized Details</h5>
                    <div className="dropdown-divider" style={{ borderTopColor: "#d7d9dd" }} />
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
                          maxLength={20}
                          autoComplete="off"
                          {...register("name", {
                            required: "Name is Required",
                            minLength: {
                              value: 3,
                              message: "Minimun 3 characters Required",
                            },
                            maxLength: {
                              value: 20,
                              message: "Name must not exceed 20 characters",
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
                              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                              message: "Invalid Email Format",
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
                          Personal Mobile Number <span style={{ color: "red" }}>*</span>
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
                              value: /^[0-9]{10}$/,
                              message:
                                "Mobile Number should be exactly 10 digits long and should contain only numbers",
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
                          onInput={toInputTitleCase}
                          onKeyDown={handleEmailChange}
                          maxLength={100}
                          {...register("address", {
                            required: "Address is Required",
                            maxLength: {
                              value: 100,
                              message: "Name must not exceed 100 characters",
                            },
                            minLength: {
                              value: 3,
                              message: "Mimium 3 characters Required",
                            },
                            pattern: {
                              value: /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,'#,&*()^\-/]*$/,
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
              <div className="col-lg-1"></div>
              <div className="col-12 d-flex justify-content-end mt-5">
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
        {/* Modal for Logo Upload */}
        < Modal show={showModal} onHide={handleCloseUploadImageModal} style={{ zIndex: "1050" }
        } centered >
          <ModalHeader closeButton>
            <ModalTitle>Upload Logo</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <input
              type="file"
              className="form-control"
              accept=".png, .jpg, .svg, .jpeg, .pdf"
              
              onChange={onChangePicture}
            />
            {errorMessage && (
              <p className="text-danger" style={{ marginLeft: "2%" }}>{imgError}</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCloseUploadImageModal}>
              Cancel

            </Button>
            <Button variant="primary" onClick={handleLogoSubmit}>
              Upload Logo
            </Button>
          </ModalFooter>
        </Modal >
      </div>
    </LayOut>
  );
}

export default Profile;
