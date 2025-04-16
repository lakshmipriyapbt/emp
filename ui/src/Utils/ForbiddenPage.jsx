import React from "react";
import { Link } from "react-router-dom";

const ForbiddenPage = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <h1 className="display-4 text-danger">403 - Forbidden</h1>
      <p className="lead text-dark">You do not have permission to access this page.</p>
      <Link to="/" className="btn btn-primary btn-lg">
        Return to Home
      </Link>
    </div>
  );
};

export default ForbiddenPage;
