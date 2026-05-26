<?php

namespace App\Controller;

use App\Entity\Address;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/me/addresses')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class AddressController extends AbstractController
{
    #[Route('', name: 'address_list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $addresses = $em->getRepository(Address::class)->findBy(
            ['user' => $user],
            ['isDefault' => 'DESC', 'createdAt' => 'DESC']
        );
        return $this->json(array_map(fn(Address $a) => $this->serialize($a), $addresses));
    }

    #[Route('', name: 'address_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true) ?? [];

        $err = $this->validate($data);
        if ($err) return $this->json(['message' => $err], 400);

        $count = $em->getRepository(Address::class)->count(['user' => $user]);
        if ($count >= 10) {
            return $this->json(['message' => 'Maximum 10 adresses.'], 400);
        }

        $address = new Address();
        $address->setUser($user);
        $this->hydrate($address, $data);

        if ($address->isDefault() || $count === 0) {
            $address->setIsDefault(true);
            $this->unmarkOthers($user, null, $em);
        }

        $em->persist($address);
        $em->flush();

        return $this->json($this->serialize($address), 201);
    }

    #[Route('/{id}', name: 'address_update', methods: ['PATCH'])]
    public function update(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $address = $this->findOwned($id, $em);
        if (!$address) return $this->json(['message' => 'Not found'], 404);

        $data = json_decode($request->getContent(), true) ?? [];
        $err = $this->validate($data);
        if ($err) return $this->json(['message' => $err], 400);

        $this->hydrate($address, $data);

        if ($address->isDefault()) {
            $this->unmarkOthers($this->getUser(), $address->getId(), $em);
        }

        $em->flush();
        return $this->json($this->serialize($address));
    }

    #[Route('/{id}', name: 'address_delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $address = $this->findOwned($id, $em);
        if (!$address) return $this->json(['message' => 'Not found'], 404);

        $wasDefault = $address->isDefault();
        $user = $this->getUser();

        $em->remove($address);
        $em->flush();

        if ($wasDefault) {
            $remaining = $em->getRepository(Address::class)->findBy(
                ['user' => $user],
                ['createdAt' => 'DESC'],
                1
            );
            if ($remaining) {
                $remaining[0]->setIsDefault(true);
                $em->flush();
            }
        }

        return $this->json(['success' => true]);
    }

    #[Route('/{id}/default', name: 'address_set_default', methods: ['POST'])]
    public function setDefault(int $id, EntityManagerInterface $em): JsonResponse
    {
        $address = $this->findOwned($id, $em);
        if (!$address) return $this->json(['message' => 'Not found'], 404);

        $this->unmarkOthers($this->getUser(), $address->getId(), $em);
        $address->setIsDefault(true);
        $em->flush();

        return $this->json($this->serialize($address));
    }

    private function findOwned(int $id, EntityManagerInterface $em): ?Address
    {
        $address = $em->getRepository(Address::class)->find($id);
        if (!$address || $address->getUser() !== $this->getUser()) return null;
        return $address;
    }

    private function unmarkOthers(object $user, ?int $exceptId, EntityManagerInterface $em): void
    {
        $others = $em->getRepository(Address::class)->findBy(['user' => $user]);
        foreach ($others as $a) {
            if ($a->getId() !== $exceptId) {
                $a->setIsDefault(false);
            }
        }
    }

    private function validate(array $data): ?string
    {
        foreach (['firstName', 'lastName', 'line1', 'city', 'postalCode', 'country'] as $field) {
            if (empty(trim((string) ($data[$field] ?? '')))) {
                return "Le champ $field est requis.";
            }
        }
        if (strlen($data['country']) !== 2) {
            return 'Le pays doit être un code ISO 2 lettres.';
        }
        return null;
    }

    private function hydrate(Address $a, array $data): void
    {
        if (isset($data['firstName']))  $a->setFirstName(trim($data['firstName']));
        if (isset($data['lastName']))   $a->setLastName(trim($data['lastName']));
        if (array_key_exists('company', $data)) $a->setCompany($data['company'] ? trim($data['company']) : null);
        if (isset($data['line1']))      $a->setLine1(trim($data['line1']));
        if (array_key_exists('line2', $data)) $a->setLine2($data['line2'] ? trim($data['line2']) : null);
        if (isset($data['city']))       $a->setCity(trim($data['city']));
        if (array_key_exists('region', $data)) $a->setRegion($data['region'] ? trim($data['region']) : null);
        if (isset($data['postalCode'])) $a->setPostalCode(trim($data['postalCode']));
        if (isset($data['country']))    $a->setCountry(strtoupper(trim($data['country'])));
        if (array_key_exists('phone', $data)) $a->setPhone($data['phone'] ? trim($data['phone']) : null);
        if (isset($data['isDefault']))  $a->setIsDefault((bool) $data['isDefault']);
    }

    private function serialize(Address $a): array
    {
        return [
            'id'         => $a->getId(),
            'firstName'  => $a->getFirstName(),
            'lastName'   => $a->getLastName(),
            'company'    => $a->getCompany(),
            'line1'      => $a->getLine1(),
            'line2'      => $a->getLine2(),
            'city'       => $a->getCity(),
            'region'     => $a->getRegion(),
            'postalCode' => $a->getPostalCode(),
            'country'    => $a->getCountry(),
            'phone'      => $a->getPhone(),
            'isDefault'  => $a->isDefault(),
        ];
    }
}
