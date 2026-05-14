<?php

namespace App\Service;

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
}
