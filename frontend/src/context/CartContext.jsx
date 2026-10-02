import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isUser } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cartError, setCartError] = useState('');
  const [cartErrorMedicineId, setCartErrorMedicineId] = useState(null);

  const clearCartError = () => {
    setCartError('');
    setCartErrorMedicineId(null);
  };

  const fetchCart = async () => {
    if (!isAuthenticated || !isUser) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, isUser]);

  const addToCart = async (medicineId, quantity = 1) => {
    if (!isAuthenticated || !isUser) return false;
    clearCartError();
    try {
      const updated = await cartService.addItem(medicineId, quantity);
      setCart(updated);
      return true;
    } catch (error) {
      setCartError(error.response?.data?.message || 'Failed to add item to cart');
      setCartErrorMedicineId(medicineId);
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    const item = cart?.items?.find((cartItem) => cartItem.id === itemId);
    clearCartError();
    try {
      const updated = await cartService.updateQuantity(itemId, quantity);
      setCart(updated);
    } catch (error) {
      setCartError(error.response?.data?.message || 'Failed to update quantity');
      setCartErrorMedicineId(item?.medicine?.id ?? null);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const updated = await cartService.removeItem(itemId);
      setCart(updated);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart({ items: [] });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const totalPrice = cart?.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart, itemCount, totalPrice, cartError, cartErrorMedicineId, clearCartError }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
