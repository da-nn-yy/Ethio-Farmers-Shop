import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/AppIcon.jsx';
import { orderService } from '../../services/apiService.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useCart } from '../../hooks/useCart.jsx';
import { useLanguage } from '../../hooks/useLanguage.jsx';

const BuyerPaymentPage = () => {
  const { user } = useAuth();
  const { items: cartItems, totalCost, clear: clearCart } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Payment form states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentData, setPaymentData] = useState({});
  const [processingPayment, setProcessingPayment] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => { 
    if (language !== currentLanguage) setCurrentLanguage(language); 
  }, [language]);

  useEffect(() => { 
    load(true); 
  }, []);

  const load = async (reset = false) => {
    try {
      setLoading(true);
      // Use buyer orders and derive payments (completed orders as paid)
      const res = await orderService.getBuyerOrders({ status: 'completed', page: reset ? 1 : page, limit: 10 });
      const items = Array.isArray(res) ? res : (res.orders || []);
      const mapped = items.map(o => ({
        id: o.id,
        amount: Number(o.totalPrice || o.total || 0),
        createdAt: o.createdAt || o.created_at,
        farmerName: o.farmerName,
        reference: `ORD-${o.id}`,
        method: o.paymentMethod || 'Cash',
        status: 'paid'
      }));
      setPayments(reset ? mapped : [...payments, ...mapped]);
      setHasMore(res?.pagination?.hasNext || false);
      if (reset) setPage(1);
      setError('');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const total = payments.reduce((s, p) => s + (p.amount || 0), 0);
    return { count: payments.length, total };
  }, [payments]);

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    setPaymentData({});
  };

  const handlePaymentDataChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const processPayment = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Please provide a delivery address');
      return;
    }

    try {
      setProcessingPayment(true);
      setError('');

      // Create order data
      const orderData = {
        items: cartItems.map(item => ({
          listingId: item.id,
          quantity: item.quantity,
          pricePerKg: item.pricePerKg,
          totalPrice: item.pricePerKg * item.quantity
        })),
        totalPrice: totalCost,
        deliveryAddress,
        deliveryNotes,
        paymentMethod: selectedPaymentMethod,
        paymentData
      };

      // Create the order
      const order = await orderService.createOrder(orderData);
      
      // Clear cart
      clearCart();
      
      // Show success message
      alert(currentLanguage === 'am' ? 'ትዕዛዝ በተሳካ ሁኔታ ተፈጥሯል!' : 'Order placed successfully!');
      
      // Navigate to order confirmation or dashboard
      navigate('/dashboard-buyer-home');
      
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const paymentMethods = [
    {
      id: 'card',
      name: currentLanguage === 'am' ? 'የክሬዲት ካርድ' : 'Credit/Debit Card',
      icon: 'CreditCard',
      description: currentLanguage === 'am' ? 'Visa, Mastercard, ወይም American Express' : 'Visa, Mastercard, or American Express'
    },
    {
      id: 'mobile_money',
      name: currentLanguage === 'am' ? 'ሞባይል ገንዘብ' : 'Mobile Money',
      icon: 'Smartphone',
      description: currentLanguage === 'am' ? 'CBE Birr, M-Pesa, ወይም Telebirr' : 'CBE Birr, M-Pesa, or Telebirr'
    },
    {
      id: 'bank_transfer',
      name: currentLanguage === 'am' ? 'የባንክ ማስተላለፍ' : 'Bank Transfer',
      icon: 'Building2',
      description: currentLanguage === 'am' ? 'ቀጥታ የባንክ ማስተላለፍ' : 'Direct bank transfer'
    },
    {
      id: 'cash_on_delivery',
      name: currentLanguage === 'am' ? 'በማድረሻ ገንዘብ' : 'Cash on Delivery',
      icon: 'Banknote',
      description: currentLanguage === 'am' ? 'በምርቱ ሲደርስ ይክፈሉ' : 'Pay when the product arrives'
    }
  ];

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            {currentLanguage === 'am' ? 'ክፍያ እና ትዕዛዝ' : 'Payment & Orders'}
          </h1>
          <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => load(true)}>
            {currentLanguage === 'am' ? 'አድስ' : 'Refresh'}
          </Button>
        </div>

        {/* Cart Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="bg-card border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {currentLanguage === 'am' ? 'የጋሪ ማጠቃለያ' : 'Cart Summary'}
              </h2>
              <span className="text-sm text-text-secondary">
                {cartItems.length} {currentLanguage === 'am' ? 'እቃዎች' : 'items'}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-text-primary">{item.name}</h3>
                    <p className="text-sm text-text-secondary">
                      {item.quantity} kg × ETB {item.pricePerKg}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">
                      ETB {(item.quantity * item.pricePerKg).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-bold text-text-primary">
                <span>{currentLanguage === 'am' ? 'ጠቅላላ ዋጋ' : 'Total'}</span>
                <span>ETB {totalCost.toFixed(2)}</span>
              </div>
              
              <div className="mt-4">
                <Button 
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full"
                  size="lg"
                >
                  <Icon name="CreditCard" className="mr-2" />
                  {currentLanguage === 'am' ? 'ክፍያ ይፈጽሙ' : 'Proceed to Payment'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text-primary">
                    {currentLanguage === 'am' ? 'ክፍያ ይፈጽሙ' : 'Complete Payment'}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPaymentForm(false)}
                  >
                    <Icon name="X" />
                  </Button>
                </div>

                {/* Delivery Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    {currentLanguage === 'am' ? 'የማድረሻ መረጃ' : 'Delivery Information'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        {currentLanguage === 'am' ? 'የማድረሻ አድራሻ' : 'Delivery Address'} *
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={3}
                        placeholder={currentLanguage === 'am' ? 'የማድረሻ አድራሻዎን ያስገቡ...' : 'Enter your delivery address...'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        {currentLanguage === 'am' ? 'ተጨማሪ ማስታወሻዎች' : 'Additional Notes'}
                      </label>
                      <textarea
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={2}
                        placeholder={currentLanguage === 'am' ? 'ለገበያው ማስታወሻዎች...' : 'Notes for the farmer...'}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    {currentLanguage === 'am' ? 'የክፍያ ዘዴ' : 'Payment Method'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPaymentMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handlePaymentMethodChange(method.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedPaymentMethod === method.id ? 'bg-primary/10' : 'bg-gray-100'
                          }`}>
                            <Icon name={method.icon} size={20} className={
                              selectedPaymentMethod === method.id ? 'text-primary' : 'text-gray-600'
                            } />
                          </div>
                          <div>
                            <h4 className="font-medium text-text-primary">{method.name}</h4>
                            <p className="text-sm text-text-secondary">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Details Form */}
                {selectedPaymentMethod && selectedPaymentMethod !== 'cash_on_delivery' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                      {currentLanguage === 'am' ? 'የክፍያ ዝርዝሮች' : 'Payment Details'}
                    </h3>
                    <div className="space-y-4">
                      {selectedPaymentMethod === 'card' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              {currentLanguage === 'am' ? 'ካርድ ቁጥር' : 'Card Number'}
                            </label>
                            <input
                              type="text"
                              value={paymentData.cardNumber || ''}
                              onChange={(e) => handlePaymentDataChange('cardNumber', e.target.value)}
                              className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                {currentLanguage === 'am' ? 'የሚያልቅበት ቀን' : 'Expiry Date'}
                              </label>
                              <input
                                type="text"
                                value={paymentData.expiryDate || ''}
                                onChange={(e) => handlePaymentDataChange('expiryDate', e.target.value)}
                                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="MM/YY"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                CVV
                              </label>
                              <input
                                type="text"
                                value={paymentData.cvv || ''}
                                onChange={(e) => handlePaymentDataChange('cvv', e.target.value)}
                                className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPaymentMethod === 'mobile_money' && (
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            {currentLanguage === 'am' ? 'ሞባይል ቁጥር' : 'Mobile Number'}
                          </label>
                          <input
                            type="text"
                            value={paymentData.mobileNumber || ''}
                            onChange={(e) => handlePaymentDataChange('mobileNumber', e.target.value)}
                            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="+251 9XX XXX XXX"
                          />
                        </div>
                      )}
                      {selectedPaymentMethod === 'bank_transfer' && (
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            {currentLanguage === 'am' ? 'የባንክ ስም' : 'Bank Name'}
                          </label>
                          <select
                            value={paymentData.bankName || ''}
                            onChange={(e) => handlePaymentDataChange('bankName', e.target.value)}
                            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="">{currentLanguage === 'am' ? 'ባንክ ይምረጡ' : 'Select Bank'}</option>
                            <option value="cbe">Commercial Bank of Ethiopia</option>
                            <option value="awash">Awash Bank</option>
                            <option value="dashen">Dashen Bank</option>
                            <option value="abyssinia">Abyssinia Bank</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1"
                  >
                    {currentLanguage === 'am' ? 'ይሰርዙ' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={processPayment}
                    disabled={processingPayment}
                    className="flex-1"
                  >
                    {processingPayment ? (
                      <>
                        <Icon name="Loader2" className="mr-2 animate-spin" />
                        {currentLanguage === 'am' ? 'በማስተላለፍ ላይ...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <Icon name="CreditCard" className="mr-2" />
                        {currentLanguage === 'am' ? 'ትዕዛዝ ይፈጽሙ' : 'Place Order'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon name="CreditCard" size={16} className="text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">ETB {totals.total.toFixed(2)}</div>
              <div className="text-sm text-text-secondary">
                {currentLanguage === 'am' ? 'ጠቅላላ የተከፈለ' : 'Total Paid'}
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Hash" size={16} className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{totals.count}</div>
              <div className="text-sm text-text-secondary">
                {currentLanguage === 'am' ? 'ክፍያዎች' : 'Payments'}
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-card border rounded-lg">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-text-primary">
              {currentLanguage === 'am' ? 'የክፍያ ታሪክ' : 'Payment History'}
            </h2>
          </div>
          <div className="divide-y">
            {loading && payments.length === 0 && (
              <div className="p-6 text-center text-text-secondary">
                {currentLanguage === 'am' ? 'ክፍያዎች በመጫን ላይ...' : 'Loading payments...'}
              </div>
            )}
            {error && (
              <div className="p-4 text-error">{error}</div>
            )}
            {payments.length === 0 && !loading && (
              <div className="p-6 text-center text-text-secondary">
                {currentLanguage === 'am' ? 'ምንም ክፍያ አልተገኘም' : 'No payments found'}
              </div>
            )}
            {payments.map(p => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">{p.reference}</div>
                  <div className="text-sm text-text-secondary">
                    {new Date(p.createdAt).toLocaleString()} • {p.method}
                  </div>
                  {p.farmerName && (
                    <div className="text-sm text-text-secondary">
                      {currentLanguage === 'am' ? 'ከ' : 'From'}: {p.farmerName}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-text-primary">ETB {p.amount.toFixed(2)}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                    {currentLanguage === 'am' ? 'ተከፍሏል' : 'Paid'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center py-4 border-t">
              <Button variant="outline" onClick={() => { setPage(p => p + 1); load(false); }}>
                {currentLanguage === 'am' ? 'ተጨማሪ ጫን' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default BuyerPaymentPage;
