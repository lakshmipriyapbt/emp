import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { employeeId } from "./Auth";

const protocol = window.location.protocol;
const hostname = window.location.hostname;


const BASE_URL = `${protocol}//${hostname}:8013/ems`;
const Login_URL = `${protocol}//${hostname}:9003/ems`;

const token = localStorage.getItem("token");

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  }
});
export const loginApi = (data) => {
  return axios
    .post(`${Login_URL}/emsadmin/login`, data)
    .then((response) => {
      const { token, refreshToken } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      return response.data;
    })
    .catch((error) => {
      if (error.response) {
        const {
          path,
          error: { message },
        } = error.response.data;
        console.log(`Error at ${path}: ${message}`);
        return Promise.reject(message);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
      console.log(error);
    });
};
export const CompanyloginApi = (data) => {
  return axios.post(`${Login_URL}/company/login`, data)
    .then(response => {
      const { token, refreshToken } = response.data?.data || {};
      if (token && refreshToken) {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
      }
      return response.data; // Return the full response
    })
    .catch(error => {
      const errorMessage = error.response?.data?.error?.message || "An unknown error occurred.";
      console.error(errorMessage); // Log the error for debugging
      throw new Error(errorMessage); // Throw an error with the message
    });
};


export const ValidateOtp = (data) => {
  return axiosInstance.post(`${Login_URL}/validate`, data);
}

export const forgotPasswordStep1 = (data) => {
  return axios.post(`${Login_URL}/forgot/password`, data);
}

export const forgotPasswordStep2 = (data) => {
  return axios.post(`${Login_URL}/update/password`, data);
}

export const resetPassword = (data, employeeId) => {
  return axiosInstance.patch(`/company/employee/${employeeId}/password`, data);
}


export const CompanyRegistrationApi = (data) => {
  return axiosInstance.post("/company", data);
};

export const companyViewApi = async () => {
  return axiosInstance.get("/company");
};

export const companyViewByIdApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
};


export const companyDetailsByIdApi = async (companyId) => {
  return axiosInstance.get(`/company/${companyId}`);
}

export const companyDeleteByIdApi = async (companyId) => {
  return axiosInstance.delete(`/company/${companyId}`);
};

export const companyUpdateByIdApi = async (companyId, data) => {
  axiosInstance.patch(`/company/${companyId}`, data);
};

export const companyPasswordUpdateById = async (companyId) => {
  axiosInstance.patch(`/company/password/${companyId}`);
}

export const DepartmentGetApi = () => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`${company}/department`);
}

export const DepartmentPostApi = (data) => {
  return axiosInstance.post("/department", data);
}
export const DepartmentGetApiById = (departmentId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`${company}/department/${departmentId}`)
}

export const DepartmentDeleteApiById = (departmentId) => {
  const company = localStorage.getItem("companyName")
    return axiosInstance.delete(`${company}/department/${departmentId}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
}

export const DepartmentPutApiById = (departmentId, data) => {
  const company = localStorage.getItem("companyName")
    return axiosInstance.patch(`${company}/department/${departmentId}`, data)
};

export const DesignationGetApi = () => {
  const company = localStorage.getItem("companyName")
    return axiosInstance.get(`${company}/designations`)
    .then(response => {
      return response.data.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
}

export const DesignationPostApi = (data) => {
  return axiosInstance.post('/designation', data);
}

export const DesignationGetApiById = (designationId) => {
  const company = localStorage.getItem("companyName")
    return axiosInstance.get(`${company}/designation/${designationId}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
}

export const DesignationDeleteApiById = (designationId) => {
  const company = localStorage.getItem("companyName")
    return axiosInstance.delete(`${company}/designation/${designationId}`)
}

export const DesignationPutApiById = (designationId, data) => {
   const company = localStorage.getItem("companyName")
  return axiosInstance.patch(`${company}/designation/${designationId}`, data)
};


export const EmployeeGetApi = () => {
   const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee`)
    .then(response => response.data.data) // Assuming response.data.data contains your employee data
    .catch(error => {
      console.error('Error fetching employee data:', error);
      return []; // Return empty array or handle error as needed
    });
}

export const EmployeePostApi = (data) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.post('/employee', data);
}

export const EmployeeGetApiById = (employeeId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/${employeeId}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
}

export const EmployeeDeleteApiById = (employeeId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.delete(`/${company}/employee/${employeeId}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
}

export const EmployeePatchApiById = (employeeId, data) => {
  return axiosInstance.patch(`/employee/${employeeId}`, data)
};

export const roleApi = () => {
  return axiosInstance.get("/role/all");
}


export const EmployeeSalaryPostApi = (employeeId, data) => {
  return axiosInstance.post(`/${employeeId}/salary`, data, {
    headers: {
      'Content-Type': 'application/json', // Ensure content type is JSON
    }
  });
}

export const EmployeeSalaryGetApi = (employeeId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/${employeeId}/salaries`);
}

export const EmployeeSalaryGetApiById = (employeeId, salaryId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/${employeeId}/salary/${salaryId}`);
}

export const EmployeeSalaryPatchApiById = (employeeId, salaryId, data) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.patch(`/employee/${employeeId}/salary/${salaryId}`, data);
}

export const EmployeeSalaryDeleteApiById = (employeeId, salaryId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.delete(`/${company}/employee/${employeeId}/salary/${salaryId}`);
}

export const EmployeePayslipGenerationPostById = (employeeId, salaryId, data) => {
  return axiosInstance.post(`/${employeeId}/salary/${salaryId}`, data);
}

export const EmployeePayslipGeneration = (data) => {
  return axiosInstance.post("/salary", data);
}

export const EmployeePayslipGetById = (employeeId, payslipId, month, year) => {
   const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/${employeeId}/payslip/${payslipId}`, {
    params: {
      month: month,
      year: year
    }
  });
};


export const EmployeePayslipsGet = (employeeId, month, year) => {
  const company = localStorage.getItem("company")
  return axiosInstance.get(`/${company}/employee/${employeeId}/payslips`, {
    params: {
      month, year
    }
  });
}

export const AllEmployeePayslipsGet = (month, year) => {
  const company = localStorage.getItem("company")
  return axiosInstance.get(`/${company}/employee/all/payslip`, {
    params: {
      month, year
    }
  });
}

export const EmployeePaySlipDownloadById = async (employeeId, payslipId) => {
  const company = localStorage.getItem("companyName");

  try {
    // Make the API request with specific headers for this request
    const response = await axiosInstance.get(`/${company}/employee/${employeeId}/template/3/download/${payslipId}`,
      {
        responseType: 'blob', // Handle the response as a binary blob
        headers: {
          'Accept': 'application/pdf', // Accept PDF format
        }
      }
    );
 
    // Handle the response (e.g., trigger a file download)
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${employeeId}.pdf`; // Customize file name as needed
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Download error:', error);
  }
};

export const EmployeePayslipDeleteById = (employeeId, payslipId) => {
  const company = localStorage.getItem("comapnyName")
  return axiosInstance.delete(`/${company}/employee/${employeeId}/payslip/${payslipId}`);
}

export const AttendanceManagementApi = (formData) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.post(`/${company}/employee/attendance`, formData);
}

export const AttendanceReportApi = (employeeId, month, year) => {

  const companyName = localStorage.getItem("companyName")
  return axiosInstance.get(`/${companyName}/attendance`, {
    params: { employeeId, month, year }
  });
}

export const AttendancePatchById = (employeeId, attendanceId, data) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.patch(`/${company}/employee/${employeeId}/attendance/${attendanceId}`, data);
}

export const AttendanceDeleteById = (employeeId, attendanceId) => {
  const company = localStorage.getItem("company")
  return axiosInstance.delete(`/${company}/employee/${employeeId}/attendance/${attendanceId}`);
}
export const CompanyImagePatchApi = (companyId, formData) => {
  return axiosInstance.patch(`/company/image/${companyId}`, formData);
}

export const CompanyImageGetApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}/image`);
}

export const AllowancesGetApi = () => {
  return axiosInstance.get(`/allowances`);
}

export const DeductionsGetApi = () => {
  return axiosInstance.get(`/deductions`);
}

export const CompanySalaryStructurePostApi = (data) => {
  return axiosInstance.post(`/salary/Structure`, data);
};

export const CompanySalaryStructureGetApi = () => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`${company}/salary`);
}