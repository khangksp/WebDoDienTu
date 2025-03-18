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
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const location = useLocation(); // Xác định đường dẫn hiện tại

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

  useEffect(() => {
    // Tìm tab đang active và cập nhật indicator
    const activeTab = document.querySelector(".nav-link.active");
    if (activeTab) {
      setIndicatorStyle({
        left: `${activeTab.offsetLeft}px`,
        width: `${activeTab.offsetWidth}px`,
      });
    }
  }, [location.pathname]); // Chạy lại khi đường dẫn thay đổi

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src="/assets/logO.png" alt="Logo" className="logo" />
        </Link>
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
          {/* Thanh gạch dưới */}
          <div className="indicator" style={indicatorStyle}></div>
        </div>

        {/* Icon tìm kiếm, tài khoản, giỏ hàng */}
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faSearch} className="nav-icon" />
          <FontAwesomeIcon icon={faUser} className="nav-icon" />
          <Link className="nav-link" to="/cart">
            <FontAwesomeIcon icon={faCartShopping} className="nav-icon" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
