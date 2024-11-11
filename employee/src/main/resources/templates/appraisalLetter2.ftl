<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appraisal Letter Template</title>
    <style>
        .logo {
            text-align: left;
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
    <img src="${blurredImage}" alt="Company Logo" class="watermark" />
    <div class="logo">
        <img src="${company.imageFile}" alt="Company Logo" />
    </div>

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
    <h6 style="font-size: 14px;">Sub: Increament on Salary</h6>
    <h6 style="font-size: 14px;">Dear ${employee.firstName},</h6>
    <p>
    We would like to congratulate you on completion of One year period with us.
    We are pleased to inform you of your salary increase effective from <b>${appraisal.dateOfSalaryIncrement}. </b>
    The amount of your salary increase is <b>Rs. ${appraisal.grossCompensation} pa.</b>
    We understand this is a sustainable increase in your pay and we appreciate
    your hard work and dedication to the company.
    All other T&C are the same as per the original offer letter.
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
    <p>With Best Wishes,</p>
    <p style = "margin-top: 70px;">Authorized Signature</p>
    </div>

</body>

</html>