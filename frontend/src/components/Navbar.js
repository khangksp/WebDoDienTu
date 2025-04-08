import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faUser,
  faSearch,
  faTimes,
  faArrowLeft,
  faMobileAlt,
  faEnvelope,
  faLock,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import axios from "axios";

import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";

function Navbar() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [isToggled, setIsToggled] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showSmsLoginModal, setShowSmsLoginModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Form data states
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Refs
  const modalRefs = {
    login: useRef(null),
    register: useRef(null),
    forgotPassword: useRef(null),
    smsLogin: useRef(null),
    verification: useRef(null),
  };
  const verificationInputRefs = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const API_BASE_URL = "http://localhost:8000/api";

  // Check auth status
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      axios
        .get(`${API_BASE_URL}/auth/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setIsAuthenticated(true);
          const userData = response.data;
          const usernameField = userData.username || 
            (Array.isArray(userData.users) && userData.users[0]) || 
            "User";
          setUsername(usernameField);
        })
        .catch((error) => {
          console.error("Auth check failed:", error);
          localStorage.clear();
          setIsAuthenticated(false);
          setUsername("");
        });
    }
  }, []);

  // Navigation indicator
  useEffect(() => {
    const activeTab = document.querySelector(".nav-link.active");
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [location.pathname]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) setIsToggled(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close modal on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      Object.entries(modalRefs).forEach(([key, ref]) => {
        const isOpen = {
          login: showLoginModal,
          register: showRegisterModal,
          forgotPassword: showForgotPasswordModal,
          smsLogin: showSmsLoginModal,
          verification: showVerificationModal,
        }[key];
        if (isOpen && ref.current && !ref.current.contains(e.target)) {
          resetModals();
        }
      });
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showLoginModal, showRegisterModal, showForgotPasswordModal, showSmsLoginModal, showVerificationModal]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (isCountingDown && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsCountingDown(false);
    }
    return () => clearInterval(timer);
  }, [isCountingDown, countdown]);

  // Form handlers
  const handleInputChange = (type, field) => (e) => {
    if (type === "login") {
      setLoginData((prev) => ({ ...prev, [field]: e.target.value }));
    } else {
      setRegisterData((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const handleVerificationChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      if (value && index < 5) verificationInputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerificationKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      verificationInputRefs.current[index - 1]?.focus();
    }
  };

  // Reset states
  const resetModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowForgotPasswordModal(false);
    setShowSmsLoginModal(false);
    setShowVerificationModal(false);
    setLoginData({ username: "", password: "" });
    setRegisterData({ username: "", email: "", password: "", confirmPassword: "" });
    setVerificationCode(["", "", "", "", "", ""]);
    setCountdown(30);
    setIsCountingDown(false);
    setErrorMessage("");
  };

  // Auth handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      setErrorMessage(t("vuiLongNhapDayDuThongTin"));
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, loginData);
      const token = response.data.access || response.data.token;
      localStorage.setItem("access_token", token);
      if (response.data.refresh) localStorage.setItem("refresh_token", response.data.refresh);
      setIsAuthenticated(true);
      setUsername(loginData.username);
      resetModals();
    } catch (error) {
      setErrorMessage(
        t("dangNhapThatBai") + ": " + 
        (error.response?.data?.detail || t("loiKhongXacDinh"))
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = registerData;
    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage(t("vuiLongNhapDayDuThongTin"));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t("matKhauKhongKhop"));
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/register/`, { username, email, password });
      resetModals();
      setShowLoginModal(true);
      alert(t("dangKyThanhCong"));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 
        Object.values(error.response?.data || {})[0] || 
        t("loiKhongXacDinh");
      setErrorMessage(t("dangKyThatBai") + ": " + errorMsg);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!registerData.email) {
      setErrorMessage(t("vuiLongNhapEmail"));
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/password-reset/`, { email: registerData.email });
      resetModals();
      alert(t("huongDanLayLaiMatKhau"));
    } catch (error) {
      setErrorMessage(
        t("yeuCauLayLaiMatKhauThatBai") + ": " + 
        (error.response?.data?.detail || t("loiKhongXacDinh"))
      );
    }
  };

  const handleSmsVerification = (e) => {
    e.preventDefault();
    if (!registerData.email) {
      setErrorMessage(t("vuiLongNhapEmail"));
      return;
    }
    setShowSmsLoginModal(false);
    setShowVerificationModal(true);
    setCountdown(30);
    setIsCountingDown(true);
  };

  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setErrorMessage(t("vuiLongNhapDayDuMaXacMinh"));
      return;
    }
    resetModals();
    alert(t("xacMinhThanhCong"));
  };

  // Navigation handlers
  const handleAccountClick = (e) => {
    e.preventDefault();
    if (isMobile && !isAuthenticated) {
      navigate("/login");
    } else {
      resetModals();
      setShowLoginModal(true);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUsername("");
    resetModals();
  };

  const modalNavigation = {
    openRegister: () => { setShowLoginModal(false); setShowRegisterModal(true); },
    openForgotPassword: () => { setShowLoginModal(false); setShowForgotPasswordModal(true); },
    openSmsLogin: () => { setShowLoginModal(false); setShowSmsLoginModal(true); },
    goBackToLogin: () => { resetModals(); setShowLoginModal(true); },
  };


  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src="/assets/logoweb.png" alt="Logo" className="logo" />
          </Link>

          <button
            className={`navbar-toggler ${isToggled ? "" : "collapsed"}`}
            type="button"
            onClick={() => setIsToggled(!isToggled)}
          >
            <span className="toggler-icon top-bar"></span>
            <span className="toggler-icon middle-bar"></span>
            <span className="toggler-icon bottom-bar"></span>
          </button>

          <div className={`collapse navbar-collapse ${isToggled ? "show" : ""}`}>
          <form onSubmit={handleSearch} className="d-lg-none mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input 
                type="text" 
                className="form-control" 
                placeholder={t("timKiem")} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>

            <div className="navbar-nav mx-auto position-relative">
              {[
                { path: "/", label: t("trangChu") },
                { path: "/about", label: t("gioiThieu") },
                { path: "/products", label: t("sanPham") },
                { path: "/contact", label: t("lienHe") },
              ].map((item) => (
                <Link
                  key={item.path}
                  className={`nav-link nav2 ${location.pathname === item.path ? "active" : ""}`}
                  to={item.path}
                >
                  {item.label}
                </Link>
              ))}
              <div className="indicator" style={indicatorStyle}></div>
            </div>

            <div className="d-lg-none d-flex justify-content-between align-items-center">
              <LanguageSwitcher />
              <div className="d-flex">
                <a className="nav-link me-3" href="#" onClick={handleAccountClick}>
                  <FontAwesomeIcon icon={faUser} />
                  <span className="d-none d-lg-inline ms-1">
                    {isAuthenticated ? username : t("taiKhoan")}
                  </span>
                </a>
                <Link className="nav-link" to="/cart">
                  <FontAwesomeIcon icon={faCartShopping} />
                  <span className="d-none d-lg-inline ms-1">{t("gioHang")}</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="d-none d-lg-flex align-items-center">
            <form onSubmit={handleSearch} className="d-none d-lg-flex align-items-center">
              <div className="input-group search-container">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={t("timKiem")} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>


            <LanguageSwitcher />
            <a className="nav-link ms-3" href="#" onClick={handleAccountClick}>
              <FontAwesomeIcon icon={faUser} className="me-1" />
              {isAuthenticated ? username : t("taiKhoan")}
            </a>
            <Link className="nav-link ms-3" to="/cart">
              <FontAwesomeIcon icon={faCartShopping} className="me-1" />
              {t("gioHang")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={modalRefs.login}>
            <div className="login-modal-header">
              <h4>{isAuthenticated ? `${t("xinChao")} ${username}` : t("dangNhap")}</h4>
              <p>
                {isAuthenticated
                  ? t("quanLyTaiKhoan")
                  : t("Vui lòng nhập thông tin đăng nhập")}
              </p>
              <button className="close-button" onClick={resetModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              {isAuthenticated ? (
                <button className="btn btn-danger w-100" onClick={handleLogout}>
                  {t("dangXuat")}
                </button>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="input-icon-wrapper">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    <input
                      type="text"
                      placeholder={t("tên đăng nhập")}
                      className="form-control"
                      value={loginData.username}
                      onChange={handleInputChange("login", "username")}
                    />
                  </div>
                  <div className="input-icon-wrapper">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                      type="password"
                      placeholder={t("matKhau")}
                      className="form-control"
                      value={loginData.password}
                      onChange={handleInputChange("login", "password")}
                    />
                  </div>
                  {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
                  <button type="submit" className="btn btn-danger w-100">
                    {t("dangNhap")}
                  </button>
                  <div className="text-center mt-3">
                    <a href="#" onClick={(e) => { e.preventDefault(); modalNavigation.openForgotPassword(); }}>
                      {t("quenMatKhau")}
                    </a>
                  </div>
                  <div className="text-center mt-3">
                    <a href="#" onClick={(e) => { e.preventDefault(); modalNavigation.openRegister(); }}>
                      {t("dangKyTaiKhoan")}
                    </a>
                  </div>
                  <div className="alternative-login mt-4">
                    <p className="text-center">{t("hoacTiepTucBang")}</p>
                    <div className="social-buttons d-flex justify-content-center">
                      <button className="btn btn-outline-secondary me-2">
                        <FontAwesomeIcon icon={faFacebookF} />
                      </button>
                      <button className="btn btn-outline-secondary">
                        <FontAwesomeIcon icon={faGoogle} />
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={modalRefs.register}>
            <div className="login-modal-header">
              <button className="back-button" onClick={modalNavigation.goBackToLogin}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h4>{t("dangKy")}</h4>
              <p>{t("vuiLongNhapThongTinDangKy")}</p>
              <button className="close-button" onClick={resetModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              <form onSubmit={handleRegister}>
                {[
                  { icon: faUser, placeholder: t("tên đăng nhập"), field: "username" },
                  { icon: faEnvelope, placeholder: t("email"), field: "email", type: "email" },
                  { icon: faLock, placeholder: t("mật khẩu"), field: "password", type: "password" },
                  { icon: faLock, placeholder: t("xác nhận mật khẩu"), field: "confirmPassword", type: "password" },
                ].map((input) => (
                  <div className="input-icon-wrapper" key={input.field}>
                    <FontAwesomeIcon icon={input.icon} className="input-icon" />
                    <input
                      type={input.type || "text"}
                      placeholder={input.placeholder}
                      className="form-control"
                      value={registerData[input.field]}
                      onChange={handleInputChange("register", input.field)}
                    />
                  </div>
                ))}
                {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
                <button type="submit" className="btn btn-danger w-100">
                  {t("dangKy")}
                </button>
              </form>
              <div className="text-center mt-3">
                <p>
                  {t("daCoTaiKhoan")}{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); modalNavigation.goBackToLogin(); }}>
                    {t("dangNhap")}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={modalRefs.forgotPassword}>
            <div className="login-modal-header">
              <button className="back-button" onClick={modalNavigation.goBackToLogin}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h4>{t("quenMatKhau")}</h4>
              <p>{t("vuiLongNhapThongTin")}</p>
              <button className="close-button" onClick={resetModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              <form onSubmit={handleForgotPassword}>
                <div className="input-icon-wrapper">
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                  <input
                    type="email"
                    placeholder={t("email")}
                    className="form-control"
                    value={registerData.email}
                    onChange={handleInputChange("register", "email")}
                  />
                </div>
                {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
                <button type="submit" className="btn btn-danger w-100">
                  {t("layLaiMatKhau")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SMS Login Modal */}
      {showSmsLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={modalRefs.smsLogin}>
            <div className="login-modal-header">
              <button className="back-button" onClick={modalNavigation.goBackToLogin}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h4>{t("dangNhapBangSMS")}</h4>
              <p>{t("vuiLongNhapSDTNhanMa")}</p>
              <button className="close-button" onClick={resetModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              <form onSubmit={handleSmsVerification}>
                <div className="input-icon-wrapper">
                  <FontAwesomeIcon icon={faMobileAlt} className="input-icon" />
                  <input
                    type="tel"
                    placeholder={t("soDienThoai")}
                    className="form-control"
                    value={registerData.email}
                    onChange={handleInputChange("register", "email")}
                  />
                </div>
                {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
                <button type="submit" className="btn btn-danger w-100">
                  {t("tiepTuc")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={modalRefs.verification}>
            <div className="login-modal-header">
              <button className="back-button" onClick={() => { setShowVerificationModal(false); setShowSmsLoginModal(true); }}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h4>{t("nhapMaXacMinh")}</h4>
              <p>{t("soDienThoaiDaCoTaiKhoan")} {registerData.email}</p>
              <button className="close-button" onClick={resetModals}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              <form onSubmit={handleVerificationSubmit}>
                <div className="verification-code-container d-flex justify-content-between">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className="form-control verification-input"
                      value={digit}
                      onChange={(e) => handleVerificationChange(index, e.target.value)}
                      onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                      ref={(el) => (verificationInputRefs.current[index] = el)}
                    />
                  ))}
                </div>
                {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
                <button type="submit" className="btn btn-danger w-100 mt-3">
                  {t("xacMinh")}
                </button>
                <div className="text-center mt-3">
                  <div className="d-flex justify-content-center align-items-center">
                    <FontAwesomeIcon icon={faClock} className="me-2" />
                    {isCountingDown ? (
                      <span>{t("guiLaiMaSau")} {countdown}s</span>
                    ) : (
                      <a href="#" onClick={(e) => { e.preventDefault(); setCountdown(30); setIsCountingDown(true); }}>
                        {t("guiLaiMa")}
                      </a>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;