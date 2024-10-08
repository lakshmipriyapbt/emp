<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pay Slip Template 3</title>
    <style>
        @page {
            size: A4;
            margin: 6mm;
        }

        body {
            margin: 0;
            padding: 0;
        }

        .main {
            width: 100%;
            box-sizing: border-box;
        }

        .pdfPage {
            width: 100%;
            margin: 0 auto;
            box-sizing: border-box;
        }

        .top {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            margin-bottom: 20px;
        }

        .date-info {
            text-align: left;
            flex: 1;
            width: 400px;
        }

        .logo {
            text-align: end;
            flex-shrink: 0;
            margin-bottom: 20px;
            margin-top: 0px;
            margin-left: 60px
        }

        .logo img {
            max-width: 130px;
            height: 100px;
            display: flex;
        }

        .details {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }

        .details table {
            width: 100%;
            border-collapse: collapse;
        }

        .details th,
        .details td {
            border: 0.5px solid black;
            padding: 4px;
            text-align: left;
        }

        .employee-details {
            text-align: center;
        }

        .text {
            margin: 20px 0;
        }

        .address {
            margin-top: 220px;
            text-align: center;
        }

        .salary-table,
        .salary-table th,
        .salary-table td {
            border: 1px solid black;
            border-collapse: collapse;
            padding: 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background-color: #ffcc80;
        }

        .center {
            text-align: center;
        }

        .salary-details {
            margin-top: 20px;
        }

        .allowance-fields,
        .allowance-values {
            margin-bottom: 28px;
        }

        .deduction-fields,
        .deduction-values {
            margin-bottom: 28px;
        }

        .allowance-fields,
        .allowance-values {
            border: none;
            /* No border for allowance tables */
        }

        .allowance-fields td,
        .allowance-values td {
            padding: 4px;
            border: none;
        }

        .deduction-fields,
        .deduction-values {
            border: none;
            /* No border for allowance tables */
        }

        .deduction-fields td,
        .deduction-values td {
            padding: 4px;
            border: none;
        }
    </style>
</head>

<body>
    <div class="main">
        <div class="pdfPage">
            <table>
                <tr>
                    <td>
                        <div class="date-info">
                            <h4 id="month-year">${payslipEntity.month}-${payslipEntity.year} Pay Slip</h4>
                            <h4 id="employee-name"> Name: ${employee.firstName} ${employee.lastName}</h4>
                        </div>
                    </td>
                    <td>
                        <div class="logo">
                            <img src="${company.imageFile}" alt="Company Logo"/>
                        </div>
                    </td>
                </tr>
            </table>

            <div class="details">
                <table>
                    <tr>
                        <th colspan="4" class="employee-details">Employee Details</th>
                    </tr>
                    <tr>
                        <th>EmployeeId</th>
                        <td>${employee.employeeId}</td>
                        <th>Joining Date</th>
                        <td>${employee.dateOfHiring}</td>
                    </tr>
                    <tr>
                        <th>Date Of Birth</th>
                        <td>${employee.dateOfBirth}</td>
                        <th>PAN</th>
                        <td>${employee.panNo}</td>
                    </tr>
                    <tr>
                        <th>Department</th>
                        <td>${employee.departmentName}</td>
                        <th>UAN</th>
                        <td>${employee.uanNo}</td>
                    </tr>
                    <tr>
                        <th>Designation</th>
                        <td>${employee.designationName}</td>
                        <th>Location</th>
                        <td>${employee.location}</td>
                    </tr>
                    <tr>
                        <td colspan="4" class="employee-details">Bank ACC No:
                            ${employee.accountNo}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IFSC:
                            ${employee.ifscCode}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            Bank: ${employee.bankName}</td>
                    </tr>
                </table>
            </div>

            <div class="details">
                <table>
                    <tr>
                        <th>Total Working Days</th>
                        <td>${payslipEntity.attendance.totalWorkingDays?number}</td>
                        <th>No. Of Working Days</th>
                        <td>${payslipEntity.attendance.noOfWorkingDays?number}</td>
                        <th>No. Of Leaves</th>
                        <td>
                            <#assign totalWorkingDays=payslipEntity.attendance.totalWorkingDays?number>
                                <#assign noOfWorkingDays=payslipEntity.attendance.noOfWorkingDays?number>
                                    <#if (totalWorkingDays - noOfWorkingDays) < 0>
                                        N/A
                                        <#else>
                                            ${totalWorkingDays - noOfWorkingDays}
                                    </#if>
                        </td>
                    </tr>

                </table>
            </div>
            <div class="salary-details">
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
                            </table>
                        </td>
                    </tr>
                    <!-- Net Pay Row -->
                    <tr>
                        <th>Net Pay (A-B-C)</th>
                        <td colspan="3"><strong>${payslipEntity.salary.netSalary}</strong></td>
                    </tr>
                    <tr>
                        <th>Net Salary (In Words)</th>
                        <td colspan="3"><strong>${payslipEntity.inWords}</strong></td>
                    </tr>
                </table>
            </div>

            <div class="text">
                <p><em>This is computer-generated payslip and does not require authentication</em></p>
            </div>
            <div class="address">
                <hr />
                <p>
                    Company Address: ${company.companyAddress}<br />
                    Mobile No: ${company.mobileNo}<br />
                    Email ID: ${company.emailId}
                </p>
            </div>

        </div>
    </div>
</body>

</html>