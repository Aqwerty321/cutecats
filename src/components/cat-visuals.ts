import type { CatMood } from '@/lib/world-types';

export type CatVariant = 'cream' | 'peach' | 'lilac' | 'mint';

export interface CatPalette {
  primary: string;
  secondary: string;
  accent: string;
  shadow: string;
  glow: string;
  eye: string;
  pupil: string;
  eyeWhite: string;
  iris: string;
  highlight: string;
}

export interface CatEyeExpression {
  eyeWhite: string;
  iris: string;
  pupil: string;
  highlight: string;
  blinkRatio: number;
  focusOffset: number;
  eyelidOpacity: number;
  microSaccadeSpeed: number;
}

interface CatExpressionInput {
  mood: CatMood;
  behavior?: string;
  variant?: CatVariant;
  isSleeping?: boolean;
  isHovered?: boolean;
  isPetted?: boolean;
}

const CAT_PALETTES: Record<CatVariant, CatPalette> = {
  cream: {
    primary: 'var(--cat-cream-primary)',
    secondary: 'var(--cat-cream-secondary)',
    accent: 'var(--cat-cream-accent)',
    shadow: 'rgba(255, 144, 102, 0.34)',
    glow: 'rgba(255, 144, 102, 0.4)',
    eye: 'var(--cat-eye)',
    pupil: 'var(--cat-pupil)',
    eyeWhite: '#fff7fd',
    iris: '#6b4f8e',
    highlight: '#ffffff',
  },
  peach: {
    primary: 'var(--cat-peach-primary)',
    secondary: 'var(--cat-peach-secondary)',
    accent: 'var(--cat-peach-accent)',
    shadow: 'rgba(255, 95, 144, 0.34)',
    glow: 'rgba(255, 95, 144, 0.4)',
    eye: 'var(--cat-eye)',
    pupil: 'var(--cat-pupil)',
    eyeWhite: '#fff5fc',
    iris: '#6a477f',
    highlight: '#ffffff',
  },
  lilac: {
    primary: 'var(--cat-lilac-primary)',
    secondary: 'var(--cat-lilac-secondary)',
    accent: 'var(--cat-lilac-accent)',
    shadow: 'rgba(159, 86, 251, 0.35)',
    glow: 'rgba(159, 86, 251, 0.42)',
    eye: 'var(--cat-eye)',
    pupil: 'var(--cat-pupil)',
    eyeWhite: '#f8f2ff',
    iris: '#5c3f84',
    highlight: '#ffffff',
  },
  mint: {
    primary: 'var(--cat-mint-primary)',
    secondary: 'var(--cat-mint-secondary)',
    accent: 'var(--cat-mint-accent)',
    shadow: 'rgba(39, 201, 146, 0.35)',
    glow: 'rgba(39, 201, 146, 0.42)',
    eye: 'var(--cat-eye)',
    pupil: 'var(--cat-pupil)',
    eyeWhite: '#f1fffb',
    iris: '#426978',
    highlight: '#ffffff',
  },
};

const MOOD_EYE_TUNING: Record<
  CatMood,
  { blink: number; focus: number; eyelid: number; saccade: number }
> = {
  calm: { blink: 1, focus: 1, eyelid: 0.08, saccade: 0.6 },
  playful: { blink: 1.1, focus: 1.1, eyelid: 0.05, saccade: 1.2 },
  sleepy: { blink: 0.6, focus: 0.55, eyelid: 0.35, saccade: 0.3 },
  curious: { blink: 1.05, focus: 1.4, eyelid: 0.04, saccade: 1.35 },
  affectionate: { blink: 0.85, focus: 0.9, eyelid: 0.14, saccade: 0.45 },
};

export function getCatPalette(variant: CatVariant): CatPalette {
  return CAT_PALETTES[variant] ?? CAT_PALETTES.cream;
}

export function getEyeExpression({
  mood,
  behavior,
  variant = 'cream',
  isSleeping = false,
  isHovered = false,
  isPetted = false,
}: CatExpressionInput): CatEyeExpression {
  const tuning = MOOD_EYE_TUNING[mood];
  const palette = getCatPalette(variant);
  const sleeping = isSleeping || behavior === 'sleeping';

  const blinkRatio = sleeping ? 0.08 : isPetted ? 0.72 : isHovered ? 1.12 : tuning.blink;
  const focusOffset = sleeping ? 0.5 : tuning.focus * (isHovered ? 1.2 : 1);
  const eyelidOpacity = sleeping ? 0.58 : tuning.eyelid;
  const microSaccadeSpeed = sleeping ? 0.14 : tuning.saccade;

  return {
    eyeWhite: palette.eyeWhite,
    iris: palette.iris,
    pupil: palette.pupil,
    highlight: palette.highlight,
    blinkRatio,
    focusOffset,
    eyelidOpacity,
    microSaccadeSpeed,
  };
}

export function clampFocus(value: number, max = 1): number {
  if (value > max) {
    return max;
  }
  if (value < -max) {
    return -max;
  }
  return value;
}

export function damp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

export function normalizeFocus(dx: number, dy: number, maxOffset: number): { x: number; y: number } {
  const distance = Math.hypot(dx, dy);
  if (distance <= 0.0001) {
    return { x: 0, y: 0 };
  }

  const scale = Math.min(1, distance / 120) * maxOffset;
  return {
    x: (dx / distance) * scale,
    y: (dy / distance) * scale,
  };
}
