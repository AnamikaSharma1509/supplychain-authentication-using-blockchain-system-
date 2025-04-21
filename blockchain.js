// Blockchain Interaction Module
const BlockchainService = {
    // API base URL
    baseUrl: '/api/blockchain',
    
    // Get authentication token from localStorage
    getToken() {
        return localStorage.getItem('token');
    },
    
    // Get current user from localStorage
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    },
    
    // Redirect to login if not authenticated
    checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/index.html';
            return false;
        }
        return true;
    },
    
    // Add a new product (Manufacturer only)
    async addProduct(productData) {
        if (!this.checkAuth()) return null;
        
        try {
            const response = await fetch(`${this.baseUrl}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(productData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to add product');
            }
            
            return result;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    },
    
    // Get all products
    async getAllProducts() {
        if (!this.checkAuth()) return [];
        
        try {
            const response = await fetch(`${this.baseUrl}/products`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch products');
            }
            
            return result;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },
    
    // Get a specific product by ID
    async getProduct(productId) {
        if (!this.checkAuth()) return null;
        
        try {
            const response = await fetch(`${this.baseUrl}/products/${productId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch product');
            }
            
            return result;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },
    
    // Get product history
    async getProductHistory(productId) {
        if (!this.checkAuth()) return [];
        
        try {
            const response = await fetch(`${this.baseUrl}/products/${productId}/history`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch product history');
            }
            
            return result;
        } catch (error) {
            console.error('Error fetching product history:', error);
            throw error;
        }
    },
    
    // Transfer product ownership
    async transferProduct(transferData) {
        if (!this.checkAuth()) return null;
        
        try {
            const response = await fetch(`${this.baseUrl}/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(transferData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to transfer product');
            }
            
            return result;
        } catch (error) {
            console.error('Error transferring product:', error);
            throw error;
        }
    },
    
    // Verify QR code (public endpoint, no auth required)
    async verifyQRCode(qrCode) {
        try {
            const response = await fetch(`${this.baseUrl}/verify/${qrCode}`, {
                method: 'GET'
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to verify QR code');
            }
            
            return result;
        } catch (error) {
            console.error('Error verifying QR code:', error);
            throw error;
        }
    },
    
    // Generate QR code for a product
    generateQRCode(productId, qrCodeHash) {
        // This is a placeholder for QR code generation
        // In a real implementation, you would use a QR code library
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrCodeHash}`;
    },
    
    // Logout function
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    }
};

// Export the service
window.BlockchainService = BlockchainService; 