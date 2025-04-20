// src/context/CartContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Update with your API Gateway URL

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Lấy giỏ hàng từ server
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setCart({ items: [], total: 0 });
        setLoading(false);
        return;
      }

      console.log('Fetching cart data at:', new Date().toISOString());
      const response = await axios.get(`${API_BASE_URL}/api/cart/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // theo dõi thay đổi của state cart
  useEffect(() => {
    console.log('Cart state updated:', cart);
  }, [cart]);

  // Cập nhật giỏ hàng khi refreshTrigger thay đổi
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchCart();
    } else {
      setCart({ items: [], total: 0 });
      setLoading(false);
    }
  }, [refreshTrigger, fetchCart]);

  // Refresh cart function that triggers a refresh
  const refreshCart = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product, quantity = 1) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
        return;
      }
  
      // Chuẩn bị dữ liệu sản phẩm, hỗ trợ cả tên trường cũ và mới
      const response = await axios.post(
        `${API_BASE_URL}/api/cart/add/`,
        {
          product_id: product.id,
          name: product.TenSanPham || product.name, // Hỗ trợ cả hai trường
          price: product.GiaBan || product.price,   // Hỗ trợ cả hai trường 
          image_url: product.HinhAnh_URL || product.HinhAnh || product.image_url, // Hỗ trợ nhiều trường
          quantity: quantity,
          category: product.DanhMuc || product.TenDanhMuc || product.category || '',
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
  
      console.log('Đang xóa sản phẩm:', productId);
      
      const response = await axios.delete(`${API_BASE_URL}/api/cart/remove/${productId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Dữ liệu nhận về sau khi xóa:', response.data);
      
      // Sử dụng refreshCart thay vì setCart để đảm bảo dữ liệu mới nhất
      refreshCart();
      
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
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;