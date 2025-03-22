#!/bin/bash

# Script pour configurer les permissions des fichiers pour Docker

# Vérifier qu'on est à la racine du projet
if [ ! -d "dashboard" ] || [ ! -d "images" ]; then
    echo "Erreur: Ce script doit être exécuté à la racine du projet"
    exit 1
fi

# Créer les dossiers nécessaires s'ils n'existent pas
mkdir -p images
mkdir -p css
mkdir -p js

# Configurer les permissions des fichiers et dossiers
echo "Configuration des permissions..."

# Permissions pour les dossiers
find . -type d -exec chmod 755 {} \;

# Permissions pour les fichiers PHP et HTML
find . -type f -name "*.php" -exec chmod 644 {} \;
find . -type f -name "*.html" -exec chmod 644 {} \;

# Permissions pour les fichiers CSS et JS
find . -type f -name "*.css" -exec chmod 644 {} \;
find . -type f -name "*.js" -exec chmod 644 {} \;

# Permissions spécifiques pour les dossiers d'images et CSS
chmod -R 775 images
chmod -R 775 css
chmod -R 775 js

# S'assurer que le dossier images est accessible en écriture
chmod -R 777 images

echo "Permissions configurées avec succès!"

# Instructions pour lancer Docker
echo "---------------------------------------------"
echo "Pour lancer l'environnement Docker, exécutez:"
echo "cd docker && docker-compose up -d"
echo "---------------------------------------------"
echo "Le dashboard sera accessible à l'adresse: http://localhost:8080/dashboard/"
echo "Si les styles ne sont pas chargés, vérifiez que les fichiers CSS sont bien présents dans le dossier css/" 