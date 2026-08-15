DROP DATABASE IF EXISTS cynasecure;
CREATE DATABASE cynasecure;
USE cynasecure;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'user',
  `stripe_customer_id` varchar(255) DEFAULT NULL,
  `confirmation_token` varchar(255) DEFAULT NULL,
  `is_verified` tinyint NOT NULL DEFAULT '0',
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_token_expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
);

CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `icon` varchar(8) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `name` (`name`)
);

CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `images` text DEFAULT NULL COMMENT 'Liste JSON des URLs d''images (ex: ["url1","url2"])',
  `slug` varchar(100) NOT NULL,
  `price_monthly` int NOT NULL,
  `price_annual` int DEFAULT NULL COMMENT 'Prix annuel en euros, NULL si pas d''offre annuelle',
  `available` tinyint NOT NULL DEFAULT '1',
  `category_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`),
  KEY `IDX_products_category_id` (`category_id`),
  CONSTRAINT `FK_products_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
);

CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `address1` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_addresses_user_id` (`user_id`),
  CONSTRAINT `FK_addresses_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(50) NOT NULL,
  `total_amount` int NOT NULL,
  `created_at` datetime NOT NULL,
  `user_id` int NOT NULL,
  `billing_address_id` int DEFAULT NULL,
  `stripe_payment_intent_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_orders_user_id` (`user_id`),
  KEY `IDX_orders_billing_address_id` (`billing_address_id`),
  CONSTRAINT `FK_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_orders_billing_address_id` FOREIGN KEY (`billing_address_id`) REFERENCES `addresses` (`id`)
);

CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `unit_price` int NOT NULL,
  `billing_period` varchar(10) DEFAULT 'monthly' COMMENT 'monthly ou annual',
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_order_items_order_id` (`order_id`),
  KEY `IDX_order_items_product_id` (`product_id`),
  CONSTRAINT `FK_order_items_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FK_order_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
);

CREATE TABLE `payment_methods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `brand` varchar(30) DEFAULT NULL,
  `last4` varchar(4) DEFAULT NULL,
  `is_default` tinyint NOT NULL DEFAULT '0',
  `stripe_payment_method_id` varchar(255) DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_payment_methods_stripe_id` (`stripe_payment_method_id`),
  KEY `IDX_payment_methods_user_id` (`user_id`),
  CONSTRAINT `FK_payment_methods_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
);

ALTER TABLE orders 
MODIFY COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;


INSERT INTO `categories` (`id`, `slug`, `name`, `icon`) VALUES
(1, 'soc', 'SOC', '🛡️'),
(2, 'edr', 'EDR', '💻'),
(3, 'xdr', 'XDR', '🔍');

INSERT INTO `products` (`id`, `name`, `slug`, `price_monthly`, `available`, `category_id`, `description`, `images`) VALUES
(1, 'Cyna SOC Essential', 'cyna-soc-essential', 299, 1, 1,'Cyna SOC Essential fait partie de notre gamme SOC, pensée pour protéger votre infrastructure au quotidien.', '["/assets/CynaSOCEssential.png"]'),
(2, 'Cyna SOC Advanced', 'cyna-soc-advanced', 499, 1, 1,'Cyna SOC Advanced est conçu pour les entreprises qui nécessitent une protection avancée contre les menaces cyber.', '["/assets/CynaSOCAdvanced.png", "/assets/CynaSOCAdvanced2.png"]'),
(3, 'Cyna SOC Enterprise', 'cyna-soc-enterprise', 899, 0, 1,'Cyna SOC Enterprise offre une solution complète de gestion des risques pour les grandes entreprises.', '["/assets/CynaSOCEnterprise.png"]'),
(4, 'Cyna EDR Pro', 'cyna-edr-pro', 199, 1, 2,'Cyna EDR Pro fournit une détection et une réponse aux menaces en temps réel.', '["/assets/CynaEDRPro.png", "/assets/CynaEDRPro2.png"]'),
(5, 'Cyna EDR Business', 'cyna-edr-business', 349, 1, 2,'Cyna EDR Business est la solution idéale pour les petites et moyennes entreprises.', '["/assets/CynaEDRBusiness.png"]'),
(6, 'Cyna XDR Enterprise', 'cyna-xdr-enterprise', 599, 1, 3,'Cyna XDR Enterprise combine les fonctionnalités de SOC et EDR pour une protection complète.', '["/assets/CynaXDREnterprise.png"]'),
(7, 'Cyna XDR Ultimate', 'cyna-xdr-ultimate', 999, 0, 3,'Cyna XDR Ultimate est la solution la plus avancée pour les entreprises exigeantes.', '["/assets/CynaXDRUltimate.png"]');