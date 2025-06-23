import React from "react";
import { useAuth } from "../../../Context/AuthContext";

const AppraisalTemplate2 = ({
  companyLogo,
  companyData,
  employeeName,
  designation,
  employeeId,
  hike,
  effectiveDate,
  salaryIncrease,
  allowances,
  date,
  basicSalary,
  draft,
  stampImage
}) => {
  return (
    <div
      className="watermarked"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {!draft &&(
       <div style={{ textAlign: "left" }}>
        {companyData ? (
          <img
            className="align-middle"
            src={companyData?.imageFile}
            alt="Logo"
            style={{ height: "100px", width: "150px" }}
          />
        ) : (
          <p>Logo</p>
        )}
      </div> )}

       {!draft &&(<div
        style={{
          position: "absolute",
          top: "30%",
          left: "20%",
          right: "30%",
          width: "50%",
          height: "50%",
          opacity:0.3,
          border: "none",
          backgroundImage: `url(${companyLogo})`,
          transform: "rotate(340deg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          zIndex: 1,
        }}
      /> )}
      <h4 className="text-center p-3">APPRAISAL LETTER</h4>

      <div className="row d-flex justify-content-between p-1">
        <div className="col-6">
          <p className="mb-0">
            <h6>To</h6>
          </p>
          <p>
            <strong>{employeeName}</strong>
          </p>
          <p>
            <strong>{employeeId}</strong>
          </p>
          <p>
            Designation:<strong>{designation}</strong>
          </p>
        </div>
        <div className="col-6">
          <p className="mb-0 text-end">{date}</p>
        </div>
      </div>

      {/* Content div */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(2px)",
        }}
      >
        <p className="p-2">
          Sub:<strong>Increament of Salary</strong>
        </p>
        <p className="p-2">
          Dear<strong>{employeeName}</strong>
        </p>

        <p>
          We are pleased to inform you that based on your performance and
          contribution to the company, our management has revised your
          compensation to Rs.<strong>{salaryIncrease}</strong> per Annum, This represents a <b>{hike}%</b> increase, demonstrating our appreciation for your dedication.Which
          is cost to company with effect from <strong>{effectiveDate}</strong>.
        </p>
        <p>All other T&C are same as per the original offer letter. We extend our good wishes and trust that you will maintain your remarkable enthusiasm and dedication moving forward.</p>
        <table className="table border-collapse mb-5">
          <thead>
            <tr className="text-center">
              <th>Particulars</th>
              <th>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            {allowances &&
              Object.keys(allowances).map((key, index) => {
                const value = allowances[key];
                let allowanceAmount = 0;
                console.log(
                  `Processing allowance for key: ${key}, value: ${value}`
                );
                // Step 2: Calculate HRA based on Basic Salary
                if (key === "HRA" || key === "Provident Fund Employer") {
                  console.log(
                    "Calculating HRA based on Basic Salary: ",
                    basicSalary
                  );
                  if (typeof value === "string" && value.includes("%")) {
                    console.log("basicSalary", basicSalary);
                    // HRA is a percentage of Basic Salary
                    const percentageValue = parseFloat(value.slice(0, -1)); // Remove '%' and convert to a number
                    allowanceAmount = basicSalary * (percentageValue / 100); // HRA Calculation
                    console.log("HRA calculated: ", allowanceAmount); // Debugging
                  } else {
                    // HRA is a fixed value
                    allowanceAmount = parseFloat(value);
                    console.log("Fixed HRA: ", allowanceAmount); // Debugging
                  }
                }

                // Step 3: Calculate Other Allowances (based on salaryIncrease or fixed)
                else {
                  if (typeof value === "string" && value.includes("%")) {
                    // If the allowance is a percentage of salaryIncrease
                    const percentageValue = parseFloat(value.slice(0, -1)); // Remove '%' and convert to a number
                    allowanceAmount = salaryIncrease * (percentageValue / 100);
                    console.log(
                      `${key} allowance calculated as percentage: `,
                      allowanceAmount
                    );
                  } else {
                    // If the allowance is a fixed value
                    allowanceAmount = parseFloat(value);
                    console.log(
                      `${key} allowance as fixed value: `,
                      allowanceAmount
                    );
                  }
                }

                return (
                  <tr key={index}>
                    <td>
                      {/* Convert camelCase keys to human-readable format */}
                      {key
                        .replace(/([A-Z])/g, " $1") // Add space before uppercase letters
                        .replace(/^./, (str) => str.toUpperCase())}{" "}
                      {/* Capitalize the first letter */}
                    </td>
                    <td>{Math.floor(allowanceAmount)}</td>{" "}
                    {/* Round the allowance amount to the nearest integer */}
                  </tr>
                );
              })}

            {/* Add a row for Gross Salary after the allowances */}
            {salaryIncrease && (
              <tr>
                <td>
                  <strong>Gross Salary</strong>
                </td>
                <td>
                  <strong>{salaryIncrease}</strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <p>
          <i>
            We appreciate your initiative and expect you to take many more such
            responsibilities in future assignments to ensure company’s growth.
          </i>
        </p>

        <div className="mt-5 pt-3">
          <p className="mb-5">With Best Wishes,</p>
          <div className="mt-5 pt-5">
            <p>Authorized Signature</p>
            {!draft &&( <img 
           src={stampImage}
           alt="stampImage"
           style={{ height: "100px", width: "160px" }}/> )}
            <h4>{companyData.companyName},</h4>
            <p>
              {companyData.mobileNo} | {companyData.emailId},
            </p>
            <p>{companyData.companyAddress}.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppraisalTemplate2;
