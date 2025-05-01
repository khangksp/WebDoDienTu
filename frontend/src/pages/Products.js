import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faInfoCircle, faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'aos/dist/aos.css';

import { API_BASE_URL } from "../config";
import { useLanguage } from "../context/LanguageContext";

const Products = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Khởi tạo hiệu ứng AOS
    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
        });
    }, []);

    // Lấy tham số từ URL
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        
        // Lấy category từ URL nếu có
        const category = queryParams.get('category');
        if (category) {
            setSelectedCategory(parseInt(category));
        } else {
            setSelectedCategory(null); // Reset nếu không có category
        }
        
        // Lấy search term từ URL nếu có
        const search = queryParams.get('search');
        if (search) {
            setSearchTerm(search);
        } else {
            setSearchTerm(""); // Reset nếu không có tìm kiếm
        }
    }, [location.search]);

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
        let url = `${API_BASE_URL}/products/san-pham/`;
        
        const params = new URLSearchParams();
        
        // Nếu có category được chọn, thêm filter
        if (selectedCategory) {
            params.append('DanhMuc', selectedCategory);
        }
        
        // Nếu có từ khóa tìm kiếm, thêm filter
        if (searchTerm) {
            params.append('search', searchTerm);
        }
        
        // Nếu có tham số, thêm vào URL
        if (params.toString()) {
            url += `?${params.toString()}`;
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
    }, [selectedCategory, searchTerm]); // Chạy lại khi selectedCategory hoặc searchTerm thay đổi

    // Xử lý khi chọn danh mục
    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
        // Cập nhật URL khi chọn danh mục
        const params = new URLSearchParams(location.search);
        if (categoryId === selectedCategory) {
            params.delete('category');
        } else {
            params.set('category', categoryId);
        }
        navigate(`/products?${params.toString()}`);
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
            <h1 
                className="text-center mb-4 mt-auto" 
                style={{ 
                    marginTop: '100px', 
                    paddingTop: '75px', 
                    fontWeight: '700',
                    color: '#2c3e50',
                }}
            >
                {t('dsSanPham')}
            </h1>
            
            {/* Hiển thị từ khóa tìm kiếm nếu có */}
            {searchTerm && (
                <div className="alert alert-secondary mb-4">
                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                    {t('Kết quả tìm kiếm')}: "{searchTerm}" - {products.length} {t('Kết quả')}
                    <button 
                        className="btn btn-sm btn-outline-secondary ms-3"
                        onClick={() => {
                            setSearchTerm("");
                            const params = new URLSearchParams(location.search);
                            params.delete('search');
                            navigate(`/products?${params.toString()}`);
                        }}
                        >
                        {t('Xóa tim kiếm')}
                    </button>
                </div>
            )}
            
            {/* Danh mục sản phẩm */}
            <div className="mb-4" data-aos="fade-up">
                <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    <h1 className="mb-0">{t('dmSanPham')}</h1>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <button 
                        className={`btn ${selectedCategory === null ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => {
                            setSelectedCategory(null);
                            const params = new URLSearchParams(location.search);
                            params.delete('category');
                            navigate(`/products?${params.toString()}`);
                        }}
                    >
                        {t('tatCa')}
                    </button>
                    {categories.map(category => (
                        <button 
                            key={category.id} 
                            className={`btn ${selectedCategory === category.id ? 'btn-secondary' : 'btn-outline-secondary'}`}
                            onClick={() => handleCategoryClick(category.id)}
                        >
                            {category.TenDanhMuc}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hiển thị sản phẩm */}
            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden">{t('dangTai')}</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : products.length === 0 ? (
                <div className="alert alert-info">
                    {searchTerm 
                        ? t('khongTimThayKetQua').replace('{searchTerm}', searchTerm) 
                        : t('koCoSanPham')
                    }
                </div>
            ) : (
                <div className="row">
                    {products.map((product, index) => (
                        <div key={product.id} className="col-lg-3 col-md-6 mb-4" data-aos="zoom-in" data-aos-delay={index * 100}>
                            <div 
                                className="card shadow-sm h-100 product-card" 
                                onClick={() => handleProductClick(product.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                {product.HinhAnh_URL && (
                                    <div className="product-image-container">
                                        <img 
                                            src={product.HinhAnh_URL} 
                                            className="card-img-top product-image" 
                                            alt={product.TenSanPham}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/assets/placeholder.png'; // Ảnh dự phòng
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title product-title">{product.TenSanPham}</h5>
                                    <div className="product-description mb-2">
                                        <p className="card-text">
                                            {product.MoTa 
                                                ? (product.MoTa.substring(0, 60) + "...") 
                                                : t('khongCoMoTa')
                                            }
                                        </p>
                                    </div>
                                    <div className="product-details">
                                        <p className="card-text mb-1">
                                            <strong>{t('hang')}</strong> {product.TenHangSanXuat || "N/A"}
                                        </p>
                                        <p className="card-text mb-1">
                                            <strong>{t('thongSo')}</strong> {product.ChiTietThongSo?.length ? product.ChiTietThongSo[0].TenThongSo : "N/A"}
                                        </p>
                                    </div>
                                    <p className="card-text text-danger fw-bold mt-auto fs-5">
                                        {Number(product.GiaBan).toLocaleString()} VND
                                    </p>
                                    <div className="d-flex justify-content-between mt-2">
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={(e) => handleBuyNow(e, product.id)}
                                        >
                                            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                                            {t('muaNgay')}
                                        </button>
                                        <button 
                                            className="btn btn-outline-secondary"
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
        </div>
    );
};

// Thêm CSS cho các hiệu ứng và bố cục
const styles = `
<style>
    .btn {
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        color: #fff;
        cursor: pointer;
        transition: background-color 0.3s ease;
        width: auto; /* This replaces width: 100% */
    }

  .btn-outline-secondary {
    background-color: #e0e0e0; /* Light light gray */
    color: #6c757d;
    border: 1px solid #d0d0d0;
  }

  .btn-outline-secondary:hover {
    background-color: #d0d0d0;
    color: #6c757d;
  }    
</style>
`;

export default () => (
    <>
        <div dangerouslySetInnerHTML={{ __html: styles }} />
        <Products />
    </>
);