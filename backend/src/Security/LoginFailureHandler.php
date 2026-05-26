<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\HttpFoundation\Request;

class LoginFailureHandler implements AuthenticationFailureHandlerInterface
{
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): JsonResponse
    {
        if ($exception instanceof CustomUserMessageAuthenticationException) {
            $decoded = json_decode($exception->getMessageKey(), true);
            if (is_array($decoded) && isset($decoded['emailUnverified'])) {
                return new JsonResponse($decoded, 403);
            }
        }

        $message = match (true) {
            $exception instanceof UserNotFoundException   => 'Aucun compte trouvé avec cette adresse email.',
            $exception instanceof BadCredentialsException => 'Mot de passe incorrect.',
            default                                       => 'Identifiants invalides.',
        };

        return new JsonResponse(['message' => $message], 401);
    }
}
