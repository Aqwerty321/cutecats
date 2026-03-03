import { describe, expect, it } from 'vitest';
import {
  createPlayroomInitialState,
  playroomReducer,
  toPersistedPlayroomState,
} from '@/components/rooms/PlayRoom/playroom-reducer';

describe('playroom reducer', () => {
  it('builds bubble combos within active combo window', () => {
    let state = createPlayroomInitialState();

    state = playroomReducer(state, {
      type: 'INTERACT',
      event: {
        id: 'bubble-1',
        type: 'bubble',
        source: 'bubble-pop',
        x: 50,
        y: 50,
        intensity: 0.8,
        now: 1000,
      },
    });

    state = playroomReducer(state, {
      type: 'INTERACT',
      event: {
        id: 'bubble-2',
        type: 'bubble',
        source: 'bubble-pop',
        x: 53,
        y: 49,
        intensity: 0.85,
        now: 2500,
      },
    });

    expect(state.comboMultiplier).toBe(2);
    expect(state.metrics.bubblePops).toBe(2);
    expect(state.metrics.bestCombo).toBeGreaterThanOrEqual(2);
  });

  it('restores persisted state snapshot without losing metrics', () => {
    let state = createPlayroomInitialState();

    state = playroomReducer(state, {
      type: 'SET_DRAG_POSITION',
      id: 'yarn-1',
      x: 61,
      y: 44,
    });

    state = playroomReducer(state, {
      type: 'INTERACT',
      event: {
        id: 'yarn-1',
        type: 'yarn',
        source: 'toss',
        x: 61,
        y: 44,
        intensity: 1.1,
        now: 1600,
      },
    });

    const snapshot = toPersistedPlayroomState(state);
    const hydrated = playroomReducer(createPlayroomInitialState(), {
      type: 'HYDRATE',
      snapshot,
    });

    expect(hydrated.draggablePositions['yarn-1']).toEqual({ x: 61, y: 44 });
    expect(hydrated.metrics.yarnChases).toBe(1);
    expect(hydrated.activeToyId).toBe('yarn-1');
  });

  it('applies runtime cooldown and expires visual effects', () => {
    let state = createPlayroomInitialState();

    state = playroomReducer(state, {
      type: 'INTERACT',
      event: {
        id: 'card-1',
        type: 'card',
        source: 'card-tease',
        x: 20,
        y: 60,
        intensity: 0.9,
        now: 2000,
      },
    });

    expect(state.runtime['card-1'].cooldownUntil).toBeGreaterThan(2000);
    expect(state.sparkles.length).toBeGreaterThan(0);

    state = playroomReducer(state, { type: 'EXPIRE', now: 5000 });

    expect(state.sparkles).toHaveLength(0);
    expect(state.hearts).toHaveLength(0);
  });
});
