<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260526200000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Home editable: carousel, content, category home fields, service home_position + seed data';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("
            CREATE TABLE home_carousel_slide (
                id INT AUTO_INCREMENT NOT NULL,
                title VARCHAR(120) NOT NULL,
                subtitle VARCHAR(240) DEFAULT NULL,
                image_path VARCHAR(255) DEFAULT NULL,
                cta_label VARCHAR(60) DEFAULT NULL,
                cta_url VARCHAR(255) DEFAULT NULL,
                position INT NOT NULL DEFAULT 0,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at DATETIME DEFAULT NULL,
                updated_at DATETIME DEFAULT NULL,
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB
        ");

        $this->addSql("
            CREATE TABLE home_content (
                id INT AUTO_INCREMENT NOT NULL,
                slug VARCHAR(100) NOT NULL,
                title VARCHAR(120) DEFAULT NULL,
                content LONGTEXT NOT NULL,
                updated_at DATETIME DEFAULT NULL,
                UNIQUE INDEX UNIQ_HOME_CONTENT_SLUG (slug),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB
        ");

        $this->addSql('ALTER TABLE service ADD home_position INT DEFAULT NULL');
        $this->addSql('ALTER TABLE category ADD home_position INT DEFAULT NULL');
        $this->addSql('ALTER TABLE category ADD image_path VARCHAR(255) DEFAULT NULL');

        $this->addSql("
            INSERT INTO home_carousel_slide (title, subtitle, position, is_active) VALUES
                ('Protection XDR unifiée', 'Détectez et répondez aux menaces avancées en temps réel.', 0, 1),
                ('Zero Trust intégré', 'Vérification continue de chaque accès, chaque identité.', 1, 1),
                ('Déployé en 48 heures', 'Opérationnel rapidement, sans refonte de votre infrastructure.', 2, 1)
        ");

        $this->addSql("
            INSERT INTO home_content (slug, title, content) VALUES
                ('hero_intro', 'La cybersécurité de nouvelle génération',
                 'Cynasecure protège vos actifs critiques avec une plateforme XDR unifiée, conçue pour les entreprises qui ne peuvent pas se permettre d\\'échouer.')
        ");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE home_carousel_slide');
        $this->addSql('DROP TABLE home_content');
        $this->addSql('ALTER TABLE service DROP home_position');
        $this->addSql('ALTER TABLE category DROP home_position, DROP image_path');
    }
}
