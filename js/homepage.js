// =============================
// 🏠 Homepage Functionality
// =============================

class HomepageManager {
  constructor() {
    this.currentSlide = 0;
    this.slides = [];
    this.searchResults = [];
    this.currentTab = 'tours';
    this.init();
  }

  init() {
    this.loadContent();
    this.bindEvents();
    this.initializeSliders();
    this.initializeSearch();
    this.initializeKeyboardNavigation();
    this.initializeTestimonials();
    this.initializeAccordion();
    this.initializeNavbarDropdowns();
    // Ensure any previously rendered blog section is removed
    this.removeBlogSection();
  }

  // =============================
  // 📊 Load Dynamic Content
  // =============================
  async loadContent() {
    try {
      // Load featured tours
      await this.loadFeaturedTours();
      
      // Load top-rated hotels
      await this.loadTopRatedHotels();
      
      // Load recent cars
      await this.loadRecentCars();
      
      // Load categories
      await this.loadCategories();
      
      console.log('✅ All content loaded successfully');
    } catch (error) {
      console.error('❌ Error loading content:', error);
    }
  }

  async loadFeaturedTours() {
    try {
      const data = await apiManager.getFeaturedTours(6);
      if (data.success) {
        this.renderTours(data.data.tours, 'featured-tours');
      }
    } catch (error) {
      console.error('Error loading featured tours:', error);
      // Fallback to static content
    }
  }

  async loadTopRatedHotels() {
    try {
      const data = await apiManager.getTopRatedHotels(10);
      if (data.success) {
        this.renderHotels(data.data.hotels, 'top-rated-hotels');
      }
    } catch (error) {
      console.error('Error loading top-rated hotels:', error);
    }
  }

  async loadRecentCars() {
    try {
      const data = await apiManager.getRecentCars(8);
      if (data.success) {
        this.renderCars(data.data.cars, 'recent-cars');
      }
    } catch (error) {
      console.error('Error loading recent cars:', error);
    }
  }

  async loadCategories() {
    try {
      const data = await apiManager.getPopularCategories(8);
      if (data.success) {
        this.renderCategories(data.data.categories, 'top-categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async loadBlogPosts() {
    try {
      // Simulate blog posts data
      const blogPosts = [
        {
          id: 1,
          title: "10 Must-Visit Destinations in 2024",
          excerpt: "Discover the most breathtaking destinations that should be on your travel bucket list this year.",
          image: "assets/images/california_sunset.png",
          author: "Travel Expert",
          date: "2024-01-15",
          category: "Travel Tips"
        },
        {
          id: 2,
          title: "Budget Travel: How to Explore the World for Less",
          excerpt: "Learn insider tips and tricks to make your dream vacation affordable without compromising on experience.",
          image: "assets/images/grand_canyon.png",
          author: "Budget Traveler",
          date: "2024-01-12",
          category: "Budget Travel"
        },
        {
          id: 3,
          title: "Solo Travel Safety: Essential Guide for Women",
          excerpt: "Comprehensive safety tips and advice for women embarking on solo adventures around the world.",
          image: "assets/images/nyc_food.png",
          author: "Solo Traveler",
          date: "2024-01-10",
          category: "Safety"
        }
      ];
      // Blog section disabled: no rendering
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  }

  // =============================
  // 🎨 Render Components
  // =============================
  renderTours(tours, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const toursGrid = container.querySelector('.grid');
    if (!toursGrid) return;

    toursGrid.innerHTML = tours.map((tour, index) => {
      // Determine badge color based on badge type
      let badgeColor = 'text-yellow-500';
      if (tour.rating.badge === 'Best Value') badgeColor = 'text-green-500';
      else if (tour.rating.badge === 'New') badgeColor = 'text-orange-500';

      // Determine margin classes based on position
      let marginClasses = '';
      if (index === 0) marginClasses = 'lg:-ml-10';
      else if (index === 1) marginClasses = 'lg:-mr-4 lg:-ml-4';
      else if (index === 2) marginClasses = 'lg:-mr-4';

      return `
        <div class="relative rounded-2xl overflow-visible hover:shadow-2xl transition ${marginClasses}">
          <div class="relative rounded-2xl overflow-hidden pb-28">
            <img src="${tour.image}" alt="${tour.title}" class="w-full h-[320px] object-cover rounded-2xl">
            
            <div class="absolute top-3 left-3 bg-white ${badgeColor} text-xs font-semibold px-3 py-1 rounded-full shadow">
              ${tour.rating.badge || 'Featured'}
            </div>
            
            <button class="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:scale-105 transition" onclick="homepageManager.toggleWishlist('${tour._id}')">
              <img src="assets/images/heart.png" alt="Favorite" class="h-4 w-4">
            </button>

            <div class="absolute bottom-0 left-0 right-0 bg-white rounded-2xl p-7 shadow-xl border-b-4 border-l-2 border-r-2 border-gray-300 min-h-[200px]">
              <img src="assets/images/rating1.png" alt="Rating" class="absolute -top-4 right-4 h-9 w-auto drop-shadow-md">

              <h3 class="text-lg font-semibold leading-snug">${tour.title}</h3>
              <div class="mt-3 flex items-center text-gray-500 text-sm gap-6">
                <div class="flex items-center gap-2">
                  <img src="assets/images/duration.png" class="h-4 w-4" alt="Duration">
                  <span>${tour.duration.days} days ${tour.duration.nights} nights</span>
                </div>
                <div class="flex items-center gap-2">
                  <img src="assets/images/user.png" class="h-4 w-4" alt="Guests">
                  <span>4-6 guest</span>
                </div>
              </div>
              <div class="mt-5 flex items-center justify-between">
                <p class="text-lg font-bold">$${tour.price.amount} <span class="text-sm font-normal text-gray-500">/ person</span></p>
                <button class="px-4 py-2 bg-gray-600/30 text-white text-sm rounded-full hover:bg-gray-600/50 transition" onclick="homepageManager.bookTour('${tour._id}')">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderHotels(hotels, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const carousel = container.querySelector('#carousel');
    if (!carousel) return;

    carousel.innerHTML = hotels.map(hotel => `
      <div class="min-w-[350px] max-w-[350px] snap-start shrink-0">
        <div class="relative rounded-3xl overflow-visible hover:shadow-2xl transition">
          <div class="relative rounded-3xl overflow-hidden pb-32">
            <img src="${hotel.images.main}" alt="${hotel.name}" class="w-full h-[280px] object-cover rounded-3xl">
            
            <button class="absolute top-4 right-4 bg-white rounded-full p-2.5 shadow-lg hover:scale-110 transition" onclick="homepageManager.toggleWishlist('${hotel._id}')">
              <svg class="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>

            <div class="absolute top-[240px] right-5 bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <span class="text-yellow-500">⭐</span>
              <span class="text-sm font-bold">${hotel.rating.score}</span>
              <span class="text-xs text-gray-500">(${hotel.rating.reviews} reviews)</span>
            </div>

            <div class="absolute bottom-0 left-0 right-0 bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-300">
              <h3 class="text-xl font-bold leading-tight mb-2">${hotel.name}</h3>
              
              <div class="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>${hotel.location.city}, ${hotel.location.country}</span>
              </div>

              <div class="flex gap-0.5 mb-4">
                <span class="text-black text-lg">${'★'.repeat(hotel.rating.stars)}</span>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="text-2xl font-bold">$${hotel.price.perNight} <span class="text-sm font-normal text-gray-500">/ night</span></p>
                </div>
                <button class="px-6 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition font-semibold" onclick="homepageManager.bookHotel('${hotel._id}')">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderCars(cars, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const carsGrid = container.querySelector('.grid');
    if (!carsGrid) return;

    carsGrid.innerHTML = cars.map(car => `
      <div class="relative rounded-2xl overflow-visible hover:shadow-2xl transition">
        <div class="relative rounded-2xl overflow-hidden pb-28">
          <img src="${car.image}" alt="${car.brand} ${car.model}" class="w-full h-[320px] object-cover rounded-2xl">
          <button class="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:scale-105 transition" onclick="homepageManager.toggleWishlist('${car._id}')">
            <img src="assets/images/heart.png" class="h-4 w-4" alt="heart">
          </button>

          <div class="absolute -bottom-8 left-5">
            <img src="assets/images/rating1.png" alt="Rating" class="h-6 w-auto object-contain drop-shadow-lg">
          </div>

          <div class="absolute -bottom-16 left-0 right-0 bg-white rounded-2xl p-6 shadow-xl border-b-4 border-l-2 border-r-2 border-gray-300 min-h-[180px]">
            <h3 class="text-lg font-semibold mb-1 mt-4">${car.brand} ${car.model}</h3>
            <p class="text-gray-500 text-sm mb-3 flex items-center gap-1">
              <img src="assets/images/location.png" class="h-4 w-4" alt="Location">
              ${car.location.city}, ${car.location.country}
            </p>
            <div class="grid grid-cols-2 gap-3 mb-3 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <img src="assets/images/mile.png" class="h-4 w-4" alt="Mileage">
                <span>${car.specifications.mileage.toLocaleString()} miles</span>
              </div>
              <div class="flex items-center gap-2">
                <img src="assets/images/automatic.png" class="h-4 w-4" alt="Transmission">
                <span>${car.specifications.transmission}</span>
              </div>
              <div class="flex items-center gap-2">
                <img src="assets/images/fuel.png" class="h-4 w-4" alt="Fuel">
                <span>${car.specifications.fuelType}</span>
              </div>
              <div class="flex items-center gap-2">
                <img src="assets/images/seat.png" class="h-4 w-4" alt="Seats">
                <span>${car.specifications.seats} seats</span>
              </div>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-gray-200">
              <div>
                <span class="text-xl font-bold">$${car.price.amount}</span>
                <span class="text-gray-500 text-sm"> / ${car.price.per}</span>
              </div>
              <button class="px-5 py-2 bg-gray-600/30 text-white text-sm font-medium rounded-full hover:bg-gray-600/50 transition" onclick="homepageManager.bookCar('${car._id}')">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderCategories(categories, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const categoriesGrid = container.querySelector('.grid');
    if (!categoriesGrid) return;

    // Create the correct HTML structure to match the design
    categoriesGrid.innerHTML = categories.map((category, index) => {
      // Determine the margin classes based on position
      let marginClasses = '';
      if (index === 0 || index === 4) marginClasses = 'lg:-ml-10 lg:-mr-2';
      else if (index === 3 || index === 7) marginClasses = 'lg:-mr-4 lg:-ml-2';
      else marginClasses = 'lg:-ml-2 lg:-mr-2';

      return `
        <div class="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition hover:-translate-y-1 cursor-pointer ${marginClasses}" onclick="homepageManager.filterByCategory('${category.slug}')">
          <img src="${category.image}" alt="${category.name}" class="w-full h-40 object-cover rounded-xl mb-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-base">${category.name}</h3>
              <p class="text-gray-500 text-sm">${category.stats.tours} Tours, ${category.stats.activities} Activities</p>
            </div>
            <img src="assets/images/rightarrow.png" alt="Arrow" class="h-4 w-auto opacity-80">
          </div>
        </div>
      `;
    }).join('');
  }

  renderBlogPosts(posts, containerId) {
    // Blog section disabled: do nothing
  }

  removeBlogSection() {
    const blogSection = document.getElementById('blog-posts');
    if (blogSection && blogSection.parentNode) {
      blogSection.parentNode.removeChild(blogSection);
    }
  }

  // =============================
  // 🎠 Slider Functionality
  // =============================
  initializeSliders() {
    this.initializeHeroSlider();
    this.initializeHotelCarousel();
    this.initializeCarCarousel();
  }

  initializeHeroSlider() {
    const heroSection = document.querySelector('section[style*="background-image"]');
    if (!heroSection) {
      console.log('Hero section not found');
      return;
    }

  // Find arrows by explicit IDs from hero.html
  const leftArrow = document.getElementById('heroPrevBtn');
  const rightArrow = document.getElementById('heroNextBtn');
    const thumbnails = heroSection.querySelectorAll('img[src*="hero-thumb"]');

  console.log('Hero elements found:', { leftArrow: !!leftArrow, rightArrow: !!rightArrow, thumbnails: thumbnails.length });

    // Hero slide data
    this.heroSlides = [
      {
        background: "assets/images/Background.png",
        title: "Discover Amazing Places",
        subtitle: "Explore the world with our curated travel experiences"
      },
      {
        background: "assets/images/california_sunset.png",
        title: "California Sunset Adventures",
        subtitle: "Experience breathtaking sunsets along the California coast"
      },
      {
        background: "assets/images/grand_canyon.png",
        title: "Grand Canyon Wonders",
        subtitle: "Discover the awe-inspiring beauty of the Grand Canyon"
      }
    ];

    this.currentSlide = 0;
    console.log('Hero slides initialized:', this.heroSlides.length, 'slides');

    if (leftArrow) {
      leftArrow.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Left arrow clicked');
        this.previousHeroSlide();
      });
    }
    if (rightArrow) {
      rightArrow.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Right arrow clicked');
        this.nextHeroSlide();
      });
    }

    // Thumbnail navigation
    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => this.goToSlide(index));
    });

    // Auto-advance slides
    setInterval(() => this.nextHeroSlide(), 5000);
  }

  nextHeroSlide() {
    console.log('nextHeroSlide called, current slide:', this.currentSlide);
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
    console.log('New slide:', this.currentSlide);
    this.updateHeroSlide();
  }

  previousHeroSlide() {
    console.log('previousHeroSlide called, current slide:', this.currentSlide);
    this.currentSlide = (this.currentSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
    console.log('New slide:', this.currentSlide);
    this.updateHeroSlide();
  }

  goToSlide(index) {
    console.log('goToSlide called, index:', index);
    this.currentSlide = index;
    this.updateHeroSlide();
  }

  updateHeroSlide() {
    const heroSection = document.querySelector('section[style*="background-image"]');
    if (!heroSection || !this.heroSlides) {
      console.log('Hero section or slides not found');
      return;
    }

    const slide = this.heroSlides[this.currentSlide];
    console.log('Updating hero slide to:', slide.background);
    heroSection.style.backgroundImage = `url('${slide.background}')`;
    
    // Update thumbnails
    const thumbnails = heroSection.querySelectorAll('img[src*="hero-thumb"]');
    thumbnails.forEach((thumb, index) => {
      if (index === this.currentSlide) {
        thumb.classList.add('border-yellow-400', 'border-2');
      } else {
        thumb.classList.remove('border-yellow-400', 'border-2');
      }
    });
  }

  initializeHotelCarousel() {
    const carousel = document.getElementById('carousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!carousel || !prevBtn || !nextBtn) return;

    const cards = Array.from(carousel.children);
    if (cards.length === 0) return;

    // Clone cards for infinite loop
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      carousel.appendChild(clone);
    });

    const cardWidth = 350 + 24; // card width + gap
    let position = 0;
    const totalCards = cards.length;

    const updateCarousel = (smooth = true) => {
      carousel.scrollTo({
        left: position * cardWidth,
        behavior: smooth ? 'smooth' : 'auto'
      });
    };

    nextBtn.addEventListener('click', () => {
      position++;
      updateCarousel();
      
      // When reaching the end, jump back to start without smooth animation
      if (position >= totalCards) {
        setTimeout(() => {
          position = 0;
          updateCarousel(false);
        }, 400);
      }
    });

    prevBtn.addEventListener('click', () => {
      position--;
      
      if (position < 0) {
        position = totalCards - 1;
        // Jump to the cloned cards position
        carousel.scrollTo({
          left: totalCards * cardWidth,
          behavior: 'auto'
        });
        // Small delay then update to the actual position
        setTimeout(() => {
          position = totalCards - 1;
          updateCarousel(false);
        }, 10);
      } else {
        updateCarousel();
      }
    });
  }

  initializeCarCarousel() {
    const carSection = document.getElementById('recent-cars');
    if (!carSection) return;

    const prevBtn = document.getElementById('carPrevBtn');
    const nextBtn = document.getElementById('carNextBtn');
    const grid = document.getElementById('carsGrid');

    if (!prevBtn || !nextBtn || !grid) return;

    let currentIndex = 0;
    const itemsPerView = 4;

    const updateCarDisplay = () => {
      const items = grid.children;
      Array.from(items).forEach((item, index) => {
        if (index >= currentIndex && index < currentIndex + itemsPerView) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    };

    nextBtn.addEventListener('click', () => {
      const maxIndex = Math.max(0, grid.children.length - itemsPerView);
      currentIndex = Math.min(currentIndex + 1, maxIndex);
      updateCarDisplay();
    });

    prevBtn.addEventListener('click', () => {
      currentIndex = Math.max(0, currentIndex - 1);
      updateCarDisplay();
    });

    updateCarDisplay();
  }

  // =============================
  // 🔍 Search Functionality
  // =============================
  initializeSearch() {
    this.initializeSearchBox();
    this.initializeSearchSuggestions();
  }

  initializeSearchBox() {
    const searchBox = document.querySelector('#search-box-wrapper');
    if (!searchBox) {
      console.log('Search box not found');
      return;
    }

    // Tab switching
    const tabs = searchBox.querySelectorAll('button[class*="px-5 py-2"]');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchSearchTab(tab.textContent.trim());
      });
    });

    // Search button click handler
    const searchButton = searchBox.querySelector('button[class*="bg-black"]');
    
    if (searchButton) {
      searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.performSearch();
      });
    }

    // Make location, date, and guest fields clickable to modify
    this.makeSearchFieldsInteractive(searchBox);

    // Initialize enhanced dropdowns if present (partials inject markup but scripts don't auto-run)
    this.setupSearchDropdowns(searchBox);
  }

  makeSearchFieldsInteractive(searchBox) {
    // Make each field clickable (you can add date pickers, dropdowns etc later)
    const fields = searchBox.querySelectorAll('span[class*="text-gray-900"]');
    fields.forEach(field => {
      if (field.dataset.disableSuggestions === 'true') return; // skip when enhanced dropdowns are used
      field.addEventListener('click', (e) => {
        e.preventDefault();
        // For now, just log - you can implement date pickers, dropdowns etc
        console.log('Field clicked:', field.textContent.trim());
        // TODO: Implement interactive date picker, location selector, etc.
      });
    });
  }

  // Initialize the responsive dropdowns added in search-box.html (runs after partials load)
  setupSearchDropdowns(searchBox) {
    try {
      // Generic dropdown toggle using data-dropdown-toggle attribute
      const toggleButtons = searchBox.querySelectorAll('[data-dropdown-toggle]');
      if (!toggleButtons.length) return; // nothing to setup

      const closeAll = () => {
        ['locationDropdown','datesDropdown','guestsDropdown'].forEach(id => {
          const el = searchBox.querySelector('#' + id);
          if (el) el.classList.add('hidden');
        });
      };

      toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const target = btn.getAttribute('data-dropdown-toggle');
          const panel = searchBox.querySelector('#' + target + 'Dropdown');
          if (!panel) return;
          closeAll();
          // When opening dates, center on selected month if available
          if (target === 'dates') {
            if (startDate) {
              viewDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            } else if (endDate) {
              viewDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
            } else {
              viewDate = new Date();
              viewDate.setDate(1);
            }
            renderCalendars();
          }
          panel.classList.toggle('hidden');
        });
      });

      document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target)) closeAll();
      });

      // Location selection
      const locationValue = searchBox.querySelector('#locationValue');
      const locationDropdown = searchBox.querySelector('#locationDropdown');
      const locationInput = searchBox.querySelector('#locationInput');
      if (locationDropdown && locationValue) {
        locationDropdown.querySelectorAll('.city-option').forEach(btn => {
          btn.addEventListener('click', () => {
            locationValue.textContent = btn.textContent.trim();
            closeAll();
          });
        });
        if (locationInput) {
          locationInput.addEventListener('input', () => {
            const q = locationInput.value.toLowerCase();
            locationDropdown.querySelectorAll('.city-option').forEach(btn => {
              btn.classList.toggle('hidden', !btn.textContent.toLowerCase().includes(q));
            });
          });
        }
      }

      // Date range picker
      const datesDropdown = searchBox.querySelector('#datesDropdown');
      const calendars = searchBox.querySelector('#calendars');
      const prevMonthBtn = searchBox.querySelector('#prevMonth');
      const nextMonthBtn = searchBox.querySelector('#nextMonth');
      const clearDates = searchBox.querySelector('#clearDates');
      const applyDates = searchBox.querySelector('#applyDates');
      const checkInValue = searchBox.querySelector('#checkInValue');
      const checkOutValue = searchBox.querySelector('#checkOutValue');
      let viewDate = new Date();
      viewDate.setDate(1);
      let startDate = null;
      let endDate = null;

      const format = (d) => d ? d.toLocaleDateString(undefined, { day:'2-digit', month:'long', year:'numeric' }) : 'Add dates';
      const updateDateLabels = () => {
        if (checkInValue) checkInValue.textContent = format(startDate);
        if (checkOutValue) checkOutValue.textContent = format(endDate);
      };
      const sameDay = (a,b) => a && b && a.toDateString()===b.toDateString();
      const between = (d,a,b) => a && b && d > a && d < b;

      function renderCalendars(){
        if (!calendars) return;
        calendars.innerHTML = '';
        const first = new Date(viewDate);
        const second = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1);
        calendars.appendChild(renderMonth(first));
        calendars.appendChild(renderMonth(second));
      }

      function renderMonth(firstOfMonth){
        const container = document.createElement('div');
        const monthLabel = firstOfMonth.toLocaleDateString(undefined, { month:'long', year:'numeric' });
        // Header label
        const header = document.createElement('div');
        header.className = 'text-sm font-semibold mb-3';
        header.textContent = monthLabel;
        container.appendChild(header);

        // Weekday row
        const weekdays = document.createElement('div');
        weekdays.className = 'grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs text-gray-400 mb-1';
        'S M T W T F S'.split(' ').forEach(d => {
          const el = document.createElement('div');
          el.textContent = d;
          weekdays.appendChild(el);
        });
        container.appendChild(weekdays);

        // Days grid
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-sm';

        const firstWeekDay = new Date(firstOfMonth).getDay();
        const daysInMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth()+1,0).getDate();

        // Leading blanks to align first day
        for (let i=0; i<firstWeekDay; i++) {
          const blank = document.createElement('div');
          blank.className = 'h-9 sm:h-10';
          grid.appendChild(blank);
        }

        // Month days
        for (let d=1; d<=daysInMonth; d++) {
          const date = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), d);
          const btn = document.createElement('button');
          btn.className = 'w-9 h-9 sm:w-10 sm:h-10 inline-flex items-center justify-center rounded-full mx-auto hover:bg-gray-100';
          if (sameDay(date,startDate) || sameDay(date,endDate)) btn.classList.add('bg-black','text-white','hover:bg-black');
          else if (between(date,startDate,endDate)) btn.classList.add('bg-gray-200');
          btn.textContent = String(d);
          btn.addEventListener('click', () => {
            if (!startDate || (startDate && endDate)) { startDate = date; endDate = null; }
            else if (date < startDate) { endDate = startDate; startDate = date; }
            else { endDate = date; }
            renderCalendars();
            updateDateLabels();
          });
          grid.appendChild(btn);
        }

        // Trailing blanks so both months have consistent height (6 weeks)
        const totalCells = firstWeekDay + daysInMonth;
        const trailing = (7 * 6) - totalCells;
        for (let i=0; i<trailing; i++) {
          const blank = document.createElement('div');
          blank.className = 'h-9 sm:h-10';
          grid.appendChild(blank);
        }

        container.appendChild(grid);
        return container;
      }

      if (datesDropdown) {
        renderCalendars();
        if (prevMonthBtn) prevMonthBtn.addEventListener('click', ()=>{ viewDate.setMonth(viewDate.getMonth()-1); renderCalendars(); });
        if (nextMonthBtn) nextMonthBtn.addEventListener('click', ()=>{ viewDate.setMonth(viewDate.getMonth()+1); renderCalendars(); });
        if (clearDates) clearDates.addEventListener('click', ()=>{ startDate=null; endDate=null; renderCalendars(); updateDateLabels(); });
        if (applyDates) applyDates.addEventListener('click', ()=>{
          // If only a start date is picked, set end date equal for single-day selection
          if (startDate && !endDate) endDate = startDate;
          updateDateLabels();
          closeAll();
        });
        // Initial label sync for existing values
        updateDateLabels();
      }

      // Guests counters
      const counters = { adults: 2, children: 0, infants: 0 };
      const guestsValue = searchBox.querySelector('#guestsValue');
      searchBox.querySelectorAll('.counter-btn').forEach(btn=>{
        btn.addEventListener('click',()=>{
          const target = btn.getAttribute('data-target');
          const op = btn.getAttribute('data-op');
          counters[target] = Math.max(0, counters[target] + (op==='+'?1:-1));
          const el = searchBox.querySelector('#' + target + 'Count');
          if (el) el.textContent = counters[target];
        });
      });
      const applyGuests = searchBox.querySelector('#applyGuests');
      if (applyGuests) applyGuests.addEventListener('click',()=>{
        if (guestsValue) guestsValue.textContent = `${counters.adults} adults, ${counters.children} children`;
        closeAll();
      });
    } catch (err) {
      console.warn('Search dropdowns setup failed:', err);
    }
  }

  switchSearchTab(tabName) {
    this.currentTab = tabName.toLowerCase();
    
    // Update tab appearance
    const tabs = document.querySelectorAll('#search-box-wrapper button[class*="px-5 py-2"]');
    tabs.forEach(tab => {
      if (tab.textContent.trim().toLowerCase() === this.currentTab) {
        tab.className = 'px-5 py-2 bg-black text-white rounded-full text-sm font-medium';
      } else {
        tab.className = 'px-5 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200';
      }
    });
  }

  async performSearch() {
    console.log('Performing search...');
    const searchInputs = document.querySelectorAll('#search-box-wrapper span[class*="text-gray-900"]');
    const location = searchInputs[0]?.textContent || '';
    const checkIn = searchInputs[1]?.textContent || '';
    const checkOut = searchInputs[2]?.textContent || '';
    const guests = searchInputs[3]?.textContent || '';

    console.log('Search params:', { location, checkIn, checkOut, guests, tab: this.currentTab });

    try {
      // Build search query - combine location with current tab type
      const searchQuery = location || this.currentTab;
      const searchTypes = [this.currentTab || 'tours'];
      
      const data = await apiManager.search(searchQuery, searchTypes, 20);
      
      if (data.success) {
        this.displaySearchResults(data.data.results || data.data);
      } else {
        this.showSearchError('No results found for your search.');
      }
    } catch (error) {
      console.error('Search error:', error);
      
      // Show mock results for demo purposes if API fails
      this.showMockSearchResults(location, this.currentTab);
    }
  }

  displaySearchResults(results) {
    // Create or update search results modal
    let modal = document.getElementById('searchResultsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'searchResultsModal';
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden';
      modal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">Search Results</h2>
              <button id="closeSearchModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div id="searchResultsContent" class="p-6 overflow-y-auto max-h-[60vh]"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Close modal functionality
      document.getElementById('closeSearchModal').addEventListener('click', () => {
        modal.classList.add('hidden');
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    }

    const content = document.getElementById('searchResultsContent');
    if (content) {
      content.innerHTML = this.renderSearchResults(results);
    }

    modal.classList.remove('hidden');
  }

  renderSearchResults(results) {
    let html = '';
    
    Object.keys(results).forEach(type => {
      if (results[type] && results[type].length > 0) {
        html += `<div class="mb-6">
          <h3 class="text-lg font-semibold mb-4 capitalize">${type}</h3>
          <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">`;
        
        results[type].forEach(item => {
          html += this.renderSearchResultItem(item, type);
        });
        
        html += '</div></div>';
      }
    });

    if (!html) {
      html = '<div class="text-center py-8"><p class="text-gray-500">No results found. Try different search terms.</p></div>';
    }

    return html;
  }

  renderSearchResultItem(item, type) {
    const baseUrl = type === 'tours' ? '/tours' : type === 'hotels' ? '/hotels' : type === 'cars' ? '/cars' : '#';
    
    return `
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onclick="homepageManager.viewItem('${item._id}', '${type}')">
        <h4 class="font-semibold mb-2">${item.title || item.name || `${item.brand} ${item.model}`}</h4>
        <p class="text-sm text-gray-600 mb-2">${item.location || item.location?.city || ''}</p>
        <p class="text-lg font-bold text-yellow-600">$${item.price?.amount || item.price?.perNight || 0}</p>
      </div>
    `;
  }

  showMockSearchResults(location, tabType) {
    // Mock data for demo purposes
    const mockResults = {
      tours: [
        { _id: '1', title: 'California Sunset Cruise', location: 'Los Angeles, CA', price: { amount: 89 } },
        { _id: '2', title: 'NYC Food Tour', location: 'New York, NY', price: { amount: 65 } },
        { _id: '3', title: 'Grand Canyon Adventure', location: 'Arizona, USA', price: { amount: 120 } }
      ],
      hotels: [
        { _id: '1', name: 'Luxury Beach Resort', location: 'Miami, FL', price: { perNight: 250 } },
        { _id: '2', name: 'Downtown Hotel', location: 'New York, NY', price: { perNight: 180 } }
      ],
      cars: [
        { _id: '1', brand: 'BMW', model: '3 Series', location: 'San Francisco, CA', price: { amount: 89, per: 'day' } },
        { _id: '2', brand: 'Audi', model: 'A4', location: 'Los Angeles, CA', price: { amount: 95, per: 'day' } }
      ]
    };

    const results = {};
    results[tabType] = mockResults[tabType] || mockResults.tours;
    
    this.displaySearchResults(results);
  }

  async initializeSearchSuggestions() {
    const searchInputs = document.querySelectorAll('#search-box-wrapper span[class*="text-gray-900"]');
    
    searchInputs.forEach(input => {
      if (input.dataset.disableSuggestions === 'true') return; // do not attach default suggestions on enhanced fields
      input.addEventListener('click', async () => {
        const suggestions = await this.getSearchSuggestions(input.textContent);
        this.showSuggestions(input, suggestions);
      });
    });
  }

  async getSearchSuggestions(query) {
    try {
      const data = await apiManager.getSearchSuggestions(query, 5);
      return data.success ? data.data.suggestions : [];
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  showSuggestions(input, suggestions) {
    // Remove existing suggestions
    const existing = document.querySelector('.search-suggestions');
    if (existing) existing.remove();

    if (suggestions.length === 0) return;

    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'search-suggestions absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1';
    
    suggestionsDiv.innerHTML = suggestions.map(suggestion => `
      <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0" onclick="homepageManager.selectSuggestion('${suggestion.text}', this)">
        <div class="font-medium">${suggestion.text}</div>
        <div class="text-sm text-gray-500">${suggestion.subtitle}</div>
      </div>
    `).join('');

    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(suggestionsDiv);

    // Close suggestions when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closeSuggestions(e) {
        if (!suggestionsDiv.contains(e.target) && e.target !== input) {
          suggestionsDiv.remove();
          document.removeEventListener('click', closeSuggestions);
        }
      });
    }, 0);
  }

  selectSuggestion(text, element) {
    const input = element.closest('.search-suggestions').previousElementSibling;
    input.textContent = text;
    element.closest('.search-suggestions').remove();
  }

  // =============================
  // ⌨️ Keyboard Navigation
  // =============================
  initializeKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Tab navigation for search box
      if (e.key === 'Tab' && e.target.closest('#search-box-wrapper')) {
        e.preventDefault();
        this.navigateSearchTabs(e.shiftKey);
      }
      
      // Arrow keys for sliders
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const activeSlider = this.getActiveSlider();
        if (activeSlider) {
          e.preventDefault();
          if (e.key === 'ArrowLeft') {
            this.previousSlide(activeSlider);
          } else {
            this.nextSlide(activeSlider);
          }
        }
      }
      
      // Enter key for search
      if (e.key === 'Enter' && e.target.closest('#search-box-wrapper')) {
        e.preventDefault();
        this.performSearch();
      }
    });
  }

  navigateSearchTabs(shiftKey) {
    const tabs = Array.from(document.querySelectorAll('#search-box-wrapper button[class*="px-5 py-2"]'));
    const currentIndex = tabs.findIndex(tab => tab.classList.contains('bg-black'));
    
    let nextIndex;
    if (shiftKey) {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    } else {
      nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    }
    
    tabs[nextIndex].click();
    tabs[nextIndex].focus();
  }

  getActiveSlider() {
    // Determine which slider is currently visible/active
    const heroSection = document.querySelector('section[style*="background-image"]');
    if (heroSection && this.isElementInViewport(heroSection)) {
      return 'hero';
    }
    
    const hotelSection = document.getElementById('top-rated-hotels');
    if (hotelSection && this.isElementInViewport(hotelSection)) {
      return 'hotels';
    }
    
    const carSection = document.getElementById('recent-cars');
    if (carSection && this.isElementInViewport(carSection)) {
      return 'cars';
    }
    
    return null;
  }

  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // =============================
  // 🎯 Event Handlers
  // =============================
  bindEvents() {
    // Form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.closest('#search-box-wrapper')) {
        e.preventDefault();
        this.performSearch();
      }
    });

    // Button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[onclick*="bookTour"]')) {
        e.preventDefault();
        const tourId = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
        this.bookTour(tourId);
      }
      
      if (e.target.matches('[onclick*="bookHotel"]')) {
        e.preventDefault();
        const hotelId = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
        this.bookHotel(hotelId);
      }
      
      if (e.target.matches('[onclick*="bookCar"]')) {
        e.preventDefault();
        const carId = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
        this.bookCar(carId);
      }
    });
  }

  // =============================
  // 🛠️ Utility Methods
  // =============================
  async toggleWishlist(itemId) {
    // Check if user is logged in
    if (!apiManager.isAuthenticated()) {
      this.showMessage('Please log in to add items to your wishlist', 'warning');
      return;
    }

    try {
      const data = await apiManager.addToWishlist(itemId);
      if (data.success) {
        this.showMessage('Item added to wishlist!', 'success');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      this.showMessage('Failed to update wishlist', 'error');
    }
  }

  bookTour(tourId) {
    this.showMessage(`Booking tour ${tourId}...`, 'info');
    // Implement booking logic
  }

  bookHotel(hotelId) {
    this.showMessage(`Booking hotel ${hotelId}...`, 'info');
    // Implement booking logic
  }

  bookCar(carId) {
    this.showMessage(`Booking car ${carId}...`, 'info');
    // Implement booking logic
  }

  filterByCategory(categorySlug) {
    this.showMessage(`Filtering by category: ${categorySlug}`, 'info');
    // Implement category filtering
  }

  viewItem(itemId, type) {
    this.showMessage(`Viewing ${type} ${itemId}`, 'info');
    // Implement item viewing
  }

  showMessage(message, type = 'info') {
    // Create or update message display
    let messageDiv = document.getElementById('homepageMessage');
    if (!messageDiv) {
      messageDiv = document.createElement('div');
      messageDiv.id = 'homepageMessage';
      messageDiv.className = 'fixed top-4 right-4 z-50 max-w-sm';
      document.body.appendChild(messageDiv);
    }

    const colors = {
      success: 'bg-green-100 text-green-800 border-green-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    messageDiv.innerHTML = `
      <div class="p-4 rounded-lg border ${colors[type]} shadow-lg">
        <div class="flex items-center justify-between">
          <span>${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg">&times;</button>
        </div>
      </div>
    `;

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentElement) {
        messageDiv.remove();
      }
    }, 5000);
  }

  showSearchError(message) {
    this.showMessage(message, 'error');
  }

  // =============================
  // 🗣️ Testimonials Functionality
  // =============================
  initializeTestimonials() {
    const container = document.getElementById('testimonials');
    if (!container) {
      console.log('Testimonials container not found');
      return;
    }

    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    const dots = container.querySelectorAll('.testimonial-dot');

    console.log('Testimonials elements found:', { track, prevBtn, nextBtn, dots: dots.length });

    if (!track || !prevBtn || !nextBtn) {
      console.log('Missing testimonials elements');
      return;
    }

    // Clone slides for infinite loop
    const slides = Array.from(track.children);
    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      track.appendChild(clone);
    });

    let currentSlide = 0;
    const totalSlides = slides.length;

    const updateTestimonials = (smooth = true) => {
      const translateX = -currentSlide * 100;
      track.style.transition = smooth ? 'transform 0.5s ease-in-out' : 'none';
      track.style.transform = `translateX(${translateX}%)`;
      track.style.transition = 'transform 0.5s ease-in-out';

      // Update dots (only for visible slides)
      const visibleSlide = currentSlide % totalSlides;
      dots.forEach((dot, index) => {
        if (index === visibleSlide) {
          dot.classList.remove('bg-gray-300');
          dot.classList.add('bg-yellow-500');
        } else {
          dot.classList.remove('bg-yellow-500');
          dot.classList.add('bg-gray-300');
        }
      });
    };

    nextBtn.addEventListener('click', () => {
      console.log('Testimonials next button clicked');
      currentSlide++;
      updateTestimonials();
      
      // When reaching the end, jump back to start
      if (currentSlide >= totalSlides) {
        setTimeout(() => {
          currentSlide = 0;
          updateTestimonials(false);
        }, 500);
      }
    });

    prevBtn.addEventListener('click', () => {
      console.log('Testimonials prev button clicked');
      currentSlide--;
      
      if (currentSlide < 0) {
        currentSlide = totalSlides * 2 - 1;
        updateTestimonials(false);
        setTimeout(() => {
          currentSlide = totalSlides - 1;
          updateTestimonials();
        }, 10);
      } else {
        updateTestimonials();
      }
    });

    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentSlide = index;
        updateTestimonials();
      });
    });

    // Auto-advance testimonials
    setInterval(() => {
      currentSlide++;
      updateTestimonials();
      
      if (currentSlide >= totalSlides) {
        setTimeout(() => {
          currentSlide = 0;
          updateTestimonials(false);
        }, 500);
      }
    }, 6000);

    // Initialize
    updateTestimonials();
  }

  // =============================
  // ❓ Accordion Functionality
  // =============================
  initializeAccordion() {
    const faqSection = document.getElementById('faq');
    if (!faqSection) return;

    const faqItems = faqSection.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon');

      if (!question || !answer || !icon) return;

      question.addEventListener('click', () => {
        const isOpen = !answer.classList.contains('hidden');

        // Close all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherAnswer = otherItem.querySelector('.faq-answer');
            const otherIcon = otherItem.querySelector('.faq-icon');
            if (otherAnswer && otherIcon) {
              otherAnswer.classList.add('hidden');
              otherIcon.style.transform = 'rotate(0deg)';
            }
          }
        });

        // Toggle current item
        if (isOpen) {
          answer.classList.add('hidden');
          icon.style.transform = 'rotate(0deg)';
        } else {
          answer.classList.remove('hidden');
          icon.style.transform = 'rotate(180deg)';
        }
      });

      // Keyboard navigation
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });

      // Make focusable
      question.setAttribute('tabindex', '0');
      question.setAttribute('role', 'button');
      question.setAttribute('aria-expanded', 'false');
    });
  }

  // =============================
  // 🧭 Navbar Dropdown Functionality
  // =============================
  initializeNavbarDropdowns() {
    const navbar = document.querySelector('nav');
    if (!navbar) return;

    // Get all menu items with dropdown arrows
    const menuItems = Array.from(navbar.querySelectorAll('li')).filter(li => {
      return li.querySelector('img[src*="drop_down"]');
    });
    
    menuItems.forEach(item => {
      const link = item.querySelector('a');
      if (!link) return;

      const menuText = link.textContent.trim();
      
      // Create dropdown container
      const dropdown = document.createElement('div');
      dropdown.className = 'navbar-dropdown absolute top-full left-0 mt-1 bg-white shadow-2xl border border-gray-100 z-50 hidden';
      dropdown.style.minWidth = '280px';
      
      // Generate dropdown content based on menu item
      dropdown.innerHTML = this.generateDropdownContent(menuText);

      // Make parent li relative positioned
      item.style.position = 'relative';
      item.appendChild(dropdown);

      // Add hover and click events
      let hoverTimeout;
      
      item.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimeout);
        this.closeAllDropdowns();
        dropdown.classList.remove('hidden');
      });

      item.addEventListener('mouseleave', () => {
        hoverTimeout = setTimeout(() => {
          dropdown.classList.add('hidden');
        }, 150);
      });

      // Prevent link navigation
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown(dropdown);
      });

      // Handle dropdown item clicks
      dropdown.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const clickedItem = e.target.closest('.dropdown-item');
        if (clickedItem) {
          this.handleDropdownItemClick(clickedItem, menuText);
          dropdown.classList.add('hidden');
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        this.closeAllDropdowns();
      }
    });
  }

  generateDropdownContent(menuText) {
    const content = {
      'Home': {
        title: 'Homepage Options',
        items: [
          { text: 'Homepage 1', icon: '🏠', desc: 'Main landing page' },
          { text: 'Homepage 2', icon: '🏡', desc: 'Alternative layout' },
          { text: 'Homepage 3', icon: '🏘️', desc: 'Minimal design' }
        ]
      },
      'Tours': {
        title: 'Tour Categories',
        items: [
          { text: 'City Tours', icon: '🏙️', desc: 'Urban exploration' },
          { text: 'Adventure Tours', icon: '⛰️', desc: 'Thrilling experiences' },
          { text: 'Cultural Tours', icon: '🏛️', desc: 'Heritage & history' },
          { text: 'Food Tours', icon: '🍽️', desc: 'Culinary adventures' },
          { text: 'Nature Tours', icon: '🌿', desc: 'Wildlife & landscapes' }
        ]
      },
      'Destinations': {
        title: 'Popular Destinations',
        items: [
          { text: 'Europe', icon: '🇪🇺', desc: 'Historic cities & culture' },
          { text: 'Asia', icon: '🌏', desc: 'Ancient traditions & modern cities' },
          { text: 'Americas', icon: '🌎', desc: 'Diverse landscapes & cultures' },
          { text: 'Africa', icon: '🌍', desc: 'Safari & adventure' },
          { text: 'Oceania', icon: '🌊', desc: 'Islands & beaches' }
        ]
      },
      'Activities': {
        title: 'Activity Types',
        items: [
          { text: 'Water Sports', icon: '🏄‍♂️', desc: 'Surfing, diving, sailing' },
          { text: 'Hiking & Trekking', icon: '🥾', desc: 'Mountain trails & nature' },
          { text: 'Cultural Activities', icon: '🎭', desc: 'Museums, festivals, art' },
          { text: 'Adventure Sports', icon: '🧗‍♂️', desc: 'Rock climbing, bungee' },
          { text: 'Relaxation', icon: '🧘‍♀️', desc: 'Spa, yoga, meditation' }
        ]
      },
      'Hotel': {
        title: 'Accommodation Types',
        items: [
          { text: 'Luxury Hotels', icon: '🏨', desc: '5-star premium stays' },
          { text: 'Boutique Hotels', icon: '🏩', desc: 'Unique & stylish' },
          { text: 'Resorts', icon: '🏖️', desc: 'All-inclusive experiences' },
          { text: 'Budget Hotels', icon: '🏪', desc: 'Affordable & comfortable' },
          { text: 'Hostels', icon: '🛏️', desc: 'Social & budget-friendly' }
        ]
      },
      'Rental': {
        title: 'Rental Services',
        items: [
          { text: 'Car Rental', icon: '🚗', desc: 'Self-drive adventures' },
          { text: 'Bike Rental', icon: '🚲', desc: 'Eco-friendly exploration' },
          { text: 'Equipment Rental', icon: '🎒', desc: 'Gear for activities' },
          { text: 'Yacht Charter', icon: '⛵', desc: 'Luxury sailing' }
        ]
      },
      'Tickets': {
        title: 'Transportation',
        items: [
          { text: 'Flight Tickets', icon: '✈️', desc: 'Domestic & international' },
          { text: 'Train Tickets', icon: '🚄', desc: 'High-speed & scenic' },
          { text: 'Bus Tickets', icon: '🚌', desc: 'Intercity & local' },
          { text: 'Event Tickets', icon: '🎫', desc: 'Concerts & shows' }
        ]
      },
      'Pages': {
        title: 'Site Pages',
        items: [
          { text: 'About Us', icon: 'ℹ️', desc: 'Our story & mission' },
          { text: 'Contact', icon: '📞', desc: 'Get in touch' },
          { text: 'FAQ', icon: '❓', desc: 'Frequently asked questions' },
          { text: 'Terms & Conditions', icon: '📋', desc: 'Legal information' },
          { text: 'Privacy Policy', icon: '🔒', desc: 'Data protection' }
        ]
      },
      'Blog': {
        title: 'Travel Blog',
        items: [
          { text: 'Travel Tips', icon: '💡', desc: 'Expert advice & guides' },
          { text: 'Destination Guides', icon: '🗺️', desc: 'Detailed travel info' },
          { text: 'Travel Reviews', icon: '⭐', desc: 'User experiences' },
          { text: 'Travel News', icon: '📰', desc: 'Latest updates' }
        ]
      }
    };

    const menuContent = content[menuText] || {
      title: 'Options',
      items: [
        { text: 'Option 1', icon: '📄', desc: 'Description here' },
        { text: 'Option 2', icon: '📄', desc: 'Description here' },
        { text: 'Option 3', icon: '📄', desc: 'Description here' }
      ]
    };

    return `
      <div class="dropdown-header px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 class="text-sm font-semibold text-gray-900">${menuContent.title}</h3>
      </div>
      <div class="dropdown-content py-2">
        ${menuContent.items.map(item => `
          <div class="dropdown-item px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <div class="flex items-center space-x-3">
              <span class="text-lg">${item.icon}</span>
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-900">${item.text}</div>
                <div class="text-xs text-gray-500">${item.desc}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  toggleDropdown(dropdown) {
    this.closeAllDropdowns();
    dropdown.classList.toggle('hidden');
  }

  closeAllDropdowns() {
    document.querySelectorAll('.navbar-dropdown').forEach(dropdown => {
      dropdown.classList.add('hidden');
    });
  }

  handleDropdownItemClick(item, menuText) {
    const itemText = item.querySelector('.text-gray-900').textContent;
    console.log(`Clicked: ${menuText} > ${itemText}`);
    
    // Add visual feedback
    item.style.backgroundColor = '#fef3c7';
    setTimeout(() => {
      item.style.backgroundColor = '';
    }, 200);
  }
}

// Expose a safe initializer to create the manager AFTER partials are loaded
(() => {
  window.initializeHomepage = function () {
    // Avoid double-initialization
    if (window.homepageManager instanceof HomepageManager) {
      return window.homepageManager;
    }
    const instance = new HomepageManager();
    window.homepageManager = instance;
    return instance;
  };
})();