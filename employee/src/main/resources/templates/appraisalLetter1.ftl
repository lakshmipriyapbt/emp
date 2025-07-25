<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appraisal Letter Template</title>
    <style>
        .logo {
            text-align: right;
        }

        .logo img {
            max-width: 60px;
            height: 100px;
            margin-right: 5px;
            margin-bottom: 20px;
            margin-top: -10px;
        }

        .confidential-text {
            text-align: center;
            /* Center the text */
            font-weight: bold;
            /* Make the text bold */
            text-decoration: underline;
            /* Underline the text */
            font-size: 18px;
            margin-bottom: 20px;
            margin-top: -5px;
            /* Adjust the font size if needed */
        }
        .date-info h5{
           text-align: right;
           margin-right: 10px;
           font-size: 15px;
        }
        .emp-details h6{
          text-align: left;
          margin-right: 30px;
          font-size: 15px;
        }

        .salary-table {
            width: 100%;
            margin: 20px 0;
        }

        .salary-table table {
            width: 100%;
            border-collapse: collapse;
        }

        .salary-table th, .salary-table td {
            padding: 5px 10px;
            text-align: left;
            font-size: 16px;
        }

        .salary-table th {
            font-weight: bold;
            font-size: 16px;
        }

        .salary-table .gross-salary td {
            font-weight: bold;
        }
        .watermark {
            position: fixed;
            top: 40%;
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
    </style>
</head>

<body>
<#-- Render watermark and logo only if draft is defined and false -->
<#if !appraisal.draft>
    <img src="${blurredImage}" alt="Company Logo" class="watermark" />
    <div class="logo">
        <img src="${company.imageFile}" alt="Company Logo" />
    </div>
</#if>


    <h5 class="confidential-text">APPRAISAL LETTER</h5>
    <div class = "date-info">
          <h5>Date: ${appraisal.date}</h5>
    </div>
    <div class="emp-details">
    <h6 style = "margin-top: -40px;">To</h6>
    <h6 style = "margin:2px;"><b>${employee.firstName} ${employee.lastName},</b></h6>
    <h6 style = "margin:2px;">Designation :<b> ${employee.designationName} </b></h6>
    <h6 style = "margin:2px;">Emp Id: <b>${employee.employeeId}</b></h6>
    </div>

    <div class ="increment-details">
    <h6 style="font-size: 14px;">Sub: Increment on Salary</h6>
    <h6 style="font-size: 14px;">Dear ${employee.firstName},</h6>
    <p>
    We are pleased to inform you that your salary increase effective from <b>${appraisal.dateOfSalaryIncrement}. </b>
    The amount of your salary increase is <b>Rs. ${appraisal.grossCompensation} pa.</b>
    This represents a <b>${appraisal.salaryHikePersentage}%</b> increase, demonstrating our appreciation for your dedication.
    We understand this is a sustainable increase in your pay and we appreciate
    your hard work and dedication to the company.
    <br />
    <p>We recognize your continued contributions and dedication to the company, and we are happy to reward your hard work. Please note that all other terms and conditions of your employment remain unchanged as per your original offer letter.
    </p>
    <br />
    All other T&C are the same as per the original offer letter. We extend our good wishes and trust that you will maintain your remarkable enthusiasm and dedication moving forward.
    </p>
    </div>
    <div class="salary-table">
    <table>
            <tr>
                <th>Particulars</th>
                <th>Amount (INR)</th>
            </tr>

           <#list salary?keys as key>
              <tr>
                <td>${key}</td>
                <td>${salary[key].annually}</td>
              </tr>
           </#list>
            <tr class="gross-salary">
                <td>Gross Salary</td>
                <td>${appraisal.grossCompensation}</td>
            </tr>

    </table>
    </div>
    <div>
    <p>
    We appreciate your initiative and expect you to take many more such responsibilities in future
     assignments to ensure company’s growth.
    </p>

  <p>With Best Wishes</p>
    <div>
       <#-- Stamp is only included when draft is false -->
                     <#if !appraisal.draft>
                        <img src="${company.stampImage}" style="width: 100px; height: 100px;" />
                     <#else>
                         <div style="width: 100px; height: 100px;"></div>
                     </#if>
                     <br/>
               <b>Authorized Signature</b>
               <br/>

              <b>${company.companyName}</b>
              <p>${company.mobileNo}|${company.emailId}</p>
              <p>${company.address}</p>
     </div>
    </div>

</body>

</html>