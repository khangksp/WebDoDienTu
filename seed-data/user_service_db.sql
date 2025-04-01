CREATE DATABASE user_service_db;
USE user_service_db;

-- Tạo bảng TaiKhoan
CREATE TABLE PhanQuyen (
    MaQuyen INT AUTO_INCREMENT PRIMARY KEY,
    TenQuyen VARCHAR(15) NOT NULL UNIQUE
);

-- Tạo bảng NguoiDung
CREATE TABLE NguoiDung (
    MaNguoiDung INT AUTO_INCREMENT PRIMARY KEY,
    TenNguoiDung VARCHAR(50) NOT NULL,
    DiaChi TEXT,
    Email VARCHAR(50) UNIQUE NOT NULL,
    SoDienThoai VARCHAR(15) UNIQUE NOT NULL
);

-- Tạo bảng TaiKhoan
CREATE TABLE TaiKhoan (
    MaTaiKhoan INT AUTO_INCREMENT PRIMARY KEY,
    MatKhau VARCHAR(255) NOT NULL,
    MaNguoiDung INT UNIQUE NOT NULL,
    MaQuyen INT NOT NULL DEFAULT 2, -- Mặc định là khách hàng
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MaQuyen) REFERENCES PhanQuyen(MaQuyen) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Giá trị quyền:
-- 0 - Quản lý
-- 1 - Nhân viên
-- 2 - Khách hàng (mặc định khi đăng ký)