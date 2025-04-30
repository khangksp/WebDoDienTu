import React, { createContext, useContext, useState } from "react";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [totalOrders, setTotalOrders] = useState(0);

  return (
    <OrderContext.Provider value={{ totalOrders, setTotalOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);