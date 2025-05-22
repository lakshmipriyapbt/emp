import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import { TdsGetApi, TdsPatchApi } from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

const getCurrentFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const CompanyTdsView = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(getCurrentFinancialYear());
  const [selectedTdsType, setSelectedTdsType] = useState("");
  const [tdsTypes, setTdsTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSlabs, setEditedSlabs] = useState({});
  const [showAddSlabForm, setShowAddSlabForm] = useState(false);
  const [newSlab, setNewSlab] = useState({ min: "", max: "", taxPercentage: "" });
  const { authUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validate numeric input with max digits
  const validateNumericInput = (value, maxDigits) => {
    if (value === "") return true;
    const regex = new RegExp(`^\\d{0,${maxDigits}}$`);
    return regex.test(value);
  };

  // Validate percentage input (0-99)
  const validatePercentageInput = (value) => {
    if (value === "") return true;
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 0 && num <= 99;
  };

  // Validate new slab inputs
  const validateNewSlab = () => {
    const newErrors = {};
    if (!newSlab.min || !validateNumericInput(newSlab.min, 9))
      newErrors.min = "Please enter a valid amount (up to 9 digits)";
    if (!newSlab.max || !validateNumericInput(newSlab.max, 9))
      newErrors.max = "Please enter a valid amount (up to 9 digits)";
    if (!newSlab.taxPercentage || !validatePercentageInput(newSlab.taxPercentage))
      newErrors.taxPercentage = "Please enter a valid percentage (0-99)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchTdsByYear();
  }, [selectedYear, selectedTdsType]);

  const fetchTdsByYear = async () => {
    try {
      const response = await TdsGetApi();
      const data = response?.data?.data;

      if (data && Array.isArray(data) && data.length > 0) {
        const filteredByYear = data.filter(entry => entry.startYear === selectedYear.split("-")[0]);
        const filteredByType = selectedTdsType
          ? filteredByYear.filter(entry => entry.tdsType === selectedTdsType)
          : filteredByYear;

        setFilteredData(filteredByType);

        // Initialize editedSlabs with current data
        const initialEditedSlabs = {};
        filteredByType.forEach(tds => {
          initialEditedSlabs[tds.id] = [...tds.persentageEntityList];
        });
        setEditedSlabs(initialEditedSlabs);

        // Extract unique TDS types
        const uniqueTypes = [...new Set(filteredByYear.map(entry => entry.tdsType))].filter(type => type);
        setTdsTypes(uniqueTypes);
      } else {
        setFilteredData([]);
        setTdsTypes([]);
        setEditedSlabs({});
      }
    } catch (error) {
      console.error("Error fetching TDS data:", error);
      toast.error("Failed to load TDS data");
      setFilteredData([]);
      setTdsTypes([]);
      setEditedSlabs({});
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original data
    const originalSlabs = {};
    filteredData.forEach(tds => {
      originalSlabs[tds.id] = [...tds.persentageEntityList];
    });
    setEditedSlabs(originalSlabs);
    setErrors({});
  };

  const handleSlabChange = (tdsId, slabIndex, field, value) => {
    // Validate input based on field type
    let isValid = true;

    if (field === 'taxPercentage') {
      isValid = validatePercentageInput(value);
    } else {
      isValid = validateNumericInput(value, 9);
    }

    if (isValid || value === "") {
      setEditedSlabs(prev => {
        const updated = { ...prev };
        updated[tdsId] = updated[tdsId].map((slab, index) => {
          if (index === slabIndex) {
            return { ...slab, [field]: value };
          }
          return slab;
        });
        return updated;
      });
    }
  };

  const handleAddNewSlab = (tdsId) => {
    setEditedSlabs(prev => {
      const updated = { ...prev };
      updated[tdsId] = [
        ...updated[tdsId],
        { min: "", max: "", taxPercentage: "" }
      ];
      return updated;
    });
  };

  const handleRemoveSlab = (tdsId, slabIndex) => {
    setEditedSlabs(prev => {
      const updated = { ...prev };
      updated[tdsId] = updated[tdsId].filter((_, index) => index !== slabIndex);
      return updated;
    });
  };

  const validateAllSlabs = () => {
    const newErrors = {};
    Object.keys(editedSlabs).forEach(tdsId => {
      editedSlabs[tdsId].forEach((slab, index) => {
        // Validate min amount (up to 9 digits)
        if (!slab.min || !validateNumericInput(slab.min, 9)) {
          newErrors[`${tdsId}_${index}_min`] = "Invalid amount (up to 9 digits)";
        }

        // Validate max amount (up to 9 digits)
        if (!slab.max || !validateNumericInput(slab.max, 9)) {
          newErrors[`${tdsId}_${index}_max`] = "Invalid amount (up to 9 digits)";
        }

        // Validate tax percentage (0-99)
        if (!slab.taxPercentage || !validatePercentageInput(slab.taxPercentage)) {
          newErrors[`${tdsId}_${index}_taxPercentage`] =
            "Percentage must be between 0-99";
        }

        // Validate min < max when both are valid numbers
        if (slab.min && slab.max && validateNumericInput(slab.min, 9) && validateNumericInput(slab.max, 9)) {
          const minNum = parseInt(slab.min, 10);
          const maxNum = parseInt(slab.max, 10);
          if (minNum >= maxNum) {
            newErrors[`${tdsId}_${index}_range`] =
              "Min amount must be less than max amount";
          }
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    // Check if any changes were made
    const hasChanges = Object.keys(editedSlabs).some(tdsId => {
      const originalSlabs = filteredData.find(tds => tds.id === tdsId)?.persentageEntityList || [];
      const editedSlabsForTds = editedSlabs[tdsId];

      // If lengths are different, there are changes
      if (originalSlabs.length !== editedSlabsForTds.length) return true;

      // Check each slab for changes
      return originalSlabs.some((originalSlab, index) => {
        const editedSlab = editedSlabsForTds[index];
        return (
          originalSlab.min !== editedSlab.min ||
          originalSlab.max !== editedSlab.max ||
          originalSlab.taxPercentage !== editedSlab.taxPercentage
        );
      });
    });

    if (!hasChanges) {
      toast.error("No changes detected to update");
      return;
    }

    if (!validateAllSlabs()) {
      toast.error("Please fix all validation errors before saving");
      return;
    }

    setIsSaving(true);
    try {
      const updatePromises = Object.keys(editedSlabs).map(tdsId => {
        // Convert string values to numbers before sending to API
        const slabsToSend = editedSlabs[tdsId].map(slab => ({
          min: slab.min ? parseInt(slab.min, 10) : 0,
          max: slab.max ? parseInt(slab.max, 10) : 0,
          taxPercentage: slab.taxPercentage ? parseInt(slab.taxPercentage, 10) : 0
        }));

        return TdsPatchApi(tdsId, {
          persentageEntityList: slabsToSend
        });
      });

      await Promise.all(updatePromises);

      toast.success("TDS slabs updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error.response?.data);
      const backendMessage = error.response?.data?.error?.message;

      if (backendMessage?.includes("Tax percentage")) {
        // Highlight all percentage fields if backend complains
        const percentageErrors = {};
        Object.keys(editedSlabs).forEach(tdsId => {
          editedSlabs[tdsId].forEach((_, index) => {
            percentageErrors[`${tdsId}_${index}_taxPercentage`] =
              "Invalid percentage (backend validation failed)";
          });
        });
        setErrors(percentageErrors);
      }

      toast.error(backendMessage || "Failed to update TDS slabs");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSlab = async () => {
    if (!validateNewSlab()) {
      return;
    }

    setIsSaving(true);
    try {
      // Find the first TDS entry (or modify to target specific one)
      const tdsId = filteredData[0]?.id;
      if (!tdsId) {
        toast.error("No TDS structure found to add slab to");
        return;
      }

      const updatedSlabs = [...(editedSlabs[tdsId] || []), {
        min: parseInt(newSlab.min, 10),
        max: parseInt(newSlab.max, 10),
        taxPercentage: parseInt(newSlab.taxPercentage, 10)
      }];

      await TdsPatchApi(tdsId, { persentageEntityList: updatedSlabs });

      // Refresh data after successful addition
      await fetchTdsByYear();

      setShowAddSlabForm(false);
      setNewSlab({ min: "", max: "", taxPercentage: "" });
      toast.success("New slab added successfully!");
    } catch (error) {
      console.error("Error adding slab:", error);
      toast.error("Failed to add new slab");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        {/* Header Section */}
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>TDS Structure</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main">Home</Link>
                </li>
                <li className="breadcrumb-item active">TDS Structure</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Filter Section */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <div>
            <button
              className="btn btn-primary me-3"
              onClick={() => navigate('/addTaxSlab')}
            >
              <i className="bi bi-plus-lg me-1"></i> Add TDS Structure
            </button>
          </div>
          <div className="d-flex gap-3">
            <div style={{ width: "250px" }}>
              <select
                className="form-select"
                value={selectedYear}
                onChange={handleYearChange}
                disabled={isEditing}
              >
                {[...Array(31).keys()].map(i => {
                  const year = 2020 + i;
                  return (
                    <option key={year} value={`${year}-${year + 1}`}>
                      {year}-{year + 1}
                    </option>
                  );
                })}
              </select>
            </div>
            <div style={{ width: "250px" }}>
              <select
                className="form-select"
                value={selectedTdsType}
                onChange={(e) => setSelectedTdsType(e.target.value)}
                disabled={isEditing}
              >
                <option value="">All TDS Types</option>
                {tdsTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Edit/Save Controls */}
        {/* Edit/Save Controls */}
        {authUser?.userRole?.includes("company_admin") && filteredData.length > 0 && (
          <div className="d-flex justify-content-end mb-3">
            {!isEditing ? (
              <button className="btn btn-primary me-2" onClick={handleEditClick}>
                <i className="bi bi-pencil-square me-1"></i> Edit TDS Slabs
              </button>
            ) : (
              <>
                <button
                  className="btn btn-success me-2"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-1"></i> Save Changes
                    </>
                  )}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <i className="bi bi-x-circle me-1"></i> Cancel
                </button>
              </>
            )}
          </div>
        )}

        {/* TDS Structure Cards */}
        <div className="row">
          {filteredData.length > 0 ? (
            filteredData.map((tds) => (
              <div key={tds.id} className="col-md-6 mb-3">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 card-title">
                      <span className="badge bg-info">{tds.tdsType}</span>
                    </h5>
                    <div className="text-muted">
                      FY: {tds.startYear}-{tds.endYear}
                    </div>
                  </div>

                  <div className="card-body pt-0">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>TDS Slabs</h6>
                    </div>

                    {editedSlabs[tds.id]?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Slab</th>
                              <th>Min Amount</th>
                              <th>Max Amount</th>
                              <th>Tax %</th>
                              {isEditing && <th>Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {editedSlabs[tds.id].map((slab, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                  {isEditing ? (
                                    <>
                                      <input
                                        type="text"
                                        className={`form-control form-control-sm ${errors[`${tds.id}_${index}_min`] ? 'is-invalid' : ''}`}
                                        value={slab.min}
                                        onChange={(e) => handleSlabChange(tds.id, index, 'min', e.target.value)}
                                        maxLength={9}
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                      />
                                      {errors[`${tds.id}_${index}_min`] && (
                                        <div className="invalid-feedback">{errors[`${tds.id}_${index}_min`]}</div>
                                      )}
                                    </>
                                  ) : (
                                    slab.min
                                  )}
                                </td>
                                <td>
                                  {isEditing ? (
                                    <>
                                      <input
                                        type="text"
                                        className={`form-control form-control-sm ${errors[`${tds.id}_${index}_max`] ? 'is-invalid' : ''}`}
                                        value={slab.max}
                                        onChange={(e) => handleSlabChange(tds.id, index, 'max', e.target.value)}
                                        maxLength={9}
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                      />
                                      {errors[`${tds.id}_${index}_max`] && (
                                        <div className="invalid-feedback">{errors[`${tds.id}_${index}_max`]}</div>
                                      )}
                                    </>
                                  ) : (
                                    slab.max
                                  )}
                                </td>
                                <td>
                                  {isEditing ? (
                                    <>
                                      <input
                                        type="text"
                                        className={`form-control form-control-sm ${errors[`${tds.id}_${index}_taxPercentage`] ? 'is-invalid' : ''}`}
                                        value={slab.taxPercentage}
                                        onChange={(e) => handleSlabChange(tds.id, index, 'taxPercentage', e.target.value)}
                                        maxLength={2}
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                      />
                                      {errors[`${tds.id}_${index}_taxPercentage`] && (
                                        <div className="invalid-feedback">{errors[`${tds.id}_${index}_taxPercentage`]}</div>
                                      )}
                                    </>
                                  ) : (
                                    `${slab.taxPercentage}%`
                                  )}
                                </td>
                                {isEditing && (
                                  <td>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleRemoveSlab(tds.id, index)}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="alert alert-info mb-0">No slabs available.</div>
                    )}

                    {isEditing && (
                      <button
                        className="btn btn-sm btn-primary mt-2"
                        onClick={() => handleAddNewSlab(tds.id)}
                      >
                        <i className="bi bi-plus-lg me-1"></i> Add New Slab
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info">
                No TDS structure found for {selectedYear} with type {selectedTdsType || "All"}.
              </div>
            </div>
          )}
        </div>

        {/* Add Slab Modal */}
        {showAddSlabForm && (
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
                  <h5 className="modal-title">Add New Tax Slab</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => {
                      setShowAddSlabForm(false);
                      setErrors({});
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Minimum Amount</label>
                    <input
                      type="text"
                      className={`form-control ${errors.min ? 'is-invalid' : ''}`}
                      value={newSlab.min}
                      onChange={(e) => setNewSlab({ ...newSlab, min: e.target.value })}
                      maxLength={9}
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                    {errors.min && <div className="invalid-feedback">{errors.min}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Maximum Amount</label>
                    <input
                      type="text"
                      className={`form-control ${errors.max ? 'is-invalid' : ''}`}
                      value={newSlab.max}
                      onChange={(e) => setNewSlab({ ...newSlab, max: e.target.value })}
                      maxLength={9}
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                    {errors.max && <div className="invalid-feedback">{errors.max}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tax Percentage</label>
                    <input
                      type="text"
                      className={`form-control ${errors.taxPercentage ? 'is-invalid' : ''}`}
                      value={newSlab.taxPercentage}
                      onChange={(e) => setNewSlab({ ...newSlab, taxPercentage: e.target.value })}
                      maxLength={2}
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                    {errors.taxPercentage && <div className="invalid-feedback">{errors.taxPercentage}</div>}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddSlabForm(false);
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddSlab}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      "Save Slab"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayOut>
  );
};

export default CompanyTdsView;