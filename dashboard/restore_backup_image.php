<?php
// Désactiver l'affichage des erreurs PHP
error_reporting(0);
ini_set('display_errors', 0);

// Assurer que la réponse est en JSON
header('Content-Type: application/json');

// Fonction pour écrire dans le fichier de log
function writeLog($message) {
    $logFile = 'debug_restore.log';
    $date = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$date] $message\n", FILE_APPEND);
}

// Fonction pour envoyer une réponse JSON
function sendJsonResponse($success, $data = [], $error = null) {
    echo json_encode([
        'success' => $success,
        'error' => $error,
        'image_path' => $data['image_path'] ?? null,
        'replaced' => $data['replaced'] ?? false
    ]);
    exit;
}

writeLog("Début du processus de restauration d'image");

// Vérifier si la méthode est POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    writeLog("Méthode non autorisée");
    sendJsonResponse(false, [], 'Méthode non autorisée');
}

// Récupérer les données
$backupImagePath = isset($_POST['backup_image_path']) ? $_POST['backup_image_path'] : '';
$targetImagePath = isset($_POST['target_image_path']) ? $_POST['target_image_path'] : '';
$shouldBackup = isset($_POST['backup']) ? $_POST['backup'] === 'true' : true; // Par défaut, on sauvegarde

writeLog("Chemin de l'image de backup: " . $backupImagePath);
writeLog("Chemin cible: " . $targetImagePath);
writeLog("Sauvegarde activée: " . ($shouldBackup ? "Oui" : "Non"));

// Nettoyer les chemins
if (preg_match('/url\([\'"]?(.*?)[\'"]?\)/', $targetImagePath, $matches)) {
    $targetImagePath = $matches[1];
    writeLog("Chemin cible nettoyé (url): " . $targetImagePath);
}

if (preg_match('/^https?:\/\/[^\/]+\/(.*)$/', $targetImagePath, $matches)) {
    $targetImagePath = $matches[1];
    writeLog("Chemin cible nettoyé (http): " . $targetImagePath);
}

// Construire les chemins complets
$fullBackupPath = "../" . $backupImagePath;
$fullTargetPath = "../" . $targetImagePath;

writeLog("Chemin complet de backup: " . $fullBackupPath);
writeLog("Chemin complet cible: " . $fullTargetPath);

// Vérifier que les fichiers existent
if (!file_exists($fullBackupPath)) {
    writeLog("L'image de backup n'existe pas: " . $fullBackupPath);
    sendJsonResponse(false, [], "L'image de backup n'existe pas");
}

// Créer le dossier cible si nécessaire
$targetDir = dirname($fullTargetPath);
if (!file_exists($targetDir)) {
    writeLog("Création du répertoire cible: " . $targetDir);
    if (!mkdir($targetDir, 0777, true)) {
        writeLog("Impossible de créer le répertoire cible");
        sendJsonResponse(false, [], "Impossible de créer le répertoire cible");
    }
}

// Si l'image cible existe déjà, la sauvegarder dans le dossier backup si demandé
$replaced = false;
if (file_exists($fullTargetPath)) {
    writeLog("L'image cible existe déjà");
    
    if ($shouldBackup) {
        writeLog("Sauvegarde activée, création d'une copie");
        
        // Créer le dossier de backup si nécessaire
        $backupDir = '../assets/images/backup/';
        if (!file_exists($backupDir)) {
            if (!mkdir($backupDir, 0777, true)) {
                writeLog("Impossible de créer le dossier de backup");
                sendJsonResponse(false, [], "Impossible de créer le dossier de backup");
            }
        }
        
        // Créer un nom unique pour la sauvegarde
        $timestamp = date('Ymd_His');
        $targetFileName = basename($fullTargetPath);
        $backupFileName = pathinfo($targetFileName, PATHINFO_FILENAME) . '_' . $timestamp . '.' . pathinfo($targetFileName, PATHINFO_EXTENSION);
        $backupPath = $backupDir . $backupFileName;
        
        // Copier l'image actuelle vers le backup
        writeLog("Sauvegarde de l'image actuelle: " . $fullTargetPath . " vers " . $backupPath);
        if (!copy($fullTargetPath, $backupPath)) {
            writeLog("Échec de la sauvegarde de l'image actuelle");
            sendJsonResponse(false, [], "Échec de la sauvegarde de l'image actuelle");
        }
        writeLog("Image actuelle sauvegardée avec succès");
    } else {
        writeLog("Sauvegarde désactivée, l'image actuelle ne sera pas sauvegardée");
    }
    
    // Supprimer l'image cible actuelle
    if (!unlink($fullTargetPath)) {
        writeLog("Impossible de supprimer l'image cible actuelle");
        sendJsonResponse(false, [], "Impossible de supprimer l'image cible actuelle");
    }
    
    $replaced = true;
}

// Copier l'image de backup vers la cible
writeLog("Copie de l'image de backup vers la cible");
if (!copy($fullBackupPath, $fullTargetPath)) {
    writeLog("Échec de la copie de l'image de backup");
    sendJsonResponse(false, [], "Échec de la copie de l'image de backup");
}

// Succès !
writeLog("Restauration réussie vers " . $targetImagePath);
sendJsonResponse(true, [
    'image_path' => $targetImagePath,
    'replaced' => $replaced
]); 