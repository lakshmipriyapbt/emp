import React from "react";
import { useAuth } from "../../../Context/AuthContext";


const InvoiceTemplate1 = ({
  InvoiceStaticData = {},
  companyData = {},
  bankDetails = {}
}) => {
  const { company } = useAuth();

  return (
    <div className="invoice-template" style={{ padding: "50px 60px 50px 50px", backgroundColor: "white" }}>
      <div className="invoice-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div className="tax-info">
          <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
            {companyData.panNo ? `PAN: ${companyData.panNo}` : "PAN: Not Available"}
          </p>
          <p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>
            {companyData.gstNo ? `GST: ${companyData.gstNo}` : "GST: Not Available"}
          </p>
        </div>
        <div className="logo-placeholder">
          <div style={{
            height: "60px",
            width: "155px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#999",
            fontSize: "14px"
          }}>
            {company.imageFile ? (<img src={company.imageFile} alt="Company Logo" />) : "No Logo Available"}
          </div>
        </div>
      </div>

      <h1 className="invoice-title" style={{ textAlign: "center", margin: "0 0 30px 0", fontSize: "28px", fontWeight: "700" }}>Invoice</h1>
      
      <div className="invoice-content">
        <div className="row" style={{ marginBottom: "30px" }}>
          <div className="col-md-6">
            <div className="billing-info">
              <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600" }}>Billed To,</p>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
                {InvoiceStaticData.customer.customerName || "Customer Name"},
              </p>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
                {InvoiceStaticData.customer.email || "Email ID"},
              </p>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
                {InvoiceStaticData.customer.mobileNumber || "Mobile Number"},
              </p>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
                {InvoiceStaticData.customer.address || "Address"},
              </p>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
                {InvoiceStaticData.customer.customerGstNo || "GST: Not Provided"}
              </p>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="invoice-meta" style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600" }}>
                <span style={{ display: "inline-block", width: "120px", textAlign: "left" }}>Invoice ID:</span>
                <span>{InvoiceStaticData.invoice.invoiceNo || "N/A"}</span>
              </p>
              <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600" }}>
                <span style={{ display: "inline-block", width: "120px", textAlign: "left" }}>Invoice Date:</span>
                <span>{InvoiceStaticData.invoice.invoiceDate || "N/A"}</span>
              </p>
              <p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>
                <span style={{ display: "inline-block", width: "120px", textAlign: "left" }}>Due Date:</span>
                <span>{InvoiceStaticData.invoice.dueDate || "N/A"}</span>
              </p>
            </div>
          </div>
        </div>

        {InvoiceStaticData.salesPerson && (
          <div className="sales-info-table" style={{ marginBottom: "30px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{ padding: "10px", border: "1px solid #000", textAlign: "left", fontSize: "14px", fontWeight: "600" }}>Sales Person</th>
                  <th style={{ padding: "10px", border: "1px solid #000", textAlign: "left", fontSize: "14px", fontWeight: "600" }}>Shipping Method</th>
                  <th style={{ padding: "10px", border: "1px solid #000", textAlign: "left", fontSize: "14px", fontWeight: "600" }}>Shipping Terms</th>
                  <th style={{ padding: "10px", border: "1px solid #000", textAlign: "left", fontSize: "14px", fontWeight: "600" }}>Payment Terms</th>
                  <th style={{ padding: "10px", border: "1px solid #000", textAlign: "left", fontSize: "14px", fontWeight: "600" }}>Due Date</th>
                  <th style={{ padding: "10px", border: "1px solid #000", textAlign: "left", fontSize: "14px", fontWeight: "600" }}>Delivery Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "10px", border: "1px solid #000", fontSize: "14px" }}>{InvoiceStaticData.salesPerson}</td>
                  <td style={{ padding: "10px", border: "1px solid #000", fontSize: "14px" }}>{InvoiceStaticData.shippingMethod}</td>
                  <td style={{ padding: "10px", border: "1px solid #000", fontSize: "14px" }}>{InvoiceStaticData.shippingTerms}</td>
                  <td style={{ padding: "10px", border: "1px solid #000", fontSize: "14px" }}>{InvoiceStaticData.paymentTerms}</td>
                  <td style={{ padding: "10px", border: "1px solid #000", fontSize: "14px" }}>{InvoiceStaticData.dueDate}</td>
                  <td style={{ padding: "10px", border: "1px solid #000", fontSize: "14px" }}>{InvoiceStaticData.deliveryDate}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="invoice-table" style={{ marginBottom: "30px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0" }}>
            <thead>
              <tr style={{ backgroundColor: "#efeded" }}>
                <th style={{ padding: "10px", textAlign: "center", fontSize: "14px", fontWeight: "600" }}>S.No</th>
                {InvoiceStaticData.invoice.productColumns.map((col, index) => (
                  <th key={index} style={{ padding: "10px", textAlign: "left", fontSize: "14px", fontWeight: "600" }}>
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {InvoiceStaticData.invoice.productData.map((product, index) => (
                <tr key={index}>
                  <td style={{ padding: "10px", textAlign: "center", fontSize: "14px", borderBottom: "1px solid #eee" }}>
                    {index + 1}
                  </td>
                  {InvoiceStaticData.invoice.productColumns.map((col, colIndex) => (
                    <td key={colIndex} style={{ padding: "10px", textAlign: "left", fontSize: "14px", borderBottom: "1px solid #eee" }}>
                      {product[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={InvoiceStaticData.invoice.productColumns.length} style={{ padding: "10px", textAlign: "right", fontSize: "14px", fontWeight: "600", borderTop: "1px solid #eee" }}>
                  Total Amount(Rs)
                </td>
                <td style={{ padding: "10px", textAlign: "left", fontSize: "14px", borderTop: "1px solid #eee" }}>
                  {InvoiceStaticData.invoice.subTotal}
                </td>
              </tr>
           
                 {/* Tax Rows */}
{(InvoiceStaticData.invoice.sgst !== "0.00" && InvoiceStaticData.invoice.sgst !== "" &&
  InvoiceStaticData.invoice.cgst !== "0.00" && InvoiceStaticData.invoice.cgst !== "") ? (
  <>
    <tr>
      <td colSpan={InvoiceStaticData.invoice.productColumns.length} style={{ padding: "10px", textAlign: "right", fontSize: "14px", fontWeight: "600" }}>
        SGST
      </td>
      <td style={{ padding: "10px", textAlign: "left", fontSize: "14px" }}>
        {InvoiceStaticData.invoice.sgst}
      </td>
    </tr>
    <tr>
      <td colSpan={InvoiceStaticData.invoice.productColumns.length} style={{ padding: "10px", textAlign: "right", fontSize: "14px", fontWeight: "600" }}>
        CGST
      </td>
      <td style={{ padding: "10px", textAlign: "left", fontSize: "14px" }}>
        {InvoiceStaticData.invoice.cgst}
      </td>
    </tr>
  </>
) : (
  (InvoiceStaticData.invoice.igst !== "0.00" && InvoiceStaticData.invoice.igst !== "") ? (
    <tr>
      <td colSpan={InvoiceStaticData.invoice.productColumns.length} style={{ padding: "10px", textAlign: "right", fontSize: "14px", fontWeight: "600" }}>
        IGST
      </td>
      <td style={{ padding: "10px", textAlign: "left", fontSize: "14px" }}>
        {InvoiceStaticData.invoice.igst}
      </td>
    </tr>
  ) : null
)}
                 
              {/* {hasCustomerGST && (
                igst !== '0.00' ? (
                 <></>
                ) : (
               
                )
              )} */}
              
              <tr>
                <td colSpan={InvoiceStaticData.invoice.productColumns.length} style={{ padding: "10px", textAlign: "right", fontSize: "14px", fontWeight: "600" }}>
                  Grand Total (Rs)
                </td>
                <td style={{ padding: "10px", textAlign: "left", fontSize: "14px", fontWeight: "600" }}>
                  {InvoiceStaticData.invoice.grandTotal}
                </td>
              </tr>
              
              <tr>
                <td colSpan={InvoiceStaticData.invoice.productColumns.length + 1} style={{ padding: "10px", textAlign: "center", fontSize: "14px", fontWeight: "600", borderTop: "1px solid #eee" }}>
                  In Words: {InvoiceStaticData.invoice.grandTotalInWords || "Not Available"}
                </td>
              </tr>
              <tr>
                <td colSpan={InvoiceStaticData.invoice.productColumns.length + 1} style={{ padding: "10px", textAlign: "center", fontSize: "14px", borderTop: "1px solid #eee" }}>
                  The payment should be made favouring <strong>{companyData.companyName}</strong> or direct deposit as per the information below.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="bank-details-section">
          <div className="row">
            <div className="col-md-6">
              <div className="bank-details">
                <h5 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "15px" }}>Bank Details</h5>

                <div style={{ display: "flex", marginBottom: "5px" }}>
                  <div style={{ width: "150px", fontSize: "14px", fontWeight: "600" }}>Bank Name :</div>
                  <div style={{ fontSize: "14px" }}>{bankDetails?.bankName}</div>
                </div>

                <div style={{ display: "flex", marginBottom: "5px" }}>
                  <div style={{ width: "150px", fontSize: "14px", fontWeight: "600" }}>Account Number :</div>
                  <div style={{ fontSize: "14px" }}>{bankDetails?.accountNumber}</div>
                </div>

                <div style={{ display: "flex", marginBottom: "5px" }}>
                  <div style={{ width: "150px", fontSize: "14px", fontWeight: "600" }}>Account Type :</div>
                  <div style={{ fontSize: "14px" }}>{bankDetails?.accountType}</div>
                </div>

                <div style={{ display: "flex", marginBottom: "5px" }}>
                  <div style={{ width: "150px", fontSize: "14px", fontWeight: "600" }}>IFSC Code :</div>
                  <div style={{ fontSize: "14px" }}>{bankDetails?.ifscCode}</div>
                </div>

                <div style={{ display: "flex", marginBottom: "5px" }}>
                  <div style={{ width: "150px", fontSize: "14px", fontWeight: "600" }}>Branch :</div>
                  <div style={{ fontSize: "14px" }}>{bankDetails?.branch}</div>
                </div>

                <div style={{ display: "flex", marginBottom: "5px" }}>
                  <div style={{ width: "170px", fontSize: "14px", fontWeight: "600" }}>Bank Address :</div>
                  <div style={{ fontSize: "14px" }}>{bankDetails?.address}</div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{
                  height: "60px",
                  width: "155px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#999",
                  fontSize: "14px",
                  marginBottom: "15px"
                }}>
                {company?.stampImage ? <img src={company.stampImage} alt="Company Stamp" /> : "No Stamp Available"}
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>{companyData?.companyName}</p>
                  <h5 style={{ margin: "0", fontSize: "16px", fontWeight: "600" }}>Authorized Signature</h5>
                </div>
              </div>
            </div>
          </div>
          
          <hr style={{ margin: "30px 0" }} />
          
          <div className="footer" style={{ margin: "40px 0 0 0" }}>
            <p style={{ textAlign: "center", margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
              {companyData?.companyName},
            </p>
            <p style={{ textAlign: "center", margin: "0 0 5px 0", fontSize: "14px" }}>
              {companyData?.address}
            </p>
            <p style={{ textAlign: "center", margin: "0", fontSize: "14px" }}>
              {companyData?.emailId}, {companyData?.mobileNo}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate1;