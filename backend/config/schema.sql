-- Drop existing tables if they exist
DROP TABLE IF EXISTS supply_chain;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    ethereum_address VARCHAR(42),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manufacturer_id INTEGER REFERENCES users(id),
    qr_code_hash VARCHAR(64) UNIQUE NOT NULL,
    blockchain_id VARCHAR(66),
    blockchain_tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create supply_chain table
CREATE TABLE IF NOT EXISTS supply_chain (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    from_id INTEGER REFERENCES users(id),
    to_id INTEGER REFERENCES users(id),
    blockchain_tx_hash VARCHAR(66),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 