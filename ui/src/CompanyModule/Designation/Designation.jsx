import React, { useState, useEffect } from 'react';
import { PencilSquare, XSquareFill } from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import { Bounce, toast } from 'react-toastify';
import { useAuth } from '../../Context/AuthContext';
import { DesignationDeleteApiById, DesignationGetApi, DesignationPostApi, DesignationPutApiById } from '../../Utils/Axios';
import DeletePopup from '../../Utils/DeletePopup';

const Designation = ({ deptName }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({ mode: "onChange" });
  const [designations, setDesignations] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [addDesignation, setAddDesignation] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null); 
  const { authUser } = useAuth();

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItemId(null);
  };

  const handleShowDeleteModal = (id) => {
    setSelectedItemId(id);
    setShowDeleteModal(true);
  };

  const handleCloseAddDesignationModal = () => {
    setAddDesignation(false);
    reset();
    setEditingUserId(null);
  };

  const fetchDesignation = async () => {
    try {
      const designations = await DesignationGetApi();
      const sortedDesignations = designations.sort((a, b) => a.name.localeCompare(b.name));
      setDesignations(sortedDesignations);
      console.log(designations); // This will log the fetched designations to the console
    } catch (error) {
      handleApiErrors(error);
    }
  };

  useEffect(() => {
    fetchDesignation();
  }, []);

  const onSubmit = async (data) => {
    try {
      const formData = {
        companyName: authUser.company,
        name: data.name
      };

      let updatedDesignations = [...designations]; 

      if (editingUserId) {
        const index = updatedDesignations.findIndex(dept => dept.id === editingUserId);
        if (index !== -1) {
          updatedDesignations[index] = { ...updatedDesignations[index], name: data.name };
          setDesignations(updatedDesignations);
        }
        await DesignationPutApiById(editingUserId, formData);
        toast.success('Designation Updated Successfully');
      } else {
        const newDesignation = { ...formData };
        updatedDesignations.push(newDesignation);
        setDesignations(updatedDesignations);
        await DesignationPostApi(formData);
        toast.success('Designation Created Successfully');
      }

      setAddDesignation(false); 
      reset();
      setEditingUserId(null);
      setTimeout(() => {
        fetchDesignation();
      }, 1500);
    } catch (error) {
      handleApiErrors(error);
      fetchDesignation(); 
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedItemId) {
      try {
        await DesignationDeleteApiById(selectedItemId);
        toast.success("Designation Deleted Successfully", {
          position: "top-right",
          transition: Bounce,
          hideProgressBar: true,
          theme: "colored",
          autoClose: 1000,
        });
        const updatedDesignations = designations.filter(designation => designation.id !== selectedItemId);
        setDesignations(updatedDesignations);
        setTimeout(() => {
          fetchDesignation();
          handleCloseDeleteModal();
        }, 2000);
      } catch (error) {
        handleApiErrors(error);
        setDesignations(designations); 
      } finally {
        handleCloseDeleteModal();
      }
    }
  };

  const handleApiErrors = (error) => {
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error !");
    }
    console.error(error.response);
  };

  useEffect(() => {
    const temp = designations.filter((dsgn) => deptName?.toLowerCase() === dsgn?.name?.toLowerCase());
    setFilteredData(temp);
  }, [designations, deptName]);

  const getFilteredList = (searchTerm) => {
    if (searchTerm === '') {
      setFilteredData(designations);
    } else {
      const filteredList = designations.filter(designation =>
        designation.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filteredList);
    }
  };

  const handleEdit = (id) => {
    const userToEdit = designations.find(user => user.id === id);
    if (userToEdit) {
      setValue('name', userToEdit.name);
      setEditingUserId(id);
      setAddDesignation(true);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="row">
        <div className="col-12 col-lg-12 col-xxl-12 d-flex">
          <div className="card flex-fill">
            {/* Designations List (with icons only for Edit and Delete) */}
            <div>
              {filteredData.length === 0 && (
                <div className="d-flex justify-content-between align-items-center mb-2 custom-designation">
                  <h5 style={{paddingLeft:"5px", paddingTop:"5px"}}>No Designations Available</h5>
                  {/* Add Designation button for no designations */}
                  <h4 className="mb-0" style={{ paddingRight: "20px" }}>
                    <a
                      href="#"
                      onClick={() => setAddDesignation(true)}
                      className="text-decoration-none add-designation-link"
                    >
                      <button className="btn btn-link p-0">Add Designation</button>
                    </a>
                  </h4>
                </div>
              )}

              {/* Display Designations and Icons */}
              {filteredData.map((designation) => (
                <div key={designation.id} className="d-flex justify-content-between align-items-center mb-2 custom-designation" style={{padding:"5px"}}>
                  {/* Left Side: Designation Name */}
                  <div className="d-flex align-items-center">
                    <h4 className="me-3 designation-text mb-0">Designation: {designation.name}</h4>
                  </div>
                  {/* Right Side: Icons (Edit, Delete) and Add Designation */}
                  <div className="d-flex align-items-center">
                    <PencilSquare
                      size={22}
                      color="#2255a4"
                      className="cursor-pointer me-3"
                      onClick={() => handleEdit(designation.id)}
                      title="Edit"
                    />
                    <XSquareFill
                      size={22}
                      color="#da542e"
                      className="cursor-pointer me-3"
                      onClick={() => handleShowDeleteModal(designation.id)}
                      title="Delete"
                    />
                    <a
                      style={{ paddingRight: "20px", fontSize: "14px" }}
                      href="#"
                      onClick={() => setAddDesignation(true)}
                      className="text-decoration-none add-designation-link"
                    >
                      <button className="btn btn-link p-0">Add Designation</button>
                    </a>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <DeletePopup
            show={showDeleteModal}
            handleClose={handleCloseDeleteModal}
            handleConfirm={handleConfirmDelete}
            id={selectedItemId}
            pageName="Designation"
          />

          {addDesignation && (
            <div
              role="dialog"
              aria-modal="true"
              className="fade modal show"
              tabIndex="-1"
              style={{ zIndex: "9999", display: "block" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{editingUserId ? "Update Designation" : "Add Designation"}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={handleCloseAddDesignationModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleSubmit(onSubmit)} id="designationForm">
                      <div className="card-body" style={{ width: "1060px", paddingBottom: "0px" }}>
                        <div className="row">
                          <div className="col-12 col-md-6 col-lg-4 mb-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter Designation"
                              name="name"
                              id="designation"
                              autoComplete="off"
                              {...register("name", {
                                required: "Designation is Required",
                              })}
                            />
                            {errors.name && <p className="errorMsg">{errors.name.message}</p>}
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleCloseAddDesignationModal}
                        >
                          Cancel
                        </button>
                        <button
                          className={editingUserId ? "btn btn-danger" : "btn btn-primary"}
                          type="submit"
                        >
                          {editingUserId ? "Update Designation" : "Add Designation"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Designation;
