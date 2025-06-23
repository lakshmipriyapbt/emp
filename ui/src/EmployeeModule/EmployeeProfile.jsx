import React, { useEffect, useState } from "react";
import LayOut from "../LayOut/LayOut";
import { EmployeeGetApiById, EmployeePatchApiById, } from "../Utils/Axios";
import { useAuth } from "../Context/AuthContext";
import { toast } from "react-toastify";

const EmployeeProfile = () => {
    const [error, setError] = useState("");
    const [employeeData, setEmployeeData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const { authUser } = useAuth();

    useEffect(() => {
        if (!authUser?.userId) return; 

        const fetchData = async () => {
            try {
                const response = await EmployeeGetApiById(authUser?.userId);
                setEmployeeData(response.data.data);
                if (response.data.data.photoUrl) {
                    setPreviewUrl(response.data.data.photoUrl);
                }
            } catch (error) {
                setError("Failed to fetch employee data");
                console.error("Error fetching employee data:", error);
            }
        };
        fetchData();
    }, [authUser?.userId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match('image.*')) {
            toast.error("Please select an image file (JPEG, PNG, etc.)");
            return;
        }

        // Validate file size (e.g., 2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size should be less than 2MB");
            return;
        }

        setSelectedFile(file);

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.warning("Please select a file first");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('photo', selectedFile);
            formData.append('employeeId', authUser.userId);

            const response = await EmployeePatchApiById(authUser.userId, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success("Profile photo uploaded successfully!");
            // Update the employee data with the new photo URL if returned by the API
            if (response.data.photoUrl) {
                setEmployeeData({...employeeData, photoUrl: response.data.photoUrl});
                setPreviewUrl(response.data.photoUrl);
            }
        } catch (error) {
            console.error("Error uploading photo:", error);
            toast.error("Failed to upload photo. Please try again.");
        } finally {
            setIsUploading(false);
            setSelectedFile(null);
        }
    };

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3"><strong>Profile</strong> </h1>
                    </div>
                    <div className="col-auto">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <a href="/main">Home</a>
                                </li>
                                <li className="breadcrumb-item active">
                                    Profile
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title">Employee Data</h5>
                                <div className="dropdown-divider" style={{ borderTopColor: "#d7d9dd" }} />
                            </div>
                            <div className="card-body">
                                {/* Profile Photo Section */}
                                <div className="row mb-4">
                                    <div className="col-12 text-start">
                                        <div className="position-relative d-inline-block">
                                            {previewUrl ? (
                                                <>
                                                    <img 
                                                        src={previewUrl} 
                                                        alt="Profile" 
                                                        className="rounded-circle"
                                                        style={{
                                                            width: "150px",
                                                            height: "150px",
                                                            objectFit: "cover",
                                                            border: "3px solid #dee2e6"
                                                        }}
                                                    />
                                                    <div className="mt-3">
                                                        <input 
                                                            type="file" 
                                                            id="profilePhoto" 
                                                            accept="image/*" 
                                                            onChange={handleFileChange}
                                                            className="d-none"
                                                        />
                                                        <label 
                                                            htmlFor="profilePhoto" 
                                                            className="btn btn-sm btn-primary me-2"
                                                        >
                                                            <i className="bi bi-upload me-1"></i> Change Photo
                                                        </label>
                                                        {selectedFile && (
                                                            <button 
                                                                onClick={handleUpload}
                                                                className="btn btn-sm btn-success"
                                                                disabled={isUploading}
                                                            >
                                                                {isUploading ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                        Uploading...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="bi bi-check-circle me-1"></i> Upload
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div 
                                                        className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: "150px",
                                                            height: "150px",
                                                            border: "3px dashed #dee2e6"
                                                        }}
                                                    >
                                                        <i className="bi bi-person" style={{ fontSize: "4rem" }}></i>
                                                    </div>
                                                    <div className="mt-3">
                                                        <input 
                                                            type="file" 
                                                            id="profilePhoto" 
                                                            accept="image/*" 
                                                            onChange={handleFileChange}
                                                            className="d-none"
                                                        />
                                                        <label 
                                                            htmlFor="profilePhoto" 
                                                            className="btn btn-sm btn-primary me-2"
                                                        >
                                                            <i className="bi bi-upload me-1"></i> Upload Photo
                                                        </label>
                                                        {selectedFile && (
                                                            <button 
                                                                onClick={handleUpload}
                                                                className="btn btn-sm btn-success"
                                                                disabled={isUploading}
                                                            >
                                                                {isUploading ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                        Uploading...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="bi bi-check-circle me-1"></i> Upload
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Rest of the employee data */}
                                <div className="row">
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">
                                            Employee Type
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="employeeType"
                                            value={employeeData.employeeType || ""}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Employee ID</label>
                                        <input
                                            className="form-control"
                                            name="employeeId"
                                            value={employeeData.employeeId}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">First Name </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="firstName"
                                            value={employeeData.firstName}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="lastName"
                                            value={employeeData.lastName}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Email Id</label>
                                        <input
                                            className="form-control"
                                            name="emailId"
                                            value={employeeData.emailId}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Date of Hiring</label>
                                        <input
                                            name="dateOfHiring"
                                            className="form-control"
                                            autoComplete="off"
                                            value={employeeData.dateOfHiring}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="department"
                                            value={employeeData.departmentName}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                                        <label className="form-label">Designation</label>
                                        <input
                                            name="designation"
                                            type="text"
                                            className="form-control"
                                            value={employeeData.designationName}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">manager</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.manager}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Location</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.location}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Date of Birth</label>
                                        <input
                                            name="dateOfBirth"
                                            className="form-control"
                                            value={employeeData.dateOfBirth}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>

                                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                                        <label className="form-label mb-3">Employee Status </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.status}
                                            name="status"
                                            readOnly
                                        />
                                    </div>
                                    <div className="card-header" style={{ paddingLeft: "0px" }}>
                                        <h5 className="card-title ">
                                            Bank Accoount Details
                                        </h5>
                                        <div
                                            className="dropdown-divider"
                                            style={{ borderTopColor: "#d7d9dd" }}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Bank Account Number </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.accountNo}
                                            name="accountNo"
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Bank IFSC Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.ifscCode}
                                            name="ifscCode"
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Bank Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.bankName}
                                            name="bankName"
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">UAN Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.uanNo}
                                            name="uanNo"
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">PAN Number</label>
                                        <input
                                            className="form-control"
                                            value={employeeData.panNo}
                                            name="panNo"
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Aadhaar Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.aadhaarId}
                                            name="aadhaarId"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayOut>
    );
};

export default EmployeeProfile;