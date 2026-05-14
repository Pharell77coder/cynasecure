<?php

namespace App\Controller;

use App\Entity\Category;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/categories')]
class CategoryController extends AbstractController
{
    #[Route('', name: 'category_index', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        $categories = $em->getRepository(Category::class)->findAll();

        $data = array_map(fn($cat) => [
            'id' => $cat->getId(),
            'name' => $cat->getName(),
            'slug' => $cat->getSlug(),
            'description' => $cat->getDescription(),
        ], $categories);

        return new JsonResponse($data);
    }

    #[Route('', name: 'category_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $category = new Category();
        $category->setName($data['name'] ?? null);
        $category->setSlug($data['slug'] ?? null);
        $category->setDescription($data['description'] ?? null);

        $em->persist($category);
        $em->flush();

        return new JsonResponse([
            'message' => 'Category created successfully',
            'id' => $category->getId()
        ], 201);
    }

    #[Route('/{id}', name: 'category_show', methods: ['GET'])]
    public function show(Category $category): JsonResponse
    {
        return new JsonResponse([
            'id' => $category->getId(),
            'name' => $category->getName(),
            'slug' => $category->getSlug(),
            'description' => $category->getDescription(),
        ]);
    }

    #[Route('/{id}', name: 'category_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(Request $request, Category $category, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $category->setName($data['name'] ?? $category->getName());
        $category->setSlug($data['slug'] ?? $category->getSlug());
        $category->setDescription($data['description'] ?? $category->getDescription());

        $em->flush();

        return new JsonResponse(['message' => 'Category updated successfully']);
    }

    #[Route('/{id}', name: 'category_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(Category $category, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($category);
        $em->flush();

        return new JsonResponse(['message' => 'Category deleted successfully']);
    }
}
