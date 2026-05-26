<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260526800000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fraud detection: add fraud_check table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE fraud_check (
            id INT AUTO_INCREMENT NOT NULL,
            order_ref_id INT NOT NULL,
            score INT NOT NULL DEFAULT 0,
            level VARCHAR(20) NOT NULL DEFAULT \'ok\',
            rules JSON NOT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            user_agent VARCHAR(512) DEFAULT NULL,
            checked_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            UNIQUE INDEX UNIQ_FRAUD_ORDER (order_ref_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE fraud_check ADD CONSTRAINT FK_FRAUD_ORDER FOREIGN KEY (order_ref_id) REFERENCES `order` (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE fraud_check DROP FOREIGN KEY FK_FRAUD_ORDER');
        $this->addSql('DROP TABLE fraud_check');
    }
}
