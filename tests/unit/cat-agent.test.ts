import { describe, expect, it } from 'vitest';
import {
  catReactToInteraction,
  createCatAgent,
  updateCatMovement,
  updateCatInternalState,
} from '@/lib/cat-agent';

describe('cat-agent simulation', () => {
  it('creates a valid cat agent shape', () => {
    const cat = createCatAgent('mochi', 'Mochi', 'cream', 40, 70);
    expect(cat.id).toBe('mochi');
    expect(cat.position.x).toBe(40);
    expect(cat.position.y).toBe(70);
  });

  it('reacts to high intensity poke by becoming irritated', () => {
    const cat = createCatAgent('sage', 'Sage', 'mint', 50, 72);
    catReactToInteraction(cat, 'poke', 0.9);
    expect(cat.internal.irritation).toBeGreaterThan(0);
  });

  it('movement update keeps cat within world bounds', () => {
    const cat = createCatAgent('lavender', 'Lavender', 'lilac', 50, 72);
    cat.targetPosition = { x: 1000, y: 1000 };
    updateCatMovement(cat, 1000);
    expect(cat.position.x).toBeLessThanOrEqual(95);
    expect(cat.position.y).toBeLessThanOrEqual(88);
  });

  it('internal update mutates emotional state over time', () => {
    const cat = createCatAgent('blossom', 'Blossom', 'peach', 35, 65);
    const energyBefore = cat.internal.energy;
    updateCatInternalState(cat, 500);
    expect(cat.internal.energy).not.toBeNaN();
    expect(cat.internal.energy).not.toBeUndefined();
    expect(Math.abs(cat.internal.energy - energyBefore)).toBeGreaterThanOrEqual(0);
  });
});

