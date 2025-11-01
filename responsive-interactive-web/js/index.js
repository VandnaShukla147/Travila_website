// =============================
// 📦 Load Partials Dynamically
// =============================
async function loadPartial(targetId, fileName) {
  const response = await fetch(`./partials/${fileName}`);
  const html = await response.text();
  document.getElementById(targetId).innerHTML = html;
}

// =============================
// 🚀 Load All Partials
// =============================
Promise.all([
  loadPartial('info-bar', 'info-bar.html'),
  loadPartial('navbar', 'navbar.html'),
  loadPartial('hero', 'hero.html'),
  loadPartial('featured-tours', 'featured-tours.html'),
  loadPartial('top-categories', 'top-categories.html'),
  loadPartial('top-rated-hotels', 'top-rated-hotels.html'),
  loadPartial('payment', 'payment.html'), 
  loadPartial('why-travel', 'why-travel.html'),
  loadPartial('news-tips-guide', 'news-tips.html'),
  loadPartial('testimonials', 'testimonials.html'),
  loadPartial('faq', 'faq.html'),
  loadPartial('recent-cars', 'recent-cars.html'),
  loadPartial('footer', 'footer.html')
]).then(async () => {
  console.log('✅ All partials loaded successfully');

  // Inject search box into hero if available
  const searchBoxContainer = document.getElementById('search-box-container');
  if (searchBoxContainer) {
    const response = await fetch('./partials/search-box.html');
    searchBoxContainer.innerHTML = await response.text();
  }

  // ✅ Mobile menu toggle
  const menuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // ✅ Initialize Carousel
  initHotelCarousel();

  // ✅ Load Auth Modal
  loadAuthModal();

  // ✅ Initialize Homepage Features
  initializeHomepageFeatures();

  // ↪️ Move News, Tips & Guide just above the footer
  try {
    const news = document.getElementById('news-tips-guide');
    const footer = document.getElementById('footer');
    if (news && footer && footer.parentNode) {
      footer.parentNode.insertBefore(news, footer);
    }
  } catch (e) {
    console.warn('Could not move News, Tips & Guide:', e);
  }

  // ✅ Enable clickable heart icons (turn red when clicked)
  try {
    enableHeartToggles();
  } catch (err) {
    console.warn('Failed to initialize heart toggles:', err);
  }
});

// =============================
// ❤️ Heart toggle helper
// =============================
function enableHeartToggles() {
  // Inject small CSS for heart active state
  const css = `
  .heart-toggle { cursor: pointer; transition: filter .12s ease, transform .12s ease; }
  .heart-toggle.liked { transform: scale(1.08); filter: invert(18%) sepia(92%) saturate(4100%) hue-rotate(-10deg) brightness(96%) contrast(105%); }
  `;
  const style = document.createElement('style');
  style.setAttribute('data-generated', 'heart-toggle-styles');
  style.textContent = css;
  document.head.appendChild(style);

  // Attach listeners to any image that references the heart asset.
  function attach() {
    // PNG hearts
    const imgs = Array.from(document.querySelectorAll('img'))
      .filter(img => img.getAttribute('src') && img.getAttribute('src').endsWith('heart.webp'));

    // SVG hearts (commonly used for icons)
    const svgs = Array.from(document.querySelectorAll('svg'))
      .filter(svg => svg.innerHTML.includes('heart') || svg.outerHTML.includes('heart') || svg.querySelector('path'));

    // small red-heart SVG (data URI) used to replace the PNG on toggle for consistent coloring
    const redHeartSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'>
      <circle cx='12' cy='12' r='12' fill='white' />
      <path fill='#e11d48' d='M12.1 21s-7.4-4.35-9.6-6.22C.5 12.9.6 9.5 3 7.6c2.4-1.9 5.1-.6 6.1.5.9 1 1.4 2.3 3 2.3 1.6 0 2.1-1.3 3-2.3 1-1.1 3.7-2.4 6.1-.5 2.4 1.9 2.5 5.3.5 7.98C19.5 16.65 12.1 21 12.1 21z'/>
    </svg>`;
    const redHeartDataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(redHeartSvg);

    imgs.forEach(img => {
      if (!img.classList.contains('heart-toggle')) img.classList.add('heart-toggle');
      // store original src once
      if (!img.dataset.originalSrc) img.dataset.originalSrc = img.getAttribute('src');
      if (!img.dataset.heartListener) {
        img.addEventListener('click', (e) => {
          const isLiked = img.classList.toggle('liked');
          try {
            if (isLiked) {
              img.setAttribute('src', redHeartDataUri);
            } else {
              img.setAttribute('src', img.dataset.originalSrc);
            }
          } catch (err) {
            console.warn('heart toggle src swap failed', err);
          }
        });
        img.dataset.heartListener = '1';
      }
    });

    // SVG hearts: toggle fill color on click
    svgs.forEach(svg => {
      if (!svg.classList.contains('heart-toggle')) svg.classList.add('heart-toggle');
      if (!svg.dataset.heartListener) {
        svg.addEventListener('click', () => {
          svg.classList.toggle('liked');
          // Try to set fill color for all paths inside SVG
          svg.querySelectorAll('path').forEach(path => {
            if (svg.classList.contains('liked')) {
              path.setAttribute('fill', '#e11d48');
            } else {
              path.setAttribute('fill', '#111827'); // fallback to default dark gray
            }
          });
        });
        svg.dataset.heartListener = '1';
      }
    });
  }

  // Initial attach + observer for dynamic partials
  attach();
  const observer = new MutationObserver((mutations) => {
    // On DOM changes, re-run attach (cheap operation)
    attach();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // Keep reference so other scripts could disconnect if needed
  window.__heartToggleObserver = observer;
}

// =============================
// 🔐 Load Auth Modal
// =============================
async function loadAuthModal() {
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

// =============================
// 🏠 Initialize Homepage Features
// =============================
function initializeHomepageFeatures() {
  // Initialize after partials are in the DOM so listeners can bind
  try {
    if (typeof window.initializeHomepage === 'function') {
      window.initializeHomepage();
    } else if (typeof HomepageManager !== 'undefined') {
      // Fallback if initializer isn't present for some reason
      window.homepageManager = new HomepageManager();
    } else {
      console.warn('Homepage initializer not found. Ensure homepage.js is loaded before index.js');
    }
  } catch (err) {
    console.error('Failed to initialize homepage features:', err);
  }
}

// =============================
// 🎠 Carousel logic (Infinite Scroll)
// =============================
function initHotelCarousel() {
  const root = document.querySelector('[data-carousel="hotels"]');
  if (!root) return;

  const track = root.querySelector('[data-track]');
  const prev = root.closest('section').querySelector('[data-prev]');
  const next = root.closest('section').querySelector('[data-next]');
  if (!track || !prev || !next) return;

  const card = track.querySelector('.min-w-[360px]');
  const cardWidth = card.getBoundingClientRect().width + 32; // card width + gap
  const cards = Array.from(track.children);

  // 🌀 Clone cards for infinite loop illusion
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
