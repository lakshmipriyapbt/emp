<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Relieving Letter</title>
    <style>
         body {
            position: relative;
            font-family: Arial, sans-serif;
            font-size: 18px;
            margin: 30px;
            line-height: 1.9;
        }
        .watermarked {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
         .watermark {
            position: fixed;
            left: 20%;
            transform: translate(-50%, -50%) rotate(30deg);
            z-index: -1;
            width: 400px;
            height: auto;
            text-align: center;
         }

         .watermark img {
            width: 100%;
            height: auto;
            opacity: 0.05;
         }
        .content {
            position: relative;
            z-index: 2;
            padding: 20px;
            background-color: rgba(255, 255, 255, 0.8);
        }
        .header {
            text-align: center;

        }
       .para p {
                      font-size: 15px; /* Adjust the font size as needed */
              }
    </style>
</head>
<body>
    <div class="watermarked">
        <!-- Company Logo -->
         <#if !draft>
        <div class="logo">
                 <#if company[0].imageFile?has_content>
                 <img style="height: 70px; width: 160px;" src="${company[0].imageFile}" alt="Company Logo" />
                 </#if>
             </div>
        </#if>


        <h4 class="header">RELIEVING LETTER</h4>
        <!-- Content -->
        <div class="content">
            <div class="row d-flex align-items-center">
                <div>
                    <p>${relieving.date}</p>
                    <p>Dear,</p>
                    <p><h4>${employee.firstName} ${employee.lastName},</h4></p>
                    <h5>${employee.employeeId}.</h5>
                </div>
            </div>
             <#if !draft>
             <div class="watermark">
                   <img src="${blurredImage}" alt="Blurred Company Logo" />
             </div>
             </#if>
            <p>

                This is in reference to your resignation dated <strong>${relieving.resignationDate}</strong>, where you requested to be relieved from your services on <strong>${employee.dateOfHiring}</strong>. We wish to inform you that your resignation has been accepted, and you shall be relieved from your duties as <strong>${employee.designationName}</strong>, post serving notice period, with effect from <strong>${relieving.relievingDate}</strong>.
            </p>
            <p>We kindly request you to return your company ID and any other company-owned items that you have been using during your tenure with our firm.</p>
            <div class="para">
                <p>Sincerely,</p>

                <h4>${company[0].companyName}</h4>
            <div>
             <#if !draft>
                              <img src="${company[0].stampImage}" style="width: 100px; height: 100px;"/>
                               </#if>
                               <br/>
                   <b>Authorized Signature</b>
            </div>
                <p>${company[0].companyAddress}</p>

            </div>
        </div>
    </div>
</body>
</html>
