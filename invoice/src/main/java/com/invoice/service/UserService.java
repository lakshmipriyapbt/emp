package com.invoice.service;

import com.invoice.exception.InvoiceException;
import com.invoice.request.UserRequest;
import org.springframework.http.ResponseEntity;

public interface UserService {

    ResponseEntity<?> createUser(UserRequest userRequest) throws InvoiceException;

    ResponseEntity<?> getUser(Long userId) throws InvoiceException;

    ResponseEntity<?> getAllUsers() throws InvoiceException;

    ResponseEntity<?> deleteUser(Long userId) throws InvoiceException;

    ResponseEntity<?> updateUser(Long userId, UserRequest userRequest) throws InvoiceException;
}
