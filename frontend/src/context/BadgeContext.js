// src/context/OrderContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';

// Tạo context
const OrderContext = createContext();

// Custom hook để sử dụng context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

// Provider component
export const OrderProvider = ({ children }) => {
  const [orderCount, setOrderCount] = useState(0);
  const [orderList, setOrderList] = useState([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    statuses: {},
  });

  // Cập nhật số lượng đơn hàng
  const updateOrderCount = useCallback((count) => {
    setOrderCount(count);
  }, []);

  // Cập nhật danh sách đơn hàng
  const updateOrderList = useCallback((orders) => {
    setOrderList(orders);
    if (Array.isArray(orders)) {
      setOrderCount(orders.length);
    }
  }, []);

  // Cập nhật thống kê đơn hàng
  const updateOrderStats = useCallback((stats) => {
    setOrderStats(stats);
  }, []);

  // Reset tất cả dữ liệu
  const resetOrderData = useCallback(() => {
    setOrderCount(0);
    setOrderList([]);
    setOrderStats({
      totalOrders: 0,
      totalAmount: 0,
      statuses: {},
    });
  }, []);

  const value = {
    orderCount,
    orderList,
    orderStats,
    updateOrderCount,
    updateOrderList,
    updateOrderStats,
    resetOrderData
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export default OrderContext;