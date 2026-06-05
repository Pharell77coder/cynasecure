<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260605044700 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add video_path column to home_carousel_slide';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE home_carousel_slide ADD video_path VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE home_carousel_slide DROP COLUMN video_path');
    }
}
