/**
 * Physics Engine — Soft World Simulation
 * 
 * Gravity, friction, momentum, collision.
 * Everything has weight. Nothing moves perfectly.
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface PhysicsBody {
  id: string;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  mass: number;
  friction: number;
  restitution: number; // bounciness
  radius: number;
  isStatic: boolean;
  lastUpdated: number;
}

export const GRAVITY = 0.08;
export const AIR_RESISTANCE = 0.995;
export const GROUND_Y = 85; // percentage from top

export function createBody(
  id: string,
  x: number,
  y: number,
  options: Partial<PhysicsBody> = {}
): PhysicsBody {
  return {
    id,
    position: { x, y },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    mass: options.mass ?? 1,
    friction: options.friction ?? 0.92,
    restitution: options.restitution ?? 0.3,
    radius: options.radius ?? 2,
    isStatic: options.isStatic ?? false,
    lastUpdated: Date.now(),
  };
}

export function applyForce(body: PhysicsBody, force: Vector2): void {
  body.acceleration.x += force.x / body.mass;
  body.acceleration.y += force.y / body.mass;
}

export function updateBody(body: PhysicsBody, deltaTime: number): void {
  if (body.isStatic) return;

  // Apply gravity
  body.velocity.y += GRAVITY * deltaTime;

  // Apply acceleration
  body.velocity.x += body.acceleration.x * deltaTime;
  body.velocity.y += body.acceleration.y * deltaTime;

  // Apply air resistance
  body.velocity.x *= AIR_RESISTANCE;
  body.velocity.y *= AIR_RESISTANCE;

  // Update position
  body.position.x += body.velocity.x * deltaTime;
  body.position.y += body.velocity.y * deltaTime;

  // Ground collision
  if (body.position.y > GROUND_Y) {
    body.position.y = GROUND_Y;
    body.velocity.y *= -body.restitution;
    body.velocity.x *= body.friction;

    // Stop tiny bounces
    if (Math.abs(body.velocity.y) < 0.1) {
      body.velocity.y = 0;
    }
  }

  // Wall collisions
  if (body.position.x < 2) {
    body.position.x = 2;
    body.velocity.x *= -body.restitution;
  }
  if (body.position.x > 98) {
    body.position.x = 98;
    body.velocity.x *= -body.restitution;
  }

  // Reset acceleration
  body.acceleration.x = 0;
  body.acceleration.y = 0;

  body.lastUpdated = Date.now();
}

export function distance(a: Vector2, b: Vector2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalize(v: Vector2): Vector2 {
  const mag = Math.sqrt(v.x * v.x + v.y * v.y);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Perlin-like noise for organic movement
const permutation = Array.from({ length: 256 }, () => Math.floor(Math.random() * 256));
export function noise(x: number): number {
  const xi = Math.floor(x) & 255;
  const xf = x - Math.floor(x);
  const u = xf * xf * (3 - 2 * xf);
  return lerp(permutation[xi] / 255, permutation[(xi + 1) & 255] / 255, u) * 2 - 1;
}
