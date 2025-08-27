import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const OrderHistorySection = ({ userRole, currentLanguage }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const orderHistory = {
    farmer: [
      {
        id: 'ORD-2024-001',
        buyerName: 'Green Valley Restaurant',
        buyerNameAm: 'ግሪን ቫሊ ሬስቶራንት',
        product: 'Organic Teff',
        productAm: 'ኦርጋኒክ ጤፍ',
        quantity: '50kg',
        price: '2,500 ETB',
        status: 'completed',
        date: '2024-08-20',
        rating: 5,
        review: `Excellent quality teff! The grains were clean and well-processed. 
        The farmer was very responsive and delivered on time. 
        Will definitely order again.`
      },
      {
        id: 'ORD-2024-002',
        buyerName: 'Addis Fresh Market',
        buyerNameAm: 'አዲስ ፍሬሽ ማርኬት',
        product: 'Mixed Vegetables',
        productAm: 'ድብልቅ አትክልት',
        quantity: '25kg',
        price: '750 ETB',
        status: 'completed',
        date: '2024-08-18',
        rating: 4,
        review: `Good quality vegetables, fresh and well-packaged. 
        Delivery was prompt. Minor issue with some wilted leaves but overall satisfied.`
      },
      {
        id: 'ORD-2024-003',
        buyerName: 'Habesha Cuisine',
        buyerNameAm: 'ሐበሻ ምግብ ቤት',
        product: 'Red Onions',
        productAm: 'ቀይ ሽንኩርት',
        quantity: '30kg',
        price: '900 ETB',
        status: 'pending',
        date: '2024-08-25',
        rating: null,
        review: null
      }
    ],
    buyer: [
      {
        id: 'ORD-2024-001',
        farmerName: 'Abebe Kebede',
        farmerNameAm: 'አበበ ከበደ',
        product: 'Organic Coffee Beans',
        productAm: 'ኦርጋኒክ የቡና ፍሬ',
        quantity: '10kg',
        price: '1,200 ETB',
        status: 'completed',
        date: '2024-08-22',
        rating: 5,
        review: `Outstanding coffee beans! The aroma and taste are exceptional. 
        The farmer provided detailed information about the processing method. 
        Highly recommended for specialty coffee shops.`
      },
      {
        id: 'ORD-2024-002',
        farmerName: 'Tigist Alemayehu',
        farmerNameAm: 'ትግስት አለማየሁ',
        product: 'Fresh Tomatoes',
        productAm: 'ትኩስ ቲማቲም',
        quantity: '15kg',
        price: '450 ETB',
        status: 'completed',
        date: '2024-08-19',
        rating: 4,
        review: `Very fresh tomatoes, perfect for our restaurant needs. 
        Good communication with the farmer. 
        Would appreciate better packaging for future orders.`
      },
      {
        id: 'ORD-2024-003',
        farmerName: 'Mulugeta Tadesse',
        farmerNameAm: 'ሙሉጌታ ታደሰ',
        product: 'White Wheat',
        productAm: 'ነጭ ስንዴ',
        quantity: '100kg',
        price: '3,500 ETB',
        status: 'in-transit',
        date: '2024-08-24',
        rating: null,
        review: null
      }
    ]
  };

  const orders = orderHistory?.[userRole];

  const statusOptions = [
    { value: 'all', label: 'All Orders', labelAm: 'ሁሉም ትዕዛዞች' },
    { value: 'completed', label: 'Completed', labelAm: 'የተጠናቀቁ' },
    { value: 'pending', label: 'Pending', labelAm: 'በመጠባበቅ ላይ' },
    { value: 'in-transit', label: 'In Transit', labelAm: 'በመንገድ ላይ' },
    { value: 'cancelled', label: 'Cancelled', labelAm: 'የተሰረዙ' }
  ];

  const periodOptions = [
    { value: 'all', label: 'All Time', labelAm: 'ሁሉም ጊዜ' },
    { value: 'week', label: 'This Week', labelAm: 'በዚህ ሳምንት' },
    { value: 'month', label: 'This Month', labelAm: 'በዚህ ወር' },
    { value: 'quarter', label: 'Last 3 Months', labelAm: 'ባለፉት 3 ወራት' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        color: 'bg-success/10 text-success border-success/20',
        icon: 'CheckCircle',
        text: currentLanguage === 'am' ? 'ተጠናቅቋል' : 'Completed'
      },
      pending: {
        color: 'bg-warning/10 text-warning border-warning/20',
        icon: 'Clock',
        text: currentLanguage === 'am' ? 'በመጠባበቅ ላይ' : 'Pending'
      },
      'in-transit': {
        color: 'bg-primary/10 text-primary border-primary/20',
        icon: 'Truck',
        text: currentLanguage === 'am' ? 'በመንገድ ላይ' : 'In Transit'
      },
      cancelled: {
        color: 'bg-error/10 text-error border-error/20',
        icon: 'XCircle',
        text: currentLanguage === 'am' ? 'ተሰርዟል' : 'Cancelled'
      }
    };

    const config = statusConfig?.[status];
    
    return (
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span>{config?.text}</span>
      </div>
    );
  };

  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5]?.map((star) => (
          <Icon
            key={star}
            name="Star"
            size={14}
            className={star <= rating ? 'text-accent fill-current' : 'text-muted'}
          />
        ))}
        <span className="text-sm text-text-secondary ml-1">({rating})</span>
      </div>
    );
  };

  const getLabel = (text, textAm) => {
    return currentLanguage === 'am' ? textAm : text;
  };

  const getOptionLabel = (option) => {
    return currentLanguage === 'am' && option?.labelAm ? option?.labelAm : option?.label;
  };

  const getPartnerName = (order) => {
    if (userRole === 'farmer') {
      return currentLanguage === 'am' ? order?.buyerNameAm : order?.buyerName;
    } else {
      return currentLanguage === 'am' ? order?.farmerNameAm : order?.farmerName;
    }
  };

  const getProductName = (order) => {
    return currentLanguage === 'am' ? order?.productAm : order?.product;
  };

  const filteredOrders = orders?.filter(order => {
    if (filterStatus !== 'all' && order?.status !== filterStatus) return false;
    // Add period filtering logic here if needed
    return true;
  });

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          {getLabel('Order History', 'የትዕዛዝ ታሪክ')}
        </h2>
        <div className="flex items-center space-x-2">
          <Icon name="History" size={20} className="text-primary" />
          <span className="text-sm text-text-secondary">
            {filteredOrders?.length} {getLabel('orders', 'ትዕዛዞች')}
          </span>
        </div>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Select
          label={getLabel('Filter by Status', 'በሁኔታ ማጣሪያ')}
          options={statusOptions?.map(option => ({
            value: option?.value,
            label: getOptionLabel(option)
          }))}
          value={filterStatus}
          onChange={setFilterStatus}
        />
        
        <Select
          label={getLabel('Filter by Period', 'በጊዜ ማጣሪያ')}
          options={periodOptions?.map(option => ({
            value: option?.value,
            label: getOptionLabel(option)
          }))}
          value={filterPeriod}
          onChange={setFilterPeriod}
        />
      </div>
      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders?.length > 0 ? (
          filteredOrders?.map((order) => (
            <div key={order?.id} className="border border-border rounded-lg p-4 hover:shadow-warm-md transition-smooth">
              {/* Mobile Layout */}
              <div className="lg:hidden space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary">#{order?.id}</h3>
                    <p className="text-sm text-text-secondary">
                      {userRole === 'farmer' ? getLabel('Buyer:', 'ገዢ:') : getLabel('Farmer:', 'ገበሬ:')} {getPartnerName(order)}
                    </p>
                  </div>
                  {getStatusBadge(order?.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">{getLabel('Product:', 'ምርት:')}</span>
                    <span className="text-sm font-medium text-text-primary">{getProductName(order)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">{getLabel('Quantity:', 'መጠን:')}</span>
                    <span className="text-sm font-medium text-text-primary">{order?.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">{getLabel('Price:', 'ዋጋ:')}</span>
                    <span className="text-sm font-bold text-primary">{order?.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">{getLabel('Date:', 'ቀን:')}</span>
                    <span className="text-sm text-text-primary">{new Date(order.date)?.toLocaleDateString()}</span>
                  </div>
                </div>

                {order?.rating && (
                  <div className="pt-3 border-t border-border">
                    {renderStarRating(order?.rating)}
                    {order?.review && (
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                        {order?.review}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <Button variant="outline" size="sm" iconName="Eye" iconPosition="left">
                    {getLabel('View Details', 'ዝርዝር ይመልከቱ')}
                  </Button>
                  {order?.status === 'completed' && !order?.rating && (
                    <Button variant="ghost" size="sm" iconName="Star" iconPosition="left">
                      {getLabel('Rate', 'ደረጃ ስጥ')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:block">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-medium text-text-primary">#{order?.id}</h3>
                    <span className="text-text-secondary">•</span>
                    <span className="text-sm text-text-secondary">
                      {userRole === 'farmer' ? getLabel('Buyer:', 'ገዢ:') : getLabel('Farmer:', 'ገበሬ:')} {getPartnerName(order)}
                    </span>
                    <span className="text-text-secondary">•</span>
                    <span className="text-sm text-text-secondary">
                      {new Date(order.date)?.toLocaleDateString()}
                    </span>
                  </div>
                  {getStatusBadge(order?.status)}
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-text-secondary">{getLabel('Product', 'ምርት')}</span>
                    <p className="font-medium text-text-primary">{getProductName(order)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">{getLabel('Quantity', 'መጠን')}</span>
                    <p className="font-medium text-text-primary">{order?.quantity}</p>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">{getLabel('Price', 'ዋጋ')}</span>
                    <p className="font-bold text-primary">{order?.price}</p>
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="outline" size="sm" iconName="Eye" iconPosition="left">
                      {getLabel('View Details', 'ዝርዝር ይመልከቱ')}
                    </Button>
                    {order?.status === 'completed' && !order?.rating && (
                      <Button variant="ghost" size="sm" iconName="Star" iconPosition="left">
                        {getLabel('Rate', 'ደረጃ ስጥ')}
                      </Button>
                    )}
                  </div>
                </div>

                {order?.rating && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {renderStarRating(order?.rating)}
                        {order?.review && (
                          <p className="text-sm text-text-secondary mt-2">
                            {order?.review}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Icon name="Package" size={48} className="text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {getLabel('No Orders Found', 'ምንም ትዕዛዝ አልተገኘም')}
            </h3>
            <p className="text-text-secondary">
              {getLabel(
                'No orders match your current filters. Try adjusting the filters above.',
                'ምንም ትዕዛዝ ከእርስዎ ማጣሪያዎች ጋር አይዛመድም። ከላይ ያሉትን ማጣሪያዎች ማስተካከል ይሞክሩ።'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistorySection;