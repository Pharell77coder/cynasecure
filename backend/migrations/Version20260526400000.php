<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260526400000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Address entity + User: stripeCustomerId, pendingEmail fields';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE address (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            company VARCHAR(150) DEFAULT NULL,
            line1 VARCHAR(255) NOT NULL,
            line2 VARCHAR(255) DEFAULT NULL,
            city VARCHAR(100) NOT NULL,
            region VARCHAR(100) DEFAULT NULL,
            postal_code VARCHAR(20) NOT NULL,
            country VARCHAR(2) NOT NULL DEFAULT \'FR\',
            phone VARCHAR(30) DEFAULT NULL,
            is_default TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_D4E6F81A76ED395 (user_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE address ADD CONSTRAINT FK_D4E6F81A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');

        $this->addSql('ALTER TABLE `user`
            ADD stripe_customer_id VARCHAR(255) DEFAULT NULL,
            ADD pending_email VARCHAR(255) DEFAULT NULL,
            ADD pending_email_token VARCHAR(64) DEFAULT NULL,
            ADD pending_email_expires_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'
        ');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE address DROP FOREIGN KEY FK_D4E6F81A76ED395');
        $this->addSql('DROP TABLE address');
        $this->addSql('ALTER TABLE `user`
            DROP stripe_customer_id,
            DROP pending_email,
            DROP pending_email_token,
            DROP pending_email_expires_at
        ');
    }
}
