import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import {
  EmployeeSalaryGetApiById,
  EmployeeSalaryPatchApiById,
} from "../../Utils/Axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../Context/AuthContext";

const EmployeeSalaryUpdate = () => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm({ mode: "onChange" });
  const { user } = useAuth();
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [basicSalary, setBasicSalary] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [incomeTax, setIncomeTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [variableAmount, setVariableAmount] = useState(0);
  const [grossAmount, setGrossAmount] = useState(0);
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [fixedAmount, setFixedAmount] = useState(0);
  const [status, setStatus] = useState("Active");
  const [errorMessage, setErrorMessage] = useState("");
  const [showFields, setShowFields] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [allowances, setAllowances] = useState("");
  const [deductions, setDeductions] = useState("");
  const [totalDeductions, setTotalDeductions] = useState("");
  const [totalTax, setTotalTax] = useState("");
  const [pfTax, setPfTax] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const salaryId = queryParams.get("salaryId");
  const id = queryParams.get("employeeId");

  const companyName = user.company;

  useEffect(() => {
    const monthlySalaryValue = parseFloat(grossAmount || 0) / 12;
    setMonthlySalary(monthlySalaryValue.toFixed(2));
  }, [grossAmount]);

  const handleVariableAmountChange = (e) => {
    setVariableAmount(parseFloat(e.target.value) || 0);
    setValue("variableAmount", e.target.value, { shouldValidate: true });
  };

  const handleFixedAmountChange = (e) => {
    setFixedAmount(parseFloat(e.target.value) || 0);
    setValue("fixedAmount", e.target.value, { shouldValidate: true });
  };

  const fetchSalary = async () => {
    try {
      const response = await EmployeeSalaryGetApiById(id, salaryId);
      const data = response.data.data; // Access the relevant data directly

      setEmployeeId(data.employeeId);
      setSalaryStructures([data]);
      setBasicSalary(data.salaryConfigurationEntity.allowances.basicSalary); // Assuming this is a string percentage
      setVariableAmount(parseFloat(data.variableAmount) || 0);
      setFixedAmount(parseFloat(data.fixedAmount) || 0);
      setGrossAmount(parseFloat(data.grossAmount) || 0);
      setMonthlySalary((parseFloat(data.grossAmount) / 12).toFixed(2)); // Calculate monthly salary
      setStatus(data.status);

      // Set total earnings, deductions, and taxes
      const totalEarnings = parseFloat(data.totalEarnings) || 0;
      const totalDeductions = parseFloat(data.totalDeductions) || 0;
      const totalTax = parseFloat(data.totalTax) || 0;
      const incomeTax = parseFloat(data.incomeTax) || 0;
      const pfTax = parseFloat(data.pfTax) || 0;

      setTotalEarnings(totalEarnings);
      setTotalDeductions(totalDeductions);
      setTotalTax(totalTax);
      setIncomeTax(incomeTax);
      setPfTax(pfTax);

      // Calculate netSalary based on new logic
      const netSalary = totalEarnings - (totalDeductions + totalTax);
      setTotalAmount(netSalary); // Set total amount to netSalary

      setAllowances(data.salaryConfigurationEntity.allowances || {});
      setDeductions(data.salaryConfigurationEntity.deductions || {});
    } catch (error) {
      console.error("API fetch error:", error);
    }
  };

  useEffect(() => {
    fetchSalary();
  }, []);

  const calculateTotal = (values, gross) => {
    let total = 0;
    Object.keys(values).forEach((key) => {
      const value = values[key];
      if (typeof value === "string" && value.includes("%")) {
        total += (parseFloat(value) / 100) * gross;
      } else {
        total += parseFloat(value) || 0;
      }
    });
    return total;
  };

  const handleAllowanceChange = (allowance, value) => {
    // Track if any field has changed
    let fieldChanged = false;
  
    // Validate percentage values
    if (value.endsWith('%')) {
      const numericValue = value.slice(0, -1); // Remove '%' symbol to check numeric value
  
      // Check for negative percentage values
      if (numericValue.startsWith('-')) {
        setErrorMessage("Percentage value cannot be negative.");
        return;
      }
  
      // Check if the percentage exceeds 100%
      if (numericValue && parseFloat(numericValue) > 100) {
        setErrorMessage("Percentage value cannot exceed 100%.");
        return;
      }
  
      // Check if the length exceeds 4 characters (e.g., "100%" is 4 characters)
      if (value.length > 4) {
        setErrorMessage("Percentage value cannot exceed 4 characters (including '%').");
        return;
      }
    }
  
    // Handle validation for numeric fields (maximum 10 digits)
    if (!value.endsWith('%')) {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length > 10) {
        setErrorMessage("Numeric value cannot exceed 10 digits.");
        return;
      }
      if (parseFloat(value) < 0) {
        setErrorMessage("Allowance value cannot be negative.");
        return;
      }
    }
  
    // Clear error message if no errors
    setErrorMessage("");
  
    // Mark field as modified
    fieldChanged = true;
  
    // Update the allowance value
    setValue(`allowances.${allowance}`, value);
  
    // Recalculate total earnings based on new allowance values
    const currentAllowances = getValues("allowances");
  
    // Get the total earnings and total percentage from the current allowances
    const { total, totalPercentage } = calculateTotal(currentAllowances, grossAmount);
  
    // Ensure total and totalPercentage are valid numbers
    if (isNaN(total) || isNaN(totalPercentage)) {
      setErrorMessage("Invalid total or total percentage calculation.");
      return;
    }
  
    // Logic for handling excess allowance percentage
    if (totalPercentage > 100) {
      // Calculate the excess percentage and amount
      const excessAmount = total - grossAmount;
      const excessPercentage = totalPercentage - 100;
  
      // Set the value of otherAllowance with excess values
      if (!isNaN(excessAmount) && !isNaN(excessPercentage)) {
        setValue("otherAllowance", `${excessAmount.toFixed(2)} (Excess: ${excessPercentage.toFixed(2)}% of Gross)`);
      } else {
        setErrorMessage("Invalid excess amount or percentage.");
        return;
      }
    } else {
      // Otherwise, just set the value of otherAllowance with total and percentage
      if (!isNaN(total) && !isNaN(totalPercentage)) {
        setValue("otherAllowance", `${total.toFixed(2)} (Total: ${totalPercentage.toFixed(2)}% of Gross)`);
      } else {
        setErrorMessage("Invalid total or total percentage.");
        return;
      }
    }
  
    // Check if total earnings exceed gross amount
    if (total > grossAmount) {
      setErrorMessage("Total earnings cannot exceed the gross salary.");
      return;
    }
  
    // Update the total earnings state
    setTotalEarnings(total);
  
    // Display error message if totalEarnings is not equal to grossAmount
    if (totalEarnings !== grossAmount) {
      setErrorMessage("Total earnings must match the gross salary.");
      return;
    }
  
    // Optionally, if any field was changed, set a flag for the UI or further processing
    if (fieldChanged) {
      // Show a "Saving..." indicator or any UI update
      console.log("Changes have been made, saving...");
  
      // You can also enable the submit button here
      // setIsSubmitDisabled(false); // Enable submit button
  
      // If needed, trigger an API call or other operations
      // saveChangesToServer(); // Call an API or perform other operations
    }
  };
  

  const handleDeductionChange = (deduction, value) => {
     // Check if the value is a percentage and validate
  if (value.endsWith('%')) {
    const numericValue = value.slice(0, -1); // Remove '%' symbol to check numeric value
    if (numericValue && parseFloat(numericValue) > 100) {
      setErrorMessage("Percentage value cannot exceed 100%.");
      return; // Prevent deduction if percentage exceeds 100%
    }
    if (value.length > 4) { // E.g., "100%" is 4 characters
      setErrorMessage("Percentage value cannot exceed 100% (4 characters including '%').");
      return; // Prevent deduction if the length exceeds "100%"
    }
    // Check for negative percentage values
    if (numericValue.startsWith('-')) {
      setErrorMessage("Percentage value cannot be negative.");
      return; // Prevent the change if the value is negative
    }
  }

  // Check if it's a plain number and validate
  if (!value.endsWith('%')) {
    const numericValue = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (numericValue.length > 10) {
      setErrorMessage("Numeric value cannot exceed 10 digits.");
      return; // Prevent deduction if number exceeds 10 digits
    }
    if (parseFloat(value) < 0) {
      setErrorMessage("Deduction value cannot be negative.");
      return; // Prevent deduction if value is negative
    }
  }

  // Clear any previous error message
  setErrorMessage("");
    setValue(`deductions.${deduction}`, value);
    const currentDeductions = getValues("deductions");
    const newTotalDeductions = calculateTotal(currentDeductions, grossAmount);
     // Validate if total deductions exceed total earnings or gross salary
  if (newTotalDeductions > totalEarnings) {
    setErrorMessage("Total deductions cannot exceed total earnings.");
    return; // Prevent update if deductions exceed total earnings
  }

  if (newTotalDeductions > grossAmount) {
    setErrorMessage("Total deductions cannot exceed gross salary.");
    return; // Prevent update if deductions exceed gross salary
  }

    setTotalDeductions(newTotalDeductions);
  };

  const calculateTotalTax = () => {
    const newTotalTax = pfTax + incomeTax;
    setTotalTax(newTotalTax);
  };

  // Handle changes for PF tax
  const handlePfTaxChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setPfTax(value);
  };

  // Handle changes for Income tax
  const handleIncomeTaxChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setIncomeTax(value);
  };

  // Recalculate totalTax whenever pfTax or incomeTax changes
  useEffect(() => {
    calculateTotalTax();
  }, [pfTax, incomeTax]);

  useEffect(() => {
    const newNetSalary = totalEarnings - (totalDeductions + totalTax);
    setTotalAmount(newNetSalary);
  }, [totalEarnings, totalDeductions, totalTax]);

  const onSubmit = (data) => {
    if (Object.values(data).every((value) => value === 0 || value === "")) {
      return;
    }
    const postData = {
      companyName,
      basicSalary,
      fixedAmount,
      variableAmount,
      grossAmount,
      totalEarnings,
      salaryConfigurationRequest: {
        allowances: data.allowances || {}, // Pass the updated allowances from the form
        deductions: data.deductions || {}, // Pass the updated deductions from the form
      },
      netSalary: totalAmount,
      incomeTax: incomeTax,
      status: data.status,
      ...data,
    };
    EmployeeSalaryPatchApiById(id, salaryId, postData)
      .then((response) => {
        toast.success("Employee Salary Updated Successfully");
        setErrorMessage("");
        setShowFields(false);
        navigate("/employeeview");
      })
      .catch((error) => {
        handleApiErrors(error);
      });
  };

  const handleApiErrors = (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error &&
      error.response.data.error.message
    ) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error !");
    }
    console.error(error.response);
  };

  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
            <div className="col">
              <h1 className="h3 mb-3">
                <strong>Salary View</strong>
              </h1>
            </div>
            <div className="col-auto" style={{ paddingBottom: "20px" }}>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to="/main">Home</Link>
                  </li>
                  <li className="breadcrumb-item active">Salary View</li>
                </ol>
              </nav>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title" style={{marginBottom:"0px"}}> Salary Details </h5>
                  
                </div>
                <div className=" card-body row">
                  <div className="col-md-5 mb-3">
                    <label className="form-label">Variable Amount</label>
                    <input
                      id="variableAmount"
                      type="text"
                      className="form-control"
                      autoComplete="off"
                      maxLength={10}
                      readOnly
                      value={Math.floor(variableAmount)}
                      onChange={handleVariableAmountChange}
                    />
                    {errors.variableAmount && (
                      <div className="errorMsg">
                        {errors.variableAmount.message}
                      </div>
                    )}
                  </div>
                  <div className="col-md-1 mb-3"></div>
                  <div className="col-md-5 mb-3">
                    <label className="form-label">
                      Fixed Amount<span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      autoComplete="off"
                      maxLength={10}
                      readOnly
                      value={Math.floor(fixedAmount)}
                      onChange={handleFixedAmountChange}
                    />
                    {errors.fixedAmount && (
                      <div className="errorMsg">
                        {errors.fixedAmount.message}
                      </div>
                    )}
                  </div>
                  <div className="col-md-5 mb-3">
                    <label className="form-label">
                      Gross Amount<span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      autoComplete="off"
                      value={Math.floor(grossAmount)}
                      readOnly
                    />
                  </div>
                  <div className="col-md-1 mb-3"></div>
                  <div className="col-md-5 mb-3">
                    <label className="form-label">
                      Monthly Salary<span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={Math.floor(monthlySalary)}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              {salaryStructures.map((structure, index) => {
                const isReadOnly = structure.status === "InActive";
                return (
                  <div key={structure.salaryId} className="col-12 mb-4">
                    <div className="row">
                      <div className="col-6">
                        <div className="card">
                          <div className="card-header">
                            <h5 className="card-title">Allowances</h5>
                            
                          </div>
                          <div className="card-body">
                          {structure.salaryConfigurationEntity?.allowances &&
                              Object.keys(structure.salaryConfigurationEntity.allowances).length > 0 ? (
                                Object.keys(structure.salaryConfigurationEntity.allowances).map((allowance) => {
                                  const allowanceValue = structure.salaryConfigurationEntity.allowances[allowance];
                                  const isPercentage = typeof allowanceValue === "string" && allowanceValue.includes("%");
                                  let displayValue = allowanceValue;

                                  if (!isPercentage) {
                                    displayValue = Math.floor(allowanceValue);
                                  }
                                  const maxLength = 10;

                                  return (
                                    <div key={allowance} className="mb-2">
                                      <label className="form-label">{formatFieldName(allowance)}</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        readOnly={isReadOnly}
                                        defaultValue={displayValue}
                                        {...register(`allowances.${allowance}`, {
                                          required: "Value is required",
                                          pattern: {
                                            value: isPercentage ? /^\d{1,9}%$/ : /^\d{1,10}$/,
                                            message: "This field accepts up to 10 digits, with an optional '%' at the end",
                                          },
                                        })}
                                        maxLength={maxLength}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          handleAllowanceChange(allowance, value);
                                        }}
                                      />
                                      {errors.allowances?.[allowance] && (
                                        <p className="text-danger">
                                          {errors.allowances[allowance]?.message}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <p>No allowances found.</p>
                              )}

                            <div className="col-12" style={{ marginTop: "10px" }}>
                              <label className="form-label">
                                Total Earnings
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={totalEarnings}
                                readOnly
                              />
                            </div>
                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                          </div>
                        </div>
                        <div className="card">
                        <div className="card-header">
                          <h5 className="card-title">Status</h5>
                          
                        </div>
                        <div className="card-body col-12">
                          <label className="form-label">
                            Status<span style={{ color: "red" }}>*</span>
                          </label>
                          <Controller
                            name="status"
                            control={control}
                            defaultValue={status}
                            disabled={status === "InActive"}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={[
                                  { value: "Active", label: "Active" },
                                  { value: "InActive", label: "InActive" },
                                ]}
                                value={
                                  field.value
                                    ? {
                                        value: field.value,
                                        label: ["Active", "InActive"].find(
                                          (option) => option === field.value
                                        ),
                                      }
                                    : null
                                }
                                onChange={(val) => field.onChange(val.value)}
                                placeholder="Select Status"
                              />
                            )}
                          />
                          {errors.status && (
                            <p className="errorMsg">Status is Required</p>
                          )}
                        </div>
                      </div>
                      </div>

                      <div className="col-6">
                        <div className="card">
                          <div className="card-header">
                            <h5 className="card-title">Deductions</h5>
                            
                          </div>
                          <div className="card-body">
                          {Object.keys(deductions).length > 0 ? (
                              Object.keys(deductions).map((deduction) => {
                                const deductionValue = deductions[deduction] || "";
                                return (
                                  <div key={deduction}>
                                    <label>{deduction}</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      {...register(`deductions.${deduction}`, {
                                        required: "Value is required",
                                        pattern: {
                                          value: deductionValue.includes("%")
                                            ? /^\d{1,9}%$/
                                            : /^\d{1,10}$/,
                                          message: "This field accepts up to 10 digits, with an optional '%' at the end",
                                        },
                                      })}
                                      defaultValue={deductionValue}
                                      onChange={(e) => handleDeductionChange(deduction, e.target.value)}
                                    />
                                    {errors.deductions?.[deduction] && (
                                      <p>{errors.deductions[deduction]?.message}</p>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <p>No Deductions found.</p>
                            )}

                            <div className="col-12" style={{ marginTop: "10px" }}>
                              <label className="form-label">Total Deductions</label>
                              <input
                                type="text"
                                className="form-control"
                                value={totalDeductions}
                                readOnly
                              />
                              {errorMessage && <p className="text-danger">{errorMessage}</p>}
                            </div>
                            <div
                              className="col-12"
                              style={{ marginTop: "10px" }}
                            >
                              <label className="form-label">PF Tax</label>
                              <input
                                type="text"
                                className="form-control"
                                value={pfTax}
                                maxLength={10}
                                onChange={handlePfTaxChange}
                              />
                            </div>
                            <div
                              className="col-12"
                              style={{ marginTop: "10px" }}
                            >
                              <label className="form-label">Income Tax</label>
                              <input
                                type="text"
                                className="form-control"
                                value={incomeTax}
                                maxLength={10}
                                onChange={handleIncomeTaxChange}
                              />
                            </div>
                            <div
                              className="col-12"
                              style={{ marginTop: "10px" }}
                            >
                              <label className="form-label">
                                Total Tax
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={totalTax}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                        <div className="card">
                          <div className="card-header">
                            <h5 className="card-title">Net Salary</h5>
                            
                          </div>
                          <div className="card-body col-12">
                            <label className="form-label">
                              Total Amount
                              <span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={Math.floor(totalAmount)}
                              readOnly
                            />
                          </div>
                        </div>
                        <div
                        className="text-end"
                        style={{ marginTop: "40px" }}
                      >
                        <button type="submit" className="btn btn-danger">
                          Update
                        </button>
                      </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </div>
    </LayOut>
  );
};

export default EmployeeSalaryUpdate;