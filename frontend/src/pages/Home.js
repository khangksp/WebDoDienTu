import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMobile, faLaptop, faCamera, faClock, 
  faBlender, faFootballBall, faMotorcycle, faHome, faBook, faListAlt
} from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'aos/dist/aos.css';
import "./style/style.css";

function HomePage() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true
    });
  }, []);

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
          <h2>DANH MỤC</h2>
        </div>
        
        <div className="categories-grid">
          <div className="category-item" data-aos="zoom-in" data-aos-delay="50">
            <div className="category-icon">
              <FontAwesomeIcon icon={faMobile} />
            </div>
            <p>Điện Thoại & Phụ Kiện</p>
          </div>
          
          <div className="category-item" data-aos="zoom-in" data-aos-delay="100">
            <div className="category-icon">
              <FontAwesomeIcon icon={faListAlt} />
            </div>
            <p>Thiết Bị Điện Tử</p>
          </div>
          
          <div className="category-item" data-aos="zoom-in" data-aos-delay="150">
            <div className="category-icon">
              <FontAwesomeIcon icon={faLaptop} />
            </div>
            <p>Máy Tính & Laptop</p>
          </div>
          
          <div className="category-item" data-aos="zoom-in" data-aos-delay="200">
            <div className="category-icon">
              <FontAwesomeIcon icon={faCamera} />
            </div>
            <p>Máy Ảnh & Máy Quay Phim</p>
          </div>
          
          <div className="category-item" data-aos="zoom-in" data-aos-delay="250">
            <div className="category-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <p>Đồng Hồ</p>
          </div>
          
          <div className="category-item" data-aos="zoom-in" data-aos-delay="350">
            <div className="category-icon">
              <FontAwesomeIcon icon={faBlender} />
            </div>
            <p>Thiết Bị Điện Gia Dụng</p>
          </div>
          
          <div className="category-item" data-aos="zoom-in" data-aos-delay="400">
            <div className="category-icon">
              <FontAwesomeIcon icon={faFootballBall} />
            </div>
            <p>Thể Thao & Du Lịch</p>
          </div>
          
          <div className="category-item" data-aos="zoom-in" data-aos-delay="450">
            <div className="category-icon">
              <FontAwesomeIcon icon={faMotorcycle} />
            </div>
            <p>Ô Tô & Xe Máy & Xe Đạp</p>
          </div>
          
          <div className="category-item" data-aos="zoom-in" data-aos-delay="600">
            <div className="category-icon">
              <FontAwesomeIcon icon={faHome} />
            </div>
            <p>Nhà Cửa & Đời Sống</p>
          </div>
          
          <div className="category-item" data-aos="zoom-in" data-aos-delay="900">
            <div className="category-icon">
              <FontAwesomeIcon icon={faBook} />
            </div>
            <p>Bách Hóa Online</p>
          </div>
        </div>
      </section>
      
      {/* Other sections could go here */}



      {/* New Products Section */}
      <section className="new-products-section">
        <div className="section-title">
          <h2>SẢN PHẨM MỚI</h2>
        </div>
        <div className="products-grid">
          {/* Product 1 */}
          <div className="product-card" data-aos="fade-up">
            <div className="product-info">
              <h3>Casio Bluetooth Wireless Over Ear Headphones With Mic Playback</h3>
              <p className="price-label">Giá</p>
              <p className="price">100,000 VNĐ</p>
            </div>
            <div className="product-image">
              <img src="\assets\camera.jpg" alt="Camera" />
            </div>
          </div>
          
          {/* Product 2 */}
          <div className="product-card" data-aos="fade-up" data-aos-delay="100">
            <div className="product-info">
              <h3>Loa Bluetooth Marshall Emberton</h3>
              <p className="price-label">Giá</p>
              <p className="price">2,500,000 VNĐ</p>
            </div>
            <div className="product-image">
              <img src="\assets\loa.jpg" alt="Bluetooth Speaker" />
            </div>
          </div>
          
          {/* Product 3 */}
          <div className="product-card" data-aos="fade-up" data-aos-delay="200">
            <div className="product-info">
              <h3>Thiết bị điện máy gia dụng Máy sấy tóc LG - PC ASUS G540M</h3>
              <p className="price-label">Giá</p>
              <p className="price">7,000,000 VNĐ</p>
            </div>
            <div className="product-image">
              <img src="\assets\taycam.jpg" alt="Controller" />
            </div>
          </div>
          
          {/* Product 4 */}
          <div className="product-card" data-aos="fade-up" data-aos-delay="300">
            <div className="product-info">
              <h3>Đồng Hồ Thông Minh Gắn Vị Trí Cho Em, Chống Nước, Số Đo Sức Khỏe Thông Minh</h3>
              <p className="price-label">Giá</p>
              <p className="price">399,000 VNĐ</p>
            </div>
            <div className="product-image">
              <img src="\assets\headphone.png" alt="Headphone" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;