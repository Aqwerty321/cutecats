import type { CSSProperties } from 'react';

export type CatRigId = 'detailed' | 'sanctuary' | 'interactive' | 'autonomous' | 'living';

export interface TailRig {
  rootX: number;
  rootY: number;
  origin: string;
  path: string;
  tipX: number;
  tipY: number;
  strokeWidth: number;
  rootPatchRx: number;
  rootPatchRy: number;
  rootPatchCx: number;
  rootPatchCy: number;
}

const TAIL_RIGS: Record<CatRigId, TailRig> = {
  detailed: {
    rootX: 74,
    rootY: 62,
    origin: '74px 62px',
    path: 'M 74 62 Q 95 50 90 35 Q 88 28 82 32',
    tipX: 82,
    tipY: 32,
    strokeWidth: 7,
    rootPatchRx: 5.6,
    rootPatchRy: 4.4,
    rootPatchCx: 73.5,
    rootPatchCy: 62,
  },
  sanctuary: {
    rootX: 74,
    rootY: 62,
    origin: '74px 62px',
    path: 'M 74 62 Q 92 55 88 42 Q 86 35 82 38',
    tipX: 82,
    tipY: 38,
    strokeWidth: 6,
    rootPatchRx: 5,
    rootPatchRy: 4,
    rootPatchCx: 73,
    rootPatchCy: 62,
  },
  interactive: {
    rootX: 74,
    rootY: 62,
    origin: '74px 62px',
    path: 'M 74 62 Q 94 48 89 34 Q 86 27 80 31',
    tipX: 80,
    tipY: 31,
    strokeWidth: 7,
    rootPatchRx: 5.4,
    rootPatchRy: 4.3,
    rootPatchCx: 73,
    rootPatchCy: 62,
  },
  autonomous: {
    rootX: -11,
    rootY: 5,
    origin: '-11px 5px',
    path: 'M -11 5 Q -26 -3 -20 -16',
    tipX: -20,
    tipY: -16,
    strokeWidth: 5,
    rootPatchRx: 3,
    rootPatchRy: 2.6,
    rootPatchCx: -10.5,
    rootPatchCy: 5,
  },
  living: {
    rootX: -11,
    rootY: 5,
    origin: '-11px 5px',
    path: 'M -11 5 Q -28 -5 -22 -18 Q -20 -22 -16 -20',
    tipX: -16,
    tipY: -20,
    strokeWidth: 5,
    rootPatchRx: 3.2,
    rootPatchRy: 2.8,
    rootPatchCx: -10.8,
    rootPatchCy: 5,
  },
};

export function getTailRig(rigId: CatRigId): TailRig {
  return TAIL_RIGS[rigId];
}

export function createTailStyle(angle: number, origin: string): CSSProperties {
  return {
    transformOrigin: origin,
    transformBox: 'fill-box',
    transform: `rotate(${angle}deg)`,
    transition: 'transform 0.14s cubic-bezier(0.22, 1, 0.36, 1)',
  };
}
