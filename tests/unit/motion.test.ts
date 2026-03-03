import { describe, expect, it } from 'vitest';
import {
  arrivalSpeed,
  DEFAULT_MOTION_CONFIG,
  integrateMotion,
  resolveFacing,
  smoothValue,
} from '@/lib/motion';

describe('motion helpers', () => {
  it('eases arrival speed as target gets close', () => {
    const far = arrivalSpeed(20, 18, 2);
    const near = arrivalSpeed(3, 18, 2);
    const inside = arrivalSpeed(1.2, 18, 2);

    expect(far).toBeGreaterThan(near);
    expect(inside).toBe(0);
  });

  it('integrates with bounded per-frame movement', () => {
    const next = integrateMotion(
      { x: 20, y: 20, vx: 0, vy: 0 },
      { x: 90, y: 20 },
      { minX: 0, maxX: 100, minY: 0, maxY: 100 },
      1 / 60,
      { ...DEFAULT_MOTION_CONFIG, maxStep: 0.5, maxSpeed: 60 }
    );

    const distance = Math.hypot(next.x - 20, next.y - 20);
    expect(distance).toBeLessThanOrEqual(0.5001);
  });

  it('damps velocity when target is already reached', () => {
    const next = integrateMotion(
      { x: 40, y: 40, vx: 12, vy: -8 },
      { x: 40, y: 40 },
      { minX: 0, maxX: 100, minY: 0, maxY: 100 },
      1 / 60
    );

    expect(Math.abs(next.vx)).toBeLessThan(12);
    expect(Math.abs(next.vy)).toBeLessThan(8);
  });

  it('uses facing hysteresis to avoid rapid flips', () => {
    expect(resolveFacing('left', 0.12, 0.2)).toBe('left');
    expect(resolveFacing('left', 0.35, 0.2)).toBe('right');
    expect(resolveFacing('right', -0.42, 0.2)).toBe('left');
  });

  it('smoothly interpolates scalar values without overshoot', () => {
    const next = smoothValue(0, 10, 9, 1 / 60);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(10);
  });
});
