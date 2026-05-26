<?php

namespace App\Service;

use App\Entity\FraudCheck;
use App\Entity\Order;
use App\Repository\FraudCheckRepository;
use App\Repository\OrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;

class FraudDetectionService
{
    private const DISPOSABLE_DOMAINS = [
        'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwam.com',
        'yopmail.com', 'trashmail.com', 'sharklasers.com', 'guerrillamailblock.com',
        'grr.la', 'guerrillamail.info', 'spam4.me', 'maildrop.cc', 'dispostable.com',
    ];

    public function __construct(
        private EntityManagerInterface $em,
        private FraudCheckRepository $fcRepo,
        private OrderRepository $orderRepo,
        private LoggerInterface $logger,
    ) {}

    public function assess(Order $order, Request $request): array
    {
        $ip        = $this->getIp($request);
        $userAgent = substr($request->headers->get('User-Agent', ''), 0, 512);
        $score     = 0;
        $rules     = [];

        // IP velocity: >3 orders from same IP in last hour
        $since   = new \DateTimeImmutable('-1 hour');
        $ipCount = $this->fcRepo->countRecentByIp($ip, $since);
        if ($ipCount >= 3) {
            $score  += 30;
            $rules[] = 'ip_velocity';
        }

        // Email velocity: >2 orders from same email in last hour
        $email = $order->getUser()?->getEmail() ?? $order->getGuestEmail() ?? '';
        if ($email && $this->countRecentByEmail($email, $since) >= 2) {
            $score  += 25;
            $rules[] = 'email_velocity';
        }

        // Disposable email domain
        if ($email) {
            $domain = strtolower(substr($email, strrpos($email, '@') + 1));
            if (in_array($domain, self::DISPOSABLE_DOMAINS, true)) {
                $score  += 20;
                $rules[] = 'disposable_email';
            }
        }

        // High amount vs average (>2.5x average order)
        $avgAmount = $this->getAvgOrderAmount();
        if ($avgAmount > 0 && $order->getTotal() > $avgAmount * 2.5) {
            $score  += 15;
            $rules[] = 'high_amount';
        }

        // New account (<24h)
        $user = $order->getUser();
        if ($user) {
            $created = $user->getCreatedAt();
            if ($created && (new \DateTimeImmutable())->getTimestamp() - $created->getTimestamp() < 86400) {
                $score  += 10;
                $rules[] = 'new_account';
            }
        }

        $level = match(true) {
            $score >= 61 => 'blocked',
            $score >= 31 => 'review',
            default      => 'ok',
        };

        $fc = new FraudCheck();
        $fc->setOrderRef($order);
        $fc->setScore($score);
        $fc->setLevel($level);
        $fc->setRules($rules);
        $fc->setIpAddress($ip);
        $fc->setUserAgent($userAgent);
        $fc->setCheckedAt(new \DateTimeImmutable());
        $this->em->persist($fc);

        if ($level === 'review') {
            $this->logger->warning('Fraud review', ['orderId' => $order->getId(), 'score' => $score, 'ip' => $ip]);
        } elseif ($level === 'blocked') {
            $this->logger->error('Fraud blocked', ['orderId' => $order->getId(), 'score' => $score, 'ip' => $ip]);
        }

        return ['score' => $score, 'level' => $level, 'rules' => $rules];
    }

    private function getIp(Request $request): string
    {
        $forwarded = $request->headers->get('X-Forwarded-For');
        if ($forwarded) {
            return trim(explode(',', $forwarded)[0]);
        }
        return $request->getClientIp() ?? '0.0.0.0';
    }

    private function countRecentByEmail(string $email, \DateTimeImmutable $since): int
    {
        return (int) $this->em->createQuery(
            'SELECT COUNT(o.id) FROM App\Entity\Order o
             WHERE (o.guestEmail = :email OR (o.user IS NOT NULL AND EXISTS (
                 SELECT 1 FROM App\Entity\User u WHERE u.id = o.user AND u.email = :email
             )))
             AND o.createdAt >= :since'
        )
        ->setParameter('email', $email)
        ->setParameter('since', $since)
        ->getSingleScalarResult();
    }

    private function getAvgOrderAmount(): float
    {
        $result = $this->em->createQuery(
            'SELECT AVG(o.total) FROM App\Entity\Order o WHERE o.status = :status'
        )
        ->setParameter('status', 'PAID')
        ->getSingleScalarResult();

        return $result ? (float) $result : 0.0;
    }
}
