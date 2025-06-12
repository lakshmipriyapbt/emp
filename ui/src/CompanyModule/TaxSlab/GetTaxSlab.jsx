import React from "react";

const GetTaxSlab = ({ year, slabs, isDisabled }) => {
  return (
    <form>
      {slabs.length > 0 ? (
        slabs.map((slab, index) => (
          <div key={index} className="mb-3">
            <div className="row">
              {/* Min Amount Input */}
              <div className="col-md-4 position-relative">
                <input
                  type="number"
                  className="form-control"
                  value={slab.min}
                  disabled={isDisabled}
                  readOnly={isDisabled}
                  onChange={(e) => {
                    // Handle input change if needed (for editable fields)
                  }}
                />
                {/* ₹ symbol for min amount */}
                <span className="currency-symbol">₹</span>
              </div>

              {/* Max Amount Input */}
              <div className="col-md-4 position-relative">
                <input
                  type="text"
                  className="form-control"
                  value={slab.max === Infinity ? "Infinity" : slab.max}
                  disabled={isDisabled}
                  readOnly={isDisabled}
                  onChange={(e) => {
                    // Handle input change if needed (for editable fields)
                  }}
                />
                {/* ₹ symbol for max amount */}
                <span className="currency-symbol">₹</span>
              </div>

              {/* Rate Input */}
              <div className="col-md-4 position-relative">
                <input
                  type="text"
                  className="form-control"
                  value={slab.rate}
                  disabled={isDisabled}
                  readOnly={isDisabled}
                  onChange={(e) => {
                    // Handle input change if needed (for editable fields)
                  }}
                />
                {/* % symbol for rate */}
                <span className="percentage-symbol">%</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center">
          No data for {year}
        </div>
      )}
    </form>
  );
};

export default GetTaxSlab;
