import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faInfoCircle, faFilter } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'aos/dist/aos.css';
import { API_URL } from "./config";
const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    // Khởi tạo hiệu ứng AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
        });
    }, []);

    // Fetch danh mục sản phẩm
    useEffect(() => {
        axios.get(`${API_URL}:8002/api/products/categories/`)
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error("Lỗi khi tải danh mục:", error);
            });
    }, []);

    // Fetch sản phẩm
    useEffect(() => {
        let url = `${API_URL}:8002/api/products/products/`;
        
        // Nếu có category được chọn, thêm filter
        if (selectedCategory) {
            url += `?category=${selectedCategory}`;
        }
        
        setLoading(true);
        axios.get(url)
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
    }, [selectedCategory]);

    // Xử lý khi chọn danh mục
    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    };

    // Xử lý khi click vào sản phẩm
    const handleProductClick = (productId) => {
        navigate(`/detail?id=${productId}`);
    };

    // Xử lý khi click vào nút mua ngay
    const handleBuyNow = (e, productId) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click lan tỏa tới thẻ cha
        // Có thể điều hướng đến trang thanh toán hoặc thêm vào giỏ hàng
        console.log(`Mua ngay sản phẩm ID: ${productId}`);
        // Ví dụ: navigate(`/checkout?product=${productId}`);
    };

    // Xử lý khi click vào nút chi tiết
    const handleViewDetails = (e, productId) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click lan tỏa tới thẻ cha
        navigate(`/detail?id=${productId}`);
    };

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4" data-aos="fade-down">Danh sách sản phẩm</h1>
            
            {/* Danh mục sản phẩm */}
            <div className="mb-4" data-aos="fade-up">
                <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    <h5 className="mb-0">Danh mục sản phẩm</h5>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <button 
                        className={`btn ${selectedCategory === null ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        Tất cả
                    </button>
                    {categories.map(category => (
                        <button 
                            key={category.id} 
                            className={`btn ${selectedCategory === category.id ? 'btn-secondary' : 'btn-outline-secondary'}`}
                            onClick={() => handleCategoryClick(category.id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hiển thị sản phẩm */}
            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : products.length === 0 ? (
                <div className="alert alert-info">Không có sản phẩm nào</div>
            ) : (
                <div className="row">
                    {products.map((product, index) => (
                        <div key={product.id} className="col-lg-3 col-md-6 mb-4" data-aos="zoom-in" data-aos-delay={index * 100}>
                            <div 
                                className="card shadow-sm h-100 product-card" 
                                onClick={() => handleProductClick(product.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                {product.image_url && (
                                    <div className="product-image-container">
                                        <img 
                                            src={product.image_url} 
                                            className="card-img-top product-image" 
                                            alt={product.name}
                                        />
                                    </div>
                                )}
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title product-title">{product.name}</h5>
                                    <div className="product-description mb-2">
                                        <p className="card-text">{product.description.substring(0, 60)}...</p>
                                    </div>
                                    <div className="product-details">
                                        <p className="card-text mb-1">
                                            <strong>Hãng:</strong> {product.hang_san_xuat_name || "N/A"}
                                        </p>
                                        <p className="card-text mb-1">
                                            <strong>Thông số:</strong> {product.thong_so_name || "N/A"}
                                        </p>
                                    </div>
                                    <p className="card-text text-danger fw-bold mt-auto fs-5">
                                        {Number(product.price).toLocaleString()} VND
                                    </p>
                                    <div className="d-flex justify-content-between mt-2">
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={(e) => handleBuyNow(e, product.id)}
                                        >
                                            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                                            Mua ngay
                                        </button>
                                        <button 
                                            className="btn btn-outline-secondary"
                                            onClick={(e) => handleViewDetails(e, product.id)}
                                        >
                                            <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                            Chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Thêm CSS cho các hiệu ứng và bố cục
const styles = `
<style>
    .product-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border-radius: 8px;
        overflow: hidden;
    }
    
    .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    
    .product-image-container {
        height: 200px;
        overflow: hidden;
    }
    
    .product-image {
        height: 100%;
        width: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
    }
    
    .product-card:hover .product-image {
        transform: scale(1.05);
    }
    
    .product-title {
        font-weight: 600;
        height: auto;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
    
    .product-description {
        height: 48px;
        overflow: hidden;
        color: #6c757d;
    }
    
    .product-details {
        font-size: 0.9rem;
        color: #495057;
    }
    
    .btn {
        transition: all 0.3s ease;
    }
    
    .btn-secondary {
        background-color: #757575;
        border-color: #757575;
    }
    
    .btn-secondary:hover {
        background-color:rgb(98, 98, 98);
        border-color: rgb(98, 98, 98);
    }
</style>
`;

export default () => (
    <>
        <div dangerouslySetInnerHTML={{ __html: styles }} />
        <Products />
    </>
);