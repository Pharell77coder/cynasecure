<?php

namespace App\Controller;

use App\Entity\ContactMessage;
use App\Entity\User;
use App\Repository\ContactMessageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class UserContactController extends AbstractController
{
    #[Route('/api/my-messages', name: 'user_my_messages', methods: ['GET'])]
    public function list(ContactMessageRepository $repo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['message' => 'Non authentifié.'], 401);
        }

        $messages = $repo->findBy(
            ['email' => $user->getEmail()],
            ['createdAt' => 'DESC']
        );

        $data = array_map(fn(ContactMessage $m) => [
            'id'          => $m->getId(),
            'subject'     => $m->getSubject(),
            'message'     => $m->getMessage(),
            'status'      => $m->getStatus(),
            'adminReply'  => $m->getAdminReply(),
            'repliedAt'   => $m->getRepliedAt()?->format('c'),
            'replyReadAt' => $m->getReplyReadAt()?->format('c'),
            'createdAt'   => $m->getCreatedAt()->format('c'),
        ], $messages);

        return new JsonResponse($data);
    }

    #[Route('/api/my-messages/unread-count', name: 'user_unread_count', methods: ['GET'])]
    public function unreadCount(ContactMessageRepository $repo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['count' => 0]);
        }

        $count = $repo->countUnreadRepliesByEmail($user->getEmail());

        return new JsonResponse(['count' => $count]);
    }

    #[Route('/api/my-messages/mark-read', name: 'user_mark_read', methods: ['POST'])]
    public function markRead(ContactMessageRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['message' => 'Non authentifié.'], 401);
        }

        $messages = $repo->findBy(['email' => $user->getEmail()]);
        $now      = new \DateTimeImmutable();

        foreach ($messages as $m) {
            if ($m->getAdminReply() !== null && $m->getReplyReadAt() === null) {
                $m->setReplyReadAt($now);
            }
        }

        $em->flush();

        return new JsonResponse(['ok' => true]);
    }
}
