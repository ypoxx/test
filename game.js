// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const GRAVITY = 0.6;
const JUMP_POWER = -13;
const GROUND_LEVEL = canvas.height - 80;

// Difficulty Settings
const DIFFICULTY = {
    easy: { speed: 3, obstacleInterval: 140, name: 'Nachdenklich' },
    normal: { speed: 5, obstacleInterval: 110, name: 'Philosophisch' },
    hard: { speed: 7, obstacleInterval: 80, name: 'Erleuchtung' }
};

let currentDifficulty = 'easy';
let tutorialMode = true;
let tutorialStep = 0;
let showingHowToPlay = false;

// Philosophical Eras with Themes
const ERAS = [
    {
        name: 'Antike',
        color: '#c49e64',
        bgColor: '#f4e7d2',
        scoreThreshold: 0,
        theme: 'Erkenne dich selbst',
        icon: '🏛️'
    },
    {
        name: 'Mittelalter',
        color: '#8b4513',
        bgColor: '#d4b896',
        scoreThreshold: 500,
        theme: 'Glaube und Vernunft',
        icon: '⛪'
    },
    {
        name: 'Renaissance',
        color: '#cd7f32',
        bgColor: '#fae5c8',
        scoreThreshold: 1000,
        theme: 'Humanismus',
        icon: '🎨'
    },
    {
        name: 'Aufklärung',
        color: '#4a86e8',
        bgColor: '#e3f2fd',
        scoreThreshold: 1500,
        theme: 'Sapere Aude!',
        icon: '💡'
    },
    {
        name: 'Moderne',
        color: '#9c27b0',
        bgColor: '#f3e5f5',
        scoreThreshold: 2500,
        theme: 'Existenz & Sein',
        icon: '🏭'
    },
    {
        name: 'Gegenwart',
        color: '#00bcd4',
        bgColor: '#e0f7fa',
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
        jumpPower: 1.0
    },
    {
        name: 'Augustinus',
        icon: '📿',
        era: 'Mittelalter',
        lived: '354-430 n.Chr.',
        idea: 'Glaube sucht Verständnis',
        jumpPower: 1.1
    },
    {
        name: 'Kant',
        icon: '🎩',
        era: 'Aufklärung',
        lived: '1724-1804',
        idea: 'Handle nach dem kategorischen Imperativ',
        jumpPower: 0.95
    }
];

// Philosophical Works as Collectibles
const PHILOSOPHICAL_WORKS = [
    { name: 'Politeia', author: 'Platon', icon: '📕', era: 0 },
    { name: 'Nikomachische Ethik', author: 'Aristoteles', icon: '📗', era: 0 },
    { name: 'Confessiones', author: 'Augustinus', icon: '📘', era: 1 },
    { name: 'Summa Theologica', author: 'Thomas von Aquin', icon: '📙', era: 1 },
    { name: 'Der Fürst', author: 'Machiavelli', icon: '📕', era: 2 },
    { name: 'Kritik der reinen Vernunft', author: 'Kant', icon: '📗', era: 3 },
    { name: 'Leviathan', author: 'Hobbes', icon: '📘', era: 3 },
    { name: 'Also sprach Zarathustra', author: 'Nietzsche', icon: '📙', era: 4 },
    { name: 'Sein und Zeit', author: 'Heidegger', icon: '📕', era: 4 },
    { name: 'Eine Theorie der Gerechtigkeit', author: 'Rawls', icon: '📗', era: 5 }
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

// Philosophical Quotes
const QUOTES = [
    { text: "Ich weiß, dass ich nichts weiß", author: "Sokrates" },
    { text: "Cogito, ergo sum - Ich denke, also bin ich", author: "Descartes" },
    { text: "Der Mensch ist dem Menschen ein Wolf", author: "Hobbes" },
    { text: "Sapere aude! - Habe Mut, dich deines eigenen Verstandes zu bedienen!", author: "Kant" },
    { text: "Die Hölle, das sind die anderen", author: "Sartre" },
    { text: "Gott ist tot", author: "Nietzsche" },
    { text: "Das Sein bestimmt das Bewusstsein", author: "Marx" },
    { text: "Was mich nicht umbringt, macht mich stärker", author: "Nietzsche" },
    { text: "Das ungeprüfte Leben ist nicht lebenswert", author: "Sokrates" },
    { text: "Ich kann, weil ich will, was ich muss", author: "Kant" }
];

// Game State
let gameRunning = false;
let gamePaused = false;
let score = 0;
let wisdom = 0; // New: Wisdom points
let highScore = localStorage.getItem('philosophyHighScore') || 0;
let currentEraIndex = 0;
let selectedPhilosopherIndex = 0;
let animationId;
let particles = [];
let collectibles = [];
let obstacles = [];
let obstacleTimer = 0;
let collectibleTimer = 0;
let comboCount = 0;
let lastCollectTime = 0;
let tutorialMessages = [];

// Tutorial Messages
const TUTORIAL_STEPS = [
    { text: "Willkommen zur philosophischen Reise!", duration: 3000 },
    { text: "Drücke LEERTASTE zum Springen! ⬆️", duration: 3000 },
    { text: "Sammle philosophische Werke 📚", duration: 3000 },
    { text: "Weiche Dilemmata aus! ⚠️", duration: 3000 },
    { text: "Erreiche neue Epochen der Philosophie! 🎯", duration: 3000 }
];

// Update displays
document.getElementById('highScore').textContent = highScore;

// Player Object
const player = {
    x: 100,
    y: GROUND_LEVEL,
    width: 60,
    height: 60,
    velocityY: 0,
    isJumping: false,
    rotation: 0,

    draw() {
        ctx.save();

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        const shadowScale = 1 - (GROUND_LEVEL - this.y) / 300;
        ctx.ellipse(this.x + this.width / 2, GROUND_LEVEL + this.height + 5,
                   this.width / 2 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Character
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        // Aura effect
        const era = ERAS[currentEraIndex];
        if (this.isJumping) {
            ctx.strokeStyle = era.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(0, 0, 35, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Draw philosopher icon (larger)
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(PHILOSOPHERS[selectedPhilosopherIndex].icon, 0, 0);

        ctx.restore();
    },

    update() {
        this.velocityY += GRAVITY;
        this.y += this.velocityY;

        if (this.y >= GROUND_LEVEL) {
            this.y = GROUND_LEVEL;
            this.velocityY = 0;
            this.isJumping = false;
            this.rotation = 0;

            if (this.velocityY > 5) {
                createParticles(this.x + this.width / 2, this.y + this.height,
                              ERAS[currentEraIndex].color, 6);
            }
        }

        if (this.isJumping) {
            this.rotation += 0.08;
        }
    },

    jump() {
        if (!this.isJumping && gameRunning && !gamePaused) {
            const philosopher = PHILOSOPHERS[selectedPhilosopherIndex];
            this.velocityY = JUMP_POWER * philosopher.jumpPower;
            this.isJumping = true;
            createParticles(this.x + this.width / 2, this.y + this.height,
                          ERAS[currentEraIndex].color, 10);

            // Tutorial progress
            if (tutorialMode && tutorialStep === 1) {
                tutorialStep = 2;
                showTutorialMessage(2);
            }
        }
    },

    reset() {
        this.y = GROUND_LEVEL;
        this.velocityY = 0;
        this.isJumping = false;
        this.rotation = 0;
    }
};

// Particle System
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocityX = (Math.random() - 0.5) * 4;
        this.velocityY = (Math.random() - 0.5) * 4 - 2;
        this.size = Math.random() * 4 + 2;
        this.life = 1;
        this.decay = 0.02;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.2;
        this.life -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
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

// Obstacle Class (Philosophical Dilemmas)
class Obstacle {
    constructor() {
        this.width = 50;
        this.height = 60 + Math.random() * 20;
        this.x = canvas.width + 100;
        this.y = GROUND_LEVEL + player.height - this.height;
        const diffSettings = DIFFICULTY[currentDifficulty];
        this.speed = tutorialMode ? 2 : diffSettings.speed + (score / 2000);

        // Select dilemma based on era
        const eraProblems = PHILOSOPHICAL_DILEMMAS.filter(d => d.era === currentEraIndex);
        const allProblems = eraProblems.length > 0 ? eraProblems : PHILOSOPHICAL_DILEMMAS;
        this.dilemma = allProblems[Math.floor(Math.random() * allProblems.length)];
    }

    draw() {
        const era = ERAS[currentEraIndex];

        // Base with gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, adjustColor(era.color, -10));
        gradient.addColorStop(1, adjustColor(era.color, -40));
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Border
        ctx.strokeStyle = era.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Icon (larger)
        ctx.font = 'bold 35px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.dilemma.icon, this.x + this.width / 2, this.y + this.height / 2);

        // Name label (NEW!)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(this.x - 5, this.y - 25, this.width + 10, 22);
        ctx.fillStyle = era.color;
        ctx.font = 'bold 11px Arial';
        ctx.fillText(this.dilemma.name, this.x + this.width / 2, this.y - 14);
    }

    update() {
        this.x -= this.speed;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Collectible Class (Philosophical Works)
class Collectible {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = canvas.width + 100;
        this.y = GROUND_LEVEL - 100 - Math.random() * 120;
        const diffSettings = DIFFICULTY[currentDifficulty];
        this.speed = tutorialMode ? 2 : diffSettings.speed + (score / 2000);
        this.rotation = 0;

        // Select work based on era
        const eraWorks = PHILOSOPHICAL_WORKS.filter(w => w.era === currentEraIndex);
        const allWorks = eraWorks.length > 0 ? eraWorks : PHILOSOPHICAL_WORKS;
        this.work = allWorks[Math.floor(Math.random() * allWorks.length)];
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        // Glow effect
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;

        // Icon (larger)
        ctx.font = 'bold 35px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.work.icon, 0, 0);

        ctx.restore();

        // Work title (NEW!)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const textWidth = ctx.measureText(this.work.name).width;
        ctx.fillRect(this.x + this.width / 2 - textWidth / 2 - 5, this.y - 25, textWidth + 10, 22);
        ctx.fillStyle = '#2d5016';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(this.work.name, this.x + this.width / 2, this.y - 14);
    }

    update() {
        this.x -= this.speed;
        this.rotation += 0.05;
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

// Draw Background
function drawBackground() {
    const era = ERAS[currentEraIndex];

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, era.bgColor);
    gradient.addColorStop(1, adjustColor(era.bgColor, -20));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Era icon and theme
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillText(era.icon, 20, 60);

    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillText(era.theme, 70, 50);

    // Decorative elements
    drawEraDecoration();
}

function drawEraDecoration() {
    const offset = (score / 2) % canvas.width;

    switch(currentEraIndex) {
        case 0: drawColumns(offset); break;
        case 1: drawCastles(offset); break;
        case 2: drawArt(offset); break;
        case 3: drawBooks(offset); break;
        case 4: drawCities(offset); break;
        case 5: drawTech(offset); break;
    }
}

function drawColumns(offset) {
    ctx.fillStyle = 'rgba(196, 158, 100, 0.3)';
    for (let i = 0; i < 3; i++) {
        const x = i * 300 - offset;
        ctx.fillRect(x, canvas.height - 150, 30, 70);
    }
}

function drawCastles(offset) {
    ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
    for (let i = 0; i < 3; i++) {
        const x = i * 350 - offset;
        ctx.fillRect(x, canvas.height - 130, 50, 50);
        ctx.fillRect(x + 10, canvas.height - 150, 10, 20);
    }
}

function drawArt(offset) {
    ctx.strokeStyle = 'rgba(205, 127, 50, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        const x = i * 300 - offset;
        ctx.strokeRect(x, canvas.height - 140, 60, 40);
    }
}

function drawBooks(offset) {
    ctx.fillStyle = 'rgba(74, 134, 232, 0.3)';
    for (let i = 0; i < 4; i++) {
        const x = i * 250 - offset;
        ctx.fillRect(x, canvas.height - 100, 15, 20);
        ctx.fillRect(x + 20, canvas.height - 110, 15, 30);
    }
}

function drawCities(offset) {
    ctx.fillStyle = 'rgba(156, 39, 176, 0.3)';
    for (let i = 0; i < 5; i++) {
        const x = i * 200 - offset;
        const height = 50 + (i % 3) * 30;
        ctx.fillRect(x, canvas.height - height, 30, height - 20);
    }
}

function drawTech(offset) {
    ctx.strokeStyle = 'rgba(0, 188, 212, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const x = i * 250 - offset;
        ctx.strokeRect(x, canvas.height - 110, 40, 30);
        ctx.beginPath();
        ctx.arc(x + 20, canvas.height - 95, 10, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Draw Ground
function drawGround() {
    const era = ERAS[currentEraIndex];

    const gradient = ctx.createLinearGradient(0, GROUND_LEVEL + player.height, 0, canvas.height);
    gradient.addColorStop(0, adjustColor(era.color, 20));
    gradient.addColorStop(1, adjustColor(era.color, -20));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, GROUND_LEVEL + player.height, canvas.width, canvas.height);

    ctx.strokeStyle = era.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_LEVEL + player.height);
    ctx.lineTo(canvas.width, GROUND_LEVEL + player.height);
    ctx.stroke();

    ctx.fillStyle = adjustColor(era.color, -30);
    const offset = (score / 5) % 40;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i - offset, GROUND_LEVEL + player.height + 10, 20, 3);
    }
}

// Draw Progress Bar (NEW!)
function drawProgressBar() {
    const nextEra = ERAS[currentEraIndex + 1];
    if (!nextEra) return;

    const progress = (score - ERAS[currentEraIndex].scoreThreshold) /
                     (nextEra.scoreThreshold - ERAS[currentEraIndex].scoreThreshold);
    const barWidth = 300;
    const barHeight = 25;
    const barX = canvas.width - barWidth - 20;
    const barY = 80;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Progress fill
    const era = ERAS[currentEraIndex];
    ctx.fillStyle = era.color;
    ctx.fillRect(barX, barY, barWidth * Math.min(progress, 1), barHeight);

    // Border
    ctx.strokeStyle = era.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Nächste Epoche: ${nextEra.name} ${nextEra.icon}`, barX + barWidth / 2, barY - 8);
}

// Draw Tutorial Messages (NEW!)
function drawTutorialMessages() {
    if (!tutorialMode || tutorialMessages.length === 0) return;

    tutorialMessages.forEach((msg, index) => {
        const alpha = Math.min(msg.life / 1000, 1);
        ctx.save();
        ctx.globalAlpha = alpha;

        const y = 150 + index * 50;
        const textWidth = ctx.measureText(msg.text).width;

        // Background
        ctx.fillStyle = 'rgba(74, 44, 94, 0.9)';
        ctx.fillRect(canvas.width / 2 - textWidth / 2 - 20, y - 25, textWidth + 40, 40);

        // Border
        ctx.strokeStyle = '#c49e64';
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width / 2 - textWidth / 2 - 20, y - 25, textWidth + 40, 40);

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
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
                document.getElementById('eraIcon').textContent = ERAS[i].icon;
                document.getElementById('eraTheme').textContent = ERAS[i].theme;
                showQuote();
                createParticles(canvas.width / 2, canvas.height / 2, ERAS[i].color, 50);

                // Tutorial progress
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
    const quoteEl = document.getElementById('quote');
    document.getElementById('quoteText').textContent = `"${quote.text}"`;
    document.getElementById('quoteAuthor').textContent = `- ${quote.author}`;
    quoteEl.classList.remove('hidden');

    setTimeout(() => {
        quoteEl.classList.add('hidden');
    }, 4000);
}

// Update Score
function updateScore() {
    if (gameRunning && !gamePaused) {
        score++;
        document.getElementById('score').textContent = Math.floor(score / 10);
        updateEra();

        // Update wisdom display
        document.getElementById('wisdom').textContent = wisdom;
    }
}

// Show Collected Work (NEW!)
function showCollectedWork(work) {
    const notification = document.createElement('div');
    notification.className = 'work-notification';
    notification.innerHTML = `
        <div class="work-title">${work.icon} ${work.name}</div>
        <div class="work-author">von ${work.author}</div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// Game Over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);

    createParticles(player.x + player.width / 2, player.y + player.height / 2, '#ff5252', 30);

    const finalScore = Math.floor(score / 10);
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('finalWisdom').textContent = wisdom;
    document.getElementById('finalEra').textContent = ERAS[currentEraIndex].name;

    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('philosophyHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }

    setTimeout(() => {
        document.getElementById('gameOver').classList.remove('hidden');
    }, 300);
}

// Game Loop
function gameLoop() {
    if (!gameRunning || gamePaused) {
        if (gamePaused) {
            animationId = requestAnimationFrame(gameLoop);
        }
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawGround();
    drawProgressBar();

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }

    // Update and draw collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
        collectibles[i].update();
        collectibles[i].draw();

        if (checkCollision(player, collectibles[i])) {
            const work = collectibles[i].work;
            score += 100;
            wisdom += 10;

            // Combo system
            const now = Date.now();
            if (now - lastCollectTime < 2000) {
                comboCount++;
                wisdom += comboCount * 5;
            } else {
                comboCount = 0;
            }
            lastCollectTime = now;

            showCollectedWork(work);
            createParticles(collectibles[i].x, collectibles[i].y, '#4caf50', 15);
            collectibles.splice(i, 1);

            // Tutorial progress
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
        obstacles[i].update();
        obstacles[i].draw();

        if (checkCollision(player, obstacles[i])) {
            gameOver();
            return;
        }

        if (obstacles[i].isOffScreen()) {
            obstacles.splice(i, 1);
        }
    }

    // Draw player
    player.draw();
    player.update();
    updateScore();

    // Spawn obstacles
    const diffSettings = DIFFICULTY[currentDifficulty];
    obstacleTimer++;
    const spawnInterval = tutorialMode ? 200 : diffSettings.obstacleInterval - Math.min(score / 100, 30);
    if (obstacleTimer > spawnInterval) {
        obstacles.push(new Obstacle());
        obstacleTimer = 0;

        // Tutorial progress
        if (tutorialMode && tutorialStep === 3) {
            tutorialStep = 4;
            showTutorialMessage(4);
        }
    }

    // Spawn collectibles
    collectibleTimer++;
    if (collectibleTimer > 150) {
        collectibles.push(new Collectible());
        collectibleTimer = 0;
    }

    // Update tutorial messages
    if (tutorialMode) {
        for (let i = tutorialMessages.length - 1; i >= 0; i--) {
            tutorialMessages[i].life -= 16;
            if (tutorialMessages[i].life <= 0) {
                tutorialMessages.splice(i, 1);
            }
        }
    }

    drawTutorialMessages();

    animationId = requestAnimationFrame(gameLoop);
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
    particles = [];
    obstacleTimer = 0;
    collectibleTimer = 0;
    comboCount = 0;
    tutorialMode = true;
    tutorialStep = 0;
    tutorialMessages = [];

    player.reset();
    document.getElementById('score').textContent = '0';
    document.getElementById('wisdom').textContent = '0';
    document.getElementById('currentEra').textContent = ERAS[0].name;
    document.getElementById('eraIcon').textContent = ERAS[0].icon;
    document.getElementById('eraTheme').textContent = ERAS[0].theme;
    document.getElementById('currentPhilosopher').textContent = PHILOSOPHERS[selectedPhilosopherIndex].name;
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('startScreen').classList.add('hidden');

    // Start tutorial
    showTutorialMessage(0);
    setTimeout(() => {
        tutorialStep = 1;
        showTutorialMessage(1);
    }, 3000);

    gameLoop();
}

// Utility function
function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (gameRunning) {
            player.jump();
        }
    }
    if (e.key === 'p' || e.key === 'P') {
        if (gameRunning) {
            gamePaused = !gamePaused;
            if (!gamePaused) gameLoop();
        }
    }
    if (e.key === 'ArrowUp' && !gameRunning) {
        selectedPhilosopherIndex = (selectedPhilosopherIndex - 1 + PHILOSOPHERS.length) % PHILOSOPHERS.length;
        updateCharacterSelection();
    }
    if (e.key === 'ArrowDown' && !gameRunning) {
        selectedPhilosopherIndex = (selectedPhilosopherIndex + 1) % PHILOSOPHERS.length;
        updateCharacterSelection();
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

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
});

document.getElementById('startBtn').addEventListener('click', startGame);

// Difficulty selection
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentDifficulty = btn.dataset.difficulty;
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});

// How to Play
const howToPlayBtn = document.getElementById('howToPlayBtn');
const howToPlayOverlay = document.getElementById('howToPlay');
const closeHowToPlayBtn = document.getElementById('closeHowToPlay');

if (howToPlayBtn && howToPlayOverlay) {
    howToPlayBtn.addEventListener('click', () => {
        howToPlayOverlay.classList.remove('hidden');
    });
}

if (closeHowToPlayBtn && howToPlayOverlay) {
    closeHowToPlayBtn.addEventListener('click', () => {
        howToPlayOverlay.classList.add('hidden');
    });
}

// Close on background click
if (howToPlayOverlay) {
    howToPlayOverlay.addEventListener('click', (e) => {
        if (e.target === howToPlayOverlay) {
            howToPlayOverlay.classList.add('hidden');
        }
    });
}

// Character selection
document.querySelectorAll('.character-card').forEach((card, index) => {
    card.addEventListener('click', () => {
        selectedPhilosopherIndex = index;
        updateCharacterSelection();
    });
});

function updateCharacterSelection() {
    document.querySelectorAll('.character-card').forEach((card, index) => {
        if (index === selectedPhilosopherIndex) {
            card.classList.add('selected');
            const phil = PHILOSOPHERS[index];
            document.getElementById('philInfo').innerHTML = `
                <strong>${phil.name}</strong> (${phil.lived})<br>
                <em>"${phil.idea}"</em>
            `;
        } else {
            card.classList.remove('selected');
        }
    });
}

// Initial setup
updateCharacterSelection();
drawBackground();
drawGround();
