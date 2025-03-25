# Jersey Smash - Game Setup

## Canvas Setup

```javascript
function setup() {
  // Create canvas for landscape mobile orientation
  let canvas = createCanvas(1500, 800);

  // Initialize physics engine
  engine = Engine.create();
  engine.timing.timeScale = 0.8; // Simulation speed

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

  // Initialize game objects
  initializeGameObjects();

  // Set initial game state
  gameState = "title";
  titleTimer = 0;
}
```

## Asset Loading

```javascript
function preload() {
  // Load game images
  titleImage = loadImage("title.jpg");
  ballImg = loadImage("ball.png");
  blackJerseyImg = loadImage("black_jersey.png");
  blueJerseyImg = loadImage("blue_jersey.png");
  redJerseyImg = loadImage("red_jersey.png");
  stadiumImg = loadImage("stadium.jpg");
  trophyImg = loadImage("trophy_cup.png");

  // Load game sounds
  crowdSound = loadSound("crowd_cheering.mp3");
  victorySound = loadSound("victory_sound.mp3");
}
```

## Game Initialization

```javascript
function initializeGameObjects() {
  // Initialize jersey array
  jerseys = [];

  // Create initial set of jerseys at random positions
  createRandomJerseys(5);

  // Initialize trophy
  trophy = new Trophy(width - 200, 200);

  // Initialize explosion manager for destruction animations
  explosionManager = new ExplosionManager();

  // Reset game variables
  ballReleased = false;
  ballHasCollided = false;
  ballBeingDragged = false;
  jerseyCount = 5;
  gameStarted = false;
}
```

## Game Loop

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
