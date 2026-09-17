-- PostgreSQL Schema for Restaurant QR Ordering System
-- Database: restaurant

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  table_number VARCHAR(20) UNIQUE NOT NULL,
  capacity INT DEFAULT 4,
  location VARCHAR(50) DEFAULT 'Main Dining Hall',
  qr_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'available',
  current_order_id INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image VARCHAR(255),
  is_veg BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  preparation_time INT DEFAULT 15,
  ingredients TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  table_id INT REFERENCES tables(id) ON DELETE SET NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC(10, 2) NOT NULL,
  special_requests TEXT DEFAULT '',
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(20) DEFAULT 'cash',
  payment_status VARCHAR(20) DEFAULT 'pending',
  transaction_id VARCHAR(100),
  estimated_time INT DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedbacks (
  id SERIAL PRIMARY KEY,
  table_id INT REFERENCES tables(id) ON DELETE SET NULL,
  customer_name VARCHAR(100) DEFAULT 'Guest',
  customer_phone VARCHAR(20),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category VARCHAR(50) DEFAULT 'overall',
  feedback TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_requests (
  id SERIAL PRIMARY KEY,
  table_id INT REFERENCES tables(id) ON DELETE SET NULL,
  table_number VARCHAR(20),
  request_type VARCHAR(50) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rewards (
  id SERIAL PRIMARY KEY,
  table_id VARCHAR(50) UNIQUE NOT NULL,
  total_score INT DEFAULT 0,
  game_stats JSONB DEFAULT '{"gamesPlayed": 0, "highScore": 0, "totalPoints": 0}',
  rewards JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_tables_qr ON tables(qr_code);
CREATE INDEX IF NOT EXISTS idx_feedbacks_rating ON feedbacks(rating);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
