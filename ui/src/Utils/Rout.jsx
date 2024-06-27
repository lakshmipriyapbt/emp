import React from 'react'
import { Route, Routes } from 'react-router';
import EmsLogin from '../Login/EmsLogin';
import CompanyLogin from '../Login/CompanyLogin';
import CompanyRegistration from '../EMSModule/Company/CompanyRegistration';
import Body from '../LayOut/Body';
import CompanyView from '../EMSModule/Company/CompanyView';
import Department from '../CompanyModule/Department/Department';
import Designation from '../CompanyModule/Designation/Designation';
import EmployeeRegistration from '../CompanyModule/Employee/EmployeeRegistration';
import EmployeeView from '../CompanyModule/Employee/EmployeeView';
import ExistsEmpRegistration from '../CompanyModule/ExistingProcess/ExistsEmpRegistration';
import ExistsEmployeeView from '../CompanyModule/ExistingProcess/ExistsEmployesView';
import EmployeeSalaryStructure from '../CompanyModule/PayRoll/EmployeeSalaryStructure';
import GeneratePaySlip from '../CompanyModule/PayRoll/GeneratePaySlips';
import ViewPaySlips from '../CompanyModule/PayRoll/ViewPaySlips';
import AddIncrement from '../CompanyModule/PayRoll/Hike/AddIncrement';
import ViewIncrement from '../CompanyModule/PayRoll/Hike/ViewIncrementList';
import ManageAttendance from '../CompanyModule/Attendance/ManageAttendance';
import AttendanceList from '../CompanyModule/Attendance/AttendanceList';
import AttendanceReport from '../CompanyModule/Attendance/AttendanceReport';
import EmployeePayslips from '../EmployeeModule/EmployeePayslips';
import OfferLetter from '../EmployeeModule/OfferLetter';
import PaySlipLetter from '../EmployeeModule/PaySlipLetter';
import HikeLetter from '../EmployeeModule/HikeLetter';
import ExistingLetter from '../EmployeeModule/ExistingLetter';
import CompanySalaryStructure from '../CompanyModule/PayRoll/CompanySalaryStructure';
import EmployeeSalaryList from '../CompanyModule/PayRoll/EmployeeSalaryList';
import Message from '../LayOut/Message';




const Rout = () => {
  return (
    <Routes>
      <Route path='/' element={<Message />}></Route>
      <Route path='/emsAdmin/login' element={<EmsLogin />}></Route>
      <Route path='/:companyName/login' element={<CompanyLogin />}></Route>
      <Route path='/main' element={<Body />}></Route>
      <Route path='/companyRegistration' element={<CompanyRegistration />}></Route>
      <Route path='/companyView' element={<CompanyView />}></Route>
      <Route path='/department' element={<Department />}></Route>
      <Route path='/designation' element={<Designation />}></Route>
      <Route path='/employeeRegistration' element={<EmployeeRegistration />}></Route>
      <Route path='/employeeView' element={<EmployeeView />}></Route>
      <Route path='/existingProcess' element={<ExistsEmpRegistration />}></Route>
      <Route path='/existingList' element={<ExistsEmployeeView />}></Route>
      {/* <Route path='/payroll'> */}
      <Route path='/companySalaryStructure' element={<CompanySalaryStructure />}></Route>
      <Route path='/employeeSalaryStructure' element={<EmployeeSalaryStructure />}></Route>
      <Route path='/employeeSalaryList' element={<EmployeeSalaryList />}></Route>
      <Route path='/payslipGeneration' element={<GeneratePaySlip />}></Route>
      <Route path='/payslipsList' element={<ViewPaySlips />}></Route>
      <Route path='/increment' element={<AddIncrement />}></Route>
      <Route path='/incrementList' element={<ViewIncrement />}></Route>
      {/* </Route> */}
      {/* <Route path='/attendance'> */}
      <Route path='/addAttendance' element={<ManageAttendance />}></Route>
      <Route path='/attendanceList' element={<AttendanceList />}></Route>
      <Route path='/attendanceReport' element={<AttendanceReport />}></Route>
      {/* </Route> */}
      <Route path='employeePayslip' element={<EmployeePayslips />}></Route>
      <Route path='/offerLetter' element={<OfferLetter />}></Route>
      <Route path='/payslipLetter' element={<PaySlipLetter />}></Route>
      <Route path='/hikeLetter' element={<HikeLetter />}></Route>
      <Route path='/existingEmployee' element={<ExistingLetter />}></Route>
    </Routes>
  )
}

export default Rout