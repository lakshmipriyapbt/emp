import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { UnlockFill, LockFill } from "react-bootstrap-icons";
import { Modal } from "react-bootstrap";
import { EmployeeGetApiById, resetPassword } from "../Utils/Axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const Reset = ({ companyName, onClose, show }) => {
  const { register, handleSubmit, formState: { errors }, getValues,reset } = useForm({ mode: "onChange" });
  const [oldPasswordShown, setOldPasswordShown] = useState(false);
  const [newPasswordShown, setNewPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [id, setEmployeeId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toggleOldPasswordVisibility = () => {
    setOldPasswordShown(!oldPasswordShown);
  };

  const toggleNewPasswordVisibility = () => {
    setNewPasswordShown(!newPasswordShown);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordShown(!confirmPasswordShown);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await EmployeeGetApiById(user.userId);
        const id = response.data.id;
        setEmployeeId(id);
      } catch (error) {
        setError(error);
        // toast.error("Error fetching employee data!");
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    const formData = {
      password: data.password,
      newPassword: data.newPassword,
      companyName: companyName,
    };

    try {
      setLoading(true);
      const response = await resetPassword(formData, id);
      console.log('Password Reset Successful:', response.data);
      setLoading(false);
      onClose(); // Close modal or handle success state
      toast.success("Password Reset Successful");
      navigate("/");
    } catch (error) {
      handleApiErrors(error);
      setLoading(false);
    }
  };

  const handleApiErrors = (error) => {
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error!");
    }
    console.error(error.response);
  };

  const handleClose = () => {
    // Reset form fields
    reset();
    setLoading(false);
    setOldPasswordShown(false);
    setNewPasswordShown(false);
    setConfirmPasswordShown(false);
    setError(null);
    onClose(); // Call the original onClose function
  };

  const handleReset = () => {
    reset(); // Clear all input fields
    setOldPasswordShown(false);
    setNewPasswordShown(false);
    setConfirmPasswordShown(false);
    setError(null);
  };
  const handleEmailChange = (e) => {
    const value = e.target.value;

    // Prevent space key (keyCode 32) from being entered
    if (e.keyCode === 32) {
      e.preventDefault();
    }

    // If there is any space already entered, prevent re-render with spaces
    if (value.includes(" ")) {
      e.preventDefault();
    }
  };

  return (

    <Modal
      show={show}
      onHide={handleClose}
      centered
      style={{ zIndex: "1050" }}
      backdrop="static"
      keyboard={false} 
    >
      <Modal.Header closeButton>
        <Modal.Title>Reset Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group mt-3">
              <label className="form-label">Old Password</label>
              <div className="input-group">
                <span className="input-group-text" onClick={toggleOldPasswordVisibility}>
                  {oldPasswordShown ? <UnlockFill size={20} color="#4C489D" /> : <LockFill size={20} color="#4C489D" />}
                </span>
                <input
                  className="form-control"
                  name="password"
                  id="password"
                  maxLength={16}
                  placeholder="Enter your old password"
                  type={oldPasswordShown ? "text" : "password"}
                  onKeyDown={handleEmailChange}
                  {...register("password", {
                    required: "Old Password is Required",
                    minLength: {
                      value: 6,
                      message: "Old Password must be at least 6 characters long",
                    },
                    pattern: {
                      value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{6,16}$/,
                      message: "Old Password must contain at least one number, one lowercase letter, one uppercase letter, and one special character.",
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="errorMsg" style={{ marginLeft: "55px", marginBottom: "0" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="form-group mt-3">
              <label className="form-label">New Password</label>
              <div className="input-group">
                <span className="input-group-text" onClick={toggleNewPasswordVisibility}>
                  {newPasswordShown ? <UnlockFill size={20} color="#4C489D" /> : <LockFill size={20} color="#4C489D" />}
                </span>
                <input
                  className="form-control"
                  name="newPassword"
                  id="newPassword"
                  maxLength={16}
                  placeholder="Enter your new password"
                  type={newPasswordShown ? "text" : "password"}
                  onKeyDown={handleEmailChange}
                  {...register("newPassword", {
                    required: "New Password is Required",
                    minLength: {
                      value: 6,
                      message: "Minimum 6 Characters allowed",
                    },
                    maxLength:{
                      value: 16,
                      message: "Minimum 6 & Maximum 16 Characters allowed",
                    },
                    pattern: {
                      value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{6,16}$/,
                      message: "New Password must contain at least one number, one lowercase letter, one uppercase letter, and one special character.",
                    },
                  })}
                />
              </div>
              {errors.newPassword && (
                <p className="errorMsg" style={{ marginLeft: "55px", marginBottom: "0" }}>
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="form-group mt-3">
              <label className="form-label">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text" onClick={toggleConfirmPasswordVisibility}>
                  {confirmPasswordShown ? <UnlockFill size={20} color="#4C489D" /> : <LockFill size={20} color="#4C489D" />}
                </span>
                <input
                  className="form-control"
                  name="confirmPassword"
                  id="confirmPassword"
                  maxLength={16}
                  placeholder="Confirm your new password"
                  type={confirmPasswordShown ? "text" : "password"}
                  onKeyDown={handleEmailChange}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === getValues("newPassword") || "The passwords do not match",
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="errorMsg" style={{ marginLeft: "55px", marginBottom: "0" }}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="mt-4" style={{marginLeft:"63%"}}>
            <button className="btn btn-secondary me-2" type="button" onClick={handleReset}>
                Reset
              </button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Loading..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default Reset;
