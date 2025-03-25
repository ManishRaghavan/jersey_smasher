# Jersey Smash - Mobile Touch Implementation

This file outlines the touch event handling needed to make the game fully playable on mobile devices.

## Touch Event Listeners

```javascript
// Add these to setup() function
function setup() {
  // ... existing setup code ...

  // Disable default touch behaviors to prevent scrolling
  canvas.touchStarted(touchStartHandler);
  canvas.touchMoved(touchMovedHandler);
  canvas.touchEnded(touchEndedHandler);

  // Prevent default touch behaviors
  document.addEventListener(
    "touchstart",
    function (e) {
      if (e.target == canvas) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "touchmove",
    function (e) {
      if (e.target == canvas) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "touchend",
    function (e) {
      if (e.target == canvas) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
}
```

## Touch Event Handlers

```javascript
// Touch event handlers
function touchStartHandler(event) {
  // Convert touch position to mouse position
  if (event.touches && event.touches.length > 0) {
    mouseX = event.touches[0].clientX;
    mouseY = event.touches[0].clientY;

    // Handle touch based on game state
    if (gameState === "title") {
      checkPlayButtonClick();
    } else if (gameState === "victory") {
      checkRestartButtonClick();
    }
  }

  // Return false to prevent default
  return false;
}

function touchMovedHandler(event) {
  // Convert touch position to mouse position
  if (event.touches && event.touches.length > 0) {
    mouseX = event.touches[0].clientX;
    mouseY = event.touches[0].clientY;

    // Handle ball dragging on touch move
    if (gameState === "gameplay") {
      let d = dist(mouseX, mouseY, ball.position.x, ball.position.y);
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
          // Calculate angle between origin and touch position
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
          // Set ball position to touch position
          Body.setPosition(ball, {
            x: mouseX,
            y: mouseY,
          });
        }
      }
    }
  }

  // Return false to prevent default
  return false;
}

function touchEndedHandler(event) {
  // Handle ball release on touch end
  if (gameState === "gameplay" && ballBeingDragged) {
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

    // Play launch sound
    playBallLaunchSound();
  }

  // Return false to prevent default
  return false;
}
```

## Mobile-Specific UI Adjustments

```javascript
// Add this to improve touch target sizes
function createMobileResponsiveUI() {
  // Increase interaction radius for ball dragging on touch devices
  let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    interactRadius = 70; // Larger touch area for finger accuracy
  }

  // Adjust button sizes for touch
  if (isTouchDevice) {
    // Make play button larger for touch
    playButton.width = 300;
    playButton.height = 100;

    // Make restart button larger for touch
    restartButton.width = 300;
    restartButton.height = 100;
  }
}
```

## Touch Indicator

```javascript
// Add visual indicator for touch area around ball
function drawTouchIndicator() {
  // Only show on mobile and when ball is static
  let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice && !ballReleased) {
    push();
    noFill();
    stroke(255, 255, 255, 120);
    strokeWeight(2);
    ellipse(ball.position.x, ball.position.y, interactRadius * 2);
    pop();
  }
}
```

## Mobile Device Detection

```javascript
// Add this to setup()
function setup() {
  // ... existing setup code ...

  // Detect if running on mobile device
  isMobileDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Adjust UI and interaction based on device type
  if (isMobileDevice) {
    // Set mobile-specific settings
    interactRadius = 70;

    // Set responsive canvas size based on window dimensions
    let canvasWidth = min(windowWidth, 1500);
    let canvasHeight = min(windowHeight, 800);
    resizeCanvas(canvasWidth, canvasHeight);
  }
}
```

## Responsive Canvas Resizing

```javascript
// Add this function to handle orientation changes and resizing
function windowResized() {
  // Only resize if on mobile device
  if (isMobileDevice) {
    // Calculate new canvas size while maintaining aspect ratio
    let canvasWidth = min(windowWidth, 1500);
    let canvasHeight = min(windowHeight, 800);

    // Resize canvas
    resizeCanvas(canvasWidth, canvasHeight);

    // Adjust game elements based on new canvas size
    adjustGameElementsForScreenSize();
  }
}

function adjustGameElementsForScreenSize() {
  // Recalculate ground position
  World.remove(engine.world, ground);
  ground = Bodies.rectangle(width / 2, height - 100, width, 20, {
    isStatic: true,
  });
  World.add(engine.world, ground);

  // Adjust slingshot origin
  slingshot.origin.x = 150 * (width / 1500);
  slingshot.origin.y = height - 200;

  // Reset ball position
  resetBall();

  // Adjust trophy position
  Body.setPosition(trophy.body, {
    x: width - 200,
    y: 200,
  });
}
```

## Fullscreen Toggle for Mobile

```javascript
// Add this function for mobile fullscreen toggle
function toggleFullScreen() {
  let fs = fullscreen();
  fullscreen(!fs);
}

// Add fullscreen button
function drawFullscreenButton() {
  if (isMobileDevice) {
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

    // Check for fullscreen button press
    if (
      mouseIsPressed &&
      mouseX > width - 60 &&
      mouseX < width - 20 &&
      mouseY > 20 &&
      mouseY < 60
    ) {
      toggleFullScreen();
    }
  }
}
```

## Orientation Lock Message

```javascript
// Add this function to display orientation message if needed
function checkOrientation() {
  if (isMobileDevice && windowWidth < windowHeight) {
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
```

## Update Main Game Loop

```javascript
// Modify the draw function to include these mobile-specific features
function draw() {
  // Check orientation first
  if (isMobileDevice && !checkOrientation()) {
    return; // Exit early if in wrong orientation
  }

  // Regular game state handling
  if (gameState === "title") {
    drawTitleScreen();
  } else if (gameState === "gameplay") {
    drawGameplay();

    // Add mobile-specific UI elements
    drawTouchIndicator();
    drawFullscreenButton();
  } else if (gameState === "victory") {
    drawVictoryScreen();
    drawFullscreenButton();
  }
}
```
