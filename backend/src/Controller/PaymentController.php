<?php

namespace App\Controller;

use App\Repository\PaymentRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class PaymentController extends AbstractController
{
    #[Route('/api/payments/my', name: 'payments_my', methods: ['GET'])]
    public function myPayments(PaymentRepository $paymentRepo): JsonResponse
    {
        $user = $this->getUser();

        $payments = $paymentRepo->createQueryBuilder('p')
            ->join('p.subscription', 's')
            ->andWhere('s.user = :user')
            ->setParameter('user', $user)
            ->orderBy('p.paidAt', 'DESC')
            ->getQuery()
            ->getResult();

        $data = [];

        foreach ($payments as $payment) {
            $data[] = [
                'id' => $payment->getId(),
                'amount' => $payment->getAmount(),
                'cycle' => $payment->getCycle(),
                'status' => $payment->getStatus(),
                'paidAt' => $payment->getPaidAt()->format('Y-m-d H:i:s'),
                'subscriptionId' => $payment->getSubscription()->getId(),
            ];
        }

        return new JsonResponse($data);
    }
}
