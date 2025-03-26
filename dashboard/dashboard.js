// Variables globales pour la sélection d'images
let currentImageUploadTarget = null;
let currentImageInputId = null;
let currentImageInputElement = null;
let selectedBackupImage = null;
let shouldBackupImage = false; // Modifié à false par défaut

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation
    initNavigation();
    initFormFields();
    initPreviewPanel();
    initRepeatableItems();
    initUploadFunctionality();
    initApplyChanges();
    initSaveChanges();
    initCapacityHandlers();
    
    // Intercepter tous les clics sur les labels de téléchargement d'image
    const fileUploadLabels = document.querySelectorAll('.file-upload label');
    fileUploadLabels.forEach(label => {
        label.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtenir l'élément input file associé
            const fileInput = this.nextElementSibling;
            
            // Déterminer la cible de l'upload
            if (fileInput.id === 'hero-image-upload') {
                currentImageInputId = 'hero-image';
                currentImageInputElement = null;
            } else if (fileInput.id === 'host-image-upload') {
                currentImageInputId = 'host-image';
                currentImageInputElement = null;
            } else if (fileInput.classList.contains('carousel-image-upload')) {
                currentImageInputId = null;
                currentImageInputElement = fileInput.closest('.repeatable-item').querySelector('.carousel-image-src');
            } else if (fileInput.classList.contains('gallery-image-upload')) {
                currentImageInputId = null;
                currentImageInputElement = fileInput.closest('.repeatable-item').querySelector('.gallery-image-src');
            } else if (fileInput.classList.contains('testimonial-image-upload')) {
                currentImageInputId = null;
                currentImageInputElement = fileInput.closest('.repeatable-item').querySelector('.testimonial-image-src');
            } else if (fileInput.classList.contains('activity-image-upload')) {
                currentImageInputId = null;
                currentImageInputElement = fileInput.closest('.repeatable-item').querySelector('.activity-image-src');
            }
            
            // Stocker la référence au file input original
            currentImageUploadTarget = fileInput;
            
            // Ouvrir la modal au lieu du sélecteur de fichier natif
            openImageSelectorModal();
            
            return false;
        });
    });
    
    // Configuration des événements de la modal
    setupImageSelectorModal();
    
    // Afficher une notification
    window.showNotification = function(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification';
        
        if (type === 'error') {
            notification.classList.add('error');
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };
    
    // Appeler les fonctions d'amélioration
    addCarouselAnimations();
    enhancePreviewExperience();
    
    organizeCarouselFields();
    
    // Observer l'ajout de nouveaux éléments
    const carouselContainer = document.getElementById('carousel-container');
    if (carouselContainer) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    organizeCarouselFields();
                }
            });
        });
        
        observer.observe(carouselContainer, { childList: true });
    }
    
    // Modifier la fonction d'ajout d'élément pour appliquer les changements
    const originalAddCarouselItem = window.addCarouselItem;
    if (typeof originalAddCarouselItem === 'function') {
        window.addCarouselItem = function() {
            originalAddCarouselItem();
            organizeCarouselFields();
        };
    }
    
    // Appliquer les améliorations à tous les éléments répétables
    enhanceRepeatableItems();
    
    // Observer les changements dans les conteneurs d'éléments répétables
    const containers = [
        'carousel-container',
        'gallery-items-container', 
        'testimonials-container',
        'amenities-container',
        'faq-container',
        'activities-container'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length) {
                        enhanceRepeatableItems();
                    }
                });
            });
            
            observer.observe(container, { childList: true });
        }
    });

    initGallery();
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
        
        // Ajouter l'animation au nouvel élément
        newItem.style.animation = 'none';
        newItem.offsetHeight; // Forcer un reflow
        newItem.style.animation = 'slideIn 0.5s ease forwards';
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
    
    // Obtenir la valeur actuelle de l'input (chemin de l'image existante)
    const target = inputId ? document.getElementById(inputId) : inputElement;
    let originalPath = target ? target.value : '';
    
    // Extraire le chemin de l'image si c'est au format url()
    if (originalPath.includes('url(')) {
        const matches = originalPath.match(/url\(['"]?(.*?)['"]?\)/);
        if (matches && matches[1]) {
            originalPath = matches[1];
            // Supprimer le timestamp éventuel
            originalPath = originalPath.split('?')[0];
            console.log('Chemin extrait de url():', originalPath);
        }
    } else {
        // Supprimer le timestamp éventuel
        originalPath = originalPath.split('?')[0];
    }

    // Nettoyer le chemin des URLs complètes
    if (originalPath.startsWith('http://') || originalPath.startsWith('https://')) {
        const url = new URL(originalPath);
        originalPath = url.pathname.substring(1); // Enlever le premier slash
        console.log('Chemin nettoyé de l\'URL:', originalPath);
    }
    
    console.log('Envoi d\'image avec chemin original:', originalPath);
    
    // Créer un FormData pour envoyer le fichier
    const formData = new FormData();
    formData.append('image', file);
    formData.append('original_path', originalPath);
    formData.append('backup', shouldBackupImage.toString());
    
    // Afficher l'indicateur de chargement
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // Envoyer l'image au serveur
    fetch('upload_image.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        // Cacher l'indicateur de chargement
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        if (result.success) {
            if (target) {
                // Conserver la valeur originale de l'image pour le champ (sans timestamp)
                const imagePath = result.image_path;
                
                // Stocker la valeur sans timestamp dans l'input
                if (target.getAttribute('data-attr') === 'background-image') {
                    target.value = `url('${imagePath}')`;
                } else {
                    target.value = imagePath;
                }
                
                // Appliquer immédiatement la modification à l'aperçu
                const previewFrame = document.getElementById('preview-frame');
                const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
                
                try {
                    const targetSelector = target.getAttribute('data-target');
                    const attrName = target.getAttribute('data-attr') || 'src';
                    const targetElement = frameDoc.querySelector(targetSelector);
                    
                    if (targetElement) {
                        console.log(`Mise à jour de l'image: ${targetSelector} avec ${attrName}=${imagePath}`);
                        
                        // Pour l'aperçu, ajouter un timestamp pour forcer le rechargement
                        const timestamp = new Date().getTime();
                        const imagePathWithTimestamp = `${imagePath}?t=${timestamp}`;
                        
                        if (attrName === 'background-image') {
                            targetElement.style.setProperty('background-image', `url('${imagePathWithTimestamp}')`);
                        } else {
                            targetElement.setAttribute(attrName, imagePathWithTimestamp);
                        }
                        
                        // Message de notification
                        if (result.replaced) {
                            const backupMsg = shouldBackupImage ? ' et l\'ancienne image a été sauvegardée' : ' sans sauvegarde de l\'ancienne image';
                            showNotification('Image remplacée avec succès' + backupMsg + ' !');
                        } else {
                            showNotification('Nouvelle image téléchargée avec succès !');
                        }
                    }
                } catch (err) {
                    console.error('Erreur lors de l\'application de l\'image:', err);
                }
            }
        } else {
            showNotification('Erreur lors du téléchargement de l\'image: ' + result.error, 'error');
        }
    })
    .catch(error => {
        // Cacher l'indicateur de chargement
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        console.error('Erreur:', error);
        showNotification('Erreur lors du téléchargement de l\'image', 'error');
    });
}

// Application des modifications en temps réel
function initApplyChanges() {
    document.getElementById('apply-changes').addEventListener('click', function() {
        applyChangesToPreview();
        
        // Afficher une notification de succès
        showNotification('Les modifications ont été appliquées avec succès !', 'success');
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
                    // Formater correctement la valeur pour background-image et ajouter un timestamp
                    let bgValue = input.value;
                    
                    // Supprimer les timestamps existants
                    if (bgValue.includes('?t=')) {
                        bgValue = bgValue.split('?t=')[0];
                        if (bgValue.endsWith("'") || bgValue.endsWith('"')) {
                            bgValue = bgValue.slice(0, -1) + "')";
                        }
                    }
                    
                    // Si la valeur n'est pas déjà au format url()
                    if (!bgValue.includes('url(') && bgValue.trim() !== '') {
                        bgValue = `url('${bgValue}')`;
                    }
                    
                    // Extraire le chemin de l'image de l'url() pour ajouter le timestamp
                    if (bgValue.includes('url(')) {
                        const matches = bgValue.match(/url\(['"]?(.*?)['"]?\)/);
                        if (matches && matches[1]) {
                            const baseUrl = matches[1].split('?')[0]; // Supprimer tout timestamp existant
                            const timestamp = new Date().getTime();
                            const urlWithTimestamp = `${baseUrl}?t=${timestamp}`;
                            bgValue = `url('${urlWithTimestamp}')`;
                        }
                    }
                    
                    // Utiliser setProperty au lieu de style.backgroundImage
                    targetElement.style.setProperty('background-image', bgValue);
                    console.log(`Application de background-image: ${target} avec ${bgValue}`);
                } else if (attr === 'data-stars') {
                    // Cas spécial pour les étoiles des témoignages
                    targetElement.setAttribute(attr, input.value);
                    updateStars(targetElement, parseInt(input.value));
                } else if (attr === 'src') {
                    // Pour les images, ajouter un timestamp pour forcer le rechargement
                    let srcValue = input.value;
                    
                    // Supprimer les timestamps existants
                    srcValue = srcValue.split('?')[0];
                    
                    // Ajouter un nouveau timestamp
                    const timestamp = new Date().getTime();
                    const srcWithTimestamp = `${srcValue}?t=${timestamp}`;
                    targetElement.setAttribute(attr, srcWithTimestamp);
                } else {
                    // Pour les autres attributs, appliquer directement
                    targetElement.setAttribute(attr, input.value);
                }
            } else {
                // Si c'est le contenu texte
                targetElement.textContent = input.value;
            }
        } else {
            console.warn(`Élément cible non trouvé: ${target}`);
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

// Fonction pour initialiser la sauvegarde des modifications
function initSaveChanges() {
    const saveButton = document.getElementById('save-changes');
    if (saveButton) {
        saveButton.addEventListener('click', showSaveConfirmationModal);
    }
}

// Gestion de la modal de confirmation de sauvegarde
const saveConfirmationModal = document.getElementById('save-confirmation-modal');
const saveConfirmationCheckbox = document.getElementById('save-confirmation-checkbox');
const saveConfirmButton = document.getElementById('save-confirm');
const saveCancelButton = document.getElementById('save-cancel');
const saveChangesButton = document.getElementById('save-changes');

// Fonction pour afficher la modal de confirmation
function showSaveConfirmationModal() {
    saveConfirmationModal.style.display = 'flex';
    saveConfirmationCheckbox.checked = false;
    saveConfirmButton.disabled = true;
}

// Fonction pour masquer la modal de confirmation
function hideSaveConfirmationModal() {
    saveConfirmationModal.style.display = 'none';
    saveConfirmationCheckbox.checked = false;
    saveConfirmButton.disabled = true;
}

// Écouteur d'événement pour la case à cocher
saveConfirmationCheckbox.addEventListener('change', function() {
    saveConfirmButton.disabled = !this.checked;
});

// Écouteur d'événement pour le bouton d'annulation
saveCancelButton.addEventListener('click', hideSaveConfirmationModal);

// Écouteur d'événement pour le bouton de confirmation
saveConfirmButton.addEventListener('click', function() {
    if (saveConfirmationCheckbox.checked) {
        // Masquer la modal de confirmation
        hideSaveConfirmationModal();
        
        // Afficher l'indicateur de chargement
        document.getElementById('loading-overlay').style.display = 'flex';
        
        // Appliquer d'abord les modifications à la prévisualisation
        applyChangesToPreview();
        
        // Attendre un peu pour que les modifications soient appliquées
        setTimeout(() => {
            saveChangesToFile();
        }, 1000);
    }
});

// Fermer la modal en cliquant en dehors
saveConfirmationModal.addEventListener('click', function(e) {
    if (e.target === this) {
        hideSaveConfirmationModal();
    }
});

function openImageSelectorModal() {
    const modal = document.getElementById('image-selector-modal');
    
    // Réinitialiser l'état de la modal
    document.getElementById('modal-file-upload').value = '';
    document.getElementById('upload-preview').style.display = 'none';
    selectedBackupImage = null;
    shouldBackupImage = false; // Réinitialiser à false
    
    // Décocher les cases à cocher de sauvegarde
    const backupCheckbox = document.getElementById('backup-checkbox');
    if (backupCheckbox) {
        backupCheckbox.checked = false;
    }
    
    const backupCheckboxRestore = document.getElementById('backup-checkbox-restore');
    if (backupCheckboxRestore) {
        backupCheckboxRestore.checked = false;
    }
    
    // Activer l'onglet d'upload par défaut
    const tabs = modal.querySelectorAll('.modal-tab');
    const tabContents = modal.querySelectorAll('.upload-tab, .backup-tab');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    tabs[0].classList.add('active');
    tabContents[0].classList.add('active');
    
    // Afficher la modal
    modal.classList.add('active');
    
    // Charger les images de backup si on clique sur cet onglet
    const backupTab = modal.querySelector('.modal-tab[data-tab="backup"]');
    backupTab.addEventListener('click', loadBackupImages, { once: true });
}

function setupImageSelectorModal() {
    const modal = document.getElementById('image-selector-modal');
    
    // Gestion des onglets
    const tabs = modal.querySelectorAll('.modal-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Activer l'onglet cliqué
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Afficher le contenu correspondant
            const tabContents = modal.querySelectorAll('.upload-tab, .backup-tab');
            tabContents.forEach(content => content.classList.remove('active'));
            
            const activeContent = targetTab === 'upload' ? 
                                  modal.querySelector('.upload-tab') : 
                                  modal.querySelector('.backup-tab');
            activeContent.classList.add('active');
        });
    });
    
    // Gestion de la fermeture de la modal
    const closeButton = modal.querySelector('.modal-close');
    closeButton.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // Aperçu de l'image uploadée
    const fileUpload = document.getElementById('modal-file-upload');
    fileUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewContainer = document.getElementById('upload-preview');
                const previewImage = previewContainer.querySelector('img');
                previewImage.src = e.target.result;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Gestion des cases à cocher pour la sauvegarde
    const backupCheckbox = document.getElementById('backup-checkbox');
    if (backupCheckbox) {
        backupCheckbox.addEventListener('change', function() {
            shouldBackupImage = this.checked;
            console.log('Option de sauvegarde (upload):', shouldBackupImage);
        });
    }
    
    const backupCheckboxRestore = document.getElementById('backup-checkbox-restore');
    if (backupCheckboxRestore) {
        backupCheckboxRestore.addEventListener('change', function() {
            shouldBackupImage = this.checked;
            console.log('Option de sauvegarde (restore):', shouldBackupImage);
        });
    }
    
    // Gestion du bouton Annuler
    const cancelButton = document.getElementById('modal-cancel');
    cancelButton.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // Gestion du bouton Confirmer
    const confirmButton = document.getElementById('modal-confirm');
    confirmButton.addEventListener('click', function() {
        // Déterminer quel onglet est actif
        const activeTab = modal.querySelector('.modal-tab.active').getAttribute('data-tab');
        
        if (activeTab === 'upload') {
            // Utiliser l'image uploadée
            const fileUpload = document.getElementById('modal-file-upload');
            if (fileUpload.files.length > 0) {
                // Transférer le fichier sélectionné à l'input d'origine
                const fileTransfer = new DataTransfer();
                fileTransfer.items.add(fileUpload.files[0]);
                
                if (currentImageUploadTarget) {
                    currentImageUploadTarget.files = fileTransfer.files;
                    
                    // Déclencher l'événement change manuellement
                    const changeEvent = new Event('change', { bubbles: true });
                    currentImageUploadTarget.dispatchEvent(changeEvent);
                }
            }
        } else if (activeTab === 'backup' && selectedBackupImage) {
            // Utiliser l'image de backup sélectionnée
            applyBackupImage(selectedBackupImage);
        }
        
        // Fermer la modal
        modal.classList.remove('active');
    });
}

function loadBackupImages() {
    const backupImagesGrid = document.getElementById('backup-images-grid');
    const loadingIndicator = document.getElementById('backup-images-loading');
    
    backupImagesGrid.innerHTML = '';
    loadingIndicator.style.display = 'block';
    
    // Charger les images depuis le serveur
    fetch('get_backup_images.php')
        .then(response => response.json())
        .then(data => {
            loadingIndicator.style.display = 'none';
            
            if (data.success && data.images.length > 0) {
                // Afficher les images
                data.images.forEach(image => {
                    const imageElement = createBackupImageElement(image);
                    backupImagesGrid.appendChild(imageElement);
                });
            } else {
                // Aucune image trouvée
                backupImagesGrid.innerHTML = '<p>Aucune image sauvegardée trouvée.</p>';
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement des images:', error);
            loadingIndicator.style.display = 'none';
            backupImagesGrid.innerHTML = '<p>Erreur lors du chargement des images.</p>';
        });
}

function createBackupImageElement(image) {
    const item = document.createElement('div');
    item.className = 'backup-image-item';
    item.setAttribute('data-path', image.path);
    
    // Ajouter l'image
    const img = document.createElement('img');
    img.src = image.url;
    img.alt = image.name;
    item.appendChild(img);
    
    // Ajouter le bouton de suppression
    const actions = document.createElement('div');
    actions.className = 'backup-image-actions';
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-delete-image';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.title = 'Supprimer cette image';
    
    // Arrêter la propagation du clic pour éviter de sélectionner l'image en même temps
    deleteButton.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement cette image ?\n${image.name}`)) {
            deleteBackupImage(image.path, item);
        }
    });
    
    actions.appendChild(deleteButton);
    item.appendChild(actions);
    
    // Ajouter les informations sur l'image
    const info = document.createElement('div');
    info.className = 'backup-image-info';
    info.textContent = image.original_name;
    
    const date = document.createElement('span');
    date.className = 'backup-image-date';
    date.textContent = image.date;
    info.appendChild(date);
    
    item.appendChild(info);
    
    // Ajouter l'événement de sélection
    item.addEventListener('click', function() {
        // Désélectionner l'image précédente
        const previouslySelected = document.querySelector('.backup-image-item.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }
        
        // Sélectionner cette image
        this.classList.add('selected');
        selectedBackupImage = image;
    });
    
    return item;
}

// Fonction pour supprimer une image du backup
function deleteBackupImage(imagePath, itemElement) {
    // Afficher l'indicateur de chargement
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    const formData = new FormData();
    formData.append('image_path', imagePath);
    
    fetch('delete_backup_image.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        // Cacher l'indicateur de chargement
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        if (result.success) {
            // Supprimer l'élément du DOM
            itemElement.remove();
            showNotification('Image supprimée avec succès !');
            
            // Si c'était l'image sélectionnée, réinitialiser la sélection
            if (selectedBackupImage && selectedBackupImage.path === imagePath) {
                selectedBackupImage = null;
            }
            
            // Vérifier s'il reste des images
            const backupImagesGrid = document.getElementById('backup-images-grid');
            if (backupImagesGrid && backupImagesGrid.children.length === 0) {
                backupImagesGrid.innerHTML = '<p>Aucune image sauvegardée trouvée.</p>';
            }
        } else {
            showNotification('Erreur lors de la suppression : ' + result.message, 'error');
        }
    })
    .catch(error => {
        // Cacher l'indicateur de chargement
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        console.error('Erreur lors de la suppression :', error);
        showNotification('Erreur de connexion au serveur', 'error');
    });
}

function applyBackupImage(image) {
    const target = currentImageInputId ? document.getElementById(currentImageInputId) : currentImageInputElement;
    
    if (target) {
        // Obtenir le chemin cible actuel
        let targetPath = target.value;
        
        // Extraire le chemin si c'est au format url()
        if (targetPath.includes('url(')) {
            const matches = targetPath.match(/url\(['"]?(.*?)['"]?\)/);
            if (matches && matches[1]) {
                targetPath = matches[1];
                // Supprimer le timestamp éventuel
                targetPath = targetPath.split('?')[0];
            }
        } else {
            // Supprimer le timestamp éventuel
            targetPath = targetPath.split('?')[0];
        }
        
        // Nettoyer le chemin des URLs complètes
        if (targetPath.startsWith('http://') || targetPath.startsWith('https://')) {
            const url = new URL(targetPath);
            targetPath = url.pathname.substring(1); // Enlever le premier slash
        }
        
        console.log('Restauration de', image.path, 'vers', targetPath);
        
        // Afficher l'indicateur de chargement
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        // Envoyer la demande de restauration au serveur
        const formData = new FormData();
        formData.append('backup_image_path', image.path);
        formData.append('target_image_path', targetPath);
        formData.append('backup', shouldBackupImage.toString());
        
        fetch('restore_backup_image.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            // Cacher l'indicateur de chargement
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
            if (result.success) {
                // Stockage du chemin original (sans timestamp)
                const imagePath = result.image_path;
                
                // Mise à jour de la valeur du champ
                if (target.getAttribute('data-attr') === 'background-image') {
                    target.value = `url('${imagePath}')`;
                } else {
                    target.value = imagePath;
                }
                
                // Appliquer les changements à l'aperçu
                applyChangesToPreview();
                
                // Afficher une notification
                const backupMsg = shouldBackupImage ? ' et l\'image actuelle a été sauvegardée' : ' sans sauvegarde de l\'image actuelle';
                showNotification('Image de backup restaurée avec succès' + backupMsg + ' !');
            } else {
                showNotification('Erreur lors de la restauration : ' + (result.error || 'Erreur inconnue'), 'error');
            }
        })
        .catch(error => {
            // Cacher l'indicateur de chargement
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
            console.error('Erreur lors de la restauration :', error);
            showNotification('Erreur de connexion au serveur', 'error');
        });
    }
}

// Fonction pour ajouter des effets d'animation aux éléments du carrousel
function addCarouselAnimations() {
    const carouselItems = document.querySelectorAll('#carousel-container .repeatable-item');
    
    carouselItems.forEach((item, index) => {
        // Ajouter un délai d'animation basé sur l'index
        item.style.animationDelay = `${index * 0.1}s`;
        
        // Ajouter un effet de survol avec une ombre dynamique
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            item.style.boxShadow = `${x / 20}px ${y / 20}px 20px rgba(0, 0, 0, 0.1)`;
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'none';
            item.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
        });
        
        // Ajouter un effet de focus amélioré pour les champs de saisie
        const inputs = item.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                item.style.borderColor = 'var(--primary-color)';
                item.style.boxShadow = '0 8px 24px rgba(58, 124, 165, 0.15)';
            });
            
            input.addEventListener('blur', () => {
                item.style.borderColor = '#dee2e6';
                item.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
            });
        });
    });
}

// Fonction pour améliorer l'expérience de prévisualisation
function enhancePreviewExperience() {
    const previewFrame = document.getElementById('preview-frame');
    if (!previewFrame) return;
    
    const carousel = previewFrame.contentDocument.querySelector('.carousel');
    if (!carousel) return;
    
    // Ajouter un effet de transition fluide entre les slides
    carousel.addEventListener('slide.bs.carousel', (e) => {
        const currentItem = e.from;
        const nextItem = e.to;
        
        const currentSlide = carousel.querySelector(`.carousel-item:nth-child(${currentItem + 1})`);
        const nextSlide = carousel.querySelector(`.carousel-item:nth-child(${nextItem + 1})`);
        
        if (currentSlide && nextSlide) {
            currentSlide.style.opacity = '0';
            nextSlide.style.opacity = '1';
        }
    });
    
    // Ajouter un effet de parallaxe aux images
    const carouselItems = carousel.querySelectorAll('.carousel-item');
    carouselItems.forEach(item => {
        const img = item.querySelector('img');
        if (img) {
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const moveX = (x - centerX) / 20;
                const moveY = (y - centerY) / 20;
                
                img.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
            
            item.addEventListener('mouseleave', () => {
                img.style.transform = 'none';
            });
        }
    });
}

// Fonction pour réorganiser les éléments du carousel
function organizeCarouselFields() {
    const carouselItems = document.querySelectorAll('#carousel-container .repeatable-item');
    
    carouselItems.forEach((item, index) => {
        // Ajouter l'attribut data-slide-number pour l'affichage du numéro
        item.setAttribute('data-slide-number', index + 1);
        
        // Créer la barre d'outils
        const toolbarEl = document.createElement('div');
        toolbarEl.className = 'item-toolbar';
        
        // Déplacer les boutons existants vers la barre d'outils
        const removeBtn = item.querySelector('.btn-remove');
        if (removeBtn) {
            toolbarEl.appendChild(removeBtn);
        }
        
        // Insérer la barre d'outils au début de l'élément
        item.insertBefore(toolbarEl, item.firstChild);
        
        // Créer une zone de prévisualisation pour l'image
        const fileUploadEl = item.querySelector('.file-upload');
        const fileInputEl = fileUploadEl ? fileUploadEl.querySelector('input[type="file"]') : null;
        const imagePathInput = item.querySelector('.carousel-image-src');
        
        if (fileInputEl && imagePathInput) {
            const previewEl = document.createElement('div');
            previewEl.className = 'file-preview';
            
            const imgEl = document.createElement('img');
            
            // Vérifier si une image est déjà définie
            const imagePath = imagePathInput.value;
            if (imagePath) {
                imgEl.src = '../' + imagePath + '?t=' + new Date().getTime();
                previewEl.classList.add('has-image');
            } else {
                previewEl.innerHTML = '<i class="fas fa-image"></i> Aucune image sélectionnée';
            }
            
            previewEl.appendChild(imgEl);
            
            // Ajouter un événement de clic pour simuler un clic sur l'input de fichier
            previewEl.addEventListener('click', function() {
                fileInputEl.click();
            });
            
            // Insérer la prévisualisation avant l'élément de téléchargement
            fileUploadEl.parentNode.insertBefore(previewEl, fileUploadEl);
            
            // Ajouter un événement pour prévisualiser l'image sélectionnée
            fileInputEl.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        imgEl.src = e.target.result;
                        previewEl.classList.add('has-image');
                        previewEl.querySelector('i')?.remove();
                    }
                    
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }
        
        // Identifier tous les groupes de formulaire
        const formGroups = item.querySelectorAll('.form-group');
        
        // Identifier les groupes de légende et de texte alternatif
        let legendGroup = null;
        let altTextGroup = null;
        
        formGroups.forEach(group => {
            const label = group.querySelector('label');
            if (label) {
                if (label.textContent.includes('Légende')) {
                    legendGroup = group;
                } else if (label.textContent.includes('Texte alternatif')) {
                    altTextGroup = group;
                }
            }
        });
        
        // Si les deux groupes sont trouvés, on les réorganise
        if (legendGroup && altTextGroup) {
            // Ajouter les styles et informations au groupe de texte alternatif
            altTextGroup.classList.add('alt-text-group');
            
            // Modifier le label pour ajouter une icône et indiquer l'importance pour le SEO
            const altTextLabel = altTextGroup.querySelector('label');
            if (altTextLabel) {
                altTextLabel.innerHTML = '<i class="fas fa-search"></i> Texte alternatif (SEO & Accessibilité)';
            }
            
            // Ajouter un texte d'aide
            const hintEl = document.createElement('div');
            hintEl.className = 'alt-text-hint';
            hintEl.innerHTML = '<i class="fas fa-info-circle"></i> Décrivez précisément l\'image pour améliorer le référencement et l\'accessibilité pour les malvoyants.';
            
            // Ajouter le texte d'aide s'il n'existe pas déjà
            if (!altTextGroup.querySelector('.alt-text-hint')) {
                altTextGroup.appendChild(hintEl);
            }
            
            // Réorganiser l'ordre: image > légende > texte alternatif
            // 1. Enlever les deux groupes de leur position actuelle
            legendGroup.parentNode.removeChild(legendGroup);
            altTextGroup.parentNode.removeChild(altTextGroup);
            
            // 2. Trouver le groupe de fichier pour insérer après lui
            const fileGroup = item.querySelector('.form-group:has(.file-upload)');
            if (fileGroup) {
                // 3. Ajouter la légende après le groupe de fichier
                fileGroup.after(legendGroup);
                
                // 4. Ajouter le texte alternatif à la fin
                item.appendChild(altTextGroup);
            } else {
                // Si on ne trouve pas le groupe de fichier, on les ajoute simplement à la fin
                item.appendChild(legendGroup);
                item.appendChild(altTextGroup);
            }
        }
    });
}

// Fonction pour appliquer la numérotation et les améliorations à tous les éléments répétables
function enhanceRepeatableItems() {
    // Liste des conteneurs d'éléments répétables
    const containers = [
        { id: 'carousel-container', classPrefix: 'carousel' },
        { id: 'gallery-items-container', classPrefix: 'gallery' },
        { id: 'testimonials-container', classPrefix: 'testimonial' },
        { id: 'amenities-container', classPrefix: 'amenity' },
        { id: 'faq-container', classPrefix: 'faq' },
        { id: 'activities-container', classPrefix: 'activity' }
    ];
    
    containers.forEach(container => {
        const containerElement = document.getElementById(container.id);
        if (!containerElement) return;
        
        const items = containerElement.querySelectorAll('.repeatable-item');
        
        items.forEach((item, index) => {
            // Ajouter le numéro d'élément
            item.setAttribute('data-item-number', index + 1);
            
            // Créer une barre d'outils si elle n'existe pas
            if (!item.querySelector('.item-toolbar')) {
                const toolbarEl = document.createElement('div');
                toolbarEl.className = 'item-toolbar';
                
                // Déplacer les boutons existants vers la barre d'outils
                const removeBtn = item.querySelector('.btn-remove');
                if (removeBtn) {
                    toolbarEl.appendChild(removeBtn.cloneNode(true));
                    removeBtn.remove();
                }
                
                // Insérer la barre d'outils au début de l'élément
                item.insertBefore(toolbarEl, item.firstChild);
                
                // Réattacher l'événement de suppression
                attachRemoveItemEvent(toolbarEl.querySelector('.btn-remove'));
            }
            
            // Pour les éléments qui ont des images, ajouter une prévisualisation
            if (container.classPrefix === 'carousel' || 
                container.classPrefix === 'gallery' || 
                container.classPrefix === 'activity') {
                
                const fileUploadEl = item.querySelector('.file-upload');
                const fileInputEl = fileUploadEl ? fileUploadEl.querySelector('input[type="file"]') : null;
                const imagePathInput = item.querySelector(`.${container.classPrefix}-image-src`);
                
                if (fileInputEl && imagePathInput && !item.querySelector('.file-preview')) {
                    const previewEl = document.createElement('div');
                    previewEl.className = 'file-preview';
                    
                    const imgEl = document.createElement('img');
                    
                    // Vérifier si une image est déjà définie
                    const imagePath = imagePathInput.value;
                    if (imagePath) {
                        imgEl.src = '../' + imagePath + '?t=' + new Date().getTime();
                        previewEl.classList.add('has-image');
                    } else {
                        previewEl.innerHTML = '<i class="fas fa-image"></i> Aucune image sélectionnée';
                    }
                    
                    previewEl.appendChild(imgEl);
                    
                    // Ajouter un événement de clic pour simuler un clic sur l'input de fichier
                    previewEl.addEventListener('click', function() {
                        fileInputEl.click();
                    });
                    
                    // Insérer la prévisualisation avant l'élément de téléchargement
                    fileUploadEl.parentNode.insertBefore(previewEl, fileUploadEl);
                    
                    // Ajouter un événement pour prévisualiser l'image sélectionnée
                    fileInputEl.addEventListener('change', function() {
                        if (this.files && this.files[0]) {
                            const reader = new FileReader();
                            
                            reader.onload = function(e) {
                                imgEl.src = e.target.result;
                                previewEl.classList.add('has-image');
                                previewEl.querySelector('i')?.remove();
                            }
                            
                            reader.readAsDataURL(this.files[0]);
                        }
                    });
                }
            }
            
            // Améliorer les champs de texte alternatif
            if ((container.classPrefix === 'carousel' || 
                container.classPrefix === 'gallery') && 
                !item.querySelector('.alt-text-group')) {
                
                const altTextInput = item.querySelector(`.${container.classPrefix}-image-alt`);
                if (altTextInput) {
                    const formGroup = altTextInput.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.add('alt-text-group');
                        
                        // Modifier le label pour ajouter une icône et indiquer l'importance pour le SEO
                        const label = formGroup.querySelector('label');
                        if (label) {
                            label.innerHTML = '<i class="fas fa-search"></i> Texte alternatif (SEO & Accessibilité)';
                        }
                        
                        // Ajouter un texte d'aide
                        const hintEl = document.createElement('div');
                        hintEl.className = 'alt-text-hint';
                        hintEl.innerHTML = '<i class="fas fa-info-circle"></i> Décrivez précisément l\'image pour améliorer le référencement et l\'accessibilité pour les malvoyants.';
                        
                        // Ajouter le texte d'aide s'il n'existe pas déjà
                        if (!formGroup.querySelector('.alt-text-hint')) {
                            formGroup.appendChild(hintEl);
                        }
                        
                        // Pour la galerie, le texte alternatif est en dernier
                        // Donc pas besoin de déplacer
                    }
                }
            }
        });
    });
}

// Gestion de la galerie
function initGallery() {
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('gallery-modal-img');
    const modalCaption = document.getElementById('gallery-modal-caption');
    const closeBtn = document.querySelector('.gallery-modal-close');
    const prevBtn = document.querySelector('.gallery-modal-prev');
    const nextBtn = document.querySelector('.gallery-modal-next');
    let currentIndex = 0;
    let galleryItems = [];

    // Récupérer tous les éléments de la galerie
    function updateGalleryItems() {
        galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    }

    // Ouvrir la modal avec une image spécifique
    function openModal(index) {
        currentIndex = index;
        const item = galleryItems[currentIndex];
        if (item) {
            modalImg.src = item.querySelector('img').src;
            modalCaption.textContent = item.querySelector('.gallery-caption').textContent;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    // Fermer la modal
    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Navigation dans la galerie
    function navigateGallery(direction) {
        currentIndex = (currentIndex + direction + galleryItems.length) % galleryItems.length;
        openModal(currentIndex);
    }

    // Gestionnaires d'événements
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            updateGalleryItems();
            openModal(index);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    prevBtn.addEventListener('click', () => navigateGallery(-1));
    nextBtn.addEventListener('click', () => navigateGallery(1));

    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('show')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                navigateGallery(-1);
                break;
            case 'ArrowRight':
                navigateGallery(1);
                break;
            case 'Escape':
                closeModal();
                break;
        }
    });

    // Gestion du swipe sur mobile
    let touchStartX = 0;
    let touchEndX = 0;

    modal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    modal.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                navigateGallery(1); // Swipe gauche
            } else {
                navigateGallery(-1); // Swipe droite
            }
        }
    }
}

// Sauvegarde des modifications dans le fichier
function saveChangesToFile() {
    const previewFrame = document.getElementById('preview-frame');
    const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    
    try {
        // Obtenir le contenu HTML modifié
        const htmlContent = frameDoc.documentElement.outerHTML;
        
        // Préparer les données pour l'envoi
        const data = {
            html_content: htmlContent,
            file_path: '../index.html' // Chemin relatif du fichier à sauvegarder
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
                
                // Recharger la page du dashboard après 1 seconde
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
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

// Fonction pour initialiser les gestionnaires d'événements de la capacité
function initCapacityHandlers() {
    const capacityInputs = document.querySelectorAll('.capacity-input input[type="number"]');
    
    capacityInputs.forEach(input => {
        // Définir les valeurs minimales et maximales
        const min = parseInt(input.getAttribute('min')) || 1;
        const max = parseInt(input.getAttribute('max')) || 10;
        
        // Mettre à jour la valeur initiale si nécessaire
        if (!input.value) {
            input.value = min;
        }
        
        input.addEventListener('input', function(e) {
            let value = parseInt(this.value);
            
            // Permettre un champ vide
            if (this.value === '') {
                updateCapacityDisplay();
                return;
            }
            
            // Valider les limites
            if (value < min) {
                value = min;
                this.value = min;
            }
            if (value > max) {
                value = max;
                this.value = max;
            }
            
            updateCapacityDisplay();
        });
        
        // Empêcher la saisie de valeurs non numériques
        input.addEventListener('keypress', function(e) {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });
    });
    
    // Fonction pour mettre à jour l'affichage de la capacité
    function updateCapacityDisplay() {
        const previewFrame = document.getElementById('preview-frame');
        const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        const capacityText = frameDoc.querySelector('.lodge-capacity p');
        
        if (capacityText) {
            const guests = document.querySelector('input[name="guests"]').value || '4';
            const rooms = document.querySelector('input[name="rooms"]').value || '2';
            const beds = document.querySelector('input[name="beds"]').value || '3';
            const bathrooms = document.querySelector('input[name="bathrooms"]').value || '1';
            
            capacityText.innerHTML = `<i class="fas fa-user"></i> ${guests} voyageurs <i class="fas fa-door-open"></i> ${rooms} chambres <i class="fas fa-bed"></i> ${beds} lits <i class="fas fa-bath"></i> ${bathrooms} salle de bain`;
        }
    }
} 