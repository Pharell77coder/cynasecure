<?php

namespace App\Controller;

use App\Entity\User;
use App\Validator\StrongPassword;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController extends AbstractController
{
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(): never
    {
        throw new \LogicException('json_login handles this route.');
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher,
        ValidatorInterface $validator,
        MailerInterface $mailer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];

        $email       = trim($data['email'] ?? '');
        $password    = $data['password'] ?? '';
        $displayName = trim($data['displayName'] ?? '');

        if (!$email || !$password) {
            return new JsonResponse(['message' => 'Email et mot de passe requis'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['message' => 'Adresse email invalide. Utilisez le format exemple@domaine.com'], 400);
        }

        $violations = $validator->validate($password, [new StrongPassword()]);
        if (count($violations) > 0) {
            return new JsonResponse(['message' => $violations[0]->getMessage()], 400);
        }

        if ($em->getRepository(User::class)->findOneBy(['email' => $email])) {
            return new JsonResponse(['message' => 'Email déjà utilisé'], 400);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($hasher->hashPassword($user, $password));
        $user->setDisplayName($displayName ?: $email);
        $user->setRole('ROLE_USER');
        $user->setCreatedAt(new \DateTimeImmutable());
        $user->setUpdatedAt(new \DateTime());

        $raw  = bin2hex(random_bytes(32));
        $user->setEmailVerificationToken(hash('sha256', $raw));
        $user->setEmailVerificationExpiresAt(new \DateTimeImmutable('+24 hours'));

        $em->persist($user);
        $em->flush();

        $this->sendVerificationEmail($mailer, $user, $raw);

        return new JsonResponse([
            'needsVerification' => true,
            'message'           => 'Un email de vérification a été envoyé à ' . $email . '.',
        ], 201);
    }

    #[Route('/api/auth/verify-email', name: 'api_verify_email', methods: ['POST'])]
    public function verifyEmail(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $token = trim(json_decode($request->getContent(), true)['token'] ?? '');

        if (!$token) {
            return new JsonResponse(['message' => 'Token manquant.'], 400);
        }

        $hash = hash('sha256', $token);
        $user = $em->getRepository(User::class)->findOneBy(['emailVerificationToken' => $hash]);

        if (!$user) {
            return new JsonResponse(['message' => 'Lien invalide.'], 400);
        }

        if ($user->getEmailVerificationExpiresAt() < new \DateTimeImmutable()) {
            $user->setEmailVerificationToken(null);
            $user->setEmailVerificationExpiresAt(null);
            $em->flush();
            return new JsonResponse(['message' => 'Lien expiré. Demandez un nouveau lien.'], 400);
        }

        $user->setEmailVerifiedAt(new \DateTimeImmutable());
        $user->setEmailVerificationToken(null);
        $user->setEmailVerificationExpiresAt(null);
        $em->flush();

        return new JsonResponse(['message' => 'Votre compte est vérifié. Vous pouvez vous connecter.']);
    }

    #[Route('/api/auth/resend-verification', name: 'api_resend_verification', methods: ['POST'])]
    public function resendVerification(Request $request, EntityManagerInterface $em, MailerInterface $mailer): JsonResponse
    {
        $generic = ['message' => 'Si cet email est associé à un compte non vérifié, un nouveau lien vous a été envoyé.'];

        $email = trim(json_decode($request->getContent(), true)['email'] ?? '');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse($generic);
        }

        $session = $request->getSession();
        $key     = 'resend_rl_' . hash('sha256', $email);
        $rl      = $session->get($key, ['count' => 0, 'start' => time()]);

        if (time() - $rl['start'] < 3600) {
            if ($rl['count'] >= 3) {
                return new JsonResponse($generic);
            }
            $rl['count']++;
        } else {
            $rl = ['count' => 1, 'start' => time()];
        }
        $session->set($key, $rl);

        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if ($user && $user->getEmailVerifiedAt() === null) {
            $raw = bin2hex(random_bytes(32));
            $user->setEmailVerificationToken(hash('sha256', $raw));
            $user->setEmailVerificationExpiresAt(new \DateTimeImmutable('+24 hours'));
            $em->flush();
            $this->sendVerificationEmail($mailer, $user, $raw);
        }

        return new JsonResponse($generic);
    }

    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(EntityManagerInterface $em): JsonResponse
    {
        /** @var User $authUser */
        $authUser = $this->getUser();

        if (!$authUser) {
            return new JsonResponse(['message' => 'Not authenticated'], 401);
        }

        // Re-fetch so we always return fresh data (phone, company, etc.)
        $user = $em->getRepository(User::class)->find($authUser->getId());

        return new JsonResponse($this->serializeUser($user));
    }

    #[Route('/api/me', name: 'api_me_update', methods: ['PATCH'])]
    public function updateMe(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $authUser */
        $authUser = $this->getUser();

        if (!$authUser) {
            return new JsonResponse(['message' => 'Not authenticated'], 401);
        }

        $user = $em->getRepository(User::class)->find($authUser->getId());
        $data = json_decode($request->getContent(), true) ?? [];

        if (!empty($data['displayName'])) {
            $user->setDisplayName(trim($data['displayName']));
        }
        if (array_key_exists('phone', $data)) {
            $user->setPhone($data['phone'] ? trim($data['phone']) : null);
        }
        if (array_key_exists('company', $data)) {
            $user->setCompany($data['company'] ? trim($data['company']) : null);
        }

        $user->setUpdatedAt(new \DateTime());
        $em->flush();

        return new JsonResponse($this->serializeUser($user));
    }

    #[Route('/api/me/password', name: 'api_me_password', methods: ['PATCH'])]
    public function changePassword(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator
    ): JsonResponse {
        /** @var User $authUser */
        $authUser = $this->getUser();

        if (!$authUser) {
            return new JsonResponse(['message' => 'Not authenticated'], 401);
        }

        $user = $em->getRepository(User::class)->find($authUser->getId());
        $data = json_decode($request->getContent(), true) ?? [];

        $current = $data['currentPassword'] ?? '';
        $new     = $data['newPassword'] ?? '';

        if (!$passwordHasher->isPasswordValid($user, $current)) {
            return new JsonResponse(['message' => 'Mot de passe actuel incorrect'], 400);
        }

        $violations = $validator->validate($new, [new StrongPassword()]);
        if (count($violations) > 0) {
            return new JsonResponse(['message' => $violations[0]->getMessage()], 400);
        }

        $user->setPassword($passwordHasher->hashPassword($user, $new));
        $user->setUpdatedAt(new \DateTime());
        $em->flush();

        return new JsonResponse(['message' => 'Mot de passe mis à jour avec succès']);
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): never
    {
        // Handled by Symfony's logout listener (security.yaml)
        throw new \LogicException('This should never be reached.');
    }

    private function sendVerificationEmail(MailerInterface $mailer, User $user, string $rawToken): void
    {
        $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:5173';
        $url = $frontendUrl . '/verifier-email?token=' . $rawToken;

        $email = (new Email())
            ->from('noreply@cynasecure.com')
            ->to($user->getEmail())
            ->subject('Confirmez votre adresse email — CynaSecure')
            ->html($this->renderView('email/verify_email.html.twig', [
                'name' => $user->getDisplayName(),
                'url'  => $url,
            ]));

        $mailer->send($email);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id'          => $user->getId(),
            'email'       => $user->getEmail(),
            'displayName' => $user->getDisplayName(),
            'role'        => $user->getRole(),
            'phone'       => $user->getPhone(),
            'company'     => $user->getCompany(),
            'createdAt'   => $user->getCreatedAt()?->format('c'),
            'updatedAt'   => $user->getUpdatedAt()?->format('c'),
        ];
    }
}
