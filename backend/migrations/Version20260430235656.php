<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260430235656 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fix service table and add SaaS fields to subscription';
    }

    public function up(Schema $schema): void
    {
        // ❌ On ne touche plus à la table service (colonnes déjà existantes)
        // ❌ Pas de DROP, pas de CHANGE, pas de ADD

        // ✔ On applique uniquement les modifications Subscription PRO
        $this->addSql('ALTER TABLE subscription ADD cycle VARCHAR(20) NOT NULL');
        $this->addSql('ALTER TABLE subscription ADD price DOUBLE PRECISION NOT NULL');
        $this->addSql('ALTER TABLE subscription ADD next_billing_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE subscription CHANGE status status VARCHAR(20) NOT NULL');
        $this->addSql('ALTER TABLE subscription CHANGE user_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE subscription CHANGE service_id service_id INT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // Down minimal (on ne restaure pas service)
        $this->addSql('ALTER TABLE subscription DROP cycle, DROP price, DROP next_billing_at, CHANGE status status VARCHAR(50) NOT NULL, CHANGE user_id user_id INT DEFAULT NULL, CHANGE service_id service_id INT DEFAULT NULL');
    }
}
