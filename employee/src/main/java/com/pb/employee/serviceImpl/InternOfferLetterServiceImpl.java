package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.DocumentException;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.InternOfferLetterDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.CompanyEntity;
import com.pb.employee.persistance.model.Entity;
import com.pb.employee.persistance.model.InternOfferLetterEntity;
import com.pb.employee.request.InternshipOfferLetterRequest;
import com.pb.employee.service.InternOfferLetterService;
import com.pb.employee.util.CompanyUtils;
import com.pb.employee.util.Constants;
import com.pb.employee.util.ResourceIdUtils;
import com.pb.employee.util.SSLUtil;
import freemarker.template.Configuration;
import freemarker.template.Template;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import org.springframework.http.*;


@Service
@Slf4j
public class InternOfferLetterServiceImpl implements InternOfferLetterService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private Configuration freeMarkerConfig;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private InternOfferLetterDao internOfferLetterDao;

    @Override
    public ResponseEntity<byte[]> downloadInternShipOfferLetter(InternshipOfferLetterRequest req, HttpServletRequest httpReq) throws EmployeeException {

        String resourceId = ResourceIdUtils.generateInternOfferLetterId(req.getEmployeeName(), String.valueOf(LocalDate.now()));
        try {
            SSLUtil.disableSSLVerification();

            CompanyEntity rawCompany = openSearchOperations.getCompanyById(req.getCompanyId(), null, Constants.INDEX_EMS);
            if (rawCompany == null) {
                log.error("Company not found");
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), req.getCompanyId()), HttpStatus.NOT_FOUND);
            }
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

                BufferedImage watermark = CompanyUtils.applyOpacity(image, 0.1f, 1.6d, 30);
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(watermark, "png", baos);
                model.put(Constants.BLURRED_IMAGE, Constants.DATA + Base64.getEncoder().encodeToString(baos.toByteArray()));
            } else model.put(Constants.BLURRED_IMAGE, "");

            //  Save internship offer letter before generating PDF
            InternOfferLetterEntity entity = objectMapper.convertValue(req, InternOfferLetterEntity.class);
            entity.setId(resourceId);
            entity.setType(Constants.INTERN_OFFER_LETTER);

            Template template = freeMarkerConfig.getTemplate(Constants.INTERNSHIP_OFFER_LETTER_TEMPLATE);
            StringWriter writer = new StringWriter();
            template.process(model, writer);

            byte[] pdf = generatePdfFromHtml(writer.toString());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder(Constants.ATTACHMENT).filename(Constants.OFFER_LETTER_PDF).build());

            log.info("saving the internOfferLetter");
            internOfferLetterDao.save(entity, rawCompany.getShortName());


            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);

        } catch (EmployeeException ex) {
            log.error("Exception occurred while generating the internshipOfferLetter {}", ex.getMessage());
            throw ex;
        } catch (Exception e) {
            log.error("Exception occurred while generating the internshipOfferLetter: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Collection<InternOfferLetterEntity> getInternshipOfferLetter(String companyName, String internOfferLetterId) throws EmployeeException {
        try {
            log.debug("Fetching company entity for companyName: {}", companyName);
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for companyName: {}", companyName);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            log.debug("Fetching internship offer letter(s) for internOfferLetterId: {} in company: {}", internOfferLetterId, companyName);
            return internOfferLetterDao.getInternshipOfferLetter(companyName, internOfferLetterId);

        } catch (EmployeeException e) {
            log.error("EmployeeException while fetching internship offer letters: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while fetching internship offer letters for companyName: {} and internOfferLetterId: {}", companyName, internOfferLetterId, e);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INTERN_OFFER_LETTER_NOT_FOUND), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> updateInternshipOfferLetter(String companyName, String internOfferLetterId, InternshipOfferLetterRequest internshipOfferLetterRequest) throws EmployeeException, IOException {

        try {
            log.debug("Validating internship offer letter existence for internOfferLetterId: {} in companyName: {}", internOfferLetterId, companyName);

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Company not found for companyName: {}", companyName);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<InternOfferLetterEntity> offerLetters = internOfferLetterDao.getInternshipOfferLetter(companyName, internOfferLetterId);
            InternOfferLetterEntity existingOfferLetter = offerLetters.stream().findFirst().orElse(null);

            if (existingOfferLetter == null) {
                log.error("Internship offer letter not found for internOfferLetterId: {}", internOfferLetterId);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INTERN_OFFER_LETTER_NOT_FOUND), internOfferLetterId), HttpStatus.NOT_FOUND);
            }

            LocalDate startDate = LocalDate.parse(internshipOfferLetterRequest.getStartDate());
            LocalDate endDate = LocalDate.parse(internshipOfferLetterRequest.getEndDate());

            if (!endDate.isAfter(startDate) && !startDate.equals(endDate)) {
                log.error("Invalid internship duration. End date {} is not after start date {}", endDate, startDate);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.END_DATE_BEFORE_START_DATE), HttpStatus.BAD_REQUEST);
            }

            if (Objects.equals(internshipOfferLetterRequest.getHrMobileNo(), internshipOfferLetterRequest.getMobileNo())) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.MOBILE_NUMBER_MISMATCH), HttpStatus.BAD_REQUEST);
            }

            if (Objects.equals(internshipOfferLetterRequest.getHrEmail(), internshipOfferLetterRequest.getInternEmail())) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMAIL_ID_MISS_MATCH), HttpStatus.BAD_REQUEST);
            }

            boolean isSame = Objects.equals(existingOfferLetter.getStartDate(), internshipOfferLetterRequest.getStartDate()) &&
                    Objects.equals(existingOfferLetter.getEndDate(), internshipOfferLetterRequest.getEndDate()) &&
                    Objects.equals(existingOfferLetter.getDate(), internshipOfferLetterRequest.getDate()) &&
                    Objects.equals(existingOfferLetter.getDepartment(), internshipOfferLetterRequest.getDepartment()) &&
                    Objects.equals(existingOfferLetter.getDesignation(), internshipOfferLetterRequest.getDesignation());

            if (isSame) {
                log.warn("No changes detected for internship offer letter of internOfferLetterId: {}", internOfferLetterId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_UPDATE_DONE_IN_INTERN_OFFER), HttpStatus.BAD_REQUEST);
            }

            InternOfferLetterEntity updatedOfferLetter = objectMapper.convertValue(internshipOfferLetterRequest, InternOfferLetterEntity.class);
            BeanUtils.copyProperties(updatedOfferLetter, existingOfferLetter, getNullPropertyNames(updatedOfferLetter));

            internOfferLetterDao.update(existingOfferLetter, companyEntity.getShortName());
            log.info("Internship offer letter updated successfully for internOfferLetterId: {}", internOfferLetterId);

            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);

        } catch (EmployeeException e) {
            log.error("EmployeeException while updating internship offer letter: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating internship offer letter for internOfferLetterId {}: {}", internOfferLetterId, e.getMessage(), e);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_UPDATE_INTERN_OFFER_LETTER), HttpStatus.INTERNAL_SERVER_ERROR);
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
        java.beans.PropertyDescriptor[] pds = src.getPropertyDescriptors();

        Set<String> emptyNames = new HashSet<>();
        for (java.beans.PropertyDescriptor pd : pds) {
            Object srcValue = src.getPropertyValue(pd.getName());
            if (srcValue == null) emptyNames.add(pd.getName());
        }
        return emptyNames.toArray(new String[0]);
    }

}
