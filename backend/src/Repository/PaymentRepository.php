<?php

namespace App\Repository;

use App\Entity\Payment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PaymentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Payment::class);
    }

    /**
     * Retourne les revenus mensuels (compatible MySQL, PostgreSQL, SQLite)
     */
    public function getMonthlyRevenue(): array
    {
        return $this->createQueryBuilder('p')
            ->select("SUBSTRING(p.paidAt, 1, 7) AS month, SUM(p.amount) AS total")
            ->groupBy('month')
            ->orderBy('month', 'ASC')
            ->getQuery()
            ->getArrayResult();
    }
}
