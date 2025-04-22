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
            title: 'Designation',
            path: '/designation',
            icon: 'person-badge' // 🏷️
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
            title: 'Settings',
            icon: 'gear', // ⚙️
            items: [
                { title: 'Company Salary Structure', path: '/companySalaryView' },
                { title: 'Bank Details', path: '/accountsView' },
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
            title: 'Designation',
            path: '/designation',
            icon: 'person-badge'
        },
        {
            title: 'Employees',
            path: '/employeeView',
            icon: 'people'
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
            path: '/employeeSalary',
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
    ]
};
