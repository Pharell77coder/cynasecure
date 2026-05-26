<?php

namespace App\Command;

use App\Entity\Payment;
use App\Entity\Subscription;
use App\Repository\SubscriptionRepository;
use App\Service\InvoiceService;
use App\Service\StripeService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:subscriptions:renew', description: 'Charge auto-renewable subscriptions due today')]
class RenewSubscriptionsCommand extends Command
{
    public function __construct(
        private SubscriptionRepository $subRepo,
        private StripeService $stripe,
        private EntityManagerInterface $em,
        private LoggerInterface $logger,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io  = new SymfonyStyle($input, $output);
        $now = new \DateTimeImmutable();

        $subs = $this->subRepo->findDueForRenewal($now);
        $io->writeln(sprintf('Found %d subscription(s) due for renewal', count($subs)));

        $ok      = 0;
        $failed  = 0;

        foreach ($subs as $sub) {
            $sub->setLastRenewalAttempt($now);

            if (!$sub->getPaymentMethodId()) {
                $io->writeln(sprintf('  [SKIP] sub #%d — no payment method saved (requires off_session setup)', $sub->getId()));
                $sub->setRenewalFailureCount($sub->getRenewalFailureCount() + 1);
                $this->em->flush();
                continue;
            }

            try {
                $amountCents = (int) round($sub->getPrice() * 100);
                $pi = $this->stripe->createPaymentIntentOffSession(
                    $amountCents,
                    $sub->getPaymentMethodId(),
                    'eur',
                    sprintf('Renouvellement CynaSecure #%d', $sub->getId())
                );

                $year          = (int) date('Y');
                $count         = $this->em->getRepository(Payment::class)->count([]) + 1;
                $invoiceNumber = sprintf('INV-%d-%04d', $year, $count);

                $payment = new Payment();
                $payment->setSubscription($sub);
                $payment->setAmount($sub->getPrice());
                $payment->setCycle($sub->getCycle());
                $payment->setStatus('paid');
                $payment->setGateway('stripe');
                $payment->setStripePaymentIntentId($pi->id);
                $payment->setInvoiceNumber($invoiceNumber);
                $payment->setPaidAt($now);
                $this->em->persist($payment);

                // Advance next billing date
                $interval = $sub->getCycle() === 'yearly' ? 'P1Y' : 'P1M';
                $next     = ($sub->getNextBillingAt() ?? $now)->add(new \DateInterval($interval));
                $sub->setNextBillingAt($next);
                $sub->setEndDate($next);
                $sub->setRenewalFailureCount(0);
                $sub->setStatus('ACTIVE');
                $this->em->flush();

                $ok++;
                $io->writeln(sprintf('  [OK] sub #%d — %s €', $sub->getId(), $sub->getPrice()));
            } catch (\Exception $e) {
                $sub->setRenewalFailureCount($sub->getRenewalFailureCount() + 1);
                if ($sub->getRenewalFailureCount() >= 3) {
                    $sub->setStatus('PAST_DUE');
                }
                $this->em->flush();
                $failed++;
                $this->logger->error('Renewal failed', ['subId' => $sub->getId(), 'error' => $e->getMessage()]);
                $io->writeln(sprintf('  [FAIL] sub #%d — %s', $sub->getId(), $e->getMessage()));
            }
        }

        $io->success(sprintf('Done — %d renewed, %d failed', $ok, $failed));
        return Command::SUCCESS;
    }
}
