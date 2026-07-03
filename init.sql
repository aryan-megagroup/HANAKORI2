CREATE DATABASE IF NOT EXISTS hanakori_db;
USE hanakori_db;

CREATE USER IF NOT EXISTS 'user_hanakori'@'%' IDENTIFIED BY 'userpassword';
GRANT ALL PRIVILEGES ON hanakori_db.* TO 'user_hanakori'@'%';
FLUSH PRIVILEGES;
-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    menu_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    is_available TINYINT(1) DEFAULT 1
);

-- 2. Promos Table
CREATE TABLE IF NOT EXISTS promos (
    promo_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type VARCHAR(50) NOT NULL,
    discount_value INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    order_type VARCHAR(50) NOT NULL,
    seat_number INT DEFAULT NULL,
    total_price INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Seed default product
INSERT INTO products (name, price, description, category, image_url, is_available) 
VALUES ('Strawberry Shaved Ice (Strawberry)', 600, 'Fresh strawberries with sweet condensed milk.', 'Ice', 'uploads/strawberry.jpg', 1)
ON DUPLICATE KEY UPDATE name=name;  

CREATE USER IF NOT EXISTS 'user_hanakori'@'%' IDENTIFIED BY 'userpassword';
GRANT ALL PRIVILEGES ON hanakori_db.* TO 'user_hanakori'@'%';
FLUSH PRIVILEGES;
