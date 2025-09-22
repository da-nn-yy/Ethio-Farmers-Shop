const PaymentProcessor = require('../services/paymentProcessor');
const FraudDetection = require('../services/fraudDetection');
const PaymentAnalytics = require('../services/paymentAnalytics');
const db = require('../config/database');

class PaymentDemo {
  constructor() {
    this.paymentProcessor = new PaymentProcessor();
    this.fraudDetection = new FraudDetection();
    this.paymentAnalytics = new PaymentAnalytics();
  }

  // Run comprehensive payment demo
  async runDemo() {
    console.log('🚀 Starting Payment System Demo...\n');

    try {
      // 1. Demo bank configurations
      await this.demoBankConfigurations();
      
      // 2. Demo mobile provider configurations
      await this.demoMobileProviderConfigurations();
      
      // 3. Demo payment processing
      await this.demoPaymentProcessing();
      
      // 4. Demo fraud detection
      await this.demoFraudDetection();
      
      // 5. Demo payment analytics
      await this.demoPaymentAnalytics();
      
      // 6. Demo error scenarios
      await this.demoErrorScenarios();
      
      // 7. Demo refund processing
      await this.demoRefundProcessing();
      
      console.log('\n✅ Payment System Demo Completed Successfully!');
      
    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }

  // Demo bank configurations
  async demoBankConfigurations() {
    console.log('🏦 Bank Configurations Demo:');
    console.log('============================');
    
    const banks = this.paymentProcessor.bankConfigs;
    
    Object.entries(banks).forEach(([code, config]) => {
      console.log(`\n${config.name} (${code}):`);
      console.log(`  - SWIFT Code: ${config.swiftCode}`);
      console.log(`  - Processing Fee: ${(config.processingFee * 100).toFixed(2)}%`);
      console.log(`  - Settlement Time: ${config.settlementTime}`);
      console.log(`  - Min Amount: ${config.minAmount} ETB`);
      console.log(`  - Max Amount: ${config.maxAmount.toLocaleString()} ETB`);
      console.log(`  - Supported Currencies: ${config.supportedCurrencies.join(', ')}`);
      console.log(`  - Demo Accounts: ${config.demoAccounts.length}`);
      
      config.demoAccounts.forEach((account, index) => {
        console.log(`    ${index + 1}. ${account.accountNumber} (${account.accountType}) - ${account.balance.toLocaleString()} ETB`);
      });
    });
  }

  // Demo mobile provider configurations
  async demoMobileProviderConfigurations() {
    console.log('\n📱 Mobile Provider Configurations Demo:');
    console.log('=======================================');
    
    const providers = this.paymentProcessor.mobileProviderConfigs;
    
    Object.entries(providers).forEach(([code, config]) => {
      console.log(`\n${config.name} (${code}):`);
      console.log(`  - Provider: ${config.provider}`);
      console.log(`  - Processing Fee: ${(config.processingFee * 100).toFixed(2)}%`);
      console.log(`  - Settlement Time: ${config.settlementTime}`);
      console.log(`  - Min Amount: ${config.minAmount} ETB`);
      console.log(`  - Max Amount: ${config.maxAmount.toLocaleString()} ETB`);
      console.log(`  - Demo Accounts: ${config.demoAccounts.length}`);
      
      config.demoAccounts.forEach((account, index) => {
        console.log(`    ${index + 1}. ${account.phoneNumber} (${account.accountType}) - ${account.balance.toLocaleString()} ETB`);
      });
    });
  }

  // Demo payment processing
  async demoPaymentProcessing() {
    console.log('\n💳 Payment Processing Demo:');
    console.log('============================');
    
    const testPayments = [
      {
        userId: 1,
        paymentMethodId: 1,
        amount: 2500,
        currency: 'ETB',
        description: 'Demo bank payment',
        metadata: { demo: true }
      },
      {
        userId: 1,
        paymentMethodId: 2,
        amount: 1200,
        currency: 'ETB',
        description: 'Demo mobile payment',
        metadata: { demo: true }
      },
      {
        userId: 2,
        paymentMethodId: 3,
        amount: 50000,
        currency: 'ETB',
        description: 'Demo high-value payment',
        metadata: { demo: true }
      }
    ];

    for (const paymentData of testPayments) {
      console.log(`\nProcessing payment: ${paymentData.description}`);
      console.log(`Amount: ${paymentData.amount.toLocaleString()} ${paymentData.currency}`);
      
      const result = await this.paymentProcessor.processPayment(paymentData);
      
      if (result.success) {
        console.log(`✅ Payment successful!`);
        console.log(`   Payment ID: ${result.data.paymentId}`);
        console.log(`   Transaction ID: ${result.data.transactionId}`);
        console.log(`   Processing Fee: ${result.data.processingFee} ETB`);
        console.log(`   Settlement Time: ${result.data.settlementTime}`);
      } else {
        console.log(`❌ Payment failed: ${result.errors.join(', ')}`);
      }
    }
  }

  // Demo fraud detection
  async demoFraudDetection() {
    console.log('\n🛡️ Fraud Detection Demo:');
    console.log('=========================');
    
    const testScenarios = [
      {
        userId: 1,
        amount: 1000,
        paymentMethodId: 1,
        timestamp: new Date().toISOString(),
        description: 'Normal payment'
      },
      {
        userId: 1,
        amount: 99999,
        paymentMethodId: 1,
        timestamp: new Date().toISOString(),
        description: 'High-value payment'
      },
      {
        userId: 1,
        amount: 50000,
        paymentMethodId: 1,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        description: 'Night time payment'
      },
      {
        userId: 1,
        amount: 1000,
        paymentMethodId: 1,
        timestamp: new Date().toISOString(),
        description: 'Rapid transaction (simulated)'
      }
    ];

    for (const scenario of testScenarios) {
      console.log(`\nAnalyzing: ${scenario.description}`);
      
      const analysis = await this.fraudDetection.analyzePayment(scenario);
      
      console.log(`   Risk Level: ${analysis.riskLevel}`);
      console.log(`   Risk Score: ${(analysis.riskScore * 100).toFixed(2)}%`);
      console.log(`   Recommendation: ${analysis.recommendation}`);
      console.log(`   Requires Review: ${analysis.requiresReview ? 'Yes' : 'No'}`);
      
      if (analysis.riskFactors.length > 0) {
        console.log(`   Risk Factors:`);
        analysis.riskFactors.forEach(factor => {
          console.log(`     - ${factor.type}: ${factor.reasons.join(', ')}`);
        });
      }
    }
  }

  // Demo payment analytics
  async demoPaymentAnalytics() {
    console.log('\n📊 Payment Analytics Demo:');
    console.log('==========================');
    
    // Simulate some payment data
    const mockPayments = [
      { amount: 2500, success: true, processingTime: 1200, method: 'bank' },
      { amount: 1200, success: true, processingTime: 800, method: 'mobile' },
      { amount: 3500, success: true, processingTime: 1500, method: 'bank' },
      { amount: 950, success: false, processingTime: 2000, method: 'mobile' },
      { amount: 50000, success: true, processingTime: 3000, method: 'bank' }
    ];

    console.log('\nSimulating payment analytics...');
    
    for (const payment of mockPayments) {
      const paymentRecord = {
        paymentId: `DEMO_${Date.now()}`,
        userId: 1,
        amount: payment.amount,
        currency: 'ETB',
        success: payment.success,
        processingFee: payment.amount * 0.02,
        paymentMethod: { type: payment.method },
        bankCode: payment.method === 'bank' ? 'CBE' : null,
        providerCode: payment.method === 'mobile' ? 'TEL' : null
      };
      
      await this.paymentAnalytics.recordPayment(paymentRecord, payment.processingTime);
    }

    // Get analytics data
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date().toISOString();
    
    const dashboardData = await this.paymentAnalytics.getDashboardData(startDate, endDate);
    
    if (dashboardData) {
      console.log('\nDashboard Metrics:');
      console.log(`   Total Transactions: ${dashboardData.totalMetrics.total_transactions}`);
      console.log(`   Total Amount: ${dashboardData.totalMetrics.total_amount.toLocaleString()} ETB`);
      console.log(`   Success Rate: ${dashboardData.totalMetrics.success_rate.toFixed(2)}%`);
      console.log(`   Average Processing Time: ${dashboardData.totalMetrics.avg_processing_time.toFixed(0)}ms`);
      console.log(`   Total Processing Fees: ${dashboardData.totalMetrics.total_processing_fees.toLocaleString()} ETB`);
    }
  }

  // Demo error scenarios
  async demoErrorScenarios() {
    console.log('\n❌ Error Scenarios Demo:');
    console.log('=========================');
    
    const errorScenarios = [
      {
        userId: 1,
        paymentMethodId: 999, // Non-existent payment method
        amount: 1000,
        currency: 'ETB',
        description: 'Invalid payment method'
      },
      {
        userId: 1,
        paymentMethodId: 1,
        amount: 0, // Invalid amount
        currency: 'ETB',
        description: 'Invalid amount'
      },
      {
        userId: 1,
        paymentMethodId: 1,
        amount: 2000000, // Amount too high
        currency: 'ETB',
        description: 'Amount exceeds limit'
      },
      {
        userId: 1,
        paymentMethodId: 1,
        amount: 1000,
        currency: 'USD', // Unsupported currency
        description: 'Unsupported currency'
      }
    ];

    for (const scenario of errorScenarios) {
      console.log(`\nTesting: ${scenario.description}`);
      
      const result = await this.paymentProcessor.processPayment(scenario);
      
      if (!result.success) {
        console.log(`❌ Expected error: ${result.errors.join(', ')}`);
        console.log(`   Error Code: ${result.status}`);
      } else {
        console.log(`✅ Unexpected success`);
      }
    }
  }

  // Demo refund processing
  async demoRefundProcessing() {
    console.log('\n💰 Refund Processing Demo:');
    console.log('===========================');
    
    // First create a successful payment
    const paymentData = {
      userId: 1,
      paymentMethodId: 1,
      amount: 5000,
      currency: 'ETB',
      description: 'Demo payment for refund'
    };
    
    console.log('Creating payment for refund...');
    const paymentResult = await this.paymentProcessor.processPayment(paymentData);
    
    if (paymentResult.success) {
      console.log(`✅ Payment created: ${paymentResult.data.paymentId}`);
      
      // Process refund
      console.log('Processing refund...');
      const refundResult = await this.paymentProcessor.refundPayment(
        paymentResult.data.paymentId,
        2500, // Partial refund
        'Customer requested partial refund'
      );
      
      if (refundResult.success) {
        console.log(`✅ Refund successful: ${refundResult.data.refundId}`);
        console.log(`   Refund Amount: ${refundResult.data.amount} ETB`);
        console.log(`   Reason: ${refundResult.data.reason}`);
      } else {
        console.log(`❌ Refund failed: ${refundResult.errors.join(', ')}`);
      }
    } else {
      console.log(`❌ Payment creation failed: ${paymentResult.errors.join(', ')}`);
    }
  }

  // Generate demo data
  async generateDemoData() {
    console.log('\n📝 Generating Demo Data...');
    console.log('===========================');
    
    try {
      // Insert demo payment methods
      const demoPaymentMethods = [
        {
          user_id: 1,
          type: 'bank',
          details: JSON.stringify({
            bankName: 'cbe',
            accountNumber: '1000123456789',
            accountHolderName: 'Demo User',
            bankCode: 'CBE'
          }),
          is_verified: true,
          is_default: true
        },
        {
          user_id: 1,
          type: 'mobile',
          details: JSON.stringify({
            provider: 'telebirr',
            phoneNumber: '+251912345678',
            accountName: 'Demo User'
          }),
          is_verified: true,
          is_default: false
        },
        {
          user_id: 2,
          type: 'bank',
          details: JSON.stringify({
            bankName: 'dashen',
            accountNumber: '2000987654321',
            accountHolderName: 'Demo Farmer',
            bankCode: 'DASH'
          }),
          is_verified: true,
          is_default: true
        }
      ];

      for (const method of demoPaymentMethods) {
        await db.execute(`
          INSERT INTO payment_methods (user_id, type, details, is_verified, is_default, is_active, created_at)
          VALUES (?, ?, ?, ?, ?, 1, NOW())
        `, [method.user_id, method.type, method.details, method.is_verified, method.is_default]);
      }

      console.log('✅ Demo payment methods created');

      // Insert demo payments
      const demoPayments = [
        {
          user_id: 1,
          payment_method_id: 1,
          amount: 2500.00,
          currency: 'ETB',
          status: 'completed',
          transaction_id: 'TXN_DEMO_001',
          payment_id: 'PAY_DEMO_001',
          description: 'Demo payment 1'
        },
        {
          user_id: 1,
          payment_method_id: 2,
          amount: 1200.00,
          currency: 'ETB',
          status: 'completed',
          transaction_id: 'TXN_DEMO_002',
          payment_id: 'PAY_DEMO_002',
          description: 'Demo payment 2'
        },
        {
          user_id: 2,
          payment_method_id: 3,
          amount: 3500.00,
          currency: 'ETB',
          status: 'completed',
          transaction_id: 'TXN_DEMO_003',
          payment_id: 'PAY_DEMO_003',
          description: 'Demo payment 3'
        }
      ];

      for (const payment of demoPayments) {
        await db.execute(`
          INSERT INTO payments (user_id, payment_method_id, amount, currency, status, transaction_id, payment_id, description, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [payment.user_id, payment.payment_method_id, payment.amount, payment.currency, payment.status, payment.transaction_id, payment.payment_id, payment.description]);
      }

      console.log('✅ Demo payments created');
      console.log('\n🎉 Demo data generation completed!');

    } catch (error) {
      console.error('❌ Error generating demo data:', error);
    }
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  const demo = new PaymentDemo();
  demo.runDemo().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}

module.exports = PaymentDemo;
