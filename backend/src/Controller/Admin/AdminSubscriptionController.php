<?php

namespace App\Controller\Admin;

use App\Entity\Subscription;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/subscriptions')]
#[IsGranted('ROLE_ADMIN')]
class AdminSubscriptionController extends AbstractController
{
    private const SORT_FIELDS = ['startDate', 'price', 'status', 'id'];

    #[Route('', name: 'admin_subscriptions_list', methods: ['GET'])]
    public function list(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $page    = max(1, (int) $request->query->get('page', 1));
        $perPage = min(100, max(1, (int) $request->query->get('perPage', 20)));
        $sort    = in_array($request->query->get('sort'), self::SORT_FIELDS, true) ? $request->query->get('sort') : 'startDate';
        $order   = strtoupper($request->query->get('order', 'desc')) === 'ASC' ? 'ASC' : 'DESC';

        $repo = $em->getRepository(Subscription::class);

        $total = (int) $repo->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $subs = $repo->createQueryBuilder('s')
            ->orderBy("s.{$sort}", $order)
            ->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage)
            ->getQuery()
            ->getResult();

        $items = array_map(fn(Subscription $s) => [
            'id'      => $s->getId(),
            'user'    => [
                'id'          => $s->getUser()->getId(),
                'email'       => $s->getUser()->getEmail(),
                'displayName' => $s->getUser()->getDisplayName(),
            ],
            'service' => [
                'id'   => $s->getService()->getId(),
                'name' => $s->getService()->getName(),
            ],
            'cycle'            => $s->getCycle(),
            'price'            => $s->getPrice(),
            'status'           => $s->getStatus(),
            'startDate'        => $s->getStartDate()?->format('Y-m-d'),
            'nextBillingAt'    => $s->getNextBillingAt()?->format('Y-m-d'),
            'invoicePaymentId' => $s->getInvoicePaymentId(),
        ], $subs);

        return $this->json([
            'items'      => $items,
            'total'      => $total,
            'page'       => $page,
            'perPage'    => $perPage,
            'totalPages' => (int) ceil($total / $perPage),
        ]);
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
            'id'      => $subscription->getId(),
        ]);
    }
}
