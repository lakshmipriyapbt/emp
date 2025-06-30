import React from "react";

const getStateCodeFromGST = (gstNumber) => {
  if (!gstNumber || gstNumber.length < 2) return null;
  return gstNumber.substring(0, 2);
};

const calculateTaxes = (subTotal, companyGST, customerGST) => {
  const companyStateCode = getStateCodeFromGST(companyGST);
  const customerStateCode = getStateCodeFromGST(customerGST);
  const hasCustomerGST = !!customerGST;
  
  let sgst = '0.00';
  let cgst = '0.00';
  let igst = '0.00';
  
  if (hasCustomerGST) {
    if (companyStateCode === customerStateCode) {
      // Same state - apply SGST and CGST
      const gstAmount = (parseFloat(subTotal) * 0.09).toFixed(2);
      sgst = gstAmount;
      cgst = gstAmount;
    } else {
      // Different state - apply IGST
      igst = (parseFloat(subTotal) * 0.18).toFixed(2);
    }
  }

  return { sgst, cgst, igst, hasCustomerGST };
};

const InvoiceTemplate1 = ({
  InvoiceStaticData = {},
  companyData = {},
  bankDetails = {}
}) => {
  const billedTo = InvoiceStaticData.billedTo || {};
  const company = companyData || {};
  const products = InvoiceStaticData.productData || [];
  const productColumns = InvoiceStaticData.productColumns || [
    { key: "productName", title: "Product Name" },
    { key: "quantity", title: "Quantity" },
    { key: "price", title: "Price" }
  ];

  const subTotal = parseFloat(InvoiceStaticData.subTotal) || 0;
  const { sgst, cgst, igst, hasCustomerGST } = calculateTaxes(
    subTotal,
    company.gstNo,
    billedTo.customerGstNo
  );
  
  const grandTotal = (subTotal + parseFloat(sgst) + parseFloat(cgst) + parseFloat(igst)).toFixed(2);

  const numberToWords = (num) => {
    const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    const convertLessThanOneThousand = (n) => {
      if (n === 0) return '';
      if (n < 10) return single[n];
      if (n < 20) return double[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
      
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      return single[hundred] + ' Hundred' + (remainder !== 0 ? ' and ' + convertLessThanOneThousand(remainder) : '');
    };
    
    const convert = (n) => {
      if (n === 0) return 'Zero';
      
      let result = '';
      const crore = Math.floor(n / 10000000);
      n %= 10000000;
      
      const lakh = Math.floor(n / 100000);
      n %= 100000;
      
      const thousand = Math.floor(n / 1000);
      n %= 1000;
      
      if (crore > 0) {
        result += convertLessThanOneThousand(crore) + ' Crore ';
      }
      if (lakh > 0) {
        result += convertLessThanOneThousand(lakh) + ' Lakh ';
      }
      if (thousand > 0) {
        result += convertLessThanOneThousand(thousand) + ' Thousand ';
      }
      if (n > 0) {
        result += convertLessThanOneThousand(n);
      }
      
      return result.trim();
    };
    
    return convert(num) + ' Rupees Only';
  };

  return (
    <div className="invoice-template" style={{ padding: "50px 60px 50px 50px", backgroundColor: "white" }}>
      <div className="invoice-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div className="tax-info">
          <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
            {company.panNo ? `PAN: ${company.panNo}` : "PAN: Not Available"}
          </p>
          <p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>
            {company.gstNo ? `GST: ${company.gstNo}` : "GST: Not Available"}
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
                {billedTo.customerName || "Customer Name"},
              </p>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
                {billedTo.email || "Email ID"},
              </p>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
                {billedTo.mobileNumber || "Mobile Number"},
              </p>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
                {billedTo.address || "Address"},
              </p>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
                {billedTo.customerGstNo || "GST: Not Provided"}
              </p>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="invoice-meta" style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600" }}>
                <span style={{ display: "inline-block", width: "120px", textAlign: "left" }}>Invoice ID:</span>
                <span>{InvoiceStaticData.invoiceNo || "N/A"}</span>
              </p>
              <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600" }}>
                <span style={{ display: "inline-block", width: "120px", textAlign: "left" }}>Invoice Date:</span>
                <span>{InvoiceStaticData.invoiceDate || "N/A"}</span>
              </p>
              <p style={{ margin: "0", fontSize: "14px", fontWeight: "600" }}>
                <span style={{ display: "inline-block", width: "120px", textAlign: "left" }}>Due Date:</span>
                <span>{InvoiceStaticData.dueDate || "N/A"}</span>
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
                {productColumns.map((col, index) => (
                  <th key={index} style={{ padding: "10px", textAlign: "left", fontSize: "14px", fontWeight: "600" }}>
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td style={{ padding: "10px", textAlign: "center", fontSize: "14px", borderBottom: "1px solid #eee" }}>
                    {index + 1}
                  </td>
                  {productColumns.map((col, colIndex) => (
                    <td key={colIndex} style={{ padding: "10px", textAlign: "left", fontSize: "14px", borderBottom: "1px solid #eee" }}>
                      {product[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={productColumns.length} style={{ padding: "10px", textAlign: "right", fontSize: "14px", fontWeight: "600", borderTop: "1px solid #eee" }}>
                  Total Amount(Rs)
                </td>
                <td style={{ padding: "10px", textAlign: "left", fontSize: "14px", borderTop: "1px solid #eee" }}>
                  {subTotal.toFixed(2)}
                </td>
              </tr>
              
              {hasCustomerGST && (
                igst !== '0.00' ? (
                  <tr>
                    <td colSpan={productColumns.length} style={{ padding: "10px", textAlign: "right", fontSize: "14px", fontWeight: "600" }}>
                      IGST (18%)
                    </td>
                    <td style={{ padding: "10px", textAlign: "left", fontSize: "14px" }}>
                      {igst}
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr>
                      <td colSpan={productColumns.length} style={{ padding: "10px", textAlign: "right", fontSize: "14px", fontWeight: "600" }}>
                        SGST (9%)
                      </td>
                      <td style={{ padding: "10px", textAlign: "left", fontSize: "14px" }}>
                        {sgst}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={productColumns.length} style={{ padding: "10px", textAlign: "right", fontSize: "14px", fontWeight: "600" }}>
                        CGST (9%)
                      </td>
                      <td style={{ padding: "10px", textAlign: "left", fontSize: "14px" }}>
                        {cgst}
                      </td>
                    </tr>
                  </>
                )
              )}
              
              <tr>
                <td colSpan={productColumns.length} style={{ padding: "10px", textAlign: "right", fontSize: "14px", fontWeight: "600" }}>
                  Grand Total (Rs)
                </td>
                <td style={{ padding: "10px", textAlign: "left", fontSize: "14px", fontWeight: "600" }}>
                  {grandTotal}
                </td>
              </tr>
              
              <tr>
                <td colSpan={productColumns.length + 1} style={{ padding: "10px", textAlign: "center", fontSize: "14px", fontWeight: "600", borderTop: "1px solid #eee" }}>
                  In Words: {numberToWords(Math.floor(grandTotal))}
                </td>
              </tr>
              <tr>
                <td colSpan={productColumns.length + 1} style={{ padding: "10px", textAlign: "center", fontSize: "14px", borderTop: "1px solid #eee" }}>
                  The payment should be made favouring <strong>{company.companyName}</strong> or direct deposit as per the information below.
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
                  <div style={{ width: "150px", fontSize: "14px", fontWeight: "600" }}>Bank Address :</div>
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
                  <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>{company?.companyName}</p>
                  <h5 style={{ margin: "0", fontSize: "16px", fontWeight: "600" }}>Authorized Signature</h5>
                </div>
              </div>
            </div>
          </div>
          
          <hr style={{ margin: "30px 0" }} />
          
          <div className="footer" style={{ margin: "40px 0 0 0" }}>
            <p style={{ textAlign: "center", margin: "0 0 5px 0", fontSize: "14px", fontWeight: "600" }}>
              {company?.companyName},
            </p>
            <p style={{ textAlign: "center", margin: "0 0 5px 0", fontSize: "14px" }}>
              {company?.address}
            </p>
            <p style={{ textAlign: "center", margin: "0", fontSize: "14px" }}>
              {company?.emailId}, {company?.mobileNo}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate1;