# Jersey Smash - Mobile Performance Optimization

This file outlines optimizations to ensure the game runs smoothly on mobile devices.

## Device Performance Detection

```javascript
// Add to setup()
function setup() {
  // ... existing setup code ...

  // Detect device performance level
  detectDevicePerformance();
}

function detectDevicePerformance() {
  // Simple performance detection based on device capabilities
  let isMobileDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  let isLowEndDevice = false;

  // Check for low-end devices
  if (isMobileDevice) {
    // Check for indicators of low-end device
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      isLowEndDevice = true;
    }
  }

  // Apply performance settings based on device
  applyPerformanceSettings(isLowEndDevice);
}
```

## Performance Settings

```javascript
function applyPerformanceSettings(isLowEndDevice) {
  if (isLowEndDevice) {
    // Low-end device settings

    // Reduce physics simulation precision
    engine.timing.timeScale = 1; // Use default timing (can be more efficient)

    // Reduce particle counts for effects
    particleMultiplier = 0.5; // Half as many particles

    // Disable some visual effects
    enableBackgroundEffects = false;

    // Reduce explosion particle count
    explosionParticleCount = 25; // Reduced from 50
  } else {
    // Normal device settings
    engine.timing.timeScale = 0.8;
    particleMultiplier = 1.0;
    enableBackgroundEffects = true;
    explosionParticleCount = 50;
  }
}
```

## Modified Explosion Class with Performance Settings

```javascript
class Explosion {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.particles = [];

    // Use performance-based particle count
    let particleCount = Math.floor(explosionParticleCount * particleMultiplier);

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new ExplosionParticle(this.pos.x, this.pos.y));
    }
  }

  // ... rest of class methods ...
}
```

## Texture Downscaling for Lower-End Devices

```javascript
function preload() {
  // Detect if running on low-performance mobile
  let isMobileDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  let isLowEndDevice = false;

  if (
    isMobileDevice &&
    navigator.hardwareConcurrency &&
    navigator.hardwareConcurrency < 4
  ) {
    isLowEndDevice = true;
  }

  // Define image suffix based on device performance
  let imageSuffix = isLowEndDevice ? "_small" : "";

  // Load appropriate sized assets
  titleImage = loadImage("title" + imageSuffix + ".png");
  ballImg = loadImage("ball" + imageSuffix + ".png");
  blackJerseyImg = loadImage("black_jersey" + imageSuffix + ".png");
  blueJerseyImg = loadImage("blue_jersey" + imageSuffix + ".png");
  redJerseyImg = loadImage("red_jersey" + imageSuffix + ".png");
  stadiumImg = loadImage("stadium" + imageSuffix + ".png");
  trophyImg = loadImage("trophy_cup" + imageSuffix + ".png");

  // Load sounds (same for all devices)
  crowdSound = loadSound("crowd_cheering.mp3");
  victorySound = loadSound("victory_sound.mp3");
}
```

## Frame Rate Management

```javascript
// Add to setup()
function setup() {
  // ... existing setup code ...

  // Set initial frame rate (will be adjusted based on performance)
  frameRate(60);

  // Start frame rate monitoring
  lastFrameTime = millis();
  frameTimeHistory = [];
}

// Variables for frame rate monitoring
let lastFrameTime;
let frameTimeHistory = [];
let framesPerSecond = 60;
let frameRateAdjusted = false;

function monitorFrameRate() {
  // Calculate time since last frame
  let currentTime = millis();
  let deltaTime = currentTime - lastFrameTime;
  lastFrameTime = currentTime;

  // Keep track of recent frame times
  frameTimeHistory.push(deltaTime);
  if (frameTimeHistory.length > 30) {
    frameTimeHistory.shift();
  }

  // Calculate average frame time
  let averageFrameTime = 0;
  for (let time of frameTimeHistory) {
    averageFrameTime += time;
  }
  averageFrameTime /= frameTimeHistory.length;

  // Calculate current FPS
  framesPerSecond = 1000 / averageFrameTime;

  // Adjust settings if frame rate drops
  if (frameTimeHistory.length >= 30 && !frameRateAdjusted) {
    if (framesPerSecond < 40) {
      // Frame rate is too low, reduce graphical features
      applyPerformanceSettings(true);
      frameRate(30); // Target lower frame rate to reduce CPU/GPU load
      frameRateAdjusted = true;
    }
  }
}
```

## Efficient Object Pooling

```javascript
// Object pool for particles to reduce garbage collection
class ParticlePool {
  constructor(maxSize) {
    this.pool = [];
    this.maxSize = maxSize;
  }

  get() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    } else {
      return null; // No available particles in pool
    }
  }

  release(particle) {
    if (this.pool.length < this.maxSize) {
      // Reset particle properties
      particle.reset();
      // Add back to pool
      this.pool.push(particle);
    }
  }
}

// Initialize the pool in setup()
function setup() {
  // ... existing setup code ...

  // Create particle pool
  explosionParticlePool = new ParticlePool(200);
}
```

## Modified Explosion Manager with Pooling

```javascript
class ExplosionManager {
  constructor() {
    this.explosions = [];
  }

  createExplosion(x, y) {
    let explosion = new Explosion(x, y);
    this.explosions.push(explosion);
  }

  updateAndDisplay() {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      this.explosions[i].update();
      this.explosions[i].display();

      // Check if explosion is done
      if (this.explosions[i].isDead()) {
        // Return particles to pool
        for (let particle of this.explosions[i].particles) {
          if (particle) {
            explosionParticlePool.release(particle);
          }
        }

        // Remove explosion
        this.explosions.splice(i, 1);
      }
    }
  }
}
```

## Off-Screen Detection for Physics Bodies

```javascript
function checkOffScreenObjects() {
  // Check if any physics objects are far off screen
  // and remove them to improve performance

  // Get viewport bounds with margin
  const margin = 300;
  const minX = -margin;
  const maxX = width + margin;
  const minY = -margin;
  const maxY = height + margin;

  // Check ball
  if (
    ballReleased &&
    (ball.position.x < minX ||
      ball.position.x > maxX ||
      ball.position.y < minY ||
      ball.position.y > maxY)
  ) {
    resetBall();
  }

  // Check jerseys
  for (let i = jerseys.length - 1; i >= 0; i--) {
    if (
      jerseys[i].body.position.x < minX - 100 ||
      jerseys[i].body.position.x > maxX + 100 ||
      jerseys[i].body.position.y > maxY + 100
    ) {
      // Jersey has fallen off screen
      World.remove(engine.world, jerseys[i].body);
      jerseys.splice(i, 1);

      // If all jerseys are gone, check if it's due to falling off screen
      if (jerseys.length === 0) {
        createTrophyHighlight();
      }
    }
  }
}
```

## Update Main Loop with Performance Monitoring

```javascript
function draw() {
  // Check orientation first
  if (isMobileDevice && !checkOrientation()) {
    return; // Exit early if in wrong orientation
  }

  // Monitor performance
  monitorFrameRate();

  // Regular game state handling
  if (gameState === "title") {
    drawTitleScreen();
  } else if (gameState === "gameplay") {
    drawGameplay();

    // Check for objects that have gone off screen
    checkOffScreenObjects();

    // Add mobile-specific UI elements
    drawTouchIndicator();
    drawFullscreenButton();
  } else if (gameState === "victory") {
    drawVictoryScreen();
    drawFullscreenButton();
  }
}
```
