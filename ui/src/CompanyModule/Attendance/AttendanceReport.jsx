import React, { useEffect, useState } from 'react';
import LayOut from '../../LayOut/LayOut';
import Select from 'react-select';
import { useForm } from 'react-hook-form';
import { Bounce, toast } from 'react-toastify';
import { EmployeeGetApi, AttendanceReportApi, AttendanceDeleteById, AttendancePatchById } from '../../Utils/Axios';
import { PencilSquare, XSquareFill } from 'react-bootstrap-icons';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import DeletePopup from '../../Utils/DeletePopup';
import { ModalTitle, ModalHeader, ModalBody } from 'react-bootstrap';

const AttendanceReport = () => {

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({ mode: 'onChange' });
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [showFields, setShowFields] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState({});
    const [editAttendance, setEditAttendance] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [refreshData, setRefreshData] = useState("");
    const [employeeAttendance, setEmployeeAttendance] = useState([]);
    const [employeeId, setEmployeeId] = useState("");
    const [finalEmployeeDetails, setFinalEmployeeDetails] = useState({});
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [selectedAttendanceId, setSelectedAttendanceId] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState({});
    const [isAllAttendance, setIsAllAttendance] = useState(false);
    const [isAttendance, setIsAttendance] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [columns, setColumns] = useState([]);
    const [hasRecords, setHasRecords] = useState(true);

    const navigate = useNavigate();

    const handleEmployeeChange = (selectedOption) => {
        setEmployeeId(selectedOption.value);
        const selectedEmployee = employees.find(emp => emp.value === selectedOption.value);
        setSelectedEmployeeDetails(selectedEmployee);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedItemId(null);
        setSelectedEmployeeId("");
        setSelectedAttendanceId("");
    };

    const handleShowDeleteModal = (row) => {
        setSelectedItemId(row.id);
        setSelectedEmployeeId(row.employeeId);
        setSelectedAttendanceId(row.attendanceId);
        setShowDeleteModal(true);
    };

    const handleShowEditModal = (row) => {
        setSelectedAttendance(row);
        setSelectedEmployeeId(row.employeeId);
        setSelectedAttendanceId(row.attendanceId);
        reset({
            totalWorkingDays: row.totalWorkingDays,
            noOfWorkingDays: row.noOfWorkingDays,
        });
        setEditAttendance(true);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedAttendance({});
    };

    const filterByMonthYear = () => {
        if (!selectedYear && !handleEmployeeChange) {
            alert("Please select a year.");
            return;
        }
        fetchAttendanceData(employeeId, selectedMonth, selectedYear);
        setFinalEmployeeDetails(selectedEmployeeDetails);

    };

    const fetchAttendanceData = async (empId, month, year) => {
        try {
            const monthNames = getMonthNames();
            const monthName = monthNames[month - 1];
            const response = await AttendanceReportApi(empId, monthName, year);
            const data = response.data.data;
            setAttendanceData(data);
            setEmployeeAttendance(data);
            setHasRecords(data.length > 0);
            setShowFields(true);
            setIsAllAttendance(false);
            setIsAttendance(true);
            updateColumns(true);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            setHasRecords(false);
        }
    };

    const fetchAllAttendanceData = async () => {
        try {
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();

            const monthNames = getMonthNames();
            const currentMonthName = monthNames[currentMonth - 1];

            const response = await AttendanceReportApi(null, currentMonthName, currentYear);
            const data = response.data.data;
            setAttendanceData(data);
            setHasRecords(data.length > 0);
            setIsAllAttendance(true);
            setIsAttendance(false);
            updateColumns(true);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            setHasRecords(false); // In case of error, assume no records
        }
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await EmployeeGetApi();
                const formattedData = data
                    .filter((employee) => employee.firstName !== null)
                    .map(({ id, firstName, lastName, employeeId }) => ({
                        label: `${firstName} ${lastName} (${employeeId})`,
                        value: id,
                        firstName,
                        lastName,
                        employeeId,
                    }));
                setEmployees(formattedData);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        fetchEmployees();
        fetchAllAttendanceData();
    }, []);

    const getMonthNames = () => {
        return Array.from({ length: 12 }, (_, i) =>
            new Date(0, i).toLocaleString("en-US", { month: "long" })
        );
    };

    const getRecentYears = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 11 }, (_, i) => (currentYear - i).toString());
    };

    const handleDelete = async () => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const monthNames = getMonthNames();
        const currentMonthName = monthNames[currentMonth - 1];

        try {
            await AttendanceDeleteById(selectedEmployeeId, selectedAttendanceId);
            toast.success("Attendance Record Deleted Successfully", {
                position: "top-right",
                transition: Bounce,
                hideProgressBar: true,
                theme: "colored",
                autoClose: 3000,
            });
            setTimeout(() => {
                handleCloseDeleteModal();
                fetchAllAttendanceData(null, currentMonthName, currentYear);
                setRefreshData((prev) => !prev);
            }, 1500);
        } catch (error) {
            handleApiErrors(error);
        }
    };

    const onSubmit = async (data) => {
        try {
            await AttendancePatchById(selectedEmployeeId, selectedAttendanceId, data);
            toast.success("Attendance Record Updated Successfully", {
                position: "top-right",
                transition: Bounce,
                hideProgressBar: true,
                theme: "colored",
                autoClose: 3000,
            });
            setTimeout(() => {
                handleCloseEditModal();
                setRefreshData((prev) => !prev);
                navigate("/attendanceReport");
                fetchAllAttendanceData(employeeId, selectedMonth, selectedYear);
            }, 1000);
        } catch (error) {
            handleApiErrors(error);
        }
    };

    const formatDateHeader = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthNames = getMonthNames();
        return `Attendance Details for ${monthNames[currentMonth]} ${currentYear}`;
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

    const updateColumns = (update = false) => {
        const commonColumns = [
            {
                name: <h6><b>No. Of Working Days</b></h6>,
                selector: (row) => row.noOfWorkingDays,
                width: "240px",
            },
            {
                name: <h6><b>Total Working Days</b></h6>,
                selector: (row) => row.totalWorkingDays,
                width: "240px",
            },
            {
                name: <h6><b>Actions</b></h6>,
                cell: (row) => (
                    <div>
                        <button
                            className="btn btn-sm"
                            style={{ backgroundColor: "transparent", border: "none", padding: "0", marginLeft: "5px" }}
                            onClick={() => handleShowEditModal(row)}
                            title='Edit'
                        >
                            <PencilSquare size={22} color="#2255a4" />
                        </button>
                        <button
                            className="btn btn-sm"
                            style={{ backgroundColor: "transparent", border: "none", padding: "0", marginLeft: "5px" }}
                            onClick={() => handleShowDeleteModal(row)}
                            title='Delete'
                        >
                            <XSquareFill size={22} color="#da542e" />
                        </button>
                    </div>
                ),
            },
        ];

        const dynamicColumns = [
            {
                name: <h6><b>S No</b></h6>,
                selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
                width: "80px",
            },
            ...(!isAttendance && !selectedYear && !selectedMonth ? [{
                name: <h6><b>Name</b></h6>,
                selector: (row) => `${row.firstName} ${row.lastName}`,
                width: "200px",
            }] : []),
            ...(!isAttendance && selectedYear ? [{
                name: <h6><b>Name</b></h6>,
                selector: (row) => `${row.firstName} ${row.lastName}`,
                width: "150px",
            }] : []),
            ...(!isAttendance && selectedYear ? [{
                name: <h6><b>month</b></h6>,
                selector: (row) => row.month,
                width: "150px",
            }] : []),
        ];

        if (update) {
            setColumns([...dynamicColumns, ...commonColumns]);
        } else {
            setColumns([...commonColumns]);
        }
    };

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3">
                            <strong>Attendance Report</strong>
                        </h1>
                    </div>
                    <div className="col-auto" style={{ paddingBottom: '20px' }}>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <a href="/main">Home</a>
                                </li>
                                <li className="breadcrumb-item active">Attendance</li>
                                <li className="breadcrumb-item active">Attendance Report</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="row d-flex justify-content-center" style={{ paddingLeft: '50px' }}>
                                    <div className="col-md-3 mt-3">
                                        <label className="card-title">Select Employee <span className='text-danger'>*</span></label>
                                        <Select
                                            options={employees}
                                            onChange={handleEmployeeChange}
                                            placeholder="Select Employee"
                                            menuPortalTarget={document.body}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                }),
                                            }}
                                        />
                                        {selectedEmployee && <p>Selected: {selectedEmployee.label}</p>}
                                    </div>
                                    <div className="col-md-3 mt-3">
                                        <label className="card-title">Select Year <span className='text-danger fw-100'>*</span></label>
                                        <select
                                            className="form-select"
                                            style={{ paddingBottom: '6px', zIndex: "1" }}
                                            value={selectedYear}
                                            onChange={(e) => {
                                                setSelectedYear(e.target.value); // Update state
                                                filterByMonthYear(selectedMonth, e.target.value); // Call the filtering function
                                            }}
                                        >
                                            <option value="">Select Year</option>
                                            {getRecentYears().map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3 mt-3">
                                        <label className="card-title">Select Month</label>
                                        <select
                                            className="form-select"
                                            style={{ paddingBottom: '6px' }}
                                            value={selectedMonth}
                                            onChange={(e) => {
                                                setSelectedMonth(e.target.value); // Update state
                                                filterByMonthYear(e.target.value, selectedYear); // Call the filtering function
                                            }}
                                        >
                                            <option value="">Select Month</option>
                                            {getMonthNames().map((month, index) => (
                                                <option key={index} value={(index + 1).toString()}>
                                                    {month}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3 mt-5">
                                        <button
                                            style={{ paddingBottom: "8px" }}
                                            className="btn btn-primary"
                                            onClick={filterByMonthYear}
                                            disabled={!selectedYear || !employeeId}
                                        >
                                            Go
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <h5 className="card-title mt-2">
                                    {isAttendance ? (
                                        <>
                                            Pay Slip Details for{" "}
                                            {finalEmployeeDetails.firstName
                                                ? `${finalEmployeeDetails.firstName} ${finalEmployeeDetails.lastName} (${finalEmployeeDetails.employeeId})`
                        : 'All Employees'}
                                            {selectedYear && ` - ${selectedYear}`}
                                            {selectedMonth && ` - ${getMonthNames()[selectedMonth - 1]}`}
                                        </>
                                    ) : (
                                        formatDateHeader()
                                    )}
                                </h5>
                                <hr />
                                {hasRecords ? (
                                    <div>
                                        <DataTable
                                            columns={columns}
                                            data={attendanceData}
                                            pagination
                                            highlightOnHover
                                            pointerOnHover
                                            dense
                                            onChangePage={page => setCurrentPage(page)}
                                            onChangeRowsPerPage={perPage => setRowsPerPage(perPage)}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center mt-4">
                                        <p>There are no records to display</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DeletePopup
                show={showDeleteModal}
                handleClose={handleCloseDeleteModal}
                handleConfirm={handleDelete}
                id={selectedItemId}
                pageName="Attendance"
            />
            {showEditModal && (
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
                                <ModalTitle>Edit Attendance</ModalTitle>
                            </ModalHeader>
                            <ModalBody>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="card-body" style={{ width: "1060px", paddingBottom: "0px" }}>
                                        <div className='col-12 col-md-6 col-lg-4 mb-2'>
                                            <label>Total Working Days</label>
                                            <input
                                                type="number"
                                                name='totalWorkingDays'
                                                readOnly
                                                className="form-control"
                                                {...register("totalWorkingDays", { required: true })}
                                            />
                                            {errors.totalWorkingDays && <p className="errorMsg">{errors.totalWorkingDays.message}</p>}
                                        </div>
                                        <div className='col-12 col-md-6 col-lg-4 mb-2'>
                                            <label>No. Of Working Days</label>
                                            <input
                                                type="number"
                                                name='noOfWorkingDays'
                                                className="form-control"
                                                {...register("noOfWorkingDays", {
                                                    required: "No. of working days is required",
                                                    pattern: {
                                                        value: /^\d+$/,
                                                        message: "Only numbers are allowed",
                                                    },
                                                    min: {
                                                        value: 0,
                                                        message: "Cannot be less than 0 days",
                                                    },
                                                    validate: {
                                                        maxTotal: (value) => {
                                                            const totalWorkingDays = watch("totalWorkingDays"); // Use watch to get the value of totalWorkingDays
                                                            return value <= totalWorkingDays || "Cannot exceed total working days.";
                                                        },
                                                    },
                                                })}
                                            />
                                            {errors.noOfWorkingDays && <p className='errorMsg'>{errors.noOfWorkingDays.message}</p>}
                                        </div>
                                    </div>
                                    <div className='modal-footer'>
                                        <button
                                            className="btn btn-primary"
                                            type='submit'
                                        >
                                            Save changes
                                        </button>
                                        <button
                                            type='button'
                                            className="btn btn-secondary"
                                            onClick={handleCloseEditModal}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </ModalBody>
                        </div>
                    </div>
                </div>
            )}
        </LayOut>
    );
};

export default AttendanceReport;