<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <title>Invoice</title>
    <style>
        body {
font-family: "Courier New", Courier, monospace;
margin: 0;
padding: 0;
font-size: 20px; /* Reduced font size */
}
.container-fluid {
margin-top: 20px;
padding: 10px;
}
.row {
margin-bottom: 10px;
}
.card {
padding: 20px;
}
.text-center {
text-align: center;
}
.text-right {
text-align: right;
}
.text-left {
text-align: left;
}
.font-medium {
font-weight: 500;
}
.m-l-30 {
margin-left: 30px;
}
.font-size-small {
font-size: small;
}
.logo {
width: 200px;
height: 100px;
display: flex;
justify-content: center;
align-items: center;
position: absolute;
right: 0;
top: -50px; /* Adjust this value to move the logo higher */
}

.logo img {
width: 100%;
height: auto;
object-fit: contain;
}

.table, .table th, .table td {
border: 1px solid #ddd;
border-collapse: collapse;
padding: 6px;
font-size: 11px; /* Reduced font size */
}
.table th {
background-color: #f2f2f2;
}
.table td {
text-align: right;
}
.company-details {
text-align: right;
}
.customer-details {
text-align: left;
}
.footer {
margin-top: 20px;
padding-top: 20px;
border-top: 1px solid #ddd;
}
.footer h6 {
margin-top: 20px;
text-align: left;
}
.footer .seal {
width: 100px;
height: auto;
margin-left: 20px;
}
.payment-info {
font-style: italic;
}
.company-bank-table td {
text-align: left;
}
.table-responsive {
margin-top: 20px;
}
.col-md-6 {
width: 20%;
}
.col-md-12 {
width: 100%;
}
.invoice-info {
display: flex;
justify-content: space-between;
}
</style>
</head>
<body>
<div class="container-fluid">
    <!-- Header Section -->
    <div class="row">
        <div class="col-md-12">
            <!-- Company Logo - Top Right -->
            <div class="company-details" style="position:absolute ; top: -20px; right: 10px;">
                <img src="${imageFile}" alt="Company Logo" />
            </div>
        </div>
    </div>
    <!-- Invoice Heading Section -->
<div style="position: relative; top: 10px; left: 0%; text-align: center;">
    <h3 style="margin: 0;">Invoice</h3> <!-- Removed margin for precise top positioning -->
</div>

<div style="position: absolute; top: 0; width: 100%; text-align: left; margin-left: 20px;">
    <h6 style="margin: 0;"><b>Pan Number:</b>${pan}</h6>
    <h6 style="margin: 0;"><b>GST Number:</b>${gstNumber}</h6>
</div>
   <!-- Customer and Invoice Details Section -->
<div style="position: relative; top: 20px; left: 20px; text-align: left; font-size: 20px; width: 38%; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;">
    <!-- Customer Details (Left Side) -->
    <div>
        <h6 style="margin: 5px;"><b>Billed To,</b></h6>
        <h6 style="margin: 0;" class="font-medium">${customerCompany}</h6>
        <h6 style="margin: 0;"><b>Email:</b> ${email}</h6>
        <h6 style="margin: 0;"><b>Contact No:</b> ${mobileNumber}</h6>
        <h6 style="margin: 0;"><b>GST:</b> ${gstNo!0}</h6>
        <h6 style="margin: 0; word-wrap: break-word; word-break: break-word; white-space: normal; overflow-wrap: break-word;">
            <b>Address:</b> ${address}, ${state}
        </h6>
    </div>
</div>
<div style="position: relative; top: -70px; right: 35px; text-align: right; font-size: 20px;">
    <div>
        <h6 style="margin: 0;"><b>Invoice ID:</b> ${invoiceId}</h6>
        <h6 style="margin: 0;"><b>Invoice Date:</b> ${invoiceDate}</h6>
        <h6 style="margin: 0;"><b>Due Date:</b> ${dueDate}</h6>
    </div>
</div>
    <!-- Product Details Table -->
    <div class="table-responsive" style="margin-left: 10px; position: relative; top: -10px;">
        <table class="table" style="width: 100%;" >
            <thead>
                <tr>
                    <th class="text-center">S.NO</th>
                    <th class="text-center" style="width: 20%; font-size: 13px;">HSN-no</th>
                    <th class="text-center" style="width: 30%; font-size: 13px;">Details</th>
                    <th class="text-center" style="width: 30%; font-size: 13px;">Service</th>
                    <th class="text-center" style="width: 20%; font-size: 13px;">Quantity</th>
                    <th class="text-center" style="width: 30%; font-size: 13px;">Unit Cost (₹)</th>
                    <th class="text-center" style="width: 30%; font-size: 13px;">Total Cost (₹)</th>
                </tr>
            </thead>
            <tbody>
                <#if orderRequests?? && (orderRequests?size > 0)>
                    <#list orderRequests as order>
                        <tr style="width: 100%;">
                            <td>${order.productId!''}</td>
                            <td style="text-align: left;font-size: 13px;">${order.hsnNo!''}</td>
                            <td style="text-align: left; font-size: 13px;">${order.productName!''}</td>
                            <td style="text-align: left; font-size: 13px;">${order.service!''}</td>
                            <td style="text-align: left; font-size: 13px;">${order.quantity!0}</td>
                            <td style="font-size: 13px;" >${order.unitCost!0}</td>
                            <td  style="font-size: 13px;">${order.totalCost!0}</td>
                        </tr>
                    </#list>
                <#else>
                    <tr>
                        <td colspan="7"  style="font-size: 13px;">No orders available.</td>
                    </tr>
                </#if>
                <tr style="text-align: right;">
                    <td colspan="6" style="text-align: right; font-size: 13px;"><strong>Total Amount</strong></td>
                    <td style="text-align: right; font-size: 13px;">${totalAmount}</td>
                </tr>
                <#if cGst?number != 0 && sGst?number != 0>
    <tr>
        <td colspan="6" style="text-align: right; font-size: 13px;"><strong>CGST</strong> (9%)</td>
        <td>${cGst}</td>
    </tr>
    <tr>
        <td colspan="6" style="text-align: right; font-size: 13px;"><strong>SGST</strong> (9%)</td>
        <td>${sGst}</td>
    </tr>
<#elseif iGst?number != 0>
    <tr>
        <td colspan="6" style="text-align: right; font-size: 13px;"><strong>IGST</strong> (18%)</td>
        <td>${iGst}</td>
    </tr>
<#else>
    <tr>
        <td colspan="6" style="text-align: right; font-size: 13px;"><strong>CGST</strong> (9%)</td>
        <td>${cGst}</td>
    </tr>
    <tr>
        <td colspan="6" style="text-align: right; font-size: 13px;"><strong>SGST</strong> (9%)</td>
        <td>${sGst}</td>
    </tr>
</#if>
<tr style="background-color:#f5f5f5;">
                    <th class="text-right" colspan="6" style="font-size: 13px;"><b>Grand Total</b></th>
                    <th class="text-right" style="font-size: 13px;"><b>${grandTotal}</b></th>
                </tr>
                <tr style="background-color:#f5f5f5;">
                    <th colspan="7" class="text-center" style="font-size: 13px;"><b>In Words:</b> <em>${grandTotalInWords}</em>&nbsp;</th>
                </tr>
                <tr>
                    <th  colspan="7" class="text-center" style="font-size: 13px;">The Payment should be made favouring <b>${companyName}</b> or Direct deposit information given above.</th>
                </tr>
            </tbody>
        </table>
    </div>
   <div style="position: relative; bottom: -20px; left: 10px; text-align: left; font-size: 15px;">
    <!-- Customer Details (Left Side) -->
    <div>
        <h5 style="margin: 5px; font-size: 15px;"><b>Bank Details,</b></h5>
        <div style="display: table;">
            <div style="display: table-row;">
                <div style="display: table-cell; padding-right: 10px; font-weight: bold;">Bank Name</div>
                <div style="display: table-cell;">:${bankName}</div>
            </div>
            <div style="display: table-row;">
                <div style="display: table-cell; padding-right: 10px; font-weight: bold;">Account Type</div>
                <div style="display: table-cell;">:${accountType}</div>
            </div>
            <div style="display: table-row;">
                <div style="display: table-cell; padding-right: 10px; font-weight: bold;">Account Number</div>
                <div style="display: table-cell;">:${accountNumber}</div>
            </div>
            <div style="display: table-row;">
                <div style="display: table-cell; padding-right: 10px; font-weight: bold;">IFSC Code</div>
                <div style="display: table-cell;">:${ifscCode}</div>
            </div>
            <div style="display: table-row;">
                <div style="display: table-cell; padding-right: 10px; font-weight: bold;">Branch</div>
                <div style="display: table-cell;">:${branch}</div>
            </div>
        </div>
    </div>
</div>
    <!-- Authorized Signature and Seal -->
   <div style="position: relative; bottom: -10px; right: 0; text-align: right;">
    <div class="row">
        <div class="footer-content" style="display: flex; align-items: center; justify-content: flex-end; text-align: right;">
            <h6 style="margin: 0; margin-right: -15px; font-weight: bold;">${companyName}</h6>
            <img style="margin: -5; width: 100px; height:150px; margin-right: 40px; height: auto;" src="${stampImage}" alt="Seal" />
            <h6 style="margin: 0; font-weight: bold;">Authorized Signature:</h6>
        </div>
    </div>
</div>
     <div style="position: absolute; bottom: -130px; width: 100%; border-top: 1px solid #ccc; text-align: center;">
    <div style="border-top: 1px solid #ccc;">
        <h6 style="margin: 0; word-wrap: break-word; word-break: break-word; white-space: normal; text-align: center;">
            <b>${companyName}</b>
        </h6>
        <h6 style="margin: 0; word-wrap: break-word; word-break: break-word; white-space: normal; width: 100%; text-align: left;margin-left:20px">
            <b>${address}</b><b>${phone}.</b> <b>${companyEmail}</b>
        </h6>
    </div>
</div>
</div>
</body>
</html>