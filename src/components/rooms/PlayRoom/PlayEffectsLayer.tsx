'use client';

import type { EffectPoint } from './types';

interface PlayEffectsLayerProps {
  sparkles: EffectPoint[];
  hearts: EffectPoint[];
}

export function PlayEffectsLayer({ sparkles, hearts }: PlayEffectsLayerProps) {
  return (
    <>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute pointer-events-none animate-sparkle"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: '18px',
            zIndex: 50,
          }}
        >
          spark
        </div>
      ))}

      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute pointer-events-none animate-heart-float"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            fontSize: '16px',
            zIndex: 50,
          }}
        >
          heart
        </div>
      ))}

      <style jsx global>{`
        @keyframes sparkle {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
        }
        .animate-sparkle {
          animation: sparkle 0.8s ease-out forwards;
        }

        @keyframes heart-float {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(0.5);
          }
        }
        .animate-heart-float {
          animation: heart-float 1.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

