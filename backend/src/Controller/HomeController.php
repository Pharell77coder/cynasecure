<?php

namespace App\Controller;

use App\Entity\Category;
use App\Entity\Service;
use App\Repository\HomeCarouselSlideRepository;
use App\Repository\HomeContentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/home')]
class HomeController extends AbstractController
{
    #[Route('/carousel', name: 'home_carousel', methods: ['GET'])]
    public function carousel(HomeCarouselSlideRepository $repo): JsonResponse
    {
        return $this->json(array_map(fn($s) => [
            'id'        => $s->getId(),
            'title'     => $s->getTitle(),
            'subtitle'  => $s->getSubtitle(),
            'imagePath' => $s->getImagePath(),
            'ctaLabel'  => $s->getCtaLabel(),
            'ctaUrl'    => $s->getCtaUrl(),
            'position'  => $s->getPosition(),
        ], $repo->findActiveOrdered()));
    }

    #[Route('/content/{slug}', name: 'home_content', methods: ['GET'])]
    public function content(string $slug, HomeContentRepository $repo): JsonResponse
    {
        $c = $repo->findOneBySlug($slug);
        if (!$c) {
            return $this->json(null, 404);
        }
        return $this->json(['slug' => $c->getSlug(), 'title' => $c->getTitle(), 'content' => $c->getContent()]);
    }

    #[Route('/categories', name: 'home_categories', methods: ['GET'])]
    public function categories(EntityManagerInterface $em): JsonResponse
    {
        $cats = $em->createQueryBuilder()
            ->select('c')
            ->from(Category::class, 'c')
            ->where('c.homePosition IS NOT NULL')
            ->orderBy('c.homePosition', 'ASC')
            ->getQuery()->getResult();

        return $this->json(array_map(fn($c) => [
            'id'           => $c->getId(),
            'name'         => $c->getName(),
            'slug'         => $c->getSlug(),
            'imagePath'    => $c->getImagePath(),
            'homePosition' => $c->getHomePosition(),
        ], $cats));
    }

    #[Route('/top-products', name: 'home_top_products', methods: ['GET'])]
    public function topProducts(EntityManagerInterface $em): JsonResponse
    {
        $services = $em->createQueryBuilder()
            ->select('s')
            ->from(Service::class, 's')
            ->where('s.homePosition IS NOT NULL')
            ->orderBy('s.homePosition', 'ASC')
            ->getQuery()->getResult();

        return $this->json(array_map(fn($s) => [
            'id'           => $s->getId(),
            'name'         => $s->getName(),
            'description'  => $s->getDescription(),
            'priceMonthly' => $s->getPriceMonthly(),
            'priceYearly'  => $s->getPriceYearly(),
            'image'        => $s->getImage(),
            'features'     => $s->getFeatures(),
            'category'     => $s->getCategory()?->getName(),
            'categorySlug' => $s->getCategorySlug(),
            'type'         => $s->getType(),
            'isAvailable'  => $s->isAvailable(),
        ], $services));
    }
}
