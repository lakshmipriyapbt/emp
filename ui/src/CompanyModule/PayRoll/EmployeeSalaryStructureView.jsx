import React, { useState, useEffect } from "react";
import { Pencil, PencilSquare, Wallet} from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import { downloadEmployeeBankDataAPI, downloadEmployeeSalaryDataAPI, downloadEmployeesFileAPI, EmployeesSalariesGetApi} from "../../Utils/Axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../../Redux/EmployeeSlice";

const EmployeeSalaryStructureView = () => {
    const [filteredSalaries, setFilteredSalaries] = useState([]); // Stores filtered salaries
    // Single Search Field
    const [searchQuery, setSearchQuery] = useState(""); 
    // Salary Range
    const [minSalary, setMinSalary] = useState("");
    const [maxSalary, setMaxSalary] = useState("");
    const [salaries,setSalaries]=useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const Navigate = useNavigate();

        useEffect(() => {
        const fetchEmployeesSalaries = async () => {
            try {
            const res = await EmployeesSalariesGetApi();
            const formattedData = res.data.data
            setSalaries(formattedData);
            console.log("salaries",res.data.data)
            } catch (error) {
            console.error("Error fetching employees:", error);
            }
        };
            fetchEmployeesSalaries(); // Fetch all attendance data initially
        }, []);

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
      selector: row => row.employeeCreatedId|| "N/A",
      width: "100px",
    },
    {
      name: <h6><b>Name</b></h6>,
      selector: row => row.employeeName|| "N/A",
      width: "190px",
    },
    {
      name: <h6><b>Gross Amount</b></h6>,
      selector: row => row.grossAmount|| "N/A",
      width: "210px",
    },
    {
        name: <h6><b>Net Salary </b></h6>,
        selector: row => row.netSalary|| "N/A",
      width: "140px",
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
            <PencilSquare size={22} color='#d116dd' />
          </button>
        </div>
      ),
    }
  ];  

  useEffect(() => {
    let updatedSalaries = salaries;
    // Apply search filter (Name, ID, Status)
    if (searchQuery) {
      updatedSalaries = updatedSalaries.filter((salary) =>
        salary.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salary.employeeCreatedId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salary.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  
    // Apply Gross Amount filter
    if (minSalary) {
      updatedSalaries = updatedSalaries.filter((salary) => parseFloat(salary.grossAmount) >= parseFloat(minSalary));
    }
  
    if (maxSalary) {
      updatedSalaries = updatedSalaries.filter((salary) => parseFloat(salary.grossAmount) <= parseFloat(maxSalary));
    }
  
    // // Apply Net Salary filter
    // if (minNetSalary) {
    //   updatedSalaries = updatedSalaries.filter((salary) => parseFloat(salary.netSalary) >= parseFloat(minNetSalary));
    // }
  
    // if (maxNetSalary) {
    //   updatedSalaries = updatedSalaries.filter((salary) => parseFloat(salary.netSalary) <= parseFloat(maxNetSalary));
    // }
  
    setFilteredSalaries(updatedSalaries);
  }, [searchQuery, minSalary, maxSalary,salaries]);
  
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
            <h1 className="h3 mb-3"><strong>Employees Salary List</strong> </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>

                <li className="breadcrumb-item active">
                  Employees Salary List
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
                    <Link to="/employeeSalaryStructure">
                      <button className="btn btn-primary">Add Salary to Employee</button>
                    </Link>
                  </div>
                  <div className="col-auto">
                    <select className="form-select bg-primary border-0 text-white" onChange={(e) => downloadEmployeeSalaryDataAPI(e.target.value, showToast)}>
                      <option value="">Download Employees Salary List</option>
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
                        value={searchQuery}
                        onInput={toInputTitleCase}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
              <DataTable
                columns={columns}
                data={salaries}
                pagination
                onChangePage={page => setCurrentPage(page)}
                onChangeRowsPerPage={perPage => setRowsPerPage(perPage)}
              />
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default EmployeeSalaryStructureView;
