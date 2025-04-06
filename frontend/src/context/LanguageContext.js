import React, { createContext, useState, useContext, useEffect } from 'react';

// Object chứa các bản dịch
const translations = {
  vi: {
    // Navbar
    trangChu: 'Trang chủ',
    gioiThieu: 'Giới thiệu',
    sanPham: 'Sản phẩm',
    lienHe: 'Liên hệ',
    timKiem: 'Tìm kiếm sản phẩm ....',
    taiKhoan: 'Tài khoản',
    gioHang: 'Giỏ hàng',
    
    // Login modal
    xinChao: 'Xin chào,',
    dangNhapHoacTaoTaiKhoan: 'Đăng nhập hoặc Tạo tài khoản',
    soDienThoai: 'Số điện thoại',
    tiepTuc: 'Tiếp Tục',
    dangNhapBangEmail: 'Đăng nhập bằng email',
    hoacTiepTucBang: 'Hoặc tiếp tục bằng',
    dieuKhoan: 'Bằng việc tiếp tục, bạn đã đọc và đồng ý với',
    dieuKhoanSuDung: 'điều khoản sử dụng',
    chinhSachBaoMat: 'Chính sách bảo mật thông tin cá nhân',
    va: 'và',
    
    // Password modal
    nhapMatKhau: 'Nhập mật khẩu',
    vuiLongNhapMatKhau: 'Vui lòng nhập mật khẩu cho số điện thoại',
    matKhau: 'Mật khẩu',
    dangNhap: 'Đăng Nhập',
    quenMatKhau: 'Quên mật khẩu?',
    dangNhapBangSMS: 'Đăng nhập bằng SMS',
    
    // Email login modal
    vuiLongNhapEmailVaMatKhau: 'Vui lòng nhập email và mật khẩu',
    email: 'Email',
    
    // Forgot password modal
    vuiLongNhapThongTin: 'Vui lòng nhập thông tin tài khoản để lấy lại mật khẩu',
    soDienThoaiEmail: 'Số điện thoại/ Email',
    layLaiMatKhau: 'Lấy lại mật khẩu',
    doiSoDienThoai: 'Đổi số điện thoại?',
    lienHeHotline: 'Liên hệ Hotline 1900-6035',
    
    // SMS login modal
    vuiLongNhapSDTNhanMa: 'Vui lòng nhập số điện thoại để nhận mã xác minh',
    
    // Verification modal
    nhapMaXacMinh: 'Nhập mã xác minh',
    soDienThoaiDaCoTaiKhoan: 'Số điện thoại',
    daCoTaiKhoan: 'đã có tài khoản. Vui lòng xác thực để đăng nhập',
    xacMinh: 'Xác Minh',
    guiLaiMaSau: 'Gửi lại mã sau',
    guiLaiMa: 'Gửi lại mã',
    maXacMinhHieuLuc: 'Mã xác minh có hiệu lực trong 15 phút'
  },
  en: {
    // Navbar
    trangChu: 'Home',
    gioiThieu: 'About',
    sanPham: 'Products',
    lienHe: 'Contact',
    timKiem: 'Search for products ...',
    taiKhoan: 'Account',
    gioHang: 'Cart',
    
    // Login modal
    xinChao: 'Hello,',
    dangNhapHoacTaoTaiKhoan: 'Login or Create account',
    soDienThoai: 'Phone number',
    tiepTuc: 'Continue',
    dangNhapBangEmail: 'Login with email',
    hoacTiepTucBang: 'Or continue with',
    dieuKhoan: 'By continuing, you have read and agreed to',
    dieuKhoanSuDung: 'terms of use',
    chinhSachBaoMat: 'Privacy Policy',
    va: 'and',
    
    // Password modal
    nhapMatKhau: 'Enter password',
    vuiLongNhapMatKhau: 'Please enter password for phone number',
    matKhau: 'Password',
    dangNhap: 'Login',
    quenMatKhau: 'Forgot password?',
    dangNhapBangSMS: 'Login with SMS',
    
    // Email login modal
    vuiLongNhapEmailVaMatKhau: 'Please enter email and password',
    email: 'Email',
    
    // Forgot password modal
    vuiLongNhapThongTin: 'Please enter account information to recover password',
    soDienThoaiEmail: 'Phone number/ Email',
    layLaiMatKhau: 'Recover password',
    doiSoDienThoai: 'Change phone number?',
    lienHeHotline: 'Contact Hotline 1900-6035',
    
    // SMS login modal
    vuiLongNhapSDTNhanMa: 'Please enter phone number to receive verification code',
    
    // Verification modal
    nhapMaXacMinh: 'Enter verification code',
    soDienThoaiDaCoTaiKhoan: 'Phone number',
    daCoTaiKhoan: 'already has an account. Please verify to login',
    xacMinh: 'Verify',
    guiLaiMaSau: 'Resend code after',
    guiLaiMa: 'Resend code',
    maXacMinhHieuLuc: 'Verification code is valid for 15 minutes'
  }
};

// Tạo context
const LanguageContext = createContext();

// Provider component
export const LanguageProvider = ({ children }) => {
  // Lấy ngôn ngữ từ localStorage hoặc mặc định là tiếng Việt
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem('language') || 'vi'
  );
  
  // Chuyển đổi ngôn ngữ
  const toggleLanguage = () => {
    const newLang = currentLang === 'vi' ? 'en' : 'vi';
    setCurrentLang(newLang);
    localStorage.setItem('language', newLang);
  };
  
  // Hàm lấy text theo ngôn ngữ hiện tại
  const t = (key) => {
    return translations[currentLang][key] || key;
  };
  
  // Cập nhật thuộc tính lang của HTML khi ngôn ngữ thay đổi
  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);
  
  return (
    <LanguageContext.Provider value={{ currentLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook để sử dụng language context
export const useLanguage = () => useContext(LanguageContext);