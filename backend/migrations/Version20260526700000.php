<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260526700000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Subscription: add auto_renew, last_renewal_attempt, renewal_failure_count, payment_method_id';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE subscription ADD auto_renew TINYINT(1) NOT NULL DEFAULT 1');
        $this->addSql('ALTER TABLE subscription ADD last_renewal_attempt DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE subscription ADD renewal_failure_count INT NOT NULL DEFAULT 0');
        $this->addSql('ALTER TABLE subscription ADD payment_method_id VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE subscription DROP auto_renew, DROP last_renewal_attempt, DROP renewal_failure_count, DROP payment_method_id');
    }
}
