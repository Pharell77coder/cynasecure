<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class AuthController extends AbstractController
{
    // json_login intercepts this route — the method body never executes
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(): never
    {
        throw new \LogicException('json_login handles this route.');
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        Security $security
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

        if ($em->getRepository(User::class)->findOneBy(['email' => $email])) {
            return new JsonResponse(['message' => 'Email déjà utilisé'], 400);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($passwordHasher->hashPassword($user, $password));
        $user->setDisplayName($displayName ?: $email);
        $user->setRole('ROLE_USER');
        $user->setCreatedAt(new \DateTimeImmutable());
        $user->setUpdatedAt(new \DateTime());

        $em->persist($user);
        $em->flush();

        // Programmatic login — creates the Symfony security token in session
        $security->login($user, 'json_login', 'api');

        return new JsonResponse([
            'token' => 'session',
            'user'  => $this->serializeUser($user),
        ], 201);
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
        UserPasswordHasherInterface $passwordHasher
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

        if (mb_strlen($new) < 6) {
            return new JsonResponse(['message' => 'Le nouveau mot de passe doit contenir au moins 6 caractères'], 400);
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
