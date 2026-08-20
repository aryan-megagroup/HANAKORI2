-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    menu_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    description TEXT,
    category VARCHAR(50),
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE
);

-- Create Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
    promo_id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    order_code VARCHAR(20) UNIQUE NOT NULL,
    order_type VARCHAR(20) NOT NULL,
    seat_number INT,
    total_price INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    quantity INT NOT NULL,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE ON UPDATE CASCADE
);