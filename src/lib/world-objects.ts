/**
 * World Objects — Physical Things That Exist
 * 
 * Each object has physics, purpose is emergent.
 */

import { PhysicsBody, createBody, randomRange } from './physics';

export type WorldObjectType = 
  | 'yarn'
  | 'pebble'
  | 'cushion'
  | 'orb'
  | 'paper'
  | 'bubble'
  | 'mote';

export interface WorldObject {
  body: PhysicsBody;
  type: WorldObjectType;
  variant: number;
  color: string;
  size: number;
  rotation: number;
  rotationVelocity: number;
  opacity: number;
  
  // State
  isBeingHeld: boolean;
  lastTouchedBy: string | null;
  lastTouchedTime: number;
  timesInteracted: number;
  
  // Type-specific
  unwindAmount?: number;      // yarn
  fogAmount?: number;         // for glass surfaces
  glowIntensity?: number;     // orbs
  lifetime?: number;          // bubbles
  driftAngle?: number;        // motes
}

const OBJECT_COLORS = {
  yarn: ['#C77DFF', '#FF6B9D', '#2DD4BF', '#FFB8A3'],
  pebble: ['#A8E6CF', '#DCEDC1', '#FFD3B6', '#FFAAA5', '#B8D4E3'],
  cushion: ['#FFB5C5', '#D4A5FF', '#6EE7B7', '#FCD5CE'],
  orb: ['rgba(255,255,255,0.6)', 'rgba(199,125,255,0.4)', 'rgba(255,107,157,0.4)'],
  paper: ['#FFF8E7', '#F5F5F5', '#FFF0F5'],
  bubble: ['rgba(255,255,255,0.3)', 'rgba(199,125,255,0.2)', 'rgba(45,212,191,0.2)'],
  mote: ['rgba(255,255,255,0.8)', 'rgba(255,215,0,0.6)', 'rgba(199,125,255,0.5)'],
};

const OBJECT_PHYSICS: Record<WorldObjectType, Partial<PhysicsBody>> = {
  yarn: { mass: 0.8, friction: 0.85, restitution: 0.4, radius: 3 },
  pebble: { mass: 1.5, friction: 0.7, restitution: 0.6, radius: 1.5 },
  cushion: { mass: 0.3, friction: 0.95, restitution: 0.2, radius: 5 },
  orb: { mass: 0.1, friction: 0.99, restitution: 0.1, radius: 2 },
  paper: { mass: 0.05, friction: 0.98, restitution: 0.1, radius: 2 },
  bubble: { mass: 0.01, friction: 0.999, restitution: 0, radius: 2 },
  mote: { mass: 0.001, friction: 0.999, restitution: 0, radius: 0.5 },
};

export function createWorldObject(
  id: string,
  type: WorldObjectType,
  x: number,
  y: number
): WorldObject {
  const colors = OBJECT_COLORS[type];
  const physics = OBJECT_PHYSICS[type];
  const variant = Math.floor(Math.random() * colors.length);
  
  const sizeMap: Record<WorldObjectType, number> = {
    yarn: randomRange(35, 55),
    pebble: randomRange(12, 24),
    cushion: randomRange(50, 80),
    orb: randomRange(20, 35),
    paper: randomRange(25, 40),
    bubble: randomRange(20, 45),
    mote: randomRange(4, 10),
  };

  return {
    body: createBody(id, x, y, physics),
    type,
    variant,
    color: colors[variant],
    size: sizeMap[type],
    rotation: randomRange(0, 360),
    rotationVelocity: randomRange(-2, 2),
    opacity: type === 'mote' || type === 'bubble' ? randomRange(0.3, 0.7) : 1,
    
    isBeingHeld: false,
    lastTouchedBy: null,
    lastTouchedTime: 0,
    timesInteracted: 0,
    
    // Type-specific initialization
    unwindAmount: type === 'yarn' ? 0 : undefined,
    glowIntensity: type === 'orb' ? randomRange(0.3, 0.8) : undefined,
    lifetime: type === 'bubble' ? randomRange(10000, 30000) : undefined,
    driftAngle: type === 'mote' ? randomRange(0, Math.PI * 2) : undefined,
  };
}

export function updateWorldObject(obj: WorldObject, deltaTime: number): boolean {
  const dt = deltaTime / 1000;
  
  // Rotation
  obj.rotation += obj.rotationVelocity * dt * 60;
  obj.rotationVelocity *= 0.99; // slow down rotation
  
  // Type-specific updates
  switch (obj.type) {
    case 'yarn':
      // Slowly rewind
      if (obj.unwindAmount && obj.unwindAmount > 0) {
        obj.unwindAmount = Math.max(0, obj.unwindAmount - 0.1 * dt);
      }
      break;
      
    case 'bubble':
      // Bubbles slowly rise and have limited lifetime
      obj.body.velocity.y -= 0.02 * dt;
      if (obj.lifetime !== undefined) {
        obj.lifetime -= deltaTime;
        if (obj.lifetime <= 0) {
          return false; // remove bubble
        }
        // Fade near end of life
        if (obj.lifetime < 2000) {
          obj.opacity = obj.lifetime / 2000 * 0.5;
        }
      }
      break;
      
    case 'mote':
      // Motes drift in patterns
      if (obj.driftAngle !== undefined) {
        obj.driftAngle += 0.01 * dt;
        obj.body.velocity.x += Math.cos(obj.driftAngle) * 0.01;
        obj.body.velocity.y += Math.sin(obj.driftAngle) * 0.005 - 0.01; // slight upward
      }
      break;
      
    case 'orb':
      // Orbs pulse glow
      if (obj.glowIntensity !== undefined) {
        obj.glowIntensity = 0.5 + Math.sin(Date.now() / 1000 + obj.body.position.x) * 0.3;
      }
      break;
      
    case 'paper':
      // Paper flutters when moving
      if (Math.abs(obj.body.velocity.x) > 0.1 || Math.abs(obj.body.velocity.y) > 0.1) {
        obj.rotationVelocity += (Math.random() - 0.5) * 0.5;
      }
      break;
  }
  
  return true; // keep object
}

export function objectReactToCat(obj: WorldObject, catId: string, interactionType: 'bat' | 'sit' | 'nudge' | 'steal'): void {
  obj.lastTouchedBy = catId;
  obj.lastTouchedTime = Date.now();
  obj.timesInteracted++;
  
  switch (interactionType) {
    case 'bat':
      const batForce = randomRange(3, 8);
      const batAngle = randomRange(-0.5, 0.5);
      obj.body.velocity.x += Math.cos(batAngle) * batForce * (Math.random() > 0.5 ? 1 : -1);
      obj.body.velocity.y -= randomRange(1, 3);
      obj.rotationVelocity += randomRange(-10, 10);
      
      if (obj.type === 'yarn' && obj.unwindAmount !== undefined) {
        obj.unwindAmount = Math.min(1, obj.unwindAmount + 0.1);
      }
      break;
      
    case 'nudge':
      obj.body.velocity.x += randomRange(-2, 2);
      obj.body.velocity.y -= randomRange(0, 1);
      break;
      
    case 'sit':
      // Object is pinned
      obj.body.velocity.x *= 0.1;
      obj.body.velocity.y *= 0.1;
      if (obj.type === 'cushion') {
        obj.size *= 0.95; // squish
      }
      break;
      
    case 'steal':
      // Object moves with cat (handled elsewhere)
      break;
  }
}

export function objectReactToUser(obj: WorldObject, velocity: { x: number; y: number }): void {
  obj.lastTouchedBy = 'user';
  obj.lastTouchedTime = Date.now();
  obj.timesInteracted++;
  
  obj.body.velocity.x += velocity.x * 0.5;
  obj.body.velocity.y += velocity.y * 0.5;
  obj.rotationVelocity += velocity.x * 0.2;
  
  if (obj.type === 'yarn' && obj.unwindAmount !== undefined) {
    const force = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    obj.unwindAmount = Math.min(1, obj.unwindAmount + force * 0.02);
  }
}

export function shouldPopBubble(obj: WorldObject, velocity: { x: number; y: number }): boolean {
  if (obj.type !== 'bubble') return false;
  
  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
  // Gentle touch pops, aggressive touch survives (counterintuitive but interesting)
  return speed < 3 && speed > 0.5;
}
