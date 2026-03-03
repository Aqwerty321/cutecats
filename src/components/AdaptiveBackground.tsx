'use client';

import { useWorld } from '@/lib';

const MOOD_GRADIENT = {
  calm: ['#ffc7ec', '#d9f4ff', '#fff5c8'],
  playful: ['#ff84bf', '#76ecff', '#ffd866'],
  sleepy: ['#d4beff', '#cde0ff', '#ffe7f8'],
  curious: ['#7ce6ff', '#c5a0ff', '#ffe3a1'],
  affectionate: ['#ff98c8', '#ffd7e9', '#ffcf8f'],
} as const;

export function AdaptiveBackground() {
  const { state } = useWorld();
  const [a, b, c] = MOOD_GRADIENT[state.worldMood];

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden transition-all duration-1000"
      aria-hidden="true"
      style={{ filter: state.temporal.isDeepIdle ? 'saturate(0.82) brightness(0.9)' : 'none' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(145deg, ${a} 0%, ${b} 48%, ${c} 100%)`,
        }}
      />

      <div
        className="absolute animate-drift delay-1"
        style={{
          width: '64vmax',
          height: '64vmax',
          top: '-18%',
          left: '-8%',
          opacity: state.temporal.isDeepIdle ? 0.26 : 0.52,
          filter: 'blur(64px)',
          background: `radial-gradient(circle, ${a} 0%, transparent 74%)`,
          animationDuration: `${24 / state.motionSpeed}s`,
        }}
      />

      <div
        className="absolute animate-drift delay-2"
        style={{
          width: '52vmax',
          height: '52vmax',
          top: '4%',
          right: '-12%',
          opacity: state.temporal.isDeepIdle ? 0.22 : 0.45,
          filter: 'blur(72px)',
          background: `radial-gradient(circle, ${b} 0%, transparent 74%)`,
          animationDirection: 'reverse',
          animationDuration: `${28 / state.motionSpeed}s`,
        }}
      />

      <div
        className="absolute animate-drift delay-3"
        style={{
          width: '56vmax',
          height: '56vmax',
          left: '22%',
          bottom: '-22%',
          opacity: state.temporal.isDeepIdle ? 0.16 : 0.36,
          filter: 'blur(70px)',
          background: `radial-gradient(circle, ${c} 0%, transparent 74%)`,
          animationDuration: `${31 / state.motionSpeed}s`,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.06) 35%, rgba(255,255,255,0) 100%)',
        }}
      />

      {state.temporal.isDeepIdle && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle, transparent 35%, rgba(36, 19, 54, 0.22) 100%)' }}
        />
      )}
    </div>
  );
}
