<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class ProductController extends AbstractController
{
    #[Route('/products', name: 'products_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json([]);
    }

    #[Route('/products/{id}', name: 'products_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        return $this->json(['id' => $id]);
    }
}