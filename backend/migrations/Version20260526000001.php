<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260526000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Order: make user_id nullable, add guest_email for guest checkout';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `order` MODIFY user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE `order` ADD guest_email VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `order` DROP guest_email');
        $this->addSql('ALTER TABLE `order` MODIFY user_id INT NOT NULL');
    }
}
