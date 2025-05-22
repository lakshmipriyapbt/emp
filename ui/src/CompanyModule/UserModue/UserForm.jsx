// UserForm.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DepartmentGetApi } from '../../Utils/Axios';
import { toInputTitleCase, validateEmail, validateFirstName, validateLastName } from '../../Utils/Validate';

const USER_TYPES = [
  { id: 'admin', name: 'Admin' },
  { id: 'accountant', name: 'Accountant' },
  { id: 'hr', name: 'HR' }
];

const UserForm = ({ onSubmit, defaultValues = {}, isEdit = false }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch
  } = useForm({ 
    defaultValues ,
    mode: 'onChange' 
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const departmentWatch = watch('department');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await DepartmentGetApi();
        setDepartments(res.data.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (departmentWatch) {
      setValue('designation', '');
      // Optional: fetchDesignations(departmentWatch);
    }
  }, [departmentWatch, setValue]);

  if (loading) return <p>Loading form...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 border rounded bg-light">
      {/* First Name */}
      <div className="mb-3">
        <label className="form-label">First Name</label>
        <input
          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
          onInput={toInputTitleCase}
           {...register("firstName", {
            required: "First Name is required",
            validate: validateFirstName
           })}
        />
        <div className="invalid-feedback">{errors.firstName?.message}</div>
      </div>

      {/* Last Name */}
      <div className="mb-3">
        <label className="form-label">Last Name</label>
        <input
          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
          onInput={toInputTitleCase}
           {...register("lastName", {
           required: "Last Name is required",
            validate: validateLastName
           })}
        />
        <div className="invalid-feedback">{errors.lastName?.message}</div>
      </div>

      {/* Email */}
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className={`form-control ${errors.emailId ? 'is-invalid' : ''}`}
           {...register("emailId", {
            required: "Email is required",
            validate: validateEmail
            })}
        />
        <div className="invalid-feedback">{errors.emailId?.message}</div>
      </div>

      {/* User Type (Static Dropdown) */}
      <div className="mb-3">
        <label className="form-label">User Type</label>
        <select
          {...register('userType', { required: 'User Type is required' })}
          className={`form-select ${errors.userType ? 'is-invalid' : ''}`}
        >
          <option value="">Select User Type</option>
          {USER_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        <div className="invalid-feedback">{errors.userType?.message}</div>
      </div>

      {/* Department (Dynamic Dropdown) */}
      <div className="mb-3">
        <label className="form-label">Department</label>
        <select
          {...register('department', {
            required: 'Department is required',
            onChange: (e) => {
              setValue('designation', '');
              // fetchDesignations(e.target.value); // optional
            }
          })}
          className={`form-select ${errors.department ? 'is-invalid' : ''}`}
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <div className="invalid-feedback">{errors.department?.message}</div>
      </div>

      {/* Submit */}
      <button type="submit" className="btn btn-primary">
        {isEdit ? 'Update User' : 'Add User'}
      </button>
    </form>
  );
};

export default UserForm;
