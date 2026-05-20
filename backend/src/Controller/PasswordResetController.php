<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class PasswordResetController extends AbstractController
{
    private const GENERIC_MESSAGE = 'Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.';

    #[Route('/api/password-reset/request', name: 'api_password_reset_request', methods: ['POST'])]
    public function request(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $email = trim($data['email'] ?? '');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['message' => self::GENERIC_MESSAGE]);
        }

        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        // Always return the same response to prevent user enumeration
        if (!$user) {
            return new JsonResponse(['message' => self::GENERIC_MESSAGE]);
        }

        $token = bin2hex(random_bytes(32));
        $hash  = hash('sha256', $token);

        $user->setResetToken($hash);
        $user->setResetTokenExpiresAt(new \DateTimeImmutable('+1 hour'));
        $em->flush();

        $response = ['message' => self::GENERIC_MESSAGE];

        // Expose token only in dev so the feature is testable without a mail server
        if ($this->getParameter('kernel.environment') === 'dev') {
            $response['dev_token'] = $token;
        }

        return new JsonResponse($response);
    }

    #[Route('/api/password-reset/confirm', name: 'api_password_reset_confirm', methods: ['POST'])]
    public function confirm(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data        = json_decode($request->getContent(), true) ?? [];
        $token       = trim($data['token'] ?? '');
        $newPassword = $data['newPassword'] ?? '';

        if (!$token || !$newPassword) {
            return new JsonResponse(['message' => 'Token et nouveau mot de passe requis.'], 400);
        }

        if (mb_strlen($newPassword) < 6) {
            return new JsonResponse(['message' => 'Le mot de passe doit contenir au moins 6 caractères.'], 400);
        }

        $hash = hash('sha256', $token);
        $user = $em->getRepository(User::class)->findOneBy(['resetToken' => $hash]);

        if (!$user) {
            return new JsonResponse(['message' => 'Lien invalide ou déjà utilisé.'], 400);
        }

        if ($user->getResetTokenExpiresAt() < new \DateTimeImmutable()) {
            // Clean up the expired token
            $user->setResetToken(null);
            $user->setResetTokenExpiresAt(null);
            $em->flush();

            return new JsonResponse(['message' => 'Ce lien a expiré. Veuillez en demander un nouveau.'], 400);
        }

        $user->setPassword($passwordHasher->hashPassword($user, $newPassword));
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);
        $user->setUpdatedAt(new \DateTime());
        $em->flush();

        return new JsonResponse(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}
