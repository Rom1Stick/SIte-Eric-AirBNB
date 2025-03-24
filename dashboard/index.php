<?php
// Démarrer la session
session_start();

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    // L'utilisateur n'est pas authentifié, rediriger vers la page de connexion
    header('Location: auth/login.php');
    exit;
}

// Vérifier si les dossiers nécessaires existent
$imagesFolder = '../images';
if (!file_exists($imagesFolder) && !is_dir($imagesFolder)) {
    mkdir($imagesFolder, 0755, true);
}

// Vérifier si le fichier index.html est accessible en écriture
$indexFile = '../index.html';
if (file_exists($indexFile) && !is_writable($indexFile)) {
    $error = "Attention : Le fichier index.html n'est pas accessible en écriture. Vérifiez les permissions.";
}

// Inclure le contenu du dashboard
include 'index.html';
?> 