import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../Context/AuthContext";
import { companyViewByIdApi, EmployeeGetApiById } from "../../../../Utils/Axios";
import { toast } from "react-toastify";

const InternOfferPrev = ({
    previewData
}) => {
      const [companyData, setCompanyData] = useState({});
      const [loading, setLoading] = useState(false);
      const { company } = useAuth();

  return (
    <div className="p-4">
        <div className="m-3">
      <h5 className="title text-center">OFFER LETTER INTERN</h5>
      <div className="logo text-end me-5">
        <img src={company?.imageFile} alt="Company Logo" />
      </div>
      <p>Date: {previewData.date}</p>
      <p>
        <b>NAME:</b> {previewData.employeeName}
        <br />
        {previewData.address}
      </p>

      <p>
        <b>Re: Internship Confirmation</b>
      </p>

      <p>Dear {previewData.employeeName},</p>

      <p>
        We are thrilled to offer you an internship in our <b>{previewData.department}</b> department at{" "}
        <b>{companyData.companyName}</b>. We were highly impressed with your skills during the selection process, and we are excited to welcome you to our team.
      </p>
      <p>
        Your internship will commence on <b>{previewData.startDate}</b> and will conclude on <b>{previewData.endDate}</b>. You will be working as a <b>{previewData.designation}</b>. You will be directly reporting to <b>{previewData.associateName}</b>, <b>{previewData.associateDesignation}</b>, who will provide guidance and support throughout your internship.
      </p>
      <p>
        <b>Compensation & Benefits</b>
        <br />
        We are pleased to offer you a <b>₹{previewData.stipend}/-</b> internship stipend.
      </p>
      <p>
        <b>Acceptance</b>
        <br />
        To accept this offer, please sign and return this letter by <b>{previewData.acceptDate}</b>. We look forward to welcoming you to <b>{companyData.companyName}</b>.
      </p>
      <div className="row">
      <div className="signature text-start">
        Regards,
        <br />
        <b>{previewData.hrName}</b>
        <br />
        Email: {previewData.hrEmail}
        <br />
        Mobile: {previewData.hrMobileNo}
        <br />
      </div>

      <div className="logo text-end me-5">
        <img src={company?.stampImage} alt="stamp" />
        <p>Authorized Signature</p>
      </div>
      </div>
      </div>
    </div>
  );
};

export default InternOfferPrev;
