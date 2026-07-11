/* ============================================
   PakPhantom Website - TILT JS
   ============================================
   Table of Contents:
   1. Tilt Class
   2. Glare Effect
   3. Spotlight Effect
   4. Float Effect
   5. Card Stack Tilt
   6. Performance Manager
   7. Auto-Detection
   8. Initialization
============================================ */

'use strict';

/* ============================================
   1. TILT CLASS
============================================ */
class TiltEffect {
    constructor(element, options = {}) {
        this.el = element;
        this.maxTilt = parseFloat(options.maxTilt || element.dataset.tiltMax || 8);
        this.perspective = parseInt(options.perspective || element.dataset.tiltPerspective || 1000);
        this.speed = parseInt(options.speed || element.dataset.tiltSpeed || 400);
        this.scale = parseFloat(options.scale || element.dataset.tiltScale || 1.02);
        this.glare = options.glare !== undefined ? options.glare : element.dataset.tiltGlare === 'true';
        this.glareMaxOpacity = parseFloat(options.glareMaxOpacity || element.dataset.glareOpacity || 0.15);
        this.axis = options.axis || element.dataset.tiltAxis || null;
        this.reverse = options.reverse || element.dataset.tiltReverse === 'true';
        this.reset = options.reset !== undefined ? options.reset : true;
        this.easing = options.easing || 'cubic-bezier(0.03, 0.98, 0.52, 0.99)';

        this.glareElement = null;
        this.isActive = false;
        this.currentRotateX = 0;
        this.currentRotateY = 0;
        this.targetRotateX = 0;
        this.targetRotateY = 0;
        this.animationId = null;
        this.rect = null;

        this.onEnter = options.onEnter || null;
        this.onLeave = options.onLeave || null;
        this.onMove = options.onMove || null;

        this.init();
    }

    init() {
        // Set base styles
        this.el.style.transformStyle = 'preserve-3d';
        this.el.style.willChange = 'transform';

        // Create glare element
        if (this.glare) {
            this.createGlare();
        }

        // Bind events
        this.bindEvents();
    }

    createGlare() {
        // Wrapper for overflow hidden
        this.el.style.overflow = 'hidden';

        this.glareElement = document.createElement('div');
        this.glareElement.className = 'tilt-glare';
        this.glareElement.style.cssText = `
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.3s ease;
            border-radius: inherit;
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, ${this.glareMaxOpacity}) 0%,
                transparent 50%
            );
        `;

        this.el.style.position = this.el.style.position || 'relative';
        this.el.appendChild(this.glareElement);
    }

    bindEvents() {
        this.el.addEventListener('mouseenter', (e) => this.handleEnter(e));
        this.el.addEventListener('mousemove', (e) => this.handleMove(e));
        this.el.addEventListener('mouseleave', (e) => this.handleLeave(e));

        // Handle page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isActive) {
                this.resetTransform();
            }
        });
    }

    handleEnter(e) {
        this.isActive = true;
        this.rect = this.el.getBoundingClientRect();

        // Remove transition for smooth tracking
        this.el.style.transition = '';

        // Start animation loop
        if (!this.animationId) {
            this.animate();
        }

        if (this.onEnter) this.onEnter(this.el);
    }

    handleMove(e) {
        if (!this.isActive || !this.rect) return;

        const centerX = this.rect.left + this.rect.width / 2;
        const centerY = this.rect.top + this.rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const percentX = mouseX / (this.rect.width / 2);
        const percentY = mouseY / (this.rect.height / 2);

        const multiplier = this.reverse ? -1 : 1;

        // Calculate target rotation
        if (this.axis === 'x') {
            this.targetRotateX = -percentY * this.maxTilt * multiplier;
            this.targetRotateY = 0;
        } else if (this.axis === 'y') {
            this.targetRotateX = 0;
            this.targetRotateY = percentX * this.maxTilt * multiplier;
        } else {
            this.targetRotateX = -percentY * this.maxTilt * multiplier;
            this.targetRotateY = percentX * this.maxTilt * multiplier;
        }

        // Update glare
        if (this.glareElement) {
            const glareAngle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
            const glareOpacity = Math.sqrt(percentX * percentX + percentY * percentY) * this.glareMaxOpacity;

            this.glareElement.style.opacity = Math.min(glareOpacity, this.glareMaxOpacity);
            this.glareElement.style.background = `
                linear-gradient(
                    ${glareAngle + 180}deg,
                    rgba(255, 255, 255, ${this.glareMaxOpacity}) 0%,
                    transparent 60%
                )
            `;
        }

        if (this.onMove) {
            this.onMove({
                rotateX: this.targetRotateX,
                rotateY: this.targetRotateY,
                percentX,
                percentY
            });
        }
    }

    handleLeave(e) {
        this.isActive = false;

        if (this.reset) {
            this.resetTransform();
        }

        // Hide glare
        if (this.glareElement) {
            this.glareElement.style.opacity = '0';
        }

        if (this.onLeave) this.onLeave(this.el);
    }

    animate() {
        // Smooth interpolation
        const lerpFactor = 0.1;

        this.currentRotateX += (this.targetRotateX - this.currentRotateX) * lerpFactor;
        this.currentRotateY += (this.targetRotateY - this.currentRotateY) * lerpFactor;

        // Apply transform
        this.el.style.transform = `
            perspective(${this.perspective}px)
            rotateX(${this.currentRotateX.toFixed(3)}deg)
            rotateY(${this.currentRotateY.toFixed(3)}deg)
            scale3d(${this.isActive ? this.scale : 1}, ${this.isActive ? this.scale : 1}, ${this.isActive ? this.scale : 1})
        `;

        // Continue animation if active or still transitioning
        const isSettled = Math.abs(this.currentRotateX - this.targetRotateX) < 0.01 &&
                         Math.abs(this.currentRotateY - this.targetRotateY) < 0.01;

        if (this.isActive || !isSettled) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.animationId = null;
            if (this.reset) {
                this.el.style.transform = '';
            }
        }
    }

    resetTransform() {
        this.targetRotateX = 0;
        this.targetRotateY = 0;

        // Start animation back to neutral if not already running
        if (!this.animationId) {
            this.animate();
        }
    }

    /* ============================================
       2. CONTROL METHODS
    ============================================ */
    setMaxTilt(value) {
        this.maxTilt = value;
    }

    setScale(value) {
        this.scale = value;
    }

    enable() {
        this.bindEvents();
    }

    disable() {
        this.isActive = false;
        this.resetTransform();
    }

    destroy() {
        this.disable();

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.glareElement && this.glareElement.parentNode) {
            this.glareElement.parentNode.removeChild(this.glareElement);
        }

        this.el.style.transform = '';
        this.el.style.transformStyle = '';
        this.el.style.willChange = '';
        this.el.style.transition = '';
    }

    getValues() {
        return {
            rotateX: this.currentRotateX,
            rotateY: this.currentRotateY,
            percentX: this.currentRotateY / this.maxTilt,
            percentY: -this.currentRotateX / this.maxTilt,
            isActive: this.isActive
        };
    }
}

/* ============================================
   3. SPOTLIGHT EFFECT CLASS
============================================ */
class SpotlightEffect {
    constructor(element, options = {}) {
        this.el = element;
        this.size = options.size || 250;
        this.color = options.color || 'rgba(0, 255, 136, 0.06)';
        this.spotlightEl = null;

        this.init();
    }

    init() {
        this.el.style.position = this.el.style.position || 'relative';
        this.el.style.overflow = 'hidden';

        this.spotlightEl = document.createElement('div');
        this.spotlightEl.className = 'tilt-spotlight';
        this.spotlightEl.style.cssText = `
            position: absolute;
            width: ${this.size}px;
            height: ${this.size}px;
            border-radius: 50%;
            background: radial-gradient(circle, ${this.color} 0%, transparent 70%);
            pointer-events: none;
            z-index: 1;
            opacity: 0;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s ease;
        `;

        this.el.appendChild(this.spotlightEl);

        this.el.addEventListener('mouseenter', () => {
            this.spotlightEl.style.opacity = '1';
        });

        this.el.addEventListener('mousemove', (e) => {
            const rect = this.el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.spotlightEl.style.left = x + 'px';
            this.spotlightEl.style.top = y + 'px';
        });

        this.el.addEventListener('mouseleave', () => {
            this.spotlightEl.style.opacity = '0';
        });
    }

    destroy() {
        if (this.spotlightEl && this.spotlightEl.parentNode) {
            this.spotlightEl.parentNode.removeChild(this.spotlightEl);
        }
    }
}

/* ============================================
   4. CARD PARALLAX CHILDREN
============================================ */
class CardParallaxChildren {
    constructor(element, options = {}) {
        this.el = element;
        this.depth = parseFloat(options.depth || 20);
        this.children = [];

        this.init();
    }

    init() {
        // Find elements with data-tilt-child attribute
        const childElements = this.el.querySelectorAll('[data-tilt-child]');

        childElements.forEach(child => {
            const depth = parseFloat(child.dataset.tiltChild || this.depth);
            this.children.push({ el: child, depth: depth });
            child.style.transition = 'transform 0.2s ease';
        });

        if (!this.children.length) return;

        this.el.addEventListener('mousemove', (e) => {
            const rect = this.el.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const mouseX = e.clientX - rect.left - centerX;
            const mouseY = e.clientY - rect.top - centerY;

            this.children.forEach(({ el, depth }) => {
                const moveX = (mouseX / centerX) * depth;
                const moveY = (mouseY / centerY) * depth;
                el.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });

        this.el.addEventListener('mouseleave', () => {
            this.children.forEach(({ el }) => {
                el.style.transform = 'translate(0, 0)';
            });
        });
    }
}

/* ============================================
   5. AUTO-DETECTION & INITIALIZATION
============================================ */
let tiltInstances = [];
let spotlightInstances = [];

function initTilt() {
    // Skip on mobile / touch devices
    if ('ontouchstart' in window || window.innerWidth <= 768) {
        console.log('%c🎯 Tilt disabled on touch/mobile', 'color: #FFD700;');
        return;
    }

    // Skip on reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Tilt elements
    const tiltElements = document.querySelectorAll('[data-tilt]');

    tiltElements.forEach(el => {
        const hasGlare = el.dataset.tiltGlare === 'true' ||
                        el.classList.contains('holographic');

        const tilt = new TiltEffect(el, {
            glare: hasGlare,
            maxTilt: parseFloat(el.dataset.tiltMax || 6),
            scale: parseFloat(el.dataset.tiltScale || 1.02),
            perspective: parseInt(el.dataset.tiltPerspective || 1000)
        });

        tiltInstances.push(tilt);
    });

    // Spotlight on feature cards
    const spotlightElements = document.querySelectorAll('.feature-card, .game-card');

    spotlightElements.forEach(el => {
        // Don't add if already has tilt with glare
        if (el.dataset.tilt && el.dataset.tiltGlare === 'true') return;

        const spotlight = new SpotlightEffect(el, {
            size: 300,
            color: 'rgba(0, 255, 136, 0.04)'
        });

        spotlightInstances.push(spotlight);
    });

    // Parallax children
    const parallaxContainers = document.querySelectorAll('[data-tilt-children]');
    parallaxContainers.forEach(el => {
        new CardParallaxChildren(el);
    });

    // Handle resize - disable on small screens
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth <= 768) {
                tiltInstances.forEach(t => t.disable());
                spotlightInstances.forEach(s => s.destroy());
            }
        }, 200);
    });

    const totalEffects = tiltInstances.length + spotlightInstances.length;
    if (totalEffects > 0) {
        console.log(`%c🎯 ${totalEffects} tilt effect(s) initialized`, 'color: #00FF88;');
    }
}

// DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTilt);
} else {
    initTilt();
}

/* ============================================
   6. EXPORTS
============================================ */
window.PakPhantomTilt = {
    TiltEffect,
    SpotlightEffect,
    CardParallaxChildren,
    instances: () => tiltInstances,
    spotlights: () => spotlightInstances,
    create: (el, options) => {
        const tilt = new TiltEffect(el, options);
        tiltInstances.push(tilt);
        return tilt;
    },
    createSpotlight: (el, options) => {
        const spotlight = new SpotlightEffect(el, options);
        spotlightInstances.push(spotlight);
        return spotlight;
    },
    destroyAll: () => {
        tiltInstances.forEach(t => t.destroy());
        spotlightInstances.forEach(s => s.destroy());
        tiltInstances = [];
        spotlightInstances = [];
    },
    reinit: initTilt
};