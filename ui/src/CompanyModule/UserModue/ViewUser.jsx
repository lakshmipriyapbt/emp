// ViewUser.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DeleteUserById, UserGetApi } from '../../Utils/Axios';

const ViewUser = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await UserGetApi();
      setUsers(res.data.data); // assuming API returns { data: { data: [...] } }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await DeleteUserById(id);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <div className="container mt-4">
      <h2>User List</h2>
      <Link to="/add" className="btn btn-success mb-3">Add New User</Link>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>User Type</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.emailId}</td>
              <td>{user.userType}</td>
              <td>{user.department}</td>
              <td>
                <Link to={`/edit/${user.id}`} className="btn btn-primary btn-sm me-2">Edit</Link>
                <button onClick={() => handleDelete(user.id)} className="btn btn-danger btn-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewUser;
