// Matter.js modules
let Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Events = Matter.Events;

// Physics engine variables
let engine;

// Physics settings
let maxStretch = 100; // Maximum stretch distance for slingshot
let strength = 0.00161; // Strength of the slingshot force
let simulationSpeed = 0.8; // Simulation speed (1 is normal)
let interactRadius = 50; // Radius within which mouse interaction is allowed

// Game state variables
let gameState = "title"; // title, gameplay, victory
let titleTimer = 0; // Timer for title screen
let gameStarted = false; // Flag for game start
let trophyHighlight = false; // Flag for trophy highlight
let titleTextSize = 0; // For animated title text size
let titleTextAngle = 0; // For animated title text rotation
let subTextOpacity = 0; // For animated sub-text fade-in

// Super power variables
let superPowerCharge = 0; // Current charge level
let superPowerThreshold = 10; // Threshold for super power activation (changed from 15 to 10)
let superPowerActive = false; // Flag for active super power
let damageCounter = 0; // Counter for health steals

// Game objects
let ball; // Ball physics body
let ground; // Ground physics body
let slingshot; // Slingshot object
let jerseys = []; // Array of jersey objects
let trophy; // Trophy object
let explosionManager; // Explosion effect manager
let flameTrail; // Flame trail effect for ball

// Ball states
let ballReleased = false; // Flag for ball release
let ballHasCollided = false; // Flag for ball collision
let ballBeingDragged = false; // Flag for ball dragging

// UI elements
let playButton; // Play button on title screen
let restartButton; // Restart button on victory screen

// Assets
let titleImage; // Title screen image
let stadiumImg; // Background image
let ballImg; // Ball image
let redJerseyImg; // Red jersey image
let blueJerseyImg; // Blue jersey image
let blackJerseyImg; // Black jersey image
let trophyImg; // Trophy image
let crowdSound; // Crowd ambient sound
let victorySound; // Victory sound

// Mobile detection
let isMobileDevice;

// Performance variables
let particleMultiplier = 1.0;
let enableBackgroundEffects = true;
let explosionParticleCount = 50;

// Frame rate monitoring
let lastFrameTime;
let frameTimeHistory = [];
let framesPerSecond = 60;
let frameRateAdjusted = false;

// Class: Slingshot
class SlingShot {
  constructor(x, y, body) {
    this.origin = createVector(x, y);
    this.body = body;
  }

  display() {
    if (!ballReleased) {
      stroke(255);
      strokeWeight(4);
      line(this.origin.x, this.origin.y, ball.position.x, ball.position.y);
    }
  }
}

// Class: Jersey with health points based on color
class Jersey {
  constructor(x, y, type) {
    this.type = type;

    // Set health points and image based on jersey type
    switch (type) {
      case "red":
        this.health = 6;
        this.maxHealth = 6;
        this.img = redJerseyImg;
        break;
      case "blue":
        this.health = 4;
        this.maxHealth = 4;
        this.img = blueJerseyImg;
        break;
      case "black":
        this.health = 2;
        this.maxHealth = 2;
        this.img = blackJerseyImg;
        break;
    }

    // Create physics body
    this.width = 70;
    this.height = 100;
    this.body = Bodies.rectangle(x, y, this.width, this.height, {
      density: 0.005, // Lower density for lighter jerseys
      friction: 0.8, // High friction to prevent sliding
      frictionAir: 0.01, // Small air friction
      restitution: 0.2, // Small bounce factor
      chamfer: { radius: 5 }, // Rounded corners for smoother stacking
    });
    this.body.isJersey = true; // Flag for collision detection
    this.body.jerseyRef = this; // Reference to this object for collision handling

    // Add to physics world
    World.add(engine.world, this.body);

    // Animation properties for health bar
    this.displayHealth = this.health; // For smooth animation
    this.lastDamageTime = 0;
    this.flashEffect = 0;
  }

  display() {
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);
    imageMode(CENTER);
    image(this.img, 0, 0, this.width, this.height);

    // Animate health bar smoothly
    this.displayHealth = lerp(this.displayHealth, this.health, 0.1);

    // Calculate health percentage based on animated value
    let healthPercent = this.displayHealth / this.maxHealth;
    let barWidth = 60;
    let barHeight = 10;

    // Add a subtle pulse effect when jersey takes damage
    if (millis() - this.lastDamageTime < 500) {
      this.flashEffect = sin(frameCount * 0.8) * 50;
    } else {
      this.flashEffect = lerp(this.flashEffect, 0, 0.1);
    }

    // Draw bar border with shadow
    noFill();
    strokeWeight(3);
    stroke(0, 150);
    rect(-barWidth / 2 + 2, -this.height / 2 - 15 + 2, barWidth, barHeight, 5); // Shadow
    stroke(40);
    rect(-barWidth / 2, -this.height / 2 - 15, barWidth, barHeight, 5); // Border

    // Draw bar background with gradient
    noStroke();
    for (let i = 0; i < barWidth; i++) {
      let alpha = map(i, 0, barWidth, 50, 100);
      fill(50, 50, 50, alpha);
      rect(-barWidth / 2 + i, -this.height / 2 - 15, 1, barHeight, 5);
    }

    // Get health bar color based on health percentage
    let barColor;
    if (healthPercent > 0.66) {
      // Green for high health
      barColor = color(0, 255, 60);
    } else if (healthPercent > 0.33) {
      // Orange for medium health
      barColor = color(255, 165, 0);
    } else {
      // Red for low health
      barColor = color(255, 30, 30);
    }

    // Add flash effect to the bar color when damaged
    let r = red(barColor) + this.flashEffect;
    let g = green(barColor);
    let b = blue(barColor);

    // Draw health bar with gradient
    let fillWidth = barWidth * healthPercent;
    for (let i = 0; i < fillWidth; i++) {
      let brightness = map(i, 0, fillWidth, 0.7, 1.2);
      fill(r * brightness, g * brightness, b * brightness);
      rect(-barWidth / 2 + i, -this.height / 2 - 15, 1, barHeight, 5);
    }

    // Add shine effect on top of the bar
    if (fillWidth > 0) {
      strokeWeight(1);
      stroke(255, 100);
      line(
        -barWidth / 2,
        -this.height / 2 - 15 + 2,
        -barWidth / 2 + fillWidth,
        -this.height / 2 - 15 + 2
      );
    }

    // Add pulsing glow for low health
    if (healthPercent < 0.33 && healthPercent > 0) {
      let pulseSize = 2 + sin(frameCount * 0.1) * 2;
      noFill();
      for (let i = 0; i < 3; i++) {
        let alpha = map(i, 0, 3, 150, 0);
        stroke(255, 0, 0, alpha);
        strokeWeight(i * pulseSize * 0.5);
        rect(-barWidth / 2, -this.height / 2 - 15, fillWidth, barHeight, 5);
      }
    }

    pop();
  }

  damage(amount) {
    this.health -= amount;
    this.lastDamageTime = millis(); // Record time of damage for animation
    if (this.health <= 0) {
      return true; // Jersey is destroyed
    }
    return false;
  }

  destroy() {
    // Create explosion at jersey position with jersey type
    explosionManager.createExplosion(
      this.body.position.x,
      this.body.position.y,
      this.type
    );

    // Remove from physics world
    World.remove(engine.world, this.body);

    // Play destruction sound
    playJerseyDestructionSound();
  }
}

// Class: Trophy
class Trophy {
  constructor(x, y) {
    // Trophy properties
    this.width = 60;
    this.height = 80;

    // Create physics body
    this.body = Bodies.rectangle(x, y, this.width, this.height, {
      isStatic: false, // Trophy can be moved
      friction: 0.5,
      restitution: 0.2,
    });
    this.body.isTrophy = true; // Flag for collision detection

    // Add to physics world
    World.add(engine.world, this.body);

    // Movement variables
    this.direction = 1; // 1 for right, -1 for left
    this.moveSpeed = 1;
    this.moveTime = 0;
    this.timeToChangeDirection = 180; // Change direction every 3 seconds

    // Animation properties
    this.glowIntensity = 0;
  }

  update() {
    // Only move trophy if all jerseys are destroyed
    if (jerseys.length === 0) {
      // Update move timer
      this.moveTime++;

      // Change direction after timeToChangeDirection frames
      if (this.moveTime > this.timeToChangeDirection) {
        this.direction *= -1;
        this.moveTime = 0;
      }

      // Move trophy
      let newX = this.body.position.x + this.direction * this.moveSpeed;

      // Keep trophy within bounds
      if (newX < width - 250) newX = width - 250;
      if (newX > width - 150) newX = width - 150;

      // Set trophy position
      Body.setPosition(this.body, {
        x: newX,
        y: this.body.position.y,
      });

      // Animate glow intensity
      this.glowIntensity = 150 + 100 * sin(frameCount * 0.1);
    }
  }

  display() {
    // Render trophy
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);
    imageMode(CENTER);

    // Add highlight glow when jerseys are gone
    if (trophyHighlight && jerseys.length === 0) {
      // Draw multiple glow layers
      for (let i = 3; i > 0; i--) {
        noFill();
        let alpha = this.glowIntensity / i;
        stroke(255, 215, 0, alpha);
        strokeWeight(i * 3);
        ellipse(0, 0, this.width * 1.5, this.height * 1.5);
      }

      // Pulse the image size slightly
      let scale = 1 + 0.05 * sin(frameCount * 0.1);
      image(trophyImg, 0, 0, this.width * scale, this.height * scale);
    } else {
      // Normal display
      image(trophyImg, 0, 0, this.width, this.height);
    }

    pop();
  }

  reset() {
    // Reset trophy position
    Body.setPosition(this.body, {
      x: width - 200,
      y: 200,
    });

    // Reset movement variables
    this.moveTime = 0;
    this.direction = 1;
    this.glowIntensity = 0;
  }

  hit() {
    // When trophy is hit, trigger victory
    victorySound.play();
    gameState = "victory";
  }
}

// Class: Explosion
class Explosion {
  constructor(x, y, jerseyType = null) {
    this.pos = createVector(x, y);
    this.particles = [];

    // Use performance-based particle count
    let particleCount = Math.floor(explosionParticleCount * particleMultiplier);

    // Use jersey type to determine explosion colors
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(
        new ExplosionParticle(this.pos.x, this.pos.y, jerseyType)
      );
    }
  }

  update() {
    for (let particle of this.particles) {
      particle.update();
    }
  }

  display() {
    for (let particle of this.particles) {
      particle.display();
    }
  }

  isDead() {
    return this.particles.every((particle) => particle.isDead());
  }
}

// Class: Explosion Particle
class ExplosionParticle {
  constructor(x, y, jerseyType = null) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(2, 5));
    this.lifespan = 255;
    this.size = random(5, 15);
    this.decay = random(3, 8);
    this.rotation = random(0, TWO_PI);
    this.rotSpeed = random(-0.2, 0.2);
    this.jerseyType = jerseyType;

    // Set particle color based on jersey type
    if (jerseyType === "red") {
      this.r = random(200, 255);
      this.g = random(20, 50);
      this.b = random(20, 50);
    } else if (jerseyType === "blue") {
      this.r = random(20, 50);
      this.g = random(100, 150);
      this.b = random(200, 255);
    } else if (jerseyType === "black") {
      this.r = random(40, 80);
      this.g = random(40, 80);
      this.b = random(40, 80);
    } else {
      // Default white particles if no jersey type
      this.r = random(200, 255);
      this.g = random(200, 255);
      this.b = random(200, 255);
    }

    // Small chance for sparkle particles (contrasting color)
    if (random() < 0.2) {
      this.r = 255 - this.r;
      this.g = 255 - this.g;
      this.b = 255 - this.b;
      this.sparkle = true;
      this.size = random(2, 5);
    } else {
      this.sparkle = false;
    }
  }

  update() {
    // Apply gravity
    this.vel.y += 0.1;

    // Add some random movement
    this.vel.x += random(-0.1, 0.1);

    // Update position
    this.pos.add(this.vel);

    // Slow down
    this.vel.mult(0.97);

    // Update rotation
    this.rotation += this.rotSpeed;

    // Decrease lifespan
    this.lifespan -= this.decay;
  }

  display() {
    // Only draw if still alive
    if (this.lifespan > 0) {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.rotation);

      // No stroke for regular particles
      noStroke();

      // Calculate alpha based on lifespan
      let alpha = this.lifespan;

      if (this.sparkle) {
        // Sparkle effect with pulsing
        let pulse = sin(frameCount * 0.2) * 50 + 150;
        fill(this.r, this.g, this.b, min(alpha, pulse));

        // Draw star shape for sparkles
        this.drawStar(0, 0, this.size, this.size / 2, 5);
      } else {
        // Regular particles with color
        fill(this.r, this.g, this.b, alpha);

        // Draw different shapes based on jersey type
        if (this.jerseyType === "red") {
          // Fire-like triangular particles
          triangle(
            0,
            -this.size,
            this.size / 2,
            this.size / 2,
            -this.size / 2,
            this.size / 2
          );
        } else if (this.jerseyType === "blue") {
          // Water-like droplet particles
          ellipse(0, 0, this.size, this.size * 1.3);
        } else {
          // Regular circles for others
          ellipse(0, 0, this.size, this.size);
        }

        // Add inner glow
        fill(255, alpha * 0.6);
        let innerSize = this.size * 0.4;
        ellipse(0, 0, innerSize, innerSize);
      }

      pop();
    }
  }

  // Helper function to draw star shape
  drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius1;
      let sy = y + sin(a) * radius1;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius2;
      sy = y + sin(a + halfAngle) * radius2;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }

  isDead() {
    return this.lifespan <= 0;
  }

  reset() {
    // Reset function for object pooling
    this.lifespan = 0;
  }
}

// Modified ExplosionManager to pass jersey type
class ExplosionManager {
  constructor() {
    this.explosions = [];
  }

  createExplosion(x, y, jerseyType = null) {
    let explosion = new Explosion(x, y, jerseyType);
    this.explosions.push(explosion);
  }

  updateAndDisplay() {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      this.explosions[i].update();
      this.explosions[i].display();
      if (this.explosions[i].isDead()) {
        this.explosions.splice(i, 1);
      }
    }
  }
}

// Class: FlameTrail for ball flame effect
class FlameTrail {
  constructor() {
    this.particles = [];
    this.maxParticles = 80;
    this.emitRate = 3; // Particles per frame
  }

  update() {
    // Only emit particles when ball is in flight
    if (ballReleased && !ballBeingDragged) {
      // Create new particles based on emit rate
      for (let i = 0; i < this.emitRate; i++) {
        if (this.particles.length < this.maxParticles) {
          this.particles.push(
            new FlameParticle(ball.position.x, ball.position.y)
          );
        }
      }
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();

      // Remove dead particles
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  display() {
    // Draw all flame particles
    for (let particle of this.particles) {
      particle.display();
    }
  }

  reset() {
    // Clear all particles
    this.particles = [];
  }
}

// Class: FlameParticle for individual flame particles
class FlameParticle {
  constructor(x, y) {
    // Position with slight offset for wider flame
    this.pos = createVector(x + random(-6, 6), y + random(-6, 6));

    // Calculate direction opposite to ball velocity
    let velAngle = 0;
    if (ball.velocity.x !== 0 || ball.velocity.y !== 0) {
      velAngle = atan2(ball.velocity.y, ball.velocity.x) + PI;
    }

    // Add some randomness to velocity direction
    let randomAngle = velAngle + random(-0.5, 0.5);
    let speed = random(1, 4);

    this.vel = createVector(cos(randomAngle) * speed, sin(randomAngle) * speed);

    // Particle properties
    this.size = random(5, 15);
    this.initialSize = this.size;
    this.lifespan = 255;
    this.decayRate = random(5, 15);

    // Color properties (flame colors)
    this.baseHue = random(10, 40); // Red to orange hue
  }

  update() {
    // Move particle
    this.pos.add(this.vel);

    // Add upward drift (flames rise)
    this.vel.y -= 0.05;

    // Slow down
    this.vel.mult(0.95);

    // Decrease size over time
    this.size = map(this.lifespan, 0, 255, 0, this.initialSize);

    // Reduce lifespan
    this.lifespan -= this.decayRate;
  }

  display() {
    // Calculate color based on lifespan
    let flameHue = this.baseHue;
    let flameSaturation = 100;
    let flameBrightness = 100;

    // Fade to yellow at the core, red at the edges
    if (this.lifespan > 200) {
      flameHue = map(this.lifespan, 200, 255, this.baseHue, 50);
      flameBrightness = 100;
    } else if (this.lifespan < 100) {
      flameSaturation = map(this.lifespan, 0, 100, 20, 100);
      flameBrightness = map(this.lifespan, 0, 100, 20, 100);
    }

    // Draw flame particle
    push();
    colorMode(HSB, 100);
    noStroke();

    // Glowing effect with alpha
    let alpha = map(this.lifespan, 0, 255, 0, 100);

    // Outer glow (redder)
    fill(flameHue * 0.8, flameSaturation, flameBrightness * 0.7, alpha * 0.3);
    ellipse(this.pos.x, this.pos.y, this.size * 1.5);

    // Inner flame (brighter)
    fill(flameHue, flameSaturation, flameBrightness, alpha);
    ellipse(this.pos.x, this.pos.y, this.size);

    // Very center (white-yellow)
    fill(flameHue + 20, flameSaturation * 0.5, 100, alpha);
    ellipse(this.pos.x, this.pos.y, this.size * 0.5);

    pop();
  }

  isDead() {
    return this.lifespan <= 0;
  }
}

// Load all game assets
function preload() {
  // Load game images
  titleImage = loadImage("assets/title.jpg");
  ballImg = loadImage("assets/ball.png");
  blackJerseyImg = loadImage("assets/black_jersey.png");
  blueJerseyImg = loadImage("assets/blue_jersey.png");
  redJerseyImg = loadImage("assets/red_jersey.png");
  stadiumImg = loadImage("assets/stadium.jpg");
  trophyImg = loadImage("assets/trophy_cup.png");

  // Load game sounds
  crowdSound = loadSound("assets/crowd_cheering.mp3");
  victorySound = loadSound("assets/victory_sound.mp3");
}

function setup() {
  // Detect if running on mobile device
  isMobileDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Create canvas for landscape mobile orientation
  let canvas;
  if (isMobileDevice) {
    // Set responsive canvas size based on window dimensions
    let canvasWidth = min(windowWidth, 1500);
    let canvasHeight = min(windowHeight, 800);
    canvas = createCanvas(canvasWidth, canvasHeight);
  } else {
    canvas = createCanvas(1500, 800);
  }

  // Initialize physics engine
  engine = Engine.create();
  engine.timing.timeScale = simulationSpeed;

  // Create ground
  ground = Bodies.rectangle(width / 2, height - 50, width, 20, {
    isStatic: true,
  });
  World.add(engine.world, ground);

  // Create ball (initially static)
  ball = Bodies.circle(150, height - 200, 20, {
    isStatic: true,
  });
  World.add(engine.world, ball);

  // Initialize slingshot
  slingshot = new SlingShot(150, height - 200, ball);

  // Initialize flame trail
  flameTrail = new FlameTrail();

  // Set up collision event listener
  Events.on(engine, "collisionStart", handleCollision);

  // Initialize explosion manager
  explosionManager = new ExplosionManager();

  // Initialize trophy
  trophy = new Trophy(width - 200, 200);

  // Create initial set of jerseys
  createRandomJerseys(5);

  // Set initial game state
  gameState = "title";
  titleTimer = 0;

  // Start frame rate monitoring
  lastFrameTime = millis();
  frameTimeHistory = [];

  // Detect device performance level
  detectDevicePerformance();

  // Disable default touch behaviors to prevent scrolling
  if (isMobileDevice) {
    canvas.touchStarted(touchStartHandler);
    canvas.touchMoved(touchMovedHandler);
    canvas.touchEnded(touchEndedHandler);

    // Prevent default touch behaviors
    document.addEventListener(
      "touchstart",
      function (e) {
        if (e.target == canvas.elt) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    document.addEventListener(
      "touchmove",
      function (e) {
        if (e.target == canvas.elt) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    document.addEventListener(
      "touchend",
      function (e) {
        if (e.target == canvas.elt) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  // Don't start audio automatically - will be started on user interaction
}

// Main game loop
function draw() {
  // Check orientation on mobile devices
  if (isMobileDevice && !checkOrientation()) {
    return; // Exit early if in wrong orientation
  }

  // Monitor performance
  monitorFrameRate();

  // Handle different game states
  if (gameState === "title") {
    drawTitleScreen();
  } else if (gameState === "gameplay") {
    drawGameplay();

    // Check for objects that have gone off screen
    checkOffScreenObjects();

    // Add mobile-specific UI elements
    if (isMobileDevice) {
      drawTouchIndicator();
      drawFullscreenButton();
    }
  } else if (gameState === "victory") {
    drawVictoryScreen();
    if (isMobileDevice) {
      drawFullscreenButton();
    }
  }
}

// Title screen display
function drawTitleScreen() {
  // Display the title image across the entire canvas
  image(titleImage, 0, 0, width, height);

  // Increment the timer
  titleTimer++;

  // After 2 seconds (120 frames at 60fps), start animated title text
  if (titleTimer > 120) {
    // Animate the title text size (grow and then stabilize)
    if (titleTextSize < 70) {
      titleTextSize += 2;
    }

    // Animate the title text angle (wobble and then stabilize)
    titleTextAngle = sin(frameCount * 0.05) * max(0, 10 - titleTimer / 30);

    // Draw the animated "JERSEY SMASHER" title
    push();
    textAlign(CENTER, CENTER);
    textSize(titleTextSize);
    textStyle(BOLD);

    // Shadow for depth
    fill(0, 150);
    text("JERSEY SMASHER", width / 2 + 5, height * 0.3 + 5);

    // Main text with rotation
    translate(width / 2, height * 0.3);
    rotate(radians(titleTextAngle));

    // Gradient text effect
    for (let i = 0; i < titleTextSize / 2; i++) {
      let alpha = map(i, 0, titleTextSize / 2, 255, 100);
      let r = map(i, 0, titleTextSize / 2, 255, 200);
      let g = map(i, 0, titleTextSize / 2, 100, 50);
      let b = map(i, 0, titleTextSize / 2, 50, 0);
      fill(r, g, b, alpha);
      text("JERSEY SMASHER", 0, i / 2 - titleTextSize / 4);
    }

    // Add glow effect
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = "rgba(255, 100, 0, 0.8)";
    fill(255, 200, 0);
    text("JERSEY SMASHER", 0, -titleTextSize / 4);
    pop();

    // After title appears, fade in explanatory sub-text
    if (titleTimer > 180) {
      // Increase opacity until fully visible
      if (subTextOpacity < 255) {
        subTextOpacity += 5;
      }

      // Draw explanatory sub-text
      push();
      textAlign(CENTER, CENTER);
      textSize(18);
      fill(255, 255, 255, subTextOpacity);

      // Add subtle pulsing effect to sub-text
      let pulse = sin(frameCount * 0.1) * 10;

      // Draw sub-text with shadow for better readability
      drawingContext.shadowBlur = 5;
      drawingContext.shadowColor = "rgba(0, 0, 0, 0.5)";
      text(
        "Launch the ball to destroy jerseys and claim the trophy!",
        width / 2,
        height * 0.42 + pulse * 0.2
      );
      pop();
    }
  }

  // After 3 seconds (180 frames at 60fps), display the play button
  if (titleTimer > 240) {
    drawPlayButton();
  }
}

// Draw play button
function drawPlayButton() {
  // Define play button dimensions
  playButton = {
    x: width / 2,
    y: height * 0.7,
    width: isMobileDevice ? 300 : 200,
    height: isMobileDevice ? 100 : 80,
  };

  // 3D Button styling with proper alignment
  push();
  rectMode(CENTER);

  // Draw the pulsing glow effect first underneath everything
  noFill();
  for (let i = 0; i < 3; i++) {
    let pulseSize = 6 + sin(frameCount * 0.1) * 4;
    let alpha = map(i, 0, 2, 150, 20);
    stroke(0, 255, 0, alpha);
    strokeWeight(pulseSize - i * 2);
    rect(
      playButton.x,
      playButton.y,
      playButton.width + i * 10,
      playButton.height + i * 10,
      15 + i * 5
    );
  }

  // Drop shadow for depth - exactly under the button
  fill(0, 0, 0, 80);
  noStroke();
  rect(
    playButton.x + 8,
    playButton.y + 8,
    playButton.width,
    playButton.height,
    15
  );

  // Button gradient background (darker at bottom)
  let buttonGradientHeight = playButton.height;
  for (let i = -buttonGradientHeight / 2; i < buttonGradientHeight / 2; i++) {
    // Map position to color components
    let green = map(
      i,
      -buttonGradientHeight / 2,
      buttonGradientHeight / 2,
      180,
      80
    );
    let alpha = map(abs(i), 0, buttonGradientHeight / 2, 255, 200);
    stroke(0, green, 0, alpha);
    strokeWeight(1);
    line(
      playButton.x - playButton.width / 2,
      playButton.y + i,
      playButton.x + playButton.width / 2,
      playButton.y + i
    );
  }

  // Button edge (darker border)
  stroke(0, 80, 0);
  strokeWeight(2);
  noFill();
  rect(playButton.x, playButton.y, playButton.width, playButton.height, 15);

  // Button top highlight (light at top for 3D effect)
  stroke(0, 255, 0, 150);
  strokeWeight(2);
  line(
    playButton.x - playButton.width / 2 + 15,
    playButton.y - playButton.height / 2 + 2,
    playButton.x + playButton.width / 2 - 15,
    playButton.y - playButton.height / 2 + 2
  );

  // Button bottom shadow (darker at bottom for 3D effect)
  stroke(0, 40, 0, 200);
  strokeWeight(2);
  line(
    playButton.x - playButton.width / 2 + 15,
    playButton.y + playButton.height / 2 - 2,
    playButton.x + playButton.width / 2 - 15,
    playButton.y + playButton.height / 2 - 2
  );

  // Check for hover/click
  let isHovered =
    mouseX > playButton.x - playButton.width / 2 &&
    mouseX < playButton.x + playButton.width / 2 &&
    mouseY > playButton.y - playButton.height / 2 &&
    mouseY < playButton.y + playButton.height / 2;

  if (isHovered) {
    // Hover state - more vibrant color with slight press effect
    fill(0, 180, 0);
    rect(
      playButton.x,
      playButton.y + 2, // Slightly lower to simulate pressing
      playButton.width - 20,
      playButton.height - 20,
      10
    );

    // Button text with shadow for depth
    textAlign(CENTER, CENTER);
    textSize(46);
    fill(0, 0, 0, 120);
    noStroke();
    text("PLAY", playButton.x + 3, playButton.y + 5); // Adjusted shadow position

    // Button text
    fill(255, 255, 255, 240);
    textSize(45);
    text("PLAY", playButton.x, playButton.y + 2); // Slightly lower text
  } else {
    // Normal state
    fill(0, 120, 0);
    rect(
      playButton.x,
      playButton.y,
      playButton.width - 20,
      playButton.height - 20,
      10
    );

    // Button text with shadow for depth
    textAlign(CENTER, CENTER);
    textSize(40);
    fill(0, 0, 0, 120);
    noStroke();
    text("PLAY", playButton.x + 3, playButton.y + 3);

    // Button text
    fill(255);
    text("PLAY", playButton.x, playButton.y);
  }

  pop();
}

// Main gameplay function
function drawGameplay() {
  // Clear canvas
  clear();

  // Draw background
  image(stadiumImg, 0, 0, width, height);

  // Update physics engine
  Engine.update(engine);

  // Update and display flame trail
  flameTrail.update();

  // Draw flame trail behind the ball for correct layering
  flameTrail.display();

  // Update and display explosions
  explosionManager.updateAndDisplay();

  // Check ball status
  checkBallStatus();

  // Update and display trophy
  updateTrophy();

  // Display slingshot
  slingshot.display();

  // Render ball
  renderBall();

  // Render all jerseys
  for (let jersey of jerseys) {
    jersey.display();
  }

  // Display UI elements
  displayGameUI();

  // Check victory condition
  checkVictoryCondition();

  // Display message if all jerseys are destroyed
  if (jerseys.length === 0 && gameState === "gameplay") {
    push();
    textAlign(CENTER);
    textSize(30);
    fill(255, 215, 0);
    stroke(0);
    strokeWeight(3);
    text("Hit the Trophy to Win!", width / 2, 100);
    pop();
  }
}

// Update and display trophy
function updateTrophy() {
  trophy.update();
  trophy.display();
}

// Display UI elements during gameplay
function displayGameUI() {
  // Background for text and buttons panel
  push();
  fill(0, 0, 0, 150);
  noStroke();
  rectMode(CORNER);
  rect(10, 10, 140, 180, 10); // Increased height to accommodate power bar

  // Jersey count text
  textAlign(LEFT, CENTER);
  textSize(24);
  fill(255);
  stroke(0);
  strokeWeight(2);
  text("Jerseys: " + jerseys.length, 20, 30);

  // Reset Ball button
  fill(220, 50, 50, 200);
  stroke(255);
  strokeWeight(2);
  rect(20, 50, 120, 30, 5);

  // Reset Ball text
  textAlign(CENTER, CENTER);
  textSize(16);
  fill(255);
  noStroke();
  text("RESET BALL", 80, 65);

  // Reset Game button
  fill(50, 100, 220, 200);
  stroke(255);
  strokeWeight(2);
  rect(20, 90, 120, 30, 5);

  // Reset Game text
  textAlign(CENTER, CENTER);
  textSize(16);
  fill(255);
  noStroke();
  text("RESET GAME", 80, 105);

  // Draw power bar background
  fill(50, 50, 50, 200);
  stroke(255);
  strokeWeight(2);
  rect(20, 130, 120, 20, 5);

  // Calculate power bar fill
  let fillWidth = map(superPowerCharge, 0, superPowerThreshold, 0, 120);

  // Draw power bar fill with color based on charge
  if (superPowerActive) {
    // Animated gold bar for active power
    let pulseIntensity = sin(frameCount * 0.2) * 30;
    fill(255, 215, 0 + pulseIntensity);
    rect(20, 130, 120, 20, 5);
  } else if (superPowerCharge >= superPowerThreshold) {
    // Animated bar for full charge
    let pulseIntensity = sin(frameCount * 0.2) * 30;
    fill(0, 255, 0 + pulseIntensity);
    rect(20, 130, fillWidth, 20, 5);
  } else {
    // Gradient from red to yellow to green based on charge
    let barColor;
    if (fillWidth < 40) {
      barColor = color(255, 50, 50); // Red for low charge
    } else if (fillWidth < 80) {
      barColor = color(255, 255, 50); // Yellow for medium charge
    } else {
      barColor = color(50, 255, 50); // Green for high charge
    }
    fill(barColor);
    rect(20, 130, fillWidth, 20, 5);
  }

  // Power bar label
  textAlign(CENTER, CENTER);
  textSize(12);
  fill(255);
  noStroke();
  text("SUPER POWER", 80, 140);

  // Add power button if charged
  if (
    superPowerCharge >= superPowerThreshold &&
    !superPowerActive &&
    !ballReleased
  ) {
    fill(255, 215, 0, 200 + sin(frameCount * 0.2) * 55);
    stroke(255);
    strokeWeight(2);
    rect(20, 160, 120, 30, 5);

    fill(0);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("ACTIVATE 10X", 80, 175);
  }

  pop();

  // Display ball power indicator if active
  if (superPowerActive && !ballReleased) {
    push();
    let radius = 40 + sin(frameCount * 0.2) * 5; // Pulsing effect
    noFill();
    for (let i = 0; i < 5; i++) {
      // Increased from 3 to 5 layers for more dramatic effect
      stroke(255, 215, 0, 150 - i * 30);
      strokeWeight(4 - i * 0.5);
      ellipse(ball.position.x, ball.position.y, radius + i * 15);
    }
    pop();
  }

  // Display instructions when ball is static
  if (!ballReleased) {
    push();
    textAlign(CENTER);
    textSize(20);
    fill(255);
    stroke(0);
    strokeWeight(1);
    text("Drag ball to shoot", slingshot.origin.x, slingshot.origin.y + 50);
    pop();
  }
}

// Mouse pressed event handler
function mousePressed() {
  if (gameState === "title") {
    checkPlayButtonClick();
  } else if (gameState === "victory") {
    checkRestartButtonClick();
  } else if (gameState === "gameplay") {
    // Check all gameplay buttons
    checkResetBallButtonClick();
    checkResetGameButtonClick();
    checkSuperPowerButtonClick();

    // Check for fullscreen button press
    if (isMobileDevice) {
      checkFullscreenButtonPress();
    }
  }
}

// Check if play button is clicked
function checkPlayButtonClick() {
  if (
    mouseX > playButton.x - playButton.width / 2 &&
    mouseX < playButton.x + playButton.width / 2 &&
    mouseY > playButton.y - playButton.height / 2 &&
    mouseY < playButton.y + playButton.height / 2
  ) {
    // First handle audio context - must be done before any sound playback
    userStartAudio().then(() => {
      // Change game state to gameplay
      gameState = "gameplay";
      gameStarted = true;

      // Reset the game objects
      resetGame();

      // Play crowd sound after audio context is confirmed running
      playBackgroundMusic();
    });
  }
}

// Check if restart button is clicked
function checkRestartButtonClick() {
  if (
    mouseX > restartButton.x - restartButton.width / 2 &&
    mouseX < restartButton.x + restartButton.width / 2 &&
    mouseY > restartButton.y - restartButton.height / 2 &&
    mouseY < restartButton.y + restartButton.height / 2
  ) {
    // Reset game
    resetGame();
    gameState = "gameplay";
  }
}

// Check if reset ball button is clicked
function checkResetBallButtonClick() {
  if (mouseX > 20 && mouseX < 140 && mouseY > 50 && mouseY < 80) {
    resetBall();
  }
}

// Check if reset game button is clicked
function checkResetGameButtonClick() {
  if (mouseX > 20 && mouseX < 140 && mouseY > 90 && mouseY < 120) {
    resetGame();
  }
}

// Check if super power button is clicked
function checkSuperPowerButtonClick() {
  if (
    mouseX > 20 &&
    mouseX < 140 &&
    mouseY > 160 &&
    mouseY < 190 &&
    superPowerCharge >= superPowerThreshold &&
    !superPowerActive &&
    !ballReleased
  ) {
    activateSuperPower();
  }
}

// Mouse drag event handler
function mouseDragged() {
  // Only allow dragging if in gameplay state
  if (gameState !== "gameplay") return;

  // Calculate distance between mouse and ball
  let d = dist(mouseX, mouseY, ball.position.x, ball.position.y);

  // If ball not released and mouse is close enough to ball
  if (!ballReleased && d < interactRadius) {
    ballBeingDragged = true;

    // Calculate stretch distance
    let stretchDistance = dist(
      mouseX,
      mouseY,
      slingshot.origin.x,
      slingshot.origin.y
    );

    if (stretchDistance > maxStretch) {
      // Calculate angle between origin and mouse
      let angle = atan2(
        mouseY - slingshot.origin.y,
        mouseX - slingshot.origin.x
      );

      // Calculate ball position at max stretch
      let newPosX = slingshot.origin.x + maxStretch * cos(angle);
      let newPosY = slingshot.origin.y + maxStretch * sin(angle);

      // Set ball position
      Body.setPosition(ball, {
        x: newPosX,
        y: newPosY,
      });
    } else {
      // Set ball position to mouse position
      Body.setPosition(ball, {
        x: mouseX,
        y: mouseY,
      });
    }
  }
}

// Mouse release event handler
function mouseReleased() {
  // Only process if in gameplay state
  if (gameState !== "gameplay") return;

  if (ballBeingDragged) {
    ballBeingDragged = false;
    ballReleased = true;

    // Make ball dynamic
    Body.setStatic(ball, false);

    // Calculate force based on stretch
    let forceX = slingshot.origin.x - ball.position.x;
    let forceY = slingshot.origin.y - ball.position.y;

    // Calculate magnitude of force for flame intensity
    let forceMagnitude = Math.sqrt(forceX * forceX + forceY * forceY);

    // Adjust flame particle parameters based on force
    flameTrail.emitRate = map(forceMagnitude, 0, maxStretch, 1, 4);

    // Apply super power if active (10x force instead of 2x)
    let powerMultiplier = superPowerActive ? 10 : 1;

    // Apply launch force with power multiplier
    Body.applyForce(ball, ball.position, {
      x: forceX * strength * powerMultiplier,
      y: forceY * strength * powerMultiplier,
    });

    // Play launch sound
    playBallLaunchSound();

    // Reset super power after shot
    if (superPowerActive) {
      resetSuperPower();
    }
  }
}

// Key pressed event handler
function keyPressed() {
  // Reset ball with spacebar
  if (key === " " && gameState === "gameplay") {
    resetBall();
  }

  // Reset entire game with R key
  if (key === "r" || key === "R") {
    resetGame();
    gameState = "gameplay";
  }
}

// Touch event handlers for mobile
function touchStartHandler() {
  // Convert touch to mouse position is handled by p5.js

  // Handle touch based on game state
  if (gameState === "title") {
    checkPlayButtonClick();
  } else if (gameState === "victory") {
    checkRestartButtonClick();
  } else if (gameState === "gameplay") {
    // Check all gameplay buttons
    checkResetBallButtonClick();
    checkResetGameButtonClick();
    checkSuperPowerButtonClick();

    // Check for fullscreen button press
    if (isMobileDevice) {
      checkFullscreenButtonPress();
    }
  }

  // Return false to prevent default
  return false;
}

function touchMovedHandler() {
  // Touch move acts like mouse drag
  mouseDragged();

  // Return false to prevent default
  return false;
}

function touchEndedHandler() {
  // Touch end acts like mouse release
  mouseReleased();

  // Return false to prevent default
  return false;
}

// Collision handling
function handleCollision(event) {
  let pairs = event.pairs;

  for (let i = 0; i < pairs.length; i++) {
    let bodyA = pairs[i].bodyA;
    let bodyB = pairs[i].bodyB;

    // Calculate impact magnitude
    let impactMagnitude = Math.hypot(
      bodyA.velocity.x - bodyB.velocity.x,
      bodyA.velocity.y - bodyB.velocity.y
    );

    // Handle jersey collisions
    handleJerseyCollision(bodyA, bodyB, impactMagnitude);

    // Handle trophy collisions
    handleTrophyCollision(bodyA, bodyB, impactMagnitude);

    // Mark ball as collided with anything
    if (bodyA === ball || bodyB === ball) {
      ballHasCollided = true;
    }
  }
}

// Handle jersey collision
function handleJerseyCollision(bodyA, bodyB, impactMagnitude) {
  // Check if one body is the ball and the other is a jersey
  if (
    (bodyA === ball && bodyB.isJersey) ||
    (bodyB === ball && bodyA.isJersey)
  ) {
    // Get jersey reference
    let jerseyBody = bodyA.isJersey ? bodyA : bodyB;
    let jersey = jerseyBody.jerseyRef;

    // Determine damage based on impact
    let damage = impactMagnitude > 10 ? 2 : 1;

    // Apply additional damage if super power is active
    if (superPowerActive) {
      damage *= 10;
    }

    // Apply damage to jersey
    if (jersey.damage(damage)) {
      // Jersey destroyed
      jersey.destroy();

      // Find jersey index
      let jerseyIndex = jerseys.findIndex((j) => j.body === jerseyBody);
      if (jerseyIndex !== -1) {
        jerseys.splice(jerseyIndex, 1);
      }

      // If all jerseys destroyed, highlight trophy
      if (jerseys.length === 0) {
        // Add visual indicator for trophy
        createTrophyHighlight();
      }
    } else {
      // Jersey hit but not destroyed
      playJerseyHitSound();

      // Increment damage counter for power charge
      damageCounter++;

      // Update super power charge
      updateSuperPowerCharge();
    }
  }
}

// Handle trophy collision
function handleTrophyCollision(bodyA, bodyB, impactMagnitude) {
  // Check if one body is the ball and the other is the trophy
  if (
    (bodyA === ball && bodyB.isTrophy) ||
    (bodyB === ball && bodyA.isTrophy)
  ) {
    // Only allow trophy hit if all jerseys are destroyed
    if (jerseys.length === 0) {
      // Trigger trophy hit
      trophy.hit();
    }
  }
}

// Create trophy highlight
function createTrophyHighlight() {
  // Create visual effect to highlight trophy
  trophyHighlight = true;

  // Add a message to direct player to the trophy
  push();
  textAlign(CENTER);
  textSize(30);
  fill(255, 215, 0);
  stroke(0);
  strokeWeight(3);
  text("Hit the Trophy to Win!", width / 2, 100);
  pop();
}

// Check ball status
function checkBallStatus() {
  if (ballReleased) {
    // Check if ball has stopped moving
    if (Math.abs(ball.velocity.x) < 0.01 && Math.abs(ball.velocity.y) < 0.01) {
      resetBall();
    }

    // Check if ball is off-screen
    if (
      ball.position.x > width + 50 ||
      ball.position.x < -50 ||
      ball.position.y > height + 50
    ) {
      resetBall();
    }
  }
}

// Reset ball
function resetBall() {
  // Remove old ball from world
  World.remove(engine.world, ball);

  // Create new ball
  ball = Bodies.circle(150, height - 150, 20, {
    isStatic: true,
  });
  World.add(engine.world, ball);

  // Create new slingshot
  slingshot = new SlingShot(150, height - 150, ball);

  // Reset ball states
  ballReleased = false;
  ballHasCollided = false;
  ballBeingDragged = false;

  // Reset flame trail
  flameTrail.reset();
}

// Create random jerseys
function createRandomJerseys(count) {
  // Clear existing jerseys
  for (let jersey of jerseys) {
    World.remove(engine.world, jersey.body);
  }
  jerseys = [];

  // Jersey types
  const types = ["red", "blue", "black"];

  // Create piles of jerseys
  createJerseyPile(width * 0.4, height - 90, 3, types); // First pile
  createJerseyPile(width * 0.6, height - 90, 4, types); // Second pile
  createJerseyPile(width * 0.75, height - 90, 3, types); // Third pile

  // Add some randomly placed jerseys
  for (let i = 0; i < 3; i++) {
    // Random position (avoiding overlaps)
    let x = random(400, width - 300);
    let y = random(150, height - 300);

    // Random type
    let type = types[floor(random(types.length))];

    // Create new jersey
    jerseys.push(new Jersey(x, y, type));
  }
}

// Create a pile of stacked jerseys
function createJerseyPile(x, baseY, height, types) {
  // Start y position at the base
  let y = baseY;

  // Create stack of jerseys
  for (let i = 0; i < height; i++) {
    // Slight x offset for more natural stack
    let offsetX = random(-10, 10);

    // Stack jerseys on top of each other with slight variations
    // Calculate y position (higher in stack = lower y value)
    let jerseyY = y - i * 80;

    // Random jersey type
    let type = types[floor(random(types.length))];

    // Create jersey and add to array
    jerseys.push(new Jersey(x + offsetX, jerseyY, type));
  }
}

// Reset game
function resetGame() {
  // Reset ball
  resetBall();

  // Reset jerseys
  createRandomJerseys(5);

  // Reset trophy
  trophy.reset();

  // Reset trophy highlight
  trophyHighlight = false;

  // Reset super power
  resetSuperPower();
}

// Check victory condition
function checkVictoryCondition() {
  // Check if game is in gameplay state
  if (gameState === "gameplay") {
    // All victory conditions are handled in handleTrophyCollision
  }
}

// Play background music
function playBackgroundMusic() {
  // Only play if audio context is running
  if (getAudioContext().state === "running") {
    // Play crowd ambient sound with loop
    crowdSound.setVolume(0.3);
    if (!crowdSound.isPlaying()) {
      crowdSound.loop();
    }
  }
}

// Play jersey hit sound
function playJerseyHitSound() {
  // Placeholder for jersey hit sound
  // Would implement actual sound here
}

// Play jersey destruction sound
function playJerseyDestructionSound() {
  // Placeholder for jersey destruction sound
  // Would implement actual sound here
}

// Play ball launch sound
function playBallLaunchSound() {
  // Placeholder for ball launch sound
  // Would implement actual sound here
}

// Render ball
function renderBall() {
  // Calculate angle based on velocity or position
  let angle;
  if (!ballHasCollided) {
    if (!ballReleased) {
      // Point toward slingshot origin when pulled back
      angle = atan2(
        slingshot.origin.y - ball.position.y,
        slingshot.origin.x - ball.position.x
      );
    } else {
      // Point in direction of travel when in flight
      let velocity = ball.velocity;
      angle = atan2(velocity.y, velocity.x);
    }
  } else {
    // Use physics engine rotation after collision
    angle = ball.angle;
  }

  // Render ball with rotation and super power effect
  push();
  translate(ball.position.x, ball.position.y);
  rotate(angle);

  // Add glow effect if super power is active
  if (superPowerActive) {
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "gold";
  }

  imageMode(CENTER);

  // Draw ball with size modification if super power is active
  let ballSize = superPowerActive ? 60 : 40; // Increased from 50 to 60
  image(ballImg, 0, 0, ballSize, ballSize);

  pop();
}

// Draw touch indicator
function drawTouchIndicator() {
  // Only show when ball is static
  if (!ballReleased) {
    push();
    noFill();
    stroke(255, 255, 255, 120);
    strokeWeight(2);
    ellipse(ball.position.x, ball.position.y, interactRadius * 2);
    pop();
  }
}

// Draw fullscreen button
function drawFullscreenButton() {
  push();
  fill(0, 0, 0, 100);
  noStroke();
  rect(width - 60, 20, 40, 40, 5);

  // Draw fullscreen icon
  stroke(255);
  strokeWeight(2);
  noFill();
  rect(width - 50, 30, 20, 20);

  pop();
}

// Check fullscreen button press
function checkFullscreenButtonPress() {
  if (
    mouseX > width - 60 &&
    mouseX < width - 20 &&
    mouseY > 20 &&
    mouseY < 60
  ) {
    toggleFullScreen();
  }
}

// Toggle fullscreen
function toggleFullScreen() {
  let fs = fullscreen();
  fullscreen(!fs);
}

// Check orientation
function checkOrientation() {
  if (windowWidth < windowHeight) {
    // Device is in portrait orientation - show rotation message
    push();
    background(0, 0, 0, 200);
    textAlign(CENTER, CENTER);
    textSize(30);
    fill(255);
    text(
      "Please rotate your device to landscape mode for the best experience",
      width / 2,
      height / 2
    );

    // Draw rotation icon
    push();
    translate(width / 2, height / 2 + 80);
    stroke(255);
    strokeWeight(3);
    noFill();
    rect(-30, -50, 60, 100, 10);

    // Rotation arrows
    fill(255);
    noStroke();
    triangle(-40, 0, -60, -15, -60, 15);
    triangle(40, 0, 60, -15, 60, 15);
    pop();

    pop();

    // Don't process game logic in portrait mode
    return false;
  }
  return true;
}

// Check off-screen objects
function checkOffScreenObjects() {
  // Get viewport bounds with margin
  const margin = 300;
  const minX = -margin;
  const maxX = width + margin;
  const minY = -margin;
  const maxY = height + margin;

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

// Detect device performance
function detectDevicePerformance() {
  // Simple performance detection based on device capabilities
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

// Apply performance settings
function applyPerformanceSettings(isLowEndDevice) {
  if (isLowEndDevice) {
    // Low-end device settings
    engine.timing.timeScale = 1; // Use default timing (can be more efficient)
    particleMultiplier = 0.5; // Half as many particles
    enableBackgroundEffects = false;
    explosionParticleCount = 25; // Reduced from 50

    // Reduce flame effects
    if (flameTrail) {
      flameTrail.maxParticles = 40;
      flameTrail.emitRate = 1;
    }
  } else {
    // Normal device settings
    engine.timing.timeScale = 0.8;
    particleMultiplier = 1.0;
    enableBackgroundEffects = true;
    explosionParticleCount = 50;

    // Normal flame effects
    if (flameTrail) {
      flameTrail.maxParticles = 80;
      flameTrail.emitRate = 3;
    }
  }
}

// Monitor frame rate
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

// Window resize handler
function windowResized() {
  // Only resize if on mobile device
  if (isMobileDevice) {
    // Calculate new canvas size while maintaining aspect ratio
    let canvasWidth = min(windowWidth, 1500);
    let canvasHeight = min(windowHeight, 800);

    // Resize canvas
    resizeCanvas(canvasWidth, canvasHeight);

    // Adjust game elements for new screen size
    adjustGameElementsForScreenSize();
  }
}

// Adjust game elements for screen size
function adjustGameElementsForScreenSize() {
  // Recalculate ground position
  World.remove(engine.world, ground);
  ground = Bodies.rectangle(width / 2, height - 50, width, 20, {
    isStatic: true,
  });
  World.add(engine.world, ground);

  // Adjust slingshot origin
  slingshot.origin.x = 150 * (width / 1500);
  slingshot.origin.y = height - 150;

  // Reset ball position
  resetBall();

  // Adjust trophy position
  Body.setPosition(trophy.body, {
    x: width - 200,
    y: 200,
  });
}

// Draw victory screen
function drawVictoryScreen() {
  // Draw background
  image(stadiumImg, 0, 0, width, height);

  // Draw victory message
  push();
  textAlign(CENTER, CENTER);
  textSize(80);
  fill(255, 215, 0); // Gold color
  stroke(0);
  strokeWeight(5);
  text("VICTORY!", width / 2, height / 3);

  // Draw trophy
  imageMode(CENTER);
  image(trophyImg, width / 2, height / 2, 150, 200);

  // Draw restart button
  drawRestartButton();
  pop();
}

// Draw restart button
function drawRestartButton() {
  // Create restart button
  restartButton = {
    x: width / 2,
    y: height * 0.75,
    width: isMobileDevice ? 300 : 250,
    height: isMobileDevice ? 100 : 80,
  };

  // Draw button
  rectMode(CENTER);
  fill(0, 150, 0);
  stroke(255);
  strokeWeight(4);
  rect(
    restartButton.x,
    restartButton.y,
    restartButton.width,
    restartButton.height,
    15
  );

  // Draw button text
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(255);
  noStroke();
  text("PLAY AGAIN", restartButton.x, restartButton.y);
}

// Update super power charge
function updateSuperPowerCharge() {
  if (damageCounter >= superPowerThreshold && !superPowerActive) {
    // Flash power bar to indicate charge ready
    superPowerCharge = superPowerThreshold;
  } else if (!superPowerActive) {
    // Update charge based on damage counter
    superPowerCharge = damageCounter;
  }
}

// Activate super power
function activateSuperPower() {
  if (
    superPowerCharge >= superPowerThreshold &&
    !superPowerActive &&
    !ballReleased
  ) {
    superPowerActive = true;
    // Visual effect for ball when super power is active
    playPowerUpSound();
  }
}

// Reset super power after shot
function resetSuperPower() {
  superPowerActive = false;
  damageCounter = 0;
  superPowerCharge = 0;
}

// Play power up sound
function playPowerUpSound() {
  // Placeholder for power up sound
  // Would implement actual sound here
}
