package com.pb.employee.util;

import com.pb.employee.model.ResourceType;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
@Service
@Slf4j
public class ResourceIdUtils {

    /**
     * Generate a global resource ID
     *
     * @param id The ID of the resource
     */
    //todo-to make this static method
    public static String generateCompanyResourceId(String id) {
        return generateGlobalResourceId(ResourceType.COMPANY, id);
    }
    public static String generateEmployeeResourceId(String id) {
        return generateGlobalResourceId(ResourceType.EMPLOYEE, id);
    }
    public static String generateCandidateResourceId(String id) {
        return generateGlobalResourceId(ResourceType.CANDIDATE, id);
    }

    public static String generateUserResourceId(String id) {
        return generateGlobalResourceId(ResourceType.USER, id);
    }
    public static String generateTemplateResourceId(String id) {
        return generateGlobalResourceId(ResourceType.TEMPLATE, id);
    }
    public static String generateSalaryResourceId(String employeeId, String time) {
        return generateGlobalResourceId(ResourceType.SALARY,employeeId, time);
    }

    public static String generatePayslipId(String month, String year, String employeeId) {
        return generateGlobalResourceId(ResourceType.PAYSLIP,month, year,employeeId);
    }
    public static String generateCompanyIndex(String name) {
        return Constants.INDEX_EMS+"_"+name;
    }

    public static String generateEMSAdminResourceId(String id) {
        return generateGlobalResourceId(ResourceType.EMS_ADMIN, id);
    }

    public static String generateDepartmentResourceId(String id, String timestamp) {
        return generateGlobalResourceId(ResourceType.DEPARTMENT, id, timestamp);
    }

    public static String generateDesignationResourceId(String id,String departmentId) {
        return generateGlobalResourceId(ResourceType.DESIGNATION, id, departmentId);
    }
    public static String generateAttendanceId(String company, String employeeId,String year,String month) {
        return generateGlobalResourceId(ResourceType.ATTENDANCE,company,year,month,employeeId);
    }
    public static String generateSalaryConfigurationResourceId(String companyName, String timestamp) {
        return generateGlobalResourceId(ResourceType.SALARY_STRUCTURE, companyName, timestamp);
    }
    public static String generateRelievingId(String companyName, String relievingDate, String resignationDate) {
        return generateGlobalResourceId(ResourceType.RELIEVING, companyName, relievingDate,resignationDate);
    }
    public static String generateBankResourceId(String companyId,String accountNo ) {
        return generateGlobalResourceId(ResourceType.BANK, companyId,accountNo);

    }
    public static String generateCompanyCalenderId(String companyName, String year) {
        return generateGlobalResourceId(ResourceType.COMPANY_CALENDAR, companyName, year);

    }

    public static String generateEmployeePersonnelId(String resourceId) {
        return generateGlobalResourceId(ResourceType.EMPLOYEE_PERSONNEL, resourceId);
    }
    public static String generateBackgroundResourceId(String companyName, String employeeId) {
        return generateGlobalResourceId(ResourceType.BACKGROUND, companyName,employeeId);

    }
    public static String generateCompanyTDSId(String companyName, String startYear, String endYear, String tdsType) {
        return generateGlobalResourceId(ResourceType.COMPANY_TDS, companyName, startYear, endYear, tdsType);

    }
    public static String generateDocumentResourceId(String resourceId) {
        return generateGlobalResourceId(ResourceType.DOCUMENT, resourceId);
    }
    public static String generateExperienceResourceId (String employeeId) {
        return generateGlobalResourceId(ResourceType.EXPERIENCE, employeeId);
    }
    public static String generateAppraisalResourceId (String date) {
        return generateGlobalResourceId(ResourceType.APPRAISAL, date);
    }

    public static String generateOfferLetterId(String referenceNo) {
        return generateGlobalResourceId(ResourceType.OFFER_LETTER, referenceNo);

    }
    public static String generateInternOfferLetterId(String employeeName, String time) {
        return generateGlobalResourceId(ResourceType.INTERN_OFFER_LETTER, employeeName, time);
    }
    public static String generateInternshipCertificateResourceId(String employeeName,String time) {
        return generateGlobalResourceId(ResourceType.INTERNSHIP_CERTIFICATE, employeeName, time);
    }

    /**
     * Generate a global resource ID based on the resource type
     *
     * @param type The type of resource
     * @param args the values of attributes that uniquely identify the resource. The generator
     *             is sensitive to the order of the specified values
     */
    public static String generateGlobalResourceId(ResourceType type, Object... args) {
        boolean isCaseSensitive = false;
        String prefix = Constants.DEFAULT + "-";
        if (type == ResourceType.COMPANY) {
            prefix = Constants.COMPANY + "-";
        }
        if (type == ResourceType.ATTENDANCE) {
            prefix = Constants.ATTENDANCE + "-"+args[1]+"-"+args[2]+"-"+args[3];
        }
        if (type == ResourceType.EMPLOYEE) {
            prefix = Constants.EMPLOYEE + "-";
        }
        if (type == ResourceType.USER) {
            prefix = Constants.USER + "-";
        }
        if (type == ResourceType.DEPARTMENT) {
            prefix = Constants.DEPARTMENT + "-";
        }
        if (type == ResourceType.SALARY) {
            prefix = Constants.SALARY + "-";

        }
        if (type == ResourceType.DESIGNATION) {
            prefix = Constants.DESIGNATION + "-";

        }
        if (type == ResourceType.SALARY_STRUCTURE) {
            prefix = Constants.SALARY_STRUCTURE + "-";

        }
        if (type == ResourceType.RELIEVING) {
            prefix = Constants.RELIEVING + "-";

        }
        if (type == ResourceType.PAYSLIP) {
            prefix = Constants.PAYSLIP +"-"+ args[0] + "-"+args[1]+"-";

        }
        if (type == ResourceType.TEMPLATE) {
            prefix = Constants.TEMPLATE +"-";

        }
        if (type == ResourceType.BANK) {
            prefix = Constants.BANK +"-";

        }
        if (type == ResourceType.BACKGROUND) {
            prefix = Constants.BACKGROUND +"-";

        }   if (type == ResourceType.EMPLOYEE_PERSONNEL) {
            prefix = Constants.EMPLOYEE_PERSONNEL +"-";

        } if (type == ResourceType.COMPANY_CALENDAR) {
            prefix = Constants.COMPANY_CALENDAR + "-";

        }
        if (type == ResourceType.COMPANY_TDS) {
            prefix = Constants.COMPANY_TDS + "-";

        }
        if (type == ResourceType.CANDIDATE) {
            prefix = Constants.CANDIDATE + "-";
        }

        if (type == ResourceType.DOCUMENT) {
            prefix = Constants.DOCUMENT + "-";
        }
        if (type == ResourceType.EXPERIENCE) {
            prefix = Constants.EXPERIENCE + "-";

        }
        if (type == ResourceType.APPRAISAL) {
            prefix = Constants.APPRAISAL + "-";
        }
        if (type == ResourceType.OFFER_LETTER) {
            prefix = Constants.OFFER_LETTER + "-";
        }
        if (type == ResourceType.INTERN_OFFER_LETTER) {
            prefix = Constants.INTERN_OFFER_LETTER + "-";
        }

        StringBuilder md5Input = new StringBuilder();
        for (Object arg : args) {
            if (arg != null) {
                if (md5Input.length() == 0) {
                    md5Input.append(arg.toString());
                } else {
                    md5Input.append(":").append(arg.toString());
                }
            }
        }
        String md5Hash;
        if (isCaseSensitive) {
            md5Hash = org.springframework.util.DigestUtils.md5DigestAsHex(md5Input.toString().getBytes()).toLowerCase();

        } else {
            md5Hash = org.springframework.util.DigestUtils.md5DigestAsHex(md5Input.toString().toLowerCase().getBytes()).toLowerCase();

        }
        return prefix + md5Hash;
    }
}