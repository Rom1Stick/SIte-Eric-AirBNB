document.addEventListener('DOMContentLoaded', function() {
    // Initialisation
    initNavigation();
    initFormFields();
    initPreviewPanel();
    initRepeatableItems();
    initUploadFunctionality();
    initApplyChanges();
    initSaveChanges();
});

// Navigation dans le dashboard
function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.edit-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Retirer la classe active de tous les liens
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // Ajouter la classe active au lien cliqué
            this.classList.add('active');
            
            // Cacher toutes les sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Afficher la section correspondante
            const sectionId = `${this.getAttribute('data-section')}-section`;
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// Initialisation des champs de formulaire
function initFormFields() {
    const previewFrame = document.getElementById('preview-frame');
    
    // Mettre en place les valeurs initiales pour les champs
    previewFrame.addEventListener('load', function() {
        const inputs = document.querySelectorAll('input[data-target], textarea[data-target]');
        
        inputs.forEach(input => {
            const target = input.getAttribute('data-target');
            const attr = input.getAttribute('data-attr');
            const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
            const targetElement = frameDoc.querySelector(target);
            
            if (targetElement) {
                if (attr) {
                    // Pour les attributs comme src, alt, etc.
                    let value = targetElement.getAttribute(attr) || '';
                    if (attr === 'background-image') {
                        value = getComputedStyle(targetElement).backgroundImage;
                    }
                    input.value = value;
                } else {
                    // Pour le contenu texte
                    input.value = targetElement.textContent;
                }
            }
        });
    });
}

// Gestion du panneau de prévisualisation
function initPreviewPanel() {
    const toggleBtn = document.getElementById('toggle-preview');
    const previewPanel = document.querySelector('.preview-panel');
    
    toggleBtn.addEventListener('click', function() {
        previewPanel.classList.toggle('expanded');
        
        // Changer l'icône
        const icon = this.querySelector('i');
        if (previewPanel.classList.contains('expanded')) {
            icon.className = 'fas fa-compress-alt';
        } else {
            icon.className = 'fas fa-expand-alt';
        }
    });
    
    // Ouvrir un nouvel onglet pour la prévisualisation complète
    document.getElementById('preview-site').addEventListener('click', function() {
        window.open('../index.html', '_blank');
    });
}

// Gestion des éléments répétables (amenities, gallery items, etc.)
function initRepeatableItems() {
    // Ajouter un élément au carrousel
    document.getElementById('add-carousel-item').addEventListener('click', function() {
        const container = document.getElementById('carousel-container');
        const items = container.querySelectorAll('.repeatable-item');
        const newIndex = items.length + 1;
        
        const newItem = document.createElement('div');
        newItem.className = 'repeatable-item';
        newItem.innerHTML = `
            <div class="form-group">
                <label>Image URL</label>
                <input type="text" class="carousel-image-src" data-target=".carousel-item:nth-child(${newIndex}) img" data-attr="src" value="">
                <div class="file-upload">
                    <label>Télécharger l'image</label>
                    <input type="file" class="carousel-image-upload" accept="image/*">
                </div>
            </div>
            <div class="form-group">
                <label>Texte alternatif</label>
                <input type="text" class="carousel-image-alt" data-target=".carousel-item:nth-child(${newIndex}) img" data-attr="alt" value="">
            </div>
            <div class="form-group">
                <label>Légende</label>
                <input type="text" class="carousel-caption" data-target=".carousel-item:nth-child(${newIndex}) .carousel-caption" value="">
            </div>
            <button class="btn-remove"><i class="fas fa-trash"></i> Supprimer</button>
        `;
        
        // Insérer avant le bouton d'ajout
        container.insertBefore(newItem, this);
        
        // Attacher l'événement de suppression
        attachRemoveItemEvent(newItem.querySelector('.btn-remove'));
    });
    
    // Ajouter un élément à la galerie
    document.getElementById('add-gallery-item').addEventListener('click', function() {
        const container = document.getElementById('gallery-items-container');
        const items = container.querySelectorAll('.repeatable-item');
        const newIndex = items.length + 1;
        
        const newItem = document.createElement('div');
        newItem.className = 'repeatable-item';
        newItem.innerHTML = `
            <div class="form-group">
                <label>Image URL</label>
                <input type="text" class="gallery-image-src" data-target=".gallery-item:nth-child(${newIndex}) img" data-attr="src" value="">
                <div class="file-upload">
                    <label>Télécharger l'image</label>
                    <input type="file" class="gallery-image-upload" accept="image/*">
                </div>
            </div>
            <div class="form-group">
                <label>Texte alternatif</label>
                <input type="text" class="gallery-image-alt" data-target=".gallery-item:nth-child(${newIndex}) img" data-attr="alt" value="">
            </div>
            <div class="form-group">
                <label>Légende</label>
                <input type="text" class="gallery-caption" data-target=".gallery-item:nth-child(${newIndex}) .gallery-caption" value="">
            </div>
            <button class="btn-remove"><i class="fas fa-trash"></i> Supprimer</button>
        `;
        
        container.insertBefore(newItem, this);
        attachRemoveItemEvent(newItem.querySelector('.btn-remove'));
    });
    
    // Ajouter un témoignage
    document.getElementById('add-testimonial').addEventListener('click', function() {
        const container = document.getElementById('testimonials-container');
        const items = container.querySelectorAll('.repeatable-item');
        const newIndex = items.length + 1;
        
        const newItem = document.createElement('div');
        newItem.className = 'repeatable-item';
        newItem.innerHTML = `
            <div class="form-group">
                <label>Texte du témoignage</label>
                <textarea class="testimonial-text" data-target=".testimonial:nth-child(${newIndex}) p:not(.testimonial-author p)"></textarea>
            </div>
            <div class="form-group">
                <label>Auteur</label>
                <input type="text" class="testimonial-author" data-target=".testimonial:nth-child(${newIndex}) .testimonial-author p" value="">
            </div>
            <div class="form-group">
                <label>Nombre d'étoiles (1-5)</label>
                <input type="number" min="1" max="5" class="testimonial-stars" data-target=".testimonial:nth-child(${newIndex}) .stars" data-attr="data-stars" value="5">
            </div>
            <button class="btn-remove"><i class="fas fa-trash"></i> Supprimer</button>
        `;
        
        container.insertBefore(newItem, this);
        attachRemoveItemEvent(newItem.querySelector('.btn-remove'));
    });
    
    // Ajouter une question FAQ
    document.getElementById('add-faq-item').addEventListener('click', function() {
        const container = document.getElementById('faq-container');
        const items = container.querySelectorAll('.repeatable-item');
        const newIndex = items.length + 1;
        
        const newItem = document.createElement('div');
        newItem.className = 'repeatable-item';
        newItem.innerHTML = `
            <div class="form-group">
                <label>Question</label>
                <input type="text" class="faq-question-text" data-target=".faq-item:nth-child(${newIndex}) .faq-question h3" value="">
            </div>
            <div class="form-group">
                <label>Réponse</label>
                <textarea class="faq-answer-text" data-target=".faq-item:nth-child(${newIndex}) .faq-answer p"></textarea>
            </div>
            <button class="btn-remove"><i class="fas fa-trash"></i> Supprimer</button>
        `;
        
        container.insertBefore(newItem, this);
        attachRemoveItemEvent(newItem.querySelector('.btn-remove'));
    });
}

// Attacher l'événement de suppression à un élément
function attachRemoveItemEvent(btn) {
    if (btn) {
        btn.addEventListener('click', function() {
            const item = this.closest('.repeatable-item');
            item.remove();
            
            // Réindexer les éléments restants
            updateElementIndices();
        });
    }
}

// Mettre à jour les indices pour les sélecteurs nth-child
function updateElementIndices() {
    // Mettre à jour les indices des éléments du carrousel
    updateContainerIndices('carousel-container', '.carousel-image-src', '.carousel-item:nth-child($index) img', 'src');
    updateContainerIndices('carousel-container', '.carousel-image-alt', '.carousel-item:nth-child($index) img', 'alt');
    updateContainerIndices('carousel-container', '.carousel-caption', '.carousel-item:nth-child($index) .carousel-caption');
    
    // Mettre à jour les indices des éléments de la galerie
    updateContainerIndices('gallery-items-container', '.gallery-image-src', '.gallery-item:nth-child($index) img', 'src');
    updateContainerIndices('gallery-items-container', '.gallery-image-alt', '.gallery-item:nth-child($index) img', 'alt');
    updateContainerIndices('gallery-items-container', '.gallery-caption', '.gallery-item:nth-child($index) .gallery-caption');
    
    // Mettre à jour les indices des témoignages
    updateContainerIndices('testimonials-container', '.testimonial-text', '.testimonial:nth-child($index) p:not(.testimonial-author p)');
    updateContainerIndices('testimonials-container', '.testimonial-author', '.testimonial:nth-child($index) .testimonial-author p');
    updateContainerIndices('testimonials-container', '.testimonial-stars', '.testimonial:nth-child($index) .stars', 'data-stars');
    
    // Mettre à jour les indices des questions FAQ
    updateContainerIndices('faq-container', '.faq-question-text', '.faq-item:nth-child($index) .faq-question h3');
    updateContainerIndices('faq-container', '.faq-answer-text', '.faq-item:nth-child($index) .faq-answer p');
}

// Mettre à jour les indices des attributs data-target pour un conteneur
function updateContainerIndices(containerId, inputSelector, targetPattern, attrName = null) {
    const container = document.getElementById(containerId);
    const items = container.querySelectorAll('.repeatable-item');
    
    items.forEach((item, index) => {
        const input = item.querySelector(inputSelector);
        if (input) {
            const newTarget = targetPattern.replace('$index', index + 1);
            input.setAttribute('data-target', newTarget);
        }
    });
}

// Gestion des téléchargements d'images
function initUploadFunctionality() {
    // Téléchargement d'image pour l'arrière-plan du hero
    document.getElementById('hero-image-upload').addEventListener('change', function(e) {
        handleImageUpload(e, 'hero-image');
    });
    
    // Téléchargement d'image pour l'hôte
    document.getElementById('host-image-upload').addEventListener('change', function(e) {
        handleImageUpload(e, 'host-image');
    });
    
    // Délégation d'événements pour les uploads d'images du carrousel et de la galerie
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('carousel-image-upload')) {
            const inputField = e.target.closest('.form-group').querySelector('.carousel-image-src');
            handleImageUpload(e, null, inputField);
        } else if (e.target.classList.contains('gallery-image-upload')) {
            const inputField = e.target.closest('.form-group').querySelector('.gallery-image-src');
            handleImageUpload(e, null, inputField);
        } else if (e.target.classList.contains('activity-image-upload')) {
            const inputField = e.target.closest('.form-group').querySelector('.activity-image-src');
            handleImageUpload(e, null, inputField);
        }
    });
}

// Gestion du téléchargement d'images
function handleImageUpload(event, inputId, inputElement = null) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Utiliser FileReader pour obtenir une URL de données
    const reader = new FileReader();
    reader.onload = function(e) {
        // En production, ici vous enverriez le fichier à un serveur
        // Pour cette démonstration, nous utilisons simplement l'URL de données
        const target = inputId ? document.getElementById(inputId) : inputElement;
        if (target) {
            target.value = e.target.result;
            
            // Stocker des informations sur l'image pour la sauvegarde
            target.dataset.filename = file.name;
            target.dataset.isBase64 = true;
        }
    };
    reader.readAsDataURL(file);
}

// Application des modifications en temps réel
function initApplyChanges() {
    document.getElementById('apply-changes').addEventListener('click', function() {
        applyChangesToPreview();
    });
}

// Appliquer toutes les modifications à la prévisualisation
function applyChangesToPreview() {
    const previewFrame = document.getElementById('preview-frame');
    const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    
    // Vérifier l'accès au contenu de l'iframe (même origine)
    try {
        // Tester l'accès au document de l'iframe
        frameDoc.querySelector('body');
    } catch (e) {
        showNotification('Erreur d\'accès à la prévisualisation. Assurez-vous d\'utiliser un serveur web.', 'error');
        console.error('Erreur d\'accès à l\'iframe:', e);
        return;
    }
    
    // Obtenir tous les champs avec data-target qui ne sont pas des icônes ou qui ne sont pas désactivés
    const inputs = document.querySelectorAll('input[data-target]:not([disabled]), textarea[data-target]:not([disabled])');
    
    inputs.forEach(input => {
        // Ignorer les champs d'icônes
        if (input.classList.contains('amenity-icon') || input.classList.contains('advantage-icon')) {
            return;
        }
        
        const target = input.getAttribute('data-target');
        const attr = input.getAttribute('data-attr');
        const targetElement = frameDoc.querySelector(target);
        
        if (targetElement) {
            if (attr) {
                // Si c'est un attribut comme src, alt, etc.
                if (attr === 'class') {
                    targetElement.className = input.value;
                } else if (attr === 'background-image') {
                    targetElement.style.backgroundImage = input.value;
                } else if (attr === 'data-stars') {
                    // Cas spécial pour les étoiles des témoignages
                    targetElement.setAttribute(attr, input.value);
                    updateStars(targetElement, parseInt(input.value));
                } else {
                    targetElement.setAttribute(attr, input.value);
                }
            } else {
                // Si c'est le contenu texte
                targetElement.textContent = input.value;
            }
        }
    });
    
    // Notification de succès
    showNotification('Modifications appliquées avec succès !');
}

// Mettre à jour l'affichage des étoiles dans les témoignages
function updateStars(starsElement, count) {
    starsElement.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('i');
        star.className = i < count ? 'fas fa-star' : 'far fa-star';
        starsElement.appendChild(star);
    }
}

// Sauvegarde des modifications
function initSaveChanges() {
    document.getElementById('save-changes').addEventListener('click', function() {
        // Afficher l'indicateur de chargement
        document.getElementById('loading-overlay').style.display = 'flex';
        
        // Appliquer d'abord les modifications à la prévisualisation
        applyChangesToPreview();
        
        setTimeout(() => {
            saveChangesToFile();
        }, 1000); // Attendre 1 seconde pour que les modifications soient appliquées
    });
}

// Sauvegarde des modifications dans le fichier
function saveChangesToFile() {
    const previewFrame = document.getElementById('preview-frame');
    const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    
    try {
        // Obtenir le contenu HTML modifié
        const htmlContent = frameDoc.documentElement.outerHTML;
        
        // Collecter les informations sur les images en base64
        const uploadedImages = [];
        document.querySelectorAll('input[data-is-base64="true"]').forEach(input => {
            if (input.dataset.filename && input.value.startsWith('data:image')) {
                uploadedImages.push({
                    data: input.value,
                    filename: input.dataset.filename
                });
            }
        });
        
        // Préparer les données pour l'envoi
        const data = {
            html_content: htmlContent,
            file_path: '../index.html', // Chemin relatif du fichier à sauvegarder
            images: uploadedImages
        };
        
        // Envoyer les données au serveur
        fetch('save.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            // Masquer l'indicateur de chargement
            document.getElementById('loading-overlay').style.display = 'none';
            
            if (result.success) {
                showNotification('Modifications sauvegardées avec succès !');
                
                // Rafraîchir la prévisualisation
                previewFrame.contentWindow.location.reload();
            } else {
                showNotification('Erreur lors de la sauvegarde : ' + (result.error || 'Erreur inconnue'), 'error');
            }
        })
        .catch(error => {
            // Masquer l'indicateur de chargement
            document.getElementById('loading-overlay').style.display = 'none';
            
            console.error('Erreur:', error);
            showNotification('Erreur de connexion au serveur. Vérifiez que le serveur PHP est actif.', 'error');
        });
    } catch (e) {
        // Masquer l'indicateur de chargement
        document.getElementById('loading-overlay').style.display = 'none';
        
        console.error('Erreur lors de la sauvegarde:', e);
        showNotification('Erreur lors de la préparation des données. Vérifiez la console.', 'error');
    }
}

// Afficher une notification
function showNotification(message, type = 'success') {
    // Créer un élément de notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Appliquer un style différent selon le type
    if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else {
        notification.style.backgroundColor = '#28a745';
    }
    
    // Ajouter au document
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Disparition automatique
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
} 