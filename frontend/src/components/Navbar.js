import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../assets/logo.png";
function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
 
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/check-login/", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setIsAuthenticated(data.isAuthenticated);
        if (data.isAuthenticated) {
          setUsername(data.username);
        }
      })
      .catch((error) => console.error("Lỗi API:", error));
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
      <img src={logo} alt="Logo" width="100" />
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" to="/">Trang Chủ</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products">Sản Phẩm</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cart">Giỏ Hàng</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Liên Hệ</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/pokemon">Test API</Link>
            </li>

            {/* Dropdown Menu */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Tài khoản
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                {isAuthenticated ? (
                  <>
                    <li><span className="dropdown-item">Xin chào, {username}</span></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item" href="http://127.0.0.1:8000/accounts/logout/">Đăng xuất</a></li>
                  </>
                ) : (
                  <li><a className="dropdown-item" href="http://127.0.0.1:8000/accounts/login/">Đăng nhập</a></li>
                )}
              </ul>
            </li>
          </ul>

          {/* Search Form */}
          <form className="d-flex">
            <input className="form-control me-2" type="search" placeholder="Tìm kiếm..." aria-label="Search" />
            <button className="btn btn-outline-success" type="submit">Tìm</button>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;