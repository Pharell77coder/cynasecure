<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260501004143 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE payment CHANGE paid_at paid_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE payment RENAME INDEX idx_payment_subscription TO IDX_6D28840D9A1887DC');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE payment CHANGE paid_at paid_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE payment RENAME INDEX idx_6d28840d9a1887dc TO IDX_PAYMENT_SUBSCRIPTION');
    }
}
