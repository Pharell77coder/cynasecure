<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260526500000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Email verification + TOTP 2FA fields on user';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `user`
            ADD email_verified_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            ADD email_verification_token VARCHAR(64) DEFAULT NULL,
            ADD email_verification_expires_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            ADD totp_secret VARCHAR(255) DEFAULT NULL,
            ADD totp_enabled TINYINT(1) NOT NULL DEFAULT 0
        ');

        // Mark all existing users as verified (retro-compat)
        $this->addSql('UPDATE `user` SET email_verified_at = updated_at WHERE email_verified_at IS NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `user`
            DROP email_verified_at,
            DROP email_verification_token,
            DROP email_verification_expires_at,
            DROP totp_secret,
            DROP totp_enabled
        ');
    }
}
