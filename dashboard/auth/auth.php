<?php
// Chemin vers le fichier des utilisateurs
define('USERS_FILE', __DIR__ . '/users.json');

// Fonction pour vérifier les identifiants
function authenticate($username, $password) {
    if (!file_exists(USERS_FILE)) {
        return false;
    }
    
    $users_data = json_decode(file_get_contents(USERS_FILE), true);
    
    if (!isset($users_data['users'])) {
        return false;
    }
    
    foreach ($users_data['users'] as $user) {
        if ($user['username'] === $username) {
            // Vérifier le mot de passe avec password_verify
            if (password_verify($password, $user['password_hash'])) {
                // Mise à jour de la dernière connexion
                update_last_login($username);
                return true;
            }
            break;
        }
    }
    
    return false;
}

// Fonction pour mettre à jour la dernière connexion
function update_last_login($username) {
    $users_data = json_decode(file_get_contents(USERS_FILE), true);
    
    foreach ($users_data['users'] as &$user) {
        if ($user['username'] === $username) {
            $user['last_login'] = date('Y-m-d H:i:s');
            break;
        }
    }
    
    file_put_contents(USERS_FILE, json_encode($users_data, JSON_PRETTY_PRINT));
}

// Générer un jeton CSRF pour les formulaires
function generate_csrf_token() {
    $token = bin2hex(random_bytes(32));
    $_SESSION['csrf_token'] = $token;
    return $token;
}

// Vérifier un jeton CSRF
function verify_csrf_token($token) {
    return isset($_SESSION['csrf_token']) && $_SESSION['csrf_token'] === $token;
} 