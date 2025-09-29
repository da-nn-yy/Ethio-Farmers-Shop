import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import Button from './Button.jsx';
import Icon from '../AppIcon.jsx';
import { useLanguage } from '../../hooks/useLanguage.jsx';

const AddToCartButton = ({
  listing,
  className = '',
  size = 'default',
  showQuantity = true,
  currentLanguage = 'en'
}) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);

  const lang = currentLanguage || language || 'en';

  const translations = {
    en: {
      addToCart: 'Add to Cart',
      added: 'Added!',
      quantity: 'Quantity',
      maxAvailable: 'Max available',
      loginRequired: 'Please login to add items to cart',
      kg: 'kg'
    },
    am: {
      addToCart: 'ወደ ጋሪ ጨምር',
      added: 'ተጨመረ!',
      quantity: 'ብዛት',
      maxAvailable: 'ከፍተኛ የሚገኝ',
      loginRequired: 'እቃዎችን ወደ ጋሪ ለመጨመር እባክዎ ይግቡ',
      kg: 'ኪሎ'
    }
  };

  const t = translations[lang];

  const maxQuantity = Math.min(listing?.availableQuantity || 100, 50); // Cap at 50 for UX

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert(t.loginRequired);
      return;
    }

    if (!listing) return;

    setIsAdding(true);

    try {
      // Add item to cart
      addItem({
        id: listing.id,
        name: listing.name,
        nameAm: listing.nameAm,
        image: listing.image,
        images: listing.images,
        pricePerKg: listing.pricePerKg,
        availableQuantity: listing.availableQuantity,
        farmerName: listing.farmerName,
        location: listing.location
      }, quantity);

      // Show success feedback
      setShowQuantitySelector(false);
      setQuantity(1);

      // Brief success state
      setTimeout(() => {
        setIsAdding(false);
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleQuickAdd = () => {
    if (showQuantity && maxQuantity > 1) {
      setShowQuantitySelector(true);
    } else {
      handleAddToCart();
    }
  };

  if (showQuantitySelector) {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Quantity Selector */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">{t.quantity}:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="w-8 h-8 p-0"
            >
              <Icon name="Minus" size={14} />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity}
              className="w-8 h-8 p-0"
            >
              <Icon name="Plus" size={14} />
            </Button>
          </div>
        </div>

        {/* Available Quantity Info */}
        <div className="text-xs text-gray-500 text-center">
          {t.maxAvailable}: {maxQuantity} {t.kg}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleAddToCart}
            className="flex-1"
            size={size}
            loading={isAdding}
            disabled={!listing || quantity < 1}
          >
            <Icon name="ShoppingCart" size={16} className="mr-2" />
            {isAdding ? t.added : t.addToCart}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowQuantitySelector(false)}
            size={size}
          >
            <Icon name="X" size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleQuickAdd}
      className={className}
      size={size}
      loading={isAdding}
      disabled={!listing || !isAuthenticated}
    >
      <Icon name="ShoppingCart" size={16} className="mr-2" />
      {isAdding ? t.added : t.addToCart}
    </Button>
  );
};

export default AddToCartButton;


