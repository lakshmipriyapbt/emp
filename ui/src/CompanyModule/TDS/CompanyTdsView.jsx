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
  const [editValues, setEditValues] = useState([]); // ✅ Initialized as an array
  const [showAddSlabForm, setShowAddSlabForm] = useState(false);
  const [newSlab, setNewSlab] = useState({ min: "", max: "", taxPercentage: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSlabIndex, setSelectedSlabIndex] = useState(null);
  const [selectedTdsType, setSelectedTdsType] = useState(""); // Track selected TDS Type
  const [tdsTypes, setTdsTypes] = useState([]); // Store unique TDS Types

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

  console.log("filteredData Response", filteredData);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
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
    try {
      const existingTds = filteredData[0];
      const originalSlab = existingTds.persentageEntityList[index];
      const editedSlab = editValues[index];
  
      // ✅ Check if any value has changed
      if (
        originalSlab.min === editedSlab.min &&
        originalSlab.max === editedSlab.max &&
        originalSlab.taxPercentage === editedSlab.taxPercentage
      ) {
        toast.error("No changes made to the TDS slab.");
        return;
      }
  
      // ✅ Proceed with API request if changes are detected
      const updatedSlabs = existingTds.persentageEntityList.map((entity, i) =>
        i === index ? { ...entity, ...editValues[i] } : entity
      );
  
      const response = await TdsPatchApi(tdsId, { persentageEntityList: updatedSlabs });
  
      if (response.status === 200) {
        setFilteredData([{ ...existingTds, persentageEntityList: updatedSlabs }]);
        setIsEditing(null);
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
    try {
      const existingTds = filteredData[0];

      if (!existingTds) {
        alert("TDS Structure not found for this year.");
        return;
      }

      const updatedSlabs = [...existingTds.persentageEntityList, newSlab];
      const response = await TdsPatchApi(existingTds.id, { persentageEntityList: updatedSlabs });

      if (response.status === 200) {
        setFilteredData([{ ...existingTds, persentageEntityList: updatedSlabs }]);
        setShowAddSlabForm(false);
        setNewSlab({ min: "", max: "", taxPercentage: "" });
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
                          {tds.persentageEntityList
                            .slice()
                            .sort((a, b) => parseInt(a.min) - parseInt(b.min))
                            .map((entity, i) => (
                              <div key={i} className="col-md-6 mb-3">
                                <div className="border p-3 bg-light">
                                  <h5>Slab {i + 1}</h5>
                                  <input
                                    type="text"
                                    className="form-control"
                                    readOnly={isEditing !== i}
                                    value={isEditing === i ? editValues[i]?.min ?? "" : entity.min}
                                    onChange={(e) => {
                                      if (/^\d{0,9}$/.test(e.target.value)) { // ✅ Allows only 9 digits
                                        setEditValues((prev) => {
                                          const updated = [...prev];
                                          updated[i] = { ...updated[i], min: e.target.value };
                                          return updated;
                                        });
                                      }
                                    }}
                                  />

                                  <input
                                    type="text"
                                    className="form-control mt-2"
                                    readOnly={isEditing !== i}
                                    value={isEditing === i ? editValues[i]?.max ?? "" : entity.max}
                                    onChange={(e) => {
                                      if (/^\d{0,9}$/.test(e.target.value)) { // ✅ Allows only 9 digits
                                        setEditValues((prev) => {
                                          const updated = [...prev];
                                          updated[i] = { ...updated[i], max: e.target.value };
                                          return updated;
                                        });
                                      }
                                    }}
                                  />

                                  <input
                                    type="text"
                                    className="form-control mt-2"
                                    readOnly={isEditing !== i}
                                    value={isEditing === i ? editValues[i]?.taxPercentage ?? "" : entity.taxPercentage}
                                    min="0"
                                    max="99"
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value >= 0 && value <= 99) { // ✅ Restricts values between 0 and 99
                                        setEditValues((prev) => {
                                          const updated = [...prev];
                                          updated[i] = { ...updated[i], taxPercentage: value };
                                          return updated;
                                        });
                                      }
                                    }}
                                  />

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
                              <input
                                className="form-control"
                                placeholder="Min Value"
                                value={newSlab.min}
                                onChange={(e) => setNewSlab({ ...newSlab, min: e.target.value })}
                              />
                              <input
                                className="form-control mt-2"
                                placeholder="Max Value"
                                value={newSlab.max}
                                onChange={(e) => setNewSlab({ ...newSlab, max: e.target.value })}
                              />
                              <input
                                className="form-control mt-2"
                                placeholder="Tax Percentage"
                                value={newSlab.taxPercentage}
                                onChange={(e) => setNewSlab({ ...newSlab, taxPercentage: e.target.value })}
                              />
                              <button className="btn btn-primary mt-3" onClick={handleAddSlab}>
                                Save Slab
                              </button>
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
