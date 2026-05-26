<?php

namespace App\Service;

use Doctrine\DBAL\Connection;

class AdminStatsService
{
    public function __construct(private readonly Connection $conn) {}

    public function getChartData(string $period): array
    {
        $isWeeks = $period === 'weeks';
        [$start, $periodMap] = $isWeeks ? $this->weeksRange() : $this->daysRange();

        return [
            'period'               => $period,
            'salesOverTime'        => $this->salesOverTime($start, $isWeeks, $periodMap),
            'salesByCategory'      => $this->salesByCategory($start, $isWeeks, $periodMap),
            'categoryDistribution' => $this->categoryDistribution($start),
        ];
    }

    /** @return array{string, array<string, string>} */
    private function daysRange(): array
    {
        $map = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = new \DateTimeImmutable("today -{$i} days");
            $map[$d->format('Y-m-d')] = $this->frDayLabel($d);
        }
        return [(new \DateTimeImmutable('today -6 days'))->format('Y-m-d 00:00:00'), $map];
    }

    /** @return array{string, array<string, string>} */
    private function weeksRange(): array
    {
        $map = [];
        for ($i = 4; $i >= 0; $i--) {
            $mon = new \DateTimeImmutable("monday this week -{$i} weeks");
            $key = $mon->format('o') . str_pad($mon->format('W'), 2, '0', STR_PAD_LEFT);
            $map[$key] = 'sem. ' . (int) $mon->format('W');
        }
        return [(new \DateTimeImmutable('monday this week -4 weeks'))->format('Y-m-d 00:00:00'), $map];
    }

    /** @param array<string, string> $periodMap */
    private function salesOverTime(string $start, bool $isWeeks, array $periodMap): array
    {
        $pk  = $isWeeks ? 'YEARWEEK(o.created_at, 3)' : 'DATE(o.created_at)';
        $sql = "SELECT {$pk} AS pk, SUM(o.total) AS total, COUNT(o.id) AS cnt
                FROM `order` o
                WHERE o.status = 'PAID' AND o.created_at >= :start
                GROUP BY {$pk} ORDER BY pk";

        $indexed = [];
        foreach ($this->conn->fetchAllAssociative($sql, ['start' => $start]) as $row) {
            $indexed[(string) $row['pk']] = $row;
        }

        return array_values(array_map(
            function (string $key, string $label) use ($indexed): array {
                $row = $indexed[$key] ?? null;
                return [
                    'label'       => $label,
                    'date'        => $key,
                    'total'       => $row ? round((float) $row['total'], 2) : 0.0,
                    'ordersCount' => $row ? (int) $row['cnt'] : 0,
                ];
            },
            array_keys($periodMap),
            array_values($periodMap)
        ));
    }

    /** @param array<string, string> $periodMap */
    private function salesByCategory(string $start, bool $isWeeks, array $periodMap): array
    {
        $pk  = $isWeeks ? 'YEARWEEK(o.created_at, 3)' : 'DATE(o.created_at)';
        $sql = "SELECT {$pk} AS pk, COALESCE(c.name, 'Autre') AS cat,
                       SUM(oi.price * oi.quantity) AS total
                FROM `order` o
                JOIN order_item oi ON oi.order_ref_id = o.id
                JOIN service s ON s.id = oi.service_id
                LEFT JOIN category c ON c.id = s.category_id
                WHERE o.status = 'PAID' AND o.created_at >= :start
                GROUP BY {$pk}, c.name ORDER BY pk, c.name";

        $indexed = [];
        foreach ($this->conn->fetchAllAssociative($sql, ['start' => $start]) as $row) {
            $indexed[(string) $row['pk']][$row['cat']] = round((float) $row['total'], 2);
        }

        return array_values(array_map(
            function (string $key, string $label) use ($indexed): array {
                return [
                    'label'      => $label,
                    'categories' => (object) ($indexed[$key] ?? []),
                ];
            },
            array_keys($periodMap),
            array_values($periodMap)
        ));
    }

    private function categoryDistribution(string $start): array
    {
        $sql = "SELECT COALESCE(c.name, 'Autre') AS cat, SUM(oi.price * oi.quantity) AS total
                FROM `order` o
                JOIN order_item oi ON oi.order_ref_id = o.id
                JOIN service s ON s.id = oi.service_id
                LEFT JOIN category c ON c.id = s.category_id
                WHERE o.status = 'PAID' AND o.created_at >= :start
                GROUP BY c.name ORDER BY total DESC";

        $rows  = $this->conn->fetchAllAssociative($sql, ['start' => $start]);
        $grand = (float) array_sum(array_column($rows, 'total'));

        if ($grand <= 0) {
            return [];
        }

        $result  = [];
        $usedPct = 0.0;
        $last    = count($rows) - 1;

        foreach ($rows as $i => $row) {
            $total = round((float) $row['total'], 2);
            if ($i === $last) {
                $pct = round(100 - $usedPct, 1);
            } else {
                $pct      = round($total / $grand * 100, 1);
                $usedPct += $pct;
            }
            $result[] = ['category' => $row['cat'], 'total' => $total, 'percentage' => $pct];
        }

        return $result;
    }

    private function frDayLabel(\DateTimeImmutable $d): string
    {
        static $days = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
        return $days[(int) $d->format('w')] . ' ' . $d->format('j');
    }
}
