import { describe, expect, it, vi } from 'vitest';
import { canAccessDream, worldReducer } from '@/lib/world-reducer';
import { createInitialState, type WorldState } from '@/lib/world-types';

function visitRoom(state: WorldState, room: 'sanctuary' | 'playroom' | 'gallery' | 'dream') {
  return worldReducer(state, { type: 'NAVIGATE_TO', room });
}

describe('world reducer', () => {
  it('keeps dream room locked at session start', () => {
    const state = createInitialState();
    expect(canAccessDream(state)).toBe(false);
  });

  it('unlocks dream room after room exploration and kindness', () => {
    let state = createInitialState();
    state = visitRoom(state, 'playroom');
    state = worldReducer(state, { type: 'TRANSITION_COMPLETE' });
    state = visitRoom(state, 'gallery');
    state = worldReducer(state, { type: 'TRANSITION_COMPLETE' });

    for (let i = 0; i < 5; i += 1) {
      state = worldReducer(state, { type: 'PET_CAT', catId: state.cats[0].id });
    }

    expect(canAccessDream(state)).toBe(true);
  });

  it('follows wandering cat into another room and increments discovery counter', () => {
    let state = createInitialState();
    const targetCat = state.cats[0];

    state = worldReducer(state, {
      type: 'CAT_WANDER',
      catId: targetCat.id,
      toRoom: 'playroom',
      position: { x: 50, y: 60 },
    });
    state = worldReducer(state, { type: 'FOLLOW_CAT', catId: targetCat.id });

    expect(state.currentRoom).toBe('playroom');
    expect(state.discovery.followedCatCount).toBe(1);
  });

  it('tick keeps reducer stable under deterministic randomness', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const state = createInitialState();
    const nextState = worldReducer(state, { type: 'TICK' });
    expect(nextState.cats.length).toBe(state.cats.length);
    randomSpy.mockRestore();
  });
});

