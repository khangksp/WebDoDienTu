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

import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";


function Detail() {
  const { t } = useLanguage();

  // Xử lý khi thêm vào giỏ hàng
  const { addToCart } = useCart();


  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('id');
  
  // State variables for product details
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);

  // Thêm states cho slider sản phẩm ngẫu nhiên
  const [randomProducts, setRandomProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const productsPerSlide = 4;
  

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      // Chuẩn bị dữ liệu sản phẩm
      const productData = {
        id: product.id,
        TenSanPham: product.TenSanPham || product.name,
        GiaBan: product.GiaBan || product.price,
        HinhAnh_URL: product.HinhAnh_URL || product.image_url,
        quantity: quantity,
        category: product.TenDanhMuc || product.category_name,
        selectedColor: 'default', // Nếu có thể chọn màu
        size: 'Standard' // Nếu có thể chọn kích thước
      };
      
      // Gọi hàm addToCart từ context
      await addToCart(productData, quantity);
      
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng.');
    }
  };

  // Fetch product data based on ID
  useEffect(() => {
    if (!productId) {
      setError("Không tìm thấy ID sản phẩm");
      setLoading(false);
      return;
    }

    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/products/san-pham/${productId}/`);
        setProduct(response.data);
        
        // Sau khi lấy sản phẩm, lấy danh sách sản phẩm khác để hiển thị trong phần liên quan
        const allProductsResponse = await axios.get(`http://localhost:8000/api/products/san-pham/`);
        
        // Lọc sản phẩm liên quan (cùng danh mục nhưng khác ID)
        const related = allProductsResponse.data.filter(p => 
          p.DanhMuc === response.data.DanhMuc && p.id !== response.data.id
        );
        setRelatedProducts(related.slice(0, 4)); // Lấy tối đa 4 sản phẩm liên quan
        
        // Lấy các sản phẩm ngẫu nhiên cho slider
        const otherProducts = allProductsResponse.data.filter(p => p.id !== response.data.id);
        // Ngẫu nhiên hóa mảng sản phẩm
        const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
        const randomProductsData = shuffled.slice(0, 12); // Lấy 12 sản phẩm ngẫu nhiên
        setRandomProducts(randomProductsData);
        
        // Cập nhật tổng số trang
        setTotalSlides(Math.ceil(randomProductsData.length / productsPerSlide));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product data:', error);
        setError("Không thể tải thông tin sản phẩm");
        setLoading(false);
      }
    };
  
    fetchProductData();
  }, [productId, productsPerSlide]);


  // Xử lý khi chọn sản phẩm liên quan
  const handleRelatedProductClick = (relatedProductId) => {
    navigate(`/detail?id=${relatedProductId}`);
  };

  // Xử lý điều hướng slider
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Render hiển thị đánh giá sao
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // Làm tròn đến 0.5
    
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

  // Giả lập dữ liệu đánh giá
  const mockRating = {
    average: 4.5,
    counts: [150, 30, 10, 5, 5]
  };

  // Tính phần trăm cho thanh tiến trình đánh giá
  const calculatePercentage = (count) => {
    const total = mockRating.counts.reduce((acc, curr) => acc + curr, 0);
    return (count / total) * 100;
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
          {error || "Không tìm thấy sản phẩm"}
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="container mt-4">
        <div className="row">
          {/* Product Images Section */}
          <div className="col-md-6 mb-4">
            <div className="product-image-gallery">
              <div className="main-image">
                <img 
                  src={product.HinhAnh_URL || product.image_url} 
                  alt={product.TenSanPham || product.name} 
                  className="img-fluid rounded shadow"
                />
              </div>
              {/* Nếu có nhiều ảnh, có thể hiển thị thêm ở đây */}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="col-md-6">
            <div className="product-info p-3">
              <h1 className="product-title mb-3">{product.TenSanPham || product.name}</h1>
              
              {/* Thẻ thông tin sản phẩm */}
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
                {/* Kiểm tra và hiển thị thông số */}
                {(product.ChiTietThongSo && product.ChiTietThongSo.length > 0) && (
                  <div className="feature-badge me-3 mb-2">
                    <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                    <span>{product.ChiTietThongSo[0].TenThongSo}: {product.ChiTietThongSo[0].GiaTriThongSo}</span>
                  </div>
                )}
                {/* Hiển thị thông số cũ nếu có */}
                {(!product.ChiTietThongSo && product.thong_so_name) && (
                  <div className="feature-badge me-3 mb-2">
                    <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                    <span>{product.thong_so_name}</span>
                  </div>
                )}
              </div>
              
              {/* Đánh giá sản phẩm */}
              <div className="product-rating mb-3">
                {renderStars(mockRating.average)}
                <span className="ms-2">({mockRating.counts.reduce((a, b) => a + b, 0)} {t('danhGia')})</span>
              </div>
              
              {/* Price Section */}
              <div className="product-price mb-3">
                <h5 className="mb-1 text-muted">{t('gia')}</h5>
                <h3 className="price">{Number(product.GiaBan || product.price).toLocaleString()} VNĐ</h3>
              </div>
              
              {/* Description - Fixed version */}
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
              
              {/* Quantity Selection */}
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
              
              {/* Add to Cart Button */}
              <div className="add-to-cart-section">
              <button 
                className="btn-add-to-cart" 
                onClick={handleAddToCart}
                disabled={(product.SoLuongTon || product.stock) <= 0}
              >
                <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                {(product.SoLuongTon || product.stock) > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Ratings Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="ratings-section p-4 border rounded">
              <h3 className="mb-4">{t('danhGiaSanPham')}</h3>
              
              <div className="row">
                {/* Overall Rating */}
                <div className="col-md-3 text-center">
                  <div className="overall-rating">
                    <div className="rating-circle">
                      <span className="rating-number">{mockRating.average}</span>
                      <FontAwesomeIcon icon={fasStar} className="rating-star" />
                    </div>
                    <p className="mt-2">{mockRating.counts.reduce((a, b) => a + b, 0)} {t('danhGia')}</p>
                  </div>
                </div>
                
                {/* Rating Breakdown */}
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
                            style={{ width: `${calculatePercentage(mockRating.counts[5-star])}%` }}
                            aria-valuenow={calculatePercentage(mockRating.counts[5-star])}
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <span className="ms-2">{mockRating.counts[5-star]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products Section */}
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
        
        {/* Random Products Slider */}
        {randomProducts.length > 0 && (
          <div className="random-products-slider mt-5 mb-5">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3>Sản phẩm khác</h3>
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
                      aria-label={`Trang ${index + 1}`}
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