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
                               </#if>
                           </td>
                       </#list>
                   </tr>
               </#list>
           </tbody>
   </table>

</body>
</html>