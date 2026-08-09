-- À exécuter sur la base cynasecure existante (init.sql ne les contient pas encore).
-- Ajoute le nécessaire pour la vraie intégration Stripe + suivi des commandes.

USE cynasecure;

ALTER TABLE `users`
  ADD COLUMN `stripe_customer_id` VARCHAR(255) DEFAULT NULL AFTER `role`;

ALTER TABLE `orders`
  ADD COLUMN `stripe_payment_intent_id` VARCHAR(255) DEFAULT NULL AFTER `billing_address_id`;

ALTER TABLE `payment_methods`
  ADD COLUMN `stripe_payment_method_id` VARCHAR(255) DEFAULT NULL AFTER `is_default`;

-- (Optionnel mais recommandé) évite les doublons de moyens de paiement Stripe par utilisateur.
ALTER TABLE `payment_methods`
  ADD UNIQUE KEY `UQ_payment_methods_stripe_id` (`stripe_payment_method_id`);
