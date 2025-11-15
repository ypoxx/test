// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameRunning = false;
let gameSpeed = 5;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let animationId;
let particles = [];
let stars = [];

// Update high score display
document.getElementById('highScore').textContent = highScore;

// Generate stars for background
for (let i = 0; i < 50; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height - 60),
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
    });
}

// Particle System
class Particle {
    constructor(x, y, color, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.size = Math.random() * 4 + 2;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.2; // Gravity
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
        const angle = (Math.PI * 2 * i) / count;
        const speed = Math.random() * 3 + 2;
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed - 2;
        particles.push(new Particle(x, y, color, velocityX, velocityY));
    }
}

// Player Object
const player = {
    x: 50,
    y: 300,
    width: 40,
    height: 40,
    velocityY: 0,
    gravity: 0.6,
    jumpPower: -12,
    isJumping: false,
    rotation: 0,
    targetRotation: 0,
    wasJumping: false,

    draw() {
        ctx.save();

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        const shadowY = canvas.height - 60;
        const shadowScale = 1 - (shadowY - this.y - this.height) / 200;
        ctx.ellipse(this.x + this.width / 2, shadowY + 5,
                   this.width / 2 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Translate to player center for rotation
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-this.width / 2, -this.height / 2);

        // Body with gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;

        // Rounded rectangle body
        ctx.beginPath();
        ctx.roundRect(0, 0, this.width, this.height, 10);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(3, 3, this.width - 6, this.height / 2, 8);
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(12, 15, 6, 0, Math.PI * 2);
        ctx.arc(28, 15, 6, 0, Math.PI * 2);
        ctx.fill();

        // Pupils (follow movement)
        const pupilOffsetX = this.velocityY < 0 ? -1 : 1;
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(12 + pupilOffsetX, 15, 3, 0, Math.PI * 2);
        ctx.arc(28 + pupilOffsetX, 15, 3, 0, Math.PI * 2);
        ctx.fill();

        // Mouth (changes based on jumping)
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (this.isJumping) {
            // Excited mouth
            ctx.arc(20, 25, 8, 0.2, Math.PI - 0.2);
        } else {
            // Normal smile
            ctx.arc(20, 22, 6, 0.1, Math.PI - 0.1);
        }
        ctx.stroke();

        ctx.restore();
    },

    update() {
        const wasOnGround = !this.isJumping && this.velocityY === 0;

        // Apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Ground collision
        const groundLevel = canvas.height - this.height - 60;
        if (this.y >= groundLevel) {
            this.y = groundLevel;
            this.velocityY = 0;

            // Landing particles
            if (this.wasJumping) {
                createParticles(this.x + this.width / 2, this.y + this.height,
                              '#8bc34a', 8);
            }

            this.isJumping = false;
            this.targetRotation = 0;
        }

        // Smooth rotation
        this.rotation += (this.targetRotation - this.rotation) * 0.1;

        // Update rotation while jumping
        if (this.isJumping && this.velocityY < 0) {
            this.targetRotation = -Math.PI / 8; // Tilt back when going up
        } else if (this.isJumping && this.velocityY > 0) {
            this.targetRotation = Math.PI / 12; // Tilt forward when falling
        }

        this.wasJumping = this.isJumping;
    },

    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpPower;
            this.isJumping = true;
            // Jump particles
            createParticles(this.x + this.width / 2, this.y + this.height,
                          '#667eea', 10);
        }
    },

    reset() {
        this.y = 300;
        this.velocityY = 0;
        this.isJumping = false;
        this.rotation = 0;
        this.targetRotation = 0;
        this.wasJumping = false;
    }
};

// Obstacles Array
let obstacles = [];
let obstacleTimer = 0;
const obstacleInterval = 120; // Frames between obstacles

class Obstacle {
    constructor() {
        this.width = 30;
        this.height = Math.random() * 40 + 40;
        this.x = canvas.width;
        this.y = canvas.height - this.height - 60;
        this.type = Math.random() > 0.5 ? 'spike' : 'block';
        this.hue = Math.random() * 30 + 260; // Purple range
    }

    draw() {
        ctx.save();

        if (this.type === 'spike') {
            // Spike obstacle
            const gradient = ctx.createLinearGradient(
                this.x, this.y,
                this.x, this.y + this.height
            );
            gradient.addColorStop(0, `hsl(${this.hue}, 60%, 50%)`);
            gradient.addColorStop(1, `hsl(${this.hue}, 60%, 35%)`);
            ctx.fillStyle = gradient;

            // Draw spike shape
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.closePath();
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + 5);
            ctx.lineTo(this.x + this.width / 2 + 5, this.y + this.height / 2);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
            ctx.closePath();
            ctx.fill();

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height - 10);
            ctx.lineTo(this.x + this.width - 5, this.y + this.height);
            ctx.lineTo(this.x + 5, this.y + this.height);
            ctx.closePath();
            ctx.fill();

        } else {
            // Block obstacle
            const gradient = ctx.createLinearGradient(
                this.x, this.y,
                this.x, this.y + this.height
            );
            gradient.addColorStop(0, `hsl(${this.hue}, 60%, 50%)`);
            gradient.addColorStop(1, `hsl(${this.hue}, 60%, 35%)`);
            ctx.fillStyle = gradient;

            // Rounded block
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height, 8);
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.roundRect(this.x + 3, this.y + 3, this.width - 6, this.height / 3, 5);
            ctx.fill();

            // Inner detail
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10, 5);
            ctx.stroke();
        }

        ctx.restore();
    }

    update() {
        this.x -= gameSpeed;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Collision Detection
function checkCollision(player, obstacle) {
    return player.x < obstacle.x + obstacle.width &&
           player.x + player.width > obstacle.x &&
           player.y < obstacle.y + obstacle.height &&
           player.y + player.height > obstacle.y;
}

// Draw Ground
function drawGround() {
    // Grass gradient
    const gradient = ctx.createLinearGradient(0, canvas.height - 60, 0, canvas.height);
    gradient.addColorStop(0, '#8bc34a');
    gradient.addColorStop(0.5, '#7cb342');
    gradient.addColorStop(1, '#689f38');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

    // Grass blades
    ctx.fillStyle = '#7cb342';
    const offset = (score / 5) % 20;
    for (let i = -20; i < canvas.width + 20; i += 20) {
        const x = i - offset;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 60);
        ctx.lineTo(x + 5, canvas.height - 70);
        ctx.lineTo(x + 3, canvas.height - 60);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x + 10, canvas.height - 60);
        ctx.lineTo(x + 13, canvas.height - 65);
        ctx.lineTo(x + 12, canvas.height - 60);
        ctx.fill();
    }

    // Ground line
    ctx.strokeStyle = '#689f38';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 60);
    ctx.lineTo(canvas.width, canvas.height - 60);
    ctx.stroke();

    // Dirt
    ctx.fillStyle = '#6d4c41';
    for (let i = 0; i < canvas.width; i += 30) {
        ctx.fillRect(i + 10, canvas.height - 40, 3, 3);
        ctx.fillRect(i + 20, canvas.height - 25, 2, 2);
        ctx.fillRect(i + 5, canvas.height - 15, 2, 2);
    }
}

// Draw Background
function drawBackground() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height - 60);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#e0f7ff');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height - 60);

    // Stars (subtle)
    stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < -10) star.x = canvas.width + 10;

        ctx.fillStyle = `rgba(255, 255, 255, ${star.size / 4})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Clouds with better rendering
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

    // Cloud 1
    const cloud1X = 100 - (score % 800);
    drawCloud(cloud1X, 60, 1.2);

    // Cloud 2
    const cloud2X = 400 - (score % 1000) * 0.5;
    drawCloud(cloud2X, 100, 1);

    // Cloud 3
    const cloud3X = 600 - (score % 600);
    drawCloud(cloud3X, 80, 0.8);

    // Cloud 4
    const cloud4X = 250 - (score % 700) * 0.7;
    drawCloud(cloud4X, 140, 0.9);
}

function drawCloud(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.arc(20, -5, 25, 0, Math.PI * 2);
    ctx.arc(40, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    // Cloud shadow
    ctx.fillStyle = 'rgba(200, 220, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(20, 15, 30, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Update Score Display
function updateScore() {
    if (gameRunning) {
        score++;
        document.getElementById('score').textContent = Math.floor(score / 10);

        // Increase difficulty over time
        if (score % 500 === 0 && gameSpeed < 12) {
            gameSpeed += 0.5;
        }
    }
}

// Game Over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);

    // Create explosion particles
    createParticles(player.x + player.width / 2, player.y + player.height / 2,
                   '#ff5252', 30);
    createParticles(player.x + player.width / 2, player.y + player.height / 2,
                   '#ffa726', 20);

    const finalScore = Math.floor(score / 10);
    document.getElementById('finalScore').textContent = finalScore;

    // Update high score
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('highScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }

    setTimeout(() => {
        document.getElementById('gameOver').classList.remove('hidden');
    }, 300);
}

// Game Loop
function gameLoop() {
    // Clear canvas
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

    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();

        // Check collision
        if (gameRunning && checkCollision(player, obstacles[i])) {
            gameOver();
            // Don't return immediately, let particles render
        }

        // Remove off-screen obstacles
        if (obstacles[i].isOffScreen()) {
            obstacles.splice(i, 1);
        }
    }

    // Draw player
    if (gameRunning) {
        player.draw();
        player.update();
        updateScore();

        // Spawn obstacles
        obstacleTimer++;
        if (obstacleTimer > obstacleInterval) {
            obstacles.push(new Obstacle());
            obstacleTimer = 0;
        }
    }

    // Continue loop (keep rendering particles even after game over)
    if (gameRunning || particles.length > 0) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Start Game
function startGame() {
    gameRunning = true;
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    particles = [];
    obstacleTimer = 0;
    player.reset();
    document.getElementById('score').textContent = '0';
    document.getElementById('gameOver').classList.add('hidden');
    gameLoop();
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameRunning) {
            player.jump();
        } else {
            startGame();
        }
    }
});

canvas.addEventListener('click', () => {
    if (gameRunning) {
        player.jump();
    } else {
        startGame();
    }
});

document.getElementById('restartBtn').addEventListener('click', startGame);

// Initial draw
drawBackground();
drawGround();
player.draw();
