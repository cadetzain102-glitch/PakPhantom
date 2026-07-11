/* ============================================
   PakPhantom Website - ANIMATIONS JS
   ============================================
   Table of Contents:
   1. Intersection Observer Manager
   2. Fade Animations
   3. Slide Animations
   4. Scale Animations
   5. Stagger Manager
   6. Parallax Effect
   7. Text Reveal Animation
   8. Magnetic Buttons
   9. Card Spotlight Effect
   10. Hover Tilt (lightweight)
   11. Smooth Counter
   12. Progress Bar Animator
   13. Accordion Animator
   14. Tab Switcher
   15. Image Reveal
   16. Scroll Triggered Classes
   17. Letter Animation
   18. Gradient Border Animation
   19. Number Ticker
   20. Floating Elements
   21. Mouse Trail
   22. Section Highlight
   23. Init All
============================================ */

'use strict';

/* ============================================
   1. INTERSECTION OBSERVER MANAGER
============================================ */
class ObserverManager {
    constructor() {
        this.observers = new Map();
    }

    create(name, callback, options = {}) {
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
            ...options
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target, entry);
                    if (!options.persistent) {
                        observer.unobserve(entry.target);
                    }
                } else if (options.onExit) {
                    options.onExit(entry.target, entry);
                }
            });
        }, defaultOptions);

        this.observers.set(name, observer);
        return observer;
    }

    observe(name, elements) {
        const observer = this.observers.get(name);
        if (!observer) return;

        if (elements instanceof NodeList || Array.isArray(elements)) {
            elements.forEach(el => observer.observe(el));
        } else if (elements instanceof Element) {
            observer.observe(elements);
        }
    }

    disconnect(name) {
        const observer = this.observers.get(name);
        if (observer) {
            observer.disconnect();
            this.observers.delete(name);
        }
    }

    disconnectAll() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

const observerManager = new ObserverManager();

/* ============================================
   2. FADE ANIMATIONS
============================================ */
function initFadeAnimations() {
    const fadeElements = document.querySelectorAll('[data-fade]');
    if (!fadeElements.length) return;

    observerManager.create('fade', (el) => {
        const direction = el.dataset.fade || 'up';
        const delay = parseInt(el.dataset.fadeDelay || 0);
        const duration = parseInt(el.dataset.fadeDuration || 600);

        setTimeout(() => {
            el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
            el.style.opacity = '1';
            el.style.transform = 'translate(0, 0)';
        }, delay);
    });

    fadeElements.forEach(el => {
        const direction = el.dataset.fade || 'up';
        const transforms = {
            up: 'translateY(30px)',
            down: 'translateY(-30px)',
            left: 'translateX(30px)',
            right: 'translateX(-30px)',
            none: 'translate(0, 0)'
        };

        el.style.opacity = '0';
        el.style.transform = transforms[direction] || transforms.up;
    });

    observerManager.observe('fade', fadeElements);
}

/* ============================================
   3. SLIDE ANIMATIONS
============================================ */
function initSlideAnimations() {
    const slideElements = document.querySelectorAll('[data-slide]');
    if (!slideElements.length) return;

    observerManager.create('slide', (el) => {
        const delay = parseInt(el.dataset.slideDelay || 0);
        const duration = parseInt(el.dataset.slideDuration || 700);

        setTimeout(() => {
            el.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}ms ease`;
            el.style.transform = 'translateX(0)';
            el.style.opacity = '1';
        }, delay);
    });

    slideElements.forEach(el => {
        const direction = el.dataset.slide || 'left';
        const distance = el.dataset.slideDistance || '100px';

        el.style.opacity = '0';
        el.style.transform = direction === 'left'
            ? `translateX(-${distance})`
            : `translateX(${distance})`;
    });

    observerManager.observe('slide', slideElements);
}

/* ============================================
   4. SCALE ANIMATIONS
============================================ */
function initScaleAnimations() {
    const scaleElements = document.querySelectorAll('[data-scale]');
    if (!scaleElements.length) return;

    observerManager.create('scale', (el) => {
        const delay = parseInt(el.dataset.scaleDelay || 0);

        setTimeout(() => {
            el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease';
            el.style.transform = 'scale(1)';
            el.style.opacity = '1';
        }, delay);
    });

    scaleElements.forEach(el => {
        const startScale = el.dataset.scale || '0.8';
        el.style.opacity = '0';
        el.style.transform = `scale(${startScale})`;
    });

    observerManager.observe('scale', scaleElements);
}

/* ============================================
   5. STAGGER MANAGER
============================================ */
class StaggerManager {
    constructor() {
        this.groups = new Map();
    }

    register(containerSelector, childSelector, options = {}) {
        const containers = document.querySelectorAll(containerSelector);
        if (!containers.length) return;

        containers.forEach((container, index) => {
            const children = container.querySelectorAll(childSelector);
            if (!children.length) return;

            const config = {
                delay: options.delay || 80,
                duration: options.duration || 500,
                animation: options.animation || 'fadeUp',
                ...options
            };

            // Hide children initially
            children.forEach(child => {
                child.style.opacity = '0';
                child.style.transform = this.getInitialTransform(config.animation);
            });

            const groupName = `stagger-${index}-${Date.now()}`;
            this.groups.set(groupName, { container, children, config });

            observerManager.create(groupName, () => {
                this.animate(groupName);
            }, { threshold: 0.15 });

            observerManager.observe(groupName, container);
        });
    }

    getInitialTransform(animation) {
        const transforms = {
            fadeUp: 'translateY(25px)',
            fadeDown: 'translateY(-25px)',
            fadeLeft: 'translateX(-25px)',
            fadeRight: 'translateX(25px)',
            scaleUp: 'scale(0.85)',
            rotateIn: 'rotate(-10deg) scale(0.9)',
            flipIn: 'perspective(400px) rotateX(90deg)'
        };
        return transforms[animation] || transforms.fadeUp;
    }

    animate(groupName) {
        const group = this.groups.get(groupName);
        if (!group) return;

        const { children, config } = group;

        children.forEach((child, i) => {
            setTimeout(() => {
                child.style.transition = `
                    opacity ${config.duration}ms ease,
                    transform ${config.duration}ms cubic-bezier(0.4, 0, 0.2, 1)
                `;
                child.style.opacity = '1';
                child.style.transform = 'none';
            }, i * config.delay);
        });
    }
}

const staggerManager = new StaggerManager();

/* ============================================
   6. PARALLAX EFFECT
============================================ */
function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length) return;

    // Skip on mobile
    if (window.innerWidth <= 768) return;

    let ticking = false;

    function updateParallax() {
        const scrollY = window.scrollY;

        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax || 0.3);
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const windowCenter = window.innerHeight / 2;
            const offset = (center - windowCenter) * speed;

            el.style.transform = `translateY(${offset}px)`;
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}

/* ============================================
   7. TEXT REVEAL ANIMATION
============================================ */
function initTextReveal() {
    const revealElements = document.querySelectorAll('[data-text-reveal]');
    if (!revealElements.length) return;

    observerManager.create('textReveal', (el) => {
        const delay = parseInt(el.dataset.textRevealDelay || 0);

        setTimeout(() => {
            el.classList.add('text-revealed');
        }, delay);
    });

    revealElements.forEach(el => {
        const text = el.textContent;
        const type = el.dataset.textReveal || 'words';

        if (type === 'words') {
            const words = text.split(' ');
            el.innerHTML = '';
            el.style.visibility = 'visible';

            words.forEach((word, i) => {
                const span = document.createElement('span');
                span.className = 'reveal-word';
                span.textContent = word + ' ';
                span.style.transitionDelay = `${i * 60}ms`;
                el.appendChild(span);
            });
        } else if (type === 'chars') {
            const chars = text.split('');
            el.innerHTML = '';
            el.style.visibility = 'visible';

            chars.forEach((char, i) => {
                const span = document.createElement('span');
                span.className = 'reveal-char';
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.transitionDelay = `${i * 30}ms`;
                el.appendChild(span);
            });
        }
    });

    observerManager.observe('textReveal', revealElements);
}

/* ============================================
   8. MAGNETIC BUTTONS
============================================ */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn');
    if (!buttons.length) return;

    // Skip on touch devices
    if ('ontouchstart' in window) return;

    buttons.forEach(btn => {
        const strength = parseFloat(btn.dataset.magneticStrength || 0.3);

        btn.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            this.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });

        btn.addEventListener('mouseleave', function () {
            this.style.transform = 'translate(0, 0)';
            this.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });

        btn.addEventListener('mouseenter', function () {
            this.style.transition = 'transform 0.1s ease';
        });
    });
}

/* ============================================
   9. CARD SPOTLIGHT EFFECT
============================================ */
function initCardSpotlight() {
    const cards = document.querySelectorAll('.feature-card, .game-card, .command-card');
    if (!cards.length) return;

    // Skip on mobile
    if (window.innerWidth <= 768) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            this.style.setProperty('--mouse-x', x + '%');
            this.style.setProperty('--mouse-y', y + '%');
        });
    });
}

/* ============================================
   10. HOVER TILT (Lightweight)
============================================ */
function initHoverTilt() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    if (!tiltElements.length) return;

    // Skip on mobile
    if (window.innerWidth <= 768 || 'ontouchstart' in window) return;

    tiltElements.forEach(el => {
        const maxTilt = parseFloat(el.dataset.tiltMax || 6);
        const perspective = parseInt(el.dataset.tiltPerspective || 1000);
        const speed = parseInt(el.dataset.tiltSpeed || 400);
        const scale = parseFloat(el.dataset.tiltScale || 1.02);

        el.style.transformStyle = 'preserve-3d';
        el.style.transition = `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;

        el.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            const rotateX = (-mouseY / (rect.height / 2)) * maxTilt;
            const rotateY = (mouseX / (rect.width / 2)) * maxTilt;

            this.style.transform = `
                perspective(${perspective}px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale3d(${scale}, ${scale}, ${scale})
            `;
        });

        el.addEventListener('mouseleave', function () {
            this.style.transform = `
                perspective(${perspective}px)
                rotateX(0deg)
                rotateY(0deg)
                scale3d(1, 1, 1)
            `;
        });
    });
}

/* ============================================
   11. SMOOTH COUNTER
============================================ */
class SmoothCounter {
    constructor(element, options = {}) {
        this.el = element;
        this.target = parseInt(element.dataset.countTo || element.dataset.count || 0);
        this.duration = options.duration || 2000;
        this.suffix = element.dataset.suffix || '';
        this.prefix = element.dataset.prefix || '';
        this.separator = options.separator !== false;
        this.decimals = parseInt(options.decimals || 0);
        this.started = false;
    }

    start() {
        if (this.started) return;
        this.started = true;

        const startTime = performance.now();
        const startValue = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.duration, 1);

            // easeOutExpo
            const eased = progress === 1
                ? 1
                : 1 - Math.pow(2, -10 * progress);

            let current = startValue + (this.target - startValue) * eased;

            if (this.decimals > 0) {
                current = current.toFixed(this.decimals);
            } else {
                current = Math.floor(current);
            }

            const formatted = this.separator
                ? Number(current).toLocaleString()
                : current.toString();

            this.el.textContent = this.prefix + formatted + this.suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
}

/* ============================================
   12. PROGRESS BAR ANIMATOR
============================================ */
function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    if (!progressBars.length) return;

    observerManager.create('progress', (el) => {
        const targetWidth = el.dataset.progress || el.style.getPropertyValue('--fill') || '0%';
        el.style.width = '0';

        requestAnimationFrame(() => {
            setTimeout(() => {
                el.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                el.style.width = targetWidth;
            }, 200);
        });
    }, { threshold: 0.3 });

    observerManager.observe('progress', progressBars);
}

/* ============================================
   13. ACCORDION ANIMATOR
============================================ */
function initAccordionAnimation() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    if (!accordionHeaders.length) return;

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const item = this.closest('.accordion-item');
            const body = item.querySelector('.accordion-body');
            if (!body) return;

            const isOpen = item.classList.contains('open');

            // Close all siblings
            const parent = item.closest('.accordion');
            if (parent) {
                parent.querySelectorAll('.accordion-item.open').forEach(openItem => {
                    if (openItem !== item) {
                        const openBody = openItem.querySelector('.accordion-body');
                        openBody.style.maxHeight = '0';
                        openItem.classList.remove('open');
                    }
                });
            }

            if (isOpen) {
                body.style.maxHeight = '0';
                item.classList.remove('open');
            } else {
                body.style.maxHeight = body.scrollHeight + 'px';
                item.classList.add('open');
            }
        });
    });
}

/* ============================================
   14. TAB SWITCHER
============================================ */
function initTabSwitcher() {
    const tabContainers = document.querySelectorAll('.tabs-container');
    if (!tabContainers.length) return;

    tabContainers.forEach(container => {
        const tabs = container.querySelectorAll('.tab-btn');
        const contents = container.querySelectorAll('.tab-content');
        const indicator = container.querySelector('.tab-indicator');

        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const targetId = this.dataset.tab;

                // Update tabs
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Update content
                contents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetId || content.dataset.tab === targetId) {
                        content.classList.add('active');
                    }
                });

                // Update indicator
                if (indicator) {
                    const rect = this.getBoundingClientRect();
                    const containerRect = container.querySelector('.tabs-header').getBoundingClientRect();
                    indicator.style.left = (rect.left - containerRect.left) + 'px';
                    indicator.style.width = rect.width + 'px';
                }
            });
        });

        // Init indicator position
        if (indicator) {
            const activeTab = container.querySelector('.tab-btn.active');
            if (activeTab) {
                const rect = activeTab.getBoundingClientRect();
                const containerRect = container.querySelector('.tabs-header').getBoundingClientRect();
                indicator.style.left = (rect.left - containerRect.left) + 'px';
                indicator.style.width = rect.width + 'px';
            }
        }
    });
}

/* ============================================
   15. IMAGE REVEAL
============================================ */
function initImageReveal() {
    const images = document.querySelectorAll('[data-reveal-image]');
    if (!images.length) return;

    observerManager.create('imageReveal', (el) => {
        el.classList.add('image-revealed');
    });

    images.forEach(img => {
        img.classList.add('image-hidden');
    });

    observerManager.observe('imageReveal', images);
}

/* ============================================
   16. SCROLL TRIGGERED CLASSES
============================================ */
function initScrollTriggeredClasses() {
    const elements = document.querySelectorAll('[data-scroll-class]');
    if (!elements.length) return;

    observerManager.create('scrollClass', (el) => {
        const className = el.dataset.scrollClass;
        const delay = parseInt(el.dataset.scrollDelay || 0);

        setTimeout(() => {
            el.classList.add(className);
        }, delay);
    });

    observerManager.observe('scrollClass', elements);
}

/* ============================================
   17. LETTER ANIMATION
============================================ */
function initLetterAnimation() {
    const elements = document.querySelectorAll('[data-letter-animate]');
    if (!elements.length) return;

    elements.forEach(el => {
        const text = el.textContent;
        const type = el.dataset.letterAnimate || 'wave';
        el.innerHTML = '';
        el.setAttribute('aria-label', text);

        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.className = 'animated-letter';
            span.style.setProperty('--letter-index', i);
            span.style.animationDelay = `${i * 0.05}s`;

            if (type === 'wave') {
                span.classList.add('wave-letter');
            } else if (type === 'bounce') {
                span.classList.add('bounce-letter');
            } else if (type === 'fade') {
                span.classList.add('fade-letter');
            }

            el.appendChild(span);
        });
    });
}

/* ============================================
   18. GRADIENT BORDER ANIMATION
============================================ */
function initGradientBorders() {
    const elements = document.querySelectorAll('[data-gradient-border]');
    if (!elements.length) return;

    elements.forEach(el => {
        const wrapper = document.createElement('div');
        wrapper.className = 'gradient-border-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.padding = '2px';
        wrapper.style.borderRadius = 'inherit';
        wrapper.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary), var(--primary))';
        wrapper.style.backgroundSize = '200% 200%';
        wrapper.style.animation = 'gradient-border 3s ease infinite';

        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);

        el.style.borderRadius = 'inherit';
        el.style.background = 'var(--bg-card)';
    });
}

/* ============================================
   19. NUMBER TICKER
============================================ */
function initNumberTickers() {
    const tickers = document.querySelectorAll('[data-ticker]');
    if (!tickers.length) return;

    observerManager.create('ticker', (el) => {
        const target = parseInt(el.dataset.ticker);
        const duration = parseInt(el.dataset.tickerDuration || 2000);
        const counter = new SmoothCounter(el, { duration });
        el.dataset.countTo = target;
        counter.target = target;
        counter.start();
    }, { threshold: 0.5 });

    observerManager.observe('ticker', tickers);
}

/* ============================================
   20. FLOATING ELEMENTS
============================================ */
function initFloatingElements() {
    const floatingElements = document.querySelectorAll('[data-float]');
    if (!floatingElements.length) return;

    floatingElements.forEach(el => {
        const speed = parseFloat(el.dataset.float || 1);
        const amplitude = parseFloat(el.dataset.floatAmplitude || 10);
        const offset = Math.random() * Math.PI * 2;

        function animate(time) {
            const y = Math.sin(time / 1000 * speed + offset) * amplitude;
            const x = Math.cos(time / 1500 * speed + offset) * (amplitude * 0.5);

            el.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    });
}

/* ============================================
   21. MOUSE TRAIL
============================================ */
function initMouseTrail() {
    // Only on hero section, only on desktop
    if (window.innerWidth <= 1024 || 'ontouchstart' in window) return;

    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    const trailDots = [];
    const trailCount = 8;

    for (let i = 0; i < trailCount; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: fixed;
            width: ${6 - i * 0.5}px;
            height: ${6 - i * 0.5}px;
            background: rgba(0, 255, 136, ${0.4 - i * 0.04});
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            transition: transform ${0.1 + i * 0.03}s ease;
            opacity: 0;
        `;
        document.body.appendChild(dot);
        trailDots.push({ el: dot, x: 0, y: 0 });
    }

    let mouseX = 0;
    let mouseY = 0;
    let isHeroHovered = false;

    hero.addEventListener('mouseenter', () => {
        isHeroHovered = true;
        trailDots.forEach(dot => { dot.el.style.opacity = '1'; });
    });

    hero.addEventListener('mouseleave', () => {
        isHeroHovered = false;
        trailDots.forEach(dot => { dot.el.style.opacity = '0'; });
    });

    hero.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateTrail() {
        if (isHeroHovered) {
            trailDots.forEach((dot, i) => {
                const prevDot = i === 0 ? { x: mouseX, y: mouseY } : trailDots[i - 1];

                dot.x += (prevDot.x - dot.x) * 0.35;
                dot.y += (prevDot.y - dot.y) * 0.35;

                dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%)`;
            });
        }

        requestAnimationFrame(animateTrail);
    }

    requestAnimationFrame(animateTrail);
}

/* ============================================
   22. SECTION HIGHLIGHT ON NAVIGATE
============================================ */
function initSectionHighlight() {
    if (!window.location.hash) return;

    const targetId = window.location.hash.substring(1);
    const target = document.getElementById(targetId);

    if (target) {
        setTimeout(() => {
            target.classList.add('section-highlight');
            setTimeout(() => {
                target.classList.remove('section-highlight');
            }, 1500);
        }, 500);
    }
}

/* ============================================
   23. SCROLL VELOCITY DETECTOR
============================================ */
class ScrollVelocity {
    constructor() {
        this.lastScroll = 0;
        this.lastTime = Date.now();
        this.velocity = 0;
        this.direction = 'none';
        this.callbacks = [];

        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            const now = Date.now();
            const currentScroll = window.scrollY;
            const timeDelta = now - this.lastTime;

            if (timeDelta > 0) {
                this.velocity = Math.abs(currentScroll - this.lastScroll) / timeDelta;
                this.direction = currentScroll > this.lastScroll ? 'down' : 'up';
            }

            this.lastScroll = currentScroll;
            this.lastTime = now;

            this.callbacks.forEach(cb => cb(this.velocity, this.direction));
        }, { passive: true });
    }

    onScroll(callback) {
        this.callbacks.push(callback);
    }
}

const scrollVelocity = new ScrollVelocity();

/* ============================================
   24. ELEMENT VISIBILITY TRACKER
============================================ */
function initVisibilityTracker() {
    const trackedElements = document.querySelectorAll('[data-track-visible]');
    if (!trackedElements.length) return;

    observerManager.create('visibility', (el) => {
        el.dataset.visible = 'true';

        // Dispatch custom event
        el.dispatchEvent(new CustomEvent('becameVisible', {
            bubbles: true,
            detail: { element: el }
        }));
    }, {
        threshold: 0.3,
        persistent: true,
        onExit: (el) => {
            el.dataset.visible = 'false';
        }
    });

    observerManager.observe('visibility', trackedElements);
}

/* ============================================
   25. INIT ALL ANIMATIONS
============================================ */
function initAllAnimations() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('%c♿ Reduced motion detected - animations minimal', 'color: #FFD700;');

        // Still init non-motion features
        initAccordionAnimation();
        initTabSwitcher();
        initSectionHighlight();
        return;
    }

    // Core animations
    initFadeAnimations();
    initSlideAnimations();
    initScaleAnimations();
    initParallax();

    // Text
    initTextReveal();
    initLetterAnimation();

    // Interactive
    initMagneticButtons();
    initCardSpotlight();
    initHoverTilt();
    initMouseTrail();
    initFloatingElements();

    // UI Components
    initProgressBars();
    initAccordionAnimation();
    initTabSwitcher();
    initImageReveal();
    initNumberTickers();

    // Utility
    initScrollTriggeredClasses();
    initSectionHighlight();
    initVisibilityTracker();

    // Stagger Groups
    staggerManager.register('.features-grid', '.feature-card', {
        delay: 100,
        animation: 'fadeUp'
    });

    staggerManager.register('.games-grid', '.game-preview-card', {
        delay: 60,
        animation: 'scaleUp'
    });

    staggerManager.register('.testimonials-track', '.testimonial-card', {
        delay: 120,
        animation: 'fadeUp'
    });

    staggerManager.register('.steps-container', '.step-card', {
        delay: 150,
        animation: 'fadeUp'
    });

    console.log('%c✨ All animations initialized', 'color: #00FF88;');
}

// DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAnimations);
} else {
    initAllAnimations();
}

/* ============================================
   26. EXPORTS
============================================ */
window.PakPhantomAnimations = {
    observer: observerManager,
    stagger: staggerManager,
    scrollVelocity: scrollVelocity,
    reinit: initAllAnimations
};