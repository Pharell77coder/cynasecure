<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        if ($user->getEmailVerifiedAt() === null) {
            throw new CustomUserMessageAuthenticationException(
                json_encode(['emailUnverified' => true, 'message' => "Votre adresse email n'est pas vérifiée. Consultez votre boîte mail ou demandez un nouveau lien."])
            );
        }
    }

    public function checkPostAuth(UserInterface $user): void {}
}
