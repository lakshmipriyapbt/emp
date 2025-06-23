import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AutoLogout = ({ timeout = 10 * 60 * 1000, userRole }) => {
  const [showPopup, setShowPopup] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    const companyName = localStorage.getItem("companyName");

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
  }, [navigate, userRole]);

  const handleLogout = useCallback(() => {
    setShowPopup(true);

    setTimeout(() => {
      logout();
      toast.error("You have been logged out due to inactivity.");
    }, 3000);
  }, [logout]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, timeout);
  }, [handleLogout, timeout]);

  useEffect(() => {
    resetTimer();
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return (
    <>
      {showPopup && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <p>You have been logged out due to inactivity.</p>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popup: {
    background: '#fff',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
  }
};

export default AutoLogout;
