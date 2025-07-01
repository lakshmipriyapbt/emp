import React, { useMemo } from "react";
import InvoiceTemplate1 from "./InvoiceTemplate1";
import InvoiceTemplate2 from "./InvoiceTemplate2";
import { useAuth } from "../../../Context/AuthContext";

const InvoicePreview = ({ previewData, selectedTemplate }) => {
  const { company } = useAuth();

 const transformDataForTemplates = () => {
    if (!previewData) return null;

    // Get GST numbers
    const companyGst = previewData.company?.gstNo || previewData.company?.gst || "";
    const customerGst = previewData.customer?.customerGstNo || previewData.customer?.gstNo || "";

    // Calculate subTotal as a number
    const productData = previewData.invoice?.productData || previewData.productData || [];
    const subTotal = Number(
      previewData.invoice?.subTotal
        || previewData.subTotal
        || productData.reduce(
          (sum, item) =>
            sum +
            (Number(item.unitCost || item.price || 0) * Number(item.quantity || 0)),
          0
        )
    );

    let cgst = 0, sgst = 0, igst = 0;

    if (
      customerGst &&
      companyGst &&
      companyGst.slice(0, 2) === customerGst.slice(0, 2)
    ) {
      // Same state: CGST + SGST
      cgst = subTotal * 0.09;
      sgst = subTotal * 0.09;
    } else if (customerGst && companyGst) {
      // Different state: IGST
      igst = subTotal * 0.18;
    }

    const grandTotal = subTotal + cgst + sgst + igst;
    return {
      companyData: {
        ...company,
        address: company.companyAddress || company.address,
      },
      InvoiceStaticData: {
        ...previewData,
        invoice: {
          ...previewData.invoice,
          subTotal: subTotal.toFixed(2),
          cgst: cgst ? cgst.toFixed(2) : "",
          sgst: sgst ? sgst.toFixed(2) : "",
          igst: igst ? igst.toFixed(2) : "",
          grandTotal: grandTotal.toFixed(2),
        },
      },
      bankDetails: previewData.bank || {},
    };
  };

  const templateData = transformDataForTemplates();

  const templates = useMemo(() => [
    {
      name: "1",
      component: (
        <div className="p-3">
          <InvoiceTemplate1
            companyLogo={company?.imageFile}
            companyData={templateData?.companyData}
            InvoiceStaticData={templateData?.InvoiceStaticData}
            bankDetails={templateData?.bankDetails}
          />
        </div>
      )
    },
    {
      name: "2",
      component: (
        <div className="p-3">
          <InvoiceTemplate2
            companyData={templateData?.companyData}
            InvoiceStaticData={templateData?.InvoiceStaticData}
            bankDetails={templateData?.bankDetails}
          />
        </div>
      )
    }
  ], [company?.imageFile, templateData]);

  const selectedTemplateComponent = useMemo(() => {
    if (!selectedTemplate || !templateData) return null;
    const template = templates.find(t => t.name === selectedTemplate);
    return template ? template.component : null;
  }, [selectedTemplate, templates]);

  if (!templateData) {
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

export default InvoicePreview;