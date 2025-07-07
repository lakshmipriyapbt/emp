import React, { useState, useEffect } from "react";
import { PencilSquare, Wallet, FileEarmarkText, Download } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import { downloadEmployeeBankDataAPI, downloadEmployeesFileAPI, getDocumentByIdAPI } from "../../Utils/Axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../../Redux/EmployeeSlice";
import Loader from "../../Utils/Loader";
import { useAuth } from "../../Context/AuthContext";
import { FileEarmarkPdf, FileEarmarkWord, FileEarmarkImage } from "react-bootstrap-icons";

const EmployeeView = () => {
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  
  // Download related states
  const [selectedEmployeeDownloadFormat, setSelectedEmployeeDownloadFormat] = useState("");
  const [selectedBankDownloadFormat, setSelectedBankDownloadFormat] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [downloadType, setDownloadType] = useState(''); // 'employee' or 'bank'
  
  const { employee } = useAuth();
  const companyId = employee?.companyId;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: employees, status, error, loading } = useSelector(
    (state) => state.employees
  );

  // Define all possible columns (including those not shown in the table)
  const allColumns = [
    { name: 'Employee ID', selector: 'employeeId' },
    { name: 'First Name', selector: 'firstName' },
    { name: 'Last Name', selector: 'lastName' },
    { name: 'Email', selector: 'emailId' },
    { name: 'Department', selector: 'departmentName' },
    { name: 'Designation', selector: 'designationName' },
    { name: 'Date of Hiring', selector: 'dateOfHiring' },
    { name: 'Status', selector: 'status' },
    { name: 'Mobile Number', selector: 'mobileNo' },
    { name: 'Aadhar Number', selector: 'aadhaarId' },
    { name: 'PAN Number', selector: 'panNo' },
    { name: 'UAN Number', selector: 'uanNo' },
    { name: 'Bank Name', selector: 'bankName' },
    { name: 'Account Number', selector: 'accountNo' },
    { name: 'IFSC Code', selector: 'ifscCode' },
    { name: 'Branch', selector: 'bankBranch' },
  ];

  useEffect(() => {
    if (companyId) {
      setIsFetching(true);
      const timer = setTimeout(() => {
        dispatch(fetchEmployees(companyId)).finally(() => setIsFetching(false));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [dispatch, companyId]);

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
      width: "100px",
    },
    {
      name: <h5><b>Actions</b></h5>,
      cell: row => (
        <div>
          <button
            className="btn btn-sm me-2"
            style={{ backgroundColor: "transparent", border: "none" }}
            onClick={() => handleViewDocuments(row)}
            title="View Documents"
          >
            <FileEarmarkText size={22} color="#0d6efd" />
          </button>
          <button
            className="btn btn-sm me-2"
            style={{ backgroundColor: "transparent", border: "none" }}
            onClick={() => handleSalary(row.id)}
            title="View Salary"
          >
            <Wallet size={22} color='#d116dd' />
          </button>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent", border: "none" }}
            onClick={() => handleEdit(row.id)}
            title="Edit"
          >
            <PencilSquare size={22} color='#2255a4' />
          </button>
        </div>
      ),
      width: "180px",
    }
  ];

  // Initialize selected columns with visible columns by default
  useEffect(() => {
    const visibleColumns = columns.map(col => 
      typeof col.name === 'string' ? col.name : col.name.props.children
    );
    setSelectedColumns(visibleColumns.filter(Boolean));
  }, [columns]);

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
    navigate(`/employeeSalaryList?id=${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/employeeRegister`, { state: { id } });
  };

  const handleViewDocuments = async (employee) => {
    try {
      setSelectedEmployee(employee);
      setDocumentsLoading(true);
      
      let response = await getDocumentByIdAPI('', employee.id); // empty candidateId
      
      if ((!response?.data?.documentEntities || response.error?.message === "No Documents Found.")) {
        response = await getDocumentByIdAPI(employee.id, ''); // empty employeeId
      }

      if (response?.data?.documentEntities) {
        const transformedDocs = response.data.documentEntities.map(doc => ({
          name: doc.docName,
          url: doc.filePath,
          status: 'uploaded',
          type: doc.filePath?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 
                doc.filePath?.toLowerCase().match(/\.(doc|docx)$/) ? 'application/msword' :
                doc.filePath?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? 'image/*' :
                'application/octet-stream',
          size: 0
        }));
        
        setDocuments(transformedDocs);
      } else {
        setDocuments([]);
        toast.info(response?.error?.message || 'No documents found for this employee');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to load documents. Please try again later.');
    } finally {
      setDocumentsLoading(false);
      setShowDocumentsModal(true);
    }
  };

  const handleEmployeeDownloadFormatChange = (format) => {
    setSelectedEmployeeDownloadFormat(format);
    setDownloadType('employee');
    
    // Set default columns for employee download
    setSelectedColumns([
      'Employee ID',
      'First Name',
      'Last Name',
      'Email',
      'Department',
      'Designation',
      'Date of Hiring',
      'Status'
    ]);
    
    setShowDownloadModal(true);
  };

  const handleBankDownloadFormatChange = (format) => {
    setSelectedBankDownloadFormat(format);
    setDownloadType('bank');
    
    // Set default columns for bank download
    setSelectedColumns([
      'Employee ID',
      'First Name',
      'Last Name',
      'Bank Name',
      'Account Number',
      'IFSC Code',
      'Branch'
    ]);
    
    setShowDownloadModal(true);
  };

  const handleDownloadConfirm = async () => {
    setShowDownloadModal(false);
    setIsDownloading(true);
    
    try {
      // Prepare the selected fields for the API
      const selectedFields = allColumns
        .filter(col => selectedColumns.includes(col.name))
        .map(col => col.selector);

      if (downloadType === 'employee') {
        await downloadEmployeesFileAPI(selectedEmployeeDownloadFormat, selectedFields, toast);
        setSelectedEmployeeDownloadFormat("");
      } else {
        await downloadEmployeeBankDataAPI(selectedBankDownloadFormat, selectedFields, toast);
        setSelectedBankDownloadFormat("");
      }
    } catch (error) {
      toast.error("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getFileIcon = (type, name) => {
    if (type?.includes('pdf') || name?.toLowerCase().endsWith('.pdf')) {
      return <FileEarmarkPdf className="text-danger" size={24} />;
    } else if (type?.includes('word') || name?.toLowerCase().endsWith('.doc') || name?.toLowerCase().endsWith('.docx')) {
      return <FileEarmarkWord className="text-primary" size={24} />;
    } else if (type?.includes('image') || ['.jpg', '.jpeg', '.png', '.gif'].some(ext => name?.toLowerCase().endsWith(ext))) {
      return <FileEarmarkImage className="text-success" size={24} />;
    }
    return <FileEarmarkPdf className="text-secondary" size={24} />;
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
    relieved: {
      label: (
        <b
          style={{
            borderRadius: "5px",
            padding: "3px 6px",
            color: "#fff",
          }}
          className="bg-danger"
        >
          Relieved
        </b>
      ),
    },
    OnBoard: {
      label: (
        <b
          style={{
            borderRadius: "5px",
            padding: "3px 6px",
            color: "#fff",
          }}
          className="bg-info"
        >
          OnBoard
        </b>
      ),
    },
  };


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
    const cursorPosition = input.selectionStart;
    value = value.replace(/^\s+/g, '');
    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
    value = value.split('').filter(char => allowedCharsRegex.test(char)).join('');
    const words = value.split(' ');
    const capitalizedWords = words.map(word => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return '';
    });
    let formattedValue = capitalizedWords.join(' ');
    if (formattedValue.length > 2) {
      formattedValue = formattedValue.slice(0, 2) + formattedValue.slice(2).replace(/\s+/g, ' ');
    }
    input.value = formattedValue;
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        {(isFetching || loading) ? (
          <div className="row">
            <div className="col-12">
              <Loader />
            </div>
          </div>
        ) : (
          <>
            <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
              <div className="col">
                <h1 className="h3 mb-3"><strong>Employees</strong> </h1>
              </div>
              <div className="col-auto">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/main" className="custom-link">Home</Link>
                    </li>
                    <li className="breadcrumb-item active">Employees</li>
                  </ol>
                </nav>
              </div>
            </div>

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
                          <select
                            className="form-select bg-primary border-0 text-white"
                            value={selectedEmployeeDownloadFormat}
                            onChange={(e) => handleEmployeeDownloadFormatChange(e.target.value)}
                            disabled={isDownloading}
                          >
                            <option value="">Download Employees List</option>
                            <option value="excel">Excel (.xlsx)</option>
                            <option value="pdf">PDF (.pdf)</option>
                          </select>
                        </div>
                        <div className="col-auto">
                          <select
                            className="form-select bg-primary border-0 text-white"
                            value={selectedBankDownloadFormat}
                            onChange={(e) => handleBankDownloadFormatChange(e.target.value)}
                            disabled={isDownloading}
                          >
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
                      <div className="dropdown-divider" style={{ borderTopColor: "#d7d9dd" }} />
                    </div>
                  </div>
                  {filteredEmployees?.length > 0 ? (
                    <DataTable
                      columns={columns}
                      data={filteredEmployees}
                      pagination
                      onChangePage={page => setCurrentPage(page)}
                      onChangeRowsPerPage={perPage => setRowsPerPage(perPage)}
                    />
                  ) : (
                    <div className="text-center p-5">
                      {employees?.length === 0 ? "No employees found" : "No employees match your search criteria"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Documents Modal */}
        {showDocumentsModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Documents for {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowDocumentsModal(false);
                      setDocuments([]);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  {documentsLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading documents...</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No documents found for this employee</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Document</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents.map((doc, index) => (
                            <tr key={index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  {getFileIcon(doc.type, doc.name)}
                                  <span className="ms-3">{doc.name}</span>
                                </div>
                              </td>
                              <td>
                                <a
                                  href={doc.url}
                                  className="btn btn-sm btn-outline-primary me-2"
                                >
                                  <Download className="me-1" /> View
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDocumentsModal(false);
                      setDocuments([]);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Download Options Modal */}
        {showDownloadModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Select Columns to Download</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowDownloadModal(false);
                      setSelectedEmployeeDownloadFormat("");
                      setSelectedBankDownloadFormat("");
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <div className="d-flex justify-content-between mb-3">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedColumns(allColumns.map(col => col.name))}
                      >
                        Select All
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setSelectedColumns([])}
                      >
                        Deselect All
                      </button>
                    </div>
                    <div className="row">
                      {allColumns.map((column, index) => (
                        <div className="col-md-4" key={index}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`column-${index}`}
                              checked={selectedColumns.includes(column.name)}
                              onChange={() => {
                                if (selectedColumns.includes(column.name)) {
                                  setSelectedColumns(selectedColumns.filter(c => c !== column.name));
                                } else {
                                  setSelectedColumns([...selectedColumns, column.name]);
                                }
                              }}
                            />
                            <label className="form-check-label" htmlFor={`column-${index}`}>
                              {column.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowDownloadModal(false);
                      setSelectedEmployeeDownloadFormat("");
                      setSelectedBankDownloadFormat("");
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleDownloadConfirm}
                    disabled={selectedColumns.length === 0}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayOut>
  );
};

export default EmployeeView;