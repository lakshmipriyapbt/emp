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
    const value = e.target.value;
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      return true;
    }
    return false;
  };

  // Only allow percentage input (numbers and %)
  const handlePercentageInput = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9%\b]+$/.test(value)) {
      return true;
    }
    return false;
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
      toast.error(error.response?.data?.detail || "Failed to add TDS Structure.");

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

  return (
    <LayOut>
      <div className="container my-4">
        <div className="card p-4">
          <h4 className="mb-4">TDS Structure</h4>
          <form className="mb-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-2">
              <label className="form-label"><b>Financial Year</b></label>
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label">Start Year</label>
                  <Controller
                    name="startYear"
                    control={control}
                    rules={{ required: "Start year is required" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={years}
                        placeholder="Select Start Year"
                      />
                    )}
                  />
                  {errors.startYear && (
                    <p className="text-danger">{errors.startYear.message}</p>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">End Year</label>
                  <Controller
                    name="endYear"
                    control={control}
                    rules={{
                      required: "End year is required",
                      validate: (val) => {
                        if (!startYear) return true; // No validation if start year not selected
                        return val.value > startYear.value || "End year must be greater than start year";
                      },
                    }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={years}
                        placeholder="Select End Year"
                        onChange={(val) => {
                          field.onChange(val);
                          // Trigger validation immediately on change
                          if (startYear) {
                            trigger("endYear");
                          }
                        }}
                      />
                    )}
                  />
                  {errors.endYear && (
                    <p className="text-danger">{errors.endYear.message}</p>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">TDS Type</label>
                  <Controller
                    name="tdsType"
                    control={control}
                    rules={{ required: "TDS Type is required" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={tdsTypeOptions}
                        placeholder="Select TDS Type"
                      />
                    )}
                  />
                  {errors.tdsType && (
                    <p className="text-danger">{errors.tdsType.message}</p>
                  )}
                </div>
              </div>
            </div>

            <label className="form-label m-2"><b>TDS Slabs</b></label>
            {fields.map((field, index) => (
              <div className="row mb-2" key={field.id}>
                <div className="col-md-4">
                  <label className="form-label">Minimum Amount</label>
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
                      required: "Min value is required",
                      min: { value: 0, message: "Min must be >= 0" },
                      pattern: {
                        value: /^\d+$/,
                        message: "Only numbers are allowed"
                      }
                    })}
                  />
                  {errors.persentageEntityList?.[index]?.min && (
                    <p className="text-danger">{errors.persentageEntityList[index].min.message}</p>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Maximum Amount</label>
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
                      required: "Max value is required",
                      validate: (val) => {
                        if (parseInt(val) <= 0) return "Max must be greater than 0";
                        if (watch(`persentageEntityList.${index}.min`) && 
                            parseInt(val) <= parseInt(watch(`persentageEntityList.${index}.min`))) {
                          return "Max must be greater than Min";
                        }
                        return true;
                      },
                      pattern: {
                        value: /^\d+$/,
                        message: "Only numbers are allowed"
                      }
                    })}
                  />
                  {errors.persentageEntityList?.[index]?.max && (
                    <p className="text-danger">{errors.persentageEntityList[index].max.message}</p>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tax Percentage</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Tax Percentage (0-99)"
                    maxLength={2}
                    onKeyDown={(e) => {
                      // Allow only numbers (0-9) and control keys
                      if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => {
                      // Ensure value stays within 0-99 range
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
                    <p className="text-danger">{errors.persentageEntityList[index].taxPercentage.message}</p>
                  )}
                </div>
                <div className="col-md-12 d-flex justify-content-end mt-2">
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
            <button
              type="button"
              className="btn btn-secondary btn-sm mb-2"
              onClick={() => append({ min: "", max: "", taxPercentage: "" })}
            >
              + Add Slab
            </button>
            <br />
            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-primary">
                Save TDS Structure
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate("/companyTdsView")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </LayOut>
  );
};

export default AddTaxSlab;