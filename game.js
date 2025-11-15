// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameRunning = false;
let gameSpeed = 5;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let animationId;

// Update high score display
document.getElementById('highScore').textContent = highScore;

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

    draw() {
        // Body
        ctx.fillStyle = '#667eea';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 8, this.y + 10, 8, 8);
        ctx.fillRect(this.x + 24, this.y + 10, 8, 8);

        // Pupils
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 11, this.y + 13, 4, 4);
        ctx.fillRect(this.x + 27, this.y + 13, 4, 4);

        // Mouth
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 12, this.y + 28, 16, 3);
    },

    update() {
        // Apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Ground collision
        const groundLevel = canvas.height - this.height - 60;
        if (this.y >= groundLevel) {
            this.y = groundLevel;
            this.velocityY = 0;
            this.isJumping = false;
        }
    },

    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpPower;
            this.isJumping = true;
        }
    },

    reset() {
        this.y = 300;
        this.velocityY = 0;
        this.isJumping = false;
    }
};

// Obstacles Array
let obstacles = [];
let obstacleTimer = 0;
const obstacleInterval = 120; // Frames between obstacles

class Obstacle {
    constructor() {
        this.width = 30;
        this.height = Math.random() * 40 + 40; // Random height between 40-80
        this.x = canvas.width;
        this.y = canvas.height - this.height - 60;
        this.color = '#764ba2';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Add some detail
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
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
    ctx.fillStyle = '#8bc34a';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

    // Ground detail
    ctx.fillStyle = '#7cb342';
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i, canvas.height - 60, 30, 5);
    }
}

// Draw Background
function drawBackground() {
    // Sky
    ctx.fillStyle = '#e0f7ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 60);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(100 - (score % 800), 60, 30, 0, Math.PI * 2);
    ctx.arc(120 - (score % 800), 50, 40, 0, Math.PI * 2);
    ctx.arc(140 - (score % 800), 60, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(400 - (score % 1000) * 0.5, 100, 25, 0, Math.PI * 2);
    ctx.arc(420 - (score % 1000) * 0.5, 95, 35, 0, Math.PI * 2);
    ctx.arc(440 - (score % 1000) * 0.5, 100, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(600 - (score % 600), 80, 20, 0, Math.PI * 2);
    ctx.arc(615 - (score % 600), 75, 30, 0, Math.PI * 2);
    ctx.arc(630 - (score % 600), 80, 20, 0, Math.PI * 2);
    ctx.fill();
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

    const finalScore = Math.floor(score / 10);
    document.getElementById('finalScore').textContent = finalScore;

    // Update high score
    if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('highScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }

    document.getElementById('gameOver').classList.remove('hidden');
}

// Game Loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw
    drawBackground();
    drawGround();
    player.draw();

    // Update player
    player.update();

    // Update score
    updateScore();

    // Spawn obstacles
    obstacleTimer++;
    if (obstacleTimer > obstacleInterval) {
        obstacles.push(new Obstacle());
        obstacleTimer = 0;
    }

    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();

        // Check collision
        if (checkCollision(player, obstacles[i])) {
            gameOver();
            return;
        }

        // Remove off-screen obstacles
        if (obstacles[i].isOffScreen()) {
            obstacles.splice(i, 1);
        }
    }

    // Continue loop
    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Start Game
function startGame() {
    gameRunning = true;
    score = 0;
    gameSpeed = 5;
    obstacles = [];
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
