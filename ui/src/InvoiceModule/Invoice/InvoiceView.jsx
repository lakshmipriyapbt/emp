import React, { useState, useEffect } from "react";
import { Eye, Download } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import LayOut from "../../LayOut/LayOut";
import { useAuth } from "../../Context/AuthContext";
import { fetchInvoices } from "../../Redux/InvoiceSlice";
import Loader from "../../Utils/Loader";
import { toast } from "react-toastify";
import { InvoiceDownloadById, InvoiceGetApiById } from "../../Utils/Axios";
import InvoicePdf from "./InvoicePdf";

const InvoiceView = () => {
  const dispatch = useDispatch();
  const { invoices, loading, error } = useSelector((state) => state.invoices);
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [invoiceDataById, setInvoiceDataById] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [invoiceTemplateNumber, setInvoiceTemplateNumber] = useState(null);
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
      const filtered = invoices.data.map(item => ({
        ...item.invoice,
        customer: item.customer,
        company: item.company,
        bank: item.bank
      })).filter((invoice) => {
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
      if (error) {
        toast.error(error);
      }
    }
  }, [invoices, search, error]);

const handleView = async (invoice) => {
  setSelectedInvoice(invoice);
  setShowPreview(true);
  setInvoiceDataById(null); // Reset before fetching

  try {
    const data = await InvoiceGetApiById(
      companyId,
      invoice.customerId,
      invoice.invoiceId
    );
    setInvoiceDataById(data.data);
    setInvoiceTemplateNumber(data.data.invoice.invoiceTemplateNo);
    console.log("Invoice Data By Id:", data.data);
  } catch (error) {
    toast.error("Failed to fetch invoice details");
    setShowPreview(false);
  }
};

  const handleDownload = async (format) => {
    if (!selectedInvoice || !companyId) return;

    setIsDownloading(true);
    try {
      if (format === 'pdf') {
        const success = await InvoiceDownloadById(
          companyId,
          selectedInvoice.customerId,
          selectedInvoice.invoiceId
        );

        if (!success) {
          toast.error("Failed to download invoice");
        }
      } else {
        // For other formats (like PNG), you might need a different API endpoint
        toast.info("Image download feature coming soon");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download invoice");
    } finally {
      setIsDownloading(false);
    }
  };

  const columns = [
    {
      name: <h6><b>#</b></h6>,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "70px",
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
      name: <h6><b>Client Name</b></h6>,
      selector: (row) => (
        <div title={row.customer?.customerName || ""}>
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
                        <Link to="/invoiceRegistration">
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
                      <h5 className="modal-title">Invoice View</h5>
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
                    {invoiceDataById? (
                        <InvoicePdf 
                        previewData={invoiceDataById}
                        invoiceTemplateNumber={invoiceTemplateNumber}
                        />
                      ) : (
                        <div className="text-center p-5">
                          <Loader />
                          <p>Loading invoice data...</p>
                        </div>
                      )}
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
                        className="btn btn-primary me-2 d-flex align-items-center"
                        onClick={() => handleDownload('pdf')}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <span>Downloading...</span>
                        ) : (
                          <>
                            <Download className="me-1" />
                            <span>Download PDF</span>
                          </>
                        )}
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