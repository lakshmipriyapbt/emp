import React from 'react';
import Routing from './Utils/Rout';
import { useSelector } from 'react-redux';
import AutoLogout from './Utils/AutoLogOut';

const App = () => {
  const isAuthenticated = useSelector(state => !!state.auth.userId); // or any auth flag

  const handleLogout = () => {
    // Only logout if user is authenticated
    if (isAuthenticated) {
      // your logout logic
      console.log("Logging out due to inactivity");
      // e.g. clear tokens, dispatch logout action, redirect, etc.
    }
  };

  return (
    <>
      {isAuthenticated && <AutoLogout onLogout={handleLogout} />}
      <Routing />
    </>
  );
};

export default App;
