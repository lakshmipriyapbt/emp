import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext';



const Protected = () => {
  const {authUser}=useAuth();
return authUser.userId?<Outlet/>:<Navigate to={'/'}/>
}
export default Protected;