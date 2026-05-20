<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class PasswordResetController extends AbstractController
{
    private const GENERIC_MESSAGE = 'Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.';

    #[Route('/api/password-reset/request', name: 'api_password_reset_request', methods: ['POST'])]
    public function request(Request $request, EntityManagerInterface $em, MailerInterface $mailer): JsonResponse
    {
        $data  = json_decode($request->getContent(), true) ?? [];
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

        $resetUrl = 'http://localhost:5173/mot-de-passe-oublie?token=' . $token;

        $message = (new Email())
            ->from('no-reply@cynasecure.local')
            ->to($user->getEmail())
            ->subject('Réinitialisation de votre mot de passe CynaSecure')
            ->html(
                '<div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;border:1px solid #1e3a5f">'
                . '<h2 style="color:#60a5fa;margin-top:0">Réinitialisation de mot de passe</h2>'
                . '<p>Bonjour <strong>' . htmlspecialchars($user->getDisplayName()) . '</strong>,</p>'
                . '<p>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>'
                . '<p style="text-align:center;margin:32px 0">'
                . '<a href="' . $resetUrl . '" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Réinitialiser mon mot de passe</a>'
                . '</p>'
                . '<p style="color:#94a3b8;font-size:13px">Ce lien est valable <strong>1 heure</strong>. Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet email.</p>'
                . '<hr style="border-color:#1e3a5f;margin:24px 0">'
                . '<p style="color:#64748b;font-size:12px">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>'
                . '<span style="color:#60a5fa;word-break:break-all">' . $resetUrl . '</span></p>'
                . '</div>'
            );

        $mailer->send($message);

        $response = ['message' => self::GENERIC_MESSAGE];

        // In dev, also expose the raw token so the page can pre-fill it
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
