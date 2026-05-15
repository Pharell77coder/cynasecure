<?php

namespace App\Entity;

use App\Repository\ServiceRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ServiceRepository::class)]
class Service
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // 🔥 name = titre du service
    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $longDescription = null;

    #[ORM\Column]
    private ?float $priceMonthly = null;

    #[ORM\Column(nullable: true)]
    private ?float $priceYearly = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripePriceMonthly = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripePriceYearly = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $image = null;

    #[ORM\ManyToOne(inversedBy: 'services')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Category $category = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $features = [];

    #[ORM\Column(length: 20)]
    private ?string $type = 'saas';

    // 🔥 Getter virtuel pour categorySlug
    public function getCategorySlug(): ?string
    {
        return $this->category ? $this->category->getSlug() : null;
    }

    // 🔥 Getter virtuel pour title (attendu par ton front)
    public function getTitle(): ?string
    {
        return $this->name;
    }

    // --- GETTERS / SETTERS ---

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getLongDescription(): ?string
    {
        return $this->longDescription;
    }

    public function setLongDescription(?string $longDescription): static
    {
        $this->longDescription = $longDescription;
        return $this;
    }

    public function getPriceMonthly(): ?float
    {
        return $this->priceMonthly;
    }

    public function setPriceMonthly(float $priceMonthly): static
    {
        $this->priceMonthly = $priceMonthly;
        return $this;
    }

    public function getPriceYearly(): ?float
    {
        return $this->priceYearly;
    }

    public function setPriceYearly(?float $priceYearly): static
    {
        $this->priceYearly = $priceYearly;
        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): static
    {
        $this->image = $image;
        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): static
    {
        $this->category = $category;
        return $this;
    }

    public function getFeatures(): ?array
    {
        return $this->features;
    }

    public function setFeatures(?array $features): static
    {
        $this->features = $features;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;
        return $this;
    }
}
