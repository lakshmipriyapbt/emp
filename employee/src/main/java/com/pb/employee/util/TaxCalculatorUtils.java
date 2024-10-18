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
        // Lies under tax rebate limit
        if (salary <= 775000) {
            return 0;
        }
        if ((salary - 75000) <= 1000000) {
            return ((400000 * 0.05)
                    + (salary - 775000) * 0.1) * 0.04 + ((400000 * 0.05)
                    + (salary - 775000) * 0.1);
        }
        if ((salary - 75000) <= 1200000) {
            return ((400000 * 0.05) + (300000 * 0.1)
                    + (salary - 1075000) * 0.15) * 0.04 + ((400000 * 0.05) + (300000 * 0.1)
                    + (salary - 1075000) * 0.15);
        }
        if ((salary - 75000) <= 1500000) {
            double v =(400000 * 0.05) + (300000 * 0.1)
                    + (200000 * 0.15)
                    + (salary - 1275000) * 0.2;
            return v * 0.04 + v;
        }
        double v = (400000 * 0.05) + (300000 * 0.1)
                + (200000 * 0.15) + (300000 * 0.2)
                + (salary - 1575000) * 0.30;
        return v * 0.04+v;
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
