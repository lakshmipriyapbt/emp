// AddUser.jsx
import React from 'react';
import UserForm from './UserForm';
import { useNavigate } from 'react-router-dom';
import LayOut from '../../LayOut/LayOut';
import { UserPostApi } from '../../Utils/Axios';
import { toast } from 'react-toastify';

const AddUser = () => {
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await UserPostApi(data);
       const successMessage =data.message || 'User Created Successfully';
                toast.success(successMessage, {
                  position: 'top-right',
                  autoClose: 1000,
                });
                setTimeout(() => {
                  navigate('/viewUser', { state: { refresh: Date.now() } });
                }, 500); 
       } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Error updating User';
          toast.error(errorMsg, {
            position: 'top-right',
            autoClose: 1000,
          });
      }
  };

  return (
       <LayOut>
          <div className="container-fluid p-0">
            <div className="row d-flex align-items-center justify-content-between mt-1">
              <div className="col">
                <h1 className="h3">
                  <strong>User Registration Form</strong>
                </h1>
              </div>
              <div className="col-auto">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <a href="/main">Home</a>
                    </li>
                    <li className="breadcrumb-item active">
                       User Registration Form
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
    
            <div className="row mt-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title text-dark">Add User</h5>
                  </div>
                  <UserForm onSubmit={onSubmit} />
                </div>
              </div>
            </div>
          </div>
        </LayOut>
  );
};

export default AddUser;
