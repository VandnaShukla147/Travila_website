// =============================
// 🌐 API Utility Functions
// =============================

class APIManager {
  constructor() {
    this.baseURL = '/api';
    this.token = localStorage.getItem('travila_token');
  }

  updateToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

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

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async getFeaturedTours(limit = 6) {
    return this.get('/tours/featured', { limit });
  }

  async getTopRatedHotels(limit = 10) {
    return this.get('/hotels/top-rated', { limit });
  }

  async getRecentCars(limit = 8) {
    return this.get('/cars/recent', { limit });
  }

  async getPopularCategories(limit = 8) {
    return this.get('/categories/popular', { limit });
  }

  async search(query, types = ['tours', 'hotels', 'cars'], limit = 20) {
    return this.post('/search', { q: query, types, limit });
  }

  async getSearchSuggestions(query, limit = 5) {
    return this.get('/search/suggestions', { q: query, limit });
  }

  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.success) {
      this.updateToken(response.data.token);
    }
    return response;
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.success) {
      this.updateToken(response.data.token);
    }
    return response;
  }

  async logout() {
    const response = await this.post('/auth/logout');
    this.updateToken(null);
    return response;
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  isAuthenticated() {
    return !!this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('travila_token');
  }

  handleError(error) {
    console.error('API Error:', error);
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

const apiManager = new APIManager();
window.apiManager = apiManager;

document.addEventListener('DOMContentLoaded', () => {
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

// =============================
// 🔐 Authentication System
// =============================

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.token = localStorage.getItem('travila_token');
    this.init();
  }

  init() {
    this.loadAuthModal();
    this.bindEvents();
    this.checkAuthStatus();
  }

  async loadAuthModal() {
    try {
      const response = await fetch('./partials/auth-modal.html');
      const html = await response.text();
      
      const existingModal = document.getElementById('authModal');
      if (existingModal) {
        existingModal.remove();
      }
      
      document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
      console.error('Failed to load auth modal:', error);
    }
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'signInBtn') {
        this.showAuthModal('login');
      }
    });

    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('#closeAuthModal');
      if (closeBtn || e.target.id === 'authModal') {
        this.hideAuthModal();
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.id === 'loginTab') {
        this.switchTab('login');
      } else if (e.target.id === 'signupTab') {
        this.switchTab('signup');
      }
    });

    document.addEventListener('submit', (e) => {
      if (e.target.id === 'loginForm') {
        e.preventDefault();
        this.handleLogin(e.target);
      } else if (e.target.id === 'signupForm') {
        e.preventDefault();
        this.handleSignup(e.target);
      }
    });
  }

  showAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.remove('hidden');
      this.switchTab(tab);
    }
  }

  hideAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.add('hidden');
      this.clearForms();
    }
  }

  switchTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (tab === 'login') {
      loginTab.classList.add('bg-white', 'text-gray-900');
      loginTab.classList.remove('text-gray-500');
      signupTab.classList.remove('bg-white', 'text-gray-900');
      signupTab.classList.add('text-gray-500');
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
    } else {
      signupTab.classList.add('bg-white', 'text-gray-900');
      signupTab.classList.remove('text-gray-500');
      loginTab.classList.remove('bg-white', 'text-gray-900');
      loginTab.classList.add('text-gray-500');
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    }
  }

  async handleLogin(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.email || !data.password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        this.token = result.data.token;
        this.currentUser = result.data.user;
        localStorage.setItem('travila_token', this.token);
        this.updateUI();
        this.hideAuthModal();
        alert('Welcome back!');
      } else {
        alert(result.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please try again.');
    }
  }

  async handleSignup(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.email || !data.password || !data.firstName) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          profile: {
            firstName: data.firstName,
            lastName: data.lastName || '',
            phone: data.phone || ''
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        this.token = result.data.token;
        this.currentUser = result.data.user;
        localStorage.setItem('travila_token', this.token);
        this.updateUI();
        this.hideAuthModal();
        alert('Account created successfully!');
      } else {
        alert(result.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Network error. Please try again.');
    }
  }

  clearForms() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.reset();
  }

  async checkAuthStatus() {
    if (this.token) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });

        if (response.ok) {
          const result = await response.json();
          this.currentUser = result.data.user;
          this.updateUI();
        } else {
          this.logout();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        this.logout();
      }
    }
  }

  updateUI() {
    const signInBtn = document.getElementById('signInBtn');
    if (signInBtn) {
      if (this.currentUser) {
        signInBtn.innerHTML = `
          <div class="flex items-center space-x-2">
            <img src="${this.currentUser.profile.avatar}" alt="Avatar" class="w-6 h-6 rounded-full">
            <span>${this.currentUser.profile.firstName}</span>
          </div>
        `;
        signInBtn.className = 'relative px-4 py-2 border rounded-full hover:bg-gray-100 font-medium text-sm';
      } else {
        signInBtn.innerHTML = 'Sign in';
        signInBtn.className = 'px-4 py-2 border rounded-full hover:bg-gray-100 font-medium text-sm';
      }
    }
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('travila_token');
    this.updateUI();
  }
}

let authManager;
document.addEventListener('DOMContentLoaded', () => {
  authManager = new AuthManager();
});

window.authManager = authManager;

// =============================
// 📦 Load Partials Dynamically
// =============================

async function loadPartial(targetId, fileName) {
  const response = await fetch(`./partials/${fileName}`);
  const html = await response.text();
  document.getElementById(targetId).innerHTML = html;
}

Promise.all([
  loadPartial('header', 'header.html'),
  loadPartial('hero-tours', 'hero-tours.html'),
  loadPartial('top-categories', 'top-categories.html'),
  loadPartial('top-rated-hotels', 'top-rated-hotels.html'),
  loadPartial('sections', 'sections.html'),
  loadPartial('news-tips-guide', 'news-tips.html'),
  loadPartial('testimonials', 'testimonials.html'),
  loadPartial('faq', 'faq.html'),
  loadPartial('recent-cars', 'recent-cars.html'),
  loadPartial('footer', 'footer.html')
]).then(async () => {
  console.log('✅ All partials loaded successfully');

  const searchBoxContainer = document.getElementById('search-box-container');
  if (searchBoxContainer) {
    const response = await fetch('./partials/search-box.html');
    searchBoxContainer.innerHTML = await response.text();
  }

  const menuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  initHotelCarousel();

  function initializeHomepageFeatures() {
    try {
      if (typeof window.initializeHomepage === 'function') {
        window.initializeHomepage();
      } else if (typeof HomepageManager !== 'undefined') {
        window.homepageManager = new HomepageManager();
      }
    } catch (err) {
      console.error('Failed to initialize homepage features:', err);
    }
  }

  initializeHomepageFeatures();

  try {
    const news = document.getElementById('news-tips-guide');
    const footer = document.getElementById('footer');
    if (news && footer && footer.parentNode) {
      footer.parentNode.insertBefore(news, footer);
    }
  } catch (e) {
    console.warn('Could not move News, Tips & Guide:', e);
  }
});

function initHotelCarousel() {
  const root = document.querySelector('[data-carousel="hotels"]');
  if (!root) return;

  const track = root.querySelector('[data-track]');
  const prev = root.closest('section').querySelector('[data-prev]');
  const next = root.closest('section').querySelector('[data-next]');
  if (!track || !prev || !next) return;

  const card = track.querySelector('.min-w-[360px]');
  const cardWidth = card.getBoundingClientRect().width + 32;
  const cards = Array.from(track.children);

  cards.forEach(c => track.appendChild(c.cloneNode(true)));

  let position = 0;
  const total = track.children.length;

  function scrollToPosition(smooth = true) {
    track.scrollTo({
      left: position * cardWidth,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  next.addEventListener('click', () => {
    position++;
    scrollToPosition();
    if (position >= total / 2) {
      setTimeout(() => {
        position = 0;
        scrollToPosition(false);
      }, 400);
    }
  });

  prev.addEventListener('click', () => {
    position--;
    if (position < 0) {
      position = total / 2 - 1;
      scrollToPosition(false);
    } else {
      scrollToPosition();
    }
  });
}
