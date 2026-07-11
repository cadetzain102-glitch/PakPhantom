/* ============================================
   PakPhantom Website - CUSTOM CURSOR JS
   ============================================
   Table of Contents:
   1. Cursor Class
   2. Cursor States
   3. Hover Detection
   4. Click Effects
   5. Trail Effect
   6. Boundary Detection
   7. Performance
   8. Initialization
============================================ */

'use strict';

/* ============================================
   1. CURSOR CLASS
============================================ */
class CustomCursor {
    constructor() {
        this.cursor = document.getElementById('cursor');
        this.follower = document.getElementById('cursor-follower');

        if (!this.cursor || !this.follower) return;

        // Skip on touch devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.disable();
            return;
        }

        // Skip on small screens
        if (window.innerWidth <= 1024) {
            this.disable();
            return;
        }

        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;
        this.followerX = 0;
        this.followerY = 0;

        this.isVisible = false;
        this.isHovering = false;
        this.isClicking = false;
        this.isText = false;
        this.isHidden = false;
        this.currentState = 'default';

        this.cursorSpeed = 1;
        this.followerSpeed = 0.15;

        this.hoverElements = [
            'a', 'button', '.btn', '.nav-link',
            '.mobile-toggle', '.filter-btn',
            '.game-preview-card', '.cmd-card',
            '.feature-card', '.social-btn',
            '.accordion-header', '.tab-btn',
            '.back-to-top', '.theme-toggle',
            '.page-btn', '.cookie-buttons button',
            '.mobile-nav-link', '.dropdown-menu a',
            '.game-play-btn', '.footer-links a'
        ];

        this.textElements = [
            'input', 'textarea', '[contenteditable]'
        ];

        this.hideElements = [
            'iframe', 'video', 'canvas'
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.animate();

        // Initially hide until mouse moves
        this.cursor.style.opacity = '0';
        this.follower.style.opacity = '0';
    }

    bindEvents() {
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            if (!this.isVisible) {
                this.isVisible = true;
                this.cursor.style.opacity = '1';
                this.follower.style.opacity = '1';

                // Snap to position immediately on first move
                this.cursorX = this.mouseX;
                this.cursorY = this.mouseY;
                this.followerX = this.mouseX;
                this.followerY = this.mouseY;
            }
        });

        // Mouse enter/leave window
        document.addEventListener('mouseenter', () => {
            this.cursor.style.opacity = '1';
            this.follower.style.opacity = '1';
            this.isVisible = true;
        });

        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
            this.follower.style.opacity = '0';
            this.isVisible = false;
        });

        // Mouse down/up
        document.addEventListener('mousedown', () => {
            this.isClicking = true;
            document.body.classList.add('cursor-click');
            this.createClickRipple();
        });

        document.addEventListener('mouseup', () => {
            this.isClicking = false;
            document.body.classList.remove('cursor-click');
        });

        // Hover detection with event delegation
        document.addEventListener('mouseover', (e) => {
            const target = e.target;

            // Check hover elements
            if (this.matchesSelector(target, this.hoverElements)) {
                this.setState('hover');
                return;
            }

            // Check text elements
            if (this.matchesSelector(target, this.textElements)) {
                this.setState('text');
                return;
            }

            // Check hide elements
            if (this.matchesSelector(target, this.hideElements)) {
                this.setState('hidden');
                return;
            }

            // Default state
            if (this.currentState !== 'default') {
                this.setState('default');
            }
        });

        // Handle resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 1024) {
                this.disable();
            } else {
                this.enable();
            }
        });

        // Reduced motion check
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (motionQuery.matches) {
            this.disable();
        }

        motionQuery.addEventListener('change', (e) => {
            if (e.matches) {
                this.disable();
            } else {
                this.enable();
            }
        });
    }

    matchesSelector(element, selectors) {
        for (const selector of selectors) {
            try {
                if (element.matches && element.matches(selector)) return true;
                if (element.closest && element.closest(selector)) return true;
            } catch (e) {
                // Invalid selector, skip
            }
        }
        return false;
    }

    /* ============================================
       2. CURSOR STATES
    ============================================ */
    setState(state) {
        if (this.currentState === state) return;

        // Remove previous state
        document.body.classList.remove(
            'cursor-hover',
            'cursor-text',
            'cursor-hidden',
            'cursor-click'
        );

        this.currentState = state;

        switch (state) {
            case 'hover':
                this.isHovering = true;
                this.isText = false;
                this.isHidden = false;
                document.body.classList.add('cursor-hover');
                break;

            case 'text':
                this.isHovering = false;
                this.isText = true;
                this.isHidden = false;
                document.body.classList.add('cursor-text');
                break;

            case 'hidden':
                this.isHovering = false;
                this.isText = false;
                this.isHidden = true;
                document.body.classList.add('cursor-hidden');
                break;

            default:
                this.isHovering = false;
                this.isText = false;
                this.isHidden = false;
                break;
        }
    }

    /* ============================================
       3. CLICK RIPPLE EFFECT
    ============================================ */
    createClickRipple() {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            left: ${this.mouseX}px;
            top: ${this.mouseY}px;
            width: 0;
            height: 0;
            border-radius: 50%;
            border: 1px solid rgba(0, 255, 136, 0.5);
            pointer-events: none;
            z-index: 9997;
            transform: translate(-50%, -50%);
            animation: cursorRipple 0.5s ease forwards;
        `;

        // Add keyframe if not exists
        if (!document.getElementById('cursor-ripple-style')) {
            const style = document.createElement('style');
            style.id = 'cursor-ripple-style';
            style.textContent = `
                @keyframes cursorRipple {
                    0% {
                        width: 0;
                        height: 0;
                        opacity: 1;
                    }
                    100% {
                        width: 40px;
                        height: 40px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
    }

    /* ============================================
       4. ANIMATION LOOP
    ============================================ */
    animate() {
        if (!this.isVisible) {
            requestAnimationFrame(() => this.animate());
            return;
        }

        // Smooth cursor follow
        this.cursorX += (this.mouseX - this.cursorX) * this.cursorSpeed;
        this.cursorY += (this.mouseY - this.cursorY) * this.cursorSpeed;

        // Smooth follower follow (with lag)
        this.followerX += (this.mouseX - this.followerX) * this.followerSpeed;
        this.followerY += (this.mouseY - this.followerY) * this.followerSpeed;

        // Apply transforms
        if (this.cursor) {
            this.cursor.style.transform = `translate(${this.cursorX}px, ${this.cursorY}px) translate(-50%, -50%)`;
        }

        if (this.follower) {
            this.follower.style.transform = `translate(${this.followerX}px, ${this.followerY}px) translate(-50%, -50%)`;
        }

        // Hidden state
        if (this.isHidden) {
            this.cursor.style.opacity = '0';
            this.follower.style.opacity = '0';
        } else {
            this.cursor.style.opacity = '1';
            this.follower.style.opacity = '0.8';
        }

        requestAnimationFrame(() => this.animate());
    }

    /* ============================================
       5. ENABLE / DISABLE
    ============================================ */
    disable() {
        if (this.cursor) {
            this.cursor.style.display = 'none';
        }
        if (this.follower) {
            this.follower.style.display = 'none';
        }

        document.body.style.cursor = 'auto';

        // Reset all interactive elements
        document.querySelectorAll('a, button, input, textarea, select, [role="button"]').forEach(el => {
            el.style.cursor = '';
        });
    }

    enable() {
        if (window.innerWidth <= 1024 || 'ontouchstart' in window) return;

        if (this.cursor) {
            this.cursor.style.display = '';
        }
        if (this.follower) {
            this.follower.style.display = '';
        }

        document.body.style.cursor = 'none';
    }

    /* ============================================
       6. PUBLIC METHODS
    ============================================ */
    setSpeed(cursorSpeed, followerSpeed) {
        this.cursorSpeed = cursorSpeed || 1;
        this.followerSpeed = followerSpeed || 0.15;
    }

    setColors(cursorColor, followerColor) {
        if (this.cursor && cursorColor) {
            this.cursor.style.background = cursorColor;
        }
        if (this.follower && followerColor) {
            this.follower.style.borderColor = followerColor;
        }
    }

    addHoverSelector(selector) {
        if (!this.hoverElements.includes(selector)) {
            this.hoverElements.push(selector);
        }
    }

    removeHoverSelector(selector) {
        const index = this.hoverElements.indexOf(selector);
        if (index > -1) {
            this.hoverElements.splice(index, 1);
        }
    }

    getPosition() {
        return {
            x: this.mouseX,
            y: this.mouseY,
            cursorX: this.cursorX,
            cursorY: this.cursorY,
            followerX: this.followerX,
            followerY: this.followerY
        };
    }

    getState() {
        return this.currentState;
    }
}

/* ============================================
   7. INITIALIZATION
============================================ */
let customCursor = null;

function initCursor() {
    // Skip on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        const cursorEl = document.getElementById('cursor');
        const followerEl = document.getElementById('cursor-follower');
        if (cursorEl) cursorEl.style.display = 'none';
        if (followerEl) followerEl.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }

    // Skip on small screens
    if (window.innerWidth <= 1024) {
        const cursorEl = document.getElementById('cursor');
        const followerEl = document.getElementById('cursor-follower');
        if (cursorEl) cursorEl.style.display = 'none';
        if (followerEl) followerEl.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }

    // Skip on reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    try {
        customCursor = new CustomCursor();
        console.log('%c🖱️ Custom cursor initialized', 'color: #00FF88;');
    } catch (error) {
        console.error('Custom cursor error:', error);
        document.body.style.cursor = 'auto';
    }
}

// Init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursor);
} else {
    initCursor();
}

/* ============================================
   8. EXPORTS
============================================ */
window.PakPhantomCursor = {
    instance: () => customCursor,
    disable: () => {
        if (customCursor) customCursor.disable();
    },
    enable: () => {
        if (customCursor) customCursor.enable();
    },
    setSpeed: (cursor, follower) => {
        if (customCursor) customCursor.setSpeed(cursor, follower);
    },
    setColors: (cursor, follower) => {
        if (customCursor) customCursor.setColors(cursor, follower);
    },
    getPosition: () => {
        return customCursor ? customCursor.getPosition() : null;
    },
    getState: () => {
        return customCursor ? customCursor.getState() : null;
    }
};