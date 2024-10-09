<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PaySlip Template 2</title>
    <style>
        @page {
            size: A4;
            margin: 6mm;
        }

        body {
            border: 1px solid black;
        }

        .logo {
            background-color: #9EEAF9;
            height: 160px;
            padding-bottom: 20px;
            text-align: center;
        }

        .logo img {
            width: 200px;
            height: 100px;
        }

        .company {
            font-size: medium;
            text-align: center;
            margin-top: 5px;
        }

        .title {
            text-align: center;
            color: #1a3241;
            margin: 0px;
            font-size: 18px;
            margin-top: 5px;
        }

        .employee-table {
            width: 100%;
            margin-top: 10px;
            font-size: medium;
            border-collapse: collapse;
        }

        .employee-table th,
        .employee-table td {
            padding: 8px;
            text-align: left;
            font-size: medium;

        }

        .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            padding: 0;
        }

        .salary-table th,
        .salary-table td {
            border: 1px solid black;
            padding: 4px;
            text-align: left;
            font-size: medium;

        }

        .emp-netpay {
         background-color: #9EEAF9;
            width: 97%;
            padding: 10px;
            font-size: 16px;
        }

        .emp-netpay table {

            width: 100%;
            text-align: center;
        }

        .allowance-fields,
        .allowance-values {
            border: none;
            font-size: medium;

        }

        .allowance-fields td,
        .allowance-values td,
        .deduction-fields td,
        .deduction-values td {
            padding: 4px;
            border: none;
            font-size: medium;
        }

        .text {
            margin: 20px 0;
            font-size: 15px;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="logo">
        <img src="${company.imageFile}"
            alt="Company Logo" />
        <p class="company">
            ${company.companyAddress}<br />
            ${company.mobileNo}<br />
            ${company.emailId}
        </p>
    </div>
    <div class="title"><b>SALARY SLIP</b></div>

    <div class="emp-netpay">
        <table>
            <tr>
                <td><b>Employee Details</b></td>
                <td><b>Month-Year: ${payslipEntity.month}-${payslipEntity.year}</b></td>
            </tr>
        </table>
    </div>

    <table class="employee-table">
        <tr>
            <th>EmployeeId</th>
            <td>${employee.employeeId}</td>
            <th>Name</th>
            <td>${employee.firstName} ${employee.lastName}</td>
        </tr>
        <tr>
            <th>Department</th>
            <td>${employee.departmentName}</td>
            <th>PAN</th>
            <td>${employee.panNo}</td>
        </tr>
        <tr>
            <th>Designation</th>
            <td>${employee.designationName}</td>
            <th>UAN</th>
            <td>${employee.uanNo}</td>
        </tr>
        <tr>
            <th>Bank ACC No</th>
            <td>${employee.accountNo}</td>
            <th>IFSC</th>
            <td>${employee.ifscCode}</td>
        </tr>
        <tr>
            <th>Total Days</th>
            <td>${payslipEntity.attendance.totalWorkingDays}</td>
            <th>Worked Days</th>
            <td>${payslipEntity.attendance.noOfWorkingDays}</td>
        </tr>
        <tr>
            <th>LOP Days</th>
            <td>
                <#assign totalWorkingDays=payslipEntity.attendance.totalWorkingDays?number>
                    <#assign noOfWorkingDays=payslipEntity.attendance.noOfWorkingDays?number>
                        <#if (totalWorkingDays - noOfWorkingDays) < 0>
                            N/A
                            <#else>
                                ${totalWorkingDays - noOfWorkingDays}
                        </#if>
            </td>
            <th>Date of Birth</th>
            <td>${employee.dateOfBirth}</td>
        </tr>
    </table>

    <table class="salary-table">
        <tr>
            <th style="width:30%;">Earnings (A)</th>
            <th>Amount (A)</th>
            <th>Deductions (B)</th>
            <th>Amount (B)</th>
        </tr>
       <tr>
                               <!-- Column for Allowances and Amounts -->
                               <td>
                                   <table class="allowance-fields">
                                       <!-- Loop through Allowances -->

                                       <#list allowanceList as allowance>
                                           <#list allowance?keys as key>
                                               <tr>
                                                   <td>${key}</td>
                                               </tr>
                                           </#list>
                                       </#list>
                                       <tr>
                                           <td>Total Earnings (A)</td>
                                       </tr>

                                   </table>
                               </td>


                               <td>
                                   <table class="allowance-values">
                                       <!-- Loop through Allowances to Get Amounts -->

                                       <#list allowanceList as allowance>
                                           <#list allowance?keys as key>
                                               <tr>
                                                   <td>${allowance[key]}</td> <!-- Display allowance amount -->
                                               </tr>
                                           </#list>
                                       </#list>
                                       <tr>
                                           <td>${payslipEntity.salary.totalEarnings}</td> <!-- Total Earnings Amount -->
                                       </tr>
                                   </table>
                               </td>

                               <!-- Column for Deductions and Amounts -->
                               <td>
                                   <table class="deduction-fields">
                                       <!-- Loop through Deductions -->
                                       <#list deductionList as deduction>
                                           <#list deduction?keys as key>
                                               <tr>
                                                   <td>${key}</td>
                                               </tr>
                                           </#list>
                                       </#list>
                                       <tr>
                                           <td>LOP</td> <!-- Add LOP -->
                                       </tr>
                                       <tr>
                                           <td>Total Deductions (B)</td> <!-- Add LOP -->
                                       </tr>
                                       <tr>
                                           <th style="border-left: 2900px ; border-right: 2900px; background-color: #9EEAF9;">Taxes (C)</th> <!-- Add LOP -->
                                       </tr>
                                       <tr>
                                           <td>Income Tax</td> <!-- Add Income Tax -->
                                       </tr>
                                       <tr>
                                           <td>Pf Tax</td> <!-- Add Pf Tax -->
                                       </tr>
                                       <tr>
                                           <td>Total Tax (C)</td> <!-- Add Total Deductions -->
                                       </tr>

                                   </table>
                               </td>

                               <td>
                                   <table class="deduction-values">
                                       <!-- Loop through Deductions to Get Amounts -->
                                       <#list deductionList as deduction>
                                           <#list deduction?keys as key>
                                               <tr>
                                                   <td>${deduction[key]}</td> <!-- Display deduction amount -->
                                               </tr>
                                           </#list>
                                       </#list>

                                       <tr>
                                           <td>${payslipEntity.salary.lop!0}</td>
                                       </tr> <!-- Display LOP amount, default to 0 if null or empty -->
                                       <tr>
                                           <td>${payslipEntity.salary.totalDeductions}</td>
                                       </tr> <!-- Display LOP amount -->
                                       <tr>
                                           <th style="border-left: 900px ; border-right: 900px; background-color: #9EEAF9;">Amount (C)</th>
                                       </tr> <!-- Display Income Tax amount -->
                                       <tr>
                                           <td>${payslipEntity.salary.incomeTax}</td>
                                       </tr> <!-- Display Income Tax amount -->
                                       <tr>
                                           <td>${payslipEntity.salary.pfTax}</td>
                                       </tr> <!-- Display Income Tax amount -->
                                       <tr>
                                           <td>${payslipEntity.salary.totalTax}</td>
                                       </tr> <!-- Display Total Deductions -->


                                   </table>
                               </td>

                           </tr>
        <tr>
            <th style= "background-color: #9EEAF9; ">Net Pay (A-B-C)</th>
            <td colspan="3"><strong>${payslipEntity.salary.netSalary}</strong></td>
        </tr>
        <tr>
            <th style= "background-color: #9EEAF9; ">Net Salary (In Words)</th>
            <td colspan="3"><strong>${payslipEntity.inWords}</strong></td>
        </tr>
    </table>
</body>
     <div class="text">
        <p><em>This is a computer-generated payslip and does not require authentication</em></p>
    </div>

</html>