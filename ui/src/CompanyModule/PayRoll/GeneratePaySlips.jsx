import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { Bounce, toast } from "react-toastify";
import DataTable from "react-data-table-component";
import LayOut from "../../LayOut/LayOut";
import { AllEmployeePayslipsGet, companyViewByIdApi, EmployeeGetApiById, EmployeePayslipGeneration, EmployeePayslipGetById } from "../../Utils/Axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { PencilSquare } from "react-bootstrap-icons";

const GeneratePaySlip = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const [view, setView] = useState([]);
  const [show, setShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedSalaryId, setExpandedSalaryId] = useState(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [noRecords, setNoRecords] = useState(false);
  const [companyData, setCompanyData] = useState({});
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [apiSource, setApiSource] = useState("");
  const [payslipData, setPayslipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logoFileName } = useAuth();
  const [employeeSalaryView, setEmployeeSalaryView] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const employeeId = queryParams.get("employeeId");
  const payslipId = queryParams.get("payslipId");
  console.log("EmployeeId:", employeeId);
  console.log("PayslipId:", payslipId);

  useEffect(() => {
    console.log("Location Search:", location.search);
    console.log("Employee ID on mount:", employeeId);
  }, [employeeId, location.search]);

  const currentYear = new Date().getFullYear();
  const startYear = 2000;
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  ).reverse();

  const months = Array.from({ length: 12 }, (_, index) => ({
    value: (index + 1).toString().padStart(2, "0"),
    label: new Date(2000, index, 1).toLocaleString("default", {
      month: "long",
    }),
  }));

  const getMonthNames = () => {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("en-US", { month: "long" })
    );
  };


  const onSubmit = (data) => {
    const { month, year } = data;

    // Capitalize the first letter of the month label
    const capitalizedMonth = month.label.charAt(0).toUpperCase() + month.label.slice(1);

    const payload = {
      companyName: user.company,
      month: capitalizedMonth, // Use the capitalized month
      year: year.label,
    };

    EmployeePayslipGeneration(payload)
      .then((response) => {
        toast.success("PaySlips Generated Successfully", {
          position: "top-right",
          transition: Bounce,
          hideProgressBar: true,
          theme: "colored",
          autoClose: 3000,
        });

        setView(response.data); // Update view state with fetched data
        setSelectedMonthYear(`${capitalizedMonth} ${year.label}`); // Update selected month-year
        setShow(true); // Show the DataTable component
        navigate('/payslipsList'); // Navigate to payslips list page
      })
      .catch((error) => {
        handleApiErrors(error);
      });
  };
  const handleApiErrors = (error) => {
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error !");
    }
    console.error(error.response);
  };

  const handleCheckboxChange = (employeeId) => {
    setSelectedEmployees((prevSelected) =>
      prevSelected.includes(employeeId)
        ? prevSelected.filter((id) => id !== employeeId)
        : [...prevSelected, employeeId]
    );
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(view.map((employee) => employee.employeeId));
    }
    setSelectAll(!selectAll);
  };

  const handleGeneratePaySlips = async () => {
    const promises = selectedEmployees.map((employeeId) =>
      EmployeePayslipGeneration({
        month: selectedMonthYear.split(" ")[0],
        year: selectedMonthYear.split(" ")[1],
        employeeId: employeeId,
      })
    );

    try {
      await Promise.all(promises);
      toast.success("Payslips Generated Successfully", {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
    } catch (error) {
      handleApiErrors(error);
    }
  };

  const columns = [
    {
      name: (
        <input
          type="checkbox"
          className="form-check-input"
          checked={selectAll}
          onChange={handleSelectAllChange}
        />
      ),
      selector: "employeeId",
      cell: (row) => (
        <input
          type="checkbox"
          className="form-check-input"
          checked={selectedEmployees.includes(row.employeeId)}
          onChange={() => handleCheckboxChange(row.employeeId)}
        />
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: <h6><b>S No</b></h6>,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "90px",
    },
    {
      name: <h6><b>Name</b></h6>,
      selector: "employeeName",
      cell: (row) => `${row.attendance.firstName} ${row.attendance.lastName}`,
      width: "150px"
    },
    {
      name: <h6><b>Email ID</b></h6>,
      selector: "emailId",
      cell: (row) => row.attendance.emailId,
      width: "220px"
    },
    {
      name: <h6><b>Net Salary</b></h6>,
      selector: "netSalary",
      cell: (row) => row.salary.netSalary,
      width: "150px"
    },
    {
      name: <h6><b>Month/year</b></h6>,
      selector: "month",
      cell: (row) => `${row.month}/ ${row.year}`,
      width: "200px"
    },
    {
      name: <h6><b>Actions</b></h6>,
      cell: (row) => (
        <button
          className="btn btn-sm"
          style={{ backgroundColor: "transparent", border: "none", padding: "0", marginRight: "10px" }}
          onClick={(e) => handleEditClick(row.employeeId, row.payslipId, e)}
          title="Edit"
        >
          <PencilSquare size={22} color='#2255a4' />
        </button>
      ),
    },
  ];
  const fetchCompanyData = async (companyId) => {
    try {
      const response = await companyViewByIdApi(companyId);
      setCompanyData(response.data);
    } catch (err) {
      console.error("Error fetching company data:", err);
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await EmployeeGetApiById(employeeId);
      setEmployeeDetails(response.data);
      const companyId = response.data.companyId;
      fetchCompanyData(companyId);
    } catch (err) {
      console.error("Error fetching employee details:", err);
    }
  };

  const handleEditClick = (employeeId, payslipId) => {
    navigate(`/payslipUpdate?employeeId=${employeeId}&payslipId=${payslipId}`);
  };

  useEffect(() => {
    const fetchAllPayslips = async () => {
      try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const monthNames = getMonthNames();
        const monthName = monthNames[currentMonth - 1];
        setApiSource("all");
        setExpandedSalaryId(null);
        const response = await AllEmployeePayslipsGet(monthName, currentYear);
        if (response.data.data.length === 0) {
          setNoRecords(true);
        } else {
          setEmployeeSalaryView(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching all employee payslips:', error);
        setNoRecords(true);
      }
    };
    fetchAllPayslips();
  }, []);

  const fetchPayslipData = async () => {
    if (!employeeId || !payslipId) return;
    try {
      const response = await EmployeePayslipGetById(employeeId, payslipId);
      setPayslipData(response.data.data);
    } catch (err) {
      console.error("Error fetching payslip data:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (employeeId) {
      fetchEmployeeDetails(employeeId);
    }
    if (employeeId && payslipId) {
      fetchPayslipData();
    }
    setLoading(false);
  }, [employeeId, payslipId, user]);

  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Generate Payslips</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: '20px' }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Payroll</li>
                <li className="breadcrumb-item active">Generate Payslips</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Generate PaySlips</h5>
                <div className="dropdown-divider" style={{ borderTopColor: "#D7D9DD" }} />
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Select Year</label>
                      <Controller
                        name="year"
                        control={control}
                        defaultValue=""
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={years.map((year) => ({ value: year, label: year.toString() }))}
                            placeholder="Select Year"
                          />
                        )}
                      />
                      {errors.year && <p className="errorMsg">Year is Required</p>}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Select Month</label>
                      <Controller
                        name="month"
                        control={control}
                        defaultValue={null}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={months}
                            placeholder="Select Month"
                          />
                        )}
                      />
                      {errors.month && <p className="errorMsg">Month is Required</p>}
                    </div>
                    <div className="col-12 d-flex justify-content-end mt-5">
                      <button
                        className="btn btn-primary btn-lg"
                        type="submit"
                        style={{ marginRight: "65px" }}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* {show && ( */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title" style={{ paddingLeft: "15px", marginTop: "10px" }}>Month/Year : {selectedMonthYear}</h5>
            </div>
            <div
              className="dropdown-divider"
              style={{ borderTopColor: "#d7d9dd" }}
            />
            <DataTable
              columns={columns}
              data={employeeSalaryView}
              pagination
              onChangePage={page => setCurrentPage(page)}
              onChangeRowsPerPage={perPage => setRowsPerPage(perPage)}
            />
            <div className="m-3 d-flex justify-content-end bg-transparent">
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleGeneratePaySlips}
              >
                Generate PaySlips
              </button>
            </div>
          </div>
        </div>
       {/* )} */}
    </LayOut>
  );
};

export default GeneratePaySlip;