/* ============================================
   PakPhantom Website - TYPEWRITER JS
   ============================================
   Table of Contents:
   1. Typewriter Class
   2. Multi-line Typewriter
   3. Delete & Retype Effect
   4. Subtitle Cycler
   5. Code Typewriter
   6. Typewriter Queue
   7. Auto-Detection
   8. Initialization
============================================ */

'use strict';

/* ============================================
   1. TYPEWRITER CLASS
============================================ */
class Typewriter {
    constructor(element, options = {}) {
        this.el = element;
        this.words = options.words || element.dataset.typewriterWords?.split('|') || ['Hello World'];
        this.typingSpeed = options.typingSpeed || parseInt(element.dataset.typeSpeed) || 100;
        this.deletingSpeed = options.deletingSpeed || parseInt(element.dataset.deleteSpeed) || 50;
        this.pauseDuration = options.pauseDuration || parseInt(element.dataset.pauseDuration) || 2000;
        this.pauseBeforeDelete = options.pauseBeforeDelete || 1500;
        this.loop = options.loop !== undefined ? options.loop : true;
        this.cursor = options.cursor !== undefined ? options.cursor : true;
        this.cursorChar = options.cursorChar || '|';
        this.cursorElement = null;
        this.startDelay = options.startDelay || parseInt(element.dataset.startDelay) || 500;

        this.wordIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;
        this.isRunning = false;
        this.timeoutId = null;

        this.onType = options.onType || null;
        this.onWordComplete = options.onWordComplete || null;
        this.onComplete = options.onComplete || null;

        // Store original text
        this.originalText = element.textContent;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        // Create cursor element
        if (this.cursor) {
            this.createCursor();
        }

        // Clear element
        this.el.textContent = '';

        // Start after delay
        this.timeoutId = setTimeout(() => {
            this.type();
        }, this.startDelay);
    }

    createCursor() {
        // Check if cursor already exists (from HTML)
        const existingCursor = this.el.parentElement?.querySelector('.typewriter-cursor');
        if (existingCursor) {
            this.cursorElement = existingCursor;
            return;
        }

        this.cursorElement = document.createElement('span');
        this.cursorElement.className = 'typewriter-cursor';
        this.cursorElement.textContent = this.cursorChar;
        this.cursorElement.setAttribute('aria-hidden', 'true');

        // Insert after element
        if (this.el.nextSibling) {
            this.el.parentNode.insertBefore(this.cursorElement, this.el.nextSibling);
        } else {
            this.el.parentNode.appendChild(this.cursorElement);
        }
    }

    type() {
        if (!this.isRunning || this.isPaused) return;

        const currentWord = this.words[this.wordIndex];

        if (this.isDeleting) {
            // Deleting
            this.charIndex--;
            this.el.textContent = currentWord.substring(0, this.charIndex);

            if (this.charIndex === 0) {
                this.isDeleting = false;
                this.wordIndex++;

                // Check if we've gone through all words
                if (this.wordIndex >= this.words.length) {
                    if (this.loop) {
                        this.wordIndex = 0;
                    } else {
                        this.isRunning = false;
                        if (this.onComplete) this.onComplete();
                        return;
                    }
                }

                // Pause before typing next word
                this.timeoutId = setTimeout(() => this.type(), this.pauseDuration * 0.3);
                return;
            }

            this.timeoutId = setTimeout(() => this.type(), this.deletingSpeed);
        } else {
            // Typing
            this.charIndex++;
            this.el.textContent = currentWord.substring(0, this.charIndex);

            // Callback
            if (this.onType) {
                this.onType(this.el.textContent, this.charIndex, currentWord.length);
            }

            if (this.charIndex === currentWord.length) {
                // Word complete callback
                if (this.onWordComplete) {
                    this.onWordComplete(currentWord, this.wordIndex);
                }

                // Start deleting after pause
                this.isDeleting = true;
                this.timeoutId = setTimeout(() => this.type(), this.pauseBeforeDelete);
                return;
            }

            // Random speed variation for natural feel
            const variation = Math.random() * 40 - 20;
            const speed = Math.max(30, this.typingSpeed + variation);

            this.timeoutId = setTimeout(() => this.type(), speed);
        }
    }

    /* ============================================
       2. CONTROL METHODS
    ============================================ */
    stop() {
        this.isRunning = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.type();
    }

    reset() {
        this.stop();
        this.wordIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;
        this.el.textContent = '';
    }

    restart() {
        this.reset();
        this.start();
    }

    setWords(words) {
        this.words = words;
        this.restart();
    }

    setSpeed(typing, deleting) {
        this.typingSpeed = typing || this.typingSpeed;
        this.deletingSpeed = deleting || this.deletingSpeed;
    }

    destroy() {
        this.stop();
        if (this.cursorElement && this.cursorElement.parentNode) {
            this.cursorElement.parentNode.removeChild(this.cursorElement);
        }
        this.el.textContent = this.originalText;
    }
}

/* ============================================
   3. SUBTITLE CYCLER
============================================ */
class SubtitleCycler {
    constructor(element, options = {}) {
        this.el = element;
        this.phrases = options.phrases || element.dataset.cycleWords?.split('|') || [];
        this.interval = options.interval || parseInt(element.dataset.cycleInterval) || 3000;
        this.animation = options.animation || element.dataset.cycleAnimation || 'fade';
        this.phraseIndex = 0;
        this.intervalId = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning || !this.phrases.length) return;
        this.isRunning = true;

        this.el.textContent = this.phrases[0];

        this.intervalId = setInterval(() => {
            this.next();
        }, this.interval);
    }

    next() {
        this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
        const nextPhrase = this.phrases[this.phraseIndex];

        switch (this.animation) {
            case 'fade':
                this.fadeTransition(nextPhrase);
                break;
            case 'slide':
                this.slideTransition(nextPhrase);
                break;
            case 'flip':
                this.flipTransition(nextPhrase);
                break;
            default:
                this.el.textContent = nextPhrase;
        }
    }

    fadeTransition(text) {
        this.el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        this.el.style.opacity = '0';
        this.el.style.transform = 'translateY(-5px)';

        setTimeout(() => {
            this.el.textContent = text;
            this.el.style.transform = 'translateY(5px)';

            requestAnimationFrame(() => {
                this.el.style.opacity = '1';
                this.el.style.transform = 'translateY(0)';
            });
        }, 300);
    }

    slideTransition(text) {
        this.el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        this.el.style.transform = 'translateY(-20px)';
        this.el.style.opacity = '0';

        setTimeout(() => {
            this.el.textContent = text;
            this.el.style.transform = 'translateY(20px)';

            requestAnimationFrame(() => {
                this.el.style.transform = 'translateY(0)';
                this.el.style.opacity = '1';
            });
        }, 300);
    }

    flipTransition(text) {
        this.el.style.transition = 'transform 0.4s ease, opacity 0.2s ease';
        this.el.style.transform = 'perspective(400px) rotateX(90deg)';
        this.el.style.opacity = '0';

        setTimeout(() => {
            this.el.textContent = text;
            this.el.style.transform = 'perspective(400px) rotateX(-90deg)';

            requestAnimationFrame(() => {
                this.el.style.transform = 'perspective(400px) rotateX(0deg)';
                this.el.style.opacity = '1';
            });
        }, 400);
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    setIndex(index) {
        this.phraseIndex = index % this.phrases.length;
        this.el.textContent = this.phrases[this.phraseIndex];
    }

    destroy() {
        this.stop();
        this.el.textContent = this.phrases[0] || '';
    }
}

/* ============================================
   4. CODE TYPEWRITER
============================================ */
class CodeTypewriter {
    constructor(element, options = {}) {
        this.el = element;
        this.code = options.code || element.dataset.code || '';
        this.speed = options.speed || 30;
        this.highlightSyntax = options.highlight !== false;
        this.currentIndex = 0;
        this.isRunning = false;
        this.timeoutId = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.el.textContent = '';
        this.currentIndex = 0;
        this.typeNext();
    }

    typeNext() {
        if (!this.isRunning || this.currentIndex >= this.code.length) {
            this.isRunning = false;
            return;
        }

        this.currentIndex++;
        const currentText = this.code.substring(0, this.currentIndex);
        this.el.textContent = currentText;

        // Vary speed for natural feel
        let speed = this.speed;
        const currentChar = this.code[this.currentIndex - 1];

        if (currentChar === '\n') speed = this.speed * 3;
        else if (currentChar === ' ') speed = this.speed * 0.5;
        else if (currentChar === '{' || currentChar === '}') speed = this.speed * 2;

        this.timeoutId = setTimeout(() => this.typeNext(), speed);
    }

    stop() {
        this.isRunning = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    complete() {
        this.stop();
        this.el.textContent = this.code;
    }
}

/* ============================================
   5. AUTO-DETECTION & INIT
============================================ */
let typewriterInstances = [];
let cyclerInstances = [];

function initTypewriters() {
    // Typewriter elements
    const typewriterElements = document.querySelectorAll('[data-typewriter-words]');
    typewriterElements.forEach(el => {
        const tw = new Typewriter(el);
        typewriterInstances.push(tw);

        // Start when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tw.start();
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(el);
    });

    // Hero typewriter (special case)
    const heroTypewriter = document.getElementById('typewriter-text');
    if (heroTypewriter && !heroTypewriter.dataset.typewriterWords) {
        const tw = new Typewriter(heroTypewriter, {
            words: ['Pakistani', 'Ultimate', 'Amazing', 'Powerful', 'Desi 🇵🇰', 'Epic'],
            typingSpeed: 100,
            deletingSpeed: 60,
            pauseBeforeDelete: 2500,
            startDelay: 1500,
            cursor: false
        });
        typewriterInstances.push(tw);
        tw.start();
    }

    // Subtitle cyclers
    const cyclerElements = document.querySelectorAll('[data-cycle-words]');
    cyclerElements.forEach(el => {
        const cycler = new SubtitleCycler(el);
        cyclerInstances.push(cycler);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    cycler.start();
                } else {
                    cycler.stop();
                }
            });
        }, { threshold: 0.2 });

        observer.observe(el);
    });

    // Subtitle cycle (special case - hero subtitle)
    const subtitleCycle = document.getElementById('subtitle-cycle');
    if (subtitleCycle && !subtitleCycle.dataset.cycleWords) {
        const cycler = new SubtitleCycler(subtitleCycle, {
            phrases: [
                '94 commands, 22 games, and endless fun for your Discord server!',
                'From Wordle to Blackjack — hours of entertainment await!',
                'Marriage system, interactions, desi jokes and more!',
                'Economy system with daily rewards, work, and shop!',
                'Made in Pakistan, loved worldwide! 🇵🇰'
            ],
            interval: 4000,
            animation: 'fade'
        });
        cyclerInstances.push(cycler);
        cycler.start();
    }

    // Pause typewriters when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            typewriterInstances.forEach(tw => tw.pause());
            cyclerInstances.forEach(c => c.stop());
        } else {
            typewriterInstances.forEach(tw => tw.resume());
            cyclerInstances.forEach(c => c.start());
        }
    });

    const totalInstances = typewriterInstances.length + cyclerInstances.length;
    if (totalInstances > 0) {
        console.log(`%c⌨️ ${totalInstances} typewriter(s) initialized`, 'color: #00FF88;');
    }
}

// DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypewriters);
} else {
    initTypewriters();
}

/* ============================================
   6. EXPORTS
============================================ */
window.PakPhantomTypewriter = {
    Typewriter,
    SubtitleCycler,
    CodeTypewriter,
    instances: () => typewriterInstances,
    cyclers: () => cyclerInstances,
    create: (el, options) => {
        const tw = new Typewriter(el, options);
        typewriterInstances.push(tw);
        return tw;
    },
    createCycler: (el, options) => {
        const cycler = new SubtitleCycler(el, options);
        cyclerInstances.push(cycler);
        return cycler;
    },
    stopAll: () => {
        typewriterInstances.forEach(tw => tw.stop());
        cyclerInstances.forEach(c => c.stop());
    },
    reinit: initTypewriters
};