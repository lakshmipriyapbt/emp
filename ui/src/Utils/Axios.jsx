import axios from "axios";
import { toast } from "react-toastify";

const protocol = window.location.protocol;
const hostname = window.location.hostname;


const BASE_URL = `${protocol}//${hostname}:8092/ems`;
const Login_URL = `${protocol}//${hostname}:9090/ems`;

// ✅ Create Axios Instance (Without Token)
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach Token Dynamically Using Axios Interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

export const CompanyAddApi = (data) => {
  return axios.post(`${BASE_URL}/company/add`,data)
};

export const companyViewApi = async () => {
  return axiosInstance.get("/company");
};

export const companyViewByIdApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}`)
};

export const companyDetailsByIdApi = async (companyId) => {
  return axiosInstance.get(`/company/${companyId}`);
}

export const companyDeleteByIdApi = async (companyId) => {
  return axiosInstance.delete(`/company/${companyId}`);
};

export const companyUpdateByIdApi = async (companyId, data) => {
  try {
    const response = await axiosInstance.patch(`/company/${companyId}`, data);
    return response.data;  // Return the response data for further handling in the calling function
  } catch (error) {
    // Ensure errors are propagated properly by rethrowing the error
    console.error('Error during company update:', error);  // Optional logging
    throw error;  // Rethrow the error so it can be caught in onSubmit's catch block
  }
};

export const updateCompanyStatusApi = (id, status) => {
  return axiosInstance.patch(`company/${id}/status/${status}`)
};

export const companyPasswordUpdateById = async (companyId) => {
  axiosInstance.patch(`/company/password/${companyId}`);
}

export const DepartmentGetApi = () => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`${company}/department`);
}

export const DepartmentPostApi = async (departmentData) => {
  try {
    const response = await axiosInstance.post("/department", departmentData);
    
    // Debug the raw response
    console.log('API Response:', response.data);
    
    // Handle case where API returns just {path, message, data: 'success'}
    if (response.data?.data === 'success') {
      return {
        id: `temp-${Date.now()}`, // Temporary ID
        name: departmentData.name,
        companyName: departmentData.companyName,
        type: "department"
      };
    }
    
    // Handle case where API returns the full department
    if (response.data?.data?.name) {
      return response.data.data;
    }
    
    throw new Error('API returned unexpected format');
  } catch (error) {
    console.error('DepartmentPostApi error:', {
      error: error.response?.data || error.message,
      request: departmentData
    });
    throw error;
  }
};
export const DepartmentGetApiById = (departmentId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`${company}/department/${departmentId}`)
}

export const DepartmentDeleteApiById = (departmentId) => {
  const company = localStorage.getItem("companyName");
  if (!company) {
    throw new Error("Company name not found in localStorage");
  }
  
  return axiosInstance.delete(`/${company}/department/${departmentId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }
  })
  .then(response => response.data)
  .catch(error => {
    console.error('Delete Department Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config // This will show the full request details
    });
    throw error;
  });
};
export const DepartmentPutApiById = (departmentId, data) => {
  const company = localStorage.getItem("companyName")
    return axiosInstance.patch(`${company}/department/${departmentId}`, data)
};

export const DesignationGetApi = async (departmentId) => {
  const company = localStorage.getItem("companyName");
  try {
    const response = await axiosInstance.get(
      `/${company}/department/${departmentId}/designation`
    );
    
    // Check if response exists and has data with expected structure
    if (!response?.data) {
      console.warn("No data in response");
      throw new Error("No data received from server");
    }

    // Validate response structure
    if (response.data.message !== "Success") {
      console.warn("API did not return success message");
      throw new Error("API request was not successful");
    }

    if (!Array.isArray(response.data.data)) {
      console.warn("Unexpected data format in response");
      throw new Error("Invalid data format received");
    }

    return response.data.data; // Return the array of designations
    
  } catch (error) {
    console.error('Designation API Error:', {
      departmentId,
      status: error.response?.status,
      url: error.config?.url,
      error: error.message,
    });
    throw error; // Re-throw the error to be caught by the thunk
  }
};

export const DesignationPostApi = (departmentId, data) => {
  return axiosInstance.post(`/department/${departmentId}/designation`, data);
};

export const DesignationGetApiById = (departmentId, designationId) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance
    .get(`/${company}/department/${departmentId}/designation/${designationId}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error('Error fetching designation by ID:', error);
      throw error;
    });
};

export const DesignationDeleteApiById = (departmentId, designationId) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.delete(`/${company}/department/${departmentId}/designation/${designationId}`);
};

export const DesignationPutApiById = (departmentId, designationId, data) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.patch(
    `/${company}/department/${departmentId}/designation/${designationId}`,
    data
  );
};


export const EmployeeGetApi = () => {
   const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee`)
}

export const EmployeeNoAttendanceGetAPI = (month, year) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.get(`/${company}/withoutAttendance`, {
    params: { month, year }, // Passing month and year as query params
  });
};


export const EmployeePostApi = (data) => {
  return axiosInstance.post('/employee', data);
}

export const EmployeeGetApiById = (employeeId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/${employeeId}`)
}

export const BankNamesGetApi = () => {
  return axiosInstance.get("bank/list")
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

export const downloadEmployeesFileAPI = async (format, showToast) => {
  const company = localStorage.getItem("companyName")
  try {
    showToast("Downloading file...", "info"); // Show info toast before downloading

    const response = await axiosInstance.get(`${company}/employees/download?format=${format}`, {
      responseType: "blob",
    });

    // Check if response is an error by trying to parse JSON from Blob
    const contentType = response.headers["content-type"];
    if (contentType && contentType.includes("application/json")) {
      // Convert Blob to JSON
      const errorText = await response.data.text();
      const errorJson = JSON.parse(errorText);

      if (errorJson?.error?.message) {
        throw new Error(errorJson.error.message); // Throw extracted API error message
      }
    }

    // If the response is valid, proceed with the download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Employees_data.${format === "excel" ? "xlsx" : "pdf"}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("Download successful!", "success"); // Show success toast
  } catch (error) {
    let errorMessage = "Download failed. Please try again.";

    if (error.response) {
      const errorBlob = error.response.data;
      try {
        const errorText = await errorBlob.text();
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson?.error?.message || errorMessage;
      } catch (jsonError) {
        console.error("Failed to parse error response:", jsonError);
      }
    } else {
      errorMessage = error.message;
    }

    showToast(`❌ ${errorMessage}`, "error");
  }
};

export const downloadEmployeeBankDataAPI = async (format, showToast) => {
  const company = localStorage.getItem("companyName")

  try {
    showToast("Downloading file...", "info"); // Show info toast before downloading

    const response = await axiosInstance.get(`${company}/employees/bank?format=${format}`, {
      responseType: "blob",
    });

     // Check if response is an error by trying to parse JSON from Blob
     const contentType = response.headers["content-type"];
     if (contentType && contentType.includes("application/json")) {
       // Convert Blob to JSON
       const errorText = await response.data.text();
       const errorJson = JSON.parse(errorText);
 
       if (errorJson?.error?.message) {
         throw new Error(errorJson.error.message); // Throw extracted API error message
       }
     }

    // If the response is valid, proceed with the download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Employees_Bank_Data.${format === "excel" ? "xlsx" : "pdf"}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("Download successful!", "success"); // Show success toast
  } catch (error) {
    let errorMessage = "Download failed. Please try again.";

    if (error.response) {
      const errorBlob = error.response.data;
      try {
        const errorText = await errorBlob.text();
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson?.error?.message || errorMessage;
      } catch (jsonError) {
        console.error("Failed to parse error response:", jsonError);
      }
    } else {
      errorMessage = error.message;
    }

    showToast(`❌ ${errorMessage}`, "error");
  }
};

export const downloadAttendanceFileAPI = async (format, year, month, employeeId, showToast) => { 
  const company = localStorage.getItem("companyName");

  if (!format) {
    showToast("⚠️ Please select a file format!", "warning");
    return;
  }

  try {
    showToast("📥 Downloading file...", "info");

    const response = await axiosInstance.get(`${company}/employee/attendance/download`, {
      params: { format, month: month || "", year: year || "", employeeId: employeeId || "" },
      responseType: "blob", // Response is expected as a file, but errors can still be in JSON
    });

    // Check if response is an error by trying to parse JSON from Blob
    const contentType = response.headers["content-type"];
    if (contentType && contentType.includes("application/json")) {
      // Convert Blob to JSON
      const errorText = await response.data.text();
      const errorJson = JSON.parse(errorText);

      if (errorJson?.error?.message) {
        throw new Error(errorJson.error.message); // Throw extracted API error message
      }
    }

    // If no error, proceed with file download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Employees_Attendance_data.${format === "excel" ? "xlsx" : "pdf"}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("✅ Download successful!", "success");
  } catch (error) {
    console.error("Error downloading file:", error);

    // Extract API error message properly
    let errorMessage = "Download failed. Please try again.";

    if (error.response) {
      const errorBlob = error.response.data;
      try {
        const errorText = await errorBlob.text();
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson?.error?.message || errorMessage;
      } catch (jsonError) {
        console.error("Failed to parse error response:", jsonError);
      }
    } else {
      errorMessage = error.message;
    }

    showToast(`❌ ${errorMessage}`, "error");
  }
};

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

export const EmployeesSalariesGetApi = () => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/salaries`);
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

export const downloadEmployeeSalaryDataAPI = async (format, showToast) => {
  const company = localStorage.getItem("companyName");

  try {
    showToast("Downloading file...", "info"); // Show info toast before downloading

    const response = await axiosInstance.get(
      `${company}/employee/salaries/download?format=${format}`,
      { responseType: "blob" }
    );

    // Handle cases where API returns JSON with an error instead of a file
    const contentType = response.headers["content-type"];
    if (contentType && contentType.includes("application/json")) {
      const reader = new FileReader();
      reader.readAsText(response.data);
      reader.onloadend = () => {
        try {
          const errorResponse = JSON.parse(reader.result);
          throw new Error(errorResponse?.error?.message || "Unknown error occurred.");
        } catch (err) {
          showToast("Failed to parse error message.", "error");
        }
      };
      return;
    }

    // Proceed with file download if the response is valid
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Employees_Salaries_Data.${format === "excel" ? "xlsx" : "pdf"}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("Download successful!", "success"); // Show success toast
  } catch (error) {
    let errorMessage = "Download failed. Please try again.";

    if (error.response) {
      const errorBlob = error.response.data;
      try {
        const errorText = await errorBlob.text();
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson?.error?.message || errorMessage;
      } catch (jsonError) {
        console.error("Failed to parse error response:", jsonError);
      }
    } else {
      errorMessage = error.message;
    }

    showToast(`❌ ${errorMessage}`, "error");
  }
};


  export const EmployeePayslipGenerationPostById = (employeeId, salaryId, data) => {
    return axiosInstance.post(`/${employeeId}/salary/${salaryId}`, data);
  }

export const EmployeePayslipResponse = (salaryId, data) => {
  // Build the query string manually if salaryId is present
  const url = salaryId ? `/payslip?salaryId=${salaryId}` : '/payslip';

  // Make the axios request
  return axiosInstance.post(url, data);
};

export const EmployeePayslipGeneration = (data) => {
  return axiosInstance.post("/salary", data);
}

export const EmployeePayslipUpdate = (employeeId, payslipId, payload) => {
  return axiosInstance.post(`/employee/${employeeId}/payslip/${payslipId}`, payload);
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
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/employee/${employeeId}/payslips`, {
    params: {
      month, year
    }
  });
}

export const AllEmployeePayslipsGet = (month, year) => {
  const company = localStorage.getItem("companyName")
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
    const response = await axiosInstance.get(`/${company}/employee/${employeeId}/download/${payslipId}`, {
      responseType: 'blob', // Handle the response as a binary blob
      headers: {
        'Accept': 'application/json', // Change from application/pdf to application/json
      }
    });

     const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};


export const EmployeePayslipDeleteById = (employeeId, payslipId) => {
  const company = localStorage.getItem("comapnyName")
  return axiosInstance.delete(`/${company}/employee/${employeeId}/payslip/${payslipId}`);
}

export const AttendanceManagementApi = (formData) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.post(`/${company}/employee/attendance`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
  const company = localStorage.getItem("companyName")
  return axiosInstance.delete(`/${company}/employee/${employeeId}/attendance/${attendanceId}`);
}

export const CompanyImagePatchApi = (companyId, formData) => {
  return axiosInstance.patch(`/company/image/${companyId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const CompanyStampPatchApi = (companyId, formData) => {
  return axiosInstance.patch(`/company/stampImage/${companyId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

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

export const PayslipTemplate = (data) => {
  return axiosInstance.patch(`/template`, data);
};

export const TemplateSelectionPatchAPI = (data) => {
  return axiosInstance.patch(`/template`, data);
};

export const TemplateGetAPI = (data) => {
  const companyName = localStorage.getItem("companyName")
  return axiosInstance.get(`/${companyName}/template`, data);
};

export const RelievingDownloadPostApi = (employeeId,data) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.post(`/${company}/employee/${employeeId}/download`, data);
}
export const RelievingFormPostApi = (employeeId, data) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.post(`/company/${company}/employee/${employeeId}/relieving`, data);
}

export const RelievingGetApiById = (employeeId) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/relieving/${employeeId}`);
}

export const RelievingGetAllApi=()=>{
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/${company}/relieving`);
}

export const RelievingDeleteApiById = (employeeId,id) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.delete(`/${company}/employee/${employeeId}/relieve/${id}`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching company by ID:', error);
      throw error;
    });
}

export const RelievingPatchApiById = (employeeId,relieveId, data) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.patch(`/${company}/employee/${employeeId}/relieve/${relieveId}`, data)
};

export const RelievingLetterDownload = async (employeeId, draft, payload) => {
  const company = localStorage.getItem("companyName")
  try {
    const response = await axiosInstance.post(`/${company}/employee/${employeeId}/download?draft=${draft}`,payload, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
      }
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `RelievingLetter.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export const ExperienceFormPostApi = async (payload) => {
  try {
    const response = await axiosInstance.post(`/experienceletter/upload`, JSON.stringify(payload), // Ensure JSON format
      {
        responseType: 'blob', // Handle binary response for file download
        headers: {
          'Content-Type': 'application/json', // Correct content type
          'Accept': 'application/pdf',        // Expected response format
        },
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExperienceLetter.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export const OfferLetterDownload = async (payload) => {
  try {
    const response = await axiosInstance.post(`/offerletter/upload`,payload, {
      responseType: 'blob', 
      headers: {
        'Accept': 'application/pdf', 
      }
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `offer_letter.pdf`; 
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return true; 

  } catch (error) {
    console.error('Download error:', error);
    throw error; 
  }
};

export const InternOfferLetterDownload = async (payload) => {
  try {
    const response = await axiosInstance.post(`/internShipLetter/download`,payload, {
      responseType: 'blob', 
      headers: {
        'Accept': 'application/pdf', 
      }
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Intern_offer_letter.pdf`; 
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return true; 

  } catch (error) {
    console.error('Download error:', error);
    throw error; 
  }
};



export const InternshipCertificateDownload= async (payload) => {
  try {
    const response = await axiosInstance.post(`/internship/upload`,payload, {
      responseType: 'blob', // Handle binary response for file download
      headers: {
        'Content-Type': 'application/json', // Correct content type
        'Accept': 'application/pdf',        // Expected response format
      },
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `internship_letter.pdf`; 
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true; 
  } catch (error) {
    console.error('Download error:', error);
    throw error; 
  }
};


export const AppraisalLetterDownload = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `/appraisal/upload`,
      JSON.stringify(payload), // Ensure JSON format
      {
        responseType: 'blob', // Handle binary response for file download
        headers: {
          'Content-Type': 'application/json', // Correct content type
          'Accept': 'application/pdf',        // Expected response format
        },
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Appraisal.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Download error:', error.response || error.message);
    throw error; // Re-throw for handling by calling code
  }
};

export const CustomerGetAllApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}/customer/all`);
};

export const CustomerPostApi = (companyId,data) => {
  return axiosInstance.post(`/company/${companyId}/customer`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Error creating customer:', error);
      throw error;
    });
};

export const CustomerGetApiById = (companyId,customerId) => {
  return axiosInstance.get(`/company/${companyId}/customer/${customerId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching customer by ID:', error);
      throw error;
    });
};

export const CustomerDeleteApiById = (companyId,customerId) => {
  return axiosInstance.delete(`/company/${companyId}/customer/${customerId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting customer by ID:', error);
      throw error;
    });
};

export const CustomerPutApiById = (companyId, customerId, data) => {
  return axiosInstance.patch(`/company/${companyId}/customer/${customerId}`, data,{
    headers:{
      "Content-Type":'application/json'
    }
  })
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating customer by ID:', error);
      throw error;
    });
};

export const ProductGetAllApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}/product/all`);
};

export const ProductPostApi = (companyId, data) => {
  return axiosInstance.post(`/company/${companyId}/product`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Error creating product:', error);
      throw error;
    });
};

export const ProductGetApiById = (companyId, productId) => {
  return axiosInstance.get(`/company/${companyId}/product/${productId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching product by ID:', error);
      throw error;
    });
};

export const ProductDeleteApiById = (companyId, productId) => {
  return axiosInstance.delete(`/company/${companyId}/product/${productId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting product by ID:', error);
      throw error;
    });
};

export const ProductPutApiById = (companyId, productId, data) => {
  return axiosInstance.patch(`/company/${companyId}/product/${productId}`, data, {
    headers: {
      "Content-Type": 'application/json'
    }
  })
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating product by ID:', error);
      throw error;
    });
};


// Bank Get All API
export const BankGetAllApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}/bank`)
    // .then(response => response.data)
    // .catch(error => {
    //   console.error('Error fetching all banks:', error);
    //   throw error;
    // });
};

// Bank Post API (Create a new bank)
export const BankPostApi = (companyId, data) => {
  return axiosInstance.post(`/company/${companyId}/bank`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Error creating bank:', error);
      throw error;
    });
};

// Bank Get API by ID
export const BankGetApiById = (companyId, bankId) => {
  return axiosInstance.get(`/company/${companyId}/bank/${bankId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching bank by ID:', error);
      throw error;
    });
};

// Bank Delete API by ID
export const BankDeleteApiById = (companyId, bankId) => {
  return axiosInstance.delete(`/company/${companyId}/bank/${bankId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error deleting bank by ID:', error);
      throw error;
    });
};

// Bank Patch API by ID (Update a bank)
export const BankPutApiById = (companyId, bankId, data) => {
  return axiosInstance.patch(`/company/${companyId}/bank/${bankId}`, data, {
    headers: {
      "Content-Type": 'application/json'
    }
  })
    .then(response => response.data)
    .catch(error => {
      console.error('Error updating bank by ID:', error);
      throw error;
    });
};

export const InvoicePostApi = (companyId, customerId, data) => {
  return axiosInstance.post(`/company/${companyId}/customer/${customerId}/invoice`, data)
    .then(response => response.data)
    .catch(error => {
      console.error('Error creating product:', error);
      throw error;
    });
};

export const InvoiceGetAllApi = (companyId) => {
  return axiosInstance.get(`/company/${companyId}/invoice`);
};

export const InvoiceGetByCustomerIdApi = (companyId, customerId) => {
  return axiosInstance.get(`/company/${companyId}/customer/${customerId}/invoice`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching product by ID:', error);
      throw error;
    });
};

export const InvoiceGetApiById = (companyId, customerId, invoiceId) => {
  return axiosInstance.get(`/company/${companyId}/customer/${customerId}/invoice/${invoiceId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching product by ID:', error);
      throw error;
    });
};

export const InvoiceDownloadById = async (companyId, customerId, invoiceId) => {
  try {
    // Make the API request with specific headers for this request
    const response = await axiosInstance.get(`/company/${companyId}/customer/${customerId}/downloadInvoice/${invoiceId}`, {
      responseType: 'blob', // Handle the response as a binary blob (PDF)
      headers: {
        'Accept': 'application/pdf',  // Indicate that we expect a PDF
      },
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));

    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${customerId}_${invoiceId}.pdf`; // Customize the filename
    document.body.appendChild(link);
    link.click(); // Trigger the download
    document.body.removeChild(link); // Clean up the link element

    // Optionally revoke the URL to free up memory
    window.URL.revokeObjectURL(url);

    return true;  // Indicate success
  } catch (error) {
    console.error('Download error:', error);
    return false;  // Indicate failure
  }
};
export const DialCodesListApi = () => {
  return axiosInstance.get(`/dialcodes/list`);
}
export const TdsGetApi = () => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.get(`/company/${company}/tds`);
};
export const TdsPostApi = (data) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.post(`/company/${company}/tds`, data, {
    headers: { "Content-Type": "application/json" },
  });
};
export const TdsPatchApi = (id, data) => {
  const company = localStorage.getItem("companyName"); // Retrieve company name
  return axiosInstance.patch(`/company/${company}/tds/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });
};
export const getCompanyTdsByYear = (year) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.get(`/company/${company}/tds/${year}/year`);
};

export const calendarPostAPI=async (data)=>{
  const company = localStorage.getItem("companyName")
    try {
    const response = await axiosInstance.post(`/company/${company}/calendar`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }  
}

export const CalendarGetApi=()=>{
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/company/${company}/calendar`);
}

export const CalendarGetApiById=(id)=>{
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/company/${company}/calendar/${id}`);
}

export const TodayCalendarGetApi=()=>{
  const company = localStorage.getItem("companyName")
  return axiosInstance.get(`/company/${company}/calendar/today`);
}

export const calendarPatchAPIById=async (data,id)=>{
  const company = localStorage.getItem("companyName")
    try {
    const response = await axiosInstance.patch(`/company/${company}/calendar/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }  
}

export const CalendarDeleteByIdApi = async (id) => {
  const company = localStorage.getItem("companyName")
  return axiosInstance.delete(`/company/${company}/calendar/${id}`);
};

export const UserGetApi = () => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.get(`/${company}/users`);
};
export const UserPostApi = (data) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.post(`/${company}/user`, data);
};
export const UserPatchApi = (id, data) => {
  const company = localStorage.getItem("companyName"); // Retrieve company name
  return axiosInstance.patch(`/${company}/user/${id}`, data);
};
export const getUserById = (id) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.get(`/${company}/user/${id}`);
};
export const DeleteUserById = (id) => {
  const company = localStorage.getItem("companyName");
  return axiosInstance.delete(`/${company}/user/${id}`);
};
