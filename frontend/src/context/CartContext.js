import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL } from '../config';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [lastToken, setLastToken] = useState(null);

  // Khởi tạo session ID
  useEffect(() => {
    let sid = localStorage.getItem('session_id');
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem('session_id', sid);
    }
    setSessionId(sid);
    const token = localStorage.getItem('access_token');
    setLastToken(token);
  }, []);

  // Lấy giỏ hàng từ server
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = {};

      // Gửi session_id nếu có, ngay cả khi có token (để hợp nhất)
      if (sessionId) {
        params.session_id = sessionId;
      }

      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}`;
      const response = await axios.get(`${baseUrl}/cart/`, {
        headers,
        params,
      });
      setCart(response.data);

      // Nếu có token và sessionId, xóa session_id sau khi hợp nhất
      if (token && sessionId) {
        localStorage.removeItem('session_id');
        setSessionId(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Kiểm tra trạng thái đăng nhập và lấy giỏ hàng
  useEffect(() => {
    const currentToken = localStorage.getItem('access_token');
    if (currentToken !== lastToken) {
      setLastToken(currentToken);
      fetchCart(); // Gọi fetchCart để hợp nhất nếu có sessionId
    } else {
      fetchCart();
    }
  }, [refreshTrigger, sessionId, fetchCart, lastToken]);

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
      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}`;

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
          session_id: cartId,
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
      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}`;

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
      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}`;

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
      const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}`;

      if (itemsToRemove && Array.isArray(itemsToRemove) && itemsToRemove.length > 0) {
        for (const item of itemsToRemove) {
          await removeFromCart(item.id || item.product_id);
        }
        await fetchCart();
      } else {
        const response = await axios.delete(`${baseUrl}/cart/clear/`, {
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