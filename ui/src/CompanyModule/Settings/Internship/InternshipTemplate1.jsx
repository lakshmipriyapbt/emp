import React from 'react';

const InternshipTemplate1 = ({
        companyLogo,
        companyName,
        companyAddress,
        contactNumber,
        mailId,
        employeeName,
        designation,
        department,
        startDate,
        endDate,
}) => {


    return (

<div
  className="watermarked"
  style={{
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  }}
>
  {/* Position the logo absolutely to the right */}
  <div
    className="row justify-content-end"
    style={{
      position: "relative",
      top: "10px",  
      right: "20px",  
      zIndex: 10,
    }}
  >
    <img
      src={companyLogo}
      alt="Logo"
      style={{
        height: "70px",
        width: "160px",
        objectFit: "contain",   
      }}
    />
  </div>

  <div
    style={{
      position: "absolute",
      top: "30%",
      left: "20%",
      right: "30%",
      width: "50%",
      height: "50%",
      backgroundImage: `url(${companyLogo})`,
      transform: "rotate(340deg)",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      zIndex: 1,
    }}
  />
  <h4 className="text-center p-3">INTERNSHIP CERTIFICATION</h4>

<div className="row d-flex justify-content-end p-1">
  <div className="col-6">
    <p className="mb-0 text-end">{new Date().toLocaleDateString()}</p>
  </div>
</div>
  
  {/* Content div */}
  <div
    style={{
      position: "relative",
      zIndex: 2, 
      padding: "20px",
      backgroundColor: "rgba(255, 255, 255, 0.8)", 
      backdropFilter: "blur(2px)",     }}
  >
  <p> This is to certify that <strong>{employeeName}</strong> has successfully completed an internship program with <strong>{companyName}</strong> as a <strong>{designation}</strong> in the <strong>{department}</strong> department from <strong>{startDate}</strong> to <strong>{endDate}</strong>.</p>
  <p>Throughout the internship, {employeeName} demonstrated professionalism and dedication. We believe that {employeeName} has gained valuable experience that will aid in future professional endeavors.</p>
   <p>We wish {employeeName} the best of luck in all future endeavors and are confident that {employeeName} will continue to excel in their career path.</p>
    <div className="mt-5 pt-3">
      <p className="mb-5">With Best Wishes,</p>
      <div className="mt-5 pt-5">
        <p>Authorized Signature</p>
        {/* <h4>{companyName},</h4>
        <p>{mailId},</p>
        <p>{contactNumber},</p>
        <p>{companyAddress}.</p> */}
      </div>
    </div>
  </div>
</div>

    );
}

export default InternshipTemplate1;
