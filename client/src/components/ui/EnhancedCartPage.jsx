import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '../ui/AuthenticatedLayout.jsx';
import Button from './Button.jsx';
import Icon from '../AppIcon.jsx';
import { useCart } from '../../hooks/useCart.jsx';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import InstagramStyleGallery from './InstagramStyleGallery.jsx';

const EnhancedCartPage = () => {
  const { items, updateQuantity, removeItem, clear, totalCost, totalItems } = useCart();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const currentLanguage = language || 'en';

  const translations = {
    en: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      emptySubtitle: 'Add some items to get started',
      continueShopping: 'Continue Shopping',
      item: 'item',
      items: 'items',
      quantity: 'Quantity',
      price: 'Price',
      total: 'Total',
      subtotal: 'Subtotal',
      delivery: 'Delivery Fee',
      tax: 'Tax',
      grandTotal: 'Grand Total',
      clearCart: 'Clear Cart',
      checkout: 'Proceed to Checkout',
      remove: 'Remove',
      update: 'Update',
      saveForLater: 'Save for Later'
    },
    am: {
      title: 'የግዛት ካርት',
      empty: 'ካርትዎ ባዶ ነው',
      emptySubtitle: 'ለመጀመር አንዳንድ እቃዎች ይጨምሩ',
      continueShopping: 'ግዛት ይቀጥሉ',
      item: 'እቃ',
      items: 'እቃዎች',
      quantity: 'ብዛት',
      price: 'ዋጋ',
      total: 'ጠቅላላ',
      subtotal: 'የመነሻ ዋጋ',
      delivery: 'የማድረሻ ክፍያ',
      tax: 'ግብር',
      grandTotal: 'ጠቅላላ ዋጋ',
      clearCart: 'ካርት አጽዳ',
      checkout: 'ወደ ክፍያ ቀጥል',
      remove: 'አስወግድ',
      update: 'አዘምን',
      saveForLater: 'ለኋላ አስቀምጥ'
    }
  };

  const t = translations[currentLanguage];

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/authentication-login-register');
      return;
    }

    if (items.length === 0) {
      alert(t.empty);
      return;
    }

    setIsCheckingOut(true);
    try {
      // Navigate to checkout/payment page
      navigate('/payments');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleContinueShopping = () => {
    navigate('/browse-listings-buyer-home');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    })?.format(price)?.replace('ETB', 'ETB');
  };

  const deliveryFee = 50; // Fixed delivery fee
  const tax = Math.round(totalCost * 0.15); // 15% tax
  const grandTotal = totalCost + deliveryFee + tax;

  if (items.length === 0) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Icon name="ShoppingCart" size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.empty}</h2>
            <p className="text-gray-600 mb-8">{t.emptySubtitle}</p>
            <Button onClick={handleContinueShopping} size="lg">
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              {t.continueShopping}
            </Button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-600 mt-1">
              {totalItems} {totalItems === 1 ? t.item : t.items}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={clear}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Icon name="Trash2" size={16} className="mr-2" />
            {t.clearCart}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <InstagramStyleGallery
                      images={item.images || (item.image ? [item.image] : [])}
                      alt={item.name}
                      className="w-full h-full"
                      showFullscreen={true}
                      showThumbnails={false}
                      autoPlay={false}
                      currentLanguage={currentLanguage}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {currentLanguage === 'am' ? item.nameAm || item.name : item.name}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {formatPrice(item.pricePerKg)} / kg
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-gray-600">{t.quantity}:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="rounded-r-none border-r border-gray-300"
                          disabled={item.quantity <= 1}
                        >
                          <Icon name="Minus" size={16} />
                        </Button>
                        <span className="px-4 py-2 text-center min-w-[3rem] border-r border-gray-300">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="rounded-l-none"
                        >
                          <Icon name="Plus" size={16} />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-lg font-semibold text-gray-900">
                      {formatPrice(item.pricePerKg * item.quantity)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.total}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{t.subtotal}</span>
                  <span>{formatPrice(totalCost)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.delivery}</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.tax}</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>{t.grandTotal}</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full"
                size="lg"
                loading={isCheckingOut}
                disabled={items.length === 0}
              >
                <Icon name="CreditCard" size={20} className="mr-2" />
                {t.checkout}
              </Button>

              <Button
                variant="outline"
                onClick={handleContinueShopping}
                className="w-full mt-3"
                size="lg"
              >
                <Icon name="ArrowLeft" size={20} className="mr-2" />
                {t.continueShopping}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default EnhancedCartPage;


