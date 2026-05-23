<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Payment;
use App\Entity\Service;
use App\Entity\Subscription;
use App\Entity\User;
use App\Repository\OrderRepository;
use App\Repository\PaymentRepository;
use App\Service\InvoiceService;
use App\Service\PayPalService;
use App\Service\StripeService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/checkout')]
class CheckoutController extends AbstractController
{
    #[Route('/intent', name: 'checkout_intent', methods: ['POST'])]
    public function intent(
        Request $request,
        EntityManagerInterface $em,
        StripeService $stripe,
        PayPalService $paypal
    ): JsonResponse {
        if (!$this->rateLimit($request, 10, 60)) {
            return new JsonResponse(['message' => 'Trop de requêtes. Attendez une minute.'], 429);
        }

        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'Authentification requise.'], 401);
        }

        $data     = json_decode($request->getContent(), true) ?? [];
        $rawItems = $data['items'] ?? [];
        $address  = $data['address'] ?? [];

        if (empty($rawItems)) {
            return new JsonResponse(['message' => 'Le panier est vide.'], 400);
        }

        if (!$this->validateAddress($address)) {
            return new JsonResponse(['message' => 'Adresse de facturation incomplète.'], 400);
        }

        // Compute total server-side — never trust the front
        $orderItems  = [];
        $total       = 0.0;
        $paypalItems = [];

        foreach ($rawItems as $raw) {
            $serviceId = (int) ($raw['serviceId'] ?? 0);
            $billing   = in_array($raw['billing'] ?? '', ['monthly', 'yearly'], true)
                ? $raw['billing']
                : 'monthly';

            $service = $em->getRepository(Service::class)->find($serviceId);
            if (!$service) {
                return new JsonResponse(['message' => "Service #{$serviceId} introuvable."], 404);
            }

            $price = ($billing === 'yearly' && $service->getPriceYearly())
                ? (float) $service->getPriceYearly()
                : (float) $service->getPriceMonthly();

            $orderItems[]  = ['service' => $service, 'billing' => $billing, 'price' => $price];
            $total        += $price;
            $paypalItems[] = ['name' => $service->getName(), 'price' => $price];
        }

        $total = round($total, 2);

        // Create pending Order
        $order = new Order();
        $order->setUser($user);
        $order->setStatus('PENDING');
        $order->setTotal($total);
        $order->setBillingAddress($address);
        $order->setCreatedAt(new \DateTimeImmutable());
        $em->persist($order);

        foreach ($orderItems as $oi) {
            $item = new OrderItem();
            $item->setOrderRef($order);
            $item->setService($oi['service']);
            $item->setQuantity(1);
            $item->setPrice($oi['price']);
            $item->setBilling($oi['billing']);
            $em->persist($item);
        }

        $em->flush();

        // Stripe PaymentIntent
        try {
            $amountCents = (int) round($total * 100);
            $pi = $stripe->createPaymentIntent(
                $amountCents,
                'eur',
                'CynaSecure #' . $order->getId()
            );
            $order->setStripePaymentIntentId($pi->id);
        } catch (\Exception $e) {
            $em->remove($order);
            $em->flush();
            return new JsonResponse(['message' => 'Erreur Stripe : ' . $e->getMessage()], 502);
        }

        // PayPal Order
        try {
            $ppOrder = $paypal->createOrder($total, $paypalItems);
            $order->setPaypalOrderId($ppOrder['id'] ?? null);
        } catch (\Exception $e) {
            // PayPal failure is non-blocking — Stripe remains available
            $order->setPaypalOrderId(null);
        }

        $em->flush();

        $responseItems = array_map(fn($oi) => [
            'name'    => $oi['service']->getName(),
            'price'   => $oi['price'],
            'billing' => $oi['billing'],
        ], $orderItems);

        return new JsonResponse([
            'clientSecret'  => $pi->client_secret,
            'paypalOrderId' => $order->getPaypalOrderId(),
            'orderId'       => $order->getId(),
            'total'         => $total,
            'items'         => $responseItems,
        ]);
    }

    #[Route('/confirm', name: 'checkout_confirm', methods: ['POST'])]
    public function confirm(
        Request $request,
        EntityManagerInterface $em,
        OrderRepository $orderRepo,
        StripeService $stripe,
        PayPalService $paypal,
        PaymentRepository $paymentRepo
    ): JsonResponse {
        if (!$this->rateLimit($request, 10, 60)) {
            return new JsonResponse(['message' => 'Trop de requêtes. Attendez une minute.'], 429);
        }

        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'Authentification requise.'], 401);
        }

        $data    = json_decode($request->getContent(), true) ?? [];
        $orderId = (int) ($data['orderId'] ?? 0);
        $gateway = $data['gateway'] ?? '';

        $order = $orderRepo->find($orderId);
        if (!$order || $order->getUser()->getId() !== $user->getId()) {
            return new JsonResponse(['message' => 'Commande introuvable.'], 404);
        }

        if ($order->getStatus() === 'PAID') {
            return new JsonResponse(['message' => 'Cette commande est déjà payée.'], 409);
        }

        if (!in_array($gateway, ['stripe', 'paypal'], true)) {
            return new JsonResponse(['message' => 'Passerelle de paiement invalide.'], 400);
        }

        $last4 = null;

        if ($gateway === 'stripe') {
            $piId = trim($data['paymentIntentId'] ?? '');
            if (!$piId || $piId !== $order->getStripePaymentIntentId()) {
                return new JsonResponse(['message' => 'PaymentIntent invalide.'], 400);
            }

            try {
                $pi = $stripe->retrievePaymentIntent($piId);
            } catch (\Exception $e) {
                return new JsonResponse(['message' => 'Impossible de vérifier le paiement Stripe.'], 502);
            }

            if ($pi->status !== 'succeeded') {
                return new JsonResponse(['message' => 'Le paiement Stripe n\'est pas confirmé (status: ' . $pi->status . ').'], 402);
            }

            if ($pi->latest_charge) {
                try {
                    $charge = \Stripe\Charge::retrieve((string) $pi->latest_charge);
                    $last4  = $charge->payment_method_details?->card?->last4;
                } catch (\Exception) {}
            }

        } elseif ($gateway === 'paypal') {
            $ppOrderId = trim($data['paypalOrderId'] ?? '');
            if (!$ppOrderId || $ppOrderId !== $order->getPaypalOrderId()) {
                return new JsonResponse(['message' => 'Identifiant PayPal invalide.'], 400);
            }

            try {
                $ppResult = $paypal->captureOrder($ppOrderId);
            } catch (\Exception $e) {
                return new JsonResponse(['message' => 'Erreur PayPal : ' . $e->getMessage()], 502);
            }

            if (($ppResult['status'] ?? '') !== 'COMPLETED') {
                return new JsonResponse(['message' => 'La capture PayPal a échoué (status: ' . ($ppResult['status'] ?? '?') . ').'], 402);
            }
        }

        // Invoice number
        $year          = (int) date('Y');
        $count         = $paymentRepo->count([]) + 1;
        $invoiceNumber = sprintf('INV-%d-%04d', $year, $count);

        // Payment record
        $payment = new Payment();
        $payment->setOrderRef($order);
        $payment->setAmount($order->getTotal());
        $payment->setCycle('checkout');
        $payment->setStatus('paid');
        $payment->setGateway($gateway);
        $payment->setInvoiceNumber($invoiceNumber);
        $payment->setPaidAt(new \DateTimeImmutable());

        if ($gateway === 'stripe') {
            $payment->setStripePaymentIntentId($order->getStripePaymentIntentId());
            if ($last4) {
                $payment->setLast4($last4);
            }
        } else {
            $payment->setPaypalOrderId($order->getPaypalOrderId());
        }

        $em->persist($payment);

        // Subscriptions
        $now = new \DateTimeImmutable();
        foreach ($order->getOrderItems() as $item) {
            $sub = new Subscription();
            $sub->setUser($user);
            $sub->setService($item->getService());
            $sub->setCycle($item->getBilling() === 'yearly' ? 'yearly' : 'monthly');
            $sub->setPrice($item->getPrice());
            $sub->setStatus('ACTIVE');
            $sub->setStartDate($now);
            $sub->setUserEmail($user->getEmail());

            // ✅ DateTimeImmutable::add() returns DateTimeImmutable — no TypeError
            if ($item->getBilling() === 'yearly') {
                $sub->setNextBillingAt($now->add(new \DateInterval('P1Y')));
                $sub->setEndDate($now->add(new \DateInterval('P1Y')));
            } else {
                $sub->setNextBillingAt($now->add(new \DateInterval('P1M')));
                $sub->setEndDate($now->add(new \DateInterval('P1M')));
            }

            $em->persist($sub);
        }

        $order->setStatus('PAID');
        $order->setGateway($gateway);
        $em->flush();

        return new JsonResponse([
            'ok'            => true,
            'paymentId'     => $payment->getId(),
            'invoiceNumber' => $invoiceNumber,
            'total'         => $order->getTotal(),
        ]);
    }

    #[Route('/invoice/{id}', name: 'checkout_invoice', methods: ['GET'])]
    public function invoice(
        int $id,
        PaymentRepository $paymentRepo,
        InvoiceService $invoiceService
    ): Response {
        /** @var User|null $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'Authentification requise.'], 401);
        }

        $payment = $paymentRepo->find($id);
        if (!$payment) {
            return new JsonResponse(['message' => 'Facture introuvable.'], 404);
        }

        $order   = $payment->getOrderRef();
        $isOwner = $order && $order->getUser()->getId() === $user->getId();
        $isAdmin = in_array('ROLE_ADMIN', $user->getRoles(), true);

        if (!$isOwner && !$isAdmin) {
            return new JsonResponse(['message' => 'Accès refusé.'], 403);
        }

        $pdf           = $invoiceService->generate($payment);
        $invoiceNumber = $payment->getInvoiceNumber() ?? 'facture';

        $response = new Response($pdf);
        $response->headers->set('Content-Type', 'application/pdf');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $invoiceNumber . '.pdf"');
        $response->headers->set('Content-Length', (string) strlen($pdf));

        return $response;
    }

    private function validateAddress(array $addr): bool
    {
        foreach (['firstName', 'lastName', 'address', 'city', 'zipCode', 'country'] as $field) {
            if (empty(trim($addr[$field] ?? ''))) {
                return false;
            }
        }
        return true;
    }

    private function rateLimit(Request $request, int $max, int $windowSec): bool
    {
        try {
            $session = $request->getSession();
            $now     = time();
            $data    = $session->get('checkout_rl', ['count' => 0, 'start' => $now]);

            if ($now - $data['start'] > $windowSec) {
                $data = ['count' => 0, 'start' => $now];
            }

            $data['count']++;
            $session->set('checkout_rl', $data);

            return $data['count'] <= $max;
        } catch (\Exception) {
            return true; // If session unavailable, let the request through
        }
    }
}
