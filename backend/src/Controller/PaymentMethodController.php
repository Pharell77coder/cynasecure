<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Customer;
use Stripe\PaymentMethod;
use Stripe\SetupIntent;
use Stripe\Stripe;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/me/payment-methods')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class PaymentMethodController extends AbstractController
{
    public function __construct(private string $stripeSecretKey)
    {
        Stripe::setApiKey($stripeSecretKey);
    }

    #[Route('', name: 'pm_list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user->getStripeCustomerId()) {
            return $this->json([]);
        }

        try {
            $pms = PaymentMethod::all([
                'customer' => $user->getStripeCustomerId(),
                'type'     => 'card',
            ]);

            $customer = Customer::retrieve($user->getStripeCustomerId());
            $defaultPmId = $customer->invoice_settings->default_payment_method ?? null;

            return $this->json(array_map(fn($pm) => $this->serializePm($pm, $defaultPmId), $pms->data));
        } catch (\Exception $e) {
            return $this->json(['message' => 'Erreur Stripe: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/setup-intent', name: 'pm_setup_intent', methods: ['POST'])]
    public function setupIntent(EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        try {
            if (!$user->getStripeCustomerId()) {
                $customer = Customer::create([
                    'email' => $user->getEmail(),
                    'name'  => $user->getDisplayName(),
                ]);
                $user->setStripeCustomerId($customer->id);
                $em->flush();
            }

            $intent = SetupIntent::create([
                'customer'             => $user->getStripeCustomerId(),
                'payment_method_types' => ['card'],
                'usage'                => 'off_session',
            ]);

            return $this->json(['clientSecret' => $intent->client_secret]);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Erreur Stripe: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/{pmId}/detach', name: 'pm_detach', methods: ['DELETE'])]
    public function detach(string $pmId, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user->getStripeCustomerId()) {
            return $this->json(['message' => 'Not found'], 404);
        }

        try {
            $pm = PaymentMethod::retrieve($pmId);
            if ($pm->customer !== $user->getStripeCustomerId()) {
                return $this->json(['message' => 'Access denied'], 403);
            }
            $pm->detach();
            return $this->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Erreur Stripe: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/{pmId}/default', name: 'pm_set_default', methods: ['POST'])]
    public function setDefault(string $pmId, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user->getStripeCustomerId()) {
            return $this->json(['message' => 'Not found'], 404);
        }

        try {
            $pm = PaymentMethod::retrieve($pmId);
            if ($pm->customer !== $user->getStripeCustomerId()) {
                return $this->json(['message' => 'Access denied'], 403);
            }

            Customer::update($user->getStripeCustomerId(), [
                'invoice_settings' => ['default_payment_method' => $pmId],
            ]);

            return $this->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Erreur Stripe: ' . $e->getMessage()], 500);
        }
    }

    private function serializePm(PaymentMethod $pm, ?string $defaultPmId): array
    {
        return [
            'id'        => $pm->id,
            'brand'     => $pm->card->brand ?? '',
            'last4'     => $pm->card->last4 ?? '',
            'expMonth'  => $pm->card->exp_month ?? null,
            'expYear'   => $pm->card->exp_year ?? null,
            'isDefault' => $pm->id === $defaultPmId,
        ];
    }
}
