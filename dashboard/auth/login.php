<?php
// Démarrer la session
session_start();

// Inclure les fonctions d'authentification
require_once 'auth.php';

// Rediriger si déjà connecté
if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
    header('Location: ../index.php');
    exit;
}

$error = '';
$success = '';

// Traitement du formulaire de connexion
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Vérification du jeton CSRF
    if (!isset($_POST['csrf_token']) || !verify_csrf_token($_POST['csrf_token'])) {
        $error = 'Erreur de sécurité. Veuillez réessayer.';
    } else {
        $username = isset($_POST['username']) ? trim($_POST['username']) : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';
        
        // Vérification des identifiants vides
        if (empty($username) || empty($password)) {
            $error = 'Veuillez remplir tous les champs.';
        } else {
            // Limitation des tentatives de connexion
            if (isset($_SESSION['login_attempts']) && $_SESSION['login_attempts'] >= 5) {
                if (time() - $_SESSION['last_attempt'] < 300) { // 5 minutes de blocage
                    $error = 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.';
                } else {
                    // Réinitialiser le compteur après 5 minutes
                    $_SESSION['login_attempts'] = 0;
                }
            }
            
            // Si pas d'erreur, tenter l'authentification
            if (empty($error)) {
                if (authenticate($username, $password)) {
                    // Authentification réussie
                    $_SESSION['authenticated'] = true;
                    $_SESSION['username'] = $username;
                    $_SESSION['login_time'] = time();
                    
                    // Réinitialiser le compteur de tentatives
                    $_SESSION['login_attempts'] = 0;
                    
                    // Rediriger vers le dashboard
                    header('Location: ../index.php');
                    exit;
                } else {
                    // Authentification échouée
                    $error = 'Nom d\'utilisateur ou mot de passe incorrect.';
                    
                    // Incrémenter le compteur de tentatives
                    $_SESSION['login_attempts'] = isset($_SESSION['login_attempts']) ? $_SESSION['login_attempts'] + 1 : 1;
                    $_SESSION['last_attempt'] = time();
                }
            }
        }
    }
}

// Générer un jeton CSRF
$csrf_token = generate_csrf_token();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - Dashboard</title>
    <link rel="stylesheet" href="../dashboard.css">
    <style>
        body {
            background-color: #f5f5f5;
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        
        .login-container {
            width: 100%;
            max-width: 400px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            padding: 30px;
        }
        
        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .login-header h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .login-form .form-group {
            margin-bottom: 20px;
        }
        
        .login-form label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
            font-size: 14px;
        }
        
        .login-form input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            transition: border 0.3s ease;
        }
        
        .login-form input:focus {
            border-color: #3498db;
            outline: none;
        }
        
        .login-button {
            width: 100%;
            padding: 14px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background-color 0.3s ease;
        }
        
        .login-button:hover {
            background-color: #2980b9;
        }
        
        .error-message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 14px;
            text-align: center;
        }
        
        .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 14px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <h1>Connexion au Dashboard</h1>
            <p>Entrez vos identifiants pour accéder au tableau de bord</p>
        </div>
        
        <?php if (!empty($error)): ?>
            <div class="error-message"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <?php if (!empty($success)): ?>
            <div class="success-message"><?php echo htmlspecialchars($success); ?></div>
        <?php endif; ?>
        
        <form class="login-form" method="post" action="login.php">
            <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
            
            <div class="form-group">
                <label for="username">Nom d'utilisateur</label>
                <input type="text" id="username" name="username" required>
            </div>
            
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="login-button">Se connecter</button>
        </form>
    </div>
</body>
</html> 