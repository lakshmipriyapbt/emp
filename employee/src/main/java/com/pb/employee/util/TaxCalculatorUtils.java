package com.pb.employee.util;

import com.pb.employee.persistance.model.TDSPercentageEntity;
import com.pb.employee.request.TDSPayload.TDSResPayload;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
@Service
@Slf4j
public class TaxCalculatorUtils {


    public static double getTax(double salary, TDSResPayload tdsResPayload) {
        if (tdsResPayload != null) {
            for (TDSPercentageEntity tdsPercentageEntity : tdsResPayload.getPersentageEntityList()) {
                double min = Double.parseDouble(tdsPercentageEntity.getMin());
                double max = Double.parseDouble(tdsPercentageEntity.getMax());
                double percentage = Double.parseDouble(tdsPercentageEntity.getTaxPercentage());
                boolean hasNoUpperLimit = max == 0;

                if ((salary >= min && salary <= max) || (salary >= min && hasNoUpperLimit)) {
                    return (percentage / 100) * salary;
                }
            }
        }
        return 0;
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
