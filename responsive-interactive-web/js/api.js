// =============================
// 🌐 API Utility Functions
// =============================

class APIManager {
  constructor() {
    this.baseURL = '/api';
    this.token = localStorage.getItem('travila_token');
  }

  // Update token when user logs in/out
  updateToken(token) {
    this.token = token;
  }

  // Generic API call method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // =============================
  // 🏠 Homepage API Methods
  // =============================

  // Get featured tours
  async getFeaturedTours(limit = 6) {
    return this.get('/tours/featured', { limit });
  }

  // Get top-rated hotels
  async getTopRatedHotels(limit = 10) {
    return this.get('/hotels/top-rated', { limit });
  }

  // Get recent cars
  async getRecentCars(limit = 8) {
    return this.get('/cars/recent', { limit });
  }

  // Get popular categories
  async getPopularCategories(limit = 8) {
    return this.get('/categories/popular', { limit });
  }

  // Search content
  async search(query, types = ['tours', 'hotels', 'cars'], limit = 20) {
    return this.post('/search', { q: query, types, limit });
  }

  // Get search suggestions
  async getSearchSuggestions(query, limit = 5) {
    return this.get('/search/suggestions', { q: query, limit });
  }

  // Get search filters
  async getSearchFilters() {
    return this.get('/search/filters');
  }

  // =============================
  // 🔐 Authentication API Methods
  // =============================

  // Login
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.success) {
      this.updateToken(response.data.token);
    }
    return response;
  }

  // Register
  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.success) {
      this.updateToken(response.data.token);
    }
    return response;
  }

  // Logout
  async logout() {
    const response = await this.post('/auth/logout');
    this.updateToken(null);
    return response;
  }

  // Get current user
  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // Update profile
  async updateProfile(profileData) {
    return this.put('/auth/profile', profileData);
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    return this.put('/auth/password', { currentPassword, newPassword });
  }

  // =============================
  // 📊 Content API Methods
  // =============================

  // Get tours
  async getTours(params = {}) {
    return this.get('/tours', params);
  }

  // Get tour by ID
  async getTour(id) {
    return this.get(`/tours/${id}`);
  }

  // Get hotels
  async getHotels(params = {}) {
    return this.get('/hotels', params);
  }

  // Get hotel by ID
  async getHotel(id) {
    return this.get(`/hotels/${id}`);
  }

  // Get cars
  async getCars(params = {}) {
    return this.get('/cars', params);
  }

  // Get car by ID
  async getCar(id) {
    return this.get(`/cars/${id}`);
  }

  // Get activities
  async getActivities(params = {}) {
    return this.get('/activities', params);
  }

  // Get tickets
  async getTickets(params = {}) {
    return this.get('/tickets', params);
  }

  // =============================
  // 📝 User Actions API Methods
  // =============================

  // Add to wishlist
  async addToWishlist(itemId) {
    return this.post('/users/wishlist', { itemId });
  }

  // Remove from wishlist
  async removeFromWishlist(itemId) {
    return this.delete(`/users/wishlist/${itemId}`);
  }

  // Get wishlist
  async getWishlist() {
    return this.get('/users/wishlist');
  }

  // Create booking
  async createBooking(bookingData) {
    return this.post('/bookings', bookingData);
  }

  // Get user bookings
  async getUserBookings(params = {}) {
    return this.get('/bookings', params);
  }

  // Get booking by ID
  async getBooking(id) {
    return this.get(`/bookings/${id}`);
  }

  // Cancel booking
  async cancelBooking(id) {
    return this.put(`/bookings/${id}/cancel`);
  }

  // Create review
  async createReview(reviewData) {
    return this.post('/reviews', reviewData);
  }

  // Get reviews for item
  async getReviews(itemType, itemId, params = {}) {
    return this.get(`/reviews/${itemType}/${itemId}`, params);
  }

  // Mark review as helpful
  async markReviewHelpful(reviewId) {
    return this.post(`/reviews/${reviewId}/helpful`);
  }

  // =============================
  // 🛠️ Utility Methods
  // =============================

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Clear token (for logout)
  clearToken() {
    this.token = null;
    localStorage.removeItem('travila_token');
  }

  // Handle API errors
  handleError(error) {
    console.error('API Error:', error);
    
    // Show user-friendly error message
    if (error.message.includes('401')) {
      this.clearToken();
      window.location.reload();
    }
    
    return {
      success: false,
      message: error.message || 'An error occurred. Please try again.'
    };
  }
}

// Create global API manager instance
const apiManager = new APIManager();

// Make it globally available
window.apiManager = apiManager;

// Update token when auth state changes
document.addEventListener('DOMContentLoaded', () => {
  // Listen for auth state changes
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (key === 'travila_token') {
      apiManager.updateToken(value);
    }
  };

  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function(key) {
    originalRemoveItem.apply(this, arguments);
    if (key === 'travila_token') {
      apiManager.clearToken();
    }
  };
});
