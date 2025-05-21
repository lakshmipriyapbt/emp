import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import LayOut from "../../LayOut/LayOut";

const generateYearOptions = (start = 2020, end = 2050) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const AddTaxSlab = ({ onAdd }) => {
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
      slabs: [{ min: 0, max: 0, rate: "" }],
    },
  });

  const { fields, append ,remove} = useFieldArray({
    control,
    name: "slabs",
  });

  const startYear = watch("startYear");

  const onSubmit = (data) => {
    const year = `${data.startYear}-${data.endYear}`;
    const sanitized = data.slabs.map((s) => ({
      ...s,
      min: parseInt(s.min, 10),
      max: s.max === "-1" ? Infinity : parseInt(s.max, 10),
      rate: s.rate.trim(),
    }));
    console.log(year, sanitized);
    reset();
  };

  const years = generateYearOptions();

  return (
    <LayOut>
      <div className="container my-4">
        <div className="card p-4">
          <h4 className="mb-4">Tax Slab</h4>
          <form className="mb-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-2">
              <label className="form-label"><b>New Financial Year</b></label>
              <div className="row">
                <div className="col">
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

                <div className="col">
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
              </div>
            </div>

            <label className="form-label m-2"><b>Slab Entries</b></label>
            {fields.map((field, index) => (
              <div className="row mb-2 align-items-end" key={field.id}>
                <div className="col">
                  <label className="form-label">Minimum Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Min"
                    {...register(`slabs.${index}.min`, {
                      required: "Min is required",
                      min: { value: 0, message: "Min must be >= 0" },
                    })}
                  />
                  {errors.slabs?.[index]?.min && (
                    <p className="text-danger">
                      {errors.slabs[index].min.message}
                    </p>
                  )}
                </div>

                <div className="col">
                  <label className="form-label">Maximum Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Max (use -1 for Infinity)"
                    {...register(`slabs.${index}.max`, {
                      required: "Max is required",
                      validate: (val) =>
                        parseInt(val) === -1 ||
                        parseInt(val) > 0 ||
                        "Max must be > 0 or -1",
                    })}
                  />
                  {errors.slabs?.[index]?.max && (
                    <p className="text-danger">
                      {errors.slabs[index].max.message}
                    </p>
                  )}
                </div>

                <div className="col">
                  <label className="form-label">Rate (%)</label>
                  <input
                    className="form-control"
                    placeholder="Rate (e.g., 10%)"
                    {...register(`slabs.${index}.rate`, {
                      required: "Rate is required",
                      pattern: {
                        value: /^\d+%?$/,
                        message: "Rate must be a number or percentage (e.g., 10%)",
                      },
                    })}
                  />
                  {errors.slabs?.[index]?.rate && (
                    <p className="text-danger">
                      {errors.slabs[index].rate.message}
                    </p>
                  )}
                </div>

                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => remove(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm mb-2"
              onClick={() => append({ min: 0, max: 0, rate: "" })}
            >
              + Add Slab
            </button>
            <br />
            <button type="submit" className="btn btn-primary">
              Save Year
            </button>
          </form>
        </div>
      </div>
    </LayOut>
  );
};

export default AddTaxSlab;
