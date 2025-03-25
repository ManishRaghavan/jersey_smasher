# Jersey Smasher

A dynamic physics-based game where you launch a ball to destroy jerseys and claim the trophy!

![Jersey Smasher Game](assets/title.jpg)

## Game Description

Jersey Smasher is an interactive physics-based game built with p5.js and Matter.js. Launch your ball using a slingshot mechanism to destroy jerseys of different types and ultimately claim the trophy. The game features realistic physics, particle effects, and a power-up system that rewards strategic play.

## Gameplay Features

- **Slingshot Mechanics**: Pull back and release to launch the ball with physics-based trajectory
- **Different Jersey Types**:
  - Red Jerseys (6 health points)
  - Blue Jerseys (4 health points)
  - Black Jerseys (2 health points)
- **Super Power System**:
  - Collect charges by damaging jerseys
  - Activate 10x power multiplier after 10 health steals
  - Powerful visual effects when super power is active
- **Dynamic Physics**: Realistic movement, collisions, and jersey stacking
- **Trophy Victory**: Destroy all jerseys then hit the trophy to win
- **Particle Effects**: Explosion effects based on jersey type
- **Mobile Support**: Responsive design with touch controls and orientation detection

## Controls

### Desktop

- **Mouse Drag**: Pull back the ball to aim and shoot
- **Spacebar**: Reset the ball position
- **R Key**: Reset the entire game

### Mobile

- **Touch and Drag**: Pull back the ball to aim and shoot
- **Reset Ball Button**: Touch to reset ball position
- **Reset Game Button**: Touch to restart the game
- **Fullscreen Button**: Toggle fullscreen mode

## Power-Up System

The game features a super power system that charges as you damage jerseys:

1. Each time you damage a jersey, your power meter increases
2. After 10 health steals, the super power becomes available
3. Press the "ACTIVATE 10X" button to enable super power mode
4. Your next shot will be 10 times more powerful with special visual effects
5. The power meter resets after using your powered-up shot

## Performance Optimization

The game includes automatic performance detection that adjusts visual effects based on your device capabilities:

- Reduced particle effects on lower-end devices
- Adjusted physics simulation for consistent gameplay
- Option to reduce frame rate on devices with performance issues

## Visual Elements

- 3D-styled interactive buttons with hover effects
- Animated title screen with dynamic text effects
- Flame trail effects behind the ball during flight
- Explosion particles customized for each jersey type
- Trophy highlight effects when victory is near
- Health bars showing remaining jersey durability

## Development

The game is built using:

- p5.js for rendering and input handling
- Matter.js for physics simulation
- Custom particle systems for visual effects

## Getting Started

1. Open `index.html` in a web browser
2. Click the animated 3D PLAY button on the title screen
3. Drag the ball backward to set power and angle
4. Release to launch and destroy jerseys
5. Build up your super power meter for powerful shots
6. Clear all jerseys and hit the trophy to win

---

Enjoy playing Jersey Smasher!
