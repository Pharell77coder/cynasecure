-- Complète migrations/alter_tables.sql : ajoute la description produit
-- (utilisée par la nouvelle page détail produit du front).

USE cynasecure;

ALTER TABLE `products`
  ADD COLUMN `description` TEXT DEFAULT NULL AFTER `name`;
