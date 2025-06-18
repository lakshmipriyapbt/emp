import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LayOut from "../../LayOut/LayOut";
import { CandidateGetByIdApi } from "../../Utils/Axios";
import Loader from "../../Utils/Loader";

const CandidateProfile = () => {
    const navigate = useNavigate();
    const { userId, company } = useSelector((state) => state.auth);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);


    // In CandidateProfile.js
    useEffect(() => {
        console.log("Fetching profile for:", userId);

        if (!userId) {
            toast.error("User ID not available");
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await CandidateGetByIdApi(userId);

                if (response.status === 200) {
                    // Access the first item in the data array
                    setProfileData(response.data.data[0]); // Add [0] here
                } else {
                    throw new Error(response.data?.message || "No profile data found");
                }
            } catch (error) {
                console.error("Fetch error:", {
                    error,
                    userId,
                    endpoint: CandidateGetByIdApi.url
                });

                toast.error(error.response?.data?.message || "Failed to load profile");

                if (error.response?.status === 403) {
                    navigate(`/${company}/candidateLogin`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId, navigate, company]);


    if (loading) {
        return (
            <LayOut>
                <div className="container-fluid p-0">
                    <div className="row">
                        <div className="col-12">
                            <Loader />
                        </div>
                    </div>
                </div>
            </LayOut>
        );
    }

    if (!profileData) {
        return (
            <LayOut>
                <div className="container-fluid p-0">
                    <div className="row">
                        <div className="col-12">
                            <div className="alert alert-danger mt-3">
                                Profile data not available
                            </div>
                        </div>
                    </div>
                </div>
            </LayOut>
        );
    }

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3">
                            <strong>My Profile</strong>
                        </h1>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title mb-0">Personal Information</h5>
                                <div className="dropdown-divider" style={{ borderTopColor: "#d7d9dd" }} />
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={profileData.firstName || "N/A"}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={profileData.lastName || "N/A"}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={profileData.emailId || "N/A"}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Mobile Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            value={profileData.mobileNo || "N/A"}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Date of Registration</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={
                                                profileData.dateOfHiring
                                                    ? new Date(profileData.dateOfHiring).toLocaleDateString()
                                                    : "N/A"
                                            }
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Status</label>
                                        <input
                                            type="text"
                                            className={`form-control ${profileData.status === 'Active' ? 'text-success' : 'text-secondary'}`}
                                            value={profileData.status || "N/A"}
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

export default CandidateProfile;