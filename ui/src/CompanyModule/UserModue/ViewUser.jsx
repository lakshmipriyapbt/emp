import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteUserById } from '../../Utils/Axios';
import { fetchUsers, removeUserFromState } from '../../Redux/UserSlice';
import LayOut from '../../LayOut/LayOut';
import DataTable from 'react-data-table-component';
import { PencilSquare, XSquareFill } from 'react-bootstrap-icons';
import { Slide, toast } from 'react-toastify';
import DeletePopup from '../../Utils/DeletePopup';
import Loader from '../../Utils/Loader';

const ViewUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { users, loading, error } = useSelector((state) => state.users);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    setIsFetching(true);
    const timer = setTimeout(() => {
      dispatch(fetchUsers()).finally(() => setIsFetching(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.refresh) {
      dispatch(fetchUsers());
    }
  }, [dispatch, location.state?.refresh]);

  const handleEdit = (userId) => {
    navigate(`/editUser/${userId}`);
  };

  const handleOpenDeleteModal = (userId) => {
    setSelectedItemId(userId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItemId(null);
  };

  const handleDelete = async (userId) => {
    if (!selectedItemId) return;
    try {
      await DeleteUserById(userId);
      dispatch(removeUserFromState(userId));
      toast.error("User deleted successfully", {
        position: "top-right",
        transition: Slide,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 1000,
      });
    } catch (error) {
      console.error("Error in handleDelete:", error.response || error);
      if (error.response && error.response.data) {
        console.error("Server Error Message:", error.response.data);
      }
    } finally {
      handleCloseDeleteModal();
    }
  };

  const filteredUsers = users.filter((user) =>
    user.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.emailId?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.userType?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.departmentName?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      name: <h6><b>#</b></h6>,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: '50px',
    },
    {
      name: 'Name',
      selector: row => `${row.firstName} ${row.lastName}`,
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.emailId,
      sortable: true,
    },
    {
      name: 'User Type',
      selector: row => row.userType,
      sortable: true,
    },
    {
      name: 'Department',
      selector: row => row.departmentName,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent", border: "none" }}
            onClick={() => handleEdit(row.id)}
            title="Edit"
          >
            <PencilSquare size={22} color="#2255a4" />
          </button>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent", border: "none" }}
            onClick={() => handleOpenDeleteModal(row.id)}
            title="Delete"
          >
            <XSquareFill size={22} color="#da542e" />
          </button>
        </div>
      ),
    },
  ];

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
                  <strong>User View</strong>
                </h1>
              </div>
              <div className="col-auto">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to="/main" className="custom-link">Home</Link>
                    </li>
                    <li className="breadcrumb-item active">Users List</li>
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
                        <Link to="/addUser">
                          <button className="btn btn-primary">Add New User</button>
                        </Link>
                      </div>
                      <div className="col-md-4 offset-md-4 d-flex justify-content-end">
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Search by Name, Email, Type, or Department"
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <DataTable
                    columns={columns}
                    data={filteredUsers}
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
                  pageName="User"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </LayOut>
  );
};

export default ViewUser;