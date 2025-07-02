import React, {useMemo} from "react";
import { useAuth } from "../../Context/AuthContext";
import InvoiceTemplate1 from "../../CompanyModule/Settings/InvoiceTemplates/InvoiceTemplate1";
import InvoiceTemplate2 from "../../CompanyModule/Settings/InvoiceTemplates/InvoiceTemplate2";



const InvoicePdf = ({ previewData,invoiceTemplateNumber}) => {
  const { company } = useAuth();
  const selectedTemplate= invoiceTemplateNumber // Default to template 1 if not provided
 console.log("company:", company);
  console.log("previewData:", previewData);
  // useEffect(() => {
  //   fetchTemplate();
  // }, [company.id]);

  // const fetchTemplate = async () => {
  //   try {
  //     const res = await TemplateGetAPI(company.id);
  //     const templateNumber = res.data.data.invoiceTemplateNo;
  //       setSelectedTemplate(templateNumber);

  //     } catch (error) {
  //       handleError(error);
  //     }
  //   };
  //     const handleError = (errors) => {
  //       if (errors.response) {
  //         const status = errors.response.status;
  //         let errorMessage = "";
    
  //         switch (status) {
  //           case 403:
  //             errorMessage = "Session Timeout!";
  //             navigate("/");
  //             break;
  //           case 404:
  //             errorMessage = "Resource Not Found!";
  //             break;
  //           case 406:
  //             errorMessage = "Invalid Details!";
  //             break;
  //           case 500:
  //             errorMessage = "Server Error!";
  //             break;
  //           default:
  //             errorMessage = "An Error Occurred!";
  //             break;
  //         }    
  //         toast.error(errorMessage, {
  //           position: "top-right",
  //           transition: Bounce,
  //           hideProgressBar: true,
  //           theme: "colored",
  //           autoClose: 3000,
  //         });
  //       } else {
  //         // toast.error("Network Error!", {
  //         //   position: "top-right",
  //         //   transition: Bounce,
  //         //   hideProgressBar: true,
  //         //   theme: "colored",
  //         //   autoClose: 3000,
  //         // });
  //       }
  //     };


  const templates = useMemo(() => [
    {
      name: "1",
      component: (
        <div className="p-3">
          <InvoiceTemplate1
            companyLogo={company?.imageFile}
            companyData={previewData.company}
            InvoiceStaticData={previewData}
            bankDetails={previewData?.bank}
            stampImage={company?.stampImage || "default-stamp.png"}
          />
        </div>
      )
    },
    {
      name: "2",
      component: (
        <div className="p-3">
          <InvoiceTemplate2
           companyLogo={company?.imageFile}
            companyData={previewData.company}
            InvoiceStaticData={previewData}
            bankDetails={previewData?.bank}
            stampImage={company?.stampImage || "default-stamp.png"}
          />
        </div>
      )
    }
  ], [company?.imageFile, previewData]);

  const selectedTemplateComponent = useMemo(() => {
    if (!selectedTemplate || !previewData) return null;
    const template = templates.find(t => t.name === selectedTemplate);
    return template ? template.component : null;
  }, [selectedTemplate, templates]);

  if (!previewData) {
    return <div className="text-center p-5">Loading preview data...</div>;
  }

  return (
    <div className="container-fluid p-0">
      <div className="invoice-preview-container" style={{ 
        backgroundColor: '#fff',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        maxWidth: '100%',
        overflowX: 'auto'
      }}>
        {selectedTemplateComponent}
      </div>
    </div>
  );
};

export default InvoicePdf;