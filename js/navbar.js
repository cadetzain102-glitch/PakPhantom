/* ============================================
   PakPhantom Website - NAVBAR JS
   ============================================
   Table of Contents:
   1. Navbar Class
   2. Scroll Behavior
   3. Active Link Tracker
   4. Mobile Menu
   5. Dropdown Manager
   6. Search Integration
   7. Navbar Blur Effect
   8. Scroll Direction Detection
   9. Nav Indicator
   10. Initialization
============================================ */

'use strict';

/* ============================================
   1. NAVBAR CLASS
============================================ */
class Navbar {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.mobileToggle = document.getElementById('mobile-toggle');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        this.dropdowns = document.querySelectorAll('.nav-dropdown');

        if (!this.navbar) return;

        // State
        this.isScrolled = false;
        this.isMobileOpen = false;
        this.isHidden = false;
        this.lastScrollY = 0;
        this.scrollDirection = 'none';
        this.ticking = false;
        this.hideThreshold = 300;
        this.scrollDelta = 10;
        this.currentPage = this.getCurrentPage();

        // Config
        this.config = {
            scrolledClass: 'scrolled',
            hiddenClass: 'nav-hidden',
            activeClass: 'active',
            mobileActiveClass: 'active',
            scrollOffset: 50,
            autoHide: false,
            blurOnScroll: true
        };

        this.init();
    }

    init() {
        this.bindScrollEvents();
        this.bindMobileMenu();
        this.bindDropdowns();
        this.bindKeyboard();
        this.bindResize();
        this.setActiveLink();
        this.handleInitialState();
    }

    /* ============================================
       2. SCROLL BEHAVIOR
    ============================================ */
    bindScrollEvents() {
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.onScroll();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }, { passive: true });
    }

    onScroll() {
        const currentScrollY = window.scrollY;

        // Scrolled state (background blur)
        if (currentScrollY > this.config.scrollOffset) {
            if (!this.isScrolled) {
                this.isScrolled = true;
                this.navbar.classList.add(this.config.scrolledClass);
            }
        } else {
            if (this.isScrolled) {
                this.isScrolled = false;
                this.navbar.classList.remove(this.config.scrolledClass);
            }
        }

        // Auto-hide on scroll down
        if (this.config.autoHide) {
            this.handleAutoHide(currentScrollY);
        }

        // Dynamic blur intensity
        if (this.config.blurOnScroll) {
            this.updateBlurIntensity(currentScrollY);
        }

        // Detect scroll direction
        if (currentScrollY > this.lastScrollY + this.scrollDelta) {
            this.scrollDirection = 'down';
        } else if (currentScrollY < this.lastScrollY - this.scrollDelta) {
            this.scrollDirection = 'up';
        }

        this.lastScrollY = currentScrollY;
    }

    handleAutoHide(scrollY) {
        if (scrollY > this.hideThreshold && this.scrollDirection === 'down' && !this.isHidden) {
            this.isHidden = true;
            this.navbar.style.transform = 'translateY(-100%)';
            this.navbar.style.transition = 'transform 0.3s ease';
        } else if (this.scrollDirection === 'up' && this.isHidden) {
            this.isHidden = false;
            this.navbar.style.transform = 'translateY(0)';
        }

        // Always show at top
        if (scrollY <= this.config.scrollOffset) {
            this.isHidden = false;
            this.navbar.style.transform = 'translateY(0)';
        }
    }

    updateBlurIntensity(scrollY) {
        const maxBlur = 20;
        const maxScroll = 200;
        const blur = Math.min(maxBlur, (scrollY / maxScroll) * maxBlur);
        const opacity = Math.min(0.9, 0.5 + (scrollY / maxScroll) * 0.4);

        if (scrollY > this.config.scrollOffset) {
            this.navbar.style.setProperty('--nav-blur', `${blur}px`);
            this.navbar.style.setProperty('--nav-opacity', opacity);
        }
    }

    handleInitialState() {
        if (window.scrollY > this.config.scrollOffset) {
            this.isScrolled = true;
            this.navbar.classList.add(this.config.scrolledClass);
        }
    }

    /* ============================================
       3. ACTIVE LINK TRACKER
    ============================================ */
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }

    setActiveLink() {
        const allLinks = [...this.navLinks, ...this.mobileNavLinks];

        allLinks.forEach(link => {
            link.classList.remove(this.config.activeClass);

            const href = link.getAttribute('href');
            if (!href) return;

            const linkPage = href.split('/').pop();

            if (linkPage === this.currentPage) {
                link.classList.add(this.config.activeClass);
            } else if (this.currentPage === '' && linkPage === 'index.html') {
                link.classList.add(this.config.activeClass);
            } else if (this.currentPage === '/' && linkPage === 'index.html') {
                link.classList.add(this.config.activeClass);
            }
        });
    }

    /* ============================================
       4. MOBILE MENU
    ============================================ */
    bindMobileMenu() {
        if (!this.mobileToggle || !this.mobileMenu) return;

        // Toggle button click
        this.mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });

        // Close on link click
        this.mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close CTA button in mobile menu
        const mobileCta = this.mobileMenu.querySelector('.mobile-cta');
        if (mobileCta) {
            mobileCta.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isMobileOpen &&
                !this.mobileToggle.contains(e.target) &&
                !this.mobileMenu.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Close on scroll
        let scrollCloseTimeout;
        window.addEventListener('scroll', () => {
            if (this.isMobileOpen) {
                clearTimeout(scrollCloseTimeout);
                scrollCloseTimeout = setTimeout(() => {
                    this.closeMobileMenu();
                }, 150);
            }
        }, { passive: true });
    }

    toggleMobileMenu() {
        if (this.isMobileOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.isMobileOpen = true;
        this.mobileToggle.classList.add(this.config.mobileActiveClass);
        this.mobileMenu.classList.add(this.config.mobileActiveClass);
        document.body.classList.add('mobile-open');

        // Trap focus
        this.trapFocus(this.mobileMenu);

        // Animate links stagger
        const links = this.mobileMenu.querySelectorAll('.mobile-nav-link, .mobile-cta');
        links.forEach((link, i) => {
            link.style.opacity = '0';
            link.style.transform = 'translateX(20px)';

            setTimeout(() => {
                link.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                link.style.opacity = '1';
                link.style.transform = 'translateX(0)';
            }, 50 + (i * 50));
        });
    }

    closeMobileMenu() {
        this.isMobileOpen = false;
        this.mobileToggle.classList.remove(this.config.mobileActiveClass);
        this.mobileMenu.classList.remove(this.config.mobileActiveClass);
        document.body.classList.remove('mobile-open');

        // Release focus trap
        this.releaseFocus();
    }

    /* ============================================
       5. DROPDOWN MANAGER
    ============================================ */
    bindDropdowns() {
        this.dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (!toggle || !menu) return;

            // Desktop: hover
            if (window.innerWidth > 1024) {
                let hoverTimeout;

                dropdown.addEventListener('mouseenter', () => {
                    clearTimeout(hoverTimeout);
                    this.openDropdown(dropdown, menu);
                });

                dropdown.addEventListener('mouseleave', () => {
                    hoverTimeout = setTimeout(() => {
                        this.closeDropdown(dropdown, menu);
                    }, 200);
                });
            }

            // Mobile/Touch: click
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    e.stopPropagation();

                    const isOpen = dropdown.classList.contains('open');

                    // Close all other dropdowns
                    this.dropdowns.forEach(d => {
                        if (d !== dropdown) {
                            const m = d.querySelector('.dropdown-menu');
                            this.closeDropdown(d, m);
                        }
                    });

                    if (isOpen) {
                        this.closeDropdown(dropdown, menu);
                    } else {
                        this.openDropdown(dropdown, menu);
                    }
                }
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    this.closeDropdown(dropdown, menu);
                }
            });

            // Keyboard navigation
            menu.querySelectorAll('a').forEach((link, index, links) => {
                link.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const next = links[index + 1] || links[0];
                        next.focus();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prev = links[index - 1] || links[links.length - 1];
                        prev.focus();
                    } else if (e.key === 'Escape') {
                        this.closeDropdown(dropdown, menu);
                        toggle.focus();
                    }
                });
            });
        });
    }

    openDropdown(dropdown, menu) {
        dropdown.classList.add('open');
        if (menu) {
            menu.style.opacity = '1';
            menu.style.visibility = 'visible';
            menu.style.transform = 'translateX(-50%) translateY(0)';
        }
    }

    closeDropdown(dropdown, menu) {
        dropdown.classList.remove('open');
        if (menu) {
            menu.style.opacity = '0';
            menu.style.visibility = 'hidden';
            menu.style.transform = 'translateX(-50%) translateY(-10px)';
        }
    }

    /* ============================================
       6. KEYBOARD SUPPORT
    ============================================ */
    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Escape closes mobile menu
            if (e.key === 'Escape' && this.isMobileOpen) {
                this.closeMobileMenu();
                this.mobileToggle.focus();
            }

            // Escape closes dropdowns
            if (e.key === 'Escape') {
                this.dropdowns.forEach(d => {
                    const m = d.querySelector('.dropdown-menu');
                    this.closeDropdown(d, m);
                });
            }
        });

        // Mobile toggle keyboard support
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMobileMenu();
                }
            });
        }
    }

    /* ============================================
       7. FOCUS TRAP
    ============================================ */
    trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements.length) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        this._focusTrapHandler = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };

        document.addEventListener('keydown', this._focusTrapHandler);
        firstFocusable.focus();
    }

    releaseFocus() {
        if (this._focusTrapHandler) {
            document.removeEventListener('keydown', this._focusTrapHandler);
            this._focusTrapHandler = null;
        }
    }

    /* ============================================
       8. RESIZE HANDLER
    ============================================ */
    bindResize() {
        let resizeTimeout;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Close mobile menu on desktop
                if (window.innerWidth > 1024 && this.isMobileOpen) {
                    this.closeMobileMenu();
                }

                // Reset dropdown behavior
                this.dropdowns.forEach(d => {
                    const m = d.querySelector('.dropdown-menu');
                    if (m) {
                        m.style.opacity = '';
                        m.style.visibility = '';
                        m.style.transform = '';
                    }
                    d.classList.remove('open');
                });
            }, 150);
        });
    }

    /* ============================================
       9. PUBLIC METHODS
    ============================================ */
    setAutoHide(enabled) {
        this.config.autoHide = enabled;
        if (!enabled) {
            this.isHidden = false;
            this.navbar.style.transform = 'translateY(0)';
        }
    }

    setScrollOffset(offset) {
        this.config.scrollOffset = offset;
    }

    isMenuOpen() {
        return this.isMobileOpen;
    }

    getScrollDirection() {
        return this.scrollDirection;
    }

    getScrollState() {
        return {
            isScrolled: this.isScrolled,
            isHidden: this.isHidden,
            direction: this.scrollDirection,
            position: this.lastScrollY
        };
    }

    addNavLink(href, text, icon) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = href;
        a.className = 'nav-link';
        a.innerHTML = `<i class="${icon}"></i> ${text}`;
        li.appendChild(a);

        const navLinksList = document.querySelector('.nav-links');
        if (navLinksList) {
            navLinksList.appendChild(li);
        }
    }

    highlight(duration = 2000) {
        this.navbar.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
        this.navbar.style.borderBottomColor = 'rgba(0, 255, 136, 0.5)';

        setTimeout(() => {
            this.navbar.style.boxShadow = '';
            this.navbar.style.borderBottomColor = '';
        }, duration);
    }
}

/* ============================================
   10. INITIALIZATION
============================================ */
let navbarInstance = null;

function initNavbar() {
    try {
        navbarInstance = new Navbar();
        console.log('%c🧭 Navbar initialized', 'color: #00FF88;');
    } catch (error) {
        console.error('Navbar error:', error);
    }
}

// Init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}

/* ============================================
   11. EXPORTS
============================================ */
window.PakPhantomNavbar = {
    instance: () => navbarInstance,
    isOpen: () => navbarInstance ? navbarInstance.isMenuOpen() : false,
    close: () => {
        if (navbarInstance) navbarInstance.closeMobileMenu();
    },
    setAutoHide: (enabled) => {
        if (navbarInstance) navbarInstance.setAutoHide(enabled);
    },
    getState: () => {
        return navbarInstance ? navbarInstance.getScrollState() : null;
    },
    highlight: (duration) => {
        if (navbarInstance) navbarInstance.highlight(duration);
    }
};