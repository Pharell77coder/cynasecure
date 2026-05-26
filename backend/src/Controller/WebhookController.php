<?php

namespace App\Controller;

use App\Entity\Order;
use App\Service\PayPalService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class WebhookController extends AbstractController
{
    #[Route('/api/webhooks/paypal', name: 'webhook_paypal', methods: ['POST'])]
    public function paypal(
        Request $request,
        PayPalService $paypal,
        EntityManagerInterface $em
    ): Response {
        $rawBody = $request->getContent();

        $headers = [
            'paypal-auth-algo'         => $request->headers->get('paypal-auth-algo', ''),
            'paypal-cert-url'          => $request->headers->get('paypal-cert-url', ''),
            'paypal-transmission-id'   => $request->headers->get('paypal-transmission-id', ''),
            'paypal-transmission-sig'  => $request->headers->get('paypal-transmission-sig', ''),
            'paypal-transmission-time' => $request->headers->get('paypal-transmission-time', ''),
        ];

        if (!$paypal->verifyWebhookSignature($headers, $rawBody)) {
            return new Response('Invalid signature', 400);
        }

        $event = json_decode($rawBody, true);
        $type  = $event['event_type'] ?? '';

        match ($type) {
            'PAYMENT.CAPTURE.COMPLETED' => $this->handleCaptureCompleted($event, $em),
            'PAYMENT.CAPTURE.DENIED'    => $this->handleCaptureDenied($event, $em),
            'PAYMENT.CAPTURE.REFUNDED'  => $this->handleCaptureRefunded($event, $em),
            default                     => null,
        };

        return new Response('OK', 200);
    }

    private function handleCaptureCompleted(array $event, EntityManagerInterface $em): void
    {
        $paypalOrderId = $event['resource']['supplementary_data']['related_ids']['order_id'] ?? null;
        if (!$paypalOrderId) {
            return;
        }

        $order = $em->getRepository(Order::class)->findOneBy(['paypalOrderId' => $paypalOrderId]);
        if (!$order) {
            return;
        }

        $order->setStatus('PAID');
        $em->flush();
    }

    private function handleCaptureDenied(array $event, EntityManagerInterface $em): void
    {
        $paypalOrderId = $event['resource']['supplementary_data']['related_ids']['order_id'] ?? null;
        if (!$paypalOrderId) {
            return;
        }

        $order = $em->getRepository(Order::class)->findOneBy(['paypalOrderId' => $paypalOrderId]);
        if (!$order) {
            return;
        }

        $order->setStatus('FAILED');
        $em->flush();
    }

    private function handleCaptureRefunded(array $event, EntityManagerInterface $em): void
    {
        $paypalOrderId = $event['resource']['supplementary_data']['related_ids']['order_id'] ?? null;
        if (!$paypalOrderId) {
            return;
        }

        $order = $em->getRepository(Order::class)->findOneBy(['paypalOrderId' => $paypalOrderId]);
        if (!$order) {
            return;
        }

        $order->setStatus('REFUNDED');
        $em->flush();
    }
}
