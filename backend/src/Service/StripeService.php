<?php

namespace App\Service;

use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class StripeService
{
    public function __construct(private string $secretKey)
    {
        Stripe::setApiKey($this->secretKey);
    }

    public function createCheckoutSession(array $data): Session
    {
        return Session::create([
            'mode' => 'subscription',
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price' => $data['priceId'],
                'quantity' => 1,
            ]],
            'success_url' => $data['successUrl'],
            'cancel_url' => $data['cancelUrl'],
            'customer_email' => $data['email'],
        ]);
    }

    public function createPaymentIntent(int $amountCents, string $currency = 'eur', string $description = ''): PaymentIntent
    {
        return PaymentIntent::create([
            'amount'               => $amountCents,
            'currency'             => $currency,
            'description'          => $description,
            'payment_method_types' => ['card'],
            'setup_future_usage'   => 'off_session',
        ]);
    }

    public function createPaymentIntentOffSession(int $amountCents, string $paymentMethodId, string $currency = 'eur', string $description = ''): PaymentIntent
    {
        return PaymentIntent::create([
            'amount'               => $amountCents,
            'currency'             => $currency,
            'description'          => $description,
            'payment_method'       => $paymentMethodId,
            'payment_method_types' => ['card'],
            'confirm'              => true,
            'off_session'          => true,
        ]);
    }

    public function retrievePaymentIntent(string $id): PaymentIntent
    {
        return PaymentIntent::retrieve($id);
    }
}
