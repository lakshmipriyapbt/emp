import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../Context/AuthContext";
import LayOut from "../../../LayOut/LayOut";
import {
  companyViewByIdApi,
  EmployeeGetApiById,
  EmployeePayslipResponse,
  EmployeePayslipUpdate,
} from "../../../Utils/Axios";
import Loader from "../../../Utils/Loader";

const PayslipUpdate2 = () => {
  const {
    register,
    getValues,
    trigger,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const [companyData, setCompanyData] = useState({});
  const [allowanceFields, setAllowanceFields] = useState([]);
  const [deductionFields, setDeductionFields] = useState([]);
  const [taxFields, setTaxFields] = useState([{ label: "New Tax", value: 0 }]);
  const [newFieldName, setNewFieldName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [payslipData, setPayslipData] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [netPayError, setNetPayError] = useState("");
  const [otherAllowanceError, setOtherAllowanceError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [totals, setTotals] = useState({
    totalEarnings: 0,
    totalDeductions: 0,
    totalTax: 0,
  });
  const [errorMessages, setErrorMessages] = useState({
    deductions: "",
    taxes: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const employeeId = queryParams.get("employeeId");
  const payslipId = queryParams.get("payslipId");
  const salaryId = queryParams.get("salaryId");
  const month = queryParams.get("month");
  const year = queryParams.get("year");
  const { user, logoFileName } = useAuth();

  const fetchCompanyData = async (companyId) => {
    try {
      const response = await companyViewByIdApi(companyId);
      setCompanyData(response.data);
    } catch (err) {
      console.error("Error fetching company data:", err);
      toast.error("Failed to fetch company data");
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await EmployeeGetApiById(employeeId);
      setEmployeeDetails(response.data);
      if (response.data.companyId) {
        await fetchCompanyData(response.data.companyId);
      }
    } catch (err) {
      console.error("Error fetching employee details:", err);
      toast.error("Failed to fetch employee details");
    }
  };
  const fetchPayslipData = async () => {
    if (!month || !year) return;
    try {
      const payload = {
        companyName: user.company,
        month,
        year,
      };
      const response = await EmployeePayslipResponse(salaryId, payload);
      const generatedPayslips = response.data?.data?.generatePayslip || [];
      if (generatedPayslips.length) {
        // Find the specific payslip based on the salaryId or employeeId
        const selectedPayslip = generatedPayslips.find(
          (payslip) =>
            payslip.salaryId === salaryId || payslip.employeeId === employeeId
        );
        if (selectedPayslip) {
          setPayslipData(selectedPayslip);
        } else {
          toast.error("Payslip not found for the selected employee.");
        }
      } else {
        toast.error("No payslip data available");
      }
    } catch (err) {
      console.error("Error fetching payslip data:", err);
      toast.error("Failed to fetch payslip data");
    }
  };

  const handleUpdate = async () => {
    if (employeeId && payslipId) {
      try {
        console.log("Using latest totals:", totals);

        const allowances =
          payslipData.salary.salaryConfigurationEntity.allowances || {};

        const updatedAllowances = {
          ...allowances,
          ...allowanceFields.reduce((acc, field) => {
            acc[field.label] = Number(field.value);
            return acc;
          }, {}),
        };

        // Recalculate the total of all allowances except "Other Allowances"
        const totalAllowances = Object.entries(updatedAllowances)
          .filter(([key]) => key !== "Other Allowances")
          .reduce((total, [, amount]) => total + (Number(amount) || 0), 0);

        const grossAmount = payslipData.salary.grossAmount || 0;
        let updatedOtherAllowance = grossAmount / 12 - totalAllowances;
        console.log("updatedOtherAllowance", updatedOtherAllowance);

        if (updatedOtherAllowance < 0) {
          setOtherAllowanceError("Other Allowance cannot be negative.");
          console.log(
            "Other Allowance cannot be negative.",
            updatedOtherAllowance
          );

          return; // Stop the update process if the value is negative
        } else {
          setOtherAllowanceError(""); // Clear the error if the allowance is valid
        }
        // Update the "Other Allowances" in the allowances object
        updatedAllowances["Other Allowances"] =
          updatedOtherAllowance.toString();

        // Create the payload to send to the server
        const payload = {
          companyName: user.company,
          salary: {
            ...payslipData.salary,
            salaryConfigurationEntity: {
              ...payslipData.salary.salaryConfigurationEntity,
              allowances: updatedAllowances, // Pass updated allowances including the calculated "Other Allowance"
            },
            totalEarnings: totals.totalEarnings, // Latest total earnings
            totalDeductions: totals.totalDeductions, // Latest total deductions
            totalTax: totals.totalTax, // Latest total tax
            netSalary: totals.netPay, // Latest net salary
          },
          attendance: payslipData.attendance,
          month,
          year,
          updatedOtherAllowance, // Include updatedOtherAllowance in the payload
        };

        console.log("Payload being sent:", payload);

        await EmployeePayslipUpdate(employeeId, payslipId, payload);
        toast.success("Payslip updated successfully");
        navigate("/payslipsList");
      } catch (err) {
        console.error("Error updating payslip:", err);
        toast.error("Failed to update payslip");
      }
    } else {
      console.error("Employee ID or Payslip ID is missing");
      toast.error("Missing Employee ID or Payslip ID");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (employeeId) {
        await fetchEmployeeDetails(employeeId);
      }
      if (month && year && user.company) {
        await fetchPayslipData();
      }
      setLoading(false);
    };
    fetchData();
  }, [employeeId, month, year, user.company]);

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (payslipData) {
      const allowances =
        payslipData.salary.salaryConfigurationEntity.allowances || {};
      const totalEarnings = Object.values(allowances).reduce(
        (total, amount) => total + Number(amount || 0),
        0
      );

      const additionalAllowancesTotal = allowanceFields.reduce(
        (total, field) => total + Number(field.value || 0),
        0
      );
      const totalEarningsIncludingAddedFields =
        totalEarnings + additionalAllowancesTotal;

      const deductions =
        payslipData.salary.salaryConfigurationEntity.deductions || {};
      const totalDeductions =
        Object.values(deductions).reduce(
          (total, amount) => total + Number(amount || 0),
          0
        ) +
        Number(payslipData.salary.lop || 0) +
        deductionFields.reduce(
          (total, field) => total + Number(field.value || 0),
          0
        );

      const pfTax = Number(payslipData.salary.pfTax || 0);
      const incomeTax = Number(payslipData.salary.incomeTax || 0);
      const additionalTaxTotal = taxFields.reduce(
        (total, field) => total + Number(field.value || 0),
        0
      );
      const totalTax = pfTax + incomeTax + additionalTaxTotal;
      const grossAmount = payslipData.salary.grossAmount || 0;
      const otherAllowances = payslipData.salary.otherAllowances || 0;
      let otherAllowance = 0;
        const updatedAllowances = {
          ...allowances,
          ...allowanceFields.reduce((acc, field) => {
            acc[field.label] = Number(field.value);
            return acc;
          }, {}),
        };
      const totalAllowances = Object.entries(updatedAllowances)
      .filter(([key]) => key !== "Other Allowances")
      .reduce((total, [, amount]) => total + (Number(amount) || 0), 0);
      let updatedOtherAllowance = grossAmount / 12 - totalAllowances;
      console.log("updatedOtherAllowance", updatedOtherAllowance);

      if (otherAllowances) {
        otherAllowance =
          grossAmount / 12 - totalEarnings > 0
            ? grossAmount / 12 - totalEarnings
            : 0;
      }
      const netPay =
        totalEarningsIncludingAddedFields - totalDeductions - totalTax;

      // if (totalDeductions + totalTax > totalEarningsIncludingAddedFields) {
      //   setValidationError('Total Deductions & Total Taxes and cannot exceed Total Earnings');
      // } else {
      //   setValidationError('');
      // }

      if (updatedOtherAllowance < 0) {
        setOtherAllowanceError("Other Allowance cannot be negative.");
        console.log(
          "Other Allowance cannot be negative.",
          updatedOtherAllowance
        );
      } else {
        setOtherAllowanceError(""); // Clear the error if the allowance is valid
      }

      if (netPay < 0) {
        setNetPayError("Net Pay cannot be Negative.");
      } else {
        setNetPayError("");
      }

      setTotals({
        totalEarnings: totalEarningsIncludingAddedFields,
        totalDeductions,
        totalTax,
        netPay,
      });
    }
  }, [payslipData, allowanceFields, deductionFields, taxFields]);

  validationError && (
    <div style={{ color: "red", margin: "10px 0" }}>{validationError}</div>
  );
  const backForm = () => {
    reset();
    navigate("/payslipGeneration");
  };

  if (loading) {
    return (
      <LayOut>
        <div className="text-center">
          <Loader />
        </div>
      </LayOut>
    );
  }

  if (!payslipData) {
    return (
      <LayOut>
        <div className="text-center">No payslip data available</div>
      </LayOut>
    );
  }

  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const handleAllowanceChange = (key, newValue) => {
    setPayslipData((prevData) => {
      const oldAllowances =
        prevData.salary.salaryConfigurationEntity.allowances || {};
      const oldValue = oldAllowances[key] || 0;
      const newValueNumber = parseInt(newValue) || 0;

      // Calculate the difference
      const allowanceDifference = newValueNumber - oldValue;

      // Update the changed allowance
      const newAllowances = {
        ...oldAllowances,
        [key]: newValueNumber,
      };

      // Adjust "Other Allowances" based on the difference
      let otherAllowance = Number(newAllowances["Other Allowances"]);
      otherAllowance -= allowanceDifference; // Borrow or add the difference

      // Ensure "Other Allowances" doesn't go negative
      // if (otherAllowance < 0) otherAllowance = 0;

      // Update the "Other Allowances" field
      newAllowances["Other Allowances"] = otherAllowance.toString();

      return {
        ...prevData,
        salary: {
          ...prevData.salary,
          salaryConfigurationEntity: {
            ...prevData.salary.salaryConfigurationEntity,
            allowances: newAllowances,
          },
        },
      };
    });
  };

  const handleDeductionChange = (key, value) => {
    setPayslipData((prevData) => {
      const newDeductions = {
        ...prevData.salary.salaryConfigurationEntity.deductions,
        [key]: value,
      };

      return {
        ...prevData,
        salary: {
          ...prevData.salary,
          salaryConfigurationEntity: {
            ...prevData.salary.salaryConfigurationEntity,
            deductions: newDeductions,
          },
        },
      };
    });
  };

  const handleLopChange = (value) => {
    setPayslipData((prevData) => ({
      ...prevData,
      salary: {
        ...prevData.salary,
        lop: value,
      },
    }));
  };

  const handlePfTaxChange = (value) => {
    setPayslipData((prevData) => ({
      ...prevData,
      salary: {
        ...prevData.salary,
        pfTax: value,
      },
    }));
  };

  const handleIncomeTaxChange = (value) => {
    setPayslipData((prevData) => ({
      ...prevData,
      salary: {
        ...prevData.salary,
        incomeTax: value,
      },
    }));
  };

  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position
    // Remove leading spaces
    value = value.replace(/^\s+/g, "");
    // Ensure only alphabets and spaces are allowed
    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
    value = value
      .split("")
      .filter((char) => allowedCharsRegex.test(char))
      .join("");
    // Capitalize the first letter of each word
    const words = value.split(" ");
    // Capitalize the first letter of each word and lowercase the rest
    const capitalizedWords = words.map((word) => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return "";
    });
    let formattedValue = capitalizedWords.join(" ");
    if (formattedValue.length > 3) {
      formattedValue =
        formattedValue.slice(0, 3) +
        formattedValue.slice(3).replace(/\s+/g, " ");
    }
    input.value = formattedValue;
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    if (value.trim() !== "") {
      return;
    }
    if (e.keyCode === 32) {
      e.preventDefault();
    }
  };

  const handleCloseNewFieldModal = () => {
    setNewFieldName("");
    setShowModal(false);
    reset();
    setErrorMessage("");
  };

  const addField = (fieldName, initialValue) => {
    if (modalType === "allowances") {
      if (!allowanceFields.some((field) => field.label === fieldName)) {
        setAllowanceFields((prev) => [
          ...prev,
          { label: fieldName, value: initialValue },
        ]);
      }
    } else if (modalType === "deductions") {
      if (!deductionFields.some((field) => field.label === fieldName)) {
        setDeductionFields((prev) => [
          ...prev,
          { label: fieldName, value: initialValue },
        ]);
      }
    }
    setInputValue("");
    setShowModal(false);
  };

  const isButtonDisabled = !!netPayError;

  return (
    <LayOut>
      <div className="container mt-4">
        <div className="card">
          <div
            className="card-header mt-4"
            style={{
              background: "none",
              padding: "0px 25px",
              borderBottomWidth: "0px",
            }}
          >
            <div
              className="header-content mt-4"
              style={{
                textAlign: "center",
                alignItems: "center",
                backgroundColor: "#9EEAF9",
                border: "1px solid black",
                borderBottom: "none",
              }}
            >
              <div style={{ paddingTop: "20px" }}>
                {logoFileName ? (
                  <img
                    className="align-middle"
                    src={logoFileName}
                    alt="Logo"
                    style={{ height: "80px", width: "180px" }}
                  />
                ) : (
                  <p>Logo</p>
                )}
              </div>
              <div
                className="company-details text-center"
                style={{ padding: "2px" }}
              >
                <h6>{companyData.companyAddress}.</h6>
                <h6>{companyData.mobileNo}</h6>
                <h6>{companyData.emailId}</h6>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", margin: "0px 25px" }}>
            <h3
              style={{
                marginBottom: "0px",
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
              }}
            >
              SALARY SLIP
            </h3>
          </div>
          <div className="card-body" style={{ padding: "0px 25px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                textAlign: "center",
                backgroundColor: "#9EEAF9",
                paddingTop: "10px",
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
              }}
            >
              <h4 style={{ textAlign: "center", paddingLeft: "130px" }}>
                Employee Details
              </h4>
              <h4 style={{ textAlign: "center", marginRight: "130px" }}>
                Month - Year:{payslipData.month} - {payslipData.year}
              </h4>
            </div>
            <div
              className="salary-details"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div
                  style={{ flex: 1, borderRight: "none", borderBottom: "none" }}
                >
                  <ul
                    style={{
                      listStyleType: "none",
                      padding: 0,
                      marginBottom: "2px",
                    }}
                  >
                    <li
                      style={{
                        display: "flex",
                        padding: "4px 8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          paddingRight: "35%",
                        }}
                      >
                        <b>EmployeeId</b>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          marginRight: "15px",
                          paddingTop: "10px",
                        }}
                      >
                        {employeeDetails.employeeId}
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        padding: "4px 8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          paddingRight: "35%",
                        }}
                      >
                        <b>Department</b>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          marginRight: "15px",
                          paddingTop: "10px",
                        }}
                      >
                        {employeeDetails.departmentName}
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        padding: "4px 8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          paddingRight: "35%",
                        }}
                      >
                        <b>Designation</b>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          marginRight: "15px",
                          paddingTop: "10px",
                        }}
                      >
                        {employeeDetails.designationName}
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        padding: "4px 8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          paddingRight: "35%",
                        }}
                      >
                        <b>Bank ACC No</b>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          marginRight: "15px",
                          paddingTop: "10px",
                        }}
                      >
                        {employeeDetails.accountNo}
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        padding: "4px 8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          paddingRight: "35%",
                        }}
                      >
                        <b>Total Days</b>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          marginRight: "15px",
                          paddingTop: "10px",
                        }}
                      >
                        {payslipData.attendance?.totalWorkingDays || 0}
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        padding: "4px 8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          paddingRight: "35%",
                        }}
                      >
                        <b>LOP Days</b>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          marginRight: "15px",
                        }}
                      >
                        {(payslipData.attendance?.totalWorkingDays || 0) -
                          (payslipData.attendance?.noOfWorkingDays || 0)}
                      </span>
                    </li>
                  </ul>
                </div>
                <div
                  style={{ flex: 1, borderBottom: "none", overflow: "hidden" }}
                >
                  <ul
                    style={{
                      listStyleType: "none",
                      padding: 0,
                      marginBottom: "2px",
                    }}
                  >
                    <li
                      style={{
                        display: "flex",
                        padding: "4px 8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          paddingRight: "35%",
                        }}
                      >
                        <b>Name</b>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          marginRight: "15px",
                          paddingTop: "10px",
                        }}
                      >
                        {" "}
                        {employeeDetails.firstName} {employeeDetails.lastName}
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        padding: "4px 8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          paddingRight: "35%",
                        }}
                      >
                        <b>PAN</b>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          marginRight: "15px",
                          paddingTop: "10px",
                        }}
                      >
                        {employeeDetails.panNo}
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        padding: "4px 8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          paddingRight: "35%",
                        }}
                      >
                        <b>UAN</b>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          marginRight: "15px",
                          paddingTop: "10px",
                        }}
                      >
                        {employeeDetails.uanNo}
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        padding: "4px 8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          paddingRight: "35%",
                        }}
                      >
                        <b>IFSC</b>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          marginRight: "15px",
                          paddingTop: "10px",
                        }}
                      >
                        {employeeDetails.ifscCode}
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        padding: "4px 8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          paddingRight: "35%",
                        }}
                      >
                        <b>Worked Days</b>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          marginRight: "15px",
                          paddingTop: "10px",
                        }}
                      >
                        {payslipData.attendance?.noOfWorkingDays || 0}
                      </span>
                    </li>
                    <li
                      style={{
                        display: "flex",
                        padding: "4px 8px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          paddingTop: "10px",
                          paddingRight: "35%",
                        }}
                      >
                        <b>Date of Birth</b>
                      </span>
                      <span
                        style={{
                          flex: 1,
                          color: "black",
                          marginRight: "15px",
                          paddingTop: "10px",
                        }}
                      >
                        {employeeDetails.dateOfBirth}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="salary-details">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div
                  style={{
                    flex: 1,
                    border: "1px solid black",
                    borderRight: "none",
                    borderBottom: "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                      borderBottom: "1px solid black",
                    }}
                  >
                    <p
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "15px",
                        color: "black",
                        margin: 0,
                      }}
                    >
                      Earnings
                    </p>
                    <p
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "15px",
                        color: "black",
                        margin: 0,
                        paddingRight: "15px",
                      }}
                    >
                      Amount
                    </p>
                  </div>
                  <ul
                    style={{
                      listStyleType: "none",
                      padding: 0,
                      marginBottom: "2px",
                    }}
                  >
                    {Object.entries(
                      payslipData.salary?.salaryConfigurationEntity
                        ?.allowances || {}
                    ).map(([key, value]) => (
                      <li
                        key={key}
                        style={{
                          display: "flex",
                          padding: "4px 8px",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ flex: 1, color: "black" }}>
                          {formatFieldName(key)}
                        </span>
                        <input
                          type="text"
                          value={Math.floor(value)} // Display the value (round it if needed)
                          onChange={(e) => {
                            const newValue = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                            if (newValue.length <= 6) {
                              const oldValue = Math.floor(value);
                              const adjustment = parseInt(newValue) - oldValue;

                              // Handle change for the general allowance fields
                              handleAllowanceChange(key, newValue);

                              // If "Other Allowances" is modified, prevent further manual input
                              if (key === "Other Allowances") {
                                const updatedOtherAllowance = Math.max(
                                  0,
                                  parseInt(newValue)
                                ); // Prevent negative values
                                const updatedAllowances = {
                                  ...payslipData.salary
                                    .salaryConfigurationEntity.allowances,
                                  "Other Allowances":
                                    updatedOtherAllowance.toString(),
                                };

                                // Update "Other Allowances" in the state
                                handleAllowanceChange(
                                  "Other Allowances",
                                  updatedAllowances
                                );
                              } else {
                                // For other fields, handle normally
                              }
                            }
                          }}
                          style={{
                            width: "100px",
                            border: "none",
                            textAlign: "right",
                          }}
                          readOnly={key === "Other Allowances"}
                        />
                      </li>
                    ))}
                    {allowanceFields.map((field, index) => (
                      <li
                        key={`new-allowance-${field.label}-${index}`}
                        style={{
                          display: "flex",
                          padding: "4px 8px",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ flex: 1, color: "black" }}>
                          {field.label}
                        </span>
                        <span style={{ color: "black" }}>{field.value}</span>
                      </li>
                    ))}
                  </ul>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                    }}
                  >
                    <span style={{ color: "black" }}>Total Earnings (A)</span>
                    <span style={{ color: "black" }}>
                      {Math.floor(totals.totalEarnings)}
                    </span>
                  </div>
                  {otherAllowanceError && (
                    <div
                      style={{
                        color: "red",
                        marginTop: "5px",
                        marginLeft: "10px",
                      }}
                    >
                      {otherAllowanceError}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setModalType("allowances");
                      setShowModal(true);
                    }}
                    className="btn btn-primary mt-2 mb-2"
                    style={{ marginLeft: "8px" }}
                  >
                    Add Allowance
                  </button>
                </div>
                <div
                  style={{
                    flex: 1,
                    border: "1px solid black",
                    borderBottom: "none",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                      borderBottom: "1px solid black",
                    }}
                  >
                    <p
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "15px",
                        color: "black",
                        margin: 0,
                      }}
                    >
                      Deductions
                    </p>
                    <p
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "15px",
                        color: "black",
                        margin: 0,
                        paddingRight: "15px",
                      }}
                    >
                      Amount
                    </p>
                  </div>
                  <ul
                    style={{
                      listStyleType: "none",
                      padding: 0,
                      marginBottom: "2px",
                    }}
                  >
                    {Object.entries(
                      payslipData.salary?.salaryConfigurationEntity
                        ?.deductions || {}
                    ).map(([key, value]) => (
                      <li
                        key={key}
                        style={{
                          display: "flex",
                          padding: "4px 8px",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ flex: 1, color: "black" }}>
                          {formatFieldName(key)}
                        </span>
                        <input
                          type="text"
                          value={Math.floor(value)}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                            if (newValue.length <= 6) {
                              handleDeductionChange(key, newValue);
                            }
                          }}
                          style={{
                            width: "100px",
                            border: "none",
                            textAlign: "right",
                          }}
                        />
                      </li>
                    ))}
                    {deductionFields.map((field, index) => (
                      <li
                        key={`new-deduction-${field.label}-${index}`}
                        style={{
                          display: "flex",
                          padding: "4px 8px",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ flex: 1, color: "black" }}>
                          {field.label}
                        </span>
                        <span
                          style={{
                            color: "black",
                          }}
                        >
                          {field.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0px 8px 4px 8px",
                    }}
                  >
                    <span style={{ color: "black" }}>LOP</span>
                    <input
                      type="text"
                      value={Math.floor(payslipData.salary.lop)}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/[^0-9]/g, "");
                        if (newValue.length <= 6) {
                          handleLopChange(newValue);
                        }
                      }}
                      style={{
                        width: "100px",
                        border: "none",
                        textAlign: "right",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                    }}
                  >
                    <span style={{ color: "black" }}>Total Deductions (B)</span>
                    <span style={{ color: "black" }}>
                      {Math.floor(totals.totalDeductions)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setModalType("deductions");
                      setShowModal(true);
                    }}
                    className="btn btn-primary mt-2 mb-2"
                    style={{ marginLeft: "8px" }}
                  >
                    Add Deduction
                  </button>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                      borderTop: "1px solid black",
                      borderBottom: "1px solid black",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: "bold",
                        color: "black",
                        marginBottom: "0px",
                      }}
                    >
                      Taxes
                    </p>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: "bold",
                        color: "black",
                        marginBottom: "0px",
                        paddingRight: "15px",
                      }}
                    >
                      Amount
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                    }}
                  >
                    <span style={{ color: "black" }}>Income Tax</span>
                    <input
                      type="text"
                      value={Math.floor(payslipData.salary.incomeTax)}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/[^0-9]/g, "");
                        if (newValue.length <= 6) {
                          handleIncomeTaxChange(newValue);
                        }
                      }}
                      style={{
                        width: "100px",
                        border: "none",
                        textAlign: "right",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                    }}
                  >
                    <span style={{ color: "black" }}>Pf Tax</span>
                    <input
                      type="text"
                      value={Math.floor(payslipData.salary.pfTax)}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/[^0-9]/g, "");
                        if (newValue.length <= 6) {
                          handlePfTaxChange(newValue);
                        }
                      }}
                      style={{
                        width: "100px",
                        border: "none",
                        textAlign: "right",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                    }}
                  >
                    <span style={{ color: "black" }}>Total Tax (C)</span>
                    <span style={{ color: "black" }}>{totals.totalTax}</span>
                  </div>
                  {errorMessages.deductions && (
                    <div
                      className="error-message"
                      style={{
                        color: "red",
                        marginBottom: "10px",
                        textAlign: "center",
                      }}
                    >
                      <b>{errorMessages.deductions}</b>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td
                        className="earnings"
                        colSpan={1}
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          background: "#9EEAF9",
                          color: "black",
                          border: "1px solid black",
                          width: "25%",
                        }}
                      >
                        <b>Net Pay (A-B-C)</b>
                      </td>
                      <td
                        className="earnings"
                        colSpan={3}
                        style={{ textAlign: "left", border: "1px solid black" }}
                      >
                        <b>{Math.floor(totals.netPay || 0)}</b>
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="earnings"
                        colSpan={1}
                        style={{
                          padding: "4px",
                          textAlign: "left",
                          background: "#9EEAF9",
                          color: "black",
                          border: "1px solid black",
                          width: "25%",
                        }}
                      >
                        <b>Net Salary (in words)</b>
                      </td>
                      <td
                        className="earnings"
                        colSpan={3}
                        style={{ textAlign: "left", border: "1px solid black" }}
                      >
                        <b>{payslipData.inWords || ""}</b>
                      </td>
                    </tr>
                    {netPayError && (
                      <div className="error-message" style={{ color: "red" }}>
                        <b>{netPayError}</b>
                      </div>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <span className="mt-4">
              <em>
                This is a computer-generated payslip and does not require
                authentication
              </em>
            </span>
            <div
              className="bottom"
              style={{
                marginLeft: "50px",
                marginRight: "50px",
                marginTop: "1px",
                paddingBottom: "30px",
              }}
            >
              &nbsp;&nbsp;
            </div>
          </div>
        </div>
        {showModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fade modal show"
            tabIndex="-1"
            style={{ zIndex: "9999", display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <ModalHeader>
                  <ModalTitle className="modal-title">
                    Add New{" "}
                    {modalType === "allowances" ? "Allowance" : "Deduction"}{" "}
                    Field
                  </ModalTitle>
                </ModalHeader>
                <ModalBody>
                  <form>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12">
                          <input
                            type="text"
                            onInput={toInputTitleCase}
                            className="form-control"
                            placeholder={`Enter New ${
                              modalType === "allowances"
                                ? "Allowance"
                                : "Deduction"
                            } Name`}
                            autoComplete="off"
                            {...register("fieldName", {
                              required: "Field name is required",
                              pattern: {
                                value: /^[A-Za-z\s]+$/,
                                message:
                                  "This field accepts only alphabetic characters",
                              },
                              minLength: {
                                value: 2,
                                message: "Minimum 2 characters required",
                              },
                              maxLength: {
                                value: 20,
                                message: "Maximum 20 characters required",
                              },
                            })}
                          />
                          {errors.fieldName && (
                            <p className="errorMsg text-danger">
                              {errors.fieldName.message}
                            </p>
                          )}
                          {errorMessage && (
                            <p className="errorMsg text-danger">
                              {errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="row mt-3">
                        <div className="col-12">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Initial Value"
                            {...register("initialValue", {
                              required: "Initial value is required",
                              validate: {
                                positive: (value) =>
                                  value > 0 || "Value must be positive",
                                maxLength: (value) =>
                                  value.toString().length <= 6 ||
                                  "Maximum 6 digits allowed",
                              },
                            })}
                            onInput={(e) => {
                              const newValue = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              if (newValue.length <= 6) {
                                e.target.value = newValue;
                              }
                            }}
                          />
                          {errors.initialValue && (
                            <p className="errorMsg text-danger">
                              {errors.initialValue.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={async () => {
                          const isValidField = await trigger("fieldName");
                          const isValidValue = await trigger("initialValue");

                          if (!isValidField || !isValidValue) {
                            return;
                          }

                          const fieldName = getValues("fieldName");
                          const initialValue = getValues("initialValue");
                          addField(fieldName, initialValue);
                          handleCloseNewFieldModal();
                        }}
                      >
                        Add Field
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCloseNewFieldModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </ModalBody>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="d-flex justify-content-end align-items-center me-4">
        <button
          className="btn btn-secondary me-2"
          type="button"
          onClick={backForm}
        >
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleUpdate}
          disabled={isButtonDisabled}
        >
          Generate Payslip
        </button>
      </div>
    </LayOut>
  );
};

export default PayslipUpdate2;
