import React, { useState } from 'react';
import LayOut from '../../LayOut/LayOut';

const OfferLetters = () => {
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateTemplate = (e) => {
    e.preventDefault();
    // Handle template creation logic here (e.g., API call)
    console.log("Creating template:", { templateName, description });
    // Reset form fields after submission
    setTemplateName('');
    setDescription('');
  };

  return (
    <LayOut>
      <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
        <div className="col">
          <h1 className="h3 mb-3"><strong>Offer Letters</strong></h1>
        </div>
        <div className="col-auto">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="/main">Home</a></li>
              <li className="breadcrumb-item active">Offer Letters</li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title" style={{ color: "black" }}>Template 1</h5>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title" style={{ color: "black" }}>Template 2</h5>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title" style={{ color: "black" }}>Template 3</h5>
            </div>
          </div>
        </div>
      </div>
      <div className="col mt-4">
        <h1 className="h3 mb-3"><strong>Create New Template</strong></h1>
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type='text'
                className='form-control'
              />
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default OfferLetters;
