import React, { useState, useEffect } from "react";
import { XSquareFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Slide, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import LayOut from "../../LayOut/LayOut";
import { CandidateDeleteApi } from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";
import { fetchCandidates, removeCandidateFromState } from "../../Redux/CandidateSlice";
import DeletePopup from "../../Utils/DeletePopup";
import Loader from "../../Utils/Loader";

const CandidatesView = () => {
  const dispatch = useDispatch();
  const { candidates, loading, error } = useSelector((state) => state.candidates);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const { employee } = useAuth();
  const companyId = employee?.companyId;

  // Fetch all candidates on component mount
  useEffect(() => {
    if (companyId) {
      setIsFetching(true);
      const timer = setTimeout(() => {
        dispatch(fetchCandidates(companyId)).finally(() => setIsFetching(false));
      }, 500); // Delay of 500ms

      return () => clearTimeout(timer);
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    console.log("Candidates from Redux store:", candidates);
  }, [candidates]);

  // Filter candidates based on search term
  useEffect(() => {
    if (candidates && Array.isArray(candidates)) {
      const result = candidates.filter((candidate) => {
        const fullName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.toLowerCase();
        return (
          fullName.includes(search.toLowerCase()) ||
          (candidate.emailId && candidate.emailId.toLowerCase().includes(search.toLowerCase())) ||
          (candidate.mobileNo && candidate.mobileNo.includes(search))
        );
      });
      setFilteredData(result);
    } else {
      setFilteredData([]);
      toast.error(error);
    }
  }, [search, candidates, error]);

  // Function to open delete confirmation modal
  const handleOpenDeleteModal = (candidateId) => {
    setSelectedItemId(candidateId);
    setShowDeleteModal(true);
  };

  // Function to close delete confirmation modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItemId(null);
  };

  const handleDelete = async (id) => {
  if (!id) return;
  try {
    await CandidateDeleteApi(id);
    dispatch(removeCandidateFromState(id));
    toast.success("Candidate deleted successfully", {
      position: "top-right",
      transition: Slide,
      hideProgressBar: true,
      theme: "colored",
      autoClose: 1000,
    });
  } catch (error) {
    console.error("Error in handleDelete:", error.response || error);
    toast.error(error.response?.data?.message || "Failed to delete candidate", {
      position: "top-right",
      transition: Slide,
      hideProgressBar: true,
      theme: "colored",
      autoClose: 2000,
    });
  } finally {
    handleCloseDeleteModal();
  }
};

  const columns = [
    {
      name: (
        <h6>
          <b>#</b>
        </h6>
      ),
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "45px",
    },
    {
      name: (
        <h6>
          <b>Candidate ID</b>
        </h6>
      ),
      selector: (row) => row.candidateId,
      width: "140px",
    },
    {
      name: (
        <h6>
          <b>Full Name</b>
        </h6>
      ),
      selector: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim(),
      width: "180px",
    },
    {
      name: (
        <h6>
          <b>Mobile</b>
        </h6>
      ),
      selector: (row) => row.mobileNo,
      width: "150px",
    },
    {
      name: (
        <h6>
          <b>Email</b>
        </h6>
      ),
      selector: (row) => row.emailId,
      width: "200px",
    },
    {
      name: (
        <h6>
          <b>Hiring Date</b>
        </h6>
      ),
      selector: (row) => row.dateOfHiring,
      width: "140px",
    },
    {
      name: (
        <h6>
          <b>Status</b>
        </h6>
      ),
      cell: (row) => (
        <span className={`badge ${row.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
          {row.status}
        </span>
      ),
      width: "100px",
    },
    {
      name: (
        <h6>
          <b>Actions</b>
        </h6>
      ),
      cell: (row) => (
        <button
          className="btn btn-sm"
          style={{ backgroundColor: "transparent", border: "none" }}
          onClick={() => handleOpenDeleteModal(row.id)}
          title="Delete"
        >
          <XSquareFill size={22} color="#da542e" />
        </button>
      ),
      width: "100px",
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
                  <strong>Candidates View</strong>
                </h1>
              </div>
              <div className="col-auto">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/main" className="custom-link">Home</Link>
                    </li>
                    <li className="breadcrumb-item active">Candidates</li>
                    <li className="breadcrumb-item active">Candidates View</li>
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
                        <Link to={"/candidateRegistration"}>
                          <button className="btn btn-primary">Add Candidate</button>
                        </Link>
                      </div>
                      <div className="col-md-4 offset-md-4 d-flex justify-content-end">
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Search..."
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
                <DeletePopup
                  show={showDeleteModal}
                  handleClose={handleCloseDeleteModal}
                  handleConfirm={handleDelete}
                  id={selectedItemId}
                  pageName="Candidate Details"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </LayOut>
  );
};

export default CandidatesView;