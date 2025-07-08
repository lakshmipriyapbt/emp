import React, { useMemo } from "react";
import InvoiceTemplate1 from "./InvoiceTemplate1";
import InvoiceTemplate2 from "./InvoiceTemplate2";
import { useAuth } from "../../../Context/AuthContext";

// Supports up to 999999999.99 and returns Indian-style words (Rupees & Paise)
const convertNumberToWords = (amount) => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen',
    'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function numToWords(num) {
    if ((num = num.toString()).length > 9) return 'Overflow';
    const n = ('000000000' + num).substr(-9).match(/(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})/);
    if (!n) return;
    let str = '';
    str += n[1] !== '00' ? (a[+n[1]] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' Crore ' : '';
    str += n[2] !== '00' ? (a[+n[2]] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' Lakh ' : '';
    str += n[3] !== '00' ? (a[+n[3]] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' Thousand ' : '';
    str += n[4] !== '0' ? (a[+n[4]] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' Hundred ' : '';
    str += n[5] !== '00' ? ((str !== '') ? 'and ' : '') + (a[+n[5]] || b[n[5][0]] + ' ' + a[n[5][1]]) + ' ' : '';
    return str.trim();
  }

  const [rupees, paise] = amount.toFixed(2).split(".");
  const rupeeWords = numToWords(rupees);
  const paiseWords = paise && parseInt(paise) > 0 ? `and ${numToWords(paise)} Paise` : '';
  return `${rupeeWords} Rupees ${paiseWords} Only`.replace(/\s+/g, ' ');
};


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
          grandTotalInWords: convertNumberToWords(grandTotal),
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
            companyData={templateData?.companyData}
            InvoiceStaticData={templateData?.InvoiceStaticData}
            bankDetails={templateData?.bankDetails}
            stampImage={company?.stampImage || "default-stamp.png"}
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