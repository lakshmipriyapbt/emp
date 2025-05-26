import React, { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import LayOut from "../../LayOut/LayOut";
import { TdsPostApi } from "../../Utils/Axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";

const generateYearOptions = (start = 2020, end = 2050) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const AddTaxSlab = () => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    trigger,
    formState: { errors },
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      startYear: null,
      endYear: null,
      tdsType: null,
      persentageEntityList: [{ min: "", max: "", taxPercentage: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "persentageEntityList",
  });

  const startYear = watch("startYear");
  const navigate = useNavigate();
  const years = generateYearOptions().map(year => ({ value: year, label: year }));
  const tdsTypeOptions = [
    { value: "old", label: "Old" },
    { value: "new", label: "New" }
  ];

  // Only allow numeric input
  const handleNumericInput = (e) => {
    const allowedKeys = [
      "Backspace",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Delete"
    ];
    const isNumber = /^[0-9]$/.test(e.key);
  
    if (isNumber || allowedKeys.includes(e.key)) {
      return true;
    }
    return false;
  };
  

  // Validate slab ranges to ensure they are in ascending order without overlaps
  const validateSlabRanges = (index, value, type) => {
    const slabs = watch("persentageEntityList");

    const currentSlab = slabs[index];
    const parsedValue = parseInt(value);

    // Ensure unique slab values across all slabs (no duplicates)
    const isDuplicate = slabs.some((slab, i) => {
      if (i === index) return false; // skip current slab
      return (
        slab.min === currentSlab.min &&
        slab.max === currentSlab.max &&
        slab.taxPercentage === currentSlab.taxPercentage
      );
    });

    if (isDuplicate) {
      return "Duplicate slab detected";
    }

    // Validate against previous slab
    if (index > 0) {
      const prevSlab = slabs[index - 1];
      const prevMax = parseInt(prevSlab.max);
      if (type === 'min' && parsedValue <= prevMax) {
        return `Minimum Amount must be greater than previous slab's Maximum Amount (${prevMax})`;
      }
    }

    // Validate max is greater than min in current slab
    if (type === 'max') {
      const min = parseInt(currentSlab.min);
      if (parsedValue <= min) {
        return `Maximum Amount must be greater than Minimum Amount (${min})`;
      }

      // Also validate against next slab's min if available
      if (index < slabs.length - 1) {
        const nextMin = parseInt(slabs[index + 1].min);
        if (!isNaN(nextMin) && parsedValue >= nextMin) {
          return `Maximum Amount must be less than next slab's Minimum Amount (${nextMin})`;
        }
      }
    }

    return true;
  };

  const onSubmit = async (data) => {
    try {
      console.log("Submitting Data:", data);

      const formattedData = {
        startYear: Number(data.startYear.value),
        endYear: Number(data.endYear.value),
        tdsType: data.tdsType.value.toString(),
        persentageEntityList: data.persentageEntityList.map((entry) => ({
          min: entry.min.toString(),
          max: entry.max.toString(),
          taxPercentage: entry.taxPercentage.toString(),
        })),
      };

      console.log("Final API Request Payload:", JSON.stringify(formattedData));

      const response = await TdsPostApi(formattedData);
      console.log("API Response:", response.data);

      toast.success("TDS Structure added successfully!");
      navigate("/companyTdsView");

      // Preserve financial year and TDS type while resetting slabs
      reset({
        startYear: data.startYear,
        endYear: data.endYear,
        tdsType: data.tdsType,
        persentageEntityList: [{ min: "", max: "", taxPercentage: "" }],
      });
    } catch (error) {
      console.error("API Error Details:", error.response?.data || error.message);
      toast.error(error.response?.data?.detail || "TDS structure for the selected financial year already exists.");

      if (error.response) {
        console.log("Status Code:", error.response.status);
        console.log("Headers:", error.response.headers);
        console.log("Response Data:", error.response.data);
      }
    }
  };

  useEffect(() => {
    if (startYear && watch("endYear")) {
      trigger("endYear");
    }
  }, [startYear, watch("endYear")]);

  // Function to handle adding new slab with validation
  const handleAddSlab = () => {
    const slabs = watch("persentageEntityList");
    if (slabs.length === 0) {
      append({ min: "", max: "", taxPercentage: "" });
      return;
    }

    const lastSlab = slabs[slabs.length - 1];
    if (!lastSlab.min || !lastSlab.max) {
      toast.warning("Please complete the current slab before adding a new one");
      return;
    }

    // Set the new slab's min to be 1 more than the previous max
    const newMin = parseInt(lastSlab.max) + 1;
    append({ min: newMin.toString(), max: "", taxPercentage: "" });
  };

 return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>TDS Structure</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">TDS</li>
                <li className="breadcrumb-item active">Add TDS Structure</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title" style={{ marginBottom: "0px" }}>
                  TDS Structure Form
                </h5>
                <div
                  className="dropdown-divider"
                  style={{ borderTopColor: "#d7d9dd" }}
                />
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">
                        <b>Financial Year</b>
                      </label>
                      <div className="row">
                        <div className="col-12 col-md-4 mb-3">
                          <label className="form-label">
                            Start Year
                          </label>
                          <Controller
                            name="startYear"
                            control={control}
                            rules={{ required: "Start year is required" }}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={years}
                                placeholder="Select Start Year"
                                className="react-select-container"
                                classNamePrefix="react-select"
                              />
                            )}
                          />
                          {errors.startYear && (
                            <p className="errorMsg">
                              {errors.startYear.message}
                            </p>
                          )}
                        </div>

                        <div className="col-12 col-md-4 mb-3">
                          <label className="form-label">
                            End Year
                          </label>
                          <Controller
                            name="endYear"
                            control={control}
                            rules={{
                              required: "End year is required",
                              validate: (val) => {
                                if (!startYear) return true;
                                return val.value > startYear.value || "End year must be greater than start year";
                              },
                            }}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={years}
                                placeholder="Select End Year"
                                className="react-select-container"
                                classNamePrefix="react-select"
                                onChange={(val) => {
                                  field.onChange(val);
                                  if (startYear) {
                                    trigger("endYear");
                                  }
                                }}
                              />
                            )}
                          />
                          {errors.endYear && (
                            <p className="errorMsg">
                              {errors.endYear.message}
                            </p>
                          )}
                        </div>

                        <div className="col-12 col-md-4 mb-3">
                          <label className="form-label">
                            TDS Type 
                          </label>
                          <Controller
                            name="tdsType"
                            control={control}
                            rules={{ required: "TDS Type is required" }}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={tdsTypeOptions}
                                placeholder="Select TDS Type"
                                className="react-select-container"
                                classNamePrefix="react-select"
                              />
                            )}
                          />
                          {errors.tdsType && (
                            <p className="errorMsg">
                              {errors.tdsType.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">
                        <b>TDS Slabs</b>
                      </label>
                      {fields.map((field, index) => (
                        <div className="row mb-3" key={field.id}>
                          <div className="col-12 col-md-4 mb-2">
                            <label className="form-label">
                              Minimum Amount 
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Min"
                              maxLength={9}
                              onKeyDown={(e) => {
                                if (!handleNumericInput(e)) {
                                  e.preventDefault();
                                }
                              }}
                              {...register(`persentageEntityList.${index}.min`, {
                                required: "Minimum Amount is required",
                                pattern: {
                                  value: /^\d+$/,
                                  message: "Only numbers are allowed"
                                },
                                validate: (val) => {
                                  const parsed = parseInt(val);
                                  if (isNaN(parsed)) return "Enter a valid number";
                                  const maxVal = parseInt(watch(`persentageEntityList.${index}.max`));
                                  if (!isNaN(maxVal) && parsed >= maxVal) {
                                    return "Minimum Amount must be less than Maximum Amount";
                                  }
                                  const slabValidation = validateSlabRanges(index, val, 'min');
                                  if (slabValidation !== true) return slabValidation;
                                  return true;
                                }
                              })}
                            />
                            {errors.persentageEntityList?.[index]?.min && (
                              <p className="errorMsg">
                                {errors.persentageEntityList[index].min.message}
                              </p>
                            )}
                          </div>

                          <div className="col-12 col-md-4 mb-2">
                            <label className="form-label">
                              Maximum Amount
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Max"
                              maxLength={9}
                              onKeyDown={(e) => {
                                if (!handleNumericInput(e)) {
                                  e.preventDefault();
                                }
                              }}
                              {...register(`persentageEntityList.${index}.max`, {
                                required: "Maximum Amount is required",
                                validate: (val) => {
                                  if (parseInt(val) <= 0) return "Max must be greater than 0";
                                  if (watch(`persentageEntityList.${index}.min`) &&
                                    parseInt(val) <= parseInt(watch(`persentageEntityList.${index}.min`))) {
                                    return "Maximum Amount must be greater than Minimum Amount";
                                  }
                                  const slabValidation = validateSlabRanges(index, val, 'max');
                                  if (slabValidation !== true) return slabValidation;
                                  return true;
                                },
                                pattern: {
                                  value: /^\d+$/,
                                  message: "Only numbers are allowed"
                                }
                              })}
                            />
                            {errors.persentageEntityList?.[index]?.max && (
                              <p className="errorMsg">
                                {errors.persentageEntityList[index].max.message}
                              </p>
                            )}
                          </div>

                          <div className="col-12 col-md-3 mb-2">
                            <label className="form-label">
                              Tax Percentage
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter Tax Percentage (0-99)"
                              maxLength={2}
                              onKeyDown={(e) => {
                                if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight/.test(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              onInput={(e) => {
                                let value = e.target.value;
                                if (value > 99) e.target.value = 99;
                                if (value < 0) e.target.value = 0;
                              }}
                              {...register(`persentageEntityList.${index}.taxPercentage`, {
                                required: "Tax Percentage is required",
                                pattern: {
                                  value: /^[0-9]{1,2}$/,
                                  message: "Enter a number between 0-99"
                                },
                                validate: (val) => {
                                  const num = parseInt(val, 10);
                                  if (isNaN(num)) return "Enter a valid number";
                                  if (num < 0 || num > 99) return "Must be between 0-99";
                                  return true;
                                }
                              })}
                            />
                            {errors.persentageEntityList?.[index]?.taxPercentage && (
                              <p className="errorMsg">
                                {errors.persentageEntityList[index].taxPercentage.message}
                              </p>
                            )}
                          </div>

                          <div className="col-12 col-md-1 mb-2 d-flex align-items-end">
                            {index > 0 && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => remove(index)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="row">
                        <div className="col-12 mb-3">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={handleAddSlab}
                          >
                            + Add Slab
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 mt-4 d-flex justify-content-end">
                      <button
                        type="button"
                        className="btn btn-secondary me-2"
                        onClick={() => navigate("/companyTdsView")}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        Save TDS Structure
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default AddTaxSlab;