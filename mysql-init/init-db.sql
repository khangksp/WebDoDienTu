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

-- Tạo bảng users với trường vaitro
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    vaitro ENUM('admin', 'nhanvien', 'khach') NOT NULL DEFAULT 'khach', -- Thêm trường vaitro
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE
);

-- Chèn dữ liệu mẫu với trường vaitro
INSERT IGNORE INTO users (username, password, email, vaitro) 
VALUES ('admin', 'hashed_password', 'admin@example.com', 'admin');

-- Áp dụng các thay đổi quyền
FLUSH PRIVILEGES;