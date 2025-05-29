import React, { useEffect, useState } from 'react';
import LayOut from './LayOut';
import { useAuth } from '../Context/AuthContext';
import { EmployeeGetApi } from '../Utils/Axios';
import { toast } from 'react-toastify';
import { PeopleFill, PersonFillCheck, PersonFillExclamation } from 'react-bootstrap-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../Redux/EmployeeSlice';
import Loader from '../Utils/Loader';
import { useNavigate } from 'react-router-dom';
import DashboardCalendar from '../Calender/DashboardCalendar';
import TaxSlab from '../CompanyModule/TDS/TaxSlab';

const Body = () => {
  const [data, setData] = useState({
    totalEmployeesCount: 0,
    activeEmployeesCount: 0,
    RelievedEmployeesCount: 0
  });
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: employees = [], status } = useSelector(
    (state) => state.employees
  );

  useEffect(() => {
    if (authUser) {
      dispatch(fetchEmployees())
        .finally(() => {
          setLoading(false);
        });
    }
  }, [dispatch, authUser]);

  useEffect(() => {
    const employeeData = employees || [];
    const activeEmployeesCount = employeeData.filter(emp => emp.status === 'Active').length;
    const RelievedEmployeesCount = employeeData.filter(emp => emp.status === 'relieved').length;

    setData({
      totalEmployeesCount: employeeData.length,
      activeEmployeesCount,
      RelievedEmployeesCount
    });
  }, [employees]);

  if (!authUser) return <Loader />;

  if (loading) return <Loader />;

  const isAdmin = authUser?.userRole?.includes("ems_admin");
  const isCompanyAdmin = authUser?.userRole?.includes("company_admin");

  const handleTotalEmployeesClick = () => {
    navigate('/totalEmployees');
  };
  const handleActiveEmployeesClick = () => {
    navigate('/employeeList/Active');
  };
  
  const handleRelievedEmployeesClick = () => {
    navigate('/employeeList/Relieved');
  };

  return (
   <LayOut>
  <div className="container-fluid p-0 h-100" style={{ height: "100%" }}>
    <h1 className="h3 mb-3">
      <strong>Dashboard</strong>
    </h1>
    <div className="row h-100">
      {!isCompanyAdmin ? (
        // EMS Admin View
        <div className='card' style={{ height: '100vh' }}>
          <iframe
            src="https://cubhrm.com:5601/kibana/s/ems/app/dashboards#/view/274b991a-5aa5-4c53-8d7d-b9412e71609d?&embed=true"
            height="100%"
    width="100%"
    title="EMS Dashboard"
    style={{ border: 'none', height: '100%', width: '100%' }}
          />
        </div>
      ) : !isAdmin ? (
        // Company Admin View - You can customize this section as needed
        <div className='card'>
          <iframe
            src="YOUR_COMPANY_ADMIN_DASHBOARD_URL"
            height="3500"
            width="800"
            title="Company Dashboard"
            style={{ border: 'none' }}
          />
        </div>
      ) : (
        // Regular User View (the existing dashboard with cards)
        <>
          <div className="row">
            <div className="col-xl-4 col-12 mb-3">
              <div
                className="card mt-3"
                style={{ cursor: 'pointer' }}
                onClick={handleTotalEmployeesClick}
              >
                <div className="card-body mt-3">
                  <div className="d-flex align-items-center mb-2">
                    <PeopleFill color='blue' size={30} className="me-3" />
                    <div>
                      <h5 className="card-title fw-bold" style={{ color: "black" }}>Total Employees</h5>
                      <h1 className="mt-1">{data.totalEmployeesCount}</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-12 mb-3">
              <div
                className="card mt-3"
                style={{ cursor: 'pointer' }}
                onClick={handleActiveEmployeesClick}
              >
                <div className="card-body mt-3">
                  <div className="d-flex align-items-center mb-2">
                    <PersonFillCheck color='green' size={30} className="me-3" />
                    <div>
                      <h5 className="card-title fw-bold" style={{ color: "black" }}>Active Employees</h5>
                      <h1 className="mt-1">{data.activeEmployeesCount}</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-12 mb-3">
              <div
                className="card mt-3"
                style={{ cursor: 'pointer' }}
                onClick={handleRelievedEmployeesClick}
              >
                <div className="card-body mt-3">
                  <div className="d-flex align-items-center mb-2">
                    <PersonFillExclamation color='red' size={30} className="me-3" />
                    <div>
                    <h5 className="card-title fw-bold" style={{ color: "black" }}>Relieved Employees</h5>
                      <h1 className="mt-1">{data.RelievedEmployeesCount}</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="card h-100 p-4">
                <DashboardCalendar />
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 p-4">
                <TaxSlab />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
</LayOut>

  );
};

export default Body;