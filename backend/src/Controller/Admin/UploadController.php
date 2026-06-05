<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use OpenApi\Attributes as OA;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
#[OA\Tag(name: 'Admin')]
#[OA\SecurityRequirement(['cookieAuth' => []])]
class UploadController extends AbstractController
{
    #[OA\Response(response: 200, description: 'Fichier image uploadé, chemin retourné')]
    #[Route('/upload', name: 'admin_upload', methods: ['POST'])]
    public function upload(Request $request): JsonResponse
    {
        $file = $request->files->get('file');

        if (!$file) {
            return new JsonResponse(['message' => 'Aucun fichier fourni'], 400);
        }

        $ext = strtolower($file->getClientOriginalExtension());

        $imageExts = ['jpg', 'jpeg', 'png', 'webp'];
        $videoExts = ['mp4', 'webm', 'ogv', 'ogg'];
        $allowedExts = array_merge($imageExts, $videoExts);

        if (!in_array($ext, $allowedExts, true)) {
            return new JsonResponse(['message' => 'Extension non autorisée (jpg, jpeg, png, webp, mp4, webm, ogv)'], 400);
        }

        if ($file->getSize() > 50 * 1024 * 1024) {
            return new JsonResponse(['message' => 'Fichier trop volumineux (max 50 Mo)'], 400);
        }

        $isVideo = in_array($ext, $videoExts, true);
        $subDir  = $isVideo ? 'videos' : 'images';
        $prefix  = $isVideo ? 'vid_' : 'img_';

        $dir = $this->getParameter('kernel.project_dir') . '/public/uploads/home/' . $subDir;
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $filename = uniqid($prefix, true) . '.' . $ext;
        $file->move($dir, $filename);

        return new JsonResponse(['path' => 'uploads/home/' . $subDir . '/' . $filename]);
    }
}
