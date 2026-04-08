<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class UserController extends AbstractController
{
    #[Route('/users', name: 'users_list', methods: ['GET'])]
    public function list(UserRepository $repo): JsonResponse
    {
        $users = $repo->findAllOrderedByDate();
        return $this->json($users);
    }

    #[Route('/users/{id}', name: 'users_show', methods: ['GET'])]
    public function show(int $id, UserRepository $repo): JsonResponse
    {
        $user = $repo->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }
        return $this->json($user);
    }
}