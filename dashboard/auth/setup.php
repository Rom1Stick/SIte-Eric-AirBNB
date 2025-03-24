<?php
// Ce script permet de réinitialiser le mot de passe administrateur

// Définir le mot de passe par défaut (modifiez-le immédiatement après la première connexion)
$default_password = 'admin123';

// Hasher le mot de passe
$password_hash = password_hash($default_password, PASSWORD_BCRYPT, ['cost' => 12]);

// Créer ou mettre à jour le fichier users.json
$users_data = [
    'users' => [
        [
            'username' => 'admin',
            'password_hash' => $password_hash,
            'email' => 'admin@example.com',
            'last_login' => null
        ]
    ]
];

// Enregistrer les données dans le fichier
$result = file_put_contents('users.json', json_encode($users_data, JSON_PRETTY_PRINT));

if ($result !== false) {
    echo "<h1>Configuration réussie !</h1>";
    echo "<p>Le compte administrateur a été créé avec succès.</p>";
    echo "<p><strong>Nom d'utilisateur:</strong> admin</p>";
    echo "<p><strong>Mot de passe:</strong> " . htmlspecialchars($default_password) . "</p>";
    echo "<p><strong>Important:</strong> Par mesure de sécurité, supprimez ce fichier (setup.php) après utilisation.</p>";
    echo "<p><a href='login.php'>Se connecter au dashboard</a></p>";
} else {
    echo "<h1>Erreur</h1>";
    echo "<p>Impossible d'écrire dans le fichier users.json. Vérifiez les permissions d'écriture.</p>";
}
?> 