import React, { useEffect, useState } from "react";
import Select from "react-select";
import LayOut from "../LayOut/LayOut";
import { useNavigate } from "react-router-dom";
import { Eye, XSquareFill } from "react-bootstrap-icons";
import { toast, Bounce } from "react-toastify";
import DataTable from "react-data-table-component";
import DeletePopup from "../Utils/DeletePopup";
import { EmployeePayslipGetById, EmployeePayslipDeleteById, EmployeePayslipsGet, EmployeeGetApiById } from "../Utils/Axios";
import { userId } from "../Utils/Auth";

const EmployeePayslips = () => {
  const [employeeSalaryView, setEmployeeSalaryView] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [showFields, setShowFields] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayslipId, setSelectedPayslipId] = useState("");
  const [refreshData, setRefreshData] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(''); 

  const navigate = useNavigate();
  console.log("userId:",userId);
  const id = userId;
  console.log(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userId) {
          const [employeeDetailsResponse, payslipsResponse] = await Promise.all(
            [
              EmployeeGetApiById(userId),
              EmployeePayslipsGet(
                userId,
                selectedMonth,
                selectedYear
              ),
            ]
          );
          setEmployeeDetails(employeeDetailsResponse.data);
          setEmployeeSalaryView(payslipsResponse.data.data);
        } else {
          setEmployeeDetails({});
          setEmployeeSalaryView([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setEmployeeDetails({});
        setEmployeeSalaryView([]);

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
    value: { value: (index + 1).toString().padStart(2, "0"), label: new Date(2000, index, 1).toLocaleString("default", { month: "long" }) },
    label: new Date(2000, index, 1).toLocaleString("default", { month: "long" }),
  }));
  

      }
    };

    fetchData();
  }, [userId, selectedMonth, selectedYear, refreshData]);

  const handleGoClick = () => {
    setShowFields(true); // Display payslip details
    setRefreshData(prev => !prev); // Trigger fetchData with updated selectedYear and selectedMonth
  };
  

  const handleViewSalary = (employeeId, payslipId) => {
    navigate(`/payslip?employeeId=${employeeId}&payslipId=${payslipId}`, {
      state: {
        employeeDetails: employeeDetails, // Pass selected employee details
      },
    });

  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedPayslipId("");
  };

  const handleShowDeleteModal = (payslipId) => {
    setSelectedPayslipId(payslipId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await EmployeePayslipDeleteById(id, selectedPayslipId);
      toast.success("Payslip deleted successfully!", {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
      handleCloseDeleteModal();
      setRefreshData((prev) => !prev); // Toggle refreshData state
    } catch (error) {
      handleApiErrors(error);
    }
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

  const columns = [
    {
      name: (
        <h6>
          <b>S No</b>
        </h6>
      ),
      selector: (row, index) => index + 1,
      width: "150px",
    },
    {
      name: (
        <h6>
          <b>Net Amount</b>
        </h6>
      ),
      selector: (row) => parseFloat(row.salary.netSalary).toFixed(2),
      sortable: true,
    },
    {
      name: (
        <h6>
          <b>Month</b>
        </h6>
      ),
      selector: (row) => row.month,
      sortable: true,
    },
    {
      name: (
        <h6>
          <b>Year</b>
        </h6>
      ),
      selector: (row) => row.year,
      sortable: true,
    },
    {
      name: (
        <h6>
          <b>Actions</b>
        </h6>
      ),
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "0",
              marginLeft: "5px",
            }}
            onClick={() => handleViewSalary(row.employeeId, row.payslipId)}
          >
            <Eye size={22} color="green" />
          </button>
        </div>
      ),
    },
  ];

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

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <h1 className="h3 mb-3">
          <strong>PaySlips Form</strong>
        </h1>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <div className="dropdown-divider" style={{ borderTopColor: "#D7D9DD" }} />
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 col-md-6 col-lg-5 mb-3">
                    <label className="form-label">Select Year</label>
                    <Select
                      options={years}
                      value={years.find(option => option.value === selectedYear)}
                      onChange={(selectedOption) => setSelectedYear(selectedOption.value)}
                      placeholder="Select Year"
                      style={{ marginLeft: "10px" }}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-5 mb-3">
                    <label className="form-label">Select Month</label>
                    <Select
                      options={months}
                      value={months.find(option => option.label === selectedMonth)}
                      onChange={(selectedOption) => setSelectedMonth(selectedOption.label)}
                      placeholder="Select Month"
                    />
                  </div>
                  <div className="col-12 d-flex justify-content-end mt-5">
                    <button
                      className="btn btn-primary btn-lg"
                      type="submit"
                      style={{ marginRight: "65px" }}
                      onClick={handleGoClick}
                    >
                      Go
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showFields && (
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mt-2">
                Payslip Details:
              </h5>
              <div className="dropdown-divider" style={{ borderTopColor: "#D7D9DD" }} />
              <DataTable
                columns={columns}
                data={employeeSalaryView}
                pagination
                progressPending={showSpinner}
              />
            </div>
          </div>
        )}
        <DeletePopup
          show={showDeleteModal}
          onHide={handleCloseDeleteModal}
          onDelete={handleDelete}
        />
      </div>
    </LayOut>
  );
};

export default EmployeePayslips;
