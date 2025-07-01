import React from 'react';
import { useAuth } from '../../../Context/AuthContext';

const InvoiceTemplate2 = ({
  companyData={},
  InvoiceStaticData={},
  bankDetails={}
}) => {
  const { company } = useAuth();
  console.log("companyData:", companyData);
  return (
    <div className="invoice-template" style={{ padding: "50px 60px 50px 50px", backgroundColor: "white" }}>
      {/* Header with company info, logo, and invoice info */}
      <div className="invoice-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
        {/* Company Info - Left Side */}
        <div className="company-info" style={{ flex: 1 }}>
          <div style={{
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "5px"
          }}>{companyData?.companyName}</div>

          <div style={{ fontSize: "14px" }}>
            <div>{companyData?.address}</div>
            <div>{companyData?.emailId}, {companyData?.mobileNo}</div>
          </div>
        </div>

        {/* Company Logo - Center */}
        <div className="logo-placeholder" style={{
          flex: 0.5,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{
            width: "180px",
            height: "150px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#999"
          }}>
            {companyData?.imageFile ? <img src={companyData.imageFile} alt="Company Logo" /> : "No Logo Available"}
          </div>
        </div>

        {/* Invoice Info - Right Side */}
        <div className="invoice-meta" style={{ flex: 1, textAlign: "right" }}>
          <div style={{
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "10px"
          }}>
            Invoice
          </div>

          <div style={{ fontSize: "14px" }}>
            <div><strong>Date:</strong> {InvoiceStaticData.invoice.invoiceDate}</div>
            <div><strong>Invoice #:</strong> {InvoiceStaticData.invoice.invoiceNo}</div>
            <div><strong>Purchase order #:</strong> {InvoiceStaticData.invoice.purchaseOrder}</div>
            <div><strong>Payment due by:</strong>  {InvoiceStaticData.invoice.dueDate}</div>
          </div>
        </div>
      </div>

      {/* Billed To and Ship To sections side by side */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "30px",
      }}>
        {/* Billed To - Left Side */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: "bold",
            marginBottom: "5px",
            fontSize: "15px",
            backgroundColor: "#efeded",
            borderRadius: "4px",
            padding: "5px 10px",
            display: "inline-block",
          }}>Billed to</div>
          <div style={{ fontSize: "14px" }}>
            <div>Client name: {InvoiceStaticData.customer?.customerName}</div>
            <div>Address: {InvoiceStaticData.customer?.address}</div>
            <div>Phone: {InvoiceStaticData.customer?.mobileNumber}</div>
            <div>Email: {InvoiceStaticData.customer?.email}</div>
            <div>GST No: {InvoiceStaticData.customer?.customerGstNo}</div>
          </div>
        </div>

        {/* Ship To - Right Side */}
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{
            fontWeight: "bold",
            marginBottom: "5px",
            fontSize: "15px",
            backgroundColor: "#efeded",
            borderRadius: "4px",
            padding: "5px 10px",
            display: "inline-block",
          }}>Ship To</div>
          <div style={{ fontSize: "14px" }}>
            <div>Recievers name: {InvoiceStaticData.shippedPayload?.[0]?.customerName || InvoiceStaticData.customer?.customerName}</div>
            <div>Address: {InvoiceStaticData.shippedPayload?.[0]?.address || InvoiceStaticData.customer?.address}</div>
            <div>Phone: {InvoiceStaticData.shippedPayload?.[0]?.mobileNumber || InvoiceStaticData.customer?.mobileNumber}</div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{
        width: "100%",
        marginBottom: "20px",
        borderCollapse: "collapse"
      }}>
        {/* Table Header */}
        <div style={{
          display: "flex",
          background: "#f5f5f5",
          fontWeight: "bold",
          borderBottom: "2px solid #bbb",
          padding: "8px 0"
        }}>
          <div style={{ flex: 1, textAlign: "left", paddingLeft: "10px" }}>#</div>
          {InvoiceStaticData.invoice.productColumns.map((col, idx) => (
            <div key={idx} style={{ flex: 1, textAlign: "left" }}>{col.title}</div>
          ))}
        </div>
        {/* Table Rows */}
        {InvoiceStaticData.invoice.productData.map((item, idx) => (
          <div key={idx} style={{
            display: "flex",
            borderBottom: "1px solid #ddd",
            padding: "8px 0"
          }}>
            <div style={{ flex: 1, textAlign: "left", paddingLeft: "10px" }}>{idx + 1}</div>
            {InvoiceStaticData.invoice.productColumns.map((col, cidx) => (
              <div key={cidx} style={{ flex: 1, textAlign: "left" }}>
                {item[col.key]}
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Price Breakdown Section */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "20px",
        paddingRight: "40px",
      }}>
        <div style={{
          width: "300px",
          paddingTop: "10px"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "5px"
          }}>
            <div style={{ fontWeight: "bold" }}>Subtotal:</div>
            <div style={{ paddingRight: "95px" }}>{InvoiceStaticData.invoice.subTotal}</div>
          </div>
       {(InvoiceStaticData.invoice.cgst !== "0.00" && InvoiceStaticData.invoice.sgst !== "0.00" && InvoiceStaticData.invoice.cgst !== "" && InvoiceStaticData.invoice.sgst !== "") ? (
  <>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "5px"
    }}>
      <div style={{ fontWeight: "bold" }}>CGST:</div>
      <div style={{ paddingRight: "95px" }}>{InvoiceStaticData.invoice.cgst}</div>
    </div>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "5px"
    }}>
      <div style={{ fontWeight: "bold" }}>SGST:</div>
      <div style={{ paddingRight: "95px" }}>{InvoiceStaticData.invoice.sgst}</div>
    </div>
  </>
) : (
  (InvoiceStaticData.invoice.igst !== "0.00" && InvoiceStaticData.invoice.igst !== "") ? (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "5px"
    }}>
      <div style={{ fontWeight: "bold" }}>IGST:</div>
      <div style={{ paddingRight: "95px" }}>{InvoiceStaticData.invoice.igst}</div>
    </div>
  ) : null
)}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            fontSize: "16px",
            borderTop: "1px solid #ddd",
            paddingTop: "10px",
            marginTop: "10px"
          }}>
            <div>Total:</div>
            <div style={{ paddingRight: "90px" }}>
              {(InvoiceStaticData.invoice.grandTotal) || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Notes and bank details side by side */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px"
      }}>
        {/* Notes - Left Side */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: "bold",
            marginBottom: "10px",
            backgroundColor: "#efeded",
            padding: "5px 15px",
            borderRadius: "4px",
            fontSize: "15px",
            display: "inline-block",
          }}>
            Special notes and instructions
          </div>
          <div style={{ fontSize: "14px" }}>
            <div>{InvoiceStaticData.notes}</div>
            <div>Kindly issue all cheques in the name of the company</div>
          </div>
        </div>

        {/* Bank Details - Right Side */}
        <div style={{
          flex: 1,
          textAlign: "right"
        }}>
          <div style={{
            fontWeight: "bold",
            marginBottom: "10px",
            backgroundColor: "#efeded",
            padding: "5px 15px",
            borderRadius: "4px",
            fontSize: "15px",
            display: "inline-block",
          }}>
            BANK ACCOUNT DETAILS
          </div>
          <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
            <div>Bank Name: {bankDetails?.bankName}</div>
            <div>Account Holder: {companyData?.companyName}</div>
            <div>Account Number: {bankDetails?.accountNumber}</div>
            <div>Account Type: {bankDetails?.accountType}</div>
            <div>Branch: {bankDetails?.branch}</div>
            <div>IFSC Code: {bankDetails?.ifscCode}</div>
            <div>Address: {bankDetails?.address}</div>
          </div>
        </div>
      </div>

      {/* Company stamp and thank you message */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{
          width: "180px",
          height: "150px",
          border: "1px dashed #ccc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#999",
          marginBottom: "10px"
        }}>
          {company?.stampImage ? <img src={company.stampImage} alt="Company Stamp" /> : "No Stamp Available"}
        </div>
        <div style={{
          fontStyle: "italic",
          marginBottom: "20px",
          fontSize: "14px"
        }}>
          Thank you for your business!
        </div>
      </div>

      {/* Contact information */}
      <div style={{ marginBottom: "30px", fontSize: "14px" }}>
        <div>
          Should you have any enquiries concerning this invoice, please contact us.
        </div>
      </div>

      {/* Footer Contact Info */}
      <div style={{
        fontSize: "13px",
        textAlign: "center",
        borderTop: "1px solid #ddd",
        paddingTop: "10px"
      }}>
        <div style={{ marginBottom: "5px" }}>{companyData?.address}</div>
        <div>{companyData?.mobileNo} | {companyData?.emailId}</div>
      </div>
    </div>
  );
};

export default InvoiceTemplate2;