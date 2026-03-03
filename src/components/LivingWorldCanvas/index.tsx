'use client';

import { useLivingWorldSimulation } from './useLivingWorldSimulation';
import { WorldScene } from './WorldScene';

export function LivingWorldCanvas() {
  const { world, containerRef, handleMouseMove, handleClick, handleObjectInteract } =
    useLivingWorldSimulation();

  return (
    <>
      <WorldScene
        world={world}
        containerRef={containerRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onObjectInteract={handleObjectInteract}
      />

      <style jsx global>{`
        @keyframes drift {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(5px, -3px);
          }
          50% {
            transform: translate(-3px, 5px);
          }
          75% {
            transform: translate(4px, 2px);
          }
        }
      `}</style>
    </>
  );
}

