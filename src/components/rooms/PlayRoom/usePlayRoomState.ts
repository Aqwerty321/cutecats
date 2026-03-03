'use client';

import { useCallback, useMemo, useState } from 'react';
import type { EffectPoint, PlayToy } from './types';

const BASE_TOYS: PlayToy[] = [
  { id: 'yarn-1', x: 25, y: 45, type: 'yarn', color: 'lilac', size: 55 },
  { id: 'yarn-2', x: 75, y: 40, type: 'yarn', color: 'peach', size: 50 },
  { id: 'yarn-3', x: 55, y: 72, type: 'yarn', color: 'mint', size: 48 },
  { id: 'ball-1', x: 18, y: 65, type: 'ball', color: 'peach', size: 34 },
  { id: 'ball-2', x: 84, y: 56, type: 'ball', color: 'mint', size: 32 },
];

export function usePlayRoomState() {
  const [draggablePositions, setDraggablePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [bubblePositions, setBubblePositions] = useState<Array<{ id: string; x: number; y: number; type: string }>>(
    []
  );
  const [sparkles, setSparkles] = useState<EffectPoint[]>([]);
  const [hearts, setHearts] = useState<EffectPoint[]>([]);

  const addSparkle = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setSparkles((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((sparkle) => sparkle.id !== id));
    }, 800);
  }, []);

  const addHeart = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setHearts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((heart) => heart.id !== id));
    }, 1300);
  }, []);

  const handleDraggablePositionChange = useCallback((id: string, x: number, y: number) => {
    setDraggablePositions((prev) => ({ ...prev, [id]: { x, y } }));
  }, []);

  const toys = useMemo(() => BASE_TOYS, []);

  const interactableObjects = useMemo(
    () => [
      ...toys.map((toy) => ({
        id: toy.id,
        x: draggablePositions[toy.id]?.x ?? toy.x,
        y: draggablePositions[toy.id]?.y ?? toy.y,
        type: toy.type,
      })),
      ...bubblePositions,
    ],
    [toys, draggablePositions, bubblePositions]
  );

  return {
    toys,
    sparkles,
    hearts,
    addSparkle,
    addHeart,
    handleDraggablePositionChange,
    setBubblePositions,
    interactableObjects,
  };
}

