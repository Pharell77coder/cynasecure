<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Scheb\TwoFactorBundle\Security\TwoFactor\Provider\Totp\TotpAuthenticatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class TotpController extends AbstractController
{
    #[Route('/api/me/2fa/status', name: 'api_2fa_status', methods: ['GET'])]
    public function status(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        return new JsonResponse([
            'enabled' => $user->isTotpEnabled(),
        ]);
    }

    #[Route('/api/me/2fa/setup', name: 'api_2fa_setup', methods: ['POST'])]
    public function setup(TotpAuthenticatorInterface $totp, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($user->isTotpEnabled()) {
            return new JsonResponse(['message' => 'Le 2FA est déjà activé.'], 400);
        }

        $secret = $totp->generateSecret();
        $user->setTotpSecret($secret);
        $em->flush();

        $qrContent = $totp->getQRContent($user);

        return new JsonResponse([
            'secret'    => $secret,
            'qrContent' => $qrContent,
        ]);
    }

    #[Route('/api/me/2fa/confirm', name: 'api_2fa_confirm', methods: ['POST'])]
    public function confirm(
        Request $request,
        TotpAuthenticatorInterface $totp,
        EntityManagerInterface $em
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if ($user->isTotpEnabled()) {
            return new JsonResponse(['message' => 'Le 2FA est déjà activé.'], 400);
        }

        if ($user->getTotpSecret() === null) {
            return new JsonResponse(['message' => 'Lancez d\'abord la configuration 2FA.'], 400);
        }

        $code = trim(json_decode($request->getContent(), true)['code'] ?? '');

        if (!$code || !$totp->checkCode($user, $code)) {
            return new JsonResponse(['message' => 'Code invalide. Vérifiez votre application d\'authentification.'], 400);
        }

        $user->setTotpEnabled(true);
        $em->flush();

        return new JsonResponse(['message' => 'Authentification à deux facteurs activée.']);
    }

    #[Route('/api/me/2fa/disable', name: 'api_2fa_disable', methods: ['POST'])]
    public function disable(
        Request $request,
        TotpAuthenticatorInterface $totp,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user->isTotpEnabled()) {
            return new JsonResponse(['message' => 'Le 2FA n\'est pas activé.'], 400);
        }

        $data     = json_decode($request->getContent(), true) ?? [];
        $password = $data['password'] ?? '';
        $code     = trim($data['code'] ?? '');

        if (!$hasher->isPasswordValid($user, $password)) {
            return new JsonResponse(['message' => 'Mot de passe incorrect.'], 400);
        }

        if (!$code || !$totp->checkCode($user, $code)) {
            return new JsonResponse(['message' => 'Code invalide.'], 400);
        }

        $user->setTotpEnabled(false);
        $user->setTotpSecret(null);
        $em->flush();

        return new JsonResponse(['message' => 'Authentification à deux facteurs désactivée.']);
    }
}
