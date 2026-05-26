<?php

namespace App\Repository;

use App\Entity\FraudCheck;
use App\Entity\Order;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class FraudCheckRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FraudCheck::class);
    }

    public function countRecentByIp(string $ip, \DateTimeImmutable $since): int
    {
        return (int) $this->createQueryBuilder('fc')
            ->select('COUNT(fc.id)')
            ->where('fc.ipAddress = :ip')
            ->andWhere('fc.checkedAt >= :since')
            ->setParameter('ip', $ip)
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findByOrder(Order $order): ?FraudCheck
    {
        return $this->findOneBy(['orderRef' => $order]);
    }
}
