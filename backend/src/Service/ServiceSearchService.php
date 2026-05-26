<?php

namespace App\Service;

use App\Dto\SearchCriteria;
use App\Entity\Service;
use Doctrine\ORM\EntityManagerInterface;

class ServiceSearchService
{
    public function __construct(private EntityManagerInterface $em) {}

    public function search(SearchCriteria $c): array
    {
        $qb = $this->em->createQueryBuilder()
            ->select('s')
            ->from(Service::class, 's')
            ->leftJoin('s.category', 'cat')
            ->setMaxResults(200);

        if ($c->type !== 'all') {
            $qb->andWhere('s.type = :type')->setParameter('type', $c->type);
        }

        if ($c->categories) {
            $qb->andWhere('cat.slug IN (:cats)')->setParameter('cats', $c->categories);
        }

        if ($c->priceMin !== null) {
            $qb->andWhere('s.priceMonthly >= :pmin')->setParameter('pmin', $c->priceMin);
        }

        if ($c->priceMax !== null) {
            $qb->andWhere('s.priceMonthly <= :pmax')->setParameter('pmax', $c->priceMax);
        }

        if ($c->onlyAvailable) {
            $qb->andWhere('s.isAvailable = true');
        }

        $services = $qb->getQuery()->getResult();

        $term = mb_strtolower(trim($c->q));
        $scored = [];
        foreach ($services as $s) {
            $sc = $this->score($s, $term);
            if ($sc === 0) continue;
            $scored[] = ['service' => $s, 'score' => $sc];
        }

        usort($scored, function (array $a, array $b) use ($c): int {
            if ($c->sort === 'price_asc') {
                $cmp = $a['service']->getPriceMonthly() <=> $b['service']->getPriceMonthly();
                return $cmp !== 0 ? $cmp : $b['score'] <=> $a['score'];
            }
            if ($c->sort === 'price_desc') {
                $cmp = $b['service']->getPriceMonthly() <=> $a['service']->getPriceMonthly();
                return $cmp !== 0 ? $cmp : $b['score'] <=> $a['score'];
            }
            if ($c->sort === 'newest') {
                $cmp = ($b['service']->getCreatedAt()?->getTimestamp() ?? 0) <=> ($a['service']->getCreatedAt()?->getTimestamp() ?? 0);
                return $cmp !== 0 ? $cmp : $b['score'] <=> $a['score'];
            }
            return $b['score'] <=> $a['score'];
        });

        return $scored;
    }

    private function score(Service $s, string $term): int
    {
        if ($term === '') return 1;

        $name  = mb_strtolower($s->getName() ?? '');
        $words = preg_split('/\s+/', $name, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $best  = 0;

        foreach ($words as $w) {
            if ($w === $term)                        { return 100; }
            if (levenshtein($w, $term) === 1)        { $best = max($best, 80); }
            elseif (str_starts_with($w, $term))      { $best = max($best, 60); }
            elseif (str_contains($w, $term))         { $best = max($best, 40); }
        }

        if ($best === 0 && str_contains($name, $term)) {
            $best = 40;
        }

        if ($best === 0 && str_contains(mb_strtolower($s->getDescription() ?? ''), $term)) {
            $best = 30;
        }

        if ($best === 0) {
            foreach ($s->getFeatures() ?? [] as $f) {
                if (str_contains(mb_strtolower($f['label'] ?? ''), $term)) {
                    return 20;
                }
            }
        }

        return $best;
    }
}
