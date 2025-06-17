export const NAV_CONFIG = {
    ems_admin: [
        {
            title: 'Dashboard',
            path: '/main',
            icon: 'speedometer2' // 📈
        },
        {
            title: 'Company Management',
            icon: 'building', // 🏢
            items: [
                { title: 'Register Company', path: '/companyRegistration' },
                { title: 'View Companies', path: '/companyView' }
            ]
        }
    ],
    company_admin: [
        {
            title: 'Dashboard',
            path: '/main',
            icon: 'speedometer2' // 📈
        },
        {
            title: 'Department',
            path: '/department',
            icon: 'building' // 🏢
        },
        {
            title: 'Candidate',
            icon: 'person-check',
            items: [
                { title: 'Candidate Registration', path: '/candidateRegistration' },
                { title: 'Candidates View', path: '/candidatesView' },
                { title: 'Candidate Documents Upload', path: '/candidateDocumentUpload' },
                { title: 'Upload Success', path: '/uploadSuccess' }
            ] 
        },
        {
            title: 'Employees',
            path: '/employeeView',
            icon: 'people' // 👥
        },
        {
            title: 'Letters',
            icon: 'file-earmark-text', // 📄
            items: [
                { title: 'Offer Letter', path: '/offerLetterForm' },
                { title: 'Experience', path: '/experienceForm' },
                { title: 'Relieving', path: '/relievingSummary' },
                { title: 'Appraisal', path: '/appraisalLetter' },
                { title: 'Intern Offer Letter', path: '/internOfferForm' },
                { title: 'Interns Certificate Form', path: '/internsLetter' }
            ]
        },
        {
            title: 'Attendance',
            icon: 'calendar-check', // 🗓️✅
            items: [
                { title: 'Manage Attendance', path: '/addAttendance' },
                { title: 'Attendance Report', path: '/attendanceReport' }
            ]
        },
        {
            title: 'Payroll',
            icon: 'wallet2', // 👛
            items: [
                { title: 'Employee Salary List', path: '/employeesSalaryView' },
                { title: 'Generate Payslips', path: '/payslipGeneration' },
                { title: 'Payslips', path: '/payslipsList' }
            ]
        },
        {
            title: 'Clients',
            icon: 'person-lines-fill', // 👤📃
            items: [
                { title: 'Client View', path: '/customersView' },
                { title: 'Client Registration', path: '/customerRegistration' }
            ]
        },
        {
            title: 'Invoices',
            icon: 'receipt', // 🧾
            items: [
                { title: 'Invoice View', path: '/invoiceView' },
                { title: 'Invoice Registration', path: '/invoiceRegistartion' }
            ]
        },
        {
            title: 'Users',
            icon: 'person-fill', // 🧾
            items: [
                { title: 'Users View', path: '/viewUser' },
                { title: 'Users Registration', path: '/addUser' }
            ]
        },
        {
            title: 'Settings',
            icon: 'gear', // ⚙️
            items: [
                { title: 'Company Salary Structure', path: '/companySalaryView' },
                { title: 'Add TDS', path: '/companyTdsView' },
                { title: 'Bank Details', path: '/accountsView' },
                { title: 'Calendar', path: '/AddEvent' },
                { title: 'Offer Letter Templates', path: '/offerLetters' },
                { title: 'Appraisal Templates', path: '/appraisalTemplates' },
                { title: 'Experience Letter Template', path: '/experienceLetter' },
                { title: 'Relieving Template', path: '/relievingTemplates' },
                { title: 'Interns Offer Template', path: '/internOfferTemplate' },
                { title: 'Intern Certificate Template', path: '/internsTemplates' },
                { title: 'Payslip Template', path: '/payslipTemplates' },
                { title: 'Invoice Template', path: '/invoiceTemplates' }
            ]
        }
    ],
    Admin: [
        {
            title: 'Dashboard',
            path: '/main',
            icon: 'speedometer2' // 📈
        },
        {
            title: 'Department',
            path: '/department',
            icon: 'building' // 🏢
        },
        {
            title: 'Candidate',
            icon: 'person-check',
            items: [
                { title: 'Candidate Registration', path: '/candidateRegistration' },
                { title: 'Candidates View', path: '/candidatesView' },
                { title: 'Candidate Documents Upload', path: '/candidateDocumentUpload' },
                { title: 'Upload Success', path: '/uploadSuccess' }
            ] 
        },
        {
            title: 'Employees',
            path: '/employeeView',
            icon: 'people' // 👥
        },
        {
            title: 'Letters',
            icon: 'file-earmark-text', // 📄
            items: [
                { title: 'Offer Letter', path: '/offerLetterForm' },
                { title: 'Experience', path: '/experienceForm' },
                { title: 'Relieving', path: '/relievingSummary' },
                { title: 'Appraisal', path: '/appraisalLetter' },
                { title: 'Intern Offer Letter', path: '/internOfferForm' },
                { title: 'Interns Certificate Form', path: '/internsLetter' }
            ]
        },
        {
            title: 'Attendance',
            icon: 'calendar-check', // 🗓️✅
            items: [
                { title: 'Manage Attendance', path: '/addAttendance' },
                { title: 'Attendance Report', path: '/attendanceReport' }
            ]
        },
        {
            title: 'Payroll',
            icon: 'wallet2', // 👛
            items: [
                { title: 'Employee Salary List', path: '/employeesSalaryView' },
                { title: 'Generate Payslips', path: '/payslipGeneration' },
                { title: 'Payslips', path: '/payslipsList' }
            ]
        },
        {
            title: 'Client View',
            icon: 'person-lines-fill', // 👤📃
            items: [
                { title: 'Client View', path: '/customersView' },
                { title: 'Client Registration', path: '/customerRegistration' }
            ]
        },
        {
            title: 'Invoices',
            icon: 'receipt', // 🧾
            items: [
                { title: 'Invoice View', path: '/invoiceView' },
                { title: 'Invoice Registration', path: '/invoiceRegistartion' }
            ]
        },
        {
            title: 'Users',
            icon: 'person-fill', // 🧾
            items: [
                { title: 'Users View', path: '/viewUser' },
                { title: 'Users Registration', path: '/addUser' }
            ]
        },
        {
            title: 'Settings',
            icon: 'gear', // ⚙️
            items: [
                { title: 'Company Salary Structure', path: '/companySalaryView' },
                { title: 'Add TDS', path: '/companyTdsView' },
                { title: 'Bank Details', path: '/accountsView' },
                { title: 'Calendar', path: '/AddEvent' },
                { title: 'Offer Letter Templates', path: '/offerLetters' },
                { title: 'Appraisal Templates', path: '/appraisalTemplates' },
                { title: 'Experience Letter Template', path: '/experienceLetter' },
                { title: 'Relieving Template', path: '/relievingTemplates' },
                { title: 'Interns Offer Template', path: '/internOfferTemplate' },
                { title: 'Intern Certificate Template', path: '/internsTemplates' },
                { title: 'Payslip Template', path: '/payslipTemplates' },
                { title: 'Invoice Template', path: '/invoiceTemplates' }
            ]
        }
    ],
    HR: [
        {
            title: 'Dashboard',
            path: '/main',
            icon: 'speedometer2'
        },
        {
            title: 'Department',
            path: '/department',
            icon: 'building'
        },
        {
            title: 'Employees',
            path: '/employeeView',
            icon: 'people'
        },
        {
            title: 'Calendar',
            path: '/AddEvent',
            icon: 'calendar'
        },
        {
            title: 'Candidate',
            icon: 'person-check',
            items: [
                { title: 'Candidate Registration', path: '/candidateRegistration' },
                { title: 'Candidates View', path: '/candidatesView' },
                { title: 'Candidate Documents Upload', path: '/candidateDocumentUpload' },
                { title: 'Upload Success', path: '/uploadSuccess' }
            ] 
        },
        {
            title: 'Letters',
            icon: 'file-earmark-text',
            items: [
                { title: 'Offer Letter', path: '/offerLetterForm' },
                { title: 'Experience', path: '/experienceForm' },
                { title: 'Relieving', path: '/relievingSummary' },
                { title: 'Appraisal', path: '/appraisalLetter' },
                { title: 'Intern Offer Letter', path: '/internOfferForm' },
                { title: 'Interns Certificate Form', path: '/internsLetter' }
            ]
        },
        {
            title: 'Attendance',
            icon: 'calendar-check',
            items: [
                { title: 'Manage Attendance', path: '/addAttendance' },
                { title: 'Attendance Report', path: '/attendanceReport' }
            ]
        },
        {
            title: 'Payroll',
            icon: 'wallet2',
            items: [
                { title: 'Employee Salary List', path: '/employeesSalaryView' },
                { title: 'Generate Payslips', path: '/payslipGeneration' },
                { title: 'Payslips', path: '/payslipsList' }
            ]
        },
        {
            title: 'Settings',
            icon: 'gear',
            items: [
                { title: 'Company Salary Structure', path: '/companySalaryView' },
                { title: 'Add TDS', path: '/companyTdsView' },
                { title: 'Offer Letter Templates', path: '/offerLetters' },
                { title: 'Appraisal Templates', path: '/appraisalTemplates' },
                { title: 'Experience Letter Template', path: '/experienceLetter' },
                { title: 'Relieving Template', path: '/relievingTemplates' },
                { title: 'Interns Offer Template', path: '/internOfferTemplate' },
                { title: 'Intern Certificate Template', path: '/internsTemplates' },
                { title: 'Payslip Template', path: '/payslipTemplates' }
            ]
        }
    ],
    employee: [
        {
            title: 'Dashboard',
            path: '/main',
            icon: 'speedometer2'
        },
        {
            title: 'Salary Summary',
            path: '/employeeSalariesView',
            icon: 'wallet2'
        },
        {
            title: 'Payslips',
            path: '/employeePayslip',
            icon: 'receipt'
        }
    ],
    Accountant: [
        {
            title: 'Dashboard',
            path: '/main',
            icon: 'speedometer2'
        },
        {
            title: 'Clients',
            icon: 'person-lines-fill',
            items: [
                { title: 'Client View', path: '/customersView' },
                { title: 'Client Registration', path: '/customerRegistration' }
            ]
        },
        {
            title: 'Invoices',
            icon: 'receipt',
            items: [
                { title: 'Invoice View', path: '/invoiceView' },
                { title: 'Invoice Registration', path: '/invoiceRegistartion' }
            ]
        },
        {
            title: 'Payslips',
            path: '/employeePayslip',
            icon: 'wallet2'
        }
    ],
    candidate: [
        {
            title: 'Documents',
            path: '/documentUpload',
            icon: 'upload', // 📤
        }
    ],
};
