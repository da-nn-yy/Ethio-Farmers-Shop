import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const PaymentHistory = ({ 
  currentLanguage = 'en',
  userType = 'buyer', // 'buyer' or 'farmer'
  payments = []
}) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Mock payment data
  const mockPayments = [
    {
      id: 'PAY001',
      type: 'bank',
      amount: 2500,
      currency: 'ETB',
      status: 'completed',
      date: '2025-01-15',
      time: '14:30',
      description: currentLanguage === 'am' ? 'የተጠባባቂ ምርቶች ክፍያ' : 'Payment for reserved products',
      method: currentLanguage === 'am' ? 'ባንክ ሂሳብ' : 'Bank Account',
      methodDetails: 'CBE - 1000123456789',
      transactionId: 'TXN123456789',
      orderId: 'ORD001'
    },
    {
      id: 'PAY002',
      type: 'mobile',
      amount: 1200,
      currency: 'ETB',
      status: 'pending',
      date: '2025-01-14',
      time: '09:15',
      description: currentLanguage === 'am' ? 'የሞባይል ባንኪንግ ክፍያ' : 'Mobile banking payment',
      method: currentLanguage === 'am' ? 'ቴሌብር' : 'Telebirr',
      methodDetails: '+251912345678',
      transactionId: 'TXN123456790',
      orderId: 'ORD002'
    },
    {
      id: 'PAY003',
      type: 'cash',
      amount: 3500,
      currency: 'ETB',
      status: 'completed',
      date: '2025-01-13',
      time: '16:45',
      description: currentLanguage === 'am' ? 'የሚደርስ ጊዜ ክፍያ' : 'Cash on delivery',
      method: currentLanguage === 'am' ? 'ጥሬ ገንዘብ' : 'Cash',
      methodDetails: currentLanguage === 'am' ? 'በማድረሻ ጊዜ' : 'On delivery',
      transactionId: 'TXN123456791',
      orderId: 'ORD003'
    },
    {
      id: 'PAY004',
      type: 'bank',
      amount: 1800,
      currency: 'ETB',
      status: 'failed',
      date: '2025-01-12',
      time: '11:20',
      description: currentLanguage === 'am' ? 'የባንክ ሂሳብ ክፍያ' : 'Bank account payment',
      method: currentLanguage === 'am' ? 'ዳሸን ባንክ' : 'Dashen Bank',
      methodDetails: 'Dashen - 2000987654321',
      transactionId: 'TXN123456792',
      orderId: 'ORD004'
    },
    {
      id: 'PAY005',
      type: 'mobile',
      amount: 950,
      currency: 'ETB',
      status: 'completed',
      date: '2025-01-11',
      time: '13:10',
      description: currentLanguage === 'am' ? 'የሞባይል ክፍያ' : 'Mobile payment',
      method: currentLanguage === 'am' ? 'አሞሌ' : 'Amole',
      methodDetails: '+251911234567',
      transactionId: 'TXN123456793',
      orderId: 'ORD005'
    }
  ];

  const displayPayments = payments.length > 0 ? payments : mockPayments;

  const filteredPayments = displayPayments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time);
    }
    if (sortBy === 'amount') {
      return b.amount - a.amount;
    }
    return 0;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10 border-success/20';
      case 'pending':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'failed':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-text-secondary bg-muted border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'pending':
        return 'Clock';
      case 'failed':
        return 'XCircle';
      default:
        return 'HelpCircle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return currentLanguage === 'am' ? 'ተጠናቋል' : 'Completed';
      case 'pending':
        return currentLanguage === 'am' ? 'በመጠባበቅ ላይ' : 'Pending';
      case 'failed':
        return currentLanguage === 'am' ? 'አልተሳካም' : 'Failed';
      default:
        return currentLanguage === 'am' ? 'ያልታወቀ' : 'Unknown';
    }
  };

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'bank':
        return 'Building2';
      case 'mobile':
        return 'Smartphone';
      case 'cash':
        return 'Banknote';
      case 'card':
        return 'CreditCard';
      default:
        return 'DollarSign';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date, time) => {
    const dateObj = new Date(date + ' ' + time);
    return dateObj.toLocaleDateString(currentLanguage === 'am' ? 'am-ET' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalAmount = displayPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedAmount = displayPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                {currentLanguage === 'am' ? 'ጠቅላላ ክፍያ' : 'Total Payments'}
              </p>
              <p className="text-lg font-semibold text-text-primary">
                {formatAmount(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-success" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                {currentLanguage === 'am' ? 'የተጠናቀቁ ክፍያዎች' : 'Completed Payments'}
              </p>
              <p className="text-lg font-semibold text-text-primary">
                {formatAmount(completedAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                {currentLanguage === 'am' ? 'በመጠባበቅ ላይ' : 'Pending Payments'}
              </p>
              <p className="text-lg font-semibold text-text-primary">
                {displayPayments.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            {currentLanguage === 'am' ? 'ሁሉም' : 'All'}
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            {currentLanguage === 'am' ? 'ተጠናቋል' : 'Completed'}
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            {currentLanguage === 'am' ? 'በመጠባበቅ ላይ' : 'Pending'}
          </Button>
          <Button
            variant={filter === 'failed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('failed')}
          >
            {currentLanguage === 'am' ? 'አልተሳካም' : 'Failed'}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">
            {currentLanguage === 'am' ? 'በማዋሃድ፡' : 'Sort by:'}
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-border rounded-md text-sm bg-surface"
          >
            <option value="date">{currentLanguage === 'am' ? 'ቀን' : 'Date'}</option>
            <option value="amount">{currentLanguage === 'am' ? 'መጠን' : 'Amount'}</option>
          </select>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-4">
        {sortedPayments.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Receipt" size={48} className="text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {currentLanguage === 'am' ? 'ክፍያ አልተገኘም' : 'No payments found'}
            </h3>
            <p className="text-text-secondary">
              {currentLanguage === 'am' 
                ? 'በተመረጠው ሁኔታ ምንም ክፍያ አልተገኘም።'
                : 'No payments found for the selected filter.'
              }
            </p>
          </div>
        ) : (
          sortedPayments.map((payment) => (
            <div key={payment.id} className="bg-surface p-4 rounded-lg border border-border hover:shadow-warm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={getPaymentTypeIcon(payment.type)} size={20} className="text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-text-primary">
                        {payment.description}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                        <Icon name={getStatusIcon(payment.status)} size={12} className="inline mr-1" />
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-text-secondary space-y-1">
                      <p>
                        <span className="font-medium">{currentLanguage === 'am' ? 'ዘዴ፡' : 'Method:'}</span> {payment.method}
                      </p>
                      <p>
                        <span className="font-medium">{currentLanguage === 'am' ? 'ዝርዝሮች፡' : 'Details:'}</span> {payment.methodDetails}
                      </p>
                      <p>
                        <span className="font-medium">{currentLanguage === 'am' ? 'ቀን፡' : 'Date:'}</span> {formatDate(payment.date, payment.time)}
                      </p>
                      <p>
                        <span className="font-medium">{currentLanguage === 'am' ? 'የትራንዛክሽን ID፡' : 'Transaction ID:'}</span> {payment.transactionId}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold text-text-primary">
                    {formatAmount(payment.amount)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {payment.currency}
                  </p>
                </div>
              </div>
              
              {payment.status === 'failed' && (
                <div className="mt-3 p-3 bg-error/5 rounded-lg border border-error/20">
                  <div className="flex items-center space-x-2">
                    <Icon name="AlertCircle" size={16} className="text-error" />
                    <span className="text-sm text-error">
                      {currentLanguage === 'am' 
                        ? 'ክፍያ አልተሳካም። እባክዎ እንደገና ይሞክሩ።'
                        : 'Payment failed. Please try again.'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
