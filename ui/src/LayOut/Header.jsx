import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import Reset from "./Reset";
import { useAuth } from "../Context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

const Header = ({ toggleSidebar }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const { company, employee, authUser } = useAuth();
  const { userId } = authUser || {};
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { userRole } = useSelector((state) => state.auth);
  const { imageUrl } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const companyName = localStorage.getItem("companyName");

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      const roles = decodedToken?.roles || [];
      setRoles(roles);

      const currentTime = Date.now() / 1000;
      const remainingTime = decodedToken.exp - currentTime;
      if (remainingTime > 0) {
        const timeoutId = setTimeout(() => {
          handleLogOut();
        }, remainingTime * 1000);
        return () => clearTimeout(timeoutId);
      } else {
        handleLogOut();
      }
    }
  }, [token]);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
  };

  const handleClickOutside = (event) => {
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target)
    ) {
      setIsProfileOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

   useEffect(() => {
    // This will force a re-render when imageUrl changes
  }, [imageUrl]);

  const handleLogOut = () => {
    const role = userRole?.[0];
    const companyName = localStorage.getItem("companyName");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    if (role === "ems_admin") {
      navigate("/login", { replace: true });
    } else if (role === "company_admin" || role === "Accountant" || role === "HR" || role === "Admin" || companyName) {
      navigate(`/${companyName}/login`, { replace: true });
    } else if (role === "candidate") {
      navigate(`/${companyName}/candidateLogin`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const closeModal = () => {
    setShowErrorModal(false);
    navigate("/");
  };

  const handleResetPasswordClick = () => {
    setShowResetPasswordModal(true);
  };

  // Function to render profile icon or photo
  const renderProfileImage = () => {
  if (imageUrl) {
    return (
      <img
        src={`${imageUrl.split('?')[0]}?t=${Date.now()}`}
        alt="Profile"
        className="rounded-circle"
        style={{
          width: "30px",
          height: "30px",
          objectFit: "cover",
          border: "1px solid #dee2e6"
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = ''; // Fallback to icon if image fails to load
        }}
      />
    );
  }
  return <i className="bi bi-person-circle" style={{ fontSize: "22px" }}></i>;
};

  return (
    <nav className="navbar navbar-expand navbar-light navbar-bg">
      <a className="sidebar-toggle js-sidebar-toggle" onClick={toggleSidebar} href>
        <i className="hamburger align-self-center"></i>
      </a>
      <div className="navbar-collapse collapse">
        <ul className="navbar-nav navbar-align">
          {roles.includes("ems_admin") && (
            <>
              <span className="mt-3">EMS-Admin</span>
              <li className="nav-item">
                <a
                  className="nav-link dropdown-toggle d-none d-sm-inline-block text-center"
                  href
                  onClick={toggleProfile}
                >
                  <i className="bi bi-person-circle" style={{ fontSize: "22px" }}></i>
                </a>
                {isProfileOpen && (
                  <div
                    className="dropdown-menu dropdown-menu-end py-0 show"
                    aria-labelledby="profileDropdown"
                    style={{ left: "auto", right: "3%" }}
                    ref={profileDropdownRef}
                  >
                    <a className="dropdown-item" href onClick={handleLogOut}>
                      <i className="align-middle bi bi-arrow-left-circle" style={{ paddingRight: "10px" }}></i>
                      Logout
                    </a>
                  </div>
                )}
              </li>
            </>
          )}
          {roles.includes("company_admin") && (
            <li className="nav-item dropdown position-relative">
              <a
                className="nav-link dropdown-toggle d-none d-sm-inline-block text-center"
                href
                onClick={toggleProfile}
              >
                <span className="text-dark p-2 mb-3">{company?.companyName}</span>
                <i className="bi bi-person-circle" style={{ fontSize: "22px" }}></i>
              </a>
              {isProfileOpen && (
                <div
                  className="dropdown-menu dropdown-menu-end py-0 show"
                  aria-labelledby="profileDropdown"
                  style={{ left: "auto", right: "10%" }}
                  ref={profileDropdownRef}
                >
                  <a className="dropdown-item" href="/profile">
                    <i className="align-middle me-1 bi bi-person"></i> Profile
                  </a>
                  <a className="dropdown-item" href onClick={handleResetPasswordClick}>
                    <i className="align-middle me-1 bi bi-key"></i> Reset Password
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href onClick={handleLogOut}>
                    <i className="align-middle bi bi-arrow-left-circle" style={{ paddingRight: "10px" }}></i>
                    Logout
                  </a>
                </div>
              )}
            </li>
          )}
          {roles.includes("employee") && (
            <li className="nav-item dropdown position-relative">
              <div className="d-flex align-items-center gap-2">
                <span className="text-dark" style={{ whiteSpace: 'nowrap' }}>
                  {employee?.firstName} {employee?.lastName}
                </span>
                <div
                  className="nav-link p-0"
                  onClick={toggleProfile}
                  style={{ cursor: "pointer", lineHeight: 0 }}
                >
                  {renderProfileImage()}
                </div>
              </div>
              {isProfileOpen && (
                <div
                  className="dropdown-menu dropdown-menu-end py-0 show"
                  aria-labelledby="profileDropdown"
                  style={{ left: "auto", right: 0 }}
                  ref={profileDropdownRef}
                >
                  <a className="dropdown-item" href="/employeeProfile">
                    <i className="align-middle me-1 bi bi-person"></i> Profile
                  </a>
                  <a className="dropdown-item" href onClick={handleResetPasswordClick}>
                    <i className="align-middle me-1 bi bi-key"></i> Reset Password
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href onClick={handleLogOut}>
                    <i className="align-middle bi bi-arrow-left-circle" style={{ paddingRight: "10px" }}></i>
                    Log out
                  </a>
                </div>
              )}
            </li>
          )}
          {(roles.includes("Accountant") || roles.includes("HR") || roles.includes("Admin")) && (
            <li className="nav-item dropdown position-relative">
              <a
                className="nav-link dropdown-toggle d-none d-sm-inline-block text-center"
                href
                onClick={toggleProfile}
              >
                <span className="text-dark p-2 mb-3">{employee?.firstName} {employee?.lastName}</span>
                <i className="bi bi-person-circle" style={{ fontSize: "22px" }}></i>
              </a>
              {isProfileOpen && (
                <div
                  className="dropdown-menu dropdown-menu-end py-0 show"
                  aria-labelledby="profileDropdown"
                  style={{ left: "auto", right: "20%" }}
                  ref={profileDropdownRef}
                >
                  <a className="dropdown-item" href={`editUser/${userId}`}>
                    <i className="align-middle me-1 bi bi-person"></i> Profile
                  </a>
                  <a className="dropdown-item" href onClick={handleResetPasswordClick}>
                    <i className="align-middle me-1 bi bi-key"></i> Reset Password
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href onClick={handleLogOut}>
                    <i className="align-middle bi bi-arrow-left-circle" style={{ paddingRight: "10px" }}></i>
                    Log out
                  </a>
                </div>
              )}
            </li>
          )}
          {roles.includes("candidate") && (
            <>
              <span className="mt-3">{employee?.firstName} {employee?.lastName}</span>
              <li className="nav-item">
                <a
                  className="nav-link d-none d-sm-inline-block text-center"
                  href
                  onClick={handleLogOut}
                  style={{ cursor: "pointer" }}
                >
                  <i className="align-middle bi bi-arrow-left-circle" style={{ paddingRight: "5px" }}></i>
                  Logout
                </a>
              </li>
            </>
          )}
        </ul>
      </div>
      <Reset
        companyName={companyName}
        show={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
      />
      <Modal show={showErrorModal} onHide={closeModal} centered style={{ zIndex: "1050" }}>
        <ModalHeader closeButton>
          <ModalTitle className="text-center">Error</ModalTitle>
          <button
            type="button"
            className="btn-close text-dark"
            aria-label="Close"
            onClick={closeModal}
          >X</button>
        </ModalHeader>
        <ModalBody className="text-center fs-bold">
          Session Timeout! Please log in.
        </ModalBody>
      </Modal>
    </nav>
  );
};

export default Header;