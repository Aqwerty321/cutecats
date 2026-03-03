import { describe, expect, it } from 'vitest';
import {
  createLivingWorld,
  handleCursorInteraction,
  handleCursorMove,
  updateLivingWorld,
} from '@/lib/living-world';
import { createWorldObject, updateWorldObject } from '@/lib/world-objects';

describe('living world simulation', () => {
  it('creates initial living world with cats and objects', () => {
    const world = createLivingWorld();
    expect(world.cats.length).toBeGreaterThan(0);
    expect(world.objects.length).toBeGreaterThan(0);
  });

  it('updates world while keeping cat positions in simulation bounds', () => {
    const world = createLivingWorld();
    const next = updateLivingWorld(world, 16);
    for (const cat of next.cats) {
      expect(cat.position.x).toBeGreaterThanOrEqual(5);
      expect(cat.position.x).toBeLessThanOrEqual(95);
      expect(cat.position.y).toBeGreaterThanOrEqual(50);
      expect(cat.position.y).toBeLessThanOrEqual(88);
    }
  });

  it('tracks cursor move and interaction without throwing', () => {
    const world = createLivingWorld();
    const withCursor = handleCursorMove(world, 40, 50);
    const interacted = handleCursorInteraction(withCursor, 40, 50);
    expect(interacted.cursorPosition).toEqual({ x: 40, y: 50 });
  });

  it('updates world object lifecycle', () => {
    const bubble = createWorldObject('bubble-test', 'bubble', 30, 40);
    const keep = updateWorldObject(bubble, 16);
    expect(typeof keep).toBe('boolean');
  });
});

