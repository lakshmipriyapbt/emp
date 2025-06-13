import React, { useState, useEffect } from 'react';
import { PencilSquare, XSquareFill, EnvelopePaper } from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Slide, toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import LayOut from "../../LayOut/LayOut"; 
import { useAuth } from '../../Context/AuthContext';
// import { fetchCandidates, removeCandidateFromState } from '../Redux/CandidateSlice';
// import { sendDocumentUploadLink } from '../Services/CandidateService'; // Assume this API service exists

const CandidatesView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // const { candidates } = useSelector(state => state.candidates); 
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isSending, setIsSending] = useState(false);
    const { employee } = useAuth();
    const companyId = employee?.companyId;

    // useEffect(() => {
    //     if (companyId) {
    //         dispatch(fetchCandidates(companyId));
    //     }
    // }, [dispatch, companyId]);    

    // useEffect(() => {
    //     if (candidates && Array.isArray(candidates)) {
    //         const result = candidates.filter((candidate) =>
    //             candidate.fullName.toLowerCase().includes(search.toLowerCase()) ||
    //             candidate.email.toLowerCase().includes(search.toLowerCase()) ||
    //             candidate.mobile.includes(search)
    //         );
    //         setFilteredData(result);
    //     } else {
    //         setFilteredData([]);
    //     }
    // }, [search, candidates]);

    if (!companyId) {
        return <p>Loading...</p>;
    }

    const handleEdit = (candidateId) => {
        navigate(`/candidateRegistration`, { state: { candidateId } });
    };

    // const handleDelete = async (candidateId) => {
    //     try {
    //         dispatch(removeCandidateFromState(candidateId));
    //         toast.error('Candidate deleted successfully', {
    //             position: 'top-right',
    //             transition: Slide,
    //             hideProgressBar: true,
    //             theme: "colored",
    //             autoClose: 1000,
    //         });
    //     } catch (error) {
    //         console.error('Error in handleDelete:', error.response || error);
    //         if (error.response?.data) {
    //             toast.error(error.response.data.message || 'Failed to delete candidate');
    //         }
    //     }
    // };

    // const handleSendUploadLink = async (candidateId, email) => {
    //     setIsSending(true);
    //     try {
    //         const response = await sendDocumentUploadLink(companyId, candidateId);
            
    //         toast.success(`Upload link sent to ${email}`, {
    //             position: 'top-right',
    //             transition: Slide,
    //             hideProgressBar: true,
    //             theme: "colored",
    //             autoClose: 2000,
    //         });
            
    //         // Update the candidate's status in Redux store if needed
    //         // dispatch(updateCandidateStatus(candidateId, 'link_sent'));
            
    //     } catch (error) {
    //         console.error('Error sending upload link:', error);
    //         toast.error(`Failed to send link to ${email}`, {
    //             position: 'top-right',
    //             transition: Slide,
    //             hideProgressBar: true,
    //             theme: "colored",
    //             autoClose: 2000,
    //         });
    //     } finally {
    //         setIsSending(false);
    //     }
    // };

    const columns = [
        {
            name: <h6><b>#</b></h6>,
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            width: "50px",
        },
        {
            name: <h6><b>Full Name</b></h6>,
            selector: (row) => row.fullName,
            sortable: true,
            width: "150px"
        },
        {
            name: <h6><b>Mobile</b></h6>,
            selector: (row) => row.mobile,
            width: "130px"
        },
        {
            name: <h6><b>Email</b></h6>,
            selector: (row) => row.email,
            width: "200px"
        },
        {
            name: <h6><b>Position</b></h6>,
            selector: (row) => row.position,
            width: "150px"
        },
        {
            name: <h6><b>Status</b></h6>,
            selector: (row) => row.documentsStatus || 'Not Sent',
            width: "120px",
            cell: (row) => (
                <span className={`badge ${row.documentsStatus === 'Uploaded' ? 'bg-success' : 
                                 row.documentsStatus === 'Pending' ? 'bg-warning' : 'bg-secondary'}`}>
                    {row.documentsStatus || 'Not Sent'}
                </span>
            )
        },
        {
            name: <h6><b>Actions</b></h6>,
            cell: (row) => (
                <div className="d-flex">
                    <button
                        className="btn btn-sm me-1"
                        onClick={() => handleEdit(row.candidateId)}
                        title="Edit"
                    >
                        <PencilSquare size={20} color='#2255a4' />
                    </button>
                    <button
                        className="btn btn-sm me-1"
                        // onClick={() => handleSendUploadLink(row.candidateId, row.email)}
                        title="Send Document Upload Link"
                        disabled={isSending}
                    >
                        {isSending ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            <EnvelopePaper size={20} color='#28a745' />
                        )}
                    </button>
                    <button
                        className="btn btn-sm"
                        // onClick={() => handleDelete(row.candidateId)}
                        title="Delete"
                    >
                        <XSquareFill size={20} color='#da542e' />
                    </button>
                </div>
            ),
            width: "180px"
        }
    ];

    const getFilteredList = (searchTerm) => {
        setSearch(searchTerm);
    };

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3"><strong>Candidates</strong></h1>
                    </div>
                    <div className="col-auto">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to={"/"}>Home</Link>
                                </li>
                                <li className="breadcrumb-item active">Candidates</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-lg-12 col-xxl-12 d-flex">
                        <div className="card flex-fill">
                            <div className="card-header">
                                <div className="row align-items-center">
                                    <div className="col-md-4">
                                        <Link to={"/candidateRegistration"}>
                                            <button className="btn btn-primary">
                                                <i className="fas fa-plus me-2"></i>Add Candidate
                                            </button>
                                        </Link>
                                    </div>
                                    <div className="col-md-4 offset-md-4 d-flex justify-content-end">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by name, email or mobile..."
                                            value={search}
                                            onChange={(e) => getFilteredList(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <DataTable
                                    columns={columns}
                                    data={filteredData}
                                    pagination
                                    paginationPerPage={rowsPerPage}
                                    onChangePage={page => setCurrentPage(page)}
                                    onChangeRowsPerPage={perPage => setRowsPerPage(perPage)}
                                    highlightOnHover
                                    pointerOnHover
                                    noDataComponent="No candidates found"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayOut>
    );
};

export default CandidatesView;