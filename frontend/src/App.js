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
import Login from "./pages/Login";
import About from "./pages/About";
import Admin from './pages/admin';
import Nhanvien from './pages/nhanvien';
import OrderConfirmation from './context/OrderConfirmation';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.log("Layout - Current user:", user);
    console.log("Layout - Current location:", location.pathname);

    if (user && location.pathname === "/login") {
      if (user.loaiquyen === "admin") {
        console.log("Layout - User is admin, navigating to /admin");
        navigate("/admin", { replace: true });
      } else if (user.loaiquyen === "nhanvien") {
        console.log("Layout - User is nhanvien, navigating to /nhanvien");
        navigate("/nhanvien", { replace: true });
      } else {
        console.log("Layout - User is not admin/nhanvien, navigating to /");
        navigate("/", { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  const hideNavbarAndFooterPaths = ['/admin', '/nhanvien'];

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
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
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