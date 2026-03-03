'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import {
  createLivingWorld,
  updateLivingWorld,
  handleCursorMove,
  handleCursorInteraction,
  saveWorldMemory,
  loadWorldMemory,
  type LivingWorldState,
} from '@/lib/living-world';

export function useLivingWorldSimulation() {
  const [world, setWorld] = useState<LivingWorldState>(() => {
    const memory = loadWorldMemory();
    return createLivingWorld(memory);
  });

  const worldRef = useRef<LivingWorldState>(world);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    worldRef.current = world;
  }, [world]);

  useEffect(() => {
    const simulate = (time: number) => {
      const deltaTime = Math.min((time - lastTimeRef.current) / 16.67, 3);
      lastTimeRef.current = time;

      if (isVisibleRef.current) {
        setWorld((prevWorld) => updateLivingWorld(prevWorld, deltaTime));
      }

      animationRef.current = requestAnimationFrame(simulate);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(simulate);

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      const wasHidden = !isVisibleRef.current;
      isVisibleRef.current = document.visibilityState === 'visible';

      if (wasHidden && isVisibleRef.current) {
        setWorld((prev) => {
          let updated = prev;
          for (let i = 0; i < 30; i += 1) {
            updated = updateLivingWorld(updated, 1);
          }
          return updated;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveWorldMemory(worldRef.current);
    }, 30000);

    return () => clearInterval(saveInterval);
  }, []);

  useEffect(() => {
    return () => {
      saveWorldMemory(worldRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((event: ReactMouseEvent) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setWorld((prev) => handleCursorMove(prev, x, y));
  }, []);

  const handleClick = useCallback((event: ReactMouseEvent) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setWorld((prev) => handleCursorInteraction(prev, x, y));
  }, []);

  const handleObjectInteract = useCallback((objectId: string) => {
    setWorld((prev) => {
      const object = prev.objects.find((candidate) => candidate.body.id === objectId);
      if (!object) {
        return prev;
      }

      const forceX = (Math.random() - 0.5) * 2;
      const forceY = -Math.random() * 1.5;

      return {
        ...prev,
        objects: prev.objects.map((candidate) => {
          if (candidate.body.id !== objectId) {
            return candidate;
          }
          return {
            ...candidate,
            body: {
              ...candidate.body,
              velocity: {
                x: candidate.body.velocity.x + forceX,
                y: candidate.body.velocity.y + forceY,
              },
            },
          };
        }),
      };
    });
  }, []);

  return {
    world,
    containerRef,
    handleMouseMove,
    handleClick,
    handleObjectInteract,
  };
}
