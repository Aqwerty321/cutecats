/**
 * Living World State — The Simulation Core
 * 
 * Everything exists. Everything remembers.
 * The world continues without observation.
 */

import { 
  CatAgent, 
  createCatAgent, 
  updateCatInternalState, 
  updateCatPosture, 
  updateCatMovement,
  decideCatBehavior,
  catReactToInteraction,
} from './cat-agent';
import { 
  WorldObject, 
  createWorldObject, 
  updateWorldObject,
  objectReactToCat,
} from './world-objects';
import { 
  updateBody, 
  distance, 
  randomRange,
  Vector2,
  clamp,
} from './physics';

export interface MicroInteraction {
  id: string;
  type: string;
  timestamp: number;
  hasOccurred: boolean;
  canRepeat: boolean;
}

export interface WorldMemory {
  totalVisits: number;
  totalTimeSpent: number;
  lastVisit: number;
  objectPositions: Record<string, Vector2>;
  catFavoriteSpots: Record<string, Vector2>;
  discoveredInteractions: string[];
  rareEventOccurred: boolean;
}

export interface LivingWorldState {
  cats: CatAgent[];
  objects: WorldObject[];
  
  // Environment
  ambientGlow: number;
  motionDensity: number;
  timeOfDay: number; // 0-1 cycle
  
  // Cursor tracking
  cursorPosition: Vector2 | null;
  cursorVelocity: Vector2;
  cursorIdleTime: number;
  
  // Memory
  memory: WorldMemory;
  microInteractions: MicroInteraction[];
  
  // Timing
  lastUpdate: number;
  isTabActive: boolean;
  sessionStartTime: number;
}

const CAT_CONFIGS = [
  { id: 'mochi', name: 'Mochi', variant: 'cream' as const },
  { id: 'lavender', name: 'Lavender', variant: 'lilac' as const },
  { id: 'sage', name: 'Sage', variant: 'mint' as const },
  { id: 'blossom', name: 'Blossom', variant: 'peach' as const },
];

const MICRO_INTERACTIONS: Array<{ id: string; type: string; canRepeat: boolean }> = [
  { id: 'cursor-bat', type: 'Cat bats cursor once', canRepeat: false },
  { id: 'object-offscreen', type: 'Cat knocks object off-screen', canRepeat: true },
  { id: 'yarn-chase-collision', type: 'Two cats chase yarn, collide', canRepeat: true },
  { id: 'yarn-guard', type: 'Cat steals and guards yarn', canRepeat: true },
  { id: 'glass-fog', type: 'Cat sits on glass, fogs it', canRepeat: true },
  { id: 'nap-block', type: 'Cat naps, blocks interaction', canRepeat: true },
  { id: 'sudden-wake', type: 'Cat wakes from sudden change', canRepeat: true },
  { id: 'cursor-speed-react', type: 'Cat reacts to cursor speed', canRepeat: true },
  { id: 'mid-play-abandon', type: 'Cat loses interest mid-play', canRepeat: true },
  { id: 'stack-collapse', type: 'Object stack collapses', canRepeat: true },
  { id: 'gentle-pop', type: 'Bubble pops from gentle touch', canRepeat: true },
  { id: 'aggressive-survive', type: 'Bubble survives aggression', canRepeat: true },
  { id: 'orb-follow', type: 'Light orb follows cat', canRepeat: true },
  { id: 'orb-avoid', type: 'Light orb avoids cat', canRepeat: true },
  { id: 'watch-not-join', type: 'Cat watches play, doesnt join', canRepeat: true },
  { id: 'interrupt-nap', type: 'Cat interrupts another nap', canRepeat: true },
  { id: 'mirror-movement', type: 'Cat mirrors another cat', canRepeat: true },
  { id: 'stare-nothing', type: 'Cat stares at nothing', canRepeat: true },
  { id: 'drop-vibrate', type: 'Object vibrates after drop', canRepeat: true },
  { id: 'yarn-tighten', type: 'Yarn tightens itself', canRepeat: true },
  { id: 'cluster-disperse', type: 'Cats cluster then disperse', canRepeat: true },
  { id: 'nudge-away', type: 'Cat nudges another away', canRepeat: true },
  { id: 'refuse-attention', type: 'Cat refuses more attention', canRepeat: true },
  { id: 'approach-ignored', type: 'Cat approaches when ignored', canRepeat: true },
  { id: 'near-not-interact', type: 'Cat sits near cursor silently', canRepeat: true },
  { id: 'silent-leave', type: 'Cat leaves room silently', canRepeat: true },
  { id: 'unexpected-return', type: 'Cat returns unexpectedly', canRepeat: true },
  { id: 'glow-shift', type: 'Glow shifts with motion', canRepeat: true },
  { id: 'drift-untouched', type: 'Objects drift when untouched', canRepeat: true },
  { id: 'rare-unique', type: 'Rare one-time behavior', canRepeat: false },
];

export function createLivingWorld(savedMemory?: WorldMemory): LivingWorldState {
  const now = Date.now();
  
  // Restore or create memory
  const memory: WorldMemory = savedMemory || {
    totalVisits: 0,
    totalTimeSpent: 0,
    lastVisit: 0,
    objectPositions: {},
    catFavoriteSpots: {},
    discoveredInteractions: [],
    rareEventOccurred: false,
  };
  
  memory.totalVisits++;
  memory.lastVisit = now;
  
  // Create cats at remembered or random positions
  const cats = CAT_CONFIGS.map((config, i) => {
    const savedSpot = memory.catFavoriteSpots[config.id];
    const x = savedSpot?.x ?? randomRange(15 + i * 20, 25 + i * 20);
    const y = savedSpot?.y ?? randomRange(65, 80);
    return createCatAgent(config.id, config.name, config.variant, x, y);
  });
  
  // Create initial objects
  const objects: WorldObject[] = [];
  
  // Yarn balls
  for (let i = 0; i < 3; i++) {
    const saved = memory.objectPositions[`yarn-${i}`];
    objects.push(createWorldObject(
      `yarn-${i}`,
      'yarn',
      saved?.x ?? randomRange(20, 80),
      saved?.y ?? randomRange(50, 75)
    ));
  }
  
  // Glass pebbles
  for (let i = 0; i < 8; i++) {
    const saved = memory.objectPositions[`pebble-${i}`];
    objects.push(createWorldObject(
      `pebble-${i}`,
      'pebble',
      saved?.x ?? randomRange(10, 90),
      saved?.y ?? randomRange(70, 85)
    ));
  }
  
  // Cushions
  for (let i = 0; i < 2; i++) {
    const saved = memory.objectPositions[`cushion-${i}`];
    objects.push(createWorldObject(
      `cushion-${i}`,
      'cushion',
      saved?.x ?? randomRange(20, 80),
      saved?.y ?? 82
    ));
  }
  
  // Light orbs
  for (let i = 0; i < 3; i++) {
    objects.push(createWorldObject(
      `orb-${i}`,
      'orb',
      randomRange(15, 85),
      randomRange(20, 60)
    ));
  }
  
  // Paper scraps
  for (let i = 0; i < 4; i++) {
    objects.push(createWorldObject(
      `paper-${i}`,
      'paper',
      randomRange(10, 90),
      randomRange(60, 85)
    ));
  }
  
  // Floating motes
  for (let i = 0; i < 12; i++) {
    objects.push(createWorldObject(
      `mote-${i}`,
      'mote',
      randomRange(5, 95),
      randomRange(10, 80)
    ));
  }
  
  // Initial bubbles
  for (let i = 0; i < 5; i++) {
    objects.push(createWorldObject(
      `bubble-${i}`,
      'bubble',
      randomRange(10, 90),
      randomRange(40, 70)
    ));
  }
  
  return {
    cats,
    objects,
    ambientGlow: 0.5,
    motionDensity: 0,
    timeOfDay: (now % 86400000) / 86400000, // real time of day
    cursorPosition: null,
    cursorVelocity: { x: 0, y: 0 },
    cursorIdleTime: 0,
    memory,
    microInteractions: MICRO_INTERACTIONS.map(m => ({
      ...m,
      timestamp: 0,
      hasOccurred: memory.discoveredInteractions.includes(m.id),
    })),
    lastUpdate: now,
    isTabActive: true,
    sessionStartTime: now,
  };
}

export function updateLivingWorld(state: LivingWorldState, deltaTime: number): LivingWorldState {
  const now = Date.now();
  const dt = Math.min(deltaTime, 100); // cap delta for stability
  
  // Update time of day
  state.timeOfDay = (now % 86400000) / 86400000;
  
  // Track motion density
  let totalMotion = 0;
  
  // Update all cats
  for (const cat of state.cats) {
    updateCatInternalState(cat, dt);
    
    // Prepare nearby info for behavior decision
    const nearbyObjects = state.objects
      .filter(o => distance(cat.position, o.body.position) < 30)
      .map(o => ({ id: o.body.id, position: o.body.position, type: o.type }));
    
    const nearbyCats = state.cats.filter(c => 
      c.id !== cat.id && distance(cat.position, c.position) < 40
    );
    
    decideCatBehavior(cat, nearbyObjects, nearbyCats);
    updateCatMovement(cat, dt);
    updateCatPosture(cat);
    
    totalMotion += Math.abs(cat.velocity.x) + Math.abs(cat.velocity.y);
    
    // Cat-object interactions
    if (cat.currentBehavior === 'playing' && cat.focusTarget) {
      const targetObj = state.objects.find(o => o.body.id === cat.focusTarget);
      if (targetObj && distance(cat.position, targetObj.body.position) < 8) {
        // Chance to bat the object
        if (Math.random() < 0.02) {
          objectReactToCat(targetObj, cat.id, 'bat');
          triggerInteraction(state, 'mid-play-abandon', 0.3);
        }
      }
    }
    
    // Random object bumping while walking
    if (cat.currentBehavior === 'wandering') {
      for (const obj of state.objects) {
        if (distance(cat.position, obj.body.position) < 6 && Math.random() < 0.01) {
          objectReactToCat(obj, cat.id, 'nudge');
        }
      }
    }
    
    // Staring at nothing
    if (cat.currentBehavior === 'staring' && !cat.focusTarget) {
      triggerInteraction(state, 'stare-nothing', 1);
    }
  }
  
  // Cat-cat interactions
  for (let i = 0; i < state.cats.length; i++) {
    for (let j = i + 1; j < state.cats.length; j++) {
      const cat1 = state.cats[i];
      const cat2 = state.cats[j];
      const dist = distance(cat1.position, cat2.position);
      
      // Mirror behavior
      if (dist < 20 && cat1.currentBehavior === cat2.currentBehavior) {
        triggerInteraction(state, 'mirror-movement', 0.01);
      }
      
      // Interrupt nap
      if (cat1.currentBehavior === 'sleeping' && cat2.currentBehavior === 'wandering' && dist < 10) {
        if (Math.random() < 0.005) {
          cat1.currentBehavior = 'idle';
          cat1.internal.irritation += 0.2;
          triggerInteraction(state, 'interrupt-nap', 1);
        }
      }
    }
  }
  
  // Update all objects
  state.objects = state.objects.filter(obj => {
    updateBody(obj.body, dt / 16);
    const keep = updateWorldObject(obj, dt);
    
    if (keep) {
      totalMotion += Math.abs(obj.body.velocity.x) + Math.abs(obj.body.velocity.y);
    }
    
    return keep;
  });
  
  // Spawn new bubbles occasionally
  if (Math.random() < 0.001 && state.objects.filter(o => o.type === 'bubble').length < 8) {
    state.objects.push(createWorldObject(
      `bubble-${Date.now()}`,
      'bubble',
      randomRange(10, 90),
      randomRange(75, 85)
    ));
  }
  
  // Respawn motes that drifted off
  const moteCount = state.objects.filter(o => o.type === 'mote').length;
  if (moteCount < 8) {
    state.objects.push(createWorldObject(
      `mote-${Date.now()}`,
      'mote',
      randomRange(5, 95),
      randomRange(5, 30)
    ));
  }
  
  // Object drift when untouched
  const untouchedThreshold = 30000;
  for (const obj of state.objects) {
    if (now - obj.lastTouchedTime > untouchedThreshold && obj.type !== 'cushion') {
      if (Math.random() < 0.0005) {
        obj.body.velocity.x += (Math.random() - 0.5) * 0.5;
        triggerInteraction(state, 'drift-untouched', 1);
      }
    }
  }
  
  // Update ambient glow based on motion
  state.motionDensity = totalMotion;
  state.ambientGlow = clamp(0.3 + state.motionDensity * 0.01, 0.3, 0.8);
  
  // Cursor idle tracking
  if (state.cursorPosition) {
    const cursorSpeed = Math.sqrt(
      state.cursorVelocity.x ** 2 + state.cursorVelocity.y ** 2
    );
    if (cursorSpeed < 0.5) {
      state.cursorIdleTime += dt;
    } else {
      state.cursorIdleTime = 0;
    }
    
    // Cat approaches when cursor is still
    if (state.cursorIdleTime > 5000) {
      for (const cat of state.cats) {
        if (!cat.memory.hasBeenOverstimulated && cat.internal.curiosity > 0.6) {
          if (Math.random() < 0.001) {
            cat.targetPosition = {
              x: state.cursorPosition.x + (Math.random() - 0.5) * 20,
              y: Math.min(state.cursorPosition.y, 80),
            };
            cat.currentBehavior = 'approaching';
            triggerInteraction(state, 'approach-ignored', 1);
          }
        }
      }
    }
  }
  
  // Update session time in memory
  state.memory.totalTimeSpent += dt;
  state.lastUpdate = now;
  
  return state;
}

function triggerInteraction(state: LivingWorldState, id: string, probability: number): void {
  if (Math.random() > probability) return;
  
  const interaction = state.microInteractions.find(m => m.id === id);
  if (!interaction) return;
  if (interaction.hasOccurred && !interaction.canRepeat) return;
  
  interaction.hasOccurred = true;
  interaction.timestamp = Date.now();
  
  if (!state.memory.discoveredInteractions.includes(id)) {
    state.memory.discoveredInteractions.push(id);
  }
}

export function saveWorldMemory(state: LivingWorldState): void {
  const memory = { ...state.memory };
  
  // Save object positions
  for (const obj of state.objects) {
    if (obj.type !== 'bubble' && obj.type !== 'mote') {
      memory.objectPositions[obj.body.id] = { ...obj.body.position };
    }
  }
  
  // Save cat favorite spots
  for (const cat of state.cats) {
    if (cat.internal.comfort > 0.7) {
      memory.catFavoriteSpots[cat.id] = { ...cat.position };
    }
  }
  
  // Persist to localStorage
  try {
    localStorage.setItem('purr-prism-world-memory', JSON.stringify(memory));
  } catch {
    // localStorage might not be available
  }
}

export function loadWorldMemory(): WorldMemory | undefined {
  try {
    const saved = localStorage.getItem('purr-prism-world-memory');
    if (saved) {
      return JSON.parse(saved) as WorldMemory;
    }
  } catch {
    // localStorage might not be available
  }
  return undefined;
}

export function handleCursorMove(
  state: LivingWorldState, 
  x: number, 
  y: number
): LivingWorldState {
  const prevPos = state.cursorPosition;
  const newState = { ...state };
  newState.cursorPosition = { x, y };
  
  if (prevPos) {
    newState.cursorVelocity = {
      x: x - prevPos.x,
      y: y - prevPos.y,
    };
  }
  
  // Cats react to fast cursor
  const cursorSpeed = Math.sqrt(
    newState.cursorVelocity.x ** 2 + newState.cursorVelocity.y ** 2
  );
  
  if (cursorSpeed > 15) {
    for (const cat of newState.cats) {
      const distToCursor = distance(cat.position, newState.cursorPosition);
      if (distToCursor < 25 && cat.personality.skittishness > 0.4) {
        cat.internal.irritation += 0.05;
        if (Math.random() < 0.1) {
          cat.currentBehavior = 'fleeing';
          cat.targetPosition = {
            x: cat.position.x + (cat.position.x > 50 ? 20 : -20),
            y: cat.position.y,
          };
        }
        triggerInteraction(newState, 'cursor-speed-react', 1);
      }
    }
  }
  
  return newState;
}

export function handleCursorInteraction(
  state: LivingWorldState,
  x: number,
  y: number
): LivingWorldState {
  const newState = { ...state };
  const clickPos = { x, y };
  
  // Check for cat interaction
  for (const cat of newState.cats) {
    const distToCat = distance(cat.position, clickPos);
    if (distToCat < 10) {
      catReactToInteraction(cat, 'cursor', 0.5);
      
      if (cat.memory.hasBeenOverstimulated) {
        triggerInteraction(newState, 'refuse-attention', 1);
      }
      return newState;
    }
  }
  
  // Check for object interaction
  for (const obj of newState.objects) {
    const distToObj = distance(obj.body.position, clickPos);
    if (distToObj < 10) {
      obj.body.velocity.x += (Math.random() - 0.5) * 3;
      obj.body.velocity.y -= Math.random() * 2;
      obj.lastTouchedTime = Date.now();
      return newState;
    }
  }
  
  return newState;
}
