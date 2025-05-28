// import React, { useEffect, useState } from "react";
// import LayOut from "../../LayOut/LayOut";
// import { Link } from "react-router-dom";
// import {
//   XSquareFill,
//   PencilSquare,
//   ChevronDown,
//   ChevronUp,
// } from "react-bootstrap-icons";
// import { DepartmentDeleteApiById, DepartmentGetApi, DepartmentPostApi, DepartmentPutApiById } from "../../Utils/Axios";
// import { useForm } from "react-hook-form";
// import { ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
// import { useAuth } from "../../Context/AuthContext";
// import { Bounce, toast } from "react-toastify";
// import DeletePopup from "../../Utils/DeletePopup";
// import { DesignationGetApi, DesignationPostApi, DesignationDeleteApiById, DesignationPutApiById } from "../../Utils/Axios";

// const Department = () => {
//   const {
//     register,
//     handleSubmit,
//     reset,
//     setValue,
//     formState: { errors },
//   } = useForm({ mode: "onChange" });
//   const [expandedId, setExpandedId] = useState(null);
//   const [departments, setDepartments] = useState([]);
//   const [addDepartment, setAddDeparment] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedItemId, setSelectedItemId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const { authUser } = useAuth();
//   const [designations, setDesignations] = useState({});
//   const [addDesignation, setAddDesignation] = useState(false);
//   const [editingDesignationId, setEditingDesignationId] = useState(null);
//   const [currentDepartmentId, setCurrentDepartmentId] = useState(null);
//   const [loadingDesignations, setLoadingDesignations] = useState({});
//   const [showDeleteDesignationModal, setShowDeleteDesignationModal] = useState(false);
//   const [selectedDesignationInfo, setSelectedDesignationInfo] = useState({ departmentId: null, designationId: null });

//   const {
//     register: registerDesignation,
//     handleSubmit: handleSubmitDesignation,
//     reset: resetDesignation,
//     setValue: setValueDesignation,
//     formState: { errors: errorsDesignation },
//   } = useForm({ mode: "onChange" });

//   const toInputTitleCase = (e) => {
//     const input = e.target;
//     let value = input.value;
//     const cursorPosition = input.selectionStart;

//     value = value.replace(/^\s+/g, "");

//     const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
//     value = value
//       .split("")
//       .filter((char) => allowedCharsRegex.test(char))
//       .join("");

//     const words = value.split(" ");
//     const capitalizedWords = words.map((word) => {
//       if (word.length > 0) {
//         return word.charAt(0).toUpperCase() + word.slice(1);
//       }
//       return word;
//     });

//     let formattedValue = capitalizedWords.join(" ");
//     input.value = formattedValue;
//     input.setSelectionRange(cursorPosition, cursorPosition);
//   };

//   const getDepartments = async () => {
//     try {
//       const response = await DepartmentGetApi();
//       const sortedDepartments = response.data.data.sort((a, b) =>
//         a.name.localeCompare(b.name)
//       );
//       setDepartments(sortedDepartments);
//     } catch (error) {
//       handleApiErrors(error);
//     }
//   };

//   useEffect(() => {
//     getDepartments();
//   }, []);


//   const fetchDesignations = async (departmentId) => {
//     setLoadingDesignations(prev => ({ ...prev, [departmentId]: true }));
//     try {
//       const result = await DesignationGetApi(departmentId);
//       setDesignations(prev => ({
//         ...prev,
//         [departmentId]: Array.isArray(result) ? result : []
//       }));
//     } catch (error) {
//       console.error('Failed to load designations:', error);
//       setDesignations(prev => ({
//         ...prev,
//         [departmentId]: []
//       }));
//     } finally {
//       setLoadingDesignations(prev => ({ ...prev, [departmentId]: false }));
//     }
//   };

//   const handleEdit = (id) => {
//     const userToEdit = departments.find((user) => user.id === id);
//     if (userToEdit) {
//       setValue("name", userToEdit.name);
//       setEditingId(id);
//       setAddDeparment(true);
//     }
//   };

//   const handleEditDesignation = (departmentId, designationId) => {
//     const designationToEdit = designations[departmentId]?.find(d => d.id === designationId);
//     if (designationToEdit) {
//       setValueDesignation("name", designationToEdit.name);
//       setEditingDesignationId(designationId);
//       setCurrentDepartmentId(departmentId);
//       setAddDesignation(true);
//     }
//   };

//   const handleCloseDeleteModal = () => {
//     setShowDeleteModal(false);
//     setSelectedItemId(null);
//   };

//   const handleCloseAddDepartmentModal = () => {
//     setAddDeparment(false);
//     reset();
//     setEditingId(null);
//   };

//   const handleCloseAddDesignationModal = () => {
//     setAddDesignation(false);
//     resetDesignation();
//     setEditingDesignationId(null);
//     setCurrentDepartmentId(null);
//   };

//   const handleShowDeleteModal = (id) => {
//     setSelectedItemId(id);
//     setShowDeleteModal(true);
//   };

//   const toggleAccordion = (id) => {
//     if (expandedId === id) {
//       setExpandedId(null);
//     } else {
//       setExpandedId(id);
//       if (!designations[id]) {
//         fetchDesignations(id);
//       }
//     }
//   };

//   const handleDropdownSelect = (e) => {
//     const selectedId = e.target.value;
//     if (selectedId) {
//       toggleAccordion(selectedId);
//     } else {
//       setExpandedId(null);
//     }
//   };

//   const onSubmit = async (data) => {
//   setLoading(true);
//   try {
//     const formData = {
//       companyName: authUser.company,
//       name: data.name,
//     };

//     if (editingId) {
//       await DepartmentPutApiById(editingId, formData);
//       setDepartments(prev => 
//         prev.map(dept => 
//           dept.id === editingId ? { ...dept, name: data.name } : dept
//         ).sort((a, b) => a?.name?.localeCompare(b?.name))
//       );
//       toast.success("Department Updated Successfully");
//     } else {
//       const response = await DepartmentPostApi(formData);
//       if (response?.data?.data) {
//         setDepartments(prev => 
//           [...(prev || []), response.data.data].sort((a, b) => 
//             (a?.name || '').localeCompare(b?.name || '')
//           )
//         );
//         toast.success("Department Created Successfully");
//       }
//     }

//     // Delay closing modal and resetting form
//     setTimeout(() => {
//       handleCloseAddDepartmentModal();
//       reset();
//       setEditingId(null);
//     }, 500); // Delay in milliseconds
//   } catch (error) {
//     handleApiErrors(error);
//   } finally {
//     setLoading(false);
//   }
// };


//   const onSubmitDesignation = async (data) => {
//     try {
//       const formData = {
//         companyName: authUser.company,
//         name: data.name,
//       };

//       if (editingDesignationId) {
//         await DesignationPutApiById(currentDepartmentId, editingDesignationId, formData);
//         // Update existing designation
//         setDesignations(prev => ({
//           ...prev,
//           [currentDepartmentId]: (prev[currentDepartmentId] || []).map(desig =>
//             desig.id === editingDesignationId ? { ...desig, name: data.name } : desig
//           )
//         }));
//         toast.success("Designation Updated Successfully");
//       } else {
//         const response = await DesignationPostApi(currentDepartmentId, formData);
//         // Add new designation with proper data structure
//         if (response?.data?.data) {
//           setDesignations(prev => ({
//             ...prev,
//             [currentDepartmentId]: [
//               ...(prev[currentDepartmentId] || []),
//               {
//                 id: response.data.data.id,
//                 name: response.data.data.name,
//                 // Include any other necessary fields from the response
//               }
//             ]
//           }));
//           toast.success("Designation Created Successfully");
//         }
//       }

//       handleCloseAddDesignationModal();
//       resetDesignation();
//     } catch (error) {
//       handleApiErrors(error);
//     }
//   };

//   const handleConfirmDelete = async () => {
//     if (selectedItemId) {
//       try {
//         await DepartmentDeleteApiById(selectedItemId);
//         toast.success("Department Deleted Successfully", {
//           position: "top-right",
//           transition: Bounce,
//           hideProgressBar: true,
//           theme: "colored",
//           autoClose: 1000,
//         });

//         // Update local state immediately
//         setDepartments(prev => prev.filter(dept => dept.id !== selectedItemId));

//         // Reset selection and close modal
//         setSelectedItemId(null);
//         setShowDeleteModal(false);
//       } catch (error) {
//         console.error("Delete Department Error:", {
//           departmentId: selectedItemId,
//           error: error.response?.data || error.message
//         });

//         toast.error(error.response?.data?.error?.message || "Failed to delete department");
//       }
//     }
//   };


//   const handleDeleteDesignation = (departmentId, designationId) => {
//     setSelectedDesignationInfo({ departmentId, designationId });
//     setShowDeleteDesignationModal(true);
//   };

//   const handleConfirmDesignationDelete = async () => {
//     const { departmentId, designationId } = selectedDesignationInfo;
//     try {
//       await DesignationDeleteApiById(departmentId, designationId);
//       toast.success("Designation Deleted Successfully");

//       // Update local state
//       setDesignations(prev => ({
//         ...prev,
//         [departmentId]: prev[departmentId].filter(desig => desig.id !== designationId)
//       }));
//     } catch (error) {
//       handleApiErrors(error);
//     } finally {
//       setShowDeleteDesignationModal(false);
//       setSelectedDesignationInfo({ departmentId: null, designationId: null });
//     }
//   };


//   const handleApiErrors = (error) => {
//     if (error.response?.data?.error?.message) {
//       const errorMessage = error.response.data.error.message;
//       toast.error(errorMessage);
//     } else {
//       toast.error("Network Error!");
//     }
//     console.error(error.response);
//   };

//   const validateName = (value, fieldType) => {
//     const trimmedValue = value.trim();
//     const entityName = fieldType === "designation" ? "Designation" : "Department";

//     if (trimmedValue.length === 0) {
//       return `${entityName} Name is Required.`;
//     } else if (!/^[A-Za-z\s/]+$/.test(trimmedValue)) {
//       return `Only Alphabetic Characters, Spaces, and '/' are Allowed in ${entityName}.`;
//     } else {
//       const words = trimmedValue.split(" ");
//       for (const word of words) {
//         if (word.length < 2 && words.length === 1) {
//           return `Minimum Length 2 Characters Required for ${entityName}.`;
//         } else if (word.length > 40) {
//           return `Max Length 40 Characters Required for ${entityName}.`;
//         }
//       }
//       if (trimmedValue.length > 40) {
//         return `${entityName} name must not exceed 40 characters.`;
//       }
//       if (/\s{2,}/.test(trimmedValue)) {
//         return `No Multiple Spaces Between Words Allowed in ${entityName}.`;
//       }
//       if (/^\s/.test(value)) {
//         return `Leading space not allowed in ${entityName}.`;
//       } else if (/\s$/.test(value)) {
//         return `Spaces at the end are not allowed in ${entityName}.`;
//       }
//     }
//     return true;
//   };


//   return (
//     <LayOut>
//       <div className="container-fluid p-0">
//         <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
//           <div className="col">
//             <h1 className="h3 mb-3">
//               <strong>Departments</strong>
//             </h1>
//           </div>
//           <div className="col-auto">
//             <nav aria-label="breadcrumb">
//               <ol className="breadcrumb mb-0">
//                 <li className="breadcrumb-item">
//                   <Link to="/main">Home</Link>
//                 </li>
//                 <li className="breadcrumb-item active">Departments</li>
//               </ol>
//             </nav>
//           </div>
//         </div>

//         <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
//           <div style={{ width: "250px" }}>
//             <select
//               className="form-select"
//               onChange={handleDropdownSelect}
//               value={expandedId || ""}
//             >
//               <option value="">-- Select Department --</option>
//               {departments?.map((dept) => (
//                 <option key={dept.id} value={dept.id}>
//                   {dept.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <button
//               className="btn btn-primary"
//               onClick={() => setAddDeparment(true)}
//             >
//               <i className="bi bi-plus-lg me-1"></i> Add Department
//             </button>
//           </div>
//         </div>

//         <div className="row">
//           {departments?.map((dept) => (
//             <div key={`dept-${dept.id}`} className="mb-3">
//               <div className="card">
//                 <div className="card-header d-flex justify-content-between align-items-center">
//                   <h5 className="mb-0 card-title">{dept.name}</h5>
//                   <div className="d-flex align-items-center">
//                     <button
//                       className="btn btn-sm"
//                       style={{
//                         backgroundColor: "transparent",
//                         border: "none",
//                         padding: "0",
//                         marginRight: "10px",
//                       }}
//                       onClick={() => handleEdit(dept.id)}
//                       title="Edit"
//                       aria-label={`Edit ${dept.name}`}
//                     >
//                       <PencilSquare size={22} color="#2255a4" />
//                     </button>
//                     <button
//                       className="btn btn-sm"
//                       style={{ backgroundColor: "transparent", border: "none" }}
//                       title="Delete"
//                       onClick={() => handleShowDeleteModal(dept.id)}
//                       aria-label={`Delete ${dept.name}`}
//                     >
//                       <XSquareFill size={22} color="#da542e" />
//                     </button>
//                     <button
//                       className="btn btn-sm"
//                       style={{
//                         backgroundColor: "transparent",
//                         border: "none",
//                         marginLeft: "10px",
//                       }}
//                       onClick={() => toggleAccordion(dept.id)}
//                       aria-label={`${expandedId === dept.id ? 'Collapse' : 'Expand'} ${dept.name}`}
//                     >
//                       {expandedId === dept.id ? (
//                         <ChevronUp size={22} color="#000000" />
//                       ) : (
//                         <ChevronDown size={22} color="#000000" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {expandedId === dept.id && (
//                   <div className="card-body pt-0">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <h6>Designations:</h6>
//                       <button
//                         className="btn btn-sm btn-primary"
//                         onClick={() => {
//                           setCurrentDepartmentId(dept.id);
//                           setAddDesignation(true);
//                         }}
//                         disabled={loadingDesignations[dept.id]}
//                       >
//                         {loadingDesignations[dept.id] ? (
//                           <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
//                         ) : (
//                           <i className="bi bi-plus-lg me-1"></i>
//                         )}
//                         Add Designation
//                       </button>
//                     </div>

//                     {loadingDesignations[dept.id] ? (
//                       <div className="text-center py-3">
//                         <div className="spinner-border text-primary" role="status">
//                           <span className="visually-hidden">Loading...</span>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="list-group">
//                         {designations[dept.id]?.length > 0 ? (
//                           designations[dept.id].map((designation) => (
//                             <div
//                               key={`desig-${designation.id}`}
//                               className="list-group-item d-flex justify-content-between align-items-center"
//                             >
//                               <span>{designation.name}</span>
//                               <div>
//                                 <button
//                                   className="btn btn-sm me-2"
//                                   onClick={() => handleEditDesignation(dept.id, designation.id)}
//                                   title="Edit"
//                                   aria-label={`Edit ${designation.name}`}
//                                 >
//                                   <PencilSquare size={18} color="#2255a4" />
//                                 </button>
//                                 <button
//                                   className="btn btn-sm"
//                                   onClick={() => handleDeleteDesignation(dept.id, designation.id)}
//                                   title="Delete"
//                                   aria-label={`Delete ${designation.name}`}
//                                 >
//                                   <XSquareFill size={18} color="#da542e" />
//                                 </button>
//                               </div>
//                             </div>
//                           ))
//                         ) : (
//                           <div className="list-group-item text-muted">
//                             No designations found
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Department Modal */}
//         {addDepartment && (
//           <div
//             role="dialog"
//             aria-modal="true"
//             className="fade modal show"
//             tabIndex="-1"
//             style={{ zIndex: "9999", display: "block" }}
//           >
//             <div className="modal-dialog modal-dialog-centered">
//               <div className="modal-content">
//                 <div className="modal-header d-flex justify-content-between w-100">
//                   <ModalTitle>
//                     {editingId ? "Update Department" : "Add Department"}
//                   </ModalTitle>
//                   <button
//                     type="button"
//                     className="btn-close"
//                     aria-label="Close"
//                     onClick={handleCloseAddDepartmentModal}
//                   ></button>
//                 </div>
//                 <ModalBody>
//                   <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
//                     <div className="card-body" style={{ paddingBottom: "0px" }}>
//                       <div className="row">
//                         <div className="col-12 mb-2">
//                           <input
//                             type="text"
//                             className="form-control"
//                             placeholder="Enter Department"
//                             name="name"
//                             onInput={toInputTitleCase}
//                             autoComplete="off"
//                             {...register("name", {
//                               required: "Department is Required",
//                               validate: (value) => validateName(value, "department"),
//                             })}
//                           />
//                           {errors.name && (
//                             <p className="errorMsg">{errors.name.message}</p>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="modal-footer">
//                       <button
//                         type="button"
//                         className="btn btn-secondary"
//                         onClick={handleCloseAddDepartmentModal}
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         className={editingId ? "btn btn-danger" : "btn btn-primary"}
//                         type="submit"
//                         disabled={loading}
//                       >
//                         {loading
//                           ? "Loading..."
//                           : editingId
//                             ? "Update Department"
//                             : "Add Department"}
//                       </button>
//                     </div>
//                   </form>
//                 </ModalBody>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Designation Modal */}
//         {addDesignation && (
//           <div
//             role="dialog"
//             aria-modal="true"
//             className="fade modal show"
//             tabIndex="-1"
//             style={{ zIndex: "9999", display: "block" }}
//           >
//             <div className="modal-dialog modal-dialog-centered">
//               <div className="modal-content">
//                 <div className="modal-header d-flex justify-content-between w-100">
//                   <ModalTitle>
//                     {editingDesignationId ? "Update Designation" : "Add Designation"}
//                   </ModalTitle>
//                   <button
//                     type="button"
//                     className="btn-close"
//                     aria-label="Close"
//                     onClick={handleCloseAddDesignationModal}
//                   ></button>
//                 </div>
//                 <ModalBody>
//                   <form onSubmit={handleSubmitDesignation(onSubmitDesignation)}>
//                     <div className="card-body" style={{ paddingBottom: "0px" }}>
//                       <div className="row">
//                         <div className="col-12 mb-2">
//                           <input
//                             type="text"
//                             className="form-control"
//                             placeholder="Enter Designation"
//                             name="name"
//                             onInput={toInputTitleCase}
//                             autoComplete="off"
//                             {...registerDesignation("name", {
//                               required: "Designation is Required",
//                               validate: (value) => validateName(value, "designation"),
//                             })}
//                           />
//                           {errorsDesignation.name && (
//                             <p className="errorMsg">{errorsDesignation.name.message}</p>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="modal-footer">
//                       <button
//                         type="button"
//                         className="btn btn-secondary"
//                         onClick={handleCloseAddDesignationModal}
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         className={
//                           editingDesignationId ? "btn btn-danger" : "btn btn-primary"
//                         }
//                         type="submit"
//                       >
//                         {editingDesignationId
//                           ? "Update Designation"
//                           : "Add Designation"}
//                       </button>
//                     </div>
//                   </form>
//                 </ModalBody>
//               </div>
//             </div>
//           </div>
//         )}

//         <DeletePopup
//           show={showDeleteModal}
//           handleClose={handleCloseDeleteModal}
//           handleConfirm={handleConfirmDelete}
//           id={selectedItemId}
//           pageName="Department"
//         />
//         <DeletePopup
//         show={showDeleteDesignationModal}
//         handleClose={() => {
//           setShowDeleteDesignationModal(false);
//           setSelectedDesignationInfo({ departmentId: null, designationId: null });
//         }}
//         handleConfirm={handleConfirmDesignationDelete}
//         id={selectedDesignationInfo.designationId}
//         pageName="Designation"
//       />
//       </div>
//     </LayOut>
//   );
// };

// export default Department;


import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import { Link } from "react-router-dom";
import {
  XSquareFill,
  PencilSquare,
  ChevronDown,
  ChevronUp,
} from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { useAuth } from "../../Context/AuthContext";
import { Bounce, toast } from "react-toastify";
import DeletePopup from "../../Utils/DeletePopup";
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments, removeDepartmentFromState } from '../../Redux/DepartmentSlice';
import { fetchDesignations, removeDesignationFromState } from '../../Redux/DesignationSlice';
import { DepartmentPostApi, DepartmentPutApiById, DepartmentDeleteApiById } from "../../Utils/Axios";
import { DesignationPostApi, DesignationPutApiById, DesignationDeleteApiById } from "../../Utils/Axios";

const Department = () => {
  const dispatch = useDispatch();
  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError
  } = useSelector(state => state.departments);

  const {
    designations: reduxDesignations,
    loading: designationsLoading,
    error: designationsError
  } = useSelector(state => state.designations);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const [expandedId, setExpandedId] = useState(null);
  const [addDepartment, setAddDeparment] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuth();
  const [addDesignation, setAddDesignation] = useState(false);
  const [editingDesignationId, setEditingDesignationId] = useState(null);
  const [currentDepartmentId, setCurrentDepartmentId] = useState(null);
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

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (departmentsError) {
      handleApiErrors(departmentsError);
    }
  }, [departmentsError]);

  useEffect(() => {
    if (designationsError) {
      handleApiErrors(designationsError);
    }
  }, [designationsError]);


  const fetchDesignationsForDepartment = async (departmentId) => {
    try {
      await dispatch(fetchDesignations(departmentId));
    } catch (error) {
      // Only show errors that aren't 404
      if (error.response?.status !== 404) {
        handleApiErrors(error);
      }
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
    const designationToEdit = reduxDesignations[departmentId]?.find(d => d.id === designationId);
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
      if (!reduxDesignations[id]) {
        fetchDesignationsForDepartment(id);
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

      if (editingId) {
        await DepartmentPutApiById(editingId, formData);
        toast.success("Department Updated Successfully", {
          autoClose: 500,
          onClose: () => dispatch(fetchDepartments()),
        });
      } else {
        await DepartmentPostApi(formData);
        toast.success("Department Created Successfully", {
          autoClose: 500,
          onClose: () => dispatch(fetchDepartments()),
        });
      }

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

      if (editingDesignationId) {
        await DesignationPutApiById(currentDepartmentId, editingDesignationId, formData);
        toast.success("Designation Updated Successfully", {
          autoClose: 500,
          onClose: () => dispatch(fetchDesignations(currentDepartmentId)),
        });
      } else {
        await DesignationPostApi(currentDepartmentId, formData);
        toast.success("Designation Created Successfully", {
          autoClose: 500,
          onClose: () => dispatch(fetchDesignations(currentDepartmentId)),
        });
      }

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
        dispatch(removeDepartmentFromState(selectedItemId));
        toast.success("Department Deleted Successfully", {
          position: "top-right",
          transition: Bounce,
          hideProgressBar: true,
          theme: "colored",
          autoClose: 1000,
        });

        setSelectedItemId(null);
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Delete Department Error:", {
          departmentId: selectedItemId,
          error: error.response?.data || error.message
        });

        toast.error(error.response?.data?.error?.message || "Failed to delete department");
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
      dispatch(removeDesignationFromState({ departmentId, designationId }));
      toast.success("Designation Deleted Successfully");
    } catch (error) {
      handleApiErrors(error);
    } finally {
      setShowDeleteDesignationModal(false);
      setSelectedDesignationInfo({ departmentId: null, designationId: null });
    }
  };


  const handleApiErrors = (error) => {
    console.error('API Error:', error);

    // Skip showing error for 404 (not found) since it's expected for empty designations
    if (error.response?.status === 404) {
      return;
    }

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.statusText;
      toast.error(`${status}: ${message}`);
    } else if (error.request) {
      toast.error("Network Error - No response from server");
    } else {
      toast.error(error.message || "Request setup error");
    }
  };

  const validateName = (value, fieldType) => {
    const trimmedValue = value.trim();
    const entityName = fieldType === "designation" ? "Designation" : "Department";

    if (trimmedValue.length === 0) {
      return `${entityName} Name is Required.`;
    } else if (!/^[A-Za-z\s/]+$/.test(trimmedValue)) {
      return `Only Alphabetic Characters, Spaces, and '/' are Allowed in ${entityName}.`;
    } else {
      const words = trimmedValue.split(" ");
      for (const word of words) {
        if (word.length < 2 && words.length === 1) {
          return `Minimum Length 2 Characters Required for ${entityName}.`;
        } else if (word.length > 40) {
          return `Max Length 40 Characters Required for ${entityName}.`;
        }
      }
      if (trimmedValue.length > 40) {
        return `${entityName} name must not exceed 40 characters.`;
      }
      if (/\s{2,}/.test(trimmedValue)) {
        return `No Multiple Spaces Between Words Allowed in ${entityName}.`;
      }
      if (/^\s/.test(value)) {
        return `Leading space not allowed in ${entityName}.`;
      } else if (/\s$/.test(value)) {
        return `Spaces at the end are not allowed in ${entityName}.`;
      }
    }
    return true;
  };

  const sortedDepartments = [...departments].sort((a, b) => a.name.localeCompare(b.name));

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
              {sortedDepartments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
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

        {departmentsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {sortedDepartments?.map((dept) => (
              <div key={`dept-${dept.id}`} className="mb-3">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 card-title">{dept.name}</h5>
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
                          <ChevronUp size={22} color="#000000" />
                        ) : (
                          <ChevronDown size={22} color="#000000" />
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
                          disabled={designationsLoading}
                        >
                          {designationsLoading ? (
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="bi bi-plus-lg me-1"></i>
                          )}
                          Add Designation
                        </button>
                      </div>

                      {reduxDesignations[dept.id] === undefined ? (
                        <div className="text-center py-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : (
                        <div className="list-group">
                          {reduxDesignations[dept.id]?.length > 0 ? (
                            reduxDesignations[dept.id].map((designation) => (
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
        )}

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
                              validate: (value) => validateName(value, "department"),
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
                              validate: (value) => validateName(value, "designation"),
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