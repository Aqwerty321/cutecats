'use client';

import type { MouseEvent, RefObject } from 'react';
import type { LivingWorldState } from '@/lib/living-world';
import { LivingCat } from '../LivingCat';
import { LivingObject } from '../LivingObject';
import { AmbientParticles } from './AmbientParticles';

interface WorldSceneProps {
  world: LivingWorldState;
  containerRef: RefObject<HTMLDivElement | null>;
  onMouseMove: (event: MouseEvent) => void;
  onClick: (event: MouseEvent) => void;
  onObjectInteract: (objectId: string) => void;
}

export function WorldScene({
  world,
  containerRef,
  onMouseMove,
  onClick,
  onObjectInteract,
}: WorldSceneProps) {
  return (
    <div
      ref={containerRef}
      data-testid="living-world-scene"
      className="fixed inset-0 overflow-hidden select-none"
      onMouseMove={onMouseMove}
      onClick={onClick}
      style={{
        background: `linear-gradient(180deg,
          hsl(${268 + world.timeOfDay * 12}, 86%, ${92 - world.timeOfDay * 4}%),
          hsl(${307 + world.timeOfDay * 8}, 84%, ${90 - world.timeOfDay * 5}%),
          hsl(${198 + world.timeOfDay * 10}, 78%, ${87 - world.timeOfDay * 4}%)
        )`,
        cursor: 'none',
      }}
    >
      {world.cursorPosition && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: `${world.cursorPosition.x}%`,
            top: `${world.cursorPosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="h-8 w-8 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 40%, transparent 70%)',
              boxShadow: '0 0 20px rgba(143,75,255,0.5), 0 0 40px rgba(15,184,218,0.28)',
            }}
          />
        </div>
      )}

      {world.cursorPosition && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${world.cursorPosition.x}% ${world.cursorPosition.y}%,
              rgba(143,75,255,${0.05 * world.ambientGlow}) 0%,
              transparent 30%)`,
          }}
        />
      )}

      <div
        className="pointer-events-none fixed left-0 right-0 h-px"
        style={{
          top: '85%',
          background: 'linear-gradient(to right, transparent, rgba(57,32,79,0.16), transparent)',
        }}
      />

      {world.objects
        .filter((object) => object.type !== 'mote')
        .map((object) => (
          <LivingObject key={object.body.id} object={object} onInteract={onObjectInteract} />
        ))}

      {world.objects
        .filter((object) => object.type === 'mote')
        .map((object) => (
          <LivingObject key={object.body.id} object={object} />
        ))}

      {world.cats.map((cat) => (
        <LivingCat key={cat.id} cat={cat} />
      ))}

      <AmbientParticles density={world.motionDensity} />
    </div>
  );
}
