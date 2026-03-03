export type PlayToyType = 'yarn' | 'ball' | 'bubble' | 'card';

export interface PlayToy {
  id: string;
  x: number;
  y: number;
  type: 'yarn' | 'ball';
  color: 'lilac' | 'peach' | 'mint';
  size: number;
}

export interface ToyRuntimeState {
  energy: number;
  comboWindowUntil: number;
  cooldownUntil: number;
  ownerCatId: string | null;
  lastImpulse: number;
  activeUntil: number;
  lastInteractionAt: number;
}

export interface EffectPoint {
  id: number;
  x: number;
  y: number;
  kind: 'sparkle' | 'heart';
  expiresAt: number;
}

export interface PlayToast {
  id: number;
  message: string;
  tone: 'info' | 'combo' | 'event';
  expiresAt: number;
}

export interface BubbleObjectInput {
  id: string;
  x: number;
  y: number;
  type: 'bubble';
}

export interface PlayInteractionEvent {
  id: string;
  type: PlayToyType;
  source: 'click' | 'toss' | 'bubble-pop' | 'card-tease' | 'ball-bat' | 'drag-near';
  x: number;
  y: number;
  intensity: number;
  now: number;
  velocity?: { x: number; y: number };
  ownerCatId?: string | null;
}

export interface PlayroomMetrics {
  yarnChases: number;
  ballBats: number;
  bubblePops: number;
  cardTeases: number;
  bestCombo: number;
  totalCombos: number;
  lastEventLabel: string;
}

export interface PlayroomReducerState {
  version: number;
  nextId: number;
  draggablePositions: Record<string, { x: number; y: number }>;
  runtime: Record<string, ToyRuntimeState>;
  bubbles: BubbleObjectInput[];
  sparkles: EffectPoint[];
  hearts: EffectPoint[];
  toasts: PlayToast[];
  comboMultiplier: number;
  comboWindowUntil: number;
  activeToyId: string | null;
  activeToyStatus: string;
  recentEvents: PlayInteractionEvent[];
  metrics: PlayroomMetrics;
}

export interface PersistedPlayroomState {
  version: number;
  draggablePositions: Record<string, { x: number; y: number }>;
  runtime: Record<string, ToyRuntimeState>;
  comboMultiplier: number;
  comboWindowUntil: number;
  activeToyId: string | null;
  activeToyStatus: string;
  metrics: PlayroomMetrics;
}

export type PlayroomAction =
  | { type: 'SET_DRAG_POSITION'; id: string; x: number; y: number }
  | { type: 'SET_BUBBLES'; bubbles: BubbleObjectInput[] }
  | { type: 'INTERACT'; event: PlayInteractionEvent }
  | { type: 'PET_FEEDBACK'; x: number; y: number; now: number }
  | { type: 'EXPIRE'; now: number }
  | { type: 'HYDRATE'; snapshot: PersistedPlayroomState };
