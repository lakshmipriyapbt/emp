package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.DocumentException;
import com.pb.employee.dao.InternOfferLetterDao;
import com.pb.employee.dao.OfferLetterDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
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

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OfferLetterDao offerLetterDao;

    @Autowired
    private InternOfferLetterDao internOfferLetterDao;

    @Override
    public ResponseEntity<byte[]> downloadOfferLetter(OfferLetterRequest request, HttpServletRequest httpRequest) {

        String resourceId = ResourceIdUtils.generateOfferLetterId(request.getReferenceNo());
        try {
            SSLUtil.disableSSLVerification();

            CompanyEntity rawCompany = openSearchOperations.getCompanyById(request.getCompanyId(), null, Constants.INDEX_EMS);
            if (rawCompany == null) {
                log.error("Company is not found");
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), request.getCompanyId()), HttpStatus.NOT_FOUND);
            }

            Entity companyDetails = CompanyUtils.unmaskCompanyProperties(rawCompany, httpRequest);
            SalaryConfigurationEntity salaryConfig = openSearchOperations.getSalaryStructureById(request.getSalaryConfigurationId(), null, Constants.INDEX_EMS + "_" + rawCompany.getShortName());
            CompanyUtils.unMaskCompanySalaryStructureProperties(salaryConfig);

            if (salaryConfig == null || !Constants.ACTIVE.equals(salaryConfig.getStatus())) {
                log.error("Salary configuration is not active or does not exist");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_SALARY_NOT_FOUND), HttpStatus.NOT_FOUND);
            }
            Map<String, Object> model = new HashMap<>();
            model.put(Constants.COMPANY, companyDetails);
            model.put(Constants.OFFER_LETTER_REQUEST, request);
            model.put(Constants.SALARY, PayslipUtils.calculateSalaryComponents(salaryConfig, request.getSalaryPackage()));

            if (!request.isDraft()) {
                String imageUrl = rawCompany.getImageFile();
                BufferedImage image = ImageIO.read(new URL(imageUrl));
                if (image == null) {
                    log.error("Unable to get the company Image");
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPTY_FILE), HttpStatus.INTERNAL_SERVER_ERROR);
                }
                BufferedImage watermark = CompanyUtils.applyOpacity(image, 0.1f, 1.6d, 30);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(watermark, "png", baos);
                model.put(Constants.BLURRED_IMAGE, Constants.DATA + Base64.getEncoder().encodeToString(baos.toByteArray()));
            }

            OfferLetterEntity entity = objectMapper.convertValue(request, OfferLetterEntity.class);
            entity.setId(resourceId);
            entity.setType(Constants.OFFER_LETTER);
            Template template = freeMarkerConfig.getTemplate(Constants.OFFER_LETTER_TEMPLATE1);
            StringWriter writer = new StringWriter();
            template.process(model, writer);

            byte[] pdf = generatePdfFromHtml(writer.toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder(Constants.ATTACHMENT).filename(Constants.OFFER_LETTER_PDF).build());
            offerLetterDao.save(entity, rawCompany.getShortName());
            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Error occurred while generating offer letter: {}", e.getMessage(), e);
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