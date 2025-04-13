import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); // Redirect back to Tournament Registration
    }, 5000); // Wait for 5 seconds before redirecting

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [navigate]);

  return (
    <div className="success-container">
      <h2>Payment Successful 🎉</h2>
      <p>Your tournament registration is confirmed.</p>
      <p>You will be redirected back to the registration form shortly...</p>
    </div>
  );
};

export default SuccessPage;
