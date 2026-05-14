<?php

namespace App\Controller\Admin;

use App\Entity\Payment;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/payments')]
#[IsGranted('ROLE_ADMIN')]
class AdminPaymentController extends AbstractController
{
    #[Route('', name: 'admin_payments_list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $payments = $em->getRepository(Payment::class)->findBy(
            [],
            ['paidAt' => 'DESC']
        );

        $data = array_map(fn(Payment $p) => [
            'id' => $p->getId(),
            'amount' => $p->getAmount(),
            'cycle' => $p->getCycle(),
            'status' => $p->getStatus(),
            'paidAt' => $p->getPaidAt()?->format('Y-m-d H:i:s'),
            'subscriptionId' => $p->getSubscription()?->getId(),
            'user' => $p->getSubscription()
                ? [
                    'id' => $p->getSubscription()->getUser()->getId(),
                    'email' => $p->getSubscription()->getUser()->getEmail(),
                    'displayName' => $p->getSubscription()->getUser()->getDisplayName(),
                ]
                : null,
        ], $payments);

        return $this->json($data);
    }
}
