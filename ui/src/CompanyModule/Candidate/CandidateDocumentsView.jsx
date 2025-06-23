import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FileEarmarkPdf, FileEarmarkWord, FileEarmarkImage, Eye } from "react-bootstrap-icons";
import LayOut from "../../LayOut/LayOut";
import { getDocumentByIdAPI } from "../../Utils/Axios";
import Loader from "../../Utils/Loader";
import DataTable from "react-data-table-component";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useNavigate,Link } from "react-router-dom";

const CandidateDocumentsView = () => {
    const navigate = useNavigate();
    const { userId, company } = useSelector((state) => state.auth);
    const [documents, setDocuments] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(null);


    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                const response = await getDocumentByIdAPI(userId);

                if (response.data?.documentEntities?.length > 0) {
                    setDocuments(response.data);

                    console.log("document fetch",response.data.documentEntities)
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

    // Handle document preview
   const handleViewDocument = (document) => {
    if (document?.filePath) {
        window.open(document.filePath, '_blank', 'noopener,noreferrer');
    } else {
        toast.error("Unable to open document: No file path available");
    }
};


    // Get document icon
    const getDocumentIcon = (filePath) => {
        const ext = filePath.split('.').pop().toLowerCase();
        if (ext === 'pdf') return <FileEarmarkPdf size={24} className="text-danger" />;
        if (['doc', 'docx'].includes(ext)) return <FileEarmarkWord size={24} className="text-primary" />;
        if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return <FileEarmarkImage size={24} className="text-success" />;
        return <FileEarmarkPdf size={24} />;
    };

    // Render document preview content
    const renderDocumentContent = () => {
        if (!currentDocument) return null;
        if (previewLoading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
        if (previewError) return <div className="text-center py-5 text-danger">{previewError}</div>;

        const ext = currentDocument.filePath.split('.').pop().toLowerCase();

        // PDF Preview
        if (ext === 'pdf') {
            return (
                <div className="w-100" style={{ height: '70vh' }}>
                    <iframe
                        src={currentDocument.filePath}
                        title={currentDocument.docName}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        onError={() => setPreviewError("Failed to load PDF preview")}
                    />
                </div>
            );
        }
        // Image Preview
        else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
            return (
                <div className="text-center" style={{ maxHeight: '70vh', overflow: 'auto' }}>
                    <img
                        src={currentDocument.filePath}
                        alt={currentDocument.docName}
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        className="img-fluid"
                        onError={() => setPreviewError("Failed to load image preview")}
                    />
                </div>
            );
        }
        // Unsupported file type
        else {
            return (
                <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '70vh' }}>
                    {getDocumentIcon(currentDocument.filePath)}
                    <p className="text-muted mt-3">Preview not available for this file type</p>
                </div>
            );
        }
    };

    // DataTable columns (simplified without download)
    const columns = [
        {
            name: "Document Name",
            selector: row => row.docName,
            sortable: true,
            wrap: true,
            grow: 2,
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
            width: '100px',
            center: true
        },
        {
            name: "Preview",
            cell: row => (
                <button
                    onClick={() => handleViewDocument(row)}
                    className="btn btn-sm btn-outline-primary"
                    title="Preview Document"
                >
                    <Eye size={16} />
                </button>
            ),
            width: '100px',
            center: true
        }
    ];

    if (loading) {
        return <LayOut><Loader /></LayOut>;
    }

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3"><strong>My Documents</strong></h1>
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
                            <div className="card-body" style={{ minHeight: '300px' }}>
                                {filteredDocuments.length > 0 ? (
                                    <DataTable
                                        columns={columns}
                                        data={filteredDocuments}
                                        pagination
                                        paginationPerPage={10}
                                        paginationRowsPerPageOptions={[5, 10, 15, 20]}
                                        noDataComponent={
                                            <div className="text-center py-5">
                                                No documents found matching your search
                                            </div>
                                        }
                                    />
                                ) : (
                                    <div className="alert alert-info text-center">
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

            {/* Document Preview Modal */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                style={{zIndex:999}}
            >
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        {currentDocument && (currentDocument.filePath)}
                        <span className="ms-2">{currentDocument?.docName}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {renderDocumentContent()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close Preview
                    </Button>
                </Modal.Footer>
            </Modal>
        </LayOut>
    );
};

export default CandidateDocumentsView;