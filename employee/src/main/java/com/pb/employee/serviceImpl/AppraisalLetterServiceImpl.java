package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.DocumentException;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.AppraisalDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.model.ResourceType;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.AppraisalLetterRequest;
import com.pb.employee.request.AppraisalUpdateRequest;
import com.pb.employee.service.AppraisalLetterService;
import com.pb.employee.util.*;
import freemarker.template.Configuration;
import freemarker.template.Template;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@Slf4j
public class AppraisalLetterServiceImpl implements AppraisalLetterService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private Configuration freeMarkerConfig;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppraisalDao appraisalDao;

    @Override
    public ResponseEntity<byte[]> downloadAppraisalLetter(AppraisalLetterRequest appraisalLetterRequest, HttpServletRequest request) {
        CompanyEntity entity;
        Entity companyEntity;
        SalaryConfigurationEntity salaryConfiguration;
        EmployeeEntity employee;
        DepartmentEntity department;
        DesignationEntity designation;
        TemplateEntity templateNo ;

        try {

            SSLUtil.disableSSLVerification();

            // Fetch and validate the company
            entity = openSearchOperations.getCompanyById(appraisalLetterRequest.getCompanyId(), null, Constants.INDEX_EMS);
            if (entity == null) {
                log.error("Company not found: {}", appraisalLetterRequest.getCompanyId());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), appraisalLetterRequest.getCompanyId()), HttpStatus.NOT_FOUND);
            }
            companyEntity = CompanyUtils.unmaskCompanyProperties(entity, request);
            String index = ResourceIdUtils.generateCompanyIndex(entity.getShortName());
            templateNo=openSearchOperations.getCompanyTemplates(entity.getShortName());
            if (templateNo ==null){
                log.error("company templates are not exist ");
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_GET_TEMPLATE), entity.getShortName()),
                        HttpStatus.NOT_FOUND);
            }

            // Fetch and validate the salary configuration
            salaryConfiguration = openSearchOperations.getSalaryStructureById(appraisalLetterRequest.getSalaryConfigurationId(), null, index);
            if (salaryConfiguration == null || !Constants.ACTIVE.equals(salaryConfiguration.getStatus())) {
                log.error("Active salary configuration not found: {}", appraisalLetterRequest.getSalaryConfigurationId());
                throw new EmployeeException("Salary configuration is not active or does not exist", HttpStatus.NOT_FOUND);
            }
            CompanyUtils.unMaskCompanySalaryStructureProperties(salaryConfiguration);
            // Calculate salary components
            Map<String, Map<String, String>> salaryComponents = PayslipUtils.calculateSalaryYearlyComponents(salaryConfiguration, appraisalLetterRequest.getGrossCompensation());

            // Fetch and unmask employee, department, and designation information
            employee = openSearchOperations.getEmployeeById(appraisalLetterRequest.getEmployeeId(), null, index);
            department = openSearchOperations.getDepartmentById(employee.getDepartment(), null, index);
            designation = openSearchOperations.getDesignationById(employee.getDesignation(), null, index);
            EmployeeUtils.unmaskEmployeeProperties(employee, department, designation);

            // Prepare data model for FreeMarker template
            Map<String, Object> dataModel = new HashMap<>();
            dataModel.put(Constants.COMPANY, companyEntity);
            dataModel.put(Constants.SALARY, salaryComponents);
            dataModel.put(Constants.EMPLOYEE, employee);
            dataModel.put(Constants.APPRAISAL_LETTER_REQUEST, appraisalLetterRequest);

            if (!appraisalLetterRequest.isDraft()) {
                // Load and watermark company image
                String imageUrl = entity.getImageFile();
                BufferedImage originalImage = ImageIO.read(new URL(imageUrl));
                if (originalImage == null) {
                    log.error("Failed to load image from URL: {}", imageUrl);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_FILE),
                            HttpStatus.INTERNAL_SERVER_ERROR);
                }

                // Apply the watermark effect
                float opacity = 0.3f;
                double scaleFactor = 1.6d;
                BufferedImage watermarkedImage = CompanyUtils.applyOpacity(originalImage, opacity, scaleFactor, 30);
                // Convert BufferedImage to Base64 string for HTML
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(watermarkedImage, "png", baos);
                String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());
                dataModel.put(Constants.BLURRED_IMAGE, Constants.DATA + base64Image);
            }

            String templateName = switch (Integer.parseInt(templateNo.getAppraisalTemplateNo())) {
                case 1 -> Constants.APPRAISAL_LETTER_TEMPLATE1;
                case 2 -> Constants.APPRAISAL_LETTER_TEMPLATE2;
                default -> throw new IllegalArgumentException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_TEMPLATE_NUMBER));
            };
            // Process the FreeMarker template
            Template template = freeMarkerConfig.getTemplate(templateName);
            StringWriter stringWriter = new StringWriter();
            template.process(dataModel, stringWriter);

            // Convert processed HTML content to PDF
            String htmlContent = stringWriter.toString();
            byte[] pdfBytes = generatePdfFromHtml(htmlContent);

            try {
                String Id = ResourceIdUtils.generateAppraisalResourceId(appraisalLetterRequest.getDateOfSalaryIncrement());
                AppraisalEntity appraisalEntity = EmployeeUtils.maskAppraisalProperties(appraisalLetterRequest,Id,appraisalLetterRequest.getCompanyId(),appraisalLetterRequest.getEmployeeId());

                appraisalDao.save(appraisalEntity,entity.getShortName());
                log.info("Saved AppraisalEntity: {}", Id);
            } catch (Exception e) {
                log.error("Failed to save AppraisalEntity", e);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.APPRAISAL_IS_ALREADY_EXIST), HttpStatus.INTERNAL_SERVER_ERROR);
            }
            // Set HTTP headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder(Constants.ATTACHMENT).filename(Constants.APPRAISAL_LETTER).build());

            // Return the PDF as the HTTP response
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Error occurred while generating appraisal letter: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Collection<AppraisalEntity> getAppraisalLetter(String companyId,String employeeId) throws Exception {
        log.error("Method not implemented: getAppraisalLetter");
        CompanyEntity entity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
        if (entity == null) {
            log.error("Company not found: {}", companyId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }
        String index = ResourceIdUtils.generateCompanyIndex(entity.getShortName());
        EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeId, null, index);
        if (employee == null) {
            log.error("Employee not found: {}", employeeId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        Collection<AppraisalEntity> appraisalEntities = appraisalDao.getAppraisal(entity.getShortName(), employeeId, companyId);
        for (AppraisalEntity appraisalEntity : appraisalEntities) {
            EmployeeUtils.unmaskAppraisalProperties(appraisalEntity);
        }
        return appraisalEntities;
    }

    @Override
    public ResponseEntity<?> updateAppraisalLetter(String companyId, String employeeId, String Id, AppraisalUpdateRequest appraisalUpdateRequest) throws Exception {
        log.error("Method not implemented: updateAppraisalLetter");
        try {
            CompanyEntity entity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
            if (entity == null) {
                log.error("Company not found: {}", companyId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            String index = ResourceIdUtils.generateCompanyIndex(entity.getShortName());
            EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeId, null, index);
            if (employee == null) {
                log.error("Employee not found: {}", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            AppraisalEntity existingAppraisal = appraisalDao.getAppraisal(entity.getShortName(), employeeId, companyId)
                    .stream()
                    .filter(appraisal -> appraisal.getId().equals(Id))
                    .findFirst()
                    .orElse(null);
            if (existingAppraisal == null) {
                log.error("Appraisal not found with Id {} for employeeId {} in company {}", Id, employeeId, companyId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.APPRAISAL_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            // Unmask the existing appraisal properties
            existingAppraisal = EmployeeUtils.unmaskAppraisalProperties(existingAppraisal);
            // checking the update the fields done or not checking from db
            if (appraisalUpdateRequest.getDateOfSalaryIncrement().equals(existingAppraisal.getDateOfSalaryIncrement()) &&
                    appraisalUpdateRequest.getSalaryHikePersentage().equals(existingAppraisal.getGrossCompensation()) &&
                    appraisalUpdateRequest.getGrossCompensation().equals(existingAppraisal.getSalaryHikePersentage()) &&
                    appraisalUpdateRequest.getDate().equals(existingAppraisal.getDate())) {
                log.error("No changes done in the appraisal letter for employeeId {} in company {}", employeeId, companyId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_UPDATE_DONE_IN_APPRAISAL), HttpStatus.NOT_MODIFIED);
            }
            appraisalUpdateRequest = EmployeeUtils.maskAppraisalUpdateProperties(appraisalUpdateRequest);
            AppraisalEntity updatedAppraisal = objectMapper.convertValue(appraisalUpdateRequest, AppraisalEntity.class);
            BeanUtils.copyProperties(updatedAppraisal,existingAppraisal, getNullPropertyNames(updatedAppraisal));
            appraisalDao.update(existingAppraisal, entity.getShortName());
            log.info("Updated AppraisalEntity");

            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
        }catch (EmployeeException employeeException) {
            log.error("Error updating appraisal letter", employeeException);
            throw employeeException;
        } catch (Exception e) {
            log.error("Unexpected error occurred while updating appraisal letter: {}", e.getMessage(), e);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_UPDATE_APPRAISAL), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> deleteAppraisalLetter(String companyId, String employeeId, String Id) throws EmployeeException {
        log.info("Deleting appraisal letter for employeeId: {} in companyId: {}", employeeId, companyId);
        try{
            CompanyEntity entity = openSearchOperations.getCompanyById(companyId, null, Constants.INDEX_EMS);
            if (entity == null) {
                log.error("Company not found: {}", companyId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            String index = ResourceIdUtils.generateCompanyIndex(entity.getShortName());
            EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeId, null, index);
            if (employee == null) {
                log.error("Employee not found: {}", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            AppraisalEntity existingAppraisal = appraisalDao.getAppraisal(entity.getShortName(), employeeId, companyId)
                    .stream()
                    .filter(appraisal -> appraisal.getId().equals(Id))
                    .findFirst()
                    .orElse(null);
            if (existingAppraisal == null) {
                log.error("Appraisal not found with Id {} for employeeId {} in company {}", Id, employeeId, companyId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.APPRAISAL_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
                appraisalDao.delete(Id, entity.getShortName());
                log.info("Deleted AppraisalEntity: {}", Id);

            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
        } catch (EmployeeException e) {
            log.error("Error deleting appraisal letter: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while deleting appraisal letter: {}", e.getMessage(), e);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_APPRAISAL), HttpStatus.INTERNAL_SERVER_ERROR);
        }
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

    private static String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        Set<String> emptyNames = new HashSet<>();
        for (var pd : src.getPropertyDescriptors()) {
            Object value = src.getPropertyValue(pd.getName());
            if (value == null) {
                emptyNames.add(pd.getName());
            }
        }
        return emptyNames.toArray(new String[0]);
    }

}