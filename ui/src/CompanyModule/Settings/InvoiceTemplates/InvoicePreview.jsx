import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import InvoiceTemplate1 from "./InvoiceTemplate1";
import InvoiceTemplate2 from "./InvoiceTemplate2";
import { useAuth } from "../../../Context/AuthContext";
import { TemplateGetAPI } from "../../../Utils/Axios";

const InvoicePreview = ({ previewData }) => {
  const { company } = useAuth();
const [selectedTemplate, setSelectedTemplate] = useState(null);
    const fetchTemplate = async () => {
      try {
        const res = await TemplateGetAPI(company.id);
        const templateNo = res.data.data.invoiceTemplateNo; // Changed to invoiceTemplateNo
        setSelectedTemplate(res.data.data);
       
      } catch (error) {
        handleApiErrors(error);
      }
    };

    useEffect(() => {
      if (company) {    
        fetchTemplate(company.id);
      } 
    }, [company]);
    
      const handleApiErrors = (error) => {
        if (error.response?.data?.error?.message) {
          toast.error(error.response.data.error.message);
        } else {
          console.error(error.response);
        }
      };

  // Transform data for templates with proper error handling
  const templateData = useMemo(() => {
    if (!previewData) {
      console.error("No preview data provided");
      return null;
    }

    try {
      // Normalize product data structure
      const normalizedProducts = (previewData.productData || []).map(item => ({
        items: item.items || item.productName || 'Unnamed Product',
        hsn: item.hsn || '',
        service: item.service || '',
        quantity: item.quantity || 0,
        unitCost: item.unitCost || item.price || 0,
        gstPercentage: item.gstPercentage || 0,
        totalCost: item.totalCost || (item.quantity * (item.unitCost || item.price || 0)) || 0
      }));

      // Calculate subtotal if not provided
      const subTotal = parseFloat(previewData.subTotal) || 
        normalizedProducts.reduce((sum, item) => sum + parseFloat(item.totalCost || 0), 0);

      // Determine template to use (priority: prop > company setting > default to 1)
      const templateToUse = selectedTemplate || company?.invoiceTemplateNo || "1";

      return {
        template: templateToUse,
        companyData: {
          ...company,
          companyName: company?.companyName || previewData.company?.companyName,
          address: company?.companyAddress || company?.address || previewData.company?.address,
          imageFile: company?.imageFile || previewData.company?.imageFile,
          stampImage: company?.stampImage || previewData.company?.stampImage,
          gstNo: company?.gstNo || previewData.company?.gstNo,
          panNo: company?.panNo || previewData.company?.panNo
        },
        InvoiceStaticData: {
          ...previewData,
          productData: normalizedProducts,
          productColumns: previewData.productColumns || [
            { key: "items", title: "Item" },
            { key: "hsn", title: "HSN-no" },
            { key: "service", title: "Service" },
            { key: "quantity", title: "Quantity" },
            { key: "unitCost", title: "Unit Cost" },
            { key: "gstPercentage", title: "GST (%)" },
            { key: "totalCost", title: "Total Cost" }
          ],
          subTotal: subTotal.toFixed(2),
          billedTo: previewData.billedTo || {
            customerName: "",
            address: "",
            mobileNumber: "",
            email: "",
            customerGstNo: ""
          }
        },
        bankDetails: previewData.bankDetails || {}
      };
    } catch (error) {
      console.error("Error transforming invoice data:", error);
      toast.error("Failed to process invoice data");
      return null;
    }
  }, [previewData, company, selectedTemplate]);

  // Memoized templates to prevent unnecessary re-renders
  const templates = useMemo(() => ({
    "1": (
      <div className="p-3">
        <InvoiceTemplate1
          companyLogo={templateData?.companyData?.imageFile}
          companyData={templateData?.companyData}
          InvoiceStaticData={templateData?.InvoiceStaticData}
          bankDetails={templateData?.bankDetails}
        />
      </div>
    ),
    "2": (
      <div className="p-3">
        <InvoiceTemplate2
          companyLogo={templateData?.companyData?.imageFile}
          companyData={templateData?.companyData}
          InvoiceStaticData={templateData?.InvoiceStaticData}
          bankDetails={templateData?.bankDetails}
        />
      </div>
    )
  }), [templateData]);

  if (!templateData) {
    return (
      <div className="text-center p-5">
        <div className="alert alert-warning">
          Unable to load invoice data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div 
        className="invoice-preview-container" 
        style={{ 
          backgroundColor: '#fff',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          maxWidth: '100%',
          overflowX: 'auto'
        }}
      >
        {templates[templateData.template] || templates["1"]}
      </div>
    </div>
  );
};

export default InvoicePreview;