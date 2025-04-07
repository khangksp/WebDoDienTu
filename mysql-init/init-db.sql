CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS product_db;
CREATE DATABASE IF NOT EXISTS order_db;
CREATE DATABASE IF NOT EXISTS payment_db;

USE auth_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL,  -- Thêm cột last_login
    is_active BOOLEAN NOT NULL DEFAULT TRUE,  -- Yêu cầu bởi AbstractBaseUser
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,  -- Yêu cầu bởi AbstractBaseUser
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE  -- Yêu cầu bởi PermissionsMixin
);

INSERT INTO users (username, password, email) VALUES ('admin', 'hashed_password', 'admin@example.com');

GRANT ALL PRIVILEGES ON auth_db.* TO "user"@"%";
GRANT ALL PRIVILEGES ON product_db.* TO "user"@"%";
GRANT ALL PRIVILEGES ON order_db.* TO "user"@"%";
GRANT ALL PRIVILEGES ON payment_db.* TO "user"@"%";

FLUSH PRIVILEGES;