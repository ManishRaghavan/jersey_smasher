# Jersey Smash - Trophy System

## Trophy Class

```javascript
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
    }
  }

  display() {
    // Render trophy
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);
    imageMode(CENTER);
    image(trophyImg, 0, 0, this.width, this.height);
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
  }

  hit() {
    // When trophy is hit, trigger victory
    victorySound.play();
    gameState = "victory";
  }
}
```

## Trophy Collision Handling

```javascript
// Add this to the handleCollision function
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
```

## Trophy Updates

```javascript
// Add this to the main game loop
function updateTrophy() {
  // Update trophy position
  trophy.update();

  // Render trophy
  trophy.display();
}
```

## Victory Condition

```javascript
function checkVictoryCondition() {
  // Check if game is in gameplay state
  if (gameState === "gameplay") {
    // Check if all jerseys are destroyed and trophy has been hit
    if (jerseys.length === 0 && gameState === "victory") {
      // Display victory screen
      showVictoryScreen();
    }
  }
}
```

## Victory Screen

```javascript
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

function drawRestartButton() {
  // Create restart button
  restartButton = {
    x: width / 2,
    y: height * 0.75,
    width: 250,
    height: 80,
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

  // Check for button click
  if (
    mouseIsPressed &&
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
```
