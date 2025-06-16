import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const AutoLogout = ({ userRole }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      console.error("Token decode failed", error);
      logout(); // invalid token
      return;
    }

    const expirationTime = decoded.exp * 1000; // convert to ms
    const currentTime = Date.now();
    const timeout = expirationTime - currentTime;

    if (timeout <= 0) {
      logout(); // already expired
      return;
    }

    // Optional: warn user 1 minute before logout
    const warningTime = timeout - 60000;
    const warningTimer =
      warningTime > 0
        ? setTimeout(() => {
            toast.warning("Session expiring in 1 minute...");
          }, warningTime)
        : null;

    const logoutTimer = setTimeout(() => {
      logout();
    }, timeout);

    return () => {
      clearTimeout(logoutTimer);
      if (warningTimer) clearTimeout(warningTimer);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    const companyName = localStorage.getItem("companyName");

    toast.info("Session expired. Logging out...");

    if (userRole === "ems_admin") {
      navigate("/login", { replace: true });
    } else if (
      ["company_admin", "Accountant", "HR", "Admin"].includes(userRole) &&
      companyName
    ) {
      navigate(`/${companyName}/login`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  return null; // this component renders nothing
};

export default AutoLogout;
