import apiService from './apiService';

const paymentService = {
  // Payment Methods
  async getPaymentMethods(userId) {
    try {
      const response = await apiService.get(`/payments/methods/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  async addPaymentMethod(userId, paymentMethod) {
    try {
      const response = await apiService.post(`/payments/methods/${userId}`, paymentMethod);
      return response.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  async verifyPaymentMethod(paymentMethodId, verificationCode) {
    try {
      const response = await apiService.put(`/payments/methods/${paymentMethodId}/verify`, {
        verificationCode
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment method:', error);
      throw error;
    }
  },

  async removePaymentMethod(paymentMethodId) {
    try {
      const response = await apiService.delete(`/payments/methods/${paymentMethodId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  },

  // Payment Processing
  async processPayment(paymentData) {
    try {
      const response = await apiService.post('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Payment History
  async getPaymentHistory(userId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      
      const response = await apiService.get(`/payments/history/${userId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  // Payment Statistics
  async getPaymentStats(userId) {
    try {
      const response = await apiService.get(`/payments/stats/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  },

  // Utility functions
  formatAmount(amount, currency = 'ETB') {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  },

  getPaymentMethodIcon(type) {
    const icons = {
      bank: 'Building2',
      mobile: 'Smartphone',
      card: 'CreditCard',
      cash: 'Banknote'
    };
    return icons[type] || 'DollarSign';
  },

  getPaymentStatusColor(status) {
    const colors = {
      completed: 'text-success bg-success/10 border-success/20',
      pending: 'text-warning bg-warning/10 border-warning/20',
      failed: 'text-error bg-error/10 border-error/20',
      cancelled: 'text-text-secondary bg-muted border-border',
      refunded: 'text-info bg-info/10 border-info/20'
    };
    return colors[status] || 'text-text-secondary bg-muted border-border';
  },

  getPaymentStatusIcon(status) {
    const icons = {
      completed: 'CheckCircle',
      pending: 'Clock',
      failed: 'XCircle',
      cancelled: 'X',
      refunded: 'RefreshCw'
    };
    return icons[status] || 'HelpCircle';
  },

  // Validation functions
  validateBankDetails(details) {
    const required = ['bankName', 'accountNumber', 'accountHolderName'];
    return required.every(field => details[field] && details[field].trim());
  },

  validateMobileBankingDetails(details) {
    const required = ['provider', 'phoneNumber'];
    return required.every(field => details[field] && details[field].trim());
  },

  validatePhoneNumber(phoneNumber) {
    // Ethiopian phone number validation
    const phoneRegex = /^(\+251|0)?[79][0-9]{8}$/;
    return phoneRegex.test(phoneNumber);
  },

  validateAccountNumber(accountNumber) {
    // Basic account number validation (10-20 digits)
    const accountRegex = /^[0-9]{10,20}$/;
    return accountRegex.test(accountNumber);
  },

  // Mock functions for testing
  async mockProcessPayment(paymentData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock success/failure based on amount
    const isSuccess = paymentData.amount < 10000; // Fail for amounts > 10,000
    
    if (isSuccess) {
      return {
        success: true,
        data: {
          paymentId: `PAY_${Date.now()}`,
          transactionId: `TXN_${Date.now()}`,
          amount: paymentData.amount,
          currency: paymentData.currency || 'ETB',
          status: 'completed',
          method: paymentData.paymentMethodId
        },
        message: 'Payment processed successfully'
      };
    } else {
      throw new Error('Payment processing failed. Please try again.');
    }
  },

  async mockSendVerificationCode(phoneNumber) {
    // Simulate sending verification code
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Verification code sent successfully',
      // For testing, return a mock code
      mockCode: '123456'
    };
  }
};

export default paymentService;
