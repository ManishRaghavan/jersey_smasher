# Jersey Smash - Jersey System

## Jersey Types

```javascript
// Jersey class with health points based on color
class Jersey {
  constructor(x, y, type) {
    this.type = type;

    // Set health points and image based on jersey type
    switch (type) {
      case "red":
        this.health = 6;
        this.img = redJerseyImg;
        break;
      case "blue":
        this.health = 4;
        this.img = blueJerseyImg;
        break;
      case "black":
        this.health = 2;
        this.img = blackJerseyImg;
        break;
    }

    // Create physics body
    this.width = 70;
    this.height = 100;
    this.body = Bodies.rectangle(x, y, this.width, this.height);
    this.body.isJersey = true; // Flag for collision detection
    this.body.jerseyRef = this; // Reference to this object for collision handling

    // Add to physics world
    World.add(engine.world, this.body);
  }

  display() {
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);
    imageMode(CENTER);
    image(this.img, 0, 0, this.width, this.height);

    // Optionally: Display health
    textAlign(CENTER);
    textSize(16);
    fill(255);
    text(this.health, 0, -this.height / 2 - 10);
    pop();
  }

  damage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      return true; // Jersey is destroyed
    }
    return false;
  }

  destroy() {
    // Create explosion at jersey position
    explosionManager.createExplosion(
      this.body.position.x,
      this.body.position.y
    );

    // Remove from physics world
    World.remove(engine.world, this.body);

    // Decrement jersey count
    jerseyCount--;

    // Play destruction sound
    playJerseyDestructionSound();
  }
}
```

## Jersey Creation

```javascript
function createRandomJerseys(count) {
  // Clear existing jerseys
  for (let jersey of jerseys) {
    World.remove(engine.world, jersey.body);
  }
  jerseys = [];

  // Jersey types
  const types = ["red", "blue", "black"];

  // Create new jerseys
  for (let i = 0; i < count; i++) {
    // Random position (avoiding overlaps)
    let x = random(400, width - 300);
    let y = random(200, height - 200);

    // Random type
    let type = types[floor(random(types.length))];

    // Create new jersey
    jerseys.push(new Jersey(x, y, type));
  }

  // Update jersey count
  jerseyCount = jerseys.length;
}
```

## Jersey Positioning

```javascript
function positionJerseysWithGaps() {
  // Clear existing jerseys
  for (let jersey of jerseys) {
    World.remove(engine.world, jersey.body);
  }
  jerseys = [];

  // Define positions: high, mid, low
  const positions = [
    { minY: 150, maxY: 250 }, // High
    { minY: 300, maxY: 400 }, // Mid
    { minY: 500, maxY: 600 }, // Low
  ];

  // Jersey types
  const types = ["red", "blue", "black"];

  // Create 5 jerseys at different heights with gaps
  for (let i = 0; i < 5; i++) {
    // Calculate x position with gaps
    let x = 500 + i * 200;

    // Random height position
    let posIndex = floor(random(positions.length));
    let y = random(positions[posIndex].minY, positions[posIndex].maxY);

    // Random type
    let type = types[floor(random(types.length))];

    // Create jersey
    jerseys.push(new Jersey(x, y, type));
  }

  // Update jersey count
  jerseyCount = jerseys.length;
}
```

## Explosion Animation

```javascript
class ExplosionManager {
  constructor() {
    this.explosions = [];
  }

  createExplosion(x, y) {
    let explosion = new Explosion(x, y);
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

class Explosion {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.particles = [];
    for (let i = 0; i < 50; i++) {
      this.particles.push(new ExplosionParticle(this.pos.x, this.pos.y));
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

class ExplosionParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.lifespan = 255;
    this.size = random(3, 10);
  }

  update() {
    this.vel.mult(0.95); // Decelerate
    this.pos.add(this.vel);
    this.lifespan -= 5;
  }

  display() {
    noStroke();
    fill(255, this.lifespan);
    ellipse(this.pos.x, this.pos.y, this.size);
  }

  isDead() {
    return this.lifespan < 0;
  }
}
```

## Jersey Collision Handling

```javascript
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

    // Handle ball-jersey collision
    if (
      (bodyA === ball && bodyB.isJersey) ||
      (bodyB === ball && bodyA.isJersey)
    ) {
      // Mark ball as collided
      ballHasCollided = true;

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
        let jerseyIndex = jerseys.findIndex((j) => j.body === jerseyBody);
        if (jerseyIndex !== -1) {
          jerseys.splice(jerseyIndex, 1);
        }

        // Check if all jerseys destroyed
        if (jerseys.length === 0) {
          // Only trophy remains
          // (Trophy handling will be in another file)
        }
      }
    }

    // Handle ball-trophy collision (to be added in trophy.md)
  }
}
```
