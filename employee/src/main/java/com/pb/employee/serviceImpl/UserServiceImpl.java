package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.CompanyEntity;
import com.pb.employee.persistance.model.DepartmentEntity;
import com.pb.employee.persistance.model.UserEntity;
import com.pb.employee.request.UserRequest;
import com.pb.employee.request.UserUpdateRequest;
import com.pb.employee.service.UserService;
import com.pb.employee.util.Constants;
import com.pb.employee.util.PasswordUtils;
import com.pb.employee.util.ResourceIdUtils;
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

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public ResponseEntity<?> registerUser(UserRequest userRequest) throws EmployeeException, IOException {
        String resourceId = null;
        String index = null;
        String defaultPassword = null;

        try {
            resourceId = ResourceIdUtils.generateUserResourceId(userRequest.getEmailId());
            index = ResourceIdUtils.generateCompanyIndex(userRequest.getCompanyName());

            List<CompanyEntity> shortName = openSearchOperations.getCompanyByData(null, Constants.COMPANY, userRequest.getCompanyName());
            if (shortName == null || shortName.isEmpty()) {
                log.error("Company not found: {}", userRequest.getCompanyName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), userRequest.getCompanyName()), HttpStatus.BAD_REQUEST);
            }

            Object existingEntity = openSearchOperations.getById(resourceId, null, index);
            if (existingEntity != null) {
                log.error("User already exists in the company {}", userRequest.getCompanyName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_ID_ALREADY_EXISTS)), HttpStatus.CONFLICT);
            }

            DepartmentEntity departmentEntity = openSearchOperations.getDepartmentById(userRequest.getDepartment(), null, index);
            if (departmentEntity == null) {
                log.error("Department not found: {}", userRequest.getDepartment());
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DESIGNATION)))),
                        HttpStatus.CONFLICT);
            }

            defaultPassword = PasswordUtils.generateStrongPassword();
            String password = Base64.getEncoder().encodeToString(defaultPassword.getBytes());

            // Convert UserRequest to EmployeeEntity and then override other fields
            UserEntity userEntity = objectMapper.convertValue(userRequest, UserEntity.class);

            userEntity.setId(resourceId);
            userEntity.setUserId(resourceId);
            userEntity.setPassword(password);
            userEntity.setType(Constants.USER);
            userEntity.setCompanyId(shortName.getFirst().getId());
            userEntity.setDepartment(departmentEntity.getId());

            openSearchOperations.saveEntity(userEntity, resourceId, index);

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
    public ResponseEntity<?> getUserById(String companyName, String Id) throws EmployeeException {
        try {
            String index = ResourceIdUtils.generateCompanyIndex(companyName);
            List<CompanyEntity> shortName = openSearchOperations.getCompanyByData(null, Constants.COMPANY, companyName);
            if (shortName == null || shortName.isEmpty()) {
                log.error("Company not found: {}", index);
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.BAD_REQUEST);
            }

            UserEntity userEntity = openSearchOperations.getUserById(Id, null, index);

            if (userEntity != null) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createSuccessResponse(userEntity),
                        HttpStatus.OK
                );
            } else {
                throw new EmployeeException(
                        String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), companyName),
                        HttpStatus.NOT_FOUND
                );
            }
        } catch (EmployeeException employeeException) {
            log.error("Error retrieving user  {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Error retrieving user for company {}: {}", companyName, exception.getMessage());
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES), companyName),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Override
    public ResponseEntity<?> getCompanyUsers(String companyName) throws EmployeeException {
        List<UserEntity> userEntities = null;
        try {
            String index = ResourceIdUtils.generateCompanyIndex(companyName);
            List<CompanyEntity> shortName = openSearchOperations.getCompanyByData(null, Constants.COMPANY, companyName);
            if (shortName == null || shortName.isEmpty()) {
                log.error("Company not found: {}", index);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), index), HttpStatus.BAD_REQUEST);
            }

            userEntities = openSearchOperations.getCompanyUsers(companyName);

            if (userEntities != null) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createSuccessResponse(userEntities),
                        HttpStatus.OK
                );
            } else {
                throw new EmployeeException(
                        String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND), companyName),
                        HttpStatus.NOT_FOUND
                );
            }
        } catch (EmployeeException employeeException) {
            log.error("Error retrieving user  {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Error retrieving users {} for company {}", companyName, exception.getMessage());
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_EMPLOYEES), companyName),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Override
    public ResponseEntity<?> updateUser(String Id, UserUpdateRequest userUpdateRequest) throws EmployeeException {
        String index = null;
        try {
            index = ResourceIdUtils.generateCompanyIndex(userUpdateRequest.getCompanyName());

            List<CompanyEntity> company = openSearchOperations.getCompanyByData(null, Constants.COMPANY, userUpdateRequest.getCompanyName());
            if (company == null || company.isEmpty()) {
                log.error("Company not found: {}", userUpdateRequest.getCompanyName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), userUpdateRequest.getCompanyName()), HttpStatus.BAD_REQUEST);
            }

            UserEntity existingUser = openSearchOperations.getUserById(Id, null, index);
            if (existingUser == null) {
                log.error("User not found in this company {}", userUpdateRequest.getCompanyName());
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND),userUpdateRequest.getCompanyName()), HttpStatus.NOT_FOUND);
            }

            UserEntity originalUser = new UserEntity();
            BeanUtils.copyProperties(existingUser, originalUser);

            DepartmentEntity departmentEntity = null;
            String departmentId = existingUser.getDepartment();
            if (userUpdateRequest.getDepartment() != null) {
                departmentEntity = openSearchOperations.getDepartmentById(userUpdateRequest.getDepartment(), null, index);
                if (departmentEntity == null) {
                    log.error("Department not found: {}", userUpdateRequest.getDepartment());
                    return new ResponseEntity<>(
                            ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT   )))),
                            HttpStatus.CONFLICT);
                }
                departmentId = departmentEntity.getId();
            }

            UserEntity updatedData = objectMapper.convertValue(userUpdateRequest, UserEntity.class);

            // Update only the mutable fields
            existingUser.setUserType(updatedData.getUserType());
            existingUser.setFirstName(updatedData.getFirstName());
            existingUser.setLastName(updatedData.getLastName());
            existingUser.setDepartment(departmentId);

            // Check if any changes were made
            if (originalUser.getUserType().equals(existingUser.getUserType()) &&
                    originalUser.getFirstName().equals(existingUser.getFirstName()) &&
                    originalUser.getLastName().equals(existingUser.getLastName()) &&
                    Objects.equals(originalUser.getDepartment(), existingUser.getDepartment())) {
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.NO_CHANGES_DONE)), HttpStatus.OK);
            }

            openSearchOperations.saveEntity(existingUser, Id, index);

            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);

        } catch (EmployeeException employeeException) {
            log.error("Error during user update: {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Error during user update: {}", exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_EMPLOYEE), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> deleteUser(String companyName, String Id) throws EmployeeException {
        try {
            String index = ResourceIdUtils.generateCompanyIndex(companyName);
            UserEntity existingUser = openSearchOperations.getUserById(Id, null, index);

            if (existingUser == null) {
                log.error("User not found in this company {}", index);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.EMPLOYEE_NOT_FOUND)), HttpStatus.NOT_FOUND);
            }
             openSearchOperations.deleteEntity(Id, index);

                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS),
                        HttpStatus.OK
                );
        } catch (EmployeeException employeeException) {
            log.error("Employee not found for company  {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Error deleting user for company {}", exception.getMessage());
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_EMPLOYEE), companyName),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
