import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTds } from "../../Redux/TdsSlice";
import Loader from "../../Utils/Loader";
import { toast } from "react-toastify";

const getCurrentFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const TaxSlab = () => {
  const dispatch = useDispatch();
  const { tdsList, loading, error } = useSelector((state) => state.tds);
  const currentYear = getCurrentFinancialYear();

  useEffect(() => {
    dispatch(fetchTds());
  }, [dispatch]);

  const { oldSlabs, newSlabs } = useMemo(() => {
    const currentYearStart = currentYear.split("-")[0];
    const currentYearData = tdsList.filter(
      (entry) => entry.startYear?.toString() === currentYearStart
    );

    const old = currentYearData.find(
      (tds) => tds.tdsType?.toLowerCase().includes("old")
    )?.persentageEntityList || [];

    const newer = currentYearData.find(
      (tds) => tds.tdsType?.toLowerCase().includes("new")
    )?.persentageEntityList || [];

    return { oldSlabs: old, newSlabs: newer };
  }, [tdsList, currentYear]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load tax slab data");
    }
  }, [error]);

  if (loading) return <Loader small={true} />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const hasOldSlabs = oldSlabs.length > 0;
  const hasNewSlabs = newSlabs.length > 0;

  return (
    <div className="tax-slab-container">
      <h3 className="text-center">
        <strong>Current Tax Slabs ({currentYear})</strong>
      </h3>
      {hasOldSlabs || hasNewSlabs ? (
        <div className="vertical-layout">
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
                    {oldSlabs.map((slab, index) => (
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
                    {newSlabs.map((slab, index) => (
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
