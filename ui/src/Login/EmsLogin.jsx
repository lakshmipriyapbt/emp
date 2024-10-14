// import React, { useState } from "react";
// import { useNavigate } from "react-router";
// import { useForm } from "react-hook-form";
// import { toast } from "react-toastify";
// import { loginApi } from "../Utils/Axios";
// import { jwtDecode } from "jwt-decode";
// import { useAuth } from "../Context/AuthContext";
// import Loader from "../Utils/Loader";
// import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";

// const EmsLogin = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({ defaultValues: { username: "", password: "" }, mode: "onChange" });
//   const { setAuthUser } = useAuth();
//   const navigate = useNavigate();
//   const [passwordShown, setPasswordShown] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showErrorModal, setShowErrorModal] = useState(false); // State for error modal
//   const [errorMessage, setErrorMessage] = useState(""); // State to hold error message

//   const togglePasswordVisibility = () => {
//     setPasswordShown(!passwordShown);
//   };

//   const handleEmailChange = (e) => {
//     // Prevent space character entry
//     if (e.keyCode === 32) {
//       e.preventDefault();
//     }
//   };

//   const onSubmit = async (data) => {
//     setLoading(true); // Set loading to true when the request starts

//     try {
//       const response = await loginApi(data);
//       const token = response.data?.token;

//       if (token) {
//         try {
//           const decodedToken = jwtDecode(token);
//           const { sub: userId, roles: userRole, company, employeeId } = decodedToken;
//           setAuthUser({ userId, userRole, company, employeeId });
//           toast.success("Login Successful");
//           navigate("/main");
//         } catch (decodeError) {
//           setErrorMessage("Failed to decode token. Ensure token is valid.");
//           setShowErrorModal(true);
//         }
//       } else {
//         setErrorMessage("Unexpected response format. Token not found.");
//         setShowErrorModal(true);
//       }
//     } catch (error) {
//       handleApiErrors(error); // Use the error handling function
//     } finally {
//       setLoading(false); // Set loading to false after the request is completed
//     }
//   };


//   const handleApiErrors = (error) => {
//     if (error.response && error.response.data) {
//       // Extract the message from the response structure
//       const errorMessage = error.response.data.error?.message || "An unexpected error occurred.";
//       toast.error(errorMessage);
//     } else {
//       toast.error("Network Error!");
//     }
//     console.error(error); // Log the full error for debugging
//   };


//   const closeModal = () => {
//     setShowErrorModal(false);
//     setErrorMessage(""); // Clear error message when modal is closed
//   };

//   const validatePassword = (value) => {
//     const errors = [];
//     if (!/(?=.*[0-9])/.test(value)) {
//       errors.push("at least one digit");
//     }
//     if (!/(?=.*[a-z])/.test(value)) {
//       errors.push("at least one lowercase letter");
//     }
//     if (!/(?=.*[A-Z])/.test(value)) {
//       errors.push("at least one uppercase letter");
//     }
//     if (!/(?=.*\W)/.test(value)) {
//       errors.push("at least one special character");
//     }
//     if (value.includes(" ")) {
//       errors.push("no spaces");
//     }

//     if (errors.length > 0) {
//       return `Password must contain ${errors.join(", ")}.`;
//     }
//     return true; // Return true if all conditions are satisfied
//   };

//   const toInputLowerCase = (e) => {
//     const input = e.target;
//     let value = input.value;
//     // Remove leading spaces
//     value = value.replace(/^\s+/g, '');

//     // Initially disallow spaces if there are no non-space characters
//     if (!/\S/.test(value)) {
//       // If no non-space characters are present, prevent spaces
//       value = value.replace(/\s+/g, '');
//     } else {
//       // Allow spaces if there are non-space characters
//       value = value.toLowerCase();
//       value = value.replace(/^\s+/g, ''); // Remove leading spaces
//       const words = value.split(' ');
//       const capitalizedWords = words.map(word => {
//         return word.charAt(0).toLowerCase() + word.slice(1);
//       });
//       value = capitalizedWords.join(' ');
//     }
//     // Update input value
//     input.value = value;
//   };

//   return (
//     <div>
//       <main className="newLoginMainWrapper">
//         {loading && (<Loader />)}
//         <div className="newLoginWrapper">
//           <div className="newLoginContainer">
//             <div className="newLoginLeftSectionOuter">
//               <div className="newLoginLeftTitle">Welcome to <br /> Employee Management System</div>
//               <div className="newLoginLeftImgHolder"><img src="..\assets\img\left-img.png" alt='#' /></div>
//             </div>
//             <div className='newLoginRightSectionOuter'>
//               <div className="newLoginRightSection">
//                 <div className="newLoginRightSecTitle">Login</div>
//                 <div className="newLoginRightSecSelectLogin">
//                   <div className="loginBtn"><span>Continue with Ems Admin login</span></div>
//                 </div>
//                 <form onSubmit={handleSubmit(onSubmit)}>
//                   <div class="formgroup">
//                     <label class="form-label">Email</label>
//                     <input class="form-control form-control-lg"
//                       type="email"
//                       name="email"
//                       placeholder="Email"
//                       autoComplete="off"
//                       onInput={toInputLowerCase}
//                       onKeyDown={handleEmailChange}
//                       {...register("username", {
//                         required: "Email is Required.",
//                         pattern: {
//                           value: /^(?![0-9]+@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
//                           message: "Invalid email format it allows Only .com, .in, .org, .net, .edu, .gov are allowed",
//                         },
//                       })}
//                     />
//                     {errors.username && (
//                       <p className="errorMsg" style={{ marginLeft: "20px" }}>
//                         {errors.username.message}
//                       </p>
//                     )}
//                   </div>
//                   <div class="formgroup">
//                     <label class="form-label">Password</label>
//                     <input class="form-control form-control-lg"
//                       name="password"
//                       placeholder="Password"
//                       onChange={handleEmailChange}
//                       type={passwordShown ? "text" : "password"}
//                       {...register("password", {
//                         required: "Password is Required",
//                         minLength: {
//                           value: 6,
//                           message: "Password must be at least 6 characters long",
//                         },
//                         validate: validatePassword,
//                       })}
//                     />
//                     {errors.password && (
//                       <p className="errorMsg" style={{ marginLeft: "20px" }}>
//                         {errors.password.message}
//                       </p>
//                     )}
//                     <span toggle="#password-field" class="fa fa-fw fa-eye field-icon toggle-password"></span>
//                     {/* <small>
//                               <a href="javascript:void(0);">Forgot password?</a>
//                           </small> */}
//                   </div>
//                   <div>
//                     <div class="form-check align-items-center">
//                       <input id='customControlInline' type="checkbox" class="form-check-input" value="remember-me" name="remember-me" />
//                       <label class="form-check-label text-small" for="customControlInline">Remember me</label>
//                     </div>
//                   </div>
//                   <div class="d-grid gap-2 mt-3">
//                     <button class="btn btn-lg btn-primary" type="submit">Sign in</button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* <div className="container flex-column" style={{ background: 'red', display:'none' }}>
//       <div className="row vh-100">
//           <div className="col-sm-10 col-md-7 col-lg-6 mx-auto d-table h-100">
//               <div className="d-table-cell align-middle">
//                   <div className="text-center mt-2">
//                       <img src="assets/img/person-1.svg" alt="person" style={{ width: '800px', height: '300px', marginBottom: "40px" }} />
//                       <h1 className="lead" style={{ fontSize: "3rem", fontFamily: "Arial, sans-serif", fontWeight: 'bold', color: '#333', display: 'inline-block', whiteSpace: 'nowrap' }}>Welcome To Employee Management System </h1>
//                       <h3 style={{ fontFamily: "sans-serif", color: '#555' }}>Enter The Path According To Your Company...</h3>
//                   </div>
//                   <div className='row' style={{ marginTop: "20px" }}>
//                       <div className='col-12 col-md-6 col-lg-5 mb-3' style={{ paddingLeft: "200px" }}>
//                           <Link to={'/emsAdmin/login'}>
//                               <button className="btn btn-primary btn-lg" >EMS Login</button>
//                           </Link>
//                       </div>
//                       <div className='col-lg-1'></div>
//                       <div className='col-12 col-md-6 col-lg-5 mb-3' style={{ paddingLeft: "190px" }} >
//                           <button className="btn btn-primary btn-lg" onClick={openModal}>Company Login</button>
//                       </div>
//                   </div>
//               </div>
//           </div>
//       </div>
//   </div> */}
//         {/* {showModal && (
//       <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
//           <div className="modal-dialog modal-dialog-centered">
//               <div className="modal-content">
//                   <div className="modal-header">
//                       <ModalTitle className="modal-title">Company Service Name</ModalTitle>
//                   </div>
//                   <div className="modal-body">
//                       <form onSubmit={handleSubmit(onSubmit)}>
//                           <input
//                               type="text"
//                               name="companyName"
//                               className="form-control"
//                               placeholder="Enter Company Service Name"
//                               onInput={toInputLowerCase}
//                               onKeyDown={handleEmailChange}
//                               {...register("companyName", {
//                                   required: "Company Service Name is Required",
//                                   pattern: {
//                                       value: /^[a-z]+$/,
//                                       message: "This field accepts only lowercase alphabetic characters without spaces",
//                                   },
//                               })}
//                           />
//                           {errors.companyName && (
//                               <p className='errorMsg'>{errors.companyName.message}</p>
//                           )}
//                           <div className="modal-footer">
//                               <button type="submit" className="btn btn-primary">Submit</button>
//                               <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
//                           </div>
//                       </form>
//                   </div>
//               </div>
//           </div>
//       </div >
//   )} */}
//       </main >
//       <Modal
//         show={showErrorModal}
//         onHide={closeModal}
//         centered
//         style={{ zIndex: "1050" }}
//         className="custom-modal"
//       >
//         <ModalHeader closeButton>
//           <ModalTitle className="text-center">Error</ModalTitle>
//         </ModalHeader>
//         <ModalBody className="text-center fs-bold">
//           {errorMessage}
//         </ModalBody>
//       </Modal>
//     </div>
//   );
// };

// export default EmsLogin;









import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { loginApi } from "../Utils/Axios";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";
import Loader from "../Utils/Loader";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";

const EmsLogin = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { username: "", password: "" }, mode: "onChange" });
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const handleEmailChange = (e) => {
    if (e.keyCode === 32) {
      e.preventDefault();
    }
  };

  const onSubmit = async (data) => {
    setLoading(true); // Set loading to true when the request starts
   

    try {
      const response = await loginApi(data);
      const token = response.data?.token;

      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const { sub: userId, roles: userRole, company, employeeId } = decodedToken;
          setAuthUser({ userId, userRole, company, employeeId });
          toast.success("Login Successful");
          navigate("/main");
        } catch (decodeError) {
          setErrorMessage("Failed to decode token. Ensure token is valid.");
          setShowErrorModal(true);
        }
      } else {
        setErrorMessage("Unexpected response format. Token not found.");
        setShowErrorModal(true);
      }
    } catch (error) {
      if (error) {
        const errorMessage = error;
        setErrorMessage(errorMessage);
        setShowErrorModal(true);
      } else {
        setErrorMessage("Login failed. Please try again later.");
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false); // Set loading to false after the request is completed
    }
  };

  const closeModal = () => {
    setShowErrorModal(false);
    setErrorMessage(""); // Clear error message when modal is closed
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

  return (
    <div>
      <main className="newLoginMainWrapper">
        {loading && <Loader />}
        <div className="newLoginWrapper">
          <div className="newLoginContainer">
            <div className="newLoginLeftSectionOuter">
              <div className="newLoginLeftTitle">Welcome to <br /> Employee Management System</div>
              <div className="newLoginLeftImgHolder"><img src="..\assets\img\left-img.png" alt="#" /></div>
            </div>
            <div className='newLoginRightSectionOuter'>
              <div className="newLoginRightSection">
                <div className="newLoginRightSecTitle">Login</div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="formgroup">
                    <label className="form-label">Email</label>
                    <input className="form-control form-control-lg"
                      type="email"
                      placeholder="Email"
                      autoComplete="off"
                      onKeyDown={handleEmailChange}
                      {...register("username", {
                        required: "Email is Required.",
                        pattern: {
                          value: /^(?![0-9]+@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|edu|gov)$/,
                          message: "Invalid email format. Only .com, .in, .org, .net, .edu, .gov are allowed.",
                        },
                      })}
                    />
                    {errors.username && <p className="errorMsg">{errors.username.message}</p>}
                  </div>
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
                        validate: validatePassword,
                      })}
                    />
                    {errors.password && (
                      <p className="errorMsg" style={{ marginLeft: "20px" }}>
                        {errors.password.message}
                      </p>
                    )}
                    <span onClick={togglePasswordVisibility} className="fa fa-fw fa-eye field-icon toggle-password"></span>
                  </div>
                  <div className="d-grid gap-2 mt-3">
                    <button className="btn btn-lg btn-primary" type="submit">Sign in</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Error Modal */}
      <Modal
        show={showErrorModal}
        onHide={closeModal}
        centered
        style={{ zIndex: "1050" }}
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

export default EmsLogin;
