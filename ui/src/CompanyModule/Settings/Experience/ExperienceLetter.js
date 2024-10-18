import React, { useState } from 'react';

const ExperienceLetter = () => {
  // State for all inputs with new content
  const [companyName, setCompanyName] = useState("Tech Innovations Inc.");
  const [companyAddress, setCompanyAddress] = useState("456 Innovation Blvd.");
  const [cityStateZip, setCityStateZip] = useState("Tech City, CA 90210");
  const [phoneNumber, setPhoneNumber] = useState("(987) 654-3210");
  const [emailAddress, setEmailAddress] = useState("contact@techinnovations.com");
  const [website, setWebsite] = useState("www.techinnovations.com");
  
  const [employeeName, setEmployeeName] = useState("Alice Smith");
  const [parentName, setParentName] = useState("Robert Smith");
  const [jobTitle, setJobTitle] = useState("Senior Developer");
  const [startDate, setStartDate] = useState("15/05/2018");
  const [endDate, setEndDate] = useState("15/05/2023");
  const [responsibilities, setResponsibilities] = useState([
    'Led software development projects',
    'Mentored junior developers',
    'Streamlined processes for efficiency',
  ]);

  const [yourName, setYourName] = useState("John Johnson");
  const [yourJobTitle, setYourJobTitle] = useState("Project Manager");
  const [logoUrl, setLogoUrl] = useState("path_to_new_logo.png");

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '1200px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Edit Form Section */}
      <div style={{ flex: 1, marginRight: '20px' }}>
        <h1>Edit Experience Letter</h1>
        <form>
          <div>
            <label>Company Name:</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label>Company Address:</label>
            <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
          </div>
          <div>
            <label>City, State, Zip:</label>
            <input type="text" value={cityStateZip} onChange={(e) => setCityStateZip(e.target.value)} />
          </div>
          <div>
            <label>Phone Number:</label>
            <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <div>
            <label>Email Address:</label>
            <input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
          </div>
          <div>
            <label>Website:</label>
            <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div>
            <label>Employee Name:</label>
            <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
          </div>
          <div>
            <label>Parent's Name:</label>
            <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} />
          </div>
          <div>
            <label>Job Title:</label>
            <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          </div>
          <div>
            <label>Start Date:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label>End Date:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <label>Responsibilities:</label>
            <textarea 
              value={responsibilities.join('\n')} 
              onChange={(e) => setResponsibilities(e.target.value.split('\n'))} 
              rows="4"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label>Your Name:</label>
            <input type="text" value={yourName} onChange={(e) => setYourName(e.target.value)} />
          </div>
          <div>
            <label>Your Job Title:</label>
            <input type="text" value={yourJobTitle} onChange={(e) => setYourJobTitle(e.target.value)} />
          </div>
          <div>
            <label>Logo URL:</label>
            <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div style={{ flex: 1, border: '1px solid #ccc', padding: '10px', marginLeft: '20px' }}>
        <h2 className='text-center'>Preview</h2>
        <div style={{ textAlign: 'right' }}>
          <img src={logoUrl} alt="Company Logo" style={{ maxHeight: '80px' }} />
        </div>
        <h1>{companyName}</h1>
        <p>{companyAddress}</p>
        <p>{cityStateZip}</p>
        <p>{phoneNumber}</p>
        <p>{emailAddress}</p>
        <p>{website}</p>
        <p>Date: {new Date().toLocaleDateString()}</p>
        
        <h2 className='text-center'>TO WHOM IT MAY CONCERN</h2>

        <p>
          This is to certify that <strong>{employeeName}</strong>, son/daughter of <strong>{parentName}</strong>, has been employed with <strong>{companyName}</strong> as a <strong>{jobTitle}</strong> from <strong>{startDate}</strong> to <strong>{endDate}</strong>.
        </p>

        <p>
          During their tenure with us, <strong>{employeeName}</strong> has demonstrated exceptional skills and dedication in their role. Their primary responsibilities included:
        </p>
        <ul>
          {responsibilities.map((responsibility, index) => (
            <li key={index}>{responsibility}</li>
          ))}
        </ul>
        
        <p>
          <strong>{employeeName}</strong> has shown commendable work ethic, professionalism, and teamwork. Their contributions have significantly benefited our organization.
        </p>

        <p>We wish them the best in their future endeavors.</p>

        <p>Sincerely,</p>
        <p>
          <strong>{yourName}</strong><br />
          {yourJobTitle}<br />
          {companyName}
        </p>
      </div>
    </div>
  );
};

export default ExperienceLetter;
