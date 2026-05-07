<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class AuthController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        // Ici, tu devrais normalement enregistrer en BDD avec le PasswordHasher
        return new JsonResponse(['message' => 'Utilisateur créé (simulé)'], 201);
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        // Simulation d'une vérification
        if ($data['email'] === 'test@test.com' && $data['password'] === 'password') {
            return new JsonResponse(['token' => 'fake-jwt-token', 'user' => $data['email']]);
        }

        return new JsonResponse(['error' => 'Identifiants invalides'], 401);
    }
}