import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import Button from './Button.jsx';
import Icon from '../AppIcon.jsx';
import { useLanguage } from '../../hooks/useLanguage.jsx';

const CartIcon = ({
  className = '',
  showLabel = false,
  size = 'default',
  currentLanguage = 'en'
}) => {
  const navigate = useNavigate();
  const { totalItems, items } = useCart();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate('/authentication-login-register');
      return;
    }
    navigate('/cart');
  };

  const getCartIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3 text-[8px]';
      case 'lg': return 'h-6 w-6 text-xs';
      default: return 'h-4 w-4 text-[10px]';
    }
  };

  const translations = {
    en: {
      cart: 'Cart',
      items: 'items',
      empty: 'Empty cart'
    },
    am: {
      cart: 'ጋሪ',
      items: 'እቃዎች',
      empty: 'ባዶ ጋሪ'
    }
  };

  const t = translations[currentLanguage] || translations[language] || translations.en;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCartClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative transition-all duration-200 hover:bg-primary/10 ${className}`}
        title={`${t.cart} (${totalItems} ${t.items})`}
      >
        <Icon
          name="ShoppingCart"
          size={getCartIconSize()}
          className={`transition-colors duration-200 ${
            totalItems > 0 ? 'text-primary' : 'text-gray-600'
          }`}
        />

        {/* Cart Badge */}
        {totalItems > 0 && (
          <span className={`absolute -top-1 -right-1 bg-primary text-white rounded-full ${getBadgeSize()} flex items-center justify-center font-medium shadow-sm animate-pulse`}>
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}

        {/* Hover Tooltip */}
        {isHovered && (
          <div className="absolute top-full right-0 mt-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50 shadow-lg">
            <div className="flex items-center gap-2">
              <Icon name="ShoppingCart" size={14} />
              <span>
                {totalItems > 0
                  ? `${totalItems} ${t.items}`
                  : t.empty
                }
              </span>
            </div>
            <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        )}
      </Button>

      {/* Quick Cart Preview (Desktop only) */}
      {isHovered && totalItems > 0 && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="ShoppingCart" size={16} />
              {t.cart} ({totalItems} {t.items})
            </h3>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0">
                <img
                  src={item.image || '/assets/images/no_image.png'}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentLanguage === 'am' ? item.nameAm || item.name : item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × ETB {item.pricePerKg}
                  </p>
                </div>
              </div>
            ))}

            {items.length > 3 && (
              <div className="p-3 text-center text-sm text-gray-500">
                +{items.length - 3} more items
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleCartClick}
              className="w-full"
              size="sm"
            >
              <Icon name="ArrowRight" size={14} className="mr-2" />
              {currentLanguage === 'am' ? 'ጋሪ ይመልከቱ' : 'View Cart'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartIcon;


