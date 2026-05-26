<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class UploadController extends AbstractController
{
    #[Route('/upload', name: 'admin_upload', methods: ['POST'])]
    public function upload(Request $request): JsonResponse
    {
        $file = $request->files->get('file');

        if (!$file) {
            return new JsonResponse(['message' => 'Aucun fichier fourni'], 400);
        }

        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
            return new JsonResponse(['message' => 'Extension non autorisée (jpg, jpeg, png, webp)'], 400);
        }

        if ($file->getSize() > 2 * 1024 * 1024) {
            return new JsonResponse(['message' => 'Fichier trop volumineux (max 2 Mo)'], 400);
        }

        $dir = $this->getParameter('kernel.project_dir') . '/public/uploads/home';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $filename = uniqid('img_', true) . '.' . $ext;
        $file->move($dir, $filename);

        return new JsonResponse(['path' => 'uploads/home/' . $filename]);
    }
}
