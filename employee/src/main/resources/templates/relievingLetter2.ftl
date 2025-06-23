<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Relieving Letter</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            position: relative;
            line-height: 1.6;
            color: #333;
        }

        .container {
            position: relative;
            padding: 20px;
            background-color: rgba(255, 255, 255, 0.8);
            z-index: 2;
        }

        .title {
            text-align: center;
            margin-top: 2rem;
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
         .date {
            text-align: right;
            padding: 20px;
         }

        .footer {
            margin-top: 3rem;
        }

        .footer h5 {
            margin: 0;
        }
    </style>
</head>

<body>

    <!-- Company Logo -->
                      <#if !draft>

        <div class="logo">
                 <#if company[0].imageFile?has_content>
                 <img style="height: 70px; width: 160px;" src="${company[0].imageFile}" alt="Company Logo" />
                 </#if>
             </div>
             </#if>
    <!-- Letter Content -->
    <div class="container">
        <p class="date" ><strong>Date: ${relieving.date}</strong></p>
        <h4 class="title">Relieving Letter</h4>

        <p>To,</p>
        <p><strong>Employee Name: ${employee.firstName} ${employee.lastName}</strong></p>
        <p><strong>Employee ID: ${employee.employeeId}</strong></p>

         <!-- Watermark Background Image -->
         <#if !draft>

         <div class="watermark">
                 <img src="${blurredImage}" alt="Blurred Company Logo" />
          </div>
          </#if>

        <p>
            I am writing to acknowledge the resignation letter you submitted, dated <strong>${relieving.resignationDate}</strong>,
            in which you specified that <strong>${relieving.relievingDate}</strong> would be your last working day with
            <strong>${company[0].companyName}</strong>.
            I want to inform you that your resignation has been accepted, and you will be relieved from your position as
            <strong>${employee.designationName}</strong>
            with <strong>${company[0].companyName}</strong> on <strong>${relieving.noticePeriod}</strong>.
        </p>

        <p>We kindly request you to return your company ID and any other company-owned items that you have been using
            during your tenure with our firm.</p>

        <p>Your final settlement will be processed within the next 45 days.</p>

        <p>We deeply appreciate your valuable contributions to the company and wish you all the best in your future
            endeavors.</p>

        <div class="footer">
            <p>Best Regards,</p>
            <div>

                                               <#if !draft>

                     <img src="${company[0].stampImage}" style="width: 100px; height: 100px;"/>
</#if>
<br/>
                      <b>Authorized Signature</b>
                      <br/>
            </div>
            <h5>${company[0].companyName}</h5>
            <p>${company[0].address}</p>
        </div>
    </div>

</body>

</html>