import React, { useEffect } from 'react';
import { Route, Routes} from 'react-router';
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
import ExistsEmployesView from '../CompanyModule/ExistingProcess/ExistsEmployesView'
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
import CompanySalaryStructure from '../CompanyModule/Settings/CompanySalaryStructure';
import EmployeeSalaryList from '../CompanyModule/PayRoll/EmployeeSalaryList';
import Profile from '../LayOut/Profile';
import Message from '../LayOut/Message';
import PaySlipDoc from '../Login/PayslipDoc';
import EmployeeSalaryById from '../EmployeeModule/EmployeeSalaryById';
import Reset from '../LayOut/Reset';
import ForgotPassword from '../Login/ForgotPassword'
import EmployeeProfile from '../EmployeeModule/EmployeeProfile';
import EmployeeSalaryUpdate from '../CompanyModule/PayRoll/EmployeeSalaryUpdate';
import CompanySalaryView from '../CompanyModule/Settings/CompanySalaryView';
import ExperienceLetter from '../CompanyModule/Settings/Experience/ExperienceLetter';
import ExperienceForm from '../CompanyModule/Settings/Experience/ExperienceForm';
import ExperienceView from '../CompanyModule/Settings/Experience/ExperienceView';
import RelievingLetter from '../CompanyModule/Settings/Relieving/RelievingLetter';
import Preview from '../CompanyModule/Settings/Relieving/Preview';
import AppraisalTemplate from '../CompanyModule/Settings/Appraisal/AppraisalTemplate';
import InternShipTemplates from '../CompanyModule/Settings/Internship/InternShipTemplates';
import InternShipForm from '../CompanyModule/Settings/Internship/InternShipForm';
import PayslipUpdate1 from '../CompanyModule/PayRoll/PayslipUpdate/PayslipUpdate1';
import PayslipUpdate2 from '../CompanyModule/PayRoll/PayslipUpdate/PayslipUpdate2';
import PayslipUpdate3 from '../CompanyModule/PayRoll/PayslipUpdate/PayslipUpdate3';
import PayslipUpdate4 from '../CompanyModule/PayRoll/PayslipUpdate/PayslipUpdate4';
import PayslipTemplates from '../CompanyModule/Settings/PayslipTemplates';
import PayslipDoc1 from '../CompanyModule/PayRoll/Payslips/PayslipDoc1';
import PayslipDoc3 from '../CompanyModule/PayRoll/Payslips/PayslipDoc3';
import PayslipDoc2 from '../CompanyModule/PayRoll/Payslips/PayslipDoc2';
import PayslipDoc4 from '../CompanyModule/PayRoll/Payslips/PayslipDoc4';
import OfferLetters from '../CompanyModule/Settings/OfferLetter/OfferLetters';
import Template from '../CompanyModule/Settings/OfferLetter/Template';
import OfferLetterForm from '../CompanyModule/Settings/OfferLetter/OfferLetterForm';
import OfferLetterPreview from '../CompanyModule/Settings/OfferLetter/OfferLetterPreview';
import EmployeeSalaryView from '../EmployeeModule/EmployeeSalaryView';
import AccountRegistration from '../InvoiceModule/AccountDetails/AccountRegistration';
import AccountsView from '../InvoiceModule/AccountDetails/AccountsView';
import CustomersRegistration from '../InvoiceModule/Customers/CustomerRegistration';
import CustomersView from '../InvoiceModule/Customers/CustomersView'
import InvoiceRegistration from '../InvoiceModule/Invoice/InvoiceRegistration';
import InvoiceView from '../InvoiceModule/Invoice/InvoiceView';
import InvoicePdf from '../InvoiceModule/Invoice/InvoicePdf';
import ProductView from '../InvoiceModule/Products/ProductsView';
import ProductRegistration from '../InvoiceModule/Products/ProductRegistration'
import CreatePassword from '../Login/CreatePassword';
import EmployeeRegister from '../CompanyModule/Employee/EmployeeRegister';
import EmployeeSalaryStructureView from '../CompanyModule/PayRoll/EmployeeSalaryStructureView';
import InternOfferLetter from '../CompanyModule/Settings/Internship/InternOfferLetter/InternOfferLetter';
import InternOfferPrev from '../CompanyModule/Settings/Internship/InternOfferLetter/InternOfferPrev';
import InternOfferForm from '../CompanyModule/Settings/Internship/InternOfferLetter/InternOfferForm';
import ProtectedRoute from './ProtectedRoute';
import ForbiddenPage from './ForbiddenPage';


export const allAvailableRoutes = [
  {path: '/main', allowedTypes: ['ems_admin', 'company_admin', 'HR', 'employee']},
  {path: '/companyRegistration', allowedTypes: ['ems_admin'] },
  {path: '/companyView', allowedTypes: ['ems_admin'] },
  {path: '/companylogin', allowedTypes: ['company_admin'] },
  {path: '/accountsView', allowedTypes: ['company_admin'] },
  {path: '/forgotPassword', allowedTypes: ['company_admin']},
  {path: '/employeeSalary', allowedTypes: ['employee'] },
  {path: '/employeeProfile', allowedTypes: ['employee'] },
  {path: '/companySalaryStructure', allowedTypes: ['company_admin'] },
  {path: '/accountRegistration', allowedTypes: ['company_admin'] },
  {path: '/department', allowedTypes: ['company_admin', 'HR'] },
  {path: '/designation', allowedTypes: ['company_admin', 'HR'] },
  {path: '/employeeRegistration', allowedTypes: ['company_admin', 'HR'] },
  {path: '/employeeRegister', allowedTypes: ['company_admin', 'HR'] },
  {path: '/employeeView', allowedTypes: ['company_admin', 'HR'] },
  {path: '/experienceForm', allowedTypes: ['company_admin', 'HR'] },
  {path: '/experienceSummary', allowedTypes: ['company_admin', 'HR'] },
  {path: '/relievingSummary', allowedTypes: ['company_admin', 'HR'] },
  {path: '/appraisalLetter', allowedTypes: ['company_admin', 'HR'] },
  {path: '/incrementList', allowedTypes: ['company_admin', 'HR'] },
  {path: '/internOfferForm', allowedTypes: ['company_admin', 'HR'] },
  {path: '/internsLetter', allowedTypes: ['company_admin', 'HR'] },
  {path: '/addAttendance', allowedTypes: ['company_admin', 'HR'] },
  {path: '/attendanceReport', allowedTypes: ['company_admin', 'HR'] },
  {path: '/attendanceList', allowedTypes: ['company_admin', 'HR'] },
  {path: '/employeeSalaryStructure', allowedTypes: ['company_admin', 'HR'] },
  {path: '/employeesSalaryView', allowedTypes: ['company_admin', 'HR'] },
  {path: '/payslipGeneration', allowedTypes: ['company_admin', 'HR'] },
  {path: '/payslipsList', allowedTypes: ['company_admin', 'HR'] },
  {path: '/companySalaryView', allowedTypes: ['company_admin', 'HR'] },
  {path: '/offerLetters', allowedTypes: ['company_admin', 'HR'] },
  {path: '/offerLetterForm', allowedTypes: ['company_admin', 'HR'] },
  {path: '/offerLetterPreview', allowedTypes: ['company_admin', 'HR'] },
  {path: '/offerLetter', allowedTypes: ['company_admin', 'HR'] },
  {path: '/appraisalTemplates', allowedTypes: ['company_admin', 'HR'] },
  {path: '/experienceLetter', allowedTypes: ['company_admin', 'HR'] },
  {path: '/relievingProcess', allowedTypes: ['company_admin', 'HR'] },
  {path: '/relievingTemplates', allowedTypes: ['company_admin', 'HR'] },
  {path: '/relivingReview', allowedTypes: ['company_admin', 'HR'] },
  {path: '/internOfferTemplate', allowedTypes: ['company_admin', 'HR'] },
  {path: '/internsTemplates', allowedTypes: ['company_admin', 'HR'] },
  {path: '/internPrev', allowedTypes: ['company_admin', 'HR'] },
  {path: '/payslipTemplates', allowedTypes: ['company_admin', 'HR'] },
  {path: '/template', allowedTypes: ['company_admin', 'HR'] },
  {path: '/payslipUpdate1', allowedTypes: ['company_admin', 'HR'] },
  {path: '/payslipUpdate2', allowedTypes: ['company_admin', 'HR'] },
  {path: '/payslipUpdate3', allowedTypes: ['company_admin', 'HR'] },
  {path: '/payslipUpdate4', allowedTypes: ['company_admin', 'HR'] },
  {path: '/employeeSalaryList', allowedTypes: ['company_admin', 'HR'] },
  {path: '/customerRegistration', allowedTypes: ['company_admin', 'Accountant'] },
  {path: '/customersView', allowedTypes: ['company_admin', 'Accountant'] },
  {path: '/productRegistration', allowedTypes: ['company_admin', 'Accountant'] },
  {path: '/productView', allowedTypes: ['company_admin', 'Accountant'] },
  {path: '/invoiceRegistartion', allowedTypes: ['company_admin', 'Accountant'] },
  {path: '/invoiceView', allowedTypes: ['company_admin', 'Accountant'] },
  {path: '/invoicePdf', allowedTypes: ['company_admin', 'Accountant'] },
  {path: '/employeePayslip', allowedTypes: ['company_admin','HR','employee', 'Accountant'] },
  {path: '/payslipDoc1', allowedTypes: ['company_admin','HR','employee', 'Accountant'] },
  {path: '/payslipDoc2', allowedTypes: ['company_admin','HR','employee', 'Accountant'] },
  {path: '/payslipDoc3', allowedTypes: ['company_admin','HR','employee', 'Accountant'] },
  {path: '/payslipDoc4', allowedTypes: ['company_admin','HR','employee', 'Accountant'] }
];

const Routing = () => {
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Message />} />
      <Route path='login' element={<EmsLogin/>}/>
      <Route path='/:company/login' element={<CompanyLogin/>}/>
      <Route path='/resetPassword' element={<Reset />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/main' element={<Body />} />
      <Route path='/forgotPassword' element={<ForgotPassword/>}/>
      <Route path='/forbidden' element={<ForbiddenPage/>}/>


      {/* EMS Admin-specific routes */}
      <Route
        path="/companyRegistration"
        element={<ProtectedRoute element={<CompanyRegistration/>} allowedTypes={['ems_admin']} />}
      />
      <Route
        path="/companyView"
        element={<ProtectedRoute element={<CompanyView/>} allowedTypes={['ems_admin']} />}
      />
      

      {/* Company Admin-specific routes */}
      <Route
        path="/accountRegistration"
        element={<ProtectedRoute element={<AccountRegistration/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/accountsView"
        element={<ProtectedRoute element={<AccountsView/>} allowedTypes={['company_admin']} />}
      />
      <Route
        path="/companySalaryStructure"
        element={<ProtectedRoute element={<CompanySalaryStructure/>} allowedTypes={['company_admin']} />}
      />
      
      

      {/* Employee-specific routes */}
      <Route
        path="/employeeSalary"
        element={<ProtectedRoute element={<EmployeeSalaryView/>} allowedTypes={['employee']} />}
      />
      <Route
        path="/employeeProfile"
        element={<ProtectedRoute element={<EmployeeProfile/>} allowedTypes={['employee']} />}
      />

        
      {/* Company Admin & HR shared routes */}
      <Route
        path="/department"
        element={<ProtectedRoute element={<Department/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/designation"
        element={<ProtectedRoute element={<Designation/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/employeeRegistration"
        element={<ProtectedRoute element={<EmployeeRegistration/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/employeeRegister"
        element={<ProtectedRoute element={<EmployeeRegister/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/employeeView"
        element={<ProtectedRoute element={<EmployeeView/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/offerLetterForm"
        element={<ProtectedRoute element={<OfferLetterForm/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/offerLetterPreview"
        element={<ProtectedRoute element={<OfferLetterPreview/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/offerLetter"
        element={<ProtectedRoute element={<OfferLetter/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/experienceForm"
        element={<ProtectedRoute element={<ExperienceForm/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/experienceSummary"
        element={<ProtectedRoute element={<ExperienceView/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/relievingSummary"
        element={<ProtectedRoute element={<ExistsEmployesView/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/appraisalLetter"
        element={<ProtectedRoute element={<AddIncrement/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/incrementList"
        element={<ProtectedRoute element={<ViewIncrement/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/internOfferForm"
        element={<ProtectedRoute element={<InternOfferForm/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/internOfferTemplate"
        element={<ProtectedRoute element={<InternOfferLetter/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/internsLetter"
        element={<ProtectedRoute element={<InternShipForm/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/internPrev"
        element={<ProtectedRoute element={<InternOfferPrev/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/addAttendance"
        element={<ProtectedRoute element={<ManageAttendance/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/attendanceReport"
        element={<ProtectedRoute element={<AttendanceReport/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/attendanceList"
        element={<ProtectedRoute element={<AttendanceList/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/employeeSalaryStructure"
        element={<ProtectedRoute element={<EmployeeSalaryStructure/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/employeesSalaryView"
        element={<ProtectedRoute element={<EmployeeSalaryStructureView/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/payslipGeneration"
        element={<ProtectedRoute element={<GeneratePaySlip/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/payslipsList"
        element={<ProtectedRoute element={<ViewPaySlips/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/companySalaryView"
        element={<ProtectedRoute element={<CompanySalaryView/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/offerLetters"
        element={<ProtectedRoute element={<OfferLetters/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/appraisalTemplates"
        element={<ProtectedRoute element={<AppraisalTemplate/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/experienceLetter"
        element={<ProtectedRoute element={<ExperienceLetter/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/relievingProcess"
        element={<ProtectedRoute element={<ExistsEmpRegistration/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/relievingTemplates"
        element={<ProtectedRoute element={<RelievingLetter/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/relivingReview"
        element={<ProtectedRoute element={<Preview/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/internsTemplates"
        element={<ProtectedRoute element={<InternShipTemplates/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/payslipTemplates"
        element={<ProtectedRoute element={<PayslipTemplates/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/template"
        element={<ProtectedRoute element={<Template/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/payslipUpdate1"
        element={<ProtectedRoute element={<PayslipUpdate1/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/payslipUpdate2"
        element={<ProtectedRoute element={<PayslipUpdate2/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/payslipUpdate3"
        element={<ProtectedRoute element={<PayslipUpdate3/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/payslipUpdate4"
        element={<ProtectedRoute element={<PayslipUpdate4/>} allowedTypes={['company_admin', 'HR']} />}
      />
      <Route
        path="/employeeSalaryList"
        element={<ProtectedRoute element={<EmployeeSalaryList/>} allowedTypes={['company_admin', 'HR']} />}
      />


      {/* Company Admin & Accountant shared routes */}
      <Route
        path="/customerRegistration"
        element={<ProtectedRoute element={<CustomersRegistration/>} allowedTypes={['company_admin' , 'Accountant']} />}
      />
      <Route
        path="/customersView"
        element={<ProtectedRoute element={<CustomersView/>} allowedTypes={['company_admin' , 'Accountant']} />}
      />
      <Route
        path="/productView"
        element={<ProtectedRoute element={<ProductView/>} allowedTypes={['company_admin' , 'Accountant']} />}
      />
      <Route
        path="/productRegistration"
        element={<ProtectedRoute element={<ProductRegistration/>} allowedTypes={['company_admin' , 'Accountant']} />}
      />
      <Route
        path="/invoiceRegistartion"
        element={<ProtectedRoute element={<InvoiceRegistration/>} allowedTypes={['company_admin' , 'Accountant']} />}
      />
      <Route
        path="/invoiceView"
        element={<ProtectedRoute element={<InvoiceView/>} allowedTypes={['company_admin' , 'Accountant']} />}
      />
      <Route
        path="/invoicePdf"
        element={<ProtectedRoute element={<InvoicePdf/>} allowedTypes={['company_admin' , 'Accountant']} />}
      />


      {/* employee & Accountant shared routes */}
      <Route
        path="/employeePayslip"
        element={<ProtectedRoute element={<EmployeePayslips/>} allowedTypes={['employee' , 'Accountant']} />}
      />

      {/* company_admin, HR, employee & Accountant shared routes */}

      <Route
        path="/payslipDoc1"
        element={<ProtectedRoute element={<PayslipDoc1/>} allowedTypes={['company_admin','HR','employee', 'Accountant']} />}
      />
      <Route
        path="/payslipDoc2"
        element={<ProtectedRoute element={<PayslipDoc2/>} allowedTypes={['company_admin','HR','employee', 'Accountant']} />}
      />
      <Route
        path="/payslipDoc3"
        element={<ProtectedRoute element={<PayslipDoc3/>} allowedTypes={['company_admin','HR','employee', 'Accountant']} />}
      />
      <Route
        path="/payslipDoc4"
        element={<ProtectedRoute element={<PayslipDoc4/>} allowedTypes={['company_admin','HR','employee', 'Accountant']} />}
      />
    
    </Routes>
  );
};

export default Routing;

