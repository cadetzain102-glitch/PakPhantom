/* ============================================
   PakPhantom Website - COUNTER JS
   ============================================
   Table of Contents:
   1. Counter Class
   2. Animated Counter
   3. Live Counter
   4. Countdown Timer
   5. Rolling Digits
   6. Stats Counter
   7. Observer Setup
   8. Initialization
============================================ */

'use strict';

/* ============================================
   1. COUNTER CLASS
============================================ */
class Counter {
    constructor(element, options = {}) {
        this.el = element;
        this.target = parseFloat(element.dataset.count || element.dataset.countTo || 0);
        this.current = parseFloat(options.startFrom || 0);
        this.duration = parseInt(options.duration || element.dataset.duration || 2000);
        this.suffix = element.dataset.suffix || options.suffix || '';
        this.prefix = element.dataset.prefix || options.prefix || '';
        this.decimals = parseInt(element.dataset.decimals || options.decimals || 0);
        this.separator = options.separator !== undefined ? options.separator : true;
        this.easing = options.easing || 'easeOutExpo';
        this.started = false;
        this.completed = false;
        this.startTime = null;
        this.animationId = null;
        this.onComplete = options.onComplete || null;
        this.onUpdate = options.onUpdate || null;
    }

    /* ============================================
       2. EASING FUNCTIONS
    ============================================ */
    ease(progress) {
        const easings = {
            linear: (t) => t,

            easeOutQuad: (t) => t * (2 - t),

            easeOutCubic: (t) => (--t) * t * t + 1,

            easeOutQuart: (t) => 1 - (--t) * t * t * t,

            easeOutQuint: (t) => 1 + (--t) * t * t * t * t,

            easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),

            easeInOutCubic: (t) => t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2,

            easeOutBounce: (t) => {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (t < 1 / d1) return n1 * t * t;
                else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
                else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
                else return n1 * (t -= 2.625 / d1) * t + 0.984375;
            },

            easeOutElastic: (t) => {
                if (t === 0 || t === 1) return t;
                return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
            },

            easeOutBack: (t) => {
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
            }
        };

        const easeFn = easings[this.easing] || easings.easeOutExpo;
        return easeFn(progress);
    }

    /* ============================================
       3. FORMAT NUMBER
    ============================================ */
    format(value) {
        let formatted;

        if (this.decimals > 0) {
            formatted = value.toFixed(this.decimals);
        } else {
            formatted = Math.floor(value).toString();
        }

        if (this.separator) {
            const parts = formatted.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            formatted = parts.join('.');
        }

        return this.prefix + formatted + this.suffix;
    }

    /* ============================================
       4. START ANIMATION
    ============================================ */
    start() {
        if (this.started) return;
        this.started = true;
        this.startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - this.startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            const easedProgress = this.ease(progress);

            this.current = this.current + (this.target - this.current) * (easedProgress > 0.99 ? 1 : easedProgress);

            // Edge case for final value
            if (progress >= 1) {
                this.current = this.target;
            }

            this.el.textContent = this.format(this.current);

            // Callback on update
            if (this.onUpdate) {
                this.onUpdate(this.current, this.target, progress);
            }

            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.completed = true;
                this.el.textContent = this.format(this.target);

                // Add completed class
                this.el.classList.add('counter-completed');

                // Callback on complete
                if (this.onComplete) {
                    this.onComplete(this.target);
                }
            }
        };

        this.animationId = requestAnimationFrame(animate);
    }

    /* ============================================
       5. CONTROL METHODS
    ============================================ */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    reset() {
        this.stop();
        this.started = false;
        this.completed = false;
        this.current = 0;
        this.el.textContent = this.format(0);
        this.el.classList.remove('counter-completed');
    }

    restart() {
        this.reset();
        this.start();
    }

    setTarget(newTarget) {
        this.target = newTarget;
        if (this.completed) {
            this.started = false;
            this.completed = false;
            this.start();
        }
    }

    getProgress() {
        if (!this.started) return 0;
        if (this.completed) return 1;
        return this.current / this.target;
    }
}

/* ============================================
   6. LIVE COUNTER (Real-time updating)
============================================ */
class LiveCounter {
    constructor(element, options = {}) {
        this.el = element;
        this.currentValue = parseInt(element.dataset.liveCount || 0);
        this.updateInterval = options.interval || 5000;
        this.variation = options.variation || 5;
        this.suffix = element.dataset.suffix || '';
        this.prefix = element.dataset.prefix || '';
        this.direction = options.direction || 'up';
        this.intervalId = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        this.el.textContent = this.format(this.currentValue);

        this.intervalId = setInterval(() => {
            const change = Math.floor(Math.random() * this.variation) + 1;

            if (this.direction === 'up') {
                this.currentValue += change;
            } else if (this.direction === 'down') {
                this.currentValue = Math.max(0, this.currentValue - change);
            } else {
                this.currentValue += Math.random() > 0.5 ? change : -change;
                this.currentValue = Math.max(0, this.currentValue);
            }

            this.animateChange();
        }, this.updateInterval);
    }

    animateChange() {
        // Quick scale animation
        this.el.style.transition = 'transform 0.15s ease';
        this.el.style.transform = 'scale(1.1)';

        setTimeout(() => {
            this.el.textContent = this.format(this.currentValue);
            this.el.style.transform = 'scale(1)';
        }, 150);
    }

    format(value) {
        const formatted = value.toLocaleString();
        return this.prefix + formatted + this.suffix;
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    setValue(value) {
        this.currentValue = value;
        this.el.textContent = this.format(value);
    }
}

/* ============================================
   7. COUNTDOWN TIMER
============================================ */
class CountdownTimer {
    constructor(element, options = {}) {
        this.el = element;
        this.targetDate = options.targetDate ? new Date(options.targetDate) : null;
        this.targetSeconds = options.seconds || 0;
        this.remaining = this.targetSeconds;
        this.format = options.format || 'hh:mm:ss';
        this.onTick = options.onTick || null;
        this.onComplete = options.onComplete || null;
        this.intervalId = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        this.intervalId = setInterval(() => {
            if (this.targetDate) {
                this.remaining = Math.max(0, Math.floor((this.targetDate - Date.now()) / 1000));
            } else {
                this.remaining = Math.max(0, this.remaining - 1);
            }

            this.render();

            if (this.onTick) {
                this.onTick(this.remaining);
            }

            if (this.remaining <= 0) {
                this.stop();
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }, 1000);

        this.render();
    }

    render() {
        const hours = Math.floor(this.remaining / 3600);
        const minutes = Math.floor((this.remaining % 3600) / 60);
        const seconds = this.remaining % 60;

        const pad = (n) => n.toString().padStart(2, '0');

        let display = this.format
            .replace('hh', pad(hours))
            .replace('mm', pad(minutes))
            .replace('ss', pad(seconds))
            .replace('h', hours)
            .replace('m', minutes)
            .replace('s', seconds);

        this.el.textContent = display;
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reset(seconds) {
        this.stop();
        this.remaining = seconds || this.targetSeconds;
        this.render();
    }
}

/* ============================================
   8. OBSERVER SETUP & AUTO-INIT
============================================ */
function initCounterObserver() {
    const counterElements = document.querySelectorAll('[data-count], [data-count-to]');
    if (!counterElements.length) return;

    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        counterElements.forEach(el => {
            const target = parseFloat(el.dataset.count || el.dataset.countTo || 0);
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            el.textContent = prefix + target.toLocaleString() + suffix;
        });
        return;
    }

    const counters = [];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const index = parseInt(el.dataset.counterIndex);
                const counter = counters[index];

                if (counter && !counter.started) {
                    // Stagger delay based on position
                    const delay = parseInt(el.dataset.counterDelay || 0);
                    setTimeout(() => counter.start(), delay);
                }

                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.4,
        rootMargin: '0px 0px -30px 0px'
    });

    counterElements.forEach((el, index) => {
        el.dataset.counterIndex = index;

        const easing = el.dataset.easing || 'easeOutExpo';
        const duration = parseInt(el.dataset.duration || 2000);

        const counter = new Counter(el, {
            easing: easing,
            duration: duration,
            onComplete: (target) => {
                // Add pulse effect on complete
                el.style.transition = 'transform 0.3s ease';
                el.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    el.style.transform = 'scale(1)';
                }, 300);
            }
        });

        counters.push(counter);
        observer.observe(el);
    });

    return counters;
}

/* ============================================
   9. LIVE COUNTERS AUTO-INIT
============================================ */
function initLiveCounters() {
    const liveElements = document.querySelectorAll('[data-live-count]');
    if (!liveElements.length) return;

    const liveCounters = [];

    liveElements.forEach(el => {
        const counter = new LiveCounter(el, {
            interval: parseInt(el.dataset.liveInterval || 5000),
            variation: parseInt(el.dataset.liveVariation || 3),
            direction: el.dataset.liveDirection || 'up'
        });

        liveCounters.push(counter);

        // Start when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counter.start();
                } else {
                    counter.stop();
                }
            });
        }, { threshold: 0.2 });

        observer.observe(el);
    });

    return liveCounters;
}

/* ============================================
   10. INITIALIZATION
============================================ */
let allCounters = [];
let allLiveCounters = [];

function initAllCounters() {
    allCounters = initCounterObserver() || [];
    allLiveCounters = initLiveCounters() || [];

    const totalCounters = allCounters.length + allLiveCounters.length;
    if (totalCounters > 0) {
        console.log(`%c🔢 ${totalCounters} counter(s) initialized`, 'color: #00FF88;');
    }
}

// DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllCounters);
} else {
    initAllCounters();
}

/* ============================================
   11. EXPORTS
============================================ */
window.PakPhantomCounters = {
    Counter,
    LiveCounter,
    CountdownTimer,
    getAll: () => allCounters,
    getLive: () => allLiveCounters,
    create: (element, options) => new Counter(element, options),
    createLive: (element, options) => new LiveCounter(element, options),
    createCountdown: (element, options) => new CountdownTimer(element, options),
    reinit: initAllCounters
};