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
  faClock
} from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faGoogle } from "@fortawesome/free-brands-svg-icons";

import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [isToggled, setIsToggled] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  
  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailLoginModal, setShowEmailLoginModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showSmsLoginModal, setShowSmsLoginModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  // Form data states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const [isCountingDown, setIsCountingDown] = useState(false);
  
  // Refs for all modals
  const modalRef = useRef(null);
  const passwordModalRef = useRef(null);
  const emailLoginModalRef = useRef(null);
  const forgotPasswordModalRef = useRef(null);
  const smsLoginModalRef = useRef(null);
  const verificationModalRef = useRef(null);
  
  // Refs for verification inputs
  const verificationInputRefs = useRef([]);
  
  const location = useLocation();
  const navigate = useNavigate();
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
      if (showLoginModal && modalRef.current && !modalRef.current.contains(event.target)) {
        setShowLoginModal(false);
      }
      if (showPasswordModal && passwordModalRef.current && !passwordModalRef.current.contains(event.target)) {
        setShowPasswordModal(false);
      }
      if (showEmailLoginModal && emailLoginModalRef.current && !emailLoginModalRef.current.contains(event.target)) {
        setShowEmailLoginModal(false);
      }
      if (showForgotPasswordModal && forgotPasswordModalRef.current && !forgotPasswordModalRef.current.contains(event.target)) {
        setShowForgotPasswordModal(false);
      }
      if (showSmsLoginModal && smsLoginModalRef.current && !smsLoginModalRef.current.contains(event.target)) {
        setShowSmsLoginModal(false);
      }
      if (showVerificationModal && verificationModalRef.current && !verificationModalRef.current.contains(event.target)) {
        setShowVerificationModal(false);
      }
    };

    if (showLoginModal || showPasswordModal || showEmailLoginModal || showForgotPasswordModal || showSmsLoginModal || showVerificationModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLoginModal, showPasswordModal, showEmailLoginModal, showForgotPasswordModal, showSmsLoginModal, showVerificationModal]);

  // Countdown timer for SMS verification
  useEffect(() => {
    let timer;
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountingDown(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isCountingDown]);

  // Handle focus for verification inputs
  const handleVerificationInputChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      // Auto focus next input
      if (value !== "" && index < 5) {
        verificationInputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace for verification inputs
  const handleVerificationKeyDown = (index, e) => {
    if (e.key === "Backspace" && verificationCode[index] === "" && index > 0) {
      verificationInputRefs.current[index - 1].focus();
    }
  };

  // Reset all modals and form data
  const resetModals = () => {
    setShowLoginModal(false);
    setShowPasswordModal(false);
    setShowEmailLoginModal(false);
    setShowForgotPasswordModal(false);
    setShowSmsLoginModal(false);
    setShowVerificationModal(false);
    setPhoneNumber("");
    setPassword("");
    setEmail("");
    setVerificationCode(["", "", "", "", "", ""]);
    setCountdown(30);
    setIsCountingDown(false);
  };

  // Handle account button click
  const handleAccountClick = (e) => {
    if (isMobile) {
      navigate("/login");
    } else {
      e.preventDefault();
      resetModals();
      setShowLoginModal(true);
    }
  };

  // Handle continue button click in login modal
  const handleContinueClick = (e) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      setShowLoginModal(false);
      setShowPasswordModal(true);
    } else {
      // Show validation error
      alert("Vui lòng nhập số điện thoại");
    }
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    if (password.trim()) {
      // Handle login logic here
      console.log("Đăng nhập với:", phoneNumber, password);
      resetModals();
      // Reset inputs after login
    } else {
      // Show validation error
      alert("Vui lòng nhập mật khẩu");
    }
  };

  // Handle email login
  const handleEmailLogin = (e) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      // Handle login logic here
      console.log("Đăng nhập bằng email:", email, password);
      resetModals();
    } else {
      // Show validation error
      alert("Vui lòng nhập đầy đủ thông tin");
    }
  };

  // Handle forgot password
  const handleForgotPassword = (e) => {
    e.preventDefault();
    const contactInfo = phoneNumber.trim() || email.trim();
    if (contactInfo) {
      console.log("Lấy lại mật khẩu cho:", contactInfo);
      // Normally would send a reset email/SMS here
      resetModals();
      alert("Hướng dẫn lấy lại mật khẩu đã được gửi!");
    } else {
      // Show validation error
      alert("Vui lòng nhập số điện thoại hoặc email");
    }
  };

  // Handle SMS verification
  const handleSmsVerification = (e) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      setShowSmsLoginModal(false);
      setShowVerificationModal(true);
      setCountdown(30);
      setIsCountingDown(true);
    } else {
      // Show validation error
      alert("Vui lòng nhập số điện thoại");
    }
  };

  // Handle verification code submit
  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    const code = verificationCode.join("");
    if (code.length === 6) {
      console.log("Xác minh với mã:", code);
      resetModals();
      // Normally would verify the code here
      alert("Xác minh thành công!");
    } else {
      // Show validation error
      alert("Vui lòng nhập đầy đủ mã xác minh");
    }
  };

  // Handle resend verification code
  const handleResendCode = () => {
    setCountdown(30);
    setIsCountingDown(true);
    setVerificationCode(["", "", "", "", "", ""]);
    console.log("Gửi lại mã xác minh cho:", phoneNumber);
  };

  // Navigation between modals
  const openEmailLogin = () => {
    setShowLoginModal(false);
    setShowEmailLoginModal(true);
  };

  const openForgotPassword = () => {
    setShowPasswordModal(false);
    setShowEmailLoginModal(false);
    setShowForgotPasswordModal(true);
  };

  const openSmsLogin = () => {
    setShowPasswordModal(false);
    setShowSmsLoginModal(true);
  };

  const goBackToPhoneLogin = () => {
    setShowEmailLoginModal(false);
    setShowPasswordModal(false);
    setShowForgotPasswordModal(false);
    setShowSmsLoginModal(false);
    setShowVerificationModal(false);
    setShowLoginModal(true);
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

      {/* Login Modal (Phone Number) */}
      {showLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={modalRef}>
            <div className="login-modal-header">
              <h4>Xin chào,</h4>
              <p>Đăng nhập hoặc Tạo tài khoản</p>
              <button className="close-button" onClick={() => setShowLoginModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              <form onSubmit={handleContinueClick}>
                <div className="input-icon-wrapper">
                  <FontAwesomeIcon icon={faMobileAlt} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Số điện thoại" 
                    className="form-control" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100">Tiếp Tục</button>
              </form>
              <div className="text-center mt-3">
                <a href="#" className="text-decoration-none" onClick={(e) => {
                  e.preventDefault();
                  openEmailLogin();
                }}>Đăng nhập bằng email</a>
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
                <p>Bằng việc tiếp tục, bạn đã đọc và đồng ý với <br />
                <a href="#">điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật thông tin cá nhân</a></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={passwordModalRef}>
            <div className="login-modal-header">
              <button className="back-button" onClick={goBackToPhoneLogin}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h4>Nhập mật khẩu</h4>
              <p>Vui lòng nhập mật khẩu cho số điện thoại {phoneNumber}</p>
              <button className="close-button" onClick={() => setShowPasswordModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              <form onSubmit={handleLogin}>
                <div className="input-icon-wrapper">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="Mật khẩu" 
                    className="form-control" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100">Đăng Nhập</button>
              </form>
              <div className="text-center mt-3">
                <a href="#" className="text-decoration-none" onClick={(e) => {
                  e.preventDefault();
                  openForgotPassword();
                }}>Quên mật khẩu?</a>
              </div>
              
              <div className="text-center mt-4">
                <a href="#" className="text-decoration-none" onClick={(e) => {
                  e.preventDefault();
                  openSmsLogin();
                }}>Đăng nhập bằng SMS</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Login Modal */}
      {showEmailLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={emailLoginModalRef}>
            <div className="login-modal-header">
              <button className="back-button" onClick={goBackToPhoneLogin}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h4>Đăng nhập bằng email</h4>
              <p>Vui lòng nhập email và mật khẩu</p>
              <button className="close-button" onClick={() => setShowEmailLoginModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              <form onSubmit={handleEmailLogin}>
                <div className="input-icon-wrapper">
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    className="form-control" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="input-icon-wrapper">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="Mật khẩu" 
                    className="form-control" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100">Đăng Nhập</button>
              </form>
              <div className="text-center mt-3">
                <a href="#" className="text-decoration-none" onClick={(e) => {
                  e.preventDefault();
                  openForgotPassword();
                }}>Quên mật khẩu?</a>
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
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={forgotPasswordModalRef}>
            <div className="login-modal-header">
              <button className="back-button" onClick={goBackToPhoneLogin}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h4>Quên mật khẩu?</h4>
              <p>Vui lòng nhập thông tin tài khoản để lấy lại mật khẩu</p>
              <button className="close-button" onClick={() => setShowForgotPasswordModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              <form onSubmit={handleForgotPassword}>
                <div className="input-icon-wrapper">
                  <FontAwesomeIcon icon={faMobileAlt} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Số điện thoại/ Email" 
                    className="form-control" 
                    value={phoneNumber || email}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.includes('@')) {
                        setEmail(value);
                        setPhoneNumber("");
                      } else {
                        setPhoneNumber(value);
                        setEmail("");
                      }
                    }}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100">Lấy lại mật khẩu</button>
              </form>
              
              <div className="text-center mt-4">
                <p>Đổi số điện thoại? <a href="#" className="text-decoration-none">Liên hệ Hotline 1900-6035</a></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMS Login Modal */}
      {showSmsLoginModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={smsLoginModalRef}>
            <div className="login-modal-header">
              <button className="back-button" onClick={() => {
                setShowSmsLoginModal(false);
                setShowPasswordModal(true);
              }}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h4>Đăng nhập bằng SMS</h4>
              <p>Vui lòng nhập số điện thoại để nhận mã xác minh</p>
              <button className="close-button" onClick={() => setShowSmsLoginModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              <form onSubmit={handleSmsVerification}>
                <div className="input-icon-wrapper">
                  <FontAwesomeIcon icon={faMobileAlt} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Số điện thoại" 
                    className="form-control" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100">Tiếp tục</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Verification Code Modal */}
      {showVerificationModal && (
        <div className="login-modal-overlay">
          <div className="login-modal modal-animation" ref={verificationModalRef}>
            <div className="login-modal-header">
              <button className="back-button" onClick={() => {
                setShowVerificationModal(false);
                setShowSmsLoginModal(true);
              }}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h4>Nhập mã xác minh</h4>
              <p>Số điện thoại {phoneNumber} đã có tài khoản. Vui lòng xác thực để đăng nhập</p>
              <button className="close-button" onClick={() => setShowVerificationModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="login-modal-body">
              <form onSubmit={handleVerificationSubmit}>
                <div className="verification-code-container d-flex justify-content-between">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className="form-control verification-input"
                      value={verificationCode[index]}
                      onChange={(e) => handleVerificationInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                      ref={(el) => (verificationInputRefs.current[index] = el)}
                      required
                    />
                  ))}
                </div>
                <button type="submit" className="btn btn-danger w-100 mt-3">Xác Minh</button>
              </form>
              
              <div className="text-center mt-3 resend-code">
                <div className="d-flex align-items-center justify-content-center">
                  <FontAwesomeIcon icon={faClock} className="me-2" />
                  {isCountingDown ? (
                    <span>Gửi lại mã sau {countdown}s</span>
                  ) : (
                    <a
                      href="#"
                      className="text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        handleResendCode();
                      }}
                    >
                      Gửi lại mã
                    </a>
                  )}
                </div>
                <p className="mt-2 small">Mã xác minh có hiệu lực trong 15 phút</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;