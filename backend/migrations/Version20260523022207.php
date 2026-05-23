<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260523022207 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `order` ADD billing_address JSON DEFAULT NULL, ADD stripe_payment_intent_id VARCHAR(255) DEFAULT NULL, ADD paypal_order_id VARCHAR(255) DEFAULT NULL, ADD gateway VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE order_item ADD billing VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE payment ADD gateway VARCHAR(20) DEFAULT NULL, ADD paypal_order_id VARCHAR(255) DEFAULT NULL, ADD last4 VARCHAR(10) DEFAULT NULL, ADD invoice_number VARCHAR(50) DEFAULT NULL, ADD order_ref_id INT DEFAULT NULL, CHANGE subscription_id subscription_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE payment ADD CONSTRAINT FK_6D28840DE238517C FOREIGN KEY (order_ref_id) REFERENCES `order` (id)');
        $this->addSql('CREATE INDEX IDX_6D28840DE238517C ON payment (order_ref_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `order` DROP billing_address, DROP stripe_payment_intent_id, DROP paypal_order_id, DROP gateway');
        $this->addSql('ALTER TABLE order_item DROP billing');
        $this->addSql('ALTER TABLE payment DROP FOREIGN KEY FK_6D28840DE238517C');
        $this->addSql('DROP INDEX IDX_6D28840DE238517C ON payment');
        $this->addSql('ALTER TABLE payment DROP gateway, DROP paypal_order_id, DROP last4, DROP invoice_number, DROP order_ref_id, CHANGE subscription_id subscription_id INT NOT NULL');
    }
}
