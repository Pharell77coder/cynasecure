<?php

namespace App\Security;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;

class TwoFactorSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    public function __construct(private EntityManagerInterface $em) {}

    public function onAuthenticationSuccess(Request $request, TokenInterface $token): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->findOneBy([
            'email' => $token->getUser()->getUserIdentifier(),
        ]);

        return new JsonResponse([
            'token' => 'session',
            'user'  => [
                'id'          => $user?->getId(),
                'email'       => $user?->getEmail(),
                'displayName' => $user?->getDisplayName(),
                'role'        => $user?->getRole(),
                'phone'       => $user?->getPhone(),
                'company'     => $user?->getCompany(),
                'createdAt'   => $user?->getCreatedAt()?->format('c'),
                'updatedAt'   => $user?->getUpdatedAt()?->format('c'),
            ],
        ]);
    }
}
