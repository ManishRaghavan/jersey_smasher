# Jersey Smash - Game Architecture

## Overview

Jersey Smash is a mobile-based landscape game similar to Angry Birds. Players use a slingshot to launch a ball at jerseys with different health points. The ultimate goal is to destroy all jerseys and hit the moving trophy to win.

## Game States

1. **Title Screen**: Shows title image with "Play" button appearing after 3 seconds
2. **Gameplay**: Main gameplay with slingshot mechanics and jersey targets
3. **Victory**: Displayed when player destroys all jerseys and hits the trophy

## Core Components

### 1. Game Manager

- Handles game states (title, gameplay, victory)
- Controls transitions between states
- Manages score tracking

### 2. Slingshot

- Controls ball dragging and launching
- Calculates launch force based on pull distance
- Limits maximum pull distance
- Handles ball reset after launch

### 3. Jersey System

- Different jersey types with varying health:
  - Red: 6 health points
  - Blue: 4 health points
  - Black: 2 health points
- Jersey placement at random heights (high, mid, low)
- Health reduction based on impact force
- Destruction animation when health reaches zero
- Random respawning of new jerseys

### 4. Trophy

- Moves horizontally in the right corner of the screen
- Collision detection with ball
- Triggers victory when hit after all jerseys are destroyed

### 5. Physics System

- Ball trajectory after launch
- Collision detection and response
- Impact force calculation
- Gravity and bounce effects

### 6. Audio System

- Background music
- Sound effects for:
  - Ball launch
  - Jersey hits
  - Jersey destruction
  - Trophy hit
  - Victory

### 7. UI Elements

- Score display
- Remaining jerseys counter
- Play button on title screen
- Victory message
