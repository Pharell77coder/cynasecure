<?php

namespace App\Controller\Admin;

use App\Entity\Subscription;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/subscriptions')]
#[IsGranted('ROLE_ADMIN')]
class AdminSubscriptionController extends AbstractController
{
    #[Route('', name: 'admin_subscriptions_list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $subs = $em->getRepository(Subscription::class)->findAll();

        $data = array_map(fn(Subscription $s) => [
            'id' => $s->getId(),
            'status' => $s->getStatus(),
            'startDate' => $s->getStartDate()?->format('Y-m-d'),
            'endDate' => $s->getEndDate()?->format('Y-m-d'),
            'user' => [
                'id' => $s->getUser()->getId(),
                'email' => $s->getUser()->getEmail(),
                'displayName' => $s->getUser()->getDisplayName(),
            ],
            'service' => [
                'id' => $s->getService()->getId(),
                'name' => $s->getService()->getName(),
                'price' => $s->getService()->getPrice(),
            ],
        ], $subs);

        return $this->json($data);
    }

    #[Route('/{id}/cancel', name: 'admin_subscriptions_cancel', methods: ['PUT'])]
    public function cancel(Subscription $subscription, EntityManagerInterface $em): JsonResponse
    {
        if ($subscription->getStatus() === 'cancelled') {
            return $this->json([
                'success' => false,
                'message' => 'Cet abonnement est déjà annulé.',
            ], 400);
        }

        $subscription->setStatus('cancelled');
        $subscription->setEndDate(new \DateTimeImmutable());

        $em->flush();

        return $this->json([
            'success' => true,
            'message' => 'Abonnement annulé avec succès.',
            'id' => $subscription->getId(),
        ]);
    }
}
