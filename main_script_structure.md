# Jersey Smash - Main Script Structure

This file outlines the complete structure of the main script, showing how all components fit together.

## Variables & Constants

```javascript
// Matter.js variables
let Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Events = Matter.Events;

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

// Game objects
let ball; // Ball physics body
let ground; // Ground physics body
let slingshot; // Slingshot object
let jerseys = []; // Array of jersey objects
let trophy; // Trophy object
let explosionManager; // Explosion effect manager

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
```

## Setup & Preload

```javascript
function preload() {
  // Load all game assets
  titleImage = loadImage("title.png");
  ballImg = loadImage("ball.png");
  blackJerseyImg = loadImage("black_jersey.png");
  blueJerseyImg = loadImage("blue_jersey.png");
  redJerseyImg = loadImage("red_jersey.png");
  stadiumImg = loadImage("stadium.png");
  trophyImg = loadImage("trophy_cup.png");

  // Load sounds
  crowdSound = loadSound("crowd_cheering.mp3");
  victorySound = loadSound("victory_sound.mp3");
}

function setup() {
  // Create canvas for landscape mobile orientation
  let canvas = createCanvas(1500, 800);

  // Initialize physics engine
  engine = Engine.create();
  engine.timing.timeScale = simulationSpeed;

  // Create ground
  ground = Bodies.rectangle(width / 2, height - 100, width, 20, {
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

  // Set up collision event listener
  Events.on(engine, "collisionStart", handleCollision);

  // Initialize explosion manager
  explosionManager = new ExplosionManager();

  // Initialize trophy
  trophy = new Trophy(width - 200, 200);

  // Set initial game state
  gameState = "title";
  titleTimer = 0;
}
```

## Main Draw Loop

```javascript
function draw() {
  // Handle different game states
  if (gameState === "title") {
    drawTitleScreen();
  } else if (gameState === "gameplay") {
    drawGameplay();
  } else if (gameState === "victory") {
    drawVictoryScreen();
  }
}
```

## Class Implementations

The main script should include all the class implementations detailed in previous files:

1. SlingShot class
2. Jersey class
3. Trophy class
4. ExplosionManager class and related particle classes
5. UI classes and handlers

## Mouse & Keyboard Handlers

```javascript
function mousePressed() {
  if (gameState === "title") {
    checkPlayButtonClick();
  } else if (gameState === "victory") {
    checkRestartButtonClick();
  }
}

function mouseDragged() {
  if (gameState === "gameplay") {
    // Ball dragging logic
    let d = dist(mouseX, mouseY, ball.position.x, ball.position.y);
    if (!ballReleased && d < interactRadius) {
      ballBeingDragged = true;

      // Slingshot stretching logic
      // ...
    }
  }
}

function mouseReleased() {
  if (gameState === "gameplay" && ballBeingDragged) {
    ballBeingDragged = false;
    ballReleased = true;

    // Make ball dynamic
    Body.setStatic(ball, false);

    // Apply launch force
    // ...

    // Play launch sound
    playBallLaunchSound();
  }
}

function keyPressed() {
  // Space to reset ball
  if (key === " " && gameState === "gameplay") {
    resetBall();
  }

  // R to reset game
  if (key === "r" || key === "R") {
    resetGame();
  }
}
```

## Game State Transitions

The game will transition between three states:

1. Title → Gameplay (on Play button click)
2. Gameplay → Victory (when trophy is hit after all jerseys are destroyed)
3. Victory → Gameplay (on Restart button click)

All transitions should reset appropriate game elements and play corresponding sounds.
