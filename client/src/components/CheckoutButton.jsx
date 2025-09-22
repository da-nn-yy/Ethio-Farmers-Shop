import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Icon from './AppIcon';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../hooks/useLanguage';

const CheckoutButton = ({ className = '', size = 'default' }) => {
  const navigate = useNavigate();
  const { items: cartItems, totalCost } = useCart();
  const { language } = useLanguage();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert(language === 'am' ? 'ጋሪዎ ባዶ ነው' : 'Your cart is empty');
      return;
    }
    navigate('/payments');
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <Button
      onClick={handleCheckout}
      className={`w-full ${className}`}
      size={size}
    >
      <Icon name="CreditCard" className="mr-2" />
      {language === 'am' ? 'ክፍያ ይፈጽሙ' : 'Checkout'} (ETB {totalCost.toFixed(2)})
    </Button>
  );
};

export default CheckoutButton;
