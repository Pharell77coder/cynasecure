<?php

namespace App\Controller\Admin;

use App\Entity\Payment;
use App\Repository\FraudCheckRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/payments')]
#[IsGranted('ROLE_ADMIN')]
class AdminPaymentController extends AbstractController
{
    private const SORT_FIELDS = ['paidAt', 'amount', 'status', 'id'];

    #[Route('', name: 'admin_payments_list', methods: ['GET'])]
    public function list(Request $request, EntityManagerInterface $em, FraudCheckRepository $fcRepo): JsonResponse
    {
        $page    = max(1, (int) $request->query->get('page', 1));
        $perPage = min(100, max(1, (int) $request->query->get('perPage', 20)));
        $sort    = in_array($request->query->get('sort'), self::SORT_FIELDS, true) ? $request->query->get('sort') : 'paidAt';
        $order   = strtoupper($request->query->get('order', 'desc')) === 'ASC' ? 'ASC' : 'DESC';

        $repo = $em->getRepository(Payment::class);

        $total = (int) $repo->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $payments = $repo->createQueryBuilder('p')
            ->orderBy("p.{$sort}", $order)
            ->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage)
            ->getQuery()
            ->getResult();

        $items = array_map(function(Payment $p) use ($fcRepo) {
            $order = $p->getOrderRef();
            $fc    = $order ? $fcRepo->findByOrder($order) : null;

            return [
                'id'             => $p->getId(),
                'amount'         => $p->getAmount(),
                'cycle'          => $p->getCycle(),
                'status'         => strtoupper($p->getStatus()),
                'paidAt'         => $p->getPaidAt()?->format('Y-m-d H:i:s'),
                'subscriptionId' => $p->getSubscription()?->getId(),
                'user'           => $p->getSubscription() ? [
                    'id'          => $p->getSubscription()->getUser()->getId(),
                    'email'       => $p->getSubscription()->getUser()->getEmail(),
                    'displayName' => $p->getSubscription()->getUser()->getDisplayName(),
                ] : null,
                'service'        => $p->getSubscription()?->getService() ? [
                    'id'   => $p->getSubscription()->getService()->getId(),
                    'name' => $p->getSubscription()->getService()->getName(),
                ] : null,
                'fraud'          => $fc ? [
                    'score' => $fc->getScore(),
                    'level' => $fc->getLevel(),
                ] : null,
            ];
        }, $payments);

        return $this->json([
            'items'      => $items,
            'total'      => $total,
            'page'       => $page,
            'perPage'    => $perPage,
            'totalPages' => (int) ceil($total / $perPage),
        ]);
    }
}
