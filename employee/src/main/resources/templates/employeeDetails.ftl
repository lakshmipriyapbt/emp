<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Employee Details</title>
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

      /* Table Styling */
      table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-family: Arial, sans-serif;
      }

      th, td {
            padding: 3px;
            text-align: left;
            border: 1px solid #ddd;
            word-wrap: break-word; /* Ensure content breaks properly */
            font-size: 10px;
            white-space: nowrap; /* Prevent text from wrapping */
      }

      th {
            background-color: #f2f2f2;
            font-weight: bold;
      }

      /* Watermark styling */
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

      /* Improve table column width */
      th, td {
            overflow: hidden;
            text-overflow: ellipsis;
      }

    </style>
</head>
<body>
    <img src="${blurredImage}" alt="Company Logo" class="watermark" />

    <div class="logo">
        <img src="${company.imageFile}" alt="Company Logo" />
    </div>

    <h4>Company Employees</h4>

   <table>
           <thead>
               <tr>
                   <#list selectedFields as field>
                       <th>${field}</th>
                   </#list>
               </tr>
           </thead>
           <tbody>
               <#list data as person>
                   <tr>
                       <#list selectedFields as field>
                           <td>
                               <#if field == "Name">
                                   ${person.firstName} ${person.lastName}
                               <#elseif field == "EmployeeId">
                                   ${person.employeeId!}
                               <#elseif field == "Pan No">
                                   ${person.panNo!}
                               <#elseif field == "Aadhaar No">
                                   ${person.aadhaarId!}
                               <#elseif field == "Bank Account No">
                                   ${person.accountNo!}
                               <#elseif field == "Contact No">
                                   ${person.mobileNo!}
                               <#elseif field == "Date Of Birth">
                                   ${person.dateOfBirth!}
                               <#elseif field == "UAN No">
                                   ${person.uanNo!}
                               <#elseif field == "Department and Designation">
                                   ${person.departmentName!} ${person.designationName!}
                               <#elseif field == "Alternate No">
                                   ${person.alternateNo!}
                               <#elseif field == "Email Id">
                                   ${person.emailId!}
                               <#elseif field == "Date Of Hiring">
                                   ${person.dateOfHiring!}
                               <#elseif field == "Marital Status">
                                   ${person.maritalStatus!}
                               <#elseif field == "PF No">
                                   ${person.pfNo!}
                               <#elseif field == "IFSC Code">
                                   ${person.ifscCode!}
                               <#elseif field == "Bank Name">
                                   ${person.bankName!}
                               <#elseif field == "Bank Branch">
                                   ${person.bankBranch!}
                               <#elseif field == "Current Gross">
                                   ${person.currentGross!}
                               <#elseif field == "Location">
                                   ${person.location!}
                               <#elseif field == "Temporary Address">
                                   ${person.tempAddress!}
                               <#elseif field == "Permanent Address">
                                   ${person.permanentAddress!}
                               </#if>
                           </td>
                       </#list>
                   </tr>
               </#list>
           </tbody>
   </table>

</body>
</html>