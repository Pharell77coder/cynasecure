<?php

namespace App\Controller;

use App\Entity\Payment;
use App\Entity\Subscription;
use App\Repository\ServiceRepository;
use App\Repository\SubscriptionRepository;
use App\Service\StripeService;
use DateInterval;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Webhook;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class StripeController extends AbstractController
{
    #[Route('/api/stripe/checkout', name: 'stripe_checkout', methods: ['POST'])]
    public function checkout(
        Request $request,
        ServiceRepository $serviceRepo,
        StripeService $stripe
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $serviceId = $data['serviceId'] ?? null;
        $cycle = $data['cycle'] ?? null;

        if (!$serviceId || !$cycle) {
            return new JsonResponse(['message' => 'Missing parameters'], 400);
        }

        $service = $serviceRepo->find($serviceId);
        if (!$service) {
            return new JsonResponse(['message' => 'Service not found'], 404);
        }

        $priceId = $cycle === 'monthly'
            ? $service->getStripePriceMonthly()
            : $service->getStripePriceYearly();

        if (!$priceId) {
            return new JsonResponse(['message' => 'Stripe price not configured'], 400);
        }

        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }

        // Création de la session Stripe Checkout
        $session = $stripe->createCheckoutSession([
            'priceId' => $priceId,
            'email' => $user->getEmail(),
            'successUrl' => 'http://localhost:3000/success',
            'cancelUrl' => 'http://localhost:3000/cancel',
            'metadata' => [
                'serviceId' => $serviceId,
                'cycle' => $cycle,
            ],
        ]);

        return new JsonResponse(['url' => $session->url], 200);
    }

    #[Route('/api/stripe/webhook', name: 'stripe_webhook', methods: ['POST'])]
    public function webhook(
        Request $request,
        EntityManagerInterface $em,
        SubscriptionRepository $subscriptionRepo,
        ServiceRepository $serviceRepo
    ): Response {
        $payload = $request->getContent();
        $sigHeader = $request->headers->get('stripe-signature');
        $secret = $_ENV['STRIPE_WEBHOOK_SECRET'] ?? null;

        if (!$secret) {
            return new Response('Webhook secret not configured', 500);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Exception $e) {
            return new Response('Invalid signature', 400);
        }

        switch ($event->type) {

            // 1) Paiement initial → création abonnement
            case 'checkout.session.completed':
                $session = $event->data->object;

                $serviceId = $session->metadata->serviceId ?? null;
                $cycle = $session->metadata->cycle ?? null;

                if (!$serviceId || !$cycle) {
                    break;
                }

                $service = $serviceRepo->find($serviceId);
                if (!$service) break;

                $subscription = new Subscription();
                $subscription->setUserEmail($session->customer_email ?? null);
                $subscription->setService($service);
                $subscription->setCycle($cycle);
                $subscription->setStatus('ACTIVE');
                $subscription->setStripeSubscriptionId($session->subscription ?? null);
                $subscription->setStartDate(new \DateTimeImmutable());

                if ($cycle === 'monthly') {
                    $subscription->setPrice($service->getPriceMonthly());
                    $subscription->setNextBillingAt((new DateTime())->add(new DateInterval('P1M')));
                } else {
                    $subscription->setPrice($service->getPriceYearly());
                    $subscription->setNextBillingAt((new DateTime())->add(new DateInterval('P1Y')));
                }

                $em->persist($subscription);
                $em->flush();
                break;

            // 2) Renouvellement automatique réussi
            case 'invoice.paid':
                $invoice = $event->data->object;
                $stripeSubscriptionId = $invoice->subscription ?? null;

                if (!$stripeSubscriptionId) break;

                $subscription = $subscriptionRepo->findOneBy(['stripeSubscriptionId' => $stripeSubscriptionId]);
                if (!$subscription) break;

                if ($subscription->getCycle() === 'monthly') {
                    $subscription->setNextBillingAt((new DateTime())->add(new DateInterval('P1M')));
                } else {
                    $subscription->setNextBillingAt((new DateTime())->add(new DateInterval('P1Y')));
                }

                $payment = new Payment();
                $payment->setSubscription($subscription);
                $payment->setAmount($subscription->getPrice());
                $payment->setCycle($subscription->getCycle());
                $payment->setStatus('paid');
                $payment->setStripePaymentIntentId($invoice->payment_intent ?? null);
                $payment->setPaidAt(new \DateTimeImmutable());

                $em->persist($payment);
                $em->flush();
                break;

            // 3) Échec de paiement
            case 'invoice.payment_failed':
                $invoice = $event->data->object;
                $stripeSubscriptionId = $invoice->subscription ?? null;

                if (!$stripeSubscriptionId) break;

                $subscription = $subscriptionRepo->findOneBy(['stripeSubscriptionId' => $stripeSubscriptionId]);
                if (!$subscription) break;

                $subscription->setStatus('PAST_DUE');
                $em->flush();
                break;
        }

        return new Response('OK', 200);
    }
}
