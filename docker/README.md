# Environnement Docker pour le Dashboard Le Lodge de Sillans

Ce dossier contient la configuration Docker nécessaire pour exécuter le dashboard d'administration du site "Le Lodge de Sillans" dans un environnement isolé.

## Prérequis

- [Docker](https://www.docker.com/get-started) installé sur votre machine
- [Docker Compose](https://docs.docker.com/compose/install/) installé sur votre machine

## Structure des fichiers

- `Dockerfile`: Configuration de l'image Docker
- `docker-compose.yml`: Configuration des services Docker
- `php.ini`: Configuration personnalisée de PHP
- `apache-site.conf`: Configuration d'Apache
- `setup.sh`: Script pour configurer les permissions des fichiers

## Configuration initiale

Avant de lancer l'environnement Docker, exécutez le script `setup.sh` pour configurer les permissions des fichiers :

```bash
chmod +x docker/setup.sh
./docker/setup.sh
```

## Lancement de l'environnement

Pour démarrer l'environnement Docker :

```bash
cd docker
docker-compose up -d
```

Le dashboard sera accessible à l'adresse : [http://localhost:8080/dashboard/](http://localhost:8080/dashboard/)

## Arrêt de l'environnement

Pour arrêter l'environnement Docker :

```bash
cd docker
docker-compose down
```

## Restrictions du dashboard

- Les administrateurs ne peuvent pas modifier les icônes
- Les administrateurs peuvent modifier toutes les images
- Les administrateurs peuvent modifier les textes et descriptions

## Sauvegarde des modifications

Toutes les modifications effectuées via le dashboard sont enregistrées directement dans les fichiers du site. Il est recommandé de faire des sauvegardes régulières.

## Problèmes courants

### Problèmes de permissions

Si vous rencontrez des problèmes de permissions lors de l'upload d'images, vérifiez que le dossier `images` a les bonnes permissions :

```bash
chmod -R 777 images
```

### Port déjà utilisé

Si le port 8080 est déjà utilisé, vous pouvez modifier le port dans le fichier `docker-compose.yml` :

```yaml
ports:
  - "8081:80"  # Remplacez 8080 par un autre port
``` 