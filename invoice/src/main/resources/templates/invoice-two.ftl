<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
    <title>Invoice</title>
    <style>

@media print {
            body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0; /* Remove body padding as @page margin will handle it */
    font-size: 10pt;
    }
}
 .logo{
   position: absolute;
   top: 10px;
   left: 40%;
   width: 150px; /* Set a specific width for the logo */
   height: 80px; /* Set a specific height for the logo */
   display: flex;
   }
 .container  {
   max-width: 794px;/* Adjust max-width if needed for better fit on A4 */
   height: 1000px;
   margin: 0 auto;
   }
  .header {
    display: flex;
    border: none;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 25px;
  }
  .company-info {
    width: 250px;
    text-align: left;
  }
  .invoice-info {
    text-align: right;
  }
  .header h1 {
    margin: 0;
    font-size: 22pt; /* Slightly reduced font size for header */
    color: #333;
  }
  .header p {
    margin: 2px 0;
  }
  .bill-ship-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px; /* Slightly reduced margin */
  }
  .billed-to {
    width: 250px;
  }
  .ship-to {
    text-align: right;
    right: 10px;
  }
  .bill-ship-section p {
    margin: 2px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 25px; /* Slightly reduced margin */
  }

 .section-title {
   background-color: #8c8c8c;
   color: #ffffff;
   padding: 2px 6px;
   font-weight: bold;
   border-radius: 4px;
   display: inline-block;
 }
  table th, table td {
    border: 1px solid #eee;
    padding: 7px; /* Slightly reduced padding */
    text-align: left;
    word-wrap: break-word; /* Ensure long content breaks within cells */
  }
  table th {
    background-color: #f2f2f2;
  }
  .total-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px; /* Slightly reduced margin */
  }
 .amounts {
    text-align: right;
    display: inline-block;
    margin-top: 20px; /* Slightly reduced margin */
    margin-left: 80%; /* Slightly reduced margin */
    min-width: 180px; /* optional: set a min width for alignment */
 }
 .amounts p {
    margin: 2px 0;
    text-align: left;
    display: block;
 }
 .amounts .total {
    font-weight: bold;
    font-size: 12pt;
    border-top: 1px solid #eee;
    padding-top: 5px;
    margin-top: 10px;
 }
.notes {
  flex: 1;
  padding: 3px;
  background: none;
  background-color: #f2f2f2; /* Light grey */
  border: none;
  border-radius: 2px;
  position: static;
  height: auto;
}

 .notes_instructions {
   left: 20px;
   font-size: 8pt;
 }
 .bank-details {
   text-align: right;
   background: none;
   border: none;
   border-radius: 0;
   position: static;
 }
 .bank-details p {
  margin: 2px 0;
 }
.stamp {
  width: 100px;
  height: 100px;
  margin-right: 20px;
}

.thank-you {
  font-size: 8pt;
  padding: 5px;
  margin-top: 25px;
}
.end-section {
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  z-index: 1;
  page-break-inside: avoid;
  margin-top: 40px;
}
 .footer {
   position: fixed;
   bottom: 0;
   left: 0;
   width: 100%;
   text-align: center;
   font-size: 8pt;
   color: #666;
   background: #fff;
 }
/* Specific alignment for table content based on keys */
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }

/* Ensure content doesn't break across pages awkwardly */
.header, .bill-ship-section, table, .total-section, .bank-details, .thank-you, .footer {
page-break-inside: avoid;
}
</style>
</head>
<body>

<div class="container">
<div class="logo">
            <#if company.imageFile?? && company.imageFile?has_content>
                 <img src="${company.imageFile}" alt="Company Logo" width="150" height="80" />
            <#else>
                   <img src="Image" alt="Company Logo" />
            </#if>
        </div>
   <table class="header" style="width:100%; border:none; border-collapse:separate;">
     <tr>
       <td style="border:none;">
         <div class="company-info">
           <h3>${company.companyName}</h3>
           <p>${company.emailId}</p>
           <p>${company.mobileNo}</p>
         </div>
       </td>
       <td style="border:none;">
         <div class="invoice-info">
           <h3 class="invoice-heading">Invoice</h3>
           <p>Date: ${invoice.invoiceDate}</p>
           <p>Invoice No: ${invoice.invoiceNo!''}</p>
           <p>Purchase order No: ${invoice.purchaseOrder}</p>
           <p>Payment due by: ${invoice.dueDate}</p>
         </div>
       </td>
     </tr>
   </table>

       <table class="bill-ship-section" style="width:100%; border:none; border-collapse:separate;">
     <tr>
       <td style="border:none; width:50%;">
         <div class="billed-to">
           <div class="section-title">Billed to</div>
           <p>Client name: ${customer.customerName}</p>
           <p>${customer.address}</p>
           <p>Phone: ${customer.mobileNumber}</p>
         </div>
       </td>
       <td style="border:none; width:50%;">
         <div class="ship-to">
           <#if invoice.shippedPayload?has_content>
             <#assign shipped = invoice.shippedPayload />
             <div class="section-title">Ship to</div>
             <p>Receivers name: ${shipped.customerName!'-'}</p>
             <p>${shipped.address!'-'}</p>
             <p>Phone: ${shipped.mobileNumber!'-'}</p>
           <#else>
             <div class="section-title">Ship to (if different)</div>
             <p>Client name: ${customer.customerName!'-'}</p>
             <p>${customer.address!'-'}</p>
             <p>Phone: ${customer.mobileNumber!'-'}</p>
           </#if>
         </div>
       </td>
     </tr>
   </table>

    <table>
        <thead>
         <#assign columnCount = (invoice.productColumns?size + 1)!1>
         <tr>
             <th class="text-center">S.NO</th>
             <#if invoice.productColumns?? && invoice.productColumns?size gt 0>
                 <#list invoice.productColumns as column>
                     <th class="text-center" style="font-size: 10px;">${column.title}</th>  </#list>
             </#if>
         </tr>
        </thead>
        <tbody>
           <#if invoice.productData?? && invoice.productData?size gt 0>
               <#list invoice.productData as product>
                   <tr>
                       <td class="text-center">${product_index + 1}</td>  <#if invoice.productColumns??>
                        <#list invoice.productColumns as column>
                            <#if product[column.key]??>
                                <#if column.key == "totalCost">
                                    <td class="text-right">${product[column.key]!'-'}</td>  <#elseif column.key == "service">
                                    <td class="text-left">${product[column.key]!'-'}</td>  <#else>
                                    <td class="text-center">${product[column.key]!'-'}</td>  </#if>
                            </#if>
                        </#list>
                    </#if>
                   </tr>
               </#list>
           <#else>
               <tr>
                   <td colspan="${columnCount}" style="font-size: 13px;">No orders available.</td>
               </tr>
           </#if>
    </tbody>
</table>
      <div class="amounts">
            <p><span style= "font-weight: bold;">Subtotal</span><span>:${invoice.subTotal}</span></p>

               <#assign iGstValue = (iGst??)?then(iGst?number, 0.00) />
               <#assign cGstValue = (cGst??)?then(cGst?number, 0.00) />
               <#assign sGstValue = (sGst??)?then(sGst?number, 0.00) />

               <#if iGstValue gt 0>
                       <p>IGST:${iGstValue?string("0.00")}</p>
               <#elseif cGstValue gt 0 && sGstValue gt 0>

                       <p>CGST:${cGstValue?string("0.00")}</p>
                       <p>SGST:${sGstValue?string("0.00")}</p>
               <#else>
                      <p>CGST:${cGstValue?string("0.00")}</p>
                       <p>SGST:${sGstValue?string("0.00")}</p>
               </#if>
            <p class="total"><span>Total</span><span>:${invoice.grandTotal}</span></p>
     </div>
    <table style="width:100%; border:none; border-collapse:separate; margin-bottom:25px;">
      <tr>
        <td style="vertical-align:top; border:none; width:50%;">
          <div class="notes">
            <div class="section-title">Special notes and instructions</div>
            <p>${invoice.notes!''}</p>
          </div>
          <div class="notes_instructions">
            <p>Kindly issue all cheques in the name of the company</p>
          </div>
        </td>
        <td style="vertical-align:top; border:none; width:50%;">
          <div class="bank-details">
            <div class="section-title">BANK ACCOUNT DETAILS</div>
            <p>Bank Name: ${bank.bankName!''}</p>
            <p>Account number: ${bank.accountNumber!''}</p>
            <p>Account Type: ${bank.accountType!''}</p>
            <p>Branch: ${bank.branch!''}</p>
            <p>IFSC Code: ${bank.ifscCode!''}</p>
            <p>Address: ${bank.address!''}</p>
          </div>
        </td>
      </tr>
    </table>
  <div class="end-section">
    <div class="stamp">
      <#if company.stampImage?? && company.stampImage?has_content>
        <img style="width: 100px; height: 100px; margin: 3px 0;" src="${company.stampImage}" alt="Seal" />
      </#if>
    </div>
    <div class="thank-you">
      <h3>Thank you for your business!</h3>
      <p>Should you have any enquiries concerning this invoice, please contact us.</p>
    </div>
  </div>

    <div class="footer">
      <hr/>
      <p>${company.companyAddress},${company.mobileNo},${company.emailId}</p>
    </div>
 </div>

</body>
</html>