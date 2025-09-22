import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { useCart } from '../../hooks/useCart.jsx';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import CheckoutButton from '../../components/CheckoutButton';

const CartPage = () => {
  const { items, updateQuantity, removeItem, clear, totalCost } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-4">{language === 'am' ? 'የግዛት ካርት' : 'Shopping Cart'}</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="ShoppingCart" size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-text-secondary">{language === 'am' ? 'ካርት ባዶ ነው።' : 'Your cart is empty.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-white">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{language === 'am' ? item.nameAm || item.name : item.name}</div>
                  <div className="text-sm text-text-secondary">ETB {item.pricePerKg} / kg</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)} iconName="Minus" />
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)} iconName="Plus" />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} iconName="Trash2" className="text-red-500 hover:text-red-700" />
              </div>
            ))}

            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-white">
              <div className="text-lg font-semibold text-text-primary">{language === 'am' ? 'ጠቅላላ' : 'Total'}</div>
              <div className="text-xl font-bold text-primary">ETB {totalCost}</div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={clear}>{language === 'am' ? 'ካርት አጽዳ' : 'Clear Cart'}</Button>
              <CheckoutButton size="lg" />
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default CartPage;


