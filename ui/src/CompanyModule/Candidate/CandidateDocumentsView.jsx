import React, { useState, useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Download, Eye } from "react-bootstrap-icons";
import LayOut from "../../LayOut/LayOut";
import { getDocumentByIdAPI } from "../../Utils/Axios";
import Loader from "../../Utils/Loader";
import DataTable from "react-data-table-component";

const CandidateDocumentsView = () => {
    const navigate = useNavigate();
    const { userId, company } = useSelector((state) => state.auth);
    const [documents, setDocuments] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch documents on component mount
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                const response = await getDocumentByIdAPI(userId);
                
                if (response.data?.documentEntities?.length > 0) {
                    setDocuments(response.data);
                } else {
                    setDocuments(null);
                    toast.info("No documents found for your account");
                }
            } catch (error) {
                console.error("Error fetching documents:", error);
                toast.error(error.response?.data?.message || "Failed to load documents");
                
                if (error.response?.status === 403) {
                    navigate(`/${company}/candidateLogin`);
                }
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchDocuments();
        }
    }, [userId, navigate, company]);

    // Filter documents based on search term
    const filteredDocuments = documents?.documentEntities?.filter(doc => 
        doc.docName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Function to handle document viewing
    const handleViewDocument = (filePath) => {
        try {
            // Open in new tab for viewing
            window.open(filePath, '_blank');
        } catch (error) {
            console.error("Error viewing document:", error);
            toast.error("Failed to open document");
        }
    };

    // Function to handle document downloading
    const handleDownloadDocument = (filePath, docName) => {
        try {
            // Create a temporary anchor element for download
            const link = document.createElement('a');
            link.href = filePath;
            
            // Extract filename from path or use document name
            const fileName = docName || filePath.split('/').pop();
            link.setAttribute('download', fileName);
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success message
            toast.success(`Downloading ${fileName}...`);
        } catch (error) {
            console.error("Error downloading document:", error);
            toast.error("Failed to download document");
        }
    };

    // Columns configuration for DataTable
    const columns = [
        {
            name: "Document Name",
            selector: row => row.docName,
            sortable: true,
            wrap: true,
            grow: 2
        },
        {
            name: "Type",
            selector: row => {
                const ext = row.filePath.split('.').pop().toLowerCase();
                if (ext === 'pdf') return 'PDF';
                if (['doc', 'docx'].includes(ext)) return 'Word';
                if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return 'Image';
                return 'File';
            },
            sortable: true,
            width: '100px'
        },
        {
            name: "Actions",
            cell: row => (
                <div className="d-flex gap-2">
                    <button
                        onClick={() => handleViewDocument(row.filePath)}
                        className="btn btn-sm btn-outline-primary"
                        title="View Document"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => handleDownloadDocument(row.filePath, row.docName)}
                        className="btn btn-sm btn-outline-secondary"
                        title="Download Document"
                    >
                        <Download size={16} />
                    </button>
                </div>
            ),
            width: '150px'
        }
    ];

    // Custom styles for DataTable
    const customStyles = {
        rows: {
            style: {
                minHeight: '60px',
            },
        },
        headCells: {
            style: {
                fontWeight: 'bold',
                fontSize: '14px',
                backgroundColor: '#f8f9fa',
            },
        },
    };

    if (loading) {
        return (
            <LayOut>
                <div className="container-fluid p-0">
                    <div className="row">
                        <div className="col-12">
                            <Loader />
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
                        <h1 className="h3 mb-3">
                            <strong>My Documents</strong>
                        </h1>
                    </div>
                    <div className="col-auto">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to="/main" className="custom-link">Home</Link>
                                </li>
                                <li className="breadcrumb-item active">My Documents</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <h5 className="card-title mb-0">Uploaded Documents</h5>
                                    </div>
                                    <div className="col-md-6">
                                        <input
                                            type="search"
                                            className="form-control"
                                            placeholder="Search documents..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                {filteredDocuments.length > 0 ? (
                                    <DataTable
                                        columns={columns}
                                        data={filteredDocuments}
                                        customStyles={customStyles}
                                        pagination
                                        paginationPerPage={10}
                                        paginationRowsPerPageOptions={[5, 10, 15, 20]}
                                        noDataComponent="No documents found matching your search"
                                    />
                                ) : (
                                    <div className="alert alert-info">
                                        {searchTerm ? 
                                            "No documents match your search criteria" : 
                                            "No documents found in your account"
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayOut>
    );
};

export default CandidateDocumentsView;