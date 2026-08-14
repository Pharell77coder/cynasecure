-- Note : avec l'image Docker postgres:16, la base "cynasecure" est déjà créée
-- automatiquement via la variable d'env POSTGRES_DB. Pas de DROP/CREATE DATABASE ici.
-- Sur Neon/Supabase, exécute ce script directement dans leur éditeur SQL (la base existe déjà).

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  stripe_customer_id VARCHAR(255) DEFAULT NULL,
  confirmation_token VARCHAR(255) DEFAULT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  reset_password_token VARCHAR(255) DEFAULT NULL,
  reset_password_token_expires_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(8) NOT NULL
);

-- images : liste JSON des URLs d'images (ex: ["url1","url2"])
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  images TEXT DEFAULT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  price_monthly INT NOT NULL,
  price_annual INT DEFAULT NULL, -- prix annuel en euros, NULL si pas d'offre annuelle
  available BOOLEAN NOT NULL DEFAULT TRUE,
  category_id INT NOT NULL REFERENCES categories(id)
);
CREATE INDEX idx_products_category_id ON products(category_id);

CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  address1 VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  user_id INT NOT NULL REFERENCES users(id)
);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  status VARCHAR(50) NOT NULL,
  total_amount INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL REFERENCES users(id),
  billing_address_id INT DEFAULT NULL REFERENCES addresses(id),
  stripe_payment_intent_id VARCHAR(255) DEFAULT NULL
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_billing_address_id ON orders(billing_address_id);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  quantity INT NOT NULL,
  unit_price INT NOT NULL,
  billing_period VARCHAR(10) DEFAULT 'monthly', -- monthly ou annual
  order_id INT NOT NULL REFERENCES orders(id),
  product_id INT NOT NULL REFERENCES products(id)
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(30) DEFAULT NULL,
  last4 VARCHAR(4) DEFAULT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_payment_method_id VARCHAR(255) UNIQUE DEFAULT NULL,
  user_id INT NOT NULL REFERENCES users(id)
);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);

INSERT INTO categories (id, slug, name, icon) VALUES
(1, 'soc', 'SOC', '🛡️'),
(2, 'edr', 'EDR', '💻'),
(3, 'xdr', 'XDR', '🔍');
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

INSERT INTO products (id, name, slug, price_monthly, available, category_id, description, images) VALUES
(1, 'Cyna SOC Essential', 'cyna-soc-essential', 299, TRUE, 1, 'Cyna SOC Essential fait partie de notre gamme SOC, pensée pour protéger votre infrastructure au quotidien.', '["/assets/CynaSOCEssential.png"]'),
(2, 'Cyna SOC Advanced', 'cyna-soc-advanced', 499, TRUE, 1, 'Cyna SOC Advanced est conçu pour les entreprises qui nécessitent une protection avancée contre les menaces cyber.', '["/assets/CynaSOCAdvanced.png", "/assets/CynaSOCAdvanced2.png"]'),
(3, 'Cyna SOC Enterprise', 'cyna-soc-enterprise', 899, FALSE, 1, 'Cyna SOC Enterprise offre une solution complète de gestion des risques pour les grandes entreprises.', '["/assets/CynaSOCEnterprise.png"]'),
(4, 'Cyna EDR Pro', 'cyna-edr-pro', 199, TRUE, 2, 'Cyna EDR Pro fournit une détection et une réponse aux menaces en temps réel.', '["/assets/CynaEDRPro.png", "/assets/CynaEDRPro2.png"]'),
(5, 'Cyna EDR Business', 'cyna-edr-business', 349, TRUE, 2, 'Cyna EDR Business est la solution idéale pour les petites et moyennes entreprises.', '["/assets/CynaEDRBusiness.png"]'),
(6, 'Cyna XDR Enterprise', 'cyna-xdr-enterprise', 599, TRUE, 3, 'Cyna XDR Enterprise combine les fonctionnalités de SOC et EDR pour une protection complète.', '["/assets/CynaXDREnterprise.png"]'),
(7, 'Cyna XDR Ultimate', 'cyna-xdr-ultimate', 999, FALSE, 3, 'Cyna XDR Ultimate est la solution la plus avancée pour les entreprises exigeantes.', '["/assets/CynaXDRUltimate.png"]');
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
