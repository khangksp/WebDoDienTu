import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMobile, faLaptop, faCamera, faClock, 
  faBlender, faFootballBall, faMotorcycle, faHome, faBook, faListAlt,
  faShoppingCart, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import AOS from 'aos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'aos/dist/aos.css';
import "./style/style.css";

import { API_BASE_URL } from '../config';
import { useLanguage } from "../context/LanguageContext";

function HomePage() {
  const { t } = useLanguage(); // Sử dụng hook useLanguage
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true
    });
  }, []);

  // Fetch danh mục sản phẩm
  useEffect(() => {
    axios.get(`${API_BASE_URL}/products/danh-muc/`)
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error("Lỗi khi tải danh mục:", error);
      });
  }, []);

  // Fetch sản phẩm
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/products/san-pham/`)
      .then(response => {
        console.log("Dữ liệu API:", response.data);
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Lỗi khi gọi API:", error);
        setError("Không thể tải dữ liệu sản phẩm");
        setLoading(false);
      });
  }, []);

  // Function to handle product click and navigate to detail page
  const handleProductClick = (productId) => {
    navigate(`/detail?id=${productId}`);
  };

  // Function to handle buy now button
  const handleBuyNow = (e, productId) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    // Implement buy now functionality or navigate to checkout
    console.log(`Mua ngay sản phẩm: ${productId}`);
    // navigate(`/checkout?product=${productId}`);
  };

  // Function to handle view details button
  const handleViewDetails = (e, productId) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    navigate(`/detail?id=${productId}`);
  };

  // Lấy 4 sản phẩm mới nhất
  const newProducts = products.slice(0, 8);
  
  // Map category icon
  const getCategoryIcon = (name) => {
    const iconMap = {
      'Điện Thoại': faMobile,
      'Máy Tính': faLaptop,
      'Máy Ảnh': faCamera,
      'Đồng Hồ': faClock,
      'Thiết Bị Điện Gia Dụng': faBlender,
      'Thể Thao': faFootballBall,
      'Xe Máy': faMotorcycle,
      'Đồ Gia Dụng': faHome,
      'Sách': faBook
    };
    
    // Tìm icon phù hợp dựa vào tên danh mục (tìm kiếm theo từng phần)
    for (const [key, value] of Object.entries(iconMap)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // Nếu không tìm thấy, trả về icon mặc định
    return faListAlt;
  };

  return (
    <div className="home-container">
      {/* Banner or Slider would go here */}
      <div id="carouselExample" className="carousel slide mb-8" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="/assets/banner1.jpg" className="d-block w-100" alt="Banner 1" />
          </div>
          <div className="carousel-item">
            <img src="/assets/banner2.jpg" className="d-block w-100" alt="Banner 2" />
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
            
      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-title">
          <h2>{t('danhMuc')}</h2>
        </div>
        
        <div className="categories-grid">
          {categories.map((category, index) => (
            <div 
              key={category.id} 
              className="category-item" 
              data-aos="zoom-in" 
              data-aos-delay={(index % 10) * 50}
              onClick={() => navigate(`/products?category=${category.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="category-icon">
                <FontAwesomeIcon icon={getCategoryIcon(category.TenDanhMuc)} />
              </div>
              <p>{category.TenDanhMuc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* New Products Section */}
      <section className="new-products-section ">
        <div className="section-title ">
          <h2>{t('sanPhamMoi')}</h2>
        </div>
        
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">{t('dangTai')}</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="row">
            {newProducts.map((product, index) => (
              <div key={product.id} className="col-md-3 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="card home-product-card h-100" onClick={() => handleProductClick(product.id)}>
                  <div className="product-image-container">
                    <img 
                      src={product.HinhAnh_URL} 
                      className="card-img-top product-image" 
                      alt={product.TenSanPham}
                    />
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title product-title">{product.TenSanPham}</h5>
                    
                    {product.MoTa && (
                      <p className="card-text product-description">
                        {product.MoTa.substring(0, 60)}...
                      </p>
                    )}
                    
                    <div className="product-details">
                      {product.TenHangSanXuat && (
                        <p className="card-text mb-1">
                          <strong>{t('hang')}</strong> {product.TenHangSanXuat}
                        </p>
                      )}
                      
                      {product.ChiTietThongSo && product.ChiTietThongSo.length > 0 && (
                        <p className="card-text mb-1">
                          <strong>{t('thongSo')}</strong> {product.ChiTietThongSo[0].TenThongSo}: {product.ChiTietThongSo[0].GiaTriThongSo}
                        </p>
                      )}
                    </div>
                    
                    <p className="card-text text-danger fw-bold mt-auto fs-5">
                      {Number(product.GiaBan).toLocaleString()} VND
                    </p>
                    
                    <div className="d-flex justify-content-between mt-2">
                      <button 
                        className="btn btn-primary buy-now-btn"
                        onClick={(e) => handleBuyNow(e, product.id)}
                      >
                        <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                        {t('muaNgay')}
                      </button>
                      <button 
                        className="btn btn-outline-secondary details-btn"
                        onClick={(e) => handleViewDetails(e, product.id)}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                        {t('chiTiet')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-4">
        <button 
          className="btn btn-outline-secondary btn-lg"
          onClick={() => navigate('/products')}
        >
          {t('xemTatCaSanPham')}
        </button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;