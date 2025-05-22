import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import { TdsGetApi, TdsPatchApi } from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


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

  // Validate new slab inputs
  const validateNewSlab = () => {
    const newErrors = {};
    if (!newSlab.min || isNaN(newSlab.min)) newErrors.min = "Please enter a valid minimum amount";
    if (!newSlab.max || isNaN(newSlab.max)) newErrors.max = "Please enter a valid maximum amount";
    if (!newSlab.taxPercentage || isNaN(newSlab.taxPercentage)) newErrors.taxPercentage = "Please enter a valid percentage";
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
        if (!slab.min || isNaN(slab.min)) newErrors[`${tdsId}_${index}_min`] = "Invalid min amount";
        if (!slab.max || isNaN(slab.max)) newErrors[`${tdsId}_${index}_max`] = "Invalid max amount";
        if (!slab.taxPercentage || isNaN(slab.taxPercentage)) newErrors[`${tdsId}_${index}_taxPercentage`] = "Invalid percentage";
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateAllSlabs()) {
      toast.error("Please fix all validation errors before saving");
      return;
    }
  
    setIsSaving(true);
    try {
      const updatePromises = Object.keys(editedSlabs).map(tdsId => {
        return TdsPatchApi(tdsId, { 
          persentageEntityList: editedSlabs[tdsId],
          startYear: selectedYear.split("-")[0],
          endYear: selectedYear.split("-")[1],
          tdsType: filteredData.find(tds => tds.id === tdsId)?.tdsType
        });
      });
  
      await Promise.all(updatePromises);
      
      // Update the local state immediately instead of refetching
      setFilteredData(prevData => 
        prevData.map(tds => ({
          ...tds,
          persentageEntityList: editedSlabs[tds.id] || tds.persentageEntityList
        }))
      );
      
      toast.success("TDS slabs updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating TDS slabs:", error);
      toast.error("Failed to update TDS slabs");
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

      const updatedSlabs = [...(editedSlabs[tdsId] || []), newSlab];
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
      <div className="container">
      <div className="row mb-3">
  <div className="col-md-12 d-flex justify-content-between align-items-center">
    <button 
      className="btn btn-primary"
      onClick={() => navigate('/addTaxSlab')}
    >
      + Add TDS Structure
    </button>
    <h1 className="h3 mb-0">TDS View - {selectedYear}</h1>
    <div style={{ width: '150px' }}></div> {/* This empty div maintains balance in the layout */}
  </div>
</div>
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="fw-bold">Select Financial Year</label>
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

          <div className="col-md-6">
            <label className="fw-bold">Select TDS Type</label>
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

        {authUser?.userRole?.includes("company_admin") && (
          <div className="row mb-3">
            <div className="col-md-12 text-end">
              {!isEditing ? (
                <button className="btn btn-primary me-2" onClick={handleEditClick}>
                  Edit TDS Slabs
                </button>
              ) : (
                <div>
                  <button
                    className="btn btn-success me-2"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="row">
          {filteredData.length > 0 ? (
            filteredData.map((tds) => (
              <div key={tds.id} className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">
                      <span className="badge bg-info">{tds.tdsType}</span>
                    </h5>
                    <h6 className="card-subtitle mb-3 text-muted">
                      Financial Year: {tds.startYear} - {tds.endYear}
                    </h6>

                    <div className="mt-3">
                      <h6>TDS Slabs</h6>
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
                                          type="number"
                                          className={`form-control form-control-sm ${errors[`${tds.id}_${index}_min`] ? 'is-invalid' : ''}`}
                                          value={slab.min}
                                          onChange={(e) => handleSlabChange(tds.id, index, 'min', e.target.value)}
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
                                          type="number"
                                          className={`form-control form-control-sm ${errors[`${tds.id}_${index}_max`] ? 'is-invalid' : ''}`}
                                          value={slab.max}
                                          onChange={(e) => handleSlabChange(tds.id, index, 'max', e.target.value)}
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
                                          type="number"
                                          className={`form-control form-control-sm ${errors[`${tds.id}_${index}_taxPercentage`] ? 'is-invalid' : ''}`}
                                          value={slab.taxPercentage}
                                          onChange={(e) => handleSlabChange(tds.id, index, 'taxPercentage', e.target.value)}
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
                                        Remove
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p>No slabs available.</p>
                      )}

                      {isEditing && (
                        <button
                          className="btn btn-sm btn-primary mt-2"
                          onClick={() => handleAddNewSlab(tds.id)}
                        >
                          + Add New Slab
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-md-12 text-center">
              <div className="alert alert-info">
                No TDS structure found for {selectedYear} with type {selectedTdsType || "All"}.
              </div>
            </div>
          )}
        </div>

        {showAddSlabForm && (
          <div className="modal-wrapper">
            <div className="modal-box">
              <h5>Add New Tax Slab</h5>
              <div className="form-group">
                <label>Minimum Amount</label>
                <input
                  type="number"
                  className={`form-control ${errors.min ? 'is-invalid' : ''}`}
                  value={newSlab.min}
                  onChange={(e) => setNewSlab({ ...newSlab, min: e.target.value })}
                />
                {errors.min && <div className="invalid-feedback">{errors.min}</div>}
              </div>
              <div className="form-group mt-2">
                <label>Maximum Amount</label>
                <input
                  type="number"
                  className={`form-control ${errors.max ? 'is-invalid' : ''}`}
                  value={newSlab.max}
                  onChange={(e) => setNewSlab({ ...newSlab, max: e.target.value })}
                />
                {errors.max && <div className="invalid-feedback">{errors.max}</div>}
              </div>
              <div className="form-group mt-2">
                <label>Tax Percentage</label>
                <input
                  type="number"
                  className={`form-control ${errors.taxPercentage ? 'is-invalid' : ''}`}
                  value={newSlab.taxPercentage}
                  onChange={(e) => setNewSlab({ ...newSlab, taxPercentage: e.target.value })}
                />
                {errors.taxPercentage && <div className="invalid-feedback">{errors.taxPercentage}</div>}
              </div>
              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-primary"
                  onClick={handleAddSlab}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Slab'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddSlabForm(false);
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayOut>
  );
};

export default CompanyTdsView;