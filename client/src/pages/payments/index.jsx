import React from 'react';
import BuyerPaymentPage from './BuyerPaymentPage.jsx';
import FarmerPaymentPage from './FarmerPaymentPage.jsx';

const PaymentsPage = () => {
  const role = localStorage.getItem('userRole');
  if (role === 'farmer') return <FarmerPaymentPage />;
  return <BuyerPaymentPage />;
};

export default PaymentsPage;


