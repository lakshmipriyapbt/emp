package com.pb.ems.serviceImpl;

import com.pb.ems.auth.JwtTokenUtil;
import com.pb.ems.common.ResponseBuilder;
import com.pb.ems.exception.ErrorMessageHandler;
import com.pb.ems.exception.IdentityErrorMessageKey;
import com.pb.ems.exception.IdentityException;
import com.pb.ems.model.*;
import com.pb.ems.opensearch.OpenSearchOperations;
import com.pb.ems.persistance.Entity;
import com.pb.ems.service.LoginService;
import com.pb.ems.util.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class LoginServiceImpl implements LoginService {

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${mail.subject}")
    private String subject;

    @Value("${mail.text}")
    private String text;

    @Value("${mail.subject.otp}")
    private String otpSubject;

    @Value("${mail.text.otp}")
    private String otpText;
    /**
     * @param request
     * @return
     */
    @Override
    public ResponseEntity<?> login(LoginRequest request) throws IdentityException {
        try {
            EmployeeEntity user = openSearchOperations.getEMSAdminById(request.getUsername());
            if (user != null && user.getPassword() != null) {
                String password = new String(Base64.getDecoder().decode(user.getPassword()), StandardCharsets.UTF_8);
                if (request.getPassword().equals(password)) {
                    log.debug("Successfully logged into ems portal for {}", request.getUsername());
                } else {
                    log.error("Invalid credentials");
                    throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_CREDENTIALS),
                            HttpStatus.FORBIDDEN);
                }
            } else {
                log.error("Invalid credentials");
                throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_CREDENTIALS),
                        HttpStatus.FORBIDDEN);
            }
        } catch (Exception e) {
            log.error("Invalid creds {}", e.getMessage(), e);
            throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_CREDENTIALS),
                    HttpStatus.FORBIDDEN);
        }
        List<String> roles = new ArrayList<>();
        roles.add(Constants.EMS_ADMIN);
        String token = JwtTokenUtil.generateToken(request.getUsername(), roles);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(new LoginResponse(token, null)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> employeeLogin(EmployeeLoginRequest request) throws IdentityException, IOException {
        EmployeeEntity employee = null;
        UserEntity userEntity = null;
        Object entity = null;
        DepartmentEntity department;
        String password = null;
        try {
            userEntity = openSearchOperations.getUserById(request.getUsername(), request.getCompany());

            if (userEntity != null && userEntity.getPassword() != null) {
                password = new String(Base64.getDecoder().decode(userEntity.getPassword()), StandardCharsets.UTF_8);
                if (request.getPassword().equals(password)) {
                    log.debug("Successfully logged into ems portal for {}", request.getUsername());
                } else {
                    log.error("Invalid credentials");
                    throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_CREDENTIALS),
                            HttpStatus.FORBIDDEN);
                }
            }else {
                employee = openSearchOperations.getEmployeeById(request.getUsername(), request.getCompany());
                if (employee != null && employee.getPassword() != null) {
                    validateEmployee(employee);
                    password = new String(Base64.getDecoder().decode(employee.getPassword()), StandardCharsets.UTF_8);
                    if (request.getPassword().equals(password)) {
                        log.debug("Successfully logged into ems portal for {}", request.getUsername());
                    } else {
                        log.error("Invalid credentials");
                        throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_CREDENTIALS),
                                HttpStatus.FORBIDDEN);
                    }
                }
            }
            if (employee == null && userEntity == null) {
                log.error("Invalid credentials");
                throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_CREDENTIALS),
                        HttpStatus.FORBIDDEN);
            }
        }catch (IdentityException identityException){
            throw identityException;
        } catch (Exception e) {
            log.error("Invalid creds {}", e.getMessage(), e);
            throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_CREDENTIALS),
                    HttpStatus.FORBIDDEN);
        }
        Long otp = generateOtp();
        CompletableFuture.runAsync(() -> {
            try {
                sendOtpByEmail(request.getUsername(), otp);
            } catch (Exception e) {
                log.error("Unable to generate and send otp ");
                throw new RuntimeException(e);
            }
        });
        List<String> roles = new ArrayList<>();
        String token = "";
        if(userEntity==null) {
            openSearchOperations.saveOtpToEmployee(employee, otp, request.getCompany());
            if (employee.getEmployeeType().equals(Constants.EMPLOYEE_TYPE)) {
                roles.add(Constants.COMPANY_ADMIN);
            }else {
                roles.add(Constants.EMPLOYEE);
            }
            token = JwtTokenUtil.generateEmployeeToken(employee.getId(), roles, request.getCompany(), request.getUsername());
        }else {
            openSearchOperations.saveOtpToUser(userEntity, otp, request.getCompany());
            roles.add(userEntity.getUserType());
            token = JwtTokenUtil.generateEmployeeToken(userEntity.getId(), roles, request.getCompany(), request.getUsername());
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(new LoginResponse(token, null)), HttpStatus.OK);
    }

    private void validateEmployee(EmployeeEntity employee) throws IdentityException {
        if (employee.getStatus().equalsIgnoreCase(Constants.PENDING)){
            log.error("Employee is not active");
            throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.COMPANY_UNDER_REVIEW),
                    HttpStatus.FORBIDDEN);
        }else if (!employee.getStatus().equalsIgnoreCase(Constants.ACTIVE)){
            log.error("Employee is not active");
            throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.EMPLOYEE_INACTIVE),
                    HttpStatus.FORBIDDEN);
        }
    }

    private void sendOtpByEmail(String emailId, Long otp) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(emailId);
        mailMessage.setSubject(subject);
        String mailText = text;
        String formattedText = mailText.replace("{emailId}", emailId).replace("{otp}", otp.toString());

        mailMessage.setText(formattedText);
        javaMailSender.send(mailMessage);
        log.info("OTP sent successfully....");//otp is send succesfully...
    }

    private void sendOtpByEmailForPassword(String emailId, Long otp) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(emailId);
        mailMessage.setSubject(otpSubject);
        String mailText = otpText;
        String formattedText = mailText.replace("{emailId}", emailId).replace("{otp}", otp.toString());

        mailMessage.setText(formattedText);
        javaMailSender.send(mailMessage);
        log.info("OTP sent successfully....");//otp is send succesfully...
    }

    @Override
    public ResponseEntity<?> logout(OTPRequest loginRequest) {
        return null;
    }

    @Override
    public ResponseEntity<?> validateCompanyOtp(OTPRequest request) throws IdentityException {
        EmployeeEntity user = null;
        UserEntity userEntity=null;
        try {
            userEntity = openSearchOperations.getUserById(request.getUsername(),request.getCompany());

            if (userEntity == null) {
                user = openSearchOperations.getEmployeeById(request.getUsername(), request.getCompany());

                if (user==null) {
                    log.debug("checking the user details..");
                    throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.USER_NOT_FOUND),
                            HttpStatus.NOT_FOUND);
                }
            }
            if (userEntity != null && userEntity.getOtp() != null) {
                Long otp = userEntity.getOtp();
                long currentTime = Instant.now().getEpochSecond();
                log.debug("the user found checking the otp..");

                Long userOtp = Long.valueOf(request.getOtp());
                if (!userOtp.equals(otp)) {
                    log.error("Invalid OTP for user.. ");
                    throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_OTP),
                            HttpStatus.FORBIDDEN);
                }

                if (currentTime > userEntity.getExpiryTime()) {
                    log.error("OTP expired for user..." );
                    throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.OTP_EXPIRED),
                            HttpStatus.FORBIDDEN);
                }
                // Clear OTP and expiry time
                userEntity.setOtp(null);
                userEntity.setExpiryTime(null);

                openSearchOperations.updateUser(userEntity,request.getCompany());

            }
            else if (user != null && user.getOtp() != null) {
                Long otp = user.getOtp();
                long currentTime = Instant.now().getEpochSecond();
                log.debug("the user found checking the otp..");

                Long userOtp = Long.valueOf(request.getOtp());
                if (!userOtp.equals(otp)) {
                    log.error("Invalid OTP for user.. ");
                    throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_OTP),
                            HttpStatus.FORBIDDEN);
                }

                if (currentTime > user.getExpiryTime()) {
                    log.error("OTP expired for user..." );
                    throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.OTP_EXPIRED),
                            HttpStatus.FORBIDDEN);
                }
                // Clear OTP and expiry time
                user.setOtp(null);
                user.setExpiryTime(null);
                openSearchOperations.updateEmployee(user,request.getCompany());


            }
            else {
                log.error("Invalid credentials for user..");
                throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_CREDENTIALS),
                        HttpStatus.FORBIDDEN);
            }
        } catch (IdentityException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error validating OTP for user.." ,e.getMessage(), e);
            throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_CREDENTIALS),
                    HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    private Long generateOtp() {
        Random random = new Random();
//        Long otp = 100000 + random.nextLong(900000);
        //TODO for now harding  the OTP value
        Long otp = 123456L;
        return otp;
    }

    @Override
    public ResponseEntity<?> updateEmsAdmin(LoginRequest request) throws IdentityException {
        try{
            EmployeeEntity user = openSearchOperations.getEMSAdminById(request.getUsername());
            if(user == null ) {
                throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_USERNAME),
                        HttpStatus.BAD_REQUEST);
            }
        } catch (Exception ex ){
            log.error("Exception while fetching user {}, {}", request.getUsername(), ex);
            throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_USERNAME),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
        String newPassword = Base64.getEncoder().encodeToString(request.getPassword().toString().getBytes());

        String id = Constants.EMS_ADMIN+"_"+request.getUsername();
        Entity entity = EmployeeEntity.builder().
                emailId(request.getUsername()).
                password(newPassword).build();
        openSearchOperations.saveEntity(entity, id, Constants.INDEX_EMS);
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> forgotPassword(EmployeePasswordRequest loginRequest) throws IdentityException {
        EmployeeEntity user ;
        UserEntity userEntity = null;

        try {
            userEntity = openSearchOperations.getUserById(loginRequest.getUsername(), loginRequest.getCompany());
            if (userEntity != null){
                Long otp = generateOtp();
                sendOtpByEmailForPassword(loginRequest.getUsername(), otp);
                openSearchOperations.saveOtpToUser(userEntity, otp, loginRequest.getCompany());
            }else if (userEntity == null) {
                user = openSearchOperations.getEmployeeById(loginRequest.getUsername(), loginRequest.getCompany());
                if(user==null) {
                    log.debug("checking the user details..");
                    throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.USER_NOT_FOUND),
                            HttpStatus.NOT_FOUND);
                }
                Long otp = generateOtp();
                sendOtpByEmailForPassword(loginRequest.getUsername(), otp);
                openSearchOperations.saveOtpToEmployee(user, otp, loginRequest.getCompany());
            }

        }catch (IdentityException identityException){
            log.error("Exception while fetching user {}, {}", loginRequest.getUsername(), identityException.getMessage());
            throw identityException;
        }
        catch (Exception ex) {
            log.error("Exception while fetching user {}, {}", loginRequest.getUsername(), ex);
            throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_USERNAME),
                    HttpStatus.INTERNAL_SERVER_ERROR);

        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<?> updatePasswordForForgot(EmployeePasswordforgot otpRequest) throws IdentityException {
        EmployeeEntity user = null;
        UserEntity userEntity = null;
        String oldPassword = null;

        try {
            userEntity = openSearchOperations.getUserById(otpRequest.getUsername(), otpRequest.getCompany());

            List<CompanyEntity>  employee = openSearchOperations.getCompanyByData(null, Constants.COMPANY, otpRequest.getCompany());
            if (userEntity == null) {
                user = openSearchOperations.getEmployeeById(otpRequest.getUsername(), otpRequest.getCompany());
                if (user == null){
                    log.debug("checking the user details..");
                    throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.USER_NOT_FOUND),
                            HttpStatus.NOT_FOUND);
                }
                oldPassword = new String(Base64.getDecoder().decode(user.getPassword().getBytes()));
            } else {
                 oldPassword = new String(Base64.getDecoder().decode(userEntity.getPassword().getBytes()));
            }
            if (otpRequest.getPassword().equals(oldPassword)) {
                log.error("you can't update with the previous password");
                return new ResponseEntity<>(ResponseBuilder.builder().build().createFailureResponse(new
                        Exception(String.valueOf(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.USED_PASSWORD)))),
                        HttpStatus.CONFLICT);
            }

            String newPassword = Base64.getEncoder().encodeToString(otpRequest.getPassword().toString().getBytes());

            for (CompanyEntity companyEntity:employee) {
                if (companyEntity != null) {
                    companyEntity.setPassword(newPassword);
                    openSearchOperations.updateCompany(companyEntity);
                }
            }
            if(userEntity == null) {
                user.setPassword(newPassword);
                openSearchOperations.updateEmployee(user, otpRequest.getCompany());
            }else {
                userEntity.setPassword(newPassword);
                openSearchOperations.updateUser(userEntity, otpRequest.getCompany());
            }

        } catch (Exception ex) {
            log.error("Exception while fetching user {}, {}", otpRequest.getUsername(), ex);
            throw new IdentityException(ErrorMessageHandler.getMessage(IdentityErrorMessageKey.INVALID_USERNAME),
                    HttpStatus.INTERNAL_SERVER_ERROR);

        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

}