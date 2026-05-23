<?php

namespace App\Entity;

use App\Repository\SubscriptionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SubscriptionRepository::class)]
class Subscription
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Relation interne avec ton User Symfony
    #[ORM\ManyToOne(inversedBy: 'subscriptions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Service $service = null;

    #[ORM\Column(length: 20)]
    private ?string $cycle = null; // monthly | yearly

    #[ORM\Column]
    private ?float $price = null; // price at subscription time

    #[ORM\Column(length: 20)]
    private ?string $status = null; // ACTIVE | CANCELLED | PAST_DUE

    #[ORM\Column]
    private ?\DateTimeImmutable $startDate = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $endDate = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $nextBillingAt = null;

    // 🔥 Obligatoire pour Stripe (renouvellements)
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripeSubscriptionId = null;

    // 🔥 Obligatoire pour Stripe (webhook)
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $userEmail = null;

    #[ORM\Column(nullable: true)]
    private ?int $invoicePaymentId = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getService(): ?Service
    {
        return $this->service;
    }

    public function setService(?Service $service): static
    {
        $this->service = $service;
        return $this;
    }

    public function getCycle(): ?string
    {
        return $this->cycle;
    }

    public function setCycle(string $cycle): static
    {
        $this->cycle = $cycle;
        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): static
    {
        $this->price = $price;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getStartDate(): ?\DateTimeImmutable
    {
        return $this->startDate;
    }

    public function setStartDate(\DateTimeImmutable $startDate): static
    {
        $this->startDate = $startDate;
        return $this;
    }

    public function getEndDate(): ?\DateTimeImmutable
    {
        return $this->endDate;
    }

    public function setEndDate(?\DateTimeImmutable $endDate): static
    {
        $this->endDate = $endDate;
        return $this;
    }

    public function getNextBillingAt(): ?\DateTimeImmutable
    {
        return $this->nextBillingAt;
    }

    public function setNextBillingAt(?\DateTimeImmutable $nextBillingAt): static
    {
        $this->nextBillingAt = $nextBillingAt;
        return $this;
    }

    public function getStripeSubscriptionId(): ?string
    {
        return $this->stripeSubscriptionId;
    }

    public function setStripeSubscriptionId(?string $stripeSubscriptionId): static
    {
        $this->stripeSubscriptionId = $stripeSubscriptionId;
        return $this;
    }

    public function getUserEmail(): ?string
    {
        return $this->userEmail;
    }

    public function setUserEmail(?string $userEmail): static
    {
        $this->userEmail = $userEmail;
        return $this;
    }

    public function getInvoicePaymentId(): ?int
    {
        return $this->invoicePaymentId;
    }

    public function setInvoicePaymentId(?int $invoicePaymentId): static
    {
        $this->invoicePaymentId = $invoicePaymentId;
        return $this;
    }
}
