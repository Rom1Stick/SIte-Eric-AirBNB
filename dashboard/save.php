<?php
// En-têtes pour permettre les requêtes cross-origin depuis le domaine local
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Vérifier si la requête est une méthode POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Méthode non autorisée. Utilisez POST.']);
    exit;
}

// Récupérer le contenu JSON envoyé
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Vérifier si des données ont été reçues
if (empty($data) || !isset($data['html_content']) || !isset($data['file_path'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Données manquantes ou invalides.']);
    exit;
}

// Récupérer le contenu HTML et le chemin du fichier
$html_content = $data['html_content'];
$file_path = $data['file_path'];

// Sécurité: Valider le chemin du fichier pour éviter les attaques de traversée de répertoire
$base_dir = realpath('../');
$real_file_path = realpath($file_path);

// Vérifier que le chemin du fichier est bien dans le répertoire autorisé
if ($real_file_path === false || strpos($real_file_path, $base_dir) !== 0) {
    http_response_code(403); // Forbidden
    echo json_encode(['error' => 'Chemin de fichier non autorisé.']);
    exit;
}

// Traitement des images en base64
if (isset($data['images']) && is_array($data['images'])) {
    foreach ($data['images'] as $image) {
        if (!isset($image['data']) || !isset($image['filename'])) {
            continue;
        }
        
        // Extraire les données de l'image
        $image_data = $image['data'];
        $filename = $image['filename'];
        
        // Convertir les données base64 en binaire
        if (preg_match('/^data:image\/(\w+);base64,/', $image_data, $type)) {
            $image_data = substr($image_data, strpos($image_data, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif
            
            // Vérifier que c'est un type d'image valide
            if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif'])) {
                continue;
            }
            
            $image_data = base64_decode($image_data);
            
            if ($image_data === false) {
                continue;
            }
        } else {
            continue;
        }
        
        // Sécurité: Valider le nom du fichier et le chemin
        $filename = basename($filename); // Enlever les chemins potentiellement malveillants
        $image_path = '../images/' . $filename;
        
        // Sauvegarder l'image
        if (!file_put_contents($image_path, $image_data)) {
            // Erreur lors de la sauvegarde de l'image, mais on continue
            continue;
        }
        
        // Remplacer l'URL de données par l'URL relative dans le HTML
        $html_content = str_replace($image['data'], 'images/' . $filename, $html_content);
    }
}

// S'assurer que le DOCTYPE est présent
if (strpos($html_content, '<!DOCTYPE html>') === false) {
    $html_content = '<!DOCTYPE html>' . $html_content;
}

// Sauvegarder le contenu HTML dans le fichier
if (file_put_contents($file_path, $html_content)) {
    echo json_encode(['success' => true, 'message' => 'Modifications sauvegardées avec succès.']);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Erreur lors de la sauvegarde du fichier.']);
}
?> 