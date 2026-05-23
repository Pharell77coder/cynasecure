<?php

namespace App\Entity;

use App\Repository\ContactMessageRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ContactMessageRepository::class)]
class ContactMessage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $email = '';

    #[ORM\Column(length: 100)]
    private string $subject = '';

    #[ORM\Column(type: 'text')]
    private string $message = '';

    #[ORM\Column(length: 20)]
    private string $status = 'new'; // new | read | answered

    #[ORM\Column(length: 45, nullable: true)]
    private ?string $ipAddress = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $adminReply = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $repliedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $replyReadAt = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): static { $this->email = $email; return $this; }

    public function getSubject(): string { return $this->subject; }
    public function setSubject(string $subject): static { $this->subject = $subject; return $this; }

    public function getMessage(): string { return $this->message; }
    public function setMessage(string $message): static { $this->message = $message; return $this; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): static { $this->status = $status; return $this; }

    public function getIpAddress(): ?string { return $this->ipAddress; }
    public function setIpAddress(?string $ip): static { $this->ipAddress = $ip; return $this; }

    public function getAdminReply(): ?string { return $this->adminReply; }
    public function setAdminReply(?string $reply): static { $this->adminReply = $reply; return $this; }

    public function getRepliedAt(): ?\DateTimeImmutable { return $this->repliedAt; }
    public function setRepliedAt(?\DateTimeImmutable $at): static { $this->repliedAt = $at; return $this; }

    public function getReplyReadAt(): ?\DateTimeImmutable { return $this->replyReadAt; }
    public function setReplyReadAt(?\DateTimeImmutable $at): static { $this->replyReadAt = $at; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
}
