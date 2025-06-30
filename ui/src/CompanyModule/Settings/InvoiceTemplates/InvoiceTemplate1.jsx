import React from 'react';
import { useAuth } from '../../../Context/AuthContext';

const InvoiceTemplate1 = ({
  companyLogo,
  companyData,
  InvoiceStaticData,
  bankDetails
}) => {
  console.log("Received Bank Details in Template:", bankDetails);
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
            <div><strong>Date:</strong> {InvoiceStaticData.invoiceDate}</div>
            <div><strong>Invoice #:</strong> {InvoiceStaticData.invoiceNo}</div>
            <div><strong>Purchase order #:</strong> {InvoiceStaticData.purchaseOrder}</div>
            <div><strong>Payment due by:</strong>  {InvoiceStaticData.dueDate}</div>
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
            <div>Client name: {InvoiceStaticData.billedTo?.customerName}</div>
            <div>Address: {InvoiceStaticData.billedTo?.address}</div>
            <div>Phone: {InvoiceStaticData.billedTo?.mobileNumber}</div>
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
            <div>Client name: {InvoiceStaticData.shippedTo?.customerName}</div>
            <div>Address: {InvoiceStaticData.shippedTo?.address}</div>
            <div>Phone: {InvoiceStaticData.shippedTo?.mobileNumber}</div>
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
          {InvoiceStaticData.productColumns.map((col, idx) => (
            <div key={idx} style={{ flex: 1, textAlign: "left" }}>{col.title}</div>
          ))}
          {/* <div style={{ flex: 1, textAlign: "left" }}>Total</div> */}
        </div>
        {/* Table Rows */}
        {InvoiceStaticData.productData.map((item, idx) => (
          <div key={idx} style={{
            display: "flex",
            borderBottom: "1px solid #ddd",
            padding: "8px 0"
          }}>
            <div style={{ flex: 1, textAlign: "left", paddingLeft: "10px" }}>{idx + 1}</div>
            {InvoiceStaticData.productColumns.map((col, cidx) => (
              <div key={cidx} style={{ flex: 1, textAlign: "left" }}>
                {item[col.key]}
              </div>
            ))}
            {/* <div style={{ flex: 1, textAlign: "left" }}>
              {Number(item.quantity) * Number(item.price)}
            </div> */}
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
            <div style={{ paddingRight: "95px" }}>{InvoiceStaticData.subTotal}</div>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "5px"
          }}>
            <div style={{ fontWeight: "bold" }}>CGST:</div>
            <div style={{ paddingRight: "95px" }}>{(InvoiceStaticData.subTotal * 0.09).toFixed(2)}</div>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "5px"
          }}>
            <div style={{ fontWeight: "bold" }}>SGST:</div>
            <div style={{ paddingRight: "95px" }}>{(InvoiceStaticData.subTotal * 0.09).toFixed(2)}</div>
          </div>
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
              {(parseFloat(InvoiceStaticData.subTotal) * 1.18).toFixed(2)}
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
          {companyData?.stampImage ? <img src={companyData.stampImage} alt="Company Stamp" /> : "No Stamp Available"}
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

export default InvoiceTemplate1;