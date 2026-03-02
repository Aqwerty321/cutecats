/**
 * IdleStateOverlay — Temporal Response Layer
 * 
 * Visual changes when the user is idle.
 * The world grows quieter, softer, dreamier.
 */
'use client';

import { useWorld } from '@/lib';

export function IdleStateOverlay() {
  const { state } = useWorld();

  if (!state.temporal.isIdle) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-2000"
      style={{
        opacity: state.temporal.isDeepIdle ? 1 : 0.5,
      }}
    >
      {/* Gentle vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(45,43,56,0.15) 100%)',
          opacity: state.temporal.isDeepIdle ? 0.8 : 0.3,
          transition: 'opacity 3s ease',
        }}
      />

      {/* Floating dust motes (visible during idle) */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(state.temporal.isDeepIdle ? 15 : 5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              background: 'rgba(255, 255, 255, 0.5)',
              animationDuration: `${20 + Math.random() * 20}s`,
              animationDelay: `${i * 0.5}s`,
              opacity: state.temporal.isDeepIdle ? 0.6 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Deep idle message (appears after 2+ minutes) */}
      {state.temporal.isDeepIdle && (
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center animate-pulse-glow"
          style={{
            color: 'var(--color-void)',
            opacity: 0.4,
          }}
        >
          <p className="text-xs">
            The cats have noticed your stillness...
          </p>
        </div>
      )}
    </div>
  );
}
