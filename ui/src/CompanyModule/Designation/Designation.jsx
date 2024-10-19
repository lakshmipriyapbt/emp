import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { PencilSquare, XSquareFill } from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import { ModalBody, ModalHeader, ModalTitle } from 'react-bootstrap';
import { Bounce, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DeletePopup from '../../Utils/DeletePopup';
import LayOut from '../../LayOut/LayOut';
import {
  DesignationDeleteApiById,
  DesignationGetApi,
  DesignationPostApi,
  DesignationPutApiById
} from '../../Utils/Axios';
import { useAuth } from '../../Context/AuthContext';

const Designation = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({mode:"onChange"});
  const [designations, setDesignations] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [pending, setPending] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addDesignation, setAddDesignation] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null); // State to store the ID of the item to be deleted
  const { user} = useAuth();
  const navigate = useNavigate();
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
    setEditingId(null);
  };

   const fetchDesignation = async () => {
    try {
      const designations = await DesignationGetApi();
      const sortedDesignations = designations.sort((a, b) => a.name.localeCompare(b.name));
      setDesignations(sortedDesignations);
      setFilteredData(sortedDesignations);
    } catch (error) {
      // handleApiErrors(error);
    }
  };
  
  useEffect(() => {
    fetchDesignation();
  }, []);

  const onSubmit = async (data) => {
    setPending(true);
    try {
      const formData = {
        companyName: user.company,
        name: data.name
      };
      if (editingUserId) {
        await DesignationPutApiById(editingUserId, formData);
        setTimeout(() => {
          toast.success('Designation Updated Successfully');
            fetchDesignation(); // Fetch updated list of departments after delay
            setAddDesignation(false);
          }, 900);
      
      } else {
        await DesignationPostApi(formData);
       
        setTimeout(() => {
          toast.success('Designation Created Successfully');
          fetchDesignation(); // Fetch updated list of departments after delay
          setAddDesignation(false);
          }, 1000);
      }
      console.log("data:",designations);
      reset();
      setEditingUserId(null);
      reset();
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setPending(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedItemId) {
      // Optimistically update the state
      const updatedDesignations = designations.filter(designation => designation.id !== selectedItemId);
      setDesignations(updatedDesignations);
      
      try {
        await DesignationDeleteApiById(selectedItemId);
        toast.success("Designation Deleted Successfully", {
          position: "top-right",
          transition: Bounce,
          hideProgressBar: true,
          theme: "colored",
          autoClose: 1000,
        });
  
        // If no designations are left, you can choose to refetch
        if (updatedDesignations.length === 0) {
          // Optionally refetch the designations again if needed
          // fetchDesignations(); // Uncomment this if you want to refetch from API
        }
  
        setTimeout(() => {
          // Fetch the updated list after a delay, if needed
          fetchDesignation();
          handleCloseDeleteModal();
        }, 1500);
      } catch (error) {
        handleApiErrors(error);
        // If there's an error, revert to the original state (not shown in your code)
        setDesignations(designations); // Reset to original state
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
  
  const validateName = (value) => {
    if (!value || value.trim().length === 0) {
      return "Designation Name is Required.";
    } else if (!/^[A-Za-z ]+$/.test(value)) {
      return "Only Alphabetic Characters are Allowed.";
    } else {
      const words = value.split(" ");
      
      for (const word of words) {
        if (word.length < 2 || word.length > 40) {
          return "Invalid Length of Designation.";
        }
      }
      
      if (/^\s|\s$/.test(value)) {
        return "No Leading or Trailing Spaces Allowed.";
      } else if (/\s{2,}/.test(value)) {
        return "No Multiple Spaces Between Words Allowed.";
      }
    }
  
    return true; // Return true if all conditions are satisfied
  };

  const getFilteredList = (searchData) => {
    setSearch(searchData);
    const filtered = designations.filter((item) => {
      // Convert all fields to lowercase for case-insensitive search
      const searchTerm = searchData.toLowerCase();
      const id = item.id.toString().toLowerCase(); // Convert id to string and then to lowercase
      const name = item.name.toLowerCase();
      // Check if any field contains the search term
      return id.includes(searchTerm) || name.includes(searchTerm);
    });
    setFilteredData(filtered);
  };
  const paginationComponentOptions = {
    noRowsPerPage: true,
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setRowsPerPage(newPerPage);
    setCurrentPage(page);
  };

  // Calculate the start index and end index for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Slice the filtered data based on the current page and rows per page
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Compute the serial number for each row
  const getSerialNumber = (index) => startIndex + index + 1;

  const columns = [
    {
      name: <h5><b>S No</b></h5>,
      selector: (row, index) => getSerialNumber(index),
    },
    {
      name: <h5><b>Designation</b></h5>,
      selector: (row) => row.name,
    },
    {
      name: <h5><b>Actions</b></h5>,
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent", border: "none", padding: "0", marginRight: "10px" }}
            onClick={() => handleEdit(row.id)}
            title='Edit'
          >
            <PencilSquare size={22} color='#2255a4' />
          </button>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "transparent", border: "none", padding: "0", marginLeft: "5px" }}
            onClick={() => handleShowDeleteModal(row.id)}
            title='Delete'
          >
            <XSquareFill size={22} color='#da542e' />
          </button>
        </div>
      )
    }
  ];

  const handleEdit = (id) => {
    const userToEdit = designations.find(user => user.id === id);
    if (userToEdit) {
      setValue('name', userToEdit.name);
      setEditingUserId(id);
      setAddDesignation(true);
    }
  };

  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position
    // Remove leading spaces
    value = value.replace(/^\s+/g, '');
    // Ensure only alphabets and spaces are allowed
    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
    value = value.split('').filter(char => allowedCharsRegex.test(char)).join('');
    // Capitalize the first letter of each word
    const words = value.split(' ');
    // Capitalize the first letter of each word and lowercase the rest
    const capitalizedWords = words.map(word => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return '';
    });
    // Join the words back into a string
    let formattedValue = capitalizedWords.join(' ');
    // Remove spaces not allowed (before the first two characters)
    if (formattedValue.length > 3) {
      formattedValue = formattedValue.slice(0, 3) + formattedValue.slice(3).replace(/\s+/g, ' ');
    }
    // Update input value
    input.value = formattedValue;
    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
  };
  const handleEmailChange = (e) => {
    // Get the current value of the input field
    const value = e.target.value;
    
    // Check if the value is empty
    if (value.trim() !== '') {
        return; // Allow space button
    }

    // Prevent space character entry if the value is empty
    if (e.keyCode === 32) {
        e.preventDefault();
    }
};

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1">
          <div className="col">
            <h1 className="h3 mb-3"><strong>Designation</strong> </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  Designation
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
                    <button
                      onClick={() => setAddDesignation(true)}
                      className="btn btn-primary"
                      type='submit'
                    >
                      Add Designation
                   
                    </button>
                  </div>
                  <div className='col-12 col-md-6 col-lg-4'></div>
                  <div className='col-12 col-md-6 col-lg-4'>
                    <input
                      type='search'
                      className="form-control"
                      placeholder='Search....'
                      value={search}
                      onInput={toInputTitleCase}
                      onChange={(e) => getFilteredList(e.target.value)}
                    />
                  </div>
                </div>
                <div className="dropdown-divider" style={{ borderTopColor: "#d7d9dd" }} />
              </div>
              <DataTable
                columns={columns}
                data={paginatedData}
                pagination
                paginationServer
                paginationTotalRows={filteredData.length}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
                highlightOnHover
                striped
                noHeader
              />
            </div>

            <DeletePopup
              show={showDeleteModal}
              handleClose={handleCloseDeleteModal}
              handleConfirm={() => handleConfirmDelete(selectedItemId)}
              id={selectedItemId} 
               pageName="Designation"
            />

            {addDesignation && (
              <div
                role='dialog'
                aria-modal="true"
                className='fade modal show'
                tabIndex="-1"
                style={{ zIndex: "9999", display: "block" }}
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <ModalHeader>
                      <ModalTitle>{editingUserId ? "Update Designation" : "Add Designation"}</ModalTitle>
                      <button
                        type="button"
                        className="btn-close" // Bootstrap's close button class
                        aria-label="Close"
                        onClick={handleCloseAddDesignationModal} // Function to close the modal
                      ></button>
                    </ModalHeader>
                    <ModalBody>
                      <form onSubmit={handleSubmit(onSubmit)} id='designationForm'>
                        <div className="card-body" style={{ width: "1060px", paddingBottom: "0px" }}>
                          <div className='row'>
                            <div className='col-12 col-md-6 col-lg-4 mb-2'>
                              <input 
                                type="text"
                                className="form-control"
                                placeholder="Enter Designation"
                                name='name'
                                id='designation'
                                onInput={toInputTitleCase}
                                onKeyDown={handleEmailChange}
                                autoComplete='off'
                                {...register("name", {
                                  required: "Designation is Required",
                                 validate:{
                                  validateName,
                                 },
                                })}
                              />
                              {errors.name && (<p className='errorMsg'>{errors.name.message}</p>)}
                            </div>
                          </div>
                        </div>
                        <div className='modal-footer'>
                          <button
                            className={editingUserId ? "btn btn-danger" : "btn btn-primary"}
                            type='submit'
                          >
                            {editingUserId ? "Update Designation" : "Add Designation"}
                          </button>
                          <button
                            type='button'
                            className="btn btn-secondary"
                            onClick={handleCloseAddDesignationModal}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </ModalBody>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </LayOut>
  );
};

export default Designation;
