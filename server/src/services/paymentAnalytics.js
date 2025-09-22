import { pool as db } from '../config/database.js';

class PaymentAnalytics {
  constructor() {
    this.metrics = {
      performance: ['processingTime', 'successRate', 'failureRate'],
      financial: ['totalVolume', 'averageAmount', 'processingFees'],
      user: ['paymentMethods', 'userRetention', 'userGrowth'],
      fraud: ['fraudRate', 'blockedTransactions', 'riskDistribution']
    };
  }

  // Record payment for analytics
  async recordPayment(paymentRecord, processingTime) {
    try {
      // Store payment metrics
      await this.storePaymentMetrics(paymentRecord, processingTime);
      
      // Update real-time analytics
      await this.updateRealTimeMetrics(paymentRecord);
      
      // Check for alerts
      await this.checkAlerts(paymentRecord);
      
    } catch (error) {
      console.error('Error recording payment analytics:', error);
    }
  }

  // Store payment metrics in database
  async storePaymentMetrics(paymentRecord, processingTime) {
    try {
      const query = `
        INSERT INTO payment_analytics (
          payment_id, user_id, amount, currency, payment_method_type,
          processing_time, success, created_at, bank_code, provider_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
      `;

      await db.execute(query, [
        paymentRecord.paymentId,
        paymentRecord.userId,
        paymentRecord.amount,
        paymentRecord.currency || 'ETB',
        paymentRecord.paymentMethod?.type,
        processingTime,
        paymentRecord.success ? 1 : 0,
        paymentRecord.bankCode,
        paymentRecord.providerCode
      ]);
    } catch (error) {
      console.error('Error storing payment metrics:', error);
    }
  }

  // Update real-time metrics
  async updateRealTimeMetrics(paymentRecord) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Update daily metrics
      await this.updateDailyMetrics(today, paymentRecord);
      
      // Update hourly metrics
      const hour = new Date().getHours();
      await this.updateHourlyMetrics(today, hour, paymentRecord);
      
    } catch (error) {
      console.error('Error updating real-time metrics:', error);
    }
  }

  // Update daily metrics
  async updateDailyMetrics(date, paymentRecord) {
    try {
      const query = `
        INSERT INTO daily_payment_metrics (
          date, total_transactions, total_amount, successful_transactions,
          failed_transactions, processing_fees, bank_transactions, mobile_transactions,
          cash_transactions, card_transactions
        ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          total_transactions = total_transactions + 1,
          total_amount = total_amount + ?,
          successful_transactions = successful_transactions + ?,
          failed_transactions = failed_transactions + ?,
          processing_fees = processing_fees + ?,
          bank_transactions = bank_transactions + ?,
          mobile_transactions = mobile_transactions + ?,
          cash_transactions = cash_transactions + ?,
          card_transactions = card_transactions + ?
      `;

      const isSuccess = paymentRecord.success ? 1 : 0;
      const isFailure = paymentRecord.success ? 0 : 1;
      const processingFee = paymentRecord.processingFee || 0;
      
      const methodCounts = {
        bank: paymentRecord.paymentMethod?.type === 'bank' ? 1 : 0,
        mobile: paymentRecord.paymentMethod?.type === 'mobile' ? 1 : 0,
        cash: paymentRecord.paymentMethod?.type === 'cash' ? 1 : 0,
        card: paymentRecord.paymentMethod?.type === 'card' ? 1 : 0
      };

      await db.execute(query, [
        date, paymentRecord.amount, isSuccess, isFailure, processingFee,
        methodCounts.bank, methodCounts.mobile, methodCounts.cash, methodCounts.card,
        paymentRecord.amount, isSuccess, isFailure, processingFee,
        methodCounts.bank, methodCounts.mobile, methodCounts.cash, methodCounts.card
      ]);
    } catch (error) {
      console.error('Error updating daily metrics:', error);
    }
  }

  // Update hourly metrics
  async updateHourlyMetrics(date, hour, paymentRecord) {
    try {
      const query = `
        INSERT INTO hourly_payment_metrics (
          date, hour, total_transactions, total_amount, successful_transactions,
          failed_transactions, processing_fees
        ) VALUES (?, ?, 1, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          total_transactions = total_transactions + 1,
          total_amount = total_amount + ?,
          successful_transactions = successful_transactions + ?,
          failed_transactions = failed_transactions + ?,
          processing_fees = processing_fees + ?
      `;

      const isSuccess = paymentRecord.success ? 1 : 0;
      const isFailure = paymentRecord.success ? 0 : 1;
      const processingFee = paymentRecord.processingFee || 0;

      await db.execute(query, [
        date, hour, paymentRecord.amount, isSuccess, isFailure, processingFee,
        paymentRecord.amount, isSuccess, isFailure, processingFee
      ]);
    } catch (error) {
      console.error('Error updating hourly metrics:', error);
    }
  }

  // Check for alerts
  async checkAlerts(paymentRecord) {
    try {
      // Check for high-value transactions
      if (paymentRecord.amount > 50000) {
        await this.createAlert('HIGH_VALUE_TRANSACTION', {
          paymentId: paymentRecord.paymentId,
          amount: paymentRecord.amount,
          userId: paymentRecord.userId
        });
      }

      // Check for high failure rate
      const failureRate = await this.getRecentFailureRate(paymentRecord.userId);
      if (failureRate > 0.5) {
        await this.createAlert('HIGH_FAILURE_RATE', {
          userId: paymentRecord.userId,
          failureRate: failureRate
        });
      }

      // Check for unusual transaction patterns
      const isUnusual = await this.detectUnusualPattern(paymentRecord);
      if (isUnusual) {
        await this.createAlert('UNUSUAL_PATTERN', {
          paymentId: paymentRecord.paymentId,
          userId: paymentRecord.userId,
          pattern: isUnusual
        });
      }

    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  // Get payment dashboard data
  async getDashboardData(startDate, endDate) {
    try {
      const [
        totalMetrics,
        dailyMetrics,
        paymentMethodMetrics,
        topUsers,
        recentTransactions,
        alerts
      ] = await Promise.all([
        this.getTotalMetrics(startDate, endDate),
        this.getDailyMetrics(startDate, endDate),
        this.getPaymentMethodMetrics(startDate, endDate),
        this.getTopUsers(startDate, endDate),
        this.getRecentTransactions(10),
        this.getActiveAlerts()
      ]);

      return {
        totalMetrics,
        dailyMetrics,
        paymentMethodMetrics,
        topUsers,
        recentTransactions,
        alerts,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return null;
    }
  }

  // Get total metrics
  async getTotalMetrics(startDate, endDate) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          COUNT(*) as total_transactions,
          SUM(amount) as total_amount,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_transactions,
          SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_transactions,
          AVG(processing_time) as avg_processing_time,
          SUM(processing_fees) as total_processing_fees
        FROM payment_analytics 
        WHERE created_at BETWEEN ? AND ?
      `, [startDate, endDate]);

      const metrics = rows[0];
      const successRate = metrics.total_transactions > 0 ? 
        (metrics.successful_transactions / metrics.total_transactions) * 100 : 0;

      return {
        ...metrics,
        success_rate: successRate,
        failure_rate: 100 - successRate
      };
    } catch (error) {
      console.error('Error getting total metrics:', error);
      return {};
    }
  }

  // Get daily metrics
  async getDailyMetrics(startDate, endDate) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          date,
          total_transactions,
          total_amount,
          successful_transactions,
          failed_transactions,
          processing_fees
        FROM daily_payment_metrics 
        WHERE date BETWEEN ? AND ?
        ORDER BY date ASC
      `, [startDate, endDate]);

      return rows.map(row => ({
        date: row.date,
        transactions: row.total_transactions,
        amount: row.total_amount,
        success_rate: row.total_transactions > 0 ? 
          (row.successful_transactions / row.total_transactions) * 100 : 0,
        processing_fees: row.processing_fees
      }));
    } catch (error) {
      console.error('Error getting daily metrics:', error);
      return [];
    }
  }

  // Get payment method metrics
  async getPaymentMethodMetrics(startDate, endDate) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          payment_method_type,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount,
          AVG(amount) as avg_amount,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_count,
          AVG(processing_time) as avg_processing_time
        FROM payment_analytics 
        WHERE created_at BETWEEN ? AND ?
        GROUP BY payment_method_type
        ORDER BY transaction_count DESC
      `, [startDate, endDate]);

      return rows.map(row => ({
        method: row.payment_method_type,
        transactions: row.transaction_count,
        amount: row.total_amount,
        avg_amount: row.avg_amount,
        success_rate: row.transaction_count > 0 ? 
          (row.successful_count / row.transaction_count) * 100 : 0,
        avg_processing_time: row.avg_processing_time
      }));
    } catch (error) {
      console.error('Error getting payment method metrics:', error);
      return [];
    }
  }

  // Get top users
  async getTopUsers(startDate, endDate, limit = 10) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          user_id,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_count
        FROM payment_analytics 
        WHERE created_at BETWEEN ? AND ?
        GROUP BY user_id
        ORDER BY total_amount DESC
        LIMIT ?
      `, [startDate, endDate, limit]);

      return rows.map(row => ({
        user_id: row.user_id,
        transactions: row.transaction_count,
        amount: row.total_amount,
        success_rate: row.transaction_count > 0 ? 
          (row.successful_count / row.transaction_count) * 100 : 0
      }));
    } catch (error) {
      console.error('Error getting top users:', error);
      return [];
    }
  }

  // Get recent transactions
  async getRecentTransactions(limit = 10) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          payment_id,
          user_id,
          amount,
          currency,
          payment_method_type,
          success,
          processing_time,
          created_at
        FROM payment_analytics 
        ORDER BY created_at DESC
        LIMIT ?
      `, [limit]);

      return rows;
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      return [];
    }
  }

  // Get active alerts
  async getActiveAlerts() {
    try {
      const [rows] = await db.execute(`
        SELECT * FROM payment_alerts 
        WHERE status = 'active' 
        ORDER BY created_at DESC
        LIMIT 20
      `);

      return rows;
    } catch (error) {
      console.error('Error getting active alerts:', error);
      return [];
    }
  }

  // Get recent failure rate for user
  async getRecentFailureRate(userId) {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const [rows] = await db.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed
        FROM payment_analytics 
        WHERE user_id = ? AND created_at > ?
      `, [userId, oneDayAgo]);

      const { total, failed } = rows[0];
      return total > 0 ? failed / total : 0;
    } catch (error) {
      console.error('Error getting failure rate:', error);
      return 0;
    }
  }

  // Detect unusual patterns
  async detectUnusualPattern(paymentRecord) {
    try {
      // Check for unusual time patterns
      const hour = new Date().getHours();
      if (hour < 6 || hour > 22) {
        return 'NIGHT_TRANSACTION';
      }

      // Check for unusual amount patterns
      if (paymentRecord.amount % 1000 === 0 && paymentRecord.amount > 10000) {
        return 'ROUND_AMOUNT';
      }

      // Check for rapid transactions
      const recentCount = await this.getRecentTransactionCount(paymentRecord.userId, 5); // 5 minutes
      if (recentCount > 3) {
        return 'RAPID_TRANSACTIONS';
      }

      return null;
    } catch (error) {
      console.error('Error detecting unusual patterns:', error);
      return null;
    }
  }

  // Get recent transaction count
  async getRecentTransactionCount(userId, minutes) {
    try {
      const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
      
      const [rows] = await db.execute(`
        SELECT COUNT(*) as count
        FROM payment_analytics 
        WHERE user_id = ? AND created_at > ?
      `, [userId, timeAgo]);

      return rows[0].count;
    } catch (error) {
      console.error('Error getting recent transaction count:', error);
      return 0;
    }
  }

  // Create alert
  async createAlert(type, data) {
    try {
      await db.execute(`
        INSERT INTO payment_alerts (type, data, status, created_at)
        VALUES (?, ?, 'active', NOW())
      `, [type, JSON.stringify(data)]);
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  // Get payment trends
  async getPaymentTrends(period = '7d') {
    try {
      let dateCondition;
      switch (period) {
        case '24h':
          dateCondition = 'created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)';
          break;
        case '7d':
          dateCondition = 'created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case '30d':
          dateCondition = 'created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        default:
          dateCondition = 'created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)';
      }

      const [rows] = await db.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as transactions,
          SUM(amount) as amount,
          AVG(processing_time) as avg_processing_time
        FROM payment_analytics 
        WHERE ${dateCondition}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);

      return rows;
    } catch (error) {
      console.error('Error getting payment trends:', error);
      return [];
    }
  }

  // Get bank performance metrics
  async getBankPerformance(startDate, endDate) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          bank_code,
          COUNT(*) as transactions,
          SUM(amount) as total_amount,
          AVG(processing_time) as avg_processing_time,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_count
        FROM payment_analytics 
        WHERE created_at BETWEEN ? AND ? AND bank_code IS NOT NULL
        GROUP BY bank_code
        ORDER BY transactions DESC
      `, [startDate, endDate]);

      return rows.map(row => ({
        bank: row.bank_code,
        transactions: row.transactions,
        amount: row.total_amount,
        avg_processing_time: row.avg_processing_time,
        success_rate: row.transactions > 0 ? 
          (row.successful_count / row.transactions) * 100 : 0
      }));
    } catch (error) {
      console.error('Error getting bank performance:', error);
      return [];
    }
  }
}

export default PaymentAnalytics;
