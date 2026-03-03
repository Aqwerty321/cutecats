'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { seededNumber } from '@/lib/deterministic';

interface BubbleProps {
  size?: number;
  color?: 'lilac' | 'peach' | 'mint';
  onPop?: () => void;
  delay?: number;
}

const BUBBLE_COLORS = {
  lilac: {
    fill: 'rgba(143, 75, 255, 0.24)',
    stroke: 'rgba(143, 75, 255, 0.65)',
    highlight: 'rgba(255, 255, 255, 0.88)',
  },
  peach: {
    fill: 'rgba(255, 78, 159, 0.24)',
    stroke: 'rgba(255, 78, 159, 0.65)',
    highlight: 'rgba(255, 255, 255, 0.88)',
  },
  mint: {
    fill: 'rgba(15, 184, 218, 0.24)',
    stroke: 'rgba(15, 184, 218, 0.65)',
    highlight: 'rgba(255, 255, 255, 0.88)',
  },
} as const;

interface BubbleData {
  id: number;
  x: number;
  y: number;
  size: number;
  color: 'lilac' | 'peach' | 'mint';
  delay: number;
}

function createBubble(id: number): BubbleData {
  const palette: Array<'lilac' | 'peach' | 'mint'> = ['lilac', 'peach', 'mint'];
  const colorIndex = Math.floor(seededNumber(`bubble-color-${id}`, 0, palette.length));

  return {
    id,
    x: seededNumber(`bubble-x-${id}`, 10, 90),
    y: seededNumber(`bubble-y-${id}`, 10, 90),
    size: seededNumber(`bubble-size-${id}`, 30, 60),
    color: palette[Math.min(colorIndex, palette.length - 1)],
    delay: seededNumber(`bubble-delay-${id}`, 0, 3),
  };
}

function createBubbleSet(count: number): BubbleData[] {
  return Array.from({ length: count }, (_, index) => createBubble(index + 1));
}

export function Bubble({ size = 40, color = 'lilac', onPop, delay = 0 }: BubbleProps) {
  const [isPopped, setIsPopped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tones = BUBBLE_COLORS[color];

  const handlePop = useCallback(() => {
    if (isPopped) {
      return;
    }
    setIsPopped(true);
    onPop?.();
  }, [isPopped, onPop]);

  if (isPopped) {
    return null;
  }

  return (
    <div
      className="cursor-pointer transition-transform duration-200"
      style={{
        width: size,
        height: size,
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        animation: `arcade-float 6s var(--ease-fluid) infinite`,
        animationDelay: `${delay}s`,
      }}
      onClick={handlePop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg width={size} height={size} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill={tones.fill} stroke={tones.stroke} strokeWidth="1.2" />
        <ellipse cx="14" cy="14" rx="6" ry="4" fill={tones.highlight} transform="rotate(-30 14 14)" />
        <circle cx="26" cy="26" r="2" fill={tones.highlight} opacity="0.45" />
      </svg>
    </div>
  );
}

interface BubbleFieldProps {
  count?: number;
  onBubblesChange?: (bubbles: Array<{ id: string; x: number; y: number; type: string }>) => void;
}

export function BubbleField({ count = 8, onBubblesChange }: BubbleFieldProps) {
  const [bubbles, setBubbles] = useState<BubbleData[]>(() => createBubbleSet(count));
  const nextIdRef = useRef<number>(count + 1);

  useEffect(() => {
    if (!onBubblesChange) {
      return;
    }

    onBubblesChange(
      bubbles.map((bubble) => ({
        id: `bubble-${bubble.id}`,
        x: bubble.x,
        y: bubble.y,
        type: 'bubble',
      }))
    );
  }, [bubbles, onBubblesChange]);

  const handlePop = useCallback((id: number) => {
    setBubbles((prev) => prev.filter((bubble) => bubble.id !== id));

    setTimeout(() => {
      const nextId = nextIdRef.current;
      nextIdRef.current += 1;
      setBubbles((prev) => [...prev, createBubble(nextId)]);
    }, seededNumber(`bubble-respawn-${id}`, 2800, 7600));
  }, []);

  return (
    <>
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          data-object-id={`bubble-${bubble.id}`}
          className="absolute pointer-events-auto"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => handlePop(bubble.id)}
        >
          <Bubble size={bubble.size} color={bubble.color} delay={bubble.delay} onPop={() => handlePop(bubble.id)} />
        </div>
      ))}
    </>
  );
}
