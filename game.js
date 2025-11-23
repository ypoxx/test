// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const GRAVITY = 0.6;
const JUMP_POWER = -13;
const GROUND_LEVEL = canvas.height - 80;

// Philosophical Eras
const ERAS = [
    { name: 'Antike', color: '#c49e64', bgColor: '#f4e7d2', scoreThreshold: 0 },
    { name: 'Mittelalter', color: '#8b4513', bgColor: '#d4b896', scoreThreshold: 500 },
    { name: 'Renaissance', color: '#cd7f32', bgColor: '#fae5c8', scoreThreshold: 1000 },
    { name: 'Aufklärung', color: '#4a86e8', bgColor: '#e3f2fd', scoreThreshold: 1500 },
    { name: 'Moderne', color: '#9c27b0', bgColor: '#f3e5f5', scoreThreshold: 2500 },
    { name: 'Gegenwart', color: '#00bcd4', bgColor: '#e0f7fa', scoreThreshold: 4000 }
];

// Philosophers
const PHILOSOPHERS = [
    { name: 'Sokrates', icon: '🧔', era: 'Antike', speed: 1.0, jumpPower: 1.0 },
    { name: 'Augustinus', icon: '📿', era: 'Mittelalter', speed: 0.9, jumpPower: 1.1 },
    { name: 'Kant', icon: '🎩', era: 'Aufklärung', speed: 1.1, jumpPower: 0.95 }
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
    { text: "Was mich nicht umbringt, macht mich stärker", author: "Nietzsche" }
];

// Game State
let gameRunning = false;
let gamePaused = false;
let score = 0;
let highScore = localStorage.getItem('philosophyHighScore') || 0;
let currentEraIndex = 0;
let selectedPhilosopherIndex = 0;
let animationId;
let particles = [];
let collectibles = [];
let obstacles = [];
let obstacleTimer = 0;
let collectibleTimer = 0;

// Update displays
document.getElementById('highScore').textContent = highScore;

// Player Object
const player = {
    x: 100,
    y: GROUND_LEVEL,
    width: 50,
    height: 50,
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

        // Body with gradient
        const gradient = ctx.createRadialGradient(0, -10, 5, 0, 0, 25);
        const era = ERAS[currentEraIndex];
        gradient.addColorStop(0, era.color);
        gradient.addColorStop(1, adjustColor(era.color, -30));
        ctx.fillStyle = gradient;

        // Draw philosopher icon
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(PHILOSOPHERS[selectedPhilosopherIndex].icon, 0, 0);

        // Aura effect when jumping
        if (this.isJumping) {
            ctx.strokeStyle = era.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    },

    update() {
        // Apply gravity
        this.velocityY += GRAVITY;
        this.y += this.velocityY;

        // Ground collision
        if (this.y >= GROUND_LEVEL) {
            this.y = GROUND_LEVEL;
            this.velocityY = 0;
            this.isJumping = false;
            this.rotation = 0;

            // Landing particles
            if (this.velocityY > 5) {
                createParticles(this.x + this.width / 2, this.y + this.height,
                              ERAS[currentEraIndex].color, 6);
            }
        }

        // Rotation while jumping
        if (this.isJumping) {
            this.rotation += 0.1;
        }
    },

    jump() {
        if (!this.isJumping && gameRunning && !gamePaused) {
            const philosopher = PHILOSOPHERS[selectedPhilosopherIndex];
            this.velocityY = JUMP_POWER * philosopher.jumpPower;
            this.isJumping = true;
            createParticles(this.x + this.width / 2, this.y + this.height,
                          ERAS[currentEraIndex].color, 10);
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
        this.width = 40;
        this.height = 50 + Math.random() * 30;
        this.x = canvas.width;
        this.y = GROUND_LEVEL + player.height - this.height;
        this.speed = 5 + (score / 1000);
        this.type = Math.random() > 0.5 ? 'dilemma' : 'paradox';
        this.icon = this.type === 'dilemma' ? '❓' : '⚡';
    }

    draw() {
        const era = ERAS[currentEraIndex];

        // Base
        ctx.fillStyle = adjustColor(era.color, -20);
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Border
        ctx.strokeStyle = era.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Icon
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x + this.width / 2, this.y + this.height / 2);
    }

    update() {
        this.x -= this.speed;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Collectible Class (Books of Wisdom)
class Collectible {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = canvas.width;
        this.y = GROUND_LEVEL - 80 - Math.random() * 120;
        this.speed = 5 + (score / 1000);
        this.rotation = 0;
        this.icon = '📚';
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        ctx.restore();
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

    // Decorative elements for each era
    drawEraDecoration();
}

function drawEraDecoration() {
    const offset = (score / 2) % canvas.width;

    switch(currentEraIndex) {
        case 0: // Antike
            drawColumns(offset);
            break;
        case 1: // Mittelalter
            drawCastles(offset);
            break;
        case 2: // Renaissance
            drawArt(offset);
            break;
        case 3: // Aufklärung
            drawBooks(offset);
            break;
        case 4: // Moderne
            drawCities(offset);
            break;
        case 5: // Gegenwart
            drawTech(offset);
            break;
    }
}

function drawColumns(offset) {
    ctx.fillStyle = 'rgba(196, 158, 100, 0.3)';
    for (let i = 0; i < 3; i++) {
        const x = i * 300 - offset;
        ctx.fillRect(x, canvas.height - 150, 30, 70);
        ctx.fillRect(x, canvas.height - 150, 30, 10);
    }
}

function drawCastles(offset) {
    ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
    for (let i = 0; i < 3; i++) {
        const x = i * 350 - offset;
        ctx.fillRect(x, canvas.height - 130, 50, 50);
        ctx.fillRect(x + 10, canvas.height - 150, 10, 20);
        ctx.fillRect(x + 30, canvas.height - 150, 10, 20);
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
        ctx.fillRect(x + 40, canvas.height - 95, 15, 15);
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

    // Ground gradient
    const gradient = ctx.createLinearGradient(0, GROUND_LEVEL + player.height, 0, canvas.height);
    gradient.addColorStop(0, adjustColor(era.color, 20));
    gradient.addColorStop(1, adjustColor(era.color, -20));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, GROUND_LEVEL + player.height, canvas.width, canvas.height);

    // Ground line
    ctx.strokeStyle = era.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_LEVEL + player.height);
    ctx.lineTo(canvas.width, GROUND_LEVEL + player.height);
    ctx.stroke();

    // Decorative pattern
    ctx.fillStyle = adjustColor(era.color, -30);
    const offset = (score / 5) % 40;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i - offset, GROUND_LEVEL + player.height + 10, 20, 3);
    }
}

// Update Era
function updateEra() {
    for (let i = ERAS.length - 1; i >= 0; i--) {
        if (score >= ERAS[i].scoreThreshold) {
            if (i !== currentEraIndex) {
                currentEraIndex = i;
                document.getElementById('currentEra').textContent = ERAS[i].name;
                showQuote();
                createParticles(canvas.width / 2, canvas.height / 2, ERAS[i].color, 50);
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
    }
}

// Game Over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);

    createParticles(player.x + player.width / 2, player.y + player.height / 2, '#ff5252', 30);

    const finalScore = Math.floor(score / 10);
    document.getElementById('finalScore').textContent = finalScore;
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

    // Draw
    drawBackground();
    drawGround();

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
            score += 100;
            createParticles(collectibles[i].x, collectibles[i].y, '#4caf50', 15);
            collectibles.splice(i, 1);
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
    obstacleTimer++;
    if (obstacleTimer > 100 - Math.min(score / 100, 30)) {
        obstacles.push(new Obstacle());
        obstacleTimer = 0;
    }

    // Spawn collectibles
    collectibleTimer++;
    if (collectibleTimer > 150) {
        collectibles.push(new Collectible());
        collectibleTimer = 0;
    }

    animationId = requestAnimationFrame(gameLoop);
}

// Start Game
function startGame() {
    gameRunning = true;
    gamePaused = false;
    score = 0;
    currentEraIndex = 0;
    obstacles = [];
    collectibles = [];
    particles = [];
    obstacleTimer = 0;
    collectibleTimer = 0;

    player.reset();
    document.getElementById('score').textContent = '0';
    document.getElementById('currentEra').textContent = ERAS[0].name;
    document.getElementById('currentPhilosopher').textContent = PHILOSOPHERS[selectedPhilosopherIndex].name;
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('startScreen').classList.add('hidden');

    gameLoop();
}

// Utility function to adjust color brightness
function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        player.jump();
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
    player.jump();
});

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
});

document.getElementById('startBtn').addEventListener('click', startGame);

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
        } else {
            card.classList.remove('selected');
        }
    });
}

// Initial setup
updateCharacterSelection();
drawBackground();
drawGround();
