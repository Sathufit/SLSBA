import React, { useState } from "react";
import axios from "axios";

const CheckoutForm = ({ amount, registrationData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5001/api/payments/create-checkout-session", {
        amount,
        registrationData
      });

      if (response.data.url) {
        window.location.href = response.data.url; // Redirect to Stripe Checkout
      } else {
        setError("Failed to redirect to payment.");
      }
    } catch (err) {
      setError("Server error, please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleCheckout} disabled={loading} className="pay-btn">
        {loading ? "Processing..." : "Pay with Card"}
      </button>
    </div>
  );
};

export default CheckoutForm;
