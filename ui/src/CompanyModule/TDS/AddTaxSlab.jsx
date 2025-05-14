import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import LayOut from "../../LayOut/LayOut";
import { TdsPostApi } from "../../Utils/Axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const generateYearOptions = (start = 2020, end = 2050) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const AddTaxSlab = () => {
  const {
    register,
    handleSubmit,
    reset,
    control,
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
                  <select
                    className="form-control"
                    {...register("startYear", {
                      required: "Start year is required",
                    })}
                  >
                    <option value="">Select Start Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.startYear && (
                    <p className="text-danger">{errors.startYear.message}</p>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">End Year</label>
                  <select
                    className="form-control"
                    {...register("endYear", {
                      required: "End year is required",
                      validate: (val) =>
                        !startYear || parseInt(val) > parseInt(startYear)
                          ? true
                          : "End year must be greater than start year",
                    })}
                  >
                    <option value="">Select End Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.endYear && (
                    <p className="text-danger">{errors.endYear.message}</p>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">TDS Type</label>
                  <select
                    className="form-control"
                    {...register("tdsType", {
                      required: "TDS Type is required",
                    })}
                  >
                    <option value="">Select TDS Type</option>
                    <option value="old">Old</option>
                    <option value="new">New</option>
                  </select>
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
                  <label className="form-label">Min Value</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Min"
                    {...register(`persentageEntityList.${index}.min`, {
                      required: "Min value is required",
                      min: { value: 0, message: "Min must be >= 0" },
                    })}
                  />
                  {errors.persentageEntityList?.[index]?.min && (
                    <p className="text-danger">{errors.persentageEntityList[index].min.message}</p>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Max Value</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Max"
                    {...register(`persentageEntityList.${index}.max`, {
                      required: "Max value is required",
                      validate: (val) => parseInt(val) > 0 || "Max must be greater than 0",
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
                    placeholder="Enter Tax Percentage"
                    {...register(`persentageEntityList.${index}.taxPercentage`, {
                      required: "Tax Percentage is required",
                      pattern: {
                        value: /^\d+(\.\d+)?%?$/,
                        message: "Enter a valid percentage (e.g., 10%)",
                      },
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
