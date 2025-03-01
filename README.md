# Landing Page - Lodge de Sillans

Ce projet est une landing page optimisée pour la réservation directe d'un logement de vacances à Sillans-la-Cascade, en Provence. Cette landing page permet aux visiteurs de découvrir le logement et de réserver sans passer par des plateformes intermédiaires telles qu'Airbnb.

## Fonctionnalités

- Design responsive et moderne
- Galerie photo organisée par pièces avec légendes et effet lightbox
- Liste complète des équipements classés par catégories dans un menu accordéon
- Présentation des atouts du lodge
- Section "Pourquoi réserver en direct" avec comparaison de prix
- Carte interactive et suggestions d'activités
- Formulaire de réservation avec calculateur de prix
- FAQ interactive
- Optimisation SEO pour un meilleur référencement
- Interface accessible aux personnes malvoyantes

## Structure du projet

```
/
├── index.html           # Structure principale HTML
├── css/
│   └── styles.css       # Styles CSS
├── js/
│   └── script.js        # Fonctionnalités JavaScript
└── images/              # Dossier pour les images (à compléter)
```

## Comment personnaliser cette landing page

### 1. Images

Pour obtenir un résultat optimal, vous devrez ajouter vos propres images dans le dossier `images/`. Voici les images à remplacer selon la nouvelle structure :

- `hero.jpg` : Image principale en en-tête (idéalement 1920x1080px)
- `cuisine-entiere-1.jpg` : Photo de la cuisine complète
- `espace-repas-1.jpg` et `espace-repas-2.jpg` : Photos de l'espace repas
- `chambre-1-1.jpg`, `chambre-1-2.jpg`, `chambre-1-3.jpg` : Photos de la chambre avec lits simples
- `chambre-2-1.jpg` : Photo de la chambre avec lit double
- `salle-de-bain-1.jpg` : Photo de la salle de bain
- `jardin-1.jpg` : Photo du jardin
- `patio-1.jpg` et `patio-2.jpg` : Photos du patio
- `exterieur-1.jpg` : Vue extérieure du lodge
- `piscine-1.jpg`, `piscine-2.jpg`, `piscine-3.jpg` : Photos de la piscine
- `host.jpg` : Photo de l'hôte
- `villages.jpg` : Photo des villages environnants
- `marche.jpg` : Photo d'un marché provençal
- `cascade-1.jpg` : Photo de la cascade de Sillans
- `velo.jpg` : Photo de randonnée à vélo dans la région

### 2. Équipements

La section des équipements est désormais organisée en menu accordéon pour économiser de l'espace. Vous pouvez modifier cette liste dans le fichier `index.html` en fonction des équipements réellement disponibles dans votre logement.

```html
<div class="equipment-item">
    <div class="equipment-category">
        <h4>Catégorie d'équipement</h4>
        <span class="equipment-toggle"><i class="fas fa-chevron-down"></i></span>
    </div>
    <div class="equipment-details">
        <ul>
            <!-- Modifier ou ajouter des équipements ici -->
            <li><i class="fas fa-wifi"></i> Nom de l'équipement</li>
            <!-- Autres équipements... -->
        </ul>
    </div>
</div>
```

Chaque équipement est accompagné d'une icône Font Awesome. Consultez [la documentation Font Awesome](https://fontawesome.com/icons) pour trouver les icônes appropriées.

### 3. Informations à personnaliser

Dans le fichier `index.html`, vous devrez mettre à jour :

- Les coordonnées de contact (téléphone, email)
- Le lien WhatsApp
- Les informations de l'hôte
- Les détails du logement et des chambres
- Les témoignages des clients
- Les activités à proximité
- Les conditions de réservation dans la FAQ

### 4. Tarification

Dans le fichier `js/script.js`, modifiez la variable `basePrice` (ligne 81) pour refléter votre tarif par nuit :

```javascript
// Prix de base par nuit en euros
const basePrice = 120; // Remplacez par votre tarif
```

### 5. Personnalisation des couleurs

Pour modifier les couleurs du site, éditez les variables CSS dans le fichier `css/styles.css` :

```css
:root {
    --primary-color: #3a7ca5; /* Couleur principale */
    --primary-dark: #2c5f8e; /* Couleur principale foncée */
    --secondary-color: #f4a261; /* Couleur secondaire */
    --text-color: #333; /* Couleur du texte */
    --light-text: #f5f5f5; /* Couleur du texte clair */
    --bg-light: #f9f9f9; /* Couleur de fond claire */
    --bg-gray: #f0f0f0; /* Couleur de fond grise */
}
```

## Accessibilité

Cette landing page a été optimisée pour l'accessibilité, notamment pour les personnes malvoyantes :

- Contraste élevé entre le texte et l'arrière-plan
- Ombres de texte renforcées pour les sections avec image de fond
- Tailles de police suffisamment grandes et lisibles
- Structure sémantique avec des balises HTML appropriées
- Attributs alt sur les images
- Menus accordéon pour une navigation plus facile
- Accessibilité au clavier

## Mise en ligne et traitement des réservations

Cette landing page ne contient pas de système de paiement intégré. Voici quelques options pour gérer les réservations :

1. **Email et contact direct** : La configuration actuelle envoie une demande de réservation que vous pouvez traiter manuellement.

2. **Intégration de paiement** : Pour accepter des paiements en ligne, vous pouvez intégrer une solution comme Stripe ou PayPal.

3. **Système de calendrier** : Pour une gestion plus avancée des disponibilités, des solutions comme SuperSaaS ou Booking Calendar peuvent être intégrées.

## Optimisation SEO

La landing page est déjà optimisée pour le référencement, mais pour de meilleurs résultats :

1. Ajoutez des balises `alt` descriptives à toutes vos images
2. Personnalisez les meta tags dans la section `<head>` avec des mots-clés pertinents
3. Créez un fichier `sitemap.xml` pour faciliter l'indexation par les moteurs de recherche
4. Enregistrez votre site dans Google Search Console et créez un compte Google Business Profile

## Compatibilité navigateurs

Cette landing page est compatible avec :
- Google Chrome (dernières versions)
- Mozilla Firefox (dernières versions)
- Microsoft Edge (dernières versions)
- Safari (dernières versions)
- Navigateurs mobiles

## Licence

Cette landing page est fournie à titre d'exemple et vous êtes libre de l'utiliser et de la modifier pour votre usage personnel ou commercial.

---

Pour toute question ou assistance, n'hésitez pas à contacter le développeur. 