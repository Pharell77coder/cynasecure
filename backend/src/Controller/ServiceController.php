<?php

namespace App\Controller;

use App\Entity\Service;
use App\Entity\Category;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/services')]
class ServiceController extends AbstractController
{
    #[Route('', name: 'service_index', methods: ['GET'])]
    public function index(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $repo = $em->getRepository(Service::class);

        // 🔥 Filtre optionnel : ?type=saas ou ?type=one_shot
        $type = $request->query->get('type');

        if ($type) {
            $services = $repo->findBy(['type' => $type]);
        } else {
            $services = $repo->findAll();
        }

        $data = array_map(fn(Service $s) => [
            'id' => $s->getId(),
            'name' => $s->getName(),
            'description' => $s->getDescription(),
            'longDescription' => $s->getLongDescription(),
            'priceMonthly' => $s->getPriceMonthly(),
            'priceYearly' => $s->getPriceYearly(),
            'image' => $s->getImage(),
            'features' => $s->getFeatures(),
            'category' => $s->getCategory()?->getName(),
            'categorySlug' => $s->getCategorySlug(),
            'type' => $s->getType(), // 🔥 IMPORTANT
        ], $services);

        return new JsonResponse($data);
    }

    #[Route('', name: 'service_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $category = $em->getRepository(Category::class)->find($data['categoryId'] ?? null);
        if (!$category) {
            return new JsonResponse(['message' => 'Category not found'], 404);
        }

        $service = new Service();
        $service->setName($data['name'] ?? null);
        $service->setDescription($data['description'] ?? null);
        $service->setLongDescription($data['longDescription'] ?? null);
        $service->setPriceMonthly($data['priceMonthly'] ?? 0);
        $service->setPriceYearly($data['priceYearly'] ?? null);
        $service->setImage($data['image'] ?? null);
        $service->setFeatures($data['features'] ?? []);
        $service->setCategory($category);

        // 🔥 Ajout du type (saas ou one_shot)
        $service->setType($data['type'] ?? 'saas');

        $em->persist($service);
        $em->flush();

        return new JsonResponse([
            'message' => 'Service created successfully',
            'id' => $service->getId()
        ], 201);
    }

    #[Route('/{id}', name: 'service_show', methods: ['GET'])]
    public function show(Service $service): JsonResponse
    {
        return new JsonResponse([
            'id' => $service->getId(),
            'name' => $service->getName(),
            'description' => $service->getDescription(),
            'longDescription' => $service->getLongDescription(),
            'priceMonthly' => $service->getPriceMonthly(),
            'priceYearly' => $service->getPriceYearly(),
            'image' => $service->getImage(),
            'features' => $service->getFeatures(),
            'category' => $service->getCategory()?->getName(),
            'categorySlug' => $service->getCategorySlug(),
            'type' => $service->getType(), // 🔥 IMPORTANT
        ]);
    }

    #[Route('/{id}', name: 'service_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(Request $request, Service $service, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['categoryId'])) {
            $category = $em->getRepository(Category::class)->find($data['categoryId']);
            if (!$category) {
                return new JsonResponse(['message' => 'Category not found'], 404);
            }
            $service->setCategory($category);
        }

        $service->setName($data['name'] ?? $service->getName());
        $service->setDescription($data['description'] ?? $service->getDescription());
        $service->setLongDescription($data['longDescription'] ?? $service->getLongDescription());
        $service->setPriceMonthly($data['priceMonthly'] ?? $service->getPriceMonthly());
        $service->setPriceYearly($data['priceYearly'] ?? $service->getPriceYearly());
        $service->setImage($data['image'] ?? $service->getImage());
        $service->setFeatures($data['features'] ?? $service->getFeatures());

        // 🔥 Mise à jour du type
        if (isset($data['type'])) {
            $service->setType($data['type']);
        }

        $em->flush();

        return new JsonResponse(['message' => 'Service updated successfully']);
    }

    #[Route('/{id}', name: 'service_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(Service $service, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($service);
        $em->flush();

        return new JsonResponse(['message' => 'Service deleted successfully']);
    }
}
