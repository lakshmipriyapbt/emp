import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import LayOut from "../../LayOut/LayOut";
import { TdsPostApi } from "../../Utils/Axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from 'react-select'
import { Controller } from "react-hook-form";

const generateYearOptions = (start = 2020, end = 2050) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const AddTaxSlab = () => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      startYear: "",
      endYear: "",
      tdsType: "", // Added TDS Type field
      persentageEntityList: [{ min: "", max: "", taxPercentage: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "persentageEntityList",
  });

  const startYear = watch("startYear");
  const navigate = useNavigate();
  const years = generateYearOptions();

  const onSubmit = async (data) => {
    try {
      console.log("Submitting Data:", data);

      const formattedData = {
        startYear: Number(data.startYear),
        endYear: Number(data.endYear),
        tdsType: data.tdsType.toString(), // Ensure TDS Type is a string
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
                        options={years.map((y) => ({ value: y, label: y }))}
                      />
                    )}
                  />
                  {errors.startYear && <p className="text-danger">{errors.startYear.message}</p>}
                </div>

                <div className="col-md-4">
                  <label className="form-label">End Year</label>
                  <Controller
                    name="endYear"
                    control={control}
                    rules={{
                      required: "End year is required",
                      validate: (val) =>
                        !startYear || parseInt(val) > parseInt(startYear)
                          ? true
                          : "End year must be greater than start year",
                    }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={years.map((y) => ({ value: y, label: y }))}
                      />
                    )}
                  />
                  {errors.endYear && <p className="text-danger">{errors.endYear.message}</p>}
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
                        options={[
                          { value: "old", label: "Old" },
                          { value: "new", label: "New" },
                        ]}
                      />
                    )}
                  />
                  {errors.tdsType && <p className="text-danger">{errors.tdsType.message}</p>}
                </div>

              </div>
            </div>

            <label className="form-label m-2"><b>TDS Slabs</b></label>
            {fields.map((field, index) => (
              <div className="row mb-2" key={field.id}>
                <div className="col-md-4">
                  <label className="form-label">Min Value</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Min Value"
                    {...register(`persentageEntityList.${index}.min`, {
                      required: "Min value is required",
                      pattern: {
                        value: /^\d{1,9}$/,
                        message: "Must be 1-9 digits (no decimals)"
                      },
                      validate: {
                        positive: v => parseInt(v) >= 0 || "Cannot be negative",
                        lessThanMax: v => {
                          const maxVal = getValues(`persentageEntityList.${index}.max`);
                          return !maxVal || parseInt(v) < parseInt(maxVal) || "Must be less than Max";
                        }
                      },
                      onChange: (e) => {
                        // Restrict to digits only
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        // Limit to 9 digits
                        if (e.target.value.length > 9) {
                          e.target.value = e.target.value.slice(0, 9);
                        }
                      }
                    })}
                  />
                  {errors.persentageEntityList?.[index]?.min && (
                    <p className="text-danger">{errors.persentageEntityList[index].min.message}</p>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Max Value</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Max Value"
                    {...register(`persentageEntityList.${index}.max`, {
                      required: "Max value is required",
                      pattern: {
                        value: /^\d{1,9}$/,
                        message: "Must be 1-9 digits (no decimals)"
                      },
                      validate: {
                        positive: v => parseInt(v) > 0 || "Must be positive",
                        greaterThanMin: v => {
                          const minVal = getValues(`persentageEntityList.${index}.min`);
                          return !minVal || parseInt(v) > parseInt(minVal) || "Must be greater than Min";
                        }
                      },
                      onChange: (e) => {
                        // Restrict to digits only
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        // Limit to 9 digits
                        if (e.target.value.length > 9) {
                          e.target.value = e.target.value.slice(0, 9);
                        }
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
                    placeholder="0-99"
                    {...register(`persentageEntityList.${index}.taxPercentage`, {
                      required: "Tax percentage is required",
                      pattern: {
                        value: /^(?:[0-9]|[1-9][0-9])$/,
                        message: "Must be 0-99"
                      },
                      onChange: (e) => {
                        // Restrict to digits only
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        // Limit to 2 digits and 0-99 range
                        if (e.target.value.length > 2) {
                          e.target.value = e.target.value.slice(0, 2);
                        }
                        if (e.target.value > 99) {
                          e.target.value = 99;
                        }
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
            <button type="submit" className="btn btn-primary">
              Save TDS Structure
            </button>
          </form>
        </div>
      </div>
    </LayOut>
  );
};

export default AddTaxSlab;
