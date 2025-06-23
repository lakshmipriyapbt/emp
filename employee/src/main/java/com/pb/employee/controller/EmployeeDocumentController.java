package com.pb.employee.controller;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.request.EmployeeDocumentRequest;
import com.pb.employee.service.EmployeeDocumentService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
@RequiredArgsConstructor
public class EmployeeDocumentController {

    @Autowired
    private EmployeeDocumentService employeeDocumentService;

    @RequestMapping(value = "{companyName}/candidate/{candidateId}/upload", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.uploadDocument.tag}", description = "${api.uploadDocument.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "File Uploaded Successfully")
    public ResponseEntity<?> uploadCandidateDocument(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                    @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                    @PathVariable String companyName,
                                                    @PathVariable String candidateId,
                                                    @ModelAttribute EmployeeDocumentRequest employeeDocumentRequest) throws EmployeeException, IOException {
        return employeeDocumentService.uploadEmployeeDocument(companyName, candidateId, null, employeeDocumentRequest);
    }

    @RequestMapping(value = "{companyName}/employee/{employeeId}/upload", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.uploadDocument.tag}", description = "${api.uploadDocument.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "File Uploaded Successfully")
    public ResponseEntity<?> uploadEmployeeDocument(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                    @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                    @PathVariable String companyName,
                                                    @PathVariable String employeeId,
                                                    @ModelAttribute EmployeeDocumentRequest employeeDocumentRequest) throws EmployeeException, IOException {
        return employeeDocumentService.uploadEmployeeDocument(companyName, null, employeeId, employeeDocumentRequest);
    }

    @RequestMapping(value = "{companyName}/documents", method = RequestMethod.GET)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.getDocumentById.tag}", description = "${api.getDocumentById.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "File fetched Successfully")
    public ResponseEntity<?> getEmployeeDocumentsById(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                    @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                    @PathVariable String companyName,
                                                    @RequestParam(required = false, name = "candidateId") String candidateId,
                                                    @RequestParam(required = false, name = "employeeId") String employeeId,
                                                    HttpServletRequest request) throws EmployeeException {
        return employeeDocumentService.getEmployeeDocumentsById(companyName, candidateId, employeeId, request);
    }


    @RequestMapping(value = "{companyName}/candidate/{candidateId}/document/{documentId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.deleteDocumentById.tag}", description = "${api.deleteDocumentById.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Documents deleted successfully")
    public ResponseEntity<?> deleteCandidateDocuments(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                     @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                     @PathVariable String companyName,
                                                     @PathVariable String candidateId,
                                                     @PathVariable String documentId) throws EmployeeException {
        return employeeDocumentService.deleteDocumentsByReferenceId(companyName, candidateId, null, documentId);
    }

    @RequestMapping(value = "{companyName}/employee/{employeeId}/document/{documentId}", method = RequestMethod.DELETE)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.deleteDocumentById.tag}", description = "${api.deleteDocumentById.description}")
    @ResponseStatus(HttpStatus.OK)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Documents deleted successfully")
    public ResponseEntity<?> deleteEmployeeDocuments(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}", example = "Bearer abcdef12-1234-1234-1234-abcdefabcdef")
                                                      @RequestHeader(Constants.AUTH_KEY) String authToken,
                                                      @PathVariable String companyName,
                                                      @PathVariable String employeeId,
                                                      @PathVariable String documentId) throws EmployeeException {
        return employeeDocumentService.deleteDocumentsByReferenceId(companyName,null, employeeId, documentId);
    }


}
