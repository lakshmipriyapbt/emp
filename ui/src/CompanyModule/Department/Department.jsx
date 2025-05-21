import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import { Link } from "react-router-dom";
import {
  XSquareFill,
  PencilSquare,
  ChevronDown,
  ChevronUp,
} from "react-bootstrap-icons";
import { DepartmentDeleteApiById, DepartmentGetApi, DepartmentPostApi, DepartmentPutApiById } from "../../Utils/Axios";
import { useForm } from "react-hook-form";
import { ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { useAuth } from "../../Context/AuthContext";
import { Bounce, toast } from "react-toastify";
import DeletePopup from "../../Utils/DeletePopup";
import { DesignationGetApi, DesignationPostApi, DesignationDeleteApiById, DesignationPutApiById } from "../../Utils/Axios";

const Department = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const [expandedId, setExpandedId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [addDepartment, setAddDeparment] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuth();
  const [designations, setDesignations] = useState({});
  const [addDesignation, setAddDesignation] = useState(false);
  const [editingDesignationId, setEditingDesignationId] = useState(null);
  const [currentDepartmentId, setCurrentDepartmentId] = useState(null);
  const [loadingDesignations, setLoadingDesignations] = useState({});
  const [showDeleteDesignationModal, setShowDeleteDesignationModal] = useState(false);
  const [selectedDesignationInfo, setSelectedDesignationInfo] = useState({ departmentId: null, designationId: null });

  const {
    register: registerDesignation,
    handleSubmit: handleSubmitDesignation,
    reset: resetDesignation,
    setValue: setValueDesignation,
    formState: { errors: errorsDesignation },
  } = useForm({ mode: "onChange" });

  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart;

    value = value.replace(/^\s+/g, "");

    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
    value = value
      .split("")
      .filter((char) => allowedCharsRegex.test(char))
      .join("");

    const words = value.split(" ");
    const capitalizedWords = words.map((word) => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    });

    let formattedValue = capitalizedWords.join(" ");
    input.value = formattedValue;
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  const getDepartments = async () => {
    try {
      const response = await DepartmentGetApi();
      const sortedDepartments = response.data.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setDepartments(sortedDepartments);
    } catch (error) {
      handleApiErrors(error);
    }
  };

  useEffect(() => {
    getDepartments();
  }, []);


  const fetchDesignations = async (departmentId) => {
    setLoadingDesignations(prev => ({ ...prev, [departmentId]: true }));
    try {
      const result = await DesignationGetApi(departmentId);
      setDesignations(prev => ({
        ...prev,
        [departmentId]: Array.isArray(result) ? result : []
      }));
    } catch (error) {
      console.error('Failed to load designations:', error);
      setDesignations(prev => ({
        ...prev,
        [departmentId]: []
      }));
    } finally {
      setLoadingDesignations(prev => ({ ...prev, [departmentId]: false }));
    }
  };

  const handleEdit = (id) => {
    const userToEdit = departments.find((user) => user.id === id);
    if (userToEdit) {
      setValue("name", userToEdit.name);
      setEditingId(id);
      setAddDeparment(true);
    }
  };

  const handleEditDesignation = (departmentId, designationId) => {
    const designationToEdit = designations[departmentId]?.find(d => d.id === designationId);
    if (designationToEdit) {
      setValueDesignation("name", designationToEdit.name);
      setEditingDesignationId(designationId);
      setCurrentDepartmentId(departmentId);
      setAddDesignation(true);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItemId(null);
  };

  const handleCloseAddDepartmentModal = () => {
    setAddDeparment(false);
    reset();
    setEditingId(null);
  };

  const handleCloseAddDesignationModal = () => {
    setAddDesignation(false);
    resetDesignation();
    setEditingDesignationId(null);
    setCurrentDepartmentId(null);
  };

  const handleShowDeleteModal = (id) => {
    setSelectedItemId(id);
    setShowDeleteModal(true);
  };

  const toggleAccordion = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!designations[id]) {
        fetchDesignations(id);
      }
    }
  };

  const handleDropdownSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      toggleAccordion(selectedId);
    } else {
      setExpandedId(null);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = {
        companyName: authUser.company,
        name: data.name,
      };

      let response;
      if (editingId) {
        response = await DepartmentPutApiById(editingId, formData);
        toast.success("Department Updated Successfully");
      } else {
        response = await DepartmentPostApi(formData);
        toast.success("Department Created Successfully");
      }

      // Explicitly fetch latest data after update
      const updatedDepartments = await DepartmentGetApi();

      // ✅ Force a UI update by setting a new reference
      setDepartments([]);
      setTimeout(() => {
        setDepartments([...updatedDepartments.data.data]);
        console.log("Updated Departments from API:", updatedDepartments.data.data);
      }, 50);

      handleCloseAddDepartmentModal();
      reset();
      setEditingId(null);
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setLoading(false);
    }
};


const onSubmitDesignation = async (data) => {
  try {
    const formData = {
      companyName: authUser.company,
      name: data.name,
    };

    let response;
    if (editingDesignationId) {
      response = await DesignationPutApiById(currentDepartmentId, editingDesignationId, formData);
      toast.success("Designation Updated Successfully");
    } else {
      response = await DesignationPostApi(currentDepartmentId, formData);
      toast.success("Designation Created Successfully");
    }

    // Fetch updated designation list
    await fetchDesignations(currentDepartmentId);

    // ✅ Force a UI update
    setDesignations(prev => ({ ...prev, [currentDepartmentId]: [] }));
    setTimeout(() => {
      setDesignations(prev => ({
        ...prev,
        [currentDepartmentId]: [...prev[currentDepartmentId]]
      }));
    }, 50);

    handleCloseAddDesignationModal();
    resetDesignation();
  } catch (error) {
    handleApiErrors(error);
  }
};


  const handleConfirmDelete = async () => {
    if (selectedItemId) {
      try {
        await DepartmentDeleteApiById(selectedItemId);
        toast.success("Department Deleted Successfully");
        setDepartments(prev => prev.filter(dept => dept.id !== selectedItemId));
        setSelectedItemId(null);
        setShowDeleteModal(false);
      } catch (error) {
        handleApiErrors(error);
      }
    }
  };


  const handleDeleteDesignation = (departmentId, designationId) => {
    setSelectedDesignationInfo({ departmentId, designationId });
    setShowDeleteDesignationModal(true);
  };

  const handleConfirmDesignationDelete = async () => {
    const { departmentId, designationId } = selectedDesignationInfo;
    try {
      await DesignationDeleteApiById(departmentId, designationId);
      toast.success("Designation Deleted Successfully");
      setDesignations(prev => ({
        ...prev,
        [departmentId]: prev[departmentId].filter(desig => desig.id !== designationId)
      }));
      setShowDeleteDesignationModal(false);
      setSelectedDesignationInfo({ departmentId: null, designationId: null });
    } catch (error) {
      handleApiErrors(error);
    }
  };


  const handleApiErrors = (error) => {
    if (error.response?.data?.error?.message) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error!");
    }
    console.error(error.response);
  };

  const validateName = (value, type) => {
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      return type === "department" ? "Department Name is Required." : "Designation Name is Required.";
    } else if (!/^[A-Za-z\s/]+$/.test(trimmedValue)) {
      return type === "department"
        ? "Only Alphabetic Characters, Spaces, and '/' are Allowed in Department Name."
        : "Only Alphabetic Characters, Spaces, and '/' are Allowed in Designation Name.";
    } else {
      const words = trimmedValue.split(" ");
      for (const word of words) {
        if (word.length < 2 && words.length === 1) {
          return type === "department"
            ? "Department Name Must Have a Minimum of 2 Characters."
            : "Designation Name Must Have a Minimum of 2 Characters.";
        } else if (word.length > 40) {
          return type === "department"
            ? "Department Name Must Not Exceed 40 Characters."
            : "Designation Name Must Not Exceed 40 Characters.";
        }
      }
      if (trimmedValue.length > 40) {
        return type === "department"
          ? "Department Name Must Not Exceed 40 Characters."
          : "Designation Name Must Not Exceed 40 Characters.";
      }
      if (/\s{2,}/.test(trimmedValue)) {
        return type === "department"
          ? "No Multiple Spaces Allowed in Department Name."
          : "No Multiple Spaces Allowed in Designation Name.";
      }
      if (/^\s/.test(value)) {
        return type === "department"
          ? "Leading Space Not Allowed in Department Name."
          : "Leading Space Not Allowed in Designation Name.";
      } else if (/\s$/.test(value)) {
        return type === "department"
          ? "Spaces at the end are not allowed."
          : "Spaces at the end are not allowed.";
      }
    }
    return true;
  };


  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Departments</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main">Home</Link>
                </li>
                <li className="breadcrumb-item active">Departments</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <div style={{ width: "250px" }}>
            <select
              className="form-select"
              onChange={handleDropdownSelect}
              value={expandedId || ""}
            >
              <option value="">-- Select Department --</option>
              {departments?.map((dept) => (
                <option key={`dept-option-${dept.id}`} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              className="btn btn-primary"
              onClick={() => setAddDeparment(true)}
            >
              <i className="bi bi-plus-lg me-1"></i> Add Department
            </button>
          </div>
        </div>

        <div className="row">
          {departments?.map((dept) => (
            <div key={`dept-${dept.id}`} className="mb-3">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 text-dark card-title">{dept.name}</h5>
                  <div className="d-flex align-items-center">
                    <button
                      className="btn btn-sm"
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        padding: "0",
                        marginRight: "10px",
                      }}
                      onClick={() => handleEdit(dept.id)}
                      title="Edit"
                      aria-label={`Edit ${dept.name}`}
                    >
                      <PencilSquare size={22} color="#2255a4" />
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ backgroundColor: "transparent", border: "none" }}
                      title="Delete"
                      onClick={() => handleShowDeleteModal(dept.id)}
                      aria-label={`Delete ${dept.name}`}
                    >
                      <XSquareFill size={22} color="#da542e" />
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        marginLeft: "10px",
                      }}
                      onClick={() => toggleAccordion(dept.id)}
                      aria-label={`${expandedId === dept.id ? 'Collapse' : 'Expand'} ${dept.name}`}
                    >
                      {expandedId === dept.id ? (
                        <ChevronUp size={22} color="#DDDDD" />
                      ) : (
                        <ChevronDown size={22} color="#DDDDD" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedId === dept.id && (
                  <div className="card-body pt-0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>Designations:</h6>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setCurrentDepartmentId(dept.id);
                          setAddDesignation(true);
                        }}
                        disabled={loadingDesignations[dept.id]}
                      >
                        {loadingDesignations[dept.id] ? (
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className="bi bi-plus-lg me-1"></i>
                        )}
                        Add Designation
                      </button>
                    </div>

                    {loadingDesignations[dept.id] ? (
                      <div className="text-center py-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="list-group">
                        {designations[dept.id]?.length > 0 ? (
                          designations[dept.id].map((designation) => (
                            <div
                              key={`desig-${designation.id}`}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <span>{designation.name}</span>
                              <div>
                                <button
                                  className="btn btn-sm me-2"
                                  onClick={() => handleEditDesignation(dept.id, designation.id)}
                                  title="Edit"
                                  aria-label={`Edit ${designation.name}`}
                                >
                                  <PencilSquare size={18} color="#2255a4" />
                                </button>
                                <button
                                  className="btn btn-sm"
                                  onClick={() => handleDeleteDesignation(dept.id, designation.id)}
                                  title="Delete"
                                  aria-label={`Delete ${designation.name}`}
                                >
                                  <XSquareFill size={18} color="#da542e" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="list-group-item text-muted">
                            No designations found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Department Modal */}
        {addDepartment && (
          <div
            role="dialog"
            aria-modal="true"
            className="fade modal show"
            tabIndex="-1"
            style={{ zIndex: "9999", display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header d-flex justify-content-between w-100">
                  <ModalTitle>
                    {editingId ? "Update Department" : "Add Department"}
                  </ModalTitle>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleCloseAddDepartmentModal}
                  ></button>
                </div>
                <ModalBody>
                  <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
                    <div className="card-body" style={{ paddingBottom: "0px" }}>
                      <div className="row">
                        <div className="col-12 mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Department"
                            name="name"
                            onInput={toInputTitleCase}
                            autoComplete="off"
                            {...register("name", {
                              required: "Department is Required",
                              validate: {
                                validateName: (value) => validateName(value, "department"),
                              },
                            })}
                          />
                          {errors.name && (
                            <p className="errorMsg">{errors.name.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCloseAddDepartmentModal}
                      >
                        Cancel
                      </button>
                      <button
                        className={editingId ? "btn btn-danger" : "btn btn-primary"}
                        type="submit"
                        disabled={loading}
                      >
                        {loading
                          ? "Loading..."
                          : editingId
                            ? "Update Department"
                            : "Add Department"}
                      </button>
                    </div>
                  </form>
                </ModalBody>
              </div>
            </div>
          </div>
        )}

        {/* Designation Modal */}
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
                <div className="modal-header d-flex justify-content-between w-100">
                  <ModalTitle>
                    {editingDesignationId ? "Update Designation" : "Add Designation"}
                  </ModalTitle>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleCloseAddDesignationModal}
                  ></button>
                </div>
                <ModalBody>
                  <form onSubmit={handleSubmitDesignation(onSubmitDesignation)}>
                    <div className="card-body" style={{ paddingBottom: "0px" }}>
                      <div className="row">
                        <div className="col-12 mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Designation"
                            name="name"
                            onInput={toInputTitleCase}
                            autoComplete="off"
                            {...registerDesignation("name", {
                              required: "Designation is Required",
                              validate: {
                                validateName: (value) => validateName(value, "designation"),
                              },
                            })}
                          />
                          {errorsDesignation.name && (
                            <p className="errorMsg">{errorsDesignation.name.message}</p>
                          )}
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
                        className={
                          editingDesignationId ? "btn btn-danger" : "btn btn-primary"
                        }
                        type="submit"
                      >
                        {editingDesignationId
                          ? "Update Designation"
                          : "Add Designation"}
                      </button>
                    </div>
                  </form>
                </ModalBody>
              </div>
            </div>
          </div>
        )}

        <DeletePopup
          show={showDeleteModal}
          handleClose={handleCloseDeleteModal}
          handleConfirm={handleConfirmDelete}
          id={selectedItemId}
          pageName="Department"
        />
        <DeletePopup
          show={showDeleteDesignationModal}
          handleClose={() => {
            setShowDeleteDesignationModal(false);
            setSelectedDesignationInfo({ departmentId: null, designationId: null });
          }}
          handleConfirm={handleConfirmDesignationDelete}
          id={selectedDesignationInfo.designationId}
          pageName="Designation"
        />
      </div>
    </LayOut>
  );
};

export default Department;