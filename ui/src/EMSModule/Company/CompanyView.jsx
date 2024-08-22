import React, { useState, useEffect } from "react";
import { PencilSquare, XSquareFill } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { Bounce, toast } from "react-toastify";
import DeletePopup from "../../Utils/DeletePopup";
import LayOut from "../../LayOut/LayOut";
import axios from "axios";
import { companyDeleteByIdApi, companyViewApi } from "../../Utils/Axios";
import { useLocation, useNavigate } from "react-router-dom";

const CompanyView = () => {
  const [view, setView] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showNoRecordsMessage, setShowNoRecordsMessage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const Navigate = useNavigate();

  const getUser = async () => {
    try {
      const response = await companyViewApi();
      setView(response.data.data);
    } catch (error) {
      handleApiErrors(error);
    } 
  };

  const getData = (id) => {
    console.log(id);
    Navigate(`/companyRegistration`, { state: { id } });
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItemId(null);
  };

  const handleShowDeleteModal = (id) => {
    setSelectedItemId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItemId) {
      try {
        const response = await companyDeleteByIdApi(selectedItemId);
        if (response.status === 200) {
          setTimeout(() => {
            toast.success("Company Deleted Successfully", {
              position: "top-right",
              transition: Bounce,
              hideProgressBar: true,
              theme: "colored",
              autoClose: 3000,
            }, 1500);
          });
          getUser(); // Refresh the list after deletion
          handleCloseDeleteModal();
        } else {
          toast.error("Failed to delete company. Please try again.", {
            position: "top-right",
            transition: Bounce,
            hideProgressBar: true,
            theme: "colored",
            autoClose: 3000,
          });
        }
      } catch (error) {
        handleApiErrors(error);
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [view, filteredData]);

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
      name: <h6><b>S No</b></h6>,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "70px",
    },
    {
      name: <h6><b>Company Name</b></h6>,
      selector: row => (
        <div title={row.companyName}>
          {row.companyName.slice(0, 12)}
        </div>
      ),
      width: "220px",
      wrap: true,
    },
    {
      name: <h6><b>Authorized Name</b></h6>,
      selector: row => (
        <div title={row.name}>
          {row.name.slice(0, 8)}
        </div>
      ),
      width: "220px",
      wrap: true,
    },
    {
      name: <h6><b>Email Id</b></h6>,
      selector: row => (
        <div title={row.emailId}>
          {row.emailId.slice(0, 15)}
        </div>
      ),
      sortable: true,
      width: "200px",
    },
    {
      name: <h6><b>Mobile No</b></h6>,
      selector: (row) => row.mobileNo,
      width: "160px",
      wrap: true,
    },
    {
      name: <h6><b>Action</b></h6>,
      width: "130px",
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "0",
              marginRight: "10px",
            }}
            onClick={() => getData(row.id)}
            title="Edit"
          >
            <PencilSquare size={22} color="#2255A4" />
          </button>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "0",
              marginLeft: "5px",
            }}
            onClick={() => handleShowDeleteModal(row.id)}
            title="Delete"
          >
            <XSquareFill size={22} color="#DA542E" />
          </button>
        </div>
      ),
    },
  ];

  const getFilteredList = (searchTerm) => {
    setSearch(searchTerm);
    const filtered = view.filter((item) => {
      const lowerCasedSearchTerm = searchTerm.toLowerCase();
      return (
        item.companyName.toLowerCase().includes(lowerCasedSearchTerm) ||
        item.name.toLowerCase().includes(lowerCasedSearchTerm)
      );
    });
    setFilteredData(filtered);
    setShowNoRecordsMessage(filtered.length === 0);
  };

  const handleSearch = () => {
    console.log("Perform search with:", search, selectedMonth, selectedYear);
  };

  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    value = value.replace(/^\s+/g, '');
    if (!/\S/.test(value)) {
      value = value.replace(/\s+/g, '');
    } else {
      value = value.replace(/^\s+/g, '');
      const words = value.split(' ');
      const capitalizedWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      });
      value = capitalizedWords.join(' ');
    }
    input.value = value;
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3"><strong>Summary</strong> </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  Summary
                </li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-lg-12 col-xxl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header">
                <div className='row mb-2'>
                  <div className='col-12 col-md-6 col-lg-4'>
                  </div>
                  <div className='col-12 col-md-6 col-lg-4'></div>
                  <div className='col-12 col-md-6 col-lg-4'>
                    <input type='search' className="form-control" placeholder='Search....'
                      value={search}
                      onInput={toInputTitleCase}
                      onChange={(e) => getFilteredList(e.target.value)}
                    />
                  </div>
                </div>
                <div className="dropdown-divider" style={{ borderTopColor: "#D7D9DD" }} />
              </div>
              {filteredData.length === 0 && showNoRecordsMessage ? (
                <div className="p-4 text-center">No records found.</div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredData.length > 0 ? filteredData : view}
                  pagination
                  onChangePage={page => setCurrentPage(page)}
                  onChangeRowsPerPage={perPage => setRowsPerPage(perPage)}
                />
              )}
            </div>
          </div>
          <DeletePopup
            show={showDeleteModal}
            handleClose={handleCloseDeleteModal}
            handleConfirm={() => handleConfirmDelete(selectedItemId)}
            id={selectedItemId}
            pageName="Company"
          />
        </div>
      </div>
    </LayOut>
  );
};

export default CompanyView;