<?php

namespace App\Entity;

use App\Repository\ChatbotMessageRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ChatbotMessageRepository::class)]
class ChatbotMessage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    private ?ChatbotConversation $conversation = null;

    #[ORM\Column(length: 10)]
    private string $sender = ''; // user | bot

    #[ORM\Column(type: 'text')]
    private string $content = '';

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getConversation(): ?ChatbotConversation { return $this->conversation; }
    public function setConversation(?ChatbotConversation $conv): static { $this->conversation = $conv; return $this; }

    public function getSender(): string { return $this->sender; }
    public function setSender(string $sender): static { $this->sender = $sender; return $this; }

    public function getContent(): string { return $this->content; }
    public function setContent(string $content): static { $this->content = $content; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}
