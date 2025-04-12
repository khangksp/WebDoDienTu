CREATE DATABASE order_db;
USE order_db;

-- Tạo bảng TrangThai
CREATE TABLE TrangThai (
    MaTrangThai INT AUTO_INCREMENT PRIMARY KEY,
    TenTrangThai VARCHAR(50) NOT NULL
);

-- Tạo bảng DonHang
CREATE TABLE DonHang (
    MaDonHang INT AUTO_INCREMENT PRIMARY KEY,
    MaNguoiDung INT NOT NULL, -- Chỉ lưu ID, không FK
    NgayDatHang TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    MaTrangThai INT NOT NULL,
    TongTien DECIMAL(9,0) NOT NULL,
    DiaChi TEXT NOT NULL,
    FOREIGN KEY (MaTrangThai) REFERENCES TrangThai(MaTrangThai) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tạo bảng ChiTietDonHang
CREATE TABLE ChiTietDonHang (
    MaChiTietDonHang INT AUTO_INCREMENT PRIMARY KEY,
    MaDonHang INT NOT NULL,
    MaSanPham INT NOT NULL, -- Chỉ lưu ID, không FK
    SoLuong INT NOT NULL,
    FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang) ON DELETE CASCADE ON UPDATE CASCADE
);
