package com.pb.employee.serviceImpl;

import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.service.DialCodeService;
import com.pb.employee.util.Constants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.*;

@Service
@Slf4j
public class DialCodeServiceImpl implements DialCodeService {

    @Override
    public ResponseEntity<?> getDialCodes() throws EmployeeException {
        log.info("Fetching Dial Codes");
        List<Map<String, String>> dialCodesList = new ArrayList<>();

        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(Constants.DIALCODES);
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {

            String line;
            while ((line = reader.readLine()) != null) {
                Map<String, String> dialCodeMap = new HashMap<>();

                String[] parts = line.split(",\\s*");
                for (String part : parts) {
                    String[] keyValue = part.split(":", 2);
                    if (keyValue.length == 2) {
                        String key = keyValue[0].trim();
                        String value = keyValue[1].replaceAll("'", "").trim();
                        dialCodeMap.put(key, value);
                    }
                }
                dialCodesList.add(dialCodeMap);
            }
            dialCodesList.sort(Comparator.comparing(map -> map.get(Constants.NAME), String.CASE_INSENSITIVE_ORDER));

            return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(dialCodesList), HttpStatus.OK);
        }
       catch (Exception e) {
                log.error("Exception while getting Dial Codes: {}", e.getMessage());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_DIAL_CODES),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
    }

}
