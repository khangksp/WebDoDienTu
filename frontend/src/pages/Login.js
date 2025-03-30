import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import './style/style.css';

function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Logging in with phone:', phoneNumber);
  };

  return (
    <div className="login-page">
      {/* Header with back button */}
      <div className="login-header">
        <Link to="/" className="back-button">
          <FontAwesomeIcon icon={faChevronLeft} />
        </Link>
      </div>

      {/* Login content */}
      <div className="login-container">
        <div className="login-content">
          <h1 className="login-title">Xin chào,</h1>
          <p className="login-subtitle">Đăng nhập hoặc Tạo tài khoản</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="phone-input-container">
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="phone-input"
                required
              />
            </div>

            <button type="submit" className="continue-button">
              Tiếp Tục
            </button>

            <div className="email-login">
              <a href="#" className="email-login-link">Đăng nhập bằng email</a>
            </div>

            <div className="separator">
              <span>Hoặc tiếp tục bằng</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-button facebook">
              <FontAwesomeIcon icon={faFacebookF} />              </button>
              <button type="button" className="social-button google">
              <FontAwesomeIcon icon={faGoogle} />
              </button>
            </div>
          </form>

          <div className="terms-notice">
            <p>
              Bằng việc tiếp tục, bạn đã đọc và đồng ý với {' '}
              <a href="#">điều khoản sử dụng</a> và {' '}
              <a href="#">Chính sách bảo mật thông tin cá nhân</a>
            </p>
          </div>
        </div>

        {/* Illustration at the bottom for larger phones */}
        <div className="login-illustration">
          <img 
            src="/assets/login-illustration.png" 
            alt="Login illustration"
            className="illustration-image"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;