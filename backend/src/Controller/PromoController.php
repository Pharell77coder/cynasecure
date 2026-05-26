<?php

namespace App\Controller;

use App\Repository\PromoCodeRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/cart')]
class PromoController extends AbstractController
{
    #[Route('/promo', name: 'cart_promo_check', methods: ['POST'])]
    public function check(Request $request, PromoCodeRepository $promoRepo): JsonResponse
    {
        if (!$this->promoRateLimit($request)) {
            return new JsonResponse(['message' => 'Trop de tentatives. Réessayez dans une minute.'], 429);
        }

        $data  = json_decode($request->getContent(), true) ?? [];
        $code  = trim((string) ($data['code'] ?? ''));
        $total = (float) ($data['total'] ?? 0);

        if ($code === '') {
            return new JsonResponse(['message' => 'Code promo requis.'], 400);
        }

        $promo = $promoRepo->findActiveByCode($code);
        $now   = new \DateTimeImmutable();

        if (!$promo || !$promo->isValid($total, $now)) {
            return new JsonResponse(['message' => 'Code promo invalide, expiré ou conditions non remplies.'], 400);
        }

        $discount        = $promo->computeDiscount($total);
        $discountedTotal = max(0, round($total - $discount, 2));

        return new JsonResponse([
            'valid'           => true,
            'code'            => $promo->getCode(),
            'type'            => $promo->getType(),
            'discount'        => $discount,
            'discountedTotal' => $discountedTotal,
        ]);
    }

    #[Route('/promo', name: 'cart_promo_remove', methods: ['DELETE'])]
    public function remove(): JsonResponse
    {
        return new JsonResponse(['ok' => true]);
    }

    private function promoRateLimit(Request $request): bool
    {
        try {
            $session = $request->getSession();
            $now     = time();
            $data    = $session->get('promo_rl', ['count' => 0, 'start' => $now]);

            if ($now - $data['start'] > 60) {
                $data = ['count' => 0, 'start' => $now];
            }

            $data['count']++;
            $session->set('promo_rl', $data);

            return $data['count'] <= 10;
        } catch (\Exception) {
            return true;
        }
    }
}
