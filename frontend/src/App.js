import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import OrderConfirmation from './context/OrderConfirmation';

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




// Component Layout để kiểm soát việc render Navbar và Footer
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarAndFooterPaths = ['/admin','/nhanvien']; // Các đường dẫn không muốn hiển thị Navbar và Footer

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
      <BrowserRouter>
        <CartProvider>
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
              <Route path="/admin" element={<Admin />} />
              <Route path="/nhanvien" element={<Nhanvien />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
            </Routes>
          </Layout>
        </CartProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;