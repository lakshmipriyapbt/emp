import React, { useState,useEffect } from "react";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import { Bounce, toast } from "react-toastify";
import DataTable from "react-data-table-component";
import LayOut from "../../LayOut/LayOut";
import { EmployeePayslipGeneration, EmployeePayslipResponse, TemplateGetAPI,   } from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";
import { PencilSquare } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

const GeneratePaySlip = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },reset
  } = useForm();

  const [view, setView] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [templateAvailable, setTemplateAvailable] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const startYear = 2000;
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index
  ).reverse();

  const months = Array.from({ length: 12 }, (_, index) => ({
    value: (index + 1).toString().padStart(2, "0"),
    label: new Date(2000, index, 1).toLocaleString("default", { month: "long" }),
  }));

  const handleCheckboxChange = (employeeId) => {
    setSelectedEmployees((prevSelected) =>
      prevSelected.includes(employeeId)
        ? prevSelected.filter((id) => id !== employeeId)
        : [...prevSelected, employeeId]
    );
  };

  const onSubmit = (data) => {
    const { month, year } = data;
    const capitalizedMonth = month.label.charAt(0).toUpperCase() + month.label.slice(1);

    const payload = {
      companyName: user.company,
      month: capitalizedMonth,
      year: year.label,
    };

    EmployeePayslipResponse(payload)
      .then((response) => {
        const { generatePayslip } = response.data.data;
        setView(generatePayslip);
        setSelectedMonthYear(`${capitalizedMonth} ${year.label}`);
        setShow(true);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to generate payslips.");
      });
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(view.map((employee) => employee.employeeId));
    }
    setSelectAll(!selectAll);
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
      selector: "attendance.firstName",
      cell: (row) => `${row.attendance.firstName} ${row.attendance.lastName}`,
      width: "150px"
    },
    {
      name: <h6><b>Email ID</b></h6>,
      selector: "attendance.emailId",
      cell: (row) => row.attendance.emailId,
      width: "220px"
    },
    {
      name: <h6><b>Net Salary</b></h6>,
      selector: "salary.netSalary",
      cell: (row) => row.salary.netSalary,
      width: "150px"
    },
    {
      name: <h6><b>Month/Year</b></h6>,
      cell: (row) => `${row.month}/${row.year}`,
      width: "200px"
    },
    {
      name: <h6><b>Actions</b></h6>,
      cell: (row) => (
        <button
          className="btn btn-sm"
          style={{ backgroundColor: "transparent", border: "none", padding: "0", marginRight: "10px" }}
          onClick={() => handleEditClick(row.employeeId, row.payslipId, row.month, row.year)} // Pass employeeId, month, and year
          title="Edit"
        >
          <PencilSquare size={22} color='#2255a4' />
        </button>
      ),
    },
  ];

  const fetchTemplate = async () => {
    try {
      const response = await TemplateGetAPI();
      const templateNumber = response.data.data.payslipTemplateNo;
      const templateData = response.data.data;
      setCurrentTemplate(templateData);
      setTemplateAvailable(!!templateNumber);
      if (!templateData.payslipTemplateNo) {
        toast.error("Invalid payslip template number.");
      }
    } catch (error) {
      setTemplateAvailable(false);
      console.error("API fetch error:", error);
      // toast.error("Failed to fetch payslip templates. Please try again.");
    }
  };
  const handleEditClick = (employeeId, payslipId, month, year) => {
    const payslipTemplateNo = currentTemplate?.payslipTemplateNo;

    if (payslipTemplateNo) {
      navigate(`/payslipUpdate${payslipTemplateNo}?employeeId=${employeeId}&payslipId=${payslipId}&month=${month}&year=${year}`);
    } else {
      toast.error("Payslip template number not found.");
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, []);


  const handleGeneratePaySlips = async () => {
    // Check if at least one employee is selected
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee.");
      return;
    }

    if (!selectedMonthYear) {
      toast.error("Please select month and year before generating payslips.");
      return;
    }

    const [month, year] = selectedMonthYear.split(" ");

    const payload = {
      companyName: user.company,
      month,
      year
    };

    try {
      const response = await EmployeePayslipGeneration(payload);
      const { generatePayslip } = response.data.data;
      setView(generatePayslip);
      toast.success("PaySlips Generated Successfully", {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
      navigate('/payslipsList'); 
    } catch (error) {
      console.error("Error generating payslips:", error);
      toast.error("Failed to generate payslips.");
    }
  };

  if (!templateAvailable) {
    return (
      <LayOut>
        <div className="container-fluid p-0">
          <div className="row justify-content-center">
            <div className="col-8 text-center mt-5">
              <h2>No Payslip Template Available</h2>
              <p>To set up the Payslip templates before proceeding, Please select the Template from Settings <a href="/payslipTemplates">Payslip Templates </a></p>
              <p>Please contact the administrator to set up the Payslip templates before proceeding.</p>
            </div>
          </div>
        </div>
      </LayOut>
    );
  }

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3"><strong>Generate Payslips</strong></h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: '20px' }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/main">Home</a></li>
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
                <h5 className="card-title" style={{marginBottom:"0px"}}>Generate PaySlips</h5>
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
                    <div className="col-12 col-md-6 col-lg-2 mt-4">
                      <button className="btn btn-primary btn-lg" type="submit" style={{ marginRight: "65px" }}>
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {show && (
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title" style={{ paddingLeft: "15px", marginTop: "10px" }}>Month/Year: {selectedMonthYear}</h5>
              </div>
              <div className="dropdown-divider" style={{ borderTopColor: "#d7d9dd" }} />
              <DataTable
                data={view}
                columns={columns}
                pagination
                paginationPerPage={rowsPerPage}
                onChangePage={setCurrentPage}
                onChangeRowsPerPage={setRowsPerPage}
              />
              <div className="m-3 d-flex justify-content-end bg-transparent">
                <button className="btn btn-primary" type="button" onClick={handleGeneratePaySlips}>
                  Generate PaySlips
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayOut>
  );
};

export default GeneratePaySlip;