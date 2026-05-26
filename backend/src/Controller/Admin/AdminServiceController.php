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
    private const AVAIL_VALUES = ['available', 'maintenance', 'unavailable'];
    private const SORT_FIELDS  = ['name', 'priceMonthly', 'id'];

    #[Route('', name: 'admin_services_list', methods: ['GET'])]
    public function list(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $page    = max(1, (int) $request->query->get('page', 1));
        $perPage = min(100, max(1, (int) $request->query->get('perPage', 20)));
        $sort    = in_array($request->query->get('sort'), self::SORT_FIELDS, true) ? $request->query->get('sort') : 'name';
        $order   = strtoupper($request->query->get('order', 'asc')) === 'DESC' ? 'DESC' : 'ASC';

        $qb = $em->getRepository(Service::class)->createQueryBuilder('s')
            ->orderBy("s.{$sort}", $order)
            ->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage);

        $total = (int) $em->getRepository(Service::class)->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $items = array_map(fn(Service $s) => $this->serialize($s), $qb->getQuery()->getResult());

        return $this->json([
            'items'      => $items,
            'total'      => $total,
            'page'       => $page,
            'perPage'    => $perPage,
            'totalPages' => (int) ceil($total / $perPage),
        ]);
    }

    #[Route('/{id}', name: 'admin_services_get', methods: ['GET'])]
    public function getOne(Service $service): JsonResponse
    {
        return $this->json($this->serialize($service));
    }

    #[Route('', name: 'admin_services_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, CategoryRepository $catRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $service = new Service();
        $this->hydrate($service, $data, $catRepo);

        $em->persist($service);
        $em->flush();

        return $this->json(['success' => true, 'id' => $service->getId()], 201);
    }

    #[Route('/{id}', name: 'admin_services_update', methods: ['PUT'])]
    public function update(Service $service, Request $request, EntityManagerInterface $em, CategoryRepository $catRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $this->hydrate($service, $data, $catRepo);
        $em->flush();
        return $this->json(['success' => true]);
    }

    #[Route('/{id}', name: 'admin_services_delete', methods: ['DELETE'])]
    public function delete(Service $service, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($service);
        $em->flush();
        return $this->json(['success' => true, 'id' => $service->getId()]);
    }

    private function hydrate(Service $service, array $data, CategoryRepository $catRepo): void
    {
        if (isset($data['name']))            $service->setName($data['name']);
        if (isset($data['description']))     $service->setDescription($data['description']);
        if (isset($data['longDescription'])) $service->setLongDescription($data['longDescription']);
        if (isset($data['priceMonthly']))    $service->setPriceMonthly((float) $data['priceMonthly']);
        if (array_key_exists('priceYearly', $data)) $service->setPriceYearly($data['priceYearly'] !== null ? (float) $data['priceYearly'] : null);
        if (array_key_exists('image', $data)) $service->setImage($data['image'] ?: null);
        if (isset($data['type']) && in_array($data['type'], ['saas', 'one_shot'], true)) {
            $service->setType($data['type']);
        }
        if (isset($data['features']) && is_array($data['features'])) {
            $service->setFeatures($data['features']);
        }
        if (!empty($data['categorySlug'])) {
            $cat = $catRepo->findOneBy(['slug' => $data['categorySlug']]);
            $service->setCategory($cat ?: null);
        }

        if (array_key_exists('images', $data)) {
            $imgs = is_array($data['images']) ? array_slice(array_filter($data['images'], 'is_string'), 0, 10) : null;
            $service->setImages($imgs ?: null);
        }
        if (array_key_exists('technicalSpecs', $data)) {
            $specs = [];
            if (is_array($data['technicalSpecs'])) {
                foreach (array_slice($data['technicalSpecs'], 0, 20) as $spec) {
                    if (is_array($spec) && isset($spec['label'], $spec['value'])) {
                        $specs[] = ['label' => (string) $spec['label'], 'value' => (string) $spec['value']];
                    }
                }
            }
            $service->setTechnicalSpecs($specs ?: null);
        }
        if (isset($data['availability']) && in_array($data['availability'], self::AVAIL_VALUES, true)) {
            $service->setAvailability($data['availability']);
        }
        if (isset($data['trialAvailable'])) {
            $service->setTrialAvailable((bool) $data['trialAvailable']);
        }
    }

    private function serialize(Service $s): array
    {
        return [
            'id'             => $s->getId(),
            'name'           => $s->getName(),
            'description'    => $s->getDescription(),
            'longDescription'=> $s->getLongDescription(),
            'priceMonthly'   => $s->getPriceMonthly(),
            'priceYearly'    => $s->getPriceYearly(),
            'image'          => $s->getImage(),
            'images'         => $s->getImages() ?? [],
            'technicalSpecs' => $s->getTechnicalSpecs() ?? [],
            'features'       => $s->getFeatures(),
            'category'       => $s->getCategory()?->getName(),
            'categorySlug'   => $s->getCategorySlug(),
            'type'           => $s->getType(),
            'isAvailable'    => $s->isAvailable(),
            'availability'   => $s->getAvailability(),
            'trialAvailable' => $s->isTrialAvailable(),
        ];
    }
}
