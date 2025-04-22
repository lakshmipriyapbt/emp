package com.pb.employee.serviceImpl;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.CompanyEntity;
import com.pb.employee.persistance.model.DepartmentEntity;
import com.pb.employee.persistance.model.EmployeeEntity;
import com.pb.employee.request.UserRequest;
import com.pb.employee.request.UserUpdateRequest;
import com.pb.employee.service.UserService;
import com.pb.employee.util.Constants;
import com.pb.employee.util.PasswordUtils;
import com.pb.employee.util.ResourceIdUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Objects;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> registerUser(UserRequest userRequest, HttpServletRequest request) throws EmployeeException, IOException {
        String resourceId = null;
        String index = null;
        String defaultPassword = null;
        try {

            resourceId = ResourceIdUtils.generateEmployeeResourceId(userRequest.getEmailId());
            index = ResourceIdUtils.generateCompanyIndex(userRequest.getCompanyName());

                Object existingEntity = openSearchOperations.getById(resourceId, null, index);
                if (existingEntity != null) {
                    log.error("User with ID {} already exists in company {}", resourceId, userRequest.getCompanyName());
                    throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_ID_ALREADY_EXISTS), resourceId), HttpStatus.CONFLICT);
                }

            List<CompanyEntity> shortName = null;
            shortName = openSearchOperations.getCompanyByData(null, Constants.COMPANY, userRequest.getCompanyName());
                if (shortName == null || shortName.isEmpty()) {
                    log.error("Company not found: {}", userRequest.getCompanyName());
                    throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), userRequest.getCompanyName()), HttpStatus.BAD_REQUEST);
                }

            DepartmentEntity departmentEntity = null;

                departmentEntity = openSearchOperations.getDepartmentById(userRequest.getDepartment(), null, index);
                if (departmentEntity == null) {
                    log.error("Department not found: {}", userRequest.getDepartment());
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DESIGNATION)))),
                            HttpStatus.CONFLICT);
                }
            defaultPassword = PasswordUtils.generateStrongPassword();
            String password = Base64.getEncoder().encodeToString(defaultPassword.getBytes());
            EmployeeEntity employee = EmployeeEntity.builder().
                    id(resourceId).
                    employeeType(userRequest.getEmployeeType()).
                    firstName(userRequest.getFirstName()).
                    lastName(userRequest.getLastName()).
                    employeeId(resourceId).
                    department(departmentEntity.getId()).
                    companyId(shortName.getFirst().getId()).
                    emailId(userRequest.getEmailId()).
                    password(password).
                    type(Constants.USER).
                    build();
            openSearchOperations.saveEntity(employee, resourceId, index);

        } catch (EmployeeException employeeException) {
            throw employeeException;
        } catch (Exception e) {
            log.error("Error during user registration: {}", e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_USER), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<?> getUserById(String companyName, String employeeId) throws EmployeeException {
        try {
            String index = ResourceIdUtils.generateCompanyIndex(companyName);
            EmployeeEntity userEntity = openSearchOperations.getEmployeeById(employeeId, null, index);

            if (userEntity != null) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createSuccessResponse(userEntity),
                        HttpStatus.OK
                );
            } else {
                throw new EmployeeException(
                        String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), employeeId, companyName),
                        HttpStatus.NOT_FOUND
                );
            }
        } catch (Exception exception) {
            log.error("Error retrieving user with ID {} for company {}: {}", employeeId, companyName, exception.getMessage());
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES), employeeId, companyName),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Override
    public ResponseEntity<?> getCompanyUsers(String companyName) throws EmployeeException {
        List<EmployeeEntity> employeeEntities = null;
        try {
            String index = ResourceIdUtils.generateCompanyIndex(companyName);
            employeeEntities = openSearchOperations.getCompanyUsers(companyName);

            if (employeeEntities != null) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createSuccessResponse(employeeEntities),
                        HttpStatus.OK
                );
            } else {
                throw new EmployeeException(
                        String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), companyName),
                        HttpStatus.NOT_FOUND
                );
            }
        } catch (Exception exception) {
            log.error("Error retrieving users {} for company {}: {}", companyName, exception.getMessage());
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES), companyName),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Override
    public ResponseEntity<?> updateUser(String employeeId, UserUpdateRequest userUpdateRequest) throws EmployeeException {
        String index = null;
        try {
            index = ResourceIdUtils.generateCompanyIndex(userUpdateRequest.getCompanyName());

            EmployeeEntity existingUser = openSearchOperations.getEmployeeById(employeeId, null, index);
            if (existingUser == null) {
                log.error("User with ID {} not found in company {}", employeeId, userUpdateRequest.getCompanyName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), employeeId, userUpdateRequest.getCompanyName()), HttpStatus.NOT_FOUND);
            }

            EmployeeEntity originalUser = new EmployeeEntity();
            BeanUtils.copyProperties(existingUser, originalUser);

            List<CompanyEntity> shortName = null;
            shortName = openSearchOperations.getCompanyByData(null, Constants.COMPANY, userUpdateRequest.getCompanyName());
            if (shortName == null || shortName.isEmpty()) {
                log.error("Company not found: {}", userUpdateRequest.getCompanyName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), userUpdateRequest.getCompanyName()), HttpStatus.BAD_REQUEST);
            }

            DepartmentEntity departmentEntity = null;
            String departmentId = existingUser.getDepartment();
            if (userUpdateRequest.getDepartment() != null) {
                departmentEntity = openSearchOperations.getDepartmentById(userUpdateRequest.getDepartment(), null, index);
                if (departmentEntity == null) {
                    log.error("Department not found: {}", userUpdateRequest.getDepartment());
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DESIGNATION)))),
                            HttpStatus.CONFLICT);
                }
                departmentId = departmentEntity.getId();
            }

            // Update the user entity
            existingUser.setEmployeeType(userUpdateRequest.getEmployeeType());
            existingUser.setFirstName(userUpdateRequest.getFirstName());
            existingUser.setLastName(userUpdateRequest.getLastName());
            existingUser.setDepartment(departmentId);

            // Check if any changes were made
            if (originalUser.getEmployeeType().equals(existingUser.getEmployeeType()) &&
                    originalUser.getFirstName().equals(existingUser.getFirstName()) &&
                    originalUser.getLastName().equals(existingUser.getLastName()) &&
                    Objects.equals(originalUser.getDepartment(), existingUser.getDepartment())) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_CHANGES_DONE)), HttpStatus.OK);
            }

            openSearchOperations.saveEntity(existingUser, employeeId, index);

            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);

        } catch (EmployeeException employeeException) {
            throw employeeException;
        } catch (IOException e) {
            log.error("Error during user update: {}", e.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_EMPLOYEE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> deleteUser(String companyName, String employeeId) throws EmployeeException {
        try {
            String index = ResourceIdUtils.generateCompanyIndex(companyName);
             openSearchOperations.deleteEntity(employeeId, index);

                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS),
                        HttpStatus.OK
                );
        } catch (Exception exception) {
            log.error("Error deleting user with ID {} for company {}: {}", employeeId, companyName, exception.getMessage());
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_EMPLOYEE), employeeId, companyName),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
