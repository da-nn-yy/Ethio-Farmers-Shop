import { pool as db } from '../config/database.js';
import PaymentProcessor from '../services/paymentProcessor.js';
import FraudDetection from '../services/fraudDetection.js';
import PaymentAnalytics from '../services/paymentAnalytics.js';

// Initialize services
const paymentProcessor = new PaymentProcessor();
const fraudDetection = new FraudDetection();
const paymentAnalytics = new PaymentAnalytics();

// Get all payment methods for a user
const getUserPaymentMethods = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT 
        pm.id,
        pm.type,
        pm.details,
        pm.is_verified,
        pm.is_default,
        pm.created_at,
        pm.updated_at,
        (SELECT COUNT(*) FROM payments p WHERE p.payment_method_id = pm.id AND p.status = 'completed') as usage_count,
        (SELECT SUM(p.amount) FROM payments p WHERE p.payment_method_id = pm.id AND p.status = 'completed') as total_amount
      FROM payment_methods pm
      WHERE pm.user_id = ? AND pm.is_active = 1
      ORDER BY pm.is_default DESC, pm.created_at DESC
    `;
    
    const [paymentMethods] = await db.execute(query, [userId]);
    
    // Add bank/provider information
    const enhancedMethods = paymentMethods.map(method => {
      const details = JSON.parse(method.details);
      let bankInfo = null;
      
      if (method.type === 'bank' && details.bankName) {
        const bankConfig = paymentProcessor.bankConfigs[details.bankName];
        if (bankConfig) {
          bankInfo = {
            name: bankConfig.name,
            code: bankConfig.code,
            swiftCode: bankConfig.swiftCode,
            processingFee: bankConfig.processingFee,
            settlementTime: bankConfig.settlementTime
          };
        }
      } else if (method.type === 'mobile' && details.provider) {
        const providerConfig = paymentProcessor.mobileProviderConfigs[details.provider];
        if (providerConfig) {
          bankInfo = {
            name: providerConfig.name,
            provider: providerConfig.provider,
            code: providerConfig.code,
            processingFee: providerConfig.processingFee,
            settlementTime: providerConfig.settlementTime
          };
        }
      }
      
      return {
        ...method,
        details: details,
        bankInfo,
        usage_count: method.usage_count || 0,
        total_amount: method.total_amount || 0
      };
    });
    
    res.json({
      success: true,
      data: enhancedMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
};

// Add a new payment method
const addPaymentMethod = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, details, isDefault = false } = req.body;
    
    // Validate required fields
    if (!type || !details) {
      return res.status(400).json({
        success: false,
        message: 'Payment type and details are required'
      });
    }
    
    // If setting as default, unset other default methods
    if (isDefault) {
      await db.execute(
        'UPDATE payment_methods SET is_default = 0 WHERE user_id = ?',
        [userId]
      );
    }
    
    const query = `
      INSERT INTO payment_methods (user_id, type, details, is_default, is_verified, is_active, created_at)
      VALUES (?, ?, ?, ?, 0, 1, NOW())
    `;
    
    const [result] = await db.execute(query, [
      userId,
      type,
      JSON.stringify(details),
      isDefault
    ]);
    
    res.json({
      success: true,
      data: {
        id: result.insertId,
        type,
        details,
        isDefault,
        isVerified: false
      },
      message: 'Payment method added successfully'
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method'
    });
  }
};

// Verify a payment method
const verifyPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const { verificationCode } = req.body;
    
    // Mock verification logic - in real app, integrate with bank/mobile APIs
    const isValidCode = verificationCode === '123456' || verificationCode.startsWith('123');
    
    if (!isValidCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
    
    const query = `
      UPDATE payment_methods 
      SET is_verified = 1, updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `;
    
    const [result] = await db.execute(query, [paymentMethodId, req.user.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Payment method verified successfully'
    });
  } catch (error) {
    console.error('Error verifying payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment method'
    });
  }
};

// Remove a payment method
const removePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    
    const query = `
      UPDATE payment_methods 
      SET is_active = 0, updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `;
    
    const [result] = await db.execute(query, [paymentMethodId, req.user.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Payment method removed successfully'
    });
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove payment method'
    });
  }
};

// Process a payment with advanced features
const processPayment = async (req, res) => {
  try {
    const { 
      orderId, 
      paymentMethodId, 
      amount, 
      currency = 'ETB',
      description,
      metadata = {}
    } = req.body;
    
    const userId = req.user.id;
    
    // Validate required fields
    if (!paymentMethodId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Payment method ID and amount are required'
      });
    }
    
    // Get payment method details
    const [paymentMethods] = await db.execute(
      'SELECT * FROM payment_methods WHERE id = ? AND user_id = ? AND is_verified = 1 AND is_active = 1',
      [paymentMethodId, userId]
    );
    
    if (paymentMethods.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found or not verified'
      });
    }
    
    const paymentMethod = paymentMethods[0];
    
    // Prepare payment data for processing
    const paymentData = {
      userId,
      orderId,
      paymentMethodId,
      amount: parseFloat(amount),
      currency,
      description: description || 'Payment transaction',
      metadata,
      timestamp: new Date().toISOString()
    };
    
    // Process payment using the advanced payment processor
    const result = await paymentProcessor.processPayment(paymentData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.errors.join(', '),
        errorCode: result.status,
        data: result.data
      });
    }
    
    // Update order status if orderId is provided
    if (orderId && result.data.success) {
      await db.execute(
        'UPDATE orders SET status = ?, payment_id = ? WHERE id = ?',
        ['confirmed', result.data.paymentId, orderId]
      );
    }
    
    res.json({
      success: true,
      data: {
        paymentId: result.data.paymentId,
        transactionId: result.data.transactionId,
        amount: result.data.amount,
        currency: result.data.currency,
        status: result.data.success ? 'completed' : 'failed',
        method: paymentMethod.type,
        processingFee: result.data.processingFee,
        settlementTime: result.data.settlementTime,
        bankReference: result.data.bankReference,
        providerReference: result.data.providerReference
      },
      message: 'Payment processed successfully'
    });
    
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    });
  }
};

// Get payment history
const getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status, type } = req.query;
    
    let query = `
      SELECT 
        p.id,
        p.amount,
        p.currency,
        p.status,
        p.transaction_id,
        p.payment_id,
        p.description,
        p.created_at,
        pm.type as payment_method_type,
        pm.details as payment_method_details,
        o.id as order_id
      FROM payments p
      LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
      LEFT JOIN orders o ON p.order_id = o.id
      WHERE p.user_id = ?
    `;
    
    const params = [userId];
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    if (type) {
      query += ' AND pm.type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const [payments] = await db.execute(query, params);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM payments p
      LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
      WHERE p.user_id = ?
    `;
    
    const countParams = [userId];
    
    if (status) {
      countQuery += ' AND p.status = ?';
      countParams.push(status);
    }
    
    if (type) {
      countQuery += ' AND pm.type = ?';
      countParams.push(type);
    }
    
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
};

// Removed duplicate simulatePaymentProcessing utility to avoid name collision

// Get payment statistics
const getPaymentStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_payments,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_payments
      FROM payments
      WHERE user_id = ?
    `;
    
    const [stats] = await db.execute(query, [userId]);
    
    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics'
    });
  }
};

// Get payment dashboard data
const getPaymentDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();
    
    const dashboardData = await paymentAnalytics.getDashboardData(start, end);
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching payment dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment dashboard'
    });
  }
};

// Get payment trends
const getPaymentTrends = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    const trends = await paymentAnalytics.getPaymentTrends(period);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching payment trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment trends'
    });
  }
};

// Get bank performance metrics
const getBankPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();
    
    const performance = await paymentAnalytics.getBankPerformance(start, end);
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Error fetching bank performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bank performance'
    });
  }
};

// Get fraud detection report
const getFraudReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = endDate || new Date().toISOString();
    
    const report = await fraudDetection.getFraudReport(userId, start, end);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching fraud report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fraud report'
    });
  }
};

// Process refund
const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { refundAmount, reason } = req.body;
    const userId = req.user.id;
    
    // Verify payment belongs to user
    const [payments] = await db.execute(
      'SELECT * FROM payments WHERE payment_id = ? AND user_id = ?',
      [paymentId, userId]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    const payment = payments[0];
    
    // Process refund using payment processor
    const result = await paymentProcessor.refundPayment(paymentId, refundAmount, reason);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.errors.join(', '),
        errorCode: result.status
      });
    }
    
    res.json({
      success: true,
      data: result.data,
      message: 'Refund processed successfully'
    });
    
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const status = await paymentProcessor.getPaymentStatus(paymentId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status'
    });
  }
};

// Get available banks and mobile providers
const getPaymentProviders = async (req, res) => {
  try {
    const banks = Object.values(paymentProcessor.bankConfigs).map(config => ({
      code: config.code,
      name: config.name,
      swiftCode: config.swiftCode,
      processingFee: config.processingFee,
      settlementTime: config.settlementTime,
      minAmount: config.minAmount,
      maxAmount: config.maxAmount,
      supportedCurrencies: config.supportedCurrencies,
      demoAccounts: config.demoAccounts
    }));
    
    const mobileProviders = Object.values(paymentProcessor.mobileProviderConfigs).map(config => ({
      code: config.code,
      name: config.name,
      provider: config.provider,
      processingFee: config.processingFee,
      settlementTime: config.settlementTime,
      minAmount: config.minAmount,
      maxAmount: config.maxAmount,
      supportedCurrencies: config.supportedCurrencies,
      demoAccounts: config.demoAccounts
    }));
    
    res.json({
      success: true,
      data: {
        banks,
        mobileProviders
      }
    });
  } catch (error) {
    console.error('Error fetching payment providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment providers'
    });
  }
};

// Simulate payment processing (for testing)
const simulatePaymentProcessing = async (req, res) => {
  try {
    const { 
      paymentMethodId, 
      amount, 
      currency = 'ETB',
      simulateFailure = false 
    } = req.body;
    
    const userId = req.user.id;
    
    // Get payment method
    const [paymentMethods] = await db.execute(
      'SELECT * FROM payment_methods WHERE id = ? AND user_id = ?',
      [paymentMethodId, userId]
    );
    
    if (paymentMethods.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    const paymentMethod = paymentMethods[0];
    const paymentData = {
      userId,
      paymentMethodId,
      amount: parseFloat(amount),
      currency,
      description: 'Simulation payment',
      metadata: { simulation: true, simulateFailure }
    };
    
    // Process payment
    const result = await paymentProcessor.processPayment(paymentData);
    
    res.json({
      success: true,
      data: result,
      message: 'Payment simulation completed'
    });
    
  } catch (error) {
    console.error('Error simulating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate payment'
    });
  }
};

export default {
  getUserPaymentMethods,
  addPaymentMethod,
  verifyPaymentMethod,
  removePaymentMethod,
  processPayment,
  getPaymentHistory,
  getPaymentStats,
  getPaymentDashboard,
  getPaymentTrends,
  getBankPerformance,
  getFraudReport,
  processRefund,
  getPaymentStatus,
  getPaymentProviders,
  simulatePaymentProcessing
};
