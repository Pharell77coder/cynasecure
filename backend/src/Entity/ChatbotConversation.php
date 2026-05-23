<?php

namespace App\Entity;

use App\Repository\ChatbotConversationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ChatbotConversationRepository::class)]
class ChatbotConversation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 36, unique: true)]
    private string $sessionId = '';

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $email = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    /** @var Collection<int, ChatbotMessage> */
    #[ORM\OneToMany(targetEntity: ChatbotMessage::class, mappedBy: 'conversation', cascade: ['persist', 'remove'])]
    private Collection $messages;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->messages  = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getSessionId(): string { return $this->sessionId; }
    public function setSessionId(string $sessionId): static { $this->sessionId = $sessionId; return $this; }

    public function getEmail(): ?string { return $this->email; }
    public function setEmail(?string $email): static { $this->email = $email; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    /** @return Collection<int, ChatbotMessage> */
    public function getMessages(): Collection { return $this->messages; }
}
