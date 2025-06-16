import { configureStore } from '@reduxjs/toolkit';
import authReducer from './AuthSlice';
import BankReducer from './BankSlice'
import CustomerReducer from './CustomerSlice';
import ProductReducer from './ProductSlice';
import InvoiceReducer from './InvoiceSlice';
import employeeReducer from './EmployeeSlice';
import calendarReducer from './CalendarSlice';
import TdsReducer from './TdsSlice'
import departmentReducer from './DepartmentSlice'
import designationReducer from './DesignationSlice'
import UserReducer from './UserSlice'
import CandidateReducer from './CandidateSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: CustomerReducer,
    banks:BankReducer,
    products:ProductReducer,
    invoices:InvoiceReducer,
    employees: employeeReducer, // Add employee slice reducer to store
    calendar:calendarReducer,
    tds:TdsReducer,
    departments:departmentReducer,
    designations:designationReducer,
    users:UserReducer,
    candidates:CandidateReducer
  },
});

export default store;
