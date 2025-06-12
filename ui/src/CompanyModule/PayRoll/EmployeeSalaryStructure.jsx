
import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import LayOut from "../../LayOut/LayOut";
import {
  EmployeeGetApi,
  EmployeeSalaryPostApi,
  EmployeeSalaryGetApiById,
  EmployeeSalaryPatchApiById,
  CompanySalaryStructureGetApi,
  TdsGetApi
} from "../../Utils/Axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useAuth } from "../../Context/AuthContext";
import Loader from "../../Utils/Loader";
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalTitle,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../../Redux/EmployeeSlice";
import { OverlayTrigger, Popover } from "react-bootstrap";

// Utility function to get current financial year
const getCurrentFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const EmployeeSalaryStructure = () => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      incomeTax: "new" // Default to new regime
    }
  });

  const { authUser } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const salaryId = queryParams.get("salaryId");
  const id = queryParams.get("employeeId");

  // State declarations
  const [employes, setEmployes] = useState([]);
  const [basicSalary, setBasicSalary] = useState(0);
  const [allowances, setAllowances] = useState({});
  const [deductions, setDeductions] = useState({});
  const [updatedDeductions, setUpdatedDeductions] = useState({});
  const [grossAmount, setGrossAmount] = useState(0);
  const [finalAllowances, setFinalAllowances] = useState(0);
  const [totalAllowances, setTotalAllowances] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [netSalary, setNetSalary] = useState(0);
  const [hra, setHra] = useState(0);
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
  const [showPfModal, setShowPfModal] = useState(false);
  const [selectedPF, setSelectedPF] = useState("calculated");
  const [basicAmount, setBasicAmount] = useState(0);
  const [amountInWords, setAmountInWords] = useState('');
  const [grossInWords, setGrossInWords] = useState('');
  const [calculatedPF, setCalculatedPF] = useState({
    pfEmployee: 0,
    pfEmployer: 0,
  });
  const [travelAllowance, setTravelAllowance] = useState(0);
  const [otherAllowances, setOtherAllowances] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Active");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [showCards, setShowCards] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calculatedAllowances, setCalculatedAllowances] = useState({});
  const [calculatedDeductions, setCalculatedDeductions] = useState({});
  const [selectedTaxRegime, setSelectedTaxRegime] = useState("new");
  const [selectedTdsSlabs, setSelectedTdsSlabs] = useState([]);
  const [tdsAmount, setTdsAmount] = useState(0);
  const [showTdsField, setShowTdsField] = useState(false);
  const [tdsSlabs, setTdsSlabs] = useState({
    old: [],
    new: []
  });
  const [standardDeduction, setStandardDeduction] = useState({
    new: 0,
    old: 0
  });
  const [applicableSlab, setApplicableSlab] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Number to words conversion function
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
      result = result.replace(" and ", "");
    }

    return result.trim();
  };

  const navigate = useNavigate();
  const prevOtherAllowancesRef = useRef(0);
  const dispatch = useDispatch();
  const { data: employees } = useSelector((state) => state.employees);

  // Initial setup effects
  useEffect(() => {
    if (id && salaryId) {
      setShowFields(true);
    } else {
      setShowFields(false);
    }
  }, [id, salaryId]);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (employees) {
      const activeEmployees = employees
        .filter((employee) => employee.status === "Active")
        .map((employee) => ({
          label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
          value: employee.id,
        }));

      setEmployes(activeEmployees);
    }
  }, [employees]);

  // Load employee salary data if editing
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

  // Fetch company salary structure
  useEffect(() => {
    const fetchSalaryStructures = async () => {
      try {
        const response = await CompanySalaryStructureGetApi();
        const allSalaryStructures = response.data.data;
        if (allSalaryStructures.length === 0) {
          setErrorMessage("Company Salary Structure is not defined");
        } else {
          const activeSalaryStructures = allSalaryStructures.filter(
            (structure) => structure.status === "Active"
          );
          if (activeSalaryStructures.length > 0) {
            const firstStructure = activeSalaryStructures[0];
            setAllowances(firstStructure.allowances);
            setDeductions(firstStructure.deductions);
            setErrorMessage("");
          } else {
            setErrorMessage("No active salary structure found");
          }
        }
      } catch (error) {
        setErrorMessage("Error fetching salary structures.");
        console.error("API fetch error:", error);
      }
    };
    fetchSalaryStructures();
  }, []);

  // Fetch TDS slabs for display purposes
  useEffect(() => {
    const fetchTds = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const financialYear = getCurrentFinancialYear();
        const [startYear, endYear] = financialYear.split('-').map(Number);

        const response = await TdsGetApi();
        const allTdsData = response.data.data;

        const currentYearTds = allTdsData.filter(tds =>
          parseInt(tds.startYear) === startYear &&
          parseInt(tds.endYear) === endYear
        );

        // Extract standard deductions for both regimes
        const newRegimeData = currentYearTds.find(tds => tds.tdsType === "new");
        const oldRegimeData = currentYearTds.find(tds => tds.tdsType === "old");

        setStandardDeduction({
          new: parseInt(newRegimeData?.standardDeduction) || 0,
          old: parseInt(oldRegimeData?.standardDeduction) || 0
        });

        // Keep your existing slab logic
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

        setSelectedTdsSlabs(
          selectedTaxRegime === "new" ? newRegimeSlabs : oldRegimeSlabs
        );
      } catch (error) {
        console.error("Error fetching TDS slabs:", error);
        setStandardDeduction({ new: 0, old: 0 });
        setTdsSlabs({
          new: [],
          old: []
        });
        setSelectedTdsSlabs([]);
      }
    };
    fetchTds();
  }, [selectedTaxRegime]);

  // Calculate TDS for display (not for deduction)
  useEffect(() => {
    if (grossAmount > 0 && selectedTaxRegime) {
      calculateTds(grossAmount, selectedTaxRegime);
    }
  }, [grossAmount, selectedTaxRegime]);

  // Calculate total allowances
  const calculateTotalAllowances = () => {
    let totalAllowances = 0;
    const basicSalaryPercentage = parseFloat(allowances["Basic Salary"]) || 0;
    const hraPercentage = parseFloat(allowances["HRA"]) || 0;
    const basicSalaryAmount = (basicSalaryPercentage / 100) * grossAmount;
    const hraAmount = (hraPercentage / 100) * basicSalaryAmount;
    setBasicAmount(basicSalaryAmount);

    totalAllowances += basicSalaryAmount + hraAmount;

    Object.entries(allowances).forEach(([key, value]) => {
      if (
        key !== "Basic Salary" &&
        key !== "HRA" &&
        key !== "Provident Fund Employer" &&
        key !== "Other Allowances"
      ) {
        if (typeof value === "string" && value.includes("%")) {
          const percentageValue = parseFloat(value.replace("%", ""));
          if (!isNaN(percentageValue)) {
            let allowanceAmount;
            if (key === "HRA" || key === "Provident Fund Employer") {
              allowanceAmount = (percentageValue / 100) * basicSalaryAmount;
            } else {
              allowanceAmount = (percentageValue / 100) * grossAmount;
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
          totalAllowances += numericValue;
        }
      }
    });
    return totalAllowances;
  };

  // Calculate TDS for display only
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

    setTdsAmount(tdsAmount);
    return tdsAmount;
  };

  // Calculate PF contributions
  const calculatePFContributions = () => {
    const basicSalaryPercentage = parseFloat(allowances["Basic Salary"]) || 0;
    const pfEmployeePercentage =
      parseFloat(deductions["Provident Fund Employee"]) || 0;
    const pfEmployerPercentage =
      parseFloat(deductions["Provident Fund Employer"]) || 0;
    const basicSalaryAmount = (basicSalaryPercentage / 100) * grossAmount;
    const pfEmployee = (pfEmployeePercentage / 100) * basicSalaryAmount;
    const pfEmployer = (pfEmployerPercentage / 100) * basicSalaryAmount;
    return {
      pfEmployee,
      pfEmployer,
    };
  };

  // Handle PF limit check and show modal if needed
  const handlePFLimitCheck = () => {
    const { pfEmployee, pfEmployer } = calculatePFContributions();
    const totalPF = pfEmployee + pfEmployer;

    setCalculatedPF({ pfEmployee, pfEmployer });

    if (totalPF !== 43200) {
      updateDeductions(totalPF / 2, totalPF / 2);
    } else {
      updateDeductions(43200 / 2, 43200 / 2);
    }
  };

  // Update deductions (excluding TDS)
  const updateDeductions = (pfEmployee, pfEmployer) => {
    const newDeductions = {
      ...deductions,
      "Provident Fund Employee": pfEmployee.toFixed(2),
      "Provident Fund Employer": pfEmployer.toFixed(2),
    };
    setUpdatedDeductions(newDeductions);
  };

  // Calculate total deductions (excluding TDS)
  const calculateTotalDeductions = () => {
    let total = 0;

    Object.entries(updatedDeductions).forEach(([key, value]) => {
      if (!value) return;

      if (typeof value === "string" && value.includes("%")) {
        const percentageValue = parseFloat(value.replace("%", ""));
        if (!isNaN(percentageValue)) {
          const baseAmount = key.includes("Provident Fund") ? basicAmount : grossAmount;
          total += (percentageValue / 100) * baseAmount;
        }
      } else {
        total += parseFloat(value) || 0;
      }
    });

    return isNaN(total) ? 0 : total;
  };

  // Calculate net salary (gross - deductions, excluding TDS)
  const calculateNetSalary = () => {
    const net = grossAmount - totalDeductions;
    setNetSalary(net);
    if (!isNaN(net)) {
      setAmountInWords(numberToWords(net));
    } else {
      setAmountInWords('');
    }
  };

  // Recalculate when dependencies change
  useEffect(() => {
    const totalAllow = calculateTotalAllowances();
    setTotalAllowances(totalAllow);
    calculateTds(grossAmount, selectedTaxRegime);
  }, [allowances, grossAmount, selectedTaxRegime]);

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

  useEffect(() => {
    const totalDeductions = calculateTotalDeductions();
    setTotalDeductions(totalDeductions);
    calculateNetSalary();
  }, [updatedDeductions, grossAmount]);

  useEffect(() => {
    handlePFLimitCheck();
  }, [grossAmount, allowances, deductions]);

  // Handle allowance changes
  const handleAllowanceChange = (key, newValue) => {
    let validValue = newValue;
    const isPercentage = newValue.includes("%");
    let errorMessage = "";

    if (isPercentage) {
      validValue = newValue.replace(/[^0-9%]/g, "");
      const percentageValue = parseFloat(validValue.replace("%", "")) / 100;
      if (isNaN(percentageValue)) {
        errorMessage = "Invalid percentage value.";
      } else {
        validValue = percentageValue * grossAmount;
        validValue = validValue.toFixed(4);
      }
    } else {
      if (/[^0-9.-]/.test(newValue)) {
        errorMessage = "Only numeric values are allowed.";
      } else {
        validValue = parseFloat(newValue);
        if (isNaN(validValue) || validValue < 0) {
          errorMessage = "Allowance value cannot be negative.";
        }
      }
    }

    if (!errorMessage) {
      setAllowances((prevAllowances) => ({
        ...prevAllowances,
        [key]: validValue,
      }));
    }

    setErrorMessage(errorMessage);
  };

  // Handle deduction changes
  const handleDeductionChange = (key, value) => {
    if (/[a-zA-Z]/.test(value)) {
      setErrorMessage("Alphabetic characters are not allowed.");
      return;
    }

    let validValue = parseFloat(value.replace(/[^0-9.-]/g, ""));
    let errorMessage = "";

    if (value.includes("%")) {
      const percentageValue = validValue / 100;
      validValue = percentageValue * grossAmount;
    }

    if (isNaN(validValue)) {
      errorMessage = "Invalid deduction value.";
    }

    if (validValue < 0) {
      errorMessage = "Deduction value cannot be negative.";
    }

    if (!errorMessage) {
      setDeductions((prevDeductions) => ({
        ...prevDeductions,
        [key]: validValue,
      }));
    }

    setErrorMessage(errorMessage);
  };

  // Handle tax regime change
  const handleTaxRegimeChange = (e) => {
    const regime = e.target.value;
    setSelectedTaxRegime(regime);
    setValue("incomeTax", regime);
    calculateTds(grossAmount, regime);
  };

  // Handle API errors
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

  // Handle Go button click
  const handleGoClick = () => {
    setShowCards(false);
    setShowPfModal(false);

    if (!employeeId) {
      setMessage("Please Select Employee Name");
      setShowFields(false);
    } else {
      setShowFields(true);
      setErrorMessage("");
    }
  };

  // Handle submit button click
  const handleSubmitButtonClick = () => {
    if (!fixedAmount || fixedAmount === 0) {
      toast.error("Please enter fixed amount");
      return;
    }
    const totalDeductions = calculateTotalDeductions();
    const netSalary = grossAmount - totalDeductions;
    setTotalDeductions(totalDeductions);
    setNetSalary(netSalary);

    if (netSalary < 0) {
      setErrorMessage("Net Salary cannot be negative");
    } else {
      setErrorMessage("");
    }

    handlePFLimitCheck();
    setShowPfModal(true);
    setShowCards(true);
  };

  // Handle PF modal close
  const handleModalClose = () => {
    const { pfEmployee, pfEmployer } = calculatedPF;

    if (selectedPF === "calculated") {
      updateDeductions(pfEmployee, pfEmployer);
    } else {
      const fixedPF = 43200 / 2;
      updateDeductions(fixedPF, fixedPF);
    }
    setShowPfModal(false);
  };

  // Handle employee selection change
  const handleEmployeeChange = (selectedOption) => {
    clearForm();
    setEmployeeId(selectedOption.value);
  };

  // Handle variable amount change
  const handleVariableAmountChange = (e) => {
    setVariableAmount(parseFloat(e.target.value) || 0);
    setValue("variableAmount", e.target.value, { shouldValidate: true });
  };

  const calculateAllowances = () => {
    // calculateTotalAllowances();
    calculateTotalDeductions();
    setShowCards(true);
  };

  // Handle fixed amount change
  const handleFixedAmountChange = (e) => {
    setFixedAmount(parseFloat(e.target.value) || 0);
    setValue("fixedAmount", e.target.value, { shouldValidate: true });
  };

  // Calculate gross amount when variable or fixed amount changes
  useEffect(() => {
    const newGrossSalary = variableAmount + fixedAmount;
    setGrossAmount(newGrossSalary);
    if (!isNaN(newGrossSalary)) {
      setGrossInWords(numberToWords(newGrossSalary));
    } else {
      setGrossInWords('');
    }
  }, [variableAmount, fixedAmount]);

  // Calculate monthly salary and LOP per day
  useEffect(() => {
    const monthlySalaryValue = parseFloat(grossAmount || 0) / 12;
    setMonthlySalary(monthlySalaryValue.toFixed(2));

    const workingDaysPerMonth = 30;
    const lopPerDayValue = monthlySalaryValue / workingDaysPerMonth;
    setLossOfPayPerDay(lopPerDayValue.toFixed(2));
  }, [grossAmount]);

  // Form submission handler
  const onSubmit = (data) => {
    setFormSubmitted(true);
    if (error) {
      toast.error(error);
      return;
    }

    // Convert form data
    const fixedAmount = Number(data.fixedAmount) || 0;
    const variableAmount = Number(data.variableAmount) || 0;
    const grossAmountValue = Number(grossAmount) || 0;
    const netSalaryValue = Number(netSalary) || 0;
    const totalDeductionsValue = Number(totalDeductions) || 0;
    const incomeTax = selectedTaxRegime;
    const statusValue = data.status;
    const addSalaryDate = new Date().toISOString().split("T")[0];

    if (variableAmount === 0 && fixedAmount === 0 && grossAmountValue === 0) {
      return;
    }
    if (!fixedAmount || fixedAmount === 0) {
      toast.error("Please enter fixed amount");
      return;
    }

    // Process allowances
    const allowancesData = {};
    Object.entries(allowances).forEach(([key, value]) => {
      let numericValue = 0;

      if (typeof value === 'string' && value.includes('%')) {
        const percentage = parseFloat(value.replace('%', ''));
        if (!isNaN(percentage)) {
          numericValue = key === "HRA"
            ? (percentage / 100) * basicAmount
            : (percentage / 100) * grossAmountValue;
        }
      } else {
        numericValue = parseFloat(value) || 0;
      }

      allowancesData[key] = numericValue.toFixed(2);
    });

    // Process deductions (excluding TDS)
    const deductionsData = {};
    Object.entries(deductions).forEach(([key, value]) => {
      if (key === "TDS") return; // Skip TDS

      let numericValue = 0;

      if (typeof value === 'string' && value.includes('%')) {
        const percentage = parseFloat(value.replace('%', ''));
        if (!isNaN(percentage)) {
          numericValue = key.includes("Provident Fund")
            ? (percentage / 100) * basicAmount
            : (percentage / 100) * grossAmountValue;
        }
      } else {
        numericValue = parseFloat(value) || 0;
      }

      if (selectedPF === "fixed" && key.includes("Provident Fund")) {
        numericValue = 43200 / 2;
      }

      deductionsData[key] = numericValue.toFixed(2);
    });

    // Prepare data for submission
    const dataToSubmit = {
      companyName: authUser.company,
      fixedAmount: fixedAmount.toFixed(2),
      variableAmount: variableAmount.toFixed(2),
      grossAmount: grossAmountValue.toFixed(2),
      salaryConfigurationEntity: {
        allowances: allowancesData,
        deductions: deductionsData,
      },
      totalEarnings: grossAmountValue.toFixed(2),
      netSalary: netSalaryValue.toFixed(2),
      totalDeductions: totalDeductionsValue.toFixed(2),
      tdsType: incomeTax,
      tdsAmount: tdsAmount.toFixed(2), // Store TDS separately
      addSalaryDate: addSalaryDate,
      status: statusValue,
    };

    // Determine whether to create or update
    const apiCall = salaryId
      ? () => EmployeeSalaryPatchApiById(employeeId, salaryId, dataToSubmit)
      : () => EmployeeSalaryPostApi(employeeId, dataToSubmit);

    // Execute API call
    apiCall()
      .then((response) => {
        toast.success(
          salaryId
            ? "Employee Salary Updated Successfully"
            : "Employee Salary Added Successfully"
        );
        setError("");
        setShowFields(false);
        navigate("/employeeview");
      })
      .catch((error) => {
        handleApiErrors(error);
      });
  };

  const calculationPopover = (
    <Popover id="popover-basic" style={{ maxWidth: "300px", borderRadius: "8px", border: "1px solid #17a2b8" }}>
      <Popover.Header as="h6" className="bg-info text-white text-center">
        Calculation Method
      </Popover.Header>
      <Popover.Body className="bg-light">
        <ul className="mb-0">
          <li>Entire salary taxed at a single rate based on which taxslab it falls into.</li>
          <li>Current regime: <strong>{selectedTaxRegime === "new" ? "New" : "Old"}</strong></li>
          <li>Financial Year: <strong>{getCurrentFinancialYear()}</strong></li>
          {applicableSlab && (
            <li>Your salary of ₹{grossAmount.toLocaleString('en-IN')} falls in the {applicableSlab.taxPercentage}% taxslab.</li>
          )}
        </ul>
      </Popover.Body>
    </Popover>
  );

  // Clear form
  const clearForm = () => {
    reset(); // Reset react-hook-form
    setShowFields(false);
    setShowCards(false);
    setFixedAmount(0);
  };

  // Render UI
  return (
    <LayOut>
      <div className="container-fluid p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
            <div className="col">
              <h1 className="h3 mb-3">
                <strong>Manage Salary</strong>
              </h1>
            </div>
            <div className="col-auto" style={{ paddingBottom: "20px" }}>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to="/main" className="custom-link">Home</Link>
                  </li>
                  <li className="breadcrumb-item active">Payroll</li>
                  <li className="breadcrumb-item active">Manage Salary</li>
                </ol>
              </nav>
            </div>
          </div>
          <div className="row">
            {showFields ? (
              <>
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title" style={{ marginBottom: "0px" }}>
                        Salary Details
                      </h5>
                    </div>
                    <div className="card-body" style={{ marginLeft: "20px" }}>
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
                            className={`form-control ${formSubmitted && !fixedAmount ? 'is-invalid' : ''}`}
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
                          {formSubmitted && !fixedAmount && (
                            <div className="invalid-feedback">
                              Please enter fixed amount
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
                            value={grossAmount}
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
                  <Loader />
                ) : (
                  showCards && (
                    <>
                      <div className="row col-lg-12 d-flex">
                        <div className="col-6 mb-4">
                          <div className="card">
                            <div className="card-header">
                              <h5 className="card-title" style={{ marginBottom: "0px" }}>
                                Allowances
                              </h5>
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
                                })}

                              <div className="mb-3">
                                <label>Total Allowances:</label>
                                <input
                                  className="form-control"
                                  type="text"
                                  name="totalAllowance"
                                  maxLength={7}
                                  value={Math.round(totalAllowances)}
                                  readOnly
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
                                <h5 className="card-title me-2" style={{ marginBottom: "0px" }}>
                                  Status
                                </h5>
                                <span className="text-danger">
                                  {errors.status && (
                                    <p className="mb-0">{errors.status.message}</p>
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

                        <div className="col-6 mb-4">
                          <div className="card">
                            <div className="card-header">
                              <div className="d-flex justify-content-start align-items-start">
                                <h5 className="card-title me-2" style={{ marginBottom: "0px" }}>
                                  Tax Deduction at Source (TDS)
                                </h5>
                                <span className="text-danger">
                                  {errors.incomeTax && (
                                    <p className="mb-0">{errors.incomeTax.message}</p>
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
                                        {...register("incomeTax", {
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
                                        {...register("incomeTax", {
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
                                {/* In your TDS card section */}
                                <div className="col-md-12 mb-3">
                                  <label className="form-label">Standard Deduction</label>
                                  <div className="d-flex align-items-center">
                                    <span className="badge bg-primary me-2">
                                      ₹{standardDeduction[selectedTaxRegime].toLocaleString('en-IN')}
                                    </span>
                                    <span>
                                      {selectedTaxRegime === "new" ? "New" : "Old"} regime standard deduction
                                    </span>
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
                              <h5 className="card-title" style={{ marginBottom: "0px" }}>
                                Deductions
                              </h5>
                            </div>
                            <div className="card-body" style={{ paddingLeft: "20px" }}>
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
                                      readOnly={["Provident Fund Employee", "Provident Fund Employer"].includes(key)}
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
                                  maxLength={7}
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
                              <h5
                                className="card-title"
                                style={{ marginBottom: "0px" }}
                              >
                                Net Salary
                              </h5>
                            </div>
                            <div
                              className="card-body"
                              style={{ paddingLeft: "20px" }}
                            >
                              <div className="mb-3">
                                <label>Net Salary</label>
                                <input
                                  className="form-control"
                                  type="text"
                                  name="netSalary"
                                  value={Math.round(netSalary.toFixed(2))}
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
              </>
            ) : (
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title" style={{ marginBottom: "0px" }}>
                      Employee Details
                    </h5>
                    <div
                      className="dropdown-divider"
                      style={{ borderTopColor: "#d7d9dd" }}
                    />
                  </div>
                  <div className="card-body" style={{ padding: "0 0 0 25%" }}>
                    <div className="mb-4">
                      <div className="row align-items-center">
                        <div className="col-12 d-flex align-items-center">
                          <div
                            className="mt-3"
                            style={{ flex: "1 1 auto", maxWidth: "400px" }}
                          >
                            <label className="form-label">
                              Select Employee Name
                            </label>
                            <Select
                              options={employes}
                              onChange={handleEmployeeChange}
                              placeholder="Select Employee Name"
                            />
                          </div>
                          <div style={{ marginTop: "27px" }}>
                            <div
                              className="mt-3 ml-3"
                              style={{ marginLeft: "20px" }}
                            >
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleGoClick}
                              >
                                Go
                              </button>
                            </div>
                          </div>
                        </div>
                        {message && (
                          <div
                            className="errorMsg mt-2"
                            style={{ marginLeft: "10px" }}
                          >
                            {message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
        <Modal
          show={showPfModal}
          onHide={() => setShowPfModal(false)}
          centered
          style={{ zIndex: "1050" }}
          className="custom-modal"
        >
          <ModalHeader>
            <div className="d-flex justify-content-between align-items-center w-100">
              <ModalTitle className="text-center mb-0 flex-grow-1">
                Confirm Provident Fund Option
              </ModalTitle>
              <button
                type="button"
                className="custom-close-btn"
                aria-label="Close"
                onClick={() => setShowPfModal(false)}
              >
                ×
              </button>
            </div>
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
                Calculated PF: ₹
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
                Calculated PF: ₹43,200 per year
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
            <Button variant="secondary" onClick={() => setShowPfModal(false)}>
              Cancel
            </Button>
          </div>
        </Modal>
      </div>
    </LayOut>
  );
};

export default EmployeeSalaryStructure;
