CREATE DATABASE product_service_db;
USE product_service_db;

-- Tạo bảng LoaiSanPham
CREATE TABLE LoaiSanPham (
    MaLoaiSanPham INT AUTO_INCREMENT PRIMARY KEY,
    TenLoaiSanPham VARCHAR(50) NOT NULL
);

-- Tạo bảng HangSanXuat
CREATE TABLE HangSanXuat (
    MaHangSanXuat INT AUTO_INCREMENT PRIMARY KEY,
    TenHangSanXuat VARCHAR(50) NOT NULL
);

-- Tạo bảng ThongSo
CREATE TABLE ThongSo (
    MaThongSo INT AUTO_INCREMENT PRIMARY KEY,
    TenThongSo VARCHAR(50) NOT NULL
);

-- Tạo bảng KhuyenMai
CREATE TABLE KhuyenMai (
    MaKhuyenMai INT AUTO_INCREMENT PRIMARY KEY,
    TenKhuyenMai VARCHAR(100) NOT NULL,
    GiamGia DECIMAL(2,0) NOT NULL,
    NgayBatDau DATE NOT NULL,
    NgayKetThuc DATE NOT NULL
);

-- Tạo bảng SanPham
CREATE TABLE SanPham (
    MaSanPham INT AUTO_INCREMENT PRIMARY KEY,
    TenSanPham VARCHAR(100) NOT NULL,
    GiaBan DECIMAL(9,0) NOT NULL,
    SoLuongTon INT NOT NULL,
    MoTa TEXT,
    HinhAnh TEXT,
    MaLoaiSanPham INT NOT NULL,
    MaHangSanXuat INT NOT NULL,
    MaThongSo INT NOT NULL,
    MaKhuyenMai INT,
    FOREIGN KEY (MaLoaiSanPham) REFERENCES LoaiSanPham(MaLoaiSanPham) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MaHangSanXuat) REFERENCES HangSanXuat(MaHangSanXuat) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MaThongSo) REFERENCES ThongSo(MaThongSo) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MaKhuyenMai) REFERENCES KhuyenMai(MaKhuyenMai) ON DELETE SET NULL ON UPDATE CASCADE
);