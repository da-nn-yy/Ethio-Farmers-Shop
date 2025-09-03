
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentOrdersWidget = ({ currentLanguage = 'en' }) => {
  const navigate = useNavigate();

  const recentOrders = [
    {
      id: 'ORD-001',
      farmerName: 'Ahmed Hassan',
      items: [
        { name: 'Tomatoes', quantity: '5 kg' },
        { name: 'Onions', quantity: '3 kg' }
      ],
      totalAmount: 485,
      status: 'delivered',
      orderDate: '2024-01-15',
      deliveryDate: '2024-01-17'
    },
    {
      id: 'ORD-002',
      farmerName: 'Fatima Ali',
      items: [
        { name: 'Potatoes', quantity: '10 kg' }
      ],
      totalAmount: 320,
      status: 'pending',
      orderDate: '2024-01-16',
      estimatedDelivery: '2024-01-19'
    },
    {
      id: 'ORD-003',
      farmerName: 'Mohammed Getnet',
      items: [
        { name: 'Carrots', quantity: '2 kg' },
        { name: 'Cabbage', quantity: '1 piece' }
      ],
      totalAmount: 180,
      status: 'in_transit',
      orderDate: '2024-01-14',
      estimatedDelivery: '2024-01-18'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'in_transit':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      delivered: currentLanguage === 'en' ? 'Delivered' : 'ተላልፏል',
      pending: currentLanguage === 'en' ? 'Pending' : 'በመጠባበቅ ላይ',
      in_transit: currentLanguage === 'en' ? 'In Transit' : 'በመንገድ ላይ'
    };
    return statusMap[status] || status;
  };

  const handleViewAllOrders = () => {
    navigate('/order-management');
  };

  if (recentOrders.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {currentLanguage === 'en' ? 'Recent Orders' : 'የቅርብ ጊዜ ትዕዛዞች'}
        </h3>
        <div className="text-center py-8">
          <Icon name="ShoppingBag" className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">
            {currentLanguage === 'en' 
              ? 'No orders yet. Start browsing to place your first order!' 
              : 'እስካሁን ምንም ትዕዛዝ የለም። የመጀመሪያ ትዕዛዝዎን ለማስቀመط ማሰስ ይጀምሩ!'
            }
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate('/browse-listings-buyer-home')}
          >
            {currentLanguage === 'en' ? 'Start Shopping' : 'ግዢ ይጀምሩ'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          {currentLanguage === 'en' ? 'Recent Orders' : 'የቅርብ ጊዜ ትዕዛዞች'}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewAllOrders}
          iconName="ArrowRight"
          iconPosition="right"
        >
          {currentLanguage === 'en' ? 'View All' : 'ሁሉንም ይመልከቱ'}
        </Button>
      </div>

      <div className="space-y-4">
        {recentOrders.slice(0, 3).map((order) => (
          <div key={order.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-text-primary">#{order.id}</p>
                <p className="text-sm text-text-secondary">{order.farmerName}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>

            <div className="mb-2">
              {order.items.map((item, index) => (
                <span key={index} className="text-sm text-text-secondary">
                  {item.name} ({item.quantity})
                  {index < order.items.length - 1 && ', '}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-text-primary">
                {order.totalAmount} ETB
              </span>
              <span className="text-text-secondary">
                {new Date(order.orderDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrdersWidget;
