import React from "react";
import { useLocation } from "react-router-dom";
import CheckoutForm from "../components/CheckoutForm";

const PaymentPage = () => {
  const location = useLocation();
  const { amount, registrationData } = location.state || { amount: 0, registrationData: {} };

  return (
    <div className="payment-container">
      <h2>Proceed to Secure Payment</h2>
      <CheckoutForm amount={amount} registrationData={registrationData} />
    </div>
  );
};

export default PaymentPage;
