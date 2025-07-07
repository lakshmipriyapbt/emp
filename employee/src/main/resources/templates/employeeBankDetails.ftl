<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Employee Bank Details</title>

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
            word-wrap: break-word;
            font-size: 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
      }
      th {
            background-color: #f2f2f2;
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

    <h4>Company Employees&nbsp;&ndash;&nbsp;Bank Details</h4>

    <table>
        <tr>
            <#-- Dynamically render the headers -->
            <#list columns as col>
                <th>${col}</th>
            </#list>
        </tr>

        <#-- Render each employee row -->
        <#list data as person>
            <tr>
                <#list columns as col>
                    <td>
                        <#-- Map each selectable column to its corresponding field -->
                        <#if        col == "Name">
                            ${person.firstName} ${person.lastName}
                        <#elseif    col == "EmployeeId">
                            ${person.employeeId}
                        <#elseif    col == "Bank Name">
                            ${person.bankName}
                        <#elseif    col == "Bank Account No">
                            ${person.accountNo}
                        <#elseif    col == "Bank IFSCOde">
                            ${person.ifscCode}
                        <#elseif    col == "Pan No">
                            ${person.panNo}
                        <#elseif    col == "PF Number">
                            <#if person.pfNo??>${person.pfNo}<#else> - </#if>
                        <#elseif    col == "UAN No">
                            <#if person.uanNo??>${person.uanNo}<#else> - </#if>
                        <#else>
                            -
                        </#if>
                    </td>
                </#list>
            </tr>
        </#list>
    </table>
</body>
</html>
