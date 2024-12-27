package com.invoice.serviceImpl;

import com.invoice.config.Config;
import com.invoice.exception.InvoiceErrorMessageHandler;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.mappers.CompanyMapper;
import com.invoice.model.CompanyModel;
import com.invoice.repository.CompanyRepository;
import com.invoice.request.CompanyImageUpdate;
import com.invoice.request.CompanyRequest;
import com.invoice.request.CompanyStampUpdate;
import com.invoice.service.CompanyService;
import com.invoice.common.ResponseBuilder;
import com.invoice.util.CompanyUtils;
import com.invoice.util.Constants;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
@Slf4j
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository repository;

    @Autowired
    private CompanyMapper companyMapper;

    @Autowired
    private Config config;

    @Autowired
    public CompanyServiceImpl(CompanyRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public ResponseEntity<?> createCompany(CompanyRequest companyRequest) throws InvoiceException {
        log.info("Attempting to create a new company with name: {}", companyRequest.getCompanyName());
        try {
            if (repository.existsByCompanyName(companyRequest.getCompanyName()) ||
                    repository.existsByCompanyEmail(companyRequest.getCompanyEmail()) ||
                    repository.existsByGstNumber(companyRequest.getGstNumber())) {
                log.error("Company creation failed: Name '{}', Email '{}', or GST Number '{}' already exists.",
                        companyRequest.getCompanyName(), companyRequest.getCompanyEmail(), companyRequest.getGstNumber());
                throw new InvoiceException(InvoiceErrorMessageKey.COMPANY_NAME_OR_EMAIL_EXISTS.getMessage(), HttpStatus.BAD_REQUEST);
            }
            log.debug("Creating a new company record for name: {}", companyRequest.getCompanyName());
            CompanyModel company = CompanyUtils.populateCompanyFromRequest(companyRequest);

            CompanyModel savedCompany = repository.save(company);
            log.info("Company created successfully with ID: {}", savedCompany.getCompanyId());

            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.COMPANY_CREATED_SUCCESS), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error occurred while creating company: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.ERROR_CREATING_COMPANY.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getCompany(Long companyId, HttpServletRequest request) throws InvoiceException {
        log.info("Attempting to fetch company with ID: {}", companyId);
        try {
            Optional<CompanyModel> companyOptional = repository.findById(companyId);
            if (companyOptional.isPresent()) {
                CompanyModel companyData = companyOptional.get();
                companyData.setInvoices(null);
                CompanyUtils.CompanyProperties(companyData, request);

                log.info("Successfully fetched company with ID: {}", companyId);
                return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(companyData), HttpStatus.OK);
            } else {
                log.error("Company with ID {} not found.", companyId);
                throw new InvoiceException(InvoiceErrorMessageKey.COMPANY_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            log.error("Unexpected error occurred while fetching company with ID {}: {}", companyId, e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.ERROR_FETCHING_COMPANY.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public ResponseEntity<Object> updateCompanyImageById(String companyId, CompanyImageUpdate companyImageUpdate, MultipartFile multipartFile) throws InvoiceException, IOException {
        CompanyModel companyModel;
        try {
            companyModel = repository.findById(Long.parseLong(companyId))
                    .orElseThrow(() -> new InvoiceException(InvoiceErrorMessageKey.INVALID_COMPANY, HttpStatus.BAD_REQUEST));
        } catch (Exception exception) {
            log.error("Exception while fetching company  {}", companyId, exception);
            throw new InvoiceException(InvoiceErrorMessageKey.INVALID_COMPANY.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        CompanyModel entity = CompanyUtils.CompanyImageUpdateProperties(companyModel, companyImageUpdate, companyId);
        if (multipartFile != null && !multipartFile.isEmpty()) {
            multiPartFileStore(multipartFile, entity);
        }
        repository.save(entity);
        log.info("CompanyImage updated successfully with ID: {}", companyId);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> updateCompanyStampImageById(String companyId, CompanyStampUpdate companyStampUpdate, MultipartFile multipartFile) throws IOException, InvoiceException {
        CompanyModel companyModel;
        try {
            companyModel = repository.findById(Long.parseLong(companyId))
                    .orElseThrow(() -> new InvoiceException(InvoiceErrorMessageKey.INVALID_COMPANY.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (Exception exception) {
            log.error("Exception while fetching company  {}", companyId, exception);
            throw new InvoiceException(InvoiceErrorMessageKey.INVALID_COMPANY.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        CompanyModel entity = CompanyUtils.CompanyStampImageUpdateProperties(companyModel, companyStampUpdate, companyId);
        if (multipartFile != null && !multipartFile.isEmpty()) {
            multiPartFileStoreForStamp(multipartFile, entity);
        }
        repository.save(entity);
        log.info("CompanyStampImage updated successfully with ID: {}", companyId);
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    private void multiPartFileStore(MultipartFile file, CompanyModel company) throws IOException, InvoiceException {
        if(!file.isEmpty()){
            String filename =file.getOriginalFilename();
            file.transferTo(new File(filename));
            company.setImageFile(file.getOriginalFilename());
            ResponseEntity.ok(filename);
        }
    }

    private void multiPartFileStoreForStamp(MultipartFile file, CompanyModel company) throws IOException, InvoiceException{
        if(!file.isEmpty()){
            String filename =file.getOriginalFilename();
            file.transferTo(new File(filename));
            company.setStampImage(file.getOriginalFilename());
            ResponseEntity.ok(filename);
        }
    }

    @Override
    public ResponseEntity<?> getCompanyImageById(String companyId, HttpServletRequest request) throws InvoiceException {
        log.info("Getting details of company with ID: {}", companyId);
        String image;
        try {
            CompanyModel companyEntity = repository.findById(Long.valueOf(companyId))
                    .orElseThrow(() -> new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.COMPANY_NOT_FOUND), HttpStatus.NOT_FOUND));
            String baseUrl = CompanyUtils.getBaseUrl(request);
            image = baseUrl + "MyImage/" + companyEntity.getImageFile();
        }  catch (Exception ex) {
            log.error("Exception while fetching company details: {}", ex.getMessage(), ex);
            throw new InvoiceException(InvoiceErrorMessageHandler.getMessage(InvoiceErrorMessageKey.UNABLE_SAVE_COMPANY), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(image), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> getAllCompanies(HttpServletRequest request) throws InvoiceException {
        log.info("Fetching all companies");
        try {
            List<CompanyModel> companies = repository.findAll();
            if (companies.isEmpty()) {
                log.info("No company found in the database.");
                return ResponseEntity.ok(Collections.emptyList());
            }
            companies.forEach(company -> {
                company.setInvoices(null);
                CompanyUtils.CompanyProperties(company, request);
            });
            log.info("All companies fetched successfully, total count: {}", companies.size());
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(companies), HttpStatus.OK);
        } catch (Exception e) {
            log.error("An error occurred while fetching all companies: {}", e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.INTERNAL_SERVER_ERROR.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteCompany(Long companyId) throws InvoiceException {
        log.debug("Attempting to delete company with ID: {}", companyId);
        try {
            Optional<CompanyModel> companyOpt = repository.findById(companyId);
            if (companyOpt.isPresent()) {
                CompanyModel company = companyOpt.get();
                repository.delete(company);
                log.info("Company with ID {} deleted successfully.", companyId);
                return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETE_SUCCESS), HttpStatus.OK);
            } else {
                log.error("Company with ID {} not found.", companyId);
                throw new InvoiceException(InvoiceErrorMessageKey.COMPANY_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND);
            }
        }  catch (Exception e) {
            log.error("Unexpected error occurred while deleting company with ID {}: {}", companyId, e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.ERROR_DELETING_COMPANY + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public ResponseEntity<?> updateCompany(Long companyId, @Valid CompanyRequest companyRequest) throws InvoiceException, IOException {
        log.info("Updating company with ID: {}", companyId);

        CompanyModel companyToUpdate = repository.findById(companyId)
                .orElseThrow(() -> {
                    log.error("Company not found with ID: {}", companyId);
                    return new InvoiceException(InvoiceErrorMessageKey.COMPANY_NOT_FOUND.getMessage(), HttpStatus.NOT_FOUND);
                });
        if (companyRequest.getCompanyEmail() != null && !companyRequest.getCompanyEmail().equals(companyToUpdate.getCompanyEmail())) {
            if (repository.existsByCompanyEmail(companyRequest.getCompanyEmail())) {
                log.error("Email already exists for another company: {}", companyRequest.getCompanyEmail());
                throw new InvoiceException(InvoiceErrorMessageKey.EMAIL_ALREADY_EXISTS.getMessage(), HttpStatus.BAD_REQUEST);
            }
            log.info("Email validation passed for: {}", companyRequest.getCompanyEmail());
        }
        try {
            CompanyUtils.updateCompanyFromRequest(companyToUpdate, companyRequest);

            repository.save(companyToUpdate);
            log.info("Company updated successfully with ID: {}", companyId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.UPDATE_SUCCESS), HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error occurred while updating company with ID: {}: {}", companyId, e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.ERROR_UPDATING_COMPANY.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}