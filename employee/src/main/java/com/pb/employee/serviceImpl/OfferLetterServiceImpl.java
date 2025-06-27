package com.pb.employee.serviceImpl;

import com.itextpdf.text.DocumentException;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
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
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import java.time.LocalDate;
import java.util.*;

@Service
@Slf4j
public class OfferLetterServiceImpl implements OfferLetterService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private Configuration freeMarkerConfig;

    @Override
    public ResponseEntity<byte[]> downloadOfferLetter(OfferLetterRequest request, HttpServletRequest httpRequest) {
        try {
            SSLUtil.disableSSLVerification();

            CompanyEntity rawCompany = openSearchOperations.getCompanyById(request.getCompanyId(), null, Constants.INDEX_EMS);
            if (rawCompany == null)
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), request.getCompanyId()), HttpStatus.NOT_FOUND);

            Entity companyDetails = CompanyUtils.unmaskCompanyProperties(rawCompany, httpRequest);
            SalaryConfigurationEntity salaryConfig = openSearchOperations.getSalaryStructureById(request.getSalaryConfigurationId(), null, Constants.INDEX_EMS + "_" + rawCompany.getShortName());
            CompanyUtils.unMaskCompanySalaryStructureProperties(salaryConfig);

            if (salaryConfig == null || !Constants.ACTIVE.equals(salaryConfig.getStatus()))
                throw new EmployeeException("Salary configuration is not active or does not exist", HttpStatus.NOT_FOUND);

            Map<String, Object> model = new HashMap<>();
            model.put(Constants.COMPANY, companyDetails);
            model.put(Constants.OFFER_LETTER_REQUEST, request);
            model.put(Constants.SALARY, PayslipUtils.calculateSalaryComponents(salaryConfig, request.getSalaryPackage()));

            if (!request.isDraft()) {
                String imageUrl = rawCompany.getImageFile();
                BufferedImage image = ImageIO.read(new URL(imageUrl));
                if (image == null)
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_FILE), HttpStatus.INTERNAL_SERVER_ERROR);

                BufferedImage watermark = CompanyUtils.applyOpacity(image, 0.5f, 1.6d, 30);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(watermark, "png", baos);
                model.put(Constants.BLURRED_IMAGE, Constants.DATA + Base64.getEncoder().encodeToString(baos.toByteArray()));
            }

            // ✅ Save Offer Letter before generating PDF
            OfferLetterEntity entity = OfferLetterEntity.builder()
                    .companyId(request.getCompanyId())
                    .internName(request.getInternName())
                    .internEmail(request.getInternEmail())
                    .mobileNo(request.getMobileNo())
                    .designation(request.getDesignation())
                    .salaryPackage(request.getSalaryPackage())
                    .salaryConfigurationId(request.getSalaryConfigurationId())
                    .joiningDate(request.getJoiningDate())
                    .hrName(request.getHrName())
                    .hrEmail(request.getHrEmail())
                    .hrMobileNo(request.getHrMobileNo())
                    .draft(request.isDraft())
                    .createdDate(LocalDate.now().toString())
                    .build();

            openSearchOperations.saveEntity(entity, Constants.OFFER_LETTER_INDEX, "id");


            Template template = freeMarkerConfig.getTemplate(Constants.OFFER_LETTER_TEMPLATE1);
            StringWriter writer = new StringWriter();
            template.process(model, writer);

            byte[] pdf = generatePdfFromHtml(writer.toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder(Constants.ATTACHMENT).filename(Constants.OFFER_LETTER).build());

            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Error occurred while generating offer letter: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<byte[]> downloadInternShipOfferLetter(InternshipOfferLetterRequest req, HttpServletRequest httpReq) throws EmployeeException {
        try {
            SSLUtil.disableSSLVerification();

            CompanyEntity rawCompany = openSearchOperations.getCompanyById(req.getCompanyId(), null, Constants.INDEX_EMS);
            if (rawCompany == null)
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), req.getCompanyId()), HttpStatus.NOT_FOUND);

            Entity company = CompanyUtils.unmaskCompanyProperties(rawCompany, httpReq);

            LocalDate start = LocalDate.parse(req.getStartDate());
            LocalDate end = LocalDate.parse(req.getEndDate());

            if (!end.isAfter(start))
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.END_DATE_BEFORE_START_DATE), HttpStatus.BAD_REQUEST);
            if (Objects.equals(req.getHrMobileNo(), req.getMobileNo()))
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.MOBILE_NUMBER_MISMATCH), HttpStatus.BAD_REQUEST);
            if (Objects.equals(req.getHrEmail(), req.getInternEmail()))
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMAIL_ID_MISS_MATCH), HttpStatus.BAD_REQUEST);

            Map<String, Object> model = new HashMap<>();
            model.put(Constants.COMPANY, company);
            model.put(Constants.OFFER_LETTER_REQUEST, req);

            if (!req.isDraft()) {
                String imageUrl = rawCompany.getImageFile();
                BufferedImage image = ImageIO.read(new URL(imageUrl));
                if (image == null)
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_FILE), HttpStatus.INTERNAL_SERVER_ERROR);

                BufferedImage watermark = CompanyUtils.applyOpacity(image, 0.5f, 1.6d, 30);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(watermark, "png", baos);
                model.put(Constants.BLURRED_IMAGE, Constants.DATA + Base64.getEncoder().encodeToString(baos.toByteArray()));
            } else model.put(Constants.BLURRED_IMAGE, "");

            // ✅ Save internship offer letter before generating PDF
            OfferLetterEntity entity = OfferLetterEntity.builder()
                    .companyId(req.getCompanyId())
                    .internName(req.getInternName())
                    .internEmail(req.getInternEmail())
                    .mobileNo(req.getMobileNo())
                    .designation(req.getDesignation())
                    .joiningDate(req.getStartDate())
                    .hrName(req.getHrName())
                    .hrEmail(req.getHrEmail())
                    .hrMobileNo(req.getHrMobileNo())
                    .draft(req.isDraft())
                    .createdDate(LocalDate.now().toString())
                    .build();

            openSearchOperations.saveEntity(entity, Constants.OFFER_LETTER_INDEX, "id");

            Template template = freeMarkerConfig.getTemplate(Constants.INTERNSHIP_OFFER_LETTER_TEMPLATE);
            StringWriter writer = new StringWriter();
            template.process(model, writer);

            byte[] pdf = generatePdfFromHtml(writer.toString());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder(Constants.ATTACHMENT).filename(Constants.OFFER_LETTER).build());
            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);

        } catch (EmployeeException ex) {
            log.error("Business error: {}", ex.getMessage());
            throw ex;
        } catch (Exception e) {
            log.error("System error: {}", e.getMessage(), e);
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
