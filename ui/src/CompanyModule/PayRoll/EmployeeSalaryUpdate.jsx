import React, { useEffect, useState } from 'react';
import LayOut from '../../LayOut/LayOut';
import Select from "react-select";
import { Controller, useForm } from 'react-hook-form';
import { EmployeeSalaryGetApiById, EmployeeSalaryPatchApiById } from '../../Utils/Axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../Context/AuthContext';

const EmployeeSalaryUpdate = () => {
    const { register, control, handleSubmit, setValue, formState: { errors } } = useForm({ mode: "onChange" });
    const { user } = useAuth();
    const [salaryStructures, setSalaryStructures] = useState([]);
    const [basicSalary, setBasicSalary] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [variableAmount, setVariableAmount] = useState(0);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [grossAmount, setGrossAmount] = useState(0);
    const [monthlySalary, setMonthlySalary] = useState(0);
    const [fixedAmount, setFixedAmount] = useState(0);
    const [status, setStatus] = useState("Active");
    const [errorMessage, setErrorMessage] = useState("");
    const [showFields, setShowFields] = useState(false);
    const [employeeId, setEmployeeId] = useState("");
    const [allowances, setAllowances] = useState("");
    const [deductions, setDeductions] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const salaryId = queryParams.get('salaryId');
    const id = queryParams.get('employeeId');

    const companyName = user.company;

    useEffect(() => {
        const monthlySalaryValue = parseFloat(grossAmount || 0) / 12;
        setMonthlySalary(monthlySalaryValue.toFixed(2));
    }, [grossAmount]);

    const handleVariableAmountChange = (e) => {
        setVariableAmount(parseFloat(e.target.value) || 0);
        setValue("variableAmount", e.target.value, { shouldValidate: true });
    };

    const handleFixedAmountChange = (e) => {
        setFixedAmount(parseFloat(e.target.value) || 0);
        setValue("fixedAmount", e.target.value, { shouldValidate: true });
    };

    const fetchSalary = async () => {
        try {
            const response = await EmployeeSalaryGetApiById(id, salaryId);
            setEmployeeId(response.data.employeeId);
            setSalaryStructures([response.data.data]);
            setBasicSalary(response.data.data.basicSalary);
            setVariableAmount(response.data.data.variableAmount);
            setFixedAmount(response.data.data.fixedAmount);
            setGrossAmount(response.data.data.grossAmount);
            setMonthlySalary(response.data.data.monthlySalary);
            setStatus(response.data.data.status);
            setTotalEarnings(response.data.data.totalEarnings);
            setTotalAmount(response.data.data.netSalary);
            setAllowances(response.data.data.allowances || {});
            setDeductions(response.data.data.deductions || {});
            console.log("Fetched salary structures:", response.data.data);
        } catch (error) {
            console.error("API fetch error:", error);
        }
    };


    useEffect(() => {
        fetchSalary();
    }, []);

    const onSubmit = (data) => {
        if (Object.values(data).every(value => value === 0 || value === "")) {
            return;
        }
        const postData = {
            companyName,
            basicSalary,
            fixedAmount,
            variableAmount,
            grossAmount,
            totalEarnings,
            allowances: {
                allowances
            },
            deductions: {
                deductions
            },
            netSalary: totalAmount,
            status: data.status,
            ...data
        };
        EmployeeSalaryPatchApiById(id, salaryId, postData)
            .then((response) => {
                toast.success("Employee Salary Updated Successfully");
                setErrorMessage("");
                setShowFields(false);
                navigate('/employeeview');
            })
            .catch((error) => {
                handleApiErrors(error);
            });
    };

    const handleApiErrors = (error) => {
        if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
            const errorMessage = error.response.data.error.message;
            toast.error(errorMessage);
        } else {
            toast.error("Network Error !");
        }
        console.error(error.response);
    };

    const formatFieldName = (fieldName) => {
        return fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                        <div className="col">
                            <h1 className="h3 mb-3"><strong>Salary View</strong></h1>
                        </div>
                        <div className="col-auto" style={{ paddingBottom: '20px' }}>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item"><Link to="/main">Home</Link></li>
                                    <li className="breadcrumb-item active">Salary View</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title"> Salary Details </h5>
                                    <hr />
                                    <div className="row">
                                        <div className="col-md-5 mb-3">
                                            <label className="form-label">Variable Amount</label>
                                            <input
                                                id="variableAmount"
                                                type="text"
                                                className="form-control"
                                                autoComplete="off"
                                                maxLength={10}
                                                // {...register("variableAmount", {
                                                //     required: "Variable amount is required",
                                                //     pattern: {
                                                //         value: /^[0-9]+$/,
                                                //         message: "These filed accepcts only Integers",
                                                //     },
                                                //     validate: {
                                                //         notZero: value => value !== "0" || "Value cannot be 0"
                                                //     },
                                                //     minLength: {
                                                //         value: 5,
                                                //         message: "Minimum 5 Numbers Required"
                                                //     },
                                                //     maxLength: {
                                                //         value: 10,
                                                //         message: "Maximum 10 Numbers Allowed"
                                                //     },
                                                // })}
                                                // readOnly={isReadOnly}
                                                readOnly
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
                                            <label className="form-label">Fixed Amount<span style={{ color: "red" }}>*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                autoComplete="off"
                                                maxLength={10}
                                                // {...register("fixedAmount", {
                                                //     required: "Fixed amount is required",
                                                //     pattern: {
                                                //         value: /^[0-9]+$/,
                                                //         message: "These filed accepcts only Integers",
                                                //     },
                                                //     minLength: {
                                                //         value: 5,
                                                //         message: "Minimum 5 Numbers Required"
                                                //     },
                                                //     maxLength: {
                                                //         value: 10,
                                                //         message: "Maximum 10 Numbers Allowed"
                                                //     },
                                                //     validate: {
                                                //         notZero: value => value !== "0" || "Value cannot be 0"
                                                //     }
                                                // })}
                                                // readOnly={isReadOnly}
                                                readOnly
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
                                            <label className="form-label">Gross Amount<span style={{ color: "red" }}>*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                autoComplete="off"
                                                value={grossAmount}
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-md-1 mb-3"></div>
                                        <div className="col-md-5 mb-3">
                                            <label className="form-label">Monthly Salary<span style={{ color: "red" }}>*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={monthlySalary}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {salaryStructures.map((structure, index) => {
                                const isReadOnly = structure.status === 'InActive';
                                return (
                                    <div key={structure.salaryId} className="col-12 mb-4">
                                        <div className="row">
                                            <div className="col-6">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h5 className="card-title">Allowances</h5>
                                                        <hr />
                                                        {structure.salaryConfigurationEntity?.allowances && Object.keys(structure.salaryConfigurationEntity.allowances).length > 0 ? (
                                                            Object.keys(structure.salaryConfigurationEntity.allowances).map((allowance) => (
                                                                <div key={allowance} className="mb-2">
                                                                    <label className='form-label'>{formatFieldName(allowance)}</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        readOnly={isReadOnly}
                                                                        defaultValue={structure.salaryConfigurationEntity.allowances[allowance]}
                                                                        {...register(`allowances.${allowance}`, {
                                                                            required: "Value is required",
                                                                            pattern: {
                                                                                value: /^[0-9]*$/,
                                                                                message: "This field accepts only integers",
                                                                            },
                                                                        })}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            setValue(`allowances.${allowance}`, value);
                                                                        }}
                                                                    />
                                                                    {errors.allowances?.[allowance] && (
                                                                        <p className="text-danger">{errors.allowances[allowance]?.message}</p>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p>No allowances found.</p>
                                                        )}
                                                        <div className="col-12" style={{ marginTop: "10px" }}>
                                                            <label className="form-label">Total Earnings<span style={{ color: "red" }}>*</span></label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={totalEarnings}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h5 className="card-title">Deductions</h5>
                                                        <hr />
                                                        {structure.salaryConfigurationEntity?.deductions && Object.keys(structure.salaryConfigurationEntity.deductions).length > 0 ? (
                                                            Object.keys(structure.salaryConfigurationEntity.deductions).map((deduction) => (
                                                                <div key={deduction} className="mb-2">
                                                                    <label className='form-label'>{formatFieldName(deduction)}</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        readOnly={isReadOnly}
                                                                        defaultValue={structure.salaryConfigurationEntity.deductions[deduction]}
                                                                        {...register(`deductions.${deduction}`, {
                                                                            required: "Value is required",
                                                                            pattern: {
                                                                                value: /^[0-9]*$/, // Allow empty input as well
                                                                                message: "This field accepts only integers",
                                                                            },
                                                                        })}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            setValue(`deductions.${deduction}`, value); // Update form value
                                                                        }}
                                                                    />
                                                                    {errors.deductions?.[deduction] && (
                                                                        <p className="text-danger">{errors.deductions[deduction]?.message}</p>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p>No deductions found.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <div className="col-6">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h5 className="card-title">Status</h5>
                                                        <hr />
                                                        <div className="col-12">
                                                            <label className="form-label">
                                                                Status<span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Controller
                                                                name="status"
                                                                control={control}
                                                                defaultValue={status}
                                                                readOnly={isReadOnly}
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
                                                                        placeholder="Select Status"
                                                                    />
                                                                )}
                                                            />
                                                            {errors.status && <p className="errorMsg"> Status is Required</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h5 className="card-title"> Net Salary </h5>
                                                        <hr />
                                                        <div className="col-12">
                                                            <label className="form-label">Total Amount<span style={{ color: "red" }}>*</span></label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={totalAmount}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 text-end" style={{ marginTop: "60px" }}>
                                            <button type="submit" className="btn btn-danger">
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </form>
            </div >
        </LayOut >
    );
};

export default EmployeeSalaryUpdate;
