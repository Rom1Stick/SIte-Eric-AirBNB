// Navigation et menu hamburger
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const nav = document.querySelector('nav');
    
    // Toggle menu
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Ajouter la classe 'scrolled' à la navigation lors du défilement
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
    
    // Initialiser la galerie lightbox
    initLightbox();
    
    // Initialiser l'accordéon pour les équipements
    initEquipmentAccordion();
    
    // Initialiser l'accordéon FAQ
    initFaqAccordion();
    
    // Initialiser le calculateur de prix
    initPriceCalculator();
    
    // Initialiser le carrousel d'images
    initImageCarousel();
});

// Galerie Lightbox
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const body = document.body;
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').getAttribute('src');
            const imgAlt = this.querySelector('img').getAttribute('alt');
            const caption = this.querySelector('.gallery-caption')?.textContent || '';
            
            // Créer la lightbox
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <img src="${imgSrc}" alt="${imgAlt}">
                    <span class="close-lightbox">&times;</span>
                    ${caption ? `<div class="lightbox-caption">${caption}</div>` : ''}
                </div>
            `;
            
            body.appendChild(lightbox);
            
            // Activer la lightbox après un court délai pour l'animation
            setTimeout(() => {
                lightbox.classList.add('active');
            }, 10);
            
            // Fermer la lightbox au clic
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox || e.target.className === 'close-lightbox') {
                    lightbox.classList.remove('active');
                    
                    // Supprimer la lightbox après l'animation
                    setTimeout(() => {
                        body.removeChild(lightbox);
                    }, 300);
                }
            });
        });
    });
}

// Accordéon pour les équipements
function initEquipmentAccordion() {
    const equipmentItems = document.querySelectorAll('.equipment-item');
    
    equipmentItems.forEach(item => {
        const category = item.querySelector('.equipment-category');
        
        category.addEventListener('click', function() {
            // Fermer tous les autres éléments
            equipmentItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle l'élément actuel
            item.classList.toggle('active');
        });
    });
}

// Accordéon FAQ
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Fermer tous les autres éléments
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle l'élément actuel
            item.classList.toggle('active');
        });
    });
}

// Calculateur de prix
function initPriceCalculator() {
    const checkInDateInput = document.getElementById('check-in-date');
    const checkOutDateInput = document.getElementById('check-out-date');
    const guestsInput = document.getElementById('guests');
    const totalPriceElement = document.getElementById('total-price');
    const nightsElement = document.getElementById('nights');
    const basePriceElement = document.getElementById('base-price');
    const platformPriceElement = document.getElementById('platform-price');
    
    if (!checkInDateInput || !checkOutDateInput || !guestsInput || !totalPriceElement) {
        return;
    }
    
    // Définir la date minimale à aujourd'hui
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    checkInDateInput.setAttribute('min', formattedToday);
    
    // Fonction pour calculer le prix
    function calculatePrice() {
        const checkInDate = new Date(checkInDateInput.value);
        const checkOutDate = new Date(checkOutDateInput.value);
        const guests = Number(guestsInput.value);
        
        // Valider les dates
        if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
            totalPriceElement.textContent = 'Veuillez sélectionner des dates valides';
            return;
        }
        
        // Calculer le nombre de nuits
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        // Prix de base (à personnaliser)
        const basePrice = 100;
        
        // Ajustement en fonction de la saison (exemple)
        let seasonalMultiplier = 1.0;
        const month = checkInDate.getMonth();
        
        // Haute saison (juin à septembre)
        if (month >= 5 && month <= 8) {
            seasonalMultiplier = 1.5;
        } 
        // Saison moyenne (avril, mai, octobre)
        else if (month === 3 || month === 4 || month === 9) {
            seasonalMultiplier = 1.2;
        }
        
        // Ajustement en fonction du nombre de personnes
        let guestMultiplier = 1.0;
        if (guests > 2) {
            guestMultiplier = 1 + ((guests - 2) * 0.1);
        }
        
        // Calcul du prix total
        const totalPrice = Math.round(basePrice * nights * seasonalMultiplier * guestMultiplier);
        
        // Prix sur les plateformes (avec frais supplémentaires)
        const platformPrice = Math.round(totalPrice * 1.15);
        
        // Afficher les résultats
        nightsElement.textContent = nights;
        basePriceElement.textContent = basePrice.toFixed(2) + ' €';
        totalPriceElement.textContent = totalPrice.toFixed(2) + ' €';
        platformPriceElement.textContent = platformPrice.toFixed(2) + ' €';
    }
    
    // Ajouter les événements
    checkInDateInput.addEventListener('change', function() {
        // Mettre à jour la date minimale de départ
        const nextDay = new Date(this.value);
        nextDay.setDate(nextDay.getDate() + 1);
        checkOutDateInput.setAttribute('min', nextDay.toISOString().split('T')[0]);
        
        if (checkOutDateInput.value && new Date(checkOutDateInput.value) <= new Date(this.value)) {
            checkOutDateInput.value = nextDay.toISOString().split('T')[0];
        }
        
        calculatePrice();
    });
    
    checkOutDateInput.addEventListener('change', calculatePrice);
    guestsInput.addEventListener('change', calculatePrice);
}

// Carrousel d'images
function initImageCarousel() {
    const carousels = document.querySelectorAll('.image-carousel');
    
    carousels.forEach(carousel => {
        const carouselInner = carousel.querySelector('.carousel-inner');
        const prevBtn = carousel.querySelector('.carousel-control.prev');
        const nextBtn = carousel.querySelector('.carousel-control.next');
        const items = carousel.querySelectorAll('.carousel-item');
        
        if (!carouselInner || !items.length) return;
        
        let currentIndex = 0;
        
        // Définir la largeur du conteneur interne correctement
        carouselInner.style.width = `${items.length * 100}%`;
        
        // S'assurer que les éléments ont la bonne largeur
        items.forEach(item => {
            item.style.width = `${100 / items.length}%`;
        });
        
        // Fonction pour aller à une diapositive spécifique
        function goToSlide(index) {
            if (index < 0) index = items.length - 1;
            if (index >= items.length) index = 0;
            
            currentIndex = index;
            const translateX = -currentIndex * (100 / items.length);
            carouselInner.style.transform = `translateX(${translateX}%)`;
        }
        
        // Ajouter les écouteurs d'événements pour les boutons
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(currentIndex - 1);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(currentIndex + 1);
            });
        }
        
        // Défilement automatique
        let autoSlide = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000);
        
        // Arrêter le défilement automatique lorsque l'utilisateur interagit avec le carrousel
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoSlide);
        });
        
        carousel.addEventListener('mouseleave', () => {
            autoSlide = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, 5000);
        });
        
        // Initialiser le carrousel
        goToSlide(0);
    });
}
