<?php

namespace App\Controller\Admin;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/users')]
#[IsGranted('ROLE_ADMIN')]
class AdminUserController extends AbstractController
{
    private const SORT_FIELDS = ['displayName', 'email', 'id'];

    #[Route('', name: 'admin_users_list', methods: ['GET'])]
    public function list(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $page    = max(1, (int) $request->query->get('page', 1));
        $perPage = min(100, max(1, (int) $request->query->get('perPage', 20)));
        $sort    = in_array($request->query->get('sort'), self::SORT_FIELDS, true) ? $request->query->get('sort') : 'displayName';
        $order   = strtoupper($request->query->get('order', 'asc')) === 'DESC' ? 'DESC' : 'ASC';

        $repo = $em->getRepository(User::class);

        $total = (int) $repo->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $users = $repo->createQueryBuilder('u')
            ->orderBy("u.{$sort}", $order)
            ->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage)
            ->getQuery()
            ->getResult();

        $items = array_map(fn(User $u) => [
            'id'          => $u->getId(),
            'displayName' => $u->getDisplayName(),
            'email'       => $u->getEmail(),
            'role'        => in_array('ROLE_ADMIN', $u->getRoles()) ? 'admin' : 'user',
        ], $users);

        return new JsonResponse([
            'items'      => $items,
            'total'      => $total,
            'page'       => $page,
            'perPage'    => $perPage,
            'totalPages' => (int) ceil($total / $perPage),
        ]);
    }

    #[Route('/{id}', name: 'admin_users_delete', methods: ['DELETE'])]
    public function delete(User $user, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($user);
        $em->flush();

        return new JsonResponse(['message' => 'Utilisateur supprimé']);
    }
}
