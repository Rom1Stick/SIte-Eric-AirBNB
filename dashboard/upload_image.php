<?php
// Désactiver l'affichage des erreurs PHP
error_reporting(0);
ini_set('display_errors', 0);

// S'assurer que le header JSON est envoyé en premier
header('Content-Type: application/json');

// Fonction pour envoyer une réponse JSON et arrêter l'exécution
function sendJsonResponse($success, $data = [], $error = '') {
    $response = ['success' => $success];
    if ($success) {
        $response = array_merge($response, $data);
    } else {
        $response['error'] = $error;
    }
    echo json_encode($response);
    exit;
}

// Activer le logging pour le débogage
$debug = true;
$logFile = '../debug_upload.log';

function writeLog($message) {
    global $debug, $logFile;
    if ($debug) {
        file_put_contents($logFile, date('[Y-m-d H:i:s] ') . $message . "\n", FILE_APPEND);
    }
}

try {
    writeLog("Début du traitement d'upload");

    // Vérifier si un fichier a été envoyé
    if (!isset($_FILES['image'])) {
        writeLog("Erreur: Aucun fichier reçu");
        sendJsonResponse(false, [], 'Aucun fichier reçu');
    }

    $file = $_FILES['image'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    $maxSize = 10 * 1024 * 1024; // 10MB

    writeLog("Fichier reçu: " . $file['name'] . " (" . $file['type'] . ", " . $file['size'] . " bytes)");

    // Vérifier s'il y a eu une erreur lors de l'upload
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessage = match($file['error']) {
            UPLOAD_ERR_INI_SIZE => 'Le fichier dépasse la taille autorisée par PHP',
            UPLOAD_ERR_FORM_SIZE => 'Le fichier dépasse la taille autorisée par le formulaire',
            UPLOAD_ERR_PARTIAL => 'Le fichier n\'a été que partiellement uploadé',
            UPLOAD_ERR_NO_FILE => 'Aucun fichier n\'a été uploadé',
            UPLOAD_ERR_NO_TMP_DIR => 'Dossier temporaire manquant',
            UPLOAD_ERR_CANT_WRITE => 'Échec de l\'écriture du fichier sur le disque',
            UPLOAD_ERR_EXTENSION => 'Une extension PHP a arrêté l\'upload du fichier',
            default => 'Erreur inconnue lors de l\'upload'
        };
        writeLog("Erreur d'upload: " . $errorMessage);
        sendJsonResponse(false, [], $errorMessage);
    }

    // Fonction pour détecter le type MIME réel du fichier
    function getMimeType($filepath) {
        if (!function_exists('finfo_open')) {
            throw new Exception('L\'extension FileInfo n\'est pas installée');
        }
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filepath);
        finfo_close($finfo);
        return $mimeType;
    }

    // Vérifier le type de fichier de manière plus fiable
    $tempPath = $file['tmp_name'];
    if (!file_exists($tempPath)) {
        writeLog("Erreur: Fichier temporaire non trouvé");
        sendJsonResponse(false, [], 'Erreur lors du traitement du fichier');
    }

    $detectedMimeType = getMimeType($tempPath);
    writeLog("Type MIME détecté: " . $detectedMimeType);

    if (!in_array($detectedMimeType, $allowedTypes)) {
        writeLog("Erreur: Type de fichier non autorisé. Type détecté: " . $detectedMimeType);
        sendJsonResponse(false, [], 'Type de fichier non autorisé. Types acceptés : JPG, PNG, GIF');
    }

    // Vérifier la taille du fichier
    if ($file['size'] > $maxSize) {
        writeLog("Erreur: Fichier trop volumineux: " . $file['size'] . " bytes");
        sendJsonResponse(false, [], 'Fichier trop volumineux (max 10MB)');
    }

    // Récupérer le chemin original et l'option de sauvegarde
    $originalPath = isset($_POST['original_path']) ? $_POST['original_path'] : '';
    $shouldBackup = isset($_POST['backup']) ? $_POST['backup'] === 'true' : true; // Par défaut, on sauvegarde
    writeLog("Chemin original reçu: " . $originalPath);
    writeLog("Sauvegarde activée: " . ($shouldBackup ? "Oui" : "Non"));

    // Nettoyage du chemin original (supprimer url() si présent)
    if (preg_match('/url\([\'"]?(.*?)[\'"]?\)/', $originalPath, $matches)) {
        $originalPath = $matches[1];
        writeLog("Chemin extrait de url(): " . $originalPath);
    }

    // Nettoyer le chemin original des URLs complètes
    if (preg_match('/^https?:\/\/[^\/]+\/(.*)$/', $originalPath, $matches)) {
        $originalPath = $matches[1];
        writeLog("Chemin nettoyé de l'URL: " . $originalPath);
    }

    // Vérifier si le chemin existe
    $shouldReplace = false;
    $fullOriginalPath = "../{$originalPath}";
    writeLog("Vérification du chemin: " . $fullOriginalPath);

    if (!empty($originalPath) && file_exists($fullOriginalPath)) {
        $shouldReplace = true;
        writeLog("Le fichier existe, remplacement activé");
    } else {
        // Essayer avec d'autres chemins possibles
        $altPath = ltrim($originalPath, '/');
        $fullAltPath = "../{$altPath}";
        writeLog("Tentative avec chemin alternatif: " . $fullAltPath);
        
        if (file_exists($fullAltPath)) {
            $shouldReplace = true;
            $originalPath = $altPath;
            writeLog("Fichier trouvé avec le chemin alternatif");
        }
    }

    // Si l'image cible existe déjà, la sauvegarder dans le dossier backup si demandé
    if (file_exists($fullOriginalPath)) {
        writeLog("L'image cible existe déjà");
        
        if ($shouldBackup) {
            writeLog("Sauvegarde activée, création d'une copie");
            
            // Créer le dossier de backup si nécessaire
            $backupDir = '../assets/images/backup/';
            if (!file_exists($backupDir)) {
                if (!mkdir($backupDir, 0777, true)) {
                    writeLog("ERREUR: Impossible de créer le dossier de backup");
                    sendJsonResponse(false, [], 'Erreur lors de la création du dossier de backup');
                }
                writeLog("Création du dossier de backup: " . $backupDir);
            }
            
            // Créer un nom unique pour la sauvegarde
            $timestamp = date('Ymd_His');
            $targetFileName = basename($fullOriginalPath);
            $backupFileName = pathinfo($targetFileName, PATHINFO_FILENAME) . '_' . $timestamp . '.' . pathinfo($targetFileName, PATHINFO_EXTENSION);
            $backupPath = $backupDir . $backupFileName;
            
            // Copier l'image actuelle vers le backup
            writeLog("Sauvegarde de l'image actuelle: " . $fullOriginalPath . " vers " . $backupPath);
            if (!copy($fullOriginalPath, $backupPath)) {
                writeLog("ERREUR: Échec de la sauvegarde de l'image actuelle");
                sendJsonResponse(false, [], 'Erreur lors de la sauvegarde de l\'ancienne image');
            }
            writeLog("Ancienne image sauvegardée avec succès");
        } else {
            writeLog("Sauvegarde désactivée, l'ancienne image ne sera pas sauvegardée");
        }
        
        // Supprimer l'ancienne image
        if (!unlink($fullOriginalPath)) {
            writeLog("ERREUR: Impossible de supprimer l'ancienne image");
            sendJsonResponse(false, [], 'Erreur lors de la suppression de l\'ancienne image');
        }
        writeLog("Ancienne image supprimée");
        
        // Utiliser le même nom de fichier que l'original
        $uploadPath = $fullOriginalPath;
        writeLog("Nouvelle image utilisera le chemin: " . $uploadPath);
        $shouldReplace = true;
    } else {
        // Pour une nouvelle image, générer un nom unique
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '.' . $extension;
        $uploadPath = '../assets/images/' . $filename;
        writeLog("Nouvelle image utilisera le chemin: " . $uploadPath);
    }

    // Créer le dossier d'images s'il n'existe pas
    if (!file_exists('../assets/images')) {
        if (!mkdir('../assets/images', 0777, true)) {
            writeLog("ERREUR: Impossible de créer le dossier d'images");
            sendJsonResponse(false, [], 'Erreur lors de la création du dossier d\'images');
        }
        writeLog("Création du dossier d'images: ../assets/images");
    }

    // Déplacer le fichier
    writeLog("Tentative de déplacement du fichier téléchargé vers " . $uploadPath);
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        writeLog("ERREUR: Échec du déplacement du fichier");
        sendJsonResponse(false, [], 'Erreur lors de l\'enregistrement du fichier');
    }

    // Retourner le chemin relatif de l'image
    $responsePath = $shouldReplace ? $originalPath : 'assets/images/' . $filename;
    writeLog("Déplacement réussi. Chemin de retour: " . $responsePath);
    
    sendJsonResponse(true, [
        'image_path' => $responsePath,
        'replaced' => $shouldReplace
    ]);

} catch (Exception $e) {
    writeLog("ERREUR: " . $e->getMessage());
    sendJsonResponse(false, [], 'Erreur lors du traitement de l\'image: ' . $e->getMessage());
} 