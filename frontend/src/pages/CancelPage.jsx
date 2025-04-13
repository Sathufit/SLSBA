import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CancelPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); // Redirect back to Tournament Registration
    }, 3000); // Wait for 3 seconds

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [navigate]);

  return (
    <div className="cancel-container">
      <h2>Payment Canceled ❌</h2>
      <p>You will be redirected back to the registration form in a few seconds...</p>
    </div>
  );
};

export default CancelPage;
