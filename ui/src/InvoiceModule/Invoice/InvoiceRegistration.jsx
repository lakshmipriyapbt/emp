import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast, Bounce } from "react-toastify";
import Select from "react-select";
import LayOut from "../../LayOut/LayOut";
import { useAuth } from "../../Context/AuthContext";
import { InvoicePostApi } from "../../Utils/Axios";
import { fetchCustomers } from "../../Redux/CustomerSlice";
import { fetchBanks } from "../../Redux/BankSlice";
import DeletePopup from "../../Utils/DeletePopup";
import { TemplateGetAPI } from "../../Utils/Axios";
import InvoicePreview from "../../CompanyModule/Settings/InvoiceTemplates/InvoicePreview";

const InvoiceRegistration = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset, watch,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  // Select data from Redux store
  // const customers = useSelector(selectCustomers) || []; // Ensure it's an array
  //const products = useSelector(selectProducts);
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.customers);
  const { products } = useSelector((state) => state.products);
  const { banks } = useSelector((state) => state.banks);
  const [productData, setProductData] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [invoiceData, setInvoiceData] = useState(null);
  const [productColumns, setProductColumns] = useState([
    { key: "items", title: "Item", type: "text" },
    { key: "hsn", title: "HSN-no", type: "text" },
    { key: "service", title: "Service", type: "text" },
    { key: "quantity", title: "Quantity", type: "number" },
    { key: "unitCost", title: "Unit Cost", type: "number" },
    { key: "gstPercentage", title: "GST (%)", type: "number" },
    { key: "totalCost", title: "Total Cost", type: "number" },
  ]);
  const authUser = useAuth();
  const company = authUser?.company || {};
  console.log("Company Data***", company);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const { employee } = useAuth();
  const companyId = employee?.companyId;
  const [showPreview, setShowPreview] = useState(false);
  const [load, setLoad] = useState(false); // to manage loading state for API calls
  const [customer, setCustomer] = useState(customers); // List of customers for the dropdown
  const [product, setProduct] = useState(products);
  const [formattedProducts, setFormattedProducts] = useState(products);
  const [formattedBanks, setFormattedBanks] = useState(banks);
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateAvailable, setTemplateAvailable] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [templateFields, setTemplateFields] = useState({
    showShipTo: false,
    showNotes: false,
    showSalesPerson: false,
    showShippingMethod: false,
    showShippingTerms: false,
    showPaymentTerms: false,
    showDeliveryDate: false
  });

  useEffect(() => {
    dispatch(fetchCustomers(companyId));
    // dispatch(fetchProducts());
    dispatch(fetchBanks(companyId));
  }, [dispatch, companyId]);

  const subTotal = parseFloat(
    productData.reduce(
      (sum, row) => sum + (parseFloat(row.totalCost) || 0),
      0
    ).toFixed(2)
  );

  const validateInput = (type, value) => {
    if (/^\s$/.test(value)) return false; // Disallow leading & trailing spaces
    if (type === "text") return /^[a-zA-Z0-9 _\-.,&()]+$/.test(value); // Allows letters, numbers, spaces, and special characters
    if (type === "number") return /^\d+(\.\d{1,2})?$/.test(value);
    if (type === "percentage") return /^([0-9]{1,2}|100)%?$/.test(value); // 1-3 digits with %
    return true;
  };
  const validateField = (index, key, value) => {
    const normalizedKey = key.toLowerCase() === "quantity" ? "quantity" : key;

    const fieldValidations = {
      items: {
        minLength: 3,
        maxLength: 250,
        errorMessage: "Item must be between 3-250 characters"
      },
      hsn: {
        minLength: 4,
        maxLength: 12,
        errorMessage: "HSN must be between 4-12 characters",
        pattern: /^[0-9]+$/,
        patternMessage: "HSN must contain only numbers"
      },
      service: {
        minLength: 3,
        maxLength: 60,
        errorMessage: "Service must be between 3-60 characters"
      }
    };

    const fieldValidation = fieldValidations[normalizedKey];
    if (!fieldValidation) return true;

    if (value.length < fieldValidation.minLength || value.length > fieldValidation.maxLength) {
      setFieldErrors((prev) => ({
        ...prev,
        [index]: {
          ...(prev[index] || {}),
          [normalizedKey]: fieldValidation.errorMessage,
        },
      }));
      return false;
    }

    if (fieldValidation.pattern && !fieldValidation.pattern.test(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        [index]: {
          ...(prev[index] || {}),
          [normalizedKey]: fieldValidation.patternMessage,
        },
      }));
      return false;
    }

    return true;
  };

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const res = await TemplateGetAPI(companyId);
      const templateNumber = res.data.data.invoiceTemplateNo;
      setSelectedTemplate(templateNumber);
      setTemplateAvailable(!!templateNumber);

      // Set fields visibility based on template
      if (templateNumber === "1") {
        setTemplateFields({
          showShipTo: true,
          showNotes: true,
          showSalesPerson: false,
          showShippingMethod: false,
          showShippingTerms: false,
          showPaymentTerms: false,
          showDeliveryDate: false
        });
      } else if (templateNumber === "2") {
        setTemplateFields({
          showShipTo: false,
          showNotes: false,
          showSalesPerson: true,
          showShippingMethod: true,
          showShippingTerms: true,
          showPaymentTerms: true,
          showDeliveryDate: true
        });
      }
    } catch (error) {
      handleError(error);
      setTemplateAvailable(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return ""; // If the date is falsy, return an empty string

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0"); // Get the day, ensuring two digits
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Get the month (0-indexed)
    const year = d.getFullYear(); // Get the full year

    return `${day}-${month}-${year}`;
  };

  // Calculate tax (example 10%)
  const calculateTax = (subtotal) => {
    return (subtotal * 0.1).toFixed(2);
  };

  // Calculate total including tax
  const calculateTotal = (subtotal) => {
    return (parseFloat(subtotal) * 1.1).toFixed(2);
  };


  const updateData = (index, key, value) => {
    const colType = productColumns.find((col) => col.key.toLowerCase() === key.toLowerCase())?.type || "text";
    const normalizedKey = key.toLowerCase() === "quantity" ? "quantity" : key;

    // Field-specific validation rules
    const fieldValidations = {
      items: {
        minLength: 3,
        maxLength: 250,
        errorMessage: "Item must be between 3-250 characters",
      },
      hsn: {
        minLength: 4,
        maxLength: 12,
        errorMessage: "HSN must be between 4-12 characters",
        pattern: /^[0-9]+$/, // Only numbers allowed
        patternMessage: "HSN must contain only numbers",
      },
      service: {
        minLength: 3,
        maxLength: 60,
        errorMessage: "Service must be between 3-60 characters",
      },
    };

    // Always update the field value (allow typing)
    setProductData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = { ...updatedData[index], [normalizedKey]: value };

      // Auto-calculate totalCost if quantity/unitCost/GST changes
      if (["quantity", "unitCost", "gstPercentage"].includes(normalizedKey)) {
        const quantity = parseFloat(updatedData[index].quantity) || 0;
        const unitCost = parseFloat(updatedData[index].unitCost) || 0;
        const gstPercentage = parseFloat(updatedData[index].gstPercentage) || 0;

        if (value === "") {
          updatedData[index].totalCost = "";
        } else {
          const subTotal = quantity * unitCost;
          const gstAmount = (subTotal * gstPercentage) / 100;
          updatedData[index].totalCost = (subTotal + gstAmount).toFixed(2);
        }
      }

      return updatedData;
    });

    // Validate in real-time (but don't block input)
    const fieldValidation = fieldValidations[normalizedKey];
    if (fieldValidation) {
      let error = null;

      // Check min/max length
      if (value.length > 0 && (value.length < fieldValidation.minLength || value.length > fieldValidation.maxLength)) {
        error = fieldValidation.errorMessage;
      }

      // Check HSN pattern (if applicable)
      if (normalizedKey === "hsn" && fieldValidation.pattern && !fieldValidation.pattern.test(value) && value.length > 0) {
        error = fieldValidation.patternMessage;
      }

      // Update errors (if any)
      setFieldErrors((prev) => ({
        ...prev,
        [index]: {
          ...(prev[index] || {}),
          [normalizedKey]: error,
        },
      }));
    }
  };

  useEffect(() => {
    if (Array.isArray(products)) {
      const productOptions = products.map((product) => ({
        value: product.productId,
        label: product.productName,
        hsnNo: product.hsnNo,
        productCost: product.productCost,
      }));
      setFormattedProducts(productOptions);
    }
  }, [products]);

  useEffect(() => {
    if (companyId) {
      console.log("fetchBanks", fetchBanks);
      dispatch(fetchBanks(companyId));
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    console.log("Banks from Redux store:", banks);
  }, [banks]);

  // Filter banks based on search term
  useEffect(() => {
    if (Array.isArray(banks)) {
      const bankOptions = banks.map((bank) => ({
        value: bank.bankId,
        label: bank.bankName,
        // Include the full bank object
        bankData: bank
      }));
      setFormattedBanks(bankOptions);
    }
  }, [banks]);
  const handleCustomerChange = (selectedOption) => {
    setInvoiceData(selectedOption);
    console.log("selectedOption", selectedOption);
    //setValue("vendorCode", selectedOption.value);
  };

  useEffect(() => {
    if (companyId) {
      dispatch(fetchCustomers(companyId));
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    console.log("Customers from Redux store:", customers);
  }, [customers]);

  useEffect(() => {
    if (customers && Array.isArray(customers)) {
      const result = customers.filter((customer) =>
        customer.customerName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredData(result);
    } else {
      setFilteredData([]);
    }
  }, [search, customers]);

  useEffect(() => {
    console.log("Customers from Redux store:", products);
  }, [products]);

  useEffect(() => {
    if (products && Array.isArray(products)) {
      const result = products.filter((product) =>
        product.productName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredData(result);
    } else {
      setFilteredData([]);
    }
  }, [search, products]);

  useEffect(() => {
    // Check if customers is an array before using map
    const productOptions = Array.isArray(products)
      ? products.map((prod) => ({
        value: prod.productId,
        label: prod.productName,
      }))
      : [];

    setProduct(productOptions);
    console.log(productOptions);
  }, [products]);

  useEffect(() => {
    // Check if customers is an array before using map
    const customerOptions = Array.isArray(customers)
      ? customers.map((cust) => ({
        value: cust.customerId,
        label: cust.customerName,
      }))
      : [];

    setCustomer(customerOptions);
    console.log(customerOptions);
  }, [customers]);

  const onSubmit = (data) => {
    // Find the full customer and bank details
    const selectedCustomer = customers.find(
      cust => cust.customerId === data.customerName.value
    );

    const selectedBankOption = formattedBanks.find(
      bank => bank.value === data.bankName
    );
    const selectedBank = selectedBankOption?.bankData;

    // Format product data
    const formattedProductData = productData.map((item, index) => ({
      id: index + 1,
      productName: item.items || 'Unnamed Product',
      quantity: item.quantity || 0,
      price: item.unitCost || 0,
      total: item.totalCost || 0
    }));

    // Prepare the complete preview data
    const previewData = {
      // Company info
      company: {
        companyName: company?.companyName,
        address: company?.companyAddress || company?.address,
        emailId: company?.emailId,
        mobileNo: company?.mobileNo,
        imageFile: company?.imageFile,
        stampImage: company?.stampImage
      },

      // Customer info
      billedTo: {
        customerName: selectedCustomer?.customerName || '',
        address: selectedCustomer?.address || '',
        mobileNumber: selectedCustomer?.mobileNumber || '',
        email: selectedCustomer?.email || '',
        customerGstNo: selectedCustomer?.customerGstNo || ''
      },

      // Shipping info (if different from billedTo)
      shippedTo: {
        customerName: data.shipToName || selectedCustomer?.customerName || '',
        address: data.shipToAddress || selectedCustomer?.address || '',
        mobileNumber: data.shipToMobile || selectedCustomer?.mobileNumber || ''
      },

      // Invoice details
      invoiceNo: `INV-${Date.now()}`,
      invoiceDate: data.invoiceDate || '',
      dueDate: data.dueDate || '',
      purchaseOrder: data.purchaseOrder || '',

      // Product details
      productData: formattedProductData,
      productColumns: [
        { key: "productName", title: "Product Name", type: "text" },
        { key: "quantity", title: "Quantity", type: "number" },
        { key: "price", title: "Price", type: "number" },
        { key: "total", title: "Total", type: "number" }
      ],

      // Financial details
      subTotal: subTotal.toFixed(2),
      notes: data.notes || '',

      // Bank details
      bankDetails: selectedBank || {
        bankName: '',
        accountNumber: '',
        accountType: '',
        branch: '',
        ifscCode: '',
        address: ''
      },

      // Additional fields for Template 2
      salesPerson: data.salesPerson || '',
      shippingMethod: data.shippingMethod || '',
      shippingTerms: data.shippingTerms || '',
      paymentTerms: data.paymentTerms || 'Net 30',
      deliveryDate: data.deliveryDate || ''
    };

    setPreviewData(previewData);
    setSubmissionData({
      ...previewData,
      customerId: selectedCustomer?.customerId,
      bankId: selectedBank?.bankId
    });
    setShowPreview(true);
  };

  const handleConfirmSubmission = async () => {
    try {
      // Ensure these values are properly set
      const companyId = company?.id; // Changed from company?.companyId
      const customerId = submissionData?.customerId;

      console.log("Submitting with:", {
        companyId,
        customerId,
        data: submissionData
      });

      if (!companyId) {
        throw new Error("Company ID is missing");
      }

      if (!customerId) {
        throw new Error("Customer ID is missing");
      }

      const response = await InvoicePostApi(
        companyId,
        customerId,
        submissionData
      );

      if (response) {
        setShowPreview(false);
        reset();
        toast.success("Invoice created successfully!");

        // ✅ Redirect to invoice view page
        navigate("/invoiceView");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error(`Failed to create invoice: ${error.message}`);
    }
  };
  const handleError = (errors) => {
    if (errors.response) {
      const status = errors.response.status;
      let errorMessage = "";

      switch (status) {
        case 403:
          errorMessage = "Session Timeout!";
          navigate("/");
          break;
        case 404:
          errorMessage = "Resource Not Found!";
          break;
        case 406:
          errorMessage = "Invalid Details!";
          break;
        case 500:
          errorMessage = "Server Error!";
          break;
        default:
          errorMessage = "An Error Occurred!";
          break;
      }

      toast.error(errorMessage, {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
    } else {
      // toast.error("Network Error!", {
      //   position: "top-right",
      //   transition: Bounce,
      //   hideProgressBar: true,
      //   theme: "colored",
      //   autoClose: 3000,
      // });
    }
  };

  const handleClearForm = () => {
    reset({
      customerName: null,
      purchaseOrder: "",
      vendorCode: "",
      invoiceDate: "",
      dueDate: "",
      bankName: null,
      products: [],
      shipToName: "",
      shipToAddress: "",
      shipToMobile: "",
      notes: "",
      salesPerson: "",
      shippingMethod: "",
      shippingTerms: "",
      paymentTerms: "",
      deliveryDate: ""
    });

    setProductData([]);  // Clear product rows
    toast.info("Form cleared!", { position: "top-right", autoClose: 1000 });
  };

  const handleDeleteColumn = (key) => {
    setSelectedItemId(key);
    setDeleteType("column");
    setShowDeleteModal(true);
  };

  // Open delete popup for a row
  const handleDeleteRow = (index) => {
    setSelectedItemId(index);
    setDeleteType("row");
    setShowDeleteModal(true);
  };

  // Close the popup
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedItemId(null);
    setDeleteType(null);
  };

  const handleConfirmDelete = (id) => {
    if (deleteType === "column") {
      setProductColumns(productColumns.filter((col) => col.key !== id));
      setProductData(
        productData.map((row) => {
          const newRow = { ...row };
          delete newRow[id];
          return newRow;
        })
      );
    } else if (deleteType === "row") {
      setProductData(productData.filter((_, index) => index !== id));
    }
    handleCloseDeleteModal();
  };

  const handleInvoiceDateChange = (e) => {
    const inputValue = e.target.value;
    if (!inputValue) {
      setValue("dueDate", "");
      return;
    }
    const invoiceDate = new Date(inputValue);
    if (isNaN(invoiceDate)) {
      setValue("dueDate", "");
      return;
    }
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(invoiceDate.getDate() + 15);
    setValue("dueDate", dueDate.toISOString().split("T")[0]);
  };

  const joiningDate = watch("invoiceDate");

  const validateDueDate = (dueDate) => {
    if (!joiningDate) return "Invoice Date is required before selecting End Date";

    const joinDateObj = new Date(joiningDate);
    const endDateObj = new Date(dueDate);
    const maxEndDate = new Date(joinDateObj);
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1); // 12 months ahead

    if (endDateObj < joinDateObj) {
      return "Due Date cannot be before Invoice Date";
    }
    if (endDateObj > maxEndDate) {
      return "Due Date cannot exceed 1 month from Invoice Date";
    }
    return true;
  };

  useEffect(() => {
    // Dynamically update the max End Date and Accept Date based on the joiningDate
    if (joiningDate) {
      const joiningDateObj = new Date(joiningDate);

      // Set max End Date to 12 months after the joiningDate
      const maxEndDate = new Date(joiningDateObj);
      maxEndDate.setMonth(maxEndDate.getMonth() + 1);
      setValue("dueDate", maxEndDate.toISOString().split("T")[0]);
    }
  }, [joiningDate, setValue]);

  useEffect(() => {
    const invoiceDate = document.getElementById("invoiceDate").value;
    if (invoiceDate) {
      handleInvoiceDateChange({ target: { value: invoiceDate } });
    }
  }, []);

  const updateColumnType = (key, type) => {
    setProductColumns(
      productColumns.map((col) => (col.key === key ? { ...col, type } : col))
    );
  };
  const addColumn = () => {
    if (productColumns.length >= 8) {
      toast.error("You cannot add more than 8 columns.");
      return;
    }

    const newKey = `custom_${productColumns.length}`;
    const newColumn = { key: newKey, title: "New Field", type: "text" };

    const totalCostIndex = productColumns.findIndex(
      (col) => col.key === "totalCost"
    );

    const updatedColumns =
      totalCostIndex !== -1
        ? [
          ...productColumns.slice(0, totalCostIndex),
          newColumn,
          ...productColumns.slice(totalCostIndex),
        ]
        : [...productColumns, newColumn];

    setProductColumns(updatedColumns);
  };
  const updateColumnTitle = (key, title) => {
    // Allow temporary clearing while the employee is typing
    if (title === "") {
      setProductColumns(
        productColumns.map((col) =>
          col.key === key ? { ...col, title: "" } : col
        )
      );
      return;
    }

    // Trim the title to avoid issues with spaces
    const trimmedTitle = title.trim();

    // Prevent invalid titles when the employee confirms the change
    if (trimmedTitle === "New Field") {
      toast.error("Column title cannot be 'New Field'. Please enter a valid title.");
      return;
    }

    // Update the column title
    setProductColumns(
      productColumns.map((col) =>
        col.key === key
          ? { ...col, title: key === "totalCost" ? "Total Amount" : trimmedTitle }
          : col
      )
    );
  };


  const addRow = () => setProductData([...productData, {}]);

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Invoice Registration</strong>{" "}
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Invoices</li>
                <li className="breadcrumb-item active">Invoice Registration</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title" style={{ marginBottom: "0px" }}>
                  Invoice Registration Form
                </h5>
                <div
                  className="dropdown-divider"
                  style={{ borderTopColor: "#d7d9dd" }}
                />
              </div>
              <form
                className="form-horizontal"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="card-body">
                  <h4 className="ml-3" style={{ marginTop: "20px" }}>
                    <b>Invoice Details</b>
                  </h4>

                  {/* Customer Name Dropdown */}
                  <div className="form-group row mt-5">
                    <label
                      htmlFor="customer"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Client Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <Controller
                        name="customerName"
                        id="customerName"
                        control={control}
                        rules={{ required: "Client Name is required" }} // Mandatory validation rule
                        render={({ field }) => (
                          <Select
                            {...field} // Spread the controller's field props
                            options={customer} // Pass the formatted customer options
                            onChange={(selectedOption) => {
                              handleCustomerChange(selectedOption); // Handle the change event
                              field.onChange(selectedOption); // Ensure react-hook-form is updated
                            }}
                            getOptionLabel={(e) => e.label} // Customizing label if needed
                            getOptionValue={(e) => e.value} // Customizing value if needed
                          />
                        )}
                      />
                      {errors.customerName && (
                        <p
                          className="errorMsg"
                          style={{ marginLeft: "6px", marginBottom: "0" }}
                        >
                          {errors.customerName.message}
                        </p> // Display error message
                      )}
                    </div>
                  </div>

                  <div className="form-group row mt-1">
                    <label
                      htmlFor="bankName"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Bank Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <Controller
                        name="bankName" // This is the field name in the form
                        control={control}
                        rules={{ required: "Bank Name is required" }} // Validation rule
                        render={({ field }) => (
                          <Select
                            {...field} // Spread the react-hook-form field props
                            options={formattedBanks} // The list of bank options
                            value={
                              formattedBanks.find(
                                (bank) => bank.value === field.value
                              ) || null
                            } // Find the selected bank by matching value (bankId)
                            onChange={(selectedOption) => {
                              // Handle bank selection
                              console.log("Selected Bank Option:", selectedOption);
                              field.onChange(
                                selectedOption ? selectedOption.value : null
                              ); // Update the bankId (value) in form
                            }}
                            getOptionLabel={(e) => e.label} // Display the bank name (label) in the dropdown
                            getOptionValue={(e) => e.value} // The value corresponds to bankId
                          />
                        )}
                      />
                      {errors.bankName && (
                        <p
                          className="errorMsg"
                          style={{ marginLeft: "6px", marginBottom: "0" }}
                        >
                          {errors.bankName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Vendor Code */}
                  <div className="form-group row">
                    <label
                      htmlFor="vendorCode"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Vendor Code <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        name="vendorCode"
                        id="vendorCode"
                        placeholder="Enter Vendor Code"
                        {...register("vendorCode", {
                          required: "Vendor Code is required",
                          pattern: {
                            value: /^(?=.*\d)(?=.*[A-Za-z0-9])[\dA-Za-z()\-_/&]+$/,
                            message: "Must contain at least one number. Only alphabets are not allowed."
                          },
                          minLength: {
                            value: 3,
                            message:
                              "Vendor Code must be at least 3 characters long",
                          },
                          maxLength: {
                            value: 10,
                            message: "Vendor Code cannot exceed 10 characters",
                          },
                        })}
                      />
                      {errors.vendorCode && (
                        <p
                          className="errorMsg"
                          style={{ marginLeft: "6px", marginBottom: "0" }}
                        >
                          {errors.vendorCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Purchase Order */}
                  <div className="form-group row">
                    <label
                      htmlFor="purchaseOrder"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Purchase Order <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        name="purchaseOrder"
                        id="purchaseOrder"
                        placeholder="Enter Purchase Order"
                        {...register("purchaseOrder", {
                          required: "Purchase Order is required",
                          pattern: {
                            value: /^(?=.*\d)(?=.*[A-Za-z0-9])[\dA-Za-z()\-_/&]+$/,
                            message: "Must contain at least one number. Only alphabets are not allowed."
                          },
                          minLength: {
                            value: 3,
                            message:
                              "Purchase Order must be at least 3 characters long",
                          },
                          maxLength: {
                            value: 10,
                            message:
                              "Purchase Order cannot exceed 10 characters",
                          },
                        })}
                      />
                      {errors.purchaseOrder && (
                        <p
                          className="errorMsg"
                          style={{ marginLeft: "6px", marginBottom: "0" }}
                        >
                          {errors.purchaseOrder.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Invoice Date */}
                  <div className="form-group row">
                    <label
                      htmlFor="invoiceDate"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Invoice Date <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="date"
                        className="form-control"
                        name="invoiceDate"
                        id="invoiceDate"
                        autoComplete="off"
                        max={new Date().toISOString().split("T")[0]} // Restricts future dates
                        onClick={(e) => e.target.showPicker()}
                        {...register("invoiceDate", {
                          required: "Invoice Date is required",
                        })}
                      />
                      {errors.invoiceDate && (
                        <p
                          className="errorMsg"
                          style={{ marginLeft: "6px", marginBottom: "0" }}
                        >
                          {errors.invoiceDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="form-group row">
                    <label
                      htmlFor="dueDate"
                      className="col-sm-2 text-right control-label col-form-label"
                    >
                      Due Date
                    </label>
                    <div className="col-sm-9 mb-3">
                      <input
                        type="date"
                        className="form-control"
                        name="dueDate"
                        id="dueDate"
                        autoComplete="off"
                        onClick={(e) => e.target.showPicker()}
                        {...register("dueDate", {
                          required: "Due Date is required",
                          validate: validateDueDate
                        })}
                      />
                      {errors.dueDate && (
                        <p className="errorMsg" style={{ marginLeft: "6px" }}>
                          {errors.dueDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {templateFields.showShipTo && (
                    <>
                      <div className="form-group row">
                        <label htmlFor="shipToName" className="col-sm-2 text-right control-label col-form-label">
                          Ship To Name
                        </label>
                        <div className="col-sm-9 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Ship To Name"
                            id="shipToName"
                            {...register("shipToName", {
                              required: "Ship To Name is required",
                              minLength: {
                                value: 3,
                                message:
                                  "Ship To Name must be at least 3 characters long",
                              },
                              maxLength: {
                                value: 10,
                                message: "Ship To Name cannot exceed 10 characters",
                              },
                            })}
                          />
                          {errors.shipToName && (
                            <p
                              className="errorMsg"
                              style={{ marginLeft: "6px", marginBottom: "0" }}
                            >
                              {errors.shipToName.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="form-group row">
                        <label htmlFor="shipToAddress" className="col-sm-2 text-right control-label col-form-label">
                          Ship To Address
                        </label>
                        <div className="col-sm-9 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            id="shipToAddress"
                            placeholder="Enter Ship To Address"
                            {...register("shipToAddress", {
                              required: "Ship To Address is required",
                              minLength: {
                                value: 3,
                                message: "Ship To Address must be at least 3 characters long",
                              },
                              maxLength: {
                                value: 100,
                                message: "Ship To Address cannot exceed 100 characters",
                              },
                            })}
                          />
                          {errors.shipToAddress && (
                            <p
                              className="errorMsg"
                              style={{ marginLeft: "6px", marginBottom: "0" }}
                            >
                              {errors.shipToAddress.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="form-group row">
                        <label htmlFor="shipToMobile" className="col-sm-2 text-right control-label col-form-label">
                          Ship To Mobile
                        </label>
                        <div className="col-sm-9 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Ship To Mobile"
                            id="shipToMobile"
                            {...register("shipToMobile", {
                              required: "Ship To Mobile is required",
                              pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Ship To Mobile must be a 10-digit number",
                              },
                            })}
                          />
                          {errors.shipToMobile && (
                            <p
                              className="errorMsg"
                              style={{ marginLeft: "6px", marginBottom: "0" }}
                            >
                              {errors.shipToMobile.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {templateFields.showNotes && (
                    <div className="form-group row">
                      <label htmlFor="notes" className="col-sm-2 text-right control-label col-form-label">
                        Special Notes
                      </label>
                      <div className="col-sm-9 mb-3">
                        <textarea
                          className="form-control"
                          id="notes"
                          placeholder="Enter special notes and instructions"
                          rows={3}
                          {...register("notes", {
                            required: "Special Notes are required",
                            minLength: {
                              value: 10,
                              message: "Special Notes must be at least 10 characters long",
                            },
                            maxLength: {
                              value: 500,
                              message: "Special Notes cannot exceed 500 characters",
                            },
                          })}
                        />
                        {errors.notes && (
                          <p
                            className="errorMsg"
                            style={{ marginLeft: "6px", marginBottom: "0" }}
                          >
                            {errors.notes.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {templateFields.showSalesPerson && (
                    <div className="form-group row">
                      <label htmlFor="salesPerson" className="col-sm-2 text-right control-label col-form-label">
                        Sales Person
                      </label>
                      <div className="col-sm-9 mb-3">
                        <input
                          type="text"
                          className="form-control"
                          id="salesPerson"
                          placeholder="Enter Sales Person Name"
                          {...register("salesPerson", {
                            required: "Sales Person Name is required",
                            minLength: {
                              value: 3,
                              message: "Sales Person Name must be at least 3 characters long",
                            },
                            maxLength: {
                              value: 100,
                              message: "Sales Person Name cannot exceed 100 characters",
                            },
                          })}
                        />
                        {errors.salesPerson && (
                          <p
                            className="errorMsg"
                            style={{ marginLeft: "6px", marginBottom: "0" }}
                          >
                            {errors.salesPerson.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {templateFields.showShippingMethod && (
                    <div className="form-group row">
                      <label htmlFor="shippingMethod" className="col-sm-2 text-right control-label col-form-label">
                        Shipping Method
                      </label>
                      <div className="col-sm-9 mb-3">
                        <input
                          type="text"
                          className="form-control"
                          id="shippingMethod"
                          placeholder="Enter Shipping Method"
                          {...register("shippingMethod", {
                            required: "Shipping Method is required",
                            minLength: {
                              value: 3,
                              message: "Shipping Method must be at least 3 characters long",
                            },
                            maxLength: {
                              value: 100,
                              message: "Shipping Method cannot exceed 100 characters",
                            },
                          })}
                        />
                        {errors.shippingMethod && (
                          <p
                            className="errorMsg"
                            style={{ marginLeft: "6px", marginBottom: "0" }}
                          >
                            {errors.shippingMethod.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {templateFields.showShippingTerms && (
                    <div className="form-group row">
                      <label htmlFor="shippingTerms" className="col-sm-2 text-right control-label col-form-label">
                        Shipping Terms
                      </label>
                      <div className="col-sm-9 mb-3">
                        <input
                          type="text"
                          className="form-control"
                          id="shippingTerms"
                          placeholder="Enter Shipping Terms"
                          {...register("shippingTerms", {
                            required: "Shipping Terms are required",
                            minLength: {
                              value: 3,
                              message: "Shipping Terms must be at least 3 characters long",
                            },
                            maxLength: {
                              value: 100,
                              message: "Shipping Terms cannot exceed 100 characters",
                            },
                          })}
                        />
                        {errors.shippingTerms && (
                          <p
                            className="errorMsg"
                            style={{ marginLeft: "6px", marginBottom: "0" }}
                          >
                            {errors.shippingTerms.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {templateFields.showPaymentTerms && (
                    <div className="form-group row">
                      <label htmlFor="paymentTerms" className="col-sm-2 text-right control-label col-form-label">
                        Payment Terms
                      </label>
                      <div className="col-sm-9 mb-3">
                        <input
                          type="text"
                          className="form-control"
                          id="paymentTerms"
                          placeholder="Enter Payment Terms"
                          {...register("paymentTerms", {
                            required: "Payment Terms are required",
                            minLength: {
                              value: 3,
                              message: "Payment Terms must be at least 3 characters long"
                            },
                            maxLength: {
                              value: 100,
                              message: "Payment Terms cannot exceed 100 characters"
                            },
                          })}
                        />
                        {errors.paymentTerms && (
                          <p
                            className="errorMsg"
                            style={{ marginLeft: "6px", marginBottom: "0" }}
                          >
                            {errors.paymentTerms.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {templateFields.showDeliveryDate && (
                    <div className="form-group row">
                      <label htmlFor="deliveryDate" className="col-sm-2 text-right control-label col-form-label">
                        Delivery Date
                      </label>
                      <div className="col-sm-9 mb-3">
                        <input
                          type="date"
                          className="form-control"
                          id="deliveryDate"
                          {...register("deliveryDate", {
                            required: "Delivery Date is required",
                            validate: (value) => {
                              const invoiceDate = watch("invoiceDate");
                              if (!invoiceDate) {
                                return "Invoice Date is required before selecting Delivery Date";
                              }
                              const invoiceDateObj = new Date(invoiceDate);
                              const deliveryDateObj = new Date(value);
                              if (deliveryDateObj < invoiceDateObj) {
                                return "Delivery Date cannot be before Invoice Date";
                              }
                              return true;
                            }
                          })}
                        />
                        {errors.deliveryDate && (
                          <p
                            className="errorMsg"
                          >
                            {errors.deliveryDate.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      type="button"
                      className="btn btn-primary mb-2"
                      onClick={addColumn}
                    >
                      Add Column
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary mb-2 ms-2"
                      onClick={addRow}
                    >
                      Add Row
                    </button>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          {productColumns.map((col) => (
                            <th key={col.key} className="position-relative">
                              {col.key !== "totalCost" && ( // Prevent deleting totalCost column
                                <button
                                  type="button"
                                  className="btn btn-sm position-absolute top-0 end-0"
                                  onClick={() => handleDeleteColumn(col.key)}
                                  style={{ fontSize: "10px" }}
                                >
                                  ❌
                                </button>
                              )}
                              <input
                                type="text"
                                className="form-control mb-1"
                                value={col.title}
                                onChange={(e) =>
                                  updateColumnTitle(col.key, e.target.value)
                                }
                                disabled={col.key === "totalCost"} // Prevent editing totalCost header
                              />
                              <select
                                className="form-select form-select-sm"
                                value={col.type}
                                onChange={(e) =>
                                  updateColumnType(col.key, e.target.value)
                                }
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="percentage">%</option>
                              </select>
                            </th>
                          ))}
                          <th style={{ paddingBottom: "35px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productData.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {productColumns.map((col) => (
                              <td key={col.key}>
                                <input
                                  type={
                                    col.type === "percentage"
                                      ? "text"
                                      : col.type
                                  }
                                  className="form-control"
                                  value={row[col.key] || ""}
                                  onChange={(e) =>
                                    updateData(
                                      rowIndex,
                                      col.key,
                                      e.target.value
                                    )
                                  }
                                />
                                {fieldErrors[rowIndex] &&
                                  fieldErrors[rowIndex][col.key] && (
                                    <p
                                      className="errorMsg"
                                      style={{
                                        color: "red",
                                        fontSize: "0.8em",
                                      }}
                                    >
                                      {fieldErrors[rowIndex][col.key]}
                                    </p>
                                  )}
                              </td>
                            ))}
                            <td>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteRow(rowIndex)}
                              >
                                Delete Row
                              </button>
                            </td>
                          </tr>
                        ))}
                        {/* SubTotal Row */}
                        <tr>
                          <td
                            colSpan={productColumns.length - 1}
                            className="text-end"
                          >
                            <strong>Sub Total(₹):</strong>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={subTotal.toFixed(2)}
                              readOnly
                            />
                          </td>

                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                    <DeletePopup
                      show={showDeleteModal}
                      handleClose={handleCloseDeleteModal}
                      handleConfirm={() => handleConfirmDelete(selectedItemId)}
                      id={selectedItemId}
                      pageName="Field"
                    />
                  </div>

                </div>
                <div className="d-flex justify-content-end gap-2 mb-3 me-2">
                  <button type="button" className="btn btn-secondary" onClick={handleClearForm}>
                    Clear
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={load}>
                    {load ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
              {showPreview && (
                <div className="modal" style={{
                  display: 'block',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1050,
                  overflow: 'auto'
                }}>
                  <div className="modal-dialog modal-xl" style={{
                    maxWidth: '90%',
                    margin: '30px auto'
                  }}>
                    <div className="modal-content" style={{
                      border: 'none',
                      borderRadius: '0.3rem'
                    }}>
                      <div className="modal-header" style={{
                        borderBottom: '1px solid #dee2e6',
                        padding: '1rem'
                      }}>
                        <h5 className="modal-title">Invoice Preview</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => {
                            setShowPreview(false);
                            setPreviewData(null);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          &times;
                        </button>
                      </div>
                      <div className="modal-body" style={{
                        padding: '0',
                        overflow: 'auto',
                        maxHeight: 'calc(100vh - 200px)'
                      }}>
                        {previewData && (
                          <InvoicePreview
                            previewData={previewData}
                            selectedTemplate={selectedTemplate}
                          />
                        )}
                      </div>
                      <div className="modal-footer" style={{
                        borderTop: '1px solid #dee2e6',
                        padding: '1rem'
                      }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowPreview(false);
                            setPreviewData(null);
                          }}
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleConfirmSubmission}
                        >
                          Confirm Submission
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default InvoiceRegistration;
