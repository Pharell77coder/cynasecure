<?php

namespace App\Controller\Admin;

use App\Entity\Category;
use App\Entity\HomeCarouselSlide;
use App\Entity\HomeContent;
use App\Entity\Service;
use App\Repository\HomeCarouselSlideRepository;
use App\Repository\HomeContentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use OpenApi\Attributes as OA;

#[Route('/api/admin/home')]
#[IsGranted('ROLE_ADMIN')]
#[OA\Tag(name: 'Admin')]
#[OA\SecurityRequirement(['cookieAuth' => []])]
class AdminHomeController extends AbstractController
{
    /* ── helpers ── */

    private function slideJson(HomeCarouselSlide $s): array
    {
        return [
            'id'        => $s->getId(),
            'title'     => $s->getTitle(),
            'subtitle'  => $s->getSubtitle(),
            'imagePath' => $s->getImagePath(),
            'videoPath' => $s->getVideoPath(),
            'ctaLabel'  => $s->getCtaLabel(),
            'ctaUrl'    => $s->getCtaUrl(),
            'position'  => $s->getPosition(),
            'isActive'  => $s->isActive(),
        ];
    }

    private function catJson(Category $c): array
    {
        return [
            'id'           => $c->getId(),
            'name'         => $c->getName(),
            'slug'         => $c->getSlug(),
            'imagePath'    => $c->getImagePath(),
            'homePosition' => $c->getHomePosition(),
        ];
    }

    private function serviceJson(Service $s): array
    {
        return [
            'id'           => $s->getId(),
            'name'         => $s->getName(),
            'description'  => $s->getDescription(),
            'priceMonthly' => $s->getPriceMonthly(),
            'image'        => $s->getImage(),
            'category'     => $s->getCategory()?->getName(),
            'categorySlug' => $s->getCategorySlug(),
            'type'         => $s->getType(),
            'homePosition' => $s->getHomePosition(),
        ];
    }

    // Carrousel

    #[OA\Response(response: 200, description: 'Liste des slides du carrousel')]
    #[Route('/carousel', name: 'admin_home_carousel_list', methods: ['GET'])]
    public function listSlides(HomeCarouselSlideRepository $repo): JsonResponse
    {
        $slides = $repo->findBy([], ['position' => 'ASC']);
        return $this->json(array_map($this->slideJson(...), $slides));
    }

    #[OA\Response(response: 201, description: 'Slide du carrousel créée')]
    #[Route('/carousel', name: 'admin_home_carousel_create', methods: ['POST'])]
    public function createSlide(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $d = json_decode($req->getContent(), true) ?? [];

        if (empty($d['title'])) {
            return new JsonResponse(['message' => 'Le titre est obligatoire'], 400);
        }

        $slide = (new HomeCarouselSlide())
            ->setTitle(substr($d['title'], 0, 120))
            ->setSubtitle(isset($d['subtitle']) ? substr($d['subtitle'], 0, 240) : null)
            ->setImagePath($d['imagePath'] ?? null)
            ->setVideoPath($d['videoPath'] ?? null)
            ->setCtaLabel(isset($d['ctaLabel']) ? substr($d['ctaLabel'], 0, 60) : null)
            ->setCtaUrl(isset($d['ctaUrl']) ? substr($d['ctaUrl'], 0, 255) : null)
            ->setPosition(max(0, (int) ($d['position'] ?? 0)))
            ->setIsActive((bool) ($d['isActive'] ?? true));

        $em->persist($slide);
        $em->flush();

        return $this->json($this->slideJson($slide), 201);
    }

    #[OA\Response(response: 200, description: 'Ordre des slides du carrousel mis à jour')]
    #[Route('/carousel/reorder', name: 'admin_home_carousel_reorder', methods: ['PATCH'])]
    public function reorderSlides(Request $req, EntityManagerInterface $em, HomeCarouselSlideRepository $repo): JsonResponse
    {
        $ids = json_decode($req->getContent(), true) ?? [];

        foreach ($ids as $i => $id) {
            $slide = $repo->find($id);
            if ($slide) $slide->setPosition($i);
        }

        $em->flush();
        return $this->json(['ok' => true]);
    }

    #[OA\Response(response: 200, description: 'Slide du carrousel mise à jour')]
    #[Route('/carousel/{id}', name: 'admin_home_carousel_update', requirements: ['id' => '\d+'], methods: ['PATCH'])]
    public function updateSlide(int $id, Request $req, EntityManagerInterface $em, HomeCarouselSlideRepository $repo): JsonResponse
    {
        $slide = $repo->find($id);
        if (!$slide) return new JsonResponse(['message' => 'Slide introuvable'], 404);

        $d = json_decode($req->getContent(), true) ?? [];

        if (isset($d['title']))                $slide->setTitle(substr($d['title'], 0, 120));
        if (array_key_exists('subtitle', $d))  $slide->setSubtitle($d['subtitle'] ? substr($d['subtitle'], 0, 240) : null);
        if (array_key_exists('imagePath', $d)) $slide->setImagePath($d['imagePath'] ?: null);
        if (array_key_exists('videoPath', $d)) $slide->setVideoPath($d['videoPath'] ?: null);
        if (array_key_exists('ctaLabel', $d))  $slide->setCtaLabel($d['ctaLabel'] ? substr($d['ctaLabel'], 0, 60) : null);
        if (array_key_exists('ctaUrl', $d))    $slide->setCtaUrl($d['ctaUrl'] ? substr($d['ctaUrl'], 0, 255) : null);
        if (isset($d['position']))             $slide->setPosition(max(0, (int) $d['position']));
        if (isset($d['isActive']))             $slide->setIsActive((bool) $d['isActive']);

        $em->flush();
        return $this->json($this->slideJson($slide));
    }

    #[OA\Response(response: 200, description: 'Slide du carrousel supprimée')]
    #[Route('/carousel/{id}', name: 'admin_home_carousel_delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function deleteSlide(int $id, EntityManagerInterface $em, HomeCarouselSlideRepository $repo): JsonResponse
    {
        $slide = $repo->find($id);
        if (!$slide) return new JsonResponse(['message' => 'Slide introuvable'], 404);

        $em->remove($slide);
        $em->flush();
        return $this->json(['ok' => true]);
    }

    // Contenu texte

    #[OA\Response(response: 200, description: 'Contenu textuel de la page d\'accueil')]
    #[Route('/content/{slug}', name: 'admin_home_content_get', methods: ['GET'])]
    public function getContent(string $slug, HomeContentRepository $repo): JsonResponse
    {
        $c = $repo->findOneBySlug($slug);
        if (!$c) return new JsonResponse(['slug' => $slug, 'title' => null, 'content' => '']);
        return $this->json(['slug' => $c->getSlug(), 'title' => $c->getTitle(), 'content' => $c->getContent()]);
    }

    #[OA\Response(response: 200, description: 'Contenu textuel sauvegardé')]
    #[Route('/content/{slug}', name: 'admin_home_content_save', methods: ['PUT'])]
    public function saveContent(string $slug, Request $req, EntityManagerInterface $em, HomeContentRepository $repo): JsonResponse
    {
        $d = json_decode($req->getContent(), true) ?? [];

        $c = $repo->findOneBySlug($slug) ?? (new HomeContent())->setSlug($slug);
        if (array_key_exists('title', $d)) $c->setTitle($d['title'] ? substr($d['title'], 0, 120) : null);
        $c->setContent($d['content'] ?? $c->getContent());

        $em->persist($c);
        $em->flush();
        return $this->json(['slug' => $c->getSlug(), 'title' => $c->getTitle(), 'content' => $c->getContent()]);
    }

    // Catégories home

    #[OA\Response(response: 200, description: 'Liste des catégories de la page d\'accueil')]
    #[Route('/categories', name: 'admin_home_categories_list', methods: ['GET'])]
    public function listCategories(EntityManagerInterface $em): JsonResponse
    {
        $cats = $em->getRepository(Category::class)->findBy([], ['name' => 'ASC']);
        return $this->json(array_map($this->catJson(...), $cats));
    }

    #[OA\Response(response: 200, description: 'Ordre des catégories mis à jour')]
    #[Route('/categories/reorder', name: 'admin_home_categories_reorder', methods: ['PATCH'])]
    public function reorderCategories(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $ids = json_decode($req->getContent(), true) ?? [];
        $repo = $em->getRepository(Category::class);

        foreach ($ids as $i => $id) {
            $cat = $repo->find($id);
            if ($cat) $cat->setHomePosition($i);
        }

        $em->flush();
        return $this->json(['ok' => true]);
    }

    #[OA\Response(response: 200, description: 'Position et image de la catégorie mises à jour')]
    #[Route('/categories/{id}/home', name: 'admin_home_categories_update', requirements: ['id' => '\d+'], methods: ['PATCH'])]
    public function updateCategoryHome(int $id, Request $req, EntityManagerInterface $em): JsonResponse
    {
        $cat = $em->getRepository(Category::class)->find($id);
        if (!$cat) return new JsonResponse(['message' => 'Catégorie introuvable'], 404);

        $d = json_decode($req->getContent(), true) ?? [];

        if (array_key_exists('homePosition', $d)) {
            $cat->setHomePosition($d['homePosition'] !== null ? max(0, (int) $d['homePosition']) : null);
        }
        if (array_key_exists('imagePath', $d)) {
            $cat->setImagePath($d['imagePath'] ?: null);
        }

        $em->flush();
        return $this->json($this->catJson($cat));
    }

    // Top produits

    #[OA\Response(response: 200, description: 'Liste des services mis en avant sur la page d\'accueil')]
    #[Route('/top-products', name: 'admin_home_top_list', methods: ['GET'])]
    public function listTop(EntityManagerInterface $em): JsonResponse
    {
        $all = $em->getRepository(Service::class)->findBy([], ['name' => 'ASC']);
        return $this->json(array_map($this->serviceJson(...), $all));
    }

    #[OA\Response(response: 200, description: 'Ordre des produits mis en avant actualisé')]
    #[Route('/top-products/reorder', name: 'admin_home_top_reorder', methods: ['PATCH'])]
    public function reorderTop(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $ids = json_decode($req->getContent(), true) ?? [];
        $repo = $em->getRepository(Service::class);

        foreach ($ids as $i => $id) {
            $svc = $repo->find($id);
            if ($svc) $svc->setHomePosition($i);
        }

        $em->flush();
        return $this->json(['ok' => true]);
    }

    #[OA\Response(response: 200, description: 'Service ajouté aux produits mis en avant')]
    #[Route('/top-products/{serviceId}', name: 'admin_home_top_add', requirements: ['serviceId' => '\d+'], methods: ['POST'])]
    public function addTop(int $serviceId, EntityManagerInterface $em): JsonResponse
    {
        $svc = $em->getRepository(Service::class)->find($serviceId);
        if (!$svc) return new JsonResponse(['message' => 'Service introuvable'], 404);

        if ($svc->getHomePosition() === null) {
            $max = $em->createQuery('SELECT MAX(s.homePosition) FROM App\Entity\Service s WHERE s.homePosition IS NOT NULL')
                ->getSingleScalarResult();
            $svc->setHomePosition(($max ?? -1) + 1);
            $em->flush();
        }

        return $this->json($this->serviceJson($svc));
    }

    #[OA\Response(response: 200, description: 'Service retiré des produits mis en avant')]
    #[Route('/top-products/{serviceId}', name: 'admin_home_top_remove', requirements: ['serviceId' => '\d+'], methods: ['DELETE'])]
    public function removeTop(int $serviceId, EntityManagerInterface $em): JsonResponse
    {
        $svc = $em->getRepository(Service::class)->find($serviceId);
        if (!$svc) return new JsonResponse(['message' => 'Service introuvable'], 404);

        $svc->setHomePosition(null);
        $em->flush();
        return $this->json(['ok' => true]);
    }
}
