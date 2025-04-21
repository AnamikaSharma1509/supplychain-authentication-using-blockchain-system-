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

    // Form validation and API calls
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('.submit-btn');
            submitBtn.classList.add('loading');

            try {
                // Get form data
                const formData = {};
                
                // For login form
                if (form.id === 'loginForm') {
                    formData.email = form.querySelector('input[type="email"]').value;
                    formData.password = form.querySelector('input[type="password"]').value;
                } 
                // For signup form
                else if (form.id === 'signupForm') {
                    formData.username = form.querySelector('input[type="text"]').value;
                    formData.email = form.querySelector('input[type="email"]').value;
                    formData.password = form.querySelector('input[type="password"]').value;
                    formData.role = form.querySelector('select').value;
                }

                const endpoint = form.id === 'loginForm' ? '/api/auth/login' : '/api/auth/register';
                console.log('Sending request to:', endpoint, formData);
                
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                console.log('Response:', result);

                if (response.ok) {
                    // Store the token in localStorage
                    if (result.token) {
                        localStorage.setItem('token', result.token);
                        localStorage.setItem('user', JSON.stringify(result.user));
                    }
                    
                    // Show success message
                    showNotification('Success!', 'success');
                    
                    // Close the modal
                    modalOverlay.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    
                    // Redirect or update UI based on user role
                    if (result.user.role === 'manufacturer') {
                        window.location.href = '/manufacturer-dashboard.html';
                    } else if (result.user.role === 'retailer') {
                        window.location.href = '/retailer-dashboard.html';
                    } else {
                        window.location.href = '/customer-dashboard.html';
                    }
                } else {
                    showNotification(result.error || 'An error occurred', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Network error. Please try again.', 'error');
            } finally {
                submitBtn.classList.remove('loading');
            }
        });
    });

    // Check if user is already logged in
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (token && user) {
            // Update UI for logged-in user
            const loginBtn = document.querySelector('.login-btn');
            loginBtn.textContent = `Welcome, ${user.username}`;
            loginBtn.href = '#';
            
            // Add logout functionality
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
            });
        }
    }

    // Call checkAuthStatus when page loads
    checkAuthStatus();

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

    // MetaMask Connection
    async function connectMetaMask() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
                
                // Get chain ID
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                
                // Check if we're on Sepolia
                if (chainId !== '0xaa36a7') { // Sepolia chain ID
                    try {
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0xaa36a7' }],
                        });
                    } catch (switchError) {
                        // This error code indicates that the chain has not been added to MetaMask
                        if (switchError.code === 4902) {
                            try {
                                await window.ethereum.request({
                                    method: 'wallet_addEthereumChain',
                                    params: [
                                        {
                                            chainId: '0xaa36a7',
                                            chainName: 'Sepolia Test Network',
                                            nativeCurrency: {
                                                name: 'Sepolia ETH',
                                                symbol: 'ETH',
                                                decimals: 18
                                            },
                                            rpcUrls: ['https://sepolia.infura.io/v3/a0d3aa4a55b840a49af03a00f4b0f082'],
                                            blockExplorerUrls: ['https://sepolia.etherscan.io']
                                        },
                                    ],
                                });
                            } catch (addError) {
                                console.error('Error adding Sepolia network:', addError);
                                showNotification('Failed to add Sepolia network to MetaMask', 'error');
                                return null;
                            }
                        } else {
                            console.error('Error switching to Sepolia network:', switchError);
                            showNotification('Failed to switch to Sepolia network', 'error');
                            return null;
                        }
                    }
                }
                
                // Update UI to show connected status
                updateMetaMaskStatus(true, account);
                return account;
            } catch (error) {
                console.error('Error connecting to MetaMask:', error);
                showNotification('Failed to connect to MetaMask', 'error');
                return null;
            }
        } else {
            showNotification('MetaMask is not installed!', 'error');
            return null;
        }
    }

    function updateMetaMaskStatus(isConnected, address = '') {
        const walletStatus = document.getElementById('walletStatus');
        if (walletStatus) {
            if (isConnected) {
                walletStatus.textContent = `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
                walletStatus.classList.add('connected');
            } else {
                walletStatus.textContent = 'Not Connected';
                walletStatus.classList.remove('connected');
            }
        }
    }

    // Add event listener for MetaMask connection
    document.addEventListener('DOMContentLoaded', () => {
        // Add MetaMask connection button if it doesn't exist
        if (!document.getElementById('connectMetaMask')) {
            const connectButton = document.createElement('button');
            connectButton.id = 'connectMetaMask';
            connectButton.className = 'metaMask-btn';
            connectButton.textContent = 'Connect MetaMask';
            connectButton.onclick = connectMetaMask;
            
            const walletStatus = document.createElement('div');
            walletStatus.id = 'walletStatus';
            walletStatus.textContent = 'Not Connected';
            
            // Add to navbar or appropriate location
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                navLinks.appendChild(connectButton);
                navLinks.appendChild(walletStatus);
            }
        }

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    updateMetaMaskStatus(false);
                } else {
                    updateMetaMaskStatus(true, accounts[0]);
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    });

    function displayProducts(products) {
        const productList = document.getElementById('productList');
        productList.innerHTML = '';

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <h3>${product.name}</h3>
                <p>Manufacturer: ${product.manufacturer_name}</p>
                <p>Description: ${product.description}</p>
                <p>Status: ${product.is_on_blockchain ? 'Verified on Blockchain' : 'Not on Blockchain'}</p>
                <button class="purchase-btn" data-product-id="${product.id}">Purchase</button>
            `;
            
            productList.appendChild(productCard);
        });

        // Add event listeners to purchase buttons
        document.querySelectorAll('.purchase-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = e.target.dataset.productId;
                const button = e.target;
                button.disabled = true;
                button.textContent = 'Processing...';

                try {
                    // Check if MetaMask is connected
                    if (!window.ethereum || !window.ethereum.selectedAddress) {
                        showNotification('Please connect your MetaMask wallet first', 'error');
                        button.disabled = false;
                        button.textContent = 'Purchase';
                        return;
                    }

                    // Check if user is logged in
                    const token = localStorage.getItem('token');
                    if (!token) {
                        showNotification('Please login first', 'error');
                        button.disabled = false;
                        button.textContent = 'Purchase';
                        return;
                    }

                    const response = await fetch(`/api/blockchain/products/${productId}/purchase`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    const data = await response.json();
                    
                    if (response.ok) {
                        showNotification('Product purchased successfully!', 'success');
                        // Refresh the product list
                        fetchProducts();
                    } else {
                        showNotification(`Purchase failed: ${data.message || 'Unknown error'}`, 'error');
                    }
                } catch (error) {
                    console.error('Error purchasing product:', error);
                    showNotification('Error purchasing product. Please try again.', 'error');
                } finally {
                    button.disabled = false;
                    button.textContent = 'Purchase';
                }
            });
        });
    }

    // Add notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Add animation class
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}); 