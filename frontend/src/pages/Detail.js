import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, faStar as fasStar, faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style/detail.css';

function Detail() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('id');
  
  // State variables for product details
  // BACKEND INTEGRATION POINT 1: Replace this initial state with data from your API
  const [product, setProduct] = useState({
    id: 1,
    name: 'Croma Bluetooth Wireless Over Ear Headphones With Mic Playback',
    price: '100,000 VNĐ',
    rating: 4.5,
    ratingCounts: [150, 30, 10, 25, 10], // Counts for 5, 4, 3, 2, 1 stars
    description: 'Mở tất cả các thiết bị tương thích với Kết nối đơn giản qua Bluetooth 5.2, hỗ trợ Google Fast Pair và Microsoft Swift Pair',
    features: {
      'Nghe 50h': true,
      'Sạc 3h': true,
      'Bluetooth 5.2': true,
      'Cổng sạc Type C': true,
    },
    availableSizes: ['S', 'M', 'L', 'XL'],
    availableColors: ['#e0e0e0', '#f5f5dc', '#000000'],
    images: [
      '/assets/headphone.png',
      '/assets/Loa-marshall-Emberton-1-600x600-1.png',
      '/assets/headphone.png',
    ],
    relatedProducts: [
      {
        id: 2,
        name: 'Croma Bluetooth Wireless Over Ear Headphones With Mic Playback',
        price: '100,000 VNĐ',
        image: '/assets/camera.jpg'
      },
      {
        id: 3,
        name: 'Loa Bluetooth Marshall Emberton',
        price: '2,800,000 VNĐ',
        image: '/assets/loa.jpg'
      },
      {
        id: 4,
        name: 'Đồng Hồ Thông Minh Gắn Vị Trí Cho Em, Chống Nước, Số Đo Sức Khỏe',
        price: '799,000 VNĐ',
        image: '/assets/dong-ho-thong-minh-dinh-vi-y31-3-1.jpg'
      },
      {
        id: 5,
        name: 'Tai nghe dây chất lượng cao chống ồn ANC2 ODANTIC G10sMk2',
        price: '1,350,000 VNĐ',
        image: '/assets/headphone.png'
      }
    ]
  });

  // State for selected image, size, and color
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('#e0e0e0');
  const [quantity, setQuantity] = useState(1);

  // BACKEND INTEGRATION POINT 2: Fetch product data based on ID
  useEffect(() => {
    // If no productId is found, you might want to redirect or show an error
    if (!productId) {
      console.error('No product ID found in URL');
      return;
    }
    
    // Fetch product data
    const fetchProductData = async () => {
      try {
        // UNCOMMENT AND MODIFY THIS CODE TO CONNECT TO YOUR BACKEND
        // const response = await fetch(`/api/products/${productId}`);
        // if (!response.ok) {
        //   throw new Error('Failed to fetch product data');
        // }
        // const data = await response.json();
        // setProduct(data);
        
        // For now, we're using mock data based on ID
        console.log(`Fetching data for product ID: ${productId}`);
        // You might simulate different products based on ID here
      } catch (error) {
        console.error('Error fetching product data:', error);
        // You might want to show an error message to the user here
      }
    };

    fetchProductData();
  }, [productId]);

  // BACKEND INTEGRATION POINT 3: Handle adding to cart
  const addToCart = async () => {
    try {
      // UNCOMMENT AND MODIFY THIS CODE TO CONNECT TO YOUR BACKEND
      // const response = await fetch('/api/cart/add', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     productId: product.id,
      //     quantity,
      //     color: selectedColor,
      //     size: selectedSize
      //   })
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to add item to cart');
      // }
      
      // For now, just logging to console
      console.log('Adding to cart:', {
        productId: product.id,
        quantity,
        color: selectedColor,
        size: selectedSize
      });
      
      alert('Thêm vào giỏ hàng thành công!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng.');
    }
  };

  // BACKEND INTEGRATION POINT 4: Handle related product click
  const handleRelatedProductClick = (relatedProductId) => {
    // Navigate to the related product's detail page
    window.location.href = `/detail?id=${relatedProductId}`;
  };

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i} 
          icon={i <= rating ? fasStar : farStar} 
          className="star-icon" 
        />
      );
    }
    return stars;
  };

  // Calculate rating percentage for progress bars
  const calculatePercentage = (count) => {
    const total = product.ratingCounts.reduce((acc, curr) => acc + curr, 0);
    return (count / total) * 100;
  };

  return (
    <div className="product-detail-container">
      <div className="container mt-4">
        <div className="row">
          {/* Product Images Section */}
          <div className="col-md-6 mb-4">
            <div className="product-image-gallery">
              <div className="main-image">
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className="img-fluid rounded shadow"
                />
              </div>
              <div className="thumbnail-container mt-3">
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="img-fluid" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="col-md-6">
            <div className="product-info p-3">
              <h1 className="product-title mb-3">{product.name}</h1>
              
              {/* Product Features Section */}
              <div className="product-features d-flex flex-wrap mb-3">
                {Object.entries(product.features).map(([feature, value], index) => (
                  value && (
                    <div key={index} className="feature-badge me-3 mb-2">
                      <span>{feature}</span>
                    </div>
                  )
                ))}
              </div>

              {/* Bluetooth version badge */}
              <div className="bluetooth-badge mb-3">
                <FontAwesomeIcon icon={['fab', 'bluetooth-b']} className="me-1" />
                Bluetooth 5.2
              </div>
              
              {/* Price Section */}
              <div className="product-price mb-3">
                <h5 className="mb-1 text-muted">Giá:</h5>
                <h3 className="price">{product.price}</h3>
              </div>
              
              {/* Description */}
              <div className="product-description mb-3">
                <p>{product.description}</p>
              </div>
              
              {/* Color Selection */}
              <div className="product-colors mb-4">
                <h5 className="mb-2">3 màu</h5>
                <div className="color-options">
                  {product.availableColors.map((color, index) => (
                    <div 
                      key={index} 
                      className={`color-option ${selectedColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Size Selection */}
              <div className="product-sizes mb-4">
                <h5 className="mb-2">Kích cỡ:</h5>
                <div className="size-options">
                  {product.availableSizes.map((size, index) => (
                    <button 
                      key={index} 
                      className={`size-option ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Quantity Selection - BACKEND INTEGRATION POINT 5 */}
              <div className="quantity-selection mb-4">
                <h5 className="mb-2">Số lượng:</h5>
                <div className="quantity-controls d-flex align-items-center">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="mx-3">{quantity}</span>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <div className="add-to-cart-section">
                <button className="btn-add-to-cart" onClick={addToCart}>
                  <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Ratings Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="ratings-section p-4 border rounded">
              <h3 className="mb-4">Đánh giá sản phẩm:</h3>
              
              <div className="row">
                {/* Overall Rating */}
                <div className="col-md-3 text-center">
                  <div className="overall-rating">
                    <div className="rating-circle">
                      <span className="rating-number">{product.rating}</span>
                      <FontAwesomeIcon icon={fasStar} className="rating-star" />
                    </div>
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
                            style={{ width: `${calculatePercentage(product.ratingCounts[5-star])}%` }}
                            aria-valuenow={calculatePercentage(product.ratingCounts[5-star])}
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products Section */}
        <div className="related-products mt-5">
          <h3 className="mb-4">Sản phẩm liên quan</h3>
          <div className="row">
            {product.relatedProducts.map((relatedProduct, index) => (
              <div key={index} className="col-md-3 mb-4">
                <div 
                  className="related-product-card p-3 border rounded"
                  onClick={() => handleRelatedProductClick(relatedProduct.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="related-product-image mb-3">
                    <img src={relatedProduct.image} alt={relatedProduct.name} className="img-fluid" />
                  </div>
                  <div className="related-product-info">
                    <h5 className="related-product-title mb-2">{relatedProduct.name}</h5>
                    <p className="related-product-price">{relatedProduct.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detail;