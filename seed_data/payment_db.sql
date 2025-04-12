CREATE DATABASE payment_db;
USE payment_db;

CREATE TABLE ThanhToan (
    MaThanhToan INT AUTO_INCREMENT PRIMARY KEY,
    MaDonHang INT NOT NULL, -- Lưu ID DonHang từ order_service
    PhuongThucThanhToan ENUM('Thanh toán khi nhận hàng', 'Chuyển khoản ngân hàng', 'Thẻ tín dụng/Ghi nợ') NOT NULL,
    NgayThanhToan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TrangThaiThanhToan VARCHAR(50) NOT NULL
);
