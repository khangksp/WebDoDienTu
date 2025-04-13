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
  faSignOutAlt,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";
import '../pages/style/dashboard.css'


const NavbarStyles = `
<style>
  .btn {
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .btn-outline-secondary {
    background-color: #e5e7eb;
    color: #6b7280;
    border: 1px solid #d1d5db;
  }

  .btn-outline-secondary:hover {
    background-color: #d1d5db;
    color: #4b5563;
  }

  .user-info {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #1e293b;
    margin-bottom: 12px;
  }

  .user-info svg {
    margin-right: 8px;
    color: #6b7280;
  }
</style>
`;

function Navbar() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [loaiquyen, setLoaiquyen] = useState("khach");
  const [userInfo, setUserInfo] = useState(null);
  const [isToggled, setIsToggled] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [showUserInfoModal, setShowUserInfoModal] = useState(false); // State cho popup thông tin người dùng

  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showSmsLoginModal, setShowSmsLoginModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Form data states
  const [loginData, setLoginData] = useState({ tendangnhap: "", password: "" });
  const [registerData, setRegisterData] = useState({
    tendangnhap: "",
    password: "",
    confirmPassword: "",
    loaiquyen: "khach",
    tennguoidung: "",
    email: "",
    sodienthoai: "",
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
    userInfo: useRef(null), // Ref cho popup thông tin người dùng
  };
  const verificationInputRefs = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Check auth status and fetch user info
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      axios
        .get(`${API_BASE_URL}/auth/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const userData = response.data.users[0];
          setIsAuthenticated(true);
          setUsername(userData.nguoidung_data?.tennguoidung || userData.tendangnhap || "User");
          setLoaiquyen(userData.loaiquyen || "khach");

          axios
            .get(`${API_BASE_URL}/auth/users/${userData.mataikhoan}/`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
              if (res.data.status === "ok") {
                setUserInfo(res.data.user);
              }
            })
            .catch((err) => {
              console.error("Fetch user info failed:", err);
            });
        })
        .catch((error) => {
          console.error("Auth check failed:", error);
          localStorage.clear();
          setIsAuthenticated(false);
          setUsername("");
          setLoaiquyen("khach");
          setUserInfo(null);
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
      if (window.innerWidth >= 992) {
        setIsToggled(false);
      }
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
          userInfo: showUserInfoModal,
        }[key];
        if (isOpen && ref.current && !ref.current.contains(e.target)) {
          resetModals();
        }
      });
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [
    showLoginModal,
    showRegisterModal,
    showForgotPasswordModal,
    showSmsLoginModal,
    showVerificationModal,
    showUserInfoModal,
  ]);

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
    setShowUserInfoModal(false);
    setLoginData({ tendangnhap: "", password: "" });
    setRegisterData({
      tendangnhap: "",
      password: "",
      confirmPassword: "",
      loaiquyen: "khach",
      tennguoidung: "",
      email: "",
      sodienthoai: "",
    });
    setVerificationCode(["", "", "", "", "", ""]);
    setCountdown(30);
    setIsCountingDown(false);
    setErrorMessage("");
  };

  // Auth handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.tendangnhap || !loginData.password) {
      setErrorMessage(t("vuiLongNhapDayDuThongTin"));
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
        tendangnhap: loginData.tendangnhap,
        password: loginData.password,
      });

      const { access, refresh, user } = response.data;
      localStorage.setItem("access_token", access);
      if (refresh) localStorage.setItem("refresh_token", refresh);

      setIsAuthenticated(true);
      setUsername(user.nguoidung_data?.tennguoidung || user.tendangnhap || "User");
      setLoaiquyen(user.loaiquyen || "khach");

      const userResponse = await axios.get(`${API_BASE_URL}/auth/users/${user.mataikhoan}/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      if (userResponse.data.status === "ok") {
        setUserInfo(userResponse.data.user);
      }

      resetModals();
      if (user.loaiquyen === "admin") {
        navigate("/admin");
      } else if (user.loaiquyen === "nhanvien") {
        navigate("/nhanvien");
      } else {
        navigate("/");
      }
    } catch (error) {
      setErrorMessage(
        t("dangNhapThatBai") + ": " + (error.response?.data?.message || t("loiKhongXacDinh"))
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { tendangnhap, password, confirmPassword, loaiquyen, tennguoidung, email, sodienthoai } =
      registerData;

    if (!tendangnhap || !password || !confirmPassword || !tennguoidung || !email || !sodienthoai) {
      setErrorMessage(t("vuiLongNhapDayDuThongTin"));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t("matKhauKhongKhop"));
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/`, {
        tendangnhap,
        password,
        loaiquyen,
        nguoidung: {
          tennguoidung,
          email,
          sodienthoai,
        },
      });
      resetModals();
      setShowLoginModal(true);
      alert(t("dangKyThanhCong"));
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.non_field_errors?.[0] ||
        Object.values(error.response?.data?.errors || {})[0] ||
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
        t("yeuCauLayLaiMatKhauThatBai") + ": " + (error.response?.data?.message || t("loiKhongXacDinh"))
      );
    }
  };

  const handleSmsVerification = (e) => {
    e.preventDefault();
    if (!registerData.sodienthoai) {
      setErrorMessage(t("vuiLongNhapSDT"));
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
    if (isAuthenticated) {
      setShowUserInfoModal(true);
    } else if (isMobile) {
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
    setLoaiquyen("khach");
    setUserInfo(null);
    resetModals();
    navigate("/");
  };

  const modalNavigation = {
    openRegister: () => {
      setShowLoginModal(false);
      setShowRegisterModal(true);
    },
    openForgotPassword: () => {
      setShowLoginModal(false);
      setShowForgotPasswordModal(true);
    },
    openSmsLogin: () => {
      setShowLoginModal(false);
      setShowSmsLoginModal(true);
    },
    goBackToLogin: () => {
      resetModals();
      setShowLoginModal(true);
    },
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
      <div dangerouslySetInnerHTML={{ __html: NavbarStyles }} />
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

      {/* User Info Modal */}
      {showUserInfoModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={modalRefs.userInfo}>
            <div className="login-modal-header">
              <h4>{t("thongTinTaiKhoan")}</h4>
              <p>{t("quanLyTaiKhoan")}</p>
              <button className="close-button" onClick={() => setShowUserInfoModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              {userInfo ? (
                <>
                  <div className="text-center mb-4">
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      style={{ fontSize: "50px", color: "#6b7280" }}
                    />
                    <h5 className="mt-2">{userInfo.nguoidung_data.tennguoidung}</h5>
                  </div>
                  <div className="user-info mb-2">
                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                    <span>
                      <strong>{t("email")}:</strong> {userInfo.nguoidung_data.email}
                    </span>
                  </div>
                  <div className="user-info mb-2">
                    <FontAwesomeIcon icon={faMobileAlt} className="me-2" />
                    <span>
                      <strong>{t("sdt")}:</strong> {userInfo.nguoidung_data.sodienthoai}
                    </span>
                  </div>
                  <div className="user-info mb-2">
                    <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                    <span>
                      <strong>{t("diaChi")}:</strong>{" "}
                      {userInfo.nguoidung_data.diachi || t("chuaCapNhat")}
                    </span>
                  </div>
                  <hr />
                  <button className="btn btn-danger w-100" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    {t("dangXuat")}
                  </button>
                </>
              ) : (
                <p className="text-center">{t("dangTai")}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={modalRefs.login}>
            <div className="login-modal-header">
              <h4>{isAuthenticated ? `${t("xinChao")} ${username}` : t("dangNhap")}</h4>
              <p>{isAuthenticated ? t("quanLyTaiKhoan") : t("vuiLongNhapThongTinDangNhap")}</p>
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
                      placeholder={t("tenDangNhap")}
                      className="form-control"
                      value={loginData.tendangnhap}
                      onChange={handleInputChange("login", "tendangnhap")}
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
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        modalNavigation.openForgotPassword();
                      }}
                    >
                      {t("quenMatKhau")}
                    </a>
                  </div>
                  <div className="text-center mt-3">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        modalNavigation.openRegister();
                      }}
                    >
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
                  { icon: faUser, placeholder: t("tenDangNhap"), field: "tendangnhap" },
                  { icon: faUser, placeholder: t("tenNguoiDung"), field: "tennguoidung" },
                  { icon: faEnvelope, placeholder: t("email"), field: "email", type: "email" },
                  { icon: faMobileAlt, placeholder: t("soDienThoai"), field: "sodienthoai", type: "tel" },
                  { icon: faLock, placeholder: t("matKhau"), field: "password", type: "password" },
                  {
                    icon: faLock,
                    placeholder: t("xacNhanMatKhau"),
                    field: "confirmPassword",
                    type: "password",
                  },
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
                <div className="input-icon-wrapper">
                  <FontAwesomeIcon icon={faUser} className="input-icon" />
                  <select
                    className="form-control"
                    value={registerData.loaiquyen}
                    onChange={handleInputChange("register", "loaiquyen")}
                  >
                    <option value="khach">{t("khachHang")}</option>
                    <option value="admin">{t("quanTri")}</option>
                    <option value="nhanvien">{t("nhanVien")}</option>
                  </select>
                </div>
                {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
                <button type="submit" className="btn btn-danger w-100">
                  {t("dangKy")}
                </button>
              </form>
              <div className="text-center mt-3">
                <p>
                  {t("daCoTaiKhoan")}{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      modalNavigation.goBackToLogin();
                    }}
                  >
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
                    value={registerData.sodienthoai}
                    onChange={handleInputChange("register", "sodienthoai")}
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
              <button
                className="back-button"
                onClick={() => {
                  setShowVerificationModal(false);
                  setShowSmsLoginModal(true);
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h4>{t("nhapMaXacMinh")}</h4>
              <p>
                {t("soDienThoaiDaCoTaiKhoan")} {registerData.sodienthoai}
              </p>
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
                      <span>
                        {t("guiLaiMaSau")} {countdown}s
                      </span>
                    ) : (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCountdown(30);
                          setIsCountingDown(true);
                        }}
                      >
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