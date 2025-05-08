import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, faStar as fasStar, faChevronLeft, faChevronRight,
  faTags, faBoxOpen, faExchangeAlt, faMinus, faPlus
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style/detail.css';

import { API_BASE_URL } from '../config';
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";

function Detail() {
  const { t } = useLanguage();
  const { addToCart } = useCart();

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('id');
  
  // State variables for product details
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [ratingData, setRatingData] = useState(null); // State cho dữ liệu đánh giá ngẫu nhiên

  const productsPerSlide = 4;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hàm tạo đánh giá ngẫu nhiên
  const generateRandomRating = () => {
    // Sinh điểm trung bình từ 3.5 đến 5.0
    const average = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5 đến 5.0, làm tròn 1 chữ số thập phân
    // Sinh tổng số đánh giá từ 50 đến 500
    const totalReviews = Math.floor(Math.random() * 451) + 50; // 50 đến 500

    // Phân phối số lượng đánh giá (ưu tiên 4-5 sao)
    const counts = [0, 0, 0, 0, 0]; // [1 sao, 2 sao, 3 sao, 4 sao, 5 sao]
    const weights = [0.05, 0.1, 0.15, 0.3, 0.4]; // Tỷ lệ: 5% 1 sao, 10% 2 sao, 15% 3 sao, 30% 4 sao, 40% 5 sao
    let remaining = totalReviews;

    for (let i = 4; i >= 0; i--) {
      if (i === 0) {
        counts[i] = remaining; // Đổ tất cả số còn lại vào 1 sao
      } else {
        const count = Math.floor(totalReviews * weights[i] * (0.8 + Math.random() * 0.4)); // Biến thiên ±20%
        counts[i] = Math.min(count, remaining);
        remaining -= counts[i];
      }
    }

    return {
      average: parseFloat(average),
      counts: counts.reverse(), // Đảo ngược để khớp với hiển thị (5 sao, 4 sao, ..., 1 sao)
    };
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      const productData = {
        id: product.id,
        TenSanPham: product.TenSanPham || product.name,
        GiaBan: product.GiaBan || product.price,
        HinhAnh_URL: product.HinhAnh_URL || product.image_url,
        quantity: quantity,
        category: product.TenDanhMuc || product.category_name,
        selectedColor: 'default',
        size: 'Standard'
      };
      
      await addToCart(productData, quantity);
      alert(t('daThemVaoGioHang'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(t('loiThemVaoGioHang'));
    }
  };

  // Fetch product data and generate random rating
  useEffect(() => {
    if (!productId) {
      setError(t('khongTimThayIDSanPham'));
      setLoading(false);
      return;
    }

    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/products/san-pham/${productId}/`);
        setProduct(response.data);
        
        // Tạo đánh giá ngẫu nhiên cho sản phẩm
        setRatingData(generateRandomRating());

        // Lấy danh sách sản phẩm khác
        const allProductsResponse = await axios.get(`${API_BASE_URL}/products/san-pham/`);
        
        // Sản phẩm liên quan
        const related = allProductsResponse.data.filter(p => 
          p.DanhMuc === response.data.DanhMuc && p.id !== response.data.id
        );
        setRelatedProducts(related.slice(0, 4));
        
        // Sản phẩm ngẫu nhiên cho slider
        const otherProducts = allProductsResponse.data.filter(p => p.id !== response.data.id);
        const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
        const randomProductsData = shuffled.slice(0, 12);
        setRandomProducts(randomProductsData);
        setTotalSlides(Math.ceil(randomProductsData.length / productsPerSlide));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product data:', error);
        setError(t('khongTheTaiThongTinSanPham'));
        setLoading(false);
      }
    };
  
    fetchProductData();
  }, [productId, productsPerSlide, t]);

  const handleRelatedProductClick = (relatedProductId) => {
    navigate(`/detail?id=${relatedProductId}`);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i} 
          icon={i <= roundedRating ? fasStar : farStar} 
          className="star-icon" 
        />
      );
    }
    return stars;
  };

  const calculatePercentage = (count) => {
    if (!ratingData) return 0;
    const total = ratingData.counts.reduce((acc, curr) => acc + curr, 0);
    return total ? (count / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('dangTai')}</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          {error || t('khongTimThaySanPham')}
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="product-image-gallery">
              <div className="main-image">
                <img 
                  src={product.HinhAnh_URL || product.image_url} 
                  alt={product.TenSanPham || product.name} 
                  className="img-fluid rounded shadow"
                />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="product-info p-3">
              <h1 className="product-title mb-3">{product.TenSanPham || product.name}</h1>
              
              <div className="product-features d-flex flex-wrap mb-3">
                {(product.TenDanhMuc || product.category_name) && (
                  <div className="feature-badge me-3 mb-2">
                    <FontAwesomeIcon icon={faTags} className="me-1" />
                    <span>{product.TenDanhMuc || product.category_name}</span>
                  </div>
                )}
                {(product.TenHangSanXuat || product.hang_san_xuat_name) && (
                  <div className="feature-badge me-3 mb-2">
                    <FontAwesomeIcon icon={faBoxOpen} className="me-1" />
                    <span>{product.TenHangSanXuat || product.hang_san_xuat_name}</span>
                  </div>
                )}
                {(product.ChiTietThongSo && product.ChiTietThongSo.length > 0) && (
                  <div className="feature-badge me-3 mb-2">
                    <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                    <span>{product.ChiTietThongSo[0].TenThongSo}: {product.ChiTietThongSo[0].GiaTriThongSo}</span>
                  </div>
                )}
                {(!product.ChiTietThongSo && product.thong_so_name) && (
                  <div className="feature-badge me-3 mb-2">
                    <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                    <span>{product.thong_so_name}</span>
                  </div>
                )}
              </div>
              
              <div className="product-rating mb-3">
                {ratingData && renderStars(ratingData.average)}
                <span className="ms-2">
                  ({ratingData ? ratingData.counts.reduce((a, b) => a + b, 0) : 0} {t('danhGia')})
                </span>
              </div>
              
              <div className="product-price mb-3">
                <h5 className="mb-1 text-muted">{t('gia')}</h5>
                <h3 className="price">{Number(product.GiaBan || product.price).toLocaleString()} VNĐ</h3>
              </div>
              
              <div className="product-description mb-3">
                <h5 className="mb-1 text-muted">{t('moTaSanPham')}</h5>
                {(product.MoTa || product.description) ? (
                  <div className="description-content">
                    {product.MoTa || product.description}
                  </div>
                ) : (
                  <p className="text-muted">{t('koCoMoTa')}</p>
                )}
              </div>
              
              <div className="quantity-selection mb-4">
                <h5 className="mb-2">{t('soLuong')}</h5>
                <div className="quantity-controls d-flex align-items-center">
                  <button 
                    className="btn btn-outline-secondary quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span className="mx-3 quantity-value">{quantity}</span>
                  <button 
                    className="btn btn-outline-secondary quantity-btn"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= (product.SoLuongTon || product.stock)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
                <p className="mt-2 text-muted">{t('con')} {product.SoLuongTon || product.stock} {t('sp')}</p>
              </div>
              
              <div className="add-to-cart-section">
                <button 
                  className="btn-add-to-cart" 
                  onClick={handleAddToCart}
                  disabled={(product.SoLuongTon || product.stock) <= 0}
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                  {(product.SoLuongTon || product.stock) > 0 ? t('themVaoGioHang') : t('hetHang')}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row mt-5">
          <div className="col-12">
            <div className="ratings-section p-4 border rounded">
              <h3 className="mb-4">{t('danhGiaSanPham')}</h3>
              
              <div className="row">
                <div className="col-md-3 text-center">
                  <div className="overall-rating">
                    <div className="rating-circle">
                      <span className="rating-number">{ratingData ? ratingData.average : '0'}</span>
                      <FontAwesomeIcon icon={fasStar} className="rating-star" />
                    </div>
                    <p className="mt-2">
                      {ratingData ? ratingData.counts.reduce((a, b) => a + b, 0) : 0} {t('danhGia')}
                    </p>
                  </div>
                </div>
                
                <div className="col-md-9">
                  <div className="rating-bars">
                    {[5, 4, 3, 2, 1].map((star, index) => (
                      <div key={index} className="rating-bar-item d-flex align-items-center mb-2">
                        <span className="star-label me-2">
                          {star} <FontAwesomeIcon icon={fasStar} className="star-icon-small" />
                        </span>
                        <div className="progress flex-grow-1">
                          <div 
                            className="progress-bar bg-warning" 
                            role="progressbar" 
                            style={{ width: `${ratingData ? calculatePercentage(ratingData.counts[5-star]) : 0}%` }}
                            aria-valuenow={ratingData ? calculatePercentage(ratingData.counts[5-star]) : 0}
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <span className="ms-2">{ratingData ? ratingData.counts[5-star] : 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {relatedProducts.length > 0 && (
          <div className="related-products mt-5">
            <h3 className="mb-4">{t('sanPhamLienQuan')}</h3>
            <div className="row">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="col-md-3 mb-4">
                  <div 
                    className="related-product-card p-3 border rounded"
                    onClick={() => handleRelatedProductClick(relatedProduct.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="related-product-image mb-3">
                      <img 
                        src={relatedProduct.HinhAnh_URL || relatedProduct.image_url} 
                        alt={relatedProduct.TenSanPham || relatedProduct.name} 
                        className="img-fluid" 
                      />
                    </div>
                    <div className="related-product-info">
                      <h5 className="related-product-title mb-2">
                        {relatedProduct.TenSanPham || relatedProduct.name}
                      </h5>
                      <p className="related-product-price">
                        {Number(relatedProduct.GiaBan || relatedProduct.price).toLocaleString()} VNĐ
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {randomProducts.length > 0 && (
          <div className="random-products-slider mt-5 mb-5">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3>{t('sanPhamKhac')}</h3>
              <div className="slider-controls">
                <button 
                  className="btn btn-outline-secondary slider-control-btn me-2" 
                  onClick={prevSlide}
                  disabled={totalSlides <= 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button 
                  className="btn btn-outline-secondary slider-control-btn" 
                  onClick={nextSlide}
                  disabled={totalSlides <= 1}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
            
            <div className="random-products-container">
              <div className="row">
                {randomProducts.slice(
                  currentSlide * productsPerSlide, 
                  (currentSlide + 1) * productsPerSlide
                ).map((randomProduct) => (
                  <div key={randomProduct.id} className="col-md-3 mb-3">
                    <div 
                      className="random-product-card p-3 border rounded h-100"
                      onClick={() => handleRelatedProductClick(randomProduct.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="random-product-image mb-3">
                        <img 
                          src={randomProduct.HinhAnh_URL || randomProduct.image_url} 
                          alt={randomProduct.TenSanPham || randomProduct.name} 
                          className="img-fluid" 
                        />
                      </div>
                      <div className="random-product-info">
                        <h5 className="random-product-title mb-2">
                          {randomProduct.TenSanPham || randomProduct.name}
                        </h5>
                        <p className="random-product-price">
                          {Number(randomProduct.GiaBan || randomProduct.price).toLocaleString()} VNĐ
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {totalSlides > 1 && (
                <div className="slider-indicators text-center mt-3">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button 
                      key={index}
                      className={`slider-indicator ${currentSlide === index ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={t('trang', { page: index + 1 })}
                    ></button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Detail;