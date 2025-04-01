import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faUser, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faGoogle } from "@fortawesome/free-brands-svg-icons";


import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [isToggled, setIsToggled] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/check-login/", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        setIsAuthenticated(data.isAuthenticated);
        if (data.isAuthenticated) {
          setUsername(data.username);
        }
      })
      .catch((error) => console.error("Lỗi API:", error));
  }, []);

  // Effect for animating the indicator
  useEffect(() => {
    const activeTab = document.querySelector(".nav-link.active");
    if (activeTab) {
      setIndicatorStyle({
        left: `${activeTab.offsetLeft}px`,
        width: `${activeTab.offsetWidth}px`,
      });
    }
  }, [location.pathname]);

  // Handle resize to determine if it's mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        // Close mobile menu when resizing to desktop
        setIsToggled(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowLoginModal(false);
      }
    };

    if (showLoginModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLoginModal]);

  // Handle account button click
  const handleAccountClick = (e) => {
    if (isMobile) {
      navigate("/login");
    } else {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand" to="/">
            <img src="/assets/logO.png" alt="Logo" className="logo" />
          </Link>

          {/* Toggler button */}
          <button
            className={`navbar-toggler ${isToggled ? "" : "collapsed"}`}
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded={isToggled}
            aria-label="Toggle navigation"
            onClick={() => setIsToggled(!isToggled)}
          >
            <span className="toggler-icon top-bar"></span>
            <span className="toggler-icon middle-bar"></span>
            <span className="toggler-icon bottom-bar"></span>
          </button>

          {/* Navbar items */}
          <div className={`collapse navbar-collapse ${isToggled ? "show" : ""}`} id="navbarNav">
            
            {/* Thanh tìm kiếm khi thu nhỏ màn hình */}
            <div className="d-lg-none mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <input type="text" className="form-control" placeholder="Tìm kiếm sản phẩm ...." />
              </div>
            </div>

            {/* Menu chính */}
            <div className="navbar-nav mx-auto position-relative">
              <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">
                Trang chủ
              </Link>
              <Link className={`nav-link ${location.pathname === "/about" ? "active" : ""}`} to="/about">
                Giới thiệu
              </Link>
              <Link className={`nav-link ${location.pathname === "/products" ? "active" : ""}`} to="/products">
                Sản phẩm
              </Link>
              <Link className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`} to="/contact">
                Liên hệ
              </Link>
              <div className="indicator" style={indicatorStyle}></div>
            </div>

            {/* Icon User + Cart khi màn hình nhỏ */}
            <div className="d-lg-none d-flex justify-content-end">
              <a className="nav-link me-3" href="#" onClick={handleAccountClick}>
                <FontAwesomeIcon icon={faUser} className="nav-icon d-inline d-lg-none" />
                <span className="d-none d-lg-inline ms-1">Tài khoản</span>
              </a>
              <Link className="nav-link" to="/cart">
                <FontAwesomeIcon icon={faCartShopping} className="nav-icon d-inline d-lg-none" />
                <span className="d-none d-lg-inline ms-1">Giỏ hàng</span>
              </Link>
            </div>
          </div>

          {/* Thanh tìm kiếm + Icons khi màn hình lớn */}
          <div className="d-none d-lg-flex align-items-center">
            <div className="input-group search-container">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input type="text" className="form-control" placeholder="Tìm kiếm sản phẩm ...." />
            </div>

            <a className="nav-link ms-3 d-flex align-items-center" href="#" onClick={handleAccountClick}>
              <FontAwesomeIcon icon={faUser} className="nav-icon me-3"/>
              <span>Tài khoản</span>
            </a>

            <Link className="nav-link ms-3 d-flex align-items-center" to="/cart">
              <FontAwesomeIcon icon={faCartShopping} className="nav-icon me-1" />
              <span>Giỏ hàng</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal" ref={modalRef}>
            <div className="login-modal-header">
              <h4>Xin chào,</h4>
              <p>Đăng nhập hoặc Tạo tài khoản</p>
              <button className="close-button" onClick={() => setShowLoginModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              <div>
                <input type="text" placeholder="Số điện thoại" className="form-control" />
              </div>
              <button className="btn btn-primary w-100 mt-3">Tiếp Tục</button>
              <div className="text-center mt-3">
                <a href="#" className="text-decoration-none">Đăng nhập bằng email</a>
              </div>
              
              <div className="alternative-login mt-4">
                <p className="text-center">Hoặc tiếp tục bằng</p>
                <div className="social-buttons d-flex justify-content-center">
                  <button className="btn btn-outline-secondary me-2 facebook-btn">
                  <FontAwesomeIcon icon={faFacebookF} />
                  </button>
                  <button className="btn btn-outline-secondary google-btn">
                  <FontAwesomeIcon icon={faGoogle} />
                  </button>
                </div>
              </div>
              <div className="terms mt-4 text-center small">
                <p>Bằng việc tiếp tục, bạn đã đọc và đồng ý với <br></br><a href="#">điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật thông tin cá nhân</a></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;