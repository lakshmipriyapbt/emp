package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.CandidateDao;
import com.pb.employee.dao.EmployeeDocumentDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.EmployeeDocumentRequest;
import com.pb.employee.response.EmployeeDocumentResponse;
import com.pb.employee.service.EmployeeDocumentService;
import com.pb.employee.util.Constants;
import com.pb.employee.util.ResourceIdUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j

public class EmployeeDocumentServiceImpl implements EmployeeDocumentService {

    @Value("${file.upload.path}")
    private String folderPath;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CandidateDao candidateDao;

    @Autowired
    private EmployeeDocumentDao employeeDocumentDao;

    @Autowired
    private OpenSearchOperations openSearchOperations;
    @Override
    public ResponseEntity<?> uploadEmployeeDocument(String companyName, String candidateId, String employeeId, EmployeeDocumentRequest employeeDocumentRequest) throws EmployeeException, IOException {
        String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
        CompanyEntity company = null;
        CandidateEntity candidate = null;
        EmployeeEntity employee = null;
        String resourceId;
        String documentPath = "";
        try {
            List<String> allowedFileTypes = Arrays.asList(Constants.FILE_PDF, Constants.FILE_DOC, Constants.FILE_DOCX);
            company = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (company == null) {
                log.error("Company not found for name: {}", companyName);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            if (candidateId != null) {
                candidate = candidateDao.get(candidateId, companyName).orElse(null);
                if (candidate == null) {
                    log.error("Candidate not found for ID: {}", candidateId);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_FOUND), HttpStatus.BAD_REQUEST);
                }
                resourceId = ResourceIdUtils.generateDocumentResourceId(candidateId);
            } else if (employeeId != null) {
                employee = openSearchOperations.getEmployeeById(employeeId, null, indexName);
                if (employee == null) {
                    log.error("Employee not found for ID: {}", employeeId);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.BAD_REQUEST);
                }
                resourceId = ResourceIdUtils.generateDocumentResourceId(employeeId);
            } else {
                throw new EmployeeException("Either candidateId or employeeId must be provided", HttpStatus.BAD_REQUEST);
            }

            if (CollectionUtils.isEmpty(employeeDocumentRequest.getFiles())
                    || CollectionUtils.isEmpty(employeeDocumentRequest.getDocNames())
                    || employeeDocumentRequest.getDocNames().stream().anyMatch(StringUtils::isBlank)) {
                log.error("Files or document names are empty for candidate/employee");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FILES_OR_DOC_NAMES_EMPTY), HttpStatus.BAD_REQUEST);
            }

            if (employeeDocumentRequest.getFiles().size() != employeeDocumentRequest.getDocNames().size()) {
                log.error("Files and document names size mismatch");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FILES_AND_DOC_NAMES_SIZE_MISMATCH), HttpStatus.BAD_REQUEST);
            }

            String referenceId = StringUtils.isNotBlank(candidateId) ? candidateId : employeeId;
            EmployeeDocumentEntity employeeDocumentEntity = employeeDocumentDao.getByDocuments(referenceId, companyName).orElse(null);
            if (employeeDocumentEntity != null) {
                log.info("Found existing employee document for candidate/employee");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.DOCUMENT_ALREADY_EXISTS), HttpStatus.BAD_REQUEST);
            }

            EmployeeDocumentEntity employeeDocument = new EmployeeDocumentEntity();
            employeeDocument.setId(resourceId);
            if (candidate != null) {
                employeeDocument.setReferenceId(candidateId);
                documentPath = companyName+"/" + candidate.getFirstName()+"_"+candidate.getLastName() + "_"+candidate.getEmailId()+"/";
                employeeDocument.setFolderPath(folderPath+documentPath );
            }
            if (employee != null) {
                employeeDocument.setReferenceId(employee.getId());
                documentPath = companyName+"/" + employee.getFirstName()+"_"+employee.getLastName() + "_"+employee.getEmailId()+"/";
                employeeDocument.setFolderPath(folderPath+documentPath );
            }
            employeeDocument.setDocumentEntities(new ArrayList<>());
            employeeDocument.setType(Constants.DOCUMENT);

            File folder = new File(employeeDocument.getFolderPath());
            if (!folder.exists()) {
                folder.mkdirs();
            }

            for (int i = 0; i < employeeDocumentRequest.getFiles().size(); i++) {
                MultipartFile file = employeeDocumentRequest.getFiles().get(i);
                String docName = employeeDocumentRequest.getDocNames().get(i);

                if (file.isEmpty()) {
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FILE_IS_EMPTY, file.getOriginalFilename()), HttpStatus.BAD_REQUEST);
                }

                String contentType = file.getContentType();
                if (!allowedFileTypes.contains(contentType)) {
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_FILE_TYPE, file.getOriginalFilename()), HttpStatus.BAD_REQUEST);
                }

                storeEmployeeDocument(file, companyName, documentPath, docName, employeeDocument);
            }

            employeeDocumentDao.save(employeeDocument, companyName);
            log.info("Saved the employee document for candidate/employee");

            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
        } catch (EmployeeException ex) {
            log.error("Error while uploading documents: {}", ex.getMessage(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Unable to upload the documents: {}", ex.getMessage(), ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_UPLOAD_DOCUMENTS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Override
    public ResponseEntity<?> getEmployeeDocumentsById(String companyName, String candidateId, String employeeId, HttpServletRequest request) throws EmployeeException {
        try {
            validateEmployeeOrCandidate(companyName, candidateId, employeeId);
            String referenceId = StringUtils.isNotBlank(candidateId) ? candidateId : employeeId;
            EmployeeDocumentEntity employeeDocumentEntity = employeeDocumentDao.getByDocuments(referenceId, companyName).orElse(null);
            if (employeeDocumentEntity == null) {
                log.error("No documents found for candidate ID: {}", candidateId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_DOCUMENTS_FOUND), HttpStatus.NOT_FOUND);
            }
            String baseUrl = getBaseUrl(request);
            EmployeeDocumentResponse response = objectMapper.convertValue(employeeDocumentEntity, EmployeeDocumentResponse.class);
            for (DocumentEntity document : response.getDocumentEntities()) {
                String filePath = document.getFilePath();
                if (StringUtils.isNotBlank(filePath)) {
                    document.setFilePath(baseUrl +folderPath+ filePath);
                }
            }

            log.info("Fetched {} files for candidate {}", response.getDocumentEntities().size(), candidateId);

            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(response), HttpStatus.OK);

        } catch (EmployeeException ex) {
            log.error("EmployeeException while fetching documents for candidate {}: {}", candidateId, ex.getMessage(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error while fetching documents for candidate {}: {}", candidateId, ex.getMessage(), ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_FETCH_DOCUMENTS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void validateEmployeeOrCandidate(String companyName, String candidateId, String employeeId) throws EmployeeException {
        String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            if (candidateId != null &&!candidateId.isEmpty()){
                CandidateEntity candidate = candidateDao.get(candidateId, companyName).orElse(null);
                if (candidate == null) {
                    log.error("Candidate not found for ID: {}", candidateId);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_FOUND), HttpStatus.BAD_REQUEST);
                }
            } else if (employeeId != null && !employeeId.isEmpty()) {
                // Assuming there's a method to validate employee by ID
                EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeId, null, indexName);
                if (employee == null) {
                    log.error("Employee not found for ID: {}", employeeId);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.BAD_REQUEST);
                }
            }
        }catch (EmployeeException ex) {
            log.error("Error while validating candidate or employee: {}", ex.getMessage(), ex);
            throw ex;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }



    @Override
    public ResponseEntity<?> deleteDocumentsByReferenceId(String companyName, String candidateId, String employeeId, String documentId) throws EmployeeException {
        try {
            validateEmployeeOrCandidate(companyName, candidateId, employeeId);
            String referenceId = StringUtils.isNotBlank(candidateId) ? candidateId : employeeId;
            EmployeeDocumentEntity employeeDocumentEntity = employeeDocumentDao.getByDocuments(referenceId, companyName).orElse(null);
            if (employeeDocumentEntity == null||(!employeeDocumentEntity.getId().equals(documentId))){
                log.error("No documents found for candidate ID: {} or employeeId: {}", candidateId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_DOCUMENTS_FOUND), HttpStatus.NOT_FOUND);
            }

            String folder = employeeDocumentEntity.getFolderPath();
            File directory = new File(folder);

            if (!directory.exists() || !directory.isDirectory()) {
                log.error("Document folder not found for candidate ID: {} or employeeId: {}", candidateId, employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.DOCUMENT_FOLDER_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            File[] files = directory.listFiles();
            if (files != null && files.length > 0) {
                for (File file : files) {
                    if (file.isFile()) {
                        log.info("Deleting file: {}", file.getName());
                        file.delete();
                    }
                }
            }

            employeeDocumentDao.delete(documentId, companyName);
            log.info("Deleted all documents and record for candidate: {}", candidateId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.DELETED), HttpStatus.OK);

        } catch (EmployeeException ex) {
            log.error("EmployeeException while deleting documents for candidate {}: {}", candidateId, ex.getMessage(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error while deleting documents for candidate {}: {}", candidateId, ex.getMessage(), ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_DELETE_DOCUMENTS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void storeEmployeeDocument(MultipartFile file, String companyName, String documentPath, String docName, EmployeeDocumentEntity employeeDocumentEntity) throws IOException {

        String candidateFolder = employeeDocumentEntity.getFolderPath();
        String filename = candidateFolder + docName + "_" + file.getOriginalFilename();

        String filePath = companyName + documentPath + docName + "_" + file.getOriginalFilename();

        boolean isDuplicate = employeeDocumentEntity.getDocumentEntities().stream()
                .anyMatch(document -> document.getFilePath().equals(filePath));

        if (isDuplicate) {
            log.warn("Duplicate file detected. Skipping upload: {}", filePath);
            return;
        }

        file.transferTo(new File(filename));

        DocumentEntity fileEntity = new DocumentEntity();
        fileEntity.setDocName(docName);
        fileEntity.setFilePath(filePath);

        employeeDocumentEntity.getDocumentEntities().add(fileEntity);
    }

    public ResponseEntity<?> updateDocumentByReferenceId(String companyName, String candidateId, String employeeId, String documentId, EmployeeDocumentRequest employeeDocumentRequest) throws EmployeeException, IOException {
        String documentPath = "";
        CandidateEntity candidate = null;
        EmployeeEntity employee = null;
        String resourceId = null;
        String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
        try {
            List<String> allowedFileTypes = Arrays.asList(Constants.FILE_PDF, Constants.FILE_DOC, Constants.FILE_DOCX);
            if (candidateId != null) {
                candidate = candidateDao.get(candidateId, companyName).orElse(null);
                if (candidate == null) {
                    log.error("Candidate not found for ID: {}", candidateId);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_FOUND), HttpStatus.BAD_REQUEST);
                }
                documentPath = companyName+"/" + candidate.getFirstName()+"_"+candidate.getLastName() + "_"+System.currentTimeMillis()+"/";
            } else if (employeeId != null) {
                employee = openSearchOperations.getEmployeeById(employeeId, null, indexName);
                if (employee == null) {
                    log.error("Employee not found for ID: {}", employeeId);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.BAD_REQUEST);
                }
                documentPath = companyName+"/" + employee.getFirstName()+"_"+employee.getLastName() + "_"+System.currentTimeMillis()+"/";
            } else {
                throw new EmployeeException("Either candidateId or employeeId must be provided", HttpStatus.BAD_REQUEST);
            }
            String referenceId = StringUtils.isNotBlank(candidateId) ? candidateId : employeeId;
            EmployeeDocumentEntity employeeDocumentEntity = employeeDocumentDao.getByDocuments(referenceId, companyName).orElse(null);
            if (employeeDocumentEntity == null) {
                log.info("No existing document found for candidate/employee");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_DOCUMENTS_FOUND), HttpStatus.BAD_REQUEST);
            }
            if (CollectionUtils.isEmpty(employeeDocumentRequest.getFiles())
                    || CollectionUtils.isEmpty(employeeDocumentRequest.getDocNames())
                    || employeeDocumentRequest.getDocNames().stream().anyMatch(StringUtils::isBlank)) {
                log.error("Files or document names are empty for candidate/employee");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FILES_OR_DOC_NAMES_EMPTY), HttpStatus.BAD_REQUEST);
            }
            if (employeeDocumentRequest.getFiles().size() != employeeDocumentRequest.getDocNames().size()) {
                log.error("Files and document names size mismatch");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FILES_AND_DOC_NAMES_SIZE_MISMATCH), HttpStatus.BAD_REQUEST);
            }
            // Set folder path and IDs
            String folder = employeeDocumentEntity.getFolderPath();
            employeeDocumentEntity.setFolderPath(folder);
            employeeDocumentEntity.setDocumentEntities(new ArrayList<>());
            if (StringUtils.isNotBlank(candidateId)) {
                employeeDocumentEntity.setReferenceId(candidateId);
            }


            File dir = new File(folder);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            for (int i = 0; i < employeeDocumentRequest.getFiles().size(); i++) {
                MultipartFile file = employeeDocumentRequest.getFiles().get(i);
                String docName = employeeDocumentRequest.getDocNames().get(i);

                if (file.isEmpty()) {
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FILE_IS_EMPTY, file.getOriginalFilename()), HttpStatus.BAD_REQUEST);
                }
                String contentType = file.getContentType();
                if (!allowedFileTypes.contains(contentType)) {
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_FILE_TYPE, file.getOriginalFilename()), HttpStatus.BAD_REQUEST);
                }
                storeEmployeeDocument(file, companyName, documentPath, docName, employeeDocumentEntity);
            }

            employeeDocumentDao.save(employeeDocumentEntity, companyName);
            log.info("Updated the employee document for candidate/employee");

            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
        } catch (EmployeeException ex) {
            log.error("Error while updating documents: {}", ex.getMessage(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Unable to update the documents: {}", ex.getMessage(), ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_TO_UPLOAD_DOCUMENTS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> uploadEmployeeImage(String companyName, String employeeId, MultipartFile file) throws EmployeeException, IOException {
        log.info("Uploading employee image for company: {}, employeeId: {}", companyName, employeeId);
        String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
        CompanyEntity company = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
        if (company == null) {
            log.error("Company not found for name: {}", companyName);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }
        EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeId, null, indexName);
        if (employee == null) {
            log.error("Employee not found for ID: {}", employeeId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        EmployeeDocumentEntity employeeDocumentEntity = employeeDocumentDao.getByDocuments(employeeId, companyName).orElse(null);
        if(employeeDocumentEntity == null){
            log.error("Employee document entity not found for employeeId: {}", employeeId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.DOCUMENT_FOLDER_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        try {
            List<String> allowedFileTypes = Arrays.asList(Constants.IMAGE_JPG, Constants.IMAGE_PNG, Constants.IMAGE_SVG);
            if (!file.isEmpty()){
                // Validate file type
                String contentType = file.getContentType();
                if (!allowedFileTypes.contains(contentType)) {
                    // Return an error response if file type is invalid
                    log.error("Invalid file type: {}", contentType);
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_IMAGE), HttpStatus.BAD_REQUEST);
                }
                multiPartFileStore(file, companyName, employeeDocumentEntity);
            }

            employeeDocumentDao.save(employeeDocumentEntity, companyName);
            log.info("Employee document entity saved for employeeId: {}", employeeId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
        } catch (EmployeeException ex) {
            log.error("EmployeeException while uploading employee image for employeeId {}: {}", employeeId, ex.getMessage(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error while uploading employee image for employeeId {}: {}", employeeId, ex.getMessage(), ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_UPLOAD_IMAGE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getEmployeeImage(String companyName, String employeeId,HttpServletRequest request) throws EmployeeException, IOException {
        log.info("Fetching employee image for company: {}, employeeId: {}", companyName, employeeId);
        String indexName = ResourceIdUtils.generateCompanyIndex(companyName);
        CompanyEntity company = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
        if (company == null) {
            log.error("Company not found for name: {}", companyName);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
        }
        EmployeeEntity employee = openSearchOperations.getEmployeeById(employeeId, null, indexName);
        if (employee == null) {
            log.error("Employee not found for ID: {}", employeeId);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), HttpStatus.NOT_FOUND);
        }
        try {
            EmployeeDocumentEntity employeeDocumentEntity = employeeDocumentDao.getByDocuments(employeeId, companyName).orElse(null);
            if (employeeDocumentEntity == null || CollectionUtils.isEmpty(employeeDocumentEntity.getDocumentEntities())) {
                log.error("Employee document entity not found for employeeId: {}", employeeId);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.DOCUMENT_FOLDER_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            if (employeeDocumentEntity.getProfile()!= null){
                String baseUrl = getBaseUrl(request);
                String image = baseUrl + folderPath + employeeDocumentEntity.getProfile();
                employeeDocumentEntity.setProfile(image);
            }
            log.info("Fetched employee image for employeeId: {}", employeeId);
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(employeeDocumentEntity.getProfile()), HttpStatus.OK);
        } catch (EmployeeException ex) {
            log.error("EmployeeException while fetching employee image for employeeId {}: {}", employeeId, ex.getMessage(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error while fetching employee image for employeeId {}: {}", employeeId, ex.getMessage(), ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_IMAGE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void multiPartFileStore(MultipartFile file, String companyName, EmployeeDocumentEntity employeeDocument) throws IOException, EmployeeException {
        if(!file.isEmpty()){
            String companyFolderPath = employeeDocument.getFolderPath();
            String filename = companyFolderPath+companyName+"_"+file.getOriginalFilename();
            file.transferTo(new File(filename));
            employeeDocument.setProfile(companyName+"_"+file.getOriginalFilename());
            ResponseEntity.ok(filename);
        }
    }

    public static String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme(); // http or https
        String serverName = request.getServerName(); // localhost or IP address
        int serverPort = request.getServerPort(); // port number
        String contextPath = request.getContextPath(); // context path

        return scheme + "://" + serverName + ":" + serverPort + contextPath;
    }

}
