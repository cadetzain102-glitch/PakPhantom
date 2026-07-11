/* ============================================
   PakPhantom Website - HOME PAGE JS
   ============================================
   Table of Contents:
   1. Hero Animations
   2. Discord Mockup Animation
   3. Feature Cards Interaction
   4. Command Showcase Filter
   5. Games Preview Hover
   6. Testimonials Slider
   7. Stats Animation
   8. CTA Section Effects
   9. Scroll Based Animations
   10. Home Page Init
============================================ */

'use strict';

/* ============================================
   1. HERO ANIMATIONS
============================================ */
function initHeroAnimations() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    // Parallax effect on hero content
    const heroContent = hero.querySelector('.hero-content');
    const heroVisual = hero.querySelector('.hero-visual');

    if (heroContent && heroVisual && window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

            heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
            heroVisual.style.transform = `translate(${-moveX * 1.5}px, ${-moveY * 1.5}px)`;
        });
    }

    // Animate hero badge
    const heroBadge = hero.querySelector('.hero-badge');
    if (heroBadge) {
        heroBadge.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });

        heroBadge.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1)';
        });
    }

    // Quick stats hover effects
    const quickStats = hero.querySelectorAll('.quick-stat');
    quickStats.forEach(stat => {
        stat.addEventListener('mouseenter', function () {
            const value = this.querySelector('.quick-stat-value');
            if (value) {
                value.style.transform = 'scale(1.15)';
                value.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                value.style.color = '#33FFa0';
            }
        });

        stat.addEventListener('mouseleave', function () {
            const value = this.querySelector('.quick-stat-value');
            if (value) {
                value.style.transform = 'scale(1)';
                value.style.color = '';
            }
        });
    });
}

/* ============================================
   2. DISCORD MOCKUP ANIMATION
============================================ */
function initMockupAnimation() {
    const mockup = document.querySelector('.discord-mockup');
    if (!mockup) return;

    const messages = mockup.querySelectorAll('.chat-message');
    let currentMsg = 0;
    let animationStarted = false;

    // Observer to start animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animationStarted) {
                animationStarted = true;
                animateMessages();
                observer.unobserve(mockup);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(mockup);

    function animateMessages() {
        // Hide all messages first
        messages.forEach(msg => {
            msg.style.opacity = '0';
            msg.style.transform = 'translateY(15px)';
        });

        // Show messages one by one
        function showNext() {
            if (currentMsg >= messages.length) {
                // Restart after delay
                setTimeout(() => {
                    currentMsg = 0;
                    messages.forEach(msg => {
                        msg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                        msg.style.opacity = '0';
                        msg.style.transform = 'translateY(15px)';
                    });
                    setTimeout(showNext, 500);
                }, 5000);
                return;
            }

            const msg = messages[currentMsg];
            msg.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            msg.style.opacity = '1';
            msg.style.transform = 'translateY(0)';

            currentMsg++;
            setTimeout(showNext, 800);
        }

        setTimeout(showNext, 500);
    }

    // Sidebar server hover
    const servers = mockup.querySelectorAll('.sidebar-server');
    servers.forEach(server => {
        server.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.1)';
            this.style.borderRadius = '12px';
        });

        server.addEventListener('mouseleave', function () {
            this.style.transform = '';
            if (!this.classList.contains('active')) {
                this.style.borderRadius = '';
            }
        });
    });

    // Typing indicator animation
    const typingDots = mockup.querySelectorAll('.typing-dot');
    typingDots.forEach((dot, i) => {
        dot.style.animationDelay = `${i * 0.2}s`;
    });
}

/* ============================================
   3. FEATURE CARDS INTERACTION
============================================ */
function initFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');
    if (!featureCards.length) return;

    featureCards.forEach(card => {
        // Tag hover effect
        const tags = card.querySelectorAll('.tag');
        tags.forEach((tag, i) => {
            tag.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-2px) scale(1.05)';
                this.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                this.style.color = 'var(--primary)';
                this.style.transition = 'all 0.2s ease';
            });

            tag.addEventListener('mouseleave', function () {
                this.style.transform = '';
                this.style.borderColor = '';
                this.style.color = '';
            });
        });

        // Feature link arrow animation
        const link = card.querySelector('.feature-link');
        if (link) {
            const icon = link.querySelector('i');

            link.addEventListener('mouseenter', function () {
                if (icon) {
                    icon.style.transform = 'translateX(6px)';
                    icon.style.transition = 'transform 0.3s ease';
                }
            });

            link.addEventListener('mouseleave', function () {
                if (icon) {
                    icon.style.transform = '';
                }
            });
        }

        // Icon animation on card hover
        const iconEl = card.querySelector('.feature-icon');
        card.addEventListener('mouseenter', () => {
            if (iconEl) {
                iconEl.style.transform = 'scale(1.15) rotate(-8deg)';
                iconEl.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }
        });

        card.addEventListener('mouseleave', () => {
            if (iconEl) {
                iconEl.style.transform = '';
            }
        });
    });
}

/* ============================================
   4. COMMAND SHOWCASE ENHANCED FILTER
============================================ */
function initCommandShowcase() {
    const grid = document.getElementById('showcase-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!grid || !filterBtns.length) return;

    const cards = grid.querySelectorAll('.cmd-card');

    // Add count to filter buttons
    filterBtns.forEach(btn => {
        const filter = btn.dataset.filter;
        let count = 0;

        if (filter === 'all') {
            count = cards.length;
        } else {
            cards.forEach(card => {
                if (card.dataset.category === filter) count++;
            });
        }

        // Create or update count badge
        let countBadge = btn.querySelector('.filter-count');
        if (!countBadge) {
            countBadge = document.createElement('span');
            countBadge.className = 'filter-count';
            countBadge.style.cssText = `
                font-size: 0.7rem;
                opacity: 0.7;
                margin-left: 0.25rem;
                font-family: var(--font-mono);
            `;
            btn.appendChild(countBadge);
        }
        countBadge.textContent = `(${count})`;
    });

    // Enhanced card hover
    cards.forEach(card => {
        card.addEventListener('click', function () {
            const name = this.querySelector('.cmd-name');
            if (name) {
                // Copy command to clipboard
                const cmdText = name.textContent;
                navigator.clipboard.writeText(cmdText).then(() => {
                    // Show copied feedback
                    const originalText = name.textContent;
                    name.textContent = '✓ Copied!';
                    name.style.color = '#00FF88';

                    setTimeout(() => {
                        name.textContent = originalText;
                        name.style.color = '';
                    }, 1500);
                }).catch(() => {
                    // Clipboard API failed silently
                });
            }
        });
    });
}

/* ============================================
   5. GAMES PREVIEW HOVER
============================================ */
function initGamesPreview() {
    const gameCards = document.querySelectorAll('.game-preview-card');
    if (!gameCards.length) return;

    gameCards.forEach((card, index) => {
        card.addEventListener('mouseenter', function () {
            // Scale up emoji
            const emoji = this.querySelector('.game-emoji');
            if (emoji) {
                emoji.style.transform = 'scale(1.3) rotate(-10deg)';
                emoji.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }

            // Glow effect
            this.style.boxShadow = '0 8px 30px rgba(0, 255, 136, 0.15)';
        });

        card.addEventListener('mouseleave', function () {
            const emoji = this.querySelector('.game-emoji');
            if (emoji) {
                emoji.style.transform = '';
            }
            this.style.boxShadow = '';
        });

        // Click to navigate
        card.addEventListener('click', function () {
            if (this.classList.contains('see-all-card')) {
                window.location.href = 'games.html';
            }
        });
    });
}

/* ============================================
   6. TESTIMONIALS INTERACTION
============================================ */
function initTestimonials() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    if (!testimonialCards.length) return;

    testimonialCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            // Lift effect
            this.style.transform = 'translateY(-6px)';
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            this.style.boxShadow = '0 12px 40px rgba(0, 255, 136, 0.1)';

            // Avatar pulse
            const avatar = this.querySelector('.author-avatar');
            if (avatar) {
                avatar.style.transform = 'scale(1.1)';
                avatar.style.transition = 'transform 0.3s ease';
                avatar.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.3)';
            }
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
            this.style.boxShadow = '';

            const avatar = this.querySelector('.author-avatar');
            if (avatar) {
                avatar.style.transform = '';
                avatar.style.boxShadow = '';
            }
        });
    });
}

/* ============================================
   7. STEPS ANIMATION
============================================ */
function initStepsAnimation() {
    const stepCards = document.querySelectorAll('.step-card');
    if (!stepCards.length) return;

    stepCards.forEach((card, index) => {
        // Number counter on scroll
        const stepNumber = card.querySelector('.step-number');
        if (stepNumber) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        stepNumber.style.transition = 'opacity 0.5s ease, color 0.5s ease';
                        stepNumber.style.opacity = '0.06';
                        stepNumber.style.color = 'rgba(0, 255, 136, 0.06)';
                        observer.unobserve(card);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(card);
        }

        // Step icon hover
        const icon = card.querySelector('.step-icon');
        card.addEventListener('mouseenter', () => {
            if (icon) {
                icon.style.transform = 'scale(1.15) rotate(5deg)';
                icon.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.3)';
                icon.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }
        });

        card.addEventListener('mouseleave', () => {
            if (icon) {
                icon.style.transform = '';
                icon.style.boxShadow = '';
            }
        });
    });
}

/* ============================================
   8. CTA SECTION EFFECTS
============================================ */
function initCTASection() {
    const ctaSection = document.querySelector('.cta-section');
    if (!ctaSection) return;

    // Parallax orbs
    const orbs = ctaSection.querySelectorAll('.cta-orb');
    if (orbs.length && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const rect = ctaSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const scrollProgress = 1 - (rect.top / window.innerHeight);

                orbs.forEach((orb, i) => {
                    const speed = (i + 1) * 20;
                    const yOffset = scrollProgress * speed;
                    orb.style.transform = `translateY(${yOffset}px)`;
                });
            }
        }, { passive: true });
    }

    // CTA features check animation
    const features = ctaSection.querySelectorAll('.cta-features span');
    features.forEach((feature, i) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        feature.style.opacity = '1';
                        feature.style.transform = 'translateY(0)';
                        feature.style.transition = 'all 0.4s ease';
                    }, i * 100);
                    observer.unobserve(feature);
                }
            });
        }, { threshold: 0.5 });

        feature.style.opacity = '0';
        feature.style.transform = 'translateY(10px)';
        observer.observe(feature);
    });
}

/* ============================================
   9. SCROLL TRIGGERED SPECIAL EFFECTS
============================================ */
function initScrollEffects() {
    // Stat cards gradient border on scroll
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    card.style.borderColor = 'rgba(0, 255, 136, 0.15)';
                    card.style.transition = 'border-color 0.5s ease';

                    setTimeout(() => {
                        card.style.borderColor = '';
                    }, 2000);
                }
            });
        }, { threshold: 0.7 });

        observer.observe(card);
    });

    // Wave divider animation
    const waveDivider = document.querySelector('.wave-divider svg path');
    if (waveDivider) {
        let wavePhase = 0;

        function animateWave() {
            wavePhase += 0.02;
            const y1 = 60 + Math.sin(wavePhase) * 15;
            const y2 = 60 + Math.cos(wavePhase * 0.8) * 10;

            waveDivider.setAttribute('d',
                `M0,${y1} C360,${y1 + 30} 1080,${y2 - 30} 1440,${y2} L1440,120 L0,120 Z`
            );

            requestAnimationFrame(animateWave);
        }

        // Only animate when hero is visible
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateWave();
                    heroObserver.unobserve(entry.target);
                }
            });
        });

        const heroSection = document.getElementById('hero');
        if (heroSection) {
            heroObserver.observe(heroSection);
        }
    }
}

/* ============================================
   10. HOME PAGE INITIALIZATION
============================================ */
function initHomePage() {
    // Check if we're on the home page
    const isHomePage = document.querySelector('.hero-section') !== null;
    if (!isHomePage) return;

    // Initialize all home page features
    initHeroAnimations();
    initMockupAnimation();
    initFeatureCards();
    initCommandShowcase();
    initGamesPreview();
    initTestimonials();
    initStepsAnimation();
    initCTASection();
    initScrollEffects();

    console.log('%c🏠 Home page initialized', 'color: #00FF88;');
}

// DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomePage);
} else {
    initHomePage();
}

/* ============================================
   11. EXPORTS
============================================ */
window.PakPhantomHome = {
    reinit: initHomePage
};