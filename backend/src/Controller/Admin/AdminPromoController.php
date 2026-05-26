<?php

namespace App\Controller\Admin;

use App\Entity\PromoCode;
use App\Repository\PromoCodeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/promos')]
#[IsGranted('ROLE_ADMIN')]
class AdminPromoController extends AbstractController
{
    #[Route('', name: 'admin_promos_list', methods: ['GET'])]
    public function list(Request $request, PromoCodeRepository $repo): JsonResponse
    {
        $page    = max(1, (int) $request->query->get('page', 1));
        $perPage = min(100, max(1, (int) $request->query->get('perPage', 20)));

        ['items' => $items, 'total' => $total] = $repo->findPaginated($page, $perPage);

        return $this->json([
            'items'      => array_map(fn(PromoCode $p) => $this->serialize($p), $items),
            'total'      => $total,
            'page'       => $page,
            'perPage'    => $perPage,
            'totalPages' => (int) ceil($total / $perPage),
        ]);
    }

    #[Route('', name: 'admin_promos_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $err = $this->validate($data);
        if ($err) {
            return new JsonResponse(['message' => $err], 400);
        }

        $promo = $this->hydrate(new PromoCode(), $data);
        $promo->setCreatedAt(new \DateTimeImmutable());
        $em->persist($promo);
        $em->flush();

        return $this->json($this->serialize($promo), 201);
    }

    #[Route('/generate', name: 'admin_promos_generate', methods: ['POST'])]
    public function generate(): JsonResponse
    {
        $code = strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        return $this->json(['code' => $code]);
    }

    #[Route('/{id}', name: 'admin_promos_get', methods: ['GET'])]
    public function get(int $id, PromoCodeRepository $repo): JsonResponse
    {
        $promo = $repo->find($id);
        if (!$promo) {
            return new JsonResponse(['message' => 'Code promo introuvable.'], 404);
        }
        return $this->json($this->serialize($promo));
    }

    #[Route('/{id}', name: 'admin_promos_update', methods: ['PUT'])]
    public function update(int $id, Request $request, PromoCodeRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $promo = $repo->find($id);
        if (!$promo) {
            return new JsonResponse(['message' => 'Code promo introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $err  = $this->validate($data, $promo->getCode());
        if ($err) {
            return new JsonResponse(['message' => $err], 400);
        }

        $this->hydrate($promo, $data);
        $promo->setUpdatedAt(new \DateTime());
        $em->flush();

        return $this->json($this->serialize($promo));
    }

    #[Route('/{id}', name: 'admin_promos_delete', methods: ['DELETE'])]
    public function delete(int $id, PromoCodeRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $promo = $repo->find($id);
        if (!$promo) {
            return new JsonResponse(['message' => 'Code promo introuvable.'], 404);
        }
        $em->remove($promo);
        $em->flush();
        return new JsonResponse(['ok' => true]);
    }

    private function validate(array $data, ?string $currentCode = null): ?string
    {
        $code = trim(strtoupper((string) ($data['code'] ?? '')));
        if (!$code) return 'Le code est requis.';

        $type = $data['type'] ?? '';
        if (!in_array($type, ['percent', 'fixed'], true)) return 'Type invalide (percent ou fixed).';

        $value = (float) ($data['value'] ?? 0);
        if ($value <= 0) return 'La valeur doit être positive.';
        if ($type === 'percent' && $value > 100) return 'Le pourcentage ne peut pas dépasser 100.';

        $appliesTo = $data['appliesTo'] ?? 'all';
        if (!in_array($appliesTo, ['all', 'saas', 'one_shot'], true)) return 'appliesTo invalide.';

        return null;
    }

    private function hydrate(PromoCode $promo, array $data): PromoCode
    {
        $promo->setCode(trim(strtoupper((string) ($data['code'] ?? ''))));
        $promo->setType($data['type']);
        $promo->setValue((float) $data['value']);
        $promo->setAppliesTo($data['appliesTo'] ?? 'all');
        $promo->setIsActive((bool) ($data['isActive'] ?? true));
        $promo->setMaxUses(isset($data['maxUses']) && $data['maxUses'] !== '' ? (int) $data['maxUses'] : null);
        $promo->setMinAmount(isset($data['minAmount']) && $data['minAmount'] !== '' ? (float) $data['minAmount'] : null);
        $promo->setValidFrom(isset($data['validFrom']) && $data['validFrom'] ? new \DateTimeImmutable($data['validFrom']) : null);
        $promo->setValidUntil(isset($data['validUntil']) && $data['validUntil'] ? new \DateTimeImmutable($data['validUntil']) : null);
        return $promo;
    }

    private function serialize(PromoCode $p): array
    {
        return [
            'id'         => $p->getId(),
            'code'       => $p->getCode(),
            'type'       => $p->getType(),
            'value'      => $p->getValue(),
            'maxUses'    => $p->getMaxUses(),
            'usedCount'  => $p->getUsedCount(),
            'minAmount'  => $p->getMinAmount(),
            'validFrom'  => $p->getValidFrom()?->format('Y-m-d'),
            'validUntil' => $p->getValidUntil()?->format('Y-m-d'),
            'isActive'   => $p->isActive(),
            'appliesTo'  => $p->getAppliesTo(),
            'createdAt'  => $p->getCreatedAt()?->format('Y-m-d'),
        ];
    }
}
