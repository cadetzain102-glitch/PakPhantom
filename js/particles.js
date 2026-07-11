/* ============================================
   PakPhantom Website - PARTICLES JS
   ============================================
   Table of Contents:
   1. Particle Class
   2. Particle System
   3. Star Field
   4. Shooting Stars
   5. Connection Lines
   6. Mouse Interaction
   7. Performance Manager
   8. Resize Handler
   9. Color Schemes
   10. Initialization
============================================ */

'use strict';

/* ============================================
   1. PARTICLE CLASS
============================================ */
class Particle {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.x = options.x || Math.random() * canvas.width;
        this.y = options.y || Math.random() * canvas.height;
        this.size = options.size || Math.random() * 2 + 0.5;
        this.baseSize = this.size;

        this.speedX = options.speedX || (Math.random() - 0.5) * 0.4;
        this.speedY = options.speedY || (Math.random() - 0.5) * 0.4;
        this.baseSpeedX = this.speedX;
        this.baseSpeedY = this.speedY;

        this.opacity = options.opacity || Math.random() * 0.5 + 0.1;
        this.baseOpacity = this.opacity;
        this.targetOpacity = this.opacity;

        this.color = options.color || { r: 0, g: 255, b: 136 };
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.age = 0;

        this.mouseDistance = 0;
        this.isNearMouse = false;
    }

    update(time, mouseX, mouseY, mouseRadius) {
        this.age += 0.016;

        // Movement
        this.x += this.speedX;
        this.y += this.speedY;

        // Pulse opacity
        const pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset);
        this.opacity = this.baseOpacity + pulse * 0.15;
        this.opacity = Math.max(0.05, Math.min(1, this.opacity));

        // Pulse size
        this.size = this.baseSize + pulse * 0.3;

        // Mouse interaction
        if (mouseX !== null && mouseY !== null) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            this.mouseDistance = Math.sqrt(dx * dx + dy * dy);

            if (this.mouseDistance < mouseRadius) {
                this.isNearMouse = true;
                const force = (mouseRadius - this.mouseDistance) / mouseRadius;
                const angle = Math.atan2(dy, dx);

                // Push particles away from mouse
                this.speedX = this.baseSpeedX - Math.cos(angle) * force * 1.5;
                this.speedY = this.baseSpeedY - Math.sin(angle) * force * 1.5;

                // Increase opacity near mouse
                this.opacity = Math.min(1, this.baseOpacity + force * 0.5);

                // Increase size near mouse
                this.size = this.baseSize + force * 2;
            } else {
                this.isNearMouse = false;
                // Gradually return to base speed
                this.speedX += (this.baseSpeedX - this.speedX) * 0.02;
                this.speedY += (this.baseSpeedY - this.speedY) * 0.02;
            }
        }

        // Boundary wrapping
        if (this.x < -10) this.x = this.canvas.width + 10;
        if (this.x > this.canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = this.canvas.height + 10;
        if (this.y > this.canvas.height + 10) this.y = -10;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        this.ctx.fill();

        // Glow effect for larger particles
        if (this.size > 1.5 || this.isNearMouse) {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.15})`;
            this.ctx.fill();
        }
    }
}

/* ============================================
   2. SHOOTING STAR CLASS
============================================ */
class ShootingStar {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width * 1.5;
        this.y = -10;
        this.length = Math.random() * 60 + 30;
        this.speed = Math.random() * 6 + 4;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.6 + 0.4;
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.008;
        this.active = false;
        this.thickness = Math.random() * 1.5 + 0.5;
    }

    activate() {
        this.reset();
        this.active = true;
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height * 0.3;
    }

    update() {
        if (!this.active) return;

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life -= this.decay;

        if (this.life <= 0 || this.y > this.canvas.height || this.x > this.canvas.width) {
            this.active = false;
        }
    }

    draw() {
        if (!this.active) return;

        const tailX = this.x - Math.cos(this.angle) * this.length * this.life;
        const tailY = this.y - Math.sin(this.angle) * this.length * this.life;

        const gradient = this.ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(0.5, `rgba(0, 255, 136, ${this.opacity * this.life * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity * this.life})`);

        this.ctx.beginPath();
        this.ctx.moveTo(tailX, tailY);
        this.ctx.lineTo(this.x, this.y);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = this.thickness;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Head glow
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.thickness * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.life * 0.5})`;
        this.ctx.fill();
    }
}

/* ============================================
   3. PARTICLE SYSTEM
============================================ */
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.shootingStars = [];
        this.mouseX = null;
        this.mouseY = null;
        this.mouseRadius = 120;
        this.animationId = null;
        this.isRunning = false;
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        this.fpsInterval = 1000 / this.fps;
        this.lastFpsTime = 0;
        this.currentFps = 0;

        // Performance settings
        this.quality = this.detectQuality();
        this.config = this.getConfig(this.quality);

        // Connection lines
        this.connectionDistance = this.config.connectionDistance;
        this.showConnections = this.config.showConnections;

        this.init();
    }

    detectQuality() {
        const width = window.innerWidth;

        // Check for low performance indicators
        if (width <= 768) return 'low';
        if (width <= 1024) return 'medium';

        // Check device memory (if available)
        if (navigator.deviceMemory && navigator.deviceMemory < 4) return 'medium';

        // Check hardware concurrency
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return 'medium';

        return 'high';
    }

    getConfig(quality) {
        const configs = {
            low: {
                particleCount: 25,
                showConnections: false,
                connectionDistance: 0,
                shootingStarCount: 1,
                shootingStarInterval: 8000,
                mouseInteraction: false,
                maxFps: 30
            },
            medium: {
                particleCount: 50,
                showConnections: true,
                connectionDistance: 100,
                shootingStarCount: 2,
                shootingStarInterval: 5000,
                mouseInteraction: true,
                maxFps: 45
            },
            high: {
                particleCount: 80,
                showConnections: true,
                connectionDistance: 130,
                shootingStarCount: 3,
                shootingStarInterval: 3000,
                mouseInteraction: true,
                maxFps: 60
            }
        };

        return configs[quality] || configs.medium;
    }

    init() {
        if (!this.canvas) return;

        this.resize();
        this.createParticles();
        this.createShootingStars();
        this.bindEvents();
        this.start();
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
    }

    createParticles() {
        this.particles = [];

        const colors = [
            { r: 0, g: 255, b: 136 },     // Primary green
            { r: 88, g: 101, b: 242 },     // Discord blurple
            { r: 255, g: 255, b: 255 },    // White
            { r: 0, g: 200, b: 100 },      // Dark green
            { r: 120, g: 130, b: 245 }     // Light blurple
        ];

        for (let i = 0; i < this.config.particleCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const particle = new Particle(this.canvas, {
                color: color,
                size: Math.random() * 2 + 0.3,
                opacity: Math.random() * 0.4 + 0.05,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3
            });
            this.particles.push(particle);
        }
    }

    createShootingStars() {
        this.shootingStars = [];

        for (let i = 0; i < this.config.shootingStarCount; i++) {
            this.shootingStars.push(new ShootingStar(this.canvas));
        }

        // Periodically trigger shooting stars
        this.shootingStarTimer = setInterval(() => {
            if (!this.isRunning) return;

            const inactiveStar = this.shootingStars.find(s => !s.active);
            if (inactiveStar && Math.random() > 0.4) {
                inactiveStar.activate();
            }
        }, this.config.shootingStarInterval);
    }

    bindEvents() {
        // Mouse tracking
        if (this.config.mouseInteraction) {
            window.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });

            window.addEventListener('mouseleave', () => {
                this.mouseX = null;
                this.mouseY = null;
            });
        }

        // Resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resize();
                this.quality = this.detectQuality();
                this.config = this.getConfig(this.quality);

                // Recreate particles
                const diff = this.config.particleCount - this.particles.length;
                if (diff > 0) {
                    for (let i = 0; i < diff; i++) {
                        this.particles.push(new Particle(this.canvas, {
                            color: { r: 0, g: 255, b: 136 },
                            opacity: Math.random() * 0.4 + 0.05
                        }));
                    }
                } else if (diff < 0) {
                    this.particles.splice(this.config.particleCount);
                }
            }, 200);
        });

        // Visibility change - pause when hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        });
    }

    drawConnections() {
        if (!this.showConnections) return;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    const opacity = (1 - distance / this.connectionDistance) * 0.15;

                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }

        // Mouse connections
        if (this.mouseX !== null && this.mouseY !== null) {
            this.particles.forEach(p => {
                if (p.mouseDistance < this.mouseRadius) {
                    const opacity = (1 - p.mouseDistance / this.mouseRadius) * 0.3;

                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(this.mouseX, this.mouseY);
                    this.ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                    this.ctx.lineWidth = 0.6;
                    this.ctx.stroke();
                }
            });
        }
    }

    animate(currentTime) {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame((t) => this.animate(t));

        // FPS throttle
        const elapsed = currentTime - this.lastTime;
        if (elapsed < this.fpsInterval) return;
        this.lastTime = currentTime - (elapsed % this.fpsInterval);

        // FPS counter
        this.frameCount++;
        if (currentTime - this.lastFpsTime >= 1000) {
            this.currentFps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = currentTime;

            // Dynamic quality adjustment
            if (this.currentFps < 25 && this.config.particleCount > 20) {
                this.config.particleCount = Math.max(20, this.config.particleCount - 10);
                this.particles.splice(this.config.particleCount);
                this.showConnections = false;
            }
        }

        // Clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const time = currentTime / 1000;

        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update(time, this.mouseX, this.mouseY, this.mouseRadius);
            particle.draw();
        });

        // Draw connections
        this.drawConnections();

        // Update and draw shooting stars
        this.shootingStars.forEach(star => {
            star.update();
            star.draw();
        });
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.fpsInterval = 1000 / (this.config.maxFps || 60);
        this.lastTime = performance.now();
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    destroy() {
        this.stop();
        clearInterval(this.shootingStarTimer);
        this.particles = [];
        this.shootingStars = [];

        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    // Public methods
    setParticleCount(count) {
        this.config.particleCount = count;
        this.createParticles();
    }

    setMouseRadius(radius) {
        this.mouseRadius = radius;
    }

    toggleConnections(show) {
        this.showConnections = show;
    }

    getStats() {
        return {
            particles: this.particles.length,
            shootingStars: this.shootingStars.filter(s => s.active).length,
            fps: this.currentFps,
            quality: this.quality,
            running: this.isRunning
        };
    }
}

/* ============================================
   4. CSS FALLBACK PARTICLES
============================================ */
function createCSSFallbackParticles() {
    const container = document.createElement('div');
    container.className = 'css-particles';
    container.setAttribute('aria-hidden', 'true');

    const count = window.innerWidth <= 768 ? 15 : 30;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'css-particle';

        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const duration = Math.random() * 15 + 8;
        const delay = Math.random() * 10;
        const opacity = Math.random() * 0.4 + 0.1;

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            bottom: -10px;
            --duration: ${duration}s;
            --delay: ${delay}s;
            opacity: ${opacity};
            background: ${Math.random() > 0.5 ? '#00FF88' : '#5865F2'};
        `;

        container.appendChild(particle);
    }

    document.body.appendChild(container);
}

/* ============================================
   5. INITIALIZATION
============================================ */
let particleSystem = null;

function initParticles() {
    const canvas = document.getElementById('particles-canvas');

    if (!canvas) {
        console.warn('Particles canvas not found');
        return;
    }

    // Check for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.style.display = 'none';
        return;
    }

    // Check canvas support
    if (!canvas.getContext) {
        console.warn('Canvas not supported, using CSS fallback');
        canvas.style.display = 'none';
        createCSSFallbackParticles();
        return;
    }

    // Check WebGL for performance hint (not used, just detection)
    try {
        const testCanvas = document.createElement('canvas');
        const hasWebGL = !!(testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'));
        if (!hasWebGL) {
            console.log('WebGL not available - using optimized canvas');
        }
    } catch (e) {
        // Ignore
    }

    // Create particle system
    try {
        particleSystem = new ParticleSystem('particles-canvas');
        console.log('%c✨ Particle system initialized', 'color: #00FF88;');
        console.log(`   Quality: ${particleSystem.quality}`);
        console.log(`   Particles: ${particleSystem.config.particleCount}`);
        console.log(`   Connections: ${particleSystem.config.showConnections}`);
    } catch (error) {
        console.error('Particle system error:', error);
        canvas.style.display = 'none';
        createCSSFallbackParticles();
    }
}

// Init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
} else {
    initParticles();
}

/* ============================================
   6. EXPORTS
============================================ */
window.PakPhantomParticles = {
    system: () => particleSystem,
    restart: () => {
        if (particleSystem) {
            particleSystem.destroy();
        }
        initParticles();
    },
    stats: () => particleSystem ? particleSystem.getStats() : null,
    setCount: (count) => {
        if (particleSystem) particleSystem.setParticleCount(count);
    },
    toggleConnections: (show) => {
        if (particleSystem) particleSystem.toggleConnections(show);
    },
    stop: () => {
        if (particleSystem) particleSystem.stop();
    },
    start: () => {
        if (particleSystem) particleSystem.start();
    }
};