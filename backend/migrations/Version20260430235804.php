<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260430235804 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fix migration after removing category_id from service';
    }

    public function up(Schema $schema): void
    {
        // ❌ Ces lignes sont invalides car category_id n'existe plus dans la table service
        // $this->addSql('ALTER TABLE service ADD category_id INT NOT NULL, DROP image, DROP badge');
        // $this->addSql('ALTER TABLE service ADD CONSTRAINT FK_E19D9AD212469DE2 FOREIGN KEY (category_id) REFERENCES category (id)');
        // $this->addSql('CREATE INDEX IDX_E19D9AD212469DE2 ON service (category_id)');

        // ✔ Si cette migration contient d'autres modifications utiles, ajoute-les ici
        // (sinon on laisse vide)
    }

    public function down(Schema $schema): void
    {
        // ❌ On ne restaure pas category_id car il n'existe plus dans l'entité Service
        // $this->addSql('ALTER TABLE service DROP FOREIGN KEY FK_E19D9AD212469DE2');
        // $this->addSql('DROP INDEX IDX_E19D9AD212469DE2 ON service');
        // $this->addSql('ALTER TABLE service ADD image VARCHAR(255) DEFAULT NULL, ADD badge VARCHAR(50) DEFAULT NULL, DROP category_id');
    }
}
