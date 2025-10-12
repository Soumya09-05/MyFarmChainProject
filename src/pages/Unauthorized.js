import React from "react";
import { useNavigate } from "react-router-dom";



const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <button 
          className="btn-primary" 
          onClick={() => navigate("/login")}
          style={{ marginTop: "20px" }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;