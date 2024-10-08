package com.pb.employee.serviceImpl;

import com.itextpdf.text.DocumentException;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.EmployeeStatus;
import com.pb.employee.request.PayslipRequest;
import com.pb.employee.request.PayslipUpdateRequest;
import com.pb.employee.service.PayslipService;
import com.pb.employee.util.*;
import freemarker.template.Configuration;
import freemarker.template.Template;
import jakarta.servlet.http.HttpServletRequest;
import freemarker.template.TemplateException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.*;
import java.util.*;

@Service
@Slf4j
public class PayslipServiceImpl implements PayslipService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private Configuration freeMarkerConfig;

    @Override
    public ResponseEntity<?> generatePaySlip(PayslipRequest payslipRequest, String salaryId, String employeeId) throws EmployeeException, IOException {
        String paySlipId = ResourceIdUtils.generatePayslipId(payslipRequest.getMonth(), payslipRequest.getYear(), employeeId);
        EmployeeSalaryEntity entity = null;
        Object payslipEntity = null;
        EmployeeEntity employee = null;
        AttendanceEntity attendance = null;
        String index = ResourceIdUtils.generateCompanyIndex(payslipRequest.getCompanyName());
            try{
                payslipEntity = openSearchOperations.getById(paySlipId, null, index);
                if(payslipEntity != null) {
                    log.error("employee details existed{}", payslipRequest.getCompanyName());
                    throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_PAYSLIP_ALREADY_EXISTS),employeeId),
                            HttpStatus.CONFLICT);
                }
                String attendanceId = ResourceIdUtils.generateAttendanceId(payslipRequest.getCompanyName(), employeeId, payslipRequest.getYear(),payslipRequest.getMonth());

                attendance = openSearchOperations.getAttendanceById(attendanceId, null, index);
                if (attendance == null){
                    log.error("Employee Attendance is not found fot {} employee", employeeId);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_GET_ATTENDANCE),
                            HttpStatus.INTERNAL_SERVER_ERROR);
                }
            } catch (IOException e) {
                log.error("Unable to get the company details {}", payslipRequest.getCompanyName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE),employeeId),
                        HttpStatus.BAD_REQUEST);
            }
            employee = openSearchOperations.getEmployeeById(employeeId, null, index);
            if(employee ==null){
                log.error("Employee with this {}, is not found", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            entity = openSearchOperations.getSalaryById(salaryId, null, index);
            if (entity==null){
                log.error("Exception while fetching employee for salary {}", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (!entity.getEmployeeId().equals(employeeId)) {
                log.error("Employee ID mismatch for salary {}: expected {}, found", salaryId, employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_MATCHING),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (entity.getStatus().equals(EmployeeStatus.INACTIVE.getStatus())){
                log.error("Employee{} Salary {}: is inActive", salaryId, employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.SALARY_INACTIVE),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        try {
            // Retrieve attendance details
            String attendanceId = ResourceIdUtils.generateAttendanceId(payslipRequest.getCompanyName(),employeeId,payslipRequest.getYear(),payslipRequest.getMonth());
            attendance=openSearchOperations.getAttendanceById(attendanceId,null,index);
            PayslipEntity payslipProperties = PayslipUtils.unMaskEmployeePayslipProperties(entity, payslipRequest, paySlipId, employeeId, attendance);
            PayslipUtils.forFormatNumericalFields(payslipProperties);
            payslipProperties = PayslipUtils.maskEmployeePayslip(payslipProperties,entity,attendance);
            Entity result = openSearchOperations.saveEntity(payslipProperties, paySlipId, index);
        } catch (Exception exception) {
            log.error("Unable to save the employee details  {}",exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_GENERATE_PAYSLIP),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }


    @Override
    public ResponseEntity<?> generatePaySlipForAllEmployees(PayslipRequest payslipRequest) throws EmployeeException, IOException {
        String index = ResourceIdUtils.generateCompanyIndex(payslipRequest.getCompanyName());
        AttendanceEntity attendanceEntities = null;
        List<PayslipEntity> generatedPayslips = new ArrayList<>();
        List<String> employeesWithoutAttendance = new ArrayList<>();

        try {
            List<EmployeeEntity> employeeEntities = openSearchOperations.getCompanyEmployees(payslipRequest.getCompanyName());

            for (EmployeeEntity employee : employeeEntities) {
                List<EmployeeSalaryEntity> salaryEntities = openSearchOperations.getEmployeeSalaries(payslipRequest.getCompanyName(), employee.getId());
                if (salaryEntities == null ) {
                    log.error("Employee Salary with employeeId {} is not found", employee.getId());
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                            HttpStatus.INTERNAL_SERVER_ERROR);
                }

                String attendanceId = ResourceIdUtils.generateAttendanceId(payslipRequest.getCompanyName(), employee.getId(), payslipRequest.getYear(), payslipRequest.getMonth());

                attendanceEntities = openSearchOperations.getAttendanceById(attendanceId, null, index);
                if (attendanceEntities == null) {
                    log.error("Employee Attendance is not found for employee {}", employee.getId());
                    employeesWithoutAttendance.add(employee.getId());
                    continue; // Skip to the next employee if attendance is not found
                }

                // Generate payslip ID based on month, year, and employee ID
                String paySlipId = ResourceIdUtils.generatePayslipId(payslipRequest.getMonth(), payslipRequest.getYear(), employee.getEmployeeId());

                // Check if payslip already exists for this employee
                PayslipEntity payslipEntity = openSearchOperations.getPayslipById(paySlipId, null, index);
                if (payslipEntity != null) {
                    log.error("Payslip already exists for employee with ID {}", employee.getEmployeeId());
                    continue; // Skip to the next employee if payslip already exists
                }

                // Generate and save payslip for the current employee
                List<PayslipEntity> payslipPropertiesList = new ArrayList<>();
                for (EmployeeSalaryEntity salary : salaryEntities) {
                    if (salary.getStatus().equals(EmployeeStatus.ACTIVE.getStatus())){
                        PayslipEntity payslipProperties = PayslipUtils.unMaskEmployeePayslipProperties(salary, payslipRequest, paySlipId, employee.getId(), attendanceEntities);
                        PayslipUtils.forFormatNumericalFields(payslipProperties);
                        payslipProperties = PayslipUtils.maskEmployeePayslip(payslipProperties, salary, attendanceEntities);
                        generatedPayslips.add(payslipProperties);
                        payslipPropertiesList.add(payslipProperties);
                   }
                }

                // Save all payslips for the current employee
                for (PayslipEntity payslipProperties : payslipPropertiesList) {
                    openSearchOperations.saveEntity(payslipProperties, paySlipId, index);
                }
            }

            // Return response with generated payslips and employees without attendance

        } catch (IOException | EmployeeException ex) {
            log.error("Error generating payslips: {}", ex.getMessage());
            throw ex; // Re-throw the caught exception for higher level handling

        } catch (Exception ex) {
            log.error("Unexpected error generating payslips: {}", ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_EMPLOYEE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put(Constants.GENERATE_PAYSLIP, generatedPayslips);
        responseBody.put(Constants.EMPLOYEE_WITHOUT_ATTENDANCE, employeesWithoutAttendance);
        if (generatedPayslips.size() == 0){
            log.error("attendance are not found for the employees {}", employeesWithoutAttendance);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_GET_ATTENDANCE), employeesWithoutAttendance),
                    HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(responseBody), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> getPayslipById(String companyName, String employeeId, String payslipId) throws EmployeeException, IOException {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        EmployeeEntity employee = null;
        PayslipEntity entity = null;
        try {
           employee = openSearchOperations.getEmployeeById(employeeId, null, index);
           if (employee == null){
               log.error("Employee with this {}, is not found", employeeId);
               throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                       HttpStatus.INTERNAL_SERVER_ERROR);
           }
           entity=openSearchOperations.getPayslipById(payslipId, null, index);
           PayslipUtils.unmaskEmployeePayslip(entity);

            if (entity==null){
               log.error("Employee with this payslip {}, is not found", payslipId);
               throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_PAYSLIP),
                       HttpStatus.INTERNAL_SERVER_ERROR);
           }
           if (!entity.getEmployeeId().equals(employeeId)){
               log.error("Employee ID mismatch for payslipId {}: expected {}, found {}", payslipId, employeeId, entity.getEmployeeId());
               throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_MATCHING),
                       HttpStatus.INTERNAL_SERVER_ERROR);
           }
        }
        catch (Exception ex) {
            log.error("Exception while fetching salaries for employees {}: {}", employeeId, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(entity), HttpStatus.OK);

    }

    @Override
    public ResponseEntity<?> getEmployeePayslips(String companyName, String employeeId,String month,String year) throws EmployeeException {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        EmployeeEntity employee = null;
        Object salary = null;
        List<PayslipEntity> allPayslips =null;
        try {
            // Fetch employee details
            employee = openSearchOperations.getEmployeeById(employeeId, null, index);
            if (employee == null) {
                log.error("Employee with ID {}  not found", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.NOT_FOUND);
            }
            allPayslips = openSearchOperations.getEmployeePayslip(companyName, employeeId,month,year);
            for (PayslipEntity payslipEntity:allPayslips){
                PayslipUtils.unmaskEmployeePayslip(payslipEntity);
            }

            if (allPayslips.isEmpty()) {
                log.warn("No matching payslips found for employee with ID {}", employee);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_MATCHING),
                        HttpStatus.NOT_FOUND);
            }
        } catch (Exception ex) {
            log.error("Exception while fetching payslips for employee {}: {}", employeeId, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_PAYSLIP),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(allPayslips), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> getAllEmployeesPayslips(String companyName,String month,String year) throws EmployeeException {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        EmployeeEntity employee = null;
        Object salary = null;
        List<PayslipEntity> allPayslips =null;
        try {
            // Fetch employee details
            allPayslips = openSearchOperations.getAllPayslips(companyName,month,year);
            for (PayslipEntity payslipEntity:allPayslips){
                PayslipUtils.unmaskEmployeePayslip(payslipEntity);
            }

            if (allPayslips.isEmpty()) {
                log.warn("No matching payslips found for employee with ID {}", employee);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_MATCHING),
                        HttpStatus.NOT_FOUND);
            }
        } catch (Exception ex) {
            log.error("Exception while fetching payslips {}", ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_PAYSLIP),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(allPayslips), HttpStatus.OK);
    }


    @Override
    public ResponseEntity<?> deleteEmployeePayslipById(String companyName, String employeeId,String payslipId) throws EmployeeException{
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        EmployeeEntity employee = null;
        Object entity = null;
        try {
            employee = openSearchOperations.getEmployeeById(employeeId, null, index);
            if (employee == null){
                log.error("Employee with this {}, is not found", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            entity=openSearchOperations.getById(payslipId, null, index);
            if (entity==null){
                log.error("Employee with this payslip {}, is not found", payslipId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_PAYSLIP),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }

            openSearchOperations.deleteEntity(payslipId, index);
        }
        catch (Exception ex) {
            log.error("Exception while deleting salaries for employees {}: {}", payslipId, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED), HttpStatus.OK);

    }

    public ResponseEntity<byte[]> downloadPayslip(String companyName, String payslipId, String employeeId, int templateNumber, HttpServletRequest request) {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        EmployeeEntity employee;
        PayslipEntity entity;
        DepartmentEntity department;
        DesignationEntity designation;
        CompanyEntity company;

        try {
            SSLUtil.disableSSLVerification();
            employee = openSearchOperations.getEmployeeById(employeeId, null, index);
            if (employee == null) {
                log.error("Employee with ID {} is not found", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            department = openSearchOperations.getDepartmentById(employee.getDepartment(), null, index);
            designation = openSearchOperations.getDesignationById(employee.getDesignation(), null, index);
            company = openSearchOperations.getCompanyById(employee.getCompanyId(), null, Constants.INDEX_EMS);
            if (company == null) {
                log.error("Company {} is not found", employee.getCompanyId());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_ALREADY_EXISTS), companyName),
                        HttpStatus.CONFLICT);
            }
            entity = openSearchOperations.getPayslipById(payslipId, null, index);
            PayslipUtils.unmaskEmployeePayslip(entity);
            Entity companyEntity = CompanyUtils.unmaskCompanyProperties(company, request);
            Entity employeeEntity = EmployeeUtils.unmaskEmployeeProperties(employee, department, designation);

            // Prepare FreeMarker model
            Map<String, Object> model = new HashMap<>();
            model.put(Constants.PAYSLIP_ENTITY, entity);
            model.put(Constants.EMPLOYEE, employeeEntity);
            model.put(Constants.COMPANY, companyEntity);

            // Handle allowances dynamically
            List<Map<String, Object>> allowanceList = new ArrayList<>();
            handleAllowances(entity, allowanceList);
            model.put(Constants.ALLOWANCE_LIST, allowanceList); // Add allowance list to the model

            // Handle deductions dynamically
            List<Map<String, Object>> deductionList = new ArrayList<>();
            handleDeductions(entity, deductionList);
            model.put(Constants.DEDUCTION_LIST, deductionList); // Add deduction list to the model

            // Choose the template based on the template number
            String templateName = switch (templateNumber) {
                case 1 -> Constants.PAYSLIP_TEMPLATE_ONE;
                case 2 -> Constants.PAYSLIP_TEMPLATE_TWO;
                case 3 -> Constants.PAYSLIP_TEMPLATE_THREE;
                case 4 -> Constants.PAYSLIP_TEMPLATE_FOUR;
                default -> throw new IllegalArgumentException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_TEMPLATE_NUMBER));
            };
            System.out.println(model);

            // Generate HTML from FreeMarker template
            Template template = freeMarkerConfig.getTemplate(templateName);
            StringWriter stringWriter = new StringWriter();
            try {
                template.process(model, stringWriter);
            } catch (TemplateException e) {
                throw new IOException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.ERROR_PROCESSING_TEMPLATE) + e.getMessage(), e);
            }
            String htmlContent = stringWriter.toString();

            // Convert HTML to PDF
            byte[] pdfBytes = generatePdfFromHtml(htmlContent);

            // Set HTTP headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                    .filename("payslip_" + employee.getFirstName() + ".pdf")
                    .build());

            // Return response
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (IOException e) {
            log.error("IO exception occurred while processing the payslip: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (EmployeeException e) {
            log.error("Employee exception occurred: {}", e.getMessage());
            throw new RuntimeException(e);
        } catch (Exception e) {
            log.error("Unexpected exception occurred: {}", e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }

    private void handleAllowances(PayslipEntity entity, List<Map<String, Object>> allowanceList) {
        // Get the allowances from the entity
        Map<String, String> allowancesObj = entity.getSalary().getSalaryConfigurationEntity().getAllowances();

        // List to store allowances
        List<Map<String, Object>> unorderedAllowances = new ArrayList<>();

        if (allowancesObj != null && !allowancesObj.isEmpty()) {
            // Iterate over the Map<String, String> to extract key-value pairs
            for (Map.Entry<String, String> entry : allowancesObj.entrySet()) {
                Map<String, Object> allowanceMap = new HashMap<>();
                String formattedKey = formatFieldName(entry.getKey());  // Format the key
                allowanceMap.put(formattedKey, entry.getValue());       // Put key-value into the map
                unorderedAllowances.add(allowanceMap);                  // Add to unordered list
            }
        } else {
            log.warn("No allowances found for payslip {}", entity.getPayslipId());
        }

        // Reorder allowances according to specified logic
        reorderAllowances(allowanceList, unorderedAllowances);
    }



    private void reorderAllowances(List<Map<String, Object>> allowanceList, List<Map<String, Object>> unorderedAllowances) {
        // Create a list to hold the ordered allowances
        List<Map<String, Object>> orderedAllowances = new ArrayList<>();

        // First, add the HRA if it exists
        for (Map<String, Object> allowance : unorderedAllowances) {
            if (allowance.containsKey(Constants.HRA)) {
                orderedAllowances.add(allowance);
                unorderedAllowances.remove(allowance); // Remove from unordered list
                break; // Exit loop after adding HRA
            }
        }

        // Add all other dynamic allowances
        List<String> dynamicAllowanceKeys = new ArrayList<>();
        for (Map<String, Object> allowance : unorderedAllowances) {
            for (String key : allowance.keySet()) {
                // Add to dynamic allowances if it is not HRA, PF Contribution Employee or Other Allowance
                if (!key.equals(Constants.HRA) && !key.equals(Constants.PF_CONTRIBUTION_EMPLOYEE) && !key.equals(Constants.OTHER_ALLOWANCE)) {
                    dynamicAllowanceKeys.add(key);
                }
            }
        }

        // Now add all dynamic allowances found
        for (String key : dynamicAllowanceKeys) {
            for (Map<String, Object> allowance : unorderedAllowances) {
                if (allowance.containsKey(key)) {
                    orderedAllowances.add(allowance);
                    unorderedAllowances.remove(allowance); // Remove from unordered list
                    break; // Exit loop after adding the key
                }
            }
        }

        // Add the PF Contribution Employee if it exists
        for (Map<String, Object> allowance : unorderedAllowances) {
            if (allowance.containsKey(Constants.PF_CONTRIBUTION_EMPLOYEE)) {
                orderedAllowances.add(allowance);
                unorderedAllowances.remove(allowance); // Remove from unordered list
                break; // Exit loop after adding PF Contribution Employee
            }
        }

        // Add Other Allowance last
        for (Map<String, Object> allowance : unorderedAllowances) {
            if (allowance.containsKey(Constants.OTHER_ALLOWANCE)) {
                orderedAllowances.add(allowance);
                unorderedAllowances.remove(allowance); // Remove from unordered list
                break; // Exit loop after adding Other Allowance
            }
        }

        // Add any remaining allowances (if any) that don't match above criteria
        orderedAllowances.addAll(unorderedAllowances);

        // Clear the original allowance list and add ordered allowances
        allowanceList.clear();
        allowanceList.addAll(orderedAllowances);
    }

    private void handleDeductions(PayslipEntity entity, List<Map<String, Object>> deductionList) {
        // Get the deductions from the entity
        Map<String, String> deductionsObj = entity.getSalary().getSalaryConfigurationEntity().getDeductions();

        // Predefined keys using constants
        String totalDeductionsKey = Constants.TOTAL_DEDUCTION;
        List<String> keysAfterTotalDeductions = Arrays.asList(Constants.PF_TAX, Constants.INCOME_TAX, Constants.TOTAL_TAX);

        // List to store unordered deductions
        List<Map<String, Object>> unorderedDeductions = new ArrayList<>();

        if (deductionsObj != null && !deductionsObj.isEmpty()) {
            // Iterate over the Map<String, String> to extract key-value pairs
            for (Map.Entry<String, String> entry : deductionsObj.entrySet()) {
                Map<String, Object> deductionMap = new HashMap<>();
                String formattedKey = formatFieldName(entry.getKey());  // Format the key
                deductionMap.put(formattedKey, entry.getValue());       // Put key-value into the map
                unorderedDeductions.add(deductionMap);                  // Add to unordered list
            }
        } else {
            log.warn("No deductions found for payslip {}", entity.getPayslipId());
        }

        // Reorder deductions to ensure total deduction is first
        unorderedDeductions.sort(Comparator.comparing(map -> map.containsKey(totalDeductionsKey) ? 0 : 1));

        // Reorder after total deductions based on predefined keys
        List<Map<String, Object>> orderedDeductions = new ArrayList<>();
        for (String key : keysAfterTotalDeductions) {
            for (Map<String, Object> deduction : unorderedDeductions) {
                if (deduction.containsKey(key)) {
                    orderedDeductions.add(deduction);
                }
            }
        }

        // Add remaining deductions (if any)
        unorderedDeductions.removeAll(orderedDeductions);
        orderedDeductions.addAll(unorderedDeductions); // Add back remaining unordered deductions at the end

        // Update the original deduction list with the ordered one
        deductionList.clear();
        deductionList.addAll(orderedDeductions);
    }


    private String formatFieldName(String fieldName) {
        // Special cases for specific fields
        if (fieldName.equalsIgnoreCase(Constants.HRA_SMALL)) {
            return Constants.HRA; // Capitalize HRA
        } else if (fieldName.toLowerCase().startsWith(Constants.PF_SMALL)) {
            // Capitalize PF and handle space correctly for cases like "pfEmployee"
            return Constants.PF+ " " + fieldName.substring(2).replaceAll("([A-Z])", " $1").trim(); // Capitalize PF and adjust the rest
        } else if (fieldName.equalsIgnoreCase(Constants.TOTAL_DEDUCTION_SMALL)) {
            return Constants.TOTAL_DEDUCTION; // Special formatting for Total Deductions
        } else if (fieldName.equalsIgnoreCase(Constants.TOTAL_TAX_SMALL)) {
            return Constants.TOTAL_TAX; // Special formatting for Total Tax
        }

        // For other fields, convert camelCase to readable format
        String[] parts = fieldName.split("(?=[A-Z])"); // Split at capital letters
        StringBuilder formattedName = new StringBuilder();

        for (String part : parts) {
            formattedName.append(part.substring(0, 1).toUpperCase()) // Capitalize the first letter
                    .append(part.substring(1).toLowerCase()) // Lowercase the rest
                    .append(" "); // Add a space
        }

        return formattedName.toString().trim(); // Return the formatted name
    }


    private byte[] generatePdfFromHtml(String html) throws IOException {
        html = html.replaceAll("&(?![a-zA-Z]{2,6};|#\\d{1,5};)", "&amp;");
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(baos);
            return baos.toByteArray();
        } catch (DocumentException e) {
            throw new IOException(e.getMessage());
        }
    }



    @Override
    public ResponseEntity<?> generatePaySlipForEmployees(PayslipRequest payslipRequest) throws EmployeeException, IOException {
        String index = ResourceIdUtils.generateCompanyIndex(payslipRequest.getCompanyName());
        AttendanceEntity attendanceEntities = null;
        List<PayslipEntity> generatedPayslips = new ArrayList<>();
        List<String> employeesWithoutAttendance = new ArrayList<>();

        try {
            List<EmployeeEntity> employeeEntities = openSearchOperations.getCompanyEmployees(payslipRequest.getCompanyName());

            for (EmployeeEntity employee : employeeEntities) {
                List<EmployeeSalaryEntity> salaryEntities = openSearchOperations.getEmployeeSalaries(payslipRequest.getCompanyName(), employee.getId());
                if (salaryEntities == null ) {
                    log.error("Employee Salary with employeeId {} is not found", employee.getId());
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_SALARY),
                            HttpStatus.INTERNAL_SERVER_ERROR);
                }

                String attendanceId = ResourceIdUtils.generateAttendanceId(payslipRequest.getCompanyName(), employee.getId(), payslipRequest.getYear(), payslipRequest.getMonth());

                attendanceEntities = openSearchOperations.getAttendanceById(attendanceId, null, index);
                if (attendanceEntities == null) {
                    log.error("Employee Attendance is not found for employee {}", employee.getId());
                    employeesWithoutAttendance.add(employee.getId());
                    continue; // Skip to the next employee if attendance is not found
                }

                // Generate payslip ID based on month, year, and employee ID
                String paySlipId = ResourceIdUtils.generatePayslipId(payslipRequest.getMonth(), payslipRequest.getYear(), employee.getEmployeeId());

                // Check if payslip already exists for this employee
                PayslipEntity payslipEntity = openSearchOperations.getPayslipById(paySlipId, null, index);
                if (payslipEntity != null) {
                    log.error("Payslip already exists for employee with ID {}", employee.getEmployeeId());
                    continue; // Skip to the next employee if payslip already exists
                }

                // Generate and save payslip for the current employee
                List<PayslipEntity> payslipPropertiesList = new ArrayList<>();
                for (EmployeeSalaryEntity salary : salaryEntities) {
                    if (salary.getStatus().equals(EmployeeStatus.ACTIVE.getStatus())){
                        PayslipEntity payslipProperties = PayslipUtils.unMaskEmployeePayslipProperties(salary, payslipRequest, paySlipId, employee.getId(), attendanceEntities);
                        generatedPayslips.add(payslipProperties);
                        payslipPropertiesList.add(payslipProperties);
                    }
                }

            }

            // Return response with generated payslips and employees without attendance

        } catch (IOException | EmployeeException ex) {
            log.error("Error generating payslips: {}", ex.getMessage());
            throw ex; // Re-throw the caught exception for higher level handling

        } catch (Exception ex) {
            log.error("Unexpected error generating payslips: {}", ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_EMPLOYEE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put(Constants.GENERATE_PAYSLIP, generatedPayslips);
        responseBody.put(Constants.EMPLOYEE_WITHOUT_ATTENDANCE, employeesWithoutAttendance);
        if (generatedPayslips.size() == 0){
            log.error("attendance are not found for the employees {}", employeesWithoutAttendance);
            throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_GET_ATTENDANCE), employeesWithoutAttendance),
                    HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(responseBody), HttpStatus.CREATED);
    }


    public ResponseEntity<?> savePayslip(PayslipUpdateRequest payslipsRequest, String payslipId, String employeeId) throws EmployeeException {
        PayslipEntity payslipEntity = null;
        String index = ResourceIdUtils.generateCompanyIndex(payslipsRequest.getCompanyName());
        try{
            List<CompanyEntity> companyEntity = openSearchOperations.getCompanyByData(null, null, payslipsRequest.getCompanyName());
            if (companyEntity ==null){
                log.error("Company Details Are Not Exist{}", payslipsRequest.getCompanyName());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }catch (Exception ex){
            log.error("Company Details Are Not Exist{}", ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try {
            payslipEntity = openSearchOperations.getPayslipById(payslipId, null, index);
            if (payslipEntity != null) {
                log.error("Payslip already exists for employee with ID {}", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_PAYSLIP_ALREADY_EXISTS),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }

            PayslipEntity payslipProperties = PayslipUtils.maskEmployeePayslipUpdateProperties(payslipsRequest, payslipId, employeeId);
            openSearchOperations.saveEntity(payslipProperties, payslipId, index);
        }catch (Exception ex){
            log.error("Unexpected error generating payslips: {}", ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_EMPLOYEE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }
}