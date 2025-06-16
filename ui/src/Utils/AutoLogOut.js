import React, { useEffect, useRef } from 'react';

const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

function AutoLogout({ onLogout }) {
  const timerId = useRef(null);

  // Reset the inactivity timer
  const resetTimer = () => {
    if (timerId.current) clearTimeout(timerId.current);
    timerId.current = setTimeout(() => {
      onLogout();
    }, INACTIVITY_TIME);
  };

  useEffect(() => {
    // Events to listen for user activity
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Attach listeners for all events to reset timer
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Start the timer initially
    resetTimer();

    // Cleanup event listeners on unmount
    return () => {
      if (timerId.current) clearTimeout(timerId.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null; // This component does not render anything
}

export default AutoLogout;
