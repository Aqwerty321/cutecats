'use client';

import { useMemo } from 'react';
import { seededNumber } from '@/lib/deterministic';

interface AmbientParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

function buildParticles(count: number): AmbientParticle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    x: seededNumber(`ambient-x-${index}`, 0, 100),
    y: seededNumber(`ambient-y-${index}`, 0, 100),
    size: seededNumber(`ambient-size-${index}`, 2, 6),
    delay: seededNumber(`ambient-delay-${index}`, 0, 6),
    duration: seededNumber(`ambient-duration-${index}`, 8, 22),
  }));
}

export function AmbientParticles({ density }: { density: number }) {
  const particleCount = Math.max(2, Math.floor(15 * Math.max(0.2, density)));
  const particles = useMemo(() => buildParticles(particleCount), [particleCount]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" data-testid="ambient-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: 'radial-gradient(circle, rgba(143,75,255,0.4) 0%, rgba(15,184,218,0.2) 45%, transparent 74%)',
            animation: `drift ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
