import React, { useState } from 'react';

const ExperienceTemplate2 = () => {
    const [employeeName, setEmployeeName] = useState('XXXXX');
    const [startDate, setStartDate] = useState('Sep 03, 2018');
    const [endDate, setEndDate] = useState('Sep 24, 2021');
    const [designation, setDesignation] = useState('Application Developer');

    // Editable text area content
    const [certificationText, setCertificationText] = useState(
        `This is to certify that Mr. ${employeeName} was employed with our Company VBRS IT SOLUTIONS PVT LTD from ${startDate} to ${endDate} as a ${designation}.\n\n` +
        `We found Mr. ${employeeName} to be very dedicated to the work assigned. He was result-oriented, professional, and sincere. He possesses excellent interpersonal skills and knowledge, which helped in completing many valuable business assignments. He is a true team player and a fun-loving individual who mixes well with his seniors and juniors alike.\n\n` +
        `We wish him all the best for his future ventures. Please feel free to contact us for any other information required.`
    );

    // Footer details state
    const [companyName, setCompanyName] = useState('XXXXXXXXXXXXXXXXXX');
    const [companyDetails, setCompanyDetails] = useState(`1234 Company Lane, City, State, Zip\n(123) 456-7890\ninfo@vbrsit.com\nwww.vbrsit.com`);

    const handleInputChange = () => {
        setCertificationText(
            `This is to certify that Mr. ${employeeName} was employed with our Company ${companyName} from ${startDate} to ${endDate} as ${designation}.\n\n` +
            `We found Mr. ${employeeName} to be very dedicated to the work assigned. He was result-oriented, professional, and sincere. He possesses excellent interpersonal skills and knowledge, which helped in completing many valuable business assignments. He is a true team player and a fun-loving individual who mixes well with his seniors and juniors alike.\n\n` +
            `We wish him all the best for his future ventures. Please feel free to contact us for any other information required.`
        );
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">EXPERIENCE CERTIFICATE</h2>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="mb-0">Date: {new Date().toLocaleDateString()}</p>
                <img src='assets/pathbreaker_logo.png' alt="Company Logo" style={{ width: '200px', height: '80px' }} />
            </div>
            <h5 className="text-center">TO WHOMSOEVER IT MAY CONCERN</h5>

            <div className="mb-4 d-flex col-12">
                <label className="form-label">Employee Name:</label>
                <div className='col-3'>
                <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => {
                        setEmployeeName(e.target.value);
                        handleInputChange();
                    }}
                    className="form-control"
                />
                </div>
            </div>

            <div className="mb-4 d-flex col-12">
                <label className="form-label">Start Date:</label>
                <div className='col-3'>
                <input
                    type="text"
                    value={startDate}
                    onChange={(e) => {
                        setStartDate(e.target.value);
                        handleInputChange();
                    }}
                    className="form-control"
                />
                </div>
            </div>

            <div className="mb-4 d-flex col-12" >
                <label className="form-label">End Date:</label>
                <div className='col-3'>
                <input
                    type="text"
                    value={endDate}
                    onChange={(e) => {
                        setEndDate(e.target.value);
                        handleInputChange();
                    }}
                    className="form-control"
                />
                </div>
            </div>

            <div className="mb-4 d-flex col-12">
                <label className="form-label">Designation:</label>
                <div className='col-3'>
                <input
                    type="text"
                    value={designation}
                    onChange={(e) => {
                        setDesignation(e.target.value);
                        handleInputChange();
                    }}
                    className="form-control"
                />
                </div>
            </div>

            <div className="card p-4">
                <textarea
                    value={certificationText}
                    onChange={(e) => setCertificationText(e.target.value)}
                    className="form-control mt-3"
                    rows={10}
                />
                <div className="text-end mt-4">
                    <h6>For {companyName}</h6>
                    <p>Authorized Signature</p>
                </div>
            </div>

            {/* Editable Footer Section as Text Areas */}
            <footer className="mt-5 text-center">
                <div>
                    <h6>Company Details</h6>
                    <textarea

                        value={companyName}
                        onChange={(e) => {
                            setCompanyName(e.target.value);
                            handleInputChange();
                        }}
                        className="form-control mb-2 text-center"
                        rows={1}
                    />
                    <textarea
                        value={companyDetails}
                        onChange={(e) => setCompanyDetails(e.target.value)}
                        className="form-control mb-2 text-center"
                        rows={5}
                    />
                </div>
            </footer>
        </div>
    );
}

export default ExperienceTemplate2;
