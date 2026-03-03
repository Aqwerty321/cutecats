'use client';

import { useMemo } from 'react';
import { useWorld } from '@/lib';
import { seededNumber } from '@/lib/deterministic';

interface IdleParticle {
  id: number;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

function buildParticles(count: number): IdleParticle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    size: seededNumber(`idle-size-${index}`, 2, 5),
    left: seededNumber(`idle-left-${index}`, 8, 92),
    top: seededNumber(`idle-top-${index}`, 8, 92),
    duration: seededNumber(`idle-duration-${index}`, 18, 36),
    delay: index * 0.45,
  }));
}

export function IdleStateOverlay() {
  const { state } = useWorld();

  const particles = useMemo(
    () => buildParticles(state.temporal.isDeepIdle ? 16 : 6),
    [state.temporal.isDeepIdle]
  );

  if (!state.temporal.isIdle) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none transition-opacity duration-1000"
      style={{ opacity: state.temporal.isDeepIdle ? 1 : 0.55 }}
      data-testid="idle-overlay"
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, rgba(36,19,54,0.24) 100%)',
        }}
      />

      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              background: 'rgba(255,255,255,0.55)',
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              opacity: state.temporal.isDeepIdle ? 0.7 : 0.35,
            }}
          />
        ))}
      </div>

      {state.temporal.isDeepIdle && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center animate-pulse-glow">
          <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--arcade-inverse)' }}>
            Quiet mode active
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,248,255,0.84)' }}>
            The cats are listening.
          </p>
        </div>
      )}
    </div>
  );
}
