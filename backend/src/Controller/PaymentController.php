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

        // Subscription-based payments
        $subPayments = $paymentRepo->createQueryBuilder('p')
            ->join('p.subscription', 's')
            ->andWhere('s.user = :user')
            ->setParameter('user', $user)
            ->orderBy('p.paidAt', 'DESC')
            ->getQuery()
            ->getResult();

        // Checkout-based payments (via Order)
        $orderPayments = $paymentRepo->createQueryBuilder('p')
            ->join('p.orderRef', 'o')
            ->andWhere('o.user = :user')
            ->andWhere('p.orderRef IS NOT NULL')
            ->setParameter('user', $user)
            ->orderBy('p.paidAt', 'DESC')
            ->getQuery()
            ->getResult();

        $seen = [];
        $data = [];

        foreach (array_merge($orderPayments, $subPayments) as $payment) {
            if (in_array($payment->getId(), $seen, true)) continue;
            $seen[] = $payment->getId();

            $data[] = [
                'id'            => $payment->getId(),
                'amount'        => $payment->getAmount(),
                'cycle'         => $payment->getCycle(),
                'status'        => $payment->getStatus(),
                'gateway'       => $payment->getGateway(),
                'last4'         => $payment->getLast4(),
                'invoiceNumber' => $payment->getInvoiceNumber(),
                'paidAt'        => $payment->getPaidAt()?->format('Y-m-d H:i:s'),
            ];
        }

        return new JsonResponse($data);
    }
}
