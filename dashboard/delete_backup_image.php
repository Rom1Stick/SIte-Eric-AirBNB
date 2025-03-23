<?php
// Désactiver l'affichage des erreurs PHP
error_reporting(0);
ini_set('display_errors', 0);

// Assurer que la réponse est en JSON
header('Content-Type: application/json');

// Fonction pour écrire dans le fichier de log
function writeLog($message) {
    $logFile = 'debug_delete.log';
    $date = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$date] $message\n", FILE_APPEND);
}

// Fonction pour envoyer une réponse JSON
function sendJsonResponse($success, $message = '') {
    echo json_encode([
        'success' => $success,
        'message' => $message
    ]);
    exit;
}

writeLog("Début du processus de suppression d'image");

// Vérifier si la méthode est POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    writeLog("Méthode non autorisée");
    sendJsonResponse(false, 'Méthode non autorisée');
}

// Récupérer le chemin de l'image à supprimer
$imagePath = isset($_POST['image_path']) ? $_POST['image_path'] : '';
writeLog("Chemin de l'image à supprimer: " . $imagePath);

// Vérifier que le chemin est bien dans le dossier backup
if (!preg_match('/^assets\/images\/backup\//', $imagePath)) {
    writeLog("Tentative de suppression d'une image hors du dossier backup: " . $imagePath);
    sendJsonResponse(false, 'Seules les images du dossier backup peuvent être supprimées');
}

// Construire le chemin complet
$fullPath = "../" . $imagePath;
writeLog("Chemin complet: " . $fullPath);

// Vérifier que le fichier existe
if (!file_exists($fullPath)) {
    writeLog("Le fichier n'existe pas: " . $fullPath);
    sendJsonResponse(false, "Le fichier n'existe pas");
}

// Supprimer le fichier
if (unlink($fullPath)) {
    writeLog("Fichier supprimé avec succès: " . $fullPath);
    sendJsonResponse(true, 'Image supprimée avec succès');
} else {
    writeLog("Échec de la suppression du fichier: " . $fullPath);
    sendJsonResponse(false, 'Échec de la suppression du fichier');
} 