package com.pb.employee.service;

import com.pb.employee.exception.EmployeeException;
import com.pb.employee.persistance.model.DesignationEntity;
import com.pb.employee.request.DesignationRequest;
import com.pb.employee.request.DesignationUpdateRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.List;

public interface DesignationService {


    ResponseEntity<?> registerDesignation(DesignationRequest designationRequest, String departmentId) throws EmployeeException, IOException;

    List<DesignationEntity> getDesignationsByDepartment(String companyName, String departmentId, String designationId) throws EmployeeException;
    ResponseEntity<?> updateDesignationById(String designationId, String departmentId, DesignationUpdateRequest designationUpdateRequest) throws EmployeeException;
    ResponseEntity<?> deleteDesignation(String companyName, String departmentId, String designationId) throws EmployeeException;
    ResponseEntity<?> getDesignation(String companyName) throws EmployeeException;

}
