CREATE DATABASE user_service_db;
USE user_service_db;

-- Tạo bảng TaiKhoan
CREATE TABLE TaiKhoan (
    MaTaiKhoan INT AUTO_INCREMENT PRIMARY KEY,
    TenDangNhap VARCHAR(50) UNIQUE NOT NULL,
    MatKhau VARCHAR(255) NOT NULL,
    LoaiQuyen INT NOT NULL DEFAULT 2 -- 0: Quản lý, 1: Nhân viên, 2: Khách hàng
);

-- Tạo bảng NguoiDung
CREATE TABLE NguoiDung (
    MaNguoiDung INT AUTO_INCREMENT PRIMARY KEY,
    TenNguoiDung VARCHAR(50) NOT NULL,
    DiaChi TEXT,
    Email VARCHAR(50) UNIQUE NOT NULL,
    SoDienThoai VARCHAR(15) UNIQUE NOT NULL,
    MaTaiKhoan INT UNIQUE NOT NULL,
    FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan) ON DELETE CASCADE ON UPDATE CASCADE
);