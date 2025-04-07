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
    // Single Search Field
  const [searchQuery, setSearchQuery] = useState("");
  const [salaries,setSalaries]=useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const Navigate = useNavigate();

        useEffect(() => {
        const fetchEmployeesSalaries = async () => {
            try {
            const res = await EmployeesSalariesGetApi();
            const formattedData = res.data.data
            setSalaries(formattedData);
            setFilteredSalaries(formattedData);
            } catch (error) {
            console.error("Error fetching employees:", error);
            }
        };
            fetchEmployeesSalaries(); // Fetch all attendance data initially
        }, []);
        useEffect(() => {
          const results = salaries.filter((salary) => {
              const searchLower = searchQuery.toLowerCase();
              const grossAmount = parseFloat(salary.grossAmount); // Convert grossAmount to number
              const netSalary=parseFloat(salary.netSalary);
              return (
                  salary.employeeName.toLowerCase().includes(searchLower) ||
                  salary.employeeCreatedId.toLowerCase().includes(searchLower) ||
                  (!isNaN(searchQuery) && grossAmount >= parseFloat(searchQuery))|| // Numeric search
                  (!isNaN(searchQuery)&& netSalary>=parseFloat(searchQuery))
              );
          });
      
          setFilteredSalaries(results);
      }, [searchQuery, salaries]);
      

  const handleSalary = (id) => {
    Navigate(`/employeeSalaryList?id=${id}`);
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
      selector: row => row.id || "Undefined",
      cell: row => (
        <div>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent", border: "none", padding: "0", marginRight: "10px" }}
            onClick={() => handleSalary(row.employeeId)}
            title="View Salary"
          >
            <PencilSquare size={22} color='#d116dd' />
          </button>
        </div>
      ),
    }
  ];  

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
                  <div className="col-md-4 align-items-end">
                    <input
                          type="search"
                          className="form-control"
                          placeholder="Search by ID, Name, Gross Amount, or Net Salary"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ marginBottom: "10px", padding: "5px", width: "300px" }}
                      />
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
                data={filteredSalaries.length > 0 ? filteredSalaries : ""}
                pagination
                onChangePage={page => setCurrentPage(page)}
                onChangeRowsPerPage={perPage => setRowsPerPage(perPage)}
                responsive
              />
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default EmployeeSalaryStructureView;
