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
    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(
        UserRepository $users,
        ServiceRepository $services,
        SubscriptionRepository $subs,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $mrr = $em->createQuery("
            SELECT COALESCE(SUM(s.price), 0)
            FROM App\Entity\Subscription sub
            JOIN sub.service s
            WHERE sub.status = 'active'
        ")->getSingleScalarResult();

        return $this->json([
            'services' => $services->count([]),
            'users' => $users->count([]),
            'subscriptions' => $subs->count([]),
            'mrr' => (float) $mrr,
        ]);
    }

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

    #[Route('/services', name: 'services', methods: ['GET'])]
    public function services(ServiceRepository $services): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $data = array_map(fn(Service $s) => [
            'id' => $s->getId(),
            'name' => $s->getName(),
            'price' => $s->getPrice(),
            'description' => $s->getDescription(),
        ], $services->findAll());

        return $this->json($data);
    }

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
