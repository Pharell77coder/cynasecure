<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class EmailChangeController extends AbstractController
{
    #[Route('/api/me/email/request-change', name: 'email_change_request', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function requestChange(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher,
        MailerInterface $mailer,
        UserRepository $userRepo
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true) ?? [];

        $currentPassword = $data['currentPassword'] ?? '';
        $newEmail = trim(strtolower($data['newEmail'] ?? ''));

        if (empty($currentPassword) || empty($newEmail)) {
            return $this->json(['message' => 'Mot de passe et nouvel email requis.'], 400);
        }

        if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['message' => 'Adresse email invalide.'], 400);
        }

        if ($newEmail === $user->getEmail()) {
            return $this->json(['message' => 'C\'est déjà votre email actuel.'], 400);
        }

        if (!$hasher->isPasswordValid($user, $currentPassword)) {
            return $this->json(['message' => 'Mot de passe incorrect.'], 401);
        }

        if ($userRepo->findOneBy(['email' => $newEmail])) {
            return $this->json(['message' => 'Cet email est déjà utilisé.'], 409);
        }

        $rawToken = bin2hex(random_bytes(32));
        $hashedToken = hash('sha256', $rawToken);

        $user->setPendingEmail($newEmail);
        $user->setPendingEmailToken($hashedToken);
        $user->setPendingEmailExpiresAt(new \DateTimeImmutable('+24 hours'));
        $em->flush();

        $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:5173';
        $link = $frontendUrl . '/verify-email-change?token=' . $rawToken;

        $email = (new Email())
            ->from('noreply@cynasecure.fr')
            ->to($newEmail)
            ->subject('Confirmez votre nouvelle adresse email')
            ->html(
                '<p>Bonjour ' . htmlspecialchars($user->getDisplayName()) . ',</p>' .
                '<p>Cliquez sur le lien ci-dessous pour confirmer votre nouvelle adresse email :</p>' .
                '<p><a href="' . $link . '">' . $link . '</a></p>' .
                '<p>Ce lien expire dans 24 heures.</p>' .
                '<p>Si vous n\'avez pas fait cette demande, ignorez cet email.</p>'
            );

        try {
            $mailer->send($email);
        } catch (\Exception) {
            // Log but don't expose mailer errors to client
        }

        return $this->json(['message' => 'Un email de confirmation a été envoyé à ' . $newEmail . '.']);
    }

    #[Route('/api/email/verify-change', name: 'email_change_verify', methods: ['POST'])]
    public function verifyChange(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $userRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];
        $rawToken = $data['token'] ?? '';

        if (empty($rawToken)) {
            return $this->json(['message' => 'Token manquant.'], 400);
        }

        $hashedToken = hash('sha256', $rawToken);
        $user = $userRepo->findOneBy(['pendingEmailToken' => $hashedToken]);

        if (!$user) {
            return $this->json(['message' => 'Token invalide.'], 400);
        }

        if ($user->getPendingEmailExpiresAt() < new \DateTimeImmutable()) {
            $user->setPendingEmail(null);
            $user->setPendingEmailToken(null);
            $user->setPendingEmailExpiresAt(null);
            $em->flush();
            return $this->json(['message' => 'Token expiré.'], 400);
        }

        $newEmail = $user->getPendingEmail();

        if ($userRepo->findOneBy(['email' => $newEmail])) {
            $user->setPendingEmail(null);
            $user->setPendingEmailToken(null);
            $user->setPendingEmailExpiresAt(null);
            $em->flush();
            return $this->json(['message' => 'Cet email est déjà utilisé.'], 409);
        }

        $user->setEmail($newEmail);
        $user->setPendingEmail(null);
        $user->setPendingEmailToken(null);
        $user->setPendingEmailExpiresAt(null);
        $em->flush();

        return $this->json(['message' => 'Adresse email mise à jour avec succès.']);
    }
}
