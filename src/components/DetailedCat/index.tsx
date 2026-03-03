'use client';

import { useMemo } from 'react';
import { DetailedCatVisual } from './DetailedCatVisual';
import { useDetailedCatBehavior } from './useDetailedCatBehavior';
import type { DetailedCatProps } from './types';

const DEFAULT_BOUNDS = { minX: 10, maxX: 90, minY: 35, maxY: 85 };

export function DetailedCat({
  cat,
  onPet,
  bounds = DEFAULT_BOUNDS,
  cursorPosition = null,
  objects = [],
}: DetailedCatProps) {
  const behavior = useDetailedCatBehavior({
    cat,
    bounds,
    cursorPosition,
    objects,
    onPet,
  });

  const left = useMemo(() => `${behavior.position.x}%`, [behavior.position.x]);
  const top = useMemo(() => `${behavior.position.y}%`, [behavior.position.y]);

  return (
    <div
      className="absolute select-none cursor-pointer"
      style={{
        left,
        top,
        transform: 'translate(-50%, -50%)',
        zIndex: behavior.isPetted ? 40 : 20,
      }}
      onClick={behavior.handlePet}
      onMouseEnter={() => behavior.setIsHovered(true)}
      onMouseLeave={() => behavior.setIsHovered(false)}
    >
      <DetailedCatVisual
        variant={cat.variant}
        name={cat.name}
        moodLabel={behavior.statusText}
        behavior={behavior.behavior}
        facing={behavior.facing}
        blinkState={behavior.blinkState}
        walkBob={behavior.walkBob}
        tailWag={behavior.tailWag}
        breathe={behavior.breathe}
        isHovered={behavior.isHovered}
        isPetted={behavior.isPetted}
        showHeart={behavior.showHeart}
      />
    </div>
  );
}
