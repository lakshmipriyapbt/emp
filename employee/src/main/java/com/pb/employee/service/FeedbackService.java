package com.pb.employee.service;

import com.pb.employee.request.FeedbackRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface FeedbackService {
    ResponseEntity<?> submitFeedback(FeedbackRequest feedbackRequest, HttpServletRequest request) throws IOException;
}
