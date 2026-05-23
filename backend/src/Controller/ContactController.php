<?php

namespace App\Controller;

use App\Entity\ChatbotConversation;
use App\Entity\ChatbotMessage;
use App\Entity\ContactMessage;
use App\Repository\ChatbotConversationRepository;
use App\Repository\ContactMessageRepository;
use App\Service\ChatbotService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class ContactController extends AbstractController
{
    #[Route('/api/contact', name: 'contact_send', methods: ['POST'])]
    public function send(
        Request $request,
        EntityManagerInterface $em,
        ContactMessageRepository $repo
    ): JsonResponse {
        $ip   = $request->getClientIp() ?? '0.0.0.0';
        $since = new \DateTimeImmutable('-1 hour');

        if ($repo->countByIpSince($ip, $since) >= 5) {
            return new JsonResponse(['message' => 'Trop de demandes. Réessayez dans une heure.'], 429);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        $email   = trim($data['email'] ?? '');
        $subject = trim($data['subject'] ?? '');
        $body    = trim($data['message'] ?? '');

        if (!$email || !$subject || !$body) {
            return new JsonResponse(['message' => 'Tous les champs sont obligatoires.'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['message' => 'Adresse email invalide.'], 400);
        }

        $allowed = ['Problème technique', 'Question abonnement', 'Assistance générale', 'Autre'];
        if (!in_array($subject, $allowed, true)) {
            return new JsonResponse(['message' => 'Sujet invalide.'], 400);
        }

        if (mb_strlen($body) < 10) {
            return new JsonResponse(['message' => 'Le message doit contenir au moins 10 caractères.'], 400);
        }

        if (mb_strlen($body) > 5000) {
            return new JsonResponse(['message' => 'Le message ne peut pas dépasser 5000 caractères.'], 400);
        }

        $msg = new ContactMessage();
        $msg->setEmail($email);
        $msg->setSubject($subject);
        $msg->setMessage($body);
        $msg->setIpAddress($ip);

        $em->persist($msg);
        $em->flush();

        return new JsonResponse(['message' => 'Message envoyé avec succès.'], 201);
    }

    #[Route('/api/chatbot/message', name: 'chatbot_message', methods: ['POST'])]
    public function chatbot(
        Request $request,
        EntityManagerInterface $em,
        ChatbotConversationRepository $convRepo,
        ChatbotService $chatbot
    ): JsonResponse {
        $data      = json_decode($request->getContent(), true) ?? [];
        $sessionId = trim($data['sessionId'] ?? '');
        $input     = trim($data['message'] ?? '');
        $email     = trim($data['email'] ?? '') ?: null;

        if (!$sessionId || !$input) {
            return new JsonResponse(['message' => 'sessionId et message sont requis.'], 400);
        }

        if (mb_strlen($input) > 1000) {
            return new JsonResponse(['message' => 'Message trop long.'], 400);
        }

        $conv = $convRepo->findOneBy(['sessionId' => $sessionId]);

        if (!$conv) {
            $conv = new ChatbotConversation();
            $conv->setSessionId($sessionId);
            $em->persist($conv);
        }

        if ($email && !$conv->getEmail()) {
            $conv->setEmail($email);
        }

        $userMsg = new ChatbotMessage();
        $userMsg->setConversation($conv);
        $userMsg->setSender('user');
        $userMsg->setContent(htmlspecialchars($input, ENT_QUOTES, 'UTF-8'));
        $em->persist($userMsg);

        $reply   = $chatbot->respond($input);
        $matched = $reply !== '';

        if (!$matched) {
            $reply = "Je n'ai pas trouvé de réponse précise à votre question. Je vous invite à utiliser le formulaire ci-dessous pour joindre notre équipe — nous répondons sous 4h ouvrées.";
        }

        $botMsg = new ChatbotMessage();
        $botMsg->setConversation($conv);
        $botMsg->setSender('bot');
        $botMsg->setContent($reply);
        $em->persist($botMsg);

        $em->flush();

        return new JsonResponse(['reply' => $reply, 'matched' => $matched]);
    }
}
