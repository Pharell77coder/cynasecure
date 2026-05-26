<?php

namespace App\Entity;

use App\Repository\FraudCheckRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FraudCheckRepository::class)]
class FraudCheck
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Order $orderRef = null;

    #[ORM\Column]
    private int $score = 0;

    #[ORM\Column(length: 20)]
    private string $level = 'ok'; // ok | review | blocked

    #[ORM\Column(type: Types::JSON)]
    private array $rules = [];

    #[ORM\Column(length: 45, nullable: true)]
    private ?string $ipAddress = null;

    #[ORM\Column(length: 512, nullable: true)]
    private ?string $userAgent = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $checkedAt = null;

    public function getId(): ?int { return $this->id; }

    public function getOrderRef(): ?Order { return $this->orderRef; }
    public function setOrderRef(?Order $orderRef): static { $this->orderRef = $orderRef; return $this; }

    public function getScore(): int { return $this->score; }
    public function setScore(int $score): static { $this->score = $score; return $this; }

    public function getLevel(): string { return $this->level; }
    public function setLevel(string $level): static { $this->level = $level; return $this; }

    public function getRules(): array { return $this->rules; }
    public function setRules(array $rules): static { $this->rules = $rules; return $this; }

    public function getIpAddress(): ?string { return $this->ipAddress; }
    public function setIpAddress(?string $ipAddress): static { $this->ipAddress = $ipAddress; return $this; }

    public function getUserAgent(): ?string { return $this->userAgent; }
    public function setUserAgent(?string $userAgent): static { $this->userAgent = $userAgent; return $this; }

    public function getCheckedAt(): ?\DateTimeImmutable { return $this->checkedAt; }
    public function setCheckedAt(\DateTimeImmutable $checkedAt): static { $this->checkedAt = $checkedAt; return $this; }
}
