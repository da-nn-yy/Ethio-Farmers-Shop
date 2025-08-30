import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RecentOrdersWidget = ({ currentLanguage = 'en' }) => {
  const navigate = useNavigate();

  const recentOrders = [
    {
      id: "ORD-2024-001",
      farmerName: "Alemayehu Tadesse",
      farmerPhone: "+251911234567",
      items: [
        { name: "Fresh Tomatoes", quantity: "5kg", price: 150 },
        { name: "Red Onions", quantity: "3kg", price: 90 }
      ],
      totalAmount: 240,
      status: "confirmed",
      estimatedDelivery: "Today, 2:00 PM",
      orderDate: "2024-08-26T04:30:00Z",
      deliveryAddress: "Bole, Addis Ababa",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop"
    },
    {
      id: "ORD-2024-002",
      farmerName: "Tigist Bekele",
      farmerPhone: "+251922345678",
      items: [
        { name: "Organic Carrots", quantity: "2kg", price: 80 },
        { name: "Fresh Lettuce", quantity: "1kg", price: 45 }
      ],
      totalAmount: 125,
      status: "preparing",
      estimatedDelivery: "Tomorrow, 10:00 AM",
      orderDate: "2024-08-25T14:15:00Z",
      deliveryAddress: "Kazanchis, Addis Ababa",
      image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=300&fit=crop"
    },
    {
      id: "ORD-2024-003",
      farmerName: "Mulugeta Haile",
      farmerPhone: "+251933456789",
      items: [
        { name: "Irish Potatoes", quantity: "10kg", price: 200 }
      ],
      totalAmount: 200,
      status: "delivered",
      estimatedDelivery: "Delivered",
      orderDate: "2024-08-24T09:45:00Z",
      deliveryAddress: "Piassa, Addis Ababa",
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-success bg-success/10';
      case 'preparing':
        return 'text-warning bg-warning/10';
      case 'delivered':
        return 'text-muted-foreground bg-muted';
      case 'cancelled':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'confirmed': currentLanguage === 'en' ? 'Confirmed' : 'ተረጋግጧል',
      'preparing': currentLanguage === 'en' ? 'Preparing' : 'በዝግጅት ላይ',
      'delivered': currentLanguage === 'en' ? 'Delivered' : 'ተደርሷል',
      'cancelled': currentLanguage === 'en' ? 'Cancelled' : 'ተሰርዟል'
    };
    return statusMap?.[status] || status;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    })?.format(price)?.replace('ETB', 'ETB');
  };

  const handleOrderClick = (order) => {
    // Navigate to order details or show order modal
    console.log('Order clicked:', order);
  };

  const handleContactFarmer = (e, phone) => {
    e?.stopPropagation();
    window.open(`tel:${phone}`, '_self');
  };

  const handleViewAllOrders = () => {
    navigate('/user-profile', { state: { activeTab: 'orders' } });
  };

  return (
    <div className="bg-background px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {currentLanguage === 'en' ? 'Recent Orders' : 'የቅርብ ጊዜ ትዕዛዞች'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAllOrders}
          className="font-body text-sm text-primary hover:text-primary/80"
        >
          {currentLanguage === 'en' ? 'View All' : 'ሁሉንም ይመልከቱ'}
        </Button>
      </div>
      <div className="space-y-4">
        {recentOrders?.map((order) => (
          <div
            key={order?.id}
            className="bg-card border border-border rounded-xl p-4 hover:shadow-subtle transition-all duration-200 cursor-pointer"
            onClick={() => handleOrderClick(order)}
          >
            <div className="flex space-x-3">
              {/* Order Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={order?.image}
                  alt={order?.items?.[0]?.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Order Details */}
              <div className="flex-1 min-w-0">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-body text-sm font-semibold text-foreground">
                      {order?.id}
                    </span>
                    <div className={`px-2 py-1 rounded-full ${getStatusColor(order?.status)}`}>
                      <span className="font-caption text-xs font-medium">
                        {getStatusText(order?.status)}
                      </span>
                    </div>
                  </div>
                  <span className="font-body text-sm font-semibold text-foreground">
                    {formatPrice(order?.totalAmount)}
                  </span>
                </div>

                {/* Farmer Info */}
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="User" size={14} color="var(--color-muted-foreground)" />
                  <span className="font-body text-sm text-muted-foreground">
                    {order?.farmerName}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="mb-2">
                  <p className="font-body text-sm text-foreground line-clamp-1">
                    {order?.items?.map(item => `${item?.name} (${item?.quantity})`)?.join(', ')}
                  </p>
                </div>

                {/* Delivery Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
                    <span className="font-caption text-xs text-muted-foreground">
                      {order?.estimatedDelivery}
                    </span>
                  </div>
                  
                  {order?.status !== 'delivered' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleContactFarmer(e, order?.farmerPhone)}
                      className="p-1"
                    >
                      <Icon name="Phone" size={16} color="var(--color-primary)" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Indicator for Active Orders */}
            {order?.status === 'confirmed' || order?.status === 'preparing' ? (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        order?.status === 'confirmed' ? 'bg-success w-1/3' : 'bg-success w-2/3'
                      }`}
                    />
                  </div>
                  <span className="font-caption text-xs text-muted-foreground">
                    {order?.status === 'confirmed' 
                      ? (currentLanguage === 'en' ? 'Order confirmed' : 'ትዕዛዝ ተረጋግጧል')
                      : (currentLanguage === 'en' ? 'Being prepared' : 'በዝግጅት ላይ')
                    }
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {/* Quick Reorder Section */}
      <div className="mt-6 p-4 bg-muted rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-body text-sm font-semibold text-foreground mb-1">
              {currentLanguage === 'en' ? 'Quick Reorder' : 'ፈጣን እንደገና ትዕዛዝ'}
            </h4>
            <p className="font-caption text-xs text-muted-foreground">
              {currentLanguage === 'en' ?'Reorder your favorite items with one tap' :'የሚወዷቸውን ዕቃዎች በአንድ ንክኪ እንደገና ይዘዙ'
              }
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            iconName="RotateCcw"
            iconPosition="left"
            iconSize={16}
          >
            {currentLanguage === 'en' ? 'Reorder' : 'እንደገና ዝዙ'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecentOrdersWidget;