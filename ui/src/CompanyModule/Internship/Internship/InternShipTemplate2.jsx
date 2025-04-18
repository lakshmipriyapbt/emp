import React, { useEffect, useState } from "react";
import { useAuth } from "../../../Context/AuthContext";
import { companyViewByIdApi } from "../../../Utils/Axios";

const InternShipTemplate2 = ({
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
  const { user, company } = useAuth();
  const [error, setError] = useState(null);
  const [value, setValue] = useState("");
  const [companyDetails, setCompanyDetails] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
        if (!company?.id) return;

        try {
            const response = await companyViewByIdApi(company?.id);
            const data = response.data;
            setCompanyDetails(data);
            Object.keys(data).forEach(key => setValue(key, data[key]));
        } catch (err) {
            setError(err);
        }
    };

    fetchCompanyData();
}, [company?.id, setValue, setError]);

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
      <div className="d-flex justify-content-between align-items-center">
        {/* Left side: Company Information */}
        <div className="text-start">
          <div style={{ textAlign: "left" }}>
            <h4>{companyName}</h4>
            <p>{companyAddress}</p>
            <p> [{contactNumber} | {mailId}]</p>
          </div>
        </div>

        {/* Right side: Company Logo */}
        <div style={{ textAlign: "right" }}>
        {company?.imageFile ? (
          <img className="align-middle" src={company?.imageFile} alt="Logo" style={{ height: "80px", width: "180px" }} />
        ) : (
          <p>Logo</p>
        )}
      </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "20%",
          right: "30%",
          width: "50%",
          height: "50%",
          backgroundImage: `url(${company?.imageFile})`,
          transform: "rotate(340deg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          zIndex: 1,
        }}
      />
      <h4 className="text-center p-3">INTERNSHIP CERTIFICATION</h4>
      <p className="text-start p-2"><strong>{new Date().toLocaleDateString()}</strong></p>


      {/* Content div */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(2px)",
        }}
      >
        <h6 className="text-center">TO WHOMSOEVER IT MAY CONCERN</h6>

        <p>
          We are pleased to inform that <strong>{employeeName}</strong>&nbsp;
          has successfully completed an internship program with{" "}
          <strong>{companyName}</strong> as a <strong>{designation}</strong> in
          the <strong>{department}</strong> department from{" "}
          <strong>{startDate}</strong> to <strong>{endDate}</strong>.
        </p>

        <p>
          Throughout the internship, {employeeName} demonstrated professionalism
          and dedication. We believe that {employeeName} has gained valuable
          experience that will aid in future professional endeavors.
        </p>

        <p>
          We wish {employeeName} the best of luck in all future endeavors and
          are confident that {employeeName} will continue to excel in their
          career path.
        </p>
        <div className="mt-5 pt-3">
          <p className="mb-5">With Best Wishes,</p>
          <div className="mt-5 pt-5">
            <p>Authorized Signature</p>
            <h4>{companyDetails?.companyName},</h4>
            <p style={{marginBottom:"8px"}}>{companyDetails?.companyAddress}.</p>
            <p>PH: {companyDetails?.mobileNo}, Email: {companyDetails?.emailId}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternShipTemplate2;
