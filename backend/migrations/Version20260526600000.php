<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260526600000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Promo codes: add promo_code, promo_code_usage tables and order.promo_code_id/discount fields';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE promo_code (
            id INT AUTO_INCREMENT NOT NULL,
            code VARCHAR(50) NOT NULL,
            type VARCHAR(10) NOT NULL,
            value DOUBLE PRECISION NOT NULL,
            max_uses INT DEFAULT NULL,
            used_count INT NOT NULL DEFAULT 0,
            min_amount DOUBLE PRECISION DEFAULT NULL,
            valid_from DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            valid_until DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            applies_to VARCHAR(20) NOT NULL DEFAULT \'all\',
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME DEFAULT NULL,
            UNIQUE INDEX UNIQ_CODE (code),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('CREATE TABLE promo_code_usage (
            id INT AUTO_INCREMENT NOT NULL,
            promo_code_id INT NOT NULL,
            user_id INT DEFAULT NULL,
            order_ref_id INT DEFAULT NULL,
            discount DOUBLE PRECISION NOT NULL,
            used_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            UNIQUE INDEX UNIQ_USAGE_ORDER (order_ref_id),
            INDEX IDX_USAGE_PROMO (promo_code_id),
            INDEX IDX_USAGE_USER (user_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE promo_code_usage ADD CONSTRAINT FK_USAGE_PROMO FOREIGN KEY (promo_code_id) REFERENCES promo_code (id)');
        $this->addSql('ALTER TABLE promo_code_usage ADD CONSTRAINT FK_USAGE_USER FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE promo_code_usage ADD CONSTRAINT FK_USAGE_ORDER FOREIGN KEY (order_ref_id) REFERENCES `order` (id) ON DELETE SET NULL');

        $this->addSql('ALTER TABLE `order` ADD promo_code_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE `order` ADD discount DOUBLE PRECISION NOT NULL DEFAULT 0');
        $this->addSql('ALTER TABLE `order` ADD CONSTRAINT FK_ORDER_PROMO FOREIGN KEY (promo_code_id) REFERENCES promo_code (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `order` DROP FOREIGN KEY FK_ORDER_PROMO');
        $this->addSql('ALTER TABLE `order` DROP promo_code_id, DROP discount');
        $this->addSql('ALTER TABLE promo_code_usage DROP FOREIGN KEY FK_USAGE_PROMO');
        $this->addSql('ALTER TABLE promo_code_usage DROP FOREIGN KEY FK_USAGE_USER');
        $this->addSql('ALTER TABLE promo_code_usage DROP FOREIGN KEY FK_USAGE_ORDER');
        $this->addSql('DROP TABLE promo_code_usage');
        $this->addSql('DROP TABLE promo_code');
    }
}
