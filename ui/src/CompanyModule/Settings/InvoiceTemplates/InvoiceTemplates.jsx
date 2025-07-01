import React, { useEffect, useMemo, useState } from "react";
import LayOut from "../../../LayOut/LayOut";
import { TemplateGetAPI, TemplateSelectionPatchAPI } from "../../../Utils/Axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../Context/AuthContext";
import InvoiceTemplate1 from "./InvoiceTemplate1";
import InvoiceTemplate2 from "./InvoiceTemplate2";
import { Link } from "react-router-dom";



const InvoiceTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [fetchedTemplate, setFetchedTemplate] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
  const { company = {} } = useAuth();

// Place this at the top of your file (outside the component)
const staticInvoiceData = {
  invoice: {
    vendorCode: "11212254",
    purchaseOrder: "11212254",
    invoiceDate: "2025-06-17",
    dueDate: "2025-07-17",
    invoiceNo: "2025-26-006",
    subTotal: "4141.80",
    grandTotal: "4141.80",
    grandTotalInWords: "Four Thousand One Hundred and Forty One Rupees Only",
    notes: "Hsdfgdfvgbhrhtegredrv",
    productData: [
      {
        hsn: "456756",
        quantity: "65",
        service: "sdthg",
        unitCost: "54",
        gstPercentage: "18",
        items: "dsfhgn",
        totalCost: "4141.80"
      }
    ],
    productColumns: [
      { key: "items", title: "Item", type: "text" },
      { key: "hsn", title: "HSN-no", type: "text" },
      { key: "service", title: "Service", type: "text" },
      { key: "quantity", title: "Quantity", type: "number" },
      { key: "unitCost", title: "Unit Cost", type: "number" },
      { key: "gstPercentage", title: "GST (%)", type: "number" },
      { key: "totalCost", title: "Total Cost", type: "number" }
    ],
    shippedPayload: {
      customerName: "sdfd",
      address: "asdfgfv",
      mobileNumber: "9002343430"
    },
    status: "Pending",
    type: "invoice",
    salesPerson: "",
    shippingMethod: "",
    shippingTerms: "",
    paymentTerms: "Net 30",
    deliveryDate: "",
    cgst: "18",
    sgst: "18",
    igst: "18"
  },
  company: {
    gstNo: "27AAPCS1293R1ZD",
    panNo: "AAPCS1293R",
    companyName: "FEED",
    companyAddress: "Hyderabad",
    companyType: "Private Limited",
    cinNo: "U85300GJ2020NPL114653",
    shortName: "feed",
    mobileNo: "+91 9023446653",
    emailId: "feed@gmail.com"
  },
  customer: {
    customerName: "Bala Narednra",
    address: "Hyderabad",
    state: "Telangana",
    city: "Hyderabad",
    pinCode: "500081",
    stateCode: "",
    mobileNumber: "+919335935503",
    email: "balanarendra@gmail.com",
    customerGstNo: "",
    status: "QWN0aXZl"
  },
  bank: {
    accountNumber: "770766505404340",
    accountType: "Savings",
    bankName: "HDFC Bank",
    branch: "Narasaraopet",
    ifscCode: "HDFC0001245",
    address: "Hyderabad",
    type: "bank_details"
  }
};
// ...rest of your component code...
  const fetchTemplate = async () => {
    try {
      const res = await TemplateGetAPI(company.id);
      const templateNo = res.data.data.invoiceTemplateNo; // Changed to invoiceTemplateNo
      setFetchedTemplate(res.data.data);
      setIsFetched(true);
      const templateToSelect = templates.find(
        (template) => template.name === templateNo
      );
      if (templateToSelect) {
        setSelectedTemplate(templateToSelect);
        setActiveCardIndex(templates.indexOf(templateToSelect));
      }
    } catch (error) {
      handleApiErrors(error);
    }
  };
  
  useEffect(() => {
    if (company) {
      fetchTemplate(company.id);
    }
  }, [company]);

  const templates = useMemo(
    () => [
      {
        title: "Template 1",
        name: "1",
        content: (data) => (
          <InvoiceTemplate1
            companyLogo={company?.imageFile || "default-logo.png"}
            companyData={staticInvoiceData.company || {}}
            InvoiceStaticData={staticInvoiceData}
            bankDetails={staticInvoiceData.bank|| {}}
            // Add other invoice-specific props here
          />
        ),
      },
      {
        title: "Template 2",
        name: "2",
        content: (data) => (
          <InvoiceTemplate2
            companyLogo={company?.imageFile || "default-logo.png"}
            companyData={staticInvoiceData.company || {}}
            InvoiceStaticData={staticInvoiceData}
            bankDetails={staticInvoiceData.bank|| {}}
            // Add other invoice-specific props here
          />
        ),
      },
    ],
    [company]
  );

  useEffect(() => {
    setSelectedTemplate(templates[0]);
    setActiveCardIndex(0);
  }, [templates]);

  const handleCardClick = (template, index) => {
    setSelectedTemplate(template);
    setActiveCardIndex(index);
    setIsFetched(false);
  };

  const handleSubmitTemplate = async () => {
    const dataToSubmit = {
      companyId: company.id,
      invoiceTemplateNo: selectedTemplate.name, // Changed to invoiceTemplateNo
    };

    try {
      const response = await TemplateSelectionPatchAPI(dataToSubmit);
      if (response.data) {
        toast.success("Template submitted successfully!");
        setSelectedTemplate(null);
        setActiveCardIndex(null);
        setIsFetched(false);
      } else {
        toast.error("Failed to submit template");
      }
    } catch (error) {
      console.error("API call error:", error);
      if (error.response) {
        const errorMessage =
          error.response.data.error?.message || "An error occurred";
        toast.error(`${errorMessage}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleApiErrors = (error) => {
    if (error.response?.data?.error?.message) {
      toast.error(error.response.data.error.message);
    } else {
      console.error(error.response);
    }
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Invoice Templates</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>    
                </li>
                <li className="breadcrumb-item active">Invoice Templates</li>
              </ol>
            </nav>
          </div>
        </div>
        <div>
          <div className="row d-flex justify-content-evenly">
            {templates.map((template, index) => (
              <div className="col-md-3" key={index} onClick={() => handleCardClick(template, index)}>
                <div className={`card mb-3 cursor-grab border ${activeCardIndex === index ? "bg-light" : ""}`}>
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title text-muted">
                          {template.title}
                        </h5>
                      </div>
                    </div>
                    <div className="mb-0">
                      <span className="text-muted">Click to view.</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedTemplate && (
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title text-center">
                  {selectedTemplate.title}
                </h5>
                {selectedTemplate.content("")}
                <div className="text-end">
                  {!isFetched && (
                    <>
                      <button
                        className="btn btn-secondary mt-3 me-2"
                        onClick={() => {
                          setSelectedTemplate(null);
                          setActiveCardIndex(null);
                          setIsFetched(false);
                        }}
                      >
                        Close
                      </button>
                      <button
                        className="btn btn-primary mt-3"
                        type="button"
                        onClick={handleSubmitTemplate}
                      >
                        Select Template
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayOut>
  );
};

export default InvoiceTemplates;