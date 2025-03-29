import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faUser, faSearch } from "@fortawesome/free-solid-svg-icons";

import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [isToggled, setIsToggled] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const location = useLocation();

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

  return (
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
            <Link className="nav-link me-3" to="/user">
              <FontAwesomeIcon icon={faUser} className="nav-icon d-inline d-lg-none" />
              <span className="d-none d-lg-inline ms-1">Tài khoản</span>
            </Link>
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

          <div className="dropdown ms-3">
            <Link className="nav-link dropdown-toggle d-flex align-items-center" id="userDropdown" data-bs-toggle="dropdown">
              <FontAwesomeIcon icon={faUser} className="nav-icon me-1" />
              <span>Tài khoản</span>
            </Link>
            <ul className="dropdown-menu" aria-labelledby="userDropdown">
              {isAuthenticated ? (
                <>
                  <li><span className="dropdown-item">Xin chào, {username}</span></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="#">Đăng xuất</a></li>
                </>
              ) : (
                <li><a className="dropdown-item" href="#">Đăng nhập</a></li>
              )}
            </ul>
          </div>

          <Link className="nav-link ms-3 d-flex align-items-center" to="/cart">
            <FontAwesomeIcon icon={faCartShopping} className="nav-icon me-1" />
            <span>Giỏ hàng</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;