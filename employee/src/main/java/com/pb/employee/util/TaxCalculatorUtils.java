package com.pb.employee.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
@Service
@Slf4j
public class TaxCalculatorUtils {

    public static double getOldTax(double salary) {
        // Lies under tax rebate limit
        if (salary <= 500000) {
            return 0;
        }
        if (salary <= 1000000) {
            return (salary - 500000) * 0.2
                    + (250000 * 0.05);
        }
        return (salary - 1000000) * 0.3 + (500000 * 0.2)
                + (250000 * 0.05);
    }

    public static double getNewTax(double salary) {
        double tax = 0;

        if (salary <= 300000) {
            // No tax for salary <= 300,000
            return 0;
        }
        else if (salary <= 700000) {
            // Tax for salary between 300,001 and 700,000 at 5%
             tax = salary * 0.05;
        }
        else if (salary <= 1000000) {
            // Tax for salary between 700,001 and 1,000,000 at 10%
             tax = salary * 0.10;
        }
        else if (salary <= 1200000) {
            // Tax for salary between 1,000,001 and 1,200,000 at 15%
             tax = salary * 0.15;
        }
        else if (salary <= 1500000) {
            // Tax for salary between 1,200,001 and 1,500,000 at 20%
             tax= salary * 0.20;
        }
        else {
            // Tax for salary above 1,500,000 at 30%
             tax = salary * 0.30;
        }

        return tax;
    }


    public static double getPfTax(double salary) {
        if (salary <= 180000) {
            // Return 0 if salary is less than or equal to 15000
            return 0;
        } else if (salary <= 240000) {
            // Return a fixed amount or percentage for salary between 15001 and 20000
            return 150*12;
        } else {
            // Return a different fixed amount or percentage for salary above 20000
            return 200*12;
        }
    }

}
