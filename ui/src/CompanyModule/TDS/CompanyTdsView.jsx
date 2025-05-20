import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import { TdsGetApi, TdsPatchApi, getCompanyTdsByYear } from "../../Utils/Axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { toast } from "react-toastify";

const getCurrentFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const CompanyTdsView = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(getCurrentFinancialYear());
  const { authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(null);
  const [editValues, setEditValues] = useState([]);
  const [showAddSlabForm, setShowAddSlabForm] = useState(false);
  const [newSlab, setNewSlab] = useState({ min: "", max: "", taxPercentage: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSlabIndex, setSelectedSlabIndex] = useState(null);
  const [selectedTdsType, setSelectedTdsType] = useState("");
  const [tdsTypes, setTdsTypes] = useState([]);
  const [errors, setErrors] = useState({}); // State to track validation errors
  const [touchedFields, setTouchedFields] = useState({});

  // Validate new slab inputs
  const validateNewSlab = () => {
    const newErrors = {};

    if (!newSlab.min || isNaN(newSlab.min)) {
      newErrors.min = "Please enter a valid minimum amount";
    } else if (parseInt(newSlab.min) < 0) {
      newErrors.min = "Minimum amount cannot be negative";
    }

    if (!newSlab.max || isNaN(newSlab.max)) {
      newErrors.max = "Please enter a valid maximum amount";
    } else if (parseInt(newSlab.max) < 0) {
      newErrors.max = "Maximum amount cannot be negative";
    } else if (parseInt(newSlab.max) <= parseInt(newSlab.min)) {
      newErrors.max = "Maximum must be greater than minimum";
    }

    if (!newSlab.taxPercentage || isNaN(newSlab.taxPercentage)) {
      newErrors.taxPercentage = "Please enter a valid percentage";
    } else if (parseFloat(newSlab.taxPercentage) < 0) {
      newErrors.taxPercentage = "Percentage cannot be negative";
    } else if (parseFloat(newSlab.taxPercentage) > 100) {
      newErrors.taxPercentage = "Percentage cannot exceed 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate edited slab inputs
  const validateEditSlab = (index) => {
    const newErrors = {};
    const slab = editValues[index] || {};

    // Validate min field
    if (!slab.min || !/^\d*\.?\d+$/.test(slab.min)) {
      newErrors[`min_${index}`] = "Please enter a valid number";
    } else if (parseFloat(slab.min) < 0) {
      newErrors[`min_${index}`] = "Minimum amount cannot be negative";
    }

    // Validate max field
    if (!slab.max || !/^\d*\.?\d+$/.test(slab.max)) {
      newErrors[`max_${index}`] = "Please enter a valid number";
    } else if (parseFloat(slab.max) < 0) {
      newErrors[`max_${index}`] = "Maximum amount cannot be negative";
    } else if (parseFloat(slab.max) <= parseFloat(slab.min || 0)) {
      newErrors[`max_${index}`] = "Maximum must be greater than minimum";
    }

    // Validate taxPercentage field
    if (!slab.taxPercentage || !/^\d*\.?\d+$/.test(slab.taxPercentage)) {
      newErrors[`taxPercentage_${index}`] = "Please enter a valid percentage";
    } else if (parseFloat(slab.taxPercentage) < 0) {
      newErrors[`taxPercentage_${index}`] = "Percentage cannot be negative";
    } else if (parseFloat(slab.taxPercentage) > 100) {
      newErrors[`taxPercentage_${index}`] = "Percentage cannot exceed 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchTdsByYear(selectedYear.split("-")[0]);
  }, [selectedYear]);

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

        // Extract unique TDS types
        const uniqueTypes = [...new Set(filteredByYear.map(entry => entry.tdsType))].filter(type => type);
        setTdsTypes(uniqueTypes);
      } else {
        setFilteredData([]);
        setTdsTypes([]);
      }
    } catch (error) {
      console.error("Error fetching TDS data:", error);
      setFilteredData([]);
      setTdsTypes([]);
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleFieldBlur = (index, field) => {
    setTouchedFields(prev => ({
      ...prev,
      [`${field}_${index}`]: true
    }));
    validateEditSlab(index, field);
  };

  const handleEditClick = (index, entity) => {
    setSelectedSlabIndex(index);
    setShowConfirmModal(true);

    // Pre-fill editValues with the selected entity
    setEditValues((prev) => {
      const updated = [...prev];
      updated[index] = {
        min: entity.min,
        max: entity.max,
        taxPercentage: entity.taxPercentage,
      };
      return updated;
    });
  };

  const handleConfirmEdit = () => {
    setIsEditing(selectedSlabIndex);
    setShowConfirmModal(false);
  };

  const handleSave = async (index, tdsId) => {
    // Mark all fields as touched and validate
    const newTouchedFields = {
      [`min_${index}`]: true,
      [`max_${index}`]: true,
      [`taxPercentage_${index}`]: true
    };
    setTouchedFields(newTouchedFields);

    // Perform validation
    const isValid = validateEditSlab(index);

    if (!isValid) {
      toast.error("Please fill all required fields with valid values");
      return;
    }

    try {
      const existingTds = filteredData[0];
      const originalSlab = existingTds.persentageEntityList[index];
      const editedSlab = editValues[index];

      // Check if values are empty
      if (!editedSlab.min || !editedSlab.max || !editedSlab.taxPercentage) {
        toast.error("All fields are required");
        return;
      }

      if (
        originalSlab.min === editedSlab.min &&
        originalSlab.max === editedSlab.max &&
        originalSlab.taxPercentage === editedSlab.taxPercentage
      ) {
        toast.error("No changes made to the TDS slab.");
        return;
      }

      const updatedSlabs = existingTds.persentageEntityList.map((entity, i) =>
        i === index ? { ...entity, ...editValues[i] } : entity
      );

      const response = await TdsPatchApi(tdsId, { persentageEntityList: updatedSlabs });

      if (response.status === 200) {
        setFilteredData([{ ...existingTds, persentageEntityList: updatedSlabs }]);
        setIsEditing(null);
        setTouchedFields({});
        setErrors({});
        toast.success("TDS slab updated successfully!");
      } else {
        toast.error("Failed to update slab.");
      }
    } catch (error) {
      console.error("Error updating TDS:", error);
      toast.error("An error occurred while updating TDS.");
    }
  };

  const handleAddSlab = async () => {
    if (!validateNewSlab()) {
      toast.error("Please fix validation errors before adding slab");
      return;
    }

    try {
      const existingTds = filteredData[0];

      if (!existingTds) {
        toast.error("TDS Structure not found for this year.");
        return;
      }

      const updatedSlabs = [...existingTds.persentageEntityList, {
        min: newSlab.min,
        max: newSlab.max,
        taxPercentage: newSlab.taxPercentage
      }];

      const response = await TdsPatchApi(existingTds.id, { persentageEntityList: updatedSlabs });

      if (response.status === 200) {
        setFilteredData([{ ...existingTds, persentageEntityList: updatedSlabs }]);
        setShowAddSlabForm(false);
        setNewSlab({ min: "", max: "", taxPercentage: "" });
        setErrors({});
        toast.success("New tax slab added successfully!");
      } else {
        toast.error("Failed to add tax slab.");
      }
    } catch (error) {
      console.error("Error adding tax slab:", error);
      toast.error("An error occurred while adding the slab.");
    }
  };

  return (
    <LayOut>
      <div className="container">
        <div className="row mb-3">
          <div className="col-md-4">
            {authUser?.userRole?.includes("company_admin") && (
              <Link to="/addTaxSlab">
                <button className="btn btn-primary">Add TDS Structure</button>
              </Link>
            )}
          </div>

          <div className="col-md-4 text-center">
            <h1 className="h3">TDS View - {selectedYear}</h1>
          </div>

          <div className="col-md-4 offset-md-8 mt-3 text-end">
            <label className="fw-bold">Select Financial Year</label>
            <select className="form-select d-inline-block w-50" value={selectedYear} onChange={handleYearChange}>
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

          <div className="col-md-4 offset-md-8 mt-3 text-end">
            <label className="fw-bold">Select TDS Type</label>
            <select className="form-select d-inline-block w-50" value={selectedTdsType} onChange={(e) => setSelectedTdsType(e.target.value)}>
              <option value="">All TDS Types</option>
              {tdsTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          {filteredData.length > 0 ? (
            filteredData.map((tds) => (
              selectedTdsType === "" || tds.tdsType === selectedTdsType ? (
                <div key={tds.id} className="col-md-12 mb-4">
                  <div className="card">
                    <div className="card-body">
                      <h5>TDS Type: <span className="badge bg-info">{tds.tdsType}</span></h5>
                      <h5>Financial Year: {tds.startYear} - {tds.endYear}</h5>

                      <h5>TDS Slabs</h5>
                      {tds.persentageEntityList.length > 0 ? (
                        <div className="row">
                          {tds.persentageEntityList.map((entity, i) => (
                            <div key={i} className="col-md-6 mb-3">
                              <div className="border p-3 bg-light">
                                <h5>Slab {i + 1}</h5>
                                <div className="form-group">
                                  <label>Minimum Amount</label>
                                  <input
                                    type="text"
                                    className={`form-control ${touchedFields[`min_${i}`] && errors[`min_${i}`] ? 'is-invalid' : ''}`}
                                    pattern="[0-9]*\.?[0-9]*"
                                    inputMode="decimal"
                                    readOnly={isEditing !== i}
                                    value={isEditing === i ? editValues[i]?.min ?? "" : entity.min}
                                    onChange={(e) => {
                                      // Only allow numbers and decimal points
                                      if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) {
                                        setEditValues((prev) => {
                                          const updated = [...prev];
                                          updated[i] = { ...updated[i], min: e.target.value };
                                          return updated;
                                        });
                                      }
                                    }}
                                    onBlur={() => handleFieldBlur(i, 'min')}
                                  />
                                  {touchedFields[`min_${i}`] && errors[`min_${i}`] && (
                                    <div className="invalid-feedback">{errors[`min_${i}`]}</div>
                                  )}
                                </div>

                                <div className="form-group mt-2">
                                  <label>Maximum Amount</label>
                                  <input
                                    type="text"
                                    className={`form-control ${touchedFields[`max_${i}`] && errors[`max_${i}`] ? 'is-invalid' : ''}`}
                                    pattern="[0-9]*\.?[0-9]*"
                                    inputMode="decimal"
                                    readOnly={isEditing !== i}
                                    value={isEditing === i ? editValues[i]?.max ?? "" : entity.max}
                                    onChange={(e) => {
                                      if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) {
                                        setEditValues((prev) => {
                                          const updated = [...prev];
                                          updated[i] = { ...updated[i], max: e.target.value };
                                          return updated;
                                        });
                                      }
                                    }}
                                    onBlur={() => handleFieldBlur(i, 'max')}
                                  />
                                  {touchedFields[`max_${i}`] && errors[`max_${i}`] && (
                                    <div className="invalid-feedback">{errors[`max_${i}`]}</div>
                                  )}
                                </div>

                                <div className="form-group mt-2">
                                  <label>Tax Percentage</label>
                                  <input
                                    type="text"
                                    className={`form-control ${touchedFields[`taxPercentage_${i}`] && errors[`taxPercentage_${i}`] ? 'is-invalid' : ''}`}
                                    pattern="[0-9]*\.?[0-9]*"
                                    inputMode="decimal"
                                    readOnly={isEditing !== i}
                                    value={isEditing === i ? editValues[i]?.taxPercentage ?? "" : entity.taxPercentage}
                                    onChange={(e) => {
                                      if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) {
                                        setEditValues((prev) => {
                                          const updated = [...prev];
                                          updated[i] = { ...updated[i], taxPercentage: e.target.value };
                                          return updated;
                                        });
                                      }
                                    }}
                                    onBlur={() => handleFieldBlur(i, 'taxPercentage')}
                                  />
                                  {touchedFields[`taxPercentage_${i}`] && errors[`taxPercentage_${i}`] && (
                                    <div className="invalid-feedback">{errors[`taxPercentage_${i}`]}</div>
                                  )}
                                </div>

                                {authUser?.userRole?.includes("company_admin") &&
                                  (isEditing === i ? (
                                    <button className="btn btn-success mt-2" onClick={() => handleSave(i, tds.id)}>
                                      Save
                                    </button>
                                  ) : (
                                    <button className="btn btn-warning mt-2" onClick={() => handleEditClick(i, entity)}>
                                      Edit
                                    </button>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No slabs available.</p>
                      )}

                      {authUser?.userRole?.includes("company_admin") && (
                        <>
                          <button className="btn btn-success mt-3" onClick={() => setShowAddSlabForm(true)}>
                            + Add New Slab
                          </button>

                          {showAddSlabForm && (
                            <div className="border p-3 mt-3 bg-light">
                              <h5>Add New Tax Slab</h5>
                              <div className="form-group">
                                <label>Minimum Amount</label>
                                <input
                                  type="number"
                                  className={`form-control ${errors.min ? 'is-invalid' : ''}`}
                                  placeholder="Min Value"
                                  value={newSlab.min}
                                  onChange={(e) => {
                                    setNewSlab({ ...newSlab, min: e.target.value });
                                    validateNewSlab();
                                  }}
                                />
                                {errors.min && (
                                  <div className="invalid-feedback">{errors.min}</div>
                                )}
                              </div>

                              <div className="form-group mt-2">
                                <label>Maximum Amount</label>
                                <input
                                  type="number"
                                  className={`form-control ${errors.max ? 'is-invalid' : ''}`}
                                  placeholder="Max Value"
                                  value={newSlab.max}
                                  onChange={(e) => {
                                    setNewSlab({ ...newSlab, max: e.target.value });
                                    validateNewSlab();
                                  }}
                                />
                                {errors.max && (
                                  <div className="invalid-feedback">{errors.max}</div>
                                )}
                              </div>

                              <div className="form-group mt-2">
                                <label>Tax Percentage</label>
                                <input
                                  type="number"
                                  className={`form-control ${errors.taxPercentage ? 'is-invalid' : ''}`}
                                  placeholder="Tax Percentage"
                                  value={newSlab.taxPercentage}
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  onChange={(e) => {
                                    setNewSlab({ ...newSlab, taxPercentage: e.target.value });
                                    validateNewSlab();
                                  }}
                                />
                                {errors.taxPercentage && (
                                  <div className="invalid-feedback">{errors.taxPercentage}</div>
                                )}
                              </div>

                              <div className="d-flex gap-2 mt-3">
                                <button className="btn btn-primary" onClick={handleAddSlab}>
                                  Save Slab
                                </button>
                                <button className="btn btn-secondary" onClick={() => {
                                  setShowAddSlabForm(false);
                                  setErrors({});
                                }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : null
            ))
          ) : (
            <p className="text-center">
              No TDS structure found for {selectedYear} with type {selectedTdsType || "All"}.
            </p>
          )}
        </div>

        {showConfirmModal && (
          <div className="modal-wrapper">
            <div className="modal-box">
              <h5>Do you really want to edit this TDS slab?</h5>
              <button className="btn btn-success mt-2" onClick={handleConfirmEdit}>
                Yes, Edit
              </button>
              <button className="btn btn-danger mt-2" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </LayOut>
  );
};

export default CompanyTdsView;