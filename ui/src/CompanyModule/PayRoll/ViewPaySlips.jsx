import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LayOut from '../../LayOut/LayOut';
import DataTable from 'react-data-table-component';
import { Eye } from 'react-bootstrap-icons';
import { AllEmployeePayslipsGet, EmployeeGetApi, EmployeeGetApiById, EmployeePayslipsGet, TemplateGetAPI } from '../../Utils/Axios';

const ViewPaySlips = () => {
  const { control, formState: { errors } } = useForm();
  const [employees, setEmployees] = useState([]);
  const [showFields, setShowFields] = useState(false);
  const [employeeSalaryView, setEmployeeSalaryView] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [apiSource, setApiSource] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showSpinner, setShowSpinner] = useState(false);
  const [noRecords, setNoRecords] = useState(false);
  const [payslipTemplates, setPayslipTemplates] = useState([]); 
  const [selectedTemplate, setSelectedTemplate] = useState(null); 
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await EmployeeGetApi();
        if (Array.isArray(data)) {
          const filteredData = data
            .filter(employee => employee.firstName)
            .map(({ id, firstName, lastName, employeeId }) => ({
              label: `${firstName} ${lastName} (${employeeId})`,
              value: id,
            }));
          setEmployees(filteredData);
        } else {
          console.error("Unexpected data format from EmployeeGetApi:", data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const currentYear = new Date().getFullYear();
  const startYear = 2000;
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => ({
      value: (startYear + index).toString(),
      label: (startYear + index).toString(),
    })
  ).reverse();

  const months = Array.from({ length: 12 }, (_, index) => ({
    value: (index + 1).toString().padStart(2, "0"),
    label: new Date(2000, index, 1).toLocaleString("default", { month: "long" }),
  }));

  const fetchData = async (employeeId, monthName, year) => {
    setShowSpinner(true);
    setNoRecords(false);
    try {
      if (employeeId && monthName && year) {
        setApiSource("individual");
        const [employeeDetailsResponse, payslipsResponse] = await Promise.all([
          EmployeeGetApiById(employeeId),
          EmployeePayslipsGet(employeeId, monthName, year),
        ]);

        if (employeeDetailsResponse && payslipsResponse) {
          setSelectedEmployeeDetails(employeeDetailsResponse.data || {});
          if (payslipsResponse.data.data.length === 0) {
            setNoRecords(true);
          } else {
            setEmployeeSalaryView(payslipsResponse.data.data || []);
          }
        } else {
          console.error("Unexpected response format from APIs");
        }
      } else {
        setSelectedEmployeeDetails({});
        setEmployeeSalaryView([]);
        setNoRecords(true);
      }
    } catch (error) {
      // handleApiErrors(error);
      setNoRecords(true);
    } finally {
      setShowSpinner(false);
    }
  };

  const handleGoClick = () => {
    if (!selectedYear) {
      alert("Please select a year.");
      return;
    }
    const monthName = getMonthNames()[parseInt(selectedMonth, 10) - 1];
    fetchData(selectedEmployeeId, monthName, selectedYear);
  };

  const fetchTemplate = async () => {
    try {
      const response = await TemplateGetAPI();
      const templateData = response.data.data; // Assuming this is where your template details are
      setCurrentTemplate(templateData); // Set the template data correctly
      console.log("Fetched Payslip Template:", templateData); // Log for debugging
    } catch (error) {
      console.error("API fetch error:", error);
      toast.error("Failed to fetch payslip templates. Please try again.");
    }
  };
  
  useEffect(() => {
    fetchTemplate();
  }, []);

  const handleViewSalary = (employeeId, payslipId) => {
    const payslipTemplateNo = currentTemplate?.payslipTemplateNo || "default"; 
    let url;
    switch (payslipTemplateNo) {
      case "1":
        url = `/payslipDoc1?employeeId=${employeeId}&payslipId=${payslipId}`;
        break;
      case "2":
        url = `/payslipDoc2?employeeId=${employeeId}&payslipId=${payslipId}`;
        break;
      case "3":
        url = `/payslipDoc3?employeeId=${employeeId}&payslipId=${payslipId}`;
        break;
      case "4":
        url = `/payslipDoc4?employeeId=${employeeId}&payslipId=${payslipId}`;
        break;
      default:
        console.error("Invalid payslip template number:", payslipTemplateNo);
        return;
    }
  
    navigate(url, {
      state: {
        employeeDetails: selectedEmployeeDetails,
      },
    });
  };
  
  
  const getMonthAndYear = () => {
    if (employeeSalaryView.length > 0) {
      const firstRecord = employeeSalaryView[0];
      return `${firstRecord.month} ${firstRecord.year}`;
    }
    return "";
  };

  const getMonthNames = () => {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("en-US", { month: "long" })
    );
  };

  useEffect(() => {
    const fetchAllPayslips = async () => {
      try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const monthNames = getMonthNames();
        const monthName = monthNames[currentMonth - 2];
        setApiSource("all");
        const response = await AllEmployeePayslipsGet(monthName, currentYear);
        console.log("All Employee Payslips:", response.data);
        if (response.data.data.length === 0) {
          setNoRecords(true);
        } else {
          setEmployeeSalaryView(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching all employee payslips:', error);
        setNoRecords(true);
        handleApiErrors(error)
      }
    };
    fetchAllPayslips();
  }, []);

  const handleApiErrors = (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error &&
      error.response.data.error.message
    ) {
      const errorMessage = error.response.data.error.message;
      // toast.error(errorMessage);
    } else {
      toast.error("Network Error!");
    }
    console.error(error.response || error);
  };

  const isGoButtonEnabled = selectedEmployeeId && selectedMonth && selectedYear;

  const columns = apiSource === 'all'
    ? [
      {
        name: <h6><b>S No</b></h6>,
        selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
        width: "80px",
      },
      {
        name: <h6><b>Name</b></h6>,
        selector: row => `${row.attendance.firstName} ${row.attendance.lastName}`,
        width: "250px",
      },
      {
        name: <h6><b>Month</b></h6>,
        selector: row => `${row.month}`,
        width: "150px",
      },
      {
        name: <h6><b>Year</b></h6>,
        selector: row => `${row.year}`,
        width: "150px",
      },
      {
        name: <h6><b>Net Amount</b></h6>,
        selector: row => parseFloat(row.salary.netSalary).toFixed(2),
        width: "200px",
      },
      {
        name: <h6><b>Actions</b></h6>,
        cell: row => (
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent", border: "none", padding: "0", marginLeft: "18px" }}
            onClick={() => handleViewSalary(row.employeeId, row.payslipId)}
            title="View Payslip"
          >
            <Eye size={22} color="green" />
          </button>
        ),
      },
    ] : [
      {
        name: <h6><b>Net Amount</b></h6>,
        selector: row => parseFloat(row.salary.netSalary).toFixed(2),
        width: "600px",
      },
      {
        name: <h6><b>Actions</b></h6>,
        cell: row => (
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent", border: "none", padding: "0", marginLeft: "18px" }}
            onClick={() => handleViewSalary(row.employeeId, row.payslipId)}
            title="View Payslip"
          >
            <Eye size={22} color="green" />
          </button>
        ),
      },
    ];

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong> PaySlips</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: '20px' }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">PayRoll</li>
                <li className="breadcrumb-item active">PaySlips</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="card mb-3">
          <div className="card-body justify-content-around">
            <div className="row d-flex justify-content-around">
              <div className="col-12 col-md-3">
                <div className="form-group">
                  <label className="form-label" style={{ paddingTop: "10px" }}>Select Employee</label>
                  <Controller
                    name="employeeId"
                    control={control}
                    defaultValue=""
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={employees}
                        value={employees.find((option) => option.value === field.value) || ""}
                        onChange={(val) => {
                          field.onChange(val.value);
                          setSelectedEmployeeId(val.value);
                          setShowFields(true);
                        }}
                        placeholder="Select Employee"
                      />
                    )}
                  />
                  {errors.employeeId && (
                    <p className="errorMsg">Employee Name is required</p>
                  )}
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="form-group">
                  <label className="form-label" style={{ paddingTop: "10px" }}>Select Year</label>
                  <Select
                    options={years}
                    value={years.find((option) => option.value === selectedYear) || ""}
                    onChange={(selectedOption) => setSelectedYear(selectedOption.value)}
                    placeholder="Select Year"
                  />
                </div>
              </div>
              <div className="col-12 col-md-3">
                <div className="form-group">
                  <label className="form-label" style={{ paddingTop: "10px" }}>Select Month</label>
                  <Select
                    options={months}
                    value={months.find((month) => month.value === selectedMonth) || ""}
                    onChange={(selectedOption) => setSelectedMonth(selectedOption.value)}
                    placeholder="Select Month"
                  />
                </div>
              </div>
              <div className="col-12 col-md-3 mt-4">
                <div className="form-group">
                  <button
                    type="button"
                    style={{ marginTop: "8px", paddingBottom: "8px" }}
                    className="btn btn-primary btn-block"
                    onClick={handleGoClick}
                    disabled={!isGoButtonEnabled}
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
            {showFields ? (
              <div>
                <h5 className="card-title mt-4 text-secondary" >
                  PaySlip Details for {selectedEmployeeDetails.firstName ? `${selectedEmployeeDetails.firstName} ${selectedEmployeeDetails.lastName} (${selectedEmployeeDetails.employeeId})` : 'All Employees'}
                  {selectedYear && ` - ${selectedYear}`}
                  {selectedMonth && ` - ${getMonthNames()[selectedMonth - 1]}`}
                </h5>
                <hr />
                {noRecords ? (
                  <p style={{ textAlign: "center" }}>There are no records to display.</p>
                ) : (
                  <DataTable
                    columns={columns}
                    data={employeeSalaryView}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    dense
                  />
                )}
              </div>
            ) : (
              <div>
                <h5 className="card-title mt-4">
                  PaySlip Details for {getMonthAndYear()}
                </h5>
                <hr />
                {noRecords ? (
                  <p style={{ textAlign: "center" }}>There are no records to display.</p>
                ) : (
                  <DataTable
                    columns={columns}
                    data={employeeSalaryView}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    dense
                    onChangePage={page => setCurrentPage(page)}
                    onChangeRowsPerPage={perPage => setRowsPerPage(perPage)}
                  />
                )}
              </div>
            )}
            {showSpinner && (
              <div className="spinner-container" style={{ margin: "15% 0 0 45%" }}>
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default ViewPaySlips;