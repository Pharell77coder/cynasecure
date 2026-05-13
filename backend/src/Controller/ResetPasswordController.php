<?php
namespace App\Controller;

use App\Entity\ResetPasswordToken;
use App\Repository\ResetPasswordTokenRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class ResetPasswordController extends AbstractController
{
    #[Route('/api/forgot-password', methods: ['POST'])]
    public function forgotPassword(
        Request $request,
        UserRepository $userRepo,
        EntityManagerInterface $em,
        MailerInterface $mailer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $user = $userRepo->findOneBy(['email' => $data['email']]);

        // On répond toujours OK pour ne pas révéler si l'email existe
        if (!$user) {
            return $this->json(['message' => 'Email envoyé si le compte existe.']);
        }

        $token = bin2hex(random_bytes(32));
        $reset = new ResetPasswordToken();
        $reset->setToken($token);
        $reset->setUser($user);
        $reset->setExpiresAt(new \DateTimeImmutable('+1 hour'));

        $em->persist($reset);
        $em->flush();

        $email = (new Email())
            ->from('noreply@cynasecure.com')
            ->to($user->getEmail())
            ->subject('Réinitialisation de votre mot de passe')
            ->html("<p>Cliquez sur ce lien pour réinitialiser votre mot de passe :</p>
                   <a href='http://localhost:3000/reset-password?token={$token}'>
                   Réinitialiser mon mot de passe</a>
                   <p>Ce lien expire dans 1 heure.</p>");

        $mailer->send($email);

        return $this->json(['message' => 'Email envoyé si le compte existe.']);
    }

    #[Route('/api/reset-password', methods: ['POST'])]
    public function resetPassword(
        Request $request,
        ResetPasswordTokenRepository $tokenRepo,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $reset = $tokenRepo->findOneBy(['token' => $data['token']]);

        if (!$reset || $reset->getExpiresAt() < new \DateTime()) {
            return $this->json(['error' => 'Token invalide ou expiré.'], 400);
        }

        $user = $reset->getUser();
        $user->setPassword($hasher->hashPassword($user, $data['password']));

        $em->remove($reset);
        $em->flush();

        return $this->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}