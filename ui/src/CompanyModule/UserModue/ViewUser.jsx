import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DeleteUserById, UserGetApi } from '../../Utils/Axios';
import LayOut from '../../LayOut/LayOut';
import DataTable from 'react-data-table-component';
import { PencilSquare, XSquare } from 'react-bootstrap-icons';
import { useLocation } from 'react-router-dom';

const ViewUser = () => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [userToDelete, setUserToDelete] = useState(null); // User to delete
  const [isDeleting, setIsDeleting] = useState(false);
  const location = useLocation();

  const fetchUsers = async () => {
    try {
      const res = await UserGetApi();
      setUsers(res.data.data); // assuming API returns { data: { data: [...] } }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleDelete = (id) => {
    setUserToDelete(id);  // Set the user to be deleted
    setShowModal(true);    // Show the confirmation modal
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await DeleteUserById(userToDelete);
      setUsers(users.filter(user => user.id !== userToDelete));
      setShowModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);  // Hide the modal without deleting
    setUserToDelete(null); // Clear the user to delete
  };

  // Filter the data based on search text
  const filteredUsers = users.filter((user) =>
    user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
    user.emailId.toLowerCase().includes(searchText.toLowerCase()) ||
    user.userType.toLowerCase().includes(searchText.toLowerCase()) ||
    user.department.toLowerCase().includes(searchText.toLowerCase())
  );

  // Columns definition for DataTable
  const columns = [
    {
      name: <h6><b>#</b></h6>,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "50px",
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
      button: true,
      cell: (row) => (
        <div>
          <Link to={`/editUser/${row.id}`} className="btn btn-sm me-2"><PencilSquare size={22} color='#2255a4' /></Link>
          <button onClick={() => handleDelete(row.id)} className="btn btn-sm"><XSquare size={22} color='#da542e' /></button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []); // fetch on mount

  useEffect(() => {
    if (location.state?.refresh) {
      console.log("Refresh triggered from location.state");
      fetchUsers();
    }
  }, [location.state?.refresh]); // fetch on state change

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1">
          <div className="col">
            <h1 className="h3">
              <strong>User View</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  Users List
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <div className="row w-100 align-items-center">
                  {/* Card Title */}
                  <div className="col">
                    <h2 className="card-title text-dark mb-0">User List</h2>
                  </div>

                  {/* Add New User Button */}
                  <div className="col-auto">
                    <Link to="/addUser" className="btn btn-success mb-0">Add New User</Link>
                  </div>

                  {/* Search Input */}
                  <div className="col-auto">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by Name, Email, Type, or Department"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                </div>
                <hr />
              </div>
              {/* DataTable */}
              <DataTable
                columns={columns}
                data={filteredUsers}  // Using the filtered users
                pagination
                paginationPerPage={10}
                onChangePage={page => setCurrentPage(page)}
                onChangeRowsPerPage={perPage => setRowsPerPage(perPage)}
                highlightOnHover
                dense
              />
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden={!showModal} style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteModalLabel">Confirm Deletion</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCancel}></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this user?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={isDeleting} >{isDeleting ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default ViewUser;
