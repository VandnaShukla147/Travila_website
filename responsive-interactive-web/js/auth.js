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
      
      // Remove existing modal if any
      const existingModal = document.getElementById('authModal');
      if (existingModal) {
        existingModal.remove();
      }
      
      // Add modal to body
      document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
      console.error('Failed to load auth modal:', error);
    }
  }

  bindEvents() {
    // Sign in button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'signInBtn') {
        this.showAuthModal('login');
      }
    });

    // Modal events
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('#closeAuthModal');
      if (closeBtn || e.target.id === 'authModal') {
        this.hideAuthModal();
      }
    });

    // Tab switching
    document.addEventListener('click', (e) => {
      if (e.target.id === 'loginTab') {
        this.switchTab('login');
      } else if (e.target.id === 'signupTab') {
        this.switchTab('signup');
      }
    });

    // Password visibility toggles
    document.addEventListener('click', (e) => {
      if (e.target.id === 'toggleLoginPassword') {
        this.togglePasswordVisibility('loginPassword');
      } else if (e.target.id === 'toggleSignupPassword') {
        this.togglePasswordVisibility('signupPassword');
      } else if (e.target.id === 'toggleSignupConfirmPassword') {
        this.togglePasswordVisibility('signupConfirmPassword');
      }
    });

    // Form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'loginForm') {
        e.preventDefault();
        this.handleLogin(e.target);
      } else if (e.target.id === 'signupForm') {
        e.preventDefault();
        this.handleSignup(e.target);
      }
    });

    // Real-time validation
    document.addEventListener('input', (e) => {
      if (e.target.name === 'email') {
        this.validateEmail(e.target);
      } else if (e.target.name === 'password') {
        this.validatePassword(e.target);
      } else if (e.target.name === 'confirmPassword') {
        this.validateConfirmPassword(e.target);
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
    const modalTitle = document.querySelector('h2#authModalTitle');
    const modalSubtitle = modalTitle?.nextElementSibling;

    if (tab === 'login') {
      loginTab.classList.add('bg-white', 'text-gray-900');
      loginTab.classList.remove('text-gray-500');
      signupTab.classList.remove('bg-white', 'text-gray-900');
      signupTab.classList.add('text-gray-500');
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
      
      if (modalTitle) modalTitle.textContent = 'Welcome Back';
      if (modalSubtitle && modalSubtitle.tagName === 'P') modalSubtitle.textContent = 'Sign in to continue your journey';
    } else {
      signupTab.classList.add('bg-white', 'text-gray-900');
      signupTab.classList.remove('text-gray-500');
      loginTab.classList.remove('bg-white', 'text-gray-900');
      loginTab.classList.add('text-gray-500');
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      
      if (modalTitle) modalTitle.textContent = 'Create Account';
      if (modalSubtitle && modalSubtitle.tagName === 'P') modalSubtitle.textContent = 'Join Travila and start exploring';
    }
  }

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(`toggle${inputId.charAt(0).toUpperCase() + inputId.slice(1)}`);
    
    if (input.type === 'password') {
      input.type = 'text';
      button.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
        </svg>
      `;
    } else {
      input.type = 'password';
      button.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
      `;
    }
  }

  async handleLogin(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Clear previous errors
    this.clearErrors('login');

    // Validate form
    if (!this.validateLoginForm(data)) {
      return;
    }

    this.setLoading('login', true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        this.token = result.data.token;
        this.currentUser = result.data.user;
        localStorage.setItem('travila_token', this.token);
        this.updateUI();
        this.hideAuthModal();
        this.showMessage('success', 'Welcome back! You have been successfully logged in.');
      } else {
        this.showMessage('error', result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showMessage('error', 'Network error. Please check your connection and try again.');
    } finally {
      this.setLoading('login', false);
    }
  }

  async handleSignup(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Clear previous errors
    this.clearErrors('signup');

    // Validate form
    if (!this.validateSignupForm(data)) {
      return;
    }

    this.setLoading('signup', true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
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
        this.showMessage('success', 'Account created successfully! Welcome to Travila.');
      } else {
        this.showMessage('error', result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      this.showMessage('error', 'Network error. Please check your connection and try again.');
    } finally {
      this.setLoading('signup', false);
    }
  }

  validateLoginForm(data) {
    let isValid = true;

    if (!data.email) {
      this.showError('loginEmailError', 'Email is required');
      isValid = false;
    } else if (!this.isValidEmail(data.email)) {
      this.showError('loginEmailError', 'Please enter a valid email address');
      isValid = false;
    }

    if (!data.password) {
      this.showError('loginPasswordError', 'Password is required');
      isValid = false;
    }

    return isValid;
  }

  validateSignupForm(data) {
    let isValid = true;

    if (!data.firstName) {
      this.showError('signupFirstNameError', 'First name is required');
      isValid = false;
    }

    if (!data.lastName) {
      this.showError('signupLastNameError', 'Last name is required');
      isValid = false;
    }

    if (!data.email) {
      this.showError('signupEmailError', 'Email is required');
      isValid = false;
    } else if (!this.isValidEmail(data.email)) {
      this.showError('signupEmailError', 'Please enter a valid email address');
      isValid = false;
    }

    if (!data.password) {
      this.showError('signupPasswordError', 'Password is required');
      isValid = false;
    } else if (!this.isValidPassword(data.password)) {
      this.showError('signupPasswordError', 'Password must be at least 6 characters with uppercase, lowercase, and number');
      isValid = false;
    }

    if (!data.confirmPassword) {
      this.showError('signupConfirmPasswordError', 'Please confirm your password');
      isValid = false;
    } else if (data.password !== data.confirmPassword) {
      this.showError('signupConfirmPasswordError', 'Passwords do not match');
      isValid = false;
    }

    if (!data.agreeTerms) {
      this.showError('signupTermsError', 'You must agree to the terms and conditions');
      isValid = false;
    }

    return isValid;
  }

  validateEmail(input) {
    const email = input.value;
    const errorElement = document.getElementById(input.name === 'email' ? 
      (input.id.includes('login') ? 'loginEmailError' : 'signupEmailError') : '');
    
    if (email && !this.isValidEmail(email)) {
      this.showError(errorElement.id, 'Please enter a valid email address');
    } else {
      this.hideError(errorElement.id);
    }
  }

  validatePassword(input) {
    const password = input.value;
    const errorElement = document.getElementById(input.id + 'Error');
    
    if (password && !this.isValidPassword(password)) {
      this.showError(errorElement.id, 'Password must be at least 6 characters with uppercase, lowercase, and number');
    } else {
      this.hideError(errorElement.id);
    }
  }

  validateConfirmPassword(input) {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = input.value;
    const errorElement = document.getElementById('signupConfirmPasswordError');
    
    if (confirmPassword && password !== confirmPassword) {
      this.showError(errorElement.id, 'Passwords do not match');
    } else {
      this.hideError(errorElement.id);
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPassword(password) {
    return password.length >= 6 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
  }

  showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }
  }

  hideError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.classList.add('hidden');
    }
  }

  clearErrors(formType) {
    const errorElements = document.querySelectorAll(`#${formType}Form [id$="Error"]`);
    errorElements.forEach(element => {
      element.classList.add('hidden');
    });
  }

  setLoading(formType, isLoading) {
    const submitBtn = document.getElementById(`${formType}SubmitBtn`);
    const btnText = document.getElementById(`${formType}BtnText`);
    const spinner = document.getElementById(`${formType}Spinner`);

    if (isLoading) {
      submitBtn.disabled = true;
      btnText.classList.add('hidden');
      spinner.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      btnText.classList.remove('hidden');
      spinner.classList.add('hidden');
    }
  }

  showMessage(type, message) {
    const messageElement = document.getElementById('authMessage');
    const contentElement = document.getElementById('authMessageContent');
    
    if (messageElement && contentElement) {
      messageElement.classList.remove('hidden');
      contentElement.className = `p-3 rounded-lg ${
        type === 'success' 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`;
      contentElement.textContent = message;
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        messageElement.classList.add('hidden');
      }, 5000);
    }
  }

  clearForms() {
    // Clear login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();

    // Clear signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.reset();

    // Clear all errors
    this.clearErrors('login');
    this.clearErrors('signup');

    // Hide messages
    const messageElement = document.getElementById('authMessage');
    if (messageElement) messageElement.classList.add('hidden');
  }

  async checkAuthStatus() {
    if (this.token) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
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
          <div class="flex items-center space-x-2 cursor-pointer relative">
            <img src="${this.currentUser.profile.avatar}" alt="Avatar" class="w-6 h-6 rounded-full">
            <span>${this.currentUser.profile.firstName}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        `;
        signInBtn.className = 'relative px-4 py-2 border rounded-full hover:bg-gray-100 font-medium text-sm';
        signInBtn.style.position = 'relative';
        signInBtn.style.cssText = 'position: relative;';
        signInBtn.onclick = (e) => {
          e.stopPropagation();
          this.showUserMenu();
        };
      } else {
        signInBtn.innerHTML = 'Sign in';
        signInBtn.className = 'px-4 py-2 border rounded-full hover:bg-gray-100 font-medium text-sm';
        signInBtn.onclick = () => this.showAuthModal('login');
      }
    }
  }

  showUserMenu() {
    // Create user dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'absolute right-0 mt-2 w-56 bg-white shadow-2xl border border-gray-100 z-50 overflow-hidden';
    dropdown.innerHTML = `
      <div class="py-2">
        <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div class="flex items-center space-x-3">
            <img src="${this.currentUser.profile.avatar}" alt="Avatar" class="w-10 h-10 rounded-full object-cover">
            <div>
              <p class="text-sm font-semibold text-gray-900">${this.currentUser.profile.firstName} ${this.currentUser.profile.lastName}</p>
              <p class="text-xs text-gray-500">${this.currentUser.email}</p>
            </div>
          </div>
        </div>
        <div class="py-2">
          <a href="#" class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            My Profile
          </a>
          <a href="#" class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            My Bookings
          </a>
          <a href="#" class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            Wishlist
          </a>
          <a href="#" class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <svg class="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Settings
          </a>
        </div>
        <div class="border-t border-gray-100 mt-2 pt-2">
          <button onclick="authManager.logout()" class="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    `;

    // Position dropdown
    const signInBtn = document.getElementById('signInBtn');
    const rect = signInBtn.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${rect.bottom + 8}px`;
    dropdown.style.right = `${window.innerWidth - rect.right}px`;
    dropdown.style.minWidth = '224px';

    // Remove existing dropdown
    const existingDropdown = document.querySelector('.user-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }

    dropdown.classList.add('user-dropdown');
    document.body.appendChild(dropdown);

    // Close dropdown when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target) && e.target !== signInBtn) {
          dropdown.remove();
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 0);
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('travila_token');
    this.updateUI();
    this.showMessage('success', 'You have been logged out successfully.');
  }
}

// Initialize auth manager when DOM is loaded
let authManager;
document.addEventListener('DOMContentLoaded', () => {
  authManager = new AuthManager();
});

// Make authManager globally available
window.authManager = authManager;