<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260523000219 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE chatbot_conversation (id INT AUTO_INCREMENT NOT NULL, session_id VARCHAR(36) NOT NULL, email VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_764526E8613FECDF (session_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE chatbot_message (id INT AUTO_INCREMENT NOT NULL, sender VARCHAR(10) NOT NULL, content LONGTEXT NOT NULL, created_at DATETIME NOT NULL, conversation_id INT NOT NULL, INDEX IDX_EDF1E8849AC0396 (conversation_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE contact_message (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(255) NOT NULL, subject VARCHAR(100) NOT NULL, message LONGTEXT NOT NULL, status VARCHAR(20) NOT NULL, ip_address VARCHAR(45) DEFAULT NULL, created_at DATETIME NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE chatbot_message ADD CONSTRAINT FK_EDF1E8849AC0396 FOREIGN KEY (conversation_id) REFERENCES chatbot_conversation (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE chatbot_message DROP FOREIGN KEY FK_EDF1E8849AC0396');
        $this->addSql('DROP TABLE chatbot_conversation');
        $this->addSql('DROP TABLE chatbot_message');
        $this->addSql('DROP TABLE contact_message');
    }
}
