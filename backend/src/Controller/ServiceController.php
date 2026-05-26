<?php

namespace App\Controller;

use App\Dto\SearchCriteria;
use App\Entity\Service;
use App\Entity\Category;
use App\Service\ServiceSearchService;
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
        $type = $request->query->get('type');

        $services = $type ? $repo->findBy(['type' => $type]) : $repo->findAll();

        return new JsonResponse(array_map(fn(Service $s) => $this->serialize($s), $services));
    }

    #[Route('/search', name: 'service_search', methods: ['GET'])]
    public function search(Request $request, ServiceSearchService $svc): JsonResponse
    {
        $raw = $request->query;

        $cats = array_values(array_filter(
            explode(',', $raw->get('categories', '')),
            fn(string $s) => $s !== ''
        ));

        $pmin = $raw->get('priceMin') !== null ? max(0.0, (float) $raw->get('priceMin')) : null;
        $pmax = $raw->get('priceMax') !== null ? max(0.0, (float) $raw->get('priceMax')) : null;

        if ($pmin !== null && $pmax !== null && $pmin > $pmax) {
            [$pmin, $pmax] = [$pmax, $pmin];
        }

        $sort = in_array($raw->get('sort'), ['relevance', 'price_asc', 'price_desc', 'newest'], true)
            ? $raw->get('sort')
            : 'relevance';

        $type = in_array($raw->get('type'), ['all', 'saas', 'one_shot'], true)
            ? $raw->get('type')
            : 'all';

        $criteria = new SearchCriteria(
            q: trim($raw->get('q', '')),
            categories: $cats,
            priceMin: $pmin,
            priceMax: $pmax,
            onlyAvailable: (bool) $raw->get('onlyAvailable', 0),
            sort: $sort,
            type: $type,
        );

        $results = $svc->search($criteria);

        $items = array_map(fn(array $r) => [
            ...$this->serialize($r['service']),
            'score' => $r['score'],
        ], $results);

        $response = new JsonResponse(['total' => count($items), 'items' => $items]);
        $response->headers->set('Cache-Control', 'public, max-age=30');
        return $response;
    }

    #[Route('/{id}', name: 'service_show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(Service $service): JsonResponse
    {
        return new JsonResponse($this->serialize($service));
    }

    #[Route('/{id}/similar', name: 'service_similar', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function similar(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $service = $em->getRepository(Service::class)->find($id);
        if (!$service) {
            return new JsonResponse(['message' => 'Not found'], 404);
        }

        $limit = min(12, max(1, (int) $request->query->get('limit', 6)));
        $repo  = $em->getRepository(Service::class);

        $pool = $service->getCategory()
            ? array_values(array_filter(
                $repo->findBy(['category' => $service->getCategory()]),
                fn(Service $s) => $s->getId() !== $service->getId()
            ))
            : [];

        $avail = array_values(array_filter($pool, fn(Service $s) => $s->getAvailability() === 'available'));
        $rest  = array_values(array_filter($pool, fn(Service $s) => $s->getAvailability() !== 'available'));
        shuffle($avail);
        shuffle($rest);
        $pool = array_merge($avail, $rest);

        if (count($pool) < $limit) {
            $catId  = $service->getCategory()?->getId();
            $others = array_values(array_filter(
                $repo->findAll(),
                fn(Service $s) => $s->getId() !== $service->getId()
                    && $s->getCategory()?->getId() !== $catId
            ));
            shuffle($others);
            $pool = array_merge($pool, $others);
        }

        return new JsonResponse(array_map(
            fn(Service $s) => $this->serialize($s),
            array_slice($pool, 0, $limit)
        ));
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
        $service->setType($data['type'] ?? 'saas');

        $em->persist($service);
        $em->flush();

        return new JsonResponse(['message' => 'Service created successfully', 'id' => $service->getId()], 201);
    }

    #[Route('/{id}', name: 'service_update', requirements: ['id' => '\d+'], methods: ['PUT'])]
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

        if (isset($data['type'])) $service->setType($data['type']);
        if (isset($data['isAvailable'])) $service->setIsAvailable((bool) $data['isAvailable']);

        $em->flush();

        return new JsonResponse(['message' => 'Service updated successfully']);
    }

    #[Route('/{id}', name: 'service_delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(Service $service, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($service);
        $em->flush();
        return new JsonResponse(['message' => 'Service deleted successfully']);
    }

    private function serialize(Service $s): array
    {
        return [
            'id'              => $s->getId(),
            'name'            => $s->getName(),
            'description'     => $s->getDescription(),
            'longDescription' => $s->getLongDescription(),
            'priceMonthly'    => $s->getPriceMonthly(),
            'priceYearly'     => $s->getPriceYearly(),
            'image'           => $s->getImage(),
            'images'          => $s->getImages() ?? [],
            'technicalSpecs'  => $s->getTechnicalSpecs() ?? [],
            'features'        => $s->getFeatures(),
            'category'        => $s->getCategory()?->getName(),
            'categorySlug'    => $s->getCategorySlug(),
            'type'            => $s->getType(),
            'isAvailable'     => $s->isAvailable(),
            'availability'    => $s->getAvailability(),
            'trialAvailable'  => $s->isTrialAvailable(),
        ];
    }
}
