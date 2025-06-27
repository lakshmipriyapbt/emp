package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.DocumentException;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.InternshipCertificateDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.model.ResourceType;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.InternshipCertificateUpdateRequest;
import com.pb.employee.request.InternshipRequest;
import com.pb.employee.service.InternshipService;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class InternshipServiceImpl implements InternshipService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private Configuration freeMarkerConfig;

    @Autowired
    private InternshipCertificateDao internshipDao;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public ResponseEntity<byte[]> downloadInternship(InternshipRequest internshipRequest, HttpServletRequest request) {

        CompanyEntity entity;
        Entity companyEntity;
        TemplateEntity templateNo;

        try {

            SSLUtil.disableSSLVerification();
            // Fetch and validate the company
            entity = openSearchOperations.getCompanyById(internshipRequest.getCompanyId(), null, Constants.INDEX_EMS);
            if (entity == null) {
                log.error("Company not found: {}", internshipRequest.getCompanyId());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), internshipRequest.getCompanyId()), HttpStatus.NOT_FOUND);
            }
            companyEntity = CompanyUtils.unmaskCompanyProperties(entity, request);

            LocalDate startDate = LocalDate.parse(internshipRequest.getStartDate());
            LocalDate endDate = LocalDate.parse(internshipRequest.getEndDate());

            if (!endDate.isAfter(startDate) && !startDate.equals(endDate)) {
                log.error("Invalid internship duration. End date {} is not after start date {}", endDate, startDate);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.END_DATE_BEFORE_START_DATE), HttpStatus.BAD_REQUEST);
            }

            templateNo=openSearchOperations.getCompanyTemplates(entity.getShortName());
            if (templateNo ==null){
                log.error("company templates are not exist ");
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_GET_TEMPLATE), entity.getCompanyName()),
                        HttpStatus.NOT_FOUND);
            }

            // Prepare data model for FreeMarker template
            Map<String, Object> dataModel = new HashMap<>();
            dataModel.put(Constants.COMPANY, companyEntity);
            dataModel.put(Constants.INTERNSHIP, internshipRequest);
            if (!internshipRequest.isDraft()) {
                // Load and watermark company image
                String imageUrl = entity.getImageFile();
                BufferedImage originalImage = ImageIO.read(new URL(imageUrl));
                if (originalImage == null) {
                    log.error("Failed to load image from URL: {}", imageUrl);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_FILE),
                            HttpStatus.INTERNAL_SERVER_ERROR);
                }

                // Apply the watermark effect
                float opacity = 0.1f;
                double scaleFactor = 1.6d;
                BufferedImage watermarkedImage = CompanyUtils.applyOpacity(originalImage, opacity, scaleFactor, 30);

                // Convert BufferedImage to Base64 string for HTML
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(watermarkedImage, "png", baos);
                String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());
                dataModel.put(Constants.BLURRED_IMAGE, Constants.DATA + base64Image);
            }
            // Choose the template based on the template number
            String templateName = switch (Integer.parseInt(templateNo.getInternshipTemplateNo())) {
                case 1 -> Constants.INTERNSHIP_TEMPLATE1;
                case 2 -> Constants.INTERNSHIP_TEMPLATE2;
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
                LocalDateTime currentDateTime = LocalDateTime.now();
                String timestamp = currentDateTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
                String internshipId = ResourceIdUtils.generateInternshipCertificateResourceId(internshipRequest.getEmployeeName(), timestamp);

                InternshipCertificateEntity internshipCertificateEntity = objectMapper.convertValue(internshipRequest, InternshipCertificateEntity.class);
                internshipCertificateEntity.setId(internshipId);
                internshipCertificateEntity.setCompanyId(internshipRequest.getCompanyId());
                internshipCertificateEntity.setType(ResourceType.INTERNSHIP_CERTIFICATE.value());
                internshipDao.save(internshipCertificateEntity, entity.getShortName());
                log.info("Saved Internship Certificate: {}", internshipId);

            } catch (Exception e) {
                log.error("Failed to save Internship Certificate Entity", e);
            }

            // Set HTTP headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder(Constants.ATTACHMENT).filename(Constants.INTERNSHIP_CERT).build());

            // Return the PDF as the HTTP response
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Error occurred while generating internship certificate: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Collection<InternshipCertificateEntity> getInternshipCertificates(String companyName, String internshipId) throws EmployeeException {
        try {
            log.debug("Fetching company entity for companyName: {}", companyName);
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for companyName: {}", companyName);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Fetching internship certificate(s) for internshipId: {} in company: {}", internshipId, companyName);
            return internshipDao.getInternshipCertificate(companyName, internshipId);

        } catch (EmployeeException e) {
            log.error("EmployeeException while fetching internship certificates: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while fetching internship certificates for companyName: {} and internshipId: {}", companyName, internshipId, e);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INTERNSHIP_NOT_FOUND), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Override
    public ResponseEntity<?> updateInternshipCertificate(String companyName, String internshipId, InternshipCertificateUpdateRequest internshipCertificateUpdateRequest)
            throws EmployeeException, IOException {

        try {
            log.debug("Validating internship certificate existence for internshipId: {} in companyName: {}", internshipId, companyName);

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for companyName: {}", companyName);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<InternshipCertificateEntity> internshipCertificates = internshipDao.getInternshipCertificate(companyName, internshipId);
            InternshipCertificateEntity existingInternship = internshipCertificates.stream().findFirst().orElse(null);

            if (existingInternship == null) {
                log.error("Internship certificate not found for internshipId: {}", internshipId);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INTERNSHIP_NOT_FOUND), internshipId), HttpStatus.NOT_FOUND);
            }

            LocalDate startDate = LocalDate.parse(internshipCertificateUpdateRequest.getStartDate());
            LocalDate endDate = LocalDate.parse(internshipCertificateUpdateRequest.getEndDate());

            if (!endDate.isAfter(startDate) && !startDate.equals(endDate)) {
                log.error("Invalid internship duration. End date {} is not after start date {}", endDate, startDate);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.END_DATE_BEFORE_START_DATE), HttpStatus.BAD_REQUEST);
            }

            boolean isSame = Objects.equals(existingInternship.getStartDate(), internshipCertificateUpdateRequest.getStartDate()) &&
                    Objects.equals(existingInternship.getEndDate(), internshipCertificateUpdateRequest.getEndDate()) &&
                    Objects.equals(existingInternship.getDate(), internshipCertificateUpdateRequest.getDate()) &&
                    Objects.equals(existingInternship.getDepartment(), internshipCertificateUpdateRequest.getDepartment()) &&
                    Objects.equals(existingInternship.getDesignation(), internshipCertificateUpdateRequest.getDesignation());

            if (isSame) {
                log.warn("No changes detected for internship certificate of internshipId: {}", internshipId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_UPDATE_DONE), HttpStatus.BAD_REQUEST);
            }

            InternshipCertificateEntity updatedInternship = objectMapper.convertValue(internshipCertificateUpdateRequest, InternshipCertificateEntity.class);
            BeanUtils.copyProperties(updatedInternship, existingInternship, getNullPropertyNames(updatedInternship));

            internshipDao.update(existingInternship, companyEntity.getShortName());
            log.info("Internship certificate updated successfully for internshipId: {}", internshipId);

            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);

        } catch (EmployeeException e) {
            log.error("EmployeeException while updating internship certificate: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating internship certificate for employeeId {}: {}", internshipId, e.getMessage(), e);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_UPDATE_INTERNSHIP_CERTIFICATE), HttpStatus.INTERNAL_SERVER_ERROR);
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

    private String[] getNullPropertyNames(Object source) {
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