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
height: 1025px;
margin: 0 auto;
overflow: hidden;
border: 1px solid #eee;
padding: 20px; /* Slightly reduced padding for tighter fit */
box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); /* Keep for screen view */
box-sizing: border-box; /* Include padding and border in the element's total width and height */
}
.header {
display: flex;
justify-content: space-between;
align-items: flex-start;
margin-bottom: 25px; /* Slightly reduced margin */
}
.company-info {
flex: 0 0 auto; /* prevent it from growing or shrinking */
width: 250px;   /* set a specific width */
text-align: left; /* align text to the left */
}
.invoice-heading {
text-align: left;
}
.invoice-info {
position: absolute;
top: 10px;
right: 30px;
text-align: left;
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
flex: 1;
padding-right: 15px; /* Slightly reduced padding */
width: 250px;
}
.ship-to {
top: 14%;
position: absolute;
right: 10px;
padding-right: 15px; /* Slightly reduced padding */
width: 250px;
}
table {
width: 100%;
border-collapse: collapse;
margin-bottom: 25px; /* Slightly reduced margin */
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
.notes {
flex: 1;
position: absolute;
top: 60%;
left: 20px;
right: 15px;
background-color: #f2f2f2; /* Light grey */
height: 100px;
border: 1px solid #ccc;
border-radius: 4px;
padding: 10px;
width: 300px; /* Set a specific width */
}

.section-title {
background-color:  #8c8c8c; /* Cement-like color */
color: #ffffff;            /* White font */
padding: 5px;
font-weight: bold;
border-radius: 4px;
margin-bottom: 8px;
}

.notes_instructions {
position: absolute;
top: 70%;
left: 20px;
padding: 15px;
font-size: 8pt;
}
.amounts {
position: absolute;
top: 60%;
right: 10px;
}
.amounts p {
display: flex;
justify-content: space-between;
margin: 2px 0;
}
.amounts .total {
font-weight: bold;
font-size: 12pt; /* Slightly reduced font size for total */
border-top: 1px solid #eee;
padding-top: 5px;
margin-top: 10px;
}
.bank-details {
margin-top: 25px; /* Slightly reduced margin */
position: absolute;
top: 70%;
Right: 20px;
width: 250px;
}
.bank-details p {
margin: 2px 0;
}
.footer {
position: fixed;
bottom: 0px;
text-align: center;
margin-top: 40px; /* Slightly reduced margin */
font-size: 8pt; /* Slightly reduced font size for footer */
color: #666;
}
.stamp {
position: absolute;
top: 75%;
left: 60px;
width: 100px; /* Set a specific width for the stamp */
height: 100px; /* Set a specific height for the stamp */
display: flex;
}
.thank-you {
position: absolute;
top: 83%;
font-size: 8pt;
margin-top: 25px; /* Slightly reduced margin */
left: 20px;
padding: 5px
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
    <div class="header">
        <div class="logo">
            <#if company.imageFile?? && company.imageFile?has_content>
                 <img src="${company.imageFile}" alt="Company Logo" width="150" height="80" />
            <#else>
                   <img src="Image" alt="Company Logo" />
            </#if>
        </div>
        <div class="company-info">
            <h3>${company.companyName}</h3>
            <p>Building name: ${company.companyAddress}</p>
            <p>${company.emailId}</p>
            <p>${company.mobileNo}</p>
        </div>
        <div class="invoice-info">
            <h3 class="invoice-heading">Invoice</h3>
            <p>Date: ${invoice.invoiceDate}</p>
            <p>Invoice No: ${invoice.invoiceNo!''}</p>
            <p>Purchase order No: ${invoice.purchaseOrder}</p>
            <p>Payment due by: ${invoice.dueDate}</p>
        </div>
    </div>

    <div class="bill-ship-section">
        <div class="billed-to">
            <div class="section-title">Billed to</div>
            <p>Client name: ${customer.customerName}</p>
            <p>${customer.address}</p>
            <p>Phone: ${customer.mobileNumber}</p>
        </div>
        <div class="ship-to">
            <#if invoice.shippedPayload?has_content>
                  <#assign shipped = invoice.shippedPayload />
                    <div class="section-title">Ship to</div>
                    <p>Recievers name: ${shipped.customerName!'-'}</p>
                    <p>${shipped.address!'-'}</p>
                    <p>Phone: ${shipped.mobileNumber!'-'}</p>
            <#else>
                <div class="section-title">Ship to (if different)</div>
                <p>Client name: ${customer.customerName!'-'}</p>
                <p>${customer.address!'-'}</p>
                <p>Phone: ${customer.mobileNumber!'-'}</p>
            </#if>
         </div>
    </div>

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
    <div class="total-section">
        <div class="notes">
            <div class="section-title">Special notes and instructions</div>
            <p>${invoice.notes!''}</p>
        </div>

        <div class="amounts">
            <p><span>Subtotal</span><span>:${invoice.subTotal}</span></p>

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
    </div>

    <div class="notes_instructions">
        <p>Kindly issue all cheques in the name of the company</p>
    </div>
    <div class= "stamp">
       <#if company.stampImage?? && company.stampImage?has_content>
        <img style="width: 100px; height: 100px; margin: 3px 0;" src="${company.stampImage}" alt="Seal" />
    </#if>
    </div>
    <div class="thank-you">
        <h3>Thank you for your business!</h3>
        <p>Should you have any enquiries concerning this invoice, please contact us.</p>
    </div>

    <div class="bank-details">
        <div class="section-title">BANK ACCOUNT DETAILS</div>
        <p>Account Holder: ${bank.bankName!''}</p>
        <p>Account number: ${bank.accountNumber!''}</p>
        <p>ABA rtn: ${bank.bankName!''}</p>
        <p>Wire rtn: ${bank.ifscCode!''}</p>
    </div>

    <div class="footer">
        <p>${company.companyAddress},${company.mobileNo},${company.emailId}</p>
    </div>
</div>

</body>
</html>