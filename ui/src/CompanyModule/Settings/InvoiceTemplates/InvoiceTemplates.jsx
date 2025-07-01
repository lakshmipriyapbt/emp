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

// Static data for the invoice template
 const staticInvoiceData = {
  productData: [
    { productName: "USB-C Hub", quantity: "3", price: "1200" },
    { productName: "Laptop Stand", quantity: "2", price: "1500" },
    { productName: "Webcam", quantity: "1", price: "2500" }
  ],
  productColumns: [
    { key: "productName", title: "Product Name", type: "text" },
    { key: "quantity", title: "Quantity", type: "number" },
    { key: "price", title: "Price", type: "number" }
  ],
  billedTo: {
    customerName: "Sneha Kapoor",
    email: "sneha.kapoor@techverse.com",
    mobileNumber: "+91-9123456780",
    address: "502, Park Avenue, Andheri West, Mumbai, Maharashtra, 400053",
    customerGstNo: "27AABCT1234J1ZL"
  },
  shippedPayload: [
    {
      customerName: "john doe",
      address: "Logistics Dept, TechVerse Pvt Ltd, MIDC, Andheri East, Mumbai, 400093",
      mobileNumber: "+91-9123456780"
    }
  ],
  vendorCode: "VEND56789",
  purchaseOrder: "PO123456",
  invoiceDate: "2025-06-20",
  invoiceNo: "INV2025-045",
  dueDate: "2025-07-05",
  subTotal: "7900",
  status: "Unpaid",
  bankId: "BANK567",
  notes: "Kindly confirm receipt upon delivery.",
  salesPerson: "Rajeev Menon",
  shippingMethod: "Blue Dart Express",
  shippingTerms: "Delivery within 5 business days",
  paymentTerms: "Net 30",
  deliveryDate: "2025-06-23"
};

const bankDetails = {
  accountHolder: "Tech Innovators Pvt Ltd",
  accountNumber: "1234567890",
  bankName: "HDFC Bank",
  accountType: "Current",
  ifscCode: "HDFC0000456",
  branch: "Koramangala Branch",
  address: "No. 65, 1st Main Road, Koramangala, Bengaluru, Karnataka 560034"
};



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
            companyData={company}
            InvoiceStaticData={staticInvoiceData}
            bankDetails={bankDetails}
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
            companyData={company}
            InvoiceStaticData={staticInvoiceData}
            bankDetails={bankDetails}
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