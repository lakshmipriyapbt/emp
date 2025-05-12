import React, { useState } from "react";
import GetTaxSlab from "./GetTaxSlab";

const slabData = {
  "2025-2026": [
    { min: 0, max: 500000, rate: "3" },
    { min: 500001, max: 900000, rate: "5" },
    { min: 900001, max: 1200000, rate: "9" },
  ],
  "2026-2027": [
    { min: 0, max: 400000, rate: "2" },
    { min: 400001, max: 1000000, rate: "6" },
  ],
};

const TaxSlab = () => {
  const [selectedYear, setSelectedYear] = useState("2025-2026");

  // Get user role from sessionStorage
  const userRole = sessionStorage.getItem("userRole") || "user"; // fallback to "user"
  const isDisabled = userRole !== "admin";

  const years = Object.keys(slabData);

  return (

    <div>
      <div className="row mb-3">
        <div className="col-md-12">
            <h4>Tax Slab</h4>
          <label className="form-label"><b>Select Financial Year</b></label>
          <select
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <GetTaxSlab
        year={selectedYear}
        slabs={slabData[selectedYear] || []}
        isDisabled={isDisabled}
      />
    </div>
  );
};

export default TaxSlab;
