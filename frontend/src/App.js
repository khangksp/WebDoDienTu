import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from './context/LanguageContext';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Detail from "./pages/Detail"; 
import Checkout from "./pages/Checkout";
import PokemonAPI from "./pages/Pokemon";
import Login from "./pages/Login";
import About from "./pages/About";
import Admin from './pages/admin';
import Nhanvien from './pages/nhanvien';

import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/detail" element={<Detail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pokemon" element={<PokemonAPI/>}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
        <Route path="/nhanvien" element={<Nhanvien />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;