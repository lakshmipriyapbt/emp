package com.pb.employee.controller;

import com.pb.employee.request.FeedbackRequest;
import com.pb.employee.service.FeedbackService;
import com.pb.employee.util.Constants;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class FeedbackController {

    @Autowired
    FeedbackService feedbackService;

    @RequestMapping(value = "/feedback", method = RequestMethod.POST)
    @io.swagger.v3.oas.annotations.Operation(security = {@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = Constants.AUTH_KEY)},
            summary = "${api.feedbackForm.tag}", description = "${api.feedbackForm.description}")
    @ResponseStatus(HttpStatus.CREATED)
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "CREATED")
    public ResponseEntity<?> submitFeedback(@Parameter(hidden = true, required = true, description = "${apiAuthToken.description}")
                                            @RequestHeader(Constants.AUTH_KEY) String authToken,
                                            @RequestBody @Valid FeedbackRequest feedbackRequest,
                                            HttpServletRequest request) throws IOException {

        return feedbackService.submitFeedback(feedbackRequest, request);
    }

}
