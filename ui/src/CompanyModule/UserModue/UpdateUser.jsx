// UpdateUser.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserForm from './UserForm';
import { getUserById, UserPatchApi } from '../../Utils/Axios';

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [defaultValues, setDefaultValues] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserById(id);
        setDefaultValues(res.data.data); // assuming response format
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, [id]);

  const onSubmit = async (data) => {
    try {
      await UserPatchApi(id, data);
      navigate('/');
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Edit User</h2>
      {defaultValues ? (
        <UserForm onSubmit={onSubmit} defaultValues={defaultValues} isEdit />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UpdateUser;
