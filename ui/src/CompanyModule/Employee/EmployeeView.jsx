import React, { useState, useEffect } from "react";
import { PencilSquare, Wallet} from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import { downloadEmployeeBankDataAPI, downloadEmployeesFileAPI} from "../../Utils/Axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../../Redux/EmployeeSlice";
import Loader from "../../Utils/Loader";

const EmployeeView = () => {
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const Navigate = useNavigate();
  const dispatch = useDispatch(); // Initialize dispatch function

  // Select employee state from Redux store
  const { data: employees, status, error } = useSelector(
    (state) => state.employees
  );

  // Step 1: Fetch employees when component mounts
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Step 2: Display loading or error messages
  if (status === "loading") return <Loader/>;
  if (status === "failed") return <Loader/>;

  const getMonthNames = () => {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("en-US", { month: "long" })
    );
  };

  const getRecentYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
      years.push(i.toString());
    }
    return years;
  };

  const handleSalary = (id) => {
    Navigate(`/employeeSalaryList?id=${id}`);
  };


  const handleEdit = (id) => {
    Navigate(`/employeeRegister`, { state: { id } });
  };

  const statusMappings = {
    Active: {
      label: (
        <b
          style={{
            borderRadius: "5px",
            padding: "3px 6px",
            color: "#fff",
            background: "green"
          }}
          // className="bg-primary"
        >
          Active
        </b>
      ),
    },
    NoticePeriod: {
      label: (
        <b
          style={{
            borderRadius: "5px",
            padding: "3px 6px",
            color: "#fff",
          }}
          className="bg-warning"
        >
          Notice Period
        </b>
      ),
    },
    InActive: {
      label: (
        <b
          style={{
            borderRadius: "5px",
            padding: "3px 6px",
            color: "#fff",
            background:"red",
          }}
          // className="bg-danger"
        >
          InActive
        </b>
      ),
    },
  };

  const columns = [
    {
      name: <h6><b>#</b></h6>,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "50px",
    },
    {
      name: <h6><b>ID</b></h6>,
      selector: row => row.employeeId || "N/A",
      width: "100px",
    },
    {
      name: <h6><b>Name</b></h6>,
      selector: row => (
        <div title={`${row.firstName || ""} ${row.lastName || ""}`}>
          {`${(row.firstName?.length > 10 ? row.firstName.slice(0, 10) + '...' : row.firstName) || "N/A"} 
            ${(row.lastName?.length > 10 ? row.lastName.slice(0, 10) + '...' : row.lastName) || ""}`}
        </div>
      ),
      width: "190px",
    },
    {
      name: <h6><b>Email Id</b></h6>,
      selector: row => (
        <div title={row.emailId || "N/A"}>
          {row.emailId?.length > 20 ? `${row.emailId.slice(0, 20)}...` : row.emailId || "N/A"}
        </div>
      ),
      width: "210px",
    },
    {
      name: <h6><b>Department</b></h6>,
      selector: row => (
        <div title={row.departmentName || "N/A"}>
          {row.departmentName?.length > 10 ? `${row.departmentName.slice(0, 10)}...` : row.departmentName || "N/A"}
        </div>
      ),
      width: "140px",
    },
    {
      name: <h6><b>Date Of Hiring</b></h6>,
      selector: row => row.dateOfHiring || "N/A",
      format: row => {
        if (!row.dateOfHiring) return "N/A";
        const date = new Date(row.dateOfHiring);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },
      width: '150px',
    },
    {
      name: <h6><b>Status</b></h6>,
      selector: row => row.status || "Unknown",
      cell: row => statusMappings[row.status]?.label || "Unknown",
      width: "110px",
    },
    {
      name: <h5><b>Actions</b></h5>,
      cell: row => (
        <div>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent", border: "none", padding: "0", marginRight: "10px" }}
            onClick={() => handleSalary(row.id)}
            title="View Salary"
          >
            <Wallet size={22} color='#d116dd' />
          </button>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent", border: "none", padding: "0", marginRight: "10px" }}
            onClick={() => handleEdit(row.id)}
            title="Edit"
          >
            <PencilSquare size={22} color='#2255a4' />
          </button>
        </div>
      ),
    }
  ];  

  const filteredEmployees = employees?.filter((employee) => {
    const nameMatch =
      (employee.firstName?.toLowerCase().includes(search.toLowerCase()) || "") ||
      (employee.lastName?.toLowerCase().includes(search.toLowerCase()) || "") ||
      (employee.emailId?.toLowerCase().includes(search.toLowerCase()) || "");
  
    const hireDate = employee.dateOfHiring ? new Date(employee.dateOfHiring) : null;
    const monthMatch = selectedMonth ? hireDate?.getMonth() + 1 === parseInt(selectedMonth) : true;
    const yearMatch = selectedYear ? hireDate?.getFullYear().toString() === selectedYear : true;
  
    return nameMatch && monthMatch && yearMatch;
  });
  
  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position
    // Remove leading spaces
    value = value.replace(/^\s+/g, '');
    // Ensure only alphabets and spaces are allowed
    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
    value = value.split('').filter(char => allowedCharsRegex.test(char)).join('');
    // Capitalize the first letter of each word
    const words = value.split(' ');
    // Capitalize the first letter of each word and lowercase the rest
    const capitalizedWords = words.map(word => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return '';
    });
    // Join the words back into a string
    let formattedValue = capitalizedWords.join(' ');
    // Remove spaces not allowed (before the first two characters)
    if (formattedValue.length > 2) {
      formattedValue = formattedValue.slice(0, 2) + formattedValue.slice(2).replace(/\s+/g, ' ');
    }
    // Update input value
    input.value = formattedValue;
    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  const showToast = (message, type) => {
    toast[type](message);
  };


  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3"><strong>Employees</strong> </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>

                <li className="breadcrumb-item active">
                  Employees
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/**Department View TableForm */}
        <div className="row">
          <div className="col-12 col-lg-12 col-xxl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className="row">
                <div className="row">
                  <div className="col-auto">
                    <Link to="/employeeRegister">
                      <button className="btn btn-primary">Add Employee</button>
                    </Link>
                  </div>
                  <div className="col-auto">
                    <select className="form-select bg-primary border-0 text-white" onChange={(e) => downloadEmployeesFileAPI(e.target.value, showToast)}>
                      <option value="">Download Employees List</option>
                      <option value="excel">Excel (.xlsx)</option>
                      <option value="pdf">PDF (.pdf)</option>
                    </select>
                  </div>
                  <div className="col-auto">
                    <select className="form-select bg-primary border-0 text-white" onChange={(e) => downloadEmployeeBankDataAPI(e.target.value, showToast)}>
                      <option value="">Download Bank List</option>
                      <option value="excel">Excel (.xlsx)</option>
                      <option value="pdf">PDF (.pdf)</option>
                    </select>
                  </div>
                </div>
                  <div className="row col-12 mb-2">
                    <div className="col-md-4 mt-2 ">
                      <input
                        type="search"
                        className="form-control"
                        placeholder="Search...."
                        value={search}
                        onInput={toInputTitleCase}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4 mt-2">
                      <select
                        className="form-select"
                        style={{ paddingBottom: '6px' }}
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}

                      >
                        <option value="">Select Year</option>
                        {getRecentYears().map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mt-2">
                      <select
                        className="form-select"
                        style={{ paddingBottom: '6px' }}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        <option value="">Select Month</option>
                        {getMonthNames().map((month, index) => (
                          <option key={index} value={(index + 1).toString()}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd" }}
                  />
                </div>
              </div>
              {(!employees || employees.length === 0) ? (

                  <span className="text-danger text-center p-5">No Employees Found</span>

          ) : (
            <DataTable
              columns={columns}
              data={filteredEmployees.length > 0 ? filteredEmployees : ""}
              pagination
              onChangePage={page => setCurrentPage(page)}
              onChangeRowsPerPage={perPage => setRowsPerPage(perPage)}
            />
          )}
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default EmployeeView;
