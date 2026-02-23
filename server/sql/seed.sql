CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  password_hash TEXT,
  full_name TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('guest', 'member', 'admin')),
  honey_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image_url TEXT,
  stock_level INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  order_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL
);

-- Keep-the-boss reset:
-- 1) remove all transactional activity
-- 2) remove non-admin users
-- 3) preserve admin account(s)
TRUNCATE order_items, orders RESTART IDENTITY CASCADE;
DELETE FROM users WHERE role <> 'admin';


WITH starter_menu (name, description, price, category, image_url, stock_level) AS (
  VALUES
    ('Espresso Noir', 'Our signature dark roast with notes of chocolate and molasses.', 65.00, 'coffee', 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=600&q=80', 110),
    ('Matcha Cloud Latte', 'Premium ceremonial matcha topped with vanilla cold foam.', 110.00, 'tea', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80', 70),
    ('Honeybee Macchiato', 'Espresso with steamed oat milk and local organic honey.', 95.00, 'coffee', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80', 60),
    ('Cold Brew Float', '12-hour steeped cold brew with vanilla bean ice cream.', 125.00, 'coffee', 'https://images.unsplash.com/photo-1461023058943-07fcaf1835e7?auto=format&fit=crop&w=600&q=80', 45)
)
UPDATE products p
SET
  description = m.description,
  price = m.price,
  category = m.category,
  image_url = m.image_url,
  stock_level = m.stock_level
FROM starter_menu m
WHERE p.name = m.name;

WITH starter_menu (name, description, price, category, image_url, stock_level) AS (
  VALUES
    ('Espresso Noir', 'Our signature dark roast with notes of chocolate and molasses.', 65.00, 'coffee', 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=600&q=80', 110),
    ('Matcha Cloud Latte', 'Premium ceremonial matcha topped with vanilla cold foam.', 110.00, 'tea', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80', 70),
    ('Honeybee Macchiato', 'Espresso with steamed oat milk and local organic honey.', 95.00, 'coffee', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80', 60),
    ('Cold Brew Float', '12-hour steeped cold brew with vanilla bean ice cream.', 125.00, 'coffee', 'https://images.unsplash.com/photo-1461023058943-07fcaf1835e7?auto=format&fit=crop&w=600&q=80', 45)
)
INSERT INTO products (name, description, price, category, image_url, stock_level)
SELECT m.name, m.description, m.price, m.category, m.image_url, m.stock_level
FROM starter_menu m
WHERE NOT EXISTS (
  SELECT 1
  FROM products p
  WHERE p.name = m.name
);
