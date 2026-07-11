/* ============================================
   PakPhantom Website - MAIN JS
   ============================================
   Table of Contents:
   1. Page Loader
   2. Scroll Progress Bar
   3. Navbar Scroll Effect
   4. Mobile Menu Toggle
   5. Back To Top Button
   6. Cookie Banner
   7. Category Filter
   8. Counter Animation
   9. Scroll Animations (AOS-like)
   10. Stat Bar Animation
   11. Typewriter Effect
   12. Dropdown Menu
   13. Smooth Scroll
   14. Active Nav Link
   15. Ripple Effect
   16. Theme Manager
   17. Page Transitions
   18. Lazy Loading
   19. Confetti Effect
   20. Console Easter Egg
   21. Initialization
============================================ */

'use strict';

/* ============================================
   1. PAGE LOADER
============================================ */
function hideLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    const statusEl = loader.querySelector('.loader-status');
    const messages = ['Loading assets...', 'Preparing UI...', 'Almost ready...', 'Welcome! 🇵🇰'];
    let msgIndex = 0;

    const msgInterval = setInterval(() => {
        if (statusEl && msgIndex < messages.length) {
            statusEl.textContent = messages[msgIndex];
            msgIndex++;
        }
    }, 400);

    setTimeout(() => {
        clearInterval(msgInterval);
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
        document.body.classList.add('page-loaded');

        setTimeout(() => {
            loader.style.display = 'none';
        }, 600);

        // First visit confetti
        if (!localStorage.getItem('pp_visited')) {
            localStorage.setItem('pp_visited', 'true');
            setTimeout(() => createConfetti(), 500);
        }
    }, 1800);
}

// Run loader hide
if (document.readyState === 'complete') {
    hideLoader();
} else {
    window.addEventListener('load', hideLoader);
}

// Failsafe - force hide after 3 seconds
setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader && !loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
        document.body.classList.add('page-loaded');
        setTimeout(() => { loader.style.display = 'none'; }, 600);
    }
}, 3000);

/* ============================================
   2. SCROLL PROGRESS BAR
============================================ */
function updateScrollProgress() {
    const progress = document.getElementById('scroll-progress');
    if (!progress) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = scrollPercent + '%';
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });

/* ============================================
   3. NAVBAR SCROLL EFFECT
============================================ */
let lastScroll = 0;
let navHidden = false;

function handleNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const currentScroll = window.scrollY;

    // Add scrolled class
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Auto-hide on scroll down, show on scroll up (optional)
    if (currentScroll > lastScroll && currentScroll > 300 && !navHidden) {
        // navbar.style.transform = 'translateY(-100%)';
        // navHidden = true;
    } else if (currentScroll < lastScroll && navHidden) {
        // navbar.style.transform = 'translateY(0)';
        // navHidden = false;
    }

    lastScroll = currentScroll;
}

window.addEventListener('scroll', handleNavbar, { passive: true });
handleNavbar();

/* ============================================
   4. MOBILE MENU TOGGLE
============================================ */
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!mobileToggle || !mobileMenu) return;

    mobileToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('mobile-open');
    });

    // Close on link click
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('mobile-open');
        });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
        if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('mobile-open');
        }
    });

    // Close on escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('mobile-open');
        }
    });

    // Close on resize
    window.addEventListener('resize', function () {
        if (window.innerWidth > 1024) {
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('mobile-open');
        }
    });
}

/* ============================================
   5. BACK TO TOP BUTTON
============================================ */
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;

    window.addEventListener('scroll', function () {
        if (window.scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }, { passive: true });

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ============================================
   6. COOKIE BANNER
============================================ */
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');

    if (!banner) return;
    if (localStorage.getItem('pp_cookie_accepted')) return;

    setTimeout(() => {
        banner.classList.add('visible');
    }, 2500);

    if (acceptBtn) {
        acceptBtn.addEventListener('click', function () {
            localStorage.setItem('pp_cookie_accepted', 'true');
            banner.classList.remove('visible');
        });
    }

    if (declineBtn) {
        declineBtn.addEventListener('click', function () {
            localStorage.setItem('pp_cookie_accepted', 'declined');
            banner.classList.remove('visible');
        });
    }
}

/* ============================================
   7. CATEGORY FILTER
============================================ */
function initFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cmdCards = document.querySelectorAll('.cmd-card');

    if (!filterBtns.length || !cmdCards.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;
            let delay = 0;

            cmdCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(15px)';

                    setTimeout(() => {
                        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, delay);

                    delay += 50;
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        card.classList.add('hidden');
                    }, 200);
                }
            });
        });
    });
}

/* ============================================
   8. COUNTER ANIMATION
============================================ */
function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
        const current = Math.floor(eased * target);

        el.textContent = current.toLocaleString() + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target.toLocaleString() + suffix;
        }
    }

    requestAnimationFrame(update);
}

function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = 'true';
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

/* ============================================
   9. SCROLL ANIMATIONS (AOS-like)
============================================ */
function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    // Check for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        elements.forEach(el => {
            el.classList.remove('aos-init');
            el.classList.add('aos-animated');
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.aosDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animated');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach(el => {
        el.classList.add('aos-init');
        observer.observe(el);
    });
}

/* ============================================
   10. STAT BAR ANIMATION
============================================ */
function initStatBars() {
    const bars = document.querySelectorAll('.stat-bar-fill');
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    bars.forEach(bar => observer.observe(bar));
}

/* ============================================
   11. TYPEWRITER EFFECT
============================================ */
function initTypewriter() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    const words = ['Pakistani', 'Ultimate', 'Amazing', 'Powerful', 'Desi 🇵🇰', 'Epic'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function type() {
        if (isPaused) {
            setTimeout(type, 100);
            return;
        }

        const currentWord = words[wordIndex];

        if (isDeleting) {
            el.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            el.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentWord.length) {
            speed = 2500; // Pause at full word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            speed = 400; // Pause before next word
        }

        setTimeout(type, speed);
    }

    // Start after page loads
    setTimeout(type, 1500);

    // Pause when tab not visible
    document.addEventListener('visibilitychange', () => {
        isPaused = document.hidden;
    });
}

/* ============================================
   12. DROPDOWN MENU
============================================ */
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (!toggle || !menu) return;

        // Click to toggle on mobile
        toggle.addEventListener('click', function (e) {
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('open');
            }
        });

        // Close dropdowns on outside click
        document.addEventListener('click', function (e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    });
}

/* ============================================
   13. SMOOTH SCROLL
============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;

            window.scrollTo({
                top: target.offsetTop - navHeight - 20,
                behavior: 'smooth'
            });
        });
    });
}

/* ============================================
   14. ACTIVE NAV LINK
============================================ */
function initActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');

        if (href === currentPage) {
            link.classList.add('active');
        } else if (currentPage === '' && href === 'index.html') {
            link.classList.add('active');
        }
    });
}

/* ============================================
   15. RIPPLE EFFECT
============================================ */
function initRippleEffect() {
    const buttons = document.querySelectorAll('.btn, .filter-btn, .game-preview-card, .cmd-card');

    buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/* ============================================
   16. THEME MANAGER
============================================ */
const ThemeManager = {
    themes: ['dark', 'light', 'amoled', 'pakistan', 'discord', 'neon'],
    currentTheme: 'dark',

    init() {
        const saved = localStorage.getItem('pp_theme');
        if (saved && this.themes.includes(saved)) {
            this.setTheme(saved);
        }

        // Theme toggle buttons
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                if (theme) this.setTheme(theme);
            });
        });

        // Simple toggle button
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.cycleTheme());
        }
    },

    setTheme(theme) {
        if (!this.themes.includes(theme)) return;

        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('pp_theme', theme);

        // Update active states
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });

        // Update toggle icon
        const toggleIcon = document.querySelector('.theme-toggle .theme-icon');
        if (toggleIcon) {
            const icons = {
                dark: 'fa-moon',
                light: 'fa-sun',
                amoled: 'fa-circle',
                pakistan: 'fa-star-and-crescent',
                discord: 'fa-discord',
                neon: 'fa-bolt'
            };
            toggleIcon.className = `theme-icon fas ${icons[theme] || 'fa-moon'}`;
        }
    },

    cycleTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.setTheme(this.themes[nextIndex]);
    },

    getTheme() {
        return this.currentTheme;
    }
};

/* ============================================
   17. PAGE TRANSITIONS
============================================ */
function initPageTransitions() {
    const links = document.querySelectorAll('a[href$=".html"]');

    links.forEach(link => {
        // Skip external links
        if (link.hostname !== window.location.hostname) return;
        if (link.target === '_blank') return;

        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href.startsWith('#')) return;

            e.preventDefault();

            // Fade out
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.25s ease';

            setTimeout(() => {
                window.location.href = href;
            }, 250);
        });
    });

    // Fade in on load
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
        document.body.style.transition = 'opacity 0.35s ease';
        document.body.style.opacity = '1';
    });
}

/* ============================================
   18. LAZY LOADING IMAGES
============================================ */
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;

                img.onload = function () {
                    img.classList.add('loaded');
                    img.removeAttribute('data-src');
                };

                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '100px'
    });

    images.forEach(img => observer.observe(img));
}

/* ============================================
   19. CONFETTI EFFECT
============================================ */
function createConfetti() {
    const container = document.createElement('div');
    container.classList.add('confetti-container');
    document.body.appendChild(container);

    const colors = ['#00FF88', '#5865F2', '#FF6B6B', '#FFD700', '#7983F5', '#FF8E53'];
    const count = 80;

    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');

        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.setProperty('--duration', (Math.random() * 2 + 1.5) + 's');
        piece.style.setProperty('--delay', Math.random() * 0.8 + 's');
        piece.style.width = Math.random() * 8 + 4 + 'px';
        piece.style.height = Math.random() * 12 + 6 + 'px';
        piece.style.opacity = Math.random() * 0.7 + 0.3;
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';

        container.appendChild(piece);
    }

    setTimeout(() => {
        container.style.opacity = '0';
        container.style.transition = 'opacity 0.5s ease';
        setTimeout(() => container.remove(), 500);
    }, 3500);
}

/* ============================================
   20. ACCORDION FUNCTIONALITY
============================================ */
function initAccordions() {
    const accordions = document.querySelectorAll('.accordion-header');

    accordions.forEach(header => {
        header.addEventListener('click', function () {
            const item = this.closest('.accordion-item');
            const isOpen = item.classList.contains('open');

            // Close all siblings (optional - comment out for multi-open)
            const parent = item.closest('.accordion');
            if (parent) {
                parent.querySelectorAll('.accordion-item').forEach(sibling => {
                    if (sibling !== item) {
                        sibling.classList.remove('open');
                    }
                });
            }

            // Toggle current
            item.classList.toggle('open', !isOpen);
        });

        // Keyboard support
        header.setAttribute('tabindex', '0');
        header.setAttribute('role', 'button');

        header.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

/* ============================================
   21. STAGGER ANIMATIONS
============================================ */
function initStaggerAnimations() {
    const staggerContainers = document.querySelectorAll('.stagger-container');
    if (!staggerContainers.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('stagger-active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    staggerContainers.forEach(container => observer.observe(container));
}

/* ============================================
   22. MESSAGE ANIMATION (MOCKUP)
============================================ */
function initMockupMessages() {
    const messages = document.querySelectorAll('.chat-message');
    if (!messages.length) return;

    messages.forEach((msg, index) => {
        msg.style.animationDelay = (1.5 + index * 0.5) + 's';
    });
}

/* ============================================
   23. KEYBOARD SHORTCUTS
============================================ */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        // Ctrl + K = focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const search = document.querySelector('.search-input');
            if (search) search.focus();
        }

        // T = toggle theme
        if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const activeElement = document.activeElement;
            const isInput = activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable;
            if (!isInput) {
                ThemeManager.cycleTheme();
            }
        }
    });
}

/* ============================================
   24. PERFORMANCE MONITORING
============================================ */
function logPerformance() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;

        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
                const firstPaint = timing.responseEnd - timing.requestStart;

                console.log('%c⚡ Performance', 'color: #00FF88; font-weight: bold;');
                console.log(`  Page Load: ${loadTime}ms`);
                console.log(`  DOM Ready: ${domReady}ms`);
                console.log(`  First Byte: ${firstPaint}ms`);
            }, 0);
        });
    }
}

/* ============================================
   25. CONSOLE EASTER EGG
============================================ */
function consoleEasterEgg() {
    console.log('%c🇵🇰 PakPhantom', 'color: #00FF88; font-size: 2rem; font-weight: bold; font-family: Poppins, sans-serif;');
    console.log('%cThe Ultimate Pakistani Discord Bot', 'color: #B0B0C3; font-size: 1rem; font-family: Inter, sans-serif;');
    console.log('%c94 Commands • 22 Games • 100%% Free', 'color: #5865F2; font-size: 0.9rem; font-family: Inter, sans-serif;');
    console.log('%c─────────────────────────────────', 'color: #333;');
    console.log('%c🔧 Press "T" to cycle themes!', 'color: #FFD700; font-size: 0.85rem;');
    console.log('%c🔍 Press "Ctrl+K" to search!', 'color: #FFD700; font-size: 0.85rem;');
    console.log('%c─────────────────────────────────', 'color: #333;');
    console.log('%c💚 Want to contribute? Visit our GitHub!', 'color: #00FF88; font-size: 0.85rem;');
    console.log('\n');
}

/* ============================================
   26. INITIALIZATION
============================================ */
function initializeApp() {
    // Core
    initMobileMenu();
    initBackToTop();
    initCookieBanner();
    initSmoothScroll();
    initActiveNavLink();
    initDropdowns();

    // Animations
    initScrollAnimations();
    initCounters();
    initStatBars();
    initTypewriter();
    initStaggerAnimations();
    initMockupMessages();
    initRippleEffect();

    // Features
    initFilter();
    initAccordions();
    initLazyLoading();
    initPageTransitions();
    initKeyboardShortcuts();

    // Theme
    ThemeManager.init();

    // Debug
    logPerformance();
    consoleEasterEgg();
}

// DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

/* ============================================
   27. GLOBAL EXPORTS
============================================ */
window.PakPhantom = {
    version: '1.0.0',
    theme: ThemeManager,
    confetti: createConfetti,
    init: initializeApp
};