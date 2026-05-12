<?php
namespace App\Controller;

use App\Entity\CartItem;
use App\Repository\CartItemRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/cart')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class CartController extends AbstractController
{
    #[Route('', methods: ['GET'])]
    public function getCart(CartItemRepository $repo): JsonResponse
    {
        $items = $repo->findBy(['user' => $this->getUser()]);
        return $this->json(array_map(fn($item) => [
            'id' => $item->getId(),
            'productId' => $item->getProductId(),
            'productName' => $item->getProductName(),
            'productPrice' => $item->getProductPrice(),
            'quantity' => $item->getQuantity(),
        ], $items));
    }

    #[Route('/add', methods: ['POST'])]
    public function addToCart(Request $request, EntityManagerInterface $em, CartItemRepository $repo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Vérifie si le produit est déjà dans le panier
        $existing = $repo->findOneBy([
            'user' => $this->getUser(),
            'productId' => $data['productId']
        ]);

        if ($existing) {
            $existing->setQuantity($existing->getQuantity() + ($data['quantity'] ?? 1));
        } else {
            $item = new CartItem();
            $item->setUser($this->getUser());
            $item->setProductId($data['productId']);
            $item->setProductName($data['productName']);
            $item->setProductPrice($data['productPrice']);
            $item->setQuantity($data['quantity'] ?? 1);
            $em->persist($item);
        }

        $em->flush();
        return $this->json(['message' => 'Produit ajouté au panier'], 201);
    }

    #[Route('/{id}', methods: ['PATCH'])]
    public function updateQuantity(CartItem $item, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $item->setQuantity($data['quantity']);
        $em->flush();
        return $this->json(['message' => 'Quantité mise à jour']);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function removeItem(CartItem $item, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($item);
        $em->flush();
        return $this->json(['message' => 'Article supprimé']);
    }
}