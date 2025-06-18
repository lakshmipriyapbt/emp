package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.CandidateDao;
import com.pb.employee.dao.EmployeeDocumentDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.CandidateEntity;
import com.pb.employee.persistance.model.DocumentEntity;
import com.pb.employee.persistance.model.EmployeeDocumentEntity;
import com.pb.employee.request.EmployeeDocumentRequest;
import com.pb.employee.response.DocumentEntityResponse;
import com.pb.employee.response.EmployeeDocumentResponse;
import com.pb.employee.service.EmployeeDocumentService;
import com.pb.employee.util.Constants;
import com.pb.employee.util.ResourceIdUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
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
    public ResponseEntity<?> uploadEmployeeDocument(String companyName, String candidateId, EmployeeDocumentRequest employeeDocumentRequest) throws EmployeeException, IOException {

        String resourceId = ResourceIdUtils.generateDocumentResourceId(candidateId);

        List<String> allowedFileTypes = Arrays.asList(Constants.FILE_PDF, Constants.FILE_DOC, Constants.FILE_DOCX);

        CandidateEntity candidate;
        try {
            candidate = candidateDao.get(candidateId, companyName).orElse(null);
            if (candidate == null) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_FOUND), HttpStatus.BAD_REQUEST);
            }
        } catch (Exception ex) {
            log.error("Exception while fetching candidate {}, {}", candidateId, ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.INVALID_CANDIDATE), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (employeeDocumentRequest.getFiles() == null || employeeDocumentRequest.getFiles().isEmpty()
                || employeeDocumentRequest.getDocNames() == null || employeeDocumentRequest.getDocNames().isEmpty()) {
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FILES_OR_DOC_NAMES_EMPTY), HttpStatus.BAD_REQUEST);
        }

        if (employeeDocumentRequest.getFiles().size() != employeeDocumentRequest.getDocNames().size()) {
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FILES_AND_DOC_NAMES_SIZE_MISMATCH), HttpStatus.BAD_REQUEST);
        }
        for (String docName : employeeDocumentRequest.getDocNames()) {
            if (StringUtils.isBlank(docName)) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FILES_OR_DOC_NAMES_EMPTY), HttpStatus.BAD_REQUEST);
            }
        }
        EmployeeDocumentEntity employeeDocumentEntity = employeeDocumentDao.getByCandidateId(candidateId, companyName).orElse(null);
        EmployeeDocumentEntity employeeDocument;

        if (employeeDocumentEntity == null) {
            employeeDocument = new EmployeeDocumentEntity();
            employeeDocument.setId(resourceId);
            employeeDocument.setCandidateId(candidateId);
            employeeDocument.setEmployeeRefId(null);
            employeeDocument.setFolderPath(folderPath + companyName + Constants.SLASH + candidate.getId() + Constants.SLASH);
            employeeDocument.setDocumentEntities(new ArrayList<>());
            employeeDocument.setType(Constants.DOCUMENT);

            File candidateFolder = new File(employeeDocument.getFolderPath());
            if (!candidateFolder.exists()) {
                candidateFolder.mkdirs();
            }
        } else {
            employeeDocument = employeeDocumentEntity;
            if (employeeDocument.getDocumentEntities() == null) {
                employeeDocument.setDocumentEntities(new ArrayList<>());
            }
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

            storeEmployeeDocument(file, companyName, candidateId, docName, employeeDocument);
        }

        employeeDocumentDao.save(employeeDocument, companyName);
        log.info("Saved the employee document for candidate {}", candidateId);

        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> getEmployeeDocumentsById(String companyName, String candidateId) throws EmployeeException {
        try {
            CandidateEntity candidate = candidateDao.get(candidateId, companyName).orElse(null);
            if (candidate == null) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_FOUND), HttpStatus.BAD_REQUEST);
            }

            EmployeeDocumentEntity employeeDocumentEntity = employeeDocumentDao.getByCandidateId(candidateId, companyName).orElse(null);
            if (employeeDocumentEntity == null) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_DOCUMENTS_FOUND), HttpStatus.NOT_FOUND);
            }

            String folder = folderPath + companyName + Constants.SLASH + candidate.getId() + Constants.SLASH;
            File directory = new File(folder);

            if (!directory.exists() || !directory.isDirectory()) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.DOCUMENT_FOLDER_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            File[] files = directory.listFiles();

            if (files == null || files.length == 0) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_DOCUMENTS_FOUND), HttpStatus.NOT_FOUND);
            }

            List<DocumentEntityResponse> documentEntities = new ArrayList<>();
            for (File file : files) {
                if (file.isFile()) {
                    String fileName = file.getName();
                    String docName = fileName.contains("_") ? fileName.substring(0, fileName.indexOf("_")) : fileName;

                    String relativePath = companyName + Constants.SLASH + candidate.getId() + Constants.SLASH + fileName;

                    documentEntities.add(new DocumentEntityResponse(docName, relativePath));
                }
            }

            EmployeeDocumentResponse response = new EmployeeDocumentResponse();
            response.setId(employeeDocumentEntity.getId());
            response.setCandidateId(candidateId);
            response.setFolderPath(folder);
            response.setDocumentEntities(documentEntities);

            log.info("Fetched {} files for candidate {}", documentEntities.size(), candidateId);

            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(response), HttpStatus.OK);

        } catch (EmployeeException ex) {
            log.error("EmployeeException while fetching documents for candidate {}: {}", candidateId, ex.getMessage(), ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error while fetching documents for candidate {}: {}", candidateId, ex.getMessage(), ex);
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.FAILED_TO_FETCH_DOCUMENTS), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> deleteEmployeeDocuments(String companyName, String candidateId, String documentId) throws EmployeeException {
        try {
            CandidateEntity candidate = candidateDao.get(candidateId, companyName).orElse(null);
            if (candidate == null) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.CANDIDATE_NOT_FOUND), HttpStatus.BAD_REQUEST);
            }

            EmployeeDocumentEntity employeeDocumentEntity = employeeDocumentDao.getByCandidateId(candidateId, companyName).orElse(null);
            if (employeeDocumentEntity == null||(!employeeDocumentEntity.getId().equals(documentId))){
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_DOCUMENTS_FOUND), HttpStatus.NOT_FOUND);
            }

            String folder = folderPath + companyName + Constants.SLASH + candidate.getId() + Constants.SLASH;
            File directory = new File(folder);

            if (!directory.exists() || !directory.isDirectory()) {
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.DOCUMENT_FOLDER_NOT_FOUND), HttpStatus.NOT_FOUND);
            }

            File[] files = directory.listFiles();
            if (files != null && files.length > 0) {
                for (File file : files) {
                    if (file.isFile()) {
                        file.delete();
                    }
                }
            }

            employeeDocumentDao.deleteById(documentId, companyName);

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

    private void storeEmployeeDocument(MultipartFile file, String companyName, String candidateId, String docName, EmployeeDocumentEntity employeeDocumentEntity) throws IOException {

        String candidateFolder = folderPath + companyName + Constants.SLASH + candidateId + Constants.SLASH;
        String filename = candidateFolder + docName + "_" + file.getOriginalFilename();

        String filePath = companyName + Constants.SLASH + candidateId + Constants.SLASH + docName + "_" + file.getOriginalFilename();

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

}
