/**
 * World State Types
 * 
 * The sanctuary is a living world with memory.
 * It tracks where you've been, what you've touched,
 * and how long you've stayed.
 */

export type RoomId = 'sanctuary' | 'playroom' | 'gallery' | 'dream';

export type CatMood = 'calm' | 'playful' | 'sleepy' | 'curious' | 'affectionate';

export interface CatState {
  id: string;
  name: string;
  variant: 'cream' | 'peach' | 'lilac' | 'mint';
  mood: CatMood;
  currentRoom: RoomId;
  position: { x: number; y: number };
  petCount: number;
  lastInteraction: number;
  isWandering: boolean;
  favoriteSpot: { room: RoomId; x: number; y: number };
}

export interface DiscoveryState {
  /** Rooms the user has visited */
  visitedRooms: Set<RoomId>;
  /** Total objects dragged */
  dragCount: number;
  /** Total pets given */
  petCount: number;
  /** Times a cat was followed to another room */
  followedCatCount: number;
  /** Secrets found */
  secretsFound: Set<string>;
  /** Has stayed idle long enough to trigger dream */
  deepIdleReached: boolean;
  /** Objects that have been discovered through interaction */
  discoveredObjects: Set<string>;
}

export interface TemporalState {
  /** Session start time */
  sessionStart: number;
  /** Total time in current session (ms) */
  sessionDuration: number;
  /** Time since last interaction (ms) */
  idleTime: number;
  /** Is user currently idle */
  isIdle: boolean;
  /** Is user in deep idle (2+ min no interaction) */
  isDeepIdle: boolean;
  /** Previous session data (from localStorage) */
  previousVisits: number;
  /** Last visit timestamp */
  lastVisit: number | null;
}

export interface WorldState {
  /** Current room */
  currentRoom: RoomId;
  /** Previous room (for transitions) */
  previousRoom: RoomId | null;
  /** Is transitioning between rooms */
  isTransitioning: boolean;
  /** All cats in the world */
  cats: CatState[];
  /** Discovery progress */
  discovery: DiscoveryState;
  /** Time-based state */
  temporal: TemporalState;
  /** World mood influenced by cat interactions */
  worldMood: CatMood;
  /** Color temperature shift (0-1, affects palette) */
  colorTemperature: number;
  /** Ambient motion speed multiplier */
  motionSpeed: number;
}

export type WorldAction =
  | { type: 'NAVIGATE_TO'; room: RoomId }
  | { type: 'TRANSITION_COMPLETE' }
  | { type: 'PET_CAT'; catId: string }
  | { type: 'CAT_WANDER'; catId: string; toRoom: RoomId; position: { x: number; y: number } }
  | { type: 'CAT_MOOD_CHANGE'; catId: string; mood: CatMood }
  | { type: 'FOLLOW_CAT'; catId: string }
  | { type: 'DRAG_OBJECT'; objectId: string }
  | { type: 'DISCOVER_SECRET'; secretId: string }
  | { type: 'DISCOVER_OBJECT'; objectId: string }
  | { type: 'UPDATE_IDLE'; idleTime: number }
  | { type: 'SET_DEEP_IDLE'; isDeep: boolean }
  | { type: 'UPDATE_SESSION'; duration: number }
  | { type: 'SET_WORLD_MOOD'; mood: CatMood }
  | { type: 'TICK' };

/** Initial cats that inhabit the sanctuary */
export const INITIAL_CATS: CatState[] = [
  {
    id: 'mochi',
    name: 'Mochi',
    variant: 'cream',
    mood: 'calm',
    currentRoom: 'sanctuary',
    position: { x: 30, y: 60 },
    petCount: 0,
    lastInteraction: Date.now(),
    isWandering: false,
    favoriteSpot: { room: 'sanctuary', x: 30, y: 60 },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    variant: 'lilac',
    mood: 'curious',
    currentRoom: 'sanctuary',
    position: { x: 50, y: 55 },
    petCount: 0,
    lastInteraction: Date.now(),
    isWandering: false,
    favoriteSpot: { room: 'gallery', x: 50, y: 40 },
  },
  {
    id: 'sage',
    name: 'Sage',
    variant: 'mint',
    mood: 'playful',
    currentRoom: 'sanctuary',
    position: { x: 70, y: 65 },
    petCount: 0,
    lastInteraction: Date.now(),
    isWandering: false,
    favoriteSpot: { room: 'playroom', x: 70, y: 60 },
  },
  {
    id: 'blossom',
    name: 'Blossom',
    variant: 'peach',
    mood: 'sleepy',
    currentRoom: 'sanctuary',
    position: { x: 40, y: 70 },
    petCount: 0,
    lastInteraction: Date.now(),
    isWandering: false,
    favoriteSpot: { room: 'dream', x: 50, y: 50 },
  },
  {
    id: 'pebble',
    name: 'Pebble',
    variant: 'cream',
    mood: 'playful',
    currentRoom: 'sanctuary',
    position: { x: 60, y: 58 },
    petCount: 0,
    lastInteraction: Date.now(),
    isWandering: false,
    favoriteSpot: { room: 'playroom', x: 40, y: 55 },
  },
  {
    id: 'cloud',
    name: 'Cloud',
    variant: 'lilac',
    mood: 'sleepy',
    currentRoom: 'sanctuary',
    position: { x: 25, y: 72 },
    petCount: 0,
    lastInteraction: Date.now(),
    isWandering: false,
    favoriteSpot: { room: 'sanctuary', x: 25, y: 72 },
  },
  {
    id: 'honey',
    name: 'Honey',
    variant: 'peach',
    mood: 'affectionate',
    currentRoom: 'playroom',
    position: { x: 55, y: 50 },
    petCount: 0,
    lastInteraction: Date.now(),
    isWandering: false,
    favoriteSpot: { room: 'playroom', x: 55, y: 50 },
  },
  {
    id: 'fern',
    name: 'Fern',
    variant: 'mint',
    mood: 'curious',
    currentRoom: 'playroom',
    position: { x: 35, y: 65 },
    petCount: 0,
    lastInteraction: Date.now(),
    isWandering: false,
    favoriteSpot: { room: 'gallery', x: 60, y: 45 },
  },
];

export function createInitialState(): WorldState {
  return {
    currentRoom: 'sanctuary',
    previousRoom: null,
    isTransitioning: false,
    cats: INITIAL_CATS,
    discovery: {
      visitedRooms: new Set(['sanctuary']),
      dragCount: 0,
      petCount: 0,
      followedCatCount: 0,
      secretsFound: new Set(),
      deepIdleReached: false,
      discoveredObjects: new Set(),
    },
    temporal: {
      sessionStart: Date.now(),
      sessionDuration: 0,
      idleTime: 0,
      isIdle: false,
      isDeepIdle: false,
      previousVisits: 0,
      lastVisit: null,
    },
    worldMood: 'calm',
    colorTemperature: 0.5,
    motionSpeed: 1,
  };
}
