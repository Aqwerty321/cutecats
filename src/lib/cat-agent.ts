/**
 * Cat Agent — Autonomous Living Creature
 * 
 * Internal states fluctuate naturally.
 * Behavior emerges from state, not scripts.
 */

import { Vector2, distance, randomRange, clamp, noise, lerp } from './physics';

export interface CatMemory {
  lastInteractionTime: number;
  interactionCount: number;
  lastInteractionType: 'pet' | 'cursor' | 'object' | 'cat' | null;
  hasBeenOverstimulated: boolean;
  favoriteSpot: Vector2 | null;
  dislikedAreas: Vector2[];
}

export interface CatInternalState {
  curiosity: number;        // 0-1: desire to investigate
  tolerance: number;        // 0-1: patience with interaction
  attentionSpan: number;    // 0-1: focus duration
  comfort: number;          // 0-1: ease with surroundings
  energy: number;           // 0-1: activity level
  boredom: number;          // 0-1: need for stimulation
  socialNeed: number;       // 0-1: desire for cat company
  irritation: number;       // 0-1: annoyance level
}

export interface CatPosture {
  earAngle: number;         // -30 to 30 degrees (pinned back to alert forward)
  tailHeight: number;       // 0-1 (down to up)
  tailSpeed: number;        // 0-1 (still to fast wag)
  blinkRate: number;        // 0-1 (slow content blinks to alert staring)
  pupilSize: number;        // 0-1 (narrow to wide)
  bodyPosture: 'standing' | 'sitting' | 'loaf' | 'lying' | 'crouching' | 'stretching';
  headTilt: number;         // -15 to 15 degrees
}

export type CatBehavior = 
  | 'idle'
  | 'wandering'
  | 'investigating'
  | 'playing'
  | 'stalking'
  | 'pouncing'
  | 'grooming'
  | 'sleeping'
  | 'stretching'
  | 'staring'
  | 'fleeing'
  | 'approaching'
  | 'ignoring'
  | 'guarding'
  | 'watching'
  | 'following'
  | 'avoiding';

export interface CatAgent {
  id: string;
  name: string;
  variant: 'cream' | 'peach' | 'lilac' | 'mint';
  
  // Physical state
  position: Vector2;
  velocity: Vector2;
  targetPosition: Vector2 | null;
  facing: 'left' | 'right';
  
  // Internal state
  internal: CatInternalState;
  posture: CatPosture;
  memory: CatMemory;
  
  // Behavior
  currentBehavior: CatBehavior;
  behaviorStartTime: number;
  behaviorDuration: number;
  focusTarget: string | null; // id of object or cat being focused on
  
  // Personality (fixed per cat)
  personality: {
    baseEnergy: number;
    baseCuriosity: number;
    baseTolerance: number;
    socialness: number;
    playfulness: number;
    skittishness: number;
  };
  
  // Timers
  lastBehaviorChange: number;
  lastStateUpdate: number;
  stareTimer: number;
  idleTimer: number;
}

export function createCatAgent(
  id: string,
  name: string,
  variant: 'cream' | 'peach' | 'lilac' | 'mint',
  startX: number,
  startY: number
): CatAgent {
  const personality = {
    baseEnergy: randomRange(0.3, 0.8),
    baseCuriosity: randomRange(0.4, 0.9),
    baseTolerance: randomRange(0.3, 0.7),
    socialness: randomRange(0.2, 0.8),
    playfulness: randomRange(0.3, 0.9),
    skittishness: randomRange(0.1, 0.6),
  };

  return {
    id,
    name,
    variant,
    position: { x: startX, y: startY },
    velocity: { x: 0, y: 0 },
    targetPosition: null,
    facing: Math.random() > 0.5 ? 'left' : 'right',
    
    internal: {
      curiosity: personality.baseCuriosity,
      tolerance: personality.baseTolerance,
      attentionSpan: randomRange(0.4, 0.8),
      comfort: randomRange(0.5, 0.8),
      energy: personality.baseEnergy,
      boredom: randomRange(0.2, 0.5),
      socialNeed: personality.socialness,
      irritation: 0,
    },
    
    posture: {
      earAngle: 0,
      tailHeight: 0.5,
      tailSpeed: 0.2,
      blinkRate: 0.3,
      pupilSize: 0.5,
      bodyPosture: 'sitting',
      headTilt: 0,
    },
    
    memory: {
      lastInteractionTime: 0,
      interactionCount: 0,
      lastInteractionType: null,
      hasBeenOverstimulated: false,
      favoriteSpot: null,
      dislikedAreas: [],
    },
    
    currentBehavior: 'idle',
    behaviorStartTime: Date.now(),
    behaviorDuration: randomRange(2000, 8000),
    focusTarget: null,
    
    personality,
    lastBehaviorChange: Date.now(),
    lastStateUpdate: Date.now(),
    stareTimer: 0,
    idleTimer: 0,
  };
}

export function updateCatInternalState(cat: CatAgent, deltaTime: number): void {
  const dt = deltaTime / 1000;
  const now = Date.now();
  const timeSinceInteraction = now - cat.memory.lastInteractionTime;
  
  // Natural state drift
  const driftSpeed = 0.02 * dt;
  
  // Energy fluctuates with time of day simulation
  const timeNoise = noise(now / 60000);
  cat.internal.energy = lerp(
    cat.internal.energy,
    clamp(cat.personality.baseEnergy + timeNoise * 0.3, 0.1, 1),
    driftSpeed
  );
  
  // Boredom increases when idle, decreases with activity
  if (cat.currentBehavior === 'idle' || cat.currentBehavior === 'sleeping') {
    cat.internal.boredom = clamp(cat.internal.boredom + 0.01 * dt, 0, 1);
  } else {
    cat.internal.boredom = clamp(cat.internal.boredom - 0.02 * dt, 0, 1);
  }
  
  // Curiosity regenerates over time
  cat.internal.curiosity = lerp(
    cat.internal.curiosity,
    cat.personality.baseCuriosity,
    driftSpeed * 0.5
  );
  
  // Tolerance regenerates when not being interacted with
  if (timeSinceInteraction > 5000) {
    cat.internal.tolerance = lerp(
      cat.internal.tolerance,
      cat.personality.baseTolerance,
      driftSpeed
    );
    cat.internal.irritation = lerp(cat.internal.irritation, 0, driftSpeed * 2);
  }
  
  // Comfort increases in familiar spots
  if (cat.memory.favoriteSpot) {
    const distToFavorite = distance(cat.position, cat.memory.favoriteSpot);
    if (distToFavorite < 10) {
      cat.internal.comfort = clamp(cat.internal.comfort + 0.01 * dt, 0, 1);
    }
  }
  
  // Social need fluctuates
  cat.internal.socialNeed = lerp(
    cat.internal.socialNeed,
    cat.personality.socialness + noise(now / 30000 + cat.id.charCodeAt(0)) * 0.2,
    driftSpeed * 0.3
  );
  
  // Overstimulation recovery
  if (cat.memory.hasBeenOverstimulated && timeSinceInteraction > 15000) {
    cat.memory.hasBeenOverstimulated = false;
  }
  
  cat.lastStateUpdate = now;
}

export function updateCatPosture(cat: CatAgent): void {
  // Ear angle based on alertness and irritation
  const alertness = 1 - cat.internal.comfort;
  cat.posture.earAngle = lerp(
    cat.posture.earAngle,
    -cat.internal.irritation * 30 + alertness * 15,
    0.1
  );
  
  // Tail reflects mood
  if (cat.internal.irritation > 0.5) {
    cat.posture.tailSpeed = lerp(cat.posture.tailSpeed, 0.8, 0.1);
    cat.posture.tailHeight = lerp(cat.posture.tailHeight, 0.3, 0.1);
  } else if (cat.currentBehavior === 'playing') {
    cat.posture.tailSpeed = lerp(cat.posture.tailSpeed, 0.6, 0.1);
    cat.posture.tailHeight = lerp(cat.posture.tailHeight, 0.8, 0.1);
  } else if (cat.currentBehavior === 'sleeping') {
    cat.posture.tailSpeed = lerp(cat.posture.tailSpeed, 0, 0.1);
    cat.posture.tailHeight = lerp(cat.posture.tailHeight, 0.2, 0.1);
  } else {
    cat.posture.tailSpeed = lerp(cat.posture.tailSpeed, 0.2, 0.05);
    cat.posture.tailHeight = lerp(cat.posture.tailHeight, 0.5, 0.05);
  }
  
  // Blink rate: slow when content, fast when alert
  cat.posture.blinkRate = lerp(
    cat.posture.blinkRate,
    cat.internal.comfort * 0.3 + (1 - cat.internal.comfort) * 0.8,
    0.1
  );
  
  // Pupil size: wide when curious/excited, narrow when sleepy/content
  cat.posture.pupilSize = lerp(
    cat.posture.pupilSize,
    cat.internal.curiosity * 0.4 + cat.internal.energy * 0.4 + 0.2,
    0.1
  );
  
  // Body posture based on behavior and energy
  if (cat.currentBehavior === 'sleeping') {
    cat.posture.bodyPosture = 'lying';
  } else if (cat.currentBehavior === 'grooming') {
    cat.posture.bodyPosture = 'sitting';
  } else if (cat.internal.energy < 0.3) {
    cat.posture.bodyPosture = Math.random() > 0.5 ? 'loaf' : 'lying';
  } else if (cat.currentBehavior === 'stalking' || cat.currentBehavior === 'pouncing') {
    cat.posture.bodyPosture = 'crouching';
  } else if (cat.currentBehavior === 'wandering' || cat.currentBehavior === 'fleeing') {
    cat.posture.bodyPosture = 'standing';
  }
  
  // Head tilt when curious
  if (cat.currentBehavior === 'investigating' || cat.currentBehavior === 'staring') {
    cat.posture.headTilt = lerp(cat.posture.headTilt, (Math.random() - 0.5) * 20, 0.05);
  } else {
    cat.posture.headTilt = lerp(cat.posture.headTilt, 0, 0.1);
  }
}

export function decideCatBehavior(
  cat: CatAgent,
  nearbyObjects: Array<{ id: string; position: Vector2; type: string }>,
  nearbyCats: CatAgent[],
  cursorPosition: Vector2 | null
): void {
  const now = Date.now();
  const behaviorAge = now - cat.behaviorStartTime;
  
  // Don't change behavior too frequently
  if (behaviorAge < cat.behaviorDuration) return;
  
  // Chance to just stop and stare at nothing
  if (Math.random() < 0.08) {
    setBehavior(cat, 'staring', randomRange(1000, 4000));
    cat.focusTarget = null;
    return;
  }
  
  // Overstimulated cats ignore everything
  if (cat.memory.hasBeenOverstimulated) {
    setBehavior(cat, 'ignoring', randomRange(3000, 8000));
    return;
  }
  
  // Low energy: sleep or groom
  if (cat.internal.energy < 0.25) {
    if (Math.random() < 0.7) {
      setBehavior(cat, 'sleeping', randomRange(8000, 20000));
    } else {
      setBehavior(cat, 'grooming', randomRange(3000, 8000));
    }
    return;
  }
  
  // High boredom + curiosity: investigate something
  if (cat.internal.boredom > 0.6 && cat.internal.curiosity > 0.4) {
    const target = nearbyObjects[Math.floor(Math.random() * nearbyObjects.length)];
    if (target) {
      cat.focusTarget = target.id;
      cat.targetPosition = { ...target.position };
      setBehavior(cat, 'investigating', randomRange(3000, 8000));
      return;
    }
  }
  
  // Social need: approach or watch other cats
  if (cat.internal.socialNeed > 0.6 && nearbyCats.length > 0) {
    const otherCat = nearbyCats[Math.floor(Math.random() * nearbyCats.length)];
    if (Math.random() < 0.5) {
      cat.focusTarget = otherCat.id;
      cat.targetPosition = { 
        x: otherCat.position.x + (Math.random() - 0.5) * 10,
        y: otherCat.position.y 
      };
      setBehavior(cat, 'approaching', randomRange(2000, 5000));
    } else {
      cat.focusTarget = otherCat.id;
      setBehavior(cat, 'watching', randomRange(3000, 7000));
    }
    return;
  }
  
  // Playfulness: play with objects
  if (cat.personality.playfulness > 0.5 && cat.internal.energy > 0.5) {
    const playableObjects = nearbyObjects.filter(o => 
      o.type === 'yarn' || o.type === 'bubble' || o.type === 'pebble'
    );
    if (playableObjects.length > 0 && Math.random() < 0.4) {
      const target = playableObjects[Math.floor(Math.random() * playableObjects.length)];
      cat.focusTarget = target.id;
      cat.targetPosition = { ...target.position };
      setBehavior(cat, 'playing', randomRange(2000, 6000));
      return;
    }
  }
  
  // Default behaviors
  const roll = Math.random();
  if (roll < 0.3) {
    // Wander to random spot
    cat.targetPosition = {
      x: randomRange(10, 90),
      y: randomRange(60, 85),
    };
    setBehavior(cat, 'wandering', randomRange(3000, 8000));
  } else if (roll < 0.5) {
    setBehavior(cat, 'grooming', randomRange(2000, 5000));
  } else if (roll < 0.65) {
    setBehavior(cat, 'stretching', randomRange(1500, 3000));
  } else {
    setBehavior(cat, 'idle', randomRange(2000, 6000));
  }
}

function setBehavior(cat: CatAgent, behavior: CatBehavior, duration: number): void {
  cat.currentBehavior = behavior;
  cat.behaviorStartTime = Date.now();
  cat.behaviorDuration = duration;
  cat.lastBehaviorChange = Date.now();
}

export function updateCatMovement(cat: CatAgent, deltaTime: number): void {
  const dt = deltaTime / 1000;
  const speed = cat.internal.energy * 15; // base speed modified by energy
  
  if (cat.currentBehavior === 'sleeping' || cat.currentBehavior === 'grooming') {
    cat.velocity.x = lerp(cat.velocity.x, 0, 0.2);
    cat.velocity.y = lerp(cat.velocity.y, 0, 0.2);
  } else if (cat.targetPosition) {
    const dx = cat.targetPosition.x - cat.position.x;
    const dy = cat.targetPosition.y - cat.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 2) {
      // Add organic wobble
      const wobble = noise(Date.now() / 500 + cat.id.charCodeAt(0)) * 2;
      
      cat.velocity.x = lerp(cat.velocity.x, (dx / dist) * speed + wobble, 0.1);
      cat.velocity.y = lerp(cat.velocity.y, (dy / dist) * speed * 0.3, 0.1);
      
      cat.facing = dx > 0 ? 'right' : 'left';
    } else {
      cat.targetPosition = null;
      cat.velocity.x = lerp(cat.velocity.x, 0, 0.2);
      cat.velocity.y = lerp(cat.velocity.y, 0, 0.2);
    }
  } else {
    cat.velocity.x = lerp(cat.velocity.x, 0, 0.1);
    cat.velocity.y = lerp(cat.velocity.y, 0, 0.1);
  }
  
  // Apply velocity with friction
  cat.position.x += cat.velocity.x * dt;
  cat.position.y += cat.velocity.y * dt;
  
  // Bounds
  cat.position.x = clamp(cat.position.x, 5, 95);
  cat.position.y = clamp(cat.position.y, 50, 88);
}

export function catReactToInteraction(
  cat: CatAgent,
  interactionType: 'pet' | 'cursor' | 'object' | 'poke',
  intensity: number
): void {
  const now = Date.now();
  
  cat.memory.lastInteractionTime = now;
  cat.memory.interactionCount++;
  cat.memory.lastInteractionType = interactionType === 'poke' ? 'cursor' : interactionType;
  
  // Tolerance decreases with each interaction
  cat.internal.tolerance -= intensity * 0.1;
  
  // Too many interactions = overstimulated
  if (cat.internal.tolerance < 0.2 || cat.memory.interactionCount > 10) {
    cat.memory.hasBeenOverstimulated = true;
    cat.internal.irritation = 0.8;
    setBehavior(cat, 'fleeing', 2000);
    cat.targetPosition = {
      x: cat.position.x + (Math.random() > 0.5 ? 30 : -30),
      y: randomRange(60, 85),
    };
    return;
  }
  
  // Reaction based on personality and current state
  if (interactionType === 'pet' && cat.internal.tolerance > 0.4) {
    cat.internal.comfort += 0.1;
    cat.internal.irritation = Math.max(0, cat.internal.irritation - 0.1);
  } else if (interactionType === 'poke' || intensity > 0.7) {
    cat.internal.irritation += 0.2;
    if (cat.personality.skittishness > 0.5) {
      setBehavior(cat, 'fleeing', 1500);
      cat.targetPosition = {
        x: cat.position.x + (Math.random() > 0.5 ? 20 : -20),
        y: cat.position.y,
      };
    }
  }
}

export function shouldCatApproachCursor(cat: CatAgent, cursorPosition: Vector2): boolean {
  // Only approach if curious, tolerant, and hasn't been bothered
  if (cat.memory.hasBeenOverstimulated) return false;
  if (cat.internal.tolerance < 0.4) return false;
  if (cat.internal.curiosity < 0.5) return false;
  
  // Only approach if cursor is still
  return Math.random() < 0.02 * cat.internal.curiosity;
}
