import React, { useState, useEffect } from "react";
import { Eye, Download } from "react-bootstrap-icons";
import { useNavigate, Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import LayOut from "../../LayOut/LayOut";
import { useAuth } from "../../Context/AuthContext";
import { fetchInvoices } from "../../Redux/InvoiceSlice";
import Loader from "../../Utils/Loader";
import { toast } from "react-toastify";
import InvoicePreview from "../../CompanyModule/Settings/InvoiceTemplates/InvoicePreview";

const InvoiceView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { invoices, loading, error } = useSelector((state) => state.invoices);
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const { employee } = useAuth();
  const companyId = employee?.companyId;

  useEffect(() => {
    if (companyId) {
      setIsFetching(true);
      const timer = setTimeout(() => {
        dispatch(fetchInvoices(companyId)).finally(() => setIsFetching(false));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dispatch, companyId]);  

  useEffect(() => {
    if (invoices?.data && Array.isArray(invoices.data)) {
      const filtered = invoices.data.filter((invoice) => {
        const invoiceNo = invoice.invoiceNo ? invoice.invoiceNo.toLowerCase() : "";
        const clientName = invoice.customer?.customerName ? invoice.customer.customerName.toLowerCase() : "";
        const state = invoice.customer?.state ? invoice.customer.state.toLowerCase() : "";
        const invoiceDate = invoice.invoiceDate ? invoice.invoiceDate.toLowerCase() : "";
  
        return (
          invoiceNo.includes(search.toLowerCase()) ||
          clientName.includes(search.toLowerCase()) ||
          state.includes(search.toLowerCase()) ||
          invoiceDate.includes(search.toLowerCase())
        );
      });
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
      toast.error(error);
    }
  }, [invoices, search]);  

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const handleDownload = (format) => {
    if (!selectedInvoice) return;
    
    // Replace this with your actual API endpoint
    const downloadUrl = `/api/invoices/download/${selectedInvoice.invoiceId}?format=${format}`;
    
    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `invoice_${selectedInvoice.invoiceNo}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      name: <h6><b>#</b></h6>,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "50px",
    },
    {
      name: <h6><b>Client Name</b></h6>,
      selector: (row) => (
        <div title={row.customerName || ""}>
          {row.customer?.customerName && row.customer?.customerName.length > 18
            ? row.customer?.customerName.slice(0, 20) + "..."
            : row.customer?.customerName}
        </div>
      ),
      width: "190px",
    },
    {
      name: <h6><b>Mobile Number</b></h6>,
      selector: (row) => row.customer?.mobileNumber,
      width: "170px",
    },
    {
      name: <h6><b>State</b></h6>,
      selector: (row) => row.customer?.state,
      width: "150px",
    },
    {
      name: <h6><b>Invoice Number</b></h6>,
      selector: (row) => row.invoiceNo,
      width: "180px",
    },
    {
      name: <h6><b>Invoice Date</b></h6>,
      selector: (row) => row.invoiceDate,
      width: "160px",
    },
    {
      name: <h6><b>Actions</b></h6>,
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm me-2"
            style={{ backgroundColor: "transparent" }}
            onClick={() => handleView(row)}
            title="View Invoice"
          >
            <Eye size={22} color="green" />
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  const getFilteredList = (searchTerm) => {
    setSearch(searchTerm);
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
                <h1 className="h3 mb-3">
                  <strong>Invoice View</strong>
                </h1>
              </div>
              <div className="col-auto">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/main" className="custom-link">Home</Link>
                    </li>
                    <li className="breadcrumb-item active">Invoices</li>
                    <li className="breadcrumb-item active">Invoice View</li>
                  </ol>
                </nav>
              </div>
            </div>

            <div className="row">
              <div className="col-12 col-lg-12 col-xxl-12 d-flex">
                <div className="card flex-fill">
                  <div className="card-header">
                    <div className="row">
                      <div className="col-md-4">
                        <Link to={"/invoiceRegistartion"}>
                          <button className="btn btn-primary">Add Invoice</button>
                        </Link>
                      </div>
                      <div className="col-md-4 offset-md-4 d-flex justify-content-end">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by Invoice Number"
                          value={search}
                          onChange={(e) => getFilteredList(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    paginationPerPage={rowsPerPage}
                    onChangePage={(page) => setCurrentPage(page)}
                    onChangeRowsPerPage={(perPage) => setRowsPerPage(perPage)}
                  />
                </div>
              </div>
            </div>

            {/* Invoice Preview Modal */}
            {showPreview && selectedInvoice && (
              <div className="modal" style={{
                display: 'block',
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1050,
                overflow: 'auto'
              }}>
                <div className="modal-dialog modal-xl" style={{
                  maxWidth: '90%',
                  margin: '30px auto'
                }}>
                  <div className="modal-content" style={{
                    border: 'none',
                    borderRadius: '0.3rem'
                  }}>
                    <div className="modal-header" style={{
                      borderBottom: '1px solid #dee2e6',
                      padding: '1rem'
                    }}>
                      <h5 className="modal-title">Invoice Preview - {selectedInvoice.invoiceNo}</h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => setShowPreview(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        &times;
                      </button>
                    </div>
                    <div className="modal-body" style={{
                      padding: '0',
                      overflow: 'auto',
                      maxHeight: 'calc(100vh - 200px)'
                    }}>
                      <InvoicePreview
                        previewData={{
                          ...selectedInvoice,
                          company: {
                            companyName: employee?.company?.companyName,
                            address: employee?.company?.companyAddress,
                            emailId: employee?.company?.emailId,
                            mobileNo: employee?.company?.mobileNo,
                            imageFile: employee?.company?.imageFile,
                            stampImage: employee?.company?.stampImage
                          }
                        }}
                        selectedTemplate={employee?.company?.invoiceTemplateNo || "1"}
                      />
                    </div>
                    <div className="modal-footer" style={{
                      borderTop: '1px solid #dee2e6',
                      padding: '1rem'
                    }}>
                      <button
                        type="button"
                        className="btn btn-secondary me-2"
                        onClick={() => setShowPreview(false)}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary me-2"
                        onClick={() => handleDownload('pdf')}
                      >
                        <Download className="me-1" />
                        Download PDF
                      </button>
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={() => handleDownload('png')}
                      >
                        <Download className="me-1" />
                        Download Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </LayOut>
  );
};

export default InvoiceView;