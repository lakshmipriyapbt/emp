import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  AppraisalLetterDownload,
  CompanySalaryStructureGetApi,
  EmployeeGetApi,
  EmployeeSalaryGetApiById,
  EmployeeSalaryPostApi,
  TdsGetApi,
  TemplateGetAPI,
} from "../../../Utils/Axios";
import { useAuth } from "../../../Context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../../Utils/Loader";
import LayOut from "../../../LayOut/LayOut";
import AppraisalPreview from "../../Settings/Appraisal/AppraisalPreview";
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalTitle,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../../../Redux/EmployeeSlice";
import { OverlayTrigger, Popover } from "react-bootstrap";

const AddIncrement = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      tdsType: "new",
      status: "Active",
    },
  });
  const { authUser, company, employee } = useAuth();
  // const date = new Date().toLocaleDateString();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const salaryId = queryParams.get("salaryId");
  const id = queryParams.get("employeeId");
  const [salaryConfigurationId, setSalaryConfigurationId] = useState("");
  const [employes, setEmployes] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState(0);
  const [allowances, setAllowances] = useState({});
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [deductions, setDeductions] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [grossAmount, setGrossAmount] = useState(0);
  const [basicAmount, setBasicAmount] = useState(0);
  const [totalAllowances, setTotalAllowances] = useState({});
  const [totalDeductions, setTotalDeductions] = useState({});
  const [netSalary, setNetSalary] = useState(0);
  const [data, setData] = useState({});
  const [status, setStatus] = useState({});
  const [hra, setHra] = useState(0);
  const [templateAvailable, setTemplateAvailable] = useState(true);
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [lossOfPayPerDay, setLossOfPayPerDay] = useState(0);
  const [showFields, setShowFields] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [variableAmount, setVariableAmount] = useState(0);
  const [fixedAmount, setFixedAmount] = useState(0);
  const [pfTax, setPfTax] = useState(0);
  const [pfEmployee, setPfEmployee] = useState(0);
  const [pfEmployer, setPfEmployer] = useState(0);
  const [travelAllowance, setTravelAllowance] = useState(0);
  const [calculatedPF, setCalculatedPF] = useState(0);
  const [updatedDeductions, setUpdatedDeductions] = useState(0);
  const [finalAllowances, setFinalAllowances] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPF, setSelectedPF] = useState("calculated");
  const [showPfModal, setShowPfModal] = useState(false);
  const [error, setError] = useState("");
  const [showCards, setShowCards] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previousGrossAmount, setPreviousGrossAmount] = useState(0);
  const [hikePercentage, setHikePercentage] = useState(0);
  const [hikeErrorMessage, setHikeErrorMessage] = useState("")
  const [download, setDownload] = useState(false);
  const navigate = useNavigate();
  const prevOtherAllowancesRef = useRef(0);
  const dispatch = useDispatch();
  const [amountInWords, setAmountInWords] = useState('');
  const [grossInWords, setGrossInWords] = useState('');
  const [hikeStartedDate, setHikeStartedDate] = useState('');
  const [selectedTaxRegime, setSelectedTaxRegime] = useState("new");
  const [tdsSlabs, setTdsSlabs] = useState({
    old: [],
    new: []
  });
  const [applicableSlab, setApplicableSlab] = useState(null);
  const [tdsAmount, setTdsAmount] = useState(0);
  const [selectedTdsSlabs, setSelectedTdsSlabs] = useState([]);

  const getCurrentFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  const numberToWords = (num) => {
    const units = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
      "Eighteen", "Nineteen"
    ];
    const tens = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    if (num === 0) return "Zero Rupees Only";

    const convertLessThanHundred = (n) => {
      if (n < 20) return units[n];
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + units[n % 10] : "");
    };

    const convertLessThanThousand = (n) => {
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      return (hundred ? units[hundred] + " Hundred" : "") +
        (remainder ? (hundred ? " " : "") + convertLessThanHundred(remainder) : "");
    };

    const convertLessThanLakh = (n) => {
      const thousand = Math.floor(n / 1000);
      const remainder = n % 1000;
      return (thousand ? convertLessThanThousand(thousand) + " Thousand" : "") +
        (remainder ? (thousand ? " " : "") + convertLessThanThousand(remainder) : "");
    };

    const convertLessThanCrore = (n) => {
      const lakh = Math.floor(n / 100000);
      const remainder = n % 100000;
      return (lakh ? convertLessThanThousand(lakh) + " Lakh" : "") +
        (remainder ? (lakh ? " " : "") + convertLessThanLakh(remainder) : "");
    };

    const convertLessThanHundredCrore = (n) => {
      const crore = Math.floor(n / 10000000);
      const remainder = n % 10000000;
      return (crore ? convertLessThanThousand(crore) + " Crore" : "") +
        (remainder ? (crore ? " " : "") + convertLessThanCrore(remainder) : "");
    };

    const convertLessThanThousandCrore = (n) => {
      const hundredCrore = Math.floor(n / 1000000000);
      const remainder = n % 1000000000;
      return (hundredCrore ? convertLessThanHundred(hundredCrore) + " Hundred" : "") +
        (remainder ? (hundredCrore ? " " : "") + convertLessThanHundredCrore(remainder) : "");
    };

    let integerPart = Math.floor(num);
    let result = convertLessThanThousandCrore(integerPart);

    // Handle decimal (paise)
    let decimalPart = Math.round((num % 1) * 100);
    if (decimalPart > 0) {
      result += " and " + convertLessThanHundred(decimalPart) + " Paise";
    }

    // Add currency suffix
    result += decimalPart === 0 ? " Rupees Only" : " Rupees";

    // Handle edge case where number is between 0 and 1 (only paise)
    if (integerPart === 0 && decimalPart > 0) {
      result = result.replace(" and ", ""); // Remove "and" when no rupees
    }

    return result.trim();
  };

  // Fetch employees from Redux store
  const { data: employees } = useSelector((state) => state.employees);

  // Fetch employees when the component mounts
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (id && salaryId) {
      setShowFields(true);
    } else {
      setShowFields(false);
    }
  }, [id, salaryId]);


  useEffect(() => {
    if (employees) {
      const activeEmployees = employees
        .filter((employee) => employee.status === "Active")
        .map((employee) => ({
          label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
          value: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeId: employee.employeeId,
          designationName: employee.designationName,
          departmentName: employee.departmentName,
          dateOfHiring: employee.dateOfHiring,
          currentGross: employee.currentGross
        }));
      setEmployes(activeEmployees);
    }
  }, [employees]);

  useEffect(() => {
    if (id && salaryId) {
      EmployeeSalaryGetApiById(id, salaryId)
        .then((response) => {
          const data = response.data.data;
          if (data) {
            setEmployeeId(data.employeeId);
            setFixedAmount(parseFloat(data.fixedAmount));
            setVariableAmount(parseFloat(data.variableAmount));
            setGrossAmount(parseFloat(data.grossAmount));
            setStatus(data.status || "");
            setValue("status", data.status || "");
            setShowFields(true);
            setShowCards(true);
            setIsUpdating(true);
            setIsReadOnly(data.status === "InActive");
            calculateAllowances();
          }
        })
        .catch((error) => {
          handleApiErrors(error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setShowCards(false);
    }
  }, [id, salaryId, setValue]);

  const validateAppraisalDate = (value) => {
    const hikeDate = watch("dateOfHiring"); // Ensure this field contains the correct hike date
    if (!hikeDate) return "Hike Date is required to validate the Appraisal Date.";

    if (new Date(value) < new Date(hikeDate)) {
      return "Appraisal Date cannot be before the Hike Date.";
    }
    return true;
  };

  // ✅ Fetch TDS slabs based on financial year and regime
  useEffect(() => {
    const fetchTds = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const financialYear = getCurrentFinancialYear();
        const [startYear, endYear] = financialYear.split('-').map(Number);

        // Fetch all TDS data
        const response = await TdsGetApi();
        const allTdsData = response.data.data;

        // Filter for current financial year
        const currentYearTds = allTdsData.filter(tds =>
          parseInt(tds.startYear) === startYear &&
          parseInt(tds.endYear) === endYear
        );

        // Separate old and new regime slabs
        const newRegimeSlabs = currentYearTds
          .filter(tds => tds.tdsType === "new")
          .flatMap(tds => tds.persentageEntityList);

        const oldRegimeSlabs = currentYearTds
          .filter(tds => tds.tdsType === "old")
          .flatMap(tds => tds.persentageEntityList);

        setTdsSlabs({
          new: newRegimeSlabs,
          old: oldRegimeSlabs
        });

        // Set initial selected slabs based on current regime
        setSelectedTdsSlabs(
          selectedTaxRegime === "new" ? newRegimeSlabs : oldRegimeSlabs
        );
      } catch (error) {
        console.error("Error fetching TDS slabs:", error);
        setTdsSlabs({
          new: [],
          old: []
        });
        setSelectedTdsSlabs([]);
      }
    };
    fetchTds();
  }, [selectedTaxRegime]);

  // ✅ Calculate TDS based on selected tax regime
  const calculateTds = (annualSalary, regime) => {
    const slabs = regime === "new" ? tdsSlabs.new : tdsSlabs.old;
    const sortedSlabs = [...slabs].sort((a, b) => parseFloat(a.min) - parseFloat(b.min));

    let applicable = null;
    for (const slab of sortedSlabs) {
      const min = parseFloat(slab.min);
      const max = parseFloat(slab.max) || Infinity;

      if (annualSalary >= min && annualSalary <= max) {
        applicable = slab;
        break;
      }
    }

    setApplicableSlab(applicable || sortedSlabs[sortedSlabs.length - 1]);

    let tdsAmount = 0;
    if (applicable) {
      const rate = parseFloat(applicable.taxPercentage) / 100;
      tdsAmount = annualSalary * rate;
    }

    return tdsAmount;
  };

  useEffect(() => {
    if (grossAmount > 0 && selectedTaxRegime) {
      const calculatedTds = calculateTds(grossAmount, selectedTaxRegime);
      setTdsAmount(calculatedTds);
    }
  }, [grossAmount, selectedTaxRegime]);

  const handleTaxRegimeChange = (e) => {
    const regime = e.target.value;
    setSelectedTaxRegime(regime);
    setValue("tdsType", regime);

    // Recalculate TDS with new regime
    const newTds = calculateTds(grossAmount, regime);
    setTdsAmount(newTds);
  };

  const fetchTemplate = async (companyId) => {
    try {
      const res = await TemplateGetAPI(companyId);
      const templateNumber = res.data.data.appraisalTemplateNo;
      setSelectedTemplate(templateNumber);
      setTemplateAvailable(!!templateNumber);
    } catch (error) {
      handleApiErrors(error);
      setTemplateAvailable(false);
    }
  };
  useEffect(() => {
    fetchTemplate();
  }, []);

  useEffect(() => {
    const fetchSalaryStructures = async () => {
      try {
        const response = await CompanySalaryStructureGetApi();
        const allSalaryStructures = response.data.data;

        if (allSalaryStructures.length === 0) {
          setError("Company Salary Structure is not defined");
          setSalaryStructure([]);
        } else {
          const activeSalaryStructures = allSalaryStructures.filter(
            (structure) => structure.status === "Active"
          );

          if (activeSalaryStructures.length > 0) {
            setSalaryStructure(activeSalaryStructures);
            setAllowances(activeSalaryStructures[0].allowances);
            setDeductions(activeSalaryStructures[0].deductions);
            setError(""); // Clear error if salary structures are found
          } else {
            setError("No active salary structure found");
          }
        }
      } catch (error) {
        setError("Error fetching salary structures.");
        console.error("API fetch error:", error);
      }
    };

    fetchSalaryStructures();
  }, []);

  const calculateTotalAllowances = () => {
    let totalAllowances = 0; // Initialize totalAllowances variable
    // Handle Basic Salary and HRA calculations
    const basicSalaryPercentage = parseFloat(allowances["Basic Salary"]) || 0; // Basic Salary percentage
    const hraPercentage = parseFloat(allowances["HRA"]) || 0; // HRA percentage
    const basicSalaryAmount = (basicSalaryPercentage / 100) * grossAmount; // Calculate basic salary amount
    const hraAmount = (hraPercentage / 100) * basicSalaryAmount; // Calculate HRA amount
    setBasicAmount(basicSalaryAmount); // Update state for basic amount

    // Adding Basic Salary and HRA to totalAllowances
    totalAllowances += basicSalaryAmount + hraAmount;
    // Loop through other allowances to calculate the total
    Object.entries(allowances).forEach(([key, value]) => {
      if (
        key !== "Basic Salary" &&
        key !== "HRA" &&
        key !== "Other Allowances"
      ) {
        // Skip Basic Salary and HRA since already calculated
        if (typeof value === "string" && value.includes("%")) {
          // If it's a percentage value, calculate the amount
          const percentageValue = parseFloat(value.replace("%", ""));
          if (!isNaN(percentageValue)) {
            let allowanceAmount;
            // Check if the allowance is related to HRA or gross amount
            if (key === "HRA") {
              allowanceAmount = (percentageValue / 100) * basicSalaryAmount; // HRA based on Basic Salary
            } else {
              allowanceAmount = (percentageValue / 100) * grossAmount; // For other allowances, use gross amount
            }
            totalAllowances += allowanceAmount;
          }
        } else if (
          key !== "Other Allowances" ||
          typeof value === "number" ||
          !isNaN(parseFloat(value))
        ) {
          const numericValue =
            typeof value === "number" ? value : parseFloat(value);
          // If it's a numeric fixed allowance, add it directly to total allowances
          totalAllowances += numericValue;
        }
      }
    });
    return totalAllowances;
  };

  // useEffect to update the total allowances whenever allowances or grossAmount changes
  useEffect(() => {
    const totalAllow = calculateTotalAllowances();
    setTotalAllowances(totalAllow);
  }, [allowances, grossAmount]); // Dependencies to trigger the effect

  useEffect(() => {
    const totalAllow = calculateTotalAllowances(); // Calculate total allowances
    const newOtherAllowances = grossAmount - totalAllow; // Subtract the sum of other allowances from gross amount
    // Ensure no negative values for other allowances
    const validOtherAllowances = Math.max(0, newOtherAllowances);

    // Check if other allowances need to be updated
    if (validOtherAllowances !== prevOtherAllowancesRef.current) {
      setAllowances((prevAllowances) => ({
        ...prevAllowances,
        "Other Allowances": validOtherAllowances.toFixed(2),
      }));
      prevOtherAllowancesRef.current = validOtherAllowances; // Update ref to new value
    }

    // Update total allowances state
    setTotalAllowances(totalAllow + validOtherAllowances); // Add Other Allowances to totalAllowances

    // Error checking: Disable submit if total allowances exceed gross amount
    if (newOtherAllowances < 0) {
      setErrorMessage(
        "Total allowances exceed gross amount. Please adjust allowances."
      );
      setIsSubmitDisabled(true);
    } else {
      setErrorMessage("");
      setIsSubmitDisabled(false);
    }
  }, [allowances, grossAmount]); // Recalculate whenever allowances or grossAmount change

  const calculatePFContributions = () => {
    const basicSalaryPercentage = parseFloat(allowances["Basic Salary"]) || 0; // Basic Salary percentage
    const pfEmployeePercentage =
      parseFloat(deductions["Provident Fund Employee"]) || 0; // Employee PF percentage
    const pfEmployerPercentage =
      parseFloat(deductions["Provident Fund Employer"]) || 0; // Employer PF percentage
    // Calculate Basic Salary Amount from the gross salary
    const basicSalaryAmount = (basicSalaryPercentage / 100) * grossAmount;
    // Calculate PF Contributions
    const pfEmployee = (pfEmployeePercentage / 100) * basicSalaryAmount;
    const pfEmployer = (pfEmployerPercentage / 100) * basicSalaryAmount;
    return {
      pfEmployee,
      pfEmployer,
    };
  };

  // Function to handle PF limit check and show the modal
  const handlePFLimitCheck = () => {
    const { pfEmployee, pfEmployer } = calculatePFContributions();
    const totalPF = pfEmployee + pfEmployer;

    setCalculatedPF({ pfEmployee, pfEmployer }); // Set calculated PF values

    // Case: If total PF exceeds ₹43,200 per year or is less than ₹43,200
    if (totalPF !== 43200) {
      updateDeductions(totalPF / 2, totalPF / 2);
    } else {
      // If total PF is exactly ₹43,200 per year, no confirmation needed
      updateDeductions(43200 / 2, 43200 / 2); // Use fixed PF values of ₹43,200 per year (monthly)
    }
  };

  // Update the deductions with PF values
  const updateDeductions = (pfEmployee, pfEmployer) => {
    const newDeductions = {
      ...deductions,
      "Provident Fund Employee": pfEmployee.toFixed(2),
      "Provident Fund Employer": pfEmployer.toFixed(2),
    };
    setUpdatedDeductions(newDeductions); // Save the updated deductions in state
  };

  // Function to calculate the total deductions including PF
  const calculateTotalDeductions = () => {
    let total = 0;

    Object.entries(updatedDeductions).forEach(([key, value]) => {
      if (!value) return;

      if (typeof value === "string" && value.includes("%")) {
        // percentage calculation
      } else {
        total += parseFloat(value) || 0;
      }
    });

    return isNaN(total) ? 0 : total;
  };

  useEffect(() => {
    const totalDeductions = calculateTotalDeductions();
    setTotalDeductions(totalDeductions);
  }, [updatedDeductions]);

  useEffect(() => {
    handlePFLimitCheck(); // Trigger the PF limit check on initial load or relevant updates
  }, [grossAmount, allowances, deductions]);

  const handleAllowanceChange = (key, newValue, grossSalary, basicSalary) => {
    let validValue = newValue;
    const isPercentage = newValue.includes("%");
    let errorMessage = "";

    // Convert percentage values to decimal numbers
    if (isPercentage) {
      validValue = newValue.replace(/[^0-9%]/g, ""); // Allow only digits and %
      const percentageValue = parseFloat(validValue.replace("%", "")) / 100; // Convert percentage to decimal
      if (isNaN(percentageValue)) {
        errorMessage = "Invalid percentage value.";
      } else {
        // Calculate allowance based on either Gross Salary or Basic Salary
        validValue = percentageValue * grossSalary; // Use grossSalary or basicSalary depending on your requirement
        validValue = validValue.toFixed(4); // Ensure the value is in decimal format
      }
    } else {
      // Validate and convert non-percentage values to numbers
      if (/[^0-9.-]/.test(newValue)) {
        errorMessage = "Only numeric values are allowed.";
      } else {
        validValue = parseFloat(newValue);
        if (isNaN(validValue) || validValue < 0) {
          errorMessage = "Allowance value cannot be negative.";
        }
      }
    }

    // If no error, update the state with the numeric value
    if (!errorMessage) {
      setAllowances((prevAllowances) => ({
        ...prevAllowances,
        [key]: validValue,
      }));
    }

    setErrorMessage(errorMessage);
  };
  const validateYear = (dateString) => {
    if (!dateString) return true; // Skip validation if empty

    const year = new Date(dateString).getFullYear();
    return year.toString().length === 4 || "Year must be exactly 4 digits";
  };

  const handleDeductionChange = (key, value, grossSalary, basicSalary) => {
    if (/[a-zA-Z]/.test(value)) {
      setErrorMessage("Alphabetic characters are not allowed.");
      return;
    }

    let validValue = parseFloat(value.replace(/[^0-9.-]/g, "")); // Remove non-numeric characters
    let errorMessage = "";

    // Handle percentage-based deduction calculation
    if (value.includes("%")) {
      const percentageValue = validValue / 100;
      validValue = percentageValue * grossSalary; // Deduction as a percentage of gross salary (or basicSalary if required)
    }

    if (isNaN(validValue)) {
      errorMessage = "Invalid deduction value.";
    }

    if (validValue < 0) {
      errorMessage = "Deduction value cannot be negative.";
    }

    // Update the deductions state with valid numeric value
    if (!errorMessage) {
      setDeductions((prevDeductions) => ({
        ...prevDeductions,
        [key]: validValue,
      }));
    }

    setErrorMessage(errorMessage);
  };

  useEffect(() => {
    const totalDed = calculateTotalDeductions();

    // Ensure the result is a number before setting it
    if (typeof totalDed === "number") {
      setTotalDeductions(totalDed); // Store as a number
    } else {
      setTotalDeductions(0); // Default to 0 if totalDed is not a valid number
    }
  }, [deductions, grossAmount]);

  useEffect(() => {
    // Calculate total allowances and total deductions whenever the gross amount changes
    //const totalAllowances = calculateTotalAllowances();
    const totalDeductions = calculateTotalDeductions();
    // Update state
    setFinalAllowances(finalAllowances);
    setTotalDeductions(totalDeductions);
  }, [grossAmount, allowances, deductions]); // Ensure dependencies include `grossAmount`, `allowances`, and `deductions`

  const calculateAllowances = () => {
    // calculateTotalAllowances();
    calculateTotalDeductions();
    setShowCards(true);
  };

  const calculateNetSalary = () => {
    const net = totalAllowances - totalDeductions;
    setNetSalary(net);
    if (!isNaN(net)) {
      setAmountInWords(numberToWords(net));
    } else {
      setAmountInWords('');
    }
  };

  useEffect(() => {
    calculateNetSalary();
  }, [finalAllowances, totalDeductions]);

  useEffect(() => {
    if (salaryId && id) {
      setValue("variableAmount", variableAmount);
      setValue("fixedAmount", fixedAmount);
      setValue("hra", hra);
      setValue("travelAllowance", travelAllowance);
      setValue("pfEmployee", pfEmployee);
      setValue("pfEmployer", pfEmployer);
      // Update other values as necessary
    }
  }, [
    variableAmount,
    fixedAmount,
    hra,
    travelAllowance,
    pfEmployee,
    pfEmployer,
    salaryId,
    id,
    setValue,
  ]);

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
      // toast.error("Network Error !");
    }
    console.error(error.response);
  };

  const onSubmit = () => {
    const {
      employeeId,
      designationName,
      departmentName,
      dateOfHiring,
      months,
      years,
      grossAmount,
      draft,
    } = getValues(); // Get current form values
    // Check if any required field is missing
    if (
      !employeeId ||
      !designationName ||
      !departmentName ||
      !dateOfHiring ||
      !months ||
      !years || grossAmount,
      !draft || draft
    ) {
      setMessage("Please fill all the required fields.");
      setShowFields(true); // Optionally hide or show some fields based on conditions
    } else {
      setShowFields(false); // Show fields or proceed with form submission
      setErrorMessage(""); // Clear any existing error messages
    }
  };
  const handleModalClose = () => {
    const { pfEmployee, pfEmployer } = calculatedPF;

    if (selectedPF === "calculated") {
      updateDeductions(pfEmployee, pfEmployer); // Use calculated PF
    } else {
      const fixedPF = 43200 / 2; // Use ₹43,200 per year
      updateDeductions(fixedPF, fixedPF); // Set fixed PF
    }
    setShowPfModal(false); // Close the modal
  };

  const handleVariableAmountChange = (e) => {
    setVariableAmount(parseFloat(e.target.value) || 0);
    setValue("variableAmount", e.target.value, { shouldValidate: true });
  };

  const handleFixedAmountChange = (e) => {
    setFixedAmount(parseFloat(e.target.value) || 0);
    setValue("fixedAmount", e.target.value, { shouldValidate: true });
  };

  useEffect(() => {
    const newGrossSalary = variableAmount + fixedAmount;
    setGrossAmount(newGrossSalary);
    if (!isNaN(newGrossSalary)) {
      setGrossInWords(numberToWords(newGrossSalary));
    } else {
      setGrossInWords('');
    }
  }, [variableAmount, fixedAmount]);

  useEffect(() => {
    const monthlySalaryValue = parseFloat(grossAmount || 0) / 12;
    setMonthlySalary(monthlySalaryValue.toFixed(2));

    const workingDaysPerMonth = 30;
    const lopPerDayValue = monthlySalaryValue / workingDaysPerMonth;
    setLossOfPayPerDay(lopPerDayValue.toFixed(2));
  }, [grossAmount]);

  useEffect(() => {
    console.log("Previous Gross Amount:", previousGrossAmount);
    console.log("Current Gross Amount:", grossAmount);

    const prevSalary = parseFloat(previousGrossAmount) || 0;
    const newSalary = parseFloat(grossAmount) || 0;

    if (prevSalary > 0) {
      if (newSalary > prevSalary) {
        const hike = ((newSalary - prevSalary) / prevSalary) * 100;
        console.log("hike", hike);
        setHikePercentage(hike.toFixed(2));
        if (hike < 0) {
          setHikeErrorMessage("Warning: Hike percentage is negative.");
        } else if (hike > 100) {
          setHikeErrorMessage("Hike percentage cannot be more than 100%.");
        } else {
          setHikeErrorMessage(""); // No error
        }
        setHikePercentage(hike.toFixed(2)); // Store actual hike, even if negative
      }
    }
  }, [grossAmount, previousGrossAmount]); // Ensure previousGrossAmount is included


  const fetchSalary = async () => {
    try {
      const response = await CompanySalaryStructureGetApi();
      const salaryStructures = response.data.data;

      if (salaryStructures && salaryStructures.length > 0) {
        const salaryStructureId = salaryStructures[0].id;
        console.log("salary:", salaryStructureId);
        // Extract the 'id' from the first salary structure
        setSalaryStructures(salaryStructures);
        setSalaryConfigurationId(salaryStructureId); // Set the 'id' into salaryConfigurationId
      } else {
        console.error("No salary structures found in the response.");
      }
    } catch (error) {
      console.error("API fetch error:", error);
    }
  };

  useEffect(() => {
    fetchSalary();
  }, []);

  const onSubmitUpdateSalary = async () => {
    if (error) {
      toast.error(error);
      return;
    }
    console.log("data", data)
    const fixedAmount = parseFloat(data.fixedAmount) || 0;
    const variableAmount = parseFloat(data.variableAmount) || 0;
    const grossAmountValue = parseFloat(grossAmount) || 0;
    const totalEarningsValue = parseFloat(totalAllowances) || 0;
    const netSalaryValue = parseFloat(netSalary) || 0;
    const totalDeductionsValue = parseFloat(totalDeductions) || 0;
    const pfTaxValue = parseFloat(pfTax) || 0;
    const tdsType = data.tdsType || "";

    const statusValue = data.status || "";
    if (variableAmount === 0 && fixedAmount === 0 && grossAmountValue === 0) {
      toast.error("All amounts cannot be zero.");
      return;
    }
    const allowancesData = {};
    const deductionsData = {};
    Object.entries(allowances).forEach(([key, value]) => {
      let displayValue = value;

      // If the allowance is a percentage, calculate the actual value using grossAmount or basicAmount
      if (typeof value === "string" && value.includes("%")) {
        const percentage = parseFloat(value.replace("%", ""));
        if (!isNaN(percentage)) {
          // Calculate based on grossAmount or basicAmount
          if (key === "HRA") {
            displayValue = (percentage / 100) * basicAmount; // For HRA, use basicAmount
          } else {
            displayValue = (percentage / 100) * grossAmountValue; // For other allowances, use grossAmount
          }
        }
      } else if (typeof value === "number") {
        // If it's a number (fixed value), just display that value
        displayValue = value;
      }

      // Ensure that displayValue is a number and set it to 0 if not
      displayValue = isNaN(displayValue) ? 0 : displayValue;

      // Add the allowance value to the allowancesData object, formatted with 2 decimal places
      allowancesData[key] = displayValue; // Ensure we pass the value as a fixed number
    });

    // Add calculated deductions
    Object.entries(deductions).forEach(([key, value]) => {
      let displayValue = value;

      // If the deduction is a percentage, calculate the actual value using grossAmount
      if (typeof value === "string" && value.includes("%")) {
        const percentage = parseFloat(value.replace("%", ""));
        if (!isNaN(percentage)) {
          // Calculate based on grossAmount or basicAmount
          if (
            key === "Provident Fund Employee" ||
            key === "Provident Fund Employer"
          ) {
            displayValue = (percentage / 100) * basicAmount; // For HRA, use basicAmount
          } else {
            displayValue = (percentage / 100) * grossAmountValue; // For other allowances, use grossAmount
          }
        }
      } else if (typeof value === "number") {
        // If it's a number (fixed value), just display that value
        displayValue = value;
      }

      // Ensure that displayValue is a number and set it to 0 if not
      displayValue = isNaN(displayValue) ? 0 : displayValue;

      // Add the deduction value to the deductionsData object, formatted with 2 decimal places
      deductionsData[key] = displayValue; // Ensure we pass the value as a fixed number
    });

    const dataToSubmit = {
      salaryHikePersentage: hikePercentage,
      companyName: authUser.company,
      fixedAmount: fixedAmount.toFixed(2),
      variableAmount: variableAmount.toFixed(2),
      grossAmount: grossAmountValue.toFixed(2),
      salaryConfigurationEntity: {
        allowances: allowancesData,
        // Filter out TDS from deductions
        deductions: Object.entries(deductionsData).reduce((acc, [key, value]) => {
          if (key !== "TDS") {
            acc[key] = value;
          }
          return acc;
        }, {})
      },
      totalEarnings: totalEarningsValue.toFixed(2),
      netSalary: netSalaryValue.toFixed(2),
      totalDeductions: totalDeductionsValue.toFixed(2),
      pfTax: pfTaxValue.toFixed(2),
      // Keep TDS as a separate field if needed
      tdsAmount: tdsAmount.toFixed(2),  // Add this if you want to track TDS separately
      tdsType: tdsType,
      addSalaryDate: hikeStartedDate,
      status: statusValue,
    };
    console.log(dataToSubmit);

    if (!employeeId) {
      toast.error("Employee ID is required.");
      return;
    }
    const salaryStructureId =
      salaryStructures.length > 0 ? salaryStructures[0].id : "";
    const payload = {
      salaryHikePersentage: hikePercentage,
      companyId: company?.id,
      employeeId: employeeId,
      date: previewData.date,
      dateOfSalaryIncrement: previewData?.dateOfSalaryIncrement || "",
      grossCompensation: String(grossAmount || ""),
      salaryConfigurationId: salaryStructureId || "",
      draft: previewData.draft,
      // appraisalTemplateNo: selectedTemplate,
    };
    try {
      // First, call the EmployeeSalaryPostApi to update salary
      setLoading(true); // Show loader before the delay
      await EmployeeSalaryPostApi(employeeId, dataToSubmit);
      // Introduce a delay before calling AppraisalLetterDownload
      setTimeout(async () => {
        try {
          // Now, after the delay, call the AppraisalLetterDownload API
          await AppraisalLetterDownload(payload);

          // If both API calls succeed
          toast.success(
            "Employee Salary Updated and Appraisal Letter Generated Successfully"
          );
          setError(""); // Clear error message on success
          setShowFields(false); // Optionally hide fields after success
          navigate("/employeeview"); // Navigate to the employee view page
        } catch (err) {
          console.error(
            "Error occurred while downloading the appraisal letter:",
            err
          );
          toast.error("Failed to generate appraisal letter");
        } finally {
          setLoading(false); // Hide loader after the delay and download process
        }
      }, 2000); // Delay in milliseconds (2000 ms = 2 seconds)
    } catch (err) {
      // Handle any errors that occur during the EmployeeSalaryPostApi call
      console.error("Error occurred:", err);
      toast.error("Failed to update salary");
      setLoading(false); // Hide loader if error occurs
    }
  };

  const handleSubmitButtonClick = () => {
    // Calculate total allowances
    // const totalAllowances = calculateTotalAllowances();

    // Calculate total deductions
    const totalDeductions = calculateTotalDeductions();

    let calculatedHike = 0;
    if (previousGrossAmount > 0) {
      calculatedHike = ((grossAmount - previousGrossAmount) / previousGrossAmount) * 100;

      if (calculatedHike < 0) {
        setHikeErrorMessage("Hike percentage cannot be negative.")
        setShowCards(false);
        setShowPfModal(false)
      } else if (calculatedHike > 100) {
        setHikeErrorMessage("Hike percentage cannot be more than 100%.");
        setShowCards(false);
        setShowPfModal(false)
      }
    }
    // Calculate net salary
    const netSalary = grossAmount + finalAllowances - totalDeductions;

    // Set the calculated values to state
    setHikePercentage(calculatedHike.toFixed(2));
    setFinalAllowances(finalAllowances);
    setTotalDeductions(totalDeductions);
    setNetSalary(netSalary);

    // Optionally, show any relevant messages
    if (netSalary < 0) {
      setErrorMessage("Net Salary cannot be negative");
    } else {
      setErrorMessage("");
    }

    // Check PF limit if necessary
    handlePFLimitCheck();
    setShowPfModal(true);
    setShowCards(true);
  };

  // Preview Form Submission (Before submitting for API calls)
  const submitForm = (data) => {
    const draftValue = data.draft === "true";
    setHikeStartedDate(data.dateOfSalaryIncrement);

    console.log("submitForm", data);
    const selectedMonth = data.months ? data.months.label : "";
    const selectedYear = data.years ? data.years.label : "";
    const employeeId = selectedEmployee
      ? selectedEmployee.employeeId
      : data.employeeId;
    setEmployeeId(employeeId);
    const submissionData = {
      salaryHikePersentage: hikePercentage,
      employeeId: data.employeeId,
      companyId: company.id,
      allowances: allowances,
      totalAllowances: totalAllowances,
      draft: draftValue,

    };
    const preview = {
      salaryHikePersentage: hikePercentage,
      employeeId: data.id,
      employeeName: data.employeeName || "",
      designationName: data.designationName || "",
      departmentName: data.departmentName || "",
      dateOfSalaryIncrement: data.dateOfSalaryIncrement || "",
      companyId: company.id,
      companyData: company,
      timePeriod: `${selectedMonth} ${selectedYear}`,
      grossCompensation: grossAmount || "",
      allowances: allowances,
      totalAllowances: totalAllowances,
      basicSalary: basicAmount,
      draft: draftValue,
      date: data.generatedDate,
    };
    setPreviewData(preview);
    setShowPreview(true);
    setSubmissionData(submissionData);
    setData(data);
  };

  const calculationPopover = (
    <Popover id="popover-basic" style={{ maxWidth: "300px", borderRadius: "8px", border: "1px solid #17a2b8" }}>
      <Popover.Header as="h6" className="bg-info text-white text-center">
        Calculation Method
      </Popover.Header>
      <Popover.Body className="bg-light">
        <ul className="mb-0">
          <li>Entire salary taxed at a single rate based on which bracket it falls into.</li>
          <li>Current regime: <strong>{selectedTaxRegime === "new" ? "New" : "Old"}</strong></li>
          <li>Financial Year: <strong>{getCurrentFinancialYear()}</strong></li>
          {applicableSlab && (
            <li>Your salary of ₹{grossAmount.toLocaleString('en-IN')} falls in the {applicableSlab.taxPercentage}% bracket.</li>
          )}
        </ul>
      </Popover.Body>
    </Popover>
  );


  const clearForm = () => {
    reset();
    setShowFields(false);
  };


  if (!templateAvailable) {
    return (
      <LayOut>
        <div className="container-fluid p-0">
          <div className="row justify-content-center">
            <div className="col-8 text-center mt-5">
              <h2>No Appraisal Template Available</h2>
              <p>
                To set up the Appraisal templates before proceeding, Please
                select the Template from Settings{" "}
                <Link to="/appraisalTemplates" className="custom-link">Appraisal Templates </Link>
              </p>
              <p>
                Please contact the administrator to set up the Appraisal
                templates before proceeding.
              </p>
            </div>
          </div>
        </div>
      </LayOut>
    );
  }

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Appraisal Form</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Appraisal From</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          {showFields ? (
            <form onSubmit={handleSubmit(submitForm)}>
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title"> Salary Details </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-5 mb-3">
                        <label className="form-label">Variable Amount</label>
                        <input
                          id="variableAmount"
                          type="text"
                          className="form-control"
                          autoComplete="off"
                          maxLength={10}
                          {...register("variableAmount", {
                            required: "Variable amount is required",
                            pattern: {
                              value: /^[0-9]+$/,
                              message: "These filed accepcts only Integers",
                            },
                            maxLength: {
                              value: 10,
                              message: "Maximum 10 Numbers Allowed",
                            },
                          })}
                          readOnly={isReadOnly}
                          value={variableAmount}
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
                          {...register("fixedAmount", {
                            required: "Fixed amount is required",
                            pattern: {
                              value: /^[0-9]+$/,
                              message: "These filed accepcts only Integers",
                            },
                            minLength: {
                              value: 5,
                              message: "Minimum 5 Numbers Required",
                            },
                            maxLength: {
                              value: 10,
                              message: "Maximum 10 Numbers Allowed",
                            },
                            validate: {
                              notZero: (value) =>
                                value !== "0" || "Value cannot be 0",
                            },
                          })}
                          readOnly={isReadOnly}
                          value={fixedAmount}
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
                          Gross Amount<span style={{ color: "red" }}>*</span> ({hikePercentage !== null && (<span className="text-success">{hikePercentage}% </span>)})
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          autoComplete="off"
                          value={grossAmount}
                          onChange={(e) =>
                            setGrossAmount(parseFloat(e.target.value))
                          }
                          readOnly
                        />
                        {grossInWords && (
                          <div style={{ marginTop: '10px', color: "green" }}>
                            <strong>IN WORDS: {grossInWords}</strong>
                          </div>
                        )}
                      </div>

                      <div className="col-md-1 mb-3"></div>
                      <div className="col-md-5 mb-3">
                        <label className="form-label">
                          Monthly Salary
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={monthlySalary}
                          readOnly
                        />
                      </div>
                      {hikeErrorMessage && (<span className="text-center text-danger">{hikeErrorMessage}</span>)}
                      <div className="col-12 text-end mt-2">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSubmitButtonClick}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {loading ? (
                <Loader /> // Show loader while loading
              ) : (
                showCards && (
                  <>
                    <div className="row d-flex">
                      <div className="col-6 mb-4">
                        <div className="card">
                          <div className="card-header">
                            <h5 className="card-title">Allowances</h5>
                          </div>
                          <div className="card-body">
                            {Object.entries(allowances).map(
                              ([key, value]) => {
                                let displayValue = value;

                                // If the allowance is a percentage, calculate the actual value using grossAmount or basicAmount
                                if (
                                  typeof value === "string" &&
                                  value.includes("%")
                                ) {
                                  const percentage = parseFloat(
                                    value.replace("%", "")
                                  );
                                  if (!isNaN(percentage)) {
                                    // Calculate based on grossAmount or basicAmount
                                    if (key === "HRA") {
                                      displayValue =
                                        (percentage / 100) * basicAmount; // For HRA, use basicAmount
                                    } else {
                                      displayValue =
                                        (percentage / 100) * grossAmount; // For other allowances, use grossAmount
                                    }
                                  }
                                } else if (typeof value === "number") {
                                  // If it's a number (fixed value), just display that value
                                  displayValue = value;
                                }

                                // Update the state with the calculated value for allowance

                                return (
                                  <div key={key} className="mb-3">
                                    <label>{key}</label>
                                    <input
                                      className="form-control"
                                      type="text"
                                      maxLength={7}
                                      value={Math.round(displayValue)} // Display the calculated value
                                      onChange={(e) =>
                                        handleAllowanceChange(
                                          key,
                                          e.target.value
                                        )
                                      } // Handle change
                                      readOnly={
                                        key === "Basic Salary" ||
                                        key === "HRA"
                                      }
                                    />
                                  </div>
                                );
                              }
                            )}

                            <div className="mb-3">
                              <label>Total Allowances:</label>
                              <input
                                className="form-control"
                                type="text"
                                name="totalAllowance"
                                value={Math.round(totalAllowances)}
                                readOnly
                                data-toggle="tooltip"
                                title="This is the total of all allowances."
                              />
                              {errorMessage && (
                                <p className="text-danger">{errorMessage}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="card">
                          <div className="card-header">
                            <div className="d-flex justify-content-start align-items-start">
                              <h5 className="card-title me-2">Status</h5>
                              <span className="text-danger">
                                {errors.status && (
                                  <p className="mb-0">
                                    {errors.status.message}
                                  </p>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-12 col-md-6 col-lg-5 mb-3">
                                <label>
                                  <input
                                    type="radio"
                                    name="status"
                                    defaultChecked
                                    value="Active"
                                    style={{ marginRight: "10px" }}
                                    {...register("status", {
                                      required: "Please Select Status",
                                    })}
                                  />
                                  Active
                                </label>
                              </div>
                              <div className="col-lg-1"></div>
                              <div className="col-12 col-md-6 col-lg-5 mb-3">
                                <label>
                                  <input
                                    type="radio"
                                    name="status"
                                    value="InActive"
                                    style={{ marginRight: "10px" }}
                                    {...register("status", {
                                      required: "Please Select Status",
                                    })}
                                  />
                                  InActive
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Deductions Card */}
                      <div className="col-6 mb-4">
                        <div className="card">
                          <div className="card-header">
                            <h5 className="card-title">Deductions</h5>
                          </div>
                          <div className="card-body">
                            {Object.entries(updatedDeductions).map(([key, value]) => {
                              let displayValue = parseFloat(value) || value;

                              if (typeof value === "string" && value.includes("%")) {
                                const percentage = parseFloat(value.replace("%", ""));
                                if (!isNaN(percentage)) {
                                  const baseAmount = key.includes("Provident Fund") ? basicAmount : grossAmount;
                                  displayValue = (percentage / 100) * baseAmount;
                                }
                              }

                              return (
                                <div key={key} className="mb-3">
                                  <label>{key}</label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    readOnly={[
                                      "Provident Fund Employee",
                                      "Provident Fund Employer"
                                    ].includes(key)}
                                    value={Math.round(displayValue)}
                                    onChange={(e) => handleDeductionChange(key, e.target.value)}
                                  />
                                </div>
                              );
                            })}
                            <div className="mb-3">
                              <label>Total Deductions</label>
                              <input
                                className="form-control"
                                type="number"
                                value={Math.round(totalDeductions)} // Format as string here
                                readOnly
                                data-toggle="tooltip"
                                title="This is the total of all deductions."
                              />
                              {errorMessage && (
                                <p className="text-danger">{errorMessage}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="card">
                          <div className="card-header">
                            <div className="d-flex justify-content-start align-items-start">
                              <h5 className="card-title me-2">Tax Deduction at Source (TDS)</h5>
                              <span className="text-danger">
                                {errors.tdsType && (
                                  <p className="mb-0">{errors.tdsType.message}</p>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              {/* Tax Regime Selection */}
                              <div className="col-md-12 mb-4">
                                <h6 className="mb-3">Select Tax Regime:</h6>
                                <div className="d-flex flex-wrap gap-4">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      id="newRegime"
                                      value="new"
                                      {...register("tdsType", {
                                        onChange: (e) => setSelectedTaxRegime(e.target.value)
                                      })}
                                    />
                                    <label className="form-check-label" htmlFor="newRegime">
                                      <div className="d-flex align-items-center">
                                        <span>New Tax Regime (Default)</span>
                                        <OverlayTrigger
                                          trigger={["hover", "focus"]}
                                          placement="top"
                                          overlay={calculationPopover}
                                        >
                                          <span className="ms-2" style={{ cursor: "pointer" }}>
                                            <i className="bi bi-info-circle text-primary"></i>
                                          </span>
                                        </OverlayTrigger>
                                      </div>
                                    </label>

                                  </div>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      id="oldRegime"
                                      value="old"
                                      {...register("tdsType", {
                                        onChange: (e) => setSelectedTaxRegime(e.target.value)
                                      })}
                                    />
                                    <label className="form-check-label" htmlFor="oldRegime">
                                      Old Tax Regime
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {/* Salary and Slab Information */}
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Applicable Tax Rate</label>
                                <div className="p-2 bg-white rounded">
                                  {applicableSlab ? (
                                    <div className="d-flex align-items-center">
                                      <span className="badge bg-primary me-2">
                                        {applicableSlab.taxPercentage}%
                                      </span>
                                      <span>
                                        For salary between ₹{applicableSlab.min.toLocaleString('en-IN')} -
                                        ₹{applicableSlab.max ? applicableSlab.max.toLocaleString('en-IN') : '∞'}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted">No applicable slab found</span>
                                  )}
                                </div>
                              </div>

                              {/* TDS Calculation Results */}
                              <div className="col-md-12 mt-4">
                                <div className="row">
                                  <div className="col-md-4 mb-3">
                                    <label className="form-label">Tax Rate Applied</label>
                                    <input
                                      className="form-control fw-bold text-center"
                                      type="text"
                                      value={applicableSlab ? `${applicableSlab.taxPercentage}%` : 'N/A'}
                                      readOnly
                                    />
                                  </div>
                                  <div className="col-md-4 mb-3">
                                    <label className="form-label">Annual TDS</label>
                                    <input
                                      className="form-control fw-bold text-center"
                                      type="text"
                                      value={`₹${tdsAmount.toLocaleString('en-IN', {
                                        maximumFractionDigits: 2,
                                        minimumFractionDigits: 2
                                      })}`}
                                      readOnly
                                    />
                                  </div>
                                  <div className="col-md-4 mb-3">
                                    <label className="form-label">Monthly TDS</label>
                                    <input
                                      className="form-control fw-bold text-center"
                                      type="text"
                                      value={`₹${(tdsAmount / 12).toLocaleString('en-IN', {
                                        maximumFractionDigits: 2,
                                        minimumFractionDigits: 2
                                      })}`}
                                      readOnly
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="card">
                          <div className="card-header">
                            <h5 className="card-title">Net Salary</h5>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <label>Net Salary</label>
                              <input
                                className="form-control"
                                type="text"
                                name="netSalary"
                                value={netSalary.toFixed(2)}
                                readOnly
                                data-toggle="tooltip"
                                title="This is the final salary after all deductions and allowances."
                              />
                              {amountInWords && (
                                <div style={{ marginTop: '10px', color: "green" }}>
                                  <strong>IN WORDS: {amountInWords}</strong>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-end">
                          <button
                            className="btn btn-secondary me-2"
                            onClick={clearForm}
                          >
                            Close
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!!errorMessage}
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                    {error && (
                      <div
                        className="error-message"
                        style={{
                          color: "red",
                          marginBottom: "10px",
                          textAlign: "center",
                        }}
                      >
                        <b>{error}</b>
                      </div>
                    )}
                  </>
                )
              )}
            </form>
          ) : (
            <div className="col-12">
              <div className="card ">
                <div className="card-header">
                  <h5 className="card-title ">Add Employee Increament </h5>
                  <div
                    className="dropdown-divider"
                    style={{ borderTopColor: "#d7d9dd" }}
                  />
                </div>
                <div className="card-body ">
                  <div className="row">
                    <div className="col-lg-12">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Salary Details */}
                        <div>
                          <div className="row">
                            <div className="col-md-5 mb-3">
                              <label className="form-label">
                                Select Employee
                              </label>
                              <Controller
                                name="employeeId"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    options={employes}
                                    value={employes.find(
                                      (option) => option.value === field.value
                                    )}
                                    onChange={(selectedOption) => {
                                      field.onChange(selectedOption.value);

                                      // Get selected employee details
                                      const selectedEmp = employes.find(
                                        (emp) =>
                                          emp.value === selectedOption.value
                                      );
                                      if (selectedEmp) {
                                        console.log(
                                          "Selected Employee Details: ",
                                          selectedEmp
                                        );

                                        // Use setValue to populate form fields with selected employee's info
                                        setValue(
                                          "employeeName",
                                          selectedEmp.employeeName
                                        ); // Add employeeName to form
                                        setValue(
                                          "designationName",
                                          selectedEmp.designationName
                                        );
                                        setValue(
                                          "departmentName",
                                          selectedEmp.departmentName
                                        );
                                        setValue(
                                          "dateOfHiring",
                                          selectedEmp.dateOfHiring
                                        );
                                        setValue(
                                          "currentGross",
                                          selectedEmp.currentGross
                                        );
                                        setValue(
                                          "id",
                                          selectedEmp.employeeId
                                        );
                                        setPreviousGrossAmount(Number(selectedEmp.currentGross) || 0);
                                      }
                                    }}
                                    placeholder="Select Employee Name"
                                  />
                                )}
                              />
                              {errors.employeeId && (
                                <p className="errorMsg">
                                  Employee Name Required
                                </p>
                              )}
                            </div>
                            <input
                              type="hidden"
                              className="form-control"
                              placeholder="Resignation Date"
                              name="id"
                              readOnly
                              {...register("id")}
                            />
                            <input
                              type="hidden"
                              className="form-control"
                              placeholder="Resignation Date"
                              name="employeeName"
                              readOnly
                              {...register("id")}
                            />
                            <div className="col-lg-1"></div>
                            <div className="col-12 col-md-6 col-lg-5 mb-3">
                              <label className="form-label">
                                Date of Hired
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                placeholder="Resignation Date"
                                name="dateOfHiring"
                                readOnly
                                {...register("dateOfHiring")}
                              />
                              {errors.dateOfHiring && (
                                <p className="errorMsg">
                                  Date of Hiring Required
                                </p>
                              )}
                            </div>
                            <div className="col-12 col-md-6 col-lg-5 mb-3">
                              <label className="form-label">
                                Designation
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Designation"
                                name="designationName"
                                readOnly
                                {...register("designationName")}
                              />
                              {errors.designationName && (
                                <p className="errorMsg">
                                  Designation Required
                                </p>
                              )}
                            </div>
                            <div className="col-lg-1"></div>
                            <div className="col-12 col-md-6 col-lg-5 mb-3">
                              <label className="form-label">Department</label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Department"
                                name="departmentName"
                                readOnly
                                {...register("departmentName")}
                              />
                              {errors.departmentName && (
                                <p className="errorMsg">
                                  Department Required
                                </p>
                              )}
                            </div>
                            <div className="col-12 col-md-6 col-lg-5 mb-3">
                              <label className="form-label">
                                Current Gross Salary
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Current Gross Salary"
                                name="currentGross"
                                readOnly
                                {...register("currentGross")}
                              />
                              {errors.currentGross && (
                                <p className="errorMsg">
                                  Current Gross Amount Required
                                </p>
                              )}
                            </div>
                            <div className="col-lg-1"></div>
                            <div className="col-md-5 mb-3">
                              <label className="form-label">
                                Appraisal Date (Hike Start Date)
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                max={(() => {
                                  const maxDate = new Date();
                                  maxDate.setMonth(maxDate.getMonth() + 3); // Set max to 3 months ahead
                                  return maxDate.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
                                })()}
                                onClick={(e) => e.target.showPicker()} // Use onClick instead of onFocus
                                {...register("dateOfSalaryIncrement", {
                                  required: "Appraisal Date is required",
                                  validate: validateAppraisalDate, // Apply custom validation
                                })}
                              />

                              {errors.dateOfSalaryIncrement && (
                                <p className="errorMsg">
                                  {errors.dateOfSalaryIncrement.message}
                                </p>
                              )}
                            </div>

                            <div className="col-lg-1"></div>
                            <div className="col-12 col-md-6 col-lg-5 mb-3">
                              <label className="form-label">Letter Generated Date</label>
                              <input
                                type="date"
                                name="generatedDate"
                                placeholder="Enter Genatated Date"
                                className="form-control"
                                autoComplete="off"
                                onClick={(e) => e.target.showPicker()}
                                {...register("generatedDate", {
                                  required: "Generated Date is required",
                                  validate: {
                                    notAfterJoiningDate: (value) => {
                                      const joiningDate = watch("dateOfSalaryIncrement");
                                      if (!joiningDate) return true; // Skip this check if joiningDate isn't selected yet
                                      return (
                                        new Date(value) <= new Date(joiningDate) ||
                                        "Generated Date cannot be after date of salary increment"
                                      );
                                    },
                                    validateYear: (value) => validateYear(value),
                                  }
                                })}
                              />
                              {errors.generatedDate && (
                                <p className="errorMsg">{errors.generatedDate.message}</p>
                              )}
                            </div>

                            <div className="col-lg-1"></div>
                            <div className="col-12 col-md-6 col-lg-5 mb-3">
                              <label className="form-label mb-2">Select Mode</label> {/* Added spacing below label */}
                              <div className="d-flex gap-3"> {/* Flexbox for side-by-side layout */}
                                <div className="form-check">
                                  <input
                                    type="radio"
                                    className="form-check-input"
                                    id="draft"
                                    name="draft"
                                    value={true}
                                    {...register("draft", { required: true })}
                                  />
                                  <label className="form-check-label" htmlFor="draft">
                                    Draft Copy
                                  </label>
                                </div>
                                <div className="form-check">
                                  <input
                                    type="radio"
                                    className="form-check-input"
                                    id="undraft"
                                    name="draft"
                                    value={false}
                                    {...register("draft", { required: true })}
                                  />
                                  <label className="form-check-label" htmlFor="undraft">
                                    Digital Copy
                                  </label>
                                </div>
                              </div>
                              {errors.draft && (
                                <p className="errorMsg">Please select Draft Copy or Digital Copy</p>
                              )}
                            </div>

                          </div>
                          {message && (<span className="text-center text-danger">message</span>)}
                          <div
                            className="col-12  d-flex justify-content-end mt-5 "
                            style={{ background: "none" }}
                          >
                            <button
                              className="btn btn-primary btn-lg"
                              style={{ marginRight: "65px" }}
                              type="submit"
                            >
                              Update Salary Structure
                            </button>
                          </div>
                        </div>
                      </form>
                      <Modal
                        show={showPfModal}
                        onHide={() => setShowPfModal(false)}
                        centered
                        style={{ zIndex: "1050" }}
                        className="custom-modal"
                      >
                        <ModalHeader closeButton>
                          <ModalTitle className="text-center">
                            Confirm Provident Fund Option
                          </ModalTitle>
                        </ModalHeader>
                        <ModalBody className="text-center fs-bold">
                          <p>
                            The Total Provident Fund is ₹
                            {calculatedPF.pfEmployee +
                              calculatedPF.pfEmployer}
                            . Please choose your preferred option:
                          </p>
                          <div className="d-flex align-items-center mb-3">
                            <input
                              className="form-check-input me-2"
                              type="radio"
                              name="pfOption"
                              value="calculated"
                              checked={selectedPF === "calculated"}
                              onChange={() => setSelectedPF("calculated")}
                            />
                            <label className="mb-0">
                              As per Calculated PF: ₹
                              {calculatedPF.pfEmployee +
                                calculatedPF.pfEmployer}{" "}
                              per year
                            </label>
                          </div>

                          <div className="d-flex align-items-center mb-3">
                            <input
                              className="form-check-input me-2"
                              type="radio"
                              name="pfOption"
                              value="fixed"
                              checked={selectedPF === "fixed"}
                              onChange={() => setSelectedPF("fixed")}
                            />
                            <label className="mb-0 ml-2">
                              Base PF: ₹43,200 per year
                              <span
                                className="d-inline-block"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="₹43,200 is the standard PF for an employee (₹3,600 per month)"
                              >
                                <i className="bi bi-info-circle text-primary"></i>{" "}
                                {/* Info icon from Bootstrap Icons */}
                              </span>
                            </label>
                          </div>
                        </ModalBody>
                        <div className="text-center">
                          <Button
                            variant="primary ml-2"
                            onClick={handleModalClose}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => setShowPfModal(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </Modal>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {showPreview && (
          <div
            className={`modal fade ${showPreview ? "show" : ""}`}
            style={{ display: showPreview ? "block" : "none" }}
            tabIndex="-1"
            role="dialog"
            aria-hidden={!showPreview}
          >
            <div
              className="modal-dialog modal-lg"
              role="document"
              style={{ top: "80%" }}
            >
              {loading ? (
                <div className="text-center mt-4">
                  <Loader />{" "}
                  {/* Assuming Loader is your component for showing loading indicator */}
                </div>
              ) : (
                <div className="modal-content mt-2">
                  <div className="modal-header">
                    <h5 className="modal-title">Preview Appraisal Letter</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => setShowPreview(false)}
                      aria-label="Close"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <AppraisalPreview
                      previewData={previewData}
                      selectedTemplate={selectedTemplate}
                      basicAmount={basicAmount}
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowPreview(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={onSubmitUpdateSalary}
                    >
                      Confirm Submission
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <Modal
          show={showPfModal}
          onHide={() => setShowPfModal(false)}
          centered
          style={{ zIndex: "1050" }}
          className="custom-modal"
        >
          <ModalHeader closeButton>
            <ModalTitle className="text-center">
              Confirm Provident Fund Option
            </ModalTitle>
          </ModalHeader>
          <ModalBody className="text-center fs-bold">
            <p>
              The Total Provident Fund is ₹
              {calculatedPF.pfEmployee + calculatedPF.pfEmployer}. Please choose
              your preferred option:
            </p>
            <div className="d-flex align-items-center mb-3">
              <input
                className="form-check-input me-2"
                type="radio"
                name="pfOption"
                value="calculated"
                checked={selectedPF === "calculated"}
                onChange={() => setSelectedPF("calculated")}
              />
              <label className="mb-0">
                Use Calculated PF: ₹
                {calculatedPF.pfEmployee + calculatedPF.pfEmployer} per year
              </label>
            </div>

            <div className="d-flex align-items-center mb-3">
              <input
                className="form-check-input me-2"
                type="radio"
                name="pfOption"
                value="fixed"
                checked={selectedPF === "fixed"}
                onChange={() => setSelectedPF("fixed")}
              />
              <label className="mb-0 ml-2">
                Use Calculated PF: ₹43,200 per year
                <span
                  className="d-inline-block"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="₹43,200 is the standard PF for an employee (₹3,600 per month)"
                >
                  <i className="bi bi-info-circle text-primary"></i>{" "}
                  {/* Info icon from Bootstrap Icons */}
                </span>
              </label>
            </div>
          </ModalBody>
          <div style={{ marginLeft: "58%" }}>
            <Button
              variant="primary"
              className="ml-4"
              style={{ marginRight: "10px" }}
              onClick={handleModalClose}
            >
              Confirm
            </Button>
            <Button variant="secondary"
              onClick={() => {
                setShowPfModal(false);
                setShowCards(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </Modal>
      </div>
    </LayOut>
  );
};

export default AddIncrement;
