'use client';

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { InteractableObject } from '@/components/DetailedCat/types';
import { seededNumber } from '@/lib/deterministic';
import {
  createPlayroomInitialState,
  isPersistedPlayroomState,
  playroomReducer,
  PLAYROOM_STORAGE_VERSION,
  toPersistedPlayroomState,
} from './playroom-reducer';
import type { BubbleObjectInput, PlayInteractionEvent, PlayToy } from './types';

const STORAGE_KEY = 'purr-prism-playroom-v1';

const BASE_TOYS: PlayToy[] = [
  { id: 'yarn-1', x: 25, y: 45, type: 'yarn', color: 'lilac', size: 55 },
  { id: 'yarn-2', x: 75, y: 40, type: 'yarn', color: 'peach', size: 50 },
  { id: 'yarn-3', x: 55, y: 72, type: 'yarn', color: 'mint', size: 48 },
  { id: 'ball-1', x: 18, y: 65, type: 'ball', color: 'peach', size: 34 },
  { id: 'ball-2', x: 84, y: 56, type: 'ball', color: 'mint', size: 32 },
];

const BASE_CARDS = [
  { id: 'card-1', x: 18, y: 60 },
  { id: 'card-2', x: 82, y: 65 },
] as const;

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function initState() {
  const base = createPlayroomInitialState();
  if (typeof window === 'undefined') {
    return base;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return base;
    }
    const parsed = JSON.parse(raw);
    if (!isPersistedPlayroomState(parsed)) {
      return base;
    }

    return {
      ...base,
      version: PLAYROOM_STORAGE_VERSION,
      draggablePositions: parsed.draggablePositions,
      runtime: parsed.runtime,
      comboMultiplier: parsed.comboMultiplier,
      comboWindowUntil: parsed.comboWindowUntil,
      activeToyId: parsed.activeToyId,
      activeToyStatus: parsed.activeToyStatus,
      metrics: parsed.metrics,
    };
  } catch {
    return base;
  }
}

export function usePlayRoomState() {
  const [state, dispatch] = useReducer(playroomReducer, undefined, initState);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'EXPIRE', now: Date.now() });
    }, 260);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersistedPlayroomState(state)));
    } catch {
      // Storage failures are non-fatal.
    }
  }, [state]);

  const handleDraggablePositionChange = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'SET_DRAG_POSITION', id, x, y });
  }, []);

  const setBubblePositions = useCallback((bubbles: BubbleObjectInput[]) => {
    dispatch({ type: 'SET_BUBBLES', bubbles });
  }, []);

  const handleToyInteraction = useCallback((event: Omit<PlayInteractionEvent, 'now'> & { now?: number }) => {
    dispatch({
      type: 'INTERACT',
      event: {
        ...event,
        now: event.now ?? Date.now(),
      },
    });
  }, []);

  const addPetFeedback = useCallback((x: number, y: number) => {
    dispatch({ type: 'PET_FEEDBACK', x, y, now: Date.now() });
  }, []);

  const toys = useMemo(() => BASE_TOYS, []);

  const interactableObjects = useMemo<InteractableObject[]>(() => {
    const toyObjects = toys.map((toy) => {
      const runtime = state.runtime[toy.id];
      const x = state.draggablePositions[toy.id]?.x ?? toy.x;
      const y = state.draggablePositions[toy.id]?.y ?? toy.y;

      return {
        id: toy.id,
        x,
        y,
        type: toy.type,
        intensity: runtime ? clamp(runtime.energy / 100 + runtime.lastImpulse * 0.12, 0.05, 2.2) : 0.4,
        activeUntil: runtime?.activeUntil,
        energy: runtime?.energy,
        comboWindowUntil: runtime?.comboWindowUntil,
        cooldownUntil: runtime?.cooldownUntil,
        ownerCatId: runtime?.ownerCatId,
        lastImpulse: runtime?.lastImpulse,
      };
    });

    const cardObjects = BASE_CARDS.map((card) => {
      const runtime = state.runtime[card.id];
      return {
        id: card.id,
        x: state.draggablePositions[card.id]?.x ?? card.x,
        y: state.draggablePositions[card.id]?.y ?? card.y,
        type: 'card',
        intensity: runtime ? clamp(runtime.energy / 100 + runtime.lastImpulse * 0.08, 0.05, 2) : 0.3,
        activeUntil: runtime?.activeUntil,
        energy: runtime?.energy,
        comboWindowUntil: runtime?.comboWindowUntil,
        cooldownUntil: runtime?.cooldownUntil,
        ownerCatId: runtime?.ownerCatId,
        lastImpulse: runtime?.lastImpulse,
      };
    });

    const bubbleObjects = state.bubbles.map((bubble) => {
      const runtime = state.runtime[bubble.id];
      return {
        id: bubble.id,
        x: bubble.x,
        y: bubble.y,
        type: 'bubble',
        intensity: runtime ? clamp(runtime.energy / 100 + runtime.lastImpulse * 0.1, 0.05, 2) : 0.45,
        activeUntil: runtime?.activeUntil,
        energy: runtime?.energy,
        comboWindowUntil: runtime?.comboWindowUntil,
        cooldownUntil: runtime?.cooldownUntil,
        ownerCatId: runtime?.ownerCatId,
        lastImpulse: runtime?.lastImpulse,
      };
    });

    return [...toyObjects, ...cardObjects, ...bubbleObjects];
  }, [state.bubbles, state.draggablePositions, state.runtime, toys]);

  const nearbyObjectHints = useMemo(
    () =>
      interactableObjects.map((object) => ({
        id: object.id,
        x: object.x,
        y: object.y,
        type: object.type as 'yarn' | 'bubble' | 'card' | 'ball',
      })),
    [interactableObjects]
  );

  const randomizedHint = useMemo(
    () => seededNumber(`playroom-hint-${state.metrics.totalCombos}`, 0.2, 0.8),
    [state.metrics.totalCombos]
  );

  return {
    toys,
    sparkles: state.sparkles,
    hearts: state.hearts,
    toasts: state.toasts,
    comboMultiplier: state.comboMultiplier,
    activeToyStatus: state.activeToyStatus,
    metrics: state.metrics,
    comboWindowUntil: state.comboWindowUntil,
    handleDraggablePositionChange,
    setBubblePositions,
    handleToyInteraction,
    addPetFeedback,
    interactableObjects,
    nearbyObjectHints,
    hintPulse: randomizedHint,
  };
}
