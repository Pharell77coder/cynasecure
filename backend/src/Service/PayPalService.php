<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class PayPalService
{
    private string $baseUrl;

    public function __construct(
        private HttpClientInterface $httpClient,
        private string $clientId,
        private string $secret,
        private string $mode,
        private string $webhookId = ''
    ) {
        $this->baseUrl = $mode === 'sandbox'
            ? 'https://api-m.sandbox.paypal.com'
            : 'https://api-m.paypal.com';
    }

    private function getAccessToken(): string
    {
        $response = $this->httpClient->request('POST', $this->baseUrl . '/v1/oauth2/token', [
            'auth_basic' => [$this->clientId, $this->secret],
            'body'       => 'grant_type=client_credentials',
            'headers'    => ['Content-Type' => 'application/x-www-form-urlencoded'],
        ]);

        return $response->toArray()['access_token'];
    }

    public function createOrder(float $total, array $lineItems): array
    {
        $token = $this->getAccessToken();

        $purchaseUnits = [[
            'amount' => [
                'currency_code' => 'EUR',
                'value'         => number_format($total, 2, '.', ''),
                'breakdown'     => [
                    'item_total' => [
                        'currency_code' => 'EUR',
                        'value'         => number_format($total, 2, '.', ''),
                    ],
                ],
            ],
            'items' => array_map(fn($item) => [
                'name'       => $item['name'],
                'unit_amount' => [
                    'currency_code' => 'EUR',
                    'value'         => number_format($item['price'], 2, '.', ''),
                ],
                'quantity' => '1',
            ], $lineItems),
        ]];

        $response = $this->httpClient->request('POST', $this->baseUrl . '/v2/checkout/orders', [
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
                'Content-Type'  => 'application/json',
            ],
            'json' => [
                'intent'         => 'CAPTURE',
                'purchase_units' => $purchaseUnits,
            ],
        ]);

        return $response->toArray();
    }

    public function captureOrder(string $paypalOrderId): array
    {
        $token = $this->getAccessToken();

        $response = $this->httpClient->request(
            'POST',
            $this->baseUrl . '/v2/checkout/orders/' . $paypalOrderId . '/capture',
            [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type'  => 'application/json',
                ],
            ]
        );

        return $response->toArray();
    }

    public function verifyWebhookSignature(array $headers, string $rawBody): bool
    {
        if (!$this->webhookId) {
            return false;
        }

        try {
            $token = $this->getAccessToken();

            $payload = [
                'auth_algo'         => $headers['paypal-auth-algo'] ?? '',
                'cert_url'          => $headers['paypal-cert-url'] ?? '',
                'transmission_id'   => $headers['paypal-transmission-id'] ?? '',
                'transmission_sig'  => $headers['paypal-transmission-sig'] ?? '',
                'transmission_time' => $headers['paypal-transmission-time'] ?? '',
                'webhook_id'        => $this->webhookId,
                'webhook_event'     => json_decode($rawBody, true),
            ];

            $response = $this->httpClient->request('POST', $this->baseUrl . '/v1/notifications/verify-webhook-signature', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type'  => 'application/json',
                ],
                'json' => $payload,
            ]);

            return ($response->toArray(false)['verification_status'] ?? '') === 'SUCCESS';
        } catch (\Throwable) {
            return false;
        }
    }

    public function getOrder(string $paypalOrderId): array
    {
        $token = $this->getAccessToken();

        $response = $this->httpClient->request(
            'GET',
            $this->baseUrl . '/v2/checkout/orders/' . $paypalOrderId,
            [
                'headers' => [
                    'Authorization' => 'Bearer ' . $token,
                    'Content-Type'  => 'application/json',
                ],
            ]
        );

        return $response->toArray();
    }
}
