import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Thêm thư viện uuid để tạo ID duy nhất

import { API_BASE_URL } from '../config'; // Import từ file config

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  // Khởi tạo session ID cho người dùng chưa đăng nhập
  useEffect(() => {
    let sid = localStorage.getItem('session_id');
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem('session_id', sid);
    }
    setSessionId(sid);
  }, []);

  // Lấy giỏ hàng từ server
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const cartId = token ? null : sessionId; // Nếu không có token, dùng sessionId

      // Sử dụng API_BASE_URL từ config, loại bỏ '/api' nếu đã có trong API_BASE_URL
      const baseUrl = API_BASE_URL.endsWith('/api') 
        ? API_BASE_URL 
        : `${API_BASE_URL}`;
      
      const response = await axios.get(`${baseUrl}/cart/`, {
        headers,
        params: { session_id: cartId }, // Gửi session_id nếu không đăng nhập
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Cập nhật giỏ hàng khi refreshTrigger hoặc sessionId thay đổi
  useEffect(() => {
    if (sessionId) {
      fetchCart();
    }
  }, [refreshTrigger, sessionId, fetchCart]);

  // Refresh cart
  const refreshCart = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product, quantity = 1) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const cartId = token ? null : sessionId;

      // Sử dụng API_BASE_URL từ config
      const baseUrl = API_BASE_URL.endsWith('/api') 
        ? API_BASE_URL 
        : `${API_BASE_URL}`;

      const response = await axios.post(
        `${baseUrl}/cart/add/`,
        {
          product_id: product.id,
          name: product.TenSanPham || product.name,
          price: product.GiaBan || product.price,
          image_url: product.HinhAnh_URL || product.HinhAnh || product.image_url,
          quantity: quantity,
          category: product.DanhMuc || product.TenDanhMuc || product.category || '',
          selected_color: product.selectedColor || 'default',
          size: product.size || 'Standard',
          session_id: cartId, // Gửi session_id nếu không đăng nhập
        },
        { headers }
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
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const cartId = token ? null : sessionId;

      // Sử dụng API_BASE_URL từ config
      const baseUrl = API_BASE_URL.endsWith('/api') 
        ? API_BASE_URL 
        : `${API_BASE_URL}`;

      const response = await axios.put(
        `${baseUrl}/cart/update/`,
        {
          product_id: productId,
          quantity: quantity,
          session_id: cartId,
        },
        { headers }
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
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const cartId = token ? null : sessionId;

      // Sử dụng API_BASE_URL từ config
      const baseUrl = API_BASE_URL.endsWith('/api') 
        ? API_BASE_URL 
        : `${API_BASE_URL}`;

      const response = await axios.delete(`${baseUrl}/cart/remove/${productId}/`, {
        headers,
        data: { session_id: cartId },
      });
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  // Xóa giỏ hàng
  const clearCart = async (itemsToRemove = null) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const cartId = token ? null : sessionId;

      // Sử dụng API_BASE_URL từ config
      const baseUrl = API_BASE_URL.endsWith('/api') 
        ? API_BASE_URL 
        : `${API_BASE_URL}`;

      let response;
      if (itemsToRemove && Array.isArray(itemsToRemove) && itemsToRemove.length > 0) {
        for (const item of itemsToRemove) {
          await removeFromCart(item.id || item.product_id);
        }
        await fetchCart();
      } else {
        response = await axios.delete(`${baseUrl}/cart/clear/`, {
          headers,
          data: { session_id: cartId },
        });
        setCart(response.data);
      }
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
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;