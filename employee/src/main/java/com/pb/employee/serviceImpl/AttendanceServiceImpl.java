
package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.DocumentException;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.AttendanceUpdateRequest;
import com.pb.employee.request.EmployeeStatus;
import com.pb.employee.response.EmployeeAttendanceResPayload;
import com.pb.employee.util.*;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.poi.ss.usermodel.*;
import com.pb.employee.request.AttendanceRequest;
import com.pb.employee.service.AttendanceService;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.util.StringUtils;
import org.xhtmlrenderer.pdf.ITextRenderer;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private  OpenSearchOperations openSearchOperations;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Configuration freemarkerConfig;

    private static final Map<String, Month> MONTH_NAME_MAP = createMonthNameMap();

    private static Map<String, Month> createMonthNameMap() {
        Map<String, Month> map = new HashMap<>();
        for (Month month : Month.values()) {
            map.put(month.name().substring(0, 1) + month.name().substring(1).toLowerCase(), month);
        }
        return map;
    }

    @Override
    public ResponseEntity<?> uploadAttendanceFile(String company, MultipartFile file) throws EmployeeException {
        if (file.isEmpty()) {
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_FILE), HttpStatus.BAD_REQUEST);
        }
        List<AttendanceRequest> attendanceRequests;

        try {
            attendanceRequests = parseExcelFile(file, company);
            if (attendanceRequests.isEmpty()) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().
                                createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                        .getMessage(EmployeeErrorMessageKey.EMPTY_FILE)))),
                        HttpStatus.NOT_FOUND);
            }
            // Validate all attendance requests before adding
            for (AttendanceRequest attendanceRequest : attendanceRequests) {
                String index = ResourceIdUtils.generateCompanyIndex(attendanceRequest.getCompany());

                // Validate Employee using employeeId or emailId
                String employeeId = ResourceIdUtils.generateEmployeeResourceId(attendanceRequest.getEmailId());
                EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeId, null, index);

                // If employee is not found, throw an error
                if (employee == null) {
                    log.error("Employee not found for attendance and ID: {}", employeeId);
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build().
                                    createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                            .getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND)))),
                            HttpStatus.NOT_FOUND);
                }
                // Skip adding attendance for "ASSOCIATE" employees
                if (employee.getEmployeeType().equals(Constants.ASSOCIATE)) {
                    log.info("Skipping attendance for Associate Type employee with ID: {}", employeeId);
                    continue;  // Skip this iteration and move to the next attendance request
                }

                LocalDate hiringDate = LocalDate.parse(employee.getDateOfHiring());
                YearMonth hiringMonthYear = YearMonth.from(hiringDate);  // Extract year and month from hiring date
                YearMonth attendanceMonthYear = YearMonth.of(
                        Integer.parseInt(attendanceRequest.getYear()),
                        MONTH_NAME_MAP.get(attendanceRequest.getMonth()).getValue()
                );
                // Check if the attendance date is before the hiring date
                if (attendanceMonthYear.isBefore(hiringMonthYear)) {
                    log.error("Attendance date is before the hiring date for employee ID: {}", employeeId);
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build().createFailureResponse(
                                    new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_HIRING_DATE)))),
                            HttpStatus.BAD_REQUEST);
                }

                String requestEmployeeId = attendanceRequest.getEmployeeId();
                log.debug("Received employee ID as a string: " + requestEmployeeId);

                // Validate firstName, lastName, and emailId
                if (!attendanceRequest.getFirstName().equalsIgnoreCase(employee.getFirstName()) ||
                        (attendanceRequest.getLastName() != null &&
                                !attendanceRequest.getLastName().equalsIgnoreCase(employee.getLastName())) ||
                        (!attendanceRequest.getLastName().isEmpty() &&
                                !employee.getLastName().isEmpty() &&
                                !attendanceRequest.getLastName().equalsIgnoreCase(employee.getLastName())) ||
                        !requestEmployeeId.equalsIgnoreCase(employee.getEmployeeId())) {

                    log.error("Validation failed for employee ID: {}. Details provided do not match.", employeeId);
                    return new ResponseEntity<>(ResponseBuilder.builder().build()
                            .createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                    .getMessage(EmployeeErrorMessageKey.INVALID_EMPLOYEE_DETAILS)))),
                            HttpStatus.BAD_REQUEST);
                }

                // Validate the number of working days
                int intworkingdays = Integer.parseInt(attendanceRequest.getNoOfWorkingDays());
                if (intworkingdays < 0) {
                    log.error("Invalid number of days");
                    return new ResponseEntity<>(ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_NO_DAYS)))),
                            HttpStatus.BAD_REQUEST);
                }

                // Validate employee status
                if (EmployeeStatus.INACTIVE.getStatus().equals(employee.getStatus())) {
                    log.error("The employee is inactive {}", employeeId);
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build().
                                    createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                            .getMessage(EmployeeErrorMessageKey.EMPLOYEE_INACTIVE)))),
                            HttpStatus.CONFLICT);
                }
            }
            // If all validations pass, add attendance
            for (AttendanceRequest attendanceRequest : attendanceRequests) {
                // Get current date information
                LocalDate now = LocalDate.now();
                int currentYear = now.getYear();
                int currentMonth = now.getMonthValue();
                int attendanceYear = Integer.parseInt(attendanceRequest.getYear());
                int attendanceMonth = MONTH_NAME_MAP.get(attendanceRequest.getMonth()).getValue();


                // Check if attendance is for the current month and year
                if (attendanceYear == currentYear && attendanceMonth == currentMonth) {
                    // If the current month, check if it's before or on the 25th
                    if (now.getDayOfMonth() <= 25) {
                        return new ResponseEntity<>(
                                ResponseBuilder.builder().build().
                                        createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                                .getMessage(EmployeeErrorMessageKey.INVALID_ATTENDANCE_DATE)))),
                                HttpStatus.NOT_FOUND
                        );
                    }
                }
                // Disallow future attendance
                else if (attendanceYear > currentYear || (attendanceYear == currentYear && attendanceMonth > currentMonth)) {
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build().
                                    createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                            .getMessage(EmployeeErrorMessageKey.INVALID_ATTENDANCE_DATE)))),
                            HttpStatus.NOT_FOUND
                    );
                }
                // Add attendance for past dates or current month after 25th
                addAttendanceOfEmployees(attendanceRequest);
            }
        }catch (EmployeeException employeeException){
            log.error("Exception while adding the attendance {}" , employeeException);
            throw employeeException;
        } catch (Exception e) {
            log.error("Error processing the uploaded file: {}", e.getMessage(), e);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_PROCESS), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        log.debug("The attendance added successfully...");
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> getAllEmployeeAttendance(String companyName, String employeeId, String month, String year) throws IOException, EmployeeException {
        List<AttendanceEntity> attendanceEntities;
        String index = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            // Validate if the year is provided
            if (employeeId != null && !employeeId.isEmpty()) {
                // Validate employee existence
                EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeId, null, index);
                if (employee == null) {
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                            HttpStatus.NOT_FOUND);
                }

                // Fetch attendance records for all employees for the specified year
                List<AttendanceEntity> allAttendanceEntities = openSearchOperations.getAttendanceByYear(companyName, null, year);

                // Filter the attendance records to find those for the specific
                // employee and month if provided
                attendanceEntities = allAttendanceEntities.stream()
                        .filter(attendance -> employeeId.equals(attendance.getEmployeeId()) &&
                                (month == null || month.isEmpty() || month.equals(attendance.getMonth())))
                        .collect(Collectors.toList());

                // If no attendance records are found for the specific employee
                if (attendanceEntities.isEmpty()) {
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_ATTENDANCE_FOUND),
                            HttpStatus.NOT_FOUND);
                }

            } else {
                // If employeeId is not provided, fetch attendance for all employees in the company for the given year/month
                if (month != null && !month.isEmpty()) {
                    attendanceEntities = openSearchOperations.getAttendanceByMonthAndYear(companyName, null, month, year);
                } else {
                    attendanceEntities = openSearchOperations.getAttendanceByYear(companyName, null, year);
                }
            }

            // Check if the attendanceEntities list is empty, implying no records were found
            if (attendanceEntities == null || attendanceEntities.isEmpty()) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_ATTENDANCE_FOUND),
                        HttpStatus.NOT_FOUND);
            }

            // Unmask sensitive properties if required
            if (attendanceEntities != null) {
                for (AttendanceEntity attendanceEntity : attendanceEntities) {
                    CompanyUtils.unMaskAttendanceProperties(attendanceEntity);
                }
            }
            // Return success response with the retrieved attendance records
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(attendanceEntities), HttpStatus.OK);
        }catch (EmployeeException employeeException) {
            log.error("Exception While Fetching attendance");
        throw employeeException;

        } catch (Exception ex) {
            log.error("Exception while fetching attendance for employees in company {}: {}", companyName, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_GET_ATTENDANCE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> deleteEmployeeAttendanceById(String companyName, String employeeId, String attendanceId) throws EmployeeException {
        String index = ResourceIdUtils.generateCompanyIndex(companyName);

        try {
            // Fetch attendance and payslips in parallel if supported by your operations
            AttendanceEntity entity = openSearchOperations.getAttendanceById(attendanceId, null, index);

            if (entity == null) {
                log.error("Exception while fetching employee for the attendance {}", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }

            if (!entity.getEmployeeId().equals(employeeId)) {
                log.error("Employee ID mismatch for attendance {}: expected {}, found", attendanceId, employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // Fetch payslips only if the attendance entity is valid
            List<PayslipEntity> payslipEntities = openSearchOperations.getEmployeePayslip(companyName, employeeId, null, null);
            Set<String> attendanceIdsInPayslips = payslipEntities.stream()
                    .map(PayslipEntity::getAttendanceId)
                    .collect(Collectors.toSet());

            // Check if the attendance ID exists in payslips
            if (attendanceIdsInPayslips.contains(attendanceId)) {
                return ResponseEntity.badRequest()
                        .body(ResponseBuilder.builder().build()
                                .createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                        .getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_ATTENDANCE)))));
            }

            // Proceed to delete attendance
            openSearchOperations.deleteEntity(attendanceId, index);
        } catch (EmployeeException ex) {
            log.error("Business logic exception while deleting attendance for employees {}: {}", attendanceId, ex.getMessage());
            throw ex; // Re-throw specific exceptions
        } catch (Exception ex) {
            log.error("Exception while deleting attendance for employees {}: {}", attendanceId, ex.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_ATTENDANCE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseEntity.ok(ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED));
    }

    @Override
    public ResponseEntity<?> updateEmployeeAttendanceById(String company, String employeeId, String attendanceId, AttendanceUpdateRequest updateRequest) throws EmployeeException{
        String index = ResourceIdUtils.generateCompanyIndex(company);
        AttendanceEntity entity = null;
        try {
            entity = openSearchOperations.getAttendanceById(attendanceId, null, index);
            if (entity==null){
                log.error("Exception while fetching employee for attendance {}", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_ATTENDANCE),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (!entity.getEmployeeId().equals(employeeId)) {
                log.error("Employee ID mismatch for attendance details {}: expected {}, found", attendanceId, employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            int numberOfDays = Integer.parseInt(updateRequest.getNoOfWorkingDays());
            if (numberOfDays<0){
                log.error("Invalid no. of days");
                return new ResponseEntity<>(ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_NO_DAYS)))),
                        HttpStatus.BAD_REQUEST);
            }
            String decodedWorkingDays = new String(Base64.getDecoder().decode(String.valueOf(entity.getNoOfWorkingDays())), StandardCharsets.UTF_8);
            if (String.valueOf(numberOfDays).equals(decodedWorkingDays)){
                return new ResponseEntity<>(ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_CHANGE_IN_WORKING_DAYS)))),
                        HttpStatus.BAD_REQUEST);

            }
            // Fetch payslips only if the attendance entity is valid
            List<PayslipEntity> payslipEntities = openSearchOperations.getEmployeePayslip(company, employeeId, null, null);
            Set<String> attendanceIdsInPayslips = payslipEntities.stream()
                    .map(PayslipEntity::getAttendanceId)
                    .collect(Collectors.toSet());

            // Check if the attendance ID exists in payslips
            if (attendanceIdsInPayslips.contains(attendanceId)) {
                return ResponseEntity.badRequest()
                        .body(ResponseBuilder.builder().build()
                                .createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler
                                        .getMessage(EmployeeErrorMessageKey.UNABLE_UPDATE_ATTENDANCE)))));
            }
        } catch (Exception ex) {
            log.error("Exception while fetching user {}:", employeeId, ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_ATTENDANCE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        Entity employeeAttendance = CompanyUtils.maskAttendanceUpdateProperties(updateRequest, entity);
        openSearchOperations.saveEntity(employeeAttendance, attendanceId, index);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    private List<AttendanceRequest> parseExcelFile(MultipartFile file, String company) throws Exception {
        List<AttendanceRequest> attendanceRequests = new ArrayList<>();
        String fileName = file.getOriginalFilename();

        if (fileName != null && (fileName.endsWith(".xls") || fileName.endsWith(".xlsx"))) {
            try (InputStream excelIs = file.getInputStream()) {
                log.info("Successfully opened input stream for file: {}", fileName);
                Workbook wb = null;
                try {
                    wb = new XSSFWorkbook(excelIs);
                } catch (Exception e) {
                    log.error("Failed to create workbook for file: {}", e.getMessage(), e);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_CREATE), HttpStatus.INTERNAL_SERVER_ERROR);
                }

                Sheet sheet = wb.getSheetAt(0);
                log.info("Successfully retrieved sheet: '{}', with {} rows.", sheet.getSheetName(), sheet.getPhysicalNumberOfRows());
                Iterator<Row> rowIt = sheet.rowIterator();

                if (!rowIt.hasNext()) {
                    log.warn("No rows found in the sheet '{}'", sheet.getSheetName());
                }


                while (rowIt.hasNext()) {
                    Row currentRow = rowIt.next();
                    log.info("Processing row number: {}", currentRow.getRowNum());

                    if (currentRow.getRowNum() == 0) {
                        log.info("Skipping header row.");
                        continue;
                    }

                    // Check for empty critical cells
                    if (StringUtils.isEmptyOrWhitespace(getCellValue(currentRow.getCell(0))) ||
                            StringUtils.isEmptyOrWhitespace(getCellValue(currentRow.getCell(1))) ||
                            StringUtils.isEmptyOrWhitespace(getCellValue(currentRow.getCell(2))) ||
                            StringUtils.isEmptyOrWhitespace(getCellValue(currentRow.getCell(3))) ||
                            StringUtils.isEmptyOrWhitespace(getCellValue(currentRow.getCell(4))) ||
                            StringUtils.isEmptyOrWhitespace(getCellValue(currentRow.getCell(5))) ||
                            StringUtils.isEmptyOrWhitespace(getCellValue(currentRow.getCell(6)))) {

                        log.warn("Skipping row {} as one or more critical cells are empty", currentRow.getRowNum());
                        continue;
                    }

                    AttendanceRequest attendanceRequest = new AttendanceRequest();
                    attendanceRequest.setCompany(company);
                    attendanceRequest.setEmployeeId(getCellValue(currentRow.getCell(0)));
                    attendanceRequest.setFirstName(getCellValue(currentRow.getCell(1)));
                    attendanceRequest.setLastName(getCellValue(currentRow.getCell(2)));
                    attendanceRequest.setEmailId(getCellValue(currentRow.getCell(3)));

                    Month month = MONTH_NAME_MAP.get(getCellValue(currentRow.getCell(4)));
                    String year = getCellValue(currentRow.getCell(5));

                    if (month == null) {
                        log.error("Invalid month name provided: {}", month);
                        throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_MONTH_NAME), HttpStatus.BAD_REQUEST);
                    }

                    attendanceRequest.setMonth(getCellValue(currentRow.getCell(4)));
                    attendanceRequest.setYear(year);

                    YearMonth yearMonth = YearMonth.of(Integer.parseInt(year), month);
                    int totalDaysInMonth = yearMonth.lengthOfMonth();

                    // Validate current month and attendance date
                    // Validate noOfWorkingDays
                    String noOfWorkingDaysStr = getCellValue(currentRow.getCell(6));
                    int noOfWorkingDays;
                    try {
                        double noOfWorkingDaysDouble = Double.parseDouble(noOfWorkingDaysStr);
                        noOfWorkingDays = (int) Math.round(noOfWorkingDaysDouble);
                        if (noOfWorkingDays > totalDaysInMonth) {
                            log.error("No of working days '{}' exceeds total days in the month '{}'", noOfWorkingDays, totalDaysInMonth);
                            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_NO_OF_WORKING_DAYS), HttpStatus.BAD_REQUEST);
                        }
                        attendanceRequest.setTotalWorkingDays(String.valueOf(totalDaysInMonth));
                        attendanceRequest.setNoOfWorkingDays(String.valueOf(noOfWorkingDays));
                    } catch (NumberFormatException e) {
                        log.error("Error parsing numeric values for working days: {}", e.getMessage());
                        throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NUMBER_EXCEPTION), HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                    attendanceRequests.add(attendanceRequest);
                    log.info("Added attendance request for employee ID: {}", attendanceRequest.getEmployeeId());
                }
                wb.close();
            } catch (IOException e) {
                log.error("Failed to process file: {}", e.getMessage(), e);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_PROCESS), HttpStatus.CONFLICT);
            }
        } else {
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_FORMAT), HttpStatus.BAD_REQUEST);
        }
        return attendanceRequests;
    }
    private String getCellValue(Cell cell) {
        if (cell == null) {
            return "";
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                // Format numeric values to remove decimal points if they are integers
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double numericValue = cell.getNumericCellValue();
                    if (numericValue == (int) numericValue) {
                        return String.valueOf((int) numericValue); // Remove decimal point for whole numbers
                    } else {
                        return String.valueOf(numericValue);
                    }
                }
            default:
                return "";
        }
    }

    private ResponseEntity<?> addAttendanceOfEmployees(AttendanceRequest attendanceRequest) throws EmployeeException, IOException {
        log.debug("Attendance adding method is started ..");
        String index = ResourceIdUtils.generateCompanyIndex(attendanceRequest.getCompany());
        String employeeId = ResourceIdUtils.generateEmployeeResourceId(attendanceRequest.getEmailId());
        EmployeeEntity employee = null;

        try {
            // Fetch the employee details
            employee = openSearchOperations.getEmployeeById(employeeId, null, index);

            if (employee == null) {
                log.error("Employee not found for ID: {}", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES),
                        HttpStatus.NOT_FOUND);
            }
            // Generate attendance ID and check if it already exists
            String attendanceId = ResourceIdUtils.generateAttendanceId(attendanceRequest.getCompany(), employee.getId(), attendanceRequest.getYear(), attendanceRequest.getMonth());
            Object object = openSearchOperations.getById(attendanceId, null, index);

            if (object != null) {
                log.error("Attendance ID already exists {}", attendanceId);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.ATTENDANCE_ALREADY_EXISTS), attendanceRequest.getMonth()),
                        HttpStatus.NOT_ACCEPTABLE);
            }
            // Create and save the new AttendanceEntity
            Entity attendanceEntity = CompanyUtils.maskAttendanceProperties(attendanceRequest, attendanceId, employeeId);
            openSearchOperations.saveEntity(attendanceEntity, attendanceId, index);

        }catch (EmployeeException e){
            log.error("Unable to save the employee attendance details");
            throw e;
        } catch (Exception exception) {
            log.error("Unable to save the employee attendance details {} {}", attendanceRequest.getType(), exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_SAVE_ATTENDANCE),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    private boolean isAttendancePeriodValid(String year, String month) {
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        // Parse the provided year and month into LocalDate
        int yearInt = Integer.parseInt(year);
        Month attendanceMonth = Month.valueOf(month.toUpperCase());

        // Calculate the start and end date for attendance (25th of the current month to 15th of the next month)
        if (attendanceMonth == Month.DECEMBER) {
            // If it's December, the next month will be January of the next year
            startDate = LocalDate.of(yearInt, Month.DECEMBER, 25);
            endDate = LocalDate.of(yearInt + 1, Month.JANUARY, 15);
        } else if (attendanceMonth == Month.JANUARY) {
            // If it's January, the previous month is December of the previous year
            startDate = LocalDate.of(yearInt - 1, Month.DECEMBER, 25);
            endDate = LocalDate.of(yearInt, Month.JANUARY, 15);
        } else {
            // For other months, calculate the start and end dates normally
            startDate = LocalDate.of(yearInt, attendanceMonth, 25);
            endDate = LocalDate.of(yearInt, attendanceMonth.plus(1), 15);
        }
        // Check if the current date is within the valid range
        return !now.isBefore(startDate) && !now.isAfter(endDate);
    }


    @Override
    public ResponseEntity<byte[]> downloadEmployeeAttendance(String companyName, String month, String year, String employeeId, String format, HttpServletRequest request) throws Exception {
        byte[] fileBytes = null;
        HttpHeaders headers = new HttpHeaders();
        try {

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Company is not found");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            SSLUtil.disableSSLVerification();
            CompanyUtils.unmaskCompanyProperties(companyEntity, request);
            List<EmployeeAttendanceResPayload> employeeAttendanceResPayloads =  validateEmployeesAttendance(companyName, month, year, employeeId);


            if (Constants.EXCEL_TYPE.equalsIgnoreCase(format)) {
                if (employeeId != null && !employeeId.isEmpty()) {
                    fileBytes = generateExcelFromSingleEmployeesAttendance(employeeAttendanceResPayloads);
                    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM); // For Excel download
                    headers.setContentDisposition(ContentDisposition.builder("attachment")
                            .filename(employeeAttendanceResPayloads.getFirst().getFirstName()+"_"+employeeAttendanceResPayloads.getFirst().getLastName()+"_"+"AttendanceDetails.xlsx")
                            .build());
                }else {
                    fileBytes = generateExcelFromEmployeesAttendance(employeeAttendanceResPayloads);
                    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM); // For Excel download
                    headers.setContentDisposition(ContentDisposition.builder("attachment")
                            .filename("employeeAttendanceDetails.xlsx")
                            .build());

                }

            } else if (Constants.PDF_TYPE.equalsIgnoreCase(format)) {

                fileBytes = generateEmployeesAttendancePdf(employeeAttendanceResPayloads, employeeId, companyEntity);
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDisposition(ContentDisposition.builder("attachment").filename("employeeAttendanceDetails.pdf").build());
            }

        } catch (EmployeeException e) {
            log.error("Exception while downloading the Employee details: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while processing the employee details: {}", e.getMessage());
            throw new IOException("Error generating certificate", e);
        }

        return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
    }

    private byte[] generateExcelFromSingleEmployeesAttendance(List<EmployeeAttendanceResPayload> employeeAttendanceResPayloads)  throws IOException {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Employees");
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Month", "Year", "TotalWorkingDays", "NoOfWorkingDays", "NoOfLeaves"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                CellStyle headerCellStyle = workbook.createCellStyle();
                headerCellStyle.setFont(headerFont);
                cell.setCellStyle(headerCellStyle);
            }
            int rowNum = 1;
            for (EmployeeAttendanceResPayload attendanceResPayload : employeeAttendanceResPayloads) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(attendanceResPayload.getMonth());
                row.createCell(1).setCellValue(attendanceResPayload.getYear());
                row.createCell(2).setCellValue(attendanceResPayload.getTotalWorkingDays());
                row.createCell(3).setCellValue(attendanceResPayload.getNoOfWorkingDays());
                row.createCell(4).setCellValue(attendanceResPayload.getLeaves());
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) * 2); // Adjust the multiplier as needed
            }

            workbook.write(baos);
            return baos.toByteArray();
        }
    }


    private byte[] generateExcelFromEmployeesAttendance(List<EmployeeAttendanceResPayload> resPayloads) throws IOException {

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Employees");
            Row headerRow = sheet.createRow(0);
            String[] headers = {"FirstName", "LastName", "EmployeeId", "Month", "Year", "TotalWorkingDays", "NoOfWorkingDays", "NoOfLeaves"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                CellStyle headerCellStyle = workbook.createCellStyle();
                headerCellStyle.setFont(headerFont);
                cell.setCellStyle(headerCellStyle);
            }
            int rowNum = 1;
            for (EmployeeAttendanceResPayload attendanceResPayload : resPayloads) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(attendanceResPayload.getFirstName());
                row.createCell(1).setCellValue(attendanceResPayload.getLastName());
                row.createCell(2).setCellValue(attendanceResPayload.getEmployeeCreatedId());
                row.createCell(3).setCellValue(attendanceResPayload.getMonth());
                row.createCell(4).setCellValue(attendanceResPayload.getYear());
                row.createCell(5).setCellValue(attendanceResPayload.getTotalWorkingDays());
                row.createCell(6).setCellValue(attendanceResPayload.getNoOfWorkingDays());
                row.createCell(7).setCellValue(attendanceResPayload.getLeaves());
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) * 2); // Adjust the multiplier as needed
            }

            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    private List<EmployeeAttendanceResPayload> validateEmployeesAttendance(String companyName, String month, String year, String employeeId) throws EmployeeException {
        try {
            List<EmployeeAttendanceResPayload> employeeAttendanceResPayloads = new ArrayList<>();
            List<AttendanceEntity> attendanceEntities = null;
            if (employeeId != null && !employeeId.isEmpty()) {
                attendanceEntities = openSearchOperations.getAttendanceByMonthAndYear(companyName, employeeId, null, null);
            }else if (month != null && year != null){
                attendanceEntities = openSearchOperations.getAttendanceByMonthAndYear(companyName, null, month, year);
            }
            if (attendanceEntities == null || attendanceEntities.isEmpty()) {
                log.error("Employees Attendance do not exist in the company");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_ATTENDANCE), HttpStatus.NOT_FOUND);
            }
            String index = ResourceIdUtils.generateCompanyIndex(companyName);
            for (AttendanceEntity attendanceEntity : attendanceEntities) {
                    CompanyUtils.unMaskAttendanceProperties(attendanceEntity);
                    EmployeeEntity employee = openSearchOperations.getEmployeeById(attendanceEntity.getEmployeeId(), null, index);
                    EmployeeAttendanceResPayload attendanceResPayload = objectMapper.convertValue(attendanceEntity, EmployeeAttendanceResPayload.class);
                    attendanceResPayload.setEmployeeCreatedId(employee.getEmployeeId());
                    attendanceResPayload.setLeaves(String.valueOf(Integer.parseInt(attendanceResPayload.getTotalWorkingDays())- Integer.parseInt(attendanceResPayload.getNoOfWorkingDays())));
                    employeeAttendanceResPayloads.add(attendanceResPayload);

            }
            return employeeAttendanceResPayloads;

        }catch (EmployeeException e){
            log.error("Exception while fetching the employee details");
            throw e;
        } catch (IOException e) {
           log.error("Exception while fetching the employee attendance details");
           throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES_ATTENDANCE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    private byte[] generatePdfFromHtml(String html) throws IOException {
        html = html.replaceAll("&(?![a-zA-Z]{2,6};|#\\d{1,5};)", "&amp;");  // Fix potential HTML issues

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

    private byte[] generateEmployeesAttendancePdf(List<EmployeeAttendanceResPayload> employeeEntities, String employeeId, CompanyEntity companyEntity) throws IOException, DocumentException {
        try {
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("templates/" + Constants.EMPLOYEE_DETAILS);
            if (inputStream == null) {
                throw new IOException("Template file not found: " + Constants.EMPLOYEE_DETAILS);
            }
            Template template = null;
            if (employeeId != null && !employeeId.isEmpty()) {
                template =  freemarkerConfig.getTemplate(Constants.SINGLE_EMPLOYEE_ATTENDANCE_DETAILS);
            } else {
                template =  freemarkerConfig.getTemplate(Constants.EMPLOYEE_ATTENDANCE_DETAILS);
            }

            Map<String, Object> dataModel = new HashMap<>();
            dataModel.put("data", employeeEntities);
            dataModel.put("company", companyEntity);

            addWatermarkToDataModel(dataModel, companyEntity);

            StringWriter stringWriter = new StringWriter();
            template.process(dataModel, stringWriter);
            String htmlContent = stringWriter.toString();
            return generatePdfFromHtml(htmlContent); // Return the byte array from generatePdfFromHtml
        } catch (IOException | EmployeeException | TemplateException e) {
            log.error("Error generating PDF: {}", e.getMessage());
            throw new IOException("Error generating PDF", e); // Re-throw the exception
        }
    }

    private void addWatermarkToDataModel(Map<String, Object> dataModel, CompanyEntity companyEntity) throws IOException, EmployeeException {
        String imageUrl = companyEntity.getImageFile();
        BufferedImage originalImage = ImageIO.read(new URL(imageUrl));
        if (originalImage == null) {
            log.error("Failed to load image from URL: {}", imageUrl);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_FILE), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        float opacity = 0.5f;
        double scaleFactor = 1.6d;
        BufferedImage watermarkedImage = CompanyUtils.applyOpacity(originalImage, opacity, scaleFactor, 30);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(watermarkedImage, "png", baos);
        String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());
        dataModel.put(Constants.BLURRED_IMAGE, Constants.DATA + base64Image);
    }
}