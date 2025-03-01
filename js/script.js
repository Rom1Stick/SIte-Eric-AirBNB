// Navigation et menu hamburger
const nav = document.querySelector('nav');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// Changer l'apparence de la navigation au défilement
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Toggle menu mobile
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Fermer le menu mobile lors du clic sur un lien
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Galerie lightbox
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox img');
const closeLightbox = document.querySelector('.close-lightbox');

document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        const imgSrc = item.getAttribute('data-img');
        lightboxImg.src = imgSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

closeLightbox.addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Accordéon pour les équipements
document.querySelectorAll('.equipment-category').forEach(category => {
    category.addEventListener('click', () => {
        const parent = category.parentElement;
        
        // Si l'élément est déjà actif, le fermer
        if (parent.classList.contains('active')) {
            parent.classList.remove('active');
        } else {
            // Fermer tous les autres éléments ouverts
            document.querySelectorAll('.equipment-item.active').forEach(item => {
                if (item !== parent) {
                    item.classList.remove('active');
                }
            });
            
            // Ouvrir l'élément cliqué
            parent.classList.add('active');
        }
    });
});

// FAQ accordéon
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        // Fermer tous les autres items
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle l'état actif
        item.classList.toggle('active');
    });
});

// Calculateur de prix
const checkinInput = document.getElementById('checkin');
const checkoutInput = document.getElementById('checkout');
const guestsSelect = document.getElementById('guests');
const priceCalc = document.getElementById('price-calculation');
const bookingForm = document.getElementById('booking-form');

// Prix de base par nuit en euros
const basePrice = 120;

function calculatePrice() {
    const checkin = new Date(checkinInput.value);
    const checkout = new Date(checkoutInput.value);
    
    if (!isNaN(checkin.getTime()) && !isNaN(checkout.getTime())) {
        // Calculer le nombre de nuits
        const timeDiff = checkout.getTime() - checkin.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (nights > 0) {
            const total = nights * basePrice;
            
            // Afficher le résultat
            priceCalc.textContent = `${nights} nuit(s) × ${basePrice}€ = ${total}€`;
            
            // Comparer avec les prix des plateformes
            const platformPrice = Math.round(total * 1.15);
            document.querySelector('.price-comparison').textContent = `Économisez jusqu'à ${platformPrice - total}€ par rapport aux plateformes`;
        } else {
            priceCalc.textContent = 'Veuillez sélectionner des dates valides';
        }
    }
}

// Calculer le prix quand les dates changent
checkinInput.addEventListener('change', calculatePrice);
checkoutInput.addEventListener('change', calculatePrice);
guestsSelect.addEventListener('change', calculatePrice);

// Soumission du formulaire
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Simuler l'envoi du formulaire
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Envoi en cours...';
    submitButton.disabled = true;
    
    // Simuler une requête à un serveur
    setTimeout(() => {
        alert('Demande de réservation envoyée avec succès ! Nous vous contacterons rapidement pour confirmer votre séjour.');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        bookingForm.reset();
        priceCalc.textContent = '--';
    }, 1500);
});

// Définir les dates minimales pour le calendrier
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

// Formater les dates pour l'attribut min du input date
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

checkinInput.min = formatDate(today);
checkoutInput.min = formatDate(tomorrow);

// Mettre à jour la date de départ minimale lorsque la date d'arrivée change
checkinInput.addEventListener('change', () => {
    const newMinCheckout = new Date(checkinInput.value);
    newMinCheckout.setDate(newMinCheckout.getDate() + 1);
    checkoutInput.min = formatDate(newMinCheckout);
    
    // Si la date de départ est avant la nouvelle date minimale, la mettre à jour
    if (new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
        checkoutInput.value = formatDate(newMinCheckout);
    }
    
    calculatePrice();
});

// Carousel d'images
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.image-carousel');
    const carouselInner = document.querySelector('.carousel-inner');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    const slides = document.querySelectorAll('.carousel-item');
    
    let currentIndex = 0;
    const slidesCount = slides.length;
    
    // Fonction pour mettre à jour la position du carrousel
    function updateCarousel() {
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    // Gestionnaire d'événements pour le bouton précédent
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : slidesCount - 1;
        updateCarousel();
    });
    
    // Gestionnaire d'événements pour le bouton suivant
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex < slidesCount - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    });
    
    // Défilement automatique du carrousel toutes les 5 secondes
    let autoSlide = setInterval(() => {
        currentIndex = (currentIndex < slidesCount - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    }, 5000);
    
    // Arrêter le défilement automatique lorsque l'utilisateur interagit avec le carrousel
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoSlide);
    });
    
    // Reprendre le défilement automatique lorsque l'utilisateur n'interagit plus avec le carrousel
    carousel.addEventListener('mouseleave', () => {
        autoSlide = setInterval(() => {
            currentIndex = (currentIndex < slidesCount - 1) ? currentIndex + 1 : 0;
            updateCarousel();
        }, 5000);
    });
    
    // Initialisation du carrousel
    updateCarousel();
}); 