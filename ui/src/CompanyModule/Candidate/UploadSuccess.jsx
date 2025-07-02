import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircleFill, FileEarmarkText } from 'react-bootstrap-icons';
import LayOut from '../../LayOut/LayOut';

const UploadSuccess = () => {
  const { state } = useLocation();
  const documents = state?.documents || {};

  const getUploadedFiles = () => {
    const files = [];
    
    if (documents.resume) files.push({ name: 'Resume/CV', type: 'resume' });
    if (documents.idProof) files.push({ name: 'ID Proof', type: 'idProof' });
    
    if (documents.education?.tenth.file) files.push({ name: '10th Certificate', type: 'tenth' });
    if (documents.education?.twelfth.file) files.push({ name: '12th Certificate', type: 'twelfth' });
    if (documents.education?.ug.file) files.push({ name: 'Undergraduate Degree', type: 'ug' });
    if (documents.education?.pg.file) files.push({ name: 'Postgraduate Degree', type: 'pg' });
    if (documents.education?.others?.length > 0) {
      documents.education.others.forEach((_, i) => {
        files.push({ name: `Other Certificate ${i + 1}`, type: `other_${i}` });
      });
    }
    
    documents.experience?.forEach((exp, i) => {
      if (exp.file) files.push({ name: `Experience Letter: ${exp.company || `Company ${i + 1}`}`, type: `exp_${i}` });
    });
    
    return files;
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3"><strong>Document Submission</strong></h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Submission Complete</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Submission Confirmation</h5>
                <div className="dropdown-divider" style={{ borderTopColor: "#d7d9dd" }} />
              </div>

              <div className="card-body">
                <div className="text-center mb-4">
                  <CheckCircleFill color="green" size={48} className="mb-3" />
                  <h3 className="mb-2">Documents Submitted Successfully!</h3>
                  <p className="lead">Thank you for completing your document submission.</p>
                </div>

                <div className="mb-4">
                  <h6 className="text-primary">Documents Received:</h6>
                  <div className="dropdown-divider mb-3" style={{ borderTopColor: "#d7d9dd" }} />
                  <ul className="list-group">
                    {getUploadedFiles().map((file, index) => (
                      <li key={index} className="list-group-item">
                        <FileEarmarkText className="me-2 text-primary" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="alert alert-info">
                  <strong>Next Steps:</strong> Our HR team will verify your documents and contact you 
                  within 3-5 working days. Please check your email regularly for updates.
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <Link to="/main" className="btn btn-primary">
                    Return to Dashboard
                  </Link>
                </div>
              </div>

              <div className="card-footer text-muted text-center">
                <small>Submission ID: {Date.now().toString(36).toUpperCase()}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default UploadSuccess;