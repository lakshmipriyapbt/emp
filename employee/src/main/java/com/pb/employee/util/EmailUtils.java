package com.pb.employee.util;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.File;

@Slf4j
@Component
public class EmailUtils {

    @Value("${mail.subject}")
    public String subject;

    @Value("${mail.text}")
    public String text;

    @Value("${registration.mail.subject}")
    public String registrationSubject;

    @Value("${registration.mail.text}")
    public String registrationText;

    @Autowired
    public JavaMailSender javaMailSender;

    public void sendRegistrationEmail(String emailId, String url,String name, String defaultPassword) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(emailId);
        mailMessage.setSubject(subject);

        String mailText = text;
        // Replace placeholders in the mail text
        String formattedText = mailText.replace("{emailId}", emailId);
        formattedText = formattedText.replace("{url}", url);  // Finally replace the URL
        formattedText = formattedText.replace("{name}", name);// Finally replace the URL
        formattedText = formattedText.replace("{password}", defaultPassword);

        mailMessage.setText(formattedText);
        javaMailSender.send(mailMessage);
        log.info("Credentials sent to the Email...");
    }


    public void sendCompanyRegistrationEmail(String emailId, String url,String name, String defaultPassword) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(emailId);
        mailMessage.setSubject(registrationSubject);

        String mailText = registrationText;
        // Replace placeholders in the mail text
        String formattedText = mailText.replace("{emailId}", emailId);
        formattedText = formattedText.replace("{name}", name);// Finally replace the URL
        formattedText = formattedText.replace("{password}", defaultPassword);

        mailMessage.setText(formattedText);
        javaMailSender.send(mailMessage);
        log.info("Credentials sent to the Email...");
    }
    public static String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme(); // http or https
        String serverName = request.getServerName(); // localhost or IP address
        return scheme + "://" + serverName + "/";
    }

    public void sendPDFEmail(String emailId, String firstName,String lastName,String month,String year,File pdfAttachment) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(emailId);
            helper.setSubject("Your Payslip for " + month + " " + year + " is Ready");

            String fullName = firstName + " " + lastName;

            String mailBody = String.format(
                    """
                            Hello %s,
                            
                            Your payslip for the month of %s %s is now available as an attachment.
                            
                            Best regards,
                            HR Team""", fullName, month, year);

            helper.setText(mailBody);

            helper.addAttachment("Payslip_" + month + " " + year + ".pdf", pdfAttachment);

            javaMailSender.send(message);
            log.info("Payslip email sent with PDF to {}", emailId);

        } catch (MessagingException e) {
            log.error("Failed to send email with PDF to {}: {}", emailId, e.getMessage(), e);
        }
    }

}
