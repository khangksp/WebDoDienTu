-- Tạo các cơ sở dữ liệu nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS product_db;
CREATE DATABASE IF NOT EXISTS order_db;
CREATE DATABASE IF NOT EXISTS payment_db;

-- Tạo người dùng 'user' nếu chưa tồn tại và đặt mật khẩu
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';

-- Cấp toàn quyền cho người dùng 'user' trên các cơ sở dữ liệu
GRANT ALL PRIVILEGES ON auth_db.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON product_db.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON order_db.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON payment_db.* TO 'user'@'%';

-- Sử dụng cơ sở dữ liệu auth_db
USE auth_db;

-- Tạo bảng taikhoan
CREATE TABLE IF NOT EXISTS taikhoan (
    mataikhoan INT AUTO_INCREMENT PRIMARY KEY,
    tendangnhap VARCHAR(255) NOT NULL UNIQUE,
    matkhau VARCHAR(255) NOT NULL,
    loaiquyen ENUM('admin', 'nhanvien', 'khach') NOT NULL DEFAULT 'khach',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tạo bảng nguoidung
CREATE TABLE IF NOT EXISTS nguoidung (
    manguoidung INT AUTO_INCREMENT PRIMARY KEY,
    tennguoidung VARCHAR(255) NOT NULL,
    diachi VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    sodienthoai VARCHAR(255) NOT NULL UNIQUE,
    fk_taikhoan INT NOT NULL,
    FOREIGN KEY (fk_taikhoan) REFERENCES taikhoan(mataikhoan) ON DELETE CASCADE
);
-- Chèn dữ liệu mẫu với trường vaitro
-- Chèn dữ liệu vào bảng taikhoan
INSERT INTO taikhoan (tendangnhap, matkhau, loaiquyen, created_at, last_login, is_active, is_staff, is_superuser)
SELECT taikhoan, matkhau, vaitro, created_at, last_login, is_active, is_staff, is_superuser
FROM users;

INSERT INTO nguoidung (tennguoidung, diachi, email, sodienthoai, fk_taikhoan)
SELECT taikhoan, NULL, email, sodienthoai, id
FROM users;
-- Áp dụng các thay đổi quyền
FLUSH PRIVILEGES;