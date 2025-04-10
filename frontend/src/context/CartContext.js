// src/context/CartContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Update with your API Gateway URL

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  // Lấy giỏ hàng khi user đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchCart();
    } else {
      setCart({ items: [], total: 0 });
      setLoading(false);
    }
  }, []);

  // Lấy giỏ hàng từ server
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setCart({ items: [], total: 0 });
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/cart/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product, quantity = 1) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
        return;
      }
      console.log('Token being sent:', token);

      const response = await axios.post(
        `${API_BASE_URL}/api/cart/add/`,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: quantity,
          category: product.category,
          selected_color: product.selectedColor || 'default',
          size: product.size || 'Standard'
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error.response?.data || error.message);
      throw error;
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.put(
        `${API_BASE_URL}/api/cart/update/`,
        {
          product_id: productId,
          quantity: quantity
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.delete(`${API_BASE_URL}/api/cart/remove/${productId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.delete(`${API_BASE_URL}/api/cart/clear/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;