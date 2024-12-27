package com.invoice.serviceImpl;

import com.invoice.common.ResponseBuilder;
import com.invoice.exception.InvoiceErrorMessageKey;
import com.invoice.exception.InvoiceException;
import com.invoice.mappers.UserMapper;
import com.invoice.model.UserModel;
import com.invoice.repository.UserRepository;
import com.invoice.request.UserRequest;
import com.invoice.service.UserService;
import com.invoice.util.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

        @Override
        public ResponseEntity<?> createUser(UserRequest userRequest) throws InvoiceException {
            log.debug("Creating user: {}", userRequest);
            try {
                if (userRepository.existsByuserEmail(userRequest.getUserEmail())) {
                    log.error("User creation failed: Email already exists - {}", userRequest.getUserEmail());
                    throw new InvoiceException(InvoiceErrorMessageKey.EMAIL_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
                }
                UserModel userModel = new UserModel();
                userModel.setUserName(userRequest.getUserName());
                userModel.setUserEmail(userRequest.getUserEmail());
                userModel.setPassword(userRequest.getPassword());
                userModel.setRole(userRequest.getRole());
                userRepository.save(userModel);

                log.info("User created successfully with ID: {}", userModel.getUserId());
                return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.CREATE_SUCCESS), HttpStatus.CREATED);
            } catch (Exception e) {
                log.error("Unexpected error occurred while creating user: {}", userRequest.getUserName());
                throw new InvoiceException(InvoiceErrorMessageKey.ERROR_CREATING_USER, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

    @Override
    public ResponseEntity<?> getUser(Long userId) throws InvoiceException {
        log.debug("Retrieving user with ID: {}", userId);
        try {
            Optional<UserModel> user = userRepository.findById(String.valueOf(userId));
            if (userRepository.existsById(String.valueOf(userId))) {
                log.info("User retrieved successfully with ID: {}", userId);
                UserModel userModel = user.get();
                Map<String, Object> responseMap = new HashMap<>();
                responseMap.put(Constants.USER_ID, userModel.getUserId());
                responseMap.put(Constants.PASSWORD, userModel.getPassword());
                responseMap.put(Constants.USER_NAME, userModel.getUserName());
                responseMap.put(Constants.EMAIL_ID, userModel.getUserEmail());
                responseMap.put(Constants.ROLES, userModel.getRole());
                return ResponseEntity.ok(responseMap);
            } else {
                log.error("User not found with ID: {}", userId);
                throw new InvoiceException(InvoiceErrorMessageKey.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
        } catch (InvoiceException e) {
            log.error("Custom error occurred while retrieving user with ID {}: {}", userId, e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.ERROR_CREATING_CUSTOMER, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> getAllUsers() throws InvoiceException {
        log.debug("Retrieving all users");
        try {
            List<UserModel> users = userRepository.findAll();
            if (users == null || users.isEmpty()) {
                log.info("No users found in the database.");
                return ResponseEntity.ok(Collections.emptyList());
            }
            log.info("Total users retrieved: {}", users.size());
            List<Map<String, Object>> responseList = users.stream()
                    .map(userMapper::toResponseMap)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseList);
        } catch (ResponseStatusException e) {
            log.error("Custom error while retrieving all users: {}", e.getReason(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.ERROR_RETRIEVING_USERS, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> deleteUser(Long userId) throws InvoiceException {
        log.info("Attempting to delete user with ID: {}", userId);
        try {
            if (userRepository.existsById(String.valueOf(userId))) {
                log.debug("User with ID: {} found. Proceeding with deletion.", userId);
                userRepository.deleteById(String.valueOf(userId));
                log.info("User with ID: {} deleted successfully.", userId);
                return ResponseEntity.ok(ResponseBuilder.createSuccessResponse(null, Constants.USER_DELETED_SUCCESS));
            } else {
                log.error("No user found with ID: {}", userId);
                throw new InvoiceException(Constants.NO_USERS_FOUND, HttpStatus.NOT_FOUND);
            }
        } catch (InvoiceException e) {
            log.error("InvoiceException encountered while deleting user with ID: {}. Message: {}", userId, e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.ERROR_CREATING_USER, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity<?> updateUser(Long userId, UserRequest userRequest) throws InvoiceException {
        log.debug("Attempting to update user with ID: {}", userId);
        try {
            UserModel existingUser = userRepository.findById(String.valueOf(userId))
                    .orElseThrow(() -> {
                        log.error("User not found for ID: {}", userId);
                        return new InvoiceException(InvoiceErrorMessageKey.USER_NOT_FOUND, HttpStatus.NOT_FOUND);});

            log.info("Existing user details: {}", existingUser);
            if (userRequest.getUserEmail() != null) {
                String newEmail = userRequest.getUserEmail();
                boolean emailExists = userRepository.existsByuserEmailAndUserIdNot(newEmail, userId);
                if (emailExists) {
                    log.error("Email '{}' is already in use by another user.", newEmail);
                    throw new InvoiceException(InvoiceErrorMessageKey.EMAIL_ALREADY_EXISTS, HttpStatus.CONFLICT);
                }
                existingUser.setUserEmail(newEmail);
                log.info("Email updated for user with ID: {}", userId);
            }
            if (userRequest.getUserName() != null) {
                existingUser.setUserName(userRequest.getUserName());
                log.info("Username updated for user with ID: {}", userId);
            }
            if (userRequest.getPassword() != null) {
                existingUser.setPassword(userRequest.getPassword());
                log.info("Password updated for user with ID: {}", userId);
            }
            if (userRequest.getRole() != null) {
                existingUser.setRole(userRequest.getRole());
                log.info("Role updated for user with ID: {}", userId);
            }
            UserModel updatedUser = userRepository.save(existingUser);
            log.info("User updated successfully with ID: {}", updatedUser.getUserId());
            Map<String, Object> response = new HashMap<>();
            response.put(Constants.USER_ID, updatedUser.getUserId());
            response.put(Constants.USER_NAME, updatedUser.getUserName());
            response.put(Constants.EMAIL_ID, updatedUser.getUserEmail());
            response.put(Constants.ROLES, updatedUser.getRole());
            log.info("User updated successfully with ID: {}", updatedUser.getUserId());
            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.CREATE_SUCCESS), HttpStatus.CREATED);
        } catch (InvoiceException e) {
            log.error("InvoiceException occurred while updating user with ID {}: {}", userId, e.getMessage(), e);
            throw new InvoiceException(InvoiceErrorMessageKey.ERROR_UPDATING_USER, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

