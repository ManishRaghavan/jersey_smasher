# Jersey Smash - Gameplay Implementation

## Main Game Loop

```javascript
function drawGameplay() {
  // Clear canvas
  clear();

  // Draw background
  image(stadiumImg, 0, 0, width, height);

  // Update physics engine
  Engine.update(engine);

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
}
```

## UI Elements

```javascript
function displayGameUI() {
  // Display jersey count
  push();
  textAlign(LEFT, TOP);
  textSize(30);
  fill(255);
  stroke(0);
  strokeWeight(2);
  text("Jerseys: " + jerseys.length, 20, 20);
  pop();

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
```

## Collision Handling System

```javascript
function handleCollision(event) {
  let pairs = event.pairs;

  for (let i = 0; i < pairs.length; i++) {
    let bodyA = pairs[i].bodyA;
    let bodyB = pairs[i].bodyB;

    // Calculate the magnitude of the impact
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

function createTrophyHighlight() {
  // Create visual effect to highlight trophy
  trophyHighlight = true;
}
```

## Audio Implementation

```javascript
function playBackgroundMusic() {
  // Play crowd ambient sound with loop
  crowdSound.setVolume(0.3);
  crowdSound.loop();
}

function playJerseyHitSound() {
  // Play sound when jersey is hit but not destroyed
  // Could use different sounds based on jersey type
}

function playJerseyDestructionSound() {
  // Play sound when jersey is destroyed
}

function playBallLaunchSound() {
  // Play sound when ball is launched
}

function playVictorySound() {
  // Play victory sound when trophy is hit
  victorySound.setVolume(0.7);
  victorySound.play();

  // Stop background music
  crowdSound.stop();
}
```

## Game Reset Functions

```javascript
function resetBall() {
  // Remove old ball from world
  World.remove(engine.world, ball);

  // Create new ball
  ball = Bodies.circle(150, height - 200, 20, {
    isStatic: true,
  });
  World.add(engine.world, ball);

  // Create new slingshot
  slingshot = new SlingShot(150, height - 200, ball);

  // Reset ball states
  ballReleased = false;
  ballHasCollided = false;
  ballBeingDragged = false;
}

function resetJerseys() {
  // Generate new set of jerseys
  createRandomJerseys(5);

  // Reset trophy highlight
  trophyHighlight = false;
}

function resetGame() {
  // Reset ball
  resetBall();

  // Reset jerseys
  resetJerseys();

  // Reset trophy
  trophy.reset();

  // Reset game variables
  gameState = "gameplay";

  // Play background music
  playBackgroundMusic();
}
```

## Keyboard Controls

```javascript
function keyPressed() {
  // Reset ball with spacebar
  if (key === ' ' && gameState === "gameplay") {
    resetBall();
  }

  // Reset entire game with R key
  if (key === 'r' || key === 'R') {
    resetGame();
  }
}

function handleJerseyCollision(bodyA, bodyB, impactMagnitude) {
  // Check if one body is the ball and the other is a jersey
  if ((bodyA === ball && bodyB.isJersey) || (bodyB === ball && bodyA.isJersey)) {
    // Get jersey reference
    let jerseyBody = bodyA.isJersey ? bodyA : bodyB;
    let jersey = jerseyBody.jerseyRef;

    // Determine damage based on impact
    let damage = impactMagnitude > 10 ? 2 : 1;

    // Apply damage to jersey
    if (jersey.damage(damage)) {
      // Jersey destroyed
      jersey.destroy();

      // Find jersey index
      let jerseyIndex = jerseys.findIndex(j => j.body === jerseyBody);
      if (jerseyIndex !== -1) {
        jerseys.splice(jerseyIndex, 1);
      }

      // If all jerseys destroyed, highlight trophy
      if (jerseys.length === 0) {
        // Add visual indicator for trophy
        createTrophyHighlight();
      }
    }
  }
```
