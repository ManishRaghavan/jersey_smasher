# Jersey Smash - Slingshot Mechanics

## Slingshot Constants

```javascript
let maxStretch = 100; // Maximum stretch distance for the slingshot
let strength = 0.00161; // Strength of the slingshot force
let interactRadius = 50; // Radius within which mouse interaction is allowed
```

## Slingshot Class

```javascript
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
```

## Ball Dragging

```javascript
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
```

## Ball Release

```javascript
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

    // Apply launch force
    Body.applyForce(ball, ball.position, {
      x: forceX * strength,
      y: forceY * strength,
    });
  }
}
```

## Ball Reset

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
```

## Auto-Reset Logic

```javascript
// Check if ball has stopped or is off-screen
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
```

## Ball Rendering

```javascript
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

  // Render ball with rotation
  push();
  translate(ball.position.x, ball.position.y);
  rotate(angle);
  imageMode(CENTER);
  image(ballImg, 0, 0, 40, 40);
  pop();
}
```
