<?php

namespace App\Entity;

use App\Repository\PromoCodeRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PromoCodeRepository::class)]
class PromoCode
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    private ?string $code = null;

    #[ORM\Column(length: 10)]
    private ?string $type = null; // percent | fixed

    #[ORM\Column]
    private ?float $value = null;

    #[ORM\Column(nullable: true)]
    private ?int $maxUses = null;

    #[ORM\Column]
    private int $usedCount = 0;

    #[ORM\Column(nullable: true)]
    private ?float $minAmount = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $validFrom = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $validUntil = null;

    #[ORM\Column]
    private bool $isActive = true;

    #[ORM\Column(length: 20)]
    private string $appliesTo = 'all'; // all | saas | one_shot

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    public function getId(): ?int { return $this->id; }

    public function getCode(): ?string { return $this->code; }
    public function setCode(string $code): static { $this->code = strtoupper(trim($code)); return $this; }

    public function getType(): ?string { return $this->type; }
    public function setType(string $type): static { $this->type = $type; return $this; }

    public function getValue(): ?float { return $this->value; }
    public function setValue(float $value): static { $this->value = $value; return $this; }

    public function getMaxUses(): ?int { return $this->maxUses; }
    public function setMaxUses(?int $maxUses): static { $this->maxUses = $maxUses; return $this; }

    public function getUsedCount(): int { return $this->usedCount; }
    public function setUsedCount(int $usedCount): static { $this->usedCount = $usedCount; return $this; }
    public function incrementUsedCount(): static { $this->usedCount++; return $this; }

    public function getMinAmount(): ?float { return $this->minAmount; }
    public function setMinAmount(?float $minAmount): static { $this->minAmount = $minAmount; return $this; }

    public function getValidFrom(): ?\DateTimeImmutable { return $this->validFrom; }
    public function setValidFrom(?\DateTimeImmutable $validFrom): static { $this->validFrom = $validFrom; return $this; }

    public function getValidUntil(): ?\DateTimeImmutable { return $this->validUntil; }
    public function setValidUntil(?\DateTimeImmutable $validUntil): static { $this->validUntil = $validUntil; return $this; }

    public function isActive(): bool { return $this->isActive; }
    public function setIsActive(bool $isActive): static { $this->isActive = $isActive; return $this; }

    public function getAppliesTo(): string { return $this->appliesTo; }
    public function setAppliesTo(string $appliesTo): static { $this->appliesTo = $appliesTo; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }

    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static { $this->updatedAt = $updatedAt; return $this; }

    public function isValid(float $cartTotal, \DateTimeImmutable $now): bool
    {
        if (!$this->isActive) return false;
        if ($this->validFrom && $now < $this->validFrom) return false;
        if ($this->validUntil && $now > $this->validUntil) return false;
        if ($this->maxUses !== null && $this->usedCount >= $this->maxUses) return false;
        if ($this->minAmount !== null && $cartTotal < $this->minAmount) return false;
        return true;
    }

    public function computeDiscount(float $cartTotal): float
    {
        if ($this->type === 'percent') {
            return round($cartTotal * $this->value / 100, 2);
        }
        return min($this->value, $cartTotal);
    }
}
