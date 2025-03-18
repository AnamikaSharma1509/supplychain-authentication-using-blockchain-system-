document.addEventListener('DOMContentLoaded', () => {
    // Add animation delay to hero content elements
    const animatedElements = document.querySelectorAll('.animate-fade-in');
    animatedElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.2}s`;
    });

    // Navbar scroll effect with animation
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Add click events to buttons
    const primaryBtn = document.querySelector('.primary-btn');
    const secondaryBtn = document.querySelector('.secondary-btn');

    primaryBtn.addEventListener('click', () => {
        // Open signup modal when "Get Started" is clicked
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    });

    secondaryBtn.addEventListener('click', () => {
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        demoVideo.src = videoUrl;
    });

    // Modal functionality
    const loginBtn = document.querySelector('.login-btn');
    const modalOverlay = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');

    // Open modal
    loginBtn.addEventListener('click', () => {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    // Close modal when clicking outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Toggle between login and signup
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    });

    // Password visibility toggle
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const input = e.target.parentNode.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                e.target.classList.remove('fa-eye');
                e.target.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                e.target.classList.remove('fa-eye-slash');
                e.target.classList.add('fa-eye');
            }
        });
    });

    // Form validation
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Add your form submission logic here
            console.log('Form submitted:', form.id);
        });
    });

    // Update the intersection observer code
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class instead of directly modifying styles
                entry.target.classList.add('animate');
                // Unobserve after animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });

    // Add this new function for resetting animations on scroll to top
    function resetAnimations() {
        if (window.scrollY === 0) {
            document.querySelectorAll('.feature-card').forEach(card => {
                card.classList.remove('animate');
                observer.observe(card);
            });
        }
    }

    // Add scroll event listener for animation reset
    window.addEventListener('scroll', resetAnimations);

    // Add loading animation to submit buttons
    document.querySelectorAll('.submit-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                // Remove loading class after 2 seconds (simulating API call)
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 2000);
            }
        });
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Video Demo Modal
    const videoModal = document.getElementById('videoModal');
    const closeVideoModal = document.getElementById('closeVideoModal');
    const demoVideo = document.getElementById('demoVideo');

    // Replace this URL with your actual video URL
    const videoUrl = "https://www.youtube.com/embed/your-video-id";

    closeVideoModal.addEventListener('click', () => {
        videoModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        demoVideo.src = ''; // Stop video when closing modal
    });

    // Features Modal
    const featuresModal = document.getElementById('featuresModal');
    const closeFeaturesModal = document.getElementById('closeFeaturesModal');
    const featuresLink = document.querySelector('a[href="#features"]');

    featuresLink.addEventListener('click', (e) => {
        e.preventDefault();
        featuresModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    closeFeaturesModal.addEventListener('click', () => {
        featuresModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    // Close modals when clicking outside
    [videoModal, featuresModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
                if (modal === videoModal) {
                    demoVideo.src = '';
                }
            }
        });
    });

    // Add escape key listener for all modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            [videoModal, featuresModal, authModal].forEach(modal => {
                if (modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    if (modal === videoModal) {
                        demoVideo.src = '';
                    }
                }
            });
        }
    });
}); 