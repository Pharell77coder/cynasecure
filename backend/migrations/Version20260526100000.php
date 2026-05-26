<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260526100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Service: add is_available, created_at, indexes for search';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE service ADD is_available TINYINT(1) NOT NULL DEFAULT 1');
        $this->addSql('ALTER TABLE service ADD created_at DATETIME DEFAULT NULL');
        $this->addSql('CREATE INDEX idx_service_name ON service (name)');
        $this->addSql('CREATE INDEX idx_service_price ON service (price_monthly)');
        $this->addSql('CREATE INDEX idx_service_available ON service (is_available)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX idx_service_name ON service');
        $this->addSql('DROP INDEX idx_service_price ON service');
        $this->addSql('DROP INDEX idx_service_available ON service');
        $this->addSql('ALTER TABLE service DROP is_available, DROP created_at');
    }
}
