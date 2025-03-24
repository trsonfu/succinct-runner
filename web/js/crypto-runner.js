// Game variables
let score = 0;
let initialGameSpeed = 5;
let gameSpeed = initialGameSpeed;
let isJumping = false;
let jumpForce = 15;
let gravity = 0.8;
let playerY = 0;
let playerVelocity = 0;
let obstacles = [];
let tokens = [];
let gameLoop = null;  // Initialize as null
let isGameOver = false;
let isPaused = false;
let lastObstacleTime = 0;
let lastTokenTime = 0;
let speedLevel = 0;
let combo = 0;
let maxCombo = 0;
let lastTokenCollectTime = 0;
let comboTimeout;
let lastFrameTime = 0;

// DOM elements
const player = document.querySelector('.player');
const gameContainer = document.querySelector('.game-container');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const helpPopup = document.getElementById('helpPopup');
const continueBtn = document.getElementById('continueBtn');

// Add parallax background
const parallaxBg = document.createElement('div');
parallaxBg.className = 'parallax-bg';
gameContainer.insertBefore(parallaxBg, gameContainer.firstChild);

// Game controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent default space behavior
        if (!isGameOver) { // Only allow jumping if game is not over
            jump();
        }
    } else if (e.code === 'KeyP') {
        togglePause();
    }
});

// Jump function
function jump() {
    if (isJumping || isPaused || isGameOver) return;
    
    isJumping = true;
    playerVelocity = -jumpForce;
}

// Update game state
function update(timestamp) {
    if (isPaused || isGameOver) return;

    // Calculate delta time
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    // Update player position
    playerVelocity += gravity;
    playerY += playerVelocity;
    
    // Ground collision
    if (playerY > 0) {
        playerY = 0;
        playerVelocity = 0;
        isJumping = false;
    }
    
    player.style.transform = `translateY(${playerY}px)`;

    // Check for speed increase every 100 points
    const newSpeedLevel = Math.floor(score / 100);
    if (newSpeedLevel > speedLevel) {
        speedLevel = newSpeedLevel;
        gameSpeed = initialGameSpeed + (initialGameSpeed * 0.05 * speedLevel);
    }

    // Create obstacles and tokens at intervals
    const currentTime = Date.now();
    if (currentTime - lastObstacleTime > 2000) {
        createObstacle();
        lastObstacleTime = currentTime;
    }
    if (currentTime - lastTokenTime > 1500) {
        createToken();
        lastTokenTime = currentTime;
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= gameSpeed;
        obstacle.element.style.left = `${obstacle.x}px`;

        // Check collision with obstacle
        if (checkCollision(player, obstacle.element)) {
            gameOver();
            return;
        }

        // Remove off-screen obstacles
        if (obstacle.x < -30) {
            obstacle.element.remove();
            obstacles.splice(i, 1);
        }
    }

    // Update tokens
    for (let i = tokens.length - 1; i >= 0; i--) {
        const token = tokens[i];
        token.x -= gameSpeed;
        token.element.style.left = `${token.x}px`;

        // Check collection with token
        if (checkCollision(player, token.element)) {
            collectToken(token);
            token.element.remove();
            tokens.splice(i, 1);
        }

        // Remove off-screen tokens
        if (token.x < -25) {
            token.element.remove();
            tokens.splice(i, 1);
        }
    }

    // Continue game loop only if game is not over or paused
    if (!isGameOver && !isPaused) {
        gameLoop = requestAnimationFrame(update);
    }
}

// Create obstacle
function createObstacle() {
    if (isPaused || isGameOver) return;
    
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    
    // Set initial position
    obstacle.style.left = `${gameContainer.offsetWidth}px`;
    obstacle.style.bottom = '0px';
    
    gameContainer.appendChild(obstacle);
    
    obstacles.push({
        element: obstacle,
        x: gameContainer.offsetWidth
    });
}

// Create token
function createToken() {
    if (isPaused || isGameOver) return;
    
    const token = document.createElement('div');
    token.className = 'token';
    
    // Set initial position
    token.style.left = `${gameContainer.offsetWidth}px`;
    token.style.bottom = '50px';
    
    if (Math.random() < 0.2) {
        token.classList.add('rare');
    }
    
    gameContainer.appendChild(token);
    
    tokens.push({
        element: token,
        x: gameContainer.offsetWidth,
        isRare: token.classList.contains('rare')
    });
}

// Start game
function startGame() {
    // Reset all game state variables
    score = 0;
    gameSpeed = initialGameSpeed;
    speedLevel = 0;
    isJumping = false;
    playerY = 0;
    playerVelocity = 0;
    isGameOver = false;
    isPaused = false;
    lastObstacleTime = Date.now();
    lastTokenTime = Date.now();
    combo = 0;
    maxCombo = 0;
    lastFrameTime = performance.now();
    
    // Reset display
    scoreElement.textContent = '0';
    gameOverScreen.style.display = 'none';
    player.style.transform = 'translateY(0)';
    
    // Clear all existing obstacles and tokens
    obstacles.forEach(obs => obs.element.remove());
    tokens.forEach(token => token.element.remove());
    obstacles = [];
    tokens = [];
    
    // Stop any existing game loop
    if (gameLoop !== null) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    
    // Start new game loop
    lastFrameTime = performance.now();
    gameLoop = requestAnimationFrame(update);
}

// Toggle pause
function togglePause() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    if (isPaused) {
        cancelAnimationFrame(gameLoop);
    } else {
        gameLoop = requestAnimationFrame(update);
    }
}

// Check collision between two elements with improved collision detection
function checkCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    // Add a small buffer zone for more forgiving collision detection
    const buffer = 5;
    
    // Check if elements are colliding
    const isColliding = !(rect1.right - buffer < rect2.left || 
                         rect1.left + buffer > rect2.right || 
                         rect1.bottom - buffer < rect2.top || 
                         rect1.top + buffer > rect2.bottom);

    return isColliding;
}

// Create particles effect
function createParticles(count) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position around the player
        const angle = (Math.PI * 2 * i) / count;
        const velocity = 2 + Math.random() * 2;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particle.style.left = `${player.offsetLeft + player.offsetWidth / 2}px`;
        particle.style.top = `${player.offsetTop + player.offsetHeight / 2}px`;
        particle.style.setProperty('--vx', `${vx}px`);
        particle.style.setProperty('--vy', `${vy}px`);
        
        gameContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Collect token with improved effects
function collectToken(token) {
    const points = token.isRare ? 50 : 10;
    score += points;
    scoreElement.textContent = score;
    
    // Create score popup
    createScorePopup(points, token.element);
    
    // Update combo system
    const currentTime = Date.now();
    if (currentTime - lastTokenCollectTime < 1000) {
        combo++;
        maxCombo = Math.max(maxCombo, combo);
    } else {
        combo = 1;
    }
    lastTokenCollectTime = currentTime;
    
    // Clear previous combo timeout
    clearTimeout(comboTimeout);
    
    // Set new combo timeout
    comboTimeout = setTimeout(() => {
        combo = 0;
    }, 1000);
    
    // Create collection particles
    createParticles(token.isRare ? 8 : 4);
}

// Create score popup
function createScorePopup(points, element) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${points}`;
    
    const rect = element.getBoundingClientRect();
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top}px`;
    
    gameContainer.appendChild(popup);
    
    // Remove popup after animation
    setTimeout(() => {
        popup.remove();
    }, 1000);
}

// Game over with improved effects
function gameOver() {
    if (isGameOver) return;
    
    isGameOver = true;
    if (gameLoop !== null) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    
    // Create explosion effect
    createParticles(20);
    
    // Show game over screen with delay
    setTimeout(() => {
        gameOverScreen.style.display = 'block';
        finalScoreElement.textContent = `Score: ${score}`;
        if (maxCombo > 1) {
            finalScoreElement.textContent += `\nMax Combo: ${maxCombo}x`;
        }
    }, 500);
}

// Event listeners for buttons
document.getElementById('playAgain').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default button behavior
    if (isGameOver) { // Only allow restart if game is actually over
        gameOverScreen.style.display = 'none';
        startGame();
    }
});
document.getElementById('helpBtn').addEventListener('click', () => {
    helpPopup.style.display = 'block';
});
document.getElementById('continueBtn').addEventListener('click', () => {
    helpPopup.style.display = 'none';
});

// Binary rain effect
function createBinaryRain() {
    const rainContainer = document.createElement('div');
    rainContainer.className = 'binary-rain';
    
    for (let i = 0; i < 50; i++) {
        const span = document.createElement('span');
        span.textContent = Math.random() > 0.5 ? '1' : '0';
        span.style.left = `${Math.random() * 100}%`;
        span.style.animationDelay = `${Math.random() * 3}s`;
        rainContainer.appendChild(span);
    }
    
    return rainContainer;
}

// Proof popup functionality
function showProofPopup(proofData, isGenerating = false) {
    const popup = document.getElementById('proofPopup');
    const content = popup.querySelector('.popup-content');
    const title = popup.querySelector('h2');
    
    // Add binary rain effect
    const existingRain = popup.querySelector('.binary-rain');
    if (existingRain) {
        existingRain.remove();
    }
    popup.appendChild(createBinaryRain());
    
    // Update title based on state
    if (isGenerating) {
        title.textContent = ''; // Empty text when generating
        title.className = 'generating';
    } else {
        title.textContent = '?? Proof Generated Successfully!';
        title.className = 'success';
    }
    
    // Update content with binary-style values
    document.getElementById('proof-score').textContent = proofData.score;
    document.getElementById('proof-score').className = 'proof-value';
    
    document.getElementById('proof-id').textContent = proofData.proof_id;
    document.getElementById('proof-id').className = 'proof-value';
    
    document.getElementById('proof-cycles').textContent = proofData.cycles;
    document.getElementById('proof-cycles').className = 'proof-value';
    
    document.getElementById('proof-timestamp').textContent = new Date(proofData.timestamp).toLocaleString();
    document.getElementById('proof-timestamp').className = 'proof-value';
    
    // Show popup with animation
    popup.style.display = 'block';
    content.style.animation = 'none';
    content.offsetHeight; // Trigger reflow
    content.style.animation = 'popupAppear 0.5s ease-out';
}

// Add close button event listener
document.getElementById('close-proof-popup').addEventListener('click', function() {
    const popup = document.getElementById('proofPopup');
    const content = popup.querySelector('.popup-content');
    
    // Add fade out animation
    content.style.animation = 'popupDisappear 0.3s ease-out';
    
    // Hide popup after animation
    setTimeout(() => {
        popup.style.display = 'none';
        content.style.animation = 'popupAppear 0.5s ease-out';
    }, 300);
});

// Update the proof generation function
document.getElementById('proofBtn').addEventListener('click', async function() {
    const proofBtn = document.getElementById('proofBtn');
    proofBtn.disabled = true;

    try {
        if (score <= 0) {
            alert('Cannot generate proof for score 0 or negative. Please play the game first!');
            proofBtn.disabled = false;
            return;
        }

        // Show popup with generating state and binary code animation
        showProofPopup({
            score: 'Generating...',
            proof_id: 'Generating...',
            cycles: 'Generating...',
            timestamp: new Date().toISOString()
        }, true);

        console.log('Requesting proof generation for score:', score);

        const response = await fetch('https://succinct-runner.tempestcrypto.net/api/generate-proof', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: score })
        });

        if (!response.ok) {
            throw new Error('An error occurred while generating the proof.');
        }

        const data = await response.json();
        console.log('Generated Proof:', data);
        
        // Update popup with success state and actual data
        showProofPopup(data, false);
    } catch (err) {
        console.error('Proof generation error:', err);
        alert('Failed to generate proof.');
        document.getElementById('proofPopup').style.display = 'none';
    } finally {
        proofBtn.disabled = false;
    }
});

// Start game when page loads
window.onload = startGame;

// Update time display
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('time-display').textContent = timeString;
}

// Update time every second
setInterval(updateTime, 1000);
updateTime(); // Initial update 