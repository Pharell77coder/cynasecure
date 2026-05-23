<?php

namespace App\Controller\Admin;

use App\Entity\ContactMessage;
use App\Entity\ChatbotConversation;
use App\Repository\ContactMessageRepository;
use App\Repository\ChatbotConversationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
class AdminContactController extends AbstractController
{
    #[Route('/api/admin/contact-messages', name: 'admin_contact_list', methods: ['GET'])]
    public function listMessages(Request $request, ContactMessageRepository $repo): JsonResponse
    {
        $page  = max(1, (int) $request->query->get('page', 1));
        $limit = 20;

        $items = $repo->findPaginated($page, $limit);
        $total = $repo->count([]);

        $data = array_map(fn(ContactMessage $m) => $this->serializeMessage($m), $items);

        return new JsonResponse(['items' => $data, 'total' => $total, 'page' => $page]);
    }

    #[Route('/api/admin/contact-messages/{id}', name: 'admin_contact_update', methods: ['PATCH'])]
    public function updateMessage(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $msg = $em->getRepository(ContactMessage::class)->find($id);

        if (!$msg) {
            return new JsonResponse(['message' => 'Message introuvable.'], 404);
        }

        $data   = json_decode($request->getContent(), true) ?? [];
        $status = $data['status'] ?? '';

        if (!in_array($status, ['new', 'read', 'answered'], true)) {
            return new JsonResponse(['message' => 'Statut invalide.'], 400);
        }

        $msg->setStatus($status);
        $em->flush();

        return new JsonResponse(['id' => $msg->getId(), 'status' => $msg->getStatus()]);
    }

    #[Route('/api/admin/contact-messages/{id}/reply', name: 'admin_contact_reply', methods: ['POST'])]
    public function replyMessage(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $msg = $em->getRepository(ContactMessage::class)->find($id);

        if (!$msg) {
            return new JsonResponse(['message' => 'Message introuvable.'], 404);
        }

        $data  = json_decode($request->getContent(), true) ?? [];
        $reply = trim($data['reply'] ?? '');

        if (!$reply) {
            return new JsonResponse(['message' => 'La réponse ne peut pas être vide.'], 400);
        }

        if (mb_strlen($reply) > 5000) {
            return new JsonResponse(['message' => 'La réponse ne peut pas dépasser 5000 caractères.'], 400);
        }

        $msg->setAdminReply($reply);
        $msg->setRepliedAt(new \DateTimeImmutable());
        $msg->setReplyReadAt(null);
        $msg->setStatus('answered');
        $em->flush();

        return new JsonResponse($this->serializeMessage($msg));
    }

    private function serializeMessage(ContactMessage $m): array
    {
        return [
            'id'          => $m->getId(),
            'email'       => $m->getEmail(),
            'subject'     => $m->getSubject(),
            'message'     => $m->getMessage(),
            'status'      => $m->getStatus(),
            'ipAddress'   => $m->getIpAddress(),
            'adminReply'  => $m->getAdminReply(),
            'repliedAt'   => $m->getRepliedAt()?->format('c'),
            'replyReadAt' => $m->getReplyReadAt()?->format('c'),
            'createdAt'   => $m->getCreatedAt()->format('c'),
        ];
    }

    #[Route('/api/admin/chatbot-conversations', name: 'admin_chatbot_list', methods: ['GET'])]
    public function listConversations(ChatbotConversationRepository $repo): JsonResponse
    {
        $convs = $repo->findBy([], ['createdAt' => 'DESC'], 50);

        $data = array_map(fn(ChatbotConversation $c) => [
            'id'        => $c->getId(),
            'sessionId' => $c->getSessionId(),
            'email'     => $c->getEmail(),
            'messages'  => $c->getMessages()->count(),
            'createdAt' => $c->getCreatedAt()->format('c'),
        ], $convs);

        return new JsonResponse($data);
    }

    #[Route('/api/admin/chatbot-conversations/{id}', name: 'admin_chatbot_show', methods: ['GET'])]
    public function showConversation(int $id, EntityManagerInterface $em): JsonResponse
    {
        $conv = $em->getRepository(ChatbotConversation::class)->find($id);

        if (!$conv) {
            return new JsonResponse(['message' => 'Conversation introuvable.'], 404);
        }

        $messages = array_map(fn($m) => [
            'sender'    => $m->getSender(),
            'content'   => $m->getContent(),
            'createdAt' => $m->getCreatedAt()->format('c'),
        ], $conv->getMessages()->toArray());

        return new JsonResponse([
            'id'        => $conv->getId(),
            'sessionId' => $conv->getSessionId(),
            'email'     => $conv->getEmail(),
            'createdAt' => $conv->getCreatedAt()->format('c'),
            'messages'  => $messages,
        ]);
    }
}
