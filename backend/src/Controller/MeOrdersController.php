<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class MeOrdersController extends AbstractController
{
    #[Route('/api/me/orders', name: 'me_order_history', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function history(Request $request, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $qb = $em->createQueryBuilder()
            ->select('o')
            ->from(Order::class, 'o')
            ->where('o.user = :user')
            ->setParameter('user', $user)
            ->orderBy('o.createdAt', 'DESC');

        $yearParam = $request->query->get('year');
        if ($yearParam && ctype_digit((string) $yearParam)) {
            $qb->andWhere('YEAR(o.createdAt) = :year')
               ->setParameter('year', (int) $yearParam);
        }

        $statusParam = $request->query->get('status');
        if ($statusParam) {
            $qb->andWhere('o.status = :status')
               ->setParameter('status', strtoupper($statusParam));
        }

        $orders = $qb->getQuery()->getResult();

        $q = strtolower(trim($request->query->get('q', '')));

        $serialized = [];
        foreach ($orders as $o) {
            $items = [];
            foreach ($o->getOrderItems() as $item) {
                $svc = $item->getService();
                $serviceName = $svc?->getName() ?? '';
                $serviceType = $svc?->getType() ?? '';

                if ($q && !str_contains(strtolower($serviceName), $q)) {
                    continue;
                }

                $items[] = [
                    'id'          => $item->getId(),
                    'serviceName' => $serviceName,
                    'serviceType' => $serviceType,
                    'billing'     => $item->getBilling(),
                    'price'       => $item->getPrice(),
                    'quantity'    => $item->getQuantity(),
                ];
            }

            if ($q && count($items) === 0) continue;

            $serialized[] = [
                'id'         => $o->getId(),
                'total'      => $o->getTotal(),
                'status'     => $o->getStatus(),
                'gateway'    => $o->getGateway(),
                'createdAt'  => $o->getCreatedAt()->format('c'),
                'year'       => (int) $o->getCreatedAt()->format('Y'),
                'items'      => $items,
                'invoiceUrl' => '/api/checkout/invoice/' . $o->getId(),
            ];
        }

        return new JsonResponse($serialized);
    }
}
