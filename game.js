// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const GRAVITY = 0.5;
const JUMP_POWER = -12;
const GROUND_LEVEL = canvas.height - 80;
const COYOTE_TIME = 6; // Frames after leaving ground where you can still jump
const JUMP_BUFFER = 8; // Frames to remember jump input

// Difficulty Settings (25% slower progression)
const DIFFICULTY = {
    easy: { speed: 2.5, obstacleInterval: 160, name: 'Nachdenklich' },
    normal: { speed: 4, obstacleInterval: 130, name: 'Philosophisch' },
    hard: { speed: 6, obstacleInterval: 100, name: 'Erleuchtung' }
};

let currentDifficulty = 'easy';
let tutorialMode = true;
let tutorialStep = 0;

// Game timing
let lastTime = 0;
let deltaTime = 0;

// Philosophical Eras with Enhanced Themes
const ERAS = [
    {
        name: 'Antike',
        primaryColor: '#d4af37',
        secondaryColor: '#8b7355',
        bgColor: '#fef5e7',
        skyGradient: ['#87ceeb', '#f0e68c'],
        scoreThreshold: 0,
        theme: 'Erkenne dich selbst',
        icon: '🏛️'
    },
    {
        name: 'Mittelalter',
        primaryColor: '#8b4513',
        secondaryColor: '#654321',
        bgColor: '#deb887',
        skyGradient: ['#696969', '#a0826d'],
        scoreThreshold: 500,
        theme: 'Glaube und Vernunft',
        icon: '⛪'
    },
    {
        name: 'Renaissance',
        primaryColor: '#cd853f',
        secondaryColor: '#daa520',
        bgColor: '#faebd7',
        skyGradient: ['#ffa07a', '#f4a460'],
        scoreThreshold: 1000,
        theme: 'Humanismus',
        icon: '🎨'
    },
    {
        name: 'Aufklärung',
        primaryColor: '#4169e1',
        secondaryColor: '#1e90ff',
        bgColor: '#e6f2ff',
        skyGradient: ['#87ceeb', '#b0e0e6'],
        scoreThreshold: 1500,
        theme: 'Sapere Aude!',
        icon: '💡'
    },
    {
        name: 'Moderne',
        primaryColor: '#8a2be2',
        secondaryColor: '#9370db',
        bgColor: '#e6e6fa',
        skyGradient: ['#9370db', '#dda0dd'],
        scoreThreshold: 2500,
        theme: 'Existenz & Sein',
        icon: '🏭'
    },
    {
        name: 'Gegenwart',
        primaryColor: '#00ced1',
        secondaryColor: '#40e0d0',
        bgColor: '#e0ffff',
        skyGradient: ['#00bfff', '#87ceeb'],
        scoreThreshold: 4000,
        theme: 'Digitale Ethik',
        icon: '💻'
    }
];

// Philosophers with detailed info
const PHILOSOPHERS = [
    {
        name: 'Sokrates',
        icon: '🧔',
        era: 'Antike',
        lived: '469-399 v.Chr.',
        idea: 'Ich weiß, dass ich nichts weiß',
        jumpPower: 1.0,
        color: '#d4af37'
    },
    {
        name: 'Augustinus',
        icon: '📿',
        era: 'Mittelalter',
        lived: '354-430 n.Chr.',
        idea: 'Glaube sucht Verständnis',
        jumpPower: 1.1,
        color: '#8b4513'
    },
    {
        name: 'Kant',
        icon: '🎩',
        era: 'Aufklärung',
        lived: '1724-1804',
        idea: 'Handle nach dem kategorischen Imperativ',
        jumpPower: 0.95,
        color: '#4169e1'
    }
];

// Philosophical Works as Collectibles
const PHILOSOPHICAL_WORKS = [
    { name: 'Politeia', author: 'Platon', icon: '📕', era: 0, points: 100 },
    { name: 'Nikomachische Ethik', author: 'Aristoteles', icon: '📗', era: 0, points: 100 },
    { name: 'Confessiones', author: 'Augustinus', icon: '📘', era: 1, points: 120 },
    { name: 'Summa Theologica', author: 'Thomas von Aquin', icon: '📙', era: 1, points: 120 },
    { name: 'Der Fürst', author: 'Machiavelli', icon: '📕', era: 2, points: 150 },
    { name: 'Kritik der reinen Vernunft', author: 'Kant', icon: '📗', era: 3, points: 150 },
    { name: 'Leviathan', author: 'Hobbes', icon: '📘', era: 3, points: 150 },
    { name: 'Also sprach Zarathustra', author: 'Nietzsche', icon: '📙', era: 4, points: 200 },
    { name: 'Sein und Zeit', author: 'Heidegger', icon: '📕', era: 4, points: 200 },
    { name: 'Eine Theorie der Gerechtigkeit', author: 'Rawls', icon: '📗', era: 5, points: 250 }
];

// Philosophical Dilemmas as Obstacles
const PHILOSOPHICAL_DILEMMAS = [
    { name: 'Höhlengleichnis', icon: '🕳️', era: 0 },
    { name: 'Sokratisches Paradox', icon: '❓', era: 0 },
    { name: 'Theodizee', icon: '⚖️', era: 1 },
    { name: 'Gottesbeweis', icon: '✝️', era: 1 },
    { name: 'Gedankenexperiment', icon: '🧪', era: 2 },
    { name: 'Antinomien', icon: '⚡', era: 3 },
    { name: 'Kategorischer Imperativ', icon: '📜', era: 3 },
    { name: 'Wille zur Macht', icon: '💪', era: 4 },
    { name: 'Existenzkrise', icon: '😰', era: 4 },
    { name: 'Trolley-Problem', icon: '🚃', era: 5 },
    { name: 'KI-Ethik', icon: '🤖', era: 5 }
];

// Power-Up Types
const POWERUP_TYPES = [
    {
        name: 'Slow Motion',
        icon: '⏱️',
        duration: 5000,
        color: '#00ffff',
        effect: 'slowmo'
    },
    {
        name: 'Schutzschild',
        icon: '🛡️',
        duration: 8000,
        color: '#ffd700',
        effect: 'shield'
    },
    {
        name: 'Magnet',
        icon: '🧲',
        duration: 7000,
        color: '#ff69b4',
        effect: 'magnet'
    }
];

// Quotes
const QUOTES = [
    { text: "Ich weiß, dass ich nichts weiß", author: "Sokrates" },
    { text: "Cogito, ergo sum", author: "Descartes" },
    { text: "Der Mensch ist dem Menschen ein Wolf", author: "Hobbes" },
    { text: "Sapere aude!", author: "Kant" },
    { text: "Die Hölle, das sind die anderen", author: "Sartre" },
    { text: "Gott ist tot", author: "Nietzsche" },
    { text: "Das Sein bestimmt das Bewusstsein", author: "Marx" },
    { text: "Was mich nicht umbringt, macht mich stärker", author: "Nietzsche" }
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

// Active power-ups
let activePowerups = {
    slowmo: 0,
    shield: 0,
    magnet: 0
};

// Obstacle patterns
const OBSTACLE_PATTERNS = [
    [1], // Single
    [1, 0, 1], // Double with gap
    [1, 1], // Double close
    [1, 0, 0, 1], // Wide spread
];

// Tutorial Messages
const TUTORIAL_STEPS = [
    { text: "Willkommen zur philosophischen Reise!", duration: 3000 },
    { text: "Tap oder Klick zum Springen! ⬆️", duration: 3000 },
    { text: "Sammle philosophische Werke 📚", duration: 3000 },
    { text: "Weiche Dilemmata aus! ⚠️", duration: 3000 },
    { text: "Power-Ups helfen dir! 🌟", duration: 3000 }
];

// Player Object with improved physics
const player = {
    x: 100,
    y: GROUND_LEVEL,
    width: 50,
    height: 50,
    velocityY: 0,
    velocityX: 0,
    isJumping: false,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    rotation: 0,
    squashStretch: { x: 1, y: 1 },
    trail: [],

    draw() {
        // Draw trail
        ctx.save();
        this.trail.forEach((point, i) => {
            const alpha = (i / this.trail.length) * 0.3;
            const era = ERAS[currentEraIndex];
            ctx.globalAlpha = alpha;
            ctx.fillStyle = era.primaryColor;
            const size = this.width * 0.8 * (i / this.trail.length);
            ctx.font = `${size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(PHILOSOPHERS[selectedPhilosopherIndex].icon, point.x, point.y);
        });
        ctx.restore();

        ctx.save();

        // Enhanced shadow with blur
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        const shadowScale = Math.max(0.3, 1 - (GROUND_LEVEL - this.y) / 300);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, GROUND_LEVEL + this.height + 5,
                   this.width / 2 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'transparent';

        // Character with squash & stretch
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.scale(this.squashStretch.x, this.squashStretch.y);

        // Aura effect with pulse
        const era = ERAS[currentEraIndex];
        const philosopher = PHILOSOPHERS[selectedPhilosopherIndex];

        if (this.isJumping || activePowerups.shield > 0) {
            const pulseSize = 35 + Math.sin(Date.now() / 200) * 5;
            ctx.strokeStyle = activePowerups.shield > 0 ? '#ffd700' : era.primaryColor;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
            ctx.stroke();

            // Inner glow
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize - 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Draw philosopher icon with glow
        ctx.shadowColor = philosopher.color;
        ctx.shadowBlur = 15;
        ctx.font = 'bold 45px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(philosopher.icon, 0, 0);

        ctx.restore();
    },

    update(dt) {
        // Apply gravity
        this.velocityY += GRAVITY * dt;
        this.y += this.velocityY * dt;

        // Ground collision
        if (this.y >= GROUND_LEVEL) {
            this.y = GROUND_LEVEL;
            this.velocityY = 0;
            this.isJumping = false;
            this.coyoteTimer = COYOTE_TIME;

            // Landing squash
            this.squashStretch = { x: 1.2, y: 0.8 };
            createParticles(this.x + this.width / 2, this.y + this.height,
                          ERAS[currentEraIndex].primaryColor, 4);
        } else {
            // In air
            if (this.coyoteTimer > 0) this.coyoteTimer--;
        }

        // Update rotation
        if (this.isJumping) {
            this.rotation += 0.06 * dt;
        } else {
            this.rotation *= 0.9;
        }

        // Squash & stretch recovery
        this.squashStretch.x += (1 - this.squashStretch.x) * 0.1;
        this.squashStretch.y += (1 - this.squashStretch.y) * 0.1;

        // Jump buffer countdown
        if (this.jumpBufferTimer > 0) {
            this.jumpBufferTimer--;
            // Try to jump if we're grounded
            if (this.coyoteTimer > 0) {
                this.performJump();
                this.jumpBufferTimer = 0;
            }
        }

        // Trail effect
        if (gameRunning && Date.now() % 3 === 0) {
            this.trail.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2
            });
            if (this.trail.length > 8) this.trail.shift();
        }
    },

    jump() {
        // Coyote time: can jump shortly after leaving ground
        if (this.coyoteTimer > 0) {
            this.performJump();
        } else {
            // Buffer the jump input
            this.jumpBufferTimer = JUMP_BUFFER;
        }
    },

    performJump() {
        if (!gameRunning || gamePaused) return;

        const philosopher = PHILOSOPHERS[selectedPhilosopherIndex];
        this.velocityY = JUMP_POWER * philosopher.jumpPower;
        this.isJumping = true;
        this.coyoteTimer = 0;

        // Jump stretch
        this.squashStretch = { x: 0.8, y: 1.3 };

        createParticles(this.x + this.width / 2, this.y + this.height,
                      ERAS[currentEraIndex].primaryColor, 12);

        // Tutorial progress
        if (tutorialMode && tutorialStep === 1) {
            tutorialStep = 2;
            showTutorialMessage(2);
        }
    },

    reset() {
        this.y = GROUND_LEVEL;
        this.velocityY = 0;
        this.velocityX = 0;
        this.isJumping = false;
        this.rotation = 0;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.squashStretch = { x: 1, y: 1 };
        this.trail = [];
    }
};

// Enhanced Particle System
class Particle {
    constructor(x, y, color, velocityX = null, velocityY = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocityX = velocityX !== null ? velocityX : (Math.random() - 0.5) * 5;
        this.velocityY = velocityY !== null ? velocityY : (Math.random() - 0.5) * 5 - 3;
        this.size = Math.random() * 5 + 2;
        this.life = 1;
        this.decay = 0.015;
        this.gravity = 0.15;
    }

    update(dt) {
        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;
        this.velocityY += this.gravity * dt;
        this.life -= this.decay * dt;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Floating Text Class
class FloatingText {
    constructor(x, y, text, color = '#ffffff') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.velocityY = -2;
        this.life = 1;
        this.decay = 0.02;
    }

    update(dt) {
        this.y += this.velocityY * dt;
        this.life -= this.decay * dt;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Enhanced Obstacle Class
class Obstacle {
    constructor(heightVariation = 0) {
        this.width = 50;
        this.baseHeight = 60 + Math.random() * 20;
        this.height = this.baseHeight;
        this.x = canvas.width + 100;
        this.y = GROUND_LEVEL + player.height - this.height + heightVariation;

        const diffSettings = DIFFICULTY[currentDifficulty];
        const speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
        this.speed = (tutorialMode ? 2 : diffSettings.speed + Math.min(score / 3000, 3)) * speedMult;

        const eraProblems = PHILOSOPHICAL_DILEMMAS.filter(d => d.era === currentEraIndex);
        const allProblems = eraProblems.length > 0 ? eraProblems : PHILOSOPHICAL_DILEMMAS;
        this.dilemma = allProblems[Math.floor(Math.random() * allProblems.length)];

        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    draw() {
        const era = ERAS[currentEraIndex];

        // Pulsing effect
        const pulse = Math.sin(Date.now() / 300 + this.pulsePhase) * 3;
        this.height = this.baseHeight + pulse;
        this.y = GROUND_LEVEL + player.height - this.height;

        // Enhanced gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, era.primaryColor);
        gradient.addColorStop(0.5, era.secondaryColor);
        gradient.addColorStop(1, adjustColor(era.secondaryColor, -30));

        ctx.save();
        ctx.shadowColor = era.primaryColor;
        ctx.shadowBlur = 10;
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Border with glow
        ctx.strokeStyle = era.primaryColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Icon
        ctx.shadowBlur = 5;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.dilemma.icon, this.x + this.width / 2, this.y + this.height / 2);

        ctx.restore();

        // Name label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        const labelWidth = ctx.measureText(this.dilemma.name).width + 10;
        ctx.fillRect(this.x + this.width / 2 - labelWidth / 2, this.y - 22, labelWidth, 18);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.dilemma.name, this.x + this.width / 2, this.y - 13);
    }

    update(dt) {
        const speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
        this.x -= this.speed * speedMult * dt;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Enhanced Collectible Class
class Collectible {
    constructor(lane = 0) {
        this.width = 35;
        this.height = 35;
        this.x = canvas.width + 100;

        // Three lanes: high, medium, low
        const lanes = [
            GROUND_LEVEL - 150,  // High
            GROUND_LEVEL - 100,  // Medium
            GROUND_LEVEL - 50    // Low
        ];
        this.baseY = lanes[lane] || (GROUND_LEVEL - 80 - Math.random() * 100);
        this.y = this.baseY;

        const diffSettings = DIFFICULTY[currentDifficulty];
        const speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
        this.speed = (tutorialMode ? 2 : diffSettings.speed + Math.min(score / 3000, 3)) * speedMult;
        this.rotation = 0;
        this.bouncePhase = Math.random() * Math.PI * 2;

        const eraWorks = PHILOSOPHICAL_WORKS.filter(w => w.era === currentEraIndex);
        const allWorks = eraWorks.length > 0 ? eraWorks : PHILOSOPHICAL_WORKS;
        this.work = allWorks[Math.floor(Math.random() * allWorks.length)];
    }

    draw() {
        // Bouncing animation
        const bounce = Math.sin(Date.now() / 200 + this.bouncePhase) * 8;
        this.y = this.baseY + bounce;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        // Enhanced glow
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20;

        // Pulsing outer ring
        const pulseSize = 20 + Math.sin(Date.now() / 150) * 3;
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Icon
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.work.icon, 0, 0);

        ctx.restore();

        // Work title with better background
        const textWidth = ctx.measureText(this.work.name).width + 8;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(this.x + this.width / 2 - textWidth / 2, this.y - 22, textWidth, 18);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.work.name, this.x + this.width / 2, this.y - 13);
    }

    update(dt) {
        const speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
        this.x -= this.speed * speedMult * dt;
        this.rotation += 0.04 * dt;

        // Magnet effect
        if (activePowerups.magnet > 0) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                this.x += dx * 0.05 * dt;
                this.y += dy * 0.05 * dt;
            }
        }
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Power-Up Class
class PowerUp {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = canvas.width + 100;
        this.y = GROUND_LEVEL - 120 - Math.random() * 80;

        const diffSettings = DIFFICULTY[currentDifficulty];
        const speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
        this.speed = (diffSettings.speed + Math.min(score / 3000, 3)) * speedMult;

        this.type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        this.rotation = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    draw() {
        const pulse = Math.sin(Date.now() / 150 + this.pulsePhase) * 5;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + pulse);
        ctx.rotate(this.rotation);

        // Glow effect
        ctx.shadowColor = this.type.color;
        ctx.shadowBlur = 25;

        // Star background
        ctx.fillStyle = this.type.color;
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, 25 + i * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Icon
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.type.icon, 0, 0);

        ctx.restore();
    }

    update(dt) {
        const speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
        this.x -= this.speed * speedMult * dt;
        this.rotation += 0.03 * dt;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Collision Detection
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Enhanced Background with Parallax
function drawBackground() {
    const era = ERAS[currentEraIndex];

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, era.skyGradient[0]);
    gradient.addColorStop(1, era.skyGradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Far background layer (slow parallax)
    ctx.globalAlpha = 0.2;
    const farOffset = (backgroundOffset * 0.3) % canvas.width;
    drawEraDecoration(farOffset, 0.8);

    // Mid background layer
    ctx.globalAlpha = 0.4;
    const midOffset = (backgroundOffset * 0.6) % canvas.width;
    drawEraDecoration(midOffset, 1);

    ctx.globalAlpha = 1;

    // Era info overlay
    ctx.font = 'bold 35px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillText(era.icon, 20, 55);

    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(era.theme, 65, 48);
}

function drawEraDecoration(offset, scale = 1) {
    ctx.save();

    switch(currentEraIndex) {
        case 0: drawColumns(offset, scale); break;
        case 1: drawCastles(offset, scale); break;
        case 2: drawArt(offset, scale); break;
        case 3: drawBooks(offset, scale); break;
        case 4: drawCities(offset, scale); break;
        case 5: drawTech(offset, scale); break;
    }

    ctx.restore();
}

function drawColumns(offset, scale) {
    ctx.fillStyle = 'rgba(196, 158, 100, 0.4)';
    for (let i = 0; i < 4; i++) {
        const x = i * 250 - offset;
        const h = 70 * scale;
        ctx.fillRect(x, canvas.height - 150, 25, h);
        ctx.fillRect(x + 7, canvas.height - 160, 10, 10);
    }
}

function drawCastles(offset, scale) {
    ctx.fillStyle = 'rgba(139, 69, 19, 0.4)';
    for (let i = 0; i < 3; i++) {
        const x = i * 350 - offset;
        const w = 50 * scale;
        const h = 50 * scale;
        ctx.fillRect(x, canvas.height - 130, w, h);
        ctx.fillRect(x + 10, canvas.height - 150, 10, 20);
        ctx.fillRect(x + 30, canvas.height - 150, 10, 20);
    }
}

function drawArt(offset, scale) {
    ctx.strokeStyle = 'rgba(205, 127, 50, 0.5)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
        const x = i * 300 - offset;
        ctx.strokeRect(x, canvas.height - 140, 60 * scale, 50 * scale);
        ctx.strokeRect(x + 10, canvas.height - 130, 20, 20);
    }
}

function drawBooks(offset, scale) {
    ctx.fillStyle = 'rgba(74, 134, 232, 0.4)';
    for (let i = 0; i < 5; i++) {
        const x = i * 200 - offset;
        ctx.fillRect(x, canvas.height - 100, 12, 25 * scale);
        ctx.fillRect(x + 15, canvas.height - 110, 12, 35 * scale);
        ctx.fillRect(x + 30, canvas.height - 95, 12, 20 * scale);
    }
}

function drawCities(offset, scale) {
    ctx.fillStyle = 'rgba(156, 39, 176, 0.4)';
    for (let i = 0; i < 6; i++) {
        const x = i * 180 - offset;
        const height = (40 + (i % 3) * 25) * scale;
        ctx.fillRect(x, canvas.height - height, 25, height - 20);
        ctx.fillRect(x + 5, canvas.height - height - 10, 5, 10);
    }
}

function drawTech(offset, scale) {
    ctx.strokeStyle = 'rgba(0, 188, 212, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        const x = i * 220 - offset;
        ctx.strokeRect(x, canvas.height - 110, 35, 35);
        ctx.beginPath();
        ctx.arc(x + 17, canvas.height - 92, 12, 0, Math.PI * 2);
        ctx.stroke();

        // Circuit lines
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 95);
        ctx.lineTo(x + 35, canvas.height - 95);
        ctx.stroke();
    }
}

// Enhanced Ground
function drawGround() {
    const era = ERAS[currentEraIndex];

    const gradient = ctx.createLinearGradient(0, GROUND_LEVEL + player.height, 0, canvas.height);
    gradient.addColorStop(0, era.primaryColor);
    gradient.addColorStop(0.6, era.secondaryColor);
    gradient.addColorStop(1, adjustColor(era.secondaryColor, -30));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, GROUND_LEVEL + player.height, canvas.width, canvas.height);

    // Glowing top line
    ctx.strokeStyle = era.primaryColor;
    ctx.lineWidth = 5;
    ctx.shadowColor = era.primaryColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_LEVEL + player.height);
    ctx.lineTo(canvas.width, GROUND_LEVEL + player.height);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Animated pattern
    ctx.fillStyle = adjustColor(era.secondaryColor, -40);
    const offset = (backgroundOffset * 0.2) % 40;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i - offset, GROUND_LEVEL + player.height + 12, 18, 4);
    }
}

// Draw Tutorial Messages
function drawTutorialMessages() {
    if (!tutorialMode || tutorialMessages.length === 0) return;

    tutorialMessages.forEach((msg, index) => {
        const alpha = Math.min(msg.life / 1000, 1);
        ctx.save();
        ctx.globalAlpha = alpha;

        const y = 150 + index * 50;
        ctx.font = 'bold 18px Arial';
        const textWidth = ctx.measureText(msg.text).width;

        // Background with glow
        ctx.shadowColor = '#c49e64';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(74, 44, 94, 0.95)';
        ctx.fillRect(canvas.width / 2 - textWidth / 2 - 25, y - 25, textWidth + 50, 42);

        // Border
        ctx.strokeStyle = '#c49e64';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 2 - textWidth / 2 - 25, y - 25, textWidth + 50, 42);

        // Text
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
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

                // Era transition effects
                screenShake = 15;
                createParticles(canvas.width / 2, canvas.height / 2, ERAS[i].primaryColor, 60);

                if (tutorialMode && tutorialStep === 4) {
                    tutorialMode = false;
                    tutorialMessages = [];
                }
            }
            break;
        }
    }
}

// Show Random Quote
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
    }, 4000);
}

// Update Score
function updateScore(dt) {
    if (gameRunning && !gamePaused) {
        score += dt * 0.6;
        document.getElementById('score').textContent = Math.floor(score / 10);
        updateEra();
        document.getElementById('wisdom').textContent = wisdom;

        // Update combo multiplier display
        if (comboMultiplier > 1) {
            document.getElementById('wisdom').style.color = '#ffd700';
            document.getElementById('wisdom').style.transform = `scale(${1 + (comboMultiplier - 1) * 0.1})`;
        } else {
            document.getElementById('wisdom').style.color = '';
            document.getElementById('wisdom').style.transform = '';
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
    }, 2500);
}

// Screen Shake
function applyScreenShake() {
    if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
        screenShake *= 0.9;
        if (screenShake < 0.5) screenShake = 0;
    }
}

// Game Over
function gameOver() {
    if (activePowerups.shield > 0) {
        activePowerups.shield = 0;
        screenShake = 10;
        floatingTexts.push(new FloatingText(player.x, player.y, 'GERETTET!', '#ffd700'));
        return;
    }

    gameRunning = false;
    cancelAnimationFrame(animationId);

    screenShake = 20;
    createParticles(player.x + player.width / 2, player.y + player.height / 2, '#ff5252', 40);

    const finalScore = Math.floor(score / 10);
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('finalWisdom').textContent = wisdom;
    document.getElementById('finalEraName').textContent = ERAS[currentEraIndex].name;
    document.getElementById('finalEraIcon').textContent = ERAS[currentEraIndex].icon;

    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('philosophyHighScore', highScore);
    }

    setTimeout(() => {
        switchScreen('gameOverScreen');
    }, 500);
}

// Game Loop with Delta Time
function gameLoop(currentTime = 0) {
    if (!lastTime) lastTime = currentTime;
    deltaTime = Math.min((currentTime - lastTime) / 16.67, 2); // Cap at 2x for lag spikes
    lastTime = currentTime;

    if (!gameRunning || gamePaused) {
        if (gamePaused) {
            animationId = requestAnimationFrame(gameLoop);
        }
        return;
    }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    applyScreenShake();

    drawBackground();
    drawGround();

    // Update background offset
    const speedMult = activePowerups.slowmo > 0 ? 0.5 : 1;
    backgroundOffset += (2 + score / 1000) * speedMult * deltaTime;

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(deltaTime);
        particles[i].draw();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }

    // Update and draw floating texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].update(deltaTime);
        floatingTexts[i].draw();
        if (floatingTexts[i].isDead()) {
            floatingTexts.splice(i, 1);
        }
    }

    // Update and draw power-ups
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].update(deltaTime);
        powerups[i].draw();

        if (checkCollision(player, powerups[i])) {
            const powerup = powerups[i];
            activePowerups[powerup.type.effect] = Date.now() + powerup.type.duration;
            floatingTexts.push(new FloatingText(powerup.x, powerup.y, powerup.type.name, powerup.type.color));
            createParticles(powerup.x, powerup.y, powerup.type.color, 20);
            powerups.splice(i, 1);
        } else if (powerups[i].isOffScreen()) {
            powerups.splice(i, 1);
        }
    }

    // Update and draw collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
        collectibles[i].update(deltaTime);
        collectibles[i].draw();

        if (checkCollision(player, collectibles[i])) {
            const work = collectibles[i].work;
            const basePoints = work.points;
            const points = Math.floor(basePoints * comboMultiplier);

            score += points;
            wisdom += Math.floor(10 * comboMultiplier);

            // Combo system
            const now = Date.now();
            if (now - lastCollectTime < 2000) {
                comboCount++;
                comboMultiplier = Math.min(1 + comboCount * 0.5, 5);
            } else {
                comboCount = 0;
                comboMultiplier = 1;
            }
            lastCollectTime = now;

            showCollectedWork(work, points);
            floatingTexts.push(new FloatingText(
                collectibles[i].x,
                collectibles[i].y,
                `+${points}`,
                comboMultiplier > 1 ? '#ffd700' : '#4caf50'
            ));

            createParticles(collectibles[i].x, collectibles[i].y, '#4caf50', 20);
            collectibles.splice(i, 1);

            if (tutorialMode && tutorialStep === 2) {
                tutorialStep = 3;
                showTutorialMessage(3);
            }
        } else if (collectibles[i].isOffScreen()) {
            collectibles.splice(i, 1);
        }
    }

    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update(deltaTime);
        obstacles[i].draw();

        if (checkCollision(player, obstacles[i])) {
            gameOver();
            ctx.restore();
            return;
        }

        if (obstacles[i].isOffScreen()) {
            obstacles.splice(i, 1);
        }
    }

    // Draw player
    player.draw();
    player.update(deltaTime);
    updateScore(deltaTime);

    // Spawn obstacles with patterns
    const diffSettings = DIFFICULTY[currentDifficulty];
    obstacleTimer += deltaTime;
    const spawnInterval = tutorialMode ? 120 : diffSettings.obstacleInterval - Math.min(score / 150, 40);

    if (obstacleTimer > spawnInterval) {
        const pattern = OBSTACLE_PATTERNS[Math.floor(Math.random() * OBSTACLE_PATTERNS.length)];
        pattern.forEach((spawn, index) => {
            if (spawn) {
                setTimeout(() => {
                    obstacles.push(new Obstacle());
                }, index * 400);
            }
        });
        obstacleTimer = 0;

        if (tutorialMode && tutorialStep === 3) {
            tutorialStep = 4;
            showTutorialMessage(4);
        }
    }

    // Spawn collectibles in lanes
    collectibleTimer += deltaTime;
    if (collectibleTimer > 100) {
        const lane = Math.floor(Math.random() * 3);
        collectibles.push(new Collectible(lane));
        collectibleTimer = 0;
    }

    // Spawn power-ups
    if (score > 200 && !tutorialMode) {
        powerupTimer += deltaTime;
        if (powerupTimer > 400) {
            powerups.push(new PowerUp());
            powerupTimer = 0;
        }
    }

    // Update tutorial messages
    if (tutorialMode) {
        for (let i = tutorialMessages.length - 1; i >= 0; i--) {
            tutorialMessages[i].life -= 16 * deltaTime;
            if (tutorialMessages[i].life <= 0) {
                tutorialMessages.splice(i, 1);
            }
        }
    }

    drawTutorialMessages();

    // Draw active power-up indicators
    drawPowerUpIndicators();

    // Update combo timer
    if (Date.now() - lastCollectTime > 2000 && comboMultiplier > 1) {
        comboMultiplier = Math.max(1, comboMultiplier - 0.1);
        comboCount = Math.floor((comboMultiplier - 1) * 2);
    }

    ctx.restore();
    animationId = requestAnimationFrame(gameLoop);
}

// Draw Power-Up Indicators
function drawPowerUpIndicators() {
    let yOffset = 90;
    const now = Date.now();

    Object.keys(activePowerups).forEach(key => {
        if (activePowerups[key] > now) {
            const powerupType = POWERUP_TYPES.find(p => p.effect === key);
            if (!powerupType) return;

            const timeLeft = (activePowerups[key] - now) / 1000;
            const width = 120;
            const height = 30;
            const x = canvas.width - width - 15;
            const y = yOffset;

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x, y, width, height);

            // Progress bar
            const progress = timeLeft / (powerupType.duration / 1000);
            ctx.fillStyle = powerupType.color;
            ctx.fillRect(x, y, width * progress, height);

            // Border
            ctx.strokeStyle = powerupType.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            // Icon and text
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.fillText(powerupType.icon, x + 5, y + 20);

            ctx.font = 'bold 12px Arial';
            ctx.fillText(`${Math.ceil(timeLeft)}s`, x + 35, y + 20);

            yOffset += 35;
        }
    });
}

// Start Game
function startGame() {
    gameRunning = true;
    gamePaused = false;
    score = 0;
    wisdom = 0;
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
    activePowerups = { slowmo: 0, shield: 0, magnet: 0 };

    player.reset();
    document.getElementById('score').textContent = '0';
    document.getElementById('wisdom').textContent = '0';
    document.getElementById('currentEra').textContent = ERAS[0].name;
    document.getElementById('philName').textContent = PHILOSOPHERS[selectedPhilosopherIndex].name;
    document.getElementById('philIcon').textContent = PHILOSOPHERS[selectedPhilosopherIndex].icon;

    switchScreen('gameScreen');

    showTutorialMessage(0);
    setTimeout(() => {
        tutorialStep = 1;
        showTutorialMessage(1);
    }, 3000);

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
        lastTime = 0; // Reset delta time
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Utility function
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
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (gameRunning) {
            player.jump();
        }
    }
});

canvas.addEventListener('click', () => {
    if (gameRunning) {
        player.jump();
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameRunning) {
        player.jump();
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

// Difficulty Selection
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
