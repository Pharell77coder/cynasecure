<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class AuthController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        SessionInterface $session
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;
        $displayName = $data['displayName'] ?? null;

        if (!$email || !$password) {
            return new JsonResponse(['message' => 'Email and password are required'], 400);
        }

        $existing = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existing) {
            return new JsonResponse(['message' => 'Email already used'], 400);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($passwordHasher->hashPassword($user, $password));
        $user->setDisplayName($displayName ?? $email);
        $user->setRole('ROLE_USER');
        $user->setCreatedAt(new \DateTimeImmutable());
        $user->setUpdatedAt(new \DateTime());

        $em->persist($user);
        $em->flush();

        // Auto-login après inscription
        $session->set('user_id', $user->getId());

        return new JsonResponse([
            'token' => 'session', // ton frontend attend un token
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'displayName' => $user->getDisplayName(),
                'role' => $user->getRole(),
            ]
        ], 201);
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        SessionInterface $session
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user || !$passwordHasher->isPasswordValid($user, $password)) {
            return new JsonResponse(['message' => 'Invalid credentials'], 401);
        }

        // Stocker l'utilisateur en session
        $session->set('user_id', $user->getId());

        return new JsonResponse([
            'token' => 'session',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'displayName' => $user->getDisplayName(),
                'role' => $user->getRole(),
            ]
        ]);
    }

    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(SessionInterface $session, EntityManagerInterface $em): JsonResponse
    {
        $id = $session->get('user_id');

        if (!$id) {
            return new JsonResponse(['message' => 'Not authenticated'], 401);
        }

        $user = $em->getRepository(User::class)->find($id);

        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'displayName' => $user->getDisplayName(),
            'role' => $user->getRole(),
        ]);
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(SessionInterface $session): JsonResponse
    {
        $session->invalidate();

        return new JsonResponse(['message' => 'Logged out']);
    }
}
