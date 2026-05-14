<?php

namespace App\Controller\Admin;

use App\Entity\Service;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/services')]
#[IsGranted('ROLE_ADMIN')]
class AdminServiceController extends AbstractController
{
    #[Route('', name: 'admin_services_list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $services = $em->getRepository(Service::class)->findAll();

        $data = array_map(fn(Service $s) => [
            'id' => $s->getId(),
            'name' => $s->getName(),
            'price' => $s->getPrice(),
            'description' => $s->getDescription(),
        ], $services);

        return $this->json($data);
    }

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
