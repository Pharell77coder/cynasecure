<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260513225539 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE service DROP FOREIGN KEY `fk_service_category`');
        $this->addSql('ALTER TABLE service ADD long_description LONGTEXT DEFAULT NULL, ADD features JSON DEFAULT NULL, CHANGE title name VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE service DROP long_description, DROP features, CHANGE name title VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE service ADD CONSTRAINT `fk_service_category` FOREIGN KEY (category_id) REFERENCES category (id) ON UPDATE CASCADE ON DELETE SET NULL');
    }
}
