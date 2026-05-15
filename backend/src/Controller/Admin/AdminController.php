<?php

namespace App\Controller\Admin;

use App\Entity\User;
use App\Entity\Service;
use App\Entity\Subscription;
use App\Entity\Payment;
use App\Repository\UserRepository;
use App\Repository\ServiceRepository;
use App\Repository\SubscriptionRepository;
use App\Repository\PaymentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/admin', name: 'admin_')]
class AdminController extends AbstractController
{
    /* ─────────────────────────────────────────────── */
    /* STATS DASHBOARD                                 */
    /* ─────────────────────────────────────────────── */
    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(
        UserRepository $users,
        ServiceRepository $services,
        SubscriptionRepository $subs,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        // MRR = somme des prix des abonnements actifs
        $mrr = $em->createQuery("
            SELECT COALESCE(SUM(sub.price), 0)
            FROM App\Entity\Subscription sub
            WHERE sub.status = 'active'
        ")->getSingleScalarResult();

        return $this->json([
            'services' => $services->count([]),
            'users' => $users->count([]),
            'subscriptions' => $subs->count([]),
            'mrr' => (float) $mrr,
        ]);
    }

    /* ─────────────────────────────────────────────── */
    /* USERS LIST                                       */
    /* ─────────────────────────────────────────────── */
    #[Route('/users', name: 'users', methods: ['GET'])]
    public function users(UserRepository $users): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $data = array_map(fn(User $u) => [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'displayName' => $u->getDisplayName(),
            'role' => $u->getRole(),
        ], $users->findAll());

        return $this->json($data);
    }

    /* ─────────────────────────────────────────────── */
    /* SERVICES LIST (READ-ONLY)                        */
    /* ─────────────────────────────────────────────── */
    #[Route('/services', name: 'services', methods: ['GET'])]
    public function services(ServiceRepository $services): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

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
        ], $services->findAll());

        return $this->json($data);
    }

    /* ─────────────────────────────────────────────── */
    /* PAYMENTS LIST                                    */
    /* ─────────────────────────────────────────────── */
    #[Route('/payments', name: 'payments', methods: ['GET'])]
    public function payments(PaymentRepository $payments): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $data = array_map(fn(Payment $p) => [
            'id' => $p->getId(),
            'amount' => $p->getAmount(),
            'cycle' => $p->getCycle(),
            'status' => $p->getStatus(),
            'paidAt' => $p->getPaidAt()?->format('Y-m-d H:i:s'),
            'subscriptionId' => $p->getSubscription()?->getId(),
        ], $payments->findBy([], ['paidAt' => 'DESC'], 10));

        return $this->json($data);
    }
}
