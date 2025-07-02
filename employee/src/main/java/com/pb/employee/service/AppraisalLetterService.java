package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.AppraisalEntity;
import com.pb.employee.request.AppraisalLetterRequest;
import com.pb.employee.request.AppraisalUpdateRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.Collection;

public interface AppraisalLetterService {

    ResponseEntity<byte[]> downloadAppraisalLetter(AppraisalLetterRequest appraisalLetterRequest, HttpServletRequest request);

    Collection<AppraisalEntity> getAppraisalLetter(String companyId,String employeeId) throws Exception;

    ResponseEntity<?> updateAppraisalLetter(String companyId, String employeeId, String Id, AppraisalUpdateRequest appraisalUpdateRequest) throws Exception;

    ResponseEntity<?> deleteAppraisalLetter(String companyId, String employeeId,String Id) throws EmployeeException;

}
