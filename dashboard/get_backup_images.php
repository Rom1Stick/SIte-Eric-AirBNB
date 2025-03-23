<?php
// Désactiver l'affichage des erreurs PHP
error_reporting(0);
ini_set('display_errors', 0);

// Assurer que la réponse est en JSON
header('Content-Type: application/json');

// Définir le chemin du dossier backup
$backupDir = '../assets/images/backup/';
$result = ['success' => false, 'images' => []];

// Vérifier si le dossier existe
if (!file_exists($backupDir)) {
    echo json_encode(['success' => false, 'error' => 'Le dossier de backup n\'existe pas']);
    exit;
}

// Récupérer la liste des images
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
$images = [];

try {
    $files = scandir($backupDir);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        
        if (in_array($extension, $allowedExtensions)) {
            // Extraire la date du nom du fichier (format: nom_YYYYMMDD_HHMMSS.ext)
            $originalName = $file;
            $timestamp = '';
            $isBackup = false;
            
            if (preg_match('/_(\d{8}_\d{6})\./', $file, $matches)) {
                $timestamp = $matches[1];
                $isBackup = true;
                $originalName = preg_replace('/_\d{8}_\d{6}/', '', $file);
            }
            
            $images[] = [
                'name' => $file,
                'path' => 'assets/images/backup/' . $file,
                'url' => '../assets/images/backup/' . $file,
                'original_name' => $originalName,
                'timestamp' => $timestamp,
                'is_backup' => $isBackup,
                'size' => filesize($backupDir . $file),
                'date' => date('Y-m-d H:i:s', filemtime($backupDir . $file))
            ];
        }
    }
    
    // Trier par date de modification (plus récent en premier)
    usort($images, function($a, $b) {
        return filemtime('../' . $b['path']) - filemtime('../' . $a['path']);
    });
    
    $result = ['success' => true, 'images' => $images];
} catch (Exception $e) {
    $result = ['success' => false, 'error' => $e->getMessage()];
}

echo json_encode($result); 