# Jersey Smash - Title Screen Implementation

## Title Screen Variables

```javascript
let titleImage; // Title screen image
let playButton; // Play button object
let titleTimer = 0; // Timer to track when to show play button
let gameState = "title"; // Initial game state
```

## Title Screen Display

```javascript
function drawTitleScreen() {
  // Display the title image across the entire canvas
  image(titleImage, 0, 0, width, height);

  // Increment the timer
  titleTimer++;

  // After 3 seconds (180 frames at 60fps), display the play button
  if (titleTimer > 180) {
    drawPlayButton();

    // Check if play button is clicked
    checkPlayButtonClick();
  }
}
```

## Play Button Implementation

```javascript
function drawPlayButton() {
  // Draw play button
  playButton = {
    x: width / 2,
    y: height * 0.7,
    width: 200,
    height: 80,
  };

  // Button styling
  push();
  rectMode(CENTER);
  fill(0, 150, 0);
  stroke(255);
  strokeWeight(4);
  rect(playButton.x, playButton.y, playButton.width, playButton.height, 15);

  // Button text
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(255);
  noStroke();
  text("PLAY", playButton.x, playButton.y);
  pop();
}
```

## Play Button Interaction

```javascript
function checkPlayButtonClick() {
  if (
    mouseIsPressed &&
    mouseX > playButton.x - playButton.width / 2 &&
    mouseX < playButton.x + playButton.width / 2 &&
    mouseY > playButton.y - playButton.height / 2 &&
    mouseY < playButton.y + playButton.height / 2
  ) {
    // Change game state to gameplay
    gameState = "gameplay";
    gameStarted = true;

    // Reset the game objects
    resetGame();

    // Play crowd sound
    crowdSound.play();
  }
}
```

## Game Reset Function

```javascript
function resetGame() {
  // Reset the ball
  resetBall();

  // Create new set of random jerseys
  resetJerseys();

  // Reset trophy position
  trophy.reset();

  // Reset game variables
  ballReleased = false;
  ballHasCollided = false;
  ballBeingDragged = false;
  jerseyCount = 5;
}
```

## Transitions

```javascript
function startGame() {
  // Change state
  gameState = "gameplay";

  // Initialize gameplay elements
  initializeGameObjects();

  // Start game sounds
  playBackgroundMusic();
}
```
