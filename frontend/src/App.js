import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './context/AuthContext';
import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Detail from "./pages/Detail";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Admin from './pages/admin';
import Nhanvien from './pages/nhanvien';
import OrderConfirmation from './context/OrderConfirmation';
import MyOrders from "./pages/my-orders";

const Layout = ({ children }) => {
  const location = useLocation();

  const hideNavbarAndFooterPaths = ['/admin', '/nhanvien']; // Add any other paths where you want to hide the navbar and footer
  return (
    <>
      {!hideNavbarAndFooterPaths.includes(location.pathname) && <Navbar />}
      {children}
      {!hideNavbarAndFooterPaths.includes(location.pathname) && <Footer />}
    </>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/detail" element={<Detail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about" element={<About />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/my-orders" element={<MyOrders/>} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nhanvien"
                  element={
                    <ProtectedRoute allowedRoles={["nhanvien"]}>
                      <Nhanvien />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;