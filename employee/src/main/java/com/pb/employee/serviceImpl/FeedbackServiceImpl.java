package com.pb.employee.serviceImpl;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.request.FeedbackRequest;
import com.pb.employee.service.FeedbackService;
import com.pb.employee.util.Constants;
import com.pb.employee.util.EmailUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final EmailUtils emailUtils;

    @Override
    public ResponseEntity<?> submitFeedback(FeedbackRequest feedbackRequest, HttpServletRequest request) throws IOException {
        CompletableFuture.runAsync(() -> {
            try {

                emailUtils.sendFeedbackEmail(feedbackRequest.getSenderEmail(), feedbackRequest.getDescription());
                emailUtils.sendAcknowledgementEmail(feedbackRequest.getSenderEmail());

                log.info("Feedback email sent successfully from {}", feedbackRequest.getSenderEmail());
            } catch (Exception e) {
                log.error("Error sending feedback email from {}: {}", feedbackRequest.getSenderEmail(), e.getMessage());
                throw new RuntimeException(e);
            }
        });

        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED);    }
}
