package com.pb.employee.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.UserDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.CompanyCalendarEntity;
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
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private UserDao dao;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public ResponseEntity<?> registerUser(String companyName,UserRequest userRequest) throws EmployeeException, IOException {
        String resourceId = null;
        String index = null;
        String defaultPassword = null;

        try {
            resourceId = ResourceIdUtils.generateUserResourceId(userRequest.getEmailId());
            index = ResourceIdUtils.generateCompanyIndex(companyName);

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Object existingEntity = openSearchOperations.getById(resourceId, null, index);
            if (existingEntity != null) {
                log.error("User already exists in the company {}", companyName);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.USER_ID_ALREADY_EXISTS)), HttpStatus.CONFLICT);
            }

            DepartmentEntity departmentEntity = openSearchOperations.getDepartmentById(userRequest.getDepartment(), null, index);
            if (departmentEntity == null) {
                log.error("Department not found: {}", userRequest.getDepartment());
                return new ResponseEntity<>(
                        ResponseBuilder.builder().build().createFailureResponse(new Exception(String.valueOf(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DEPARTMENT)))),
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
            userEntity.setCompanyId(companyEntity.getId());
            userEntity.setDepartment(departmentEntity.getId());

            dao.save(userEntity, companyName);

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
    public Collection<UserEntity> getUserById(String companyName, String Id) throws EmployeeException {
        try {
            String index = ResourceIdUtils.generateCompanyIndex(companyName);
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            return dao.getUsers(companyName, Id, companyEntity.getId());

        } catch (EmployeeException employeeException) {
            log.error("Error retrieving user  {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Error retrieving user for company {}: {}", companyName, exception.getMessage());
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_USER), companyName),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Override
    public ResponseEntity<?> updateUser(String companyName, String Id, UserUpdateRequest userUpdateRequest) throws EmployeeException {
        String index = null;
        try {
            index = ResourceIdUtils.generateCompanyIndex(companyName);

            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }

            Collection<UserEntity> existingUsers = dao.getUsers(companyName, Id, companyEntity.getId());
            if (existingUsers == null) {
                log.error("User not found in this company {}", companyName);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.USER_NOT_FOUND),companyName), HttpStatus.NOT_FOUND);
            }
            
            UserEntity existingUser = existingUsers.iterator().next();
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

            dao.save(existingUser, companyName);

            return new ResponseEntity<>(
                    ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);

        } catch (EmployeeException employeeException) {
            log.error("Error during user update: {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Error during user update: {}", exception.getMessage());
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_SAVE_USER), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteUser(String companyName, String Id) throws EmployeeException {
        try {
            String index = ResourceIdUtils.generateCompanyIndex(companyName);
            Collection<UserEntity> existingUser = this.getUserById(companyName, Id);

            if (existingUser == null) {
                log.error("User not found in this company {}", index);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.USER_NOT_FOUND)), HttpStatus.NOT_FOUND);
            }
             dao.delete(Id, companyName);
        } catch (EmployeeException employeeException) {
            log.error("Employee not found for company  {}", employeeException.getMessage());
            throw employeeException;
        } catch (Exception exception) {
            log.error("Error deleting user for company {}", exception.getMessage());
            throw new EmployeeException(
                    String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_DELETE_USER), companyName),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
