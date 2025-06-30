import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import InvoiceTemplate1 from "./InvoiceTemplate1";
import InvoiceTemplate2 from "./InvoiceTemplate2";
import { useAuth } from "../../../Context/AuthContext";

const InvoicePreview = ({ previewData, selectedTemplate }) => {
  const { company } = useAuth();

  const transformDataForTemplates = () => {
    if (!previewData) return null;

    // Calculate totals if not provided
    const subTotal = previewData.subTotal || 
      (previewData.productData?.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0) || 0);
    const sgst = subTotal * 0.09;
    const cgst = subTotal * 0.09;
    const grandTotal = subTotal + sgst + cgst;

    return {
      companyData: {
        ...company,
        address: company.companyAddress || company.address,
      },
      InvoiceStaticData: {
        ...previewData,
      },
      bankDetails: previewData.bankDetails || {}
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