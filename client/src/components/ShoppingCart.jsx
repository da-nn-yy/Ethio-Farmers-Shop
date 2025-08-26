import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContexts';
import { ordersAPI } from '../services/api';
import { ShoppingCart as CartIcon, X, Plus, Minus, Trash2 } from 'lucide-react';

const ShoppingCart = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalItems: 0, totalAmount: 0 });

  useEffect(() => {
    if (isOpen && currentUser) {
      loadCart();
    }
  }, [isOpen, currentUser]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getCart();
      setCartItems(response.data.items || []);
      setSummary(response.data.summary || { totalItems: 0, totalAmount: 0 });
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
      setSummary({ totalItems: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await ordersAPI.updateCartItem(itemId, newQuantity);
      await loadCart(); // Reload cart to get updated data
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await ordersAPI.removeFromCart(itemId);
      await loadCart(); // Reload cart to get updated data
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    }
  };

  const clearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await ordersAPI.clearCart();
        setCartItems([]);
        setSummary({ totalItems: 0, totalAmount: 0 });
      } catch (error) {
        console.error('Error clearing cart:', error);
        alert('Failed to clear cart. Please try again.');
      }
    }
  };

  const proceedToCheckout = () => {
    onClose();
    window.location.href = '/checkout';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CartIcon className="h-6 w-6 text-[#006C36]" />
            <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
            {summary.totalItems > 0 && (
              <span className="bg-[#006C36] text-white text-sm px-2 py-1 rounded-full">
                {summary.totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006C36] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading cart...</p>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <CartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-600">Your cart is empty</h3>
                <p className="text-gray-500 mb-4">Add some fresh produce to get started!</p>
                <button
                  onClick={() => {
                    onClose();
                    window.location.href = '/marketplace';
                  }}
                  className="bg-[#006C36] text-white px-6 py-2 rounded-lg hover:bg-[#006C36]/90 transition-colors"
                >
                  Browse Marketplace
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.cartItemId} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-2xl">🌾</span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.farmerName}</p>
                        <p className="text-sm font-medium text-[#006C36]">
                          {item.pricePerKg} ETB/{item.unit}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          disabled={item.quantity >= item.availableQuantity}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="text-right min-w-0">
                        <p className="font-semibold text-gray-900">
                          {(item.pricePerKg * item.quantity).toFixed(2)} ETB
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {item.pricePerKg} ETB
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total ({summary.totalItems} items):</span>
                  <span className="text-2xl font-bold text-[#006C36]">
                    {summary.totalAmount.toFixed(2)} ETB
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={proceedToCheckout}
                    className="flex-1 px-4 py-3 bg-[#006C36] text-white rounded-lg hover:bg-[#006C36]/90 transition-colors font-medium"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
