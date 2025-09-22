import { pool as db } from '../config/database.js';

class FraudDetection {
  constructor() {
    this.riskThresholds = {
      LOW: 0.3,
      MEDIUM: 0.6,
      HIGH: 0.8
    };
    
    this.fraudPatterns = this.initializeFraudPatterns();
  }

  initializeFraudPatterns() {
    return {
      // Suspicious amount patterns
      amountPatterns: {
        roundNumbers: { threshold: 0.8, risk: 0.3 },
        veryHighAmount: { threshold: 50000, risk: 0.4 },
        veryLowAmount: { threshold: 1, risk: 0.2 },
        unusualAmounts: [999, 9999, 99999, 100001, 500001]
      },
      
      // Time-based patterns
      timePatterns: {
        nightTime: { start: 22, end: 6, risk: 0.3 },
        weekend: { risk: 0.2 },
        holiday: { risk: 0.4 }
      },
      
      // Frequency patterns
      frequencyPatterns: {
        rapidTransactions: { maxPerMinute: 5, risk: 0.6 },
        maxPerHour: 20,
        maxPerDay: 100
      },
      
      // Geographic patterns
      geoPatterns: {
        unusualLocation: { risk: 0.5 },
        vpnDetection: { risk: 0.7 }
      },
      
      // Device patterns
      devicePatterns: {
        newDevice: { risk: 0.3 },
        suspiciousUserAgent: { risk: 0.4 },
        multipleDevices: { maxDevices: 5, risk: 0.4 }
      }
    };
  }

  async analyzePayment(paymentData) {
    try {
      const riskFactors = [];
      let totalRiskScore = 0;

      // 1. Amount analysis
      const amountRisk = await this.analyzeAmount(paymentData.amount);
      if (amountRisk.risk > 0) {
        riskFactors.push(amountRisk);
        totalRiskScore += amountRisk.risk * 0.3;
      }

      // 2. Frequency analysis
      const frequencyRisk = await this.analyzeFrequency(paymentData.userId);
      if (frequencyRisk.risk > 0) {
        riskFactors.push(frequencyRisk);
        totalRiskScore += frequencyRisk.risk * 0.25;
      }

      // 3. Time analysis
      const timeRisk = this.analyzeTime(paymentData.timestamp);
      if (timeRisk.risk > 0) {
        riskFactors.push(timeRisk);
        totalRiskScore += timeRisk.risk * 0.2;
      }

      // 4. Payment method analysis
      const methodRisk = await this.analyzePaymentMethod(paymentData.paymentMethodId);
      if (methodRisk.risk > 0) {
        riskFactors.push(methodRisk);
        totalRiskScore += methodRisk.risk * 0.15;
      }

      // 5. User behavior analysis
      const behaviorRisk = await this.analyzeUserBehavior(paymentData.userId);
      if (behaviorRisk.risk > 0) {
        riskFactors.push(behaviorRisk);
        totalRiskScore += behaviorRisk.risk * 0.1;
      }

      // Determine risk level
      let riskLevel = 'LOW';
      if (totalRiskScore >= this.riskThresholds.HIGH) {
        riskLevel = 'HIGH';
      } else if (totalRiskScore >= this.riskThresholds.MEDIUM) {
        riskLevel = 'MEDIUM';
      }

      return {
        riskLevel,
        riskScore: totalRiskScore,
        riskFactors,
        recommendation: this.getRecommendation(riskLevel, totalRiskScore),
        requiresReview: riskLevel === 'HIGH' || totalRiskScore > 0.7
      };

    } catch (error) {
      console.error('Fraud detection error:', error);
      return {
        riskLevel: 'LOW',
        riskScore: 0,
        riskFactors: [],
        recommendation: 'PROCEED',
        requiresReview: false
      };
    }
  }

  async analyzeAmount(amount) {
    const patterns = this.fraudPatterns.amountPatterns;
    let risk = 0;
    const reasons = [];

    // Check for round numbers
    if (amount % 1000 === 0) {
      risk += patterns.roundNumbers.risk;
      reasons.push('Round number amount');
    }

    // Check for very high amounts
    if (amount > patterns.veryHighAmount.threshold) {
      risk += patterns.veryHighAmount.risk;
      reasons.push('Very high amount');
    }

    // Check for very low amounts
    if (amount < patterns.veryLowAmount.threshold) {
      risk += patterns.veryLowAmount.risk;
      reasons.push('Very low amount');
    }

    // Check for unusual amounts
    if (patterns.unusualAmounts.includes(amount)) {
      risk += 0.5;
      reasons.push('Unusual amount pattern');
    }

    return {
      type: 'AMOUNT',
      risk: Math.min(risk, 1),
      reasons,
      details: { amount }
    };
  }

  async analyzeFrequency(userId) {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const oneDayAgo = new Date(now.getTime() - 86400000);

      // Count recent transactions
      const [minuteCount] = await db.execute(
        'SELECT COUNT(*) as count FROM payments WHERE user_id = ? AND created_at > ? AND status = "completed"',
        [userId, oneMinuteAgo]
      );

      const [hourCount] = await db.execute(
        'SELECT COUNT(*) as count FROM payments WHERE user_id = ? AND created_at > ? AND status = "completed"',
        [userId, oneHourAgo]
      );

      const [dayCount] = await db.execute(
        'SELECT COUNT(*) as count FROM payments WHERE user_id = ? AND created_at > ? AND status = "completed"',
        [userId, oneDayAgo]
      );

      let risk = 0;
      const reasons = [];

      // Check rapid transactions
      if (minuteCount[0].count > this.fraudPatterns.frequencyPatterns.rapidTransactions.maxPerMinute) {
        risk += this.fraudPatterns.frequencyPatterns.rapidTransactions.risk;
        reasons.push('Rapid transaction frequency');
      }

      // Check hourly limit
      if (hourCount[0].count > this.fraudPatterns.frequencyPatterns.maxPerHour) {
        risk += 0.4;
        reasons.push('Exceeded hourly transaction limit');
      }

      // Check daily limit
      if (dayCount[0].count > this.fraudPatterns.frequencyPatterns.maxPerDay) {
        risk += 0.6;
        reasons.push('Exceeded daily transaction limit');
      }

      return {
        type: 'FREQUENCY',
        risk: Math.min(risk, 1),
        reasons,
        details: {
          minuteCount: minuteCount[0].count,
          hourCount: hourCount[0].count,
          dayCount: dayCount[0].count
        }
      };

    } catch (error) {
      console.error('Frequency analysis error:', error);
      return { type: 'FREQUENCY', risk: 0, reasons: [], details: {} };
    }
  }

  analyzeTime(timestamp) {
    const now = new Date(timestamp);
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let risk = 0;
    const reasons = [];

    // Check for night time transactions
    if (hour >= this.fraudPatterns.timePatterns.nightTime.start || 
        hour <= this.fraudPatterns.timePatterns.nightTime.end) {
      risk += this.fraudPatterns.timePatterns.nightTime.risk;
      reasons.push('Night time transaction');
    }

    // Check for weekend transactions
    if (isWeekend) {
      risk += this.fraudPatterns.timePatterns.weekend.risk;
      reasons.push('Weekend transaction');
    }

    // Check for holiday transactions (simplified)
    const month = now.getMonth();
    const day = now.getDate();
    const isHoliday = (month === 0 && day === 1) || // New Year
                     (month === 11 && day === 25) || // Christmas
                     (month === 10 && day === 30);   // Ethiopian New Year

    if (isHoliday) {
      risk += this.fraudPatterns.timePatterns.holiday.risk;
      reasons.push('Holiday transaction');
    }

    return {
      type: 'TIME',
      risk: Math.min(risk, 1),
      reasons,
      details: { hour, dayOfWeek, isWeekend, isHoliday }
    };
  }

  async analyzePaymentMethod(paymentMethodId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM payment_methods WHERE id = ?',
        [paymentMethodId]
      );

      if (rows.length === 0) {
        return { type: 'PAYMENT_METHOD', risk: 0.8, reasons: ['Invalid payment method'], details: {} };
      }

      const paymentMethod = rows[0];
      let risk = 0;
      const reasons = [];

      // Check if payment method is verified
      if (!paymentMethod.is_verified) {
        risk += 0.5;
        reasons.push('Unverified payment method');
      }

      // Check payment method age
      const createdAt = new Date(paymentMethod.created_at);
      const ageInHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (ageInHours < 1) {
        risk += 0.3;
        reasons.push('Recently added payment method');
      }

      // Check for suspicious payment method types
      if (paymentMethod.type === 'cash' && paymentMethod.details.amount > 10000) {
        risk += 0.4;
        reasons.push('High amount cash payment');
      }

      return {
        type: 'PAYMENT_METHOD',
        risk: Math.min(risk, 1),
        reasons,
        details: {
          type: paymentMethod.type,
          isVerified: paymentMethod.is_verified,
          ageInHours,
          isDefault: paymentMethod.is_default
        }
      };

    } catch (error) {
      console.error('Payment method analysis error:', error);
      return { type: 'PAYMENT_METHOD', risk: 0, reasons: [], details: {} };
    }
  }

  async analyzeUserBehavior(userId) {
    try {
      // Get user's payment history
      const [payments] = await db.execute(
        'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
        [userId]
      );

      if (payments.length === 0) {
        return { type: 'USER_BEHAVIOR', risk: 0.2, reasons: ['New user'], details: {} };
      }

      let risk = 0;
      const reasons = [];

      // Check for failed payments
      const failedPayments = payments.filter(p => p.status === 'failed').length;
      const failureRate = failedPayments / payments.length;

      if (failureRate > 0.3) {
        risk += 0.4;
        reasons.push('High payment failure rate');
      }

      // Check for refunds
      const [refunds] = await db.execute(
        'SELECT COUNT(*) as count FROM payment_refunds pr JOIN payments p ON pr.payment_id = p.id WHERE p.user_id = ?',
        [userId]
      );

      if (refunds[0].count > 3) {
        risk += 0.3;
        reasons.push('Multiple refunds');
      }

      // Check for unusual payment patterns
      const amounts = payments.map(p => p.amount);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const amountVariance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length;

      if (amountVariance > avgAmount * 2) {
        risk += 0.2;
        reasons.push('Inconsistent payment amounts');
      }

      return {
        type: 'USER_BEHAVIOR',
        risk: Math.min(risk, 1),
        reasons,
        details: {
          totalPayments: payments.length,
          failureRate,
          refundCount: refunds[0].count,
          avgAmount,
          amountVariance
        }
      };

    } catch (error) {
      console.error('User behavior analysis error:', error);
      return { type: 'USER_BEHAVIOR', risk: 0, reasons: [], details: {} };
    }
  }

  getRecommendation(riskLevel, riskScore) {
    if (riskLevel === 'HIGH' || riskScore > 0.8) {
      return 'BLOCK';
    } else if (riskLevel === 'MEDIUM' || riskScore > 0.5) {
      return 'REVIEW';
    } else {
      return 'PROCEED';
    }
  }

  // Get fraud detection report
  async getFraudReport(userId, startDate, endDate) {
    try {
      const [payments] = await db.execute(
        'SELECT * FROM payments WHERE user_id = ? AND created_at BETWEEN ? AND ? ORDER BY created_at DESC',
        [userId, startDate, endDate]
      );

      const report = {
        totalTransactions: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
        riskDistribution: { LOW: 0, MEDIUM: 0, HIGH: 0 },
        suspiciousTransactions: [],
        recommendations: []
      };

      // Analyze each payment
      for (const payment of payments) {
        const analysis = await this.analyzePayment({
          userId: payment.user_id,
          amount: payment.amount,
          paymentMethodId: payment.payment_method_id,
          timestamp: payment.created_at
        });

        report.riskDistribution[analysis.riskLevel]++;
        
        if (analysis.requiresReview) {
          report.suspiciousTransactions.push({
            paymentId: payment.payment_id,
            amount: payment.amount,
            riskLevel: analysis.riskLevel,
            riskScore: analysis.riskScore,
            riskFactors: analysis.riskFactors
          });
        }
      }

      // Generate recommendations
      if (report.riskDistribution.HIGH > 0) {
        report.recommendations.push('Consider implementing additional verification for high-risk transactions');
      }

      if (report.suspiciousTransactions.length > 0) {
        report.recommendations.push('Review suspicious transactions for potential fraud');
      }

      return report;

    } catch (error) {
      console.error('Fraud report generation error:', error);
      return null;
    }
  }
}

export default FraudDetection;
