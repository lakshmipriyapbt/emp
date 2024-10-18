import React, { useState } from 'react';
import './ExperienceTemplate.css'; // Import your CSS file if needed

const ExperienceTemplate1 = () => {
    const [employeeName, setEmployeeName] = useState('XXXXX');
    const [startDate, setStartDate] = useState('Sep 03, 2018');
    const [endDate, setEndDate] = useState('Sep 24, 2021');
    const [designation, setDesignation] = useState('Application Developer');

    return (
        <div className="container mt-5">
            <h2 className="text-center">EXPERIENCE CERTIFICATE</h2>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="mb-0">Date: {new Date().toLocaleDateString()}</p>
                <img src='assets/pathbreaker_logo.png' alt="Company Logo" style={{ width: '200px', height: '80px' }} />
            </div>
            <h5 className="text-center">TO WHOMSOEVER IT MAY CONCERN</h5>
            
            <div className="mb-4">
                <label className="form-label">Employee Name:</label>
                <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="form-control"
                />
            </div>

            <div className="mb-4">
                <label className="form-label">Start Date:</label>
                <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-control"
                />
            </div>

            <div className="mb-4">
                <label className="form-label">End Date:</label>
                <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-control"
                />
            </div>

            <div className="mb-4">
                <label className="form-label">Designation:</label>
                <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="form-control"
                />
            </div>

            <div className="card p-4">
                <p>
                    This is to certify that Mr. <strong>{employeeName}</strong> was employed with our Company 
                    <strong> VBRS IT SOLUTIONS PVT LTD</strong> from <strong>{startDate}</strong> to <strong>{endDate}</strong> as 
                    a <strong>{designation}</strong>.
                </p>
                <p>
                    We found Mr. <strong>{employeeName}</strong> to be very dedicated to the work assigned. 
                    He was result-oriented, professional, and sincere. He possesses excellent 
                    interpersonal skills and knowledge, which helped in completing many valuable 
                    business assignments. He is a true team player and a fun-loving individual who 
                    mixes well with his seniors and juniors alike.
                </p>
                <p>
                    We wish him all the best for his future ventures. Please feel free to contact us 
                    for any other information required.
                </p>
                <div className="text-end mt-4">
                    <h6>For VBRS IT SOLUTIONS (P) LTD</h6>
                    <p>Authorized Signature</p>
                </div>
            </div>
        </div>
    );
}

export default ExperienceTemplate1;
