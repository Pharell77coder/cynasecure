<?php

namespace App\Controller;

use App\Entity\Subscription;
use App\Entity\Service;
use App\Entity\User;
use App\Entity\Payment;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/subscriptions')]
class SubscriptionController extends AbstractController
{
    // CREATE SUBSCRIPTION (PRO VERSION)
    #[Route('', name: 'subscription_create', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        /** @var User $user */
        $user = $this->getUser();

        // Validate service
        $service = $em->getRepository(Service::class)->find($data['serviceId'] ?? null);
        if (!$service) {
            return new JsonResponse(['message' => 'Service not found'], 404);
        }

        // Validate cycle
        $cycle = $data['cycle'] ?? 'monthly';
        if (!in_array($cycle, ['monthly', 'yearly'])) {
            return new JsonResponse(['message' => 'Invalid cycle'], 400);
        }

        // Determine price based on cycle
        $price = $cycle === 'monthly'
            ? $service->getPriceMonthly()
            : $service->getPriceYearly();

        $now = new \DateTimeImmutable();

        // Calculate next billing date
        $nextBilling = $cycle === 'monthly'
            ? $now->modify('+1 month')
            : $now->modify('+1 year');

        // Create subscription
        $subscription = new Subscription();
        $subscription->setUser($user);
        $subscription->setService($service);
        $subscription->setCycle($cycle);
        $subscription->setPrice($price);
        $subscription->setStatus('ACTIVE');
        $subscription->setStartDate($now);
        $subscription->setNextBillingAt($nextBilling);
        $subscription->setEndDate(null);

        $em->persist($subscription);
        $em->flush();

        // CREATE INITIAL PAYMENT
        $payment = new Payment();
        $payment->setSubscription($subscription);
        $payment->setAmount($price);
        $payment->setCycle($cycle);
        $payment->setStatus('paid');
        $payment->setPaidAt(new \DateTimeImmutable());

        $em->persist($payment);
        $em->flush();

        return new JsonResponse([
            'message' => 'Subscription created successfully',
            'subscriptionId' => $subscription->getId()
        ], 201);
    }

    // LIST USER SUBSCRIPTIONS
    #[Route('/my', name: 'subscription_list_user', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function listUserSubscriptions(EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $subscriptions = $em->getRepository(Subscription::class)->findBy(['user' => $user]);

        $data = array_map(fn($s) => [
            'id' => $s->getId(),
            'service' => [
                'id' => $s->getService()->getId(),
                'title' => $s->getService()->getTitle(),
                'categorySlug' => $s->getService()->getCategorySlug(),
            ],
            'cycle' => $s->getCycle(),
            'price' => $s->getPrice(),
            'status' => $s->getStatus(),
            'startDate' => $s->getStartDate()->format('Y-m-d'),
            'nextBillingAt' => $s->getNextBillingAt()?->format('Y-m-d'),
            'endDate' => $s->getEndDate()?->format('Y-m-d'),
        ], $subscriptions);

        return new JsonResponse($data);
    }

    // GET SUBSCRIPTION BY ID
    #[Route('/{id}', name: 'subscription_show', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function show(Subscription $subscription): JsonResponse
    {
        if ($subscription->getUser() !== $this->getUser()) {
            return new JsonResponse(['message' => 'Access denied'], 403);
        }

        return new JsonResponse([
            'id' => $subscription->getId(),
            'service' => [
                'id' => $subscription->getService()->getId(),
                'title' => $subscription->getService()->getTitle(),
                'categorySlug' => $subscription->getService()->getCategorySlug(),
            ],
            'cycle' => $subscription->getCycle(),
            'price' => $subscription->getPrice(),
            'status' => $subscription->getStatus(),
            'startDate' => $subscription->getStartDate()->format('Y-m-d'),
            'nextBillingAt' => $subscription->getNextBillingAt()?->format('Y-m-d'),
            'endDate' => $subscription->getEndDate()?->format('Y-m-d'),
        ]);
    }

    // CANCEL SUBSCRIPTION
    #[Route('/{id}/cancel', name: 'subscription_cancel', methods: ['PUT'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function cancel(Subscription $subscription, EntityManagerInterface $em): JsonResponse
    {
        if ($subscription->getUser() !== $this->getUser()) {
            return new JsonResponse(['message' => 'Access denied'], 403);
        }

        if ($subscription->getStatus() === 'CANCELLED') {
            return new JsonResponse(['message' => 'Subscription already cancelled'], 400);
        }

        $subscription->setStatus('CANCELLED');
        $subscription->setEndDate(new \DateTimeImmutable());

        $em->flush();

        return new JsonResponse(['message' => 'Subscription cancelled successfully']);
    }
}
