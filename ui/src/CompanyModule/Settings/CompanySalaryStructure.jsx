import React, { useEffect, useState } from 'react';
import LayOut from '../../LayOut/LayOut';
import { AllowancesGetApi, CompanySalaryStructurePostApi, DeductionsGetApi } from '../../Utils/Axios';
import { useAuth } from '../../Context/AuthContext';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Select from "react-select";
import { ModalBody, ModalHeader, ModalTitle } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';

const CompanySalaryStructure = () => {
  const { register, handleSubmit, control, getValues, trigger, reset, formState: { errors } } = useForm({ mode: "onChange" });
  const [activeTab, setActiveTab] = useState('nav-home');
  const [allowanceFields, setAllowanceFields] = useState([{ label: '', type: 'number', value: '' }]);
  const [deductionFields, setDeductionFields] = useState([{ label: '', type: 'number', value: '' }]);
  const [isEditing, setIsEditing] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [allowanceError, setAllowanceError] = useState("");
  const [selectedAllowances, setSelectedAllowances] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [modalType, setModalType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState("");
  const { user } = useAuth();
  const [fieldCheckboxes, setFieldCheckboxes] = useState({ allowances: {}, deductions: {} });
  const navigate = useNavigate();

  const addField = (fieldName) => {
    const newField = { label: fieldName, type: 'number', value: '' };
    const fieldsToCheck = activeTab === 'nav-home' ? allowanceFields : deductionFields;
    const fieldExists = fieldsToCheck.some(field => field.label === fieldName);

    if (!fieldExists) {
      if (activeTab === 'nav-home') {
        setAllowanceFields((prev) => [...prev, newField]);
        setFieldCheckboxes((prev) => ({
          ...prev,
          allowances: { ...prev.allowances, [fieldName]: true },
        }));
      } else {
        setDeductionFields((prev) => [...prev, newField]);
        setFieldCheckboxes((prev) => ({
          ...prev,
          deductions: { ...prev.deductions, [fieldName]: true },
        }));
      }
      setNewFieldName('');
      setShowModal(false);
      reset();
      setErrorMessage('');
    } else {
      setErrorMessage(`Field "${fieldName}" already exists.`);
    }
  };

  const handleLabelChange = (index, value) => {
    const fields = activeTab === 'nav-home' ? allowanceFields : deductionFields;
    const newFields = [...fields];
    newFields[index].label = value;
    if (activeTab === 'nav-home') {
      setAllowanceFields(newFields);
    } else {
      setDeductionFields(newFields);
    }
  };

  const handleTypeChange = (index, value) => {
    const fields = activeTab === 'nav-home' ? allowanceFields : deductionFields;
    const newFields = [...fields];
    newFields[index].type = value;
    if (activeTab === 'nav-home') {
      setAllowanceFields(newFields);
    } else {
      setDeductionFields(newFields);
    }
  };

  const handleCheckboxChange = (index) => {
    const fields = activeTab === 'nav-home' ? allowanceFields : deductionFields;
    const fieldLabel = fields[index].label;

    setFieldCheckboxes((prev) => {
      const newCheckboxes = {
        ...prev,
        [activeTab === 'nav-home' ? 'allowances' : 'deductions']: {
          ...prev[activeTab === 'nav-home' ? 'allowances' : 'deductions'],
          [fieldLabel]: !prev[activeTab === 'nav-home' ? 'allowances' : 'deductions'][fieldLabel],
        }
      };

      const selected = Object.values(newCheckboxes[activeTab === 'nav-home' ? 'allowances' : 'deductions']).filter(Boolean);

      if (activeTab === 'nav-home' && selected.length > 0) {
        setAllowanceError('');
      }

      return newCheckboxes;
    });

    const isChecked = !fieldCheckboxes[activeTab === 'nav-home' ? 'allowances' : 'deductions'][fieldLabel];
    if (isChecked) {
      validateField(fields[index]);
    } else {

      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldLabel];
        return newErrors;
      });
    }
  };


  const validateField = (field) => {
    const errors = { ...validationErrors };

    if (field.value === '') {
      errors[field.label] = "Value is Required";
    } else if (!/^\d+$/.test(field.value)) {
      errors[field.label] = "This field accepts only Integers";
    } else {
      delete errors[field.label];
    }

    setValidationErrors(errors);
  };

  const fetchAllowances = async () => {
    try {
      const response = await AllowancesGetApi();
      const allowancesData = response.data;
      setAllowances(allowancesData);
      setAllowanceFields(allowancesData.map(allowance => ({ label: allowance, type: 'number', value: '' })));
      setFieldCheckboxes(prev => ({
        ...prev,
        allowances: allowancesData.reduce((acc, allowance) => {
          acc[allowance] = false;
          return acc;
        }, {})
      }));
    } catch (error) {
      console.error("API fetch error:", error);
    }
  };

  useEffect(() => {
    fetchAllowances();
  }, []);

  const fetchDeductions = async () => {
    try {
      const response = await DeductionsGetApi();
      const deductionsData = response.data;
      setDeductions(deductionsData);
      setDeductionFields(deductionsData.map(deduction => ({ label: deduction, type: 'number', value: '' })));
      setFieldCheckboxes(prev => ({
        ...prev,
        deductions: deductionsData.reduce((dcc, deduction) => {
          dcc[deduction] = false;
          return dcc;
        }, {})
      }));
    } catch (error) {
      console.error("API fetch error:", error);
    }
  };

  useEffect(() => {
    fetchDeductions();
  }, []);

  const handleValueChange = (index, value) => {
    const fields = activeTab === 'nav-home' ? allowanceFields : deductionFields;
    const newFields = [...fields];
    newFields[index].value = value;
    if (activeTab === 'nav-home') {
      setAllowanceFields(newFields);
    } else {
      setDeductionFields(newFields);
    }
  };

  const onSubmit = async (data) => {
    const jsonData = {
      companyName: user.company,
      status: data.status,
      allowances: {},
      deductions: {},
    };

    const selectedAllowances = allowanceFields.filter((field) => fieldCheckboxes.allowances[field.label]);
    const selectedDeductions = deductionFields.filter((field) => fieldCheckboxes.deductions[field.label]);

    selectedAllowances.forEach((field) => {
      if (field.label && field.value) {
        jsonData.allowances[field.label] = field.type === "percentage" ? `${field.value}%` : field.value;
      }
    });

    selectedDeductions.forEach((field) => {
      if (field.label && field.value) {
        jsonData.deductions[field.label] = field.type === "percentage" ? `${field.value}%` : field.value;
      }
    });

    console.log("Submitting data:", jsonData);

    try {
      const response = await CompanySalaryStructurePostApi(jsonData);
      toast.success("Salary structure submitted successfully!");
      reset();
      navigate('/companySalaryView');
      window.location.reload();
    } catch (error) {
      if (error.response) {
        console.error("Error response from backend:", error.response.data);
        toast.error(`Error: ${error.response.data.message || 'An error occurred'}`);
      } else {
        console.error("Fetch error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const handleCloseNewFieldModal = () => {
    setNewFieldName('');
    setShowModal(false);
    reset();
    setErrorMessage('');
  };

  const toInputTitleCase = (e) => {
    const input = e.target;
    let value = input.value;
    const cursorPosition = input.selectionStart; // Save the cursor position
    // Remove leading spaces
    value = value.replace(/^\s+/g, '');
    // Ensure only alphabets and spaces are allowed
    const allowedCharsRegex = /^[a-zA-Z0-9\s!@#&()*/,.\\-]+$/;
    value = value.split('').filter(char => allowedCharsRegex.test(char)).join('');
    // Capitalize the first letter of each word
    const words = value.split(' ');
    // Capitalize the first letter of each word and lowercase the rest
    const capitalizedWords = words.map(word => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return '';
    });
    // Join the words back into a string
    let formattedValue = capitalizedWords.join(' ');
    // Remove spaces not allowed (before the first two characters)
    if (formattedValue.length > 3) {
      formattedValue = formattedValue.slice(0, 3) + formattedValue.slice(3).replace(/\s+/g, ' ');
    }
    // Update input value
    input.value = formattedValue;
    // Restore the cursor position
    input.setSelectionRange(cursorPosition, cursorPosition);
  };

  const handleEmailChange = (e) => {
    // Get the current value of the input field
    const value = e.target.value;

    // Check if the value is empty
    if (value.trim() !== '') {
      return; // Allow space button
    }

    // Prevent space character entry if the value is empty
    if (e.keyCode === 32) {
      e.preventDefault();
    }
  };

  const toInputSpaceCase = (e) => {
    let inputValue = e.target.value;
    let newValue = "";

    // Remove spaces from the beginning of inputValue
    inputValue = inputValue.trimStart(); // Keep spaces only after the initial non-space character

    // Track if we've encountered any non-space character yet
    let encounteredNonSpace = false;

    for (let i = 0; i < inputValue.length; i++) {
      const char = inputValue.charAt(i);

      // Allow any alphabetic characters (both lowercase and uppercase) and numbers
      // Allow spaces only after encountering non-space characters
      if (char.match(/[a-zA-Z0-9]/) || (encounteredNonSpace && char === " ")) {
        if (char !== " ") {
          encounteredNonSpace = true;
        }
        newValue += char;
      }
    }

    // Update the input value
    e.target.value = newValue;
  };

  const isSubmitEnabled = () => {
    const hasSelectedAllowance = allowanceFields.some((field, index) => fieldCheckboxes.allowances[field.label]);
    const hasSelectedDeduction = deductionFields.some((field, index) => fieldCheckboxes.deductions[field.label]);
    return hasSelectedAllowance && hasSelectedDeduction;
  };

  const handleTabChange = (tab) => {
    if (tab === 'nav-profile') {
      if (Object.values(fieldCheckboxes.allowances).every(checkbox => !checkbox)) {
        setAllowanceError('Please select at least one allowance.');
        return;
      }
    }
    setAllowanceError('');
    setActiveTab(tab);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3"><strong>Salary Structure</strong></h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/main">Home</a></li>
                <li className="breadcrumb-item active">Salary Structure</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="container">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Company Salary Structure</div>
              </div>
              <div className="card-body">
                <nav className="companyNavOuter">
                  <div className="nav nav-tabs" id="nav-tab" role="tablist">
                    <button type='button'
                      className={`nav-link ${activeTab === 'nav-home' ? 'active' : ''}`}
                      onClick={() => handleTabChange('nav-home')}
                    >
                      Allowances
                    </button>
                    <button type='button'
                      className={`nav-link ${activeTab === 'nav-profile' ? 'active' : ''}`}
                      onClick={() => handleTabChange('nav-profile')}
                    >
                      Deductions
                    </button>
                  </div>
                </nav>
                <div className="tab-content companyTabContent" id="nav-tabContent">
                  <div className={`tab-pane fade ${activeTab === 'nav-home' ? 'show active' : ''}`} id="nav-home" role="tabpanel">
                    {allowanceError && <div className="text-danger">{allowanceError}</div>}
                    {allowanceFields.map((field, index) => (
                      <div className="row bbl ptb25" key={index}>
                        <div className="col-auto mt-2">
                          <input
                            type="checkbox"
                            checked={fieldCheckboxes.allowances[field.label] || false}
                            onChange={() => handleCheckboxChange(index)}
                          />
                        </div>
                        <div className="col-sm-3">
                          <input
                            type='text'
                            className='form-control'
                            readOnly
                            value={formatFieldName(field.label)}
                            onChange={(e) => handleLabelChange(index, e.target.value)}
                            placeholder="Label Name"
                            disabled={!isEditing}
                          />   
                        </div>
                        <div className="col-sm-3">
                          <select
                            className='form-select'
                            value={field.type}
                            onChange={(e) => handleTypeChange(index, e.target.value)}
                            disabled={!isEditing}
                          >
                            <option value="number">₹</option>
                            <option value="percentage">%</option>
                          </select>
                        </div>
                        <div className="col-sm-3">
                          <input
                            type={field.type === 'percentage' ? 'number' : 'text'}
                            className='form-control'
                            value={field.value}
                            onInput={toInputSpaceCase}
                            onChange={(e) => {
                              handleValueChange(index, e.target.value);
                              validateField({ ...field, value: e.target.value });
                            }}
                            placeholder="Enter Value"
                            disabled={!isEditing}
                            maxLength={7}
                          />
                          {validationErrors[field.label] && <div className="text-danger">{validationErrors[field.label]}</div>}
                        </div>
                      </div>
                    ))}
                    <div className="row">
                      <div className="col-sm-12">
                        <button type="button" onClick={() => {
                          setModalType('allowances');
                          setShowModal(true);
                        }} className="btn btn-primary mt-4">Add Field</button>
                      </div>
                    </div>
                  </div>
                  <div className={`tab-pane fade ${activeTab === 'nav-profile' ? 'show active' : ''}`} id="nav-profile" role="tabpanel">
                    {deductionFields.map((field, index) => (
                      <div className="row bbl ptb25" key={index}>
                        <div className="col-auto mt-2">
                          <input
                            type="checkbox"
                            checked={fieldCheckboxes.deductions[field.label] || false}
                            onChange={() => handleCheckboxChange(index)}
                          />
                        </div>
                        <div className="col-sm-3">
                          <input
                            type='text'
                            className='form-control'
                            readOnly
                            value={formatFieldName(field.label)}
                            onChange={(e) => handleLabelChange(index, e.target.value)}
                            placeholder="Label Name"
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-sm-3">
                          <select
                            className='form-select'
                            value={field.type}
                            onChange={(e) => handleTypeChange(index, e.target.value)}
                            disabled={!isEditing}
                          >
                            <option value="number">₹</option>
                            <option value="percentage">%</option>
                          </select>
                        </div>
                        <div className="col-sm-3">
                          <input
                            type={field.type === 'percentage' ? 'number' : 'text'}
                            className='form-control'
                            value={field.value}
                            onInput={toInputSpaceCase}
                            onChange={(e) => {
                              handleValueChange(index, e.target.value);
                              validateField({ ...field, value: e.target.value });
                            }}
                            placeholder="Enter Value"
                            disabled={!isEditing}
                            maxLength={7}
                          />
                          {validationErrors[field.label] && <div className="text-danger">{validationErrors[field.label]}</div>}
                        </div>
                      </div>
                    ))}
                    <div className="mt-4">
                      <div className="alert alert-info" role="alert">
                        <strong>Note:</strong> LOP is calculated based on your Attendance.
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-12">
                        <button type="button" onClick={() => {
                          setModalType('deductions');
                          setShowModal(true);
                        }} className="btn btn-primary mt-4">Add Field</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-3 align-items-center">
                  <div className="col-2">
                    <label className="form-label mb-0">Status :- </label>
                  </div>
                  <div className="col-6">
                    <Controller
                      name="status"
                      control={control}
                      defaultValue=""
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
                              ? { value: field.value, label: ["Active", "InActive"].find(option => option === field.value) }
                              : null
                          }
                          onChange={(val) => field.onChange(val.value)}
                          isDisabled={!isSubmitEnabled()}
                          placeholder="Select Status"
                        />
                      )}
                    />
                    {errors.status && <p className="errorMsg text-danger">Status is Required</p>}
                  </div>
                  <div className="col-4 text-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!isSubmitEnabled()}
                    >
                      Submit All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        {showModal && (
          <div
            role='dialog'
            aria-modal="true"
            className='fade modal show'
            tabIndex="-1"
            style={{ zIndex: "9999", display: "block" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <ModalHeader>
                  <ModalTitle className="modal-title">
                    Add New {modalType === 'allowances' ? 'Allowance' : 'Deduction'} Field
                  </ModalTitle>
                </ModalHeader>
                <ModalBody>
                  <form>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12">
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`Enter New ${modalType === 'allowances' ? 'Allowance' : 'Deduction'} Name`}
                            onInput={toInputTitleCase}
                            onKeyDown={handleEmailChange}
                            autoComplete='off'
                            {...register("fieldName", {
                              required: "Field name is required",
                              pattern: {
                                value: /^[A-Za-z\s]+$/,
                                message: "This field accepts only alphabetic characters",
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
                          {errors.fieldName && <p className="errorMsg text-danger">{errors.fieldName.message}</p>}
                          {errorMessage && <p className="errorMsg text-danger">{errorMessage}</p>}
                        </div>
                      </div>
                    </div>
                    <div className='modal-footer'>
                      <button
                        type='button'
                        className="btn btn-primary"
                        onClick={async () => {
                          const isValid = await trigger("fieldName");

                          if (!isValid) {
                            return;
                          }

                          const fieldName = getValues("fieldName");
                          addField(fieldName);
                        }}
                      >
                        Save
                      </button>
                      <button type='button' className="btn btn-secondary" onClick={handleCloseNewFieldModal}>Cancel</button>
                    </div>
                  </form>
                </ModalBody>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayOut>
  );
};

export default CompanySalaryStructure;
