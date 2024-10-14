package com.pb.employee.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pb.employee.persistance.model.AttendanceEntity;
import com.pb.employee.persistance.model.EmployeeSalaryEntity;
import com.pb.employee.persistance.model.PayslipEntity;
import com.pb.employee.persistance.model.SalaryEntity;
import com.pb.employee.request.PayslipRequest;
import com.pb.employee.request.PayslipUpdateRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.util.*;

@Component
@Service
@Slf4j
public class PayslipUtils {

    public static PayslipEntity unMaskEmployeePayslipProperties(EmployeeSalaryEntity salaryRequest, PayslipRequest payslipRequest, String id, String employeeId, AttendanceEntity attendanceEntity) {
        Double var = null, fix = null, bas, gross = null;
        Double te = null, pfE = null, pfEmployer = null, lop = null, tax = null, itax = null, ttax = null, tded = null, net = null;
        int totalWorkingDays = 0, noOfWorkingDays=0;
        double basic;
        String email=null, firstname=null, lastName=null;

        ObjectMapper objectMapper = new ObjectMapper();


        AttendanceEntity attendance = objectMapper.convertValue(attendanceEntity,AttendanceEntity.class);
        EmployeeSalaryEntity salary = objectMapper.convertValue(salaryRequest,EmployeeSalaryEntity.class);


        if (attendance.getNoOfWorkingDays() !=null){
            byte[] decodedFix = Base64.getDecoder().decode(attendance.getNoOfWorkingDays());
            noOfWorkingDays= Integer.parseInt(new String(decodedFix));
            attendance.setNoOfWorkingDays(String.valueOf(noOfWorkingDays));
        }
        if (attendance.getTotalWorkingDays() !=null){
            byte[] decodedFix = Base64.getDecoder().decode(attendance.getTotalWorkingDays());
            totalWorkingDays= Integer.parseInt(new String(decodedFix));
            attendance.setTotalWorkingDays(String.valueOf(totalWorkingDays));
        }
        if (attendance.getEmailId() !=null){
            byte[] decodedFix = Base64.getDecoder().decode(attendance.getEmailId());
            email= new String(decodedFix);
            attendance.setEmailId(email);

        }
        if (attendance.getFirstName() !=null){
            byte[] decodedFix = Base64.getDecoder().decode(attendance.getFirstName());
            firstname= new String(decodedFix);
            attendance.setFirstName(firstname);
        }
        if (attendance.getLastName() !=null){
            byte[] decodedFix = Base64.getDecoder().decode(attendance.getLastName());
            lastName= new String(decodedFix);
            attendance.setLastName(lastName);
        }
        if (salaryRequest.getVariableAmount() != null) {
            byte[] decodedVar = Base64.getDecoder().decode(salaryRequest.getVariableAmount());
            var = Double.parseDouble(new String(decodedVar));
            salary.setVariableAmount(String.valueOf(var));
        }

        if (salaryRequest.getFixedAmount() != null) {
            byte[] decodedFix = Base64.getDecoder().decode(salaryRequest.getFixedAmount());
            fix = Double.parseDouble(new String(decodedFix));
            salary.setFixedAmount(String.valueOf(fix));

        }

        if (salaryRequest.getGrossAmount() != null) { //annual
            byte[] decodedGross = Base64.getDecoder().decode(salaryRequest.getGrossAmount());
            gross = Double.parseDouble(new String(decodedGross));
            salary.setGrossAmount(String.valueOf(gross));
        }

        if (noOfWorkingDays == 0){
            tax = 0.0;
            ttax = 0.0;
            itax=0.0;
            salary.setTotalTax(String.valueOf(ttax));
            salary.setPfTax(String.valueOf(tax));
            salary.setIncomeTax(String.valueOf(itax));
        }else {
            if (salaryRequest.getPfTax() != null) {
                byte[] decodedTax = Base64.getDecoder().decode(salaryRequest.getPfTax());
                tax = Double.parseDouble(new String(decodedTax));
                tax = tax / 12.0;
                salary.setPfTax(String.valueOf(Math.round(tax)));
            }
            if (salaryRequest.getIncomeTax() != null) {
                byte[] decodedItax = Base64.getDecoder().decode(salaryRequest.getIncomeTax());
                itax = Double.parseDouble(new String(decodedItax));
                itax = itax / 12.0;
                salary.setIncomeTax(String.valueOf(Math.round(itax)));

            }
            if (salaryRequest.getTotalTax() != null) {
                ttax = tax + itax;
                ttax = (double) Math.round(ttax);
                salary.setTotalTax(String.valueOf(ttax));
            }
        }
        double allowance = 0.0;
        if(salaryRequest.getSalaryConfigurationEntity().getAllowances() != null) {
            Map<String, String> decodedAllowances = new HashMap<>();

            for (Map.Entry<String, String> entry : salaryRequest.getSalaryConfigurationEntity().getAllowances().entrySet()) {
                String unmaskedValue = unMaskValue(entry.getValue());
                String calculatedValue = persentageOrValue(unmaskedValue, gross);
                decodedAllowances.put(entry.getKey(), calculatedValue);

                // Sum the allowances
                allowance += Double.parseDouble(calculatedValue);
            }
            salary.getSalaryConfigurationEntity().setAllowances(decodedAllowances);

        }


        double totalDeduction = 0.0;
        if (salaryRequest.getSalaryConfigurationEntity().getDeductions()!=null){
            Map<String, String> decodeDeductions = new HashMap<>();
            if (noOfWorkingDays == 0){
                for (Map.Entry<String, String> entry : salaryRequest.getSalaryConfigurationEntity().getDeductions().entrySet()){
                    decodeDeductions.put(entry.getKey(), String.valueOf(0));
                    totalDeduction = 0;
                }
                salary.getSalaryConfigurationEntity().setDeductions(decodeDeductions);
            }else {
                for (Map.Entry<String, String> entry : salaryRequest.getSalaryConfigurationEntity().getDeductions().entrySet()) {
                    String unmaskValues = unMaskValue(entry.getValue());
                    String calculatedValue = persentageOrValue(unmaskValues, gross);
                    decodeDeductions.put(entry.getKey(), calculatedValue);

                    totalDeduction += Double.parseDouble(calculatedValue);
                }

                salary.getSalaryConfigurationEntity().setDeductions(decodeDeductions);
            }
        }
        if (salaryRequest.getTotalEarnings() != null){
            te = allowance;
            salary.setTotalEarnings(String.valueOf(Math.round(te)));
        }
        if (noOfWorkingDays ==0){
            lop = te;
            totalDeduction +=lop;
        }else {
        int noOfLeaves = totalWorkingDays - noOfWorkingDays;
        if (noOfLeaves > 1) {
            double monthlySalary = (gross / 12);
            double perDaySalary = (monthlySalary / totalWorkingDays);
            lop = (noOfLeaves - 1) * perDaySalary;
            lop = (double) Math.round(lop);
            totalDeduction += lop;

        }else {
            lop = (double) 0;
        }
        }
        salary.setLop(String.valueOf(lop));
        salary.setTotalDeductions(String.valueOf(Math.round(totalDeduction)));



            net = te-totalDeduction-ttax;
            salary.setNetSalary(String.valueOf(Math.round(net)));


        PayslipEntity payslipEntity = objectMapper.convertValue(payslipRequest, PayslipEntity.class);

        payslipEntity.setPayslipId(id);
        payslipEntity.setAttendanceId(attendance.getAttendanceId());
        payslipEntity.setMonth(payslipRequest.getMonth());
        payslipEntity.setYear(payslipRequest.getYear());
        payslipEntity.setEmployeeId(employeeId);
        payslipEntity.setSalaryId(salaryRequest.getSalaryId());

            payslipEntity.setSalary(salary);
        payslipEntity.setAttendance(attendance);
        payslipEntity.setType(Constants.PAYSLIP);


        return payslipEntity;
    }
    private static String persentageOrValue(String decodedString, double grossAmount) {
        String result;
        if (decodedString.endsWith("%")){
            String percentageString = decodedString.replace("%", "");
            double percentage = Double.parseDouble(percentageString)/100;
            double monthlyValue = (percentage*grossAmount)/12;
            monthlyValue = Math.round(monthlyValue);
            result = String.valueOf(monthlyValue);

            return result;
        }else {
            double monthlyValue = Double.parseDouble(decodedString)/12;
            result = String.valueOf(Math.round(monthlyValue));
            return result;
        }
    }

    public static PayslipEntity maskEmployeePayslip(PayslipEntity payslipRequest, EmployeeSalaryEntity salaryRequest, AttendanceEntity attendance) {
        String var = null, fix = null, bas = null, gross = null;
        String hra = null, trav = null, pfc = null, other = null, spa = null;
        String te = null, pfE = null, pfEmployer = null, lop = null, tax = null, itax = null, ttax = null, tded = null, net = null;
        Map<String, String> allowances = new HashMap<>();
        Map<String, String> deductions = new HashMap<>();


        if (payslipRequest.getSalary().getFixedAmount() != null) {
            fix = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getFixedAmount()).getBytes());
        }
        if (payslipRequest.getSalary().getVariableAmount() != null) {
            var = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getVariableAmount()).getBytes());
        }
        if (payslipRequest.getSalary().getGrossAmount() != null) { //annual
            gross  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getGrossAmount()).getBytes());
        }
        if (payslipRequest.getSalary().getTotalEarnings() != null) { //annual
            te  =Base64.getEncoder().encodeToString((payslipRequest.getSalary().getTotalEarnings()).getBytes());
        }
        if (payslipRequest.getSalary().getNetSalary() != null) { //annual
            net  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getNetSalary()).getBytes());
        }
        if (payslipRequest.getSalary().getTotalDeductions() != null) { //annual
            tded  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getTotalDeductions()).getBytes());
        }
        if (payslipRequest.getSalary().getIncomeTax() != null) { //annual
            itax  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getIncomeTax()).getBytes());
        }
        if (payslipRequest.getSalary().getPfTax() != null) { //annual
            tax  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getPfTax()).getBytes());
        }
        if (payslipRequest.getSalary().getTotalTax() != null) { //annual
            ttax  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getTotalTax()).getBytes());
        }

        if (payslipRequest.getSalary().getSalaryConfigurationEntity().getAllowances() != null) {
            for (Map.Entry<String, String> entry : payslipRequest.getSalary().getSalaryConfigurationEntity().getAllowances().entrySet()) {
                allowances.put(entry.getKey(), maskValue(entry.getValue()));
            }
        }
        if (payslipRequest.getSalary().getSalaryConfigurationEntity().getDeductions() != null) {
            for (Map.Entry<String, String> entry : payslipRequest.getSalary().getSalaryConfigurationEntity().getDeductions().entrySet()) {
                deductions.put(entry.getKey(), maskValue(entry.getValue()));
            }
        }

        ObjectMapper objectMapper = new ObjectMapper();
        AttendanceEntity attendanceEntity = objectMapper.convertValue(attendance,AttendanceEntity.class);
        attendanceEntity.setMonth(attendance.getMonth());
        attendanceEntity.setYear(attendance.getYear());
        attendanceEntity.setTotalWorkingDays(attendance.getTotalWorkingDays());
        attendanceEntity.setNoOfWorkingDays(attendance.getNoOfWorkingDays());

        PayslipEntity payslipEntity = objectMapper.convertValue(payslipRequest, PayslipEntity.class);
        EmployeeSalaryEntity salary = objectMapper.convertValue(salaryRequest,EmployeeSalaryEntity.class);
        salary.setFixedAmount(fix);
        salary.setGrossAmount(gross);
        salary.setVariableAmount(var);
        salary.setTotalEarnings(te);
        salary.setNetSalary(net);
        salary.setTotalDeductions(tded);
        salary.setIncomeTax(itax);
        salary.getSalaryConfigurationEntity().setAllowances(allowances);
        salary.getSalaryConfigurationEntity().setDeductions(deductions);
        salary.setPfTax(tax);
        salary.setTotalTax(ttax);
        payslipEntity.setSalary(salary);
        payslipEntity.setAttendance(attendanceEntity);
        payslipEntity.setType(Constants.PAYSLIP);
        return payslipEntity;
    }

    private static String unMaskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value; // Return as is if null or empty
        }
        return new String(Base64.getDecoder().decode(value)); // Correctly decode without extra bytes conversion
    }


    public static PayslipEntity unmaskEmployeePayslip(PayslipEntity payslipRequest) {

        String var = null, fix = null, bas = null, gross = null,
                hra = null, trav = null, pfc = null, other = null,spa=null,
                te= null, email = null, pfEmployer =null, lop = null, tax = null,
                itax = null, ttax = null, tded = null, net = null,noOfWorkingDays=null,totalWorkingDays=null,
                firstName=null, lastName =null;

        if (payslipRequest.getSalary().getFixedAmount() != null) {
            fix = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getFixedAmount()));
        }
        if (payslipRequest.getSalary().getVariableAmount() != null) {
            var = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getVariableAmount()));
        }
        if (payslipRequest.getSalary().getGrossAmount() != null) {
            gross = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getGrossAmount()));
        }

        if (payslipRequest.getSalary().getSalaryConfigurationEntity().getAllowances() != null) {
            Map<String, String> decodedAllowances = new HashMap<>();
            for (Map.Entry<String, String> entry : payslipRequest.getSalary().getSalaryConfigurationEntity().getAllowances().entrySet()) {
                String unMaskValue =  unMaskValue(entry.getValue());
                decodedAllowances.put(entry.getKey(), unMaskValue);
            }
            payslipRequest.getSalary().getSalaryConfigurationEntity().setAllowances(decodedAllowances);

        }

        if (payslipRequest.getSalary().getSalaryConfigurationEntity().getDeductions() != null) {
            Map<String, String> decodedDeductions = new HashMap<>();

            for (Map.Entry<String, String> entry : payslipRequest.getSalary().getSalaryConfigurationEntity().getDeductions().entrySet()) {
               String unMaskValue =  unMaskValue(entry.getValue());
                decodedDeductions.put(entry.getKey(), unMaskValue);
            }
            payslipRequest.getSalary().getSalaryConfigurationEntity().setDeductions(decodedDeductions);

        }
        if (payslipRequest.getAttendance().getNoOfWorkingDays()!= null) {
            noOfWorkingDays = new String(Base64.getDecoder().decode(payslipRequest.getAttendance().getNoOfWorkingDays()));
        }
        if (payslipRequest.getAttendance().getTotalWorkingDays()!= null) {
            totalWorkingDays = new String(Base64.getDecoder().decode(payslipRequest.getAttendance().getTotalWorkingDays()));
        }
        if (payslipRequest.getAttendance().getFirstName()!= null) {
            firstName = new String(Base64.getDecoder().decode(payslipRequest.getAttendance().getFirstName()));
        }
        if (payslipRequest.getAttendance().getLastName()!= null) {
            lastName = new String(Base64.getDecoder().decode(payslipRequest.getAttendance().getLastName()));
        }
        if (payslipRequest.getAttendance().getEmailId()!= null) {
            email = new String(Base64.getDecoder().decode(payslipRequest.getAttendance().getEmailId()));
        }
        if (payslipRequest.getSalary().getIncomeTax() != null) {
            itax = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getIncomeTax()));
        }
        if (payslipRequest.getSalary().getPfTax() != null) {
            tax = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getPfTax()));
        }
        if (payslipRequest.getSalary().getTotalEarnings() != null) {
            te = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getTotalEarnings()));
        }
        if (payslipRequest.getSalary().getTotalTax() != null) {
            ttax = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getTotalTax()));
        }
        if (payslipRequest.getSalary().getTotalDeductions() != null) {
            tded = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getTotalDeductions()));
        }
        if (payslipRequest.getSalary().getNetSalary() != null) {
            net = new String(Base64.getDecoder().decode(payslipRequest.getSalary().getNetSalary()));
        }

        payslipRequest.getSalary().setFixedAmount(fix);
        payslipRequest.getSalary().setGrossAmount(gross);
        payslipRequest.getSalary().setVariableAmount(var);
        payslipRequest.getSalary().setTotalEarnings(te);
        payslipRequest.getSalary().setNetSalary(net);
        payslipRequest.getSalary().setTotalTax(ttax);
        payslipRequest.getSalary().setIncomeTax(itax);
        payslipRequest.getSalary().setPfTax(tax);
        payslipRequest.getSalary().setTotalDeductions(tded);
        String inWords =  numberToWords(Double.valueOf(net));
        payslipRequest.setInWords(inWords + " Rupees Only.");
        payslipRequest.getAttendance().setNoOfWorkingDays(noOfWorkingDays);
        payslipRequest.getAttendance().setTotalWorkingDays(totalWorkingDays);
        payslipRequest.getAttendance().setFirstName(firstName);
        payslipRequest.getAttendance().setLastName(lastName);
        payslipRequest.getAttendance().setEmailId(email);
        payslipRequest.setType(Constants.PAYSLIP);


        return payslipRequest;
    }


    static String[] singleDigit = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"};
    static String[] doubleDigit = {"Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"};
    static String[] belowHundred = {"Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};


    private static String numberToWords(Double n) {
        double num = n; // Convert Double to double
        if (num < 0) {
            return "Minus " + numberToWords(-num);
        }
        if (num == 0) {
            return "Zero";
        }

        // Recursive function to translate the number into words
        StringBuilder word = new StringBuilder();
        word.append(translate((int) num));

        // Get the result by translating the given number
        return word.toString().trim() ;
    }

    // Translate method to convert the number into words
    private static String translate(int n) {
        StringBuilder word = new StringBuilder();

        if (n < 10) {
            word.append(singleDigit[n]).append(' ');
        } else if (n < 20) {
            word.append(doubleDigit[n - 10]).append(' ');
        } else if (n < 100) {
            String rem = translate(n % 10);
            word.append(belowHundred[(n - n % 10) / 10 - 2]).append(' ').append(rem);
        } else if (n < 1000) {
            word.append(singleDigit[n / 100]).append(" Hundred ").append(translate(n % 100));
        } else if (n < 1000000) {
            word.append(translate(n / 1000)).append(" Thousand ").append(translate(n % 1000));
        } else if (n < 1000000000) {
            word.append(translate(n / 1000000)).append(" Million ").append(translate(n % 1000000));
        } else {
            word.append(translate(n / 1000000000)).append(" Billion ").append(translate(n % 1000000000));
        }

        return word.toString();
    }


    public static void forFormatNumericalFields(PayslipEntity payslipProperties) {
        if (payslipProperties.getSalary() != null) {
            payslipProperties.getSalary().setFixedAmount(formatValue(payslipProperties.getSalary().getFixedAmount()));
            payslipProperties.getSalary().setNetSalary(formatValue(payslipProperties.getSalary().getNetSalary()));
            payslipProperties.getSalary().setGrossAmount(formatValue(payslipProperties.getSalary().getGrossAmount()));
            payslipProperties.getSalary().setTotalEarnings(formatValue(payslipProperties.getSalary().getTotalEarnings()));
            payslipProperties.getSalary().setVariableAmount(formatValue(payslipProperties.getSalary().getVariableAmount()));
            payslipProperties.getSalary().setTotalDeductions(formatValue(payslipProperties.getSalary().getTotalDeductions()));
            payslipProperties.getSalary().setTotalTax(formatValue(payslipProperties.getSalary().getTotalTax()));

            if (payslipProperties.getSalary().getSalaryConfigurationEntity().getAllowances() != null) {
                Map<String, String> formatAllowance = new HashMap<>();
                for (Map.Entry<String, String> entry : payslipProperties.getSalary().getSalaryConfigurationEntity().getAllowances().entrySet()) {
                    String formattedValue = formatValue(entry.getValue());
                    formatAllowance.put(entry.getKey(), formattedValue);
                }
                payslipProperties.getSalary().getSalaryConfigurationEntity().setAllowances(formatAllowance);
            }
            if (payslipProperties.getSalary().getSalaryConfigurationEntity().getDeductions() != null) {
                Map<String, String> formatDeductions = new HashMap<>();
                for (Map.Entry<String, String> entry : payslipProperties.getSalary().getSalaryConfigurationEntity().getDeductions().entrySet()) {
                    String formattedValue = formatValue(entry.getValue());
                    formatDeductions.put(entry.getKey(), formattedValue);
                }
                payslipProperties.getSalary().getSalaryConfigurationEntity().setDeductions(formatDeductions);

            }

        }
    }

        private static String formatValue(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }
        try {
            // Parse the value to integer and then format it
            double doubleValue = Double.parseDouble(value);
            long longValue = (long) doubleValue; // Extract the integer part

            return String.valueOf(longValue);
        } catch (NumberFormatException e) {
            // Handle the exception as needed
            e.printStackTrace();
            return value; // Return original value in case of error
        }
    }
    private static String maskValue(String value) {
        if (value == null || value.isEmpty()) {
            return value; // Return as is if null or empty
        }
        return Base64.getEncoder().encodeToString(value.toString().getBytes()); // Replace with your desired masking pattern
    }


    public static PayslipEntity maskEmployeePayslipUpdateProperties(PayslipUpdateRequest payslipRequest, String payslipId ,String employeeId) {

        String var = null, fix = null, bas = null, gross = null;
        String hra = null, trav = null, pfc = null, other = null, spa = null;
        String te = null, pfE = null, pfEmployer = null, lop = null, tax = null, itax = null, ttax = null, tded = null, net = null;
        Map<String, String> allowances = new HashMap<>();
        Map<String, String> deductions = new HashMap<>();


        if (payslipRequest.getSalary().getFixedAmount() != null) {
            fix = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getFixedAmount()).getBytes());
        }
        if (payslipRequest.getSalary().getVariableAmount() != null) {
            var = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getVariableAmount()).getBytes());
        }
        if (payslipRequest.getSalary().getGrossAmount() != null) { //annual
            gross  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getGrossAmount()).getBytes());
        }
        if (payslipRequest.getSalary().getTotalEarnings() != null) { //annual
            te  =Base64.getEncoder().encodeToString((payslipRequest.getSalary().getTotalEarnings()).getBytes());
        }
        if (payslipRequest.getSalary().getNetSalary() != null) { //annual
            net  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getNetSalary()).getBytes());
        }
        if (payslipRequest.getSalary().getTotalDeductions() != null) { //annual
            tded  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getTotalDeductions()).getBytes());
        }
        if (payslipRequest.getSalary().getIncomeTax() != null) { //annual
            itax  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getIncomeTax()).getBytes());
        }
        if (payslipRequest.getSalary().getPfTax() != null) { //annual
            tax  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getPfTax()).getBytes());
        }
        if (payslipRequest.getSalary().getTotalTax() != null) { //annual
            ttax  = Base64.getEncoder().encodeToString((payslipRequest.getSalary().getTotalTax()).getBytes());
        }

        if (payslipRequest.getSalary().getSalaryConfigurationEntity().getAllowances() != null) {
            for (Map.Entry<String, String> entry : payslipRequest.getSalary().getSalaryConfigurationEntity().getAllowances().entrySet()) {
                allowances.put(entry.getKey(), maskValue(entry.getValue()));
            }
        }
        if (payslipRequest.getSalary().getSalaryConfigurationEntity().getDeductions() != null) {
            for (Map.Entry<String, String> entry : payslipRequest.getSalary().getSalaryConfigurationEntity().getDeductions().entrySet()) {
                deductions.put(entry.getKey(), maskValue(entry.getValue()));
            }
        }

        ObjectMapper objectMapper = new ObjectMapper();
        AttendanceEntity attendanceEntity = objectMapper.convertValue(payslipRequest.getAttendance(),AttendanceEntity.class);
        attendanceEntity.setMonth(attendanceEntity.getMonth());
        attendanceEntity.setYear(attendanceEntity.getYear());
        attendanceEntity.setTotalWorkingDays(attendanceEntity.getTotalWorkingDays());
        attendanceEntity.setNoOfWorkingDays(attendanceEntity.getNoOfWorkingDays());

        PayslipEntity payslipEntity = objectMapper.convertValue(payslipRequest, PayslipEntity.class);
        payslipEntity.setPayslipId(payslipId);
        payslipEntity.setEmployeeId(employeeId);
        payslipEntity.setSalaryId(payslipEntity.getSalary().getSalaryId());
        payslipEntity.setAttendanceId(payslipEntity.getAttendance().getAttendanceId());

        EmployeeSalaryEntity salary = objectMapper.convertValue(payslipRequest.getSalary(),EmployeeSalaryEntity.class);
        salary.setFixedAmount(fix);
        salary.setGrossAmount(gross);
        salary.setVariableAmount(var);
        salary.setTotalEarnings(te);
        salary.setNetSalary(net);
        salary.setTotalDeductions(tded);
        salary.setIncomeTax(itax);
        salary.getSalaryConfigurationEntity().setAllowances(allowances);
        salary.getSalaryConfigurationEntity().setDeductions(deductions);
        salary.setPfTax(tax);
        salary.setTotalTax(ttax);
        payslipEntity.setSalary(salary);
        payslipEntity.setAttendance(attendanceEntity);
        payslipEntity.setType(Constants.PAYSLIP);
        return payslipEntity;
    }
}