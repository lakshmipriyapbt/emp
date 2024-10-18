import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import { CompanyloginApi, ValidateOtp } from "../Utils/Axios";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import '../LayOut/NewLogin/Message.css'
import Loader from "../Utils/Loader";

const CompanyLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      otp: "",
    },
    mode: "onChange",
  });
  const token = sessionStorage.getItem("token");

  const validateEmail = (value) => {
    if (/[^a-zA-Z0-9@._-]{3,}/.test(value)) {
      return "Please enter a valid Email Id.";
    }
    return true;
  };

  const { setAuthUser } = useAuth();
    const { company } = useParams();
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [otpSent, setOtpSent] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [otpTimeLimit, setOtpTimeLimit] = useState(56); 
  const [otpExpired, setOtpExpired] = useState(false); 

  useEffect(() => {
    localStorage.setItem("company", company);
  }, [company]);

  useEffect(() => {
    if (otpTimeLimit > 0) {
      const timer = setTimeout(() => {
        setOtpTimeLimit((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setOtpExpired(true);
      setOtpSent(false);
    }
  }, [otpTimeLimit]);

  const sendOtp = (data) => {
    const payload = {
      username: data.username,
      password: data.password,
      company: company,
    };
  
    setLoading(true);
    CompanyloginApi(payload)
      .then((response) => {
        const token = response.data?.token;
        if (token) {
          localStorage.setItem("token", token);
          const decodedToken = jwtDecode(token);
          const { sub: userId, roles: userRole, company, employeeId } = decodedToken;
          setAuthUser({ userId, userRole, company, employeeId });
          toast.success("OTP Sent Successfully");
          setOtpSent(true);
          setOtpExpired(false);
          setOtpTimeLimit(56);
          setShowOtpField(true); // Show OTP field
        } else {
          console.error('Token not found in response');
          setErrorMessage("Unexpected response format. Token not found.");
          setShowErrorModal(true);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
  
        // Ensure we're accessing the error message properly
        const errorMessage = error.message || "Login failed. Please try again later.";
        console.error('sendOtp error:', errorMessage); // Log the error
        setErrorMessage(errorMessage);
        setShowErrorModal(true);
      });

  }; 


  const verifyOtpAndCompanyLogin = (data) => {
    const payload = {
      username: data.username,
      otp: data.otp,
      company: company,
    };
    setLoading(true);
    ValidateOtp(payload)
      .then((response) => {
        setLoading(false);
        toast.success("Login Successful", {
          position: "top-right",
          transition: Bounce,
          hideProgressBar: true,
          theme: "colored",
          autoClose: 2000,
        });
        setTimeout(() => {
          navigate("/main");
        }, 2000);

      })
      .catch((error) => {
        setLoading(false);
        console.log("sendOtp",error)
        if (error.response && error.response.data && error.response.data.error) {
          const errorMessage = error.response.data.error.message;
          setErrorMessage(errorMessage);
          setShowErrorModal(true);
        } else {
          setErrorMessage("Login failed. Please try again later.");
          setShowErrorModal(true);
        }
        if (otpTimeLimit <= 0) {
          setOtpExpired(true);
          setOtpSent(true)
          setErrorMessage("OTP Expired. Please Login Again");
          setShowErrorModal(true);
        }
      });
  };

  const closeModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const handleEmailChange = (e) => {
    if (e.keyCode === 32) {
      e.preventDefault();
    }
  };

  const onSubmit = (data) => {
    if (otpSent && !otpExpired) {
      verifyOtpAndCompanyLogin(data);
    } else {
      sendOtp(data);
    }
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

  return (
    <div>
      {/* <main className="d-flex w-100 ">
        <div className="container d-flex flex-column">
          <div className="row vh-100">
            <div className="col-sm-10 col-md-7 col-lg-6 mx-auto d-table h-100">
              <div className="d-table-cell align-middle">
                <div className="card">
                  <div className="card-header">
                    <div className="text-center mt-2">
                      <p className="lead">Login   </p>
                    </div>
                  </div>
                  <div className="card-body" style={{ padding: "6px" }}>
                    <div className="m-sm-2" style={{padding:"0 50px 0 50px"}}>
                      <form onSubmit={handleSubmit(onSubmit)} className="align-items-center">
                        <label className="form-label">Email Id</label>
                        <>
                          <div className="input-group">
                            <span className="input-group-text">
                              <EnvelopeFill size={20} color="#4C489D" />
                            </span>
                            <input
                              className="form-control"
                              type="email"
                              name="username"
                              id="username"
                              placeholder="Enter Your Email Id"
                              autoComplete="off"
                              onKeyDown={handleEmailChange}
                              readOnly={otpSent}
                              {...register("username", {
                                required: "Email is Required.",
                                pattern: {
                                  value: /^\S[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                  message: "Please enter a valid email address.",
                                },
                                validate: validateEmail,
                              })}
                            />
                          </div>
                          {errors.username && (
                            <p className="errorMsg p-0" style={{ marginLeft: "55px" }}>
                              {errors.username.message}
                            </p>
                          )}
                        </>
                        <div className="mt-3">
                          {!otpSent && (
                            <>
                              <label className="form-label">Password</label>
                              <div className="input-group">
                                <span className="input-group-text" onClick={togglePasswordVisibility}>
                                  {passwordShown ? (
                                    <UnlockFill size={20} color="#4C489D" />
                                  ) : (
                                    <LockFill size={20} color="#4C489D" />
                                  )}
                                </span>
                                <input
                                  className="form-control"
                                  name="password"
                                  id="password"
                                  placeholder="Enter Your Password"
                                //  onChange={handlePasswordChange}
                                  type={passwordShown ? "text" : "password"}
                                  {...register("password", {
                                    required: "Password is Required",
                                    minLength: {
                                      value: 6,
                                      message: "Password must be at least 6 characters long",
                                    },
                                  validate:validatePassword,
                                  })}
                                />
                              </div>
                              {errors.password && (
                                <p className="errorMsg" style={{ marginLeft: "55px", marginBottom: "0" }}>
                                  {errors.password.message}
                                </p>
                              )}
                              <div className="mt-3">
                              <medium>
                                <a href="/forgotPassword">Forgot password?</a>
                              </medium>
                              </div>
                            </>
                          )}
                          {otpSent && !otpExpired && (
                            <div>
                              <label className="form-label">OTP</label>
                              <div className="mb-3 input-group">
                                <input
                                  className="form-control"
                                  type="text"
                                  name="otp"
                                  id="otp"
                                  placeholder="Enter Your OTP"
                                  autoComplete="off"
                                  {...register("otp", {
                                    required: "OTP is Required.",
                                      validate: (value) => {
                                        if (/\s/.test(value)) {
                                          return "OTP cannot contain spaces.";
                                        }
                                        if (!/^\d{6}$/.test(value)) {
                                          return "OTP must be exactly 6 digits.";
                                        }
                                        return true; // Return true if no errors
                                      }, 
                                  })}
                                />
                              </div>
                              {errors.otp && (
                                <p className="errorMsg">{errors.otp.message}</p>
                              )}
                            </div>
                          )}
                          {showOtpField && otpExpired && (
                            <div className="text-center">
                              <p className="errorMsg">OTP Expired. Please login again.</p>
                            </div>
                          )}
                        </div>
                        <div className="text-center mt-4" style={{ paddingTop: "10px" }}>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                          >
                            {loading
                              ? "Loading..."
                              : otpSent
                              ? "Login"
                              : "Send OTP"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="text-center text-small mt-1">
                    <span>
                      Copyrights &copy;2024 PATHBREAKER TECHNOLOGIES PVT.LTD. All Rights Reserved
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main> */}
          <main className="newLoginMainWrapper">
          {loading &&(
             <Loader/>
          )}
        <div className="newLoginWrapper">
            <div className="newLoginContainer">
                <div className="newLoginLeftSectionOuter">
                    <div className="newLoginLeftTitle">Welcome to <br/> Employee Management System</div>
                    <div className="newLoginLeftImgHolder"><img src="..\assets\img\left-img.png" alt='#' /></div>
                </div>
                <div className='newLoginRightSectionOuter'>
                    <div className="newLoginRightSection">
                        <div className="newLoginRightSecTitle">Login</div>
                        <div className="newLoginRightSecSelectLogin">

                            <div className="loginBtn"><span>Continue with Company login</span></div>

                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div class="formgroup">
                                <label class="form-label">Email</label>
                                <input class="form-control form-control-lg"
                                  type="email"
                                  name="email"
                                  placeholder="Email"
                                  autoComplete="off"
                                  onInput={toInputLowerCase}
                                  onKeyDown={handleEmailChange}
                                  readOnly={otpSent}
                                  {...register("username", {
                                    required: "Email is Required.",
                                    pattern: {
                                      value: /^(?![0-9]+@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                                      message: "Invalid Email Format",
                                    },
                                    })}
                                  />
                                  {errors.username && (
                                  <p className="errorMsg" style={{ marginLeft: "20px" }}>
                                    {errors.username.message}
                                  </p>
                                  )}
                            </div>
                            {!otpSent && ( 
                              <> 
                              <div class="formgroup">
                                <label class="form-label">Password</label>
                                <input class="form-control form-control-lg" 
                                  name="password"
                                  placeholder="Password"
                                  onChange={handleEmailChange}
                                  type={passwordShown ? "text" : "password"}
                                  {...register("password", {
                                      required: "Password is Required",
                                      minLength: {
                                      value: 6,
                                      message: "Password must be at least 6 characters long",
                                  },
                                  validate:validatePassword,  
                                  })}
                                />
                                {errors.password && (
                                  <p className="errorMsg" style={{ marginLeft: "20px" }}>
                                    {errors.password.message}
                                  </p>
                                )}
                                <span toggle="#password-field" class="bi bi-eye-fill field-icon toggle-password"></span>
                                <small>
                                    <a href="/forgotPassword">Forgot password?</a>
                                </small>
                            </div>
                          
                            {/* <div>
                                <div class="form-check align-items-center">
                                    <input id='customControlInline' type="checkbox" class="form-check-input" value="remember-me" name="remember-me"  />
                                    <label class="form-check-label text-small" for="customControlInline">Remember me</label>
                                </div>
                            </div> */}
                            </>
                          )}
                          {otpSent && !otpExpired && (   
                            <div class="formgroup">
                                <label class="form-label">OTP</label>
                                <input class="form-control form-control-lg" 
                                type="text"
                                name="otp"
                                id="otp"
                                placeholder="Enter Your OTP"
                                autoComplete="off"
                                {...register("otp", {
                                  required: "OTP is Required.",
                                  pattern: {
                                    value: /^\d{6}$/,
                                    message: "OTP must be 6 digits.",
                                  },
                                })}
                                />
                                {errors.otp && (
                                    <p className="errorMsg">{errors.otp.message}</p>
                                  )}
                            </div>
                            )}
                            <div class="d-grid gap-2 mt-3">
                                <button class="btn btn-lg btn-primary" type="submit">Sign in</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Modal
        show={showErrorModal}
        onHide={closeModal}
        centered
        style={{ zIndex: "1050"}}
        className="custom-modal"
      >
        <ModalHeader closeButton>
          <ModalTitle className="text-center">Error</ModalTitle>
        </ModalHeader>
        <ModalBody className="text-center fs-bold">
          {errorMessage}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default CompanyLogin;
