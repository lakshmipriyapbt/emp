package com.pb.employee.serviceImpl;

import com.itextpdf.text.DocumentException;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.CompanyEntity;
import com.pb.employee.persistance.model.Entity;
import com.pb.employee.persistance.model.PayslipEntity;
import com.pb.employee.persistance.model.SalaryConfigurationEntity;
import com.pb.employee.request.InternshipOfferLetterRequest;
import com.pb.employee.request.OfferLetterRequest;
import com.pb.employee.service.OfferLetterService;
import com.pb.employee.util.*;
import freemarker.template.Configuration;
import freemarker.template.Template;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.List;

@Service
@Slf4j
public class OfferLetterServiceImpl implements OfferLetterService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private Configuration freeMarkerConfig;

    @Override
    public ResponseEntity<byte[]> downloadOfferLetter(OfferLetterRequest offerLetterRequest, HttpServletRequest request) {
        CompanyEntity entity;
        Entity companyEntity;
        SalaryConfigurationEntity salaryConfiguration;
        try {
            SSLUtil.disableSSLVerification();
            // Fetch companyEntity by companyId
            entity = openSearchOperations.getCompanyById(offerLetterRequest.getCompanyId(), null, Constants.INDEX_EMS);
            if (entity == null) {
                log.error("Company not found: {}", offerLetterRequest.getCompanyId());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), offerLetterRequest.getCompanyId()), HttpStatus.NOT_FOUND);
            }
            companyEntity = CompanyUtils.unmaskCompanyProperties(entity,request);
            salaryConfiguration =  openSearchOperations.getSalaryStructureById(offerLetterRequest.getSalaryConfigurationId(),null,Constants.INDEX_EMS+"_"+entity.getShortName());
            CompanyUtils.unMaskCompanySalaryStructureProperties(salaryConfiguration);
            Map<String, Map<String, String>> salaryComponents = PayslipUtils.calculateSalaryComponents(salaryConfiguration,offerLetterRequest.getSalaryPackage());

            // Check if the salary configuration is active
            if (salaryConfiguration==null || !salaryConfiguration.getStatus().equals(Constants.ACTIVE)) {
                log.error("Active salary configuration not found: {}", offerLetterRequest.getSalaryConfigurationId());
                throw new EmployeeException("Salary configuration is not active or does not exist", HttpStatus.NOT_FOUND);
            }
            // Prepare the data model for FreeMarker template
            Map<String, Object> dataModel = new HashMap<>();
            dataModel.put(Constants.COMPANY, companyEntity);
            dataModel.put(Constants.OFFER_LETTER_REQUEST, offerLetterRequest);
            dataModel.put(Constants.SALARY, salaryComponents);

            // Determine if it's a draft and include that in the model
            boolean isDraft = offerLetterRequest.getDraft() != null && offerLetterRequest.getDraft();
            dataModel.put("draft", isDraft); // Add draft condition to data model

            // Load the company image from a URL
            String imageUrl = entity.getImageFile();
            BufferedImage originalImage = ImageIO.read(new URL(imageUrl));
            if (originalImage == null) {
                log.error("Failed to load image from URL: {}", imageUrl);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_FILE),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            // Apply the watermark effect
            float opacity = 0.5f;
            double scaleFactor = 1.6d;
            BufferedImage watermarkedImage = CompanyUtils.applyOpacity(originalImage, opacity, scaleFactor, 30);

            // Convert BufferedImage to Base64 string for HTML
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(watermarkedImage, "png", baos);
            String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());
            dataModel.put(Constants.BLURRED_IMAGE, Constants.DATA + base64Image);
            // Get FreeMarker template and process it with the dataModel
            Template template = freeMarkerConfig.getTemplate(Constants.OFFER_LETTER_TEMPLATE1);
            StringWriter stringWriter = new StringWriter();

            try {
                // Process the template with the data model
                template.process(dataModel, stringWriter);
            } catch (Exception e) {
                log.error("Exception occurred while processing the offer letter: {}", e.getMessage(), e);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_PROCESS),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            // Get the processed HTML content
            String htmlContent = stringWriter.toString();
            // Convert the HTML content to PDF
            byte[] pdfBytes = generatePdfFromHtml(htmlContent);
            // Set HTTP headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder(Constants.ATTACHMENT)
                    .filename(Constants.OFFER_LETTER)
                    .build());

            // Return the PDF as the HTTP response
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Error occurred while generating offer letter: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<byte[]> downloadInternShipOfferLetter(InternshipOfferLetterRequest internshipOfferLetterRequest, HttpServletRequest request) throws EmployeeException {
        CompanyEntity entity;
        Entity companyEntity;
        try {
            SSLUtil.disableSSLVerification();
            // Fetch companyEntity by companyId
            entity = openSearchOperations.getCompanyById(internshipOfferLetterRequest.getCompanyId(), null, Constants.INDEX_EMS);
            if (entity == null) {
                log.error("Company not found: {}", internshipOfferLetterRequest.getCompanyId());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), internshipOfferLetterRequest.getCompanyId()), HttpStatus.NOT_FOUND);
            }
            companyEntity = CompanyUtils.unmaskCompanyProperties(entity, request);

            LocalDate startDate;
            LocalDate endDate;
            startDate = LocalDate.parse(internshipOfferLetterRequest.getStartDate());
            endDate = LocalDate.parse(internshipOfferLetterRequest.getEndDate());

            if (!endDate.isAfter(startDate) && startDate != endDate) {
                log.error("End Date {} can't be same as or before Start Date {}", internshipOfferLetterRequest.getEndDate(), internshipOfferLetterRequest.getStartDate());
                throw new EmployeeException(
                        ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.END_DATE_BEFORE_START_DATE),
                        HttpStatus.BAD_REQUEST
                );
            }

            if(internshipOfferLetterRequest.getHrMobileNo() .equals( internshipOfferLetterRequest.getMobileNo())){
                log.error("Mobile number {}  HrMobile number can't be same {}",internshipOfferLetterRequest.getMobileNo(),internshipOfferLetterRequest.getHrMobileNo());
                throw new EmployeeException(ErrorMessageHandler.getMessage((EmployeeErrorMessageKey.MOBILE_NUMBER_MISMATCH)),
                        HttpStatus.BAD_REQUEST);
            }
            if(internshipOfferLetterRequest.getHrEmail() .equals(internshipOfferLetterRequest.getInternEmail())){
                log.error("HrEmail {} internEmail can't be same{}",internshipOfferLetterRequest.getHrEmail(),internshipOfferLetterRequest.getInternEmail());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMAIL_ID_MISS_MATCH),
                        HttpStatus.BAD_REQUEST);
            }

            // Prepare the data model for FreeMarker template
            Map<String, Object> dataModel = new HashMap<>();
            dataModel.put(Constants.COMPANY, companyEntity);
            dataModel.put(Constants.OFFER_LETTER_REQUEST, internshipOfferLetterRequest);

            // Load the company image from a URL
            String imageUrl = entity.getImageFile();
            BufferedImage originalImage = ImageIO.read(new URL(imageUrl));
            if (originalImage == null) {
                log.error("Failed to load image from URL: {}", imageUrl);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_FILE),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            // Apply the watermark effect
            float opacity = 0.5f;
            double scaleFactor = 1.6d;
            BufferedImage watermarkedImage = CompanyUtils.applyOpacity(originalImage, opacity, scaleFactor, 30);

            // Convert BufferedImage to Base64 string for HTML
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(watermarkedImage, "png", baos);
            String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());
            dataModel.put(Constants.BLURRED_IMAGE, Constants.DATA + base64Image);
            // Get FreeMarker template and process it with the dataModel
            Template template = freeMarkerConfig.getTemplate(Constants.INTERNSHIP_OFFER_LETTER_TEMPLATE);
            StringWriter stringWriter = new StringWriter();

            try {
                // Process the template with the data model
                template.process(dataModel, stringWriter);
            } catch (Exception e) {
                log.error("Exception occurred while processing the internShip offer letter: {}", e.getMessage(), e);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_PROCESS),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
            // Get the processed HTML content
            String htmlContent = stringWriter.toString();
            // Convert the HTML content to PDF
            byte[] pdfBytes = generatePdfFromHtml(htmlContent);
            // Set HTTP headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder(Constants.ATTACHMENT)
                    .filename(Constants.OFFER_LETTER)
                    .build());

            // Return the PDF as the HTTP response
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (EmployeeException exception) {
            log.error("Exception occurred while generating InternShip offer latter{}", exception.getMessage());
            throw exception;

        } catch (Exception e) {
            log.error("Error occurred while generating InterShip offer letter: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
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
}