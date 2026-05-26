<?php

namespace App\Repository;

use App\Entity\Subscription;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class SubscriptionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Subscription::class);
    }

    /**
     * Compte les abonnements actifs
     */
    public function countActive(): int
    {
        return (int) $this->createQueryBuilder('sub')
            ->select('COUNT(sub.id)')
            ->where('sub.status = :active')
            ->setParameter('active', 'ACTIVE')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Calcule le MRR (Monthly Recurring Revenue)
     * Basé sur le prix du service lié
     */
    public function calculateMRR(): float
    {
        return (float) $this->createQueryBuilder('sub')
            ->select('COALESCE(SUM(s.priceMonthly), 0)')
            ->join('sub.service', 's')
            ->where('sub.status = :active')
            ->setParameter('active', 'ACTIVE')
            ->getQuery()
            ->getSingleScalarResult();
    }

    /** @return Subscription[] */
    public function findDueForRenewal(\DateTimeImmutable $now): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.status = :active')
            ->andWhere('s.autoRenew = true')
            ->andWhere('s.nextBillingAt <= :now')
            ->setParameter('active', 'ACTIVE')
            ->setParameter('now', $now)
            ->getQuery()
            ->getResult();
    }

}
