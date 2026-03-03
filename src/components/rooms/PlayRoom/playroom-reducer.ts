import type {
  PersistedPlayroomState,
  PlayInteractionEvent,
  PlayroomAction,
  PlayroomReducerState,
  ToyRuntimeState,
} from './types';

export const PLAYROOM_STORAGE_VERSION = 1;

const SPARKLE_MS = 900;
const HEART_MS = 1300;
const TOAST_MS = 1900;
const COMBO_WINDOW_MS = 1900;

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function makeRuntime(now: number): ToyRuntimeState {
  return {
    energy: 35,
    comboWindowUntil: 0,
    cooldownUntil: 0,
    ownerCatId: null,
    lastImpulse: 0,
    activeUntil: 0,
    lastInteractionAt: now,
  };
}

export function createPlayroomInitialState(): PlayroomReducerState {
  return {
    version: PLAYROOM_STORAGE_VERSION,
    nextId: 1,
    draggablePositions: {},
    runtime: {},
    bubbles: [],
    sparkles: [],
    hearts: [],
    toasts: [],
    comboMultiplier: 1,
    comboWindowUntil: 0,
    activeToyId: null,
    activeToyStatus: 'Idle',
    recentEvents: [],
    metrics: {
      yarnChases: 0,
      ballBats: 0,
      bubblePops: 0,
      cardTeases: 0,
      bestCombo: 1,
      totalCombos: 0,
      lastEventLabel: 'Waiting for play',
    },
  };
}

function addSparkle(state: PlayroomReducerState, x: number, y: number, now: number): PlayroomReducerState {
  return {
    ...state,
    nextId: state.nextId + 1,
    sparkles: [
      ...state.sparkles,
      {
        id: state.nextId,
        x,
        y,
        kind: 'sparkle',
        expiresAt: now + SPARKLE_MS,
      },
    ],
  };
}

function addHeart(state: PlayroomReducerState, x: number, y: number, now: number): PlayroomReducerState {
  return {
    ...state,
    nextId: state.nextId + 1,
    hearts: [
      ...state.hearts,
      {
        id: state.nextId,
        x,
        y,
        kind: 'heart',
        expiresAt: now + HEART_MS,
      },
    ],
  };
}

function addToast(
  state: PlayroomReducerState,
  message: string,
  tone: 'info' | 'combo' | 'event',
  now: number
): PlayroomReducerState {
  return {
    ...state,
    nextId: state.nextId + 1,
    toasts: [
      ...state.toasts,
      {
        id: state.nextId,
        message,
        tone,
        expiresAt: now + TOAST_MS,
      },
    ],
  };
}

function eventImpulse(event: PlayInteractionEvent): number {
  if (!event.velocity) {
    return event.intensity;
  }
  const speed = Math.hypot(event.velocity.x, event.velocity.y);
  return clamp(speed / 22 + event.intensity, 0.1, 4);
}

function touchRuntime(
  state: PlayroomReducerState,
  event: PlayInteractionEvent
): { runtime: PlayroomReducerState['runtime']; entry: ToyRuntimeState } {
  const existing = state.runtime[event.id] ?? makeRuntime(event.now);
  const impulse = eventImpulse(event);
  const next: ToyRuntimeState = {
    ...existing,
    energy: clamp(existing.energy + event.intensity * 26, 0, 100),
    comboWindowUntil: Math.max(existing.comboWindowUntil, event.now + 1300),
    cooldownUntil: event.now + 450,
    ownerCatId: event.ownerCatId ?? existing.ownerCatId,
    lastImpulse: impulse,
    activeUntil: event.now + 2100 + event.intensity * 1100,
    lastInteractionAt: event.now,
  };

  return {
    runtime: {
      ...state.runtime,
      [event.id]: next,
    },
    entry: next,
  };
}

function applyCombo(state: PlayroomReducerState, event: PlayInteractionEvent): PlayroomReducerState {
  let nextState = state;

  if (event.type === 'bubble' && event.source === 'bubble-pop') {
    const continuing = event.now <= state.comboWindowUntil;
    const multiplier = continuing ? state.comboMultiplier + 1 : 1;

    nextState = {
      ...nextState,
      comboMultiplier: multiplier,
      comboWindowUntil: event.now + COMBO_WINDOW_MS,
      metrics: {
        ...nextState.metrics,
        bubblePops: nextState.metrics.bubblePops + 1,
        bestCombo: Math.max(nextState.metrics.bestCombo, multiplier),
        totalCombos: multiplier > 1 ? nextState.metrics.totalCombos + 1 : nextState.metrics.totalCombos,
      },
    };

    const comboLabel = multiplier > 1 ? `Combo x${multiplier}!` : 'Bubble chain started';
    nextState = addToast(nextState, comboLabel, multiplier > 1 ? 'combo' : 'info', event.now);
    return nextState;
  }

  if (state.comboWindowUntil < event.now && state.comboMultiplier !== 1) {
    nextState = {
      ...nextState,
      comboMultiplier: 1,
      comboWindowUntil: 0,
    };
  }

  return nextState;
}

function labelForEvent(event: PlayInteractionEvent): string {
  if (event.type === 'yarn') {
    return 'Yarn chase active';
  }
  if (event.type === 'ball') {
    return event.source === 'ball-bat' ? 'Ball batted by cat' : 'Ball toss active';
  }
  if (event.type === 'bubble') {
    return 'Bubble popped';
  }
  return 'Card tease active';
}

export function playroomReducer(state: PlayroomReducerState, action: PlayroomAction): PlayroomReducerState {
  switch (action.type) {
    case 'HYDRATE': {
      if (action.snapshot.version !== PLAYROOM_STORAGE_VERSION) {
        return state;
      }

      return {
        ...state,
        version: action.snapshot.version,
        draggablePositions: action.snapshot.draggablePositions,
        runtime: action.snapshot.runtime,
        comboMultiplier: action.snapshot.comboMultiplier,
        comboWindowUntil: action.snapshot.comboWindowUntil,
        activeToyId: action.snapshot.activeToyId,
        activeToyStatus: action.snapshot.activeToyStatus,
        metrics: action.snapshot.metrics,
      };
    }
    case 'SET_DRAG_POSITION': {
      return {
        ...state,
        draggablePositions: {
          ...state.draggablePositions,
          [action.id]: { x: action.x, y: action.y },
        },
      };
    }
    case 'SET_BUBBLES': {
      return {
        ...state,
        bubbles: action.bubbles,
      };
    }
    case 'PET_FEEDBACK': {
      let next = addHeart(state, action.x, action.y, action.now);
      next = addSparkle(next, action.x + 3.5, action.y - 7.5, action.now);
      return next;
    }
    case 'INTERACT': {
      const { event } = action;
      const touched = touchRuntime(state, event);

      let next: PlayroomReducerState = {
        ...state,
        runtime: touched.runtime,
        activeToyId: event.id,
        activeToyStatus: labelForEvent(event),
        recentEvents: [event, ...state.recentEvents].slice(0, 18),
        metrics: {
          ...state.metrics,
          lastEventLabel: labelForEvent(event),
          yarnChases:
            event.type === 'yarn' && (event.source === 'toss' || event.source === 'click')
              ? state.metrics.yarnChases + 1
              : state.metrics.yarnChases,
          ballBats:
            event.type === 'ball' && (event.source === 'ball-bat' || event.source === 'toss')
              ? state.metrics.ballBats + 1
              : state.metrics.ballBats,
          cardTeases:
            event.type === 'card' && (event.source === 'card-tease' || event.source === 'drag-near')
              ? state.metrics.cardTeases + 1
              : state.metrics.cardTeases,
        },
      };

      next = addSparkle(next, event.x, event.y, event.now);
      if (event.type === 'card') {
        next = addHeart(next, event.x + 1.5, event.y - 2.5, event.now);
      }

      next = applyCombo(next, event);

      if (event.type !== 'bubble') {
        next = addToast(next, labelForEvent(event), 'event', event.now);
      }

      return next;
    }
    case 'EXPIRE': {
      const stillActive = state.activeToyId
        ? state.runtime[state.activeToyId]?.activeUntil
        : 0;

      return {
        ...state,
        sparkles: state.sparkles.filter((sparkle) => sparkle.expiresAt > action.now),
        hearts: state.hearts.filter((heart) => heart.expiresAt > action.now),
        toasts: state.toasts.filter((toast) => toast.expiresAt > action.now),
        comboMultiplier: state.comboWindowUntil > action.now ? state.comboMultiplier : 1,
        comboWindowUntil: state.comboWindowUntil > action.now ? state.comboWindowUntil : 0,
        activeToyStatus:
          stillActive && stillActive > action.now
            ? state.activeToyStatus
            : 'Idle',
      };
    }
    default:
      return state;
  }
}

export function toPersistedPlayroomState(state: PlayroomReducerState): PersistedPlayroomState {
  return {
    version: state.version,
    draggablePositions: state.draggablePositions,
    runtime: state.runtime,
    comboMultiplier: state.comboMultiplier,
    comboWindowUntil: state.comboWindowUntil,
    activeToyId: state.activeToyId,
    activeToyStatus: state.activeToyStatus,
    metrics: state.metrics,
  };
}

export function isPersistedPlayroomState(value: unknown): value is PersistedPlayroomState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PersistedPlayroomState>;
  return (
    candidate.version === PLAYROOM_STORAGE_VERSION &&
    typeof candidate.draggablePositions === 'object' &&
    typeof candidate.runtime === 'object' &&
    typeof candidate.comboMultiplier === 'number' &&
    typeof candidate.comboWindowUntil === 'number' &&
    typeof candidate.activeToyStatus === 'string' &&
    typeof candidate.metrics === 'object'
  );
}
