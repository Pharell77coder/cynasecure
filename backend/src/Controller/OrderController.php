<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Service;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/orders')]
class OrderController extends AbstractController
{
    // CREATE ORDER
    #[Route('', name: 'order_create', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        /** @var User $user */
        $user = $this->getUser();

        $order = new Order();
        $order->setUser($user);
        $order->setStatus('PENDING');
        $order->setCreatedAt(new \DateTimeImmutable());

        $total = 0;

        foreach ($data['items'] as $itemData) {
            $service = $em->getRepository(Service::class)->find($itemData['serviceId']);
            if (!$service) {
                return new JsonResponse(['message' => 'Service not found'], 404);
            }

            $item = new OrderItem();
            $item->setService($service);
            $item->setQuantity($itemData['quantity']);
            $item->setPrice($service->getPrice());
            $item->setOrderRef($order);

            $total += $service->getPrice() * $itemData['quantity'];

            $em->persist($item);
        }

        $order->setTotal($total);

        $em->persist($order);
        $em->flush();

        return new JsonResponse([
            'message' => 'Order created successfully',
            'orderId' => $order->getId(),
            'total' => $total
        ], 201);
    }

    // LIST ORDERS OF USER
    #[Route('/my', name: 'order_list_user', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function listUserOrders(EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $orders = $em->getRepository(Order::class)->findBy(['user' => $user]);

        $data = array_map(fn($o) => [
            'id' => $o->getId(),
            'total' => $o->getTotal(),
            'status' => $o->getStatus(),
            'createdAt' => $o->getCreatedAt()->format('Y-m-d H:i:s'),
        ], $orders);

        return new JsonResponse($data);
    }


    // GET ORDER BY ID
    #[Route('/{id}', name: 'order_show', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function show(Order $order): JsonResponse
    {
        // Security: user can only see his own orders
        if ($order->getUser() !== $this->getUser()) {
            return new JsonResponse(['message' => 'Access denied'], 403);
        }

        $items = [];
        foreach ($order->getOrderItems() as $item) {
            $items[] = [
                'service' => $item->getService()->getTitle(),
                'price' => $item->getPrice(),
                'quantity' => $item->getQuantity()
            ];
        }

        return new JsonResponse([
            'id' => $order->getId(),
            'total' => $order->getTotal(),
            'status' => $order->getStatus(),
            'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
            'items' => $items
        ]);
    }

    // UPDATE STATUS (ADMIN ONLY)
    #[Route('/{id}/status', name: 'order_update_status', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateStatus(Request $request, Order $order, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $newStatus = $data['status'] ?? null;

        if (!in_array($newStatus, ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED'])) {
            return new JsonResponse(['message' => 'Invalid status'], 400);
        }

        $order->setStatus($newStatus);
        $em->flush();

        return new JsonResponse(['message' => 'Order status updated']);
    }
}
