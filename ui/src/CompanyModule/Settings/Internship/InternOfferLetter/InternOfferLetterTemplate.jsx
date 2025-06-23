import React from "react";

const InternOfferTemplate = ({
  companyLogo,
  stamp,
  companyData,
  date,
  employeeName,
  address,
  department,
  startDate,
  endDate,
  designation,
  associateName,
  associateDesignation,
  stipend,
  acceptDate,
  hrName,
  hrEmail,
  hrMobileNo,
  draft,
  
}) => {
  return (
    <div className="card p-4">
        <div className="m-3">
      <h5 className="title text-center">OFFER LETTER INTERN</h5>
      <div className="logo d-flex justify-content-start align-items-center me-5 mb-1">
       {!draft && (<img src={companyLogo} alt="Company Logo" 
          style={{ height: "100px", width: "160px" }}
        />)}
      </div>
         {!draft && (  <div
        style={{
          position: "absolute",
          top: "30%",
          left: "20%",
          right: "30%",
          width: "50%",
          height: "50%",
          opacity: 0.1, // Adjust opacity for watermark effect
          border: "none",
          backgroundImage: `url(${companyLogo})`, // Use the logo or another image
          transform: "rotate(340deg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          //  filter: 'blur(2px)', // Optional: adjust blur as needed
          zIndex: 1, // Ensure it's behind the content
        }}
      /> )}
      <p>Date: {date}</p>
      <p>
        <b>NAME:</b> {employeeName}
        <br />
        {address}
      </p>

      <p>
        <b>Re: Internship Confirmation</b>
      </p>

      <p>Dear {employeeName},</p>

      <p>
        We are thrilled to offer you an internship in our <b>{department}</b> department at{" "}
        <b>{companyData.companyName}</b>. We were highly impressed with your skills during the selection process, and we are excited to welcome you to our team.
      </p>
      <p>
        Your internship will commence on <b>{startDate}</b> and will conclude on <b>{endDate}</b>. You will be working as a <b>{designation}</b>. You will be directly reporting to <b>{associateName}</b>, <b>{associateDesignation}</b>, who will provide guidance and support throughout your internship.
      </p>
      <p>
        <b>Compensation & Benefits</b>
        <br />
        We are pleased to offer you a <b>₹{stipend}/-</b> per <b>Month</b> internship stipend.
      </p>
      <p>
        <b>Acceptance</b>
        <br />
        To accept this offer, please sign and return this letter by <b>{acceptDate}</b>. We look forward to welcoming you to <b>{companyData.companyName}</b>.
      </p>
   <div className="d-flex justify-content-between align-items-end">
  {/* Left: Signature Text */}
  <div className="signature text-start">
    Regards,
    <br />
    <b>{hrName}</b>
    <br />
    Email: {hrEmail}
    <br />
    Mobile: {hrMobileNo}
  </div>

  {/* Right: Stamp & Authorized Signature */}
  <div className="text-end">
    {!draft && (
      <img
        src={stamp}
        alt="stamp"
        className="logo mb-2"
        style={{ height: "100px", width: "160px" }}
      />
    )}
    <p>Authorized Signature</p>
  </div>
      </div>
      </div>
    </div>
  );
};

export default InternOfferTemplate;
