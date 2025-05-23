import React, { useEffect, useState } from "react";
import { TdsGetApi } from "../../Utils/Axios";
import { toast } from "react-toastify";
import Loader from "../../Utils/Loader";

const getCurrentFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const TaxSlab = () => {
  const [slabsData, setSlabsData] = useState({
    old: [],
    new: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentYear = getCurrentFinancialYear();

  useEffect(() => {
    const fetchTaxSlabs = async () => {
      try {
        setLoading(true);
        const response = await TdsGetApi();
        const data = response?.data?.data;

        if (data && Array.isArray(data)) {
          const currentYearStart = currentYear.split("-")[0];

          // Find all entries for current year
          const currentYearData = data.filter(entry =>
            entry.startYear && entry.startYear.toString() === currentYearStart
          );

          // Separate old and new TDS types (case-insensitive)
          const oldSlabs = currentYearData
            .find(tds => tds.tdsType && tds.tdsType.toLowerCase().includes("old"))
            ?.persentageEntityList || [];

          const newSlabs = currentYearData
            .find(tds => tds.tdsType && tds.tdsType.toLowerCase().includes("new"))
            ?.persentageEntityList || [];

          setSlabsData({
            old: oldSlabs,
            new: newSlabs
          });
        } else {
          setSlabsData({ old: [], new: [] });
        }
      } catch (error) {
        console.error("Error fetching TDS data:", error);
        setError("Failed to load tax slab data");
        toast.error("Failed to load tax slab data");
        setSlabsData({ old: [], new: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchTaxSlabs();
  }, [currentYear]);

  if (loading) return <Loader small={true} />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const hasOldSlabs = slabsData.old.length > 0;
  const hasNewSlabs = slabsData.new.length > 0;

  return (
    <div className="tax-slab-container">
      <h3 className="text-center">
        <strong>Current Tax Slabs ({currentYear})</strong>
      </h3>
      {hasOldSlabs || hasNewSlabs ? (
        <div className="vertical-layout">
          {/* Old Tax Regime - Always first */}
          {hasOldSlabs && (
            <div className="tax-regime-section">
              <h5 className="text-center mb-3">Old Tax Regime</h5>
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Slab</th>
                      <th>Min Amount</th>
                      <th>Max Amount</th>
                      <th>Tax %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slabsData.old.map((slab, index) => (
                      <tr key={`old-${index}`}>
                        <td>{index + 1}</td>
                        <td>{slab.min?.toLocaleString() ?? 'N/A'}</td>
                        <td>{slab.max?.toLocaleString() ?? 'N/A'}</td>
                        <td>{slab.taxPercentage ?? 'N/A'}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* New Tax Regime - Always second */}
          {hasNewSlabs && (
            <div className="tax-regime-section mt-4">
              <h5 className="text-center mb-3">New Tax Regime</h5>
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Slab</th>
                      <th>Min Amount</th>
                      <th>Max Amount</th>
                      <th>Tax %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slabsData.new.map((slab, index) => (
                      <tr key={`new-${index}`}>
                        <td>{index + 1}</td>
                        <td>{slab.min?.toLocaleString() ?? 'N/A'}</td>
                        <td>{slab.max?.toLocaleString() ?? 'N/A'}</td>
                        <td>{slab.taxPercentage ?? 'N/A'}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="alert alert-warning mb-0">
          No tax slabs found for {currentYear}
        </div>
      )}
    </div>
  );
};

export default TaxSlab;