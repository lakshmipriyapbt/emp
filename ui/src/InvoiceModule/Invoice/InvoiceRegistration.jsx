import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import LayOut from "../../LayOut/LayOut";
import { useAuth } from "../../Context/AuthContext";
import { InvoicePostApi } from "../../Utils/Axios";
import { fetchCustomers } from "../../Redux/CustomerSlice";
import { fetchBanks } from "../../Redux/BankSlice";
import DeletePopup from "../../Utils/DeletePopup";

const InvoiceRegistration = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,watch,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  // Select data from Redux store
  // const customers = useSelector(selectCustomers) || []; // Ensure it's an array
  //const products = useSelector(selectProducts);
  const dispatch = useDispatch();
  const { customers} = useSelector((state) => state.customers);
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

  useEffect(() => {
    dispatch(fetchCustomers());
    // dispatch(fetchProducts());
    dispatch(fetchBanks(companyId));
  }, [dispatch]);

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
        value: bank.bankId, // Assuming `bank.id` is the unique identifier
        label: bank.bankName, // Assuming `bank.bankName` is the name of the bank
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

  const onSubmit = async (data) => {
    setLoad(true);
    try {
      const customerId = data.customerName?.value;
      if (!customerId) {
        toast.error("Customer ID is required");
        setLoad(false);
        return;
      }
       // ✅ Validate column titles (ensure no empty titles or "New Field")
    const invalidColumns = productColumns.filter(
      (col) => !col.title.trim() || col.title === "New Field"
    );
    if (invalidColumns.length >0) {
      toast.error("Column titles cannot be empty or 'New Field'. Please update them.");
      setLoad(false);
      return;
    }
       // ✅ Check if at least one product is added
    if (productData.length === 0) {
      toast.error("At least one product must be added before submitting.");
      setLoad(false);
      return;
    }
      // ✅ Validate Product Rows (Ensure no empty fields)
      const isProductDataValid = productData.every((row) => {
        return productColumns.every((col) => row[col.key] && row[col.key].toString().trim() !== "");
      });
  
      if (!isProductDataValid) {
        toast.error("All product fields must be filled before submitting.");
        setLoad(false);
        return;
      }
  
      // ✅ Construct the invoice object
      const invoiceDataToSend = {
        customerName: data.customerName.label,
        purchaseOrder: data.purchaseOrder,
        vendorCode: data.vendorCode,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        status: "Active",
        bankId: data.bankName,
        subTotal: subTotal.toString(),
        productColumns,
        productData,
      };
  
      // ✅ Send API request
      const response = await InvoicePostApi(companyId, customerId, invoiceDataToSend);
      console.log("✅ API Response:", response);
      setTimeout(() => {
        toast.success("Invoice created successfully");
        navigate("/invoiceView");
      }, 1000); 
      setInvoiceData(data);
      setShowPreview(true);
    } catch (error) {
      console.error("❌ API Error:", error);
      toast.error("Failed to save invoice", {
        position: "top-right",
        autoClose: 1000,
      });
    } finally {
      setLoad(false);
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
                         validate:validateDueDate
                        })}
                      />
                       {errors.dueDate && (
                      <p className="errorMsg" style={{ marginLeft: "6px" }}>
                        {errors.dueDate.message}
                      </p>
                    )}
                    </div>    
                  </div>
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
                              value={subTotal}
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
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default InvoiceRegistration;
