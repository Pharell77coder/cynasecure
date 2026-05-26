<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260526300000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Service: images (json), technical_specs (json), availability (enum), trial_available (bool)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE service ADD images JSON DEFAULT NULL');
        $this->addSql('ALTER TABLE service ADD technical_specs JSON DEFAULT NULL');
        $this->addSql("ALTER TABLE service ADD availability VARCHAR(20) NOT NULL DEFAULT 'available'");
        $this->addSql('ALTER TABLE service ADD trial_available TINYINT(1) NOT NULL DEFAULT 0');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE service DROP images, DROP technical_specs, DROP availability, DROP trial_available');
    }
}
