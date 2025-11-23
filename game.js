// Canvas Setup with HiDPI/Retina Support
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// HiDPI Support - Automatically scale for retina displays
const dpr = window.devicePixelRatio || 1;
const baseWidth = 900;
const baseHeight = 450;

// Set display size (CSS pixels)
canvas.style.width = baseWidth + 'px';
canvas.style.height = baseHeight + 'px';

// Set actual size in memory (scaled by DPR for retina)
canvas.width = baseWidth * dpr;
canvas.height = baseHeight * dpr;

// Scale all drawing operations
ctx.scale(dpr, dpr);

// Enable better anti-aliasing and image smoothing
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

// Game Constants
const GRAVITY = 0.45;
const JUMP_POWER = -11;
const MAX_JUMP_POWER = -14;
const JUMP_HOLD_BOOST = 0.3;
const GROUND_LEVEL = baseHeight - 80;
const LEVEL_DURATION = 180; // 3 minutes per level
const TOTAL_LEVELS = 6;

// Level Requirements (books to collect per level) - BALANCED!
const LEVEL_REQUIREMENTS = [
    { level: 1, name: 'Antike', books: 20, era: 0, color: '#FFD700' },
    { level: 2, name: 'Mittelalter', books: 24, era: 1, color: '#8B4513' },
    { level: 3, name: 'Renaissance', books: 28, era: 2, color: '#FF6347' },
    { level: 4, name: 'Aufklärung', books: 32, era: 3, color: '#4169E1' },
    { level: 5, name: 'Moderne', books: 36, era: 4, color: '#9370DB' },
    { level: 6, name: 'Gegenwart', books: 40, era: 5, color: '#00CED1' }
];

// Physics constants
const AIR_CONTROL = 0.3;
const GROUND_FRICTION = 0.85;

// Difficulty Settings
const DIFFICULTY = {
    easy: { speed: 3, obstacleInterval: 180, name: 'Nachdenklich' },
    normal: { speed: 4.5, obstacleInterval: 140, name: 'Philosophisch' },
    hard: { speed: 6, obstacleInterval: 100, name: 'Erleuchtung' }
};

let currentDifficulty = 'easy';
let tutorialMode = true;
let tutorialStep = 0;

// Game timing
let lastTime = 0;
let deltaTime = 0;
let gameTime = 0;
let timeRemaining = LEVEL_DURATION;
let currentLevel = 1;
let booksCollected = 0;
let totalBooksCollected = 0;
let achievements = {
    speedDemon: false,
    comboMaster: false,
    powerUpCollector: false,
    allLevelsComplete: false
};
let maxCombo = 0;
let powerupsCollected = 0;

// Sound System
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;

// Enhanced Sound System with ADSR Envelopes
function playSound(frequency, duration, type = 'sine', volume = 0.3, envelope = {}) {
    if (!soundEnabled || !audioContext) return;

    const { attack = 0.01, decay = 0.1, sustain = 0.7, release = 0.2 } = envelope;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    // Routing: Oscillator -> Filter -> Gain -> Destination
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Oscillator setup
    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // Lowpass filter for warmth (reduces harsh high frequencies)
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    const now = audioContext.currentTime;

    // ADSR Envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack); // Attack
    gainNode.gain.linearRampToValueAtTime(volume * sustain, now + attack + decay); // Decay to Sustain
    gainNode.gain.setValueAtTime(volume * sustain, now + duration - release); // Hold Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

    oscillator.start(now);
    oscillator.stop(now + duration);
}

// Play multiple notes simultaneously (chords/harmony)
function playChord(frequencies, duration, type = 'sine', volume = 0.2, envelope = {}) {
    frequencies.forEach(freq => playSound(freq, duration, type, volume, envelope));
}

function playJumpSound() {
    // Modern "whoosh" jump sound
    playSound(440, 0.12, 'triangle', 0.25, { attack: 0.005, decay: 0.03, sustain: 0.3, release: 0.08 });
    setTimeout(() => playSound(660, 0.08, 'sine', 0.15, { attack: 0.002, decay: 0.02, sustain: 0.5, release: 0.05 }), 20);
}

function playCollectSound() {
    // Magical sparkle with major chord (C-E-G)
    const chord = [523.25, 659.25, 783.99]; // C5, E5, G5
    playChord(chord, 0.25, 'sine', 0.15, { attack: 0.002, decay: 0.08, sustain: 0.6, release: 0.15 });

    // Sparkle overtone
    setTimeout(() => playSound(1318.51, 0.15, 'sine', 0.08, { attack: 0.001, decay: 0.05, sustain: 0.4, release: 0.1 }), 40);
}

function playBounceSound() {
    // Bouncy "boing" with pitch bend effect
    playSound(330, 0.08, 'triangle', 0.22, { attack: 0.005, decay: 0.02, sustain: 0.5, release: 0.05 });
    setTimeout(() => playSound(220, 0.12, 'triangle', 0.18, { attack: 0.01, decay: 0.03, sustain: 0.6, release: 0.08 }), 30);
}

function playPowerUpSound() {
    // Epic arpeggio with bass punch (A major: A-C#-E-A)
    const notes = [220, 277.18, 329.63, 440]; // A3, C#4, E4, A4

    // Bass punch
    playSound(110, 0.15, 'sine', 0.3, { attack: 0.005, decay: 0.05, sustain: 0.4, release: 0.1 });

    // Arpeggio
    notes.forEach((freq, i) => {
        setTimeout(() => {
            playSound(freq, 0.2, 'triangle', 0.2, { attack: 0.005, decay: 0.06, sustain: 0.7, release: 0.13 });
        }, i * 60);
    });

    // Bright harmony on top
    setTimeout(() => playChord([880, 1108.73], 0.3, 'sine', 0.12, { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.2 }), 180);
}

function playEraChangeSound() {
    // Triumphant ascending melody with harmony (C-E-G-C major scale)
    const melody = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    // Bass foundation
    playSound(130.81, 0.6, 'sine', 0.25, { attack: 0.01, decay: 0.15, sustain: 0.7, release: 0.25 });

    // Melody with harmony
    melody.forEach((freq, i) => {
        setTimeout(() => {
            // Main note
            playSound(freq, 0.25, 'triangle', 0.22, { attack: 0.008, decay: 0.08, sustain: 0.65, release: 0.15 });

            // Harmony (fifth above)
            playSound(freq * 1.5, 0.25, 'sine', 0.15, { attack: 0.01, decay: 0.09, sustain: 0.6, release: 0.15 });
        }, i * 120);
    });

    // Final celebration chord
    setTimeout(() => {
        playChord([1046.50, 1318.51, 1567.98], 0.5, 'sine', 0.18, { attack: 0.02, decay: 0.15, sustain: 0.75, release: 0.3 });
    }, 480);
}

// Enhanced Eras with beautiful colors
const ERAS = [
    {
        name: 'Antike',
        primaryColor: '#FFD700',
        secondaryColor: '#FFA500',
        accentColor: '#FF8C00',
        bgGradient: ['#87CEEB', '#FDB813', '#FF6B35'],
        groundColor: '#D4AF37',
        scoreThreshold: 0,
        theme: '🏛️ Erkenne dich selbst',
        decorationType: 'columns',
        skyElements: { type: 'clouds', color: 'rgba(255, 255, 255, 0.6)' }
    },
    {
        name: 'Mittelalter',
        primaryColor: '#8B4513',
        secondaryColor: '#A0522D',
        accentColor: '#CD853F',
        bgGradient: ['#4A5568', '#8B7355', '#DEB887'],
        groundColor: '#654321',
        scoreThreshold: 800,
        theme: '⛪ Glaube und Vernunft',
        decorationType: 'castles',
        skyElements: { type: 'stars', color: 'rgba(255, 255, 200, 0.8)' }
    },
    {
        name: 'Renaissance',
        primaryColor: '#FF6347',
        secondaryColor: '#FF7F50',
        accentColor: '#FFD700',
        bgGradient: ['#FFA07A', '#FA8072', '#F4A460'],
        groundColor: '#CD853F',
        scoreThreshold: 1800,
        theme: '🎨 Humanismus',
        decorationType: 'art',
        skyElements: { type: 'birds', color: 'rgba(139, 69, 19, 0.5)' }
    },
    {
        name: 'Aufklärung',
        primaryColor: '#4169E1',
        secondaryColor: '#1E90FF',
        accentColor: '#00BFFF',
        bgGradient: ['#87CEEB', '#6495ED', '#4682B4'],
        groundColor: '#4169E1',
        scoreThreshold: 3000,
        theme: '💡 Sapere Aude!',
        decorationType: 'books',
        skyElements: { type: 'rays', color: 'rgba(255, 255, 100, 0.3)' }
    },
    {
        name: 'Moderne',
        primaryColor: '#9370DB',
        secondaryColor: '#8A2BE2',
        accentColor: '#BA55D3',
        bgGradient: ['#9370DB', '#8A2BE2', '#4B0082'],
        groundColor: '#663399',
        scoreThreshold: 5000,
        theme: '🏭 Existenz & Sein',
        decorationType: 'cities',
        skyElements: { type: 'smoke', color: 'rgba(100, 100, 100, 0.4)' }
    },
    {
        name: 'Gegenwart',
        primaryColor: '#00CED1',
        secondaryColor: '#00BFFF',
        accentColor: '#1E90FF',
        bgGradient: ['#00CED1', '#48D1CC', '#20B2AA'],
        groundColor: '#008B8B',
        scoreThreshold: 7500,
        theme: '💻 Digitale Ethik',
        decorationType: 'digital',
        skyElements: { type: 'pixels', color: 'rgba(0, 255, 255, 0.6)' }
    }
];

// Philosophers
const PHILOSOPHERS = [
    {
        name: 'Sokrates',
        icon: '🧔',
        era: 'Antike',
        lived: '469-399 v.Chr.',
        idea: 'Ich weiß, dass ich nichts weiß',
        jumpPower: 1.0,
        airControl: 1.0,
        color: '#FFD700'
    },
    {
        name: 'Augustinus',
        icon: '📿',
        era: 'Mittelalter',
        lived: '354-430 n.Chr.',
        idea: 'Glaube sucht Verständnis',
        jumpPower: 1.15,
        airControl: 0.9,
        color: '#8B4513'
    },
    {
        name: 'Kant',
        icon: '🎩',
        era: 'Aufklärung',
        lived: '1724-1804',
        idea: 'Handle nach dem kategorischen Imperativ',
        jumpPower: 0.95,
        airControl: 1.2,
        color: '#4169E1'
    }
];

// Collectibles with lane bonuses
const PHILOSOPHICAL_WORKS = [
    { name: 'Politeia', author: 'Platon', icon: '📕', era: 0, basePoints: 100 },
    { name: 'Nikomachische Ethik', author: 'Aristoteles', icon: '📗', era: 0, basePoints: 100 },
    { name: 'Confessiones', author: 'Augustinus', icon: '📘', era: 1, basePoints: 120 },
    { name: 'Summa Theologica', author: 'Thomas', icon: '📙', era: 1, basePoints: 120 },
    { name: 'Der Fürst', author: 'Machiavelli', icon: '📕', era: 2, basePoints: 150 },
    { name: 'Kritik d. r. Vernunft', author: 'Kant', icon: '📗', era: 3, basePoints: 150 },
    { name: 'Leviathan', author: 'Hobbes', icon: '📘', era: 3, basePoints: 150 },
    { name: 'Zarathustra', author: 'Nietzsche', icon: '📙', era: 4, basePoints: 200 },
    { name: 'Sein und Zeit', author: 'Heidegger', icon: '📕', era: 4, basePoints: 200 },
    { name: 'Theorie d. Gerechtigkeit', author: 'Rawls', icon: '📗', era: 5, basePoints: 250 }
];

// Dilemmas - now just slow you down or bounce you back!
const PHILOSOPHICAL_DILEMMAS = [
    { name: 'Höhlengleichnis', icon: '🕳️', era: 0, effect: 'slow' },
    { name: 'Sokratisches Paradox', icon: '❓', era: 0, effect: 'bounce' },
    { name: 'Theodizee', icon: '⚖️', era: 1, effect: 'slow' },
    { name: 'Gottesbeweis', icon: '✝️', era: 1, effect: 'bounce' },
    { name: 'Gedankenexperiment', icon: '🧪', era: 2, effect: 'slow' },
    { name: 'Antinomien', icon: '⚡', era: 3, effect: 'bounce' },
    { name: 'Kategorischer Imperativ', icon: '📜', era: 3, effect: 'slow' },
    { name: 'Wille zur Macht', icon: '💪', era: 4, effect: 'bounce' },
    { name: 'Existenzkrise', icon: '😰', era: 4, effect: 'slow' },
    { name: 'Trolley-Problem', icon: '🚃', era: 5, effect: 'bounce' },
    { name: 'KI-Ethik', icon: '🤖', era: 5, effect: 'slow' }
];

// Power-Ups - 9 total (3 old + 6 new)
const POWERUP_TYPES = [
    // Original Power-Ups
    {
        name: 'Zeitlupe',
        icon: '⏱️',
        duration: 5000,
        color: '#00FFFF',
        effect: 'slowmo'
    },
    {
        name: 'Magnet',
        icon: '🧲',
        duration: 7000,
        color: '#FF69B4',
        effect: 'magnet'
    },
    {
        name: 'Doppelsprung',
        icon: '⏫',
        duration: 10000,
        color: '#FFD700',
        effect: 'doublejump'
    },
    // New Power-Ups - EXTENDED DURATIONS!
    {
        name: 'Time Freeze',
        icon: '⏸️',
        duration: 6000,
        color: '#4169E1',
        effect: 'timefreeze'
    },
    {
        name: 'Invincibility',
        icon: '⭐',
        duration: 8000,
        color: '#FFD700',
        effect: 'invincibility'
    },
    {
        name: 'Score Multiplier',
        icon: '💎',
        duration: 12000,
        color: '#9370DB',
        effect: 'scoremultiplier'
    },
    {
        name: 'Speed Boost',
        icon: '⚡',
        duration: 7000,
        color: '#FF6347',
        effect: 'speedboost'
    },
    {
        name: 'Ghost Mode',
        icon: '👻',
        duration: 7000,
        color: '#E0E0E0',
        effect: 'ghostmode'
    },
    {
        name: 'Extra Time',
        icon: '⏰',
        duration: 0,
        color: '#00CED1',
        effect: 'extratime'
    }
];

// Quotes
const QUOTES = [
    { text: "Ich weiß, dass ich nichts weiß", author: "Sokrates" },
    { text: "Cogito, ergo sum", author: "Descartes" },
    { text: "Sapere aude!", author: "Kant" },
    { text: "Die Hölle, das sind die anderen", author: "Sartre" },
    { text: "Gott ist tot", author: "Nietzsche" },
    { text: "Das Sein bestimmt das Bewusstsein", author: "Marx" }
];

// Game State
let gameRunning = false;
let gamePaused = false;
let score = 0;
let wisdom = 0;
let highScore = localStorage.getItem('philosophyHighScore') || 0;
let currentEraIndex = 0;
let selectedPhilosopherIndex = 0;
let animationId;
let particles = [];
let skyElements = [];
let collectibles = [];
let obstacles = [];
let powerups = [];
let floatingTexts = [];
let obstacleTimer = 0;
let collectibleTimer = 0;
let powerupTimer = 0;
let comboCount = 0;
let comboMultiplier = 1;
let lastCollectTime = 0;
let tutorialMessages = [];
let screenShake = 0;
let backgroundOffset = 0;
let slowMotionTimer = 0;
let chromaticAberration = 0;
let vignette = 0;
let fireworksTimer = 0;
let backgroundLayers = [];

// Active power-ups
let activePowerups = {
    slowmo: 0,
    magnet: 0,
    doublejump: 0,
    timefreeze: 0,
    invincibility: 0,
    scoremultiplier: 0,
    speedboost: 0,
    ghostmode: 0
};

// Tutorial
const TUTORIAL_STEPS = [
    { text: "Willkommen! Sammle philosophische Werke! 📚", duration: 3000 },
    { text: "Tap/Klick zum Springen! Halten = höher! ⬆️", duration: 3500 },
    { text: "Höhere Lanes = Mehr Punkte! 🎯", duration: 3000 },
    { text: "Dilemmata verlangsamen dich nur! 💨", duration: 3000 },
    { text: "Sammle so viel wie möglich in 90s! ⏱️", duration: 3500 }
];

// Lane system
const LANES = [
    { y: GROUND_LEVEL - 180, multiplier: 3, name: 'Hoch' },    // Top lane
    { y: GROUND_LEVEL - 110, multiplier: 2, name: 'Mittel' },  // Mid lane
    { y: GROUND_LEVEL - 50, multiplier: 1, name: 'Tief' }      // Low lane
];

// Player with enhanced physics
const player = {
    x: 100,
    y: GROUND_LEVEL,
    width: 55,
    height: 55,
    velocityY: 0,
    velocityX: 0,
    isJumping: false,
    jumpHeld: false,
    canDoubleJump: false,
    hasDoubleJumped: false,
    rotation: 0,
    squashStretch: { x: 1, y: 1 },
    trail: [],
    bounceTimer: 0,
    slowTimer: 0,

    draw() {
        // MEGA Enhanced trail with MORE layers!
        ctx.save();
        this.trail.forEach((point, i) => {
            const alpha = (i / this.trail.length) * 0.5;
            const era = ERAS[currentEraIndex];
            ctx.globalAlpha = alpha;

            // Triple-layer trail for THICKNESS
            for (let layer = 0; layer < 3; layer++) {
                const offset = layer * 3;
                const gradient = ctx.createRadialGradient(
                    point.x, point.y, 0,
                    point.x, point.y, 35 + offset
                );
                gradient.addColorStop(0, era.primaryColor);
                gradient.addColorStop(0.5, era.secondaryColor);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;

                const size = (i / this.trail.length) * this.width * 1.1;
                ctx.font = `${size}px Philosopher, Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = era.primaryColor;
                ctx.shadowBlur = 20;
                ctx.fillText(PHILOSOPHERS[selectedPhilosopherIndex].icon, point.x, point.y);
            }
        });
        ctx.restore();

        ctx.save();

        // Beautiful shadow
        const shadowScale = Math.max(0.4, 1 - (GROUND_LEVEL - this.y) / 300);
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, GROUND_LEVEL + this.height + 5,
            0,
            this.x + this.width / 2, GROUND_LEVEL + this.height + 5,
            this.width * shadowScale
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, GROUND_LEVEL + this.height + 8,
                   this.width / 2 * shadowScale, 10 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Character with squash & stretch
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.scale(this.squashStretch.x, this.squashStretch.y);

        const era = ERAS[currentEraIndex];
        const philosopher = PHILOSOPHERS[selectedPhilosopherIndex];

        // Pulsing aura
        if (this.isJumping || activePowerups.doublejump > 0) {
            const pulseSize = 40 + Math.sin(Date.now() / 150) * 6;
            const auraGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, pulseSize);
            auraGradient.addColorStop(0, 'transparent');
            auraGradient.addColorStop(0.7, era.primaryColor + '60');
            auraGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = auraGradient;
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Invincibility star aura
        if (activePowerups.invincibility > 0) {
            const starPulse = 50 + Math.sin(Date.now() / 100) * 8;
            const starGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, starPulse);
            starGradient.addColorStop(0, 'transparent');
            starGradient.addColorStop(0.6, '#FFD700' + '80');
            starGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = starGradient;
            ctx.beginPath();
            ctx.arc(0, 0, starPulse, 0, Math.PI * 2);
            ctx.fill();
        }

        // Ghost mode transparency
        if (activePowerups.ghostmode > 0) {
            ctx.globalAlpha = 0.5;
        }

        // Glow effect
        ctx.shadowColor = philosopher.color;
        ctx.shadowBlur = 20;
        ctx.font = 'bold 50px Philosopher, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(philosopher.icon, 0, 0);

        // Slow effect
        if (this.slowTimer > 0) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#0000FF';
            ctx.font = 'bold 30px Philosopher, Arial';
            ctx.fillText('💤', 15, -15);
        }

        ctx.restore();
    },

    update(dt) {
        // Slow effect
        if (this.slowTimer > 0) {
            this.slowTimer--;
            dt *= 0.5;
        }

        // Bounce effect
        if (this.bounceTimer > 0) {
            this.bounceTimer--;
        }

        // Apply gravity
        this.velocityY += GRAVITY * dt;

        // Variable jump height - hold for higher jump!
        if (this.jumpHeld && this.velocityY < 0) {
            this.velocityY -= JUMP_HOLD_BOOST * dt;
        }

        this.y += this.velocityY * dt;

        // Ground collision
        if (this.y >= GROUND_LEVEL) {
            this.y = GROUND_LEVEL;
            this.velocityY = 0;
            this.isJumping = false;
            this.hasDoubleJumped = false;
            this.canDoubleJump = activePowerups.doublejump > 0;

            // Landing squash
            if (this.squashStretch.y > 1.1) {
                this.squashStretch = { x: 1.3, y: 0.7 };
                createParticles(this.x + this.width / 2, this.y + this.height,
                              ERAS[currentEraIndex].primaryColor, 6);
            }
        }

        // Rotation
        if (this.isJumping) {
            this.rotation += 0.05 * dt;
        } else {
            this.rotation *= 0.92;
        }

        // Squash & stretch recovery
        this.squashStretch.x += (1 - this.squashStretch.x) * 0.15;
        this.squashStretch.y += (1 - this.squashStretch.y) * 0.15;

        // Trail - EVERY FRAME for MAXIMUM smoothness!
        if (gameRunning) {
            this.trail.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2
            });
            if (this.trail.length > 15) this.trail.shift(); // Longer trail!
        }
    },

    jump(isHolding = true) {
        if (!gameRunning || gamePaused) return;

        this.jumpHeld = isHolding;

        // Ground jump
        if (!this.isJumping) {
            this.performJump();
        }
        // Double jump
        else if (this.canDoubleJump && !this.hasDoubleJumped) {
            this.hasDoubleJumped = true;
            this.canDoubleJump = false;
            this.velocityY = JUMP_POWER * 0.9;
            this.squashStretch = { x: 0.7, y: 1.4 };
            createParticles(this.x + this.width / 2, this.y + this.height,
                          '#FFD700', 15);
            playJumpSound();
        }
    },

    releaseJump() {
        this.jumpHeld = false;
    },

    performJump() {
        const philosopher = PHILOSOPHERS[selectedPhilosopherIndex];
        this.velocityY = JUMP_POWER * philosopher.jumpPower;
        this.isJumping = true;
        this.squashStretch = { x: 0.8, y: 1.4 };
        createParticles(this.x + this.width / 2, this.y + this.height,
                      ERAS[currentEraIndex].primaryColor, 12);
        playJumpSound();

        if (tutorialMode && tutorialStep === 1) {
            tutorialStep = 2;
            showTutorialMessage(2);
        }
    },

    bounce() {
        this.velocityY = -8;
        this.bounceTimer = 30;
        screenShake = 8;
        createParticles(this.x + this.width / 2, this.y + this.height / 2, '#FF6347', 20);
        playBounceSound();
    },

    slow() {
        this.slowTimer = 60;
    },

    reset() {
        this.y = GROUND_LEVEL;
        this.velocityY = 0;
        this.velocityX = 0;
        this.isJumping = false;
        this.jumpHeld = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.rotation = 0;
        this.squashStretch = { x: 1, y: 1 };
        this.trail = [];
        this.bounceTimer = 0;
        this.slowTimer = 0;
    }
};

// Enhanced Particle with types
class Particle {
    constructor(x, y, color, velocityX = null, velocityY = null, type = 'normal') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.velocityX = velocityX !== null ? velocityX : (Math.random() - 0.5) * 6;
        this.velocityY = velocityY !== null ? velocityY : (Math.random() - 0.5) * 6 - 3;
        this.size = type === 'star' ? Math.random() * 8 + 4 : Math.random() * 6 + 2;
        this.life = 1;
        this.decay = type === 'star' ? 0.008 : 0.012;
        this.gravity = type === 'confetti' ? 0.2 : 0.12;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.initialLife = 1;
    }

    update(dt) {
        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;
        this.velocityY += this.gravity * dt;
        this.life -= this.decay * dt;
        this.rotation += this.rotationSpeed * dt;

        // Add drag
        this.velocityX *= 0.98;
        this.velocityY *= 0.98;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;

        if (this.type === 'star') {
            // Animated star
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 15;

            // Draw star shape
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const radius = i % 2 === 0 ? this.size : this.size * 0.4;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'confetti') {
            // Rectangle confetti
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size * 1.5);
        } else {
            // Normal particle with glow
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

function createParticles(x, y, color, count, type = 'normal') {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color, null, null, type));
    }
}

// Create explosion effect
function createExplosion(x, y, color, intensity = 1) {
    const count = Math.floor(50 * intensity);
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = (Math.random() * 8 + 4) * intensity;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        particles.push(new Particle(x, y, color, vx, vy, 'normal'));
    }
}

// Create firework burst
function createFirework(x, y) {
    const colors = ['#FFD700', '#FF6347', '#4169E1', '#9370DB', '#00CED1', '#FF69B4'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Main burst
    for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2 * i) / 40;
        const speed = Math.random() * 6 + 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        particles.push(new Particle(x, y, color, vx, vy, 'star'));
    }

    // Confetti
    for (let i = 0; i < 20; i++) {
        const vx = (Math.random() - 0.5) * 8;
        const vy = (Math.random() - 0.5) * 8 - 5;
        particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)], vx, vy, 'confetti'));
    }
}

// Light Beam Effect - MAGICAL!
function createLightBeam(x1, y1, x2, y2, color) {
    floatingTexts.push({
        x: x1,
        y: y1,
        targetX: x2,
        targetY: y2,
        color: color,
        life: 1,
        isBeam: true,
        update(dt) {
            this.life -= 0.05 * dt;
        },
        draw() {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.life * 0.6;

            // Thicker beam with gradient
            const gradient = ctx.createLinearGradient(this.x, this.y, this.targetX, this.targetY);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.5, adjustColor(this.color, 60));
            gradient.addColorStop(1, 'transparent');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 8;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.targetX, this.targetY);
            ctx.stroke();

            // Inner bright line
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#FFFFFF';
            ctx.shadowBlur = 10;
            ctx.stroke();

            ctx.restore();
        },
        isDead() {
            return this.life <= 0;
        }
    });
}

// Sky Elements (clouds, stars, etc.)
class SkyElement {
    constructor(type) {
        this.type = type;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * (canvas.height - 200);
        this.size = Math.random() * 40 + 20;
        this.speed = Math.random() * 0.3 + 0.1;
        this.opacity = Math.random() * 0.4 + 0.2;
        this.phase = Math.random() * Math.PI * 2;
    }

    update(dt) {
        this.x -= this.speed * dt;
        if (this.x + this.size < 0) {
            this.x = canvas.width + this.size;
            this.y = Math.random() * (canvas.height - 200);
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        if (this.type === 'clouds') {
            // Fluffy cloud
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
            ctx.arc(this.x + this.size * 0.5, this.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.arc(this.x + this.size, this.y, this.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'stars') {
            // Twinkling star
            const twinkle = Math.sin(Date.now() / 500 + this.phase) * 0.3 + 0.7;
            ctx.globalAlpha = this.opacity * twinkle;
            ctx.fillStyle = '#FFFFCC';
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const radius = i % 2 === 0 ? this.size * 0.4 : this.size * 0.15;
                const x = this.x + Math.cos(angle) * radius;
                const y = this.y + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'birds') {
            // Simple bird
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x - this.size * 0.3, this.y);
            ctx.quadraticCurveTo(this.x, this.y - this.size * 0.2, this.x + this.size * 0.3, this.y);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// Floating Text
class FloatingText {
    constructor(x, y, text, color = '#FFFFFF', size = 24) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.velocityY = -1.5;
        this.life = 1;
        this.decay = 0.015;
    }

    update(dt) {
        this.y += this.velocityY * dt;
        this.life -= this.decay * dt;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.font = `bold ${this.size}px Philosopher, Arial`;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Collectible with beautiful design
class Collectible {
    constructor(lane = 0) {
        this.width = 40;
        this.height = 40;
        this.x = canvas.width + 100;

        this.lane = LANES[lane] || LANES[1];
        this.baseY = this.lane.y;
        this.y = this.baseY;

        const diffSettings = DIFFICULTY[currentDifficulty];
        const speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
        this.speed = (diffSettings.speed + Math.min(score / 4000, 2)) * speedMult;
        this.rotation = 0;
        this.bouncePhase = Math.random() * Math.PI * 2;

        const eraWorks = PHILOSOPHICAL_WORKS.filter(w => w.era === currentEraIndex);
        const allWorks = eraWorks.length > 0 ? eraWorks : PHILOSOPHICAL_WORKS;
        this.work = allWorks[Math.floor(Math.random() * allWorks.length)];
    }

    draw() {
        // Smooth bouncing
        const bounce = Math.sin(Date.now() / 180 + this.bouncePhase) * 10;
        this.y = this.baseY + bounce;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        // Beautiful glow rings
        for (let i = 0; i < 3; i++) {
            const pulseSize = 25 + i * 8 + Math.sin(Date.now() / 120 + i) * 4;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.7, '#FFD700' + Math.floor((0.3 - i * 0.1) * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Icon with shadow
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 25;
        ctx.font = 'bold 36px Philosopher, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.work.icon, 0, 0);

        ctx.restore();

        // Label
        ctx.save();
        ctx.font = 'bold 11px Philosopher, Arial';
        const textWidth = ctx.measureText(this.work.name).width + 10;

        const labelGradient = ctx.createLinearGradient(
            this.x + this.width / 2 - textWidth / 2, this.y - 24,
            this.x + this.width / 2 + textWidth / 2, this.y - 24
        );
        labelGradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        labelGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.9)');
        labelGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

        ctx.fillStyle = labelGradient;
        ctx.fillRect(this.x + this.width / 2 - textWidth / 2, this.y - 26, textWidth, 20);

        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.fillText(this.work.name, this.x + this.width / 2, this.y - 16);

        // Lane bonus indicator
        if (this.lane.multiplier > 1) {
            ctx.font = 'bold 10px Philosopher, Arial';
            ctx.fillStyle = '#FF6347';
            ctx.fillText(`x${this.lane.multiplier}`, this.x + this.width / 2, this.y - 34);
        }
        ctx.restore();
    }

    update(dt) {
        let speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
        // Speed boost increases obstacle speed (making game harder/faster)
        speedMult *= activePowerups.speedboost > 0 ? 1.5 : 1;
        this.x -= this.speed * speedMult * dt;
        this.rotation += 0.03 * dt;

        // Magnet
        if (activePowerups.magnet > 0) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 250) {
                this.x += dx * 0.06 * dt;
                this.y += dy * 0.06 * dt;
                this.baseY = this.y;
            }
        }
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Obstacle - now just bounces/slows!
class Obstacle {
    constructor() {
        this.width = 55;
        this.baseHeight = 65 + Math.random() * 25;
        this.height = this.baseHeight;
        this.x = canvas.width + 100;
        this.y = GROUND_LEVEL + player.height - this.height;

        const diffSettings = DIFFICULTY[currentDifficulty];
        const speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
        this.speed = (diffSettings.speed + Math.min(score / 4000, 2)) * speedMult;

        const eraProblems = PHILOSOPHICAL_DILEMMAS.filter(d => d.era === currentEraIndex);
        const allProblems = eraProblems.length > 0 ? eraProblems : PHILOSOPHICAL_DILEMMAS;
        this.dilemma = allProblems[Math.floor(Math.random() * allProblems.length)];
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    draw() {
        const era = ERAS[currentEraIndex];
        const pulse = Math.sin(Date.now() / 250 + this.pulsePhase) * 4;
        this.height = this.baseHeight + pulse;
        this.y = GROUND_LEVEL + player.height - this.height;

        ctx.save();

        // Beautiful gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, era.primaryColor + 'CC');
        gradient.addColorStop(0.5, era.secondaryColor);
        gradient.addColorStop(1, era.accentColor + '88');

        // Outer glow
        ctx.shadowColor = era.primaryColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = gradient;

        // Rounded rectangle
        const radius = 8;
        ctx.beginPath();
        ctx.moveTo(this.x + radius, this.y);
        ctx.lineTo(this.x + this.width - radius, this.y);
        ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + radius, radius);
        ctx.lineTo(this.x + this.width, this.y + this.height - radius);
        ctx.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - radius, this.y + this.height, radius);
        ctx.lineTo(this.x + radius, this.y + this.height);
        ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - radius, radius);
        ctx.lineTo(this.x, this.y + radius);
        ctx.arcTo(this.x, this.y, this.x + radius, this.y, radius);
        ctx.closePath();
        ctx.fill();

        // Border
        ctx.strokeStyle = era.accentColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Icon
        ctx.shadowBlur = 8;
        ctx.font = 'bold 35px Philosopher, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(this.dilemma.icon, this.x + this.width / 2, this.y + this.height / 2);

        ctx.restore();

        // Label
        ctx.font = 'bold 10px Philosopher, Arial';
        const textWidth = ctx.measureText(this.dilemma.name).width + 10;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(this.x + this.width / 2 - textWidth / 2, this.y - 24, textWidth, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(this.dilemma.name, this.x + this.width / 2, this.y - 15);
    }

    update(dt) {
        let speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
        speedMult *= activePowerups.speedboost > 0 ? 1.5 : 1;
        this.x -= this.speed * speedMult * dt;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Power-Up
class PowerUp {
    constructor() {
        this.width = 45;
        this.height = 45;
        this.x = canvas.width + 100;
        this.y = GROUND_LEVEL - 130 - Math.random() * 70;

        const diffSettings = DIFFICULTY[currentDifficulty];
        const speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
        this.speed = (diffSettings.speed + Math.min(score / 4000, 2)) * speedMult;

        this.type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        this.rotation = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    draw() {
        const pulse = Math.sin(Date.now() / 130 + this.pulsePhase) * 6;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + pulse);
        ctx.rotate(this.rotation);

        // Star-burst effect
        for (let i = 0; i < 6; i++) {
            const size = 30 + i * 5 + Math.sin(Date.now() / 100 + i) * 3;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            gradient.addColorStop(0, this.type.color + '80');
            gradient.addColorStop(0.6, this.type.color + '30');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Icon
        ctx.shadowColor = this.type.color;
        ctx.shadowBlur = 20;
        ctx.font = 'bold 32px Philosopher, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(this.type.icon, 0, 0);

        ctx.restore();
    }

    update(dt) {
        let speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
        speedMult *= activePowerups.speedboost > 0 ? 1.5 : 1;
        this.x -= this.speed * speedMult * dt;
        this.rotation += 0.025 * dt;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Collision
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Beautiful Background
function drawBackground() {
    const era = ERAS[currentEraIndex];

    // Sky gradient with multiple colors
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    era.bgGradient.forEach((color, i) => {
        gradient.addColorStop(i / (era.bgGradient.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun/Moon
    const celestialY = 80 + Math.sin(Date.now() / 10000) * 10;
    const celestialGradient = ctx.createRadialGradient(
        canvas.width - 100, celestialY, 0,
        canvas.width - 100, celestialY, 50
    );

    if (currentEraIndex === 1) {
        // Moon for medieval
        celestialGradient.addColorStop(0, '#FFFFCC');
        celestialGradient.addColorStop(0.7, '#FFFF99');
        celestialGradient.addColorStop(1, 'transparent');
    } else {
        // Sun for others
        celestialGradient.addColorStop(0, '#FFFACD');
        celestialGradient.addColorStop(0.5, '#FFD700');
        celestialGradient.addColorStop(1, 'transparent');
    }

    ctx.fillStyle = celestialGradient;
    ctx.beginPath();
    ctx.arc(canvas.width - 100, celestialY, 50, 0, Math.PI * 2);
    ctx.fill();

    // Light rays (for enlightenment era)
    if (currentEraIndex === 3) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI / 4) + (Date.now() / 5000);
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.moveTo(canvas.width - 100, celestialY);
            ctx.lineTo(
                canvas.width - 100 + Math.cos(angle) * 300,
                celestialY + Math.sin(angle) * 300
            );
            ctx.lineTo(
                canvas.width - 100 + Math.cos(angle + 0.2) * 300,
                celestialY + Math.sin(angle + 0.2) * 300
            );
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    // Era theme
    ctx.save();
    ctx.font = 'bold 16px Philosopher, Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(era.theme, 20, 45);
    ctx.restore();
}

// Ground
function drawGround() {
    const era = ERAS[currentEraIndex];

    // Gradient ground
    const gradient = ctx.createLinearGradient(0, GROUND_LEVEL + player.height, 0, canvas.height);
    gradient.addColorStop(0, era.groundColor);
    gradient.addColorStop(0.5, era.secondaryColor);
    gradient.addColorStop(1, era.accentColor + 'CC');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, GROUND_LEVEL + player.height, canvas.width, canvas.height);

    // Glowing top line
    ctx.save();
    ctx.strokeStyle = era.primaryColor;
    ctx.lineWidth = 6;
    ctx.shadowColor = era.primaryColor;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_LEVEL + player.height);
    ctx.lineTo(canvas.width, GROUND_LEVEL + player.height);
    ctx.stroke();
    ctx.restore();

    // Pattern
    ctx.fillStyle = era.accentColor + '40';
    const offset = (backgroundOffset * 0.15) % 50;
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.fillRect(i - offset, GROUND_LEVEL + player.height + 15, 22, 5);
    }
}

// Tutorial
function drawTutorialMessages() {
    if (!tutorialMode || tutorialMessages.length === 0) return;

    tutorialMessages.forEach((msg, index) => {
        const alpha = Math.min(msg.life / 1000, 1);
        ctx.save();
        ctx.globalAlpha = alpha;

        const y = 160 + index * 55;
        ctx.font = 'bold 19px Philosopher, Arial';
        const textWidth = ctx.measureText(msg.text).width;

        const gradient = ctx.createLinearGradient(
            canvas.width / 2 - textWidth / 2 - 30, y - 28,
            canvas.width / 2 + textWidth / 2 + 30, y + 28
        );
        gradient.addColorStop(0, 'rgba(74, 44, 94, 0.85)');
        gradient.addColorStop(0.5, 'rgba(74, 44, 94, 0.95)');
        gradient.addColorStop(1, 'rgba(74, 44, 94, 0.85)');

        ctx.fillStyle = gradient;
        ctx.shadowColor = '#c49e64';
        ctx.shadowBlur = 25;

        // Rounded rectangle
        const x = canvas.width / 2 - textWidth / 2 - 30;
        const width = textWidth + 60;
        const height = 48;
        const radius = 10;

        ctx.beginPath();
        ctx.moveTo(x + radius, y - 28);
        ctx.lineTo(x + width - radius, y - 28);
        ctx.arcTo(x + width, y - 28, x + width, y - 28 + radius, radius);
        ctx.lineTo(x + width, y + 20);
        ctx.arcTo(x + width, y + 20 + radius, x + width - radius, y + 20, radius);
        ctx.lineTo(x + radius, y + 20);
        ctx.arcTo(x, y + 20, x, y + 20 - radius, radius);
        ctx.lineTo(x, y - 28 + radius);
        ctx.arcTo(x, y - 28, x + radius, y - 28, radius);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#c49e64';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(msg.text, canvas.width / 2, y);

        ctx.restore();
    });
}

function showTutorialMessage(stepIndex) {
    if (stepIndex >= TUTORIAL_STEPS.length) {
        tutorialMode = false;
        return;
    }

    const step = TUTORIAL_STEPS[stepIndex];
    tutorialMessages.push({
        text: step.text,
        life: step.duration
    });
}

// Update Era
function updateEra() {
    for (let i = ERAS.length - 1; i >= 0; i--) {
        if (score >= ERAS[i].scoreThreshold) {
            if (i !== currentEraIndex) {
                currentEraIndex = i;
                document.getElementById('currentEra').textContent = ERAS[i].name;
                showQuote();
                screenShake = 18;
                createParticles(canvas.width / 2, canvas.height / 2, ERAS[i].primaryColor, 70);
                playEraChangeSound();

                // Update sky elements
                initSkyElements();

                if (tutorialMode && tutorialStep === 4) {
                    tutorialMode = false;
                    tutorialMessages = [];
                }
            }
            break;
        }
    }
}

// Initialize sky elements
function initSkyElements() {
    skyElements = [];
    const era = ERAS[currentEraIndex];
    const count = era.skyElements.type === 'stars' ? 15 : 8;

    for (let i = 0; i < count; i++) {
        skyElements.push(new SkyElement(era.skyElements.type));
    }
}

// Show Quote
function showQuote() {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const quoteEl = document.getElementById('quoteDisplay');
    document.getElementById('quoteText').textContent = quote.text;
    document.getElementById('quoteAuthor').textContent = `- ${quote.author}`;

    quoteEl.classList.remove('hidden');
    quoteEl.classList.add('show');

    setTimeout(() => {
        quoteEl.classList.remove('show');
        setTimeout(() => {
            quoteEl.classList.add('hidden');
        }, 300);
    }, 4500);
}

// Show Achievement
function showAchievement(title, subtitle) {
    const notification = document.getElementById('workNotification');
    document.getElementById('notifTitle').textContent = title;
    document.getElementById('notifAuthor').textContent = subtitle;

    notification.classList.remove('hidden');
    notification.classList.add('show');

    // BIG ACHIEVEMENT celebration!
    screenShake = 20;
    chromaticAberration = 8;
    createExplosion(baseWidth / 2, baseHeight / 2, '#FFD700', 1.5);
    createFirework(baseWidth / 2 - 100, baseHeight / 2 - 50);
    createFirework(baseWidth / 2 + 100, baseHeight / 2 - 50);
    playEraChangeSound();
    setTimeout(() => playEraChangeSound(), 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 300);
    }, 3500);
}

// Update Score
function updateScore(dt) {
    if (gameRunning && !gamePaused) {
        score += dt * 0.5;
        document.getElementById('score').textContent = Math.floor(score / 10);
        updateEra();

        // Update books display (show as "Books: X / Target")
        const levelReq = LEVEL_REQUIREMENTS[currentLevel - 1];
        document.getElementById('wisdom').textContent = `${booksCollected}/${levelReq.books}`;

        // Combo visual - BIG EFFECT!
        if (comboMultiplier > 1) {
            const scale = 1 + (comboMultiplier - 1) * 0.15;
            document.getElementById('wisdom').style.color = '#FFD700';
            document.getElementById('wisdom').style.transform = `scale(${scale})`;
            document.getElementById('wisdom').style.textShadow = '0 0 10px #FFD700, 0 0 20px #FFD700';
            document.getElementById('wisdom').style.fontWeight = '900';
        } else {
            document.getElementById('wisdom').style.color = '';
            document.getElementById('wisdom').style.transform = '';
            document.getElementById('wisdom').style.textShadow = '';
            document.getElementById('wisdom').style.fontWeight = '';
        }
    }
}

// Show Collected Work
function showCollectedWork(work, points) {
    const notification = document.getElementById('workNotification');
    document.getElementById('notifTitle').textContent = work.name;
    document.getElementById('notifAuthor').textContent = `von ${work.author} • +${points}`;

    notification.classList.remove('hidden');
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 300);
    }, 2800);
}

// Screen Effects
function applyScreenEffects() {
    // Chromatic aberration decay
    if (chromaticAberration > 0) {
        chromaticAberration *= 0.9;
        if (chromaticAberration < 0.1) chromaticAberration = 0;
    }

    // Vignette decay
    if (vignette > 0) {
        vignette *= 0.95;
        if (vignette < 0.01) vignette = 0;
    }

    // Draw vignette
    if (vignette > 0) {
        const gradient = ctx.createRadialGradient(
            baseWidth / 2, baseHeight / 2, baseHeight * 0.3,
            baseWidth / 2, baseHeight / 2, baseHeight * 0.8
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, `rgba(0, 0, 0, ${vignette * 0.6})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, baseWidth, baseHeight);
    }
}

// Screen Shake
function applyScreenShake() {
    if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
        screenShake *= 0.88;
        if (screenShake < 0.5) screenShake = 0;
    }
}

// Check Level Complete
function checkLevelComplete() {
    const levelReq = LEVEL_REQUIREMENTS[currentLevel - 1];

    if (booksCollected >= levelReq.books) {
        // Level complete! Go to next level
        if (currentLevel >= TOTAL_LEVELS) {
            // All levels complete - Victory!
            gameOver(true);
        } else {
            // Next level
            currentLevel++;
            booksCollected = 0;
            gameTime = 0;
            timeRemaining = LEVEL_DURATION;

            // Update era to match level
            currentEraIndex = LEVEL_REQUIREMENTS[currentLevel - 1].era;
            document.getElementById('currentEra').textContent = ERAS[currentEraIndex].name;
            document.getElementById('currentLevel').textContent = currentLevel;
            initSkyElements();

            // MASSIVE LEVEL UP CELEBRATION! 🎉🎆
            screenShake = 35;
            chromaticAberration = 15;
            vignette = 0.6;

            // EXPLOSION of particles!
            createExplosion(baseWidth / 2, baseHeight / 2, ERAS[currentEraIndex].primaryColor, 2);
            createParticles(baseWidth / 2, baseHeight / 2, ERAS[currentEraIndex].primaryColor, 150, 'star');
            createParticles(baseWidth / 2, baseHeight / 2, '#FFD700', 80, 'confetti');

            // Start fireworks sequence
            fireworksTimer = 120; // 2 seconds of fireworks

            // Flash screen with pulse
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle, ${LEVEL_REQUIREMENTS[currentLevel - 1].color}, transparent);
                opacity: 0.8;
                z-index: 9999;
                pointer-events: none;
                animation: flashFade 1s ease-out;
            `;
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 1000);

            // Triple sound burst
            playEraChangeSound();
            setTimeout(() => playEraChangeSound(), 150);
            setTimeout(() => playEraChangeSound(), 300);
            showQuote();

            // Show level complete message
            floatingTexts.push(new FloatingText(
                baseWidth / 2,
                baseHeight / 2 - 50,
                `LEVEL ${currentLevel - 1} ABGESCHLOSSEN! 🎉`,
                '#FFD700',
                40
            ));
        }
    } else {
        // Failed to collect enough books - Game Over
        gameOver(false);
    }
}

// Game Over - MUCH MORE INFORMATIVE!
function gameOver(victory = false) {
    gameRunning = false;
    cancelAnimationFrame(animationId);

    if (victory) {
        // ULTIMATE VICTORY CELEBRATION! 🎆🎉
        screenShake = 40;
        chromaticAberration = 20;
        vignette = 0.8;

        // MASSIVE fireworks show!
        fireworksTimer = 300; // 5 seconds!

        // Create mega explosions
        createExplosion(baseWidth / 2, baseHeight / 2, '#FFD700', 3);
        createParticles(baseWidth / 2, baseHeight / 2, '#FFD700', 200, 'star');
        createParticles(baseWidth / 2, baseHeight / 2, '#FF6347', 100, 'confetti');
        createParticles(baseWidth / 2, baseHeight / 2, '#4169E1', 100, 'confetti');

        // Create fireworks in corners
        setTimeout(() => createFirework(100, 100), 200);
        setTimeout(() => createFirework(baseWidth - 100, 100), 400);
        setTimeout(() => createFirework(100, baseHeight - 100), 600);
        setTimeout(() => createFirework(baseWidth - 100, baseHeight - 100), 800);
    } else {
        screenShake = 20;
        createParticles(baseWidth / 2, baseHeight / 2, '#FF6347', 50);
    }

    const finalScore = Math.floor(score / 10);
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('finalWisdom').textContent = `${totalBooksCollected} Bücher`;
    document.getElementById('finalEraName').textContent = victory ? '🏆 ALLE LEVELS!' : ERAS[currentEraIndex].name;
    document.getElementById('finalEraIcon').textContent = victory ? '🎉' : ERAS[currentEraIndex].theme.split(' ')[0];

    // Show stats in Game Over screen title
    const titleEl = document.querySelector('#gameOverScreen .screen-title');
    if (titleEl) {
        if (victory) {
            titleEl.textContent = '🎉 VICTORY! 🎉';
            titleEl.style.color = '#FFD700';
        } else {
            titleEl.textContent = `Level ${currentLevel} - Zeit abgelaufen`;
            titleEl.style.color = '#FF6347';
        }
    }

    // Check for all levels complete achievement
    if (victory && !achievements.allLevelsComplete) {
        achievements.allLevelsComplete = true;
    }

    // Speed demon achievement - complete in under 15 min
    const totalTime = (currentLevel - 1) * LEVEL_DURATION + (LEVEL_DURATION - timeRemaining);
    if (victory && totalTime < 900 && !achievements.speedDemon) {
        achievements.speedDemon = true;
    }

    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('philosophyHighScore', highScore);
    }

    setTimeout(() => {
        switchScreen('gameOverScreen');
    }, 600);
}

// Main Game Loop
function gameLoop(currentTime = 0) {
    if (!lastTime) lastTime = currentTime;
    deltaTime = Math.min((currentTime - lastTime) / 16.67, 2);
    lastTime = currentTime;

    if (!gameRunning || gamePaused) {
        if (gamePaused) {
            animationId = requestAnimationFrame(gameLoop);
        }
        return;
    }

    // Update timer (freeze time power-up stops the timer)
    if (activePowerups.timefreeze <= 0) {
        gameTime += deltaTime * 16.67 / 1000;
    }
    timeRemaining = Math.max(0, LEVEL_DURATION - gameTime);

    // Time's up for this level!
    if (timeRemaining <= 0) {
        checkLevelComplete();
        return;
    }

    // Update timer display
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = Math.floor(timeRemaining % 60);
    document.getElementById('philName').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    ctx.save();
    ctx.clearRect(0, 0, baseWidth, baseHeight);

    // Apply screen effects
    applyScreenEffects();
    applyScreenShake();

    drawBackground();

    // Update and draw sky elements
    skyElements.forEach(el => {
        el.update(deltaTime);
        el.draw();
    });

    drawGround();

    let speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
    speedMult *= activePowerups.speedboost > 0 ? 1.5 : 1;
    backgroundOffset += (2.5 + score / 1200) * speedMult * deltaTime;

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(deltaTime);
        particles[i].draw();
        if (particles[i].isDead()) particles.splice(i, 1);
    }

    // Floating texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].update(deltaTime);
        floatingTexts[i].draw();
        if (floatingTexts[i].isDead()) floatingTexts.splice(i, 1);
    }

    // Power-ups
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].update(deltaTime);
        powerups[i].draw();

        if (checkCollision(player, powerups[i])) {
            const powerup = powerups[i];

            // Handle different power-up effects
            if (powerup.type.effect === 'extratime') {
                // Extra time - instant effect
                timeRemaining += 15;
                gameTime -= 15;
            } else {
                activePowerups[powerup.type.effect] = Date.now() + powerup.type.duration;

                if (powerup.type.effect === 'doublejump') {
                    player.canDoubleJump = true;
                }
            }

            // Track power-ups collected
            powerupsCollected++;
            if (powerupsCollected >= 20 && !achievements.powerUpCollector) {
                achievements.powerUpCollector = true;
                showAchievement('🎁 Power-Up Sammler!', 'Sammle 20 Power-Ups!');
            }

            // MEGA power-up collection effect!
            floatingTexts.push(new FloatingText(powerup.x, powerup.y, powerup.type.name, powerup.type.color, 36));
            createExplosion(powerup.x, powerup.y, powerup.type.color, 0.8);
            createParticles(powerup.x, powerup.y, powerup.type.color, 30, 'star');
            screenShake = 10;
            chromaticAberration = 5;

            // Screen flash for power-up
            vignette = 0.3;

            playPowerUpSound();
            powerups.splice(i, 1);
        } else if (powerups[i].isOffScreen()) {
            powerups.splice(i, 1);
        }
    }

    // Collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
        collectibles[i].update(deltaTime);
        collectibles[i].draw();

        if (checkCollision(player, collectibles[i])) {
            const work = collectibles[i].work;
            const laneMultiplier = collectibles[i].lane.multiplier;
            const basePoints = work.basePoints * laneMultiplier;

            // Apply score multiplier power-up
            const scoreMultBonus = activePowerups.scoremultiplier > 0 ? 2 : 1;
            const points = Math.floor(basePoints * comboMultiplier * scoreMultBonus);

            score += points;
            wisdom += Math.floor(15 * comboMultiplier * laneMultiplier);
            booksCollected++; // Track books for level system
            totalBooksCollected++;

            // Combo
            const now = Date.now();
            if (now - lastCollectTime < 2500) {
                comboCount++;
                comboMultiplier = Math.min(1 + comboCount * 0.5, 5);

                // Track max combo
                if (comboCount > maxCombo) {
                    maxCombo = comboCount;
                    if (maxCombo >= 15 && !achievements.comboMaster) {
                        achievements.comboMaster = true;
                        showAchievement('🔥 Combo Master!', '15er Combo erreicht!');
                    }
                }
            } else {
                comboCount = 0;
                comboMultiplier = 1;
            }
            lastCollectTime = now;

            showCollectedWork(work, points);

            // MEGA Collection Effect with LIGHT BEAMS! ✨
            const comboColor = comboMultiplier > 2 ? '#FFD700' : '#4CAF50';

            // Light beam from collect to player
            createLightBeam(collectibles[i].x, collectibles[i].y, player.x + player.width/2, player.y + player.height/2, comboColor);

            floatingTexts.push(new FloatingText(
                collectibles[i].x,
                collectibles[i].y,
                `+${points}${comboMultiplier > 1 ? ' x' + comboMultiplier.toFixed(1) : ''}`,
                comboColor,
                32 + comboCount * 2
            ));

            createExplosion(collectibles[i].x, collectibles[i].y, comboColor, 0.5);
            createParticles(collectibles[i].x, collectibles[i].y, comboColor, 15, 'star');
            createParticles(collectibles[i].x, collectibles[i].y, '#FFFFFF', 10, 'confetti');
            playCollectSound();
            collectibles.splice(i, 1);

            if (tutorialMode && tutorialStep === 2) {
                tutorialStep = 3;
                showTutorialMessage(3);
            }
        } else if (collectibles[i].isOffScreen()) {
            collectibles.splice(i, 1);
        }
    }

    // Obstacles - now just bounce/slow!
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update(deltaTime);
        obstacles[i].draw();

        if (checkCollision(player, obstacles[i]) && player.bounceTimer === 0) {
            // Ghost mode and invincibility ignore obstacles
            if (activePowerups.ghostmode > 0 || activePowerups.invincibility > 0) {
                // Do nothing - pass through
            } else if (obstacles[i].dilemma.effect === 'bounce') {
                player.bounce();
                floatingTexts.push(new FloatingText(player.x, player.y, obstacles[i].dilemma.name, '#FF6347', 20));
            } else {
                player.slow();
                floatingTexts.push(new FloatingText(player.x, player.y, '💤 Langsam!', '#4169E1', 20));
            }

            if (tutorialMode && tutorialStep === 3) {
                tutorialStep = 4;
                showTutorialMessage(4);
            }
        }

        if (obstacles[i].isOffScreen()) {
            obstacles.splice(i, 1);
        }
    }

    // Draw player
    player.draw();
    player.update(deltaTime);
    updateScore(deltaTime);

    // Spawn obstacles
    const diffSettings = DIFFICULTY[currentDifficulty];
    obstacleTimer += deltaTime;
    const spawnInterval = tutorialMode ? 140 : diffSettings.obstacleInterval - Math.min(score / 200, 50);

    if (obstacleTimer > spawnInterval) {
        obstacles.push(new Obstacle());
        obstacleTimer = 0;
    }

    // Spawn collectibles - MUCH MORE FREQUENT! (was 85, then 50, now 35)
    collectibleTimer += deltaTime;
    const collectibleSpawnRate = tutorialMode ? 50 : 35;
    if (collectibleTimer > collectibleSpawnRate) {
        const lane = Math.floor(Math.random() * 3);
        collectibles.push(new Collectible(lane));
        collectibleTimer = 0;
    }

    // Spawn power-ups - MORE FREQUENT! (was 450, now 280)
    if (score > 200 && !tutorialMode) {
        powerupTimer += deltaTime;
        if (powerupTimer > 280) {
            powerups.push(new PowerUp());
            powerupTimer = 0;
        }
    }

    // Tutorial
    if (tutorialMode) {
        for (let i = tutorialMessages.length - 1; i >= 0; i--) {
            tutorialMessages[i].life -= 16 * deltaTime;
            if (tutorialMessages[i].life <= 0) {
                tutorialMessages.splice(i, 1);
            }
        }
    }

    drawTutorialMessages();

    // Power-up indicators (top right)
    drawPowerUpIndicators();

    // Level progress bar (bottom of screen)
    drawLevelProgressBar();

    // Combo counter (top center)
    if (comboMultiplier > 1) {
        drawComboCounter();
    }

    // Combo Meter (left side)
    if (comboCount > 0) {
        drawComboMeter();
    }

    // Fireworks (during celebrations)
    if (fireworksTimer > 0) {
        fireworksTimer--;
        if (fireworksTimer % 15 === 0) {
            const x = Math.random() * baseWidth;
            const y = Math.random() * baseHeight * 0.6;
            createFirework(x, y);
        }
    }

    // Combo decay
    if (Date.now() - lastCollectTime > 2500 && comboMultiplier > 1) {
        comboMultiplier = Math.max(1, comboMultiplier - 0.08);
        comboCount = Math.floor((comboMultiplier - 1) * 2);
    }

    ctx.restore();
    animationId = requestAnimationFrame(gameLoop);
}

// Power-Up Indicators
function drawPowerUpIndicators() {
    let yOffset = 90;
    const now = Date.now();

    Object.keys(activePowerups).forEach(key => {
        if (activePowerups[key] > now) {
            const powerupType = POWERUP_TYPES.find(p => p.effect === key);
            if (!powerupType) return;

            const timeLeft = (activePowerups[key] - now) / 1000;
            const width = 130;
            const height = 32;
            const x = baseWidth - width - 12;
            const y = yOffset;

            // Background gradient
            const bgGradient = ctx.createLinearGradient(x, y, x + width, y);
            bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
            bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(x, y, width, height);

            // Progress
            const progress = timeLeft / (powerupType.duration / 1000);
            ctx.fillStyle = powerupType.color + 'BB';
            ctx.fillRect(x, y, width * progress, height);

            // Border
            ctx.strokeStyle = powerupType.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            // Text
            ctx.font = 'bold 16px Philosopher, Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'left';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(powerupType.icon, x + 6, y + 21);

            ctx.font = 'bold 13px Philosopher, Arial';
            ctx.fillText(`${Math.ceil(timeLeft)}s`, x + 40, y + 21);
            ctx.shadowBlur = 0;

            yOffset += 38;
        }
    });
}

// Combo Meter (left side) - VISUAL PROGRESSION!
function drawComboMeter() {
    const maxComboHeight = 300;
    const progress = Math.min(comboCount / 30, 1); // Max at 30 combo
    const height = maxComboHeight * progress;

    const x = 15;
    const y = baseHeight / 2 - maxComboHeight / 2;
    const width = 12;

    ctx.save();

    // Background bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x, y, width, maxComboHeight);

    // Combo fill with gradient
    const gradient = ctx.createLinearGradient(x, y + maxComboHeight, x, y);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.5, '#FFD700');
    gradient.addColorStop(1, '#FF6347');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y + maxComboHeight - height, width, height);

    // Pulsing glow
    const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;
    ctx.shadowColor = comboMultiplier > 2 ? '#FFD700' : '#4CAF50';
    ctx.shadowBlur = 15 * pulse;
    ctx.fillRect(x, y + maxComboHeight - height, width, height);

    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, maxComboHeight);

    // Markers every 5 combo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
        const markerY = y + (maxComboHeight / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, markerY);
        ctx.lineTo(x + width, markerY);
        ctx.stroke();
    }

    // Text
    ctx.font = 'bold 10px Philosopher, Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(`${comboCount}`, x + width / 2, y - 5);

    ctx.restore();
}

// Combo Counter - ULTRA MASSIVE VISUAL!
function drawComboCounter() {
    const scale = 1 + (comboMultiplier - 1) * 0.12;
    const pulse = Math.sin(Date.now() / 120) * 0.15 + 0.85;
    const rotation = Math.sin(Date.now() / 500) * 0.05;

    ctx.save();
    ctx.translate(baseWidth / 2, 70);
    ctx.rotate(rotation);
    ctx.scale(scale * pulse, scale * pulse);

    // Multiple glow layers
    for (let i = 3; i >= 0; i--) {
        const glowSize = (100 + comboCount * 6) * (1 + i * 0.3);
        const alpha = (0.4 - i * 0.08) * (comboMultiplier / 5);
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 165, 0, ${alpha * 0.6})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // Rotating stars for high combos
    if (comboCount >= 10) {
        ctx.save();
        const starRotation = Date.now() / 1000;
        ctx.rotate(starRotation);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 80 + Math.sin(Date.now() / 300 + i) * 10;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;

            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✨', x, y);
        }
        ctx.restore();
    }

    // Main text with outline
    const fontSize = 40 + comboCount * 2;
    ctx.font = `bold ${fontSize}px Philosopher, Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeText(`${comboCount}x COMBO!`, 0, 0);

    // Fill
    const textGradient = ctx.createLinearGradient(0, -fontSize/2, 0, fontSize/2);
    textGradient.addColorStop(0, '#FFD700');
    textGradient.addColorStop(0.5, '#FFA500');
    textGradient.addColorStop(1, '#FF8C00');
    ctx.fillStyle = textGradient;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 25;
    ctx.fillText(`${comboCount}x COMBO!`, 0, 0);

    // Multiplier with glow
    ctx.font = 'bold 20px Philosopher, Arial';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(`${comboMultiplier.toFixed(1)}x Multiplikator`, 0, 35);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 15;
    ctx.fillText(`${comboMultiplier.toFixed(1)}x Multiplikator`, 0, 35);

    ctx.restore();

    // Screen-wide effect for mega combos
    if (comboCount >= 20) {
        ctx.save();
        const megaPulse = Math.sin(Date.now() / 100) * 0.2 + 0.8;
        ctx.globalAlpha = 0.1 * megaPulse;
        const bgGradient = ctx.createRadialGradient(
            baseWidth / 2, baseHeight / 2, 0,
            baseWidth / 2, baseHeight / 2, baseWidth / 2
        );
        bgGradient.addColorStop(0, '#FFD700');
        bgGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, baseWidth, baseHeight);
        ctx.restore();
    }
}

// Level Progress Bar - BEAUTIFUL!
function drawLevelProgressBar() {
    const levelReq = LEVEL_REQUIREMENTS[currentLevel - 1];
    const progress = Math.min(booksCollected / levelReq.books, 1);

    const barWidth = baseWidth - 40;
    const barHeight = 8;
    const x = 20;
    const y = baseHeight - 20;

    // Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x, y + 2, barWidth, barHeight);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Progress gradient
    const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
    gradient.addColorStop(0, levelReq.color);
    gradient.addColorStop(1, adjustColor(levelReq.color, 40));
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth * progress, barHeight);

    // Pulsing glow when near completion
    if (progress > 0.8) {
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        ctx.shadowColor = levelReq.color;
        ctx.shadowBlur = 15 * pulse;
        ctx.fillRect(x, y, barWidth * progress, barHeight);
        ctx.shadowBlur = 0;
    }

    // Border
    ctx.strokeStyle = levelReq.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Text overlay
    ctx.font = 'bold 11px Philosopher, Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(`${booksCollected} / ${levelReq.books} Bücher`, baseWidth / 2, y + 6);

    ctx.restore();
}

// Start Game
function startGame() {
    gameRunning = true;
    gamePaused = false;
    score = 0;
    wisdom = 0;
    gameTime = 0;
    timeRemaining = LEVEL_DURATION;
    currentLevel = 1;
    booksCollected = 0;
    totalBooksCollected = 0;
    maxCombo = 0;
    powerupsCollected = 0;
    currentEraIndex = 0;
    obstacles = [];
    collectibles = [];
    powerups = [];
    particles = [];
    floatingTexts = [];
    obstacleTimer = 0;
    collectibleTimer = 0;
    powerupTimer = 0;
    comboCount = 0;
    comboMultiplier = 1;
    lastCollectTime = 0;
    tutorialMode = true;
    tutorialStep = 0;
    tutorialMessages = [];
    screenShake = 0;
    backgroundOffset = 0;
    lastTime = 0;
    activePowerups = {
        slowmo: 0,
        magnet: 0,
        doublejump: 0,
        timefreeze: 0,
        invincibility: 0,
        scoremultiplier: 0,
        speedboost: 0,
        ghostmode: 0
    };

    player.reset();
    initSkyElements();

    document.getElementById('score').textContent = '0';
    document.getElementById('wisdom').textContent = '0/20';
    document.getElementById('currentEra').textContent = ERAS[0].name;
    document.getElementById('currentLevel').textContent = '1';
    document.getElementById('philIcon').textContent = PHILOSOPHERS[selectedPhilosopherIndex].icon;

    switchScreen('gameScreen');

    showTutorialMessage(0);
    setTimeout(() => {
        tutorialStep = 1;
        showTutorialMessage(1);
    }, 3200);

    animationId = requestAnimationFrame(gameLoop);
}

// Screen Management
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Panel Management
function openPanel(panelId) {
    document.getElementById(panelId).classList.add('open');
    if (gameRunning) {
        gamePaused = true;
    }
}

function closePanel(panelId) {
    document.getElementById(panelId).classList.remove('open');
    if (gameRunning) {
        gamePaused = false;
        lastTime = 0;
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Utility
function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Update Character Selection
function updateCharacterSelection() {
    document.querySelectorAll('.phil-card').forEach((card, index) => {
        if (index === selectedPhilosopherIndex) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

// Event Listeners
let isJumpKeyDown = false;

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (gameRunning && !isJumpKeyDown) {
            isJumpKeyDown = true;
            player.jump(true);
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        isJumpKeyDown = false;
        player.releaseJump();
    }
});

canvas.addEventListener('mousedown', () => {
    if (gameRunning) {
        player.jump(true);
    }
});

canvas.addEventListener('mouseup', () => {
    if (gameRunning) {
        player.releaseJump();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameRunning) {
        player.jump(true);
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (gameRunning) {
        player.releaseJump();
    }
}, { passive: false });

// Start Screen
document.getElementById('startGameBtn').addEventListener('click', startGame);

document.getElementById('helpBtn').addEventListener('click', () => {
    openPanel('helpPanel');
});

// Philosopher Selection
document.querySelectorAll('.phil-card').forEach((card, index) => {
    card.addEventListener('click', () => {
        selectedPhilosopherIndex = index;
        updateCharacterSelection();
    });
});

// Difficulty
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentDifficulty = btn.dataset.diff;
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Help Panel
document.getElementById('closeHelpBtn').addEventListener('click', () => {
    closePanel('helpPanel');
});

document.getElementById('closeHelp2Btn').addEventListener('click', () => {
    closePanel('helpPanel');
});

// Menu Panel
document.getElementById('menuBtn').addEventListener('click', () => {
    openPanel('menuPanel');
});

document.getElementById('closeMenuBtn').addEventListener('click', () => {
    closePanel('menuPanel');
});

document.getElementById('resumeBtn').addEventListener('click', () => {
    closePanel('menuPanel');
});

document.getElementById('menuHelpBtn').addEventListener('click', () => {
    closePanel('menuPanel');
    openPanel('helpPanel');
});

document.getElementById('quitBtn').addEventListener('click', () => {
    gameRunning = false;
    gamePaused = false;
    cancelAnimationFrame(animationId);
    closePanel('menuPanel');
    switchScreen('startScreen');
});

// Game Over Screen
document.getElementById('restartBtn').addEventListener('click', () => {
    startGame();
});

document.getElementById('backToMenuBtn').addEventListener('click', () => {
    switchScreen('startScreen');
});

// Initial setup
updateCharacterSelection();
switchScreen('startScreen');
