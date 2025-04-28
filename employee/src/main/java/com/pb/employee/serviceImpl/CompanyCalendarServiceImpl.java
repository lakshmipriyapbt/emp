package com.pb.employee.serviceImpl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.common.ResponseBuilder;
import com.pb.employee.dao.CompanyCalendarDao;
import com.pb.employee.exception.EmployeeErrorMessageKey;
import com.pb.employee.exception.EmployeeException;
import com.pb.employee.exception.ErrorMessageHandler;
import com.pb.employee.model.ResourceType;
import com.pb.employee.opensearch.OpenSearchOperations;
import com.pb.employee.persistance.model.*;
import com.pb.employee.request.CompanyCalendarPayload.CompanyCalendarRequest;
import com.pb.employee.request.CompanyCalendarPayload.CompanyCalendarResponse;
import com.pb.employee.request.CompanyCalendarPayload.CompanyCalendarUpdateRequest;
import com.pb.employee.request.CompanyCalendarPayload.EmployeesDayEntity;
import com.pb.employee.service.CompanyCalenderService;
import com.pb.employee.util.Constants;
import com.pb.employee.util.ResourceIdUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class CompanyCalendarServiceImpl implements CompanyCalenderService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CompanyCalendarDao dao;

    @Autowired
    private OpenSearchOperations openSearchOperations;

    @Override
    public ResponseEntity<?> createCompanyCalendar(String companyName, CompanyCalendarRequest createPayload)
            throws EmployeeException {
        try {
            String resourceId = ResourceIdUtils.generateCompanyCalenderId(companyName, createPayload.getYear());
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            Collection<CompanyCalendarEntity> calendarEntities = this.getCompanyCalender(companyName, resourceId);
            if (!calendarEntities.isEmpty()){
                log.error("Company calendar details is already exist");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_CALENDAR_ALREADY_EXIST), HttpStatus.FORBIDDEN);
            }
            CompanyCalendarEntity calendarEntity = objectMapper.convertValue(createPayload, CompanyCalendarEntity.class);
            calendarEntity.setId(resourceId);
            calendarEntity.setCompanyId(companyEntity.getId());
            calendarEntity.setType(ResourceType.COMPANY_CALENDAR.value());
            dao.save(calendarEntity, companyName);
        }catch (EmployeeException e){
            log.error("Exception while adding the company calendar details: {}", createPayload.getYear());
            throw e;
        } catch (Exception e) {
            log.error("Exception while adding the companyCalender details");
            throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_ADD_COMPANY_CALENDAR), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
                ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.CREATED
        );
    }

    @Override
    public Collection<CompanyCalendarEntity> getCompanyCalender(String companyName, String calendarId)
            throws EmployeeException {
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            log.debug("Getting Company Calendar by companyName: {}", companyName);
            return dao.getCompanyCalendar(companyName, calendarId, companyEntity.getId());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<?> updateCompanyCalendar(String companyName, String id, CompanyCalendarUpdateRequest updatePayload)
            throws EmployeeException {
        try {
            log.debug("validating id {}  existence ", id);
            CompanyCalendarEntity companyCalendarEntity = null;
            try {
                CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
                if (companyEntity == null){
                    log.error("Exception while fetching the company calendar details");
                    throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
                }
                Collection<CompanyCalendarEntity> companyCalendarEntities = this.getCompanyCalender(companyName, id);
                if (Objects.isNull(companyCalendarEntities) || companyCalendarEntities.isEmpty()) {
                    log.error("Company calendar does not existed for id {}", id);
                    throw new RuntimeException();
                }

                companyCalendarEntity = dao.get(companyCalendarEntities.stream().findFirst().get().getId(), companyName).orElseThrow();
            } catch (EmployeeException e) {
                log.error("Unable to get the company calendar for id {}", id);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_CALENDAR_NOT_FOUND), id),
                        HttpStatus.BAD_REQUEST);
            }

            try {
                CompanyCalendarEntity calendarSrc = objectMapper.convertValue(updatePayload, CompanyCalendarEntity.class);
                BeanUtils.copyProperties(calendarSrc, companyCalendarEntity, getNullPropertyNames(calendarSrc));
                dao.save(calendarSrc, companyName);
            } catch (Exception exception) {
                log.error("Unable to update the company calendar details for id {} with the reason of {}", id, exception.getMessage());
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_UPDATE_COMPANY_CALENDAR), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            throw new EmployeeException(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(ResponseBuilder.builder().build().createSuccessResponse(Constants.SUCCESS), HttpStatus.OK);
    }

    @Override
    public void deleteCompanyCalendar(String companyName, String calendarId) throws EmployeeException {
        log.debug("validating id: {}  existed ", companyName);
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null){
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST), HttpStatus.NOT_FOUND);
            }
            Collection<CompanyCalendarEntity> calendarResPayloads = this.getCompanyCalender(companyName, calendarId);
            if (Objects.isNull(calendarResPayloads) || calendarResPayloads.isEmpty()) {
                log.error("Company calendar not existed for id: {}", calendarId);
                throw new EmployeeException(String.format(ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_CALENDAR_NOT_FOUND), calendarId),
                        HttpStatus.BAD_REQUEST);
            }
            dao.delete(calendarId, companyName);
            log.info("The company calendar with id: {} got deleted successfully", calendarId);
        } catch (EmployeeException e) {
            throw new EmployeeException(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Override
    public CompanyCalendarResponse getTodayCompanyCalender(String companyName) throws EmployeeException {
        CompanyCalendarResponse companyCalendarResponse = new CompanyCalendarResponse();
        try {
            CompanyEntity companyEntity = openSearchOperations.getCompanyByCompanyName(companyName, Constants.INDEX_EMS);
            if (companyEntity == null) {
                log.error("Exception while fetching the company calendar details");
                throw new EmployeeException(
                        ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_NOT_EXIST),
                        HttpStatus.NOT_FOUND);
            }

            LocalDate today = LocalDate.now();
            String year = String.valueOf(today.getYear());
            String month = String.format("%02d", today.getMonthValue());

            companyCalendarResponse.setYear(year);
            companyCalendarResponse.setMonth(month);

            Collection<CompanyCalendarEntity> calendar = dao.getCompanyCalendarByYear(companyName, year, companyEntity.getId());
            if (calendar.isEmpty()) {
                log.error("Company calendar for the year {} is not found", year);
                throw new EmployeeException(
                        ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.COMPANY_YEAR_CALENDAR_NOT_FOUND),
                        HttpStatus.NOT_FOUND);
            }

            // Extract today's holidays
            List<HolidaysEntity> todayHolidays = calendar.stream()
                    .flatMap(cal -> cal.getDateEntityList().stream())
                    .filter(date -> date.getMonth().equals(month))
                    .flatMap(date -> date.getHolidaysEntities().stream())
                    .filter(holiday -> holiday.getDate().equals(String.format("%02d", today.getDayOfMonth())))
                    .toList();

            companyCalendarResponse.setHolidaysEntities(todayHolidays);

            // Add today's employee events
            List<EmployeeEntity> employeeEntities = openSearchOperations.getCompanyEmployees(companyName);
            if (employeeEntities != null) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                for (EmployeeEntity employee : employeeEntities) {
                    addEmployeeEvents(employee, companyCalendarResponse, formatter);
                }
            }

        } catch (EmployeeException e) {
            log.error("Exception occurred while fetching today's company calendar details", e);
            throw e;
        } catch (Exception exception) {
            log.error("Exception while fetching the today's company calendar", exception);
            throw new EmployeeException(
                    ErrorMessageHandler.getMessage(EmployeeErrorMessageKey.UNABLE_GET_TODAY_COMPANY_CALENDAR),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return companyCalendarResponse;
    }


    private void addEmployeeEvents(EmployeeEntity employee, CompanyCalendarResponse response, DateTimeFormatter formatter) {
        LocalDate today = LocalDate.now();
        String currentDay = String.format("%02d", today.getDayOfMonth());

        if (response.getEmployeesDayEntities() == null) {
            response.setEmployeesDayEntities(new ArrayList<>());
        }

        // Joining Date
        if (employee.getDateOfHiring() != null && !employee.getDateOfHiring().isEmpty()) {
            LocalDate hiringDate = LocalDate.parse(employee.getDateOfHiring(), formatter);
            if (hiringDate.getDayOfMonth() == today.getDayOfMonth() && hiringDate.getMonth() == today.getMonth()) {
                EmployeesDayEntity joinEvent = new EmployeesDayEntity();
                joinEvent.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
                joinEvent.setDate(currentDay);
                joinEvent.setTheme("primary");

                if (hiringDate.getYear() == today.getYear()) {
                    joinEvent.setEvent(Constants.WELCOME_WISH);
                } else {
                    int years = today.getYear() - hiringDate.getYear();
                    String yearSuffix = getYearSuffix(years);
                    joinEvent.setEvent(Constants.HAPPY + " " + years + yearSuffix + " " + Constants.ANNIVERSARY);
                }

                response.getEmployeesDayEntities().add(joinEvent);
            }
        }

        // Birthday
        if (employee.getDateOfBirth() != null && !employee.getDateOfBirth().isEmpty()) {
            LocalDate dob = LocalDate.parse(employee.getDateOfBirth(), formatter);
            if (dob.getDayOfMonth() == today.getDayOfMonth() && dob.getMonth() == today.getMonth()) {
                EmployeesDayEntity dobEvent = new EmployeesDayEntity();
                dobEvent.setEvent(Constants.BIRTHDAY_WISH);
                dobEvent.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
                dobEvent.setDate(currentDay);
                dobEvent.setTheme("primary");

                response.getEmployeesDayEntities().add(dobEvent);
            }
        }
    }

    private String getYearSuffix(int year) {
        if (year >= 11 && year <= 13) return "th";
        switch (year % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }



    private String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        Set<String> emptyNames = new HashSet<>();
        for (var pd : src.getPropertyDescriptors()) {
            Object value = src.getPropertyValue(pd.getName());
            if (value == null) {
                emptyNames.add(pd.getName());
            }
        }
        return emptyNames.toArray(new String[0]);
    }

}
