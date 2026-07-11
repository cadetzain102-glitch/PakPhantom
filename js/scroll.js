/* ============================================
   PakPhantom Website - SCROLL JS
   ============================================
   Table of Contents:
   1. Scroll Manager Class
   2. Scroll Progress
   3. Section Tracker
   4. Scroll Reveal
   5. Smooth Scroll Links
   6. Parallax Scroll
   7. Scroll Snap
   8. Lazy Load Manager
   9. Scroll Event Emitter
   10. Scroll Performance
   11. Initialization
============================================ */

'use strict';

/* ============================================
   1. SCROLL MANAGER CLASS
============================================ */
class ScrollManager {
    constructor() {
        this.scrollY = 0;
        this.lastScrollY = 0;
        this.scrollDirection = 'none';
        this.scrollSpeed = 0;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.ticking = false;
        this.callbacks = [];
        this.sections = [];
        this.currentSection = null;
        this.windowHeight = window.innerHeight;
        this.docHeight = document.documentElement.scrollHeight;

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateMetrics();
    }

    bindEvents() {
        // Main scroll handler
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.onScroll();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }, { passive: true });

        // Resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.windowHeight = window.innerHeight;
                this.docHeight = document.documentElement.scrollHeight;
                this.updateSectionPositions();
            }, 150);
        });

        // Keyboard scroll (arrow keys, space, page up/down)
        document.addEventListener('keydown', (e) => {
            const scrollKeys = ['ArrowDown', 'ArrowUp', 'Space', 'PageDown', 'PageUp', 'Home', 'End'];
            if (scrollKeys.includes(e.code)) {
                this.isScrolling = true;
            }
        });
    }

    onScroll() {
        const currentScrollY = window.scrollY;

        // Calculate direction and speed
        const delta = currentScrollY - this.lastScrollY;
        this.scrollSpeed = Math.abs(delta);

        if (delta > 0) {
            this.scrollDirection = 'down';
        } else if (delta < 0) {
            this.scrollDirection = 'up';
        }

        this.scrollY = currentScrollY;
        this.lastScrollY = currentScrollY;
        this.isScrolling = true;

        // Clear scrolling timeout
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
            this.scrollSpeed = 0;
            this.emitEvent('scrollEnd', this.getState());
        }, 150);

        // Update section tracking
        this.trackSections();

        // Emit scroll event
        this.emitEvent('scroll', this.getState());

        // Execute registered callbacks
        this.callbacks.forEach(cb => {
            try {
                cb(this.getState());
            } catch (err) {
                console.error('Scroll callback error:', err);
            }
        });
    }

    updateMetrics() {
        this.scrollY = window.scrollY;
        this.lastScrollY = this.scrollY;
        this.windowHeight = window.innerHeight;
        this.docHeight = document.documentElement.scrollHeight;
    }

    getState() {
        return {
            scrollY: this.scrollY,
            direction: this.scrollDirection,
            speed: this.scrollSpeed,
            isScrolling: this.isScrolling,
            progress: this.getProgress(),
            currentSection: this.currentSection,
            atTop: this.scrollY <= 10,
            atBottom: this.scrollY + this.windowHeight >= this.docHeight - 10
        };
    }

    getProgress() {
        const maxScroll = this.docHeight - this.windowHeight;
        return maxScroll > 0 ? this.scrollY / maxScroll : 0;
    }

    /* ============================================
       2. SCROLL PROGRESS
    ============================================ */
    initProgress() {
        const progressBar = document.getElementById('scroll-progress');
        if (!progressBar) return;

        this.onScrollCallback((state) => {
            const percent = state.progress * 100;
            progressBar.style.width = percent + '%';
        });
    }

    /* ============================================
       3. SECTION TRACKER
    ============================================ */
    registerSections() {
        const sectionElements = document.querySelectorAll('section[id]');

        sectionElements.forEach(section => {
            this.sections.push({
                id: section.id,
                element: section,
                top: 0,
                bottom: 0
            });
        });

        this.updateSectionPositions();
    }

    updateSectionPositions() {
        this.sections.forEach(section => {
            const rect = section.element.getBoundingClientRect();
            section.top = rect.top + window.scrollY;
            section.bottom = section.top + rect.height;
        });
    }

    trackSections() {
        if (!this.sections.length) return;

        const viewportMiddle = this.scrollY + this.windowHeight / 3;

        for (let i = this.sections.length - 1; i >= 0; i--) {
            const section = this.sections[i];
            if (viewportMiddle >= section.top) {
                if (this.currentSection !== section.id) {
                    const previousSection = this.currentSection;
                    this.currentSection = section.id;
                    this.emitEvent('sectionChange', {
                        current: section.id,
                        previous: previousSection,
                        element: section.element
                    });
                }
                break;
            }
        }
    }

    /* ============================================
       4. SCROLL REVEAL
    ============================================ */
    initReveal() {
        const revealElements = document.querySelectorAll('[data-scroll-reveal]');
        if (!revealElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const animation = el.dataset.scrollReveal || 'fadeUp';
                    const delay = parseInt(el.dataset.revealDelay || 0);
                    const duration = parseInt(el.dataset.revealDuration || 600);

                    setTimeout(() => {
                        el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
                        el.classList.add('revealed');
                        el.style.opacity = '1';
                        el.style.transform = 'none';
                    }, delay);

                    observer.unobserve(el);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => {
            const animation = el.dataset.scrollReveal || 'fadeUp';
            const transforms = {
                fadeUp: 'translateY(30px)',
                fadeDown: 'translateY(-30px)',
                fadeLeft: 'translateX(-30px)',
                fadeRight: 'translateX(30px)',
                zoomIn: 'scale(0.9)',
                zoomOut: 'scale(1.1)',
                rotateIn: 'rotate(-5deg) scale(0.95)',
                none: 'none'
            };

            el.style.opacity = '0';
            el.style.transform = transforms[animation] || transforms.fadeUp;

            observer.observe(el);
        });
    }

    /* ============================================
       5. SMOOTH SCROLL LINKS
    ============================================ */
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#' || targetId === '#!') return;

                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();
                this.scrollToElement(target);
            });
        });
    }

    scrollToElement(element, options = {}) {
        const offset = options.offset || 80;
        const duration = options.duration || 800;
        const easing = options.easing || 'easeInOutCubic';

        const targetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const easings = {
            easeInOutCubic: (t) => t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2,
            easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
            easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
        };

        const easeFn = easings[easing] || easings.easeInOutCubic;

        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeFn(progress);

            window.scrollTo(0, startPosition + distance * eased);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Update URL hash without jumping
                if (element.id) {
                    history.pushState(null, null, '#' + element.id);
                }
            }
        }

        requestAnimationFrame(animate);
    }

    scrollToTop(duration = 600) {
        this.scrollToPosition(0, duration);
    }

    scrollToBottom(duration = 600) {
        this.scrollToPosition(this.docHeight - this.windowHeight, duration);
    }

    scrollToPosition(position, duration = 600) {
        const startPosition = window.scrollY;
        const distance = position - startPosition;
        let startTime = null;

        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);

            window.scrollTo(0, startPosition + distance * eased);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    /* ============================================
       6. PARALLAX SCROLL
    ============================================ */
    initParallax() {
        const parallaxElements = document.querySelectorAll('[data-scroll-parallax]');
        if (!parallaxElements.length) return;

        // Skip on mobile
        if (window.innerWidth <= 768) return;

        this.onScrollCallback(() => {
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.scrollParallax || 0.3);
                const rect = el.getBoundingClientRect();

                if (rect.top < this.windowHeight && rect.bottom > 0) {
                    const yPos = (rect.top - this.windowHeight / 2) * speed;
                    el.style.transform = `translateY(${yPos}px)`;
                }
            });
        });
    }

    /* ============================================
       7. LAZY LOAD MANAGER
    ============================================ */
    initLazyLoad() {
        const lazyElements = document.querySelectorAll('[data-src], [data-bg]');
        if (!lazyElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;

                    // Lazy load images
                    if (el.dataset.src) {
                        if (el.tagName === 'IMG') {
                            el.src = el.dataset.src;
                            el.onload = () => {
                                el.classList.add('lazy-loaded');
                                el.removeAttribute('data-src');
                            };
                        } else {
                            // For non-img elements (video, iframe, etc.)
                            el.src = el.dataset.src;
                            el.removeAttribute('data-src');
                        }
                    }

                    // Lazy load background images
                    if (el.dataset.bg) {
                        el.style.backgroundImage = `url(${el.dataset.bg})`;
                        el.classList.add('lazy-loaded');
                        el.removeAttribute('data-bg');
                    }

                    observer.unobserve(el);
                }
            });
        }, {
            rootMargin: '200px',
            threshold: 0.01
        });

        lazyElements.forEach(el => {
            // Add placeholder class
            el.classList.add('lazy-placeholder');
            observer.observe(el);
        });
    }

    /* ============================================
       8. SCROLL EVENT EMITTER
    ============================================ */
    onScrollCallback(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }

    offScrollCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    emitEvent(eventName, detail) {
        const event = new CustomEvent(`scroll:${eventName}`, {
            bubbles: true,
            detail: detail
        });
        document.dispatchEvent(event);
    }

    /* ============================================
       9. BACK TO TOP ENHANCED
    ============================================ */
    initBackToTop() {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;

        this.onScrollCallback((state) => {
            if (state.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }

            // Update progress ring
            const ring = btn.querySelector('.btt-ring');
            if (ring) {
                const progress = Math.min(state.progress * 100, 100);
                ring.style.setProperty('--progress', progress + '%');
            }
        });

        btn.addEventListener('click', () => {
            this.scrollToTop(800);
        });
    }

    /* ============================================
       10. SCROLL SNAP SECTIONS
    ============================================ */
    initScrollSnap(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const sections = container.querySelectorAll('.scroll-snap-section');
        if (!sections.length) return;

        container.style.scrollSnapType = 'y mandatory';
        container.style.overflowY = 'scroll';
        container.style.height = '100vh';

        sections.forEach(section => {
            section.style.scrollSnapAlign = 'start';
            section.style.minHeight = '100vh';
        });
    }

    /* ============================================
       11. SCROLL DIRECTION CLASSES
    ============================================ */
    initDirectionClasses() {
        this.onScrollCallback((state) => {
            document.body.classList.toggle('scrolling-up', state.direction === 'up');
            document.body.classList.toggle('scrolling-down', state.direction === 'down');
            document.body.classList.toggle('at-top', state.atTop);
            document.body.classList.toggle('at-bottom', state.atBottom);
            document.body.classList.toggle('is-scrolling', state.isScrolling);
        });
    }

    /* ============================================
       12. DESTROY
    ============================================ */
    destroy() {
        this.callbacks = [];
        this.sections = [];
        clearTimeout(this.scrollTimeout);
    }
}

/* ============================================
   11. INITIALIZATION
============================================ */
let scrollManager = null;

function initScroll() {
    try {
        scrollManager = new ScrollManager();

        // Initialize all scroll features
        scrollManager.initProgress();
        scrollManager.registerSections();
        scrollManager.initReveal();
        scrollManager.initSmoothScroll();
        scrollManager.initParallax();
        scrollManager.initLazyLoad();
        scrollManager.initBackToTop();
        scrollManager.initDirectionClasses();

        // Listen for section changes
        document.addEventListener('scroll:sectionChange', (e) => {
            const { current, previous } = e.detail;

            // Update nav active states based on scroll position
            document.querySelectorAll('.nav-link').forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.includes('#' + current)) {
                    link.classList.add('active');
                }
            });
        });

        console.log('%c📜 Scroll manager initialized', 'color: #00FF88;');
    } catch (error) {
        console.error('Scroll manager error:', error);
    }
}

// DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScroll);
} else {
    initScroll();
}

/* ============================================
   12. EXPORTS
============================================ */
window.PakPhantomScroll = {
    manager: () => scrollManager,
    getState: () => scrollManager ? scrollManager.getState() : null,
    scrollTo: (el, options) => {
        if (scrollManager) scrollManager.scrollToElement(el, options);
    },
    scrollToTop: (duration) => {
        if (scrollManager) scrollManager.scrollToTop(duration);
    },
    scrollToPosition: (pos, duration) => {
        if (scrollManager) scrollManager.scrollToPosition(pos, duration);
    },
    onScroll: (callback) => {
        if (scrollManager) scrollManager.onScrollCallback(callback);
    },
    offScroll: (callback) => {
        if (scrollManager) scrollManager.offScrollCallback(callback);
    },
    getProgress: () => {
        return scrollManager ? scrollManager.getProgress() : 0;
    },
    reinit: initScroll
};