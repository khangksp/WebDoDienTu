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
  const [isToggled, setIsToggled] = useState(false);
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
      {/* Navbar toggler */}
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
      
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src="/assets/logO.png" alt="Logo" className="logo" />
        </Link>
        

        {/* Navbar items */}
        <div className={`collapse navbar-collapse ${isToggled ? "show" : ""}`} id="navbarNav">
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
        </div>

        {/* Icons */}
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faSearch} className="nav-icon" />
          <div className="dropdown ms-3">
            <FontAwesomeIcon icon={faUser} className="nav-icon dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown" />
            <ul className="dropdown-menu" aria-labelledby="userDropdown">
              {isAuthenticated ? (
                <>
                  {/* <li><span className="dropdown-item">Xin chào, {username}</span></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="#">Đăng xuất</a></li> */}
                </>
              ) : (
                <li><a className="dropdown-item" href="#">Đăng nhập</a></li>
              )}
            </ul>
          </div>
          <Link className="nav-link ms-3" to="/cart">
            <FontAwesomeIcon icon={faCartShopping} className="nav-icon" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
