import crypto from 'crypto';
import { pool as db } from '../config/database.js';
import FraudDetection from './fraudDetection.js';
import PaymentAnalytics from './paymentAnalytics.js';

class PaymentProcessor {
  constructor() {
    this.bankConfigs = this.initializeBankConfigs();
    this.mobileProviderConfigs = this.initializeMobileProviderConfigs();
    this.fraudDetection = new FraudDetection();
    this.analytics = new PaymentAnalytics();
  }

  // Initialize bank configurations with realistic data
  initializeBankConfigs() {
    return {
      'cbe': {
        name: 'Commercial Bank of Ethiopia',
        code: 'CBE',
        swiftCode: 'CBEETHAA',
        routingNumber: '001',
        apiEndpoint: 'https://api.cbe.et/payments',
        supportedCurrencies: ['ETB', 'USD'],
        minAmount: 1,
        maxAmount: 1000000,
        processingFee: 0.015, // 1.5%
        settlementTime: 'T+1', // Next business day
        verificationRequired: true,
        supportedAccountTypes: ['savings', 'checking', 'business'],
        demoAccounts: [
          { accountNumber: '1000123456789', balance: 50000, accountType: 'savings' },
          { accountNumber: '1000987654321', balance: 25000, accountType: 'checking' },
          { accountNumber: '1000555666777', balance: 100000, accountType: 'business' }
        ]
      },
      'dashen': {
        name: 'Dashen Bank',
        code: 'DASH',
        swiftCode: 'DASHETAA',
        routingNumber: '002',
        apiEndpoint: 'https://api.dashenbank.com/payments',
        supportedCurrencies: ['ETB', 'USD'],
        minAmount: 1,
        maxAmount: 500000,
        processingFee: 0.02, // 2%
        settlementTime: 'T+0', // Same day
        verificationRequired: true,
        supportedAccountTypes: ['savings', 'checking'],
        demoAccounts: [
          { accountNumber: '2000123456789', balance: 30000, accountType: 'savings' },
          { accountNumber: '2000987654321', balance: 15000, accountType: 'checking' }
        ]
      },
      'awash': {
        name: 'Awash Bank',
        code: 'AWASH',
        swiftCode: 'AWASHETAA',
        routingNumber: '003',
        apiEndpoint: 'https://api.awashbank.com/payments',
        supportedCurrencies: ['ETB'],
        minAmount: 1,
        maxAmount: 750000,
        processingFee: 0.018, // 1.8%
        settlementTime: 'T+1',
        verificationRequired: true,
        supportedAccountTypes: ['savings', 'checking', 'business'],
        demoAccounts: [
          { accountNumber: '3000123456789', balance: 40000, accountType: 'savings' },
          { accountNumber: '3000987654321', balance: 20000, accountType: 'checking' }
        ]
      },
      'abyssinia': {
        name: 'Abyssinia Bank',
        code: 'ABY',
        swiftCode: 'ABYETHAA',
        routingNumber: '004',
        apiEndpoint: 'https://api.abyssinia.com/payments',
        supportedCurrencies: ['ETB', 'USD'],
        minAmount: 1,
        maxAmount: 300000,
        processingFee: 0.025, // 2.5%
        settlementTime: 'T+2',
        verificationRequired: true,
        supportedAccountTypes: ['savings', 'checking'],
        demoAccounts: [
          { accountNumber: '4000123456789', balance: 35000, accountType: 'savings' },
          { accountNumber: '4000987654321', balance: 18000, accountType: 'checking' }
        ]
      }
    };
  }

  // Initialize mobile provider configurations
  initializeMobileProviderConfigs() {
    return {
      'telebirr': {
        name: 'Telebirr',
        provider: 'Ethio Telecom',
        code: 'TEL',
        apiEndpoint: 'https://api.telebirr.et/payments',
        supportedCurrencies: ['ETB'],
        minAmount: 1,
        maxAmount: 10000,
        processingFee: 0.01, // 1%
        settlementTime: 'T+0',
        verificationRequired: true,
        demoAccounts: [
          { phoneNumber: '+251912345678', balance: 5000, accountType: 'personal' },
          { phoneNumber: '+251911234567', balance: 3000, accountType: 'personal' },
          { phoneNumber: '+251910123456', balance: 8000, accountType: 'business' }
        ]
      },
      'mpesa': {
        name: 'M-Pesa',
        provider: 'Safaricom',
        code: 'MPESA',
        apiEndpoint: 'https://api.mpesa.com/payments',
        supportedCurrencies: ['ETB'],
        minAmount: 1,
        maxAmount: 5000,
        processingFee: 0.02,
        settlementTime: 'T+0',
        verificationRequired: true,
        demoAccounts: [
          { phoneNumber: '+251922345678', balance: 2500, accountType: 'personal' },
          { phoneNumber: '+251921234567', balance: 1500, accountType: 'personal' }
        ]
      },
      'amole': {
        name: 'Amole',
        provider: 'Dashen Bank',
        code: 'AMOLE',
        apiEndpoint: 'https://api.amole.com/payments',
        supportedCurrencies: ['ETB'],
        minAmount: 1,
        maxAmount: 15000,
        processingFee: 0.015,
        settlementTime: 'T+0',
        verificationRequired: true,
        demoAccounts: [
          { phoneNumber: '+251932345678', balance: 6000, accountType: 'personal' },
          { phoneNumber: '+251931234567', balance: 4000, accountType: 'personal' }
        ]
      }
    };
  }

  // Main payment processing method
  async processPayment(paymentData) {
    try {
      const startTime = Date.now();
      
      // 1. Validate payment data
      const validationResult = await this.validatePaymentData(paymentData);
      if (!validationResult.isValid) {
        return this.createPaymentResponse(false, validationResult.errors, null, 'VALIDATION_FAILED');
      }

      // 2. Fraud detection
      const fraudCheck = await this.fraudDetection.analyzePayment(paymentData);
      if (fraudCheck.riskLevel === 'HIGH') {
        return this.createPaymentResponse(false, ['High fraud risk detected'], null, 'FRAUD_DETECTED');
      }

      // 3. Get payment method details
      const paymentMethod = await this.getPaymentMethod(paymentData.paymentMethodId);
      if (!paymentMethod) {
        return this.createPaymentResponse(false, ['Payment method not found'], null, 'PAYMENT_METHOD_NOT_FOUND');
      }

      // 4. Process based on payment type
      let processingResult;
      switch (paymentMethod.type) {
        case 'bank':
          processingResult = await this.processBankPayment(paymentData, paymentMethod);
          break;
        case 'mobile':
          processingResult = await this.processMobilePayment(paymentData, paymentMethod);
          break;
        case 'cash':
          processingResult = await this.processCashPayment(paymentData, paymentMethod);
          break;
        default:
          return this.createPaymentResponse(false, ['Unsupported payment type'], null, 'UNSUPPORTED_PAYMENT_TYPE');
      }

      // 5. Record payment transaction
      const paymentRecord = await this.recordPaymentTransaction(paymentData, processingResult, paymentMethod);

      // 6. Update analytics
      await this.analytics.recordPayment(paymentRecord, Date.now() - startTime);

      // 7. Send notifications
      await this.sendPaymentNotifications(paymentRecord);

      return this.createPaymentResponse(true, [], paymentRecord, 'SUCCESS');

    } catch (error) {
      console.error('Payment processing error:', error);
      return this.createPaymentResponse(false, ['Payment processing failed'], null, 'PROCESSING_ERROR');
    }
  }

  // Bank payment processing with realistic simulation
  async processBankPayment(paymentData, paymentMethod) {
    const bankConfig = this.bankConfigs[paymentMethod.details.bankName];
    if (!bankConfig) {
      throw new Error('Bank configuration not found');
    }

    // Simulate bank API call
    const bankResponse = await this.simulateBankAPI(paymentData, paymentMethod, bankConfig);
    
    if (!bankResponse.success) {
      return {
        success: false,
        error: bankResponse.error,
        transactionId: null,
        paymentId: null
      };
    }

    return {
      success: true,
      transactionId: bankResponse.transactionId,
      paymentId: bankResponse.paymentId,
      bankReference: bankResponse.bankReference,
      processingFee: bankResponse.processingFee,
      settlementTime: bankConfig.settlementTime,
      bankResponse: bankResponse
    };
  }

  // Mobile payment processing
  async processMobilePayment(paymentData, paymentMethod) {
    const providerConfig = this.mobileProviderConfigs[paymentMethod.details.provider];
    if (!providerConfig) {
      throw new Error('Mobile provider configuration not found');
    }

    // Simulate mobile payment API call
    const mobileResponse = await this.simulateMobileAPI(paymentData, paymentMethod, providerConfig);
    
    if (!mobileResponse.success) {
      return {
        success: false,
        error: mobileResponse.error,
        transactionId: null,
        paymentId: null
      };
    }

    return {
      success: true,
      transactionId: mobileResponse.transactionId,
      paymentId: mobileResponse.paymentId,
      providerReference: mobileResponse.providerReference,
      processingFee: mobileResponse.processingFee,
      settlementTime: providerConfig.settlementTime,
      mobileResponse: mobileResponse
    };
  }

  // Cash payment processing
  async processCashPayment(paymentData, paymentMethod) {
    // Cash payments are always successful but require delivery confirmation
    return {
      success: true,
      transactionId: `CASH_${Date.now()}`,
      paymentId: `PAY_CASH_${Date.now()}`,
      requiresDeliveryConfirmation: true,
      settlementTime: 'On Delivery',
      processingFee: 0
    };
  }

  // Simulate bank API with realistic responses
  async simulateBankAPI(paymentData, paymentMethod, bankConfig) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    const accountNumber = paymentMethod.details.accountNumber;
    const demoAccount = bankConfig.demoAccounts.find(acc => acc.accountNumber === accountNumber);
    
    if (!demoAccount) {
      return {
        success: false,
        error: 'Account not found in demo system',
        errorCode: 'ACCOUNT_NOT_FOUND'
      };
    }

    // Check account balance
    if (demoAccount.balance < paymentData.amount) {
      return {
        success: false,
        error: 'Insufficient funds',
        errorCode: 'INSUFFICIENT_FUNDS',
        availableBalance: demoAccount.balance
      };
    }

    // Check amount limits
    if (paymentData.amount < bankConfig.minAmount) {
      return {
        success: false,
        error: `Minimum amount is ${bankConfig.minAmount} ETB`,
        errorCode: 'AMOUNT_TOO_LOW'
      };
    }

    if (paymentData.amount > bankConfig.maxAmount) {
      return {
        success: false,
        error: `Maximum amount is ${bankConfig.maxAmount} ETB`,
        errorCode: 'AMOUNT_TOO_HIGH'
      };
    }

    // Simulate processing fee calculation
    const processingFee = paymentData.amount * bankConfig.processingFee;
    const totalAmount = paymentData.amount + processingFee;

    // Simulate 5% failure rate for realistic testing
    const isSuccess = Math.random() > 0.05;

    if (!isSuccess) {
      const errorReasons = [
        'Bank server temporarily unavailable',
        'Account verification failed',
        'Transaction declined by bank',
        'Network timeout',
        'Invalid account details'
      ];
      
      return {
        success: false,
        error: errorReasons[Math.floor(Math.random() * errorReasons.length)],
        errorCode: 'BANK_ERROR'
      };
    }

    // Generate realistic transaction details
    const transactionId = `${bankConfig.code}${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const paymentId = `PAY_${bankConfig.code}_${Date.now()}`;
    const bankReference = `REF_${bankConfig.code}_${Math.random().toString(36).substr(2, 10).toUpperCase()}`;

    return {
      success: true,
      transactionId,
      paymentId,
      bankReference,
      processingFee,
      totalAmount,
      accountBalance: demoAccount.balance - totalAmount,
      bankCode: bankConfig.code,
      swiftCode: bankConfig.swiftCode,
      routingNumber: bankConfig.routingNumber,
      settlementTime: bankConfig.settlementTime,
      timestamp: new Date().toISOString()
    };
  }

  // Simulate mobile payment API
  async simulateMobileAPI(paymentData, paymentMethod, providerConfig) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));

    const phoneNumber = paymentMethod.details.phoneNumber;
    const demoAccount = providerConfig.demoAccounts.find(acc => acc.phoneNumber === phoneNumber);
    
    if (!demoAccount) {
      return {
        success: false,
        error: 'Phone number not found in demo system',
        errorCode: 'PHONE_NOT_FOUND'
      };
    }

    // Check account balance
    if (demoAccount.balance < paymentData.amount) {
      return {
        success: false,
        error: 'Insufficient mobile wallet balance',
        errorCode: 'INSUFFICIENT_FUNDS',
        availableBalance: demoAccount.balance
      };
    }

    // Check amount limits
    if (paymentData.amount < providerConfig.minAmount) {
      return {
        success: false,
        error: `Minimum amount is ${providerConfig.minAmount} ETB`,
        errorCode: 'AMOUNT_TOO_LOW'
      };
    }

    if (paymentData.amount > providerConfig.maxAmount) {
      return {
        success: false,
        error: `Maximum amount is ${providerConfig.maxAmount} ETB`,
        errorCode: 'AMOUNT_TOO_HIGH'
      };
    }

    // Simulate processing fee calculation
    const processingFee = paymentData.amount * providerConfig.processingFee;
    const totalAmount = paymentData.amount + processingFee;

    // Simulate 3% failure rate for mobile payments
    const isSuccess = Math.random() > 0.03;

    if (!isSuccess) {
      const errorReasons = [
        'Mobile wallet temporarily unavailable',
        'Phone number verification failed',
        'Transaction declined by provider',
        'Network timeout',
        'Invalid phone number'
      ];
      
      return {
        success: false,
        error: errorReasons[Math.floor(Math.random() * errorReasons.length)],
        errorCode: 'MOBILE_ERROR'
      };
    }

    // Generate realistic transaction details
    const transactionId = `${providerConfig.code}${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const paymentId = `PAY_${providerConfig.code}_${Date.now()}`;
    const providerReference = `REF_${providerConfig.code}_${Math.random().toString(36).substr(2, 10).toUpperCase()}`;

    return {
      success: true,
      transactionId,
      paymentId,
      providerReference,
      processingFee,
      totalAmount,
      walletBalance: demoAccount.balance - totalAmount,
      providerCode: providerConfig.code,
      phoneNumber: phoneNumber,
      settlementTime: providerConfig.settlementTime,
      timestamp: new Date().toISOString()
    };
  }

  // Validate payment data
  async validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Invalid payment amount');
    }

    if (!paymentData.paymentMethodId) {
      errors.push('Payment method ID is required');
    }

    if (!paymentData.currency) {
      errors.push('Currency is required');
    }

    if (paymentData.amount > 1000000) {
      errors.push('Amount exceeds maximum limit');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get payment method from database
  async getPaymentMethod(paymentMethodId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM payment_methods WHERE id = ? AND is_active = 1',
        [paymentMethodId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching payment method:', error);
      return null;
    }
  }

  // Record payment transaction in database
  async recordPaymentTransaction(paymentData, processingResult, paymentMethod) {
    try {
      const query = `
        INSERT INTO payments (
          user_id, payment_method_id, amount, currency, status, 
          transaction_id, payment_id, description, processed_at, 
          processing_fee, settlement_time, bank_reference, provider_reference
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
      `;

      const [result] = await db.execute(query, [
        paymentData.userId,
        paymentData.paymentMethodId,
        paymentData.amount,
        paymentData.currency || 'ETB',
        processingResult.success ? 'completed' : 'failed',
        processingResult.transactionId,
        processingResult.paymentId,
        paymentData.description || 'Payment transaction',
        processingResult.processingFee || 0,
        processingResult.settlementTime,
        processingResult.bankReference,
        processingResult.providerReference
      ]);

      return {
        id: result.insertId,
        ...paymentData,
        ...processingResult,
        paymentMethod
      };
    } catch (error) {
      console.error('Error recording payment transaction:', error);
      throw error;
    }
  }

  // Send payment notifications
  async sendPaymentNotifications(paymentRecord) {
    // This would integrate with your notification system
    console.log('Payment notification sent:', paymentRecord.paymentId);
  }

  // Create standardized payment response
  createPaymentResponse(success, errors, data, status) {
    return {
      success,
      errors: errors || [],
      data,
      status,
      timestamp: new Date().toISOString()
    };
  }

  // Get payment status
  async getPaymentStatus(paymentId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM payments WHERE payment_id = ?',
        [paymentId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      return null;
    }
  }

  // Refund payment
  async refundPayment(paymentId, refundAmount, reason) {
    try {
      const payment = await this.getPaymentStatus(paymentId);
      if (!payment) {
        return this.createPaymentResponse(false, ['Payment not found'], null, 'PAYMENT_NOT_FOUND');
      }

      if (payment.status !== 'completed') {
        return this.createPaymentResponse(false, ['Payment not eligible for refund'], null, 'INVALID_REFUND_STATUS');
      }

      if (refundAmount > payment.amount) {
        return this.createPaymentResponse(false, ['Refund amount exceeds payment amount'], null, 'INVALID_REFUND_AMOUNT');
      }

      // Process refund based on payment method
      const refundResult = await this.processRefund(payment, refundAmount, reason);
      
      if (refundResult.success) {
        // Update payment status
        await db.execute(
          'UPDATE payments SET status = ? WHERE id = ?',
          ['refunded', payment.id]
        );

        // Record refund
        await db.execute(
          'INSERT INTO payment_refunds (payment_id, amount, reason, status, processed_at) VALUES (?, ?, ?, ?, NOW())',
          [payment.id, refundAmount, reason, 'completed']
        );
      }

      return this.createPaymentResponse(refundResult.success, refundResult.errors, refundResult.data, refundResult.status);

    } catch (error) {
      console.error('Error processing refund:', error);
      return this.createPaymentResponse(false, ['Refund processing failed'], null, 'REFUND_ERROR');
    }
  }

  // Process refund
  async processRefund(payment, refundAmount, reason) {
    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      refundId: `REF_${Date.now()}`,
      amount: refundAmount,
      reason,
      processedAt: new Date().toISOString()
    };
  }
}

export default PaymentProcessor;
