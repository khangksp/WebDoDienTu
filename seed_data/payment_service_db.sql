CREATE DATABASE payment_service_db;
USE payment_service_db;

-- Tạo bảng ThanhToan
CREATE TABLE ThanhToan (
    MaThanhToan INT AUTO_INCREMENT PRIMARY KEY,
    MaDonHang INT NOT NULL,
    PhuongThucThanhToan ENUM('Thanh toán khi nhận hàng', 'Chuyển khoản ngân hàng', 'Thẻ tín dụng/Ghi nợ') NOT NULL,
    NgayThanhToan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    MaTrangThai INT NOT NULL,
    DiaChi TEXT
    -- FOREIGN KEY (MaDonHang) REFERENCES DonHang(MaDonHang) ON DELETE CASCADE ON UPDATE CASCADE,
    -- FOREIGN KEY (MaTrangThai) REFERENCES TrangThai(MaTrangThai) ON DELETE RESTRICT ON UPDATE CASCADE
);