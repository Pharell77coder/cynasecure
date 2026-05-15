<?php

namespace App\Controller\Admin;

use App\Entity\Service;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/services')]
#[IsGranted('ROLE_ADMIN')]
class AdminServiceController extends AbstractController
{
    // LIST ALL SERVICES
    #[Route('', name: 'admin_services_list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $services = $em->getRepository(Service::class)->findAll();

        $data = array_map(fn(Service $s) => [
            'id' => $s->getId(),
            'name' => $s->getName(),
            'description' => $s->getDescription(),
            'longDescription' => $s->getLongDescription(),
            'priceMonthly' => $s->getPriceMonthly(),
            'priceYearly' => $s->getPriceYearly(),
            'image' => $s->getImage(),
            'category' => $s->getCategory()?->getName(),
            'categorySlug' => $s->getCategorySlug(),
            'features' => $s->getFeatures(),
            'type' => $s->getType(),
        ], $services);

        return $this->json($data);
    }

    // GET ONE SERVICE
    #[Route('/{id}', name: 'admin_services_get', methods: ['GET'])]
    public function getOne(Service $service): JsonResponse
    {
        return $this->json([
            'id' => $service->getId(),
            'name' => $service->getName(),
            'description' => $service->getDescription(),
            'longDescription' => $service->getLongDescription(),
            'priceMonthly' => $service->getPriceMonthly(),
            'priceYearly' => $service->getPriceYearly(),
            'image' => $service->getImage(),
            'category' => $service->getCategory()?->getName(),
            'categorySlug' => $service->getCategorySlug(),
            'features' => $service->getFeatures(),
            'type' => $service->getType(),
        ]);
    }

    // CREATE SERVICE
    #[Route('', name: 'admin_services_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        CategoryRepository $catRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $service = new Service();
        $service->setName($data['name']);
        $service->setDescription($data['description']);
        $service->setLongDescription($data['longDescription']);
        $service->setPriceMonthly($data['priceMonthly']);
        $service->setPriceYearly($data['priceYearly']);
        $service->setImage($data['image']);
        $service->setType($data['type']);
        $service->setFeatures($data['features'] ?? []);

        if (!empty($data['categorySlug'])) {
            $category = $catRepo->findOneBy(['slug' => $data['categorySlug']]);
            $service->setCategory($category);
        }

        $em->persist($service);
        $em->flush();

        return $this->json(['success' => true, 'id' => $service->getId()]);
    }

    // UPDATE SERVICE
    #[Route('/{id}', name: 'admin_services_update', methods: ['PUT'])]
    public function update(
        Service $service,
        Request $request,
        EntityManagerInterface $em,
        CategoryRepository $catRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $service->setName($data['name']);
        $service->setDescription($data['description']);
        $service->setLongDescription($data['longDescription']);
        $service->setPriceMonthly($data['priceMonthly']);
        $service->setPriceYearly($data['priceYearly']);
        $service->setImage($data['image']);
        $service->setType($data['type']);
        $service->setFeatures($data['features'] ?? []);

        if (!empty($data['categorySlug'])) {
            $category = $catRepo->findOneBy(['slug' => $data['categorySlug']]);
            $service->setCategory($category);
        }

        $em->flush();

        return $this->json(['success' => true]);
    }

    // DELETE SERVICE
    #[Route('/{id}', name: 'admin_services_delete', methods: ['DELETE'])]
    public function delete(Service $service, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($service);
        $em->flush();

        return $this->json([
            'success' => true,
            'message' => 'Service supprimé',
            'id' => $service->getId(),
        ]);
    }
}
